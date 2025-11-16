'use client';

import { useAccount, useSignMessage, useSignTypedData } from 'wagmi';
import { verifyMessage, verifyTypedData } from 'viem';
import { useState } from 'react';

/**
 * MÓDULO EDUCATIVO: Firma de Mensajes en Web3
 *
 * Este módulo demuestra:
 * 1. EIP-191: Personal Sign (firma simple de mensajes)
 * 2. EIP-712: Typed Data Sign (firma estructurada)
 * 3. Verificación de firmas
 * 4. Casos de uso prácticos
 *
 * Ver documentación completa en: /docs/fundamentals/signing.md
 */

export default function SigningPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync } = useSignTypedData();

  // Estados para EIP-191 (Personal Sign)
  const [personalMessage, setPersonalMessage] = useState('Bienvenido a Web3 Learning Hub!');
  const [personalSignature, setPersonalSignature] = useState<string>('');
  const [personalVerified, setPersonalVerified] = useState<boolean | null>(null);

  // Estados para EIP-712 (Typed Data)
  const [typedDataSignature, setTypedDataSignature] = useState<string>('');
  const [typedDataVerified, setTypedDataVerified] = useState<boolean | null>(null);

  // Estados UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * EIP-191: Firma Simple (Personal Sign)
   *
   * Proceso:
   * 1. Usuario firma mensaje de texto plano
   * 2. Wallet agrega prefijo "\x19Ethereum Signed Message:\n"
   * 3. Retorna firma de 65 bytes (r, s, v)
   *
   * Usa casos: Autenticación, prueba de propiedad
   */
  async function handlePersonalSign() {
    if (!address) return;

    setLoading(true);
    setError('');
    setPersonalVerified(null);

    try {
      // Firmar mensaje
      const signature = await signMessageAsync({
        message: personalMessage
      });

      setPersonalSignature(signature);

      // Verificar inmediatamente (demo)
      const isValid = await verifyMessage({
        address: address!,
        message: personalMessage,
        signature
      });

      setPersonalVerified(isValid);
    } catch (err: any) {
      setError(err.message || 'Error al firmar mensaje');
      console.error('Sign error:', err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * EIP-712: Typed Data Sign
   *
   * Ventajas sobre EIP-191:
   * - Datos estructurados (wallets pueden mostrar contenido)
   * - Type safety
   * - Domain binding (previene phishing)
   * - Mejor UX (usuario ve qué está firmando)
   *
   * Usado por: Uniswap, OpenSea, ENS, Permit (ERC-20)
   */
  async function handleTypedDataSign() {
    if (!address) return;

    setLoading(true);
    setError('');
    setTypedDataVerified(null);

    try {
      // Domain: Define el contexto de la firma
      const domain = {
        name: 'Web3 Learning Hub',
        version: '1',
        chainId: 1, // Ethereum mainnet
        verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`
      } as const;

      // Types: Schema de los datos
      const types = {
        // Tipo de los datos que se firman
        Mail: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'contents', type: 'string' },
          { name: 'timestamp', type: 'uint256' }
        ]
      } as const;

      // Message: Datos actuales
      const message = {
        from: address,
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as `0x${string}`,
        contents: 'Este es un mensaje educativo de EIP-712',
        timestamp: BigInt(Math.floor(Date.now() / 1000))
      } as const;

      // Firmar
      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'Mail',
        message
      });

      setTypedDataSignature(signature);

      // Verificar
      const isValid = await verifyTypedData({
        address: address!,
        domain,
        types,
        primaryType: 'Mail',
        message,
        signature
      });

      setTypedDataVerified(isValid);
    } catch (err: any) {
      setError(err.message || 'Error al firmar typed data');
      console.error('Typed data sign error:', err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Ejemplo de Sign-In con Ethereum (SIWE)
   *
   * Patrón común para autenticación Web3:
   * 1. Backend genera nonce único
   * 2. Usuario firma mensaje con nonce
   * 3. Backend verifica firma y crea sesión
   */
  async function handleSIWE() {
    if (!address) return;

    setLoading(true);
    setError('');

    try {
      // En producción, obtener nonce del backend
      const nonce = Math.random().toString(36).substring(7);

      // Formato SIWE estándar (EIP-4361)
      const message = `localhost:3000 wants you to sign in with your Ethereum account:
${address}

Sign in to Web3 Learning Hub

URI: http://localhost:3000
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

      const signature = await signMessageAsync({ message });

      // En producción, enviar al backend para verificar y crear sesión
      console.log('SIWE Signature:', signature);

      alert('✅ Sign-In exitoso! En producción, esto crearía una sesión.');
    } catch (err: any) {
      setError(err.message || 'Error en SIWE');
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>🔏 Firma de Mensajes</h1>
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white',
          marginTop: '2rem'
        }}>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            ⚠️ Conecta tu wallet para comenzar a firmar mensajes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🔏 Firma de Mensajes en Web3</h1>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
        Aprende sobre EIP-191 (Personal Sign) y EIP-712 (Typed Data) con ejemplos prácticos.
        <br />
        📚 <a href="/docs/fundamentals/signing.md" style={{ color: '#667eea' }}>Ver documentación completa</a>
      </p>

      {error && (
        <div style={{
          padding: '1rem',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c33',
          marginBottom: '2rem'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Sección 1: EIP-191 Personal Sign */}
      <section style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h2>📝 EIP-191: Personal Sign (Firma Simple)</h2>
        <div style={{
          background: '#f8f9fa',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
          lineHeight: '1.6'
        }}>
          <strong>Concepto:</strong> Firma de mensajes de texto plano. El wallet agrega un prefijo
          (<code>\x19Ethereum Signed Message:\n</code>) para prevenir que la firma se use como transacción.
          <br /><br />
          <strong>Casos de uso:</strong> Autenticación, prueba de propiedad de dirección, sign-in.
        </div>

        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Mensaje a firmar:
        </label>
        <textarea
          value={personalMessage}
          onChange={(e) => setPersonalMessage(e.target.value)}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}
          placeholder="Escribe cualquier mensaje..."
        />

        <button
          onClick={handlePersonalSign}
          disabled={loading || !personalMessage}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          {loading ? '⏳ Firmando...' : '✍️ Firmar Mensaje'}
        </button>

        {personalSignature && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3>Firma Generada:</h3>
            <div style={{
              background: '#f0f0f0',
              padding: '1rem',
              borderRadius: '8px',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {personalSignature}
            </div>
            <div style={{
              padding: '0.75rem',
              background: personalVerified ? '#d4edda' : '#f8d7da',
              borderRadius: '8px',
              color: personalVerified ? '#155724' : '#721c24'
            }}>
              {personalVerified ? '✅ Firma verificada correctamente!' : '❌ Verificación fallida'}
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#e7f3ff',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              <strong>📚 Explicación:</strong>
              <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                <li>La firma tiene 132 caracteres (65 bytes en hex)</li>
                <li>Formato: <code>0x</code> + r (32 bytes) + s (32 bytes) + v (1 byte)</li>
                <li>Usando <code>verifyMessage()</code> recuperamos la dirección del firmante</li>
                <li>Si coincide con tu dirección, la firma es válida ✅</li>
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* Sección 2: EIP-712 Typed Data */}
      <section style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h2>📋 EIP-712: Typed Data (Firma Estructurada)</h2>
        <div style={{
          background: '#f8f9fa',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
          lineHeight: '1.6'
        }}>
          <strong>Concepto:</strong> Firma de datos estructurados y tipados. Las wallets modernas
          muestran el contenido de forma legible (no un blob hexadecimal).
          <br /><br />
          <strong>Ventajas:</strong> Mejor UX, type safety, prevención de phishing, domain binding.
          <br />
          <strong>Casos de uso:</strong> Uniswap orders, OpenSea listings, ERC-20 Permit, DAO voting.
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontFamily: 'monospace',
          fontSize: '0.85rem'
        }}>
          <strong>Estructura de datos a firmar:</strong>
          <pre style={{ margin: '0.5rem 0 0 0', overflow: 'auto' }}>
{`{
  from: "${address}",
  to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  contents: "Este es un mensaje educativo de EIP-712",
  timestamp: ${Math.floor(Date.now() / 1000)}
}`}
          </pre>
        </div>

        <button
          onClick={handleTypedDataSign}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          {loading ? '⏳ Firmando...' : '✍️ Firmar Typed Data'}
        </button>

        {typedDataSignature && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3>Firma Generada:</h3>
            <div style={{
              background: '#f0f0f0',
              padding: '1rem',
              borderRadius: '8px',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {typedDataSignature}
            </div>
            <div style={{
              padding: '0.75rem',
              background: typedDataVerified ? '#d4edda' : '#f8d7da',
              borderRadius: '8px',
              color: typedDataVerified ? '#155724' : '#721c24'
            }}>
              {typedDataVerified ? '✅ Typed Data verificada correctamente!' : '❌ Verificación fallida'}
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#e7f3ff',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              <strong>📚 Explicación:</strong>
              <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                <li>Tu wallet mostró una vista estructurada de los datos (no hex)</li>
                <li>Incluye <strong>domain</strong> (nombre, versión, chainId) para seguridad</li>
                <li>Los <strong>types</strong> definen el esquema de datos</li>
                <li>Imposible reusar esta firma en otro contrato (domain binding)</li>
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* Sección 3: Sign-In con Ethereum (SIWE) */}
      <section style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '2rem'
      }}>
        <h2>🔐 Sign-In con Ethereum (SIWE - EIP-4361)</h2>
        <div style={{
          background: '#f8f9fa',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
          lineHeight: '1.6'
        }}>
          <strong>Concepto:</strong> Autenticación usando tu wallet en lugar de email/contraseña.
          <br /><br />
          <strong>Flujo:</strong>
          <ol style={{ marginTop: '0.5rem', marginBottom: 0 }}>
            <li>Usuario solicita login</li>
            <li>Backend genera nonce único y timestamp</li>
            <li>Usuario firma mensaje con nonce</li>
            <li>Backend verifica firma y crea sesión</li>
          </ol>
        </div>

        <button
          onClick={handleSIWE}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          {loading ? '⏳ Autenticando...' : '🔐 Sign-In con Ethereum'}
        </button>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#fff3cd',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <strong>💡 Ventajas de SIWE:</strong>
          <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
            <li>✅ No necesitas email ni contraseña</li>
            <li>✅ Sin base de datos de usuarios (solo addresses)</li>
            <li>✅ Privacidad: controlas tu identidad</li>
            <li>✅ Multi-chain: misma address en todas las redes</li>
            <li>✅ Estándar adoptado por OpenSea, ENS, Gitcoin, etc.</li>
          </ul>
        </div>
      </section>

      {/* Recursos */}
      <section style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e0e0e0'
      }}>
        <h3>📖 Recursos Educativos</h3>
        <ul style={{ lineHeight: '1.8', marginBottom: 0 }}>
          <li>
            <a href="https://eips.ethereum.org/EIPS/eip-191" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
              EIP-191: Signed Data Standard
            </a>
          </li>
          <li>
            <a href="https://eips.ethereum.org/EIPS/eip-712" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
              EIP-712: Typed structured data hashing and signing
            </a>
          </li>
          <li>
            <a href="https://eips.ethereum.org/EIPS/eip-4361" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
              EIP-4361: Sign-In with Ethereum
            </a>
          </li>
          <li>
            <a href="https://docs.login.xyz/" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
              Sign-In with Ethereum (Official Docs)
            </a>
          </li>
          <li>
            <strong>Código fuente:</strong> <code>/app/signing/page.tsx</code>
          </li>
          <li>
            <strong>Documentación local:</strong> <code>/docs/fundamentals/signing.md</code>
          </li>
        </ul>
      </section>
    </div>
  );
}
