# Auditoría de Smart Contracts: Guía Profesional

## Introducción

La auditoría de smart contracts es un proceso sistemático y exhaustivo para identificar vulnerabilidades, bugs, y malas prácticas en código on-chain. A diferencia del pentesting (que simula ataques), la auditoría se enfoca en revisión comprehensiva del código, arquitectura, y lógica de negocio.

## 1. Fases de una Auditoría Profesional

### 1.1 Fase de Preparación (Pre-audit)

#### Documentos Requeridos
```markdown
## Checklist de Información Necesaria

- [ ] Código fuente completo (repositorio Git)
- [ ] Documentación técnica
- [ ] Whitepaper o especificación del protocolo
- [ ] Diagramas de arquitectura
- [ ] Casos de uso y user flows
- [ ] Tests existentes (unit, integration, fork)
- [ ] Contratos ya desplegados (si existen)
- [ ] Scope específico del audit
- [ ] Timeline y expectativas
```

#### Configurar Entorno de Auditoría

```bash
# Clonar repositorio
git clone <repo-url>
cd project

# Instalar dependencias
npm install
# o
forge install

# Compilar contratos
npx hardhat compile
# o
forge build

# Ejecutar tests existentes
npx hardhat test
# o
forge test -vvv

# Generar coverage
forge coverage --report lcov
genhtml lcov.info -o coverage
```

### 1.2 Análisis Automático (15% del tiempo)

```bash
#!/bin/bash
# automated-audit-scan.sh

echo "🔍 Running automated security scans..."

# Slither
echo "\n📊 Running Slither..."
slither . --print human-summary > reports/slither-summary.txt
slither . --json reports/slither.json
slither . --checklist > reports/slither-checklist.md

# Mythril
echo "\n🔮 Running Mythril..."
for file in contracts/*.sol; do
    echo "Analyzing $file..."
    myth analyze "$file" --solc-json mythril.config.json \
        -o markdown > "reports/mythril-$(basename $file .sol).md"
done

# Aderyn (Rust-based analyzer)
echo "\n🦀 Running Aderyn..."
aderyn . --output reports/aderyn-report.md

# Semgrep (pattern matching)
echo "\n🎯 Running Semgrep..."
semgrep --config=p/smart-contracts --json -o reports/semgrep.json .

# Custom static analysis
echo "\n🔬 Running custom checks..."
python3 scripts/custom-analyzer.py

echo "\n✅ Automated scans complete. Check reports/ directory."
```

### 1.3 Análisis Manual (70% del tiempo)

#### Revisión de Arquitectura

```typescript
// audit-architecture-review.ts
interface ArchitectureAnalysis {
  contracts: ContractInfo[]
  relationships: ContractRelationship[]
  dataFlow: DataFlowDiagram
  trustBoundaries: TrustBoundary[]
  upgradeability: UpgradePattern | null
  accessControl: AccessControlModel
}

interface ContractInfo {
  name: string
  purpose: string
  inheritances: string[]
  dependencies: string[]
  stateVariables: StateVariable[]
  externalFunctions: Function[]
  events: Event[]
  modifiers: Modifier[]
}

async function analyzeArchitecture(projectPath: string): Promise<ArchitectureAnalysis> {
  // 1. Parse all contracts
  const contracts = await parseAllContracts(projectPath)

  // 2. Build dependency graph
  const graph = buildDependencyGraph(contracts)

  // 3. Identify trust boundaries
  const boundaries = identifyTrustBoundaries(graph)

  // 4. Analyze upgrade patterns
  const upgradeability = detectUpgradePattern(contracts)

  // 5. Map access control
  const accessControl = mapAccessControl(contracts)

  return {
    contracts,
    relationships: graph.edges,
    dataFlow: buildDataFlow(contracts),
    trustBoundaries: boundaries,
    upgradeability,
    accessControl
  }
}

// Ejemplo de análisis de trust boundaries
function identifyTrustBoundaries(graph: DependencyGraph): TrustBoundary[] {
  const boundaries: TrustBoundary[] = []

  graph.contracts.forEach(contract => {
    // Identificar interacciones externas
    const externalCalls = contract.functions
      .filter(f => f.callsExternal)
      .map(f => ({
        from: contract.name,
        to: f.externalContract,
        function: f.name,
        riskLevel: assessRisk(f)
      }))

    if (externalCalls.length > 0) {
      boundaries.push({
        contract: contract.name,
        externalInteractions: externalCalls,
        mitigations: suggestMitigations(externalCalls)
      })
    }
  })

  return boundaries
}
```

