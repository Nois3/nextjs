# 📤 Transacciones en Ethereum

> **Conceptos fundamentales sobre transacciones, gas, tipos de transacciones, y ciclo de vida**

## 📖 Tabla de Contenidos

- [¿Qué es una Transacción?](#qué-es-una-transacción)
- [Anatomía de una Transacción](#anatomía-de-una-transacción)
- [Tipos de Transacciones](#tipos-de-transacciones)
- [Gas y Fees](#gas-y-fees)
- [Ciclo de Vida de una Transacción](#ciclo-de-vida-de-una-transacción)
- [Estados de una Transacción](#estados-de-una-transacción)
- [Estimación de Gas](#estimación-de-gas)
- [Transacciones Fallidas](#transacciones-fallidas)
- [Best Practices](#best-practices)
- [Implementación con Wagmi + Viem](#implementación-con-wagmi--viem)

---

## ¿Qué es una Transacción?

Una **transacción** es una acción firmada criptográficamente originada por una cuenta externa (EOA - Externally Owned Account) que cambia el estado de la blockchain de Ethereum.

### Tipos de Acciones que Requieren Transacciones

1. **Transferir ETH** de una cuenta a otra
2. **Ejecutar una función** en un smart contract (write operation)
3. **Desplegar un smart contract** (contract creation)
4. **Interactuar con contratos** (llamadas state-changing)

### ¿Qué NO es una Transacción?

- **Leer datos** de la blockchain (view/pure functions)
- **Llamadas locales** (eth_call) que solo simulan ejecución
- **Eventos emitidos** por contratos (son consecuencia de transacciones)

---

## Anatomía de una Transacción

Toda transacción en Ethereum contiene los siguientes campos:

```typescript
interface Transaction {
  // Identificación
  from: Address;           // Dirección del remitente (EOA)
  to: Address | null;      // Dirección del destinatario (null = deploy)
  nonce: bigint;           // Contador de transacciones del remitente

  // Valor y datos
  value: bigint;           // Cantidad de ETH a enviar (en wei)
  data: Hex;               // Datos de la transacción (call data)

  // Gas (pre-EIP-1559)
  gasLimit: bigint;        // Límite máximo de gas
  gasPrice?: bigint;       // Precio del gas (legacy)

  // Gas (post-EIP-1559)
  maxFeePerGas?: bigint;          // Máximo fee por unidad de gas
  maxPriorityFeePerGas?: bigint;  // Propina al minero

  // Firma
  v: bigint;               // Recovery ID
  r: Hex;                  // Firma (parte r)
  s: Hex;                  // Firma (parte s)

  // Metadata
  chainId: number;         // ID de la red (previene replay attacks)
  type: 0 | 1 | 2;        // Tipo de transacción
}
```

### Campos Clave Explicados

#### 1. **from**
- Dirección del remitente (quien firma la transacción)
- Debe ser una EOA (no puede ser un contrato directamente)
- La cuenta debe tener suficiente ETH para cubrir `value + gas fees`

#### 2. **to**
- Dirección del destinatario
- Puede ser una EOA o un contrato
- Si es `null`, la transacción despliega un nuevo contrato

#### 3. **nonce**
- Contador de transacciones para esta cuenta
- Previene **replay attacks**
- Debe ser incremental y sin gaps: 0, 1, 2, 3...
- Si envías nonce 5 antes que nonce 4, la tx quedará pendiente

#### 4. **value**
- Cantidad de ETH a enviar (en **wei**)
- 1 ETH = 10^18 wei
- Puede ser 0 (común en llamadas a contratos)

#### 5. **data**
- Bytes arbitrarios
- Para transferencias de ETH simples: `0x` (vacío)
- Para llamadas a contratos: función codificada + parámetros (ABI encoding)
- Para deployments: bytecode del contrato

#### 6. **gasLimit**
- Máximo de unidades de gas que estás dispuesto a gastar
- Si la ejecución usa más gas, la tx falla (revert)
- Si usa menos, el gas no usado se devuelve

#### 7. **maxFeePerGas** y **maxPriorityFeePerGas** (EIP-1559)
- **maxFeePerGas**: Máximo que pagarás por unidad de gas (incluyendo base fee)
- **maxPriorityFeePerGas**: Propina al validador (para priorizar tu tx)
- Fee real = `min(maxFeePerGas, baseFeePerGas + maxPriorityFeePerGas)`

---

## Tipos de Transacciones

Ethereum soporta múltiples tipos de transacciones (Type 0, 1, 2):

### Type 0: Legacy Transactions

Las transacciones originales de Ethereum (pre-EIP-1559).

```typescript
{
  type: 0,
  to: '0x...',
  value: parseEther('1'),
  gasPrice: parseGwei('50'),  // Precio fijo del gas
  gasLimit: 21000n,
  data: '0x',
  nonce: 5,
}
```

**Características:**
- Usa `gasPrice` (precio fijo)
- No hay separación entre base fee y priority fee
- Menos eficiente para el usuario (puedes sobrepagar)

### Type 1: Access List Transactions (EIP-2930)

Introducido en Berlin hard fork. Permite especificar qué storage slots se accederán.

```typescript
{
  type: 1,
  to: '0x...',
  value: parseEther('1'),
  gasPrice: parseGwei('50'),
  accessList: [
    {
      address: '0xContractAddress',
      storageKeys: [
        '0x0000000000000000000000000000000000000000000000000000000000000001'
      ]
    }
  ],
  nonce: 5,
}
```

**Uso:**
- Optimiza gas al predeclarar storage access
- Útil para contratos con múltiples interacciones

### Type 2: EIP-1559 Transactions

El estándar moderno (London hard fork, Agosto 2021).

```typescript
{
  type: 2,
  to: '0x...',
  value: parseEther('1'),
  maxFeePerGas: parseGwei('100'),           // Máximo total
  maxPriorityFeePerGas: parseGwei('2'),     // Propina al minero
  gasLimit: 21000n,
  data: '0x',
  nonce: 5,
}
```

**Ventajas:**
- **Más predecible**: Base fee se ajusta automáticamente
- **Menos sobrepago**: Solo pagas lo necesario
- **Mejor UX**: Wallets pueden estimar fees más precisamente
- **Quema de ETH**: Base fee se quema (deflacionario)

**Cómo funciona:**
```
Total Fee = (Base Fee + Priority Fee) × Gas Used

Donde:
- Base Fee: Determinado por el protocolo (varía por bloque)
- Priority Fee: Tu propina al validador (incentivo)
- Gas Used: Unidades de gas consumidas
```

---

## Gas y Fees

### ¿Qué es el Gas?

El **gas** es la unidad de medida del trabajo computacional en Ethereum.

- Transferir ETH: **21,000 gas**
- Transferir ERC-20: **~65,000 gas**
- Swap en Uniswap: **~150,000 gas**
- NFT mint: **~50,000 - 200,000 gas** (depende del contrato)

### Componentes del Fee (EIP-1559)

```
Total Fee = Gas Used × (Base Fee + Priority Fee)
```

#### 1. **Base Fee**
- Determinado por el protocolo
- Varía según congestión de la red
- Si bloque está >50% lleno → base fee sube
- Si bloque está <50% lleno → base fee baja
- Se **quema** (no va a mineros/validadores)

#### 2. **Priority Fee (Tip)**
- Lo que pagas al validador para priorizar tu tx
- Típicamente 1-2 gwei en momentos normales
- Puede ser mucho más en momentos de alta demanda

#### 3. **Max Fee Per Gas**
- Tu límite máximo (protección contra spikes)
- Debe ser ≥ `baseFee + priorityFee`
- El exceso se devuelve

### Ejemplo de Cálculo

```typescript
// Supongamos:
const baseFee = 30n; // 30 gwei (determinado por la red)
const priorityFee = 2n; // 2 gwei (nuestra propina)
const gasUsed = 21000n; // Transferencia simple de ETH

// Max fee que especificamos
const maxFeePerGas = 100n; // 100 gwei

// Fee real que pagaremos
const actualFeePerGas = baseFee + priorityFee; // 32 gwei
const totalFee = actualFeePerGas * gasUsed; // 32 × 21000 = 672,000 gwei

// En ETH
const totalFeeInETH = formatUnits(totalFee, 9); // "0.000672 ETH"

// El exceso se devuelve
const refund = (maxFeePerGas - actualFeePerGas) * gasUsed;
// (100 - 32) × 21000 = 1,428,000 gwei devueltos
```

### Unidades de Gas

```
1 wei      = 1 wei
1 gwei     = 10^9 wei      (usado para gas prices)
1 ether    = 10^18 wei
```

---

## Ciclo de Vida de una Transacción

### 1. **Construcción**
```typescript
const tx = {
  to: '0xRecipient',
  value: parseEther('1'),
  maxFeePerGas: parseGwei('100'),
  maxPriorityFeePerGas: parseGwei('2'),
}
```

### 2. **Firma**
```typescript
// Con wagmi
const { sendTransaction } = useSendTransaction();

// Internamente firma con la private key de la wallet
const signature = await wallet.signTransaction(tx);
```

### 3. **Broadcast**
```typescript
const hash = await sendTransaction(tx);
// TX enviada a la mempool (pending)
```

### 4. **Mempool (Pending)**
- La tx espera en el mempool del nodo
- Validadores/mineros la ven y pueden incluirla
- Ordenada por priority fee (mayor fee = mayor prioridad)

### 5. **Inclusión en Bloque**
- Validador incluye la tx en un bloque
- Ejecuta la tx (puede fallar aquí si hay revert)
- Tx ahora tiene 1 confirmación

### 6. **Confirmaciones**
```typescript
// Esperar 1 confirmación
await publicClient.waitForTransactionReceipt({ hash });

// Esperar 12 confirmaciones (más seguro)
await publicClient.waitForTransactionReceipt({
  hash,
  confirmations: 12
});
```

### 7. **Finalización**
- Después de suficientes confirmaciones (típicamente 12+)
- Extremadamente improbable que la tx sea revertida

---

## Estados de una Transacción

```typescript
type TxStatus =
  | 'pending'      // En mempool, no incluida aún
  | 'included'     // Incluida en un bloque
  | 'confirmed'    // N confirmaciones
  | 'failed'       // Revertida (execution error)
  | 'dropped'      // Expulsada del mempool
  | 'replaced';    // Reemplazada por otra tx (mismo nonce)
```

### Monitorear Estado

```typescript
import { useWaitForTransactionReceipt } from 'wagmi';

function TxMonitor({ hash }: { hash: `0x${string}` }) {
  const { data: receipt, isLoading, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  if (isLoading) return <div>Esperando confirmación...</div>;

  if (isSuccess) {
    return (
      <div>
        ✅ Confirmada en bloque {receipt.blockNumber}
        Gas usado: {receipt.gasUsed.toString()}
        Status: {receipt.status === 'success' ? '✅' : '❌'}
      </div>
    );
  }

  return <div>Error</div>;
}
```

---

## Estimación de Gas

### ¿Por qué Estimar?

- Evitar que la tx falle por out of gas
- No sobrepagar (setear gasLimit muy alto es innecesario)
- Mostrar fee estimado al usuario antes de confirmar

### Estimación con Wagmi

```typescript
import { useEstimateGas } from 'wagmi';

function GasEstimator() {
  const { data: gasEstimate } = useEstimateGas({
    to: '0xRecipient',
    value: parseEther('1'),
  });

  // Agregar 20% de buffer (recomendado)
  const gasLimit = gasEstimate
    ? gasEstimate * 120n / 100n
    : undefined;

  return <div>Gas estimado: {gasEstimate?.toString()}</div>;
}
```

### Estimación Manual con Viem

```typescript
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const gas = await client.estimateGas({
  account: '0xYourAddress',
  to: '0xRecipient',
  value: parseEther('1'),
});

console.log('Gas estimado:', gas); // bigint
```

### ⚠️ Cuidado con Estimaciones

Las estimaciones pueden fallar o ser incorrectas si:

1. **El contrato revierte**: `estimateGas` simulará y fallará
2. **Estado cambia**: Entre estimación y ejecución, el estado puede cambiar
3. **Condiciones dinámicas**: Contratos con lógica basada en timestamp/block

**Solución**: Siempre agregar un buffer del 10-20% sobre la estimación.

---

## Transacciones Fallidas

### Causas Comunes

#### 1. **Out of Gas**
```
Error: Transaction ran out of gas
```
**Solución**: Aumentar `gasLimit`

#### 2. **Revert en el Contrato**
```
Error: execution reverted: Insufficient balance
```
**Solución**: Depende del mensaje de revert. Revisar lógica del contrato.

#### 3. **Nonce Incorrecto**
```
Error: nonce too low
```
**Solución**: Obtener nonce actual de la blockchain

#### 4. **Insufficient Funds**
```
Error: insufficient funds for gas * price + value
```
**Solución**: Necesitas más ETH en tu wallet

#### 5. **Underpriced Transaction**
```
Error: transaction underpriced
```
**Solución**: Aumentar `maxFeePerGas` o `maxPriorityFeePerGas`

### Manejo de Errores

```typescript
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

function SendETH() {
  const {
    sendTransaction,
    data: hash,
    error: sendError,
    isPending: isSending
  } = useSendTransaction();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash });

  const handleSend = async () => {
    try {
      await sendTransaction({
        to: '0xRecipient',
        value: parseEther('0.01'),
      });
    } catch (err) {
      console.error('Error enviando:', err);
    }
  };

  if (sendError) {
    return <div>❌ Error: {sendError.message}</div>;
  }

  if (receiptError) {
    return <div>❌ TX falló: {receiptError.message}</div>;
  }

  return (
    <div>
      <button onClick={handleSend} disabled={isSending}>
        {isSending ? 'Enviando...' : 'Enviar 0.01 ETH'}
      </button>

      {isConfirming && <div>⏳ Esperando confirmación...</div>}
      {isSuccess && <div>✅ Enviado! Hash: {hash}</div>}
    </div>
  );
}
```

---

## Best Practices

### 1. **Siempre Estimar Gas Antes de Enviar**

```typescript
const gasEstimate = await publicClient.estimateGas({
  account,
  to,
  value,
  data,
});

const gasLimit = gasEstimate * 120n / 100n; // +20% buffer
```

### 2. **Usar EIP-1559 (Type 2)**

```typescript
// ✅ Bueno: EIP-1559
const tx = {
  type: 2,
  maxFeePerGas: parseGwei('100'),
  maxPriorityFeePerGas: parseGwei('2'),
};

// ❌ Evitar: Legacy (a menos que sea necesario)
const txLegacy = {
  type: 0,
  gasPrice: parseGwei('50'),
};
```

### 3. **Monitorear el Estado**

```typescript
// ✅ Esperar receipt
const receipt = await publicClient.waitForTransactionReceipt({ hash });

// Verificar status
if (receipt.status === 'reverted') {
  console.error('Transaction failed!');
}
```

### 4. **Manejo de Nonce**

```typescript
// Dejar que wagmi maneje el nonce automáticamente
const { sendTransaction } = useSendTransaction();

// O manejarlo manualmente (solo si es necesario)
const nonce = await publicClient.getTransactionCount({
  address: account,
  blockTag: 'pending', // Importante: usar 'pending'
});
```

### 5. **Reemplazar Transacciones Stuck**

Si una tx está stuck (pending demasiado tiempo):

```typescript
// Reenviar con el mismo nonce pero mayor fee
const { sendTransaction } = useSendTransaction();

await sendTransaction({
  to,
  value,
  nonce: stuckTxNonce, // Mismo nonce
  maxFeePerGas: parseGwei('150'), // Mayor fee
  maxPriorityFeePerGas: parseGwei('5'),
});
```

### 6. **Cancelar Transacciones**

```typescript
// Enviar 0 ETH a ti mismo con el mismo nonce
await sendTransaction({
  to: account, // A ti mismo
  value: 0n,
  nonce: txToCancel.nonce,
  maxFeePerGas: parseGwei('150'), // Mayor que la original
});
```

### 7. **Validar Antes de Firmar**

```typescript
// ✅ Validar parámetros
if (!isAddress(to)) {
  throw new Error('Invalid recipient address');
}

if (value > balance) {
  throw new Error('Insufficient balance');
}

// Simular la transacción primero
try {
  await publicClient.call({
    account,
    to,
    value,
    data,
  });
} catch (err) {
  console.error('Simulation failed:', err);
  // No enviar la tx
}
```

---

## Implementación con Wagmi + Viem

### Enviar ETH

```typescript
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

function SendETH() {
  const { data: hash, sendTransaction, isPending } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const handleSend = async () => {
    sendTransaction({
      to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      value: parseEther('0.01'),
    });
  };

  return (
    <>
      <button onClick={handleSend} disabled={isPending}>
        Send 0.01 ETH
      </button>
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isSuccess && <div>Success! {hash}</div>}
    </>
  );
}
```

### Llamar a un Contrato

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi } from 'viem';

function TransferToken() {
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const handleTransfer = async () => {
    writeContract({
      address: '0xTokenAddress',
      abi: erc20Abi,
      functionName: 'transfer',
      args: ['0xRecipient', parseUnits('100', 18)],
    });
  };

  return (
    <>
      <button onClick={handleTransfer} disabled={isPending}>
        Transfer 100 Tokens
      </button>
      {isConfirming && <div>Confirming...</div>}
      {isSuccess && <div>Transferred! {hash}</div>}
    </>
  );
}
```

### Monitorear Transacción en Tiempo Real

```typescript
import { usePublicClient } from 'wagmi';
import { useEffect, useState } from 'react';

function TxMonitor({ hash }: { hash: `0x${string}` }) {
  const publicClient = usePublicClient();
  const [confirmations, setConfirmations] = useState(0);

  useEffect(() => {
    if (!hash) return;

    const checkConfirmations = async () => {
      const receipt = await publicClient.getTransactionReceipt({ hash });
      const latestBlock = await publicClient.getBlockNumber();

      if (receipt) {
        const confs = Number(latestBlock - receipt.blockNumber);
        setConfirmations(confs);
      }
    };

    const interval = setInterval(checkConfirmations, 1000);
    return () => clearInterval(interval);
  }, [hash, publicClient]);

  return <div>{confirmations} confirmaciones</div>;
}
```

---

## 🔐 Consideraciones de Seguridad

### 1. **Front-Running**

Las transacciones en el mempool son públicas. Bots pueden:
- Ver tu tx antes de ser incluida
- Copiarla con mayor gas price
- Ejecutarla antes que tú

**Mitigaciones:**
- Flashbots (private transactions)
- Commit-reveal schemes
- Slippage protection en DEX

### 2. **Replay Attacks**

Una tx válida en una red (ej. Mainnet) podría ser "replay" en otra (ej. fork).

**Protección:**
- `chainId` en la transacción (parte de EIP-155)
- Wallets modernas lo incluyen automáticamente

### 3. **Phishing de Firmas**

Usuarios pueden firmar transacciones maliciosas sin entender qué hacen.

**Protección:**
- Siempre mostrar datos decodificados al usuario
- Usar EIP-712 para datos estructurados
- Nunca firmar datos opacos

### 4. **Infinite Approvals**

```typescript
// ❌ Peligroso: Approval infinita
await writeContract({
  functionName: 'approve',
  args: [spender, maxUint256], // 2^256 - 1
});

// ✅ Mejor: Approval exacta
await writeContract({
  functionName: 'approve',
  args: [spender, parseUnits('100', 18)], // Solo lo necesario
});
```

---

## 📚 Referencias

- **EIP-1559**: [https://eips.ethereum.org/EIPS/eip-1559](https://eips.ethereum.org/EIPS/eip-1559)
- **EIP-2930**: [https://eips.ethereum.org/EIPS/eip-2930](https://eips.ethereum.org/EIPS/eip-2930)
- **Wagmi Docs**: [https://wagmi.sh/](https://wagmi.sh/)
- **Viem Docs**: [https://viem.sh/](https://viem.sh/)
- **Ethereum Yellow Paper**: [https://ethereum.github.io/yellowpaper/paper.pdf](https://ethereum.github.io/yellowpaper/paper.pdf)

---

## 🎯 Resumen

- **Transacciones** cambian el estado de la blockchain (requieren gas)
- **Type 2 (EIP-1559)** es el estándar moderno y recomendado
- **Gas** = trabajo computacional medido en unidades
- **Fees** = `gasUsed × (baseFee + priorityFee)`
- **Nonce** previene replay attacks y debe ser incremental
- **Estimar gas** antes de enviar (+ buffer del 10-20%)
- **Monitorear estado** después del broadcast
- **Manejo de errores** robusto es crítico en producción

---

**Siguiente módulo recomendado**: [Smart Contracts](./smart-contracts.md)
