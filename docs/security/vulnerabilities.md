# Catálogo de Vulnerabilidades Web3

## Introducción

Este documento cataloga las vulnerabilidades más comunes en smart contracts y aplicaciones Web3, con ejemplos reales de exploits y técnicas de mitigación.

## Índice de Severidad

- 🔴 **CRITICAL**: Pérdida directa de fondos, control total del contrato
- 🟠 **HIGH**: Pérdida de fondos bajo condiciones específicas
- 🟡 **MEDIUM**: Funcionalidad comprometida, potencial pérdida de fondos
- 🟢 **LOW**: Mal funcionamiento menor, gas inefficiencies
- ⚪ **INFO**: Mejores prácticas, optimizaciones

---

## 1. Reentrancy

### 🔴 Severidad: CRITICAL

### Descripción
Permite a un atacante llamar recursivamente a una función antes de que se complete la primera ejecución, explotando el estado inconsistente.

### Variantes

#### 1.1 Single-Function Reentrancy
```solidity
contract Vulnerable {
    mapping(address => uint256) public balances;

    function withdraw() public {
        uint256 balance = balances[msg.sender];

        // 🚩 External call antes de state update
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success);

        balances[msg.sender] = 0;
    }
}

// Exploit
contract Attacker {
    Vulnerable target;

    function attack() external payable {
        target.deposit{value: 1 ether}();
        target.withdraw();
    }

    receive() external payable {
        if (address(target).balance > 0) {
            target.withdraw(); // Reentra
        }
    }
}
```

#### 1.2 Cross-Function Reentrancy
```solidity
contract CrossFunctionVuln {
    mapping(address => uint256) public balances;

    function withdraw() public {
        uint256 balance = balances[msg.sender];
        (bool success, ) = msg.sender.call{value: balance}("");
        balances[msg.sender] = 0;
    }

    function transfer(address to, uint256 amount) public {
        // 🚩 Usa balances que pueden estar inconsistentes
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}

// Durante reentrancy en withdraw(), el atacante llama transfer()
```

#### 1.3 Read-Only Reentrancy
```solidity
contract LendingPool {
    mapping(address => uint256) public deposits;

    function withdraw(uint256 amount) external {
        (bool success, ) = msg.sender.call{value: amount}("");
        deposits[msg.sender] -= amount; // State update después
    }

    function getCollateralValue(address user) public view returns (uint256) {
        // 🚩 Retorna valor inflado durante reentrancy
        return deposits[user];
    }
}

// Otro contrato que lee este valor durante reentrancy
contract PriceOracle {
    function getPrice() external view returns (uint256) {
        return lendingPool.getCollateralValue(attacker);
    }
}
```

### Casos Reales
- **The DAO Hack (2016)**: $60M robados
- **Lendf.Me (2020)**: $25M drenados
- **Cream Finance (2021)**: $19M explotados

### Mitigación

```solidity
// ✅ Solución 1: Checks-Effects-Interactions Pattern
function withdraw() public {
    uint256 balance = balances[msg.sender];
    balances[msg.sender] = 0;  // State primero

    (bool success, ) = msg.sender.call{value: balance}("");
    require(success);
}

// ✅ Solución 2: ReentrancyGuard
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Secure is ReentrancyGuard {
    function withdraw() public nonReentrant {
        uint256 balance = balances[msg.sender];
        (bool success, ) = msg.sender.call{value: balance}("");
        balances[msg.sender] = 0;
    }
}

// ✅ Solución 3: Pull over Push Pattern
mapping(address => uint256) public pendingWithdrawals;

function initiateWithdraw() public {
    pendingWithdrawals[msg.sender] = balances[msg.sender];
    balances[msg.sender] = 0;
}

function completeWithdraw() public {
    uint256 amount = pendingWithdrawals[msg.sender];
    pendingWithdrawals[msg.sender] = 0;

    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}
```

---

## 2. Integer Overflow/Underflow

### 🟠 Severidad: HIGH (Solidity < 0.8) / ⚪ INFO (Solidity >= 0.8)

### Descripción
Cuando operaciones aritméticas exceden los límites del tipo, causando wrap-around.