#### Checklist de Revisión Manual

```markdown
## Smart Contract Audit Checklist

### 1. General Code Quality

- [ ] Código limpio y bien comentado
- [ ] Naming conventions consistentes
- [ ] No código muerto o comentado
- [ ] Imports organizados y necesarios
- [ ] Pragma version específico (no flotante)
- [ ] Licencia especificada

### 2. Access Control & Authorization

- [ ] Todos los privilegios documentados
- [ ] Funciones admin debidamente protegidas
- [ ] No default public visibility
- [ ] Modifiers aplicados correctamente
- [ ] Ownership transfer seguro (2-step)
- [ ] Role-based access si corresponde
- [ ] Timelocks para operaciones críticas

### 3. Input Validation

- [ ] Validación en funciones públicas/externas
- [ ] Checks de address(0)
- [ ] Validación de rangos numéricos
- [ ] Array length checks
- [ ] Validación de parámetros críticos

### 4. State Management

- [ ] State updates antes de external calls
- [ ] Checks-Effects-Interactions pattern
- [ ] No storage collisions (en proxies)
- [ ] Inicialización segura
- [ ] State consistency en upgrades

### 5. External Calls

- [ ] Protección contra reentrancy
- [ ] Manejo de return values
- [ ] Gas limits considerados
- [ ] Uso de transfer/send/call apropiado
- [ ] Address.call return value checked

### 6. Arithmetic & Logic

- [ ] No integer overflow/underflow (pre 0.8)
- [ ] División por cero prevenida
- [ ] Precision loss considerada
- [ ] Rounding favorece al protocolo
- [ ] Off-by-one errors

### 7. Gas Optimization

- [ ] Loops sin unbounded arrays
- [ ] Storage vs memory apropiado
- [ ] Packed storage variables
- [ ] Short-circuit evaluations
- [ ] Batch operations cuando posible

### 8. Events & Logging

- [ ] Eventos para cambios críticos
- [ ] Eventos indexados apropiadamente
- [ ] No información sensible en eventos
- [ ] Eventos para troubleshooting

### 9. Token Handling (ERC-20/721/1155)

- [ ] Compatibilidad con tokens no estándar
- [ ] SafeERC20 para transfers
- [ ] Approval handling correcto
- [ ] Balance checks antes de transfers
- [ ] Reentrancy en callbacks (ERC-721/1155)

### 10. Oracle & Price Feeds

- [ ] No uso de precio spot directo
- [ ] TWAP o Chainlink implementado
- [ ] Staleness checks
- [ ] Circuit breakers
- [ ] Fallback oracles

### 11. Upgradeability (si aplica)

- [ ] Storage layout preservado
- [ ] Initializers protegidos
- [ ] Gap variables para futuros upgrades
- [ ] Upgrade authorization robusta
- [ ] Rollback plan documentado

### 12. Emergency Mechanisms

- [ ] Pause functionality si necesario
- [ ] Emergency withdrawal seguro
- [ ] Timelocks apropiados
- [ ] Multisig para operaciones críticas

### 13. Testing

- [ ] Test coverage > 90%
- [ ] Edge cases cubiertos
- [ ] Fuzz testing implementado
- [ ] Invariant testing
- [ ] Fork tests contra mainnet
```

### 1.4 Análisis de Lógica de Negocio

