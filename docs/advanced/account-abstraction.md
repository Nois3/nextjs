# 🔐 Account Abstraction (ERC-4337)

> **El futuro de las wallets en Ethereum: Smart Wallets, gasless transactions, y mejor UX**

## 📖 Tabla de Contenidos

- [¿Qué es Account Abstraction?](#qué-es-account-abstraction)
- [Problema con EOAs](#problema-con-eoas)
- [ERC-4337 Overview](#erc-4337-overview)
- [Componentes Principales](#componentes-principales)
- [UserOperations](#useroperations)
- [EntryPoint Contract](#entrypoint-contract)
- [Smart Wallets](#smart-wallets)
- [Bundlers](#bundlers)
- [Paymasters](#paymasters)
- [Casos de Uso](#casos-de-uso)
- [Implementación](#implementación)
- [Proveedores y SDKs](#proveedores-y-sdks)
- [Best Practices](#best-practices)

---

## ¿Qué es Account Abstraction?

**Account Abstraction** (AA) permite que las cuentas de Ethereum sean **smart contracts** en lugar de solo **EOAs** (Externally Owned Accounts).

### Tipos de Cuentas en Ethereum

#### 1. **EOA** (Externally Owned Account) - Tradicional

```
Características:
✅ Controlada por clave privada
❌ No puede ejecutar lógica custom
❌ Debe pagar gas con ETH
❌ No puede tener múltiples signers
❌ No recuperable si pierdes la clave
```

#### 2. **Smart Contract Account** (AA) - Moderno

```
Características:
✅ Controlada por código (lógica arbitraria)
✅ Puede ejecutar lógica custom (batching, etc.)
✅ Puede pagar gas con ERC-20 (USDC, DAI, etc.)
✅ Multi-sig, social recovery, etc.
✅ Recuperable (múltiples métodos)
```

---

## Problema con EOAs

### 1. **Single Point of Failure**

```
Pierdes la clave privada → Pierdes TODO
No hay recovery → Fondos perdidos para siempre
```

### 2. **UX Pobre para Usuarios**

```typescript
// Usuario nuevo necesita:
1. Comprar ETH en exchange
2. Mover ETH a wallet
3. Solo ENTONCES puede interactuar con dApps

// Fricción enorme para onboarding
```

### 3. **Gas en ETH Obligatorio**

```typescript
// Tienes 1000 USDC pero 0 ETH
// ❌ No puedes transferir el USDC (necesitas ETH para gas)

// Con AA:
// ✅ Pagar gas con USDC directamente
```

### 4. **Sin Lógica Custom**

```typescript
// EOA no puede:
- Batch de transacciones
- Rotación de claves
- Límites de gasto
- Pausar cuenta si es hackeada
- Permitir solo ciertas operaciones
```

---

## ERC-4337 Overview

**ERC-4337** es el estándar de Account Abstraction sin requerir cambios al protocolo de Ethereum.

### ¿Cómo Funciona?

```
Usuario                Smart Wallet              Bundler                EntryPoint
  │                        │                        │                       │
  │──(1) Crea UserOp──────>│                        │                       │
  │                        │                        │                       │
  │                        │──(2) Firma UserOp─────>│                       │
  │                        │                        │                       │
  │                        │                        │──(3) Valida UserOp───>│
  │                        │                        │                       │
  │                        │                        │<──(4) Ejecuta────────│
  │                        │<──────────────────────────────────────────────│
  │<───(5) Confirmación────│                        │                       │
```

### Ventajas

- ✅ **No requiere hard fork** (es un estándar en capa de aplicación)
- ✅ **Backwards compatible** (EOAs siguen funcionando)
- ✅ **Gasless transactions** (paymasters pagan gas)
- ✅ **Batching** nativo
- ✅ **Social recovery**
- ✅ **Session keys** (permisos temporales)

---

## Componentes Principales

### 1. **UserOperation (UserOp)**

Equivalente a una "transacción" pero para smart wallets.

```typescript
interface UserOperation {
  sender: Address;              // Smart wallet address
  nonce: bigint;                // Anti-replay
  initCode: Hex;                // Deploy wallet si no existe
  callData: Hex;                // Función a ejecutar
  callGasLimit: bigint;         // Gas para la ejecución
  verificationGasLimit: bigint; // Gas para verificar firma
  preVerificationGas: bigint;   // Gas overhead
  maxFeePerGas: bigint;         // EIP-1559
  maxPriorityFeePerGas: bigint; // EIP-1559
  paymasterAndData: Hex;        // Paymaster info
  signature: Hex;               // Firma del owner
}
```

### 2. **EntryPoint**

Contrato singleton que coordina todo.

**Address (todas las chains):**
```
0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
```

**Funciones principales:**
```solidity
interface IEntryPoint {
    function handleOps(
        UserOperation[] calldata ops,
        address payable beneficiary
    ) external;

    function getUserOpHash(UserOperation calldata userOp)
        external view returns (bytes32);
}
```

### 3. **Smart Wallet**

El contrato que representa la cuenta del usuario.

```solidity
interface IAccount {
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData);
}
```

### 4. **Bundler**

Servicio que agrupa múltiples UserOps en 1 tx.

- Escucha UserOps en el mempool alternativo
- Valida UserOps
- Agrupa múltiples UserOps
- Envía la tx al EntryPoint
- Recibe reembolso de gas + fee

### 5. **Paymaster** (Opcional)

Contrato que paga el gas en nombre del usuario.

```solidity
interface IPaymaster {
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external returns (bytes memory context, uint256 validationData);

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external;
}
```

---

## UserOperations

### Crear UserOp

```typescript
import { encodeFunctionData } from 'viem';

const userOp: UserOperation = {
  sender: smartWalletAddress,
  nonce: await getNonce(smartWalletAddress),
  initCode: '0x', // '0x' si wallet ya desplegada
  callData: encodeFunctionData({
    abi: smartWalletAbi,
    functionName: 'execute',
    args: [
      targetContract,
      value,
      data,
    ],
  }),
  callGasLimit: 100_000n,
  verificationGasLimit: 100_000n,
  preVerificationGas: 21_000n,
  maxFeePerGas: parseGwei('10'),
  maxPriorityFeePerGas: parseGwei('1'),
  paymasterAndData: '0x', // Sin paymaster
  signature: '0x', // Se firma después
};
```

### Firmar UserOp

```typescript
// 1. Obtener hash del UserOp
const userOpHash = await entryPoint.read.getUserOpHash([userOp]);

// 2. Firmar el hash
const signature = await walletClient.signMessage({
  message: { raw: userOpHash },
});

// 3. Agregar firma al UserOp
userOp.signature = signature;
```

### Enviar UserOp

```typescript
// Enviar al bundler
const bundlerClient = createBundlerClient({
  transport: http('https://bundler.example.com'),
});

const userOpHash = await bundlerClient.sendUserOperation({
  userOperation: userOp,
  entryPoint: ENTRY_POINT_ADDRESS,
});

// Esperar confirmación
const receipt = await bundlerClient.waitForUserOperationReceipt({
  hash: userOpHash,
});

console.log('UserOp confirmada:', receipt);
```

---

## EntryPoint Contract

El EntryPoint es el corazón de ERC-4337.

### Flujo de Ejecución

```solidity
1. handleOps() recibe múltiples UserOps
2. Para cada UserOp:
   a. Valida firma (llama a wallet.validateUserOp())
   b. Si usa paymaster, valida paymaster
   c. Ejecuta la operación (wallet.execute())
   d. Si usa paymaster, llama a paymaster.postOp()
   e. Reembolsa gas al bundler
```

### Ejemplo de Uso

```typescript
const entryPoint = getContract({
  address: ENTRY_POINT_ADDRESS,
  abi: entryPointAbi,
  client: walletClient,
});

// Ejecutar múltiples UserOps
await entryPoint.write.handleOps([
  [userOp1, userOp2, userOp3],
  bundlerAddress, // Beneficiary (recibe fees)
]);
```

---

## Smart Wallets

### Ejemplo: Simple Account

```solidity
contract SimpleAccount is IAccount {
    address public owner;
    IEntryPoint public immutable entryPoint;

    constructor(IEntryPoint _entryPoint, address _owner) {
        entryPoint = _entryPoint;
        owner = _owner;
    }

    // Validar firma del UserOp
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external override returns (uint256) {
        require(msg.sender == address(entryPoint), "Only EntryPoint");

        // Verificar firma
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        address signer = hash.recover(userOp.signature);
        require(signer == owner, "Invalid signature");

        // Pagar gas si es necesario
        if (missingAccountFunds > 0) {
            (bool success, ) = payable(msg.sender).call{
                value: missingAccountFunds
            }("");
            require(success, "Payment failed");
        }

        return 0; // Validation success
    }

    // Ejecutar llamada
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external {
        require(msg.sender == address(entryPoint), "Only EntryPoint");
        (bool success, ) = dest.call{value: value}(func);
        require(success, "Call failed");
    }
}
```

### Features Comunes en Smart Wallets

#### 1. **Multi-Sig**

```solidity
address[] public owners;
uint256 public threshold;

function validateUserOp(...) external override returns (uint256) {
    // Requiere N de M firmas
    bytes[] memory signatures = parseSignatures(userOp.signature);
    require(signatures.length >= threshold, "Not enough signatures");

    // Verificar cada firma
    for (uint i = 0; i < signatures.length; i++) {
        address signer = recoverSigner(userOpHash, signatures[i]);
        require(isOwner(signer), "Invalid signer");
    }

    return 0;
}
```

#### 2. **Social Recovery**

```solidity
address[] public guardians;

function recover(address newOwner, bytes[] calldata guardiansSignatures) external {
    require(guardiansSignatures.length >= threshold, "Not enough guardians");

    // Verificar firmas de guardians
    for (uint i = 0; i < guardiansSignatures.length; i++) {
        // ...
    }

    owner = newOwner;
}
```

#### 3. **Spending Limits**

```solidity
uint256 public dailyLimit;
uint256 public spentToday;
uint256 public lastDay;

function execute(address dest, uint256 value, bytes calldata func) external {
    if (block.timestamp / 1 days != lastDay) {
        spentToday = 0;
        lastDay = block.timestamp / 1 days;
    }

    require(spentToday + value <= dailyLimit, "Daily limit exceeded");
    spentToday += value;

    // Execute...
}
```

#### 4. **Session Keys**

```solidity
struct SessionKey {
    address key;
    uint48 validUntil;
    uint48 validAfter;
    address[] allowedTargets;
}

mapping(address => SessionKey) public sessionKeys;

function validateUserOp(...) external override returns (uint256) {
    address signer = recover(userOpHash, userOp.signature);

    // Verificar si es session key válida
    if (sessionKeys[signer].key != address(0)) {
        SessionKey memory session = sessionKeys[signer];
        require(block.timestamp >= session.validAfter, "Too early");
        require(block.timestamp <= session.validUntil, "Expired");

        // Verificar target permitido
        address target = parseTarget(userOp.callData);
        require(isAllowedTarget(session, target), "Target not allowed");
    } else {
        require(signer == owner, "Invalid signature");
    }

    return 0;
}
```

---

## Bundlers

### ¿Qué Hace un Bundler?

1. **Escucha** UserOps en un mempool alternativo
2. **Simula** cada UserOp (verifica que no falle)
3. **Valida** firmas y gas
4. **Agrupa** múltiples UserOps compatibles
5. **Envía** tx al EntryPoint
6. **Recibe** reembolso de gas + fee

### Proveedores de Bundlers

- **Alchemy**: [https://www.alchemy.com/account-abstraction](https://www.alchemy.com/account-abstraction)
- **Stackup**: [https://www.stackup.sh/](https://www.stackup.sh/)
- **Pimlico**: [https://www.pimlico.io/](https://www.pimlico.io/)
- **Biconomy**: [https://www.biconomy.io/](https://www.biconomy.io/)

### Usar Bundler con Viem

```typescript
import { createBundlerClient } from 'viem/account-abstraction';

const bundlerClient = createBundlerClient({
  transport: http('https://api.alchemy.com/v2/YOUR_API_KEY'),
});

// Enviar UserOp
const hash = await bundlerClient.sendUserOperation({
  userOperation: userOp,
  entryPoint: ENTRY_POINT_ADDRESS,
});
```

---

## Paymasters

Contratos que pagan el gas por el usuario.

### Tipos de Paymasters

#### 1. **Verifying Paymaster**

Paga solo si se cumplen condiciones:

```solidity
contract VerifyingPaymaster is IPaymaster {
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external override returns (bytes memory, uint256) {
        // Verificar firma del paymaster service
        (bytes memory signature, uint48 validUntil, uint48 validAfter) =
            parsePaymasterData(userOp.paymasterAndData);

        bytes32 hash = getHash(userOp, validUntil, validAfter);
        address signer = hash.recover(signature);

        require(signer == verifyingSigner, "Invalid paymaster signature");
        require(block.timestamp >= validAfter, "Too early");
        require(block.timestamp <= validUntil, "Expired");

        return ("", 0);
    }

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external override {
        // Opcional: Lógica post-ejecución
    }
}
```

#### 2. **Token Paymaster**

Usuario paga gas con ERC-20:

```solidity
contract TokenPaymaster is IPaymaster {
    IERC20 public token; // USDC, DAI, etc.
    uint256 public tokensPerEth; // Exchange rate

    function validatePaymasterUserOp(...) external override returns (bytes memory, uint256) {
        // Calcular costo en tokens
        uint256 tokenCost = maxCost * tokensPerEth / 1e18;

        // Verificar balance
        require(
            token.balanceOf(userOp.sender) >= tokenCost,
            "Insufficient token balance"
        );

        // Retornar context para postOp
        return (abi.encode(userOp.sender, tokenCost), 0);
    }

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external override {
        (address user, uint256 tokenCost) = abi.decode(context, (address, uint256));

        // Cobrar tokens del usuario
        token.transferFrom(user, address(this), tokenCost);
    }
}
```

#### 3. **Sponsorship Paymaster**

Aplicación paga gas por el usuario:

```solidity
contract SponsorshipPaymaster is IPaymaster {
    mapping(address => bool) public sponsoredWallets;

    function validatePaymasterUserOp(...) external override returns (bytes memory, uint256) {
        require(
            sponsoredWallets[userOp.sender],
            "Wallet not sponsored"
        );

        return ("", 0);
    }
}
```

### Usar Paymaster

```typescript
// Agregar paymaster al UserOp
userOp.paymasterAndData = concat([
  paymasterAddress,
  encodePacked(['uint48', 'uint48'], [validUntil, validAfter]),
  paymasterSignature,
]);
```

---

## Casos de Uso

### 1. **Onboarding Sin Fricciones**

```typescript
// Usuario nuevo NO necesita ETH
// Paymaster paga el gas inicial
const userOp = createUserOp({
  callData: mintNFT(),
  paymasterAndData: sponsorshipPaymaster, // ← App paga
});

await bundler.sendUserOperation(userOp);
// ✅ Usuario interactúa sin comprar ETH primero
```

### 2. **Gas en Stablecoins**

```typescript
// Usuario paga gas con USDC
const userOp = createUserOp({
  callData: swapTokens(),
  paymasterAndData: usdcPaymaster, // ← Paga con USDC
});
```

### 3. **Social Recovery**

```typescript
// Usuario perdió clave privada
// Guardians pueden recuperar la cuenta
await smartWallet.recover({
  newOwner: '0xNewOwnerAddress',
  signatures: [
    guardianSignature1,
    guardianSignature2,
    guardianSignature3, // 3 de 5 guardians
  ],
});
```

### 4. **Session Keys para Gaming**

```typescript
// Usuario aprueba session key para juego
await smartWallet.addSessionKey({
  key: gameSessionKey,
  validUntil: Date.now() + 24 * 60 * 60 * 1000, // 24h
  allowedTargets: [GAME_CONTRACT],
  spendingLimit: parseEther('0.1'),
});

// Juego puede firmar txs automáticamente (sin popups)
// Usuario no ve popups por cada acción
```

### 5. **Batching de Operaciones**

```typescript
// Aprobar + Swap en 1 UserOp
const userOp = createUserOp({
  callData: executeBatch([
    {
      to: USDC,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [UNISWAP_ROUTER, amount],
      }),
    },
    {
      to: UNISWAP_ROUTER,
      data: encodeFunctionData({
        abi: uniswapAbi,
        functionName: 'swap',
        args: [...],
      }),
    },
  ]),
});
```

---

## Implementación

### Con Permissionless.js

```typescript
import { createSmartAccountClient } from 'permissionless';
import { signerToSimpleSmartAccount } from 'permissionless/accounts';

// 1. Crear signer (EOA o passkey)
const signer = privateKeyToAccount('0x...');

// 2. Crear smart account
const smartAccount = await signerToSimpleSmartAccount(publicClient, {
  signer,
  entryPoint: ENTRY_POINT_ADDRESS,
});

// 3. Crear client
const smartAccountClient = createSmartAccountClient({
  account: smartAccount,
  chain: mainnet,
  bundlerTransport: http('https://bundler.example.com'),
  middleware: {
    gasPrice: async () => ({
      maxFeePerGas: parseGwei('10'),
      maxPriorityFeePerGas: parseGwei('1'),
    }),
  },
});

// 4. Enviar tx (internamente crea UserOp)
const hash = await smartAccountClient.sendTransaction({
  to: '0xRecipient',
  value: parseEther('0.1'),
  data: '0x',
});
```

### Con Biconomy SDK

```typescript
import { BiconomySmartAccountV2 } from '@biconomy/account';

const smartAccount = await BiconomySmartAccountV2.create({
  signer,
  bundlerUrl: 'https://bundler.biconomy.io/api/v2/...',
  biconomyPaymasterApiKey: 'YOUR_API_KEY',
});

// Enviar tx con gasless (paymaster paga)
const userOp = await smartAccount.buildUserOp([
  {
    to: targetContract,
    data: callData,
  },
]);

const userOpResponse = await smartAccount.sendUserOp(userOp);
const receipt = await userOpResponse.wait();
```

---

## Proveedores y SDKs

### 1. **Permissionless.js** (Recomendado)

```bash
npm install permissionless viem
```

- Agnóstico de provider
- Type-safe con Viem
- Soporta múltiples smart wallet factories

### 2. **Alchemy Account Kit**

```bash
npm install @alchemy/aa-sdk
```

- Integrado con Alchemy Bundler
- Paymaster incluido
- Dashboard para monitoreo

### 3. **Biconomy SDK**

```bash
npm install @biconomy/account
```

- Gasless transactions out-of-the-box
- Cross-chain soporte
- Modular smart accounts

### 4. **ZeroDev**

```bash
npm install @zerodev/sdk
```

- Kernel (smart wallet modular)
- Plugins system
- Passkeys nativos

### 5. **Safe (Gnosis Safe)**

- Multi-sig tradicional
- ERC-4337 plugin
- Battle-tested

---

## Best Practices

### 1. **Validar UserOps Antes de Enviar**

```typescript
// Simular UserOp localmente
const validationResult = await bundlerClient.simulateUserOperation({
  userOperation: userOp,
  entryPoint: ENTRY_POINT_ADDRESS,
});

if (!validationResult.success) {
  console.error('UserOp would fail:', validationResult.error);
  return;
}
```

### 2. **Manejar Nonce Correctamente**

```typescript
// Obtener nonce correcto
const nonce = await entryPoint.read.getNonce([
  smartWalletAddress,
  0n, // key (para nonce management avanzado)
]);
```

### 3. **Estimar Gas Apropiadamente**

```typescript
const gasEstimate = await bundlerClient.estimateUserOperationGas({
  userOperation: userOp,
  entryPoint: ENTRY_POINT_ADDRESS,
});

userOp.callGasLimit = gasEstimate.callGasLimit;
userOp.verificationGasLimit = gasEstimate.verificationGasLimit;
userOp.preVerificationGas = gasEstimate.preVerificationGas;
```

### 4. **Usar Paymasters Responsablemente**

```typescript
// No confiar ciegamente en paymasters públicos
// Verificar reputación y límites
const paymasterDeposit = await entryPoint.read.balanceOf([paymasterAddress]);

if (paymasterDeposit < estimatedCost) {
  console.warn('⚠️ Paymaster might not have enough funds');
}
```

### 5. **Implementar Rate Limiting**

```solidity
// En tu smart wallet
uint256 public lastExecutionTime;
uint256 public constant MIN_DELAY = 1; // 1 segundo entre txs

function execute(...) external {
    require(
        block.timestamp >= lastExecutionTime + MIN_DELAY,
        "Too many operations"
    );
    lastExecutionTime = block.timestamp;
    // ...
}
```

---

## 🔐 Consideraciones de Seguridad

### 1. **Verificar Factory Address**

```typescript
// Solo usar factories confiables
const TRUSTED_FACTORIES = [
  '0xSimpleAccountFactory',
  '0xSafeProxyFactory',
];

if (!TRUSTED_FACTORIES.includes(factoryAddress)) {
  throw new Error('Untrusted factory');
}
```

### 2. **Session Keys: Minimal Permissions**

```typescript
// ✅ Scope limitado
const sessionKey = {
  validUntil: Date.now() + 3600 * 1000, // 1 hora
  allowedTargets: [SPECIFIC_GAME_CONTRACT],
  maxValue: parseEther('0.01'), // Máximo 0.01 ETH
};

// ❌ Demasiado permisivo
const badSessionKey = {
  validUntil: Date.now() + 365 * 24 * 3600 * 1000, // 1 año
  allowedTargets: [], // Cualquier contrato
  maxValue: parseEther('1000000'), // Sin límite real
};
```

### 3. **Protección contra Replay**

```solidity
// Usar chainId en validación
function validateUserOp(...) external override returns (uint256) {
    bytes32 hash = keccak256(abi.encode(
        userOpHash,
        block.chainid, // ← Importante
        address(this)
    ));

    // Verificar firma...
}
```

### 4. **Auditar Smart Wallets**

Solo usar implementaciones auditadas:
- Simple Account (Eth-Infinitism) ✅
- Safe ✅
- Kernel (ZeroDev) ✅
- Biconomy Modular SA ✅

---

## 📚 Referencias

- **ERC-4337**: [https://eips.ethereum.org/EIPS/eip-4337](https://eips.ethereum.org/EIPS/eip-4337)
- **Permissionless.js**: [https://docs.pimlico.io/permissionless](https://docs.pimlico.io/permissionless)
- **Alchemy AA Docs**: [https://accountkit.alchemy.com/](https://accountkit.alchemy.com/)
- **Biconomy Docs**: [https://docs.biconomy.io/](https://docs.biconomy.io/)
- **Safe Docs**: [https://docs.safe.global/](https://docs.safe.global/)

---

## 🎯 Resumen

- **Account Abstraction** convierte cuentas en smart contracts
- **ERC-4337** es el estándar sin hard fork
- **UserOperations** son equivalentes a transacciones
- **Bundlers** agrupan UserOps y las envían al EntryPoint
- **Paymasters** pueden pagar gas en nombre del usuario
- **Smart Wallets** pueden tener: multi-sig, social recovery, session keys, spending limits
- **Mejora UX** dramáticamente: gasless, batching, recovery
- **SDKs** disponibles: Permissionless, Alchemy, Biconomy, ZeroDev

---

**Siguiente módulo recomendado**: [Patrones de Arquitectura](../patterns/)
