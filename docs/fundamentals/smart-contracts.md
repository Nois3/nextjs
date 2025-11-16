# 📜 Smart Contracts en Ethereum

> **Guía completa sobre smart contracts: ABI, llamadas read/write, eventos, logs, y patrones de interacción**

## 📖 Tabla de Contenidos

- [¿Qué es un Smart Contract?](#qué-es-un-smart-contract)
- [Anatomía de un Smart Contract](#anatomía-de-un-smart-contract)
- [ABI (Application Binary Interface)](#abi-application-binary-interface)
- [Tipos de Llamadas](#tipos-de-llamadas)
- [Read Operations (View Functions)](#read-operations-view-functions)
- [Write Operations (State-Changing)](#write-operations-state-changing)
- [Eventos y Logs](#eventos-y-logs)
- [Estimación de Gas](#estimación-de-gas)
- [Manejo de Errores](#manejo-de-errores)
- [Patrones Avanzados](#patrones-avanzados)
- [Best Practices](#best-practices)
- [Implementación con Wagmi + Viem](#implementación-con-wagmi--viem)

---

## ¿Qué es un Smart Contract?

Un **smart contract** es un programa que se ejecuta en la blockchain de Ethereum. Es código inmutable y determinista que:

- ✅ Se ejecuta exactamente como fue programado (sin intermediarios)
- ✅ Es transparente y verificable (cualquiera puede auditarlo)
- ✅ Es inmutable (no puede ser modificado una vez desplegado*)
- ✅ Es trustless (no requieres confiar en una entidad central)

*Excepto si implementa patrones de upgradability (proxies)

### Diferencias con Programas Tradicionales

| Aspecto | Programa Tradicional | Smart Contract |
|---------|---------------------|----------------|
| **Ejecución** | Servidor centralizado | Blockchain descentralizada |
| **Estado** | Base de datos mutable | Blockchain inmutable |
| **Costo** | Infraestructura fija | Gas por ejecución |
| **Confianza** | Debes confiar en el proveedor | Trustless (código es ley) |
| **Reversibilidad** | Puede revertirse | Permanente (salvo bugs) |
| **Transparencia** | Código privado | Código público (verificado) |

---

## Anatomía de un Smart Contract

### Ejemplo: Contrato ERC-20 Simplificado

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToken {
    // Estado (storage)
    mapping(address => uint256) public balances;
    uint256 public totalSupply;
    string public name = "SimpleToken";
    string public symbol = "STKN";

    // Eventos
    event Transfer(address indexed from, address indexed to, uint256 amount);

    // Constructor (se ejecuta al desplegar)
    constructor(uint256 initialSupply) {
        totalSupply = initialSupply;
        balances[msg.sender] = initialSupply;
    }

    // Función de lectura (view)
    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    // Función de escritura (state-changing)
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
```

### Componentes Clave

#### 1. **State Variables** (Storage)
```solidity
mapping(address => uint256) public balances;
uint256 public totalSupply;
```
- Almacenadas permanentemente en la blockchain
- Modificarlas cuesta gas
- Públicas o privadas (visibilidad)

#### 2. **Functions**
```solidity
function transfer(address to, uint256 amount) public returns (bool) { ... }
```
- **view**: Solo lee estado (sin costo de gas)
- **pure**: No lee ni modifica estado
- **payable**: Puede recibir ETH
- **sin modificador**: Cambia estado (requiere tx + gas)

#### 3. **Events**
```solidity
event Transfer(address indexed from, address indexed to, uint256 amount);
```
- Logs almacenados en la blockchain
- Más baratos que storage
- Indexables para búsquedas eficientes
- No accesibles desde contratos (solo off-chain)

#### 4. **Modifiers**
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}

function withdraw() public onlyOwner { ... }
```
- Reutilización de lógica de validación
- Control de acceso
- Pre/post condiciones

---

## ABI (Application Binary Interface)

El **ABI** es el contrato entre tu aplicación y el smart contract. Define:
- Qué funciones existen
- Qué parámetros aceptan (tipos)
- Qué valores retornan
- Qué eventos emite

### Estructura del ABI

```typescript
const erc20Abi = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false }
    ]
  }
] as const;
```

### ¿De Dónde Viene el ABI?

1. **Compilación**: Al compilar Solidity, el compilador genera el ABI
2. **Etherscan**: Contratos verificados publican su ABI
3. **Wagmi CLI**: Puede generar ABIs tipados desde Etherscan

### Type Safety con Viem

```typescript
import { erc20Abi } from 'viem';

// ✅ TypeScript sabe exactamente qué funciones existen
const balance = await publicClient.readContract({
  address: '0x...',
  abi: erc20Abi,
  functionName: 'balanceOf', // Autocompletado
  args: ['0xAddress'], // Tipado fuerte
});

// ❌ Error de TypeScript si usas función inexistente
const result = await publicClient.readContract({
  address: '0x...',
  abi: erc20Abi,
  functionName: 'nonExistentFunction', // ❌ Error
});
```

---

## Tipos de Llamadas

### 1. **eth_call** (Lectura - Gratis)
- Simula ejecución localmente
- No crea transacción
- No cuesta gas
- Para funciones `view` o `pure`

### 2. **eth_sendTransaction** (Escritura - Cuesta Gas)
- Crea una transacción real
- Modifica el estado de la blockchain
- Requiere firma de wallet
- Cuesta gas

### Comparación

| Aspecto | eth_call (Read) | eth_sendTransaction (Write) |
|---------|-----------------|----------------------------|
| **Costo** | Gratis | Cuesta gas |
| **Transacción** | No | Sí |
| **Modifica estado** | No | Sí |
| **Requiere firma** | No | Sí |
| **Retorna valor** | Inmediatamente | Después de confirmar |
| **Ejemplo** | `balanceOf()` | `transfer()` |

---

## Read Operations (View Functions)

Funciones que solo leen el estado sin modificarlo.

### Llamadas Simples

```typescript
import { useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';

function TokenBalance({ token, account }: Props) {
  const { data: balance, isLoading, error } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account],
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Balance: {balance?.toString()}</div>;
}
```

### Llamadas Múltiples (Multicall)

```typescript
import { useReadContracts } from 'wagmi';
import { erc20Abi } from 'viem';

function TokenInfo({ token }: Props) {
  const { data, isLoading } = useReadContracts({
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
        functionName: 'totalSupply',
      },
    ],
  });

  if (isLoading) return <div>Cargando...</div>;

  const [name, symbol, totalSupply] = data || [];

  return (
    <div>
      <div>Nombre: {name?.result}</div>
      <div>Símbolo: {symbol?.result}</div>
      <div>Supply: {totalSupply?.result?.toString()}</div>
    </div>
  );
}
```

### Con Viem (Cliente Directo)

```typescript
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { erc20Abi } from 'viem';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const balance = await client.readContract({
  address: '0xTokenAddress',
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: ['0xUserAddress'],
});

console.log(balance); // bigint
```

### Polling (Actualizaciones en Tiempo Real)

```typescript
const { data: balance } = useReadContract({
  address: token,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [account],
  // Actualizar cada 10 segundos
  query: {
    refetchInterval: 10_000,
  },
});
```

---

## Write Operations (State-Changing)

Funciones que modifican el estado de la blockchain.

### Transferir Tokens (ERC-20)

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi, parseUnits } from 'viem';

function TransferToken() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const handleTransfer = async () => {
    writeContract({
      address: '0xTokenAddress',
      abi: erc20Abi,
      functionName: 'transfer',
      args: [
        '0xRecipientAddress',
        parseUnits('100', 18), // 100 tokens (18 decimales)
      ],
    });
  };

  return (
    <>
      <button onClick={handleTransfer} disabled={isPending}>
        {isPending ? 'Confirmando...' : 'Transferir 100 Tokens'}
      </button>

      {isConfirming && <div>⏳ Esperando confirmación...</div>}
      {isSuccess && <div>✅ Transferencia exitosa! Hash: {hash}</div>}
      {error && <div>❌ Error: {error.message}</div>}
    </>
  );
}
```

### Approve (Dar Permiso a otro Contrato)

```typescript
function ApproveToken() {
  const { writeContract } = useWriteContract();

  const handleApprove = () => {
    writeContract({
      address: '0xTokenAddress',
      abi: erc20Abi,
      functionName: 'approve',
      args: [
        '0xSpenderAddress', // Contrato que podrá gastar tus tokens
        parseUnits('1000', 18), // Cantidad permitida
      ],
    });
  };

  return <button onClick={handleApprove}>Aprobar 1000 Tokens</button>;
}
```

### Con Viem (Wallet Client)

```typescript
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

// Usando la wallet del navegador (MetaMask, etc.)
const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum),
});

const hash = await walletClient.writeContract({
  address: '0xTokenAddress',
  abi: erc20Abi,
  functionName: 'transfer',
  args: ['0xRecipient', parseUnits('50', 18)],
  account: '0xYourAddress',
});

console.log('Transaction hash:', hash);
```

### Funciones Payable (Enviar ETH)

```typescript
const { writeContract } = useWriteContract();

// Contrato que acepta ETH
const nftAbi = [
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'payable',
    inputs: [{ name: 'quantity', type: 'uint256' }],
    outputs: [],
  },
] as const;

const handleMint = () => {
  writeContract({
    address: '0xNFTContract',
    abi: nftAbi,
    functionName: 'mint',
    args: [1n], // Cantidad a mintear
    value: parseEther('0.08'), // Enviar 0.08 ETH
  });
};
```

---

## Eventos y Logs

Los eventos son la forma más eficiente de rastrear actividad on-chain.

### ¿Por Qué Eventos?

- ✅ **Más baratos** que storage (5 gas vs 20,000 gas)
- ✅ **Indexables** (puedes buscar por parámetros indexados)
- ✅ **Históricos** (permanecen en la blockchain)
- ❌ **No accesibles desde contratos** (solo off-chain)

### Definición en Solidity

```solidity
// Hasta 3 parámetros pueden ser 'indexed'
event Transfer(
    address indexed from,
    address indexed to,
    uint256 amount  // No indexado
);

emit Transfer(msg.sender, recipient, 100);
```

### Escuchar Eventos con Wagmi

```typescript
import { useWatchContractEvent } from 'wagmi';
import { erc20Abi } from 'viem';

function TransferListener({ token }: Props) {
  useWatchContractEvent({
    address: token,
    abi: erc20Abi,
    eventName: 'Transfer',
    onLogs(logs) {
      logs.forEach((log) => {
        console.log('Transfer:', {
          from: log.args.from,
          to: log.args.to,
          amount: log.args.amount?.toString(),
        });
      });
    },
  });

  return <div>Escuchando transferencias...</div>;
}
```

### Filtrar Eventos por Parámetros

```typescript
// Solo transferencias desde una dirección específica
useWatchContractEvent({
  address: token,
  abi: erc20Abi,
  eventName: 'Transfer',
  args: {
    from: '0xSpecificAddress', // Solo de esta dirección
  },
  onLogs(logs) {
    console.log('Transfer from specific address:', logs);
  },
});
```

### Obtener Eventos Históricos

```typescript
import { useContractEvent, usePublicClient } from 'wagmi';

function HistoricalTransfers({ token }: Props) {
  const publicClient = usePublicClient();

  const fetchTransfers = async () => {
    const logs = await publicClient.getContractEvents({
      address: token,
      abi: erc20Abi,
      eventName: 'Transfer',
      fromBlock: 18000000n,
      toBlock: 18001000n,
    });

    console.log('Transferencias históricas:', logs);
  };

  return <button onClick={fetchTransfers}>Obtener Transferencias</button>;
}
```

### Logs Brutos (Sin ABI)

```typescript
const logs = await publicClient.getLogs({
  address: '0xContractAddress',
  fromBlock: 18000000n,
  toBlock: 'latest',
  // Filtro por topic (Transfer event signature)
  event: {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { type: 'address', indexed: true, name: 'from' },
      { type: 'address', indexed: true, name: 'to' },
      { type: 'uint256', indexed: false, name: 'amount' },
    ],
  },
});
```

---

## Estimación de Gas

Siempre estima el gas antes de enviar una write operation.

### Estimación Automática (Wagmi)

```typescript
import { useSimulateContract } from 'wagmi';

function TransferWithEstimate() {
  // Simula la transacción y estima gas
  const { data: simulateData } = useSimulateContract({
    address: '0xToken',
    abi: erc20Abi,
    functionName: 'transfer',
    args: ['0xRecipient', parseUnits('100', 18)],
  });

  const { writeContract } = useWriteContract();

  const handleTransfer = () => {
    // Usa la request pre-simulada
    writeContract(simulateData!.request);
  };

  return <button onClick={handleTransfer}>Transferir</button>;
}
```

### Estimación Manual

```typescript
const gasEstimate = await publicClient.estimateContractGas({
  address: '0xToken',
  abi: erc20Abi,
  functionName: 'transfer',
  args: ['0xRecipient', parseUnits('100', 18)],
  account: '0xYourAddress',
});

console.log('Gas estimado:', gasEstimate); // bigint

// Agregar buffer del 20%
const gasLimit = (gasEstimate * 120n) / 100n;
```

---

## Manejo de Errores

### Tipos de Errores Comunes

#### 1. **Revert en el Contrato**
```solidity
require(balance >= amount, "Insufficient balance");
```

```typescript
// Error capturado en el cliente
try {
  await writeContract({ ... });
} catch (err) {
  // "Execution reverted: Insufficient balance"
  console.error(err.message);
}
```

#### 2. **Out of Gas**
```
Error: Transaction ran out of gas
```
**Solución**: Aumentar `gasLimit`

#### 3. **Función No Existe**
```
Error: Function "nonExistent" not found on ABI
```
**Solución**: Verificar que la función existe en el ABI

#### 4. **Parámetros Incorrectos**
```
Error: Invalid argument: expected address, got string
```
**Solución**: Verificar tipos en TypeScript

### Manejo Robusto

```typescript
import { useWriteContract } from 'wagmi';
import { BaseError, ContractFunctionRevertedError } from 'viem';

function RobustTransfer() {
  const { writeContract, error } = useWriteContract();

  const handleTransfer = async () => {
    try {
      await writeContract({
        address: '0xToken',
        abi: erc20Abi,
        functionName: 'transfer',
        args: ['0xRecipient', parseUnits('100', 18)],
      });
    } catch (err) {
      if (err instanceof BaseError) {
        const revertError = err.walk(
          (err) => err instanceof ContractFunctionRevertedError
        );

        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName;
          console.error('Revert reason:', errorName);
        }
      }
    }
  };

  return (
    <>
      <button onClick={handleTransfer}>Transferir</button>
      {error && <div>Error: {error.message}</div>}
    </>
  );
}
```

---

## Patrones Avanzados

### 1. **Multicall** (Múltiples Llamadas en 1 TX)

```typescript
import { useWriteContract } from 'wagmi';

// ABI del Multicall3 contract
const multicall3Abi = [...];

const { writeContract } = useWriteContract();

// Ejecutar múltiples calls en una sola tx
writeContract({
  address: '0xMulticall3Address',
  abi: multicall3Abi,
  functionName: 'aggregate3',
  args: [
    [
      {
        target: '0xToken1',
        callData: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'transfer',
          args: ['0xRecipient', parseUnits('10', 18)],
        }),
      },
      {
        target: '0xToken2',
        callData: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'transfer',
          args: ['0xRecipient', parseUnits('20', 18)],
        }),
      },
    ],
  ],
});
```

### 2. **Simulación Antes de Ejecutar**

```typescript
// Simular primero (sin gastar gas)
const { data: simulateResult, error: simulateError } = useSimulateContract({
  address: '0xContract',
  abi: myAbi,
  functionName: 'complexFunction',
  args: [...],
});

if (simulateError) {
  console.error('La transacción fallaría:', simulateError);
  // No ejecutar
  return;
}

// Si la simulación es exitosa, ejecutar
writeContract(simulateResult.request);
```

### 3. **Verificar Allowance Antes de Transfer**

```typescript
function SafeTransferFrom() {
  const { data: allowance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner, spender],
  });

  const needsApproval = allowance && allowance < amountToTransfer;

  if (needsApproval) {
    // Primero hacer approve
    return <ApproveButton />;
  }

  // Luego hacer transferFrom
  return <TransferFromButton />;
}
```

---

## Best Practices

### 1. **Type Safety con `as const`**

```typescript
// ✅ ABI con type safety
const myAbi = [
  {
    type: 'function',
    name: 'transfer',
    inputs: [...],
    outputs: [...],
  },
] as const; // ← Importante