```solidity
// Ejemplo: Auditar lógica de un AMM
contract AMMVault {
    // ⚠️ AUDIT NOTE: Revisar fórmula de pricing
    function getPrice(
        uint256 reserveA,
        uint256 reserveB
    ) public pure returns (uint256) {
        // Question: ¿Es esta la fórmula correcta?
        // ¿Qué pasa si reserveA es 0?
        // ¿Hay precision loss?
        return (reserveB * 1e18) / reserveA;
    }

    // ⚠️ AUDIT NOTE: Verificar incentivos económicos
    function addLiquidity(
        uint256 amountA,
        uint256 amountB
    ) public returns (uint256 liquidity) {
        // Question: ¿Puede un usuario manipular el ratio?
        // ¿La primera provisión de liquidez es segura?
        // ¿Hay protección contra donation attacks?

        uint256 totalSupply = totalSupply();

        if (totalSupply == 0) {
            // 🚩 RED FLAG: sqrt puede ser manipulado
            liquidity = Math.sqrt(amountA * amountB);
        } else {
            liquidity = Math.min(
                (amountA * totalSupply) / reserveA,
                (amountB * totalSupply) / reserveB
            );
        }

        _mint(msg.sender, liquidity);
    }

    // ⚠️ AUDIT NOTE: Verificar slippage protection
    function swap(
        uint256 amountIn,
        uint256 minAmountOut,
        address tokenIn
    ) public {
        // Question: ¿La protección de slippage es suficiente?
        // ¿Hay protección contra sandwich attacks?
        // ¿El fee es justo y está bien calculado?

        uint256 amountOut = getAmountOut(amountIn);
        require(amountOut >= minAmountOut, "Slippage too high");

        // 🚩 Verificar orden de operaciones
        _transferIn(tokenIn, amountIn);
        _transferOut(getOtherToken(tokenIn), amountOut);
    }
}
```

#### Template de Notas de Auditoría

```solidity
/**
 * @audit-info Severity: [CRITICAL|HIGH|MEDIUM|LOW|INFO]
 * @audit-info Category: [Reentrancy|Access Control|Logic|Gas|...]
 * @audit-info Line: X-Y
 *
 * @audit-issue
 * [Descripción del issue encontrado]
 *
 * @audit-impact
 * [Impacto potencial: financial loss, DOS, data corruption, etc.]
 *
 * @audit-recommendation
 * [Cómo remediar el issue]
 *
 * @audit-poc
 * [Proof of concept code si aplica]
 */
```

## 2. Categorías de Vulnerabilidades

### 2.1 Reentrancy Variants

```solidity
// 1. Classic Reentrancy
contract ClassicReentrancy {
    mapping(address => uint256) balances;

    function withdraw() public {
        uint256 balance = balances[msg.sender];
        // 🚩 External call before state update
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success);
        balances[msg.sender] = 0;
    }
}

// 2. Cross-Function Reentrancy
contract CrossFunctionReentrancy {
    mapping(address => uint256) balances;

    function withdraw() public {
        uint256 balance = balances[msg.sender];
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success);
        balances[msg.sender] = 0; // ✅ Updated here
    }

    function transfer(address to, uint256 amount) public {
        // 🚩 Pero usa el mismo state que no está actualizado
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}

// 3. Cross-Contract Reentrancy
contract VaultA {
    VaultB public vaultB;
    mapping(address => uint256) public balances;

    function withdraw() public {
        uint256 balance = balances[msg.sender];
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success);
        balances[msg.sender] = 0;
    }
}

contract VaultB {
    VaultA public vaultA;
    mapping(address => uint256) public balances;

    function withdraw() public {
        // 🚩 Attacker puede reentrar en VaultA desde aquí
        require(vaultA.balances(msg.sender) == 0, "Withdraw from A first");
        // ...
    }
}

// 4. Read-Only Reentrancy
contract LendingPool {
    mapping(address => uint256) public balances;

    function withdraw() public {
        uint256 balance = balances[msg.sender];
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success);
        balances[msg.sender] = 0;
    }

    // 🚩 View function que retorna state inconsistente
    function getCollateralRatio(address user) public view returns (uint256) {
        return balances[user] * 1e18 / borrowed[user];
    }
}

// Otro contrato que lee durante reentrancy
contract Attacker {
    LendingPool pool;
    PriceOracle oracle;

    receive() external payable {
        // Durante reentrancy, balance aún no se actualizó
        uint256 ratio = pool.getCollateralRatio(address(this));
        // Puede usar este ratio inflado para borrowar más
        oracle.reportCollateral(ratio);
    }
}
```

