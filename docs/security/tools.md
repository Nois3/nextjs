# Herramientas de Seguridad Web3

## Introducción

Este documento cubre el ecosistema completo de herramientas para análisis de seguridad, testing, fuzzing y monitoreo de smart contracts y aplicaciones Web3.

---

## 1. Análisis Estático

### 1.1 Slither

**Mejor para**: Detección rápida de vulnerabilidades comunes

#### Instalación
```bash
pip3 install slither-analyzer

# O via pipx (recomendado)
pipx install slither-analyzer
```

#### Uso Básico
```bash
# Análisis completo
slither .

# Específico para un contrato
slither contracts/MyContract.sol

# Con compilador específico
slither . --solc-version 0.8.20

# Excluir dependencias
slither . --filter-paths "node_modules|lib"
```

#### Detectores Específicos
```bash
# Solo reentrancy
slither . --detect reentrancy-eth

# Solo access control
slither . --detect unprotected-upgrade

# Múltiples detectores
slither . --detect reentrancy-eth,reentrancy-no-eth,unprotected-upgrade

# Listar todos los detectores disponibles
slither --list-detectors
```

#### Reportes
```bash
# Human-readable summary
slither . --print human-summary

# JSON para procesamiento
slither . --json results.json

# Markdown checklist
slither . --checklist > audit-checklist.md

# Inheritance tree
slither . --print inheritance-graph

# Call graph
slither . --print call-graph

# Variable dependencies
slither . --print data-dependency
```

#### Configuración Avanzada
```json
// slither.config.json
{
  "filter_paths": "node_modules|test|mock",
  "exclude_dependencies": true,
  "exclude_informational": false,
  "exclude_low": false,
  "exclude_medium": false,
  "exclude_high": false,
  "solc": "solc",
  "solc_args": "--optimize --optimize-runs 200",
  "detectors_to_exclude": "naming-convention,external-function"
}
```

```bash
slither . --config-file slither.config.json
```

#### Integración CI/CD
```yaml
# .github/workflows/security.yml
name: Security Analysis

on: [push, pull_request]

jobs:
  slither:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Slither
        uses: crytic/slither-action@v0.3.0
        with:
          target: 'contracts/'
          slither-args: '--filter-paths "test|node_modules" --json slither-report.json'
          fail-on: high

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: slither-report
          path: slither-report.json
```

#### Custom Detectors
```python
# custom_detector.py
from slither.detectors.abstract_detector import AbstractDetector, DetectorClassification

class CustomDetector(AbstractDetector):
    ARGUMENT = 'custom-detector'
    HELP = 'Detecta patrón personalizado'
    IMPACT = DetectorClassification.MEDIUM
    CONFIDENCE = DetectorClassification.HIGH

    def _detect(self):
        results = []

        for contract in self.contracts:
            for function in contract.functions:
                # Buscar patrón específico
                if self.is_vulnerable(function):
                    results.append(self.generate_result([
                        f'Vulnerability found in {function.name}\n'
                    ]))

        return results

    def is_vulnerable(self, function):
        # Lógica de detección
        return False
```

```bash
# Usar detector personalizado
slither . --detect custom-detector --detector-path ./custom_detector.py
```

---

### 1.2 Mythril

**Mejor para**: Análisis simbólico profundo, detección de edge cases

#### Instalación
```bash
pip3 install mythril

# Con Docker
docker pull mythril/myth
```

#### Uso Básico
```bash
# Analizar código fuente
myth analyze contracts/MyContract.sol

# Analizar bytecode desplegado
myth analyze -a 0xContractAddress --rpc infura-mainnet

# Con configuración específica
myth analyze contracts/MyContract.sol \
  --solc-json mythril-config.json \
  --execution-timeout 600
```

#### Detección Específica
```bash
# Solo buscar vulnerabilidades específicas
myth analyze contracts/Token.sol -m IntegerOverflow,IntegerUnderflow

# Máxima profundidad de análisis
myth analyze contracts/Complex.sol --max-depth 50

# Con strategy específica
myth analyze contracts/DeFi.sol --strategy bfs  # breadth-first

# Listar módulos disponibles
myth --list-modules
```

