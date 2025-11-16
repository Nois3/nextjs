# 🔄 Multicall & Batch Operations

> **Optimiza múltiples llamadas a contratos ejecutándolas en una sola transacción**

## 📖 Tabla de Contenidos

- [¿Qué es Multicall?](#qué-es-multicall)
- [¿Por Qué Multicall?](#por-qué-multicall)
- [Tipos de Multicall](#tipos-de-multicall)
- [Multicall3](#multicall3)
- [Read Operations (Batch Reads)](#read-operations-batch-reads)
- [Write Operations (Batch Writes)](#write-operations-batch-writes)
- [Implementación con Wagmi](#implementación-con-wagmi)
- [Implementación con Viem](#implementación-con-viem)
- [Casos de Uso](#casos-de-uso)
- [Optimizaciones](#optimizaciones)
- [Best Practices](#best-practices)

---

## ¿Qué es Multicall?

**Multicall** es un patrón que permite ejecutar **múltiples llamadas a contratos en una sola transacción** o request.

### Problema

```typescript
// ❌ 3 requests separados al RPC
const balance1 = await readContract({ address: token1, functionName: 'balanceOf', ... });
const balance2 = await readContract({ address: token2, functionName: 'balanceOf', ... });
const balance3 = await readContract({ address: token3, functionName: 'balanceOf', ... });

// Tiempo total: ~600ms (200ms × 3)
// Latencia: Alta
```

### Solución

```typescript
// ✅ 1 solo request con Multicall
const results = await multicall({
  contracts: [
    { address: token1, functionName: 'balanceOf', ... },
    { address: token2, functionName: 'balanceOf', ... },
    { address: token3, functionName: 'balanceOf', ... },
  ],
});

// Tiempo total: ~200ms
// Latencia: Reducida 3x
```

---

## ¿Por Qué Multicall?

### 1. **Performance**

```
Sin Multicall:
Request 1 → Response 1 (200ms)
Request 2 → Response 2 (200ms)
Request 3 → Response 3 (200ms)
Total: 600ms

Con Multicall:
Request (bundled) → Response (all) (200ms)
Total: 200ms
```

### 2. **Consistencia**

```typescript
// ❌ Sin multicall: Estado puede cambiar entre llamadas
const balance = await token.balanceOf(user);    // Block 100
const allowance = await token.allowance(user);  // Block 101 (cambió)

// ✅ Con multicall: Todo en el mismo block
const results = await multicall([
  { functionName: 'balanceOf', ... },
  { functionName: 'allowance', ... },
]);
// Ambos del mismo block → Estado consistente
```

### 3. **Menor Carga al RPC**

- 1 request vs N requests
- Menos probabilidad de rate limiting
- Mejor para proveedores públicos (Infura, Alchemy)

### 4. **Reducción de Gas** (para writes)

```solidity
// ❌ 3 transacciones separadas
tx1: approve(spender1, amount1)  // 50,000 gas
tx2: approve(spender2, amount2)  // 50,000 gas
tx3: approve(spender3, amount3)  // 50,000 gas
Total: 150,000 gas + (3 × 21,000 base) = 213,000 gas

// ✅ 1 transacción con multicall
multicall([
  approve(spender1, amount1),
  approve(spender2, amount2),
  approve(spender3, amount3),
])
Total: ~130,000 gas (ahorro de ~40%)
```

---

## Tipos de Multicall

### 1. **Read Multicall** (eth_call batch)

- Agrupa múltiples `eth_call` en uno solo
- No crea transacción
- Gratis (no cuesta gas)
- Mismo estado (mismo block)

### 2. **Write Multicall** (tx batch)

- Agrupa múltiples state-changing calls en 1 tx
- Crea 1 transacción
- Cuesta gas (pero menos que N txs separadas)
- Atómico (todo pasa o todo falla)

---

## Multicall3

**Multicall3** es el estándar moderno de multicall, desplegado en todas las chains principales.

### Direcciones

```
Mainnet, Polygon, Arbitrum, Optimism, Base, etc.:
0xcA11bde05977b3631167028862bE2a173976CA11
```

**Características:**
- ✅ Dirección determinística (misma en todas las chains)
- ✅ Soporta llamadas que fallan (no revierte todo)
- ✅ Retorna gas usado por llamada
- ✅ Puede enviar ETH con cada call

### Interfaz

```solidity
interface IMulticall3 {
    struct Call {
        address target;
        bytes callData;
    }

    struct Call3 {
        address target;
        bool allowFailure;
        bytes callData;
    }

    struct Call3Value {
        address target;
        bool allowFailure;
        uint256 value;
        bytes callData;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    function aggregate(Call[] calldata calls)
        external
        returns (uint256 blockNumber, bytes[] memory returnData);

    function aggregate3(Call3[] calldata calls)
        external
        returns (Result[] memory returnData);

    function aggregate3Value(Call3Value[] calldata calls)
        external
        payable
        returns (Result[] memory returnData);
}
```

---

## Read Operations (Batch Reads)

### Con Wagmi

```typescript
import { useReadContracts } from 'wagmi';
import { erc20Abi } from 'viem';

function TokenBalances({ tokens, account }: Props) {
  const { data, isLoading } = useReadContracts({
    contracts: tokens.map((token) => ({
      address: token,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [account],
    })),
  });

  if (isLoading) return <div>Cargando balances...</div>;

  return (
    <div>
      {data?.map((result, i) => (
        <div key={i}>
          Token {i}: {result.result?.toString() || 'Error'}
        </div>
      ))}
    </div>
  );
}
```

### Leer Diferentes Funciones del Mismo Token

```typescript
function TokenInfo({ token }: { token: Address }) {
  const { data } = useReadContracts({
    contracts: [
      {
        address: token,
        abi: erc20Abi,
        functionName: 'name',
      },
      {
        address: token,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address: token,
        abi: erc20Abi,
        functionName: 'decimals',
      },
      {
        address: token,
        abi: erc20Abi,
        functionName: 'totalSupply',
      },
    ],
  });

  const [name, symbol, decimals, totalSupply] = data || [];

  return (
    <div>
      <h2>{name?.result} ({symbol?.result})</h2>
      <p>Decimals: {decimals?.result}</p>
      <p>Supply: {totalSupply?.result?.toString()}</p>
    </div>
  );
}
```

### Con Viem (Multicall Contract)

```typescript
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const results = await client.multicall({
  contracts: [
    {
      address: '0xUSDC',
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: ['0xUserAddress'],
    },
    {
      address: '0xDAI',
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: ['0xUserAddress'],
    },
    {
      address: '0xUSDT',
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: ['0xUserAddress'],
    },
  ],
});

results.forEach((result, i) => {
  if (result.status === 'success') {
    console.log(`Token ${i}:`, result.result);
  } else {
    console.error(`Token ${i} failed:`, result.error);
  }
});
```

### AllowFailure

Por defecto, si una llamada falla, todas fallan. Usa `allowFailure`:

```typescript
const results = await client.multicall({
  contracts: [
    {
      address: '0xValidToken',
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: ['0xUser'],
    },
    {
      address: '0xInvalidToken', // Este puede fallar
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: ['0xUser'],
    },
  ],
  allowFailure: true, // ← Importante
});

// results[0]: { status: 'success', result: 1000n }
// results[1]: { status: 'failure', error: ... }
```

---

## Write Operations (Batch Writes)

### Multicall en un Solo Contrato

Si tu contrato tiene una función `multicall`:

```solidity
contract MyContract {
    function multicall(bytes[] calldata data)
        external
        returns (bytes[] memory results)
    {
        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            require(success, "Call failed");
            results[i] = result;
        }
    }

    function approve(address spender, uint256 amount) external { ... }
    function transfer(address to, uint256 amount) external { ... }
}
```

```typescript
import { encodeFunctionData } from 'viem';

const { writeContract } = useWriteContract();

// Encodear múltiples llamadas
const calls = [
  encodeFunctionData({
    abi: myContractAbi,
    functionName: 'approve',
    args: ['0xSpender1', parseEther('100')],
  }),
  encodeFunctionData({
    abi: myContractAbi,
    functionName: 'transfer',
    args: ['0xRecipient', parseEther('50')],
  }),
];

// Ejecutar en 1 tx
await writeContract({
  address: myContractAddress,
  abi: myContractAbi,
  functionName: 'multicall',
  args: [calls],
});
```

### Multicall3 para Múltiples Contratos

```typescript
import { encodeFunctionData } from 'viem';

const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

const { writeContract } = useWriteContract();

const calls = [
  {
    target: '0xToken1',
    allowFailure: false,
    callData: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: ['0xSpender', parseEther('100')],
    }),
  },
  {
    target: '0xToken2',
    allowFailure: false,
    callData: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: ['0xSpender', parseEther('200')],
    }),
  },
];

await writeContract({
  address: MULTICALL3_ADDRESS,
  abi: multicall3Abi,
  functionName: 'aggregate3',
  args: [calls],
});
```

### Batch con Valor ETH

```typescript
const calls = [
  {
    target: '0xWETH',
    allowFailure: false,
    value: parseEther('1'), // Enviar 1 ETH
    callData: encodeFunctionData({
      abi: wethAbi,
      functionName: 'deposit',
      args: [],
    }),
  },
  {
    target: '0xNFT',
    allowFailure: false,
    value: parseEther('0.08'), // Enviar 0.08 ETH
    callData: encodeFunctionData({
      abi: nftAbi,
      functionName: 'mint',
      args: [1n],
    }),
  },
];

await writeContract({
  address: MULTICALL3_ADDRESS,
  abi: multicall3Abi,
  functionName: 'aggregate3Value',
  args: [calls],
  value: parseEther('1.08'), // Total ETH
});
```

---

## Casos de Uso

### 1. **Portfolio Dashboard**

Leer balances de múltiples tokens:

```typescript
function Portfolio({ tokens, account }: Props) {
  const { data } = useReadContracts({
    contracts: tokens.flatMap((token) => [
      {
        address: token,
        abi: erc20Abi,
        functionName: 'name',
      },
      {
        address: token,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address: token,
        abi: erc20Abi,
        functionName: 'decimals',
      },
      {
        address: token,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [account],
      },
    ]),
  });

  // Procesar resultados
  const tokenData = [];
  for (let i = 0; i < tokens.length; i++) {
    const [name, symbol, decimals, balance] = data?.slice(i * 4, (i + 1) * 4) || [];
    tokenData.push({
      address: tokens[i],
      name: name?.result,
      symbol: symbol?.result,
      decimals: decimals?.result,
      balance: balance?.result,
    });
  }

  return (
    <div>
      {tokenData.map((token) => (
        <div key={token.address}>
          {token.symbol}: {formatUnits(token.balance || 0n, token.decimals || 18)}
        </div>
      ))}
    </div>
  );
}
```

### 2. **Aprobar Múltiples Tokens**

```typescript
function ApproveAll({ tokens, spender, amounts }: Props) {
  const { writeContract } = useWriteContract();

  const handleApproveAll = async () => {
    const calls = tokens.map((token, i) => ({
      target: token,
      allowFailure: false,
      callData: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender, amounts[i]],
      }),
    }));

    await writeContract({
      address: MULTICALL3_ADDRESS,
      abi: multicall3Abi,
      functionName: 'aggregate3',
      args: [calls],
    });
  };

  return <button onClick={handleApproveAll}>Aprobar Todos</button>;
}
```

### 3. **Claim Rewards de Múltiples Pools**

```typescript
function ClaimAllRewards({ pools }: { pools: Address[] }) {
  const { writeContract } = useWriteContract();

  const handleClaimAll = async () => {
    const calls = pools.map((pool) => ({
      target: pool,
      allowFailure: true, // Permitir que algunos fallen
      callData: encodeFunctionData({
        abi: stakingAbi,
        functionName: 'claimRewards',
        args: [],
      }),
    }));

    await writeContract({
      address: MULTICALL3_ADDRESS,
      abi: multicall3Abi,
      functionName: 'aggregate3',
      args: [calls],
    });
  };

  return <button onClick={handleClaimAll}>Claim All Rewards</button>;
}
```

### 4. **Swap + Stake en 1 TX**

```typescript
// Swap USDC → ETH, luego stake ETH
const calls = [
  // 1. Swap en Uniswap
  {
    target: UNISWAP_ROUTER,
    allowFailure: false,
    callData: encodeFunctionData({
      abi: uniswapAbi,
      functionName: 'swapExactTokensForETH',
      args: [...],
    }),
  },
  // 2. Stake el ETH recibido
  {
    target: STAKING_CONTRACT,
    allowFailure: false,
    value: expectedETH,
    callData: encodeFunctionData({
      abi: stakingAbi,
      functionName: 'stake',
      args: [],
    }),
  },
];
```

---

## Optimizaciones

### 1. **Batch por Tamaño**

No agrupar demasiadas calls:

```typescript
const BATCH_SIZE = 50; // Máximo por batch

function batchCalls<T>(calls: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < calls.length; i += size) {
    batches.push(calls.slice(i, i + size));
  }
  return batches;
}

// Usar
const allCalls = [...]; // 200 calls
const batches = batchCalls(allCalls, BATCH_SIZE);

const results = await Promise.all(
  batches.map((batch) => client.multicall({ contracts: batch }))
);
```

### 2. **Priorizar Calls Críticos**

```typescript
// Separar críticos de no críticos
const criticalCalls = [...]; // Balance, allowance
const optionalCalls = [...]; // Metadata

// Ejecutar críticos primero
const criticalResults = await client.multicall({
  contracts: criticalCalls,
});

// Luego opcionales (pueden fallar)
const optionalResults = await client.multicall({
  contracts: optionalCalls,
  allowFailure: true,
});
```

### 3. **Caché de Resultados Estáticos**

```typescript
// Metadata rara vez cambia → cachear
const { data: metadata } = useReadContracts({
  contracts: tokens.map((token) => ({
    address: token,
    abi: erc20Abi,
    functionName: 'decimals',
  })),
  cacheTime: Infinity, // Nunca refrescar
  staleTime: Infinity,
});

// Balance cambia → refrescar
const { data: balances } = useReadContracts({
  contracts: tokens.map((token) => ({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account],
  })),
  refetchInterval: 10_000, // Cada 10s
});
```

---

## Best Practices

### 1. **Usar `allowFailure` Apropiadamente**

```typescript
// ✅ Permitir fallos en llamadas opcionales
const results = await client.multicall({
  contracts: [
    { ...criticalCall }, // No puede fallar
    { ...optionalCall }, // Puede fallar
  ],
  allowFailure: true,
});

results.forEach((result) => {
  if (result.status === 'failure') {
    console.warn('Optional call failed:', result.error);
  }
});
```

### 2. **Manejar Errores Parciales**

```typescript
const { data, error } = useReadContracts({ ... });

if (error) {
  console.error('Multicall error:', error);
  // Manejar error completo
}

// Verificar resultados individuales
data?.forEach((result, i) => {
  if (result.status === 'failure') {
    console.error(`Call ${i} failed:`, result.error);
  }
});
```

### 3. **Estimar Gas Antes de Write Multicall**

```typescript
// Estimar gas total
const gasEstimate = await client.estimateContractGas({
  address: MULTICALL3_ADDRESS,
  abi: multicall3Abi,
  functionName: 'aggregate3',
  args: [calls],
});

console.log('Gas estimado:', gasEstimate);

if (gasEstimate > MAX_GAS) {
  alert('Demasiadas operaciones. Reducir batch size.');
  return;
}
```

### 4. **Type Safety**

```typescript
// ✅ Tipado fuerte con 'as const'
const contracts = [
  {
    address: '0xUSDC',
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: ['0xUser'],
  },
] as const;

const { data } = useReadContracts({ contracts });

// TypeScript sabe el tipo exacto de data[0].result
const balance: bigint | undefined = data?.[0].result;
```

### 5. **Documentar Dependencias**

```typescript
// ✅ Documentar si las llamadas tienen dependencias
const calls = [
  // 1. Debe ejecutarse primero (approve)
  { target: token, callData: approveCall },

  // 2. Depende de #1 (transferFrom)
  { target: token, callData: transferFromCall },
];

// ⚠️ Orden importa - no reordenar
```

---

## 🔐 Consideraciones de Seguridad

### 1. **Validar Resultados**

```typescript
const results = await client.multicall({ contracts, allowFailure: true });

results.forEach((result, i) => {
  if (result.status === 'failure') {
    console.error(`Call ${i} failed - puede afectar lógica posterior`);
  }
});
```

### 2. **Gas Limits**

```typescript
// Demasiadas calls pueden exceder block gas limit
if (calls.length > 100) {
  console.warn('⚠️ Batch muy grande - puede fallar');
}
```

### 3. **Reentrancy en Multicall**

```solidity
// ⚠️ Cuidado con reentrancy en multicall
function multicall(bytes[] calldata data) external {
    for (uint256 i = 0; i < data.length; i++) {
        // delegatecall puede permitir reentrancy
        (bool success, ) = address(this).delegatecall(data[i]);
    }
}
```

**Protección:**
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MyContract is ReentrancyGuard {
    function multicall(bytes[] calldata data)
        external
        nonReentrant // ← Protección
    {
        ...
    }
}
```

---

## 📚 Referencias

- **Multicall3**: [https://github.com/mds1/multicall](https://github.com/mds1/multicall)
- **Viem Multicall**: [https://viem.sh/docs/contract/multicall](https://viem.sh/docs/contract/multicall)
- **Wagmi useReadContracts**: [https://wagmi.sh/react/hooks/useReadContracts](https://wagmi.sh/react/hooks/useReadContracts)

---

## 🎯 Resumen

- **Multicall** agrupa múltiples llamadas en una sola
- **Reduce latencia** (1 request vs N)
- **Reduce gas** (para writes)
- **Consistencia de estado** (mismo block)
- **Multicall3** es el estándar moderno (dirección determinística)
- **allowFailure** permite que algunas llamadas fallen sin revertir todo
- **Wagmi + Viem** soportan multicall nativamente
- **Batch size** óptimo: 20-50 calls por request

---

**Siguiente módulo recomendado**: [Account Abstraction (ERC-4337)](./account-abstraction.md)
