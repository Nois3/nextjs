'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseAbi, parseEther, parseUnits, formatUnits, formatEther } from 'viem';
import { mainnet } from 'wagmi/chains';

/**
 * MÓDULO EDUCATIVO: Swap de Tokens con Uniswap V3
 *
 * Este módulo enseña:
 * 1. Cómo funcionan los DEX (Uniswap, 1inch, etc.)
 * 2. Cotización de swaps (Quoter)
 * 3. Slippage protection
 * 4. Approvals de tokens
 * 5. Ejecución de swaps con SwapRouter
 *
 * Ver documentación: /docs/protocols/uniswap.md
 *
 * NOTA: Este es un módulo educativo. Los swaps están deshabilitados
 * para evitar pérdida de fondos. El código muestra la implementación real.
 */

// Direcciones de Uniswap V3 en Ethereum Mainnet
const UNISWAP_V3_ADDRESSES = {
  quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  swapRouter: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
} as const;

// Tokens conocidos en Ethereum Mainnet
const TOKENS = {
  WETH: {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    symbol: 'WETH'
  },
  USDC: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    symbol: 'USDC'
  },
  DAI: {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    symbol: 'DAI'
  },
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    symbol: 'USDT'
  }
} as const;

const quoterAbi = parseAbi([
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)',
  'function quoteExactInput(bytes path, uint256 amountIn) external returns (uint256 amountOut)'
]);

const erc20Abi = parseAbi([
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)'
]);

