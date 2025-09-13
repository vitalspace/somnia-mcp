import { type Chain } from "viem";

export const MAIN_NETWORK = "Somnia Mainnet";
export const TEST_NETWORK = "Somnia Testnet";

export const DEFAULT_RPC_URL = "http://api.infra.mainnet.somnia.network";
export const DEFAULT_CHAIN_ID = "5031";
export const DEFAULT_EXPLORER_URL = "https://explorer.somnia.network";

export const TEST_RPC_URL = "https://dream-rpc.somnia.network";
export const TEST_CHAIN_ID = "50312";
export const TEXT_EXPLORER_URL = "https://shannon-explorer.somnia.network";

export const CHAINS = [
  {
    id: 50312,
    name: "Somnia Testnet",
    nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
    rpcUrls: {
      default: {
        http: ["https://dream-rpc.somnia.network"],
      },
    },
    blockExplorers: {
      default: {
        name: "Somnia Testnet Explorer",
        url: "https://shannon-explorer.somnia.network/",
        apiUrl: "https://shannon-explorer.somnia.network/api",
      },
    },
    contracts: {
      multicall3: {
        address: "0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223",
        blockCreated: 71314235,
      },
    },
    testnet: true,
  },
  {
    id: 5031,
    name: "Somnia Mainnet",
    nativeCurrency: { name: "SOMI", symbol: "SOMI", decimals: 18 },
    rpcUrls: {
      default: {
        http: ["https://api.infra.mainnet.somnia.network"],
      },
    },
    blockExplorers: {
      default: {
        name: "Somnia Main Explorer",
        url: "https://explorer.somnia.network",
        apiUrl: "https://explorer.somnia.network/api",
      },
    },
    contracts: {
      multicall3: {
        address: "0x1B0F6590d21dc02B92ad3A7D00F8884dC4f1aed9",
        blockCreated: 71314235,
      },
    },
    testnet: false,
  },
];

export const MINIMAL_ERC20_ABI = [
  {
    inputs: [],
    name: "symbol",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "address", name: "account" }],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const ERC20_ABI = [
  {
    inputs: [],
    name: "name",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export const ERC721_ABI = [
  {
    inputs: [{ type: "address", name: "owner" }],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "uint256", name: "tokenId" }],
    name: "ownerOf",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

export const ERC1155_ABI = [
  {
    inputs: [
      { type: "address", name: "account" },
      { type: "uint256", name: "id" },
    ],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

// Asegúrate de que la importación sea correcta
export const MINIMAL_ERC721_ABI = [
  {
    inputs: [{ type: "address", name: "owner" }],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "uint256", name: "tokenId" }],
    name: "ownerOf",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const ERC721_TOKEN_ABI = [
  {
    inputs: [],
    name: "name",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "uint256", name: "tokenId" }],
    name: "tokenURI",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
