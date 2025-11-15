'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface FarcasterUser {
  fid: number
  username: string
  displayName: string
  pfp?: string
  bio?: string
}

interface FarcasterContextType {
  user: FarcasterUser | null
  isAuthenticated: boolean
  login: (user: FarcasterUser) => void
  logout: () => void
  signMessage: (message: string) => Promise<string>
}

const FarcasterContext = createContext<FarcasterContextType | undefined>(undefined)

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = useCallback((userData: FarcasterUser) => {
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const signMessage = useCallback(async (message: string): Promise<string> => {
    // Simulación de firma de mensaje con Farcaster
    // En producción, usarías Farcaster Auth Kit o similar
    return new Promise((resolve) => {
      setTimeout(() => {
        const signature = `farcaster_signed_${message}_${Date.now()}`
        resolve(signature)
      }, 1000)
    })
  }, [])

  return (
    <FarcasterContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        signMessage,
      }}
    >
      {children}
    </FarcasterContext.Provider>
  )
}

export function useFarcaster() {
  const context = useContext(FarcasterContext)
  if (context === undefined) {
    throw new Error('useFarcaster must be used within a FarcasterProvider')
  }
  return context
}

// Componente de demo para login con Farcaster
export function FarcasterLoginButton() {
  const { isAuthenticated, login, logout, user } = useFarcaster()

  const handleLogin = () => {
    // Simulación de login - en producción usarías Farcaster Auth Kit
    const mockUser: FarcasterUser = {
      fid: 12345,
      username: 'demo_user',
      displayName: 'Demo User',
      pfp: 'https://via.placeholder.com/150',
      bio: 'This is a demo Farcaster user',
    }
    login(mockUser)
  }

  if (isAuthenticated && user) {
    return (
      <div style={{
        padding: '1rem',
        background: '#e6f7ff',
        borderRadius: '8px',
        border: '2px solid #1890ff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          {user.pfp && (
            <img src={user.pfp} alt={user.displayName} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          )}
          <div>
            <div style={{ fontWeight: 600, color: '#1890ff' }}>@{user.username}</div>
            <div style={{ fontSize: '0.85rem', color: '#595959' }}>{user.displayName}</div>
          </div>
        </div>
        <button onClick={logout} className="button" style={{ background: '#ff4d4f', marginTop: '0.5rem' }}>
          Cerrar Sesión Farcaster
        </button>
      </div>
    )
  }

  return (
    <button onClick={handleLogin} className="button" style={{ background: '#1890ff' }}>
      🟣 Conectar con Farcaster
    </button>
  )
}
