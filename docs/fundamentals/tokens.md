# 💰 Tokens ERC-20

> **Guía completa del estándar ERC-20: el token fungible más usado en Ethereum**

## 📖 Tabla de Contenidos

- [¿Qué es ERC-20?](#qué-es-erc-20)
- [Historia y Motivación](#historia-y-motivación)
- [Especificación ERC-20](#especificación-erc-20)
- [Funciones Obligatorias](#funciones-obligatorias)
- [Funciones Opcionales](#funciones-opcionales)
- [Eventos](#eventos)
- [Decimales y Unidades](#decimales-y-unidades)
- [Approvals y Allowances](#approvals-y-allowances)
- [Casos de Uso](#casos-de-uso)
- [Implementación con Wagmi + Viem](#implementación-con-wagmi--viem)
- [Patrones Avanzados](#patrones-avanzados)
- [Vulnerabilidades Comunes](#vulnerabilidades-comunes)
- [Best Practices](#best-practices)

---

## ¿Qué es ERC-20?

**ERC-20** (Ethereum Request for Comments 20) es el estándar para **tokens fungibles** en Ethereum.

### Características

- ✅ **Fungible**: Cada token es idéntico e intercambiable (como dinero)
- ✅ **Estandarizado**: Todos los tokens ERC-20 comparten la misma interfaz
- ✅ **Interoperable**: Funciona con cualquier wallet, exchange, o dApp
- ✅ **Divisible**: Se puede enviar fracciones (ej. 0.5 tokens)

### Ejemplos de Tokens ERC-20

| Token | Símbolo | Uso |
|-------|---------|-----|
| **USDC** | USDC | Stablecoin (1 USDC = $1 USD) |
| **DAI** | DAI | Stablecoin descentralizada |
| **UNI** | UNI | Governance token de Uniswap |
| **LINK** | LINK | Oracle services (Chainlink) |
| **USDT** | USDT | Stablecoin (Tether) |

---

## Historia y Motivación

### Antes de ERC-20

Cada proyecto implementaba tokens de forma diferente:

```solidity
// Proyecto A
contract TokenA {
    function sendTokens(address to, uint amount) { ... }
}

// Proyecto B
contract TokenB {
    function transferCoins(address recipient, uint value) { ... }
}
```

**Problemas:**
- Wallets debían soportar cada token individualmente
- Exchanges necesitaban integración custom por token
- No había estándar → fragmentación del ecosistema

### Después de ERC-20 (Nov 2015)

Fabian Vogelsteller y Vitalik Buterin propusieron **EIP-20**:

```solidity
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    // ... más funciones estándar
}
```

**Ventajas:**
- ✅ Interfaz única para todos los tokens
- ✅ Wallets soportan todos los ERC-20 automáticamente
- ✅ DEX pueden listar cualquier token sin cambios
- ✅ Ecosistema interoperable

---

## Especificación ERC-20

La interfaz completa de ERC-20:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    // Funciones obligatorias
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    // Eventos obligatorios
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

### ABI de ERC-20 (Viem)

```typescript
import { erc20Abi } from 'viem';

// Viem incluye el ABI completo de ERC-20
console.log(erc20Abi);
```

---

## Funciones Obligatorias

### 1. `totalSupply()`

Retorna el supply total del token.

```solidity
function totalSupply() external view returns (uint256);
```

**Ejemplo:**
```typescript
const totalSupply = await publicClient.readContract({
  address: '0xUSDC',
  abi: erc20Abi,
  functionName: 'totalSupply',
});

console.log(totalSupply); // 1000000000000n (1 trillion con 6 decimales)
```

**Uso:**
- Saber cuántos tokens existen
- Calcular marketcap: `totalSupply × precio`
- Verificar deflación/inflación

---

### 2. `balanceOf(address account)`

Retorna el balance de una cuenta.

```solidity
function balanceOf(address account) external view returns (uint256);
```

**Ejemplo:**
```typescript
const balance = await publicClient.readContract({
  address: '0xUSDC',
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: ['0xUserAddress'],
});

console.log(formatUnits(balance, 6)); // "1000.50" (USDC usa 6 decimales)
```

**Uso:**
- Mostrar balance en wallets
- Verificar fondos suficientes antes de transferir
- Tracking de holdings

---

### 3. `transfer(address to, uint256 amount)`

Transfiere tokens del remitente (`msg.sender`) al destinatario.

```solidity
function transfer(address to, uint256 amount) external returns (bool);
```

**Ejemplo:**
```typescript
const { writeContract } = useWriteContract();

await writeContract({
  address: '0xUSDC',
  abi: erc20Abi,
  functionName: 'transfer',
  args: ['0xRecipient', parseUnits('100', 6)], // 100 USDC
});
```

**Comportamiento:**
- Resta `amount` del balance del sender
- Suma `amount` al balance del recipient
- Emite evento `Transfer(from, to, amount)`
- Retorna `true` si tuvo éxito (o revierte)

**Validaciones típicas:**
```solidity
require(balanceOf[msg.sender] >= amount, "Insufficient balance");
require(to != address(0), "Cannot transfer to zero address");
```

---

### 4. `allowance(address owner, address spender)`

Retorna cuántos tokens puede gastar `spender` en nombre de `owner`.

```solidity
function allowance(address owner, address spender) external view returns (uint256);
```

**Ejemplo:**
```typescript
const allowance = await publicClient.readContract({
  address: '0xUSDC',
  abi: erc20Abi,
  functionName: 'allowance',
  args: [
    '0xOwnerAddress',
    '0xUniswapRouter', // Contrato que puede gastar
  ],
});

console.log(allowance); // 1000000000000n (si ya dio approval)
```

**Uso:**
- Verificar si un contrato puede gastar tus tokens
- Ver approvals existentes antes de hacer otra

---

### 5. `approve(address spender, uint256 amount)`

Permite que `spender` gaste hasta `amount` de tus tokens.

```solidity
function approve(address spender, uint256 amount) external returns (bool);
```

**Ejemplo:**
```typescript
// Dar permiso a Uniswap para gastar 1000 USDC
await writeContract({
  address: '0xUSDC',
  abi: erc20Abi,
  functionName: 'approve',
  args: [
    '0xUniswapRouter',
    parseUnits('1000', 6), // 1000 USDC
  ],
});
```

**Comportamiento:**
- Setea `allowances[msg.sender][spender] = amount`
- Emite evento `Approval(owner, spender, amount)`
- No transfiere tokens (solo da permiso)

**⚠️ Seguridad:**
```typescript
// ❌ Peligroso: Approval infinita
approve(spender, 2n ** 256n - 1n); // Riesgo si el contrato es hackeado

// ✅ Mejor: Approval exacta
approve(spender, parseUnits('100', 18)); // Solo lo necesario
```

---

### 6. `transferFrom(address from, address to, uint256 amount)`

Transfiere tokens **en nombre de** `from` (requiere approval previo).

```solidity
function transferFrom(address from, address to, uint256 amount) external returns (bool);
```

**Ejemplo:**
```typescript
// Uniswap llamando transferFrom después de que aprobaste
await writeContract({
  address: '0xUSDC',
  abi: erc20Abi,
  functionName: 'transferFrom',
  args: [
    '0xUserAddress', // De quién se toman los tokens
    '0xUniswapPool',  // A dónde van
    parseUnits('100', 6), // Cantidad
  ],
});
```

**Comportamiento:**
```solidity
function transferFrom(address from, address to, uint256 amount) public returns (bool) {
    // 1. Verificar allowance
    require(allowances[from][msg.sender] >= amount, "Insufficient allowance");

    // 2. Decrementar allowance
    allowances[from][msg.sender] -= amount;

    // 3. Transferir
    balances[from] -= amount;
    balances[to] += amount;

    emit Transfer(from, to, amount);
    return true;
}
```

**Flujo típico:**
1. Usuario hace `approve(Uniswap, 1000 USDC)`
2. Usuario llama a `swap()` en Uniswap
3. Uniswap llama a `transferFrom(usuario, pool, 1000 USDC)`
4. Tokens se transfieren del usuario al pool

---

## Funciones Opcionales

No son requeridas por el estándar, pero casi todos los tokens las implementan:

### 1. `name()`

```solidity
function name() external view returns (string);
```

```typescript
const name = await publicClient.readContract({
  address: '0xUSDC',
  abi: erc20Abi,
  functionName: 'name',
});

console.log(name); // "USD Coin"
```

---

### 2. `symbol()`

```solidity
function symbol() external view returns (string);
```

```typescript
const symbol = await publicClient.readContract({
  address: '0xUSDC',
  abi: erc20Abi,
  functionName: 'symbol',
});

console.log(symbol); // "USDC"
```

---

### 3. `decimals()`

Número de decimales del token (típicamente 18, pero puede variar).

```solidity
function decimals() external view returns (uint8);
```

```typescript
const decimals = await publicClient.readContract({
  address: '0xUSDC',
  abi: erc20Abi,
  functionName: 'decimals',
});

console.log(decimals); // 6 (USDC usa 6 decimales, no 18)
```

**¿Por qué es importante?**

```typescript
// Sin decimales: ❌
const balance = 1000000n; // ¿Es 1 USDC o 1 millón?

// Con decimales: ✅
const balance = 1000000n; // 1.0 USDC (6 decimales)
const formatted = formatUnits(balance, 6); // "1.0"
```

---

## Eventos

### 1. `Transfer`

Emitido cuando tokens son transferidos.

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```

**Casos:**
- `transfer()`: `emit Transfer(msg.sender, to, amount)`
- `transferFrom()`: `emit Transfer(from, to, amount)`
- Mint: `emit Transfer(address(0), to, amount)`
- Burn: `emit Transfer(from, address(0), amount)`

**Escuchar transferencias:**
```typescript
useWatchContractEvent({
  address: '0xUSDC',
  abi: erc20Abi,
  eventName: 'Transfer',
  args: {
    to: '0xMyAddress', // Solo cuando recibo
  },
  onLogs(logs) {
    console.log('¡Recibiste tokens!', logs);
  },
});
```

---

### 2. `Approval`

Emitido cuando se da un approval.

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value);
```

**Escuchar approvals:**
```typescript
useWatchContractEvent({
  address: '0xUSDC',
  abi: erc20Abi,
  eventName: 'Approval',
  args: {
    owner: '0xMyAddress',
  },
  onLogs(logs) {
    logs.forEach((log) => {
      console.log(`Aprobaste ${log.args.value} para ${log.args.spender}`);
    });
  },
});
```

---

## Decimales y Unidades

### ¿Por Qué Decimales?

Solidity no soporta decimales nativamente (no hay `float` o `double`).

**Solución:** Usar **enteros** con **decimales implícitos**.

```
1.5 USDC = 1500000 (unidades internas, 6 decimales)
100 DAI = 100000000000000000000 (18 decimales)
```

### Ejemplos por Token

| Token | Decimales | 1 Token (interno) | Humano |
|-------|-----------|-------------------|--------|
| **USDC** | 6 | 1000000 | "1.0" |
| **DAI** | 18 | 1000000000000000000 | "1.0" |
| **WBTC** | 8 | 100000000 | "1.0" |
| **USDT** | 6 | 1000000 | "1.0" |

### Conversión con Viem

```typescript
import { parseUnits, formatUnits } from 'viem';

// Humano → Internal (para enviar al contrato)
const amount = parseUnits('100.5', 6); // 100500000n (USDC)

// Internal → Humano (para mostrar)
const formatted = formatUnits(100500000n, 6); // "100.5"
```

### Operaciones con Decimales

```typescript
// Sumar tokens
const balance1 = parseUnits('10.5', 18);
const balance2 = parseUnits('5.3', 18);
const total = balance1 + balance2; // Suma de bigints

console.log(formatUnits(total, 18)); // "15.8"

// Multiplicar (cuidado con overflow)
const price = parseUnits('1.5', 18); // $1.5 por token
const quantity = parseUnits('10', 18); // 10 tokens

// ❌ Incorrecto: price * quantity (se duplican decimales)
const wrong = price * quantity; // 15 * 10^36

// ✅ Correcto: Dividir por 10^18 después
const correct = (price * quantity) / parseUnits('1', 18); // 15 * 10^18
console.log(formatUnits(correct, 18)); // "15.0"
```

---

## Approvals y Allowances

### ¿Por Qué Existen?

Permiten que **contratos gasten tus tokens** sin que tengas que enviarlos primero.

### Flujo Típico (Uniswap Swap)

```typescript
// Paso 1: Usuario aprueba a Uniswap
await writeContract({
  address: '0xUSDC',
  abi: erc20Abi,
  functionName: 'approve',
  args: ['0xUniswapRouter', parseUnits('100', 6)],
});

// Paso 2: Usuario llama a swap
await writeContract({
  address: '0xUniswapRouter',
  abi: uniswapAbi,
  functionName: 'swapExactTokensForTokens',
  args: [
    parseUnits('100', 6), // USDC in
    minAmountOut,
    [USDC, DAI],
    userAddress,
    deadline,
  ],
});

// Internamente, Uniswap hace:
// USDC.transferFrom(user, pool, 100 USDC)
```

### Verificar Approval Antes de Operar

```typescript
function useTokenApproval(token: Address, spender: Address, amount: bigint) {
  const { data: allowance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [userAddress, spender],
  });

  const needsApproval = allowance ? allowance < amount : true;

  return { needsApproval, allowance };
}

// Uso
const { needsApproval } = useTokenApproval(USDC, UniswapRouter, amountToSwap);

if (needsApproval) {
  // Mostrar botón de "Approve"
  return <ApproveButton />;
}

// Mostrar botón de "Swap"
return <SwapButton />;
```

### Revocar Approvals

```typescript
// Setear allowance a 0
await writeContract({
  address: '0xUSDC',
  abi: erc20Abi,
  functionName: 'approve',
  args: ['0xSpender', 0n], // 0 = revocar
});
```

**Herramientas:**
- [Revoke.cash](https://revoke.cash/) - Revocar approvals de forma visual
- [Etherscan Token Approvals](https://etherscan.io/tokenapprovalchecker)

---

## Casos de Uso

### 1. **Stablecoins** (USDC, DAI, USDT)

Tokens anclados a monedas fiat ($1 USD).

```typescript
// Enviar $100 USDC
await writeContract({
  address: USDC_ADDRESS,
  abi: erc20Abi,
  functionName: 'transfer',
  args: ['0xRecipient', parseUnits('100', 6)],
});
```

### 2. **Governance Tokens** (UNI, COMP, AAVE)

Permiten votar en decisiones del protocolo.

```typescript
// Votar en una propuesta (requiere balance de UNI)
const balance = await readContract({
  address: UNI_ADDRESS,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [voterAddress],
});

if (balance > MIN_VOTING_POWER) {
  // Puede votar
}
```

### 3. **Wrapped Tokens** (WETH, WBTC)

Versión ERC-20 de activos nativos (ETH, BTC).

```typescript
// Depositar ETH → Obtener WETH
await writeContract({
  address: WETH_ADDRESS,
  abi: wethAbi,
  functionName: 'deposit',
  value: parseEther('1'), // Enviar 1 ETH
});

// Ahora tienes 1 WETH (ERC-20)
```

### 4. **Reward Tokens** (LP tokens, yield farming)

Tokens que representan staking o liquidez.

```typescript
// Stake USDC en Aave, recibir aUSDC
const balance = await readContract({
  address: A_USDC_ADDRESS,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [userAddress],
});

// aUSDC acumula interés automáticamente
```

---

## Implementación con Wagmi + Viem

### Dashboard Completo de Tokens

```typescript
import { useReadContracts, useWriteContract } from 'wagmi';
import { erc20Abi, formatUnits, parseUnits } from 'viem';

function TokenDashboard({ tokens, account }: Props) {
  // Leer múltiples tokens en paralelo
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

  if (!data) return <div>Cargando...</div>;

  // Agrupar resultados por token
  const tokenData = [];
  for (let i = 0; i < tokens.length; i++) {
    const [name, symbol, decimals, balance] = data.slice(i * 4, (i + 1) * 4);

    tokenData.push({
      address: tokens[i],
      name: name.result,
      symbol: symbol.result,
      decimals: decimals.result,
      balance: balance.result,
    });
  }

  return (
    <div>
      {tokenData.map((token) => (
        <div key={token.address}>
          <h3>{token.name} ({token.symbol})</h3>
          <p>
            Balance: {formatUnits(token.balance || 0n, token.decimals || 18)}
          </p>
        </div>
      ))}
    </div>
  );
}
```

### Transferir Tokens

```typescript
function TransferToken({ token, decimals }: Props) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const { writeContract, isPending, isSuccess } = useWriteContract();

  const handleTransfer = () => {
    if (!isAddress(recipient)) {
      alert('Dirección inválida');
      return;
    }

    writeContract({
      address: token,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipient, parseUnits(amount, decimals)],
    });
  };

  return (
    <div>
      <input
        placeholder="Destinatario"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        placeholder="Cantidad"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleTransfer} disabled={isPending}>
        {isPending ? 'Enviando...' : 'Transferir'}
      </button>
      {isSuccess && <div>✅ Transferencia exitosa!</div>}
    </div>
  );
}
```

### Approval con Verificación

```typescript
function ApproveToken({ token, spender, amountNeeded }: Props) {
  const { address: account } = useAccount();

  // Verificar allowance actual
  const { data: currentAllowance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'allowance',
    args: account && spender ? [account, spender] : undefined,
  });

  const needsApproval = currentAllowance
    ? currentAllowance < amountNeeded
    : true;

  const { writeContract, isPending } = useWriteContract();

  const handleApprove = () => {
    writeContract({
      address: token,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, amountNeeded],
    });
  };

  if (!needsApproval) {
    return <div>✅ Ya tienes approval suficiente</div>;
  }

  return (
    <button onClick={handleApprove} disabled={isPending}>
      {isPending ? 'Aprobando...' : 'Aprobar Token'}
    </button>
  );
}
```

---

## Patrones Avanzados

### 1. **Permit (EIP-2612)**

Approval sin gastar gas (firma off-chain).

```typescript
import { useSignTypedData } from 'wagmi';

// En lugar de approve() on-chain, firmar off-chain
const { signTypedData } = useSignTypedData();

const domain = {
  name: 'USD Coin',
  version: '2',
  chainId: 1,
  verifyingContract: USDC_ADDRESS,
};

const types = {
  Permit: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

const message = {
  owner: account,
  spender: UNISWAP_ROUTER,
  value: parseUnits('100', 6),
  nonce: 0,
  deadline: Math.floor(Date.now() / 1000) + 3600,
};

signTypedData({ domain, types, message });

// El spender luego llama a permit() con la firma
```

### 2. **Flash Minting** (Algunos tokens)

Mintear temporalmente para arbitraje.

```solidity
// DAI soporta flash minting
contract FlashBorrower {
    function executeFlashMint(uint256 amount) external {
        // 1. Mintea DAI temporalmente
        DAI.flashMint(address(this), amount, "");

        // 2. Usa el DAI (arbitraje, liquidación, etc.)
        // ...

        // 3. Devuelve el DAI + fee
        DAI.transfer(DAI_ADDRESS, amount + fee);
    }
}
```

### 3. **Token Recovery**

Recuperar tokens enviados accidentalmente a un contrato.

```solidity
// Función de emergencia (solo owner)
function recoverERC20(address token, uint256 amount) external onlyOwner {
    IERC20(token).transfer(owner(), amount);
}
```

---

## Vulnerabilidades Comunes

### 1. **Race Condition en approve()**

**Problema:**
```typescript
// Alice aprueba 100
approve(Bob, 100);

// Luego quiere cambiar a 50
approve(Bob, 50);

// Bob ve ambas txs en mempool y puede:
// 1. Gastar los 100 primero
// 2. Luego gastar los 50 nuevos
// Total: 150 (en lugar de 50)
```

**Solución:**
```typescript
// Setear a 0 primero, luego al nuevo valor
approve(Bob, 0);
approve(Bob, 50);

// O usar increaseAllowance/decreaseAllowance (si está disponible)
```

### 2. **Missing Return Value Check**

Algunos tokens (USDT) no retornan `bool` en `transfer()`.

```solidity
// ❌ Puede fallar silenciosamente
token.transfer(recipient, amount);

// ✅ Usar SafeERC20 (OpenZeppelin)
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20;
token.safeTransfer(recipient, amount);
```

### 3. **Reentrancy via Callbacks**

Tokens con hooks (ERC-777) pueden causar reentrancy.

```solidity
// Token ERC-777 llama a callback antes de transferir
function _transfer(address from, address to, uint256 amount) internal {
    _callTokensToSend(from, to, amount); // ← Callback (puede hacer reentrancy)
    balances[from] -= amount;
    balances[to] += amount;
}
```

**Protección:**
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MyContract is ReentrancyGuard {
    function withdraw() external nonReentrant {
        // Protegido contra reentrancy
    }
}
```

### 4. **Infinite Approvals**

```typescript
// ❌ Riesgo: Si el contrato es hackeado, pueden robar todo
approve(contract, 2n ** 256n - 1n);

// ✅ Mejor: Solo lo necesario
approve(contract, exactAmount);
```

---

## Best Practices

### 1. **Siempre Leer Decimales**

```typescript
// ✅ Leer decimales del token
const decimals = await readContract({
  address: token,
  abi: erc20Abi,
  functionName: 'decimals',
});

const amount = parseUnits('100', decimals);

// ❌ Asumir 18 decimales (puede ser incorrecto)
const bad = parseUnits('100', 18); // USDC usa 6
```

### 2. **Validar Direcciones**

```typescript
import { isAddress } from 'viem';

// ✅ Validar antes de transferir
if (!isAddress(recipient)) {
  throw new Error('Dirección inválida');
}
```

### 3. **Manejo de Errores**

```typescript
try {
  await writeContract({ ... });
} catch (err) {
  if (err.message.includes('Insufficient balance')) {
    alert('No tienes suficientes tokens');
  } else if (err.message.includes('Insufficient allowance')) {
    alert('Necesitas aprobar primero');
  } else {
    alert('Error: ' + err.message);
  }
}
```

### 4. **Usar SafeERC20 en Contratos**

```solidity
// ✅ SafeERC20 maneja tokens no conformes
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20;

token.safeTransfer(recipient, amount);
token.safeTransferFrom(sender, recipient, amount);
```

### 5. **Multicall para Múltiples Tokens**

```typescript
// ✅ Leer múltiples balances en 1 llamada
const { data } = useReadContracts({
  contracts: tokens.map((token) => ({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account],
  })),
});

// ❌ Evitar múltiples llamadas separadas
for (const token of tokens) {
  await readContract({ ... }); // Lento
}
```

---

## 🔐 Consideraciones de Seguridad

1. **Nunca confíes en tokens no verificados**
   - Verifica el contrato en Etherscan
   - Lee el código si es posible

2. **Limita approvals**
   - Solo aprueba lo necesario
   - Revoca approvals innecesarias

3. **Verifica transferencias**
   - Espera confirmación antes de considerar completado
   - Monitorea eventos `Transfer`

4. **Cuidado con fee-on-transfer tokens**
   - Algunos tokens cobran fee en cada transfer
   - Verifica el balance después de transferir

5. **Protección contra phishing**
   - Siempre verifica la dirección del token
   - Usa listas de tokens confiables (Uniswap, CoinGecko)

---

## 📚 Referencias

- **EIP-20**: [https://eips.ethereum.org/EIPS/eip-20](https://eips.ethereum.org/EIPS/eip-20)
- **EIP-2612 (Permit)**: [https://eips.ethereum.org/EIPS/eip-2612](https://eips.ethereum.org/EIPS/eip-2612)
- **OpenZeppelin ERC20**: [https://docs.openzeppelin.com/contracts/erc20](https://docs.openzeppelin.com/contracts/erc20)
- **Viem ERC-20**: [https://viem.sh/docs/contract/readContract](https://viem.sh/docs/contract/readContract)

---

## 🎯 Resumen

- **ERC-20** es el estándar de tokens fungibles en Ethereum
- **6 funciones obligatorias**: totalSupply, balanceOf, transfer, approve, allowance, transferFrom
- **Decimales** permiten representar fracciones (ej. 0.5 tokens)
- **Approvals** permiten que contratos gasten tus tokens
- **Eventos** (`Transfer`, `Approval`) rastrean actividad
- **Type safety** con TypeScript + Viem es fundamental
- **Siempre leer decimales** del token (no asumir 18)
- **Limitar approvals** para mayor seguridad

---

**Siguiente módulo recomendado**: [NFTs (ERC-721 & ERC-1155)](./nfts.md)