### Ejemplo Vulnerable (Solidity < 0.8)
```solidity
contract UnsafeMath {
    mapping(address => uint256) public balances;

    function transfer(address to, uint256 amount) public {
        // 🚩 Puede underflow si amount > balances[msg.sender]
        balances[msg.sender] -= amount;
        // 🚩 Puede overflow
        balances[to] += amount;
    }

    function mint(address to, uint256 amount) public {
        // 🚩 Overflow puede resetear totalSupply a 0
        totalSupply += amount;
        balances[to] += amount;
    }
}

// Exploit
function exploit() {
    // Si balance = 1
    token.transfer(attacker, 2);
    // Ahora balance = type(uint256).max (underflow)
}
```

### Casos Reales
- **BeautyChain (BEC) Token**: Token se volvió inútil por overflow
- **SmartMesh (SMT)**: Similar issue, $140M market cap perdido

### Mitigación

```solidity
// ✅ Solución 1: Usar Solidity >= 0.8 (built-in overflow checks)
pragma solidity ^0.8.0;

function transfer(address to, uint256 amount) public {
    balances[msg.sender] -= amount; // Revierte automáticamente en underflow
    balances[to] += amount;          // Revierte automáticamente en overflow
}

// ✅ Solución 2: SafeMath (para Solidity < 0.8)
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Safe {
    using SafeMath for uint256;

    function transfer(address to, uint256 amount) public {
        balances[msg.sender] = balances[msg.sender].sub(amount);
        balances[to] = balances[to].add(amount);
    }
}

// ✅ Solución 3: Unchecked solo cuando sea seguro
function calculateFee(uint256 amount) public pure returns (uint256) {
    unchecked {
        // Sabemos que esto nunca overflow
        return amount / 100;
    }
}
```

---

## 3. Access Control

### 🔴 Severidad: CRITICAL

### Descripción
Funciones críticas sin protección adecuada permiten a usuarios no autorizados ejecutar operaciones privilegiadas.

### Ejemplos Vulnerables

```solidity
// 🚩 Vulnerability 1: Missing modifier
contract NoProtection {
    address public owner;

    // Cualquiera puede llamar
    function withdraw() public {
        payable(msg.sender).transfer(address(this).balance);
    }
}

// 🚩 Vulnerability 2: Incorrect modifier
contract BadModifier {
    modifier onlyOwner() {
        if (msg.sender == owner) {
            _; // Continúa solo si es owner
        }
        // 🚩 Pero también continúa si NO es owner!
    }

    function withdraw() public onlyOwner {
        // Ejecuta para cualquiera
    }
}

// 🚩 Vulnerability 3: tx.origin authentication
contract TxOriginAuth {
    function withdraw() public {
        require(tx.origin == owner); // 🚩 Vulnerable a phishing
        // ...
    }
}

// Phishing attack
contract PhishingContract {
    function attack() public {
        // Si owner llama esto, tx.origin == owner
        vulnerable.withdraw(); // Pasa la verificación
    }
}

// 🚩 Vulnerability 4: Unprotected initializer
contract UninitializedOwner {
    address public owner;

    // 🚩 Primera persona que llame se vuelve owner
    function initialize() public {
        if (owner == address(0)) {
            owner = msg.sender;
        }
    }
}
```

### Casos Reales
- **Parity Multi-Sig (2017)**: $30M robados por función no protegida
- **Parity Wallet (2017)**: $150M congelados por selfdestruct no protegido

### Mitigación

```solidity
// ✅ OpenZeppelin Ownable
import "@openzeppelin/contracts/access/Ownable.sol";

contract Secure is Ownable {
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

// ✅ Role-Based Access Control
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MultiRole is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }
}

// ✅ Two-step ownership transfer
contract SafeOwnership {
    address public owner;
    address public pendingOwner;

    function transferOwnership(address newOwner) public {
        require(msg.sender == owner);
        pendingOwner = newOwner;
    }

    function acceptOwnership() public {
        require(msg.sender == pendingOwner);
        owner = pendingOwner;
        pendingOwner = address(0);
    }
}

// ✅ Initializer protection
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Secure is Initializable {
    function initialize(address _owner) public initializer {
        owner = _owner;
    }
}
```

---

## 4. Front-Running / MEV

### 🟡 Severidad: MEDIUM-HIGH

