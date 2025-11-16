# Seguridad Web3: Pentesting y Auditoría

## Introducción

Esta sección del curso está dedicada a la seguridad en el ecosistema Web3, cubriendo desde pentesting básico hasta auditoría profesional de smart contracts. El contenido está diseñado para desarrolladores senior que quieren especializarse en seguridad blockchain.

## 🎯 Objetivos de Aprendizaje

Al completar esta sección, serás capaz de:

- **Identificar vulnerabilidades** comunes en smart contracts
- **Realizar pentesting** completo de aplicaciones Web3
- **Ejecutar auditorías** profesionales de código Solidity
- **Utilizar herramientas** de análisis estático y dinámico
- **Escribir tests** de seguridad comprehensivos
- **Implementar mitigaciones** efectivas
- **Generar reportes** de seguridad profesionales

## 📚 Estructura del Contenido

### 1. Pentesting Web3 (`pentest.md`)

Aprende a realizar pentesting de aplicaciones Web3:

- **Reconocimiento**: Mapeo de contratos y arquitectura
- **Análisis de smart contracts**: Decompilación, fuzzing, análisis
- **Vectores de ataque**: Reentrancy, overflow, oracle manipulation
- **Herramientas**: Slither, Mythril, Echidna, Foundry
- **Metodología**: Checklist completo de pentesting
- **Reporting**: Templates de reportes de findings

**Empieza aquí si**: Quieres aprender a atacar y defender aplicaciones Web3

### 2. Auditoría de Smart Contracts (`audit.md`)

Metodología completa de auditoría profesional:

- **Fases de auditoría**: Preparación, análisis, testing, reporte
- **Análisis manual**: Revisión línea por línea, arquitectura
- **Testing**: Property-based, fuzzing, invariant testing
- **Categorías de vulnerabilidades**: Catálogo completo
- **Reporte**: Estructura profesional de audit reports
- **Post-audit**: Re-auditoría y monitoreo continuo

**Empieza aquí si**: Quieres convertirte en auditor profesional

### 3. Catálogo de Vulnerabilidades (`vulnerabilities.md`)

Referencia completa de vulnerabilidades Web3:

- **Reentrancy**: Single-function, cross-function, read-only
- **Integer issues**: Overflow, underflow, precision loss
- **Access control**: Missing modifiers, tx.origin, initializers
- **Front-running**: MEV, sandwich attacks, displacement
- **Oracle manipulation**: Spot price, TWAP, multi-oracle
- **Flash loans**: Attack patterns y mitigaciones
- **DoS**: Unbounded loops, gas griefing
- **Signature replay**: Nonces, EIP-712
- **Delegatecall**: Injection y storage collisions
- **Randomness**: Fuentes predecibles

Cada vulnerabilidad incluye:
- Descripción técnica
- Código vulnerable
- Exploit real
- Casos históricos (con montos robados)
- Mitigaciones efectivas

**Empieza aquí si**: Quieres una referencia rápida de vulnerabilidades

### 4. Herramientas de Seguridad (`tools.md`)

Guía completa de herramientas:

**Análisis Estático**:
- Slither: Detección rápida de vulnerabilidades
- Mythril: Análisis simbólico profundo
- Aderyn: Análisis rápido para Foundry

**Testing & Fuzzing**:
- Foundry: Testing integral, fuzzing, invariants
- Echidna: Property-based fuzzing
- Medusa: Fuzzing paralelo

**Formal Verification**:
- Certora Prover: Garantías matemáticas
- Halmos: Symbolic testing

**Monitoring**:
- Tenderly: Debugging y simulaciones
- Forta: Threat detection en tiempo real
- OpenZeppelin Defender: Automated operations

Incluye:
- Instalación y configuración
- Ejemplos de uso
- Configuración avanzada
- Integración CI/CD
- Custom detectors

**Empieza aquí si**: Quieres aprender a usar herramientas de seguridad

## 🎓 Ruta de Aprendizaje Recomendada

### Para Principiantes en Seguridad Web3:

1. **Semana 1-2**: Fundamentos
   - Lee `vulnerabilities.md` completo
   - Entiende cada tipo de vulnerabilidad
   - Estudia los exploits históricos

2. **Semana 3-4**: Herramientas
   - Instala herramientas de `tools.md`
   - Ejecuta Slither en proyectos existentes
   - Practica con Foundry testing

3. **Semana 5-6**: Pentesting
   - Sigue metodología de `pentest.md`
   - Realiza pentesting de contratos públicos
   - Escribe PoCs de vulnerabilidades

4. **Semana 7-8**: Auditoría
   - Estudia `audit.md`
   - Audita proyectos open source
   - Escribe tu primer audit report

### Para Auditores Experimentados:

1. **Referencia Rápida**:
   - Usa `vulnerabilities.md` como checklist
   - Consulta `tools.md` para herramientas específicas

2. **Metodología**:
   - Sigue proceso de `audit.md`
   - Adapta templates de reportes

3. **Pentesting**:
   - Aplica técnicas de `pentest.md`
   - Automatiza con scripts personalizados

## 🛠️ Ejercicios Prácticos

### Ejercicio 1: Detectar Reentrancy

```solidity
// Encuentra y explota la vulnerabilidad
contract VulnerableVault {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint256 balance = balances[msg.sender];
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success);
        balances[msg.sender] = 0;
    }
}

// TODO: Escribe un contrato atacante
// TODO: Escribe el fix
// TODO: Escribe tests que detecten el bug
```

**Recursos**: `vulnerabilities.md#reentrancy`, `pentest.md#vectores-de-ataque`

### Ejercicio 2: Oracle Manipulation

