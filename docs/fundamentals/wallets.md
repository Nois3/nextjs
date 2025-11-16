# Wallets & Conexión en Web3

## Índice
1. [Conceptos Fundamentales](#conceptos-fundamentales)
2. [Tipos de Wallets](#tipos-de-wallets)
3. [WalletConnect Protocol](#walletconnect-protocol)
4. [Implementación con Wagmi](#implementación-con-wagmi)
5. [Best Practices](#best-practices)

---

## Conceptos Fundamentales

### ¿Qué es una Wallet en Web3?

Una wallet (billetera) es fundamentalmente un **par de claves criptográficas**:
- **Clave privada**: Secret que firma transacciones (NUNCA compartir)
- **Clave pública**: Derivada de la privada mediante criptografía de curva elíptica (secp256k1)
- **Dirección**: Hash de la clave pública (identificador público)

```
Clave Privada (256 bits)
    ↓ [Derivación ECDSA]
Clave Pública (512 bits)
    ↓ [Keccak-256 + últimos 20 bytes]
Dirección Ethereum (160 bits / 20 bytes)
    → 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb (ejemplo)
```

### Custodia de Claves

**Self-Custody (Autocustodia)**:
- El usuario controla las claves privadas
- Máxima seguridad si se manejan correctamente
- Usuario responsable de backups (seed phrases)
- Ejemplos: MetaMask, Rainbow, Ledger

**Custodial**:
- Terceros controlan las claves (exchanges, etc.)
- Más fácil de usar pero menos seguro
- "Not your keys, not your coins"
- Ejemplos: Coinbase (exchange), Binance

---

## Tipos de Wallets

### 1. Browser Extension Wallets

**Características**:
- Extensiones de navegador (Chrome, Firefox, Brave)
- Inyectan `window.ethereum` en páginas web
- Estándar EIP-1193 (Ethereum Provider API)

**Implementación Técnica**:
```typescript
// Detección de wallet inyectada
if (typeof window !== 'undefined' && window.ethereum) {
  // Wallet disponible
  const provider = window.ethereum;

  // Solicitar cuentas (requiere interacción del usuario)
  const accounts = await provider.request({
    method: 'eth_requestAccounts'
  });
}
```

**Ventajas**:
- Acceso rápido
- Integración nativa con dApps
- Familiar para usuarios

**Desventajas**:
- Solo en desktop/browser
- Riesgo de phishing
- Limitado a una red a la vez

**Ejemplos**: MetaMask, Coinbase Wallet, Brave Wallet

### 2. Mobile Wallets

**Características**:
- Apps nativas iOS/Android
- Conexión via WalletConnect (QR scanning)
- Mejor seguridad móvil (enclave, biometrics)

**Flujo de Conexión**:
```
1. dApp genera URI de conexión (WalletConnect)
2. Usuario escanea QR con wallet mobile
3. Wallet establece sesión encriptada (websocket)
4. dApp envía solicitudes → Wallet aprueba/rechaza
```

**Ventajas**:
- Accesible en cualquier lugar
- Biometrics para seguridad adicional
- Independiente del navegador

**Desventajas**:
- UX más complicada (escanear QR)
- Requiere cambiar entre apps

**Ejemplos**: Rainbow, Trust Wallet, Coinbase Wallet Mobile

### 3. Hardware Wallets

**Características**:
- Dispositivos físicos dedicados
- Claves privadas nunca salen del dispositivo
- Máxima seguridad (air-gapped)

**Arquitectura**:
```
dApp ←→ Software Bridge ←→ USB/Bluetooth ←→ Hardware Wallet
              ↑                                    ↑
         (Transacción)                    (Firma offline)
```

**Ventajas**:
- Seguridad de nivel institucional
- Protección contra malware
- Ideal para grandes cantidades

**Desventajas**:
- Costo adicional ($50-$200)
- UX menos fluida
- Curva de aprendizaje

**Ejemplos**: Ledger, Trezor, GridPlus

### 4. Smart Contract Wallets (Account Abstraction)

**Características**:
- La wallet es un smart contract
- Lógica personalizable (multisig, recovery, etc.)
- Basado en ERC-4337

**Capacidades Avanzadas**:
- Recuperación social (social recovery)
- Límites de gasto
- Transacciones batch
- Gasless transactions (sponsored)
- Sesiones temporales

**Ejemplos**: Safe (Gnosis), Argent, Coinbase Smart Wallet

---

## WalletConnect Protocol

### ¿Qué es WalletConnect?

Protocolo **open-source** que permite a las wallets conectarse con dApps de forma segura mediante:
- **End-to-end encryption**
- **Bridge servers** (relay)
- **QR code** o **deep linking**

### Arquitectura de WalletConnect v2/v5

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│  dApp   │ ←─────→ │  Relay  │ ←─────→ │ Wallet  │
└─────────┘         └─────────┘         └─────────┘
     ↑                                        ↑
     └─── Encrypted Session (ChaCha20) ──────┘
```

**Componentes**:
1. **Proposer** (dApp): Inicia la conexión
2. **Responder** (Wallet): Aprueba y firma
3. **Relay**: Servidor de mensajes (no ve contenido encriptado)

### Flujo de Conexión WalletConnect

```typescript
// 1. dApp genera pairing URI
const uri = await client.connect({
  requiredNamespaces: {
    eip155: {
      chains: ['eip155:1'],
      methods: ['eth_sendTransaction', 'personal_sign'],
      events: ['chainChanged', 'accountsChanged']
    }
  }
});

// 2. Usuario escanea QR con wallet

// 3. Wallet aprueba y establece sesión
// (esto ocurre en la wallet)

// 4. dApp puede enviar requests
const signature = await client.request({
  topic: session.topic,
  chainId: 'eip155:1',
  request: {
    method: 'personal_sign',
    params: [message, address]
  }
});
```

### Ventajas de WalletConnect

- **Universal**: Funciona con cualquier wallet compatible
- **Seguro**: Encriptación E2E, wallet aprueba cada acción
- **Multi-plataforma**: Desktop ↔ Mobile, Mobile ↔ Mobile
- **Open Source**: Auditable y sin vendor lock-in

---

## Implementación con Wagmi

### Configuración Moderna (Wagmi v2 + Web3Modal v5)

Ver implementación completa en `/config/wagmi.ts`:

```typescript
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { mainnet, base, polygon, arbitrum, optimism } from 'wagmi/chains';

// 1. Definir metadata del proyecto
const metadata = {
  name: 'Web3 Learning Hub',
  description: 'Recurso educativo de Web3',
  url: 'https://yourproject.com',
  icons: ['https://yourproject.com/icon.png']
};

// 2. Configurar chains soportadas
const chains = [mainnet, base, polygon, arbitrum, optimism] as const;

// 3. Crear configuración de wagmi
export const config = defaultWagmiConfig({
  chains,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  metadata,
  enableWalletConnect: true, // WalletConnect via QR
  enableInjected: true,      // MetaMask, Brave, etc.
  enableEIP6963: true,       // Multi-injected wallet support
  enableCoinbase: true       // Coinbase Wallet SDK
});
```

### Uso en Componentes React

```typescript
'use client';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  return (
    <button onClick={() => open()}>
      {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
    </button>
  );
}
```

### Hooks Principales

| Hook | Propósito | Uso |
|------|-----------|-----|
| `useAccount()` | Estado de conexión, dirección, chain | `const { address, isConnected, chain } = useAccount()` |
| `useConnect()` | Conectar wallet | `const { connect, connectors } = useConnect()` |
| `useDisconnect()` | Desconectar | `const { disconnect } = useDisconnect()` |
| `useSwitchChain()` | Cambiar de red | `const { switchChain } = useSwitchChain()` |
| `useBalance()` | Obtener balance | `const { data } = useBalance({ address })` |

---

## Best Practices

### 1. Manejo de Errores

```typescript
import { useConnect } from 'wagmi';
import { UserRejectedRequestError } from 'viem';

function ConnectWallet() {
  const { connect, error } = useConnect();

  // Clasificar errores
  if (error instanceof UserRejectedRequestError) {
    return <p>Usuario rechazó la conexión</p>;
  }
  if (error?.message.includes('Chain not configured')) {
    return <p>Red no soportada</p>;
  }
  // ... más casos
}
```

### 2. Persistencia de Sesión

Wagmi + Web3Modal manejan automáticamente:
- Reconnect en page reload
- Almacenamiento en localStorage/cookies
- State sync entre tabs

```typescript
// wagmi.ts
export const config = defaultWagmiConfig({
  // ...
  storage: createStorage({
    storage: cookieStorage // o localStorage
  }),
  ssr: true // importante para Next.js
});
```

### 3. Network Switching UX

```typescript
'use client';
import { useAccount, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';

export function RequireBaseNetwork({ children }: { children: React.ReactNode }) {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  if (chain?.id !== base.id) {
    return (
      <div>
        <p>Esta funcionalidad requiere Base Network</p>
        <button onClick={() => switchChain({ chainId: base.id })}>
          Cambiar a Base
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
```

### 4. Seguridad

**NUNCA hacer**:
```typescript
// ❌ PELIGRO: Exponer claves privadas
const privateKey = '0x...'; // NUNCA en frontend

// ❌ PELIGRO: Firmar mensajes arbitrarios sin revisar
await signer.signMessage(untrustedMessage);

// ❌ PELIGRO: Confiar en datos del cliente
const amount = userInput; // sin validación
await contract.transfer(recipient, amount);
```

**SÍ hacer**:
```typescript
// ✅ Validar antes de firmar
const message = await validateMessage(input);
await signer.signMessage(message);

// ✅ Usar límites y confirmaciones
if (amount > LARGE_AMOUNT_THRESHOLD) {
  const confirmed = await confirmLargeTransaction();
  if (!confirmed) return;
}

// ✅ Verificar direcciones
import { isAddress } from 'viem';
if (!isAddress(recipientInput)) {
  throw new Error('Dirección inválida');
}
```

### 5. Performance

```typescript
// ✅ Usar React Query para caching
const { data: balance } = useBalance({
  address,
  // Configuración de cache
  staleTime: 30_000, // 30 segundos
  cacheTime: 60_000  // 1 minuto
});

// ✅ Lazy load wallets
const { open } = useWeb3Modal();
// Modal solo se carga cuando el usuario hace click
```

---

## Recursos Adicionales

- [EIP-1193: Ethereum Provider API](https://eips.ethereum.org/EIPS/eip-1193)
- [EIP-6963: Multi Injected Provider Discovery](https://eips.ethereum.org/EIPS/eip-6963)
- [WalletConnect Docs](https://docs.walletconnect.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)

---

## Siguiente Paso

Continúa con [Firma de Mensajes](./signing.md) para aprender sobre autenticación y verificación en Web3.
