# 🔄 State Management en dApps

> **Patrones para gestión de estado en aplicaciones Web3 con React y wagmi**

## 📖 Tabla de Contenidos

- [El Desafío del Estado en Web3](#el-desafío-del-estado-en-web3)
- [Capas de Estado](#capas-de-estado)
- [Patrón 1: React Query (wagmi)](#patrón-1-react-query-wagmi)
- [Patrón 2: Estado Derivado](#patrón-2-estado-derivado)
- [Patrón 3: Optimistic Updates](#patrón-3-optimistic-updates)
- [Patrón 4: Polling vs WebSockets](#patrón-4-polling-vs-websockets)
- [Patrón 5: Global State](#patrón-5-global-state)
- [Best Practices](#best-practices)

---

## El Desafío del Estado en Web3

### Problema

En apps Web3, tienes **múltiples fuentes de verdad**:

```
1. Blockchain (source of truth)
   ↓
2. RPC Node (puede estar desincronizado)
   ↓
3. Cache local (React Query)
   ↓
4. UI State (React)
```

### Desafíos Únicos

1. **Latencia**: Blockchain es lento (12s en Ethereum)
2. **Confirmaciones**: Estado intermedio durante confirmaciones
3. **Chain reorganization**: Bloques pueden cambiar
4. **Múltiples wallets**: Usuario puede cambiar cuenta
5. **Múltiples chains**: Estado puede ser cross-chain

---

## Capas de Estado

### 1. **Blockchain State** (Source of Truth)

```typescript
// Leer del blockchain
const { data: balance } = useReadContract({
  address: token,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [account],
});
```

### 2. **Pending Transactions State**

```typescript
// Estado mientras la tx se confirma
const { isPending, isSuccess } = useWaitForTransactionReceipt({ hash });
```

### 3. **Local UI State**

```typescript
// Estado puramente del cliente
const [selectedToken, setSelectedToken] = useState<Address>();
const [amount, setAmount] = useState('');
```

---

## Patrón 1: React Query (wagmi)

Wagmi usa React Query bajo el capó para manejar caché.

### Configuración Básica

```typescript
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000, // Considerar data "fresh" por 10s
      cacheTime: 300_000, // Mantener en caché por 5min
      refetchOnWindowFocus: true,
      retry: 3,
    },
  },
});

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <YourApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Invalidar Caché Después de Write

```typescript
import { useQueryClient } from '@tanstack/react-query';

function TransferToken() {
  const queryClient = useQueryClient();
  const { writeContract } = useWriteContract();

  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  // Invalidar caché cuando tx se confirma
  useEffect(() => {
    if (isSuccess) {
      // Invalidar balance del sender
      queryClient.invalidateQueries({
        queryKey: ['readContract', { functionName: 'balanceOf', args: [sender] }],
      });

      // Invalidar balance del recipient
      queryClient.invalidateQueries({
        queryKey: ['readContract', { functionName: 'balanceOf', args: [recipient] }],
      });
    }
  }, [isSuccess, queryClient]);

  // ...
}
```

### Polling Inteligente

```typescript
function Balance({ token, account }: Props) {
  const { data: balance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account],
    query: {
      // Polling condicional
      refetchInterval: (data) => {
        // Si hay pending tx, poll cada 1s
        if (hasPendingTransactions) {
          return 1_000;
        }
        // Sino, cada 30s
        return 30_000;
      },
    },
  });

  return <div>{formatUnits(balance || 0n, 18)}</div>;
}
```

---

## Patrón 2: Estado Derivado

Derivar estado de la blockchain en lugar de duplicarlo.

### ❌ Anti-Pattern: Duplicar Estado

```typescript
// ❌ Mal: Estado duplicado
function BadExample() {
  const [balance, setBalance] = useState<bigint>(0n);

  // Leer de blockchain
  const { data: onChainBalance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account],
  });

  // Sincronizar manualmente (propenso a bugs)
  useEffect(() => {
    if (onChainBalance) {
      setBalance(onChainBalance);
    }
  }, [onChainBalance]);

  return <div>{balance.toString()}</div>;
}
```

### ✅ Pattern: Derivar Estado

```typescript
// ✅ Bien: Derivar directamente
function GoodExample() {
  const { data: balance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account],
  });

  // Derivar estados computados
  const formattedBalance = useMemo(
    () => balance ? formatUnits(balance, 18) : '0',
    [balance]
  );

  const hasBalance = useMemo(
    () => balance && balance > 0n,
    [balance]
  );

  return (
    <div>
      <div>{formattedBalance}</div>
      {hasBalance && <button>Transfer</button>}
    </div>
  );
}
```

---

## Patrón 3: Optimistic Updates

Actualizar UI inmediatamente, antes de confirmación on-chain.

### Implementación

```typescript
function OptimisticTransfer() {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const { data: balance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  });

  const { writeContract } = useWriteContract({
    mutation: {
      onMutate: async (variables) => {
        // 1. Cancelar queries en progreso
        await queryClient.cancelQueries({
          queryKey: ['readContract', { functionName: 'balanceOf' }],
        });

        // 2. Snapshot del estado anterior
        const previousBalance = queryClient.getQueryData([
          'readContract',
          { functionName: 'balanceOf', args: [address] },
        ]);

        // 3. Optimistically actualizar
        queryClient.setQueryData(
          ['readContract', { functionName: 'balanceOf', args: [address] }],
          (old: bigint | undefined) => {
            if (!old) return old;
            return old - variables.args[1]; // Restar amount
          }
        );

        // Retornar context para rollback
        return { previousBalance };
      },

      onError: (err, variables, context) => {
        // Rollback en caso de error
        if (context?.previousBalance) {
          queryClient.setQueryData(
            ['readContract', { functionName: 'balanceOf', args: [address] }],
            context.previousBalance
          );
        }
      },

      onSuccess: () => {
        // Re-fetch después de confirmación
        queryClient.invalidateQueries({
          queryKey: ['readContract', { functionName: 'balanceOf' }],
        });
      },
    },
  });

  const handleTransfer = () => {
    writeContract({
      address: token,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipient, parseEther('10')],
    });
  };

  return (
    <div>
      <div>Balance: {formatUnits(balance || 0n, 18)}</div>
      <button onClick={handleTransfer}>Transfer (Optimistic)</button>
    </div>
  );
}
```

---

## Patrón 4: Polling vs WebSockets

### Polling (Recomendado para Empezar)

```typescript
// Polling simple
const { data: balance } = useReadContract({
  address: token,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [account],
  query: {
    refetchInterval: 10_000, // Cada 10s
  },
});
```

**Pros:**
- ✅ Simple
- ✅ Funciona con cualquier RPC
- ✅ Predecible

**Cons:**
- ❌ No es en tiempo real
- ❌ Puede hacer requests innecesarios

### WebSockets (Avanzado)

```typescript
import { useWatchContractEvent } from 'wagmi';