**Detección:**
```typescript
// Script para detectar reentrancy patterns
function detectReentrancy(contractAST: any): Finding[] {
  const findings: Finding[] = []

  function visitFunction(func: FunctionDefinition) {
    let hasExternalCall = false
    let hasStateChange = false
    let stateChangeAfterCall = false

    func.body.statements.forEach((stmt, index) => {
      // Detectar external calls
      if (isExternalCall(stmt)) {
        hasExternalCall = true

        // Verificar si hay state changes DESPUÉS
        for (let i = index + 1; i < func.body.statements.length; i++) {
          if (isStateChange(func.body.statements[i])) {
            stateChangeAfterCall = true
            break
          }
        }
      }

      // Detectar state changes
      if (isStateChange(stmt)) {
        hasStateChange = true
      }
    })

    if (hasExternalCall && stateChangeAfterCall) {
      findings.push({
        severity: 'HIGH',
        category: 'Reentrancy',
        location: `${func.name}:${func.loc.start.line}`,
        description: 'State change after external call - possible reentrancy',
        recommendation: 'Move state changes before external calls or use ReentrancyGuard'
      })
    }
  }

  // Recorrer todas las funciones
  contractAST.functions.forEach(visitFunction)

  return findings
}
```

### 2.2 Access Control Issues

```solidity
// 1. Missing Access Control
contract VulnerableVault {
    address public owner;

    // 🚩 Cualquiera puede llamar esto
    function withdraw(uint256 amount) public {
        payable(msg.sender).transfer(amount);
    }

    // ✅ Correcto
    function withdrawFixed(uint256 amount) public {
        require(msg.sender == owner, "Only owner");
        payable(msg.sender).transfer(amount);
    }
}

// 2. Incorrect Modifier Implementation
contract BadModifiers {
    address public owner;

    // 🚩 Modifier no revierte
    modifier onlyOwner() {
        if (msg.sender == owner) {
            _;
        }
        // Función continúa incluso si no es owner!
    }

    // ✅ Correcto
    modifier onlyOwnerFixed() {
        require(msg.sender == owner, "Not owner");
        _;
    }
}

// 3. Unprotected Initializer
contract UnprotectedInit {
    address public owner;
    bool private initialized;

    // 🚩 Cualquiera puede llamar y convertirse en owner
    function initialize(address _owner) public {
        require(!initialized);
        owner = _owner;
        initialized = true;
    }

    // ✅ Mejor usar OpenZeppelin Initializable
    function initializeFixed(address _owner) public initializer {
        owner = _owner;
    }
}

// 4. tx.origin Authentication
contract TxOriginAuth {
    address public owner;

    // 🚩 Vulnerable a phishing
    function withdraw() public {
        require(tx.origin == owner);
        // Attacker puede llamar via contrato malicioso
        // mientras owner ejecuta una transacción
    }

    // ✅ Usar msg.sender
    function withdrawFixed() public {
        require(msg.sender == owner);
    }
}

// 5. Delegate Call Injection
contract Proxy {
    address public implementation;

    // 🚩 Cualquiera puede cambiar implementation
    function upgradeTo(address newImpl) public {
        implementation = newImpl;
    }

    fallback() external payable {
        address impl = implementation;
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}
```

### 2.3 Integer & Arithmetic Issues