#### Output Formats
```bash
# Markdown
myth analyze contracts/MyContract.sol -o markdown

# JSON
myth analyze contracts/MyContract.sol -o json > mythril-report.json

# Texto
myth analyze contracts/MyContract.sol -o text
```

#### Análisis de Bytecode On-chain
```bash
# Analizar contrato en mainnet
myth analyze -a 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb --rpc https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# Con disassembler
myth disassemble -a 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb --rpc $RPC_URL
```

#### Mythril Config
```json
// mythril-config.json
{
  "remappings": [],
  "optimizer": {
    "enabled": true,
    "runs": 200
  },
  "outputSelection": {
    "*": {
      "*": [
        "evm.bytecode",
        "evm.deployedBytecode",
        "abi"
      ]
    }
  }
}
```

---

### 1.3 Aderyn (Rust-based)

**Mejor para**: Análisis rápido, integración con Foundry

#### Instalación
```bash
cargo install aderyn

# O con foundry
forge install Cyfrin/aderyn
```

#### Uso
```bash
# Análisis básico
aderyn .

# Con output específico
aderyn . --output report.md

# Solo critical/high
aderyn . --severity high,critical

# Con path específico
aderyn contracts/ --output-format json
```

#### Configuración
```toml
# aderyn.toml
[aderyn]
exclude = ["test/", "script/", "lib/"]
severity = ["critical", "high", "medium"]
output-format = "markdown"
```

---

## 2. Testing & Fuzzing

### 2.1 Foundry (forge)

**Mejor para**: Testing integral, fuzzing, invariant testing

#### Instalación
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

#### Testing Básico
```solidity
// test/MyContract.t.sol
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/MyContract.sol";

contract MyContractTest is Test {
    MyContract public target;

    function setUp() public {
        target = new MyContract();
    }

    function testBasic() public {
        assertEq(target.value(), 0);
    }

    // Fuzz test
    function testFuzz_Transfer(uint256 amount) public {
        vm.assume(amount > 0 && amount < type(uint128).max);
        // Test con valores random
    }
}
```

```bash
# Ejecutar tests
forge test

# Con verbosidad
forge test -vvv

# Test específico
forge test --match-test testBasic

# Con gas report
forge test --gas-report

# Coverage
forge coverage
forge coverage --report lcov
genhtml lcov.info -o coverage/
```

#### Fuzzing Avanzado
```solidity
// test/invariant/Invariant.t.sol
contract InvariantTest is Test {
    Token token;
    Handler handler;

    function setUp() public {
        token = new Token();
        handler = new Handler(token);

        // Target handler para fuzzing
        targetContract(address(handler));
    }

    // Invariant: total supply nunca cambia
    function invariant_totalSupply() public {
        assertEq(token.totalSupply(), 1000000e18);
    }

    // Invariant: suma de balances == total supply
    function invariant_balancesSum() public {
        assertEq(handler.ghost_sumBalances(), token.totalSupply());
    }
}

// Handler para fuzzing dirigido
contract Handler is Test {
    Token token;
    uint256 public ghost_sumBalances;
    address[] public actors;

    constructor(Token _token) {
        token = _token;
        // Crear actores
        for (uint i = 0; i < 3; i++) {
            actors.push(address(uint160(i + 1)));
        }
    }

    function transfer(uint256 actorSeed, uint256 amount) public {
        address from = actors[actorSeed % actors.length];
        address to = actors[(actorSeed + 1) % actors.length];

        amount = bound(amount, 0, token.balanceOf(from));

        vm.prank(from);
        token.transfer(to, amount);

        // No cambió suma total
        assertEq(ghost_sumBalances, token.totalSupply());
    }
}
```

```bash
# Ejecutar invariant tests
forge test --match-contract InvariantTest

# Con más runs
forge test --match-contract InvariantTest --fuzz-runs 10000

# Con seed específica (reproducir)
forge test --fuzz-seed 0x1234
```

#### Fork Testing
```solidity
contract ForkTest is Test {
    uint256 mainnetFork;
    IUniswapV2Router router;

    function setUp() public {
        mainnetFork = vm.createFork("https://eth-mainnet.g.alchemy.com/v2/KEY");
        vm.selectFork(mainnetFork);

        router = IUniswapV2Router(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    }

    function testSwapOnFork() public {
        // Test contra state real de mainnet
    }

    function testAtSpecificBlock() public {
        vm.rollFork(18000000); // Específico block
        // Test en ese estado
    }
}
```