function RealtimeBalance() {
  const [balance, setBalance] = useState<bigint>(0n);

  // Leer balance inicial
  const { data: initialBalance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account],
  });

  useEffect(() => {
    if (initialBalance) setBalance(initialBalance);
  }, [initialBalance]);

  // Escuchar eventos Transfer en tiempo real
  useWatchContractEvent({
    address: token,
    abi: erc20Abi,
    eventName: 'Transfer',
    args: {
      from: account, // Cuando enviamos
    },
    onLogs(logs) {
      logs.forEach((log) => {
        setBalance((prev) => prev - log.args.amount!);
      });
    },
  });

  useWatchContractEvent({
    address: token,
    abi: erc20Abi,
    eventName: 'Transfer',
    args: {
      to: account, // Cuando recibimos
    },
    onLogs(logs) {
      logs.forEach((log) => {
        setBalance((prev) => prev + log.args.amount!);
      });
    },
  });

  return <div>Balance: {formatUnits(balance, 18)}</div>;
}
```

**Pros:**
- ✅ Tiempo real
- ✅ Eficiente (no polling innecesario)

**Cons:**
- ❌ Más complejo
- ❌ Requiere WebSocket RPC
- ❌ Manejo de desconexiones

---

## Patrón 5: Global State

Para estado compartido entre múltiples componentes.

### Opción 1: Context API

```typescript
// contexts/WalletContext.tsx
interface WalletState {
  selectedToken: Address | null;
  setSelectedToken: (token: Address) => void;
  slippage: number;
  setSlippage: (slippage: number) => void;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [selectedToken, setSelectedToken] = useState<Address | null>(null);
  const [slippage, setSlippage] = useState(0.5); // 0.5%