```solidity
// 1. Overflow/Underflow (Solidity < 0.8)
contract UnsafeArithmetic {
    mapping(address => uint256) public balances;

    function transfer(address to, uint256 amount) public {
        // 🚩 Puede underflow en Solidity < 0.8
        balances[msg.sender] -= amount;
        // 🚩 Puede overflow
        balances[to] += amount;
    }
}

// 2. Precision Loss
contract PrecisionLoss {
    function calculateFee(uint256 amount) public pure returns (uint256) {
        // 🚩 Si amount < 1000, fee = 0
        return amount / 1000; // 0.1% fee

        // ✅ Mejor
        return (amount * 1) / 1000;
    }

    function complexCalculation(uint256 a, uint256 b) public pure returns (uint256) {
        // 🚩 Orden incorrecto causa precision loss
        return a / b * 1e18;

        // ✅ Multiplicar antes de dividir
        return (a * 1e18) / b;
    }
}

// 3. Division Before Multiplication
contract DivisionFirst {
    function calculateShare(
        uint256 totalReward,
        uint256 userStake,
        uint256 totalStake
    ) public pure returns (uint256) {
        // 🚩 Mal: división primero
        uint256 ratio = userStake / totalStake;
        return totalReward * ratio; // Casi siempre 0

        // ✅ Bien: multiplicación primero
        return (totalReward * userStake) / totalStake;
    }
}

// 4. Unsafe Casting
contract UnsafeCasting {
    function badCast(uint256 value) public pure returns (uint128) {
        // 🚩 Silently truncates si value > type(uint128).max
        return uint128(value);
    }

    function safeCast(uint256 value) public pure returns (uint128) {
        // ✅ Revierte si overflow (Solidity >= 0.8)
        require(value <= type(uint128).max, "Value too large");
        return uint128(value);
    }
}
```

### 2.4 Oracle Manipulation

```solidity
// 1. Spot Price Usage (Vulnerable)
contract VulnerableOracle {
    IUniswapV2Pair pair;

    function getPrice() public view returns (uint256) {
        // 🚩 Precio spot - manipulable con flash loan
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
        return (uint256(reserve1) * 1e18) / uint256(reserve0);
    }
}

// 2. TWAP Implementation (Secure)
contract SecureTWAP {
    IUniswapV2Pair public immutable pair;
    uint256 public price0CumulativeLast;
    uint256 public price1CumulativeLast;
    uint32 public blockTimestampLast;
    uint256 public price0Average;
    uint256 public price1Average;

    uint256 public constant PERIOD = 10 minutes;

    function update() external {
        (
            uint256 price0Cumulative,
            uint256 price1Cumulative,
            uint32 blockTimestamp
        ) = UniswapV2OracleLibrary.currentCumulativePrices(address(pair));

        uint32 timeElapsed = blockTimestamp - blockTimestampLast;

        require(timeElapsed >= PERIOD, "Period not elapsed");

        // Overflow-safe average calculation
        price0Average = (price0Cumulative - price0CumulativeLast) / timeElapsed;
        price1Average = (price1Cumulative - price1CumulativeLast) / timeElapsed;

        price0CumulativeLast = price0Cumulative;
        price1CumulativeLast = price1Cumulative;
        blockTimestampLast = blockTimestamp;
    }
}

// 3. Chainlink con validación
contract ChainlinkOracle {
    AggregatorV3Interface internal priceFeed;

    function getLatestPrice() public view returns (int256) {
        (
            uint80 roundID,
            int256 price,
            ,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();

        // ✅ Validaciones importantes
        require(price > 0, "Invalid price");
        require(answeredInRound >= roundID, "Stale price");
        require(timeStamp > 0, "Round not complete");
        require(block.timestamp - timeStamp < 1 hours, "Price too old");

        return price;
    }
}

// 4. Multi-Oracle con circuit breaker
contract RobustOracle {
    uint256 constant MAX_PRICE_DEVIATION = 10e16; // 10%

    function getPrice() public view returns (uint256) {
        uint256 chainlinkPrice = getChainlinkPrice();
        uint256 uniswapTWAP = getUniswapTWAP();

        // Circuit breaker: verificar que los precios sean consistentes
        uint256 deviation = chainlinkPrice > uniswapTWAP
            ? ((chainlinkPrice - uniswapTWAP) * 1e18) / uniswapTWAP
            : ((uniswapTWAP - chainlinkPrice) * 1e18) / chainlinkPrice;

        require(deviation < MAX_PRICE_DEVIATION, "Price deviation too high");

        // Retornar el promedio
        return (chainlinkPrice + uniswapTWAP) / 2;
    }
}
```

## 3. Testing Durante Auditoría