```bash
# Fork test
forge test --fork-url $MAINNET_RPC --match-contract ForkTest

# Fork en block específico
forge test --fork-url $MAINNET_RPC --fork-block-number 18000000

# Con cache
forge test --fork-url $MAINNET_RPC --cache-path ~/.foundry/cache
```

#### Configuración Foundry
```toml
# foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.20"
optimizer = true
optimizer_runs = 200
verbosity = 3

[fuzz]
runs = 1000
max_test_rejects = 100000

[invariant]
runs = 256
depth = 15
fail_on_revert = false

[profile.ci]
fuzz = { runs = 10000 }
invariant = { runs = 1000 }
```

---

### 2.2 Echidna

**Mejor para**: Property-based fuzzing, invariant testing intensivo

#### Instalación
```bash
# Via Docker
docker pull trailofbits/echidna

# Via releases
wget https://github.com/crytic/echidna/releases/download/v2.2.1/echidna-2.2.1-Linux.tar.gz
tar -xzf echidna-2.2.1-Linux.tar.gz
```

#### Test Contract
```solidity
// echidna/EchidnaTest.sol
pragma solidity ^0.8.0;

contract EchidnaTest {
    MyContract target;

    constructor() {
        target = new MyContract();
    }

    // Property: balance nunca negativo (implícito en uint)
    // pero podemos testear underflows

    // Property: invariante de negocio
    function echidna_total_supply_constant() public view returns (bool) {
        return target.totalSupply() == 1000000e18;
    }

    // Property: no puede mintear más del cap
    function echidna_under_cap() public view returns (bool) {
        return target.totalSupply() <= target.cap();
    }

    // Property testing con precondiciones
    function echidna_transfer_updates_balance() public returns (bool) {
        address alice = address(0x1);
        address bob = address(0x2);

        uint256 aliceBalBefore = target.balanceOf(alice);
        uint256 bobBalBefore = target.balanceOf(bob);

        if (aliceBalBefore == 0) return true; // Skip

        uint256 amount = aliceBalBefore / 2;

        target.transfer(bob, amount);

        return target.balanceOf(alice) == aliceBalBefore - amount &&
               target.balanceOf(bob) == bobBalBefore + amount;
    }
}
```

#### Configuración
```yaml
# echidna.yaml
testMode: assertion
testLimit: 100000
deployer: "0x30000"
sender: ["0x10000", "0x20000", "0x30000"]
balanceContract: 0xffffffff
codeSize: 0x6000
coverage: true
corpusDir: "corpus"
workers: 4

# Assertion mode: busca violaciones de asserts
# Property mode: busca funciones que retornen false
```

#### Ejecutar
```bash
# Basic
echidna-test contracts/EchidnaTest.sol --contract EchidnaTest

# Con config
echidna-test contracts/EchidnaTest.sol --contract EchidnaTest --config echidna.yaml

# Con coverage
echidna-test contracts/EchidnaTest.sol --contract EchidnaTest --coverage

# Assertion mode
echidna-test contracts/EchidnaTest.sol --test-mode assertion
```

#### Corpus-based Fuzzing
```bash
# Echidna guarda inputs interesantes en corpus/
echidna-test contracts/Test.sol --corpus-dir corpus

# Continuar desde corpus existente
echidna-test contracts/Test.sol --corpus-dir corpus --seq-len 100
```

---

### 2.3 Medusa

**Mejor para**: Fuzzing paralelo avanzado

```bash
# Instalar
cargo install medusa

# Ejecutar
medusa fuzz

# Con workers paralelos
medusa fuzz --workers 8
```

---

## 3. Formal Verification

### 3.1 Certora Prover

**Mejor para**: Garantías matemáticas de correctitud

