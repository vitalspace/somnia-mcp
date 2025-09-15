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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
    },
    async ({ network }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
    },
    async ({ network }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      ensName: z
        .string()
        .describe("ENS name (e.g., 'alice.eth', 'bob.somnia')."),
    },
    async ({ network, ensName }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      address: z.string().describe("Address to reverse."),
    },
    async ({ network, address }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      blockNumber: z
        .number()
        .optional()
        .describe("Block number. Defaults to latest block."),
    },
    async ({ network, blockNumber }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
    },
    async ({ network }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      address: z.string().describe("Address to check balance"),
    },
    async ({ network, address }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      tokenAddress: z.string().describe("Token ERC20 address"),
      address: z.string().describe("Address to check balance"),
    },
    async ({ network, address, tokenAddress }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      transactionHash: z.string().describe("Transaction hash"),
    },

    async ({ network, transactionHash }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      transactionHash: z.string().describe("Transaction hash"),
    },
    async ({ network, transactionHash }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      address: z.string().describe("Address to check transaction count"),
    },
    async ({ network, address }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
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
    async ({ network, to, value, data }) => {
      try {
        const params: any = { to: to as Address };

        if (value) params.value = parseEther(value);
        if (data) params.data = data as `0x${string}`;

        const gas = await services.estimateGas(network, params);

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
    "estimate_contract_gas",
    "Estimate gas for a contract function call",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      contractAddress: z.string().describe("Smart contract address"),
      abi: z
        .array(z.any())
        .describe(
          "Smart contract ABI (Application Binary Interface) provided as a JSON array"
        ),
      functionName: z
        .string()
        .describe(
          "Name of the function to estimate gas for (e.g., 'transfer', 'mint')"
        ),
      args: z
        .array(z.any())
        .optional()
        .describe(
          "Arguments for the function call, passed as an array (e.g., ['0x1234...', '100'])"
        ),
      from: z
        .string()
        .optional()
        .describe("The sender address (optional, uses default if not provided)"),
      value: z
        .string()
        .optional()
        .describe("The value to send with the call in wei (optional)"),
    },
    async ({
      network,
      contractAddress,
      abi,
      functionName,
      args = [],
      from,
      value,
    }) => {
      try {
        const parseAbi = typeof abi === "string" ? JSON.parse(abi) : abi;

        const gas = await services.estimateContractGas(
          network,
          contractAddress,
          parseAbi,
          functionName,
          args,
          from,
          value
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  network,
                  contractAddress,
                  functionName,
                  estimatedGas: gas.toString(),
                  gasInWei: gas.toString(),
                  args: args.length > 0 ? args : undefined,
                  from: from || "default",
                  value: value || "0",
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
              text: `Error estimating contract gas: ${
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
    "verify_contract",
    "Check contract verification status or submit contract for verification on the blockchain explorer",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      contractAddress: z.string().describe("Contract address to verify"),
      action: z
        .enum(["check", "verify"])
        .describe("Action to perform: 'check' to check verification status, 'verify' to submit for verification"),
      sourceCode: z
        .string()
        .optional()
        .describe("Contract source code (required for 'verify' action)"),
      contractName: z
        .string()
        .optional()
        .describe("Contract name (required for 'verify' action)"),
      compilerVersion: z
        .string()
        .optional()
        .describe("Compiler version (e.g., 'v0.8.19+commit.7dd6d404') (required for 'verify' action)"),
      optimization: z
        .boolean()
        .optional()
        .describe("Whether optimization was used during compilation (defaults to false)"),
      constructorArguments: z
        .string()
        .optional()
        .describe("Constructor arguments as hex string (optional for 'verify' action)"),
      license: z
        .string()
        .optional()
        .describe("Contract license type (optional for 'verify' action)"),
    },
    async ({
      network,
      contractAddress,
      action,
      sourceCode,
      contractName,
      compilerVersion,
      optimization = false,
      constructorArguments,
      license,
    }) => {
      try {
        if (action === "check") {
          const result = await services.checkContractVerification(
            network,
            contractAddress
          );
          return {
            content: [
              {
                type: "text",
                text: formatJson({
                  network,
                  contractAddress,
                  action: "check",
                  ...result,
                }),
              },
            ],
          };
        } else if (action === "verify") {
          if (!sourceCode || !contractName || !compilerVersion) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      error: true,
                      message: "For 'verify' action, sourceCode, contractName, and compilerVersion are required",
                      network,
                      contractAddress,
                      action: "verify",
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          const result = await services.verifyContract(
            network,
            contractAddress,
            sourceCode,
            contractName,
            compilerVersion,
            optimization,
            constructorArguments,
            license
          );

          return {
            content: [
              {
                type: "text",
                text: formatJson({
                  network,
                  contractAddress,
                  action: "verify",
                  ...result,
                }),
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    error: true,
                    message: "Invalid action. Use 'check' or 'verify'",
                    network,
                    contractAddress,
                    action,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error with contract verification: ${
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      to: z.string().describe("Recipient address"),
      amount: z.string().describe("The amount of tokens to send (e.g., '0.1')"),
    },
    async ({ network, to, amount }) => {
      try {
        const tx = await services.transferNativeToken(network, to, amount);
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      tokenAddress: z.string().describe("Token contract address"),
      to: z.string().describe("Recipient address"),
      amount: z.string().describe("The amount of tokens to send (e.g., '0.1')"),
    },
    async ({ network, tokenAddress, to, amount }) => {
      try {
        const tx = await services.transferErc20Token(
          network,
          tokenAddress,
          to,
          amount
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      tokenAddress: z.string().describe("Token contract address"),
    },
    async ({ network, tokenAddress }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      tokenAddress: z.string().describe("Token contract address"),
      address: z.string().describe("Address to check the balance for"),
    },
    async ({ network, tokenAddress, address }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      tokenAddress: z.string().describe("Token contract address"),
      tokenId: z.string().describe("Token ID"),
    },
    async ({ network, tokenAddress, tokenId }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      tokenAddress: z.string().describe("Token contract address"),
      address: z.string().describe("Address to check the balance for"),
    },
    async ({ network, tokenAddress, address }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      address: z.string().describe("Address to check"),
    },
    async ({ network, address }) => {
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
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
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
      network,
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

        const result = await services.readContract(network, params);
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

  server.tool(
    "write_contract",
    "Execute a state-changing function on a smart contract. This will modify the blockchain state and requires gas fees and transaction signing.",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
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
          "Name of the function to invoke on the contract (e.g., 'transfer')"
        ),
      args: z
        .array(z.any())
        .optional()
        .describe(
          "Arguments for the function call, passed as an array (e.g., ['0x1234...', '100'])"
        ),
    },
    async ({
      network,
      contractAddress,
      abi,
      functionName,
      args = [],
    }) => {
      try {
        const parseAbi = typeof abi === "string" ? JSON.parse(abi) : abi;

        const txHash = await services.writeContract(
          network,
          contractAddress,
          parseAbi,
          functionName,
          args
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  txHash: txHash,
                  contractAddress,
                  functionName,
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
              text: `Error writing to contract: ${
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
    "deploy_contract",
    "Deploy a new smart contract to the blockchain. Requires compiled bytecode and constructor arguments.",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      bytecode: z
        .string()
        .describe("Compiled contract bytecode as hex string (e.g., '0x6080604052...')"),
      abi: z
        .array(z.any())
        .describe(
          "Smart contract ABI (Application Binary Interface) provided as a JSON array"
        ),
      args: z
        .array(z.any())
        .optional()
        .describe(
          "Constructor arguments, passed as an array (e.g., ['arg1', 'arg2'])"
        ),
    },
    async ({
      network,
      bytecode,
      abi,
      args = [],
    }) => {
      try {
        const parseAbi = typeof abi === "string" ? JSON.parse(abi) : abi;

        const result = await services.deployContract(
          network,
          bytecode,
          parseAbi,
          args
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  contractAddress: result.contractAddress,
                  txHash: result.txHash,
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
              text: `Error deploying contract: ${
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
    "simulate_contract_call",
    "Simulate a contract function call without executing it on the blockchain. Useful for testing and debugging.",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      contractAddress: z
        .string()
        .describe("Smart contract address to simulate call on"),
      abi: z
        .array(z.any())
        .describe(
          "Smart contract ABI (Application Binary Interface) provided as a JSON array"
        ),
      functionName: z
        .string()
        .describe(
          "Name of the function to simulate (e.g., 'balanceOf', 'getValue')"
        ),
      args: z
        .array(z.any())
        .optional()
        .describe(
          "Function arguments, passed as an array (e.g., ['0x1234...'])"
        ),
    },
    async ({
      network,
      contractAddress,
      abi,
      functionName,
      args = [],
    }) => {
      try {
        const parseAbi = typeof abi === "string" ? JSON.parse(abi) : abi;

        const result = await services.simulateContractCall(
          network,
          contractAddress,
          parseAbi,
          functionName,
          args
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  contractAddress,
                  functionName,
                  args,
                  network,
                  simulatedResult: result,
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
              text: `Error simulating contract call: ${
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
    "get_contract_events",
    "Get historical events/logs from a smart contract within specified block range.",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      contractAddress: z
        .string()
        .describe("Smart contract address to get events from"),
      abi: z
        .array(z.any())
        .optional()
        .describe(
          "Smart contract ABI (Application Binary Interface) provided as a JSON array. Optional for basic event retrieval."
        ),
      eventName: z
        .string()
        .optional()
        .describe("Specific event name to filter (e.g., 'Transfer', 'Approval')"),
      fromBlock: z
        .number()
        .optional()
        .describe("Starting block number for event search"),
      toBlock: z
        .number()
        .optional()
        .describe("Ending block number for event search"),
    },
    async ({
      network,
      contractAddress,
      abi,
      eventName,
      fromBlock,
      toBlock,
    }) => {
      try {
        const parseAbi = abi && typeof abi === "string" ? JSON.parse(abi) : abi;

        const events = await services.getContractEvents(
          network,
          contractAddress,
          parseAbi || [],
          eventName,
          fromBlock,
          toBlock
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  contractAddress,
                  network,
                  eventCount: events.length,
                  events: events.slice(0, 50), // Limit to first 50 events
                  truncated: events.length > 50,
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
              text: `Error getting contract events: ${
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
    "multicall_contract",
    "Execute multiple contract calls in a single transaction using multicall",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      calls: z
        .array(
          z.object({
            target: z.string().describe("Contract address to call"),
            callData: z.string().describe("Encoded function call data (hex string)"),
          })
        )
        .describe("Array of contract calls to execute"),
    },
    async ({ network, calls }) => {
      try {
        const result = await services.multicall(network, calls);
        return {
          content: [
            {
              type: "text",
              text: formatJson({
                network,
                blockNumber: result.blockNumber.toString(),
                callCount: calls.length,
                results: result.returnData,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing multicall: ${
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
    "multicall_contract_3",
    "Execute multiple contract calls with individual success/failure status using multicall3",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      calls: z
        .array(
          z.object({
            target: z.string().describe("Contract address to call"),
            callData: z.string().describe("Encoded function call data (hex string)"),
            value: z
              .string()
              .optional()
              .describe("Value to send with the call (in wei)"),
          })
        )
        .describe("Array of contract calls to execute"),
    },
    async ({ network, calls }) => {
      try {
        const result = await services.multicall3(network, calls);
        return {
          content: [
            {
              type: "text",
              text: formatJson({
                network,
                callCount: calls.length,
                results: result.map((r, i) => ({
                  callIndex: i,
                  success: r.success,
                  returnData: r.returnData,
                  target: calls[i]?.target || "unknown",
                })),
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing multicall3: ${
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
    "get_contract_source",
    "Get the source code of a smart contract from the blockchain explorer",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      contractAddress: z.string().describe("Contract address to get source code for"),
    },
    async ({ network, contractAddress }) => {
      try {
        

        const result = await services.checkContractVerification(
          network,
          contractAddress
        );

        if (result.isVerified && result.sourceCode) {
          return {
            content: [
              {
                type: "text",
                text: formatJson({
                  network,
                  contractAddress,
                  isVerified: result.isVerified,
                  contractName: result.contractName,
                  compilerVersion: result.compilerVersion,
                  optimization: result.optimization,
                  sourceCode: result.sourceCode,
                  abi: result.abi,
                  constructorArguments: result.constructorArguments,
                }),
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: formatJson({
                  network,
                  contractAddress,
                  isVerified: false,
                  message: result.message || "Contract source code not available",
                }),
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching contract source: ${
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
    "get_contract_bytecode",
    "Get the deployed bytecode of a smart contract using Viem (direct blockchain access)",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      contractAddress: z.string().describe("Contract address to get bytecode for"),
    },
    async ({ network, contractAddress }) => {
      try {
        const result = await services.getContractBytecode(network, contractAddress);

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
              text: `Error fetching contract bytecode: ${
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
    "batch_write_contract",
    "Execute multiple contract write operations in batch. Useful for performing multiple state-changing operations efficiently.",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      operations: z
        .array(
          z.object({
            contractAddress: z.string().describe("Smart contract address to interact with"),
            abi: z
              .array(z.any())
              .describe("Smart contract ABI (Application Binary Interface) provided as a JSON array"),
            functionName: z
              .string()
              .describe("Name of the function to invoke on the contract (e.g., 'transfer', 'mint')"),
            args: z
              .array(z.any())
              .optional()
              .describe("Arguments for the function call, passed as an array (e.g., ['0x1234...', '100'])"),
            value: z
              .string()
              .optional()
              .describe("Value to send with the call in wei (optional)"),
          })
        )
        .describe("Array of contract operations to execute in batch"),
      continueOnError: z
        .boolean()
        .optional()
        .describe("Whether to continue with remaining operations if one fails (defaults to true)"),
    },
    async ({ network, operations, continueOnError = true }) => {
      try {
        const result = await services.batchWriteContract(
          network,
          operations,
          continueOnError
        );

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
              text: `Error executing batch write operations: ${
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
    "get_contract_abi",
    "Get the ABI (Application Binary Interface) of a smart contract from the blockchain explorer",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      contractAddress: z.string().describe("Contract address to get ABI for"),
    },
    async ({ network, contractAddress }) => {
      try {
        const result = await services.getContractAbi(network, contractAddress);

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
              text: `Error fetching contract ABI: ${
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
    "get_transaction_volume",
    "Calculate the total transaction volume in SST for a given block range",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      fromBlock: z.number().describe("Starting block number"),
      toBlock: z.number().describe("Ending block number"),
    },
    async ({ network, fromBlock, toBlock }) => {
      try {
        const result = await services.getTransactionVolume(
          network,
          fromBlock,
          toBlock
        );

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
              text: `Error calculating transaction volume: ${
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
    "get_erc20_transaction_volume",
    "Calculate the total ERC20 token transaction volume for a given block range",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      tokenAddress: z.string().describe("The ERC20 token contract address"),
      fromBlock: z.number().describe("Starting block number"),
      toBlock: z.number().describe("Ending block number"),
    },
    async ({ network, tokenAddress, fromBlock, toBlock }) => {
      try {
        const result = await services.getERC20TransactionVolume(
          network,
          tokenAddress,
          fromBlock,
          toBlock
        );

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
              text: `Error calculating ERC20 transaction volume: ${
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
    "get_top_holders",
    "Get the top holders of native tokens (SST/SOMI) by analyzing recent transactions",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of top holders to return (1-50, defaults to 10)"),
      fromBlock: z
        .number()
        .optional()
        .describe("Starting block number (optional, uses recent blocks if not specified)"),
      toBlock: z
        .number()
        .optional()
        .describe("Ending block number (optional, uses latest block if not specified)"),
    },
    async ({ network = TEST_NETWORK, limit = 10, fromBlock, toBlock }) => {
      try {
        const result = await services.getTopHolders(
          network,
          limit,
          fromBlock,
          toBlock
        );

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
              text: `Error getting top holders: ${
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
    "get_erc20_top_holders",
    "Get the top holders of an ERC20 token by analyzing Transfer events",
    {
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks. Defaults to Somnia mainnet."
        ),
      tokenAddress: z.string().describe("The ERC20 token contract address"),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of top holders to return (1-100, defaults to 10)"),
      fromBlock: z
        .number()
        .optional()
        .describe("Starting block number (optional, uses recent blocks if not specified)"),
      toBlock: z
        .number()
        .optional()
        .describe("Ending block number (optional, uses latest block if not specified)"),
    },
    async ({ network = TEST_NETWORK, tokenAddress, limit = 10, fromBlock, toBlock }) => {
      try {
        const result = await services.getERC20TopHolders(
          network,
          tokenAddress,
          limit,
          fromBlock,
          toBlock
        );

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
              text: `Error getting ERC20 top holders: ${
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
    "get_address_transactions",
    "Get transaction history for a specific address",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      address: z.string().describe("Address to get transactions for"),
      page: z
        .number()
        .optional()
        .describe("Page number for pagination (default: 1)"),
      limit: z
        .number()
        .optional()
        .describe("Number of transactions per page (max 100, default: 10)"),
      sort: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Sort order ('asc' or 'desc', default: 'desc')"),
    },
    async ({ network, address, page = 1, limit = 10, sort = "desc" }) => {
      try {
        const result = await services.getAddressTransactions(
          network,
          address,
          page,
          limit,
          sort
        );
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
              text: `Error getting address transactions: ${
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
    "get_pending_transactions",
    "Get pending transactions from the mempool",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of pending transactions to return (default: 10)"),
    },
    async ({ network, limit = 10 }) => {
      try {
        const result = await services.getPendingTransactions(network, limit);
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
              text: `Error getting pending transactions: ${
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
    "monitor_transaction",
    "Monitor a transaction until it's confirmed",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      transactionHash: z.string().describe("Transaction hash to monitor"),
      confirmations: z
        .number()
        .optional()
        .describe("Number of confirmations to wait for (default: 1)"),
      timeout: z
        .number()
        .optional()
        .describe("Timeout in milliseconds (default: 300000 = 5 minutes)"),
    },
    async ({ network, transactionHash, confirmations = 1, timeout = 300000 }) => {
      try {
        const result = await services.monitorTransaction(
          network,
          transactionHash,
          confirmations,
          timeout
        );
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
              text: `Error monitoring transaction: ${
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
    "send_raw_transaction",
    "Send a raw signed transaction to the network",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      signedTransaction: z.string().describe("Raw signed transaction as hex string"),
    },
    async ({ network, signedTransaction }) => {
      try {
        const result = await services.sendRawTransaction(network, signedTransaction);
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
              text: `Error sending raw transaction: ${
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
    "decode_transaction_input",
    "Decode transaction input data using contract ABI",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      transactionHash: z.string().describe("Transaction hash to decode"),
      abi: z
        .array(z.any())
        .optional()
        .describe("Contract ABI as JSON array (optional for decoding)"),
    },
    async ({ network, transactionHash, abi }) => {
      try {
        const result = await services.decodeTransactionInput(
          network,
          transactionHash,
          abi
        );
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
              text: `Error decoding transaction input: ${
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
    "get_transaction_fee",
    "Calculate the actual fee paid for a transaction",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      transactionHash: z.string().describe("Transaction hash to calculate fee for"),
    },
    async ({ network, transactionHash }) => {
      try {
        const result = await services.getTransactionFee(network, transactionHash);
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
              text: `Error calculating transaction fee: ${
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
    "batch_transfer_native",
    "Transfer native tokens to multiple addresses in batch",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      transfers: z
        .array(
          z.object({
            to: z.string().describe("Recipient address"),
            amount: z.string().describe("Amount to transfer (in SST/SOMI)"),
          })
        )
        .describe("Array of transfer objects"),
    },
    async ({ network, transfers }) => {
      try {
        const result = await services.batchTransferNative(network, transfers);
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
              text: `Error executing batch native transfer: ${
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
    "batch_transfer_erc20",
    "Transfer ERC20 tokens to multiple addresses in batch",
    {
      network: z
        .string()
        .describe(
          "Network name (e.g., 'Somnia Mainnet', 'Somnia Testnet', etc.) or chain ID. Supports all Somnia networks."
        ),
      tokenAddress: z.string().describe("ERC20 token contract address"),
      transfers: z
        .array(
          z.object({
            to: z.string().describe("Recipient address"),
            amount: z.string().describe("Amount to transfer (in token units)"),
          })
        )
        .describe("Array of transfer objects"),
    },
    async ({ network, tokenAddress, transfers }) => {
      try {
        const result = await services.batchTransferERC20(network, tokenAddress, transfers);
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
              text: `Error executing batch ERC20 transfer: ${
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
