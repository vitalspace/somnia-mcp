# Somnia MCP Server

A comprehensive Model Context Protocol (MCP) server for interacting with the Somnia blockchain network. This server provides a wide range of tools for blockchain operations including token transfers, contract interactions, transaction monitoring, and more.

## Features

- **Blockchain Information**: Get chain info, gas prices, fee data, and block information
- **Token Operations**: Native token (SST/SOMI) and ERC20 token transfers and balance queries
- **NFT Support**: ERC721 token information, ownership checking, and balance queries
- **Contract Interactions**: Read/write smart contracts, deploy contracts, estimate gas
- **Transaction Management**: Get transaction details, monitor confirmations, decode input data
- **Batch Operations**: Multi-transfer capabilities for both native and ERC20 tokens
- **Contract Verification**: Submit contracts for verification on blockchain explorers
- **Analytics**: Transaction volume analysis, top holders identification
- **Multicall Support**: Efficient batch contract calls using multicall3
- **Network Support**: Somnia Mainnet and Testnet

## Installation

### Prerequisites

- [Bun](https://bun.sh) runtime (v1.2.21 or later)
- Node.js (for TypeScript compilation)
- Private key for transaction operations (set as `PRIVATE_KEY` environment variable)

### Install Dependencies

```bash
bun install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
PRIVATE_KEY=your_private_key_here
```

**⚠️ Security Warning**: Never commit your private key to version control. Use environment variables or secure key management.

## Usage

### Development

```bash
bun run dev
```

### Production

```bash
bun run start
```

### Build

```bash
bun run build
```

### Testing

```bash
bun test
```

## Project Structure

```
src/
├── index.ts              # Main entry point, MCP server initialization
├── tools/
│   └── tools.ts          # MCP tool definitions and handlers
├── services/
│   └── services.ts       # Core blockchain interaction logic
├── lib/
│   └── lib.ts            # Viem client creation utilities
├── utils/
│   └── utils.ts          # Utility functions (JSON formatting)
└── constants/
    └── constants.ts      # Chain configurations, ABIs, network constants
```

## Available Tools

### Network & Chain Information
- `get_chain_info` - Get information about Somnia networks
- `get_gas_price` - Get current gas price
- `get_fee_data` - Get complete fee data including base fee
- `get_block_number` - Get block number by number or latest
- `get_latest_block` - Get the most recent block

### Account & Balance Operations
- `get_balance` - Get SST/SOMI balance for an address
- `get_erc20_balance` - Get ERC20 token balance
- `get_nft_balance` - Get ERC721 token balance
- `get_transaction_count` - Get transaction count (nonce) for an address

### Token Operations
- `transfer_native_token` - Transfer SST/SOMI tokens
- `transfer_erc20_token` - Transfer ERC20 tokens
- `get_token_info` - Get ERC20 token metadata
- `batch_transfer_native` - Transfer SST/SOMI to multiple addresses
- `batch_transfer_erc20` - Transfer ERC20 tokens to multiple addresses

### NFT Operations
- `get_nft_info` - Get ERC721 token information
- `check_nft_ownership` - Verify NFT ownership
- `get_nft_balance` - Get NFT balance for an address

### Transaction Operations
- `get_transaction` - Get transaction details by hash
- `get_transaction_receipt` - Get transaction receipt
- `get_address_transactions` - Get transaction history for an address
- `get_pending_transactions` - Get pending transactions from mempool
- `monitor_transaction` - Monitor transaction until confirmed
- `send_raw_transaction` - Send signed raw transaction
- `decode_transaction_input` - Decode transaction input data
- `get_transaction_fee` - Calculate actual transaction fee

### Contract Operations
- `read_contract` - Read from smart contracts (view/pure functions)
- `write_contract` - Write to smart contracts (state-changing functions)
- `deploy_contract` - Deploy new smart contracts
- `simulate_contract_call` - Simulate contract calls without execution
- `estimate_gas` - Estimate gas for transactions
- `estimate_contract_gas` - Estimate gas for contract function calls
- `verify_contract` - Submit contracts for verification
- `get_contract_source` - Get verified contract source code
- `get_contract_bytecode` - Get contract bytecode
- `get_contract_abi` - Get contract ABI
- `get_contract_events` - Get historical contract events

### Advanced Operations
- `multicall_contract` - Execute multiple contract calls in one transaction
- `multicall_contract_3` - Execute multiple calls with individual success status
- `batch_write_contract` - Execute multiple contract write operations
- `get_transaction_volume` - Calculate SST transaction volume for block range
- `get_erc20_transaction_volume` - Calculate ERC20 transaction volume
- `get_top_holders` - Get top SST/SOMI holders
- `get_erc20_top_holders` - Get top ERC20 token holders
- `is_contract` - Check if address is a smart contract

## Network Support

### Somnia Mainnet
- Chain ID: 5031
- Native Token: SOMI
- RPC: https://api.infra.mainnet.somnia.network
- Explorer: https://explorer.somnia.network

### Somnia Testnet
- Chain ID: 50312
- Native Token: STT
- RPC: https://dream-rpc.somnia.network
- Explorer: https://shannon-explorer.somnia.network

## Requirements

- **Runtime**: Bun v1.2.21+
- **TypeScript**: ^5.0.0
- **Dependencies**:
  - `@modelcontextprotocol/sdk`: ^1.17.5
  - `viem`: ^2.37.2
  - `zod`: ^3.24.1

## Development

### Code Style

- TypeScript with strict type checking
- ES modules
- Async/await patterns
- Error handling with try/catch blocks
- Zod for input validation

### Architecture

The server follows a layered architecture:

1. **Tools Layer** (`tools.ts`): MCP tool definitions and request handling
2. **Services Layer** (`services.ts`): Business logic and blockchain interactions
3. **Library Layer** (`lib.ts`): Low-level client creation and utilities
4. **Constants Layer** (`constants.ts`): Configuration and contract ABIs

### Adding New Tools

1. Define the tool in `tools.ts` using the MCP SDK
2. Implement the business logic in `services.ts`
3. Add any required constants or ABIs to `constants.ts`
4. Update this README with the new tool description

## License

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Disclaimer

This software is provided as-is. Always test thoroughly on testnet before mainnet deployment. Keep your private keys secure and never expose them in your code or logs.