#### Spec Example
```solidity
// certora/specs/Token.spec
methods {
    function totalSupply() external returns (uint256) envfree;
    function balanceOf(address) external returns (uint256) envfree;
    function transfer(address, uint256) external returns (bool);
}

// Invariant: suma de balances == total supply
invariant sumOfBalancesEqualsTotalSupply()
    to_mathint(balanceOf(alice)) + to_mathint(balanceOf(bob)) == to_mathint(totalSupply());

// Rule: transfer preserva total supply
rule transferPreservesTotalSupply {
    address from; address to; uint256 amount;

    uint256 supplyBefore = totalSupply();

    env e;
    transfer(e, to, amount);

    uint256 supplyAfter = totalSupply();

    assert supplyBefore == supplyAfter;
}

// Rule: transfer actualiza balances correctamente
rule transferUpdatesBalances {
    address to; uint256 amount;

    uint256 fromBalBefore = balanceOf(currentContract);
    uint256 toBalBefore = balanceOf(to);

    env e;
    transfer(e, to, amount);

    assert balanceOf(currentContract) == fromBalBefore - amount;
    assert balanceOf(to) == toBalBefore + amount;
}
```

```bash
# Ejecutar
certoraRun certora/conf/Token.conf
```

---

### 3.2 Halmos

**Mejor para**: Symbolic testing para Foundry

```bash
# Instalar
pip install halmos

# Ejecutar
halmos --contract MyTest

# Con solver específico
halmos --contract MyTest --solver z3
```

---

## 4. Código Decompilation

### 4.1 Heimdall

```bash
# Instalar
cargo install heimdall-rs

# Decompile contract
heimdall decompile 0xCONTRACT_ADDRESS --rpc-url $RPC_URL

# Decode transacción
heimdall decode 0xTX_HASH --rpc-url $RPC_URL

# Disassemble
heimdall disassemble 0xCONTRACT_ADDRESS --rpc-url $RPC_URL
```

### 4.2 ethervm.io

Online decompiler: https://ethervm.io/decompile

### 4.3 Dedaub

https://library.dedaub.com/decompile

---

## 5. Monitoring & Runtime Protection

### 5.1 Tenderly

**Mejor para**: Monitoring, debugging, simulations

```typescript
// tenderly-monitor.ts
import { Tenderly } from '@tenderly/sdk'

const tenderly = new Tenderly({
  accessKey: process.env.TENDERLY_ACCESS_KEY,
  accountName: 'my-account',
  projectName: 'my-project'
})

// Crear alerta
await tenderly.alerts.create({
  name: 'Large Transfer Alert',
  network: '1',
  contracts: ['0x...'],
  events: [{
    name: 'Transfer',
    filters: [{
      field: 'value',
      operator: 'gt',
      value: '1000000000000000000000' // > 1000 tokens
    }]
  }],
  notifications: [{
    type: 'slack',
    target: 'https://hooks.slack.com/...'
  }]
})

// Simular transacción
const simulation = await tenderly.simulator.simulateTransaction({
  network_id: '1',
  from: '0x...',
  to: '0x...',
  input: '0x...',
  value: '0'
})

console.log('Gas used:', simulation.transaction.gas_used)
console.log('Success:', simulation.transaction.status)
```

### 5.2 Forta Network

**Mejor para**: Threat detection en tiempo real

```typescript
// forta-agent/src/agent.ts
import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType
} from 'forta-agent'

const LARGE_TRANSFER_THRESHOLD = ethers.utils.parseEther('1000')

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = []

  // Detectar transfers grandes
  const transfers = txEvent.filterLog(
    'Transfer(address indexed from, address indexed to, uint256 value)',
    CONTRACT_ADDRESS
  )

  transfers.forEach(transfer => {
    const { from, to, value } = transfer.args

    if (value.gt(LARGE_TRANSFER_THRESHOLD)) {
      findings.push(
        Finding.fromObject({
          name: 'Large Transfer Detected',
          description: `Transfer of ${ethers.utils.formatEther(value)} tokens`,
          alertId: 'LARGE-TRANSFER',
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            from,
            to,
            value: value.toString()
          }
        })
      )
    }
  })

  return findings
}

export default {
  handleTransaction
}
```

```bash
# Ejecutar localmente
npm run start

# Deploy a Forta Network
npm run publish
```

### 5.3 OpenZeppelin Defender

**Mejor para**: Automated operations, security monitoring

