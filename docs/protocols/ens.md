# 🌐 ENS (Ethereum Name Service)

> **Sistema de nombres descentralizado para Ethereum - El DNS de Web3**

## 📖 Tabla de Contenidos

- [¿Qué es ENS?](#qué-es-ens)
- [¿Por Qué ENS?](#por-qué-ens)
- [Arquitectura de ENS](#arquitectura-de-ens)
- [Resolución de Nombres](#resolución-de-nombres)
- [Reverse Resolution](#reverse-resolution)
- [Registrar un Nombre ENS](#registrar-un-nombre-ens)
- [Subdomains](#subdomains)
- [Records y Metadata](#records-y-metadata)
- [ENS Avatar](#ens-avatar)
- [Implementación con Wagmi + Viem](#implementación-con-wagmi--viem)
- [Casos de Uso](#casos-de-uso)
- [Best Practices](#best-practices)

---

## ¿Qué es ENS?

**ENS** (Ethereum Name Service) es un sistema de nombres descentralizado construido en Ethereum que mapea nombres legibles por humanos a direcciones de blockchain.

### Problema

```
❌ 0x1234567890123456789012345678901234567890
```
- Imposible de recordar
- Propenso a errores (copiar/pegar mal)
- No transmite identidad

### Solución

```
✅ vitalik.eth → 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```
- Fácil de recordar
- Menos errores
- Transmite identidad

---

## ¿Por Qué ENS?

### 1. **Legibilidad**

```typescript
// ❌ Antes de ENS
sendETH('0x1234567890123456789012345678901234567890')

// ✅ Con ENS
sendETH('alice.eth')
```

### 2. **Descentralización**

- No controlado por una empresa (como dominios .com)
- Resistente a censura
- Sin intermediarios

### 3. **Multi-Chain**

Un nombre ENS puede resolver a múltiples direcciones:

```
vitalik.eth
  → ETH: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
  → BTC: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
  → LTC: ltc1q...
```

### 4. **Metadata Rico**

```json
{
  "name": "vitalik.eth",
  "avatar": "ipfs://...",
  "description": "Co-founder of Ethereum",
  "twitter": "@VitalikButerin",
  "github": "vbuterin",
  "email": "v@ethereum.org",
  "url": "https://vitalik.ca"
}
```

---

## Arquitectura de ENS

ENS usa una arquitectura modular de **3 componentes principales**:

### 1. **Registry** (Registro)

Contrato central que almacena:
- Qué nombres existen
- Quién es el owner
- Cuál es el resolver

```solidity
interface ENS {
    function owner(bytes32 node) external view returns (address);
    function resolver(bytes32 node) external view returns (address);
    function setOwner(bytes32 node, address owner) external;
    function setResolver(bytes32 node, address resolver) external;
}
```

**Address**: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`

### 2. **Registrar**

Maneja la lógica de registro de nombres (.eth).

Funciones:
- Registrar nuevos nombres
- Renovar nombres existentes
- Transferir ownership

**Ejemplos**:
- **ETH Registrar**: Para nombres .eth
- **DNS Registrar**: Para importar dominios DNS

### 3. **Resolver**

Resuelve nombres a direcciones y otros datos.

```solidity
interface Resolver {
    function addr(bytes32 node) external view returns (address);
    function name(bytes32 node) external view returns (string);
    function text(bytes32 node, string key) external view returns (string);
}
```

**Public Resolver**: `0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63`

### Flujo de Resolución

```
1. User: "Quiero enviar ETH a alice.eth"
   ↓
2. Registry: "alice.eth tiene resolver 0xResolverAddress"
   ↓
3. Resolver: "alice.eth → 0x1234...5678"
   ↓
4. Wallet: "Enviando ETH a 0x1234...5678"
```

---

## Resolución de Nombres

### Forward Resolution (Nombre → Dirección)

```typescript
import { useEnsAddress } from 'wagmi';

function SendToENS() {
  const { data: address, isLoading } = useEnsAddress({
    name: 'vitalik.eth',
    chainId: 1, // Mainnet
  });

  if (isLoading) return <div>Resolviendo...</div>;

  return <div>vitalik.eth → {address}</div>;
  // 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
}
```

### Con Viem

```typescript
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const address = await client.getEnsAddress({
  name: normalize('vitalik.eth'),
});

console.log(address);
// 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

### Normalización

**⚠️ Importante**: Siempre normalizar nombres ENS antes de resolver.

```typescript
import { normalize } from 'viem/ens';

// ✅ Normalizar primero
const normalized = normalize('ViTaLiK.eth'); // → 'vitalik.eth'

// ❌ No normalizar puede causar errores
const bad = 'ViTaLiK.eth'; // Puede fallar o resolver incorrectamente
```

**¿Por qué?**
- ENS es case-insensitive pero usa Unicode normalization (UTS-46)
- Previene ataques de homograph (caracteres que se ven iguales)

---

## Reverse Resolution

Reverse resolution mapea **dirección → nombre**.

### ¿Para Qué?

```typescript
// User conecta wallet: 0xd8dA...6045
// En lugar de mostrar: 0xd8dA...6045
// Mostrar: vitalik.eth
```

### Implementación

```typescript
import { useEnsName } from 'wagmi';

function WalletDisplay({ address }: { address: Address }) {
  const { data: ensName } = useEnsName({
    address,
    chainId: 1,
  });

  return <div>{ensName || address}</div>;
  // Si tiene ENS: "vitalik.eth"
  // Si no: "0xd8dA...6045"
}
```

### Con Viem

```typescript
const ensName = await client.getEnsName({
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
});

console.log(ensName); // "vitalik.eth"
```

### Setear Primary Name (Reverse Record)

Para que reverse resolution funcione, el usuario debe setear su "Primary ENS Name":

1. Visita [app.ens.domains](https://app.ens.domains/)
2. Conecta wallet
3. Selecciona tu nombre ENS
4. Click en "Set as primary name"
5. Firma la transacción

**Desde código:**
```typescript
const reverseRecordAbi = [...];

await writeContract({
  address: '0xReverseRegistrar',
  abi: reverseRecordAbi,
  functionName: 'setName',
  args: ['alice.eth'],
});
```

---

## Registrar un Nombre ENS

### Proceso de Registro (.eth)

```typescript
// 1. Verificar disponibilidad
const available = await checkAvailability('myname.eth');

if (!available) {
  console.log('Nombre no disponible');
  return;
}

// 2. Hacer commitment (previene front-running)
const commitment = await makeCommitment('myname.eth', owner, secret);
await commitmentController.commit(commitment);

// 3. Esperar ~1 minuto (tiempo mínimo)
await sleep(60_000);

// 4. Registrar
const duration = 365 * 24 * 60 * 60; // 1 año
const price = await getPrice('myname.eth', duration);

await registrarController.register(
  'myname',
  owner,
  duration,
  secret,
  { value: price }
);
```

### Pricing

- **Longitud 5+ caracteres**: ~$5/año
- **Longitud 4 caracteres**: ~$160/año
- **Longitud 3 caracteres**: ~$640/año

### Renovación

```typescript
const { writeContract } = useWriteContract();

await writeContract({
  address: ETH_REGISTRAR_CONTROLLER,
  abi: registrarAbi,
  functionName: 'renew',
  args: ['myname', duration],
  value: price,
});
```

---

## Subdomains

Los owners de nombres ENS pueden crear **subdomains** gratis.

### Crear Subdomain

```typescript
const ensRegistryAbi = [...];

// Crear "dao.myname.eth"
await writeContract({
  address: ENS_REGISTRY,
  abi: ensRegistryAbi,
  functionName: 'setSubnodeOwner',
  args: [
    namehash('myname.eth'), // Parent node
    keccak256(toHex('dao')), // Label hash
    '0xNewOwnerAddress',
  ],
});
```

### Uso de Subdomains

```
mycompany.eth (main)
  ├── dao.mycompany.eth (governance)
  ├── treasury.mycompany.eth (multisig)
  ├── nft.mycompany.eth (NFT contract)
  └── app.mycompany.eth (dApp frontend)
```

### Resolver Subdomain

```typescript
const address = await client.getEnsAddress({
  name: normalize('dao.mycompany.eth'),
});
```

---

## Records y Metadata

ENS puede almacenar múltiples tipos de datos más allá de direcciones.

### Text Records

```typescript
import { useEnsText } from 'wagmi';

function ENSProfile({ name }: { name: string }) {
  const { data: avatar } = useEnsText({
    name,
    key: 'avatar',
  });

  const { data: twitter } = useEnsText({
    name,
    key: 'com.twitter',
  });

  const { data: github } = useEnsText({
    name,
    key: 'com.github',
  });

  const { data: email } = useEnsText({
    name,
    key: 'email',
  });

  return (
    <div>
      <img src={avatar} alt="Avatar" />
      <p>Twitter: {twitter}</p>
      <p>GitHub: {github}</p>
      <p>Email: {email}</p>
    </div>
  );
}
```

### Standard Text Records

| Key | Descripción | Ejemplo |
|-----|-------------|---------|
| `avatar` | URL o NFT del avatar | `eip155:1/erc721:0x...` |
| `description` | Bio | "Ethereum developer" |
| `email` | Email | "alice@example.com" |
| `url` | Website | "https://alice.com" |
| `com.twitter` | Twitter | "@alice" |
| `com.github` | GitHub | "alice" |
| `com.discord` | Discord | "alice#1234" |

### Multi-Coin Addresses

```typescript
// Resolver ETH address (default)
const ethAddress = await client.getEnsAddress({
  name: normalize('vitalik.eth'),
});

// Resolver BTC address
const btcAddress = await client.getEnsAddress({
  name: normalize('vitalik.eth'),
  coinType: 0, // BTC
});

// Resolver LTC address
const ltcAddress = await client.getEnsAddress({
  name: normalize('vitalik.eth'),
  coinType: 2, // LTC
});
```

**SLIP-44 Coin Types:**
- ETH: 60
- BTC: 0
- LTC: 2
- DOGE: 3

---

## ENS Avatar

ENS soporta avatars desde:
- **URLs** (https://...)
- **IPFS** (ipfs://...)
- **NFTs** (eip155:1/erc721:0xContractAddress/tokenId)

### Resolver Avatar

```typescript
import { useEnsAvatar } from 'wagmi';

function UserAvatar({ name }: { name: string }) {
  const { data: avatarUrl } = useEnsAvatar({
    name,
    chainId: 1,
  });

  return <img src={avatarUrl || '/default-avatar.png'} alt={name} />;
}
```

### Setear Avatar como NFT

```typescript
const resolverAbi = [...];

// Formato: eip155:chainId/erc721:contractAddress/tokenId
const avatarValue = 'eip155:1/erc721:0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB/1';

await writeContract({
  address: RESOLVER_ADDRESS,
  abi: resolverAbi,
  functionName: 'setText',
  args: [namehash('myname.eth'), 'avatar', avatarValue],
});
```

---

## Implementación con Wagmi + Viem

### Hook Completo: ENS Profile

```typescript
import {
  useEnsName,
  useEnsAddress,
  useEnsAvatar,
  useEnsText,
} from 'wagmi';
import { normalize } from 'viem/ens';

function ENSProfile({ address }: { address: Address }) {
  // Reverse resolution
  const { data: ensName } = useEnsName({ address });

  // Si no tiene ENS, terminar
  if (!ensName) return <div>No ENS name</div>;

  // Leer metadata
  const { data: avatar } = useEnsAvatar({ name: ensName });
  const { data: description } = useEnsText({ name: ensName, key: 'description' });
  const { data: twitter } = useEnsText({ name: ensName, key: 'com.twitter' });
  const { data: url } = useEnsText({ name: ensName, key: 'url' });

  return (
    <div>
      <img src={avatar || '/default.png'} alt={ensName} />
      <h2>{ensName}</h2>
      <p>{description}</p>
      <a href={`https://twitter.com/${twitter}`}>@{twitter}</a>
      <a href={url}>{url}</a>
    </div>
  );
}
```

### Resolver Múltiples Nombres

```typescript
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const names = ['vitalik.eth', 'nick.eth', 'brantly.eth'];

const addresses = await Promise.all(
  names.map((name) =>
    client.getEnsAddress({ name: normalize(name) })
  )
);

console.log(addresses);
// [0xd8dA..., 0x123..., 0x456...]
```

### Input con ENS Auto-Resolve

```typescript
function AddressInput() {
  const [input, setInput] = useState('');

  // Auto-resolver si termina en .eth
  const { data: resolved } = useEnsAddress({
    name: input.endsWith('.eth') ? normalize(input) : undefined,
    enabled: input.endsWith('.eth'),
  });

  const finalAddress = resolved || (isAddress(input) ? input : undefined);

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="ENS name or address"
      />
      {resolved && (
        <div>✅ Resolves to: {resolved}</div>
      )}
    </div>
  );
}
```

---

## Casos de Uso

### 1. **Wallets**

```typescript
// Mostrar ENS en lugar de dirección
function WalletButton({ address }: Props) {
  const { data: ensName } = useEnsName({ address });

  return (
    <button>
      {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
    </button>
  );
}
```

### 2. **Transferencias**

```typescript
function SendETH({ recipient }: { recipient: string }) {
  const { data: address } = useEnsAddress({
    name: recipient.endsWith('.eth') ? normalize(recipient) : undefined,
  });

  const finalRecipient = address || (isAddress(recipient) ? recipient : null);

  if (!finalRecipient) {
    return <div>❌ Dirección inválida</div>;
  }

  // Enviar a la dirección resuelta
  return <SendButton to={finalRecipient} />;
}
```

### 3. **Social Profiles**

```typescript
// Crear perfil social con ENS
function SocialCard({ ensName }: { ensName: string }) {
  const { data: avatar } = useEnsAvatar({ name: ensName });
  const { data: bio } = useEnsText({ name: ensName, key: 'description' });
  const { data: twitter } = useEnsText({ name: ensName, key: 'com.twitter' });

  return (
    <div className="card">
      <img src={avatar} />
      <h2>{ensName}</h2>
      <p>{bio}</p>
      <a href={`https://twitter.com/${twitter}`}>Follow</a>
    </div>
  );
}
```

### 4. **Identity Verification**

```typescript
// Verificar que una dirección controla un ENS
async function verifyENSOwnership(
  ensName: string,
  address: Address
): Promise<boolean> {
  const resolvedAddress = await client.getEnsAddress({
    name: normalize(ensName),
  });

  return resolvedAddress?.toLowerCase() === address.toLowerCase();
}
```

---

## Best Practices

### 1. **Siempre Normalizar**

```typescript
// ✅ Correcto
const address = await client.getEnsAddress({
  name: normalize(userInput),
});

// ❌ Peligroso
const address = await client.getEnsAddress({
  name: userInput, // Puede tener caracteres inválidos
});
```

### 2. **Validar Resolución**

```typescript
const address = await client.getEnsAddress({ name });

if (!address) {
  throw new Error('ENS name does not resolve to an address');
}

if (!isAddress(address)) {
  throw new Error('Resolved value is not a valid address');
}
```

### 3. **Caché Apropiado**

```typescript
// ✅ Wagmi cachea automáticamente
const { data: address } = useEnsAddress({
  name: 'vitalik.eth',
  cacheTime: 300_000, // 5 minutos
  staleTime: 60_000,   // 1 minuto
});
```

### 4. **Fallback UI**

```typescript
function DisplayName({ address }: Props) {
  const { data: ensName, isLoading } = useEnsName({ address });

  if (isLoading) return <Skeleton />;

  return (
    <span>
      {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
    </span>
  );
}
```

### 5. **Offchain Resolvers** (CCIP-Read)

Algunos nombres usan offchain resolvers (ej. .cb.id de Coinbase):

```typescript
// Soportado automáticamente por viem
const address = await client.getEnsAddress({
  name: normalize('alice.cb.id'),
  // Hará CCIP-Read automáticamente
});
```

---

## 🔐 Consideraciones de Seguridad

### 1. **Homograph Attacks**

```
vitalik.eth ✅ (correcto)
vіtalіk.eth ❌ (usa caracteres cirílicos que se ven iguales)
```

**Protección:**
- Siempre usar `normalize()` de viem
- Mostrar advertencias para caracteres no ASCII

### 2. **Front-Running en Registro**

Al registrar un nombre, alguien puede ver tu tx en el mempool y registrarlo primero.

**Protección:**
- Proceso de 2 pasos (commit + reveal)
- Esperar tiempo mínimo entre commit y register

### 3. **Expiration**

Nombres ENS expiran. Verificar antes de usar:

```typescript
const expiryDate = await registrar.nameExpires('myname');

if (Date.now() / 1000 > expiryDate) {
  console.warn('⚠️ Nombre expirado');
}
```

### 4. **Ownership vs. Controller**

- **Owner**: Puede transferir el nombre
- **Controller**: Puede setear records

```typescript
const owner = await registry.owner(namehash('name.eth'));
const controller = await registry.owner(namehash('name.eth'));
// Pueden ser diferentes
```

---

## 📚 Referencias

- **ENS Docs**: [https://docs.ens.domains/](https://docs.ens.domains/)
- **ENS App**: [https://app.ens.domains/](https://app.ens.domains/)
- **Viem ENS**: [https://viem.sh/docs/ens/actions/getEnsAddress](https://viem.sh/docs/ens/actions/getEnsAddress)
- **Wagmi ENS Hooks**: [https://wagmi.sh/react/hooks/useEnsAddress](https://wagmi.sh/react/hooks/useEnsAddress)
- **EIP-137**: [https://eips.ethereum.org/EIPS/eip-137](https://eips.ethereum.org/EIPS/eip-137)

---

## 🎯 Resumen

- **ENS** es el sistema de nombres descentralizado de Ethereum
- **Arquitectura**: Registry + Registrar + Resolver
- **Forward resolution**: Nombre → Dirección (`vitalik.eth` → `0x...`)
- **Reverse resolution**: Dirección → Nombre (`0x...` → `vitalik.eth`)
- **Text records**: Avatar, bio, social media, etc.
- **Subdomains**: Los owners pueden crear subdomains gratis
- **Normalización** es crítica para seguridad
- **Wagmi + Viem** soportan ENS out-of-the-box

---

**Siguiente módulo recomendado**: [Multicall & Batch Operations](../advanced/multicall.md)