### Descripción
Atacantes observan transacciones pendientes en el mempool y envían sus propias transacciones con mayor gas para ejecutar primero.

### Tipos de Front-Running

#### 4.1 Displacement Attack
```solidity
// Usuario intenta registrar un nombre ENS
function register(string name) public payable {
    // Atacante ve esto en mempool
    // Envía su propia tx con más gas
    // Atacante registra primero
}
```

#### 4.2 Insertion Attack (Sandwich)
```solidity
// Usuario hace swap en DEX
function swap(uint256 amountIn, uint256 minOut) public {
    // Atacante:
    // 1. Front-run: Compra antes (sube precio)
    // 2. Víctima: Ejecuta swap (precio alto)
    // 3. Back-run: Vende después (baja precio)
}
```

#### 4.3 Suppression Attack
```solidity
// Liquidación en lending protocol
function liquidate(address user) public {
    // Atacante ve liquidación legítima
    // Envía tx con más gas para liquidar primero
    // O envía spam para que la tx legítima falle por gas
}
```

### Ejemplo Real: Sandwich Attack

```typescript
// Bot de sandwich attack (para entender, NO para usar maliciosamente)
class SandwichBot {
  async detectOpportunity(pendingTx: Transaction) {
    // 1. Detectar swap grande en mempool
    if (this.isLargeSwap(pendingTx)) {
      const { tokenIn, tokenOut, amountIn } = this.decodeTx(pendingTx)

      // 2. Calcular profit potencial
      const profit = await this.calculateProfit(tokenIn, tokenOut, amountIn)

      if (profit > this.minProfit) {
        // 3. Enviar front-run transaction
        await this.frontRun(tokenIn, tokenOut, pendingTx.gasPrice)

        // 4. Esperar a que víctima ejecute
        // 5. Enviar back-run transaction
        await this.backRun(tokenIn, tokenOut, pendingTx.gasPrice)
      }
    }
  }
}
```

### Casos Reales
- **Diario**: Millones perdidos en MEV en Ethereum
- **Flashbots**: $1B+ en MEV extraído desde 2021

### Mitigación

```solidity
// ✅ Solución 1: Commit-Reveal Pattern
contract SecureAuction {
    mapping(address => bytes32) public commitments;

    // Fase 1: Commit (hash del bid)
    function commitBid(bytes32 commitment) public {
        commitments[msg.sender] = commitment;
    }

    // Fase 2: Reveal (después de deadline)
    function revealBid(uint256 bid, bytes32 salt) public {
        require(
            keccak256(abi.encodePacked(bid, salt)) == commitments[msg.sender],
            "Invalid reveal"
        );
        // Process bid
    }
}

// ✅ Solución 2: Slippage Protection
function swap(
    uint256 amountIn,
    uint256 minAmountOut  // ✅ Usuario especifica mínimo aceptable
) public {
    uint256 amountOut = getAmountOut(amountIn);
    require(amountOut >= minAmountOut, "Slippage too high");
    // ...
}

// ✅ Solución 3: Batch Auctions (como CoW Protocol)
contract BatchAuction {
    // Todas las órdenes en un batch se ejecutan al mismo precio
    // Elimina MEV intra-batch
    function submitOrder(...) public { }

    function settleBatch() public {
        // Encuentra clearing price
        // Ejecuta todas las órdenes
    }
}

// ✅ Solución 4: Private Mempools (Flashbots)
// Enviar transacciones directamente a miners
// Bypass del mempool público
```

---

## 5. Oracle Manipulation

### 🔴 Severidad: CRITICAL

### Descripción
Manipulación de fuentes de precio para explotar protocolos DeFi.

### Ejemplo Vulnerable

```solidity
contract VulnerableOracle {
    IUniswapV2Pair pair;

    // 🚩 Usa precio spot - manipulable en una sola transacción
    function getPrice() public view returns (uint256) {
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
        return (uint256(reserve1) * 1e18) / uint256(reserve0);
    }
}

contract LendingProtocol {
    function borrow(uint256 collateralAmount) public {
        // 🚩 Usa precio manipulable
        uint256 collateralValue = oracle.getPrice() * collateralAmount;
        uint256 borrowLimit = collateralValue * 75 / 100;
        // ...
    }
}
```