  return (
    <WalletContext.Provider
      value={{
        selectedToken,
        setSelectedToken,
        slippage,
        setSlippage,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}
```

### Opción 2: Zustand (Recomendado)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Preferences (persisted)
  slippage: number;
  setSlippage: (slippage: number) => void;

  // UI State (ephemeral)
  selectedToken: Address | null;
  setSelectedToken: (token: Address | null) => void;

  // Pending txs
  pendingTxs: Set<Hash>;
  addPendingTx: (hash: Hash) => void;
  removePendingTx: (hash: Hash) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Preferences
      slippage: 0.5,
      setSlippage: (slippage) => set({ slippage }),

      // UI State
      selectedToken: null,
      setSelectedToken: (token) => set({ selectedToken: token }),

      // Pending txs
      pendingTxs: new Set(),
      addPendingTx: (hash) =>
        set((state) => ({
          pendingTxs: new Set(state.pendingTxs).add(hash),
        })),
      removePendingTx: (hash) =>
        set((state) => {
          const newSet = new Set(state.pendingTxs);
          newSet.delete(hash);
          return { pendingTxs: newSet };
        }),
    }),
    {
      name: 'app-storage',
      // Solo persistir preferences
      partialize: (state) => ({ slippage: state.slippage }),
    }
  )
);
```

**Uso:**
```typescript
function SwapSettings() {
  const { slippage, setSlippage } = useAppStore();

  return (
    <input
      type="number"
      value={slippage}
      onChange={(e) => setSlippage(Number(e.target.value))}
    />
  );
}
```

---

## Best Practices

### 1. **Single Source of Truth**

```typescript
// ✅ Blockchain es la source of truth
const { data: balance } = useReadContract({ ... });

// ❌ NO duplicar en useState
const [balance, setBalance] = useState<bigint>();
```

### 2. **Separar Estado UI de Blockchain**

```typescript
interface SwapState {
  // UI State (local)
  amountIn: string;
  slippage: number;
  isSettingsOpen: boolean;

  // Blockchain State (wagmi)
  // (manejado por hooks de wagmi, no aquí)
}
```

### 3. **Invalidar Caché Apropiadamente**

```typescript
// Después de write, invalidar queries relacionadas
const { isSuccess } = useWaitForTransactionReceipt({ hash });

useEffect(() => {
  if (isSuccess) {
    queryClient.invalidateQueries({
      queryKey: ['readContract', { address: token }],
    });
  }
}, [isSuccess]);
```

### 4. **Memoizar Computaciones Caras**

```typescript
// ✅ Memoizar derivaciones
const formattedBalance = useMemo(
  () => balance ? formatUnits(balance, decimals) : '0',
  [balance, decimals]
);

// ❌ Computar en cada render
const formatted = balance ? formatUnits(balance, decimals) : '0';
```

### 5. **Handle Loading & Error States**

```typescript
function Balance() {
  const { data, isLoading, error } = useReadContract({ ... });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <div>No balance</div>;

  return <div>{formatUnits(data, 18)}</div>;
}
```

---

## 📚 Referencias

- **React Query**: [https://tanstack.com/query/latest](https://tanstack.com/query/latest)
- **Zustand**: [https://zustand-demo.pmnd.rs/](https://zustand-demo.pmnd.rs/)
- **Wagmi Query**: [https://wagmi.sh/react/guides/tanstack-query](https://wagmi.sh/react/guides/tanstack-query)

---

**Siguiente patrón**: [Error Handling](./error-handling.md)