```solidity
// Encuentra cómo manipular el precio
contract SimpleLending {
    IUniswapV2Pair public priceFeed;

    function getCollateralValue(uint256 amount) public view returns (uint256) {
        (uint112 r0, uint112 r1,) = priceFeed.getReserves();
        uint256 price = (uint256(r1) * 1e18) / uint256(r0);
        return amount * price / 1e18;
    }

    function borrow(uint256 collateralAmount) public {
        uint256 value = getCollateralValue(collateralAmount);
        // ... borrowing logic
    }
}

// TODO: Escribe un ataque con flash loan
// TODO: Implementa TWAP como fix
// TODO: Escribe tests de fuzzing
```

**Recursos**: `vulnerabilities.md#oracle-manipulation`, `audit.md#oracle-testing`

### Ejercicio 3: Audit Completo

Audita este protocolo completo:

```bash
git clone https://github.com/vulnerable-defi-protocol/example
cd example

# TODO: Ejecutar análisis estático
# TODO: Revisar código manualmente
# TODO: Escribir tests de seguridad
# TODO: Generar audit report
```

**Recursos**: `audit.md`, `tools.md`, `pentest.md#checklist`

## 📊 Niveles de Severidad

Usamos esta clasificación para vulnerabilidades:

- 🔴 **CRITICAL**: Pérdida directa de fondos, control total del contrato
- 🟠 **HIGH**: Pérdida de fondos bajo condiciones específicas
- 🟡 **MEDIUM**: Funcionalidad comprometida, potencial pérdida
- 🟢 **LOW**: Mal funcionamiento menor, gas inefficiencies
- ⚪ **INFO**: Mejores prácticas, optimizaciones

## 🔗 Recursos Externos

### Bases de Datos de Vulnerabilidades
- [SWC Registry](https://swcregistry.io/) - Smart Contract Weakness Classification
- [Rekt News](https://rekt.news/) - Postmortems de hacks
- [DeFiHackLabs](https://github.com/SunWeb3Sec/DeFiHackLabs) - Reproducciones de hacks

### Guías y Best Practices
- [Consensys Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Secureum](https://secureum.substack.com/) - Bootcamp y audits
- [Trail of Bits](https://github.com/crytic/building-secure-contracts) - Building Secure Contracts

### Audit Reports
- [Solodit](https://solodit.xyz/) - Database de audit findings
- [Code4rena](https://code4rena.com/) - Competitive audits
- [Sherlock](https://www.sherlock.xyz/) - Audit contests
- [Immunefi](https://immunefi.com/) - Bug bounties

### Comunidades
- [Secureum Discord](https://discord.gg/secureum)
- [OpenZeppelin Forum](https://forum.openzeppelin.com/)
- [Ethereum Security](https://t.me/ethsecurity) - Telegram

## 🏆 Certificaciones y Carrera

### Certificaciones
- **Secureum RACE**: Security audit bootcamp
- **Cyfrin Updraft**: Security courses
- **OpenZeppelin Auditor**: Certification program

### Plataformas de Práctica
- **Ethernaut**: Gamified security challenges
- **Damn Vulnerable DeFi**: DeFi security scenarios
- **Capture the Ether**: Ethereum security game

### Carrera como Auditor
1. **Junior Auditor** ($60k-$100k/año)
   - Análisis con herramientas
   - Revisión de código guiada
   - Tests de seguridad

2. **Senior Auditor** ($100k-$200k/año)
   - Auditorías completas independientes
   - Detección de vulnerabilidades complejas
   - Mentoreo de juniors

3. **Lead Auditor** ($200k-$400k+/año)
   - Auditorías de protocolos críticos
   - Arquitectura de seguridad
   - Research de nuevas vulnerabilidades

4. **Security Researcher** ($$$)
   - Bug bounties (hasta $10M por finding)
   - Formal verification
   - Tool development

## 💡 Consejos para Auditores

### Durante la Auditoría

1. **No confíes en nada**
   - Asume que todo puede ser malicioso
   - Verifica todas las suposiciones
   - Lee el código, no la documentación

2. **Piensa como atacante**
   - ¿Cómo podrías explotar esto?
   - ¿Qué pasa en edge cases?
   - ¿Y si las suposiciones son falsas?

3. **Documenta todo**
   - Toma notas mientras lees
   - Marca líneas sospechosas
   - Escribe preguntas para el equipo

4. **No te apures**
   - La seguridad toma tiempo
   - Mejor thorough que fast
   - Un bug missed puede costar millones

### Escribiendo el Reporte

1. **Sé claro y preciso**
   - Explica técnicamente
   - Incluye PoC funcional
   - Sugiere fix específico

2. **Prioriza correctamente**
   - No todo es CRITICAL
   - Usa matriz de Impact × Likelihood
   - Separa vulnerabilidades de code quality

3. **Sé profesional**
   - No condescendiente
   - No defensivo si te disputan
   - Focus en mejorar el código

## 🚨 Nota Importante

Este contenido es **solo para fines educativos**:

- ✅ Usa para aprender seguridad
- ✅ Audita con permiso del equipo
- ✅ Reporta bugs responsiblemente
- ✅ Participa en bug bounties legales

- ❌ NO ataques contratos sin permiso
- ❌ NO exploites vulnerabilidades en producción
- ❌ NO uses conocimiento para robar fondos

**Siempre opera éticamente. La seguridad es para defender, no atacar.**

## 📞 Contribuciones

¿Encontraste un error? ¿Tienes sugerencias?

- Abre un issue en GitHub
- Propón mejoras vía PR
- Comparte tus ejercicios de práctica

---

**¡Buena suerte en tu journey como security researcher!** 🔐
