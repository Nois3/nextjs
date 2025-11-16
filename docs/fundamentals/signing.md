# Firma de Mensajes en Web3

## Índice
1. [¿Por qué Firmar Mensajes?](#por-qué-firmar-mensajes)
2. [Criptografía Detrás de las Firmas](#criptografía-detrás-de-las-firmas)
3. [Tipos de Firma](#tipos-de-firma)
4. [EIP-191: Firmas Simples](#eip-191-firmas-simples)
5. [EIP-712: Typed Data](#eip-712-typed-data)
6. [Verificación On-chain vs Off-chain](#verificación-on-chain-vs-off-chain)
7. [Casos de Uso](#casos-de-uso)
8. [Implementación Práctica](#implementación-práctica)
9. [Seguridad y Ataques](#seguridad-y-ataques)

---

## ¿Por qué Firmar Mensajes?

La firma de mensajes permite:

1. **Autenticación sin contraseña**: Probar propiedad de una dirección
2. **Autorización**: Permitir acciones sin transacción on-chain
3. **Integridad de datos**: Garantizar que un mensaje no fue alterado
4. **Gasless transactions**: Meta-transactions con relayers
5. **Off-chain agreements**: Acuerdos que se ejecutan on-chain más tarde

### Diferencia con Transacciones

| Característica | Transacción | Firma de Mensaje |
|----------------|-------------|------------------|
| **Costo** | Gas fees | Gratis |
| **On-chain** | Sí, estado cambia | No |
| **Velocidad** | ~12 seg (Ethereum) | Instantáneo |
| **Propósito** | Cambiar estado | Autenticar/Autorizar |
| **Reversible** | No | No aplicable |

---

## Criptografía Detrás de las Firmas

### ECDSA (Elliptic Curve Digital Signature Algorithm)

Ethereum usa la curva **secp256k1** (la misma que Bitcoin).

**Proceso de Firma**:
```
1. Mensaje (m)
   ↓
2. Hash del mensaje: h = keccak256(m)
   ↓
3. Firma con clave privada: (r, s, v) = sign(h, privateKey)
   ↓
4. Salida: Firma de 65 bytes
   - r: 32 bytes (componente x del punto en la curva)
   - s: 32 bytes (prueba)
   - v: 1 byte  (recovery id: 27 o 28)
```

**Proceso de Verificación**:
```
1. Firma (r, s, v) + Mensaje (m)
   ↓
2. Recuperar clave pública: pubKey = ecrecover(keccak256(m), v, r, s)
   ↓
3. Derivar dirección: address = keccak256(pubKey)[últimos 20 bytes]
   ↓
4. Comparar con dirección esperada
```

### Propiedades Matemáticas

- **No reversible**: No puedes obtener la clave privada de la firma
- **Determinista** (con RFC 6979): Misma entrada = misma firma
- **Único**: Solo el dueño de la clave privada puede generar firmas válidas
- **Verificable públicamente**: Cualquiera puede verificar con la clave pública

---

## Tipos de Firma

### 1. Personal Sign (EIP-191)

Firma simple de texto con prefijo de seguridad.

```typescript
import { signMessage } from 'viem/accounts';

const message = 'Bienvenido a mi dApp!';
const signature = await walletClient.signMessage({
  message
});

// Formato de firma:
// 0x + 130 caracteres hexadecimales (65 bytes)
// Ejemplo: 0x1234...abcd (v,r,s concatenados)
```

### 2. Typed Data Sign (EIP-712)

Firma estructurada y legible para humanos.

```typescript
const domain = {
  name: 'Mi dApp',
  version: '1',
  chainId: 1,
  verifyingContract: '0x...'
};

const types = {
  Mail: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'contents', type: 'string' }
  ]
};

const message = {
  from: '0x...',
  to: '0x...',
  contents: 'Hello!'
};

const signature = await walletClient.signTypedData({
  domain,
  types,
  primaryType: 'Mail',
  message
});
```

### 3. Transaction Sign

Firmar una transacción antes de enviarla.

```typescript
const signedTx = await walletClient.signTransaction({
  to: '0x...',
  value: parseEther('0.1'),
  gas: 21000n,
  nonce: 0
});
```

---

## EIP-191: Firmas Simples

### Especificación

```
0x19 <1 byte version> <version specific data> <data to sign>
```

**Versiones**:
- `0x00`: Data con validator (smart contract)
- `0x01`: Structured data (EIP-712)
- `0x45`: Personal message (texto plano)

### Personal Sign Implementation

```solidity
// Lo que realmente se firma:
string memory prefix = "\x19Ethereum Signed Message:\n";
bytes32 messageHash = keccak256(abi.encodePacked(
    prefix,
    uintToString(message.length),
    message
));
```

**Razón del prefijo**: Prevenir que una firma de mensaje se use como firma de transacción.

### Ejemplo Completo

```typescript
import { verifyMessage } from 'viem';

// Frontend: Usuario firma
const message = 'Login at 2024-01-15 10:30:00';
const signature = await walletClient.signMessage({
  account,
  message
});

// Backend: Verificar firma
const recoveredAddress = await verifyMessage({
  message,
  signature
});

if (recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()) {
  // ✅ Firma válida
  // Crear sesión, dar acceso, etc.
}
```

---

## EIP-712: Typed Data

### ¿Por qué EIP-712?

**Problema con EIP-191**:
- Usuarios firman blobs hexadecimales sin saber contenido
- Phishing fácil
- No hay estructura

**Solución EIP-712**:
- Datos estructurados y tipados
- Wallets muestran contenido legible
- Verificación de dominio

### Anatomía de un Typed Data

```typescript
// 1. Domain Separator (contexto)
const domain = {
  name: 'Uniswap',              // Nombre del protocolo
  version: '2',                  // Versión
  chainId: 1,                    // Red (evita replay attacks)
  verifyingContract: '0x...',    // Contrato que verificará
  salt: '0x...'                  // Opcional: aleatoriedad extra
};

// 2. Types (schema de datos)
const types = {
  // Tipo principal
  Permit: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ],
  // Tipos anidados si es necesario
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' }
  ]
};

// 3. Message (datos actuales)
const message = {
  owner: '0xUserAddress',
  spender: '0xSpenderAddress',
  value: parseEther('100'),
  nonce: 0,
  deadline: 1234567890
};

// 4. Firmar
const signature = await walletClient.signTypedData({
  domain,
  types,
  primaryType: 'Permit',
  message
});
```

### Hash EIP-712

```typescript
// Proceso de hashing
const domainSeparator = keccak256(abi.encode(
  keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
  keccak256(name),
  keccak256(version),
  chainId,
  verifyingContract
));

const structHash = keccak256(abi.encode(
  keccak256('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)'),
  owner,
  spender,
  value,
  nonce,
  deadline
));

const digest = keccak256(abi.encodePacked(
  '0x1901',  // EIP-191 version 0x01
  domainSeparator,
  structHash
));
```

---

## Verificación On-chain vs Off-chain

### Off-chain Verification (Backend)

**Ventajas**:
- Gratis (no gas)
- Rápida
- Flexible

**Implementación**:
```typescript
// Node.js backend
import { verifyTypedData } from 'viem';

async function verifyPermit(signature: `0x${string}`, message: any) {
  const recoveredAddress = await verifyTypedData({
    domain,
    types,
    primaryType: 'Permit',
    message,
    signature
  });

  return recoveredAddress === message.owner;
}
```

### On-chain Verification (Smart Contract)

**Ventajas**:
- Trustless
- Inmutable
- Parte de la lógica del contrato

**Implementación Solidity**:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SignatureVerifier {
    // Domain separator (calculado una vez)
    bytes32 public immutable DOMAIN_SEPARATOR;

    // Type hash para Permit
    bytes32 public constant PERMIT_TYPEHASH = keccak256(
        "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    );

    mapping(address => uint256) public nonces;

    constructor() {
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256("MyContract"),
            keccak256("1"),
            block.chainid,
            address(this)
        ));
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(block.timestamp <= deadline, "Expired");

        bytes32 structHash = keccak256(abi.encode(
            PERMIT_TYPEHASH,
            owner,
            spender,
            value,
            nonces[owner]++,
            deadline
        ));

        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            structHash
        ));

        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress == owner, "Invalid signature");

        // Lógica del permit (aprobar sin transacción)
        _approve(owner, spender, value);
    }
}
```

---

## Casos de Uso

### 1. Sign-in con Ethereum (SIWE)

```typescript
// Generar mensaje de login
const message = `yoursite.com wants you to sign in with your Ethereum account:
${address}

Please sign to authenticate.

URI: https://yoursite.com
Version: 1
Chain ID: 1
Nonce: ${randomNonce}
Issued At: ${new Date().toISOString()}`;

const signature = await walletClient.signMessage({ message });

// Backend verifica y crea sesión
```

### 2. Gasless Approvals (ERC-20 Permit)

```typescript
// Usuario firma permit off-chain
const { v, r, s } = await signPermit({
  token: '0xUSDC',
  owner: userAddress,
  spender: '0xProtocol',
  value: amount,
  deadline
});

// Protocolo usa la firma para aprobar on-chain (sin que usuario pague gas)
await protocol.executeWithPermit(owner, spender, value, deadline, v, r, s);
```

### 3. Meta-transactions (Gasless)

```typescript
// Usuario firma la intención de transacción
const signature = await signTypedData({
  domain,
  types: {
    ForwardRequest: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'gas', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'data', type: 'bytes' }
    ]
  },
  message: forwardRequest
});

// Relayer ejecuta y paga el gas
await relayer.execute(forwardRequest, signature);
```

### 4. Off-chain Orders (DEX)

```typescript
// Usuario crea orden off-chain (gratis)
const order = {
  maker: userAddress,
  taker: '0x0000...', // anyone
  tokenIn: '0xUSDC',
  tokenOut: '0xWETH',
  amountIn: parseUnits('1000', 6),
  amountOut: parseEther('0.5'),
  expiry: deadline
};

const signature = await signTypedData({ domain, types, message: order });

// Se publica en orderbook off-chain
// Taker ejecuta on-chain cuando le conviene
await dex.fillOrder(order, signature);
```

---

## Implementación Práctica

### Hook Personalizado para Sign-in

```typescript
'use client';
import { useSignMessage, useAccount } from 'wagmi';
import { verifyMessage } from 'viem';
import { useState } from 'react';

export function useSignIn() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (!address) throw new Error('No connected');

    setLoading(true);
    try {
      // 1. Obtener nonce del backend
      const nonceRes = await fetch('/api/auth/nonce', {
        method: 'POST',
        body: JSON.stringify({ address })
      });
      const { nonce } = await nonceRes.json();

      // 2. Crear mensaje
      const message = `Sign in to Web3 Learning Hub\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;

      // 3. Firmar
      const signature = await signMessageAsync({ message });

      // 4. Verificar en backend
      const authRes = await fetch('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ address, message, signature })
      });

      if (!authRes.ok) throw new Error('Authentication failed');

      const { token } = await authRes.json();
      return token;
    } finally {
      setLoading(false);
    }
  }

  return { signIn, loading };
}
```

### Componente de Firma

Ver implementación en `/app/signing/page.tsx` (lo crearemos más adelante).

---

## Seguridad y Ataques

### Vectores de Ataque

#### 1. Replay Attacks

**Problema**: Reusar firma en otro contexto.

**Mitigación**:
```solidity
// ✅ Incluir nonce
mapping(address => uint256) public nonces;

// ✅ Incluir chainId en domain
domain.chainId = block.chainid;

// ✅ Incluir deadline
require(block.timestamp <= deadline, "Expired");

// ✅ Incluir verifyingContract
domain.verifyingContract = address(this);
```

#### 2. Signature Malleability

**Problema**: Misma firma puede tener representaciones diferentes (s vs n-s).

**Mitigación**:
```solidity
// ✅ Validar que s esté en rango bajo
require(uint256(s) <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0, "Invalid s");

// ✅ Usar OpenZeppelin ECDSA
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
address signer = ECDSA.recover(digest, signature);
```

#### 3. Phishing

**Problema**: Usuario firma mensaje malicioso sin saberlo.

**Mitigación**:
```typescript
// ✅ Usar EIP-712 (wallets muestran contenido)
// ✅ Validar dominio
if (domain.name !== 'ExpectedDApp') throw new Error('Invalid domain');

// ✅ Educar usuarios sobre qué están firmando
```

#### 4. Front-running

**Problema**: Atacante ve firma en mempool y la usa primero.

**Mitigación**:
```solidity
// ✅ Incluir beneficiario específico
message.recipient = msg.sender; // Solo el recipient puede usar la firma

// ✅ Usar commit-reveal
// Fase 1: Commit hash de la firma
// Fase 2: Reveal firma real
```

### Best Practices

```typescript
// ✅ SIEMPRE incluir estos campos en EIP-712
const domain = {
  name: 'DApp Name',
  version: '1',
  chainId: await publicClient.getChainId(),
  verifyingContract: CONTRACT_ADDRESS
};

// ✅ SIEMPRE incluir nonce y deadline
const message = {
  ...data,
  nonce: await contract.read.nonces([address]),
  deadline: Math.floor(Date.now() / 1000) + 3600 // 1 hora
};

// ✅ VALIDAR antes de firmar
function validateMessage(message: any) {
  if (!isAddress(message.to)) throw new Error('Invalid address');
  if (message.amount > MAX_AMOUNT) throw new Error('Amount too large');
  if (message.deadline < Date.now() / 1000) throw new Error('Already expired');
}

// ✅ NUNCA confiar solo en firma (validar lógica on-chain también)
```

---

## Recursos

- [EIP-191: Signed Data Standard](https://eips.ethereum.org/EIPS/eip-191)
- [EIP-712: Typed structured data hashing and signing](https://eips.ethereum.org/EIPS/eip-712)
- [EIP-2612: Permit Extension for ERC-20](https://eips.ethereum.org/EIPS/eip-2612)
- [Sign-In with Ethereum (SIWE)](https://eips.ethereum.org/EIPS/eip-4361)
- [OpenZeppelin ECDSA Library](https://docs.openzeppelin.com/contracts/4.x/api/utils#ECDSA)

---

## Siguiente Paso

Continúa con [Transacciones](./transactions.md) para aprender sobre el ciclo de vida completo de una transacción en Ethereum.