### 3.1 Property-Based Testing

```solidity
// test/invariants/TokenInvariants.t.sol
contract TokenInvariantTest is Test {
    MyToken token;
    address[] actors;

    function setUp() public {
        token = new MyToken();

        // Crear actores para fuzzing
        for (uint i = 0; i < 3; i++) {
            actors.push(makeAddr(string(abi.encodePacked("actor", i))));
            token.mint(actors[i], 1000e18);
        }

        // Configurar handler para invariant testing
        targetContract(address(token));
    }

    // Invariant: Total supply nunca debe cambiar (sin mint/burn)
    function invariant_totalSupplyConstant() public {
        assertEq(token.totalSupply(), 3000e18);
    }

    // Invariant: Suma de balances debe igualar total supply
    function invariant_balancesSumEqualsTotalSupply() public {
        uint256 sum = 0;
        for (uint i = 0; i < actors.length; i++) {
            sum += token.balanceOf(actors[i]);
        }
        assertEq(sum, token.totalSupply());
    }

    // Invariant: Balance nunca puede ser negativo (implícito en uint)
    // pero debemos verificar que nunca underflow

    // Invariant: Transfer nunca debe aumentar total supply
    function invariant_transferDoesntInflate() public {
        // Este se verifica automáticamente si los otros pasan
    }
}
```

### 3.2 Fork Testing

```solidity
// test/fork/UniswapIntegration.t.sol
contract UniswapForkTest is Test {
    uint256 mainnetFork;
    uint256 BLOCK_NUMBER = 18_000_000;

    IUniswapV2Router02 router;
    IERC20 weth;
    IERC20 usdc;

    MyProtocol protocol;

    function setUp() public {
        // Fork mainnet en un bloque específico
        mainnetFork = vm.createFork(vm.envString("MAINNET_RPC_URL"), BLOCK_NUMBER);
        vm.selectFork(mainnetFork);

        // Usar direcciones reales de mainnet
        router = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
        weth = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
        usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);

        // Deploy nuestro protocolo
        protocol = new MyProtocol(address(router));

        // Dar tokens al test contract
        deal(address(usdc), address(this), 1000000e6); // 1M USDC
    }

    function testSwapIntegration() public {
        uint256 amountIn = 1000e6; // 1000 USDC

        usdc.approve(address(protocol), amountIn);

        uint256 balanceBefore = weth.balanceOf(address(this));

        // Ejecutar swap a través de nuestro protocolo
        protocol.swapUSDCForWETH(amountIn);

        uint256 balanceAfter = weth.balanceOf(address(this));

        // Verificar que recibimos WETH
        assertGt(balanceAfter, balanceBefore);

        // Verificar que el precio es razonable
        uint256 expectedMin = getExpectedAmount(amountIn) * 95 / 100; // 5% slippage max
        assertGt(balanceAfter - balanceBefore, expectedMin);
    }

    function testFlashLoanAttackMitigation() public {
        // Simular un flash loan attack
        uint256 loanAmount = 10000000e6; // 10M USDC

        deal(address(usdc), address(this), loanAmount);

        // Intentar manipular precio
        address[] memory path = new address[](2);
        path[0] = address(usdc);
        path[1] = address(weth);

        usdc.approve(address(router), loanAmount);

        // Large swap para manipular precio
        router.swapExactTokensForTokens(
            loanAmount,
            0,
            path,
            address(this),
            block.timestamp
        );

        // Intentar explotar el protocolo con precio manipulado
        vm.expectRevert("Price manipulation detected");
        protocol.borrowAgainstCollateral();
    }
}
```

### 3.3 Mutation Testing

