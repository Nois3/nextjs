'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SecurityPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ color: '#667eea', textDecoration: 'none' }}>
          ← Volver al Inicio
        </Link>
      </div>

      <h1>🔐 Security & Pentesting Hub</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
        Centro de aprendizaje para seguridad Web3, pentesting de smart contracts, y CTF challenges.
        Aprende a identificar vulnerabilidades, proteger tus contratos, y domina técnicas de ethical hacking.
      </p>

      <div className="nav">
        <Link href="/" className="nav-link">Inicio</Link>
        <Link href="/connect" className="nav-link">Conectar Wallet</Link>
        <Link href="/security" className="nav-link active">Seguridad</Link>
      </div>

      {/* CTF Challenges Section */}
      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>🎯 CTF Challenges</h2>
      <div className="grid grid-3">
        <div className="card" style={{ borderLeft: '4px solid #dc3545' }}>
          <h3>🚩 Beginner CTFs</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Desafíos introductorios para aprender conceptos básicos de seguridad en blockchain.
          </p>
          <ul style={{ color: '#718096', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <li><strong>Ethernaut</strong> - The Ethereum smart contract hacking game</li>
            <li><strong>Capture the Ether</strong> - Classic Ethereum security challenges</li>
            <li><strong>Damn Vulnerable DeFi</strong> - Nivel principiante</li>
          </ul>
          <div style={{ marginTop: '1rem' }}>
            <a
              href="https://ethernaut.openzeppelin.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#667eea', fontSize: '0.9rem' }}
            >
              🔗 Ir a Ethernaut →
            </a>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #ffc107' }}>
          <h3>⚡ Intermediate CTFs</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Desafíos de nivel medio que requieren conocimientos avanzados de Solidity.
          </p>
          <ul style={{ color: '#718096', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <li><strong>Damn Vulnerable DeFi</strong> - Retos intermedios/avanzados</li>
            <li><strong>Paradigm CTF</strong> - Competencias anuales</li>
            <li><strong>QuillAudit CTF</strong> - Smart contract security</li>
          </ul>
          <div style={{ marginTop: '1rem' }}>
            <a
              href="https://www.damnvulnerabledefi.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#667eea', fontSize: '0.9rem' }}
            >
              🔗 Ir a Damn Vulnerable DeFi →
            </a>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #28a745' }}>
          <h3>🏆 Advanced CTFs</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Desafíos expertos con vulnerabilidades complejas y ataques sofisticados.
          </p>
          <ul style={{ color: '#718096', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <li><strong>Secureum RACE</strong> - Advanced security challenges</li>
            <li><strong>Unhacked CTF</strong> - Bug bounty style</li>
            <li><strong>Code4rena Wardens</strong> - Real-world audits</li>
          </ul>
          <div style={{ marginTop: '1rem' }}>
            <a
              href="https://secureum.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#667eea', fontSize: '0.9rem' }}
            >
              🔗 Ir a Secureum →
            </a>
          </div>
        </div>
      </div>

      {/* Common Vulnerabilities */}
      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>⚠️ Vulnerabilidades Comunes en Smart Contracts</h2>
      <div className="grid grid-2">
        <div className="card" style={{ background: '#fff3cd', border: '2px solid #ffc107' }}>
          <h3 style={{ color: '#856404', marginTop: 0 }}>🔴 Critical Vulnerabilities</h3>
          <ul style={{ color: '#856404', fontSize: '0.95rem', lineHeight: '1.8' }}>
            <li><strong>Reentrancy</strong> - Llamadas recursivas que drenan fondos</li>
            <li><strong>Integer Overflow/Underflow</strong> - Problemas aritméticos</li>
            <li><strong>Access Control</strong> - Funciones sin restricciones adecuadas</li>
            <li><strong>Delegatecall</strong> - Ejecución de código malicioso</li>
            <li><strong>Flash Loan Attacks</strong> - Manipulación de precios</li>
          </ul>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,193,7,0.2)', borderRadius: '8px' }}>
            <code style={{ fontSize: '0.85rem', color: '#856404' }}>
              📚 Docs: /docs/security/critical-vulnerabilities.md
            </code>
          </div>
        </div>

        <div className="card" style={{ background: '#f8d7da', border: '2px solid #dc3545' }}>
          <h3 style={{ color: '#721c24', marginTop: 0 }}>🟠 High-Risk Patterns</h3>
          <ul style={{ color: '#721c24', fontSize: '0.95rem', lineHeight: '1.8' }}>
            <li><strong>Front-Running</strong> - MEV y transaction ordering</li>
            <li><strong>Price Oracle Manipulation</strong> - Ataques a feeds</li>
            <li><strong>Unchecked External Calls</strong> - Fallas silenciosas</li>
            <li><strong>Signature Replay</strong> - Reutilización de firmas</li>
            <li><strong>Gas Griefing</strong> - Ataques de consumo de gas</li>
          </ul>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(220,53,69,0.2)', borderRadius: '8px' }}>
            <code style={{ fontSize: '0.85rem', color: '#721c24' }}>
              📚 Docs: /docs/security/high-risk-patterns.md
            </code>
          </div>
        </div>
      </div>

      {/* Pentesting Tools */}
      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>🛠️ Herramientas de Pentesting</h2>
      <div className="grid grid-3">
        <div className="card">
          <h3>🔍 Static Analysis</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Análisis estático de código para detectar vulnerabilidades conocidas.
          </p>
          <ul style={{ color: '#718096', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <li><strong>Slither</strong> - Trail of Bits analyzer</li>
            <li><strong>Mythril</strong> - Security analysis tool</li>
            <li><strong>Securify</strong> - ETH Zurich tool</li>
            <li><strong>Manticore</strong> - Symbolic execution</li>
          </ul>
          <button
            className="button"
            style={{ marginTop: '1rem', background: '#6c757d' }}
            onClick={() => setSelectedCategory('static')}
          >
            Ver Ejemplos →
          </button>
        </div>

        <div className="card">
          <h3>⚙️ Dynamic Testing</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Pruebas en tiempo de ejecución y fuzzing de contratos.
          </p>
          <ul style={{ color: '#718096', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <li><strong>Echidna</strong> - Property-based fuzzing</li>
            <li><strong>Foundry</strong> - Fast testing framework</li>
            <li><strong>Hardhat</strong> - Development environment</li>
            <li><strong>Tenderly</strong> - Monitoring & debugging</li>
          </ul>
          <button
            className="button"
            style={{ marginTop: '1rem', background: '#6c757d' }}
            onClick={() => setSelectedCategory('dynamic')}
          >
            Ver Ejemplos →
          </button>
        </div>

        <div className="card">
          <h3>🌐 Network Analysis</h3>
          <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Análisis de transacciones, mempool, y comportamiento on-chain.
          </p>
          <ul style={{ color: '#718096', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <li><strong>Etherscan</strong> - Block explorer</li>
            <li><strong>Tenderly</strong> - Transaction simulator</li>
            <li><strong>Flashbots</strong> - MEV research</li>
            <li><strong>Dune Analytics</strong> - On-chain data</li>
          </ul>
          <button
            className="button"
            style={{ marginTop: '1rem', background: '#6c757d' }}
            onClick={() => setSelectedCategory('network')}
          >
            Ver Ejemplos →
          </button>
        </div>
      </div>

      {/* Learning Resources */}
      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>📚 Recursos de Aprendizaje</h2>
      <div className="grid grid-2">
        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3 style={{ color: 'white', marginTop: 0 }}>📖 Documentación & Guías</h3>
          <ul style={{ color: 'white', fontSize: '0.95rem', lineHeight: '1.8', opacity: 0.95 }}>
            <li><strong>Solidity Security Considerations</strong> - Oficial docs</li>
            <li><strong>Smart Contract Weakness Classification (SWC)</strong></li>
            <li><strong>ConsenSys Best Practices</strong> - Ethereum security</li>
            <li><strong>Rekt News</strong> - Análisis de hacks famosos</li>
            <li><strong>Blockchain Security DB</strong> - Base de datos de exploits</li>
          </ul>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <h3 style={{ color: 'white', marginTop: 0 }}>🎓 Cursos & Certificaciones</h3>
          <ul style={{ color: 'white', fontSize: '0.95rem', lineHeight: '1.8', opacity: 0.95 }}>
            <li><strong>Secureum Bootcamp</strong> - Smart contract auditing</li>
            <li><strong>OpenZeppelin Defender</strong> - Security operations</li>
            <li><strong>Chainlink Developer Bootcamp</strong> - Secure oracles</li>
            <li><strong>Cyfrin Updraft</strong> - Security & auditing</li>
            <li><strong>Immunefi Learn</strong> - Bug bounty training</li>
          </ul>
        </div>
      </div>

      {/* Bug Bounty Programs */}
      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>💰 Bug Bounty Programs</h2>
      <div className="card" style={{ background: '#d4edda', border: '2px solid #28a745' }}>
        <h3 style={{ color: '#155724', marginTop: 0 }}>🏅 Plataformas de Bug Bounties</h3>
        <p style={{ color: '#155724', marginBottom: '1.5rem', lineHeight: '1.7' }}>
          Gana recompensas encontrando vulnerabilidades en protocolos DeFi y aplicaciones Web3.
        </p>
        <div className="grid grid-3">
          <div>
            <h4 style={{ color: '#28a745', marginBottom: '0.5rem' }}>Immunefi</h4>
            <p style={{ color: '#155724', fontSize: '0.9rem', margin: 0 }}>
              La plataforma líder de bug bounties para Web3. Recompensas de hasta $10M.
            </p>
            <div style={{ marginTop: '0.5rem' }}>
              <a
                href="https://immunefi.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#28a745', fontSize: '0.9rem', fontWeight: 'bold' }}
              >
                🔗 Explorar →
              </a>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#28a745', marginBottom: '0.5rem' }}>Code4rena</h4>
            <p style={{ color: '#155724', fontSize: '0.9rem', margin: 0 }}>
              Auditorías competitivas de smart contracts. Participa como warden.
            </p>
            <div style={{ marginTop: '0.5rem' }}>
              <a
                href="https://code4rena.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#28a745', fontSize: '0.9rem', fontWeight: 'bold' }}
              >
                🔗 Explorar →
              </a>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#28a745', marginBottom: '0.5rem' }}>Sherlock</h4>
            <p style={{ color: '#155724', fontSize: '0.9rem', margin: 0 }}>
              Competencias de auditoría con expertos. Protección con coverage.
            </p>
            <div style={{ marginTop: '0.5rem' }}>
              <a
                href="https://www.sherlock.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#28a745', fontSize: '0.9rem', fontWeight: 'bold' }}
              >
                🔗 Explorar →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Testing Environment */}
      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>🧪 Entorno de Pruebas</h2>
      <div className="card" style={{ background: '#e7f3ff', border: '2px solid #0052FF' }}>
        <h3 style={{ color: '#003d99', marginTop: 0 }}>🔬 Laboratorio de Seguridad</h3>
        <p style={{ color: '#003d99', marginBottom: '1.5rem', lineHeight: '1.7' }}>
          Configura tu propio entorno de pentesting para practicar ataques y defensas de manera segura.
        </p>
        <div className="grid grid-2">
          <div>
            <h4 style={{ color: '#0052FF', marginBottom: '0.5rem' }}>Setup Local</h4>
            <ul style={{ color: '#003d99', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li>Hardhat o Foundry para testing</li>
              <li>Local fork de mainnet con Anvil</li>
              <li>Remix IDE para exploración rápida</li>
              <li>Ganache para blockchain local</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#0052FF', marginBottom: '0.5rem' }}>Testnets</h4>
            <ul style={{ color: '#003d99', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li>Sepolia - Ethereum testnet oficial</li>
              <li>Goerli - Legacy testnet (deprecated)</li>
              <li>Base Sepolia - L2 testing</li>
              <li>Arbitrum Sepolia - Optimistic rollup</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="card" style={{ marginTop: '3rem', background: '#f8f9fa', border: '2px solid #e0e0e0' }}>
        <h2 style={{ marginTop: 0 }}>✅ Mejores Prácticas de Seguridad</h2>
        <div className="grid grid-2">
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>🔒 Durante el Desarrollo</h4>
            <ul style={{ color: '#718096', fontSize: '0.95rem', lineHeight: '1.8' }}>
              <li>Usa OpenZeppelin contracts como base</li>
              <li>Implementa checks-effects-interactions pattern</li>
              <li>Valida todos los inputs externos</li>
              <li>Usa modifiers para access control</li>
              <li>Testing exhaustivo con edge cases</li>
              <li>Auditorías por terceros antes de producción</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>🛡️ En Producción</h4>
            <ul style={{ color: '#718096', fontSize: '0.95rem', lineHeight: '1.8' }}>
              <li>Implementa circuit breakers y pausable</li>
              <li>Rate limiting para prevenir spam</li>
              <li>Monitoring en tiempo real con alertas</li>
              <li>Upgradeable contracts con timelock</li>
              <li>Bug bounty program activo</li>
              <li>Plan de respuesta ante incidentes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Section */}
      {selectedCategory && (
        <div className="card" style={{ marginTop: '2rem', background: '#667eea', color: 'white' }}>
          <h3 style={{ color: 'white', marginTop: 0 }}>
            {selectedCategory === 'static' && '🔍 Ejemplo: Slither Static Analysis'}
            {selectedCategory === 'dynamic' && '⚙️ Ejemplo: Echidna Fuzzing'}
            {selectedCategory === 'network' && '🌐 Ejemplo: Tenderly Simulation'}
          </h3>

          {selectedCategory === 'static' && (
            <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
              <code>{`# Instalar Slither
pip3 install slither-analyzer

# Analizar contrato
slither contracts/MyContract.sol

# Output mostrará:
# - Reentrancy vulnerabilities
# - Unchecked transfers
# - Unused state variables
# - Dangerous delegatecalls
# - Y más...`}</code>
            </pre>
          )}

          {selectedCategory === 'dynamic' && (
            <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
              <code>{`# Instalar Echidna
docker pull trailofbits/eth-security-toolbox

# Ejecutar fuzzing
echidna-test contracts/MyContract.sol --contract MyContract

# Echidna probará:
# - Millones de inputs aleatorios
# - Edge cases automáticos
# - Violaciones de invariantes
# - Condiciones de overflow`}</code>
            </pre>
          )}

          {selectedCategory === 'network' && (
            <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
              <code>{`# Simular transacción en Tenderly
# 1. Ir a tenderly.co
# 2. Conectar wallet
# 3. Simular transacción antes de enviarla
# 4. Ver:
#    - Gas exacto consumido
#    - State changes detallados
#    - Potential failures
#    - Contract interactions
# 5. Debugging con stack traces`}</code>
            </pre>
          )}

          <button
            className="button"
            style={{ marginTop: '1rem', background: 'white', color: '#667eea' }}
            onClick={() => setSelectedCategory(null)}
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem', background: '#fff3cd', border: '2px solid #ffc107' }}>
        <h3 style={{ color: '#856404', marginTop: 0 }}>⚖️ Ethical Hacking & Responsible Disclosure</h3>
        <p style={{ color: '#856404', marginBottom: '1rem', lineHeight: '1.7' }}>
          Todos los recursos y técnicas en esta página son para <strong>propósitos educativos y ethical hacking autorizado</strong>.
        </p>
        <ul style={{ color: '#856404', fontSize: '0.95rem', lineHeight: '1.8' }}>
          <li>Solo testea en contratos propios o en CTF challenges autorizados</li>
          <li>Nunca ataques contratos en producción sin autorización</li>
          <li>Si encuentras una vulnerabilidad, usa responsible disclosure</li>
          <li>Participa en bug bounties oficiales para ganar recompensas legítimas</li>
          <li>El hacking no autorizado es ilegal y tiene consecuencias severas</li>
        </ul>
      </div>
    </div>
  );
}
