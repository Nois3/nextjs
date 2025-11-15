'use client'

import Link from 'next/link'
import { useAccount, useDisconnect } from 'wagmi'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <div className="container">
      <h1>🔗 Wallet Tester</h1>

      <div className="nav">
        <Link href="/" className="nav-link active">Inicio</Link>
        <Link href="/connect" className="nav-link">Conectar Wallet</Link>
        <Link href="/balances" className="nav-link">Ver Saldos</Link>
        <Link href="/swap" className="nav-link">Swap Tokens</Link>
        <Link href="/farcaster" className="nav-link">Farcaster</Link>
        <Link href="/base" className="nav-link">Base</Link>
      </div>

      <div className="card">
        <h2>Bienvenido a Wallet Tester</h2>
        <p style={{ marginBottom: '1.5rem', color: '#4a5568', fontSize: '1.1rem' }}>
          Una aplicación para probar conexiones de wallet, ver saldos y realizar swaps.
        </p>

        {isConnected ? (
          <div>
            <div className="success">
              ✅ Wallet conectada: {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <button
              onClick={() => disconnect()}
              className="button"
              style={{ marginTop: '1rem' }}
            >
              Desconectar Wallet
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: '#718096', marginBottom: '1rem' }}>
              No tienes ninguna wallet conectada
            </p>
            <Link href="/connect">
              <button className="button">
                Conectar Wallet
              </button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-3">
        <div className="card">
          <h3>🔌 Conectar</h3>
          <p style={{ color: '#718096', marginBottom: '1rem' }}>
            Conecta tu wallet usando WalletConnect, MetaMask, Coinbase Wallet y más.
          </p>
          <Link href="/connect">
            <button className="button">Ir a Conectar</button>
          </Link>
        </div>

        <div className="card">
          <h3>💰 Saldos</h3>
          <p style={{ color: '#718096', marginBottom: '1rem' }}>
            Visualiza tus saldos de ETH y tokens ERC-20 en múltiples redes.
          </p>
          <Link href="/balances">
            <button className="button">Ver Saldos</button>
          </Link>
        </div>

        <div className="card">
          <h3>🔄 Swap</h3>
          <p style={{ color: '#718096', marginBottom: '1rem' }}>
            Intercambia tokens directamente desde la aplicación.
          </p>
          <Link href="/swap">
            <button className="button">Hacer Swap</button>
          </Link>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h3>🟣 Farcaster</h3>
          <p style={{ color: '#718096', marginBottom: '1rem' }}>
            Integración con el protocolo social descentralizado de Farcaster.
          </p>
          <Link href="/farcaster">
            <button className="button" style={{ background: '#8B5CF6' }}>Explorar Farcaster</button>
          </Link>
        </div>

        <div className="card">
          <h3>🔵 Base Network</h3>
          <p style={{ color: '#718096', marginBottom: '1rem' }}>
            Información y herramientas para la L2 de Coinbase.
          </p>
          <Link href="/base">
            <button className="button" style={{ background: '#0052FF' }}>Explorar Base</button>
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>🔧 Tecnologías Integradas</h3>
        <div className="grid grid-2" style={{ marginTop: '1rem' }}>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>WalletConnect</h4>
            <p style={{ color: '#718096', fontSize: '0.95rem' }}>
              Conexión universal a wallets con Web3Modal
            </p>
          </div>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Base (Coinbase)</h4>
            <p style={{ color: '#718096', fontSize: '0.95rem' }}>
              Integración con OnchainKit para Base network
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
