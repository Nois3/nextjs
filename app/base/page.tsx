'use client'

import Link from 'next/link'
import { useBase, BaseNetworkIndicator, BaseAppRegistration } from '@/contexts/BaseContext'
import { useAccount, useSwitchChain } from 'wagmi'
import { base } from 'wagmi/chains'

export default function BasePage() {
  const { isOnBase } = useBase()
  const { isConnected } = useAccount()
  const { switchChain } = useSwitchChain()

  return (
    <div className="container">
      <h1>🔵 Base Network</h1>

      <div className="nav">
        <Link href="/" className="nav-link">Inicio</Link>
        <Link href="/connect" className="nav-link">Conectar Wallet</Link>
        <Link href="/balances" className="nav-link">Ver Saldos</Link>
        <Link href="/swap" className="nav-link">Swap Tokens</Link>
        <Link href="/farcaster" className="nav-link">Farcaster</Link>
        <Link href="/base" className="nav-link active">Base</Link>
      </div>

      {!isConnected ? (
        <div className="card">
          <h2>Wallet no conectada</h2>
          <p style={{ color: '#718096', marginBottom: '1rem' }}>
            Conecta tu wallet para interactuar con Base
          </p>
          <Link href="/connect">
            <button className="button">Conectar Wallet</button>
          </Link>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>Estado de la Red</h2>
            <BaseNetworkIndicator />

            {!isOnBase && (
              <button
                onClick={() => switchChain({ chainId: base.id })}
                className="button"
                style={{ marginTop: '1rem' }}
              >
                Cambiar a Base
              </button>
            )}
          </div>

          <BaseAppRegistration />

          <div className="card">
            <h2>📊 Información de Base</h2>
            <div className="balance-item">
              <span className="balance-label">Chain ID:</span>
              <span className="balance-value">{base.id}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Nombre:</span>
              <span className="balance-value">{base.name}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Moneda Nativa:</span>
              <span className="balance-value">{base.nativeCurrency.symbol}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">RPC URL:</span>
              <span style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
                {base.rpcUrls.default.http[0]}
              </span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Block Explorer:</span>
              <span>
                <a
                  href={base.blockExplorers?.default.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#667eea', textDecoration: 'underline' }}
                >
                  {base.blockExplorers?.default.name}
                </a>
              </span>
            </div>
          </div>
        </>
      )}

      <div className="card" style={{ background: '#f0f9ff', border: '2px solid #0ea5e9' }}>
        <h3 style={{ color: '#0369a1' }}>🔵 ¿Qué es Base?</h3>
        <p style={{ color: '#075985', marginTop: '0.75rem' }}>
          Base es una red de capa 2 (L2) construida por Coinbase usando el stack de Optimism.
          Ofrece transacciones rápidas y económicas mientras mantiene la seguridad de Ethereum.
        </p>
        <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
          <div>
            <h4 style={{ color: '#0284c7', marginBottom: '0.5rem' }}>✨ Ventajas</h4>
            <ul style={{ marginLeft: '1.5rem', color: '#075985' }}>
              <li>Tarifas de gas muy bajas</li>
              <li>Transacciones rápidas</li>
              <li>Compatible con Ethereum</li>
              <li>Integrado con Coinbase</li>
              <li>Ecosistema en crecimiento</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#0284c7', marginBottom: '0.5rem' }}>🛠️ Características</h4>
            <ul style={{ marginLeft: '1.5rem', color: '#075985' }}>
              <li>EVM compatible</li>
              <li>Optimistic Rollup</li>
              <li>OnchainKit para desarrolladores</li>
              <li>Puentes nativos</li>
              <li>NFTs y DeFi</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>🔗 Recursos Útiles</h3>
        <div className="grid grid-2" style={{ marginTop: '1rem' }}>
          <a
            href="https://base.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px', textAlign: 'center', fontWeight: 600, color: '#667eea' }}
          >
            🌐 Base.org
          </a>
          <a
            href="https://docs.base.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px', textAlign: 'center', fontWeight: 600, color: '#667eea' }}
          >
            📚 Documentación
          </a>
          <a
            href="https://bridge.base.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px', textAlign: 'center', fontWeight: 600, color: '#667eea' }}
          >
            🌉 Bridge
          </a>
          <a
            href={base.blockExplorers?.default.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px', textAlign: 'center', fontWeight: 600, color: '#667eea' }}
          >
            🔍 Block Explorer
          </a>
        </div>
      </div>

      <div className="card" style={{ background: '#e6f7ff', border: '2px solid #1890ff' }}>
        <h3 style={{ color: '#0050b3' }}>💡 OnchainKit</h3>
        <p style={{ color: '#003a8c', marginTop: '0.75rem' }}>
          Esta aplicación utiliza <strong>OnchainKit</strong> de Coinbase, un conjunto de herramientas
          React para construir aplicaciones on-chain de clase mundial en Base.
        </p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '1rem', color: '#003a8c' }}>
          <li>Componentes UI preconstruidos</li>
          <li>Integración con Base Name Service</li>
          <li>Gestión de identidad on-chain</li>
          <li>Componentes de transacciones</li>
        </ul>
      </div>
    </div>
  )
}
