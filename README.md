# 📚 Web3 Learning Hub

> **Recurso educativo completo de Web3 para desarrolladores senior**

Una aplicación moderna de Next.js 15 diseñada para enseñar desarrollo Web3 desde conceptos fundamentales hasta integraciones avanzadas con protocolos DeFi. Incluye implementaciones reales, documentación exhaustiva, y ejemplos prácticos de producción.

![Next.js 15](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Wagmi](https://img.shields.io/badge/Wagmi-2.12-purple)
![Viem](https://img.shields.io/badge/Viem-2.21-green)

---

## 🎯 Objetivos del Proyecto

Este repositorio está diseñado para:

- ✅ **Enseñar Web3** desde la perspectiva de desarrolladores senior
- ✅ **Mostrar patrones de producción**, no solo demos o tutoriales básicos
- ✅ **Explicar el "porqué"**, no solo el "cómo"
- ✅ **Documentar decisiones arquitectónicas** y trade-offs
- ✅ **Incluir consideraciones de seguridad** en cada módulo
- ✅ **Proporcionar código funcional** con explicaciones inline

---

## 📖 Módulos Educativos

### 🔐 Firma de Mensajes (EIP-191 & EIP-712)
**Ruta**: `/signing` | **Docs**: [`/docs/fundamentals/signing.md`](./docs/fundamentals/signing.md)

Aprende sobre:
- Personal Sign (EIP-191): Firma simple de mensajes
- Typed Data Sign (EIP-712): Datos estructurados
- Sign-In with Ethereum (SIWE - EIP-4361)
- Verificación on-chain vs off-chain
- Casos de uso: Autenticación, meta-transactions, off-chain orders

**Implementación**: Componente funcional con ejemplos de firma y verificación en tiempo real.

---

### 🖼️ NFTs (ERC-721 & ERC-1155)
**Ruta**: `/nfts` | **Docs**: [`/docs/fundamentals/nfts.md`](./docs/fundamentals/nfts.md)

Aprende sobre:
- ERC-721: Tokens únicos e indivisibles
- ERC-1155: Multi-token standard (fungibles + no-fungibles)
- Metadata & IPFS: Almacenamiento descentralizado
- Minting, transferencias, approvals
- Cómo funcionan los marketplaces (OpenSea, etc.)
- Batch operations con ERC-1155

**Implementación**: Explorador de NFTs con lectura de metadata en tiempo real desde IPFS.

---

### 🔄 Swaps & DEX (Uniswap V3)
**Ruta**: `/swap` | **Docs**: [`/docs/protocols/uniswap.md`](./docs/protocols/uniswap.md)

Aprende sobre:
- AMM (Automated Market Maker): Fórmula x * y = k
- Liquidez concentrada (innovación de V3)
- Slippage protection y price impact
- Cotizaciones con Quoter
- Swaps exactInput vs exactOutput
- Multi-hop swaps y routing
- Fee tiers (0.01%, 0.05%, 0.3%, 1%)

**Implementación**: Interfaz completa de swap con código real de Uniswap V3 (educativo, no ejecuta transacciones).

---

### 👛 Wallets & Conexión
**Ruta**: `/connect` | **Docs**: [`/docs/fundamentals/wallets.md`](./docs/fundamentals/wallets.md)

Aprende sobre:
- Tipos de wallets (browser, mobile, hardware, smart contract)
- WalletConnect protocol v2/v5
- EIP-1193: Ethereum Provider API
- EIP-6963: Multi Injected Provider Discovery
- Custodia de claves: Self-custody vs custodial
- Best practices de seguridad

**Implementación**: Integración completa con Web3Modal v5 + Wagmi v2.

---

### 💰 Tokens & Balances (ERC-20)
**Ruta**: `/balances`

Aprende sobre:
- ERC-20 token standard
- Lectura de smart contracts con wagmi
- Decimals, formateo, y conversiones
- Approvals y allowances
- Balance queries multi-chain

**Implementación**: Dashboard de balances con soporte para múltiples tokens y redes.

---

### 🌐 Protocolos Web3

#### 🟣 Farcaster
**Ruta**: `/farcaster`

Protocolo social descentralizado:
- Autenticación descentralizada
- Firma de mensajes para redes sociales Web3
- Perfil de usuario on-chain

#### 🔵 Base Network (Coinbase L2)
**Ruta**: `/base`

Layer 2 Optimistic Rollup:
- OnchainKit integration
- Diferencias con Ethereum mainnet
- Bridging y transacciones L2

---

## 📁 Estructura del Proyecto

```
web3-learning-hub/
├── app/                          # Next.js 15 App Router
│   ├── page.tsx                 # Home (índice de módulos)
│   ├── layout.tsx               # Layout raíz
│   ├── providers.tsx            # Web3 providers (wagmi, OnchainKit)
│   ├── globals.css              # Estilos globales
│   │
│   ├── signing/                 # 🔐 Módulo de firma de mensajes
│   │   └── page.tsx
│   ├── nfts/                    # 🖼️ Módulo de NFTs
│   │   └── page.tsx
│   ├── swap/                    # 🔄 Módulo de swaps
│   │   └── page.tsx
│   ├── connect/                 # 👛 Conexión de wallets
│   │   └── page.tsx
│   ├── balances/                # 💰 Visualización de balances
│   │   └── page.tsx
│   ├── farcaster/               # 🟣 Farcaster
│   │   └── page.tsx
│   └── base/                    # 🔵 Base Network
│       └── page.tsx
│
├── docs/                         # 📚 Documentación educativa
│   ├── README.md                # Índice de documentación
│   ├── fundamentals/            # Conceptos fundamentales
│   │   ├── wallets.md          # Wallets & Conexión
│   │   ├── signing.md          # Firma de mensajes
│   │   └── nfts.md             # NFTs completo
│   ├── protocols/               # Protocolos DeFi
│   │   └── uniswap.md          # Uniswap V3
│   ├── advanced/                # Conceptos avanzados
│   ├── patterns/                # Patrones de arquitectura
│   └── examples/                # Ejemplos prácticos
│
├── config/
│   └── wagmi.ts                 # Configuración de wagmi + Web3Modal
├── contexts/
│   ├── FarcasterContext.tsx     # Contexto de Farcaster
│   └── BaseContext.tsx          # Contexto de Base
│
├── package.json                 # Dependencias
├── tsconfig.json                # TypeScript config
├── next.config.js               # Next.js config
└── .env.example                 # Variables de entorno requeridas
```

---

## 🚀 Instalación & Setup

### Prerequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **npm** o **yarn**
- **Wallet Web3**: MetaMask, Coinbase Wallet, Rainbow, etc.

### Pasos

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd nextjs
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

4. **Obtener WalletConnect Project ID** (REQUERIDO)
   - Visita [WalletConnect Cloud](https://cloud.walletconnect.com)
   - Crea un proyecto gratuito
   - Copia tu Project ID
   - Agrégalo a `.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_project_id_aqui
   ```

5. **(Opcional) Obtener OnchainKit API Key**
   - Visita [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
   - Genera un API Key
   - Agrégalo a `.env.local`:
   ```
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=tu_api_key_aqui
   ```

6. **Ejecutar servidor de desarrollo**
```bash
npm run dev
```

7. **Abrir en navegador**
   - Navega a [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15**: App Router, React Server Components
- **React 18**: Hooks, Context API
- **TypeScript**: Type safety completo
- **CSS**: Custom (Tailwind-like utilities)

### Web3
- **Wagmi v2**: React hooks para Ethereum
- **Viem v2**: Cliente TypeScript (reemplazo moderno de ethers)
- **@tanstack/react-query v5**: State management
- **WalletConnect v5**: Conexión universal de wallets
- **Web3Modal v5**: UI de conexión
- **OnchainKit**: Herramientas de Coinbase para Base

### Redes Soportadas
- Ethereum Mainnet
- Base (Coinbase L2)
- Polygon
- Arbitrum
- Optimism

---

## 📚 Guía de Uso

### Ruta de Aprendizaje Sugerida

#### Para Desarrolladores Web2 → Web3:

1. **Conectar Wallet** (`/connect`)
   - Entiende qué es una wallet y cómo funciona
   - Lee `/docs/fundamentals/wallets.md`

2. **Ver Balances** (`/balances`)
   - Aprende sobre ERC-20 y lectura de contratos
   - Experimenta con múltiples redes

3. **Firma de Mensajes** (`/signing`)
   - Fundamental para autenticación Web3
   - Lee `/docs/fundamentals/signing.md`

4. **NFTs** (`/nfts`)
   - Explora tokens no fungibles
   - Lee `/docs/fundamentals/nfts.md`

5. **Swaps** (`/swap`)
   - Entiende cómo funcionan los DEX
   - Lee `/docs/protocols/uniswap.md`

#### Para Desarrolladores con Experiencia Web3:

1. Revisa `/docs/patterns/` para patrones modernos
2. Explora `/docs/protocols/` para integraciones DeFi
3. Estudia `/docs/advanced/` para técnicas avanzadas
4. Contribuye con nuevos módulos y ejemplos

---

## 🔒 Seguridad

Este proyecto es **educativo** y está diseñado para aprendizaje. Antes de usar en producción:

- ✅ **Audita todo el código**
- ✅ **Prueba en testnets primero** (Sepolia, Goerli, Base Sepolia)
- ✅ **Nunca expongas claves privadas** en código o variables de entorno del cliente
- ✅ **Valida inputs del usuario** siempre
- ✅ **Usa límites de aprobación** (no approvals infinitas sin consentimiento)
- ✅ **Implementa rate limiting** en producción
- ✅ **Monitorea transacciones** para actividad sospechosa

### Notas de Seguridad por Módulo

- **Swaps**: Los swaps reales están deshabilitados. El código muestra la implementación pero no ejecuta transacciones.
- **Firma**: Nunca firmes mensajes sin revisar el contenido. Usa EIP-712 cuando sea posible.
- **NFTs**: Verifica siempre los contratos antes de hacer mint o compras.
- **Approvals**: Revoca approvals innecesarias en [Revoke.cash](https://revoke.cash/)

---

## 🎓 Filosofía Educativa

Este repositorio asume que eres un **desarrollador senior** y por lo tanto:

### Profundidad sobre Amplitud
- Preferimos explicar un concepto a fondo que cubrir 20 superficialmente
- Cada módulo incluye teoría, implementación, y casos de uso reales

### Explicar el "Porqué"
- No solo "cómo hacer X", sino "por qué X existe"
- Contexto histórico (e.g., por qué EIP-712 mejora sobre EIP-191)
- Trade-offs y decisiones arquitectónicas

### Patrones de Producción
- Código que podrías usar en producción (con ajustes)
- Manejo de errores robusto
- Type safety completo
- Performance optimization

### Consideraciones de Seguridad
- Cada feature incluye sección de seguridad
- Vectores de ataque comunes
- Mitigaciones y best practices

### Contexto y Referencias
- Links a EIPs originales
- Documentación oficial de protocolos
- Artículos técnicos y whitepapers

---

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Build de producción
npm run build
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Este es un recurso educativo vivo.

### Cómo Contribuir

1. **Fork** el repositorio
2. **Crea una branch**: `git checkout -b feature/nuevo-modulo`
3. **Commit** tus cambios: `git commit -m 'Add: nuevo módulo de Account Abstraction'`
4. **Push**: `git push origin feature/nuevo-modulo`
5. **Abre un Pull Request**

### Ideas para Contribuciones

- ✅ Nuevos módulos educativos (ENS, Aave, Compound, etc.)
- ✅ Más documentación en `/docs`
- ✅ Traducciones a otros idiomas
- ✅ Mejoras a la UI/UX
- ✅ Tests unitarios y de integración
- ✅ Correcciones de errores o typos

---

## 📝 Roadmap

### ✅ Completado
- [x] Estructura base del proyecto
- [x] Integración WalletConnect + Web3Modal
- [x] Módulo de Firma de Mensajes
- [x] Módulo de NFTs
- [x] Módulo de Swaps (Uniswap V3)
- [x] Documentación fundamental

### 🚧 En Progreso
- [ ] Módulo de ENS (Ethereum Name Service)
- [ ] Ejemplos de Multicall & Batch Transactions
- [ ] Patrones de arquitectura avanzados

### 📋 Planeado
- [ ] Account Abstraction (ERC-4337)
- [ ] Integración con Aave (Lending/Borrowing)
- [ ] Gasless Transactions (Meta-transactions)
- [ ] DAO Governance (Voting, Proposals)
- [ ] Testing (Unit & Integration tests)
- [ ] CI/CD Pipeline
- [ ] Despliegue a Vercel/Netlify

---

## 📄 Licencia

MIT License - Úsalo libremente para aprender, enseñar, y construir.

---

## 🙏 Agradecimientos

Este proyecto fue construido con:

- [Next.js](https://nextjs.org/)
- [Wagmi](https://wagmi.sh/)
- [Viem](https://viem.sh/)
- [WalletConnect](https://walletconnect.com/)
- [OnchainKit](https://onchainkit.xyz/)
- [Uniswap](https://uniswap.org/)

Y la increíble comunidad de desarrollo Web3.

---

## 📞 Contacto & Soporte

- **Issues**: [GitHub Issues](tu-repo/issues)
- **Discussions**: [GitHub Discussions](tu-repo/discussions)
- **Twitter**: [@tu-handle](https://twitter.com/tu-handle)

---

## ⚠️ Disclaimer

Este proyecto es **solo para fines educativos**. El código no ha sido auditado profesionalmente. Úsalo bajo tu propio riesgo. Los autores no se hacen responsables por pérdida de fondos o problemas de seguridad derivados del uso de este código.

---

**Construido con ❤️ para la comunidad Web3**
