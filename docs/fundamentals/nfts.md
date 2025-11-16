# NFTs: Tokens No Fungibles

## Índice
1. [Conceptos Fundamentales](#conceptos-fundamentales)
2. [ERC-721: NFTs Únicos](#erc-721-nfts-únicos)
3. [ERC-1155: Multi-Token](#erc-1155-multi-token)
4. [Metadata & IPFS](#metadata--ipfs)
5. [Minting NFTs](#minting-nfts)
6. [Transferencias y Approvals](#transferencias-y-approvals)
7. [Marketplaces](#marketplaces)
8. [Best Practices](#best-practices)

---

## Conceptos Fundamentales

### ¿Qué es un NFT?

**NFT** (Non-Fungible Token) = Token único e indivisible representado en blockchain.

**Características**:
- **No fungible**: Cada token es único (vs ERC-20 donde todos son iguales)
- **Indivisible**: No puedes tener 0.5 NFTs (vs ERC-20 que tiene decimales)
- **Propiedad demostrable**: On-chain ownership
- **Interoperable**: Funciona en cualquier wallet/marketplace compatible

### Fungible vs Non-Fungible

```
FUNGIBLE (ERC-20):
  - 1 USDC = 1 USDC (intercambiables)
  - Divisibles (0.5 USDC)
  - Supply total fungible
  - Ejemplo: Dinero, commodities

NON-FUNGIBLE (ERC-721):
  - Token #1 ≠ Token #2 (únicos)
  - Indivisibles
  - Cada token es rastreable
  - Ejemplo: Arte digital, inmuebles, identidades

SEMI-FUNGIBLE (ERC-1155):
  - Múltiples tipos de tokens en un contrato
  - Algunos fungibles, otros no
  - Ejemplo: Items de videojuegos (100 espadas, 1 espada legendaria)
```

---

## ERC-721: NFTs Únicos

### Especificación

**Estándar**: [EIP-721](https://eips.ethereum.org/EIPS/eip-721)

**Interfaz Obligatoria**:
```solidity
interface IERC721 {
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    // Required functions
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

// Opcional pero muy común
interface IERC721Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}
```

### Implementación con OpenZeppelin

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleNFT
 * @dev Implementación educativa de ERC-721
 */
contract SimpleNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {}

    /**
     * @dev Mintea un nuevo NFT
     * @param to Dirección que recibirá el NFT
     * @param uri Metadata URI (IPFS típicamente)
     */
    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev Override requerido por Solidity
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

### Interacción con wagmi

```typescript
import { useReadContract, useWriteContract } from 'wagmi';
import { parseAbi } from 'viem';

const nftAbi = parseAbi([
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function approve(address to, uint256 tokenId)',
]);

export function NFTInfo({ contractAddress, tokenId }: Props) {
  // Leer owner
  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: nftAbi,
    functionName: 'ownerOf',
    args: [BigInt(tokenId)]
  });

  // Leer metadata URI
  const { data: tokenURI } = useReadContract({
    address: contractAddress,
    abi: nftAbi,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)]
  });

  // Transferir NFT
  const { writeContract } = useWriteContract();

  async function transfer(to: string) {
    await writeContract({
      address: contractAddress,
      abi: nftAbi,
      functionName: 'safeTransferFrom',
      args: [owner!, to as `0x${string}`, BigInt(tokenId)]
    });
  }

  return (
    <div>
      <p>Owner: {owner}</p>
      <p>Metadata: {tokenURI}</p>
      <button onClick={() => transfer('0x...')}>Transfer</button>
    </div>
  );
}
```

---

## ERC-1155: Multi-Token

### ¿Por qué ERC-1155?

**Problema con ERC-721**:
- Un contrato = un tipo de NFT
- Desplegar múltiples contratos es caro
- Transferir múltiples NFTs requiere múltiples transacciones

**Solución ERC-1155**:
- **Un contrato** puede tener infinitos tipos de tokens
- **Batch transfers**: Transferir múltiples tokens en una transacción
- **Semi-fungibles**: Soporta NFTs únicos Y tokens fungibles
- **Eficiencia de gas**: ~90% menos gas en batch operations

### Casos de Uso

```
Gaming:
  - Token ID 1: Espada común (fungible, supply: 1000)
  - Token ID 2: Escudo común (fungible, supply: 500)
  - Token ID 3: Espada legendaria única (NFT, supply: 1)

Membresías:
  - Token ID 1: Tier Bronze (fungible)
  - Token ID 2: Tier Silver (fungible)
  - Token ID 3: Tier Gold (fungible)

Eventos:
  - Token ID 1: Ticket General (fungible)
  - Token ID 2: Ticket VIP (semi-fungible, limitado)
  - Token ID 3: Backstage Pass único (NFT)
```

### Interfaz ERC-1155

```solidity
interface IERC1155 {
    event TransferSingle(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256 id,
        uint256 value
    );

    event TransferBatch(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256[] ids,
        uint256[] values
    );

    // Balance de un token específico para un owner
    function balanceOf(address account, uint256 id) external view returns (uint256);

    // Batch: balances de múltiples tokens para múltiples owners
    function balanceOfBatch(
        address[] calldata accounts,
        uint256[] calldata ids
    ) external view returns (uint256[] memory);

    // Transferir un token
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external;

    // Batch: transferir múltiples tokens en una tx
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external;

    // Aprobar operator para todos los tokens
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address account, address operator) external view returns (bool);
}
```

### Implementación

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GameItems
 * @dev ERC-1155 para items de videojuego
 */
contract GameItems is ERC1155, Ownable {
    // Token IDs
    uint256 public constant SWORD = 1;
    uint256 public constant SHIELD = 2;
    uint256 public constant LEGENDARY_SWORD = 3;

    constructor() ERC1155("https://game.example/api/item/{id}.json") Ownable(msg.sender) {
        // Mintear supply inicial
        _mint(msg.sender, SWORD, 1000, "");       // 1000 espadas
        _mint(msg.sender, SHIELD, 500, "");       // 500 escudos
        _mint(msg.sender, LEGENDARY_SWORD, 1, ""); // 1 espada legendaria única
    }

    /**
     * @dev Mintear nuevos items
     */
    function mint(address to, uint256 id, uint256 amount) public onlyOwner {
        _mint(to, id, amount, "");
    }

    /**
     * @dev Batch mint
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public onlyOwner {
        _mintBatch(to, ids, amounts, "");
    }
}
```

### Batch Operations con wagmi

```typescript
import { useWriteContract } from 'wagmi';
import { parseAbi } from 'viem';

const erc1155Abi = parseAbi([
  'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
]);

export function BatchTransfer() {
  const { writeContract } = useWriteContract();

  async function transferMultiple() {
    // Transferir 10 espadas + 5 escudos en UNA transacción
    await writeContract({
      address: '0xGameItems',
      abi: erc1155Abi,
      functionName: 'safeBatchTransferFrom',
      args: [
        userAddress,
        recipientAddress,
        [1n, 2n], // Token IDs: SWORD, SHIELD
        [10n, 5n], // Amounts
        '0x' // data
      ]
    });
  }

  return <button onClick={transferMultiple}>Transfer Batch</button>;
}
```

---

## Metadata & IPFS

### Estructura de Metadata (JSON)

```json
{
  "name": "My Awesome NFT #1",
  "description": "This is an educational NFT for learning Web3",
  "image": "ipfs://QmX.../image.png",
  "external_url": "https://myproject.com/nft/1",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Blue"
    },
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "trait_type": "Power",
      "value": 95,
      "display_type": "number",
      "max_value": 100
    }
  ]
}
```

### IPFS (InterPlanetary File System)

**¿Por qué IPFS?**:
- Descentralizado (no un servidor central)
- Inmutable (hash del contenido)
- Permanente (si está pinned)
- Resistente a censura

**Flujo**:
```
1. Imagen → Upload a IPFS → ipfs://Qm.../image.png
2. Metadata JSON → Upload a IPFS → ipfs://Qm.../metadata.json
3. Smart Contract → tokenURI = ipfs://Qm.../metadata.json
4. Marketplace/Wallet → Fetch metadata → Display NFT
```

**Servicios de IPFS**:
- **Pinata**: Servicio comercial fácil de usar
- **NFT.Storage**: Gratis para NFTs (Protocol Labs)
- **Infura**: IPFS API
- **Local node**: Control total

### Subir a IPFS con Pinata

```typescript
async function uploadToIPFS(file: File, metadata: any) {
  const pinataApiKey = process.env.PINATA_API_KEY!;
  const pinataSecretKey = process.env.PINATA_SECRET_KEY!;

  // 1. Subir imagen
  const formData = new FormData();
  formData.append('file', file);

  const imageRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataSecretKey
    },
    body: formData
  });

  const { IpfsHash: imageHash } = await imageRes.json();

  // 2. Crear metadata con image hash
  const metadataJson = {
    ...metadata,
    image: `ipfs://${imageHash}`
  };

  // 3. Subir metadata
  const metadataRes = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataSecretKey
    },
    body: JSON.stringify(metadataJson)
  });

  const { IpfsHash: metadataHash } = await metadataRes.json();

  return `ipfs://${metadataHash}`;
}
```

### Leer Metadata

```typescript
async function fetchNFTMetadata(tokenURI: string) {
  // Convertir ipfs:// a HTTP gateway
  const httpUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');

  const response = await fetch(httpUrl);
  const metadata = await response.json();

  // Convertir image URI también
  const imageUrl = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');

  return {
    ...metadata,
    imageUrl
  };
}
```

---

## Minting NFTs

### Patrones Comunes

#### 1. Owner Mint (Centralizado)

```solidity
function mint(address to, string memory uri) public onlyOwner {
    uint256 tokenId = _nextTokenId++;
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, uri);
}
```

**Uso**: Airdrops, team allocation, controlled distribution

#### 2. Public Mint (Permissionless)

```solidity
uint256 public constant MINT_PRICE = 0.08 ether;
uint256 public constant MAX_SUPPLY = 10000;

function publicMint() public payable {
    require(_nextTokenId < MAX_SUPPLY, "Sold out");
    require(msg.value >= MINT_PRICE, "Insufficient payment");

    uint256 tokenId = _nextTokenId++;
    _safeMint(msg.sender, tokenId);
}
```

**Uso**: NFT launches, collections públicas

#### 3. Whitelist Mint (Merkle Tree)

```solidity
bytes32 public merkleRoot;

function whitelistMint(bytes32[] calldata proof) public payable {
    // Verificar que msg.sender está en whitelist
    bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
    require(MerkleProof.verify(proof, merkleRoot, leaf), "Not whitelisted");

    require(msg.value >= WHITELIST_PRICE, "Insufficient payment");

    uint256 tokenId = _nextTokenId++;
    _safeMint(msg.sender, tokenId);
}
```

**Uso**: Early access, community members, presales

#### 4. Lazy Minting (Gas Efficient)

```solidity
// NFT no se mintea hasta que se venda/transfiera
mapping(uint256 => bytes) public tokenSignatures;

function lazyMint(uint256 tokenId, bytes memory signature) public {
    // Verificar firma del creador
    require(verify(tokenId, signature), "Invalid signature");

    // Mintear solo cuando sea necesario
    _safeMint(msg.sender, tokenId);
}
```

**Uso**: OpenSea lazy minting, marketplaces

---

## Transferencias y Approvals

### Safe vs Unsafe Transfer

```solidity
// ❌ UNSAFE: Si recipient es contrato sin onERC721Received, NFT puede quedar atrapado
function transferFrom(address from, address to, uint256 tokenId) external;

// ✅ SAFE: Verifica que recipient puede recibir NFTs
function safeTransferFrom(address from, address to, uint256 tokenId) external;
```

**Implementación de receptor**:
```solidity
contract NFTReceiver is IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        // Lógica personalizada
        return IERC721Receiver.onERC721Received.selector;
    }
}
```

### Approvals

```typescript
// Aprobar un NFT específico para transferencia
await writeContract({
  address: nftContract,
  abi: nftAbi,
  functionName: 'approve',
  args: [marketplaceAddress, tokenId]
});

// Aprobar TODOS los NFTs para un operator (marketplace, etc.)
await writeContract({
  address: nftContract,
  abi: nftAbi,
  functionName: 'setApprovalForAll',
  args: [marketplaceAddress, true]
});
```

---

## Marketplaces

### Cómo Funcionan

```
1. Seller aprueba marketplace para su NFT
   → nft.setApprovalForAll(marketplace, true)

2. Seller lista NFT en marketplace
   → marketplace.listNFT(nftContract, tokenId, price)

3. Buyer compra NFT
   → marketplace.buyNFT(listingId, { value: price })
   → Marketplace transfiere NFT de seller a buyer
   → Marketplace transfiere ETH de buyer a seller (menos fee)
```

### Ejemplo Simplificado

```solidity
contract SimpleMarketplace {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId;

    function listNFT(address nftContract, uint256 tokenId, uint256 price) external {
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        listings[nextListingId++] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });
    }

    function buyNFT(uint256 listingId) external payable {
        Listing storage listing = listings[listingId];
        require(listing.active, "Not active");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.active = false;

        // Transferir NFT al buyer
        IERC721(listing.nftContract).transferFrom(address(this), msg.sender, listing.tokenId);

        // Pagar al seller (95%, 5% fee)
        uint256 payment = (listing.price * 95) / 100;
        payable(listing.seller).transfer(payment);
    }
}
```

---

## Best Practices

### Seguridad

```solidity
// ✅ Usar SafeMint (verifica que receptor puede recibir)
_safeMint(to, tokenId);

// ✅ Validar inputs
require(to != address(0), "Invalid address");
require(tokenId < MAX_SUPPLY, "Token doesn't exist");

// ✅ Reentrancy protection
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
contract MyNFT is ERC721, ReentrancyGuard {
    function mint() public payable nonReentrant {
        // ...
    }
}

// ✅ Pausable en emergencias
import "@openzeppelin/contracts/security/Pausable.sol";
```

### Gas Optimization

```solidity
// ✅ Usar ERC721A para batch minting eficiente
import "erc721a/contracts/ERC721A.sol";

// ✅ Lazy minting cuando sea posible
// ✅ ERC1155 para colecciones con items similares
// ✅ Evitar storage writes innecesarios
```

### Frontend

```typescript
// ✅ Cachear metadata
const { data: metadata } = useQuery(['nft', tokenId], () => fetchMetadata(tokenURI), {
  staleTime: Infinity // NFT metadata no cambia
});

// ✅ Usar IPFS gateways confiables
const gateways = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/'
];

// ✅ Mostrar placeholders mientras carga
{isLoading ? <Skeleton /> : <NFTImage src={imageUrl} />}
```

---

## Recursos

- [EIP-721: Non-Fungible Token Standard](https://eips.ethereum.org/EIPS/eip-721)
- [EIP-1155: Multi Token Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/4.x/erc721)
- [NFT School](https://nftschool.dev/)
- [IPFS Documentation](https://docs.ipfs.tech/)

---

## Siguiente Paso

Continúa con [Smart Contracts Avanzados](../advanced/smart-contracts.md) para patrones avanzados de NFTs.
