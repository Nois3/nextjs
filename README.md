# 🔗 Wallet Tester - WalletConnect, Base & Farcaster

Una aplicación moderna de Next.js 15 para probar conexiones de wallets, visualizar saldos y realizar intercambios de tokens. Incluye integración con WalletConnect, Base (Coinbase L2) y contexto de Farcaster.

## ✨ Características

- **🔌 Conexión de Wallets**: Soporte para múltiples wallets a través de WalletConnect
  - MetaMask
  - Coinbase Wallet
  - WalletConnect (cualquier wallet compatible)
  - Rainbow, Trust Wallet y más

- **💰 Visualización de Saldos**:
  - Saldos nativos (ETH, etc.)
  - Tokens ERC-20 en Base
  - Múltiples redes soportadas

- **🔄 Swap de Tokens**:
  - Interfaz de demostración para intercambio de tokens
  - Preparado para integración con Uniswap/1inch

- **🟣 Integración Farcaster**:
  - Contexto de autenticación Farcaster
  - Firma de mensajes
  - Identidad descentralizada

- **🔵 Base Network**:
  - Integración completa con OnchainKit
  - Soporte nativo para Base L2
  - Registro de aplicaciones (demo)

## 🚀 Instalación

### Prerequisitos

- Node.js 18+
- npm o yarn
- Una wallet Web3 (MetaMask, Coinbase Wallet, etc.)

### Pasos

1. **Clonar el repositorio**
\`\`\`bash
git clone <tu-repositorio>
cd nextjs
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. **Obtener WalletConnect Project ID**
   - Visita https://cloud.walletconnect.com
   - Crea un nuevo proyecto
   - Copia el Project ID
   - Pégalo en \`.env.local\`:
     \`\`\`
     NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_project_id_aqui
     \`\`\`

5. **(Opcional) Obtener OnchainKit API Key**
   - Visita https://portal.cdp.coinbase.com/
   - Crea una cuenta y genera un API Key
   - Agrégalo a \`.env.local\`:
     \`\`\`
     NEXT_PUBLIC_ONCHAINKIT_API_KEY=tu_api_key_aqui
     \`\`\`

6. **Ejecutar el servidor de desarrollo**
\`\`\`bash
npm run dev
\`\`\`

7. **Abrir en el navegador**
   - Navega a http://localhost:3000

## 📁 Estructura del Proyecto

\`\`\`
nextjs/
├── app/                      # App Router de Next.js 15
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Página de inicio
│   ├── providers.tsx        # Providers de Web3 y contextos
│   ├── globals.css          # Estilos globales
│   ├── connect/             # Página de conexión de wallet
│   ├── balances/            # Página de visualización de saldos
│   ├── swap/                # Página de swap de tokens
│   ├── farcaster/           # Integración con Farcaster
│   └── base/                # Información de Base network
├── config/
│   └── wagmi.ts             # Configuración de wagmi y Web3Modal
├── contexts/
│   ├── FarcasterContext.tsx # Contexto de Farcaster
│   └── BaseContext.tsx      # Contexto de Base
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
\`\`\`

## 🛠️ Tecnologías Utilizadas

- **Next.js 15**: Framework de React con App Router
- **React 18**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **wagmi**: Hooks de React para Ethereum
- **viem**: Cliente de Ethereum ligero
- **Web3Modal v5**: UI para conexión de wallets
- **@coinbase/onchainkit**: Herramientas para Base
- **@tanstack/react-query**: Manejo de estado asíncrono

## 🌐 Redes Soportadas

- **Ethereum Mainnet** (Chain ID: 1)
- **Base** (Chain ID: 8453)
- **Polygon** (Chain ID: 137)
- **Arbitrum** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)

## 📖 Uso

### Conectar una Wallet

1. Ve a la página "Conectar Wallet"
2. Haz clic en "Conectar Wallet"
3. Selecciona tu wallet preferida del modal
4. Aprueba la conexión en tu wallet

### Ver Saldos

1. Conecta tu wallet primero
2. Ve a la página "Ver Saldos"
3. Visualiza tu saldo nativo y tokens ERC-20 (en Base)

### Realizar un Swap (Demo)

1. Conecta tu wallet
2. Ve a la página "Swap Tokens"
3. Selecciona los tokens de origen y destino
4. Ingresa la cantidad
5. Haz clic en "Swap"

**Nota**: La funcionalidad de swap es una demostración. Para producción, integra con Uniswap, 1inch u otro DEX.

### Farcaster Integration

1. Ve a la página "Farcaster"
2. Haz clic en "Conectar con Farcaster"
3. Prueba la firma de mensajes

**Nota**: Esta es una demostración. Para producción, usa Farcaster Auth Kit.

### Base Network

1. Conecta tu wallet
2. Ve a la página "Base"
3. Cambia a la red Base si no estás conectado
4. Explora la información de Base y registra una app (demo)

## 🔐 Seguridad

- Nunca compartas tus claves privadas
- Revisa siempre las transacciones antes de firmar
- Usa redes de prueba para desarrollo
- Las variables de entorno deben mantenerse seguras

## 🚧 Próximas Mejoras

- [ ] Integración real con Uniswap para swaps
- [ ] Soporte para más tokens ERC-20
- [ ] Integración completa con Farcaster Auth Kit
- [ ] Histórico de transacciones
- [ ] Soporte para NFTs
- [ ] Tests unitarios y e2e
- [ ] Optimización de rendimiento

## 🐛 Solución de Problemas

### Error: "No matching version found for @farcaster/auth-kit"
- La integración de Farcaster usa un contexto personalizado por ahora
- Para producción, instala manualmente la versión correcta del paquete

### Error: "WalletConnect Project ID is not set"
- Asegúrate de haber creado el archivo \`.env.local\`
- Copia el \`.env.example\` y agrega tu Project ID

### La app no se conecta a mi wallet
- Verifica que tu wallet esté instalada y desbloqueada
- Prueba refrescar la página
- Limpia el caché del navegador

## 📄 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas:
- Abre un issue en GitHub
- Revisa la documentación de las tecnologías utilizadas

## 🔗 Links Útiles

- [Next.js Documentation](https://nextjs.org/docs)
- [wagmi Documentation](https://wagmi.sh)
- [WalletConnect Cloud](https://cloud.walletconnect.com)
- [Base Documentation](https://docs.base.org)
- [OnchainKit](https://onchainkit.xyz)
- [Farcaster](https://www.farcaster.xyz)

---

Hecho con ❤️ usando Next.js 15, WalletConnect y Base
