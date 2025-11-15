'use client'

import Link from 'next/link'
import { useFarcaster, FarcasterLoginButton } from '@/contexts/FarcasterContext'
import { useState } from 'react'

export default function FarcasterPage() {
  const { isAuthenticated, user, signMessage } = useFarcaster()
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [isSigning, setIsSigning] = useState(false)

  const handleSign = async () => {
    if (!message) return

    setIsSigning(true)
    try {
      const sig = await signMessage(message)
      setSignature(sig)
    } catch (error) {
      console.error('Error signing message:', error)
    } finally {
      setIsSigning(false)
    }
  }

  return (
    <div className="container">
      <h1>🟣 Farcaster Integration</h1>

      <div className="nav">
        <Link href="/" className="nav-link">Inicio</Link>
        <Link href="/connect" className="nav-link">Conectar Wallet</Link>
        <Link href="/balances" className="nav-link">Ver Saldos</Link>
        <Link href="/swap" className="nav-link">Swap Tokens</Link>
        <Link href="/farcaster" className="nav-link active">Farcaster</Link>
        <Link href="/base" className="nav-link">Base</Link>
      </div>

      <div className="card">
        <h2>Autenticación con Farcaster</h2>
        <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
          Conecta tu identidad de Farcaster para acceder a funcionalidades sociales descentralizadas
        </p>

        <FarcasterLoginButton />
      </div>

      {isAuthenticated && user && (
        <>
          <div className="card">
            <h2>Información del Usuario</h2>
            <div className="balance-item">
              <span className="balance-label">FID (Farcaster ID):</span>
              <span className="balance-value">{user.fid}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Username:</span>
              <span className="balance-value">@{user.username}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Display Name:</span>
              <span className="balance-value">{user.displayName}</span>
            </div>
            {user.bio && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                <strong>Bio:</strong> {user.bio}
              </div>
            )}
          </div>

          <div className="card">
            <h2>Firmar Mensaje</h2>
            <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
              Firma un mensaje con tu identidad de Farcaster (demostración)
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568' }}>
                Mensaje a firmar:
              </label>
              <textarea
                className="input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ingresa el mensaje que quieres firmar"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              onClick={handleSign}
              disabled={!message || isSigning}
              className="button"
            >
              {isSigning ? '⏳ Firmando...' : '✍️ Firmar Mensaje'}
            </button>

            {signature && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#e6f7ff', borderRadius: '8px', border: '2px solid #1890ff' }}>
                <strong style={{ color: '#0050b3' }}>Firma generada:</strong>
                <div style={{ marginTop: '0.5rem', wordBreak: 'break-all', fontSize: '0.9rem', color: '#595959', fontFamily: 'monospace' }}>
                  {signature}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="card" style={{ background: '#f0f9ff', border: '2px solid #0ea5e9' }}>
        <h3 style={{ color: '#0369a1' }}>📚 Acerca de Farcaster</h3>
        <p style={{ color: '#075985', marginTop: '0.75rem' }}>
          Farcaster es un protocolo de redes sociales descentralizado suficientemente descentralizado.
          Permite a los desarrolladores construir aplicaciones sociales innovadoras con identidad verificada
          y propiedad de datos.
        </p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '1rem', color: '#075985' }}>
          <li>Identidad verificada on-chain</li>
          <li>Mensajes firmados criptográficamente</li>
          <li>Portabilidad de datos sociales</li>
          <li>Resistencia a la censura</li>
        </ul>
      </div>

      <div className="card" style={{ background: '#fff3cd', border: '2px solid #ffc107' }}>
        <h3 style={{ color: '#856404' }}>⚠️ Nota de Implementación</h3>
        <p style={{ color: '#856404', marginTop: '0.5rem' }}>
          Esta es una <strong>demostración</strong> del contexto de Farcaster. Para producción,
          integra con:
        </p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.75rem', color: '#856404' }}>
          <li><strong>Farcaster Auth Kit</strong> - Para autenticación real</li>
          <li><strong>Farcaster Hub</strong> - Para almacenamiento de datos</li>
          <li><strong>Neynar API</strong> - Para acceso simplificado a datos de Farcaster</li>
          <li><strong>Warpcast API</strong> - Para integración con el cliente oficial</li>
        </ul>
      </div>
    </div>
  )
}
