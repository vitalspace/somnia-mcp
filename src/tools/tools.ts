import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TEST_NETWORK } from "../constants/constants";
import { Services } from "../services/services";
import { formatJson } from "../utils/utils";

import { type Address, parseEther } from "viem";

const services = new Services(TEST_NETWORK);

// Helper function to serialize BigInt values

export const resgisterTools = async (server: McpServer) => {
  server.tool(
    "get_chain_info",
    "Get information about Somnia network",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
    },
    async ({ network = TEST_NETWORK }) => {
      const chainInfo = services.getChainInfo(network.toLowerCase());
      try {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(chainInfo),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching chain info: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_gas_price",
    "Get gas price",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
    },
    async ({ network = TEST_NETWORK }) => {
      try {
        const gasPrice = await services.getGasPrice(network);

        return {
          content: [
            {
              type: "text",
              text: formatJson({
                network,
                gasPrice,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching gas price: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_fee_data",
    "Get fee data",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
    },
    async ({ network = TEST_NETWORK }) => {
      try {
        const feeData = await services.getFeeData(network);
        return {
          content: [
            {
              type: "text",
              text: formatJson(feeData),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching fee data: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_ens_name",
    "Get ENS name",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      ensName: z
        .string()
        .optional()
        .describe("ENS name (e.g., 'alice.eth', 'bob.somnia')."),
    },
    async ({ network = TEST_NETWORK, ensName }) => {
      try {
        const ens_name = await services.resolveENS(network, ensName as string);
        return {
          content: [
            {
              type: "text",
              text: formatJson({
                network,
                ensName: ens_name,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching ENS: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "reverse_ens_name",
    "Reverse ENS name",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      address: z.string().optional().describe("Address to reverse."),
    },
    async ({ network = TEST_NETWORK, address }) => {
      try {
        const reverse_ens = await services.reverseENS(
          network,
          address as Address
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                network,
                address,
                reverse_ens,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching reverse ENS: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_block_number",
    "Get block number",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      blockNumber: z
        .number()
        .optional()
        .describe("Block number. Defaults to latest block."),
    },
    async ({ network = TEST_NETWORK, blockNumber }) => {
      try {
        //@ts-ignore
        const block = await services.getBlockByNumber(network, blockNumber);
        return {
          content: [
            {
              type: "text",
              text: formatJson(block),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching block number: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_latest_block",
    "Get latest block",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
    },
    async ({ network = TEST_NETWORK }) => {
      try {
        //@ts-ignore
        const block = await services.getLatestBlock(network);
        return {
          content: [
            {
              type: "text",
              text: formatJson(block),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching latest block: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  ////

  server.tool(
    "get_balance",
    "Get balance of an address",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      address: z.string().describe("Address to check balance"),
    },
    async ({ network = TEST_NETWORK, address }) => {
      try {
        const data = await services.getBalance(network, address);
        return {
          content: [
            {
              type: "text",
              text: formatJson(data),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching balance: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_erc20_balance",
    "Get ERC20 balance of an address",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      tokenAddress: z.string().describe("Token ERC20 address"),
      address: z.string().describe("Address to check balance"),
    },
    async ({ address, tokenAddress, network = TEST_NETWORK }) => {
      try {
        const data = await services.getERC20Balance(
          network,
          address,
          tokenAddress
        );
        return {
          content: [
            {
              type: "text",
              text: formatJson(data),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching ERC20 balance: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_transaction",
    "Get transaction by hash",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      transactionHash: z.string().describe("Transaction hash"),
    },

    async ({ transactionHash, network = TEST_NETWORK }) => {
      try {
        const tx = await services.getTransaction(transactionHash, network);
        return {
          content: [
            {
              type: "text",
              text: formatJson(tx),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching transaction: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_transaction_receipt",
    "Get transaction receipt by hash",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      transactionHash: z.string().describe("Transaction hash"),
    },
    async ({ transactionHash, network = TEST_NETWORK }) => {
      try {
        const tx = await services.getTransactionReceipt(
          transactionHash,
          network
        );
        return {
          content: [
            {
              type: "text",
              text: formatJson(tx),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching transaction receipt: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_transaction_count",
    "Get transaction count for an address",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      address: z.string().describe("Address to check transaction count"),
    },
    async ({ network = TEST_NETWORK, address }) => {
      try {
        const count = await services.getTransactionCount(network, address);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                network,
                address,
                count,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching transaction count: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "estimate_gas",
    "Estimate gas for a transaction",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      to: z.string().describe("Recipient address"),
      value: z
        .string()
        .describe("The amount of SST/SOMI to send (e.g., '0.1')"),
      data: z
        .string()
        .optional()
        .describe("The transaction data as a hex string"),
    },
    async ({ to, value, data, network = TEST_NETWORK }) => {
      try {
        const params: any = { to: to as Address };

        if (value) params.value = parseEther(value);
        if (data) params.data = data as `0x${string}`;

        const gas = await services.estimateGas(params, network);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  network,
                  estimatedGas: gas.toString(),
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error estimating gas: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "transfer_native_token",
    "Transfer native token (SST/SOMI) from one address to another",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      to: z.string().describe("Recipient address"),
      amount: z.string().describe("The amount of tokens to send (e.g., '0.1')"),
    },
    async ({ to, amount, network = TEST_NETWORK }) => {
      try {
        const tx = await services.transferNativeToken(to, amount, network);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  txHash: tx,
                  to,
                  amount,
                  network,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error transferring tokens: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "transfer_erc20_token",
    "Transfer ERC20 token from one address to another",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      tokenAddress: z.string().describe("Token contract address"),
      to: z.string().describe("Recipient address"),
      amount: z.string().describe("The amount of tokens to send (e.g., '0.1')"),
    },
    async ({ network = TEST_NETWORK, tokenAddress, to, amount }) => {
      try {
        const tx = await services.transferErc20Token(
          tokenAddress,
          to,
          amount,
          network
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  txHash: tx,
                  to,
                  amount,
                  network,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error transferring tokens: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_token_info",
    "Get comprehensive information about an ERC20 token including name, symbol, decimals, total supply, and other metadata",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      tokenAddress: z.string().describe("Token contract address"),
    },
    async ({ network = TEST_NETWORK, tokenAddress }) => {
      try {
        const tokenInfo = await services.getERC20TokenInfo(
          network,
          tokenAddress
        );
        return {
          content: [
            {
              type: "text",
              text: formatJson(tokenInfo),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching token info: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_token_balance_erc20",
    "Get the balance of an ERC20 token for a specific address",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      tokenAddress: z.string().describe("Token contract address"),
      address: z.string().describe("Address to check the balance for"),
    },
    async ({ network = TEST_NETWORK, tokenAddress, address }) => {
      try {
        const balance = await services.getERC20Balance(
          network,
          address,
          tokenAddress
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  address,
                  tokenAddress,
                  network,
                  balance: {
                    raw: balance.raw.toString(),
                    formatted: balance.formatted,
                    decimals: balance.token.decimals,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching token balance: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_nft_info",
    "Retrieve comprehensive details of a particular NFT (ERC721 token), such as the collection’s name, symbol, token URI, and, if accessible, the current owner.",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      tokenAddress: z.string().describe("Token contract address"),
      tokenId: z.string().describe("Token ID"),
    },
    async ({ network = TEST_NETWORK, tokenAddress, tokenId }) => {
      try {
        const nftInfo = await services.getERC721TokenInfo(
          network,
          tokenAddress,
          tokenId
        );
        return {
          content: [
            {
              type: "text",
              text: formatJson(nftInfo),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching NFT info: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "check_nft_ownership",
    "Check if a specific address owns a particular NFT (ERC721 token) from a given collection",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        )
        .optional(),
      tokenAddress: z.string().describe("Token contract address"),
      ownerAddress: z.string().describe("Owner address"),
      tokenId: z.string().describe("Token ID"),
    },
    async ({ network = TEST_NETWORK, tokenAddress, ownerAddress, tokenId }) => {
      try {
        const isOwner = await services.checkERC721Ownership(
          network,
          tokenAddress,
          ownerAddress,
          BigInt(tokenId)
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  ownerAddress,
                  tokenAddress,
                  tokenId,
                  network,
                  isOwner,
                  result: isOwner
                    ? "Address owns this NFT"
                    : "Address does not own this NFT",
                },
                null,
                2
              ), // Usar JSON.stringify directamente
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  error: true,
                  message: `Error checking NFT ownership: ${
                    error instanceof Error ? error.message : String(error)
                  }`,
                  ownerAddress,
                  tokenAddress,
                  tokenId,
                  network,
                  isOwner: false,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_nft_balance",
    "Get the balance of an NFT for a specific address",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      tokenAddress: z.string().describe("Token contract address"),
      address: z.string().describe("Address to check the balance for"),
    },
    async ({ network = TEST_NETWORK, tokenAddress, address }) => {
      try {
        const balance = await services.getERC721Balance(
          network,
          address,
          tokenAddress
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  collection: tokenAddress,
                  address,
                  network,
                  balance: balance.toString(),
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching token balance: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "is_contract",
    "Check if an address is a contract",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      address: z.string().describe("Address to check"),
    },
    async ({ network = TEST_NETWORK, address }) => {
      try {
        const isContract = await services.isContract(network, address);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  address,
                  network,
                  isContract,
                  result: isContract
                    ? "Address is a contract"
                    : "Address is not a contract",
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error checking if address is a contract: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "read_contract",
    "Fetch information from a smart contract by executing a view/pure function call. Since it does not alter the blockchain state, no gas fees or transaction signing are required.",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      contractAddress: z
        .string()
        .describe("Smart contract address to interact with"),
      abi: z
        .array(z.any())
        .describe(
          "Smart contract ABI (Application Binary Interface) provided as a JSON array"
        ),
      functionName: z
        .string()
        .describe(
          "Name of the function to invoke on the contract (e.g., 'balanceOf')"
        ),
      args: z
        .array(z.any())
        .optional()
        .describe(
          "Arguments for the function call, passed as an array (e.g., ['0x1234...'])"
        ),
    },
    async ({
      network = TEST_NETWORK,
      contractAddress,
      abi,
      functionName,
      args = [],
    }) => {
      try {
        const parseAbi = typeof abi === "string" ? JSON.parse(abi) : abi;

        const params = {
          address: contractAddress as Address,
          abi: parseAbi,
          functionName,
          args,
        };

        const result = await services.readContract(params, network);
        return {
          content: [
            {
              type: "text",
              text: formatJson(result),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error reading contract: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );
};