```typescript
// defender-autotask/index.ts
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers'
import { ethers } from 'ethers'

export async function handler(event: any) {
  const provider = new DefenderRelayProvider(event)
  const signer = new DefenderRelaySigner(event, provider, { speed: 'fast' })

  const contract = new ethers.Contract(ADDRESS, ABI, signer)

  // Automatizar operación
  const tx = await contract.updatePrice()
  console.log('Transaction:', tx.hash)

  return { success: true, hash: tx.hash }
}
```

---

## 6. Continuous Security

### 6.1 GitHub Actions Security Workflow

```yaml
# .github/workflows/security.yml
name: Security Checks

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  slither:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: crytic/slither-action@v0.3.0
        with:
          target: 'contracts/'
          slither-args: '--filter-paths "test" --json slither-report.json'

  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive

      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1

      - name: Run tests
        run: forge test -vvv

      - name: Coverage
        run: |
          forge coverage --report lcov
          echo "Coverage report generated"

  mythril:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Mythril
        uses: docker://mythril/myth
        with:
          args: analyze contracts/**/*.sol --solc-json mythril.json
```

### 6.2 Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "Running security checks..."

# Slither
slither . --filter-paths "test|script" || {
    echo "❌ Slither found issues"
    exit 1
}

# Tests
forge test || {
    echo "❌ Tests failed"
    exit 1
}

echo "✅ Security checks passed"
```

---

## 7. Misceláneos

### 7.1 eth-security-toolbox

Suite completa de herramientas en Docker:

```bash
docker pull trailofbits/eth-security-toolbox

docker run -it -v $(pwd):/share trailofbits/eth-security-toolbox

# Ahora tienes acceso a:
# - Slither
# - Echidna
# - Manticore
# - Mythril
# - Crytic-compile
# - Solc-select
```

### 7.2 VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "NomicFoundation.hardhat-solidity",
    "tintinweb.solidity-visual-auditor",
    "tintinweb.vscode-solidity-auditor",
    "JuanBlanco.solidity"
  ]
}
```

### 7.3 Semgrep Rules

```yaml
# .semgrep/rules.yaml
rules:
  - id: unchecked-low-level-call
    pattern: $X.call(...)
    message: "Low-level call without checking return value"
    languages: [solidity]
    severity: WARNING

  - id: tx-origin-auth
    pattern: require(tx.origin == ...)
    message: "Using tx.origin for authentication is unsafe"
    languages: [solidity]
    severity: ERROR

  - id: selfdestruct-usage
    pattern: selfdestruct(...)
    message: "Using selfdestruct is dangerous"
    languages: [solidity]
    severity: WARNING
```

```bash
# Ejecutar
semgrep --config .semgrep/rules.yaml contracts/
```

---

## 8. Checklist de Herramientas

Para una auditoría completa, ejecutar en orden:

```bash
#!/bin/bash
# full-security-scan.sh

echo "🔍 Starting comprehensive security scan..."

# 1. Análisis estático
echo "\n📊 Running Slither..."
slither . --json slither-report.json

echo "\n🔮 Running Mythril..."
myth analyze contracts/*.sol -o json > mythril-report.json

# 2. Tests
echo "\n🧪 Running Foundry tests..."
forge test -vvv --gas-report

# 3. Coverage
echo "\n📈 Generating coverage..."
forge coverage --report lcov

# 4. Fuzzing
echo "\n🎲 Running Echidna..."
echidna-test contracts/echidna/Test.sol --config echidna.yaml

# 5. Invariant testing
echo "\n🔄 Running invariant tests..."
forge test --match-contract Invariant

# 6. Semgrep patterns
echo "\n🎯 Running Semgrep..."
semgrep --config auto contracts/

echo "\n✅ Security scan complete. Check reports/ for results."
```

---

## Referencias

- [Crytic Tools](https://github.com/crytic) - Slither, Echidna, etc.
- [Foundry Book](https://book.getfoundry.sh/)
- [Secureum Tools](https://secureum.substack.com/p/security-pitfalls-and-best-practices-101)
- [Consensys Tools](https://consensys.github.io/smart-contract-best-practices/security_tools/)
- [Awesome Ethereum Security](https://github.com/crytic/awesome-ethereum-security)

## Próximos Pasos

Después de familiarizarte con las herramientas:
- Practica en `exercises/security/` (ver README de cada ejercicio)
- Revisa `vulnerabilities.md` para saber qué buscar
- Aplica metodología de `audit.md` en proyectos reales
