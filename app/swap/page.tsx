'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'

export default function SwapPage() {
  const { address, isConnected, chain } = useAccount()
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('USDC')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)

  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: 'error', message: 'Ingresa una cantidad válida' })
      return
    }

    setStatus({ type: 'info', message: '🔄 Preparando swap... (Esta es una demostración)' })

    // Simulación de swap - En producción, aquí integrarías con Uniswap, 1inch, etc.
    setTimeout(() => {
      setStatus({
        type: 'success',
        message: `✅ Swap simulado exitosamente: ${amount} ${fromToken} → ${toToken}`
      })
    }, 2000)
  }

  const tokens = ['ETH', 'USDC', 'DAI', 'USDT', 'WETH']

  return (
    <div className="container">
      <h1>🔄 Swap Tokens</h1>

      <div className="nav">
        <Link href="/" className="nav-link">Inicio</Link>
        <Link href="/connect" className="nav-link">Conectar Wallet</Link>
        <Link href="/balances" className="nav-link">Ver Saldos</Link>
        <Link href="/swap" className="nav-link active">Swap Tokens</Link>
      </div>

      {!isConnected ? (
        <div className="card">
          <h2>Wallet no conectada</h2>
          <p style={{ color: '#718096', marginBottom: '1rem' }}>
            Debes conectar tu wallet para realizar swaps
          </p>
          <Link href="/connect">
            <button className="button">Conectar Wallet</button>
          </Link>
        </div>
      ) : (
        <div>
          <div className="card">
            <h2>Intercambiar Tokens</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568' }}>
                Desde:
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="input"
                  style={{ flex: '0 0 120px' }}
                >
                  {tokens.map(token => (
                    <option key={token} value={token}>{token}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input"
                  style={{ flex: 1 }}
                  step="0.000001"
                  min="0"
                />
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <button
                onClick={() => {
                  const temp = fromToken
                  setFromToken(toToken)
                  setToToken(temp)
                }}
                style={{
                  background: 'none',
                  border: '2px solid #e2e8f0',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                ⇅
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568' }}>
                Hacia:
              </label>
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                className="input"
                style={{ width: '120px' }}
              >
                {tokens.filter(t => t !== fromToken).map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div style={{
                background: '#edf2f7',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                  Estimado a recibir: <strong>~{(parseFloat(amount) * 0.998).toFixed(6)} {toToken}</strong>
                </p>
                <p style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.5rem' }}>
                  Tasa: 1 {fromToken} ≈ 1 {toToken} (simulado)
                </p>
              </div>
            )}

            <button
              onClick={handleSwap}
              disabled={isPending || isConfirming || !amount || parseFloat(amount) <= 0}
              className="button"
              style={{ width: '100%', fontSize: '1.1rem' }}
            >
              {isPending || isConfirming ? '⏳ Procesando...' : `Swap ${fromToken} por ${toToken}`}
            </button>

            {status && (
              <div className={status.type === 'error' ? 'error' : status.type === 'success' ? 'success' : ''}
                   style={status.type === 'info' ? { background: '#bee3f8', color: '#2c5282', padding: '1rem', borderRadius: '8px', marginTop: '1rem' } : {}}>
                {status.message}
              </div>
            )}
          </div>

          <div className="card" style={{ background: '#fff3cd', border: '2px solid #ffc107' }}>
            <h3 style={{ color: '#856404' }}>⚠️ Nota Importante</h3>
            <p style={{ color: '#856404', marginTop: '0.5rem' }}>
              Esta es una <strong>demostración</strong> de la interfaz de swap. Para funcionalidad real,
              se integraría con protocolos DEX como Uniswap, 1inch o el DEX nativo de Base.
            </p>
          </div>

          <div className="card">
            <h3>🔧 Para Integración Real:</h3>
            <ul style={{ marginLeft: '1.5rem', marginTop: '1rem', color: '#4a5568' }}>
              <li>Integrar con Uniswap V3/V4 SDK</li>
              <li>Usar 1inch API para mejores precios</li>
              <li>Implementar aprobación de tokens (approve)</li>
              <li>Agregar slippage tolerance</li>
              <li>Mostrar gas estimado</li>
              <li>Manejar errores de transacción</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