### Attack Flow

```solidity
contract OracleAttack {
    function exploit() external {
        // 1. Flash loan de token A
        uint256 loanAmount = 1_000_000e18;
        flashLoanProvider.flashLoan(tokenA, loanAmount);
    }

    function onFlashLoan(uint256 amount) external {
        // 2. Swap grande para manipular precio en DEX
        uniswapPair.swap(amount, 0, address(this));
        // Precio de tokenA aumenta artificialmente

        // 3. Usar precio inflado para borrowar más de lo debido
        lendingProtocol.depositCollateral(1e18);
        lendingProtocol.borrow(1_000_000e18); // Borrow basado en precio inflado

        // 4. Revertir swap
        uniswapPair.swap(0, amount, address(this));

        // 5. Devolver flash loan
        tokenA.transfer(msg.sender, amount + fee);

        // 6. Profit = borrowed amount - collateral
    }
}
```

### Casos Reales
- **Harvest Finance (2020)**: $34M via oracle manipulation
- **Venus Protocol (2021)**: $200M+ liquidaciones por price manipulation
- **Mango Markets (2022)**: $110M via oracle manipulation

### Mitigación

```solidity
// ✅ Solución 1: Time-Weighted Average Price (TWAP)
contract TWAPOracle {
    uint256 public price0CumulativeLast;
    uint32 public blockTimestampLast;
    uint256 public constant PERIOD = 10 minutes;

    function update() external {
        (
            uint256 price0Cumulative,
            ,
            uint32 blockTimestamp
        ) = UniswapV2OracleLibrary.currentCumulativePrices(pair);

        uint32 timeElapsed = blockTimestamp - blockTimestampLast;
        require(timeElapsed >= PERIOD);

        // TWAP calculation
        priceAverage = (price0Cumulative - price0CumulativeLast) / timeElapsed;

        price0CumulativeLast = price0Cumulative;
        blockTimestampLast = blockTimestamp;
    }
}

// ✅ Solución 2: Chainlink Price Feeds
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract ChainlinkOracle {
    AggregatorV3Interface internal priceFeed;

    function getLatestPrice() public view returns (int) {
        (
            uint80 roundID,
            int price,
            ,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();

        // ✅ Validaciones importantes
        require(price > 0, "Invalid price");
        require(answeredInRound >= roundID, "Stale price");
        require(block.timestamp - timeStamp < 3600, "Price too old");

        return price;
    }
}

// ✅ Solución 3: Multiple Oracle Sources + Circuit Breaker
contract RobustOracle {
    function getPrice() public view returns (uint256) {
        uint256 chainlinkPrice = getChainlinkPrice();
        uint256 twapPrice = getTWAPPrice();
        uint256 bandPrice = getBandPrice();

        // Verificar que están cerca
        uint256 maxDeviation = 5e16; // 5%

        require(
            isWithinRange(chainlinkPrice, twapPrice, maxDeviation) &&
            isWithinRange(chainlinkPrice, bandPrice, maxDeviation),
            "Price deviation too high - circuit breaker"
        );

        // Retornar mediana
        return median(chainlinkPrice, twapPrice, bandPrice);
    }
}

// ✅ Solución 4: Uniswap V3 TWAP (más resistente)
import "@uniswap/v3-core/contracts/libraries/OracleLibrary.sol";

contract UniswapV3Oracle {
    function getPrice(uint32 secondsAgo) public view returns (uint256) {
        (int24 timeWeightedAverageTick, ) = OracleLibrary.consult(
            pool,
            secondsAgo
        );

        return OracleLibrary.getQuoteAtTick(
            timeWeightedAverageTick,
            1e18,
            token0,
            token1
        );
    }
}
```

---

## 6. Flash Loan Attacks

### 🔴 Severidad: CRITICAL

### Descripción
Uso de préstamos sin colateral para manipular protocolos en una sola transacción.

### Anatomía de un Flash Loan Attack

