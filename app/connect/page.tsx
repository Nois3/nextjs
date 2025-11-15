'use client'

import Link from 'next/link'
import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'

export default function ConnectPage() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()

  return (
    <div className="container">
      <h1>🔌 Conectar Wallet</h1>

      <div className="nav">
        <Link href="/" className="nav-link">Inicio</Link>
        <Link href="/connect" className="nav-link active">Conectar Wallet</Link>
        <Link href="/balances" className="nav-link">Ver Saldos</Link>
        <Link href="/swap" className="nav-link">Swap Tokens</Link>
      </div>

      <div className="card">
        <h2>Estado de Conexión</h2>

        {isConnected ? (
          <div>
            <div className="success">
              ✅ Wallet conectada exitosamente
            </div>

            <div style={{ marginTop: '2rem' }}>
              <div className="balance-item">
                <span className="balance-label">Dirección:</span>
                <span className="balance-value">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>

              {chain && (
                <div className="balance-item">
                  <span className="balance-label">Red:</span>
                  <span className="balance-value">{chain.name}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  onClick={() => open()}
                  className="button"
                >
                  Cambiar Wallet/Red
                </button>
                <button
                  onClick={() => disconnect()}
                  className="button"
                  style={{ background: '#e53e3e' }}
                >
                  Desconectar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: '#718096', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Conecta tu wallet para comenzar a usar la aplicación
            </p>

            <button
              onClick={() => open()}
              className="button"
              style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
            >
              Conectar Wallet
            </button>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f7fafc', borderRadius: '8px' }}>
              <h3 style={{ color: '#2d3748' }}>Wallets Soportadas:</h3>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem', color: '#4a5568' }}>
                <li>MetaMask</li>
                <li>Coinbase Wallet</li>
                <li>WalletConnect (cualquier wallet compatible)</li>
                <li>Rainbow Wallet</li>
                <li>Trust Wallet</li>
                <li>Y muchas más...</li>
              </ul>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#edf2f7', borderRadius: '8px' }}>
              <h3 style={{ color: '#2d3748' }}>Redes Soportadas:</h3>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem', color: '#4a5568' }}>
                <li>Ethereum Mainnet</li>
                <li>Base</li>
                <li>Polygon</li>
                <li>Arbitrum</li>
                <li>Optimism</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