```typescript
// mutation-testing.ts
import { execSync } from 'child_process'

class MutationTester {
  private mutations = [
    { name: 'Flip comparison', pattern: />=/, replacement: '<' },
    { name: 'Remove require', pattern: /require\([^)]+\);/, replacement: '// removed' },
    { name: 'Change constant', pattern: /1000/, replacement: '999' },
    { name: 'Remove modifier', pattern: /\bonlyOwner\b/, replacement: '' },
  ]

  async runMutationTests(contractPath: string) {
    const originalCode = await fs.readFile(contractPath, 'utf-8')

    for (const mutation of this.mutations) {
      console.log(`\nTesting mutation: ${mutation.name}`)

      // Aplicar mutación
      const mutatedCode = originalCode.replace(
        mutation.pattern,
        mutation.replacement
      )

      // Escribir código mutado
      await fs.writeFile(contractPath, mutatedCode)

      try {
        // Ejecutar tests
        execSync('forge test', { stdio: 'pipe' })

        // 🚨 Si los tests pasan con código mutado, hay un problema
        console.error(`❌ Tests passed with mutation: ${mutation.name}`)
        console.error('   This indicates missing test coverage!')

      } catch (error) {
        // ✅ Los tests fallaron - la mutación fue detectada
        console.log(`✅ Mutation caught: ${mutation.name}`)
      }

      // Restaurar código original
      await fs.writeFile(contractPath, originalCode)
    }
  }
}

// Uso
const tester = new MutationTester()
tester.runMutationTests('contracts/MyContract.sol')
```

## 4. Reporte de Auditoría

### 4.1 Estructura del Reporte

```markdown
# Smart Contract Audit Report

## Project: [Nombre]
## Audit Team: [Nombres]
## Date: [Fecha]
## Version: [Git commit hash]

---

## Table of Contents

1. Executive Summary
2. Scope
3. Methodology
4. Findings Summary
5. Detailed Findings
6. Recommendations
7. Conclusion
8. Disclaimer

---

## 1. Executive Summary

[Resumen de alto nivel para stakeholders no técnicos]

- **Total Issues Found**: X
  - Critical: X
  - High: X
  - Medium: X
  - Low: X
  - Informational: X

- **Code Quality**: [Excelente/Buena/Necesita mejoras]
- **Test Coverage**: X%
- **Overall Security Rating**: [A/B/C/D/F]

---

## 2. Scope

### Contracts Audited

- `Contract1.sol` (XXX lines)
- `Contract2.sol` (XXX lines)
- `Contract3.sol` (XXX lines)

**Total Lines of Code**: XXX
**Commit Hash**: `abc123...`
**Audit Period**: [Fechas]

### Out of Scope

- Third-party contracts (OpenZeppelin, etc.)
- Off-chain components
- Frontend code

---

## 3. Methodology

1. Automated Analysis
   - Slither
   - Mythril
   - Aderyn

2. Manual Code Review
   - Line-by-line review
   - Architecture analysis
   - Business logic verification

3. Testing
   - Unit tests
   - Integration tests
   - Invariant testing
   - Fork testing

4. Known Vulnerability Patterns
   - SWC Registry
   - DeFi hack database

---

## 4. Findings Summary

| ID | Title | Severity | Status |
|----|-------|----------|--------|
| H-01 | Reentrancy in withdraw() | HIGH | Fixed |
| M-01 | Missing access control | MEDIUM | Acknowledged |
| L-01 | Unbounded loop | LOW | Fixed |
| I-01 | Code optimization | INFO | Fixed |

---

## 5. Detailed Findings

### [H-01] Reentrancy Vulnerability in withdraw()

**Severity**: HIGH
**Status**: FIXED
**File**: `contracts/Vault.sol:45-52`

#### Description

The `withdraw()` function performs an external call before updating the user's balance,
creating a classic reentrancy vulnerability.

#### Impact

An attacker could drain all ETH from the contract by recursively calling `withdraw()`.

**Estimated Loss**: Total contract balance (~$X million)

#### Proof of Concept

\`\`\`solidity
contract Exploit {
    Vault vault;
    uint256 attacks;

    function attack() external payable {
        vault.deposit{value: 1 ether}();
        vault.withdraw();
    }

    receive() external payable {
        if (attacks < 10) {
            attacks++;
            vault.withdraw();
        }
    }
}
\`\`\`

#### Recommendation

Apply the Checks-Effects-Interactions pattern:

\`\`\`solidity
function withdraw() public {
    uint256 balance = balances[msg.sender];
    balances[msg.sender] = 0;  // Update state first

    (bool success, ) = msg.sender.call{value: balance}("");
    require(success, "Transfer failed");
}
\`\`\`

Or use OpenZeppelin's ReentrancyGuard.

#### Team Response

Fixed in commit `def456...`

---

[... Más findings ...]

---

## 6. Recommendations

### Short Term

1. Fix all HIGH and CRITICAL findings immediately
2. Increase test coverage to >95%
3. Add comprehensive natspec comments

### Long Term

1. Implement formal verification
2. Set up continuous security monitoring
3. Establish bug bounty program
4. Regular security audits (quarterly)

### Best Practices

1. Use latest Solidity version
2. Follow CEI pattern strictly
3. Implement timelocks for critical operations
4. Use multisig for admin operations

---

## 7. Conclusion

The codebase shows [buena/regular/mala] security awareness. The critical
issues found have been [fixed/acknowledged/...]. We recommend [...]

---

## 8. Disclaimer

This audit does not guarantee the absence of vulnerabilities. Smart contract
security is a continuous process. The team should:

- Maintain security practices
- Monitor for new vulnerability types
- Keep dependencies updated
- Conduct regular audits
```

