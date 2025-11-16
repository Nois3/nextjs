# Web3 Developer Learning Hub

Bienvenido al recurso educativo completo de Web3 para desarrolladores senior. Este repositorio está diseñado para enseñar desde los conceptos fundamentales hasta implementaciones avanzadas de tecnologías Web3.

## 📚 Estructura del Contenido

### 1. Fundamentos (`/docs/fundamentals`)
- **Wallets & Conexión**: Arquitectura de wallets, WalletConnect, tipos de wallets
- **Firma de Mensajes**: EIP-191, EIP-712, verificación on-chain y off-chain
- **Transacciones**: Ciclo de vida, gas, estimación, tipos de transacciones
- **Smart Contracts**: ABI, llamadas read/write, eventos, logs
- **Tokens**: ERC-20, ERC-721, ERC-1155, estándares y patrones

### 2. Conceptos Avanzados (`/docs/advanced`)
- **Multicall & Batch Operations**: Optimización de múltiples llamadas
- **Account Abstraction**: ERC-4337, Smart Wallets, bundlers
- **Gasless Transactions**: Meta-transactions, relayers, patrones
- **Proxy Patterns**: Upgradeable contracts, UUPS, Transparent Proxy

### 3. Seguridad, Pentesting y Auditoría (`/docs/security`)
- **Pentesting Web3**: Reconocimiento, análisis, vectores de ataque, metodología
- **Auditoría de Smart Contracts**: Fases de auditoría, análisis manual, testing, reportes
- **Catálogo de Vulnerabilidades**: Reentrancy, overflow, access control, oracle manipulation, flash loans, DoS, signature replay
- **Herramientas de Seguridad**: Slither, Mythril, Foundry, Echidna, Certora, monitoring tools
- **Ejercicios Prácticos**: Challenges de seguridad, PoCs, auditorías completas

### 4. Protocolos DeFi (`/docs/protocols`)
- **Uniswap V3**: Swaps, pools, liquidez concentrada
- **Aave**: Lending, borrowing, flash loans
- **ENS**: Resolución de nombres, reverse records, subdomains
- **Base & L2s**: Optimistic rollups, bridging, diferencias con L1

### 5. Patrones de Arquitectura (`/docs/patterns`)
- **State Management**: Patrones de gestión de estado en dApps
- **Error Handling**: Manejo robusto de errores en Web3
- **Testing**: Unit tests, integration tests, fork testing
- **Performance**: Optimización, caching, RPC management
- **Security Best Practices**: Auditoría, validación, sandboxing

### 6. Ejemplos Prácticos (`/docs/examples`)
- Implementaciones reales de cada concepto
- Código comentado y explicado
- Casos de uso del mundo real
- Troubleshooting común

## 🎯 Tecnologías Implementadas

- **Next.js 15**: App Router, Server Components, Server Actions
- **Wagmi v2**: React hooks para Ethereum
- **Viem**: Cliente TypeScript para Ethereum
- **WalletConnect v5**: Protocolo de conexión universal
- **OnchainKit**: Herramientas de Coinbase para Base
- **Farcaster**: Protocolo social descentralizado

## 🚀 Ruta de Aprendizaje Sugerida

### Para Desarrolladores con Experiencia en Web2:
1. Comienza con `/docs/fundamentals/wallets.md`
2. Continúa con `/docs/fundamentals/transactions.md`
3. Explora los ejemplos en `/app/` mientras lees la documentación
4. Experimenta con los conceptos avanzados
5. Implementa tus propias features siguiendo los patrones

### Para Desarrolladores con Experiencia en Web3:
1. Revisa `/docs/patterns/` para arquitectura moderna
2. Explora `/docs/protocols/` para integraciones DeFi
3. Estudia `/docs/advanced/` para técnicas avanzadas
4. **NUEVO**: Profundiza en `/docs/security/` para pentesting y auditoría
5. Contribuye con nuevos ejemplos y mejoras

### Para Auditores y Security Researchers:
1. Empieza con `/docs/security/vulnerabilities.md` - Catálogo completo
2. Aprende herramientas en `/docs/security/tools.md`
3. Aplica metodología de `/docs/security/pentest.md`
4. Realiza auditorías siguiendo `/docs/security/audit.md`
5. Practica con ejercicios de seguridad

## 📖 Cómo Usar Este Repositorio

Cada sección contiene:
- **Documentación teórica**: Conceptos explicados en profundidad
- **Código funcional**: Implementaciones reales en `/app/`
- **Comentarios inline**: Explicaciones directas en el código
- **Referencias**: Links a especificaciones, EIPs, y recursos externos
- **Ejercicios**: Desafíos opcionales para practicar

## 🔧 Stack Tecnológico

```
Frontend:      Next.js 15 + React 18 + TypeScript
Web3 Layer:    wagmi + viem + @tanstack/react-query
Wallets:       WalletConnect v5 + Web3Modal
Networks:      Ethereum, Base, Polygon, Arbitrum, Optimism
Protocols:     Uniswap, ENS, Farcaster
Tools:         OnchainKit, ethers (compatibility)
```

## 💡 Filosofía del Proyecto

Este repositorio asume que eres un desarrollador senior y por lo tanto:
- Prioriza **profundidad sobre amplitud**
- Explica el **porqué**, no solo el **cómo**
- Muestra **patrones de producción**, no solo demos
- Incluye **consideraciones de seguridad** en cada feature
- Documenta **trade-offs** y decisiones arquitectónicas
- Proporciona **contexto histórico** (por qué existen ciertos estándares)

## 🎓 Contribuir

Este es un recurso vivo. Si encuentras errores, mejoras, o quieres agregar nuevos módulos educativos, las contribuciones son bienvenidas.

## 📝 Licencia

MIT - Úsalo libremente para aprender y enseñar.

---

**Nota**: Este repositorio está enfocado en educación. Para producción, siempre audita el código, usa testnets primero, y sigue las mejores prácticas de seguridad.