```solidity
contract FlashLoanAttacker {
    function attack() external {
        // 1. Pedir prestado sin colateral
        uint256 loanAmount = 10_000_000e18;
        aaveLendingPool.flashLoan(
            address(this),
            [dai],
            [loanAmount],
            ""
        );
    }

    function executeOperation(
        address[] assets,
        uint256[] amounts,
        uint256[] premiums
    ) external returns (bool) {
        uint256 loanAmount = amounts[0];

        // 2. Manipular protocolo vulnerable
        // Ejemplo: manipular precio
        vulnerableDEX.swap(loanAmount, tokenA, tokenB);

        // 3. Explotar precio manipulado
        vulnerableLending.borrow(maxAmount);

        // 4. Revertir manipulación
        vulnerableDEX.swap(balance, tokenB, tokenA);

        // 5. Devolver préstamo + fee
        dai.approve(address(aaveLendingPool), loanAmount + premiums[0]);

        // 6. Profit
        return true;
    }
}
```

### Casos Reales
- **bZx (2020)**: $954k en dos ataques consecutivos
- **Cream Finance (2021)**: $130M via flash loan
- **Poly Network (2021)**: $600M (aunque fue devuelto)

### Mitigación

```solidity
// ✅ Solución 1: No depender de balance actual
contract Vulnerable {
    function calculate() public view returns (uint256) {
        // 🚩 Mal
        return tokenA.balanceOf(address(this));
    }
}

contract Secure {
    uint256 public tracked Balance;

    function calculate() public view returns (uint256) {
        // ✅ Bien - usa balance trackeado
        return trackedBalance;
    }

    function deposit(uint256 amount) public {
        tokenA.transferFrom(msg.sender, address(this), amount);
        trackedBalance += amount; // Track manualmente
    }
}

// ✅ Solución 2: Reentrancy protection
// Los flash loans a menudo involucran reentrancy
contract Protected is ReentrancyGuard {
    function criticalFunction() public nonReentrant {
        // ...
    }
}

// ✅ Solución 3: TWAP para precios (ver sección Oracle)

// ✅ Solución 4: Delays y timelocks
contract WithDelay {
    mapping(address => uint256) public depositTime;
    uint256 public constant LOCK_PERIOD = 1 hours;

    function withdraw() public {
        require(
            block.timestamp >= depositTime[msg.sender] + LOCK_PERIOD,
            "Too soon"
        );
        // Flash loan no puede esperar 1 hora
    }
}

// ✅ Solución 5: Verificar que no es flash loan
modifier notInFlashLoan() {
    uint256 balanceBefore = address(this).balance;
    _;
    require(
        address(this).balance >= balanceBefore,
        "Flash loan detected"
    );
}
```

---

## 7. Denial of Service (DOS)

### 🟡 Severidad: MEDIUM

### Variantes

#### 7.1 Unbounded Loops

```solidity
contract UnboundedLoop {
    address[] public users;

    // 🚩 Gas cost crece con cada usuario
    function distributeRewards() public {
        for (uint i = 0; i < users.length; i++) {
            sendReward(users[i]);
        }
        // Eventualmente excede block gas limit
    }
}

// ✅ Solución: Pagination o pull pattern
contract Secure {
    mapping(address => uint256) public pendingRewards;

    // Cualquiera puede calcular rewards para un usuario
    function calculateReward(address user) public {
        pendingRewards[user] = computeReward(user);
    }

    // Usuario retira sus propios rewards
    function claimReward() public {
        uint256 reward = pendingRewards[msg.sender];
        pendingRewards[msg.sender] = 0;
        payable(msg.sender).transfer(reward);
    }
}
```

#### 7.2 Block Gas Limit DOS

```solidity
contract AuctionDOS {
    address public highestBidder;
    uint256 public highestBid;

    function bid() public payable {
        require(msg.value > highestBid);

        // 🚩 Refund anterior bidder
        payable(highestBidder).transfer(highestBid);

        highestBidder = msg.sender;
        highestBid = msg.value;
    }
}

// Attack: Hacer que transfer siempre falle
contract AttackerBidder {
    receive() external payable {
        revert(); // Nunca acepta refund
    }

    function attack(AuctionDOS auction) external payable {
        auction.bid{value: msg.value}();
        // Ahora nadie más puede hacer bid
    }
}

// ✅ Solución: Pull over push
contract SecureAuction {
    mapping(address => uint256) public pendingReturns;

    function bid() public payable {
        require(msg.value > highestBid);

        // No enviar directamente, registrar deuda
        pendingReturns[highestBidder] += highestBid;

        highestBidder = msg.sender;
        highestBid = msg.value;
    }

    function withdraw() public {
        uint256 amount = pendingReturns[msg.sender];
        pendingReturns[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
```

