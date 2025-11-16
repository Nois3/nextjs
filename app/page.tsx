'use client';

import Link from 'next/link';
import { useAccount, useDisconnect } from 'wagmi';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="container">
      <h1>📚 Web3 Learning Hub</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
        Recurso educativo completo de Web3 para desarrolladores senior.
        Aprende desde conceptos fundamentales hasta integraciones avanzadas con protocolos DeFi.
      </p>

      <div className="nav">
        <Link href="/" className="nav-link active">Inicio</Link>
        <Link href="/connect" className="nav-link">Conectar Wallet</Link>
        <Link href="/balances" className="nav-link">Ver Saldos</Link>
        <Link href="/swap" className="nav-link">Swap Tokens</Link>
        <Link href="/signing" className="nav-link">Firma de Mensajes</Link>
        <Link href="/nfts" className="nav-link">NFTs</Link>
        <Link href="/farcaster" className="nav-link">Farcaster</Link>
        <Link href="/base" className="nav-link">Base</Link>
        <Link href="/security" className="nav-link">Seguridad</Link>
      </div>

      {isConnected && (
        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, color: 'white' }}>✅ Wallet Conectada</h3>
              <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
                {address?.slice(0, 10)}...{address?.slice(-8)}
              </p>
            </div>
            <button
              onClick={() => disconnect()}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Desconectar
            </button>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="card">
          <h2>🔌 Comienza Conectando Tu Wallet</h2>
          <p style={{ color: '#718096', marginBottom: '1rem' }}>
            Para interactuar con los módulos educativos, primero conecta tu wallet
          </p>
          <Link href="/connect">
            <button className="button">Conectar Wallet</button>
          </Link>
        </div>
      )}

      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>🎓 Módulos Educativos</h2>

      <div className="grid grid-3">
        <div className="card">
          <h3>🔐 Firma de Mensajes</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            <strong>EIP-191 & EIP-712:</strong> Aprende sobre firma de mensajes, Sign-In with Ethereum (SIWE), y verificación.
          </p>
          <Link href="/signing">
            <button className="button">Explorar →</button>
          </Link>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#999' }}>
            📄 Docs: <code>/docs/fundamentals/signing.md</code>
          </div>
        </div>

        <div className="card">
          <h3>🖼️ NFTs</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            <strong>ERC-721 & ERC-1155:</strong> Tokens no fungibles, metadata, IPFS, y cómo funcionan los marketplaces.
          </p>
          <Link href="/nfts">
            <button className="button">Explorar →</button>
          </Link>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#999' }}>
            📄 Docs: <code>/docs/fundamentals/nfts.md</code>
          </div>
        </div>

        <div className="card">
          <h3>🔄 Swaps & DEX</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            <strong>Uniswap V3:</strong> AMM, liquidez concentrada, slippage protection, y swaps de tokens.
          </p>
          <Link href="/swap">
            <button className="button">Explorar →</button>
          </Link>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#999' }}>
            📄 Docs: <code>/docs/protocols/uniswap.md</code>
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>🔧 Conceptos Fundamentales</h2>

      <div className="grid grid-3">
        <div className="card">
          <h3>👛 Wallets & Conexión</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Tipos de wallets, WalletConnect protocol, custodia, y mejores prácticas.
          </p>
          <Link href="/connect">
            <button className="button">Ver Módulo →</button>
          </Link>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#999' }}>
            📄 Docs: <code>/docs/fundamentals/wallets.md</code>
          </div>
        </div>

        <div className="card">
          <h3>💰 Tokens & Balances</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            ERC-20 tokens, lectura de smart contracts, decimals, y consulta de saldos.
          </p>
          <Link href="/balances">
            <button className="button">Ver Módulo →</button>
          </Link>
        </div>

        <div className="card">
          <h3>⛓️ Redes & L2s</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Ethereum, Base, Polygon, Arbitrum, Optimism. Diferencias y cuándo usar cada una.
          </p>
          <Link href="/base">
            <button className="button">Ver Módulo →</button>
          </Link>
        </div>
      </div>

      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>🌐 Protocolos Web3</h2>

      <div className="grid grid-2">
        <div className="card">
          <h3>🟣 Farcaster</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            <strong>Protocolo Social Descentralizado:</strong> Autenticación, perfil, firma de mensajes en redes sociales Web3.
          </p>
          <Link href="/farcaster">
            <button className="button" style={{ background: '#8B5CF6' }}>Explorar Farcaster →</button>
          </Link>
        </div>

        <div className="card">
          <h3>🔵 Base Network (L2)</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            <strong>Coinbase L2:</strong> OnchainKit integration, optimistic rollups, y diferencias con Ethereum mainnet.
          </p>
          <Link href="/base">
            <button className="button" style={{ background: '#0052FF' }}>Explorar Base →</button>
          </Link>
        </div>
      </div>

      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>🔐 Seguridad & Pentesting</h2>

      <div className="card" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', color: 'white' }}>
        <h3 style={{ color: 'white', marginTop: 0 }}>🎯 Security & CTF Hub</h3>
        <p style={{ color: 'white', marginBottom: '1rem', fontSize: '0.95rem', opacity: 0.95 }}>
          <strong>Centro de Seguridad Web3:</strong> Aprende pentesting de smart contracts, practica con CTF challenges,
          y domina técnicas de ethical hacking. Desde vulnerabilidades básicas hasta exploits avanzados.
        </p>
        <ul style={{ color: 'white', fontSize: '0.9rem', lineHeight: '1.8', marginBottom: '1.5rem', opacity: 0.95 }}>
          <li>🚩 <strong>CTF Challenges</strong> - Ethernaut, Damn Vulnerable DeFi, Paradigm CTF</li>
          <li>⚠️ <strong>Vulnerabilidades Comunes</strong> - Reentrancy, Flash Loans, Access Control</li>
          <li>🛠️ <strong>Herramientas</strong> - Slither, Echidna, Mythril, Foundry</li>
          <li>💰 <strong>Bug Bounties</strong> - Immunefi, Code4rena, Sherlock</li>
        </ul>
        <Link href="/security">
          <button className="button" style={{ background: 'white', color: '#dc3545', fontWeight: 'bold' }}>
            Explorar Security Hub →
          </button>
        </Link>
      </div>

      <div className="card" style={{ marginTop: '3rem', background: '#f8f9fa', border: '2px solid #e0e0e0' }}>
        <h2 style={{ marginTop: 0 }}>📖 Documentación Completa</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: '1.7' }}>
          Este proyecto incluye documentación exhaustiva organizada por temas. Explora la carpeta <code>/docs</code> para guías detalladas.
        </p>
        <div className="grid grid-2">
          <div>
            <h4 style={{ color: '#667eea' }}>📁 Fundamentos</h4>
            <ul style={{ color: '#718096', fontSize: '0.95rem', lineHeight: '1.8' }}>
              <li><code>wallets.md</code> - Wallets & Conexión</li>
              <li><code>signing.md</code> - Firma de Mensajes</li>
              <li><code>nfts.md</code> - NFTs Completo</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#667eea' }}>📁 Protocolos</h4>
            <ul style={{ color: '#718096', fontSize: '0.95rem', lineHeight: '1.8' }}>
              <li><code>uniswap.md</code> - Uniswap V3 DEX</li>
              <li>Más protocolos en desarrollo...</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>🛠️ Stack Tecnológico</h3>
        <div className="grid grid-2" style={{ marginTop: '1rem' }}>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Frontend</h4>
            <ul style={{ color: '#718096', fontSize: '0.95rem', lineHeight: '1.8' }}>
              <li>Next.js 15 (App Router)</li>
              <li>React 18 + TypeScript</li>
              <li>Wagmi v2 + Viem</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Web3</h4>
            <ul style={{ color: '#718096', fontSize: '0.95rem', lineHeight: '1.8' }}>
              <li>WalletConnect v5</li>
              <li>OnchainKit (Base)</li>
              <li>Uniswap V3</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem', background: '#fff3cd', border: '2px solid #ffc107' }}>
        <h3 style={{ color: '#856404', marginTop: 0 }}>💡 Filosofía Educativa</h3>
        <p style={{ color: '#856404', marginBottom: 0, lineHeight: '1.7' }}>
          Este repositorio asume que eres un <strong>desarrollador senior</strong>. Por eso priorizamos:
          <br />✅ Profundidad sobre amplitud
          <br />✅ Explicar el "porqué", no solo el "cómo"
          <br />✅ Patrones de producción, no solo demos
          <br />✅ Consideraciones de seguridad en cada feature
          <br />✅ Contexto histórico y decisiones arquitectónicas
        </p>
      </div>
    </div>
  );
}
