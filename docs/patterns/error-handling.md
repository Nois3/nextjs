# ⚠️ Error Handling en Web3

> **Manejo robusto de errores para una mejor experiencia de usuario**

## 📖 Tabla de Contenidos

- [Tipos de Errores en Web3](#tipos-de-errores-en-web3)
- [Patrón 1: User-Friendly Messages](#patrón-1-user-friendly-messages)
- [Patrón 2: Retry Logic](#patrón-2-retry-logic)
- [Patrón 3: Graceful Degradation](#patrón-3-graceful-degradation)
- [Patrón 4: Error Boundaries](#patrón-4-error-boundaries)
- [Patrón 5: Logging y Monitoring](#patrón-5-logging-y-monitoring)
- [Best Practices](#best-practices)

---

## Tipos de Errores en Web3

### 1. **User Errors** (esperados)
- User rechazó transacción
- Insufficient balance
- Insufficient allowance
- Invalid input

### 2. **Contract Errors** (lógica de negocio)
- Revert con mensaje custom
- Slippage too high
- Deadline exceeded
- Paused contract

### 3. **Network Errors** (infraestructura)
- RPC timeout
- Chain disconnected
- Rate limiting
- Node out of sync

### 4. **Wallet Errors** (provider)
- Wallet not connected
- Wrong network
- Unsupported method

---

## Patrón 1: User-Friendly Messages

### ❌ Mensajes Técnicos

```typescript
// ❌ Mal: Mostrar error técnico al usuario
catch (err) {
  alert(err.message);
  // "execution reverted: 0x3a4b5c6d..."
}
```

### ✅ Mensajes Claros

```typescript
import { BaseError, ContractFunctionRevertedError } from 'viem';

function parseError(error: unknown): string {
  if (error instanceof BaseError) {
    // User rechazó
    if (error.name === 'UserRejectedRequestError') {
      return 'Transacción cancelada por el usuario';
    }

    // Revert del contrato
    const revertError = error.walk(
      (err) => err instanceof ContractFunctionRevertedError
    );

    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName;

      // Mapear a mensajes user-friendly
      const errorMessages: Record<string, string> = {
        'InsufficientBalance': 'No tienes suficiente balance',
        'InsufficientAllowance': 'Debes aprobar el token primero',
        'SlippageToleranceExceeded': 'Slippage muy alto, intenta de nuevo',
        'Unauthorized': 'No tienes permiso para esta operación',
      };

      return errorMessages[errorName || ''] || 'Error en el contrato';
    }

    // Network errors
    if (error.message.includes('timeout')) {
      return 'La red está lenta, intenta de nuevo';
    }

    if (error.message.includes('rate limit')) {
      return 'Demasiadas peticiones, espera un momento';
    }
  }

  return 'Error inesperado, intenta de nuevo';
}

// Uso
try {
  await writeContract({ ... });
} catch (err) {
  const message = parseError(err);
  toast.error(message);
}
```

---

## Patrón 2: Retry Logic

### Retry con Backoff Exponencial

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;

      // No reintentar si es error de usuario
      if (err instanceof BaseError) {
        if (err.name === 'UserRejectedRequestError') {
          throw err; // No retry
        }

        if (err.message.includes('insufficient funds')) {
          throw err; // No retry
        }
      }

      // Esperar con backoff exponencial
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} después de ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Uso
const balance = await retryWithBackoff(
  () => publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account],
  })
);
```

### Retry con React Query

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // No retry para ciertos errores
        if (error instanceof BaseError) {
          if (error.name === 'UserRejectedRequestError') {
            return false;
          }
        }

        // Máximo 3 intentos
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Backoff exponencial
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },
    },
  },
});
```

---

## Patrón 3: Graceful Degradation

### Fallback a Valores Razonables

```typescript
function TokenBalance({ token, account }: Props) {
  const { data: balance, error } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account],
  });

  // ✅ Mostrar 0 en caso de error (no romper la UI)
  const displayBalance = balance ?? 0n;

  return (
    <div>
      <div>Balance: {formatUnits(displayBalance, 18)}</div>
      {error && (
        <div className="error-banner">
          No se pudo cargar el balance. <button>Reintentar</button>
        </div>
      )}
    </div>
  );
}
```

### Fallback a RPC Secundario

```typescript
import { createPublicClient, fallback, http } from 'viem';

const client = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http('https://primary-rpc.com'),     // Intentar primero
    http('https://backup-rpc.com'),      // Luego este
    http('https://public-rpc.com'),      // Finalmente este
  ]),
});

// Automáticamente usa fallback si primary falla
const balance = await client.readContract({ ... });
```

### Feature Detection

```typescript
function useSupportsMethod(method: string) {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Intentar llamar al método
        window.ethereum.request({ method });
        setSupported(true);
      } catch {
        setSupported(false);
      }
    }
  }, [method]);

  return supported;
}

function WalletFeature() {
  const supportsAddChain = useSupportsMethod('wallet_addEthereumChain');

  if (!supportsAddChain) {
    return (
      <div>
        Tu wallet no soporta agregar redes automáticamente.
        Por favor agrégala manualmente.
      </div>
    );
  }

  return <button onClick={addChain}>Agregar Red</button>;
}
```

---

## Patrón 4: Error Boundaries

### React Error Boundary

```typescript
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Log a servicio de monitoring
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-container">
            <h2>Algo salió mal</h2>
            <p>{this.state.error?.message}</p>
            <button onClick={() => this.setState({ hasError: false })}>
              Reintentar
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Uso
function App() {
  return (
    <ErrorBoundary>
      <WalletConnect />
      <TokenSwap />
    </ErrorBoundary>
  );
}
```

### Error Boundary por Sección

```typescript
function Dashboard() {
  return (
    <div>
      <ErrorBoundary fallback={<div>Error cargando balances</div>}>
        <BalanceSection />
      </ErrorBoundary>

      <ErrorBoundary fallback={<div>Error cargando historial</div>}>
        <TransactionHistory />
      </ErrorBoundary>

      <ErrorBoundary fallback={<div>Error cargando NFTs</div>}>
        <NFTGallery />
      </ErrorBoundary>
    </div>
  );
}
```

---

## Patrón 5: Logging y Monitoring

### Logging Estructurado

```typescript
interface LogEvent {
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
  timestamp: number;
}

class Logger {
  private static log(event: LogEvent) {
    const logString = JSON.stringify({
      ...event,
      timestamp: new Date(event.timestamp).toISOString(),
    });

    console[event.level](logString);

    // Enviar a servicio de logging (Sentry, DataDog, etc.)
    if (event.level === 'error') {
      this.sendToMonitoring(event);
    }
  }

  static info(message: string, context?: Record<string, any>) {
    this.log({
      level: 'info',
      message,
      context,
      timestamp: Date.now(),
    });
  }

  static error(message: string, error: Error, context?: Record<string, any>) {
    this.log({
      level: 'error',
      message,
      context: {
        ...context,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      },
      timestamp: Date.now(),
    });
  }

  private static sendToMonitoring(event: LogEvent) {
    // Integración con Sentry
    if (window.Sentry) {
      window.Sentry.captureException(new Error(event.message), {
        extra: event.context,
      });
    }
  }
}

// Uso
try {
  await writeContract({ ... });
  Logger.info('Transfer successful', {
    token,
    amount: amount.toString(),
    recipient,
  });
} catch (err) {
  Logger.error('Transfer failed', err as Error, {
    token,
    amount: amount.toString(),
    recipient,
  });
}
```

### Monitoreo de Transacciones

```typescript
function useTransactionMonitoring() {
  const { writeContract } = useWriteContract({
    mutation: {
      onMutate: (variables) => {
        Logger.info('Transaction initiated', {
          function: variables.functionName,
          args: variables.args,
        });
      },

      onSuccess: (hash) => {
        Logger.info('Transaction submitted', { hash });
      },

      onError: (error) => {
        Logger.error('Transaction failed', error, {
          errorType: error.name,
        });
      },
    },
  });

  const { isSuccess } = useWaitForTransactionReceipt({
    hash,
    onReplaced: (response) => {
      Logger.warn('Transaction replaced', {
        oldHash: hash,
        newHash: response.transaction.hash,
        reason: response.reason,
      });
    },
  });

  useEffect(() => {
    if (isSuccess) {
      Logger.info('Transaction confirmed', { hash });
    }
  }, [isSuccess, hash]);

  return { writeContract };
}
```

---

## Best Practices

### 1. **Categorizar Errores**

```typescript
class WalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletError';
  }
}

class ContractError extends Error {
  constructor(message: string, public revertReason?: string) {
    super(message);
    this.name = 'ContractError';
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Manejar según tipo
try {
  // ...
} catch (err) {
  if (err instanceof WalletError) {
    // Mostrar mensaje de wallet
  } else if (err instanceof ContractError) {
    // Mostrar mensaje de contrato
  } else if (err instanceof NetworkError) {
    // Retry automático
  }
}
```

### 2. **Validar Antes de Enviar**

```typescript
async function validateTransfer(
  token: Address,
  from: Address,
  to: Address,
  amount: bigint
): Promise<string | null> {
  // Validar dirección
  if (!isAddress(to)) {
    return 'Dirección de destino inválida';
  }

  // Validar balance
  const balance = await publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [from],
  });

  if (balance < amount) {
    return 'Balance insuficiente';
  }

  // Simular transacción
  try {
    await publicClient.simulateContract({
      address: token,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to, amount],
      account: from,
    });
  } catch (err) {
    return 'La transacción fallaría: ' + parseError(err);
  }

  return null; // Todo OK
}

// Uso
const error = await validateTransfer(token, from, to, amount);
if (error) {
  toast.error(error);
  return;
}

// Proceder con la transacción
await writeContract({ ... });
```

### 3. **Timeout para Operaciones**

```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
  });

  return Promise.race([promise, timeout]);
}

// Uso
try {
  const balance = await withTimeout(
    publicClient.readContract({ ... }),
    5000 // 5 segundos
  );
} catch (err) {
  if (err.message.includes('timed out')) {
    toast.error('La operación está tardando demasiado');
  }
}
```

### 4. **Circuit Breaker**

```typescript
class CircuitBreaker {
  private failures = 0;
  private readonly threshold = 3;
  private readonly timeout = 60000; // 1 minuto
  private nextAttempt = 0;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private isOpen(): boolean {
    return this.failures >= this.threshold && Date.now() < this.nextAttempt;
  }

  private onSuccess() {
    this.failures = 0;
  }

  private onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

// Uso
const rpcBreaker = new CircuitBreaker();

try {
  const balance = await rpcBreaker.execute(() =>
    publicClient.readContract({ ... })
  );
} catch (err) {
  // Usar caché o fallback
}
```

### 5. **User Feedback Durante Errores**

```typescript
function TransactionStatus({ hash }: { hash: Hash }) {
  const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({ hash });

  return (
    <div>
      {isLoading && (
        <div className="loading">
          <Spinner />
          <p>Esperando confirmación...</p>
          <p className="text-sm">Esto puede tomar hasta 1 minuto</p>
        </div>
      )}

      {error && (
        <div className="error">
          <AlertIcon />
          <p>Error al confirmar transacción</p>
          <p className="text-sm">{parseError(error)}</p>
          <div className="actions">
            <button onClick={() => window.location.reload()}>
              Reintentar
            </button>
            <a
              href={`https://etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver en Etherscan
            </a>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="success">
          <CheckIcon />
          <p>¡Transacción confirmada!</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📚 Referencias

- **Viem Error Handling**: [https://viem.sh/docs/error-handling](https://viem.sh/docs/error-handling)
- **React Error Boundaries**: [https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- **Sentry for Web3**: [https://docs.sentry.io/](https://docs.sentry.io/)

---

## 🎯 Resumen

- **Categorizar errores**: User, Contract, Network, Wallet
- **Mensajes claros**: Traducir errores técnicos a lenguaje user-friendly
- **Retry logic**: Con backoff exponencial para errores transitorios
- **Graceful degradation**: Fallbacks y feature detection
- **Error boundaries**: Aislar errores por sección
- **Logging**: Estructurado y enviado a monitoring
- **Validar primero**: Antes de enviar transacciones costosas

---

**Siguiente patrón**: [Testing](./testing.md)
