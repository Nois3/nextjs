# Uniswap V3: Protocolo DEX

## Índice
1. [¿Qué es Uniswap?](#qué-es-uniswap)
2. [Conceptos Fundamentales](#conceptos-fundamentales)
3. [Arquitectura de Uniswap V3](#arquitectura-de-uniswap-v3)
4. [Liquidez Concentrada](#liquidez-concentrada)
5. [Swaps](#swaps)
6. [Pools y Fees](#pools-y-fees)
7. [Integración con wagmi](#integración-con-wagmi)
8. [Smart Router](#smart-router)
9. [Best Practices](#best-practices)

---

## ¿Qué es Uniswap?

**Uniswap** es el DEX (Decentralized Exchange) más grande y popular en Ethereum.

**Características**:
- **Permissionless**: Cualquiera puede listar tokens
- **Non-custodial**: Tú controlas tus fondos
- **Automated Market Maker (AMM)**: No order books, usa pools de liquidez
- **Open Source**: Código auditado y verificable

### DEX vs CEX

| Característica | DEX (Uniswap) | CEX (Coinbase, Binance) |
|----------------|---------------|-------------------------|
| **Custodia** | Non-custodial (tus keys) | Custodial (exchange controla) |
| **KYC** | No requerido | Requerido |
| **Listado** | Permissionless | Centralizado |
| **Liquidez** | AMM (pools) | Order book |
| **Fees** | ~0.3% (a LPs) | ~0.1-0.5% (a exchange) |
| **Downtime** | Descentralizado (24/7) | Puede tener downtime |

---

## Conceptos Fundamentales

### Automated Market Maker (AMM)

**Problema tradicional**: Order books requieren matching de compradores/vendedores.

**Solución AMM**: Pool de liquidez con fórmula matemática.

```
Uniswap V1/V2: x * y = k (Constant Product Formula)

Ejemplo:
  Pool: 10 ETH + 20,000 USDC
  k = 10 * 20,000 = 200,000

Swap 1 ETH por USDC:
  Nuevo estado: 11 ETH + ? USDC
  11 * y = 200,000
  y = 18,181.82 USDC

Usuario recibe: 20,000 - 18,181.82 = 1,818.18 USDC (menos fees)
Precio efectivo: ~1,818 USDC por ETH
```

### Liquidity Providers (LPs)

**LPs**: Usuarios que depositan tokens en pools para ganar fees.

```
1. Alice deposita 10 ETH + 20,000 USDC en pool
2. Alice recibe LP tokens (representan su share del pool)
3. Traders hacen swaps y pagan 0.3% fee
4. Fees se acumulan en el pool (Alice gana proporcionalmente)
5. Alice puede redimir LP tokens por sus tokens + fees ganados
```

**Impermanent Loss**: Pérdida temporal cuando el precio cambia vs si hubieras mantenido los tokens.

---

## Arquitectura de Uniswap V3

### Contratos Principales

```
┌─────────────────────────────────────────┐
│         SwapRouter (0x68b3...cb2)       │  ← Usuario interactúa aquí
│  - Enruta swaps                         │
│  - Maneja multi-hop                     │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│    UniswapV3Factory (0x1F98...d48)      │
│  - Crea nuevos pools                    │
│  - Registry de pools                    │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  UniswapV3Pool (uno por par + fee)      │
│  - ETH/USDC 0.3%                        │
│  - ETH/USDC 0.05%                       │
│  - ETH/USDC 1%                          │
│  Cada pool ejecuta swaps                │
└─────────────────────────────────────────┘
```

### Direcciones en Ethereum Mainnet

```typescript
const UNISWAP_V3_ADDRESSES = {
  factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  swapRouter: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  nonfungiblePositionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'
} as const;
```

---

## Liquidez Concentrada

### Innovación de V3

**V2**: Liquidez distribuida uniformemente de 0 a ∞

**V3**: Liquidez concentrada en rangos de precio específicos

```
Ejemplo: Pool ETH/USDC

V2 LP:
  Rango: $0 - $∞
  Capital: $10,000
  Liquidez efectiva: $10,000 dispersa en todo el rango

V3 LP:
  Rango: $1,800 - $2,200 (rango actual: $2,000)
  Capital: $10,000
  Liquidez efectiva: ~4x más liquidez en ese rango
  Fees ganados: ~4x más (por misma actividad)
```

### Price Ticks

V3 divide el espacio de precios en **ticks** (incrementos discretos).

```typescript
// Cada tick representa un cambio de precio de 0.01%
tick = Math.floor(Math.log(price) / Math.log(1.0001));

// Ejemplo: ETH = $2000
// tick ≈ 69,081
```

**Fee Tiers** determinan el spacing de ticks:
- 0.01% fee → 1 tick spacing
- 0.05% fee → 10 tick spacing
- 0.3% fee → 60 tick spacing
- 1% fee → 200 tick spacing

---

## Swaps

### Exact Input Swap

**Concepto**: Usuario especifica cantidad exacta de input, recibe cantidad variable de output.

```typescript
import { useWriteContract } from 'wagmi';
import { parseAbi, parseEther } from 'viem';

const swapRouterAbi = parseAbi([
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) returns (uint256 amountOut)'
]);

export function SwapExactETHForUSDC() {
  const { writeContract } = useWriteContract();

  async function swap() {
    await writeContract({
      address: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // SwapRouter
      abi: swapRouterAbi,
      functionName: 'exactInputSingle',
      args: [{
        tokenIn: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',  // WETH
        tokenOut: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        fee: 3000, // 0.3%
        recipient: userAddress,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutos
        amountIn: parseEther('1'), // 1 ETH
        amountOutMinimum: 0, // En prod: usar cotización con slippage
        sqrtPriceLimitX96: 0 // Sin límite de precio
      }],
      value: parseEther('1') // Si es ETH nativo
    });
  }

  return <button onClick={swap}>Swap 1 ETH → USDC</button>;
}
```

### Exact Output Swap

**Concepto**: Usuario especifica cantidad exacta de output, paga cantidad variable de input.

```typescript
async function swapForExactUSDC() {
  await writeContract({
    address: SWAP_ROUTER,
    abi: swapRouterAbi,
    functionName: 'exactOutputSingle',
    args: [{
      tokenIn: WETH,
      tokenOut: USDC,
      fee: 3000,
      recipient: userAddress,
      deadline: deadline,
      amountOut: parseUnits('2000', 6), // Quiero exactamente 2000 USDC
      amountInMaximum: parseEther('2'), // Dispuesto a pagar máximo 2 ETH
      sqrtPriceLimitX96: 0
    }]
  });
}
```

### Multi-Hop Swaps

**Concepto**: Swap a través de múltiples pools (path).

```typescript
// Swap DAI → USDC → WETH
// (No hay pool directo DAI/WETH con buena liquidez)

const path = encodePacked(
  ['address', 'uint24', 'address', 'uint24', 'address'],
  [
    DAI,    // tokenIn
    3000,   // fee (DAI → USDC pool)
    USDC,   // intermediario
    3000,   // fee (USDC → WETH pool)
    WETH    // tokenOut
  ]
);

await writeContract({
  address: SWAP_ROUTER,
  abi: swapRouterAbi,
  functionName: 'exactInput',
  args: [{
    path,
    recipient: userAddress,
    deadline,
    amountIn: parseEther('1000'), // 1000 DAI
    amountOutMinimum: 0
  }]
});
```

---

## Pools y Fees

### Fee Tiers

Uniswap V3 tiene 4 fee tiers:

| Fee Tier | Uso Típico | Ejemplos |
|----------|------------|----------|
| **0.01%** | Stablecoins | USDC/USDT, DAI/USDC |
| **0.05%** | Tokens muy correlacionados | ETH/stETH, WBTC/renBTC |
| **0.3%** | Tokens estándar (más común) | ETH/USDC, ETH/DAI |
| **1%** | Tokens exóticos/volátiles | Nuevos tokens, low liquidity |

### Crear Pool

```solidity
// Si pool no existe
IUniswapV3Factory factory = IUniswapV3Factory(FACTORY_ADDRESS);

address pool = factory.createPool(
    tokenA,
    tokenB,
    3000 // fee tier (0.3%)
);

// Inicializar precio
IUniswapV3Pool(pool).initialize(
    sqrtPriceX96 // precio inicial en formato Q64.96
);
```

### Consultar Pools Existentes

```typescript
import { useReadContract } from 'wagmi';

const { data: poolAddress } = useReadContract({
  address: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Factory
  abi: parseAbi(['function getPool(address, address, uint24) view returns (address)']),
  functionName: 'getPool',
  args: [WETH, USDC, 3000] // token0, token1, fee
});
```

---

## Integración con wagmi

### Cotización (Quote)

Antes de hacer swap, obtener cotización:

```typescript
import { useReadContract } from 'wagmi';
import { parseAbi, parseEther, formatUnits } from 'viem';

const quoterAbi = parseAbi([
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) view returns (uint256 amountOut)'
]);

export function useSwapQuote(amountIn: bigint) {
  const { data: amountOut } = useReadContract({
    address: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6', // Quoter
    abi: quoterAbi,
    functionName: 'quoteExactInputSingle',
    args: [
      WETH,
      USDC,
      3000, // 0.3% fee
      amountIn,
      0 // sin límite de precio
    ],
    query: {
      enabled: amountIn > 0n
    }
  });

  return {
    amountOut,
    price: amountOut ? Number(formatUnits(amountOut, 6)) / Number(formatEther(amountIn)) : 0
  };
}
```

### Slippage Protection

```typescript
function calculateMinimumOut(amountOut: bigint, slippageBps: number): bigint {
  // slippageBps = 50 → 0.5%
  const slippageFactor = 10000n - BigInt(slippageBps);
  return (amountOut * slippageFactor) / 10000n;
}

// Ejemplo: Cotización dice 2000 USDC, con 0.5% slippage
const quote = 2000_000000n; // 2000 USDC (6 decimals)
const minOut = calculateMinimumOut(quote, 50); // 1990 USDC

await swap({
  amountOutMinimum: minOut // Rechazar si recibo menos de 1990 USDC
});
```

### Aprobar Token

Antes de swap, aprobar SwapRouter:

```typescript
import { useWriteContract, useReadContract } from 'wagmi';
import { maxUint256 } from 'viem';

export function useTokenApproval(tokenAddress: `0x${string}`, spender: `0x${string}`) {
  const { data: allowance } = useReadContract({
    address: tokenAddress,
    abi: parseAbi(['function allowance(address, address) view returns (uint256)']),
    functionName: 'allowance',
    args: [userAddress, spender]
  });

  const { writeContract: approve } = useWriteContract();

  async function approveIfNeeded(amount: bigint) {
    if (!allowance || allowance < amount) {
      await approve({
        address: tokenAddress,
        abi: parseAbi(['function approve(address, uint256) returns (bool)']),
        functionName: 'approve',
        args: [spender, maxUint256] // Aprobación infinita (gas efficient)
      });
    }
  }

  return { allowance, approveIfNeeded };
}
```

---

## Smart Router

### SDK de Uniswap

Para swaps complejos, usar el SDK oficial:

```typescript
import { AlphaRouter } from '@uniswap/smart-order-router';
import { CurrencyAmount, TradeType, Token } from '@uniswap/sdk-core';

const router = new AlphaRouter({
  chainId: 1,
  provider: publicClient // tu provider
});

// Encontrar mejor ruta (puede ser multi-hop, multi-pool)
const route = await router.route(
  CurrencyAmount.fromRawAmount(
    WETH,
    parseEther('1').toString()
  ),
  USDC,
  TradeType.EXACT_INPUT,
  {
    recipient: userAddress,
    slippageTolerance: new Percent(50, 10000), // 0.5%
    deadline: Math.floor(Date.now() / 1000) + 1800
  }
);

if (route) {
  // route.methodParameters contiene la calldata para ejecutar
  await walletClient.sendTransaction({
    to: SWAP_ROUTER,
    data: route.methodParameters.calldata,
    value: route.methodParameters.value
  });
}
```

---

## Best Practices

### Seguridad

```typescript
// ✅ SIEMPRE usar deadline
const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 min

// ✅ SIEMPRE usar slippage protection
const minOut = quote * 99n / 100n; // 1% slippage máximo

// ✅ Verificar allowance antes de swap
if (allowance < amountIn) {
  await approve();
}

// ❌ NUNCA amountOutMinimum = 0 en producción (MEV bot te front-runneará)
// ❌ NUNCA deadline muy lejano (riesgo si tx queda pending)
```

### Gas Optimization

```typescript
// ✅ Usar exactInput en lugar de exactOutput (más barato)
// ✅ Approval infinita (una vez) vs aprobar cada vez
await approve(spender, maxUint256);

// ✅ Batch approvals si es posible
// ✅ Preferir single-hop sobre multi-hop cuando sea posible
```

### UX

```typescript
// ✅ Mostrar cotización antes de ejecutar
const quote = await getQuote(amountIn);
console.log(`Recibirás aproximadamente ${formatUnits(quote, 6)} USDC`);

// ✅ Mostrar precio de impacto
const priceImpact = calculatePriceImpact(amountIn, amountOut, spotPrice);
if (priceImpact > 5) {
  alert('⚠️ High price impact! Consider smaller amount.');
}

// ✅ Mostrar fees estimados
const fee = amountIn * 3n / 1000n; // 0.3% fee
```

---

## Recursos

- [Uniswap V3 Whitepaper](https://uniswap.org/whitepaper-v3.pdf)
- [Uniswap V3 SDK](https://docs.uniswap.org/sdk/v3/overview)
- [Smart Order Router](https://github.com/Uniswap/smart-order-router)
- [Uniswap Interface (código fuente)](https://github.com/Uniswap/interface)
- [V3 Core](https://github.com/Uniswap/v3-core)
- [V3 Periphery](https://github.com/Uniswap/v3-periphery)

---

## Siguiente Paso

Continúa con [ENS](./ens.md) para integrar resolución de nombres descentralizados.