### 4.2 Severity Classification

```typescript
interface Finding {
  id: string
  title: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  category: string
  file: string
  lines: string
  description: string
  impact: string
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW'
  poc?: string
  recommendation: string
  status: 'Open' | 'Acknowledged' | 'Fixed' | 'Disputed'
}

function calculateSeverity(
  impact: 'HIGH' | 'MEDIUM' | 'LOW',
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW'
): Finding['severity'] {
  const matrix = {
    HIGH: {
      HIGH: 'CRITICAL',
      MEDIUM: 'HIGH',
      LOW: 'MEDIUM'
    },
    MEDIUM: {
      HIGH: 'HIGH',
      MEDIUM: 'MEDIUM',
      LOW: 'LOW'
    },
    LOW: {
      HIGH: 'MEDIUM',
      MEDIUM: 'LOW',
      LOW: 'INFO'
    }
  }

  return matrix[impact][likelihood]
}
```

## 5. Post-Audit Process

### 5.1 Re-Audit Checklist

```markdown
## Re-Audit Process

- [ ] Review all fixes
- [ ] Verify no new vulnerabilities introduced
- [ ] Run automated tools again
- [ ] Test all modifications
- [ ] Update audit report
- [ ] Sign off on fixes
```

### 5.2 Continuous Monitoring

```typescript
// post-deploy-monitoring.ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

class SecurityMonitor {
  private client = createPublicClient({
    chain: mainnet,
    transport: http()
  })

  async monitorContract(address: `0x${string}`) {
    // 1. Monitor eventos críticos
    this.watchCriticalEvents(address)

    // 2. Monitor cambios de ownership
    this.watchOwnershipChanges(address)

    // 3. Monitor transacciones grandes
    this.watchLargeTransactions(address)

    // 4. Monitor anomalías
    this.detectAnomalies(address)
  }

  private watchCriticalEvents(address: `0x${string}`) {
    const events = ['Paused', 'OwnershipTransferred', 'Upgraded', 'EmergencyWithdraw']

    events.forEach(eventName => {
      this.client.watchContractEvent({
        address,
        eventName,
        onLogs: (logs) => {
          console.warn(`🚨 Critical event: ${eventName}`, logs)
          this.sendAlert(eventName, logs)
        }
      })
    })
  }

  private async detectAnomalies(address: `0x${string}`) {
    // Implementar detección de patrones anormales
    // - Gas usage inusual
    // - Frecuencia de transacciones
    // - Montos fuera de lo normal
  }

  private sendAlert(event: string, data: any) {
    // Enviar a Telegram, Discord, PagerDuty, etc.
  }
}
```

## Referencias

- [Consensys Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [SWC Registry](https://swcregistry.io/)
- [Secureum Audit Findings](https://secureum.substack.com/)
- [Solodit - Audit Reports Database](https://solodit.xyz/)
- [Code4rena - Public Audits](https://code4rena.com/)