---

## 8. Signature Replay

### 🟠 Severidad: HIGH

### Descripción
Reutilización de firmas válidas en contextos no autorizados.

```solidity
contract VulnerableMetaTx {
    function executeMetaTx(
        address from,
        address to,
        uint256 amount,
        bytes signature
    ) public {
        bytes32 hash = keccak256(abi.encodePacked(from, to, amount));
        address signer = recoverSigner(hash, signature);

        // 🚩 No previene replay
        require(signer == from);

        _transfer(from, to, amount);
    }
}

// ✅ Solución 1: Nonces
contract SecureMetaTx {
    mapping(address => uint256) public nonces;

    function executeMetaTx(
        address from,
        address to,
        uint256 amount,
        uint256 nonce,
        bytes signature
    ) public {
        require(nonce == nonces[from], "Invalid nonce");

        bytes32 hash = keccak256(abi.encodePacked(from, to, amount, nonce));
        require(recoverSigner(hash, signature) == from);

        nonces[from]++;
        _transfer(from, to, amount);
    }
}

// ✅ Solución 2: Chain ID + contract address
contract FullySecure {
    function executeMetaTx(...) public {
        bytes32 hash = keccak256(abi.encodePacked(
            from,
            to,
            amount,
            nonce,
            block.chainid,      // Previene replay cross-chain
            address(this)       // Previene replay cross-contract
        ));
        // ...
    }
}

// ✅ Solución 3: EIP-712 (estándar)
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract EIP712MetaTx is EIP712 {
    bytes32 private constant METATX_TYPEHASH = keccak256(
        "MetaTx(address from,address to,uint256 amount,uint256 nonce)"
    );

    function executeMetaTx(...) public {
        bytes32 structHash = keccak256(abi.encode(
            METATX_TYPEHASH,
            from,
            to,
            amount,
            nonce
        ));

        bytes32 hash = _hashTypedDataV4(structHash);
        require(recoverSigner(hash, signature) == from);
        // ...
    }
}
```

---

## 9. Delegatecall Injection

### 🔴 Severidad: CRITICAL

### Descripción
`delegatecall` ejecuta código en el contexto del caller, permitiendo modificar storage.

```solidity
contract Vulnerable {
    address public owner;
    address public implementation;

    // 🚩 Usuario controla a qué contrato se hace delegatecall
    function execute(address target, bytes data) public {
        target.delegatecall(data);
    }
}

// Attack
contract Malicious {
    address public owner; // Mismo slot que en Vulnerable

    function pwn() public {
        owner = msg.sender; // Modifica owner en Vulnerable!
    }
}

// ✅ Solución: Whitelist de targets
contract Secure {
    mapping(address => bool) public allowedImplementations;

    function execute(address target, bytes data) public onlyOwner {
        require(allowedImplementations[target], "Not allowed");
        target.delegatecall(data);
    }
}
```

---

## 10. Randomness

### 🟠 Severidad: MEDIUM-HIGH

### Descripción
Uso de fuentes de aleatoriedad predecibles.

```solidity
// 🚩 Predecible
contract BadRandom {
    function random() public view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender
        )));
        // Miner puede manipular
    }
}

// ✅ Solución: Chainlink VRF
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract SecureRandom is VRFConsumerBase {
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;

    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee);
        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32, uint256 randomness) internal override {
        randomResult = randomness;
    }
}
```

---

## Referencias

- [SWC Registry](https://swcregistry.io/)
- [Consensys Known Attacks](https://consensys.github.io/smart-contract-best-practices/attacks/)
- [Rekt News](https://rekt.news/) - Postmortems de hacks reales
- [DeFi Hacks Reproduction](https://github.com/SunWeb3Sec/DeFiHackLabs)
- [Secureum Mindmap](https://github.com/x676f64/secureum-mind_map)

## Próximos Pasos

- `tools.md` - Herramientas para detectar estas vulnerabilidades
- `pentest.md` - Metodología de pentesting
- `audit.md` - Proceso completo de auditoría