// ❌ Sin 'as const' pierdes type safety
const badAbi = [{ type: 'function', ... }]; // type: any[]
```

### 2. **Usar `useSimulateContract` Antes de `useWriteContract`**

```typescript
// ✅ Simular + Escribir
const { data } = useSimulateContract({ ... });
const { writeContract } = useWriteContract();
writeContract(data!.request);

// ❌ Escribir directamente (puede fallar)
writeContract({ ... });
```

### 3. **Manejo de Decimales**

```typescript
import { parseUnits, formatUnits } from 'viem';

// ✅ Convertir a unidades del token
const amount = parseUnits('100', 18); // bigint

// ✅ Mostrar al usuario
const readable = formatUnits(amount, 18); // "100"

// ❌ Usar números directamente
const bad = 100; // ❌ Incorrecto (perderías 18 ceros)
```

### 4. **Verificar Contratos en Etherscan**

```typescript
// Solo interactuar con contratos verificados
const isVerified = await fetch(
  `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}`
);

if (!isVerified) {
  console.warn('⚠️ Contrato no verificado - proceder con precaución');
}
```

### 5. **Rate Limiting de RPC**

```typescript
import { createPublicClient, http, fallback } from 'viem';

const client = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http('https://primary-rpc.com'),
    http('https://backup-rpc.com'),
    http('https://public-rpc.com'),
  ]),
});
```

---

## Implementación con Wagmi + Viem

### Hook Completo: Leer + Escribir + Eventos

```typescript
import {
  useReadContract,
  useWriteContract,
  useWatchContractEvent,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { erc20Abi, parseUnits } from 'viem';

function TokenInteraction({ token, account }: Props) {
  // Leer balance
  const { data: balance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account],
  });

  // Escribir (transfer)
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  // Escuchar eventos
  useWatchContractEvent({
    address: token,
    abi: erc20Abi,
    eventName: 'Transfer',
    args: { to: account },
    onLogs(logs) {
      console.log('¡Token recibido!', logs);
    },
  });

  const handleTransfer = () => {
    writeContract({
      address: token,
      abi: erc20Abi,
      functionName: 'transfer',
      args: ['0xRecipient', parseUnits('10', 18)],
    });
  };

  return (
    <div>
      <div>Balance: {balance?.toString()}</div>
      <button onClick={handleTransfer} disabled={isPending}>
        {isPending ? 'Enviando...' : 'Transferir 10 Tokens'}
      </button>
      {isConfirming && <div>⏳ Confirmando...</div>}
      {isSuccess && <div>✅ Éxito! {hash}</div>}
    </div>
  );
}
```

---

## 🔐 Consideraciones de Seguridad

### 1. **Validar Direcciones**

```typescript
import { isAddress } from 'viem';

