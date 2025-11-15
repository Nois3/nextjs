'use client'

import Link from 'next/link'
import { useAccount, useBalance, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { base } from 'wagmi/chains'

// ERC-20 ABI para balanceOf
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Algunos tokens populares en Base
const BASE_TOKENS = [
  { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`, symbol: 'USDC' },
  { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' as `0x${string}`, symbol: 'DAI' },
]

function TokenBalance({ tokenAddress, tokenSymbol, userAddress }: { tokenAddress: `0x${string}`, tokenSymbol: string, userAddress: `0x${string}` }) {
  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
    chainId: base.id,
  })

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId: base.id,
  })

  const formattedBalance = balance && decimals
    ? (Number(balance) / Math.pow(10, decimals)).toFixed(4)
    : '0.0000'

  return (
    <div className="balance-item">
      <span className="balance-label">{tokenSymbol}</span>
      <span className="balance-value">{formattedBalance}</span>
    </div>
  )
}

export default function BalancesPage() {
  const { address, isConnected, chain } = useAccount()

  const { data: balance, isLoading } = useBalance({
    address: address,
  })

  return (
    <div className="container">
      <h1>💰 Ver Saldos</h1>

      <div className="nav">
        <Link href="/" className="nav-link">Inicio</Link>
        <Link href="/connect" className="nav-link">Conectar Wallet</Link>
        <Link href="/balances" className="nav-link active">Ver Saldos</Link>
        <Link href="/swap" className="nav-link">Swap Tokens</Link>
      </div>

      {!isConnected ? (
        <div className="card">
          <h2>Wallet no conectada</h2>
          <p style={{ color: '#718096', marginBottom: '1rem' }}>
            Debes conectar tu wallet para ver los saldos
          </p>
          <Link href="/connect">
            <button className="button">Conectar Wallet</button>
          </Link>
        </div>
      ) : (
        <div>
          <div className="card">
            <h2>Saldo Nativo ({chain?.name || 'Unknown'})</h2>
            {isLoading ? (
              <div className="loading">Cargando...</div>
            ) : (
              <div className="balance-item">
                <span className="balance-label">
                  {balance?.symbol || 'ETH'}
                </span>
                <span className="balance-value">
                  {balance ? parseFloat(formatEther(balance.value)).toFixed(6) : '0.000000'}
                </span>
              </div>
            )}
          </div>

          <div className="card">
            <h2>Información de la Wallet</h2>
            <div className="balance-item">
              <span className="balance-label">Dirección:</span>
              <span style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>{address}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Red actual:</span>
              <span className="balance-value">{chain?.name || 'Unknown'}</span>
            </div>
            {chain && (
              <div className="balance-item">
                <span className="balance-label">Chain ID:</span>
                <span className="balance-value">{chain.id}</span>
              </div>
            )}
          </div>

          {chain?.id === base.id && address && (
            <div className="card">
              <h2>Tokens ERC-20 en Base</h2>
              <p style={{ color: '#718096', marginBottom: '1rem', fontSize: '0.95rem' }}>
                Algunos tokens populares en la red Base
              </p>
              {BASE_TOKENS.map((token) => (
                <TokenBalance
                  key={token.address}
                  tokenAddress={token.address}
                  tokenSymbol={token.symbol}
                  userAddress={address}
                />
              ))}
            </div>
          )}

          {chain?.id !== base.id && (
            <div className="card" style={{ background: '#fef5e7', border: '2px solid #f39c12' }}>
              <h3 style={{ color: '#d68910' }}>💡 Consejo</h3>
              <p style={{ color: '#7d6608' }}>
                Cambia a la red Base para ver tus tokens ERC-20
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
