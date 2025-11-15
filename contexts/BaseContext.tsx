'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { base } from 'wagmi/chains'

interface BaseAppData {
  name: string
  description: string
  url: string
  icon?: string
}

interface BaseContextType {
  app: BaseAppData | null
  isOnBase: boolean
  registerApp: (app: BaseAppData) => void
  unregisterApp: () => void
  checkBaseNetwork: () => boolean
}

const BaseContext = createContext<BaseContextType | undefined>(undefined)

export function BaseProvider({ children }: { children: ReactNode }) {
  const [app, setApp] = useState<BaseAppData | null>(null)
  const { chain } = useAccount()

  const isOnBase = chain?.id === base.id

  const registerApp = useCallback((appData: BaseAppData) => {
    setApp(appData)
  }, [])

  const unregisterApp = useCallback(() => {
    setApp(null)
  }, [])

  const checkBaseNetwork = useCallback(() => {
    return chain?.id === base.id
  }, [chain])

  return (
    <BaseContext.Provider
      value={{
        app,
        isOnBase,
        registerApp,
        unregisterApp,
        checkBaseNetwork,
      }}
    >
      {children}
    </BaseContext.Provider>
  )
}

export function useBase() {
  const context = useContext(BaseContext)
  if (context === undefined) {
    throw new Error('useBase must be used within a BaseProvider')
  }
  return context
}

// Componente indicador de red Base
export function BaseNetworkIndicator() {
  const { isOnBase } = useBase()
  const { chain } = useAccount()

  if (!chain) {
    return null
  }

  return (
    <div style={{
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      background: isOnBase ? '#d4edda' : '#fff3cd',
      border: `2px solid ${isOnBase ? '#28a745' : '#ffc107'}`,
      display: 'inline-block'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.2rem' }}>{isOnBase ? '✅' : '⚠️'}</span>
        <div>
          <div style={{ fontWeight: 600, color: isOnBase ? '#155724' : '#856404' }}>
            {isOnBase ? 'Conectado a Base' : `Conectado a ${chain.name}`}
          </div>
          {!isOnBase && (
            <div style={{ fontSize: '0.85rem', color: '#856404', marginTop: '0.25rem' }}>
              Cambia a Base para todas las funcionalidades
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente para registrar app en Base
export function BaseAppRegistration() {
  const { app, registerApp, unregisterApp } = useBase()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    icon: ''
  })

  const handleRegister = () => {
    if (formData.name && formData.description && formData.url) {
      registerApp(formData)
    }
  }

  if (app) {
    return (
      <div className="card" style={{ background: '#f0f9ff', border: '2px solid #0ea5e9' }}>
        <h3 style={{ color: '#0369a1' }}>📱 App Registrada en Base</h3>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Nombre:</strong> {app.name}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Descripción:</strong> {app.description}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>URL:</strong> <a href={app.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9' }}>{app.url}</a>
          </div>
          <button onClick={unregisterApp} className="button" style={{ background: '#dc2626', marginTop: '1rem' }}>
            Desregistrar App
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3>📱 Registrar App en Base</h3>
      <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
        Registra tu aplicación en el ecosistema Base (demostración)
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568' }}>
            Nombre de la App
          </label>
          <input
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Mi App Base"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568' }}>
            Descripción
          </label>
          <input
            type="text"
            className="input"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Una aplicación increíble en Base"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568' }}>
            URL
          </label>
          <input
            type="url"
            className="input"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://myapp.base.org"
          />
        </div>

        <button
          onClick={handleRegister}
          className="button"
          disabled={!formData.name || !formData.description || !formData.url}
        >
          Registrar App
        </button>
      </div>
    </div>
  )
}