// ✅ Validar antes de enviar
if (!isAddress(recipientAddress)) {
  throw new Error('Dirección inválida');
}
```

### 2. **Approvals Limitadas**

```typescript
// ❌ Peligroso: Approval infinita
approve(spender, 2n ** 256n - 1n);

// ✅ Mejor: Approval exacta
approve(spender, parseUnits('100', 18));
```

### 3. **Reentrancy Awareness**

Los contratos pueden ser vulnerables a reentrancy si llaman a contratos externos.

```solidity
// ❌ Vulnerable
function withdraw() public {
    uint amount = balances[msg.sender];
    (bool success, ) = msg.sender.call{value: amount}(""); // ← Reentrancy aquí
    balances[msg.sender] = 0; // Muy tarde
}

// ✅ Protegido (Checks-Effects-Interactions)
function withdraw() public {
    uint amount = balances[msg.sender];
    balances[msg.sender] = 0; // Primero actualizar estado
    (bool success, ) = msg.sender.call{value: amount}("");
}
```

### 4. **Slippage Protection (DEX)**

```typescript
// Para swaps en DEX
const minAmountOut = expectedAmount * 95n / 100n; // 5% slippage máximo

swap({
  amountIn,
  amountOutMinimum: minAmountOut, // Protección
});
```

---

## 📚 Referencias

- **Solidity Docs**: [https://docs.soliditylang.org/](https://docs.soliditylang.org/)
- **Wagmi Docs**: [https://wagmi.sh/](https://wagmi.sh/)
- **Viem Docs**: [https://viem.sh/](https://viem.sh/)
- **Ethereum Contract ABI Spec**: [https://docs.soliditylang.org/en/latest/abi-spec.html](https://docs.soliditylang.org/en/latest/abi-spec.html)
- **OpenZeppelin Contracts**: [https://docs.openzeppelin.com/contracts/](https://docs.openzeppelin.com/contracts/)

---

## 🎯 Resumen

- **Smart contracts** son programas inmutables en la blockchain
- **ABI** define la interfaz del contrato (funciones, eventos, tipos)
- **Read calls** (`view`/`pure`) son gratis y no modifican estado
- **Write calls** requieren transacciones y cuestan gas
- **Eventos** son la forma eficiente de rastrear actividad on-chain
- **Type safety** con TypeScript + Viem es fundamental
- **Simular antes de ejecutar** previene errores costosos
- **Seguridad** es crítica: validar inputs, limitar approvals, entender reentrancy

---

**Siguiente módulo recomendado**: [Tokens (ERC-20)](./tokens.md)