export default function SwapPage() {
  const { address, isConnected, chain } = useAccount();
  const [fromToken, setFromToken] = useState<keyof typeof TOKENS>('WETH');
  const [toToken, setToToken] = useState<keyof typeof TOKENS>('USDC');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5'); // 0.5% por defecto
  const [quote, setQuote] = useState<bigint | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);

  // Obtener quote (solo para educación, Quoter es view en mainnet)
  // En producción usarías un RPC call estático o SDK
  const fromTokenInfo = TOKENS[fromToken];
  const toTokenInfo = TOKENS[toToken];
  const amountInWei = amount ? parseUnits(amount, fromTokenInfo.decimals) : 0n;

  // Simular cotización (en producción, usarías el Quoter real)
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      // Simulación de precio (1 ETH ≈ 2000 USDC, etc.)
      const mockPrices: Record<string, Record<string, number>> = {
        WETH: { USDC: 2000, DAI: 2000, USDT: 2000 },
        USDC: { WETH: 0.0005, DAI: 1, USDT: 1 },
        DAI: { WETH: 0.0005, USDC: 1, USDT: 1 },
        USDT: { WETH: 0.0005, USDC: 1, DAI: 1 }
      };

      const rate = mockPrices[fromToken]?.[toToken] || 1;
      const outputAmount = parseFloat(amount) * rate * 0.997; // 0.3% fee
      const quoteWei = parseUnits(outputAmount.toFixed(toTokenInfo.decimals), toTokenInfo.decimals);
      setQuote(quoteWei);
    } else {
      setQuote(null);
    }
  }, [amount, fromToken, toToken, fromTokenInfo.decimals, toTokenInfo.decimals]);

  // Calcular minimum output con slippage
  const minimumOut = quote && slippage
    ? (quote * BigInt(Math.floor((100 - parseFloat(slippage)) * 100))) / 10000n
    : 0n;

  const tokens = Object.keys(TOKENS) as Array<keyof typeof TOKENS>;

  // Calcular precio e impacto
  const price = quote && amountInWei > 0n
    ? Number(formatUnits(quote, toTokenInfo.decimals)) / Number(formatUnits(amountInWei, fromTokenInfo.decimals))
    : 0;

  const priceImpact = 0.1; // Simulado (en prod, calcularías contra spot price)

  function handleSwapClick() {
    setStatus({
      type: 'warning',
      message: '⚠️ Swaps están deshabilitados en modo educativo. Ver código en /app/swap/page.tsx para implementación completa.'
    });
  }

  if (!isConnected) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>🔄 Swap de Tokens</h1>
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white',
          marginTop: '2rem'
        }}>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            ⚠️ Conecta tu wallet para explorar swaps
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🔄 Swap de Tokens (Uniswap V3)</h1>
      <p style={{ fontSize: '1rem', color: '#666', marginBottom: '2rem' }}>
        Aprende cómo funcionan los DEX y los swaps de tokens.
        <br />
        📚 <a href="/docs/protocols/uniswap.md" style={{ color: '#667eea' }}>Ver documentación completa</a>
      </p>

      {status && (
        <div style={{
          padding: '1rem',
          background: status.type === 'error' ? '#fee' : status.type === 'success' ? '#efe' : status.type === 'warning' ? '#fff3cd' : '#e7f3ff',
          border: `1px solid ${status.type === 'error' ? '#fcc' : status.type === 'success' ? '#cfc' : status.type === 'warning' ? '#ffc107' : '#90cdf4'}`,
          borderRadius: '8px',
          color: status.type === 'error' ? '#c33' : status.type === 'success' ? '#3c3' : status.type === 'warning' ? '#856404' : '#2c5282',
          marginBottom: '1.5rem'
        }}>
          {status.message}
        </div>
      )}

      {/* Swap Interface */}
      <section style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* From Token */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            Desde
          </label>
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                outline: 'none'
              }}
              step="0.000001"
              min="0"
            />
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value as keyof typeof TOKENS)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                background: 'white'
              }}
            >
              {tokens.map(token => (
                <option key={token} value={token}>{TOKENS[token].symbol}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Arrow */}
        <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
          <button
            onClick={() => {
              const temp = fromToken;
              setFromToken(toToken);
              setToToken(temp);
            }}
            style={{
              background: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              transition: 'all 0.2s'
            }}
          >
            ⬇
          </button>
        </div>

        {/* To Token */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            Hacia
          </label>
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
              {quote ? formatUnits(quote, toTokenInfo.decimals) : '0.0'}
            </div>
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value as keyof typeof TOKENS)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                background: 'white'
              }}
            >
              {tokens.filter(t => t !== fromToken).map(token => (
                <option key={token} value={token}>{TOKENS[token].symbol}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Detalles del Swap */}
        {quote && (
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Precio:</span>
              <span style={{ fontWeight: 'bold' }}>1 {fromToken} = {price.toFixed(4)} {toToken}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Slippage Tolerance:</span>
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                style={{
                  width: '60px',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  textAlign: 'right'
                }}
                step="0.1"
                min="0.1"
                max="50"
              />
              <span style={{ fontWeight: 'bold', marginLeft: '0.25rem' }}>%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Minimum Received:</span>
              <span style={{ fontWeight: 'bold' }}>{formatUnits(minimumOut, toTokenInfo.decimals)} {toToken}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Fee (0.3%):</span>
              <span style={{ fontWeight: 'bold' }}>~{(Number(formatUnits(amountInWei, fromTokenInfo.decimals)) * 0.003).toFixed(6)} {fromToken}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Price Impact:</span>
              <span style={{ fontWeight: 'bold', color: priceImpact > 5 ? '#c33' : '#3c3' }}>~{priceImpact.toFixed(2)}%</span>
            </div>
          </div>
        )}

        <button
          onClick={handleSwapClick}
          disabled={!amount || parseFloat(amount) <= 0}
          style={{
            width: '100%',
            padding: '1rem',
            background: !amount || parseFloat(amount) <= 0 ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: !amount || parseFloat(amount) <= 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Ver Código de Implementación
        </button>
      </section>

      {/* Código de Ejemplo */}
      <section style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3>💻 Código de Implementación Real</h3>
        <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '1rem' }}>
          Así es como ejecutarías este swap en producción con Uniswap V3:
        </p>
        <pre style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '1rem',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '0.85rem',
          lineHeight: '1.5'
        }}>
{`// 1. Aprobar tokens
await writeContract({
  address: '${fromTokenInfo.address}',
  abi: erc20Abi,
  functionName: 'approve',
  args: ['${UNISWAP_V3_ADDRESSES.swapRouter}', ${amountInWei.toString()}n]
});

// 2. Ejecutar swap
await writeContract({
  address: '${UNISWAP_V3_ADDRESSES.swapRouter}',
  abi: swapRouterAbi,
  functionName: 'exactInputSingle',
  args: [{
    tokenIn: '${fromTokenInfo.address}',
    tokenOut: '${toTokenInfo.address}',
    fee: 3000, // 0.3%
    recipient: address,
    deadline: Math.floor(Date.now() / 1000) + 1200,
    amountIn: ${amountInWei.toString()}n,
    amountOutMinimum: ${minimumOut.toString()}n,
    sqrtPriceLimitX96: 0
  }]
});`}
        </pre>
      </section>

      {/* Conceptos Educativos */}
      <section style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3>📚 Conceptos Clave</h3>
        <ul style={{ lineHeight: '1.8', color: '#666', marginTop: '1rem' }}>
          <li><strong>AMM (Automated Market Maker)</strong>: Uniswap usa la fórmula x * y = k para determinar precios</li>
          <li><strong>Liquidity Pools</strong>: Fondos aportados por LPs que permiten los swaps</li>
          <li><strong>Slippage</strong>: Diferencia entre precio esperado y precio real de ejecución</li>
          <li><strong>Price Impact</strong>: Cómo tu trade afecta el precio del pool</li>
          <li><strong>Fees</strong>: 0.3% va a los Liquidity Providers en pools estándar</li>
          <li><strong>Concentrated Liquidity</strong>: Innovación de V3 para mayor capital efficiency</li>
        </ul>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#e7f3ff', borderRadius: '8px' }}>
          <strong>💡 Tip:</strong> Siempre verifica la cotización, slippage, y price impact antes de ejecutar un swap.
          En swaps grandes, considera dividirlos en múltiples transacciones para reducir price impact.
        </div>
      </section>
    </div>
  );
}
