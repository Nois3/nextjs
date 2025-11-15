'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useEffect } from 'react';
import { parseAbi, formatEther } from 'viem';
import { base } from 'wagmi/chains';

/**
 * MÓDULO EDUCATIVO: NFTs (ERC-721 y ERC-1155)
 *
 * Este módulo enseña:
 * 1. Lectura de NFTs (balanceOf, ownerOf, tokenURI)
 * 2. Metadata y cómo se almacena
 * 3. Transferencias de NFTs
 * 4. Approvals y operators
 * 5. Diferencias entre ERC-721 y ERC-1155
 *
 * Ver documentación: /docs/fundamentals/nfts.md
 */

// ABI simplificado de ERC-721
const erc721Abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function approve(address to, uint256 tokenId)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
]);

// ABI simplificado de ERC-1155
const erc1155Abi = parseAbi([
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
  'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function uri(uint256 id) view returns (string)',
]);

// Contratos de ejemplo en Base (puedes agregar los tuyos)
const EXAMPLE_NFT_CONTRACTS = {
  base: [
    {
      name: 'Base, Introduced',
      address: '0xEA8E5a6764f9a54426cdE0bf53fc350B7d4E2B91' as `0x${string}`,
      type: 'ERC-721',
      description: 'Commemorative NFT for Base mainnet launch'
    }
  ]
};

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export default function NFTsPage() {
  const { address, isConnected, chain } = useAccount();
  const [selectedContract, setSelectedContract] = useState<`0x${string}`>(
    EXAMPLE_NFT_CONTRACTS.base[0].address
  );
  const [tokenId, setTokenId] = useState('0');
  const [customContract, setCustomContract] = useState('');
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  // Lectura de información del contrato
  const { data: contractName } = useReadContract({
    address: selectedContract,
    abi: erc721Abi,
    functionName: 'name'
  });

  const { data: contractSymbol } = useReadContract({
    address: selectedContract,
    abi: erc721Abi,
    functionName: 'symbol'
  });

  // Lectura de información del token específico
  const { data: tokenOwner, error: ownerError } = useReadContract({
    address: selectedContract,
    abi: erc721Abi,
    functionName: 'ownerOf',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: { enabled: !!tokenId }
  });

  const { data: tokenURI, error: uriError } = useReadContract({
    address: selectedContract,
    abi: erc721Abi,
    functionName: 'tokenURI',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: { enabled: !!tokenId }
  });

  // Balance del usuario conectado
  const { data: userBalance } = useReadContract({
    address: selectedContract,
    abi: erc721Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Fetch metadata cuando tokenURI cambia
  useEffect(() => {
    if (!tokenURI) {
      setMetadata(null);
      return;
    }

    async function fetchMetadata() {
      setLoadingMetadata(true);
      try {
        // Convertir IPFS URI a HTTP gateway
        let url = tokenURI;
        if (url.startsWith('ipfs://')) {
          url = url.replace('ipfs://', 'https://ipfs.io/ipfs/');
        } else if (url.startsWith('ar://')) {
          url = url.replace('ar://', 'https://arweave.net/');
        }

        // Reemplazar {id} si es necesario (ERC-1155)
        url = url.replace('{id}', tokenId);

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch metadata');

        const data = await response.json();

        // Convertir image URL también
        if (data.image) {
          if (data.image.startsWith('ipfs://')) {
            data.image = data.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
          }
        }

        setMetadata(data);
      } catch (error) {
        console.error('Error fetching metadata:', error);
        setMetadata(null);
      } finally {
        setLoadingMetadata(false);
      }
    }

    fetchMetadata();
  }, [tokenURI, tokenId]);

  if (!isConnected) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>🖼️ NFTs - Tokens No Fungibles</h1>
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white',
          marginTop: '2rem'
        }}>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            ⚠️ Conecta tu wallet para explorar NFTs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🖼️ NFTs - Tokens No Fungibles</h1>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
        Explora NFTs (ERC-721 y ERC-1155), consulta metadata, y aprende cómo funcionan los tokens únicos.
        <br />
        📚 <a href="/docs/fundamentals/nfts.md" style={{ color: '#667eea' }}>Ver documentación completa</a>
      </p>

      {/* Selector de Contrato */}
      <section style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h2>📝 Seleccionar Contrato NFT</h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Contratos de Ejemplo:
          </label>
          <select
            value={selectedContract}
            onChange={(e) => setSelectedContract(e.target.value as `0x${string}`)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '0.95rem'
            }}
          >
            {EXAMPLE_NFT_CONTRACTS.base.map((contract) => (
              <option key={contract.address} value={contract.address}>
                {contract.name} ({contract.type}) - {contract.address.slice(0, 10)}...
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            O ingresa dirección de contrato:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={customContract}
              onChange={(e) => setCustomContract(e.target.value)}
              placeholder="0x..."
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={() => {
                if (customContract.startsWith('0x') && customContract.length === 42) {
                  setSelectedContract(customContract as `0x${string}`);
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Cargar
            </button>
          </div>
        </div>

        {contractName && (
          <div style={{
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <strong>Contrato Cargado:</strong> {contractName} ({contractSymbol})
            <br />
            <code style={{ fontSize: '0.85rem' }}>{selectedContract}</code>
            <br />
            {address && (
              <>
                <strong>Tu balance:</strong> {userBalance?.toString() || '0'} NFTs
              </>
            )}
          </div>
        )}
      </section>

      {/* Explorador de Token */}
      <section style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h2>🔍 Explorar Token Específico</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Token ID:
          </label>
          <input
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="0"
            min="0"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          />
        </div>

        {ownerError && (
          <div style={{
            padding: '1rem',
            background: '#fff3cd',
            borderRadius: '8px',
            color: '#856404',
            marginBottom: '1rem'
          }}>
            ⚠️ Token no encontrado o no existe
          </div>
        )}

        {tokenOwner && (
          <div>
            <div style={{
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ marginTop: 0 }}>Información del Token</h3>
              <div style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
                <strong>Token ID:</strong> {tokenId}
                <br />
                <strong>Owner:</strong>{' '}
                <code style={{ fontSize: '0.85rem' }}>{tokenOwner}</code>
                {address && tokenOwner.toLowerCase() === address.toLowerCase() && (
                  <span style={{ marginLeft: '0.5rem', color: '#28a745', fontWeight: 'bold' }}>
                    (¡Es tuyo!)
                  </span>
                )}
                <br />
                {tokenURI && (
                  <>
                    <strong>Token URI:</strong>{' '}
                    <a
                      href={tokenURI.startsWith('ipfs://') ? tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/') : tokenURI}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#667eea', fontSize: '0.85rem', wordBreak: 'break-all' }}
                    >
                      {tokenURI.slice(0, 50)}...
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Metadata */}
            {loadingMetadata ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                ⏳ Cargando metadata...
              </div>
            ) : metadata ? (
              <div style={{
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {metadata.image && (
                  <div style={{
                    width: '100%',
                    maxHeight: '400px',
                    overflow: 'hidden',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={metadata.image}
                      alt={metadata.name || 'NFT'}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                )}
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginTop: 0 }}>{metadata.name || `Token #${tokenId}`}</h3>
                  {metadata.description && (
                    <p style={{ color: '#666', lineHeight: '1.6' }}>{metadata.description}</p>
                  )}

                  {metadata.attributes && metadata.attributes.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h4>Atributos:</h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '1rem'
                      }}>
                        {metadata.attributes.map((attr, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '0.75rem',
                              background: '#f8f9fa',
                              borderRadius: '8px',
                              textAlign: 'center'
                            }}
                          >
                            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                              {attr.trait_type}
                            </div>
                            <div style={{ fontWeight: 'bold' }}>{attr.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {metadata.external_url && (
                    <div style={{ marginTop: '1rem' }}>
                      <a
                        href={metadata.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#667eea',
                          textDecoration: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        🔗 Ver en sitio externo →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : tokenURI ? (
              <div style={{
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                color: '#666'
              }}>
                No se pudo cargar la metadata. El URI puede no ser accesible o no seguir el estándar.
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* Conceptos Educativos */}
      <section style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '2rem'
      }}>
        <h2>📚 Conceptos Clave</h2>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <h3>🎨 ERC-721: NFTs Únicos</h3>
            <ul style={{ lineHeight: '1.8', color: '#666' }}>
              <li><strong>Un token = un item único</strong></li>
              <li>Cada <code>tokenId</code> es indivisible e irremplazable</li>
              <li>Funciones clave: <code>ownerOf()</code>, <code>tokenURI()</code>, <code>safeTransferFrom()</code></li>
              <li>Uso: Arte digital, coleccionables, bienes raíces virtuales</li>
            </ul>
          </div>

          <div>
            <h3>🎮 ERC-1155: Multi-Token</h3>
            <ul style={{ lineHeight: '1.8', color: '#666' }}>
              <li><strong>Un contrato = múltiples tipos de tokens</strong></li>
              <li>Soporta tokens fungibles Y no-fungibles</li>
              <li>Batch operations (transferir múltiples en una tx)</li>
              <li>~90% menos gas para operaciones batch</li>
              <li>Uso: Gaming (items, monedas), tickets de eventos</li>
            </ul>
          </div>

          <div>
            <h3>💾 Metadata & IPFS</h3>
            <ul style={{ lineHeight: '1.8', color: '#666' }}>
              <li><strong>tokenURI</strong>: Apunta a JSON con metadata del NFT</li>
              <li><strong>IPFS</strong>: Sistema de archivos descentralizado (ipfs://...)</li>
              <li>Metadata incluye: nombre, descripción, imagen, atributos</li>
              <li>Estándar de OpenSea: <code>{'{ name, description, image, attributes }'}</code></li>
            </ul>
          </div>

          <div>
            <h3>🔒 Approvals</h3>
            <ul style={{ lineHeight: '1.8', color: '#666' }}>
              <li><code>approve(address, tokenId)</code>: Aprobar un NFT específico</li>
              <li><code>setApprovalForAll(operator, true)</code>: Aprobar todos los NFTs</li>
              <li>Usado por marketplaces (OpenSea, etc.) para vender NFTs</li>
              <li>⚠️ Siempre revoca approvals de contratos no confiables</li>
            </ul>
          </div>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#e7f3ff',
          borderRadius: '8px'
        }}>
          <h4 style={{ marginTop: 0 }}>💡 Diferencia Clave: Fungible vs No-Fungible</h4>
          <div style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
            <strong>Fungible (ERC-20)</strong>: 1 USDC = 1 USDC (intercambiables)
            <br />
            <strong>No-Fungible (ERC-721)</strong>: Token #1 ≠ Token #2 (únicos)
            <br />
            <strong>Semi-Fungible (ERC-1155)</strong>: Puede ser ambos (ID 1 fungible, ID 2 único)
          </div>
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
            <a href="https://eips.ethereum.org/EIPS/eip-721" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
              EIP-721: Non-Fungible Token Standard
            </a>
          </li>
          <li>
            <a href="https://eips.ethereum.org/EIPS/eip-1155" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
              EIP-1155: Multi Token Standard
            </a>
          </li>
          <li>
            <a href="https://docs.opensea.io/docs/metadata-standards" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
              OpenSea Metadata Standards
            </a>
          </li>
          <li>
            <strong>Código fuente:</strong> <code>/app/nfts/page.tsx</code>
          </li>
          <li>
            <strong>Documentación local:</strong> <code>/docs/fundamentals/nfts.md</code>
          </li>
        </ul>
      </section>
    </div>
  );
}
