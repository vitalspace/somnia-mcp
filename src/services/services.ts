import {
  CHAINS,
  ERC20_ABI,
  ERC721_TOKEN_ABI,
  MINIMAL_ERC20_ABI,
  MINIMAL_ERC721_ABI,
  MULTICALL3_ABI,
  TEST_NETWORK,
} from "../constants/constants";

import {
  formatEther,
  formatUnits,
  getContract,
  parseEther,
  parseUnits,
  decodeFunctionData,
  type Block,
  type Address,
  type EstimateGasParameters,
  type ReadContractParameters,
  type Hash,
  type Transaction,
  type TransactionReceipt,
} from "viem";
import { getPublicClient, getWalletClient } from "../lib/lib";

export class Services {
  private network: string;
  private chains: typeof CHAINS = CHAINS;

  /**
   * Creates a new instance of the blockchain service
   * @param {string} [network=TEST_NETWORK] - The blockchain network to use (default: Somnia Testnet)
   */
  constructor(network: string = TEST_NETWORK) {
    this.network = network;
  }

  /**
   * Gets information about the specified blockchain network
   * @param {string} [network=this.network] - The blockchain network name
   * @returns {Object} The blockchain network information
   * @throws {Error} If the chain is not found or not supported
   */
  getChainInfo(network: string = this.network): (typeof CHAINS)[number] {
    const chain = this.chains.find(
      (item) => item.name.toLowerCase() === network.toLowerCase()
    );
    if (!chain) {
      throw new Error(`Chain ${network} not found or is not supported`);
    }
    return chain;
  }

  /**
   * Gets the current gas price on the specified network
   * @param {string} network - The blockchain network to query
   * @returns {Promise<bigint>} The gas price in wei
   */
  async getGasPrice(network: string): Promise<bigint> {
    const client = getPublicClient(network);
    return await client.getGasPrice();
  }

  /**
   * Gets complete transaction fee data
   * @param {string} network - The blockchain network to query
   * @returns {Promise<Object>} Object with gasPrice, maxFeePerGas and maxPriorityFeePerGas
   */
  async getFeeData(network: string): Promise<{
    gasPrice: bigint;
    maxFeePerGass: bigint;
    maxPriorityFeePerGas: bigint;
  }> {
    const client = getPublicClient(network);
    const [gasPrice, block] = await Promise.all([
      client.getGasPrice(),
      client.getBlock(),
    ]);

    return {
      gasPrice,
      maxFeePerGass: block.baseFeePerGas
        ? block.baseFeePerGas * BigInt(2)
        : gasPrice,
      maxPriorityFeePerGas: parseEther("0.002"),
    };
  }

  /**
   * Resolves an ENS name to its corresponding address
   * @param {string} network - The blockchain network to query
   * @param {string} ensName - The ENS name to resolve (e.g., 'alice.eth')
   * @returns {Promise<string|null>} The resolved address or null if not found
   */
  async resolveENS(network: string, ensName: string): Promise<string | null> {
    const client = getPublicClient(network);

    try {
      return await client.getEnsAddress({ name: ensName });
    } catch (error) {
      return null;
    }
  }

  /**
   * Gets the ENS name associated with an address
   * @param {string} network - The blockchain network to query
   * @param {string} address - The Ethereum address to query
   * @returns {Promise<string|null>} The ENS name or null if not found
   */
  async reverseENS(network: string, address: string): Promise<string | null> {
    const client = getPublicClient(network);
    return await client.getEnsName({
      address: `0x${address.replace("0x", "")}`,
    });
  }

  /**
   * Gets detailed information about a specific block
   * @param {string} network - The blockchain network to query
   * @param {number} blockNumber - The block number to get
   * @returns {Promise<Object>} Complete block data
   * @throws {Error} If the block is not found
   */
  async getBlockByNumber(network: string, blockNumber: number): Promise<any> {
    const client = getPublicClient(network);
    const block = await client.getBlock({ blockNumber: BigInt(blockNumber) });

    if (!block) {
      throw new Error(`Block ${blockNumber} not found`);
    }

    return block;
  }

  /**
   * Gets the latest block from the network
   * @param {string} network - The blockchain network to query
   * @returns {Promise<Object>} The latest block data
   */
  async getLatestBlock(network: string): Promise<Block> {
    const client = getPublicClient(network);
    return await client.getBlock();
  }

  /**
   * Gets the SST (native token) balance of an address
   * @param {string} network - The blockchain network to query
   * @param {string} address - The address to query
   * @returns {Promise<Object>} Object with balance in wei and SST format
   */
  async getBalance(
    network: string,
    address: string
  ): Promise<{
    address: string;
    network: string;
    wei: bigint;
    SST: string;
  }> {
    const client = getPublicClient(network);

    const balance = await client.getBalance({
      address: `0x${address.replace("0x", "")}`,
    });

    return {
      address,
      network,
      wei: balance,
      SST: formatEther(balance),
    };
  }

  /**
   * Gets the balance of an ERC20 token for a specific address
   * @param {string} network - The blockchain network to query
   * @param {string} address - The token owner's address
   * @param {string} tokenAddress - The ERC20 token contract address
   * @returns {Promise<Object>} Object with raw balance, formatted balance and token information
   * @throws {Error} If contract methods are not available
   */
  async getERC20Balance(
    network: string,
    address: string,
    tokenAddress: string
  ): Promise<{
    raw: bigint;
    formatted: string;
    token: {
      symbol: string;
      decimals: number;
    };
  }> {
    const client = getPublicClient(network);

    const validatedOwnerAddress = `0x${address.replace("0x", "")}`;
    const validatedTokenAddress = `0x${tokenAddress.replace("0x", "")}`;

    const contract = getContract({
      address: validatedTokenAddress as `0x${string}`,
      abi: MINIMAL_ERC20_ABI,
      client,
    });

    if (!contract.read?.balanceOf) {
      throw new Error("Contract read or balanceOf method not available");
    }

    if (!contract.read.symbol) {
      throw new Error("Contract read or symbol method not available");
    }

    if (!contract.read.decimals) {
      throw new Error("Contract read or decimals method not available");
    }

    const balance = await contract.read.balanceOf([
      validatedOwnerAddress as `0x${string}`,
    ]);
    const symbol = await contract.read.symbol();
    const decimals = await contract.read.decimals();

    return {
      raw: balance,
      formatted: formatUnits(balance as bigint, Number(decimals)),
      token: {
        symbol,
        decimals,
      },
    };
  }

  /**
   * Gets transaction details by its hash
   * @param {string} network - The blockchain network to query
   * @param {string} transactionHash - The transaction hash
   * @returns {Promise<Object>} The transaction data
   */
  async getTransaction(
    network: string,
    transactionHash: string
  ): Promise<Transaction> {
    const client = getPublicClient(network);
    return (await client.getTransaction({
      hash: `0x${transactionHash.replace("0x", "")}`,
    })) as Transaction;
  }

  /**
   * Gets the transaction receipt by its hash
   * @param {string} network - The blockchain network to query
   * @param {string} transactionHash - The transaction hash
   * @returns {Promise<Object>} The transaction receipt
   */
  async getTransactionReceipt(
    network: string,
    transactionHash: string
  ): Promise<TransactionReceipt> {
    const client = getPublicClient(network);
    return (await client.getTransactionReceipt({
      hash: `0x${transactionHash.replace("0x", "")}`,
    })) as TransactionReceipt;
  }

  /**
   * Gets the number of transactions sent from an address
   * @param {string} network - The blockchain network to query
   * @param {string} address - The address to query
   * @returns {Promise<number>} The transaction count (nonce)
   */
  async getTransactionCount(network: string, address: string): Promise<number> {
    const client = getPublicClient(network);
    return await client.getTransactionCount({
      address: address as `0x${string}`,
    });
  }

  /**
   * Estimates the gas needed for a transaction
   * @param {string} network - The blockchain network to use
   * @param {EstimateGasParameters} params - The transaction parameters
   * @returns {Promise<bigint>} The estimated gas amount
   */
  async estimateGas(
    network: string,
    params: EstimateGasParameters
  ): Promise<bigint> {
    const client = getPublicClient(network);
    return await client.estimateGas(params);
  }

  /**
   * Estimates the gas needed for a contract function call
   * @param {string} network - The blockchain network to use
   * @param {string} contractAddress - The contract address
   * @param {any[]} abi - The contract ABI
   * @param {string} functionName - The function to call
   * @param {any[]} [args=[]] - Arguments for the function
   * @param {string} [from] - The sender address (optional)
   * @param {string} [value] - The value to send with the call (optional)
   * @returns {Promise<bigint>} The estimated gas amount
   */
  async estimateContractGas(
    network: string,
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[] = [],
    from?: string,
    value?: string
  ): Promise<bigint> {
    const client = getPublicClient(network);

    const params: any = {
      address: contractAddress as `0x${string}`,
      abi,
      functionName,
      args,
    };

    if (from) {
      params.account = from as `0x${string}`;
    }

    if (value) {
      params.value = BigInt(value);
    }

    return await client.estimateGas(params);
  }

  /**
   * Checks if a contract is verified on the blockchain explorer
   * @param {string} network - The blockchain network to query
   * @param {string} contractAddress - The contract address to check
   * @returns {Promise<Object>} Verification status and contract information
   */
  async checkContractVerification(
    network: string,
    contractAddress: string
  ): Promise<{
    isVerified: boolean;
    contractName?: string;
    compilerVersion?: string;
    optimization?: boolean;
    sourceCode?: string;
    abi?: string;
    constructorArguments?: string;
    message: string;
  }> {
    try {
      const chain = this.getChainInfo(network);
      const explorerApiUrl = chain.blockExplorers?.default?.apiUrl;

      if (!explorerApiUrl) {
        throw new Error(`Explorer API not configured for network: ${network}`);
      }

      // Check if contract is verified using explorer API
      const response = await fetch(
        `${explorerApiUrl}?module=contract&action=getsourcecode&address=${contractAddress}`
      );

      if (!response.ok) {
        throw new Error(`Explorer API request failed: ${response.status}`);
      }

      const data = (await response.json()) as any;

      if (data.status === "1" && data.result && data.result[0]) {
        const contractData = data.result[0];

        if (contractData.SourceCode && contractData.SourceCode !== "") {
          return {
            isVerified: true,
            contractName: contractData.ContractName,
            compilerVersion: contractData.CompilerVersion,
            optimization: contractData.OptimizationUsed === "1",
            sourceCode: contractData.SourceCode,
            abi: contractData.ABI,
            constructorArguments: contractData.ConstructorArguments,
            message: "Contract is verified",
          };
        }
      }

      return {
        isVerified: false,
        message: "Contract is not verified or source code not available",
      };
    } catch (error) {
      return {
        isVerified: false,
        message: `Error checking contract verification: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Submits a contract for verification on the blockchain explorer
   * @param {string} network - The blockchain network
   * @param {string} contractAddress - The contract address
   * @param {string} sourceCode - The contract source code
   * @param {string} contractName - The contract name
   * @param {string} compilerVersion - The compiler version (e.g., 'v0.8.19+commit.7dd6d404')
   * @param {boolean} optimization - Whether optimization was used
   * @param {string} [constructorArguments] - Constructor arguments (hex encoded)
   * @param {string} [license] - Contract license type
   * @returns {Promise<Object>} Verification submission result
   */
  async verifyContract(
    network: string,
    contractAddress: string,
    sourceCode: string,
    contractName: string,
    compilerVersion: string,
    optimization: boolean = false,
    constructorArguments?: string,
    license?: string
  ): Promise<{
    success: boolean;
    guid?: string;
    message: string;
  }> {
    try {
      const chain = this.getChainInfo(network);
      const explorerApiUrl = chain.blockExplorers?.default?.apiUrl;

      if (!explorerApiUrl) {
        throw new Error(`Explorer API not configured for network: ${network}`);
      }

      // Prepare form data for verification submission
      const formData = new URLSearchParams();
      formData.append("module", "contract");
      formData.append("action", "verify");
      formData.append("address", contractAddress);
      formData.append("sourceCode", sourceCode);
      formData.append("contractName", contractName);
      formData.append("compilerVersion", compilerVersion);
      formData.append("optimization", optimization ? "1" : "0");
      formData.append("runs", "200"); // Default optimization runs

      if (constructorArguments) {
        formData.append("constructorArguments", constructorArguments);
      }

      if (license) {
        formData.append("license", license);
      }

      const response = await fetch(explorerApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`Explorer API request failed: ${response.status}`);
      }

      const data = (await response.json()) as any;

      if (data.status === "1") {
        return {
          success: true,
          guid: data.result,
          message: "Contract verification submitted successfully",
        };
      } else {
        return {
          success: false,
          message:
            data.message || data.result || "Verification submission failed",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error submitting contract for verification: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Transfers SST (native token) to another address
   * @param {string} network - The blockchain network to use
   * @param {string} to - The destination address
   * @param {string} amount - The amount of SST to transfer
   * @returns {Promise<string>} The transaction hash
   * @throws {Error} If the private key is not found in environment variables
   */
  async transferNativeToken(
    network: string,
    to: string,
    amount: string
  ): Promise<string> {
    const validatedToAddress = `0x${to.replace("0x", "")}`;
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) throw new Error("Private key not found");

    const client = getWalletClient(
      `0x${privateKey.replace("0x", "")}`,
      network
    );

    const amountWei = parseEther(amount);

    return client.sendTransaction({
      to: validatedToAddress as `0x${string}`,
      value: amountWei,
      account: client.account!,
      chain: client.chain,
    });
  }

  /**
   * Transfers ERC20 tokens to another address
   * @param {string} network - The blockchain network to use
   * @param {string} tokenAddress - The ERC20 token contract address
   * @param {string} to - The destination address
   * @param {string} amount - The amount of tokens to transfer
   * @returns {Promise<Object>} Object with transaction hash, amount and token information
   * @throws {Error} If private key or token information is not found
   */
  async transferErc20Token(
    network: string,
    tokenAddress: string,
    to: string,
    amount: string
  ): Promise<{
    txHash: Hash;
    amount: {
      raw: bigint;
      formatted: string;
    };
    token: {
      symbol: string;
      decimals: number;
    };
  }> {
    const validatedTokenAddress = `0x${tokenAddress.replace("0x", "")}`;
    const validatedToAddress = `0x${to.replace("0x", "")}`;
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) throw new Error("Private key not found");

    const publicClien = getPublicClient(network);

    const contract = getContract({
      address: validatedTokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      client: publicClien,
    });

    if (!contract.read.decimals) throw new Error("Decimals not found");
    const decimals = await contract.read.decimals();

    if (!contract.read.symbol) throw new Error("Symbol not found");
    const symbol = await contract.read.symbol();

    const rawAmount = parseUnits(amount, Number(decimals));

    const walletClient = getWalletClient(
      `0x${privateKey.replace("0x", "")}`,
      network
    );

    const hash = await walletClient.writeContract({
      address: validatedTokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [validatedToAddress, rawAmount],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    return {
      txHash: hash,
      amount: {
        raw: rawAmount,
        formatted: amount,
      },
      token: {
        symbol: symbol as string,
        decimals: Number(decimals),
      },
    };
  }

  /**
   * Gets detailed information about an ERC20 token
   * @param {string} network - The blockchain network to query
   * @param {string} tokenAddress - The ERC20 token contract address
   * @returns {Promise<Object>} Object with token name, symbol, decimals, and total supply
   * @throws {Error} If token information is not available
   */
  async getERC20TokenInfo(
    network: string,
    tokenAddress: string
  ): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    formattedTotalSupply: string;
  }> {
    const client = getPublicClient(network);

    const contract = getContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      client,
    });

    if (!contract.read.name) throw new Error("Name not found");
    const name = await contract.read.name();

    if (!contract.read.symbol) throw new Error("Symbol not found");
    const symbol = await contract.read.symbol();

    if (!contract.read.decimals) throw new Error("Decimals not found");
    const decimals = await contract.read.decimals();

    if (!contract.read.totalSupply) throw new Error("Total supply not found");
    const totalSupply = await contract.read.totalSupply();

    return {
      name: name as string,
      symbol: symbol as string,
      decimals: Number(decimals),
      totalSupply: totalSupply as string,
      formattedTotalSupply: formatUnits(
        totalSupply as bigint,
        Number(decimals)
      ),
    };
  }

  /**
   * Gets information about an NFT token (ERC721)
   * @param {string} network - The blockchain network to query
   * @param {string} tokenAddress - The NFT token contract address
   * @param {string} tokenId - The NFT token ID
   * @returns {Promise<Object>} Object with token name, symbol, and URI
   * @throws {Error} If token information is not available
   */
  async getERC721TokenInfo(
    network: string,
    tokenAddress: string,
    tokenId: string
  ): Promise<{
    name: string;
    symbol: string;
    tokenURI: string;
  }> {
    const client = getPublicClient(network);

    const contract = getContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC721_TOKEN_ABI,
      client,
    });

    if (!contract.read.name) throw new Error("Name not found");
    const name = await contract.read.name();

    if (!contract.read.symbol) throw new Error("Symbol not found");
    const symbol = await contract.read.symbol();

    if (!contract.read.tokenURI) throw new Error("Token URI not found");
    const tokenURI = await contract.read.tokenURI([BigInt(tokenId)]);

    return {
      name: name as string,
      symbol: symbol as string,
      tokenURI: tokenURI as string,
    };
  }

  /**
   * Checks if an address owns a specific NFT token
   * @param {string} network - The blockchain network to query
   * @param {string} tokenAddress - The NFT token contract address
   * @param {string} ownerAddress - The address to verify
   * @param {bigint} tokenId - The NFT token ID
   * @returns {Promise<boolean>} True if the address is the owner, false otherwise
   */
  checkERC721Ownership = async (
    network: string,
    tokenAddress: string,
    ownerAddress: string,
    tokenId: bigint
  ): Promise<boolean> => {
    const client = getPublicClient(network);

    const validatedTokenAddress = `0x${tokenAddress.replace(
      "0x",
      ""
    )}` as `0x${string}`;

    const validatedOwnerAddress = `0x${ownerAddress.replace("0x", "")}`;

    try {
      const actualOwner = await client.readContract({
        address: validatedTokenAddress,
        abi: MINIMAL_ERC721_ABI,
        functionName: "ownerOf",
        args: [tokenId],
      });

      return actualOwner.toLowerCase() === validatedOwnerAddress.toLowerCase();
    } catch (error: any) {
      return false;
    }
  };

  /**
   * Gets the NFT (ERC721) token balance for an address
   * @param {string} network - The blockchain network to query
   * @param {string} address - The owner's address
   * @param {string} tokenAddress - The NFT token contract address
   * @returns {Promise<bigint>} The number of NFT tokens owned by the address
   */
  async getERC721Balance(
    network: string,
    address: string,
    tokenAddress: string
  ): Promise<bigint> {
    const client = getPublicClient(network);

    const validatedTokenAddress = `0x${tokenAddress.replace(
      "0x",
      ""
    )}` as `0x${string}`;
    const validatedOwnerAddress = `0x${address.replace(
      "0x",
      ""
    )}` as `0x${string}`;

    return client.readContract({
      address: validatedTokenAddress,
      abi: MINIMAL_ERC721_ABI,
      functionName: "balanceOf",
      args: [validatedOwnerAddress],
    }) as Promise<bigint>;
  }

  /**
   * Checks if an address is a smart contract
   * @param {string} network - The blockchain network to query
   * @param {string} address - The address to verify
   * @returns {Promise<boolean>} True if it's a contract, false if it's an external account
   */
  async isContract(network: string, address: string): Promise<boolean> {
    const client = getPublicClient(network);
    const code = await client.getCode({
      address: address as `0x${string}`,
    });
    return code !== undefined && code !== "0x";
  }

  /**
   * Reads data from a smart contract without modifying state
   * @param {string} network - The blockchain network to use
   * @param {ReadContractParameters} params - Parameters to read the contract
   * @returns {Promise<any>} Data returned by the contract function
   */
  async readContract(
    network: string,
    params: ReadContractParameters
  ): Promise<any> {
    const client = getPublicClient(network);
    return await client.readContract(params);
  }

  /**
   * Writes data to a smart contract, modifying its state
   * @param {string} network - The blockchain network to use
   * @param {string} contractAddress - The contract address
   * @param {any[]} abi - The contract ABI
   * @param {string} functionName - The function to call
   * @param {any[]} [args=[]] - Arguments for the function
   * @returns {Promise<Hash>} The transaction hash
   * @throws {Error} If private key is not found or transaction fails
   */
  async writeContract(
    network: string,
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[] = []
  ): Promise<Hash> {
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
      throw new Error("Private key not found in environment variables");
    }

    const walletClient = getWalletClient(
      `0x${privateKey.replace("0x", "")}`,
      network
    );

    return await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName,
      args,
      account: walletClient.account!,
      chain: walletClient.chain,
    });
  }

  /**
   * Deploys a new smart contract to the blockchain
   * @param {string} network - The blockchain network to use
   * @param {string} bytecode - The compiled contract bytecode
   * @param {any[]} abi - The contract ABI
   * @param {any[]} [args=[]] - Constructor arguments
   * @returns {Promise<{contractAddress: string, txHash: Hash}>} The deployed contract address and transaction hash
   * @throws {Error} If private key is not found or deployment fails
   */
  async deployContract(
    network: string,
    bytecode: string,
    abi: any[],
    args: any[] = []
  ): Promise<{ contractAddress: string; txHash: Hash }> {
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
      throw new Error("Private key not found in environment variables");
    }

    const walletClient = getWalletClient(
      `0x${privateKey.replace("0x", "")}`,
      network
    );

    const hash = await walletClient.deployContract({
      abi,
      bytecode: bytecode as `0x${string}`,
      args,
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    // Wait for transaction receipt to get contract address
    const publicClient = getPublicClient(network);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (!receipt.contractAddress) {
      throw new Error(
        "Contract deployment failed - no contract address in receipt"
      );
    }

    return {
      contractAddress: receipt.contractAddress,
      txHash: hash,
    };
  }

  /**
   * Simulates a contract function call without executing it on the blockchain
   * @param {string} network - The blockchain network to use
   * @param {string} contractAddress - The contract address
   * @param {any[]} abi - The contract ABI
   * @param {string} functionName - The function to simulate
   * @param {any[]} [args=[]] - Function arguments
   * @returns {Promise<any>} The simulated result
   */
  async simulateContractCall(
    network: string,
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[] = []
  ): Promise<any> {
    const client = getPublicClient(network);

    const { result } = await client.simulateContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName,
      args,
    });

    return result;
  }

  /**
   * Gets historical events from a smart contract
   * @param {string} network - The blockchain network to use
   * @param {string} contractAddress - The contract address
   * @param {any[]} abi - The contract ABI
   * @param {string} [eventName] - Specific event name to filter (optional)
   * @param {number} [fromBlock] - Starting block number
   * @param {number} [toBlock] - Ending block number
   * @returns {Promise<any[]>} Array of event logs
   */
  async getContractEvents(
    network: string,
    contractAddress: string,
    abi: any[],
    eventName?: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<any[]> {
    const client = getPublicClient(network);
    const MAX_BLOCK_RANGE = 1000; // Most RPC providers limit to 1000 blocks

    // If no block range specified, get recent events (last 1000 blocks)
    if (!fromBlock || !toBlock) {
      const latestBlock = await client.getBlockNumber();
      fromBlock = fromBlock || Number(latestBlock) - 1000;
      toBlock = toBlock || Number(latestBlock);
    }

    const startBlock = BigInt(fromBlock);
    const endBlock = BigInt(toBlock);

    // Check if range exceeds limit
    if (endBlock - startBlock > BigInt(MAX_BLOCK_RANGE)) {
      // Split into chunks
      const allLogs: any[] = [];
      let currentStart = startBlock;

      while (currentStart <= endBlock) {
        const currentEnd =
          currentStart + BigInt(MAX_BLOCK_RANGE) > endBlock
            ? endBlock
            : currentStart + BigInt(MAX_BLOCK_RANGE);

        const filter = {
          address: contractAddress as `0x${string}`,
          fromBlock: currentStart,
          toBlock: currentEnd,
        };

        try {
          const logs = await client.getLogs(filter);
          const simplifiedLogs = logs.map((log) => ({
            address: log.address,
            topics: log.topics,
            data: log.data,
            blockNumber: Number(log.blockNumber),
            blockHash: log.blockHash,
            transactionHash: log.transactionHash,
            transactionIndex: Number(log.transactionIndex),
            logIndex: Number(log.logIndex),
            removed: log.removed,
          }));
          allLogs.push(...simplifiedLogs);
        } catch (error) {
          // If a chunk fails, continue with next chunk
          console.warn(
            `Failed to get logs for range ${currentStart}-${currentEnd}:`,
            error
          );
        }

        currentStart = currentEnd + BigInt(1);
      }

      return allLogs;
    } else {
      // Single query for small ranges
      const filter = {
        address: contractAddress as `0x${string}`,
        fromBlock: startBlock,
        toBlock: endBlock,
      };

      const logs = await client.getLogs(filter);

      // Return logs in a simplified format
      const simplifiedLogs = logs.map((log) => ({
        address: log.address,
        topics: log.topics,
        data: log.data,
        blockNumber: Number(log.blockNumber),
        blockHash: log.blockHash,
        transactionHash: log.transactionHash,
        transactionIndex: Number(log.transactionIndex),
        logIndex: Number(log.logIndex),
        removed: log.removed,
      }));

      return simplifiedLogs;
    }
  }

  /**
   * Executes multiple contract calls in a single transaction using multicall
   * @param {string} network - The blockchain network to use
   * @param {Array<{target: string, callData: string}>} calls - Array of contract calls
   * @returns {Promise<{blockNumber: bigint, returnData: string[]}>} The multicall results
   */
  async multicall(
    network: string,
    calls: Array<{ target: string; callData: string }>
  ): Promise<{ blockNumber: bigint; returnData: string[] }> {
    const client = getPublicClient(network);
    const chain = this.getChainInfo(network);

    if (!chain.contracts?.multicall3?.address) {
      throw new Error(
        `Multicall contract not configured for network: ${network}`
      );
    }

    const multicallAddress = chain.contracts.multicall3
      .address as `0x${string}`;

    // Format calls with proper types
    const formattedCalls = calls.map((call) => ({
      target: call.target as `0x${string}`,
      callData: call.callData as `0x${string}`,
    }));

    const result = await client.readContract({
      address: multicallAddress,
      abi: MULTICALL3_ABI,
      functionName: "aggregate",
      args: [formattedCalls],
    });

    return {
      blockNumber: result[0] as bigint,
      returnData: result[1] as string[],
    };
  }

  /**
   * Executes multiple contract calls with individual success/failure status using multicall3
   * @param {string} network - The blockchain network to use
   * @param {Array<{target: string, callData: string, value?: string}>} calls - Array of contract calls
   * @returns {Promise<Array<{success: boolean, returnData: string}>>} The multicall results with success status
   */
  async multicall3(
    network: string,
    calls: Array<{ target: string; callData: string; value?: string }>
  ): Promise<Array<{ success: boolean; returnData: string }>> {
    const client = getPublicClient(network);
    const chain = this.getChainInfo(network);

    if (!chain.contracts?.multicall3?.address) {
      throw new Error(
        `Multicall contract not configured for network: ${network}`
      );
    }

    const multicallAddress = chain.contracts.multicall3
      .address as `0x${string}`;

    // For Somnia Testnet, use aggregate since aggregate3 is not supported
    if (network === TEST_NETWORK) {
      // Format calls for aggregate (without value)
      const formattedCalls = calls.map((call) => ({
        target: call.target as `0x${string}`,
        callData: call.callData as `0x${string}`,
      }));

      const result = await client.readContract({
        address: multicallAddress,
        abi: MULTICALL3_ABI,
        functionName: "aggregate",
        args: [formattedCalls],
      });

      // Return results with success: true (since aggregate would revert on failure)
      return result[1].map((returnData: string) => ({
        success: true,
        returnData: returnData as string,
      }));
    } else {
      // For other networks, use aggregate3 if available
      // Prepare calls with default value of 0 if not provided
      const formattedCalls = calls.map((call) => ({
        target: call.target as `0x${string}`,
        callData: call.callData as `0x${string}`,
        value: call.value ? BigInt(call.value) : BigInt(0),
      }));

      const result = await client.readContract({
        address: multicallAddress,
        abi: MULTICALL3_ABI,
        functionName: "aggregate3" as any,
        args: [formattedCalls],
      });

      return result.map((item: any) => ({
        success: item.success as boolean,
        returnData: item.returnData as string,
      }));
    }
  }

  /**
   * Gets the deployed bytecode of a smart contract using Viem
   * @param {string} network - The blockchain network to query
   * @param {string} contractAddress - The contract address
   * @returns {Promise<Object>} Object with bytecode and contract information
   */
  async getContractBytecode(
    network: string,
    contractAddress: string
  ): Promise<{
    address: string;
    network: string;
    bytecode: string;
    isContract: boolean;
    bytecodeLength: number;
  }> {
    const client = getPublicClient(network);
    const validatedAddress = `0x${contractAddress.replace(
      "0x",
      ""
    )}` as `0x${string}`;

    const bytecode = await client.getCode({
      address: validatedAddress,
    });

    const isContract = bytecode !== undefined && bytecode !== "0x";

    return {
      address: contractAddress,
      network,
      bytecode: bytecode || "0x",
      isContract,
      bytecodeLength: bytecode ? bytecode.length / 2 - 1 : 0, // -1 for '0x' prefix
    };
  }

  /**
   * Executes multiple contract write operations in batch
   * @param {string} network - The blockchain network to use
   * @param {Array<{contractAddress: string, abi: any[], functionName: string, args?: any[], value?: string}>} operations - Array of contract operations
   * @param {boolean} [continueOnError=true] - Whether to continue with remaining operations if one fails
   * @returns {Promise<Object>} Batch execution results
   * @throws {Error} If private key is not found
   */
  async batchWriteContract(
    network: string,
    operations: Array<{
      contractAddress: string;
      abi: any[];
      functionName: string;
      args?: any[];
      value?: string;
    }>,
    continueOnError: boolean = true
  ): Promise<{
    success: boolean;
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    results: Array<{
      index: number;
      contractAddress: string;
      functionName: string;
      success: boolean;
      txHash?: Hash;
      error?: string;
    }>;
    network: string;
  }> {
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
      throw new Error("Private key not found in environment variables");
    }

    const walletClient = getWalletClient(
      `0x${privateKey.replace("0x", "")}`,
      network
    );

    const results: Array<{
      index: number;
      contractAddress: string;
      functionName: string;
      success: boolean;
      txHash?: Hash;
      error?: string;
    }> = [];

    let successfulOperations = 0;
    let failedOperations = 0;

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];

      if (!operation) {
        results.push({
          index: i,
          contractAddress: "unknown",
          functionName: "unknown",
          success: false,
          error: "Invalid operation at index " + i,
        });
        failedOperations++;
        continue;
      }

      try {
        const txHash = await walletClient.writeContract({
          address: operation.contractAddress as `0x${string}`,
          abi: operation.abi,
          functionName: operation.functionName,
          args: operation.args || [],
          value: operation.value ? BigInt(operation.value) : undefined,
          account: walletClient.account!,
          chain: walletClient.chain,
        });

        results.push({
          index: i,
          contractAddress: operation.contractAddress,
          functionName: operation.functionName,
          success: true,
          txHash,
        });

        successfulOperations++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        results.push({
          index: i,
          contractAddress: operation.contractAddress,
          functionName: operation.functionName,
          success: false,
          error: errorMessage,
        });

        failedOperations++;

        if (!continueOnError) {
          // Stop execution on first error
          break;
        }
      }
    }

    return {
      success: failedOperations === 0,
      totalOperations: operations.length,
      successfulOperations,
      failedOperations,
      results,
      network,
    };
  }

  /**
   * Gets the ABI (Application Binary Interface) of a smart contract
   * @param {string} network - The blockchain network to query
   * @param {string} contractAddress - The contract address
   * @returns {Promise<Object>} Object with ABI information and metadata
   */
  async getContractAbi(
    network: string,
    contractAddress: string
  ): Promise<{
    address: string;
    network: string;
    abi: any[] | null;
    isVerified: boolean;
    contractName?: string;
    compilerVersion?: string;
    message: string;
  }> {
    try {
      // First, try to get ABI from blockchain explorer (for verified contracts)
      const verificationResult = await this.checkContractVerification(
        contractAddress,
        network
      );

      if (verificationResult.isVerified && verificationResult.abi) {
        // Parse ABI if it's a string
        let parsedAbi: any[] = [];
        try {
          parsedAbi =
            typeof verificationResult.abi === "string"
              ? JSON.parse(verificationResult.abi)
              : verificationResult.abi;
        } catch (parseError) {
          return {
            address: contractAddress,
            network,
            abi: null,
            isVerified: false,
            message: `Contract is verified but ABI parsing failed: ${
              parseError instanceof Error
                ? parseError.message
                : String(parseError)
            }`,
          };
        }

        return {
          address: contractAddress,
          network,
          abi: parsedAbi,
          isVerified: true,
          contractName: verificationResult.contractName,
          compilerVersion: verificationResult.compilerVersion,
          message: "ABI retrieved from verified contract",
        };
      }

      // If contract is not verified or ABI is not available
      return {
        address: contractAddress,
        network,
        abi: null,
        isVerified: false,
        message:
          verificationResult.message ||
          "Contract ABI not available. Contract may not be verified on the blockchain explorer.",
      };
    } catch (error) {
      return {
        address: contractAddress,
        network,
        abi: null,
        isVerified: false,
        message: `Error retrieving contract ABI: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Calculates the total transaction volume in SST for a given block range
   * @param {string} network - The blockchain network to query
   * @param {number} fromBlock - Starting block number
   * @param {number} toBlock - Ending block number
   * @returns {Promise<Object>} Object with volume information in wei and SST format
   */
  async getTransactionVolume(
    network: string,
    fromBlock: number,
    toBlock: number
  ): Promise<{
    network: string;
    fromBlock: number;
    toBlock: number;
    totalVolumeWei: bigint;
    totalVolumeSST: string;
    transactionCount: number;
    blocksProcessed: number;
    message: string;
  }> {
    try {
      const client = getPublicClient(network);

      // Validate block range
      if (fromBlock > toBlock) {
        throw new Error("fromBlock cannot be greater than toBlock");
      }

      if (toBlock - fromBlock > 1000) {
        throw new Error(
          "Block range cannot exceed 1000 blocks. Please reduce the range."
        );
      }

      let totalVolumeWei = BigInt(0);
      let transactionCount = 0;
      let blocksProcessed = 0;

      // Process each block in the range
      for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
        try {
          // Get block with full transactions
          const block = await client.getBlock({
            blockNumber: BigInt(blockNumber),
            includeTransactions: true,
          });

          if (block && block.transactions) {
            // Sum up all transaction values in this block
            for (const tx of block.transactions) {
              if (tx.value) {
                totalVolumeWei += tx.value;
                transactionCount++;
              }
            }
            blocksProcessed++;
          }
        } catch (blockError) {
          // Continue with next block if one fails
          console.warn(`Failed to process block ${blockNumber}:`, blockError);
        }
      }

      return {
        network,
        fromBlock,
        toBlock,
        totalVolumeWei,
        totalVolumeSST: formatEther(totalVolumeWei),
        transactionCount,
        blocksProcessed,
        message: `Successfully processed ${blocksProcessed} blocks with ${transactionCount} transactions`,
      };
    } catch (error) {
      return {
        network,
        fromBlock,
        toBlock,
        totalVolumeWei: BigInt(0),
        totalVolumeSST: "0",
        transactionCount: 0,
        blocksProcessed: 0,
        message: `Error calculating transaction volume: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Calculates the total ERC20 token transaction volume for a given block range
   * @param {string} network - The blockchain network to query
   * @param {string} tokenAddress - The ERC20 token contract address
   * @param {number} fromBlock - Starting block number
   * @param {number} toBlock - Ending block number
   * @returns {Promise<Object>} Object with ERC20 volume information and token details
   */
  async getERC20TransactionVolume(
    network: string,
    tokenAddress: string,
    fromBlock: number,
    toBlock: number
  ): Promise<{
    network: string;
    tokenAddress: string;
    tokenSymbol?: string;
    tokenDecimals?: number;
    fromBlock: number;
    toBlock: number;
    totalVolumeRaw: bigint;
    totalVolumeFormatted: string;
    transferCount: number;
    blocksProcessed: number;
    message: string;
  }> {
    try {
      // Validate block range
      if (fromBlock > toBlock) {
        throw new Error("fromBlock cannot be greater than toBlock");
      }

      if (toBlock - fromBlock > 1000) {
        throw new Error(
          "Block range cannot exceed 1000 blocks. Please reduce the range."
        );
      }

      // ERC20 Transfer event ABI
      const erc20TransferAbi = [
        {
          anonymous: false,
          inputs: [
            { indexed: true, name: "from", type: "address" },
            { indexed: true, name: "to", type: "address" },
            { indexed: false, name: "value", type: "uint256" },
          ],
          name: "Transfer",
          type: "event",
        },
      ];

      // Get Transfer events from the token contract
      const events = await this.getContractEvents(
        network,
        tokenAddress,
        erc20TransferAbi,
        "Transfer",
        fromBlock,
        toBlock
      );

      let totalVolumeRaw = BigInt(0);
      let transferCount = 0;

      // Sum up all transfer values
      for (const event of events) {
        if (event.data && event.data.length >= 64) {
          // Extract the value from event data (last 32 bytes = 64 hex chars)
          const valueHex = event.data.slice(-64);
          const value = BigInt(`0x${valueHex}`);
          totalVolumeRaw += value;
          transferCount++;
        }
      }

      // Get token information for formatting
      let tokenSymbol: string | undefined;
      let tokenDecimals: number | undefined;
      let formattedVolume = totalVolumeRaw.toString();

      try {
        const tokenInfo = await this.getERC20TokenInfo(network, tokenAddress);
        tokenSymbol = tokenInfo.symbol;
        tokenDecimals = tokenInfo.decimals;

        // Format the volume using token decimals
        formattedVolume = formatUnits(totalVolumeRaw, tokenDecimals);
      } catch (tokenError) {
        // Continue without token info if it fails
        console.warn("Could not get token info:", tokenError);
      }

      return {
        network,
        tokenAddress,
        tokenSymbol,
        tokenDecimals,
        fromBlock,
        toBlock,
        totalVolumeRaw,
        totalVolumeFormatted: formattedVolume,
        transferCount,
        blocksProcessed: Math.min(toBlock - fromBlock + 1, 1000), // Approximate
        message: `Successfully processed ERC20 transfers: ${transferCount} transfers found`,
      };
    } catch (error) {
      return {
        network,
        tokenAddress,
        fromBlock,
        toBlock,
        totalVolumeRaw: BigInt(0),
        totalVolumeFormatted: "0",
        transferCount: 0,
        blocksProcessed: 0,
        message: `Error calculating ERC20 transaction volume: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Gets the top holders of an ERC20 token by analyzing Transfer events
   * @param {string} network - The blockchain network to query
   * @param {string} tokenAddress - The ERC20 token contract address
   * @param {number} [limit=10] - Maximum number of top holders to return
   * @param {number} [fromBlock] - Starting block number (optional, uses recent blocks if not specified)
   * @param {number} [toBlock] - Ending block number (optional, uses latest block if not specified)
   * @returns {Promise<Object>} Object with top holders information
   */
  async getERC20TopHolders(
    network: string,
    tokenAddress: string,
    limit: number = 10,
    fromBlock?: number,
    toBlock?: number
  ): Promise<{
    network: string;
    tokenAddress: string;
    tokenSymbol?: string;
    tokenDecimals?: number;
    fromBlock: number;
    toBlock: number;
    totalHolders: number;
    topHolders: Array<{
      address: string;
      balance: string;
      balanceRaw: bigint;
      percentage?: string;
    }>;
    totalSupply?: string;
    totalSupplyRaw?: bigint;
    message: string;
  }> {
    try {
      // Validate limit
      if (limit <= 0 || limit > 100) {
        throw new Error("Limit must be between 1 and 100");
      }

      // ERC20 Transfer event ABI
      const erc20TransferAbi = [
        {
          anonymous: false,
          inputs: [
            { indexed: true, name: "from", type: "address" },
            { indexed: true, name: "to", type: "address" },
            { indexed: false, name: "value", type: "uint256" },
          ],
          name: "Transfer",
          type: "event",
        },
      ];

      // Set default block range if not provided (last 10000 blocks for comprehensive analysis)
      if (!fromBlock || !toBlock) {
        const client = getPublicClient(network);
        const latestBlock = await client.getBlockNumber();
        toBlock = toBlock || Number(latestBlock);
        fromBlock = fromBlock || Math.max(0, Number(latestBlock) - 10000);
      }

      // Validate block range
      if (fromBlock > toBlock) {
        throw new Error("fromBlock cannot be greater than toBlock");
      }

      // Get Transfer events from the token contract
      const events = await this.getContractEvents(
        network,
        tokenAddress,
        erc20TransferAbi,
        "Transfer",
        fromBlock,
        toBlock
      );

      // Calculate balances from events
      const balances = new Map<string, bigint>();

      for (const event of events) {
        if (event.topics && event.topics.length >= 3 && event.data) {
          try {
            // Extract addresses from topics (indexed parameters)
            const fromAddress = `0x${event.topics[1].slice(26)}`; // Remove 0x + 24 zeros padding
            const toAddress = `0x${event.topics[2].slice(26)}`; // Remove 0x + 24 zeros padding

            // Extract value from data (last 32 bytes)
            const valueHex = event.data.slice(-64);
            const value = BigInt(`0x${valueHex}`);

            // Update balances
            if (fromAddress !== "0x0000000000000000000000000000000000000000") {
              // Not a mint operation
              const currentFromBalance = balances.get(fromAddress) || BigInt(0);
              balances.set(fromAddress, currentFromBalance - value);
            }

            const currentToBalance = balances.get(toAddress) || BigInt(0);
            balances.set(toAddress, currentToBalance + value);
          } catch (parseError) {
            // Skip malformed events
            console.warn("Skipping malformed event:", parseError);
          }
        }
      }

      // Filter out zero balances and sort by balance descending
      const holdersWithBalance = Array.from(balances.entries())
        .filter(([_, balance]) => balance > BigInt(0))
        .sort(([, a], [, b]) => (b > a ? 1 : b < a ? -1 : 0));

      // Get token information
      let tokenSymbol: string | undefined;
      let tokenDecimals: number | undefined;
      let totalSupply: string | undefined;
      let totalSupplyRaw: bigint | undefined;

      try {
        const tokenInfo = await this.getERC20TokenInfo(network, tokenAddress);
        tokenSymbol = tokenInfo.symbol;
        tokenDecimals = tokenInfo.decimals;
        totalSupplyRaw = BigInt(tokenInfo.totalSupply);
        totalSupply = tokenInfo.formattedTotalSupply;
      } catch (tokenError) {
        console.warn("Could not get token info:", tokenError);
      }

      // Format top holders
      const topHolders = holdersWithBalance
        .slice(0, limit)
        .map(([address, balanceRaw]) => {
          let balance = balanceRaw.toString();
          let percentage: string | undefined;

          if (tokenDecimals !== undefined) {
            balance = formatUnits(balanceRaw, tokenDecimals);
          }

          if (totalSupplyRaw && totalSupplyRaw > BigInt(0)) {
            const percentageValue =
              (Number(balanceRaw) / Number(totalSupplyRaw)) * 100;
            percentage = percentageValue.toFixed(4) + "%";
          }

          return {
            address,
            balance,
            balanceRaw,
            percentage,
          };
        });

      return {
        network,
        tokenAddress,
        tokenSymbol,
        tokenDecimals,
        fromBlock,
        toBlock,
        totalHolders: holdersWithBalance.length,
        topHolders,
        totalSupply,
        totalSupplyRaw,
        message: `Successfully analyzed ${holdersWithBalance.length} holders from ${events.length} transfer events`,
      };
    } catch (error) {
      return {
        network,
        tokenAddress,
        fromBlock: fromBlock || 0,
        toBlock: toBlock || 0,
        totalHolders: 0,
        topHolders: [],
        message: `Error getting ERC20 top holders: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Gets the top holders of native tokens (SST/SOMI) by analyzing transactions
   * Note: This is a simplified implementation that may not be comprehensive for large ranges
   * @param {string} network - The blockchain network to query
   * @param {number} [limit=10] - Maximum number of top holders to return
   * @param {number} [fromBlock] - Starting block number (optional)
   * @param {number} [toBlock] - Ending block number (optional)
   * @returns {Promise<Object>} Object with top holders information
   */
  async getTopHolders(
    network: string,
    limit: number = 10,
    fromBlock?: number,
    toBlock?: number
  ): Promise<{
    network: string;
    tokenSymbol: string;
    fromBlock: number;
    toBlock: number;
    totalHolders: number;
    topHolders: Array<{
      address: string;
      balance: string;
      balanceRaw: bigint;
    }>;
    message: string;
  }> {
    try {
      // Validate limit
      if (limit <= 0 || limit > 50) {
        throw new Error("Limit must be between 1 and 50 for native tokens");
      }

      // For native tokens, we need to analyze transactions which is expensive
      // This is a simplified approach - in production you'd want a more efficient method
      const client = getPublicClient(network);

      // Set default block range if not provided (last 1000 blocks for performance)
      if (!fromBlock || !toBlock) {
        const latestBlock = await client.getBlockNumber();
        toBlock = toBlock || Number(latestBlock);
        fromBlock = fromBlock || Math.max(0, Number(latestBlock) - 1000);
      }

      // Validate block range
      if (fromBlock > toBlock) {
        throw new Error("fromBlock cannot be greater than toBlock");
      }

      if (toBlock - fromBlock > 1000) {
        throw new Error(
          "Block range cannot exceed 1000 blocks for native token analysis. Please reduce the range."
        );
      }

      // Track balances from transactions
      const balances = new Map<string, bigint>();

      // Process each block
      for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
        try {
          const block = await client.getBlock({
            blockNumber: BigInt(blockNumber),
            includeTransactions: true,
          });

          if (block && block.transactions) {
            for (const tx of block.transactions) {
              if (tx.value && tx.value > BigInt(0)) {
                // Update sender balance (decrease)
                if (tx.from) {
                  const currentFromBalance = balances.get(tx.from) || BigInt(0);
                  balances.set(tx.from, currentFromBalance - tx.value);
                }

                // Update receiver balance (increase)
                if (tx.to) {
                  const currentToBalance = balances.get(tx.to) || BigInt(0);
                  balances.set(tx.to, currentToBalance + tx.value);
                }
              }
            }
          }
        } catch (blockError) {
          console.warn(`Failed to process block ${blockNumber}:`, blockError);
        }
      }

      // Filter out negative balances and sort by balance descending
      const holdersWithBalance = Array.from(balances.entries())
        .filter(([_, balance]) => balance > BigInt(0))
        .sort(([, a], [, b]) => (b > a ? 1 : b < a ? -1 : 0));

      // Get token symbol
      const chain = this.getChainInfo(network);
      const tokenSymbol = chain.nativeCurrency.symbol;

      // Format top holders
      const topHolders = holdersWithBalance
        .slice(0, limit)
        .map(([address, balanceRaw]) => ({
          address,
          balance: formatEther(balanceRaw),
          balanceRaw,
        }));

      return {
        network,
        tokenSymbol,
        fromBlock,
        toBlock,
        totalHolders: holdersWithBalance.length,
        topHolders,
        message: `Successfully analyzed ${
          holdersWithBalance.length
        } holders from ${
          toBlock - fromBlock + 1
        } blocks (Note: This is a simplified analysis)`,
      };
    } catch (error) {
      return {
        network,
        tokenSymbol: "UNKNOWN",
        fromBlock: fromBlock || 0,
        toBlock: toBlock || 0,
        totalHolders: 0,
        topHolders: [],
        message: `Error getting top holders: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Gets transaction history for a specific address using blockchain explorer
   * @param {string} network - The blockchain network to query
   * @param {string} address - The address to get transactions for
   * @param {number} [page=1] - Page number for pagination
   * @param {number} [limit=10] - Number of transactions per page (max 100)
   * @param {string} [sort='desc'] - Sort order ('asc' or 'desc')
   * @returns {Promise<Object>} Object with transaction history and pagination info
   */
  async getAddressTransactions(
    network: string,
    address: string,
    page: number = 1,
    limit: number = 10,
    sort: "asc" | "desc" = "desc"
  ): Promise<{
    address: string;
    network: string;
    transactions: Array<{
      hash: string;
      blockNumber: number;
      timestamp: number;
      from: string;
      to: string;
      value: string;
      gasUsed: string;
      gasPrice: string;
      status: "success" | "failed";
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
    message: string;
  }> {
    try {
      const chain = this.getChainInfo(network);
      const explorerApiUrl = chain.blockExplorers?.default?.apiUrl;

      if (!explorerApiUrl) {
        throw new Error(`Explorer API not configured for network: ${network}`);
      }

      // Validate parameters
      if (page < 1) page = 1;
      if (limit < 1 || limit > 100) limit = 10;

      // Get transactions from explorer API
      const response = await fetch(
        `${explorerApiUrl}?module=account&action=txlist&address=${address}&page=${page}&offset=${limit}&sort=${sort}`
      );

      if (!response.ok) {
        throw new Error(`Explorer API request failed: ${response.status}`);
      }

      const data = (await response.json()) as any;

      if (data.status !== "1") {
        return {
          address,
          network,
          transactions: [],
          pagination: {
            page,
            limit,
            total: 0,
            hasMore: false,
          },
          message: data.message || "No transactions found",
        };
      }

      // Format transactions
      const transactions = data.result.map((tx: any) => ({
        hash: tx.hash,
        blockNumber: parseInt(tx.blockNumber),
        timestamp: parseInt(tx.timeStamp),
        from: tx.from,
        to: tx.to,
        value: formatEther(BigInt(tx.value)),
        gasUsed: tx.gasUsed,
        gasPrice: formatEther(BigInt(tx.gasPrice)),
        status: tx.txreceipt_status === "1" ? "success" : "failed",
      }));

      return {
        address,
        network,
        transactions,
        pagination: {
          page,
          limit,
          total: parseInt(data.result.length),
          hasMore: data.result.length === limit,
        },
        message: `Found ${transactions.length} transactions for address ${address}`,
      };
    } catch (error) {
      return {
        address,
        network,
        transactions: [],
        pagination: {
          page,
          limit,
          total: 0,
          hasMore: false,
        },
        message: `Error getting address transactions: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Gets pending transactions from the mempool
   * @param {string} network - The blockchain network to query
   * @param {number} [limit=10] - Maximum number of pending transactions to return
   * @returns {Promise<Object>} Object with pending transactions information
   */
  async getPendingTransactions(
    network: string,
    limit: number = 10
  ): Promise<{
    network: string;
    pendingTransactions: Array<{
      hash: string;
      from: string;
      to: string | null;
      value: string;
      gasPrice: string;
      gasLimit: string;
      nonce: number;
    }>;
    totalPending: number;
    message: string;
  }> {
    try {
      const client = getPublicClient(network);

      // Get pending block which contains pending transactions
      const pendingBlock = await client.getBlock({
        blockTag: "pending",
        includeTransactions: true,
      });

      if (!pendingBlock || !pendingBlock.transactions) {
        return {
          network,
          pendingTransactions: [],
          totalPending: 0,
          message: "No pending transactions found",
        };
      }

      // Filter and format pending transactions
      const pendingTransactions = pendingBlock.transactions
        .slice(0, limit)
        .map((tx: any) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to || null,
          value: formatEther(tx.value || BigInt(0)),
          gasPrice: formatEther(tx.gasPrice || BigInt(0)),
          gasLimit: tx.gas?.toString() || "0",
          nonce: tx.nonce,
        }));

      return {
        network,
        pendingTransactions,
        totalPending: pendingBlock.transactions.length,
        message: `Found ${pendingTransactions.length} pending transactions (showing first ${limit})`,
      };
    } catch (error) {
      return {
        network,
        pendingTransactions: [],
        totalPending: 0,
        message: `Error getting pending transactions: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Monitors a transaction until it's confirmed
   * @param {string} network - The blockchain network to query
   * @param {string} transactionHash - The transaction hash to monitor
   * @param {number} [confirmations=1] - Number of confirmations to wait for
   * @param {number} [timeout=300000] - Timeout in milliseconds (5 minutes default)
   * @returns {Promise<Object>} Object with transaction confirmation status
   */
  async monitorTransaction(
    network: string,
    transactionHash: string,
    confirmations: number = 1,
    timeout: number = 300000
  ): Promise<{
    network: string;
    transactionHash: string;
    status: "pending" | "confirmed" | "failed" | "timeout";
    confirmations: number;
    blockNumber?: number;
    gasUsed?: string;
    effectiveGasPrice?: string;
    message: string;
  }> {
    try {
      const client = getPublicClient(network);
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        try {
          const receipt = await client.getTransactionReceipt({
            hash: transactionHash as `0x${string}`,
          });

          if (receipt) {
            const currentBlock = await client.getBlockNumber();
            const txConfirmations =
              Number(currentBlock) - Number(receipt.blockNumber) + 1;

            if (txConfirmations >= confirmations) {
              return {
                network,
                transactionHash,
                status: receipt.status === "success" ? "confirmed" : "failed",
                confirmations: txConfirmations,
                blockNumber: Number(receipt.blockNumber),
                gasUsed: receipt.gasUsed?.toString(),
                effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
                message: `Transaction ${
                  receipt.status === "success" ? "confirmed" : "failed"
                } with ${txConfirmations} confirmations`,
              };
            }
          }

          // Wait 2 seconds before checking again
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          // Transaction might not be mined yet, continue waiting
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      return {
        network,
        transactionHash,
        status: "timeout",
        confirmations: 0,
        message: `Transaction monitoring timed out after ${
          timeout / 1000
        } seconds`,
      };
    } catch (error) {
      return {
        network,
        transactionHash,
        status: "failed",
        confirmations: 0,
        message: `Error monitoring transaction: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Sends a raw signed transaction to the network
   * @param {string} network - The blockchain network to use
   * @param {string} signedTransaction - The raw signed transaction as hex string
   * @returns {Promise<Object>} Object with transaction hash and status
   */
  async sendRawTransaction(
    network: string,
    signedTransaction: string
  ): Promise<{
    network: string;
    transactionHash: string;
    success: boolean;
    message: string;
  }> {
    try {
      const privateKey = process.env.PRIVATE_KEY;

      if (!privateKey) {
        throw new Error("Private key not found in environment variables");
      }

      const client = getWalletClient(
        `0x${privateKey.replace("0x", "")}`,
        network
      );

      const hash = await client.sendRawTransaction({
        serializedTransaction: signedTransaction as `0x${string}`,
      });

      return {
        network,
        transactionHash: hash,
        success: true,
        message: "Raw transaction sent successfully",
      };
    } catch (error) {
      return {
        network,
        transactionHash: "",
        success: false,
        message: `Error sending raw transaction: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Decodes transaction input data using contract ABI
   * @param {string} network - The blockchain network to query
   * @param {string} transactionHash - The transaction hash to decode
   * @param {any[]} [abi] - Optional contract ABI for decoding
   * @returns {Promise<Object>} Object with decoded transaction data
   */
  async decodeTransactionInput(
    network: string,
    transactionHash: string,
    abi?: any[]
  ): Promise<{
    network: string;
    transactionHash: string;
    decoded: boolean;
    functionName?: string;
    args?: any[];
    rawInput: string;
    message: string;
  }> {
    try {
      const client = getPublicClient(network);

      // Get transaction details
      const tx = await client.getTransaction({
        hash: transactionHash as `0x${string}`,
      });

      if (!tx || !tx.input) {
        return {
          network,
          transactionHash,
          decoded: false,
          rawInput: "",
          message: "Transaction not found or has no input data",
        };
      }

      // If ABI is provided, try to decode the input
      if (abi && tx.input !== "0x") {
        try {
          const decoded = decodeFunctionData({
            abi,
            data: tx.input as `0x${string}`,
          });

          return {
            network,
            transactionHash,
            decoded: true,
            functionName: decoded.functionName,
            args: decoded.args,
            rawInput: tx.input,
            message: "Transaction input decoded successfully",
          };
        } catch (decodeError) {
          // If decoding fails, return raw input
          return {
            network,
            transactionHash,
            decoded: false,
            rawInput: tx.input,
            message: "Could not decode transaction input with provided ABI",
          };
        }
      }

      // Return raw input if no ABI provided
      return {
        network,
        transactionHash,
        decoded: false,
        rawInput: tx.input,
        message: "Raw transaction input (ABI not provided for decoding)",
      };
    } catch (error) {
      return {
        network,
        transactionHash,
        decoded: false,
        rawInput: "",
        message: `Error decoding transaction input: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Calculates the actual fee paid for a transaction
   * @param {string} network - The blockchain network to query
   * @param {string} transactionHash - The transaction hash
   * @returns {Promise<Object>} Object with fee calculation details
   */
  async getTransactionFee(
    network: string,
    transactionHash: string
  ): Promise<{
    network: string;
    transactionHash: string;
    gasUsed: string;
    gasPrice: string;
    effectiveGasPrice?: string;
    totalFeeWei: string;
    totalFeeEth: string;
    message: string;
  }> {
    try {
      const client = getPublicClient(network);

      const receipt = await client.getTransactionReceipt({
        hash: transactionHash as `0x${string}`,
      });

      if (!receipt) {
        throw new Error("Transaction receipt not found");
      }

      const gasUsed = receipt.gasUsed;
      const effectiveGasPrice = receipt.effectiveGasPrice || BigInt(0);
      const totalFeeWei = gasUsed * effectiveGasPrice;

      return {
        network,
        transactionHash,
        gasUsed: gasUsed.toString(),
        gasPrice: "0", // gasPrice not available in receipt, use effectiveGasPrice
        effectiveGasPrice: effectiveGasPrice.toString(),
        totalFeeWei: totalFeeWei.toString(),
        totalFeeEth: formatEther(totalFeeWei),
        message: "Transaction fee calculated successfully",
      };
    } catch (error) {
      return {
        network,
        transactionHash,
        gasUsed: "0",
        gasPrice: "0",
        totalFeeWei: "0",
        totalFeeEth: "0",
        message: `Error calculating transaction fee: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Transfers native tokens to multiple addresses in batch
   * @param {string} network - The blockchain network to use
   * @param {Array<{to: string, amount: string}>} transfers - Array of transfer objects
   * @returns {Promise<Object>} Object with batch transfer results
   */
  async batchTransferNative(
    network: string,
    transfers: Array<{ to: string; amount: string }>
  ): Promise<{
    network: string;
    totalTransfers: number;
    successfulTransfers: number;
    failedTransfers: number;
    results: Array<{
      index: number;
      to: string;
      amount: string;
      success: boolean;
      txHash?: string;
      error?: string;
    }>;
    message: string;
  }> {
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
      throw new Error("Private key not found in environment variables");
    }

    const results: Array<{
      index: number;
      to: string;
      amount: string;
      success: boolean;
      txHash?: string;
      error?: string;
    }> = [];

    let successfulTransfers = 0;
    let failedTransfers = 0;

    for (let i = 0; i < transfers.length; i++) {
      const transfer = transfers[i];

      if (!transfer) continue;

      try {
        const privateKey = process.env.PRIVATE_KEY;

        if (!privateKey) {
          throw new Error("Private key not found in environment variables");
        }

        const client = getWalletClient(
          `0x${privateKey.replace("0x", "")}`,
          network
        );

        const amountWei = parseEther(transfer.amount);

        const hash = await client.sendTransaction({
          to: transfer.to as `0x${string}`,
          value: amountWei,
          account: client.account!,
          chain: client.chain,
        });

        results.push({
          index: i,
          to: transfer.to,
          amount: transfer.amount,
          success: true,
          txHash: hash,
        });

        successfulTransfers++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        results.push({
          index: i,
          to: transfer.to,
          amount: transfer.amount,
          success: false,
          error: errorMessage,
        });

        failedTransfers++;
      }
    }

    return {
      network,
      totalTransfers: transfers.length,
      successfulTransfers,
      failedTransfers,
      results,
      message: `Batch transfer completed: ${successfulTransfers} successful, ${failedTransfers} failed`,
    };
  }

  /**
   * Transfers ERC20 tokens to multiple addresses in batch
   * @param {string} network - The blockchain network to use
   * @param {string} tokenAddress - The ERC20 token contract address
   * @param {Array<{to: string, amount: string}>} transfers - Array of transfer objects
   * @returns {Promise<Object>} Object with batch ERC20 transfer results
   */
  async batchTransferERC20(
    network: string,
    tokenAddress: string,
    transfers: Array<{ to: string; amount: string }>
  ): Promise<{
    network: string;
    tokenAddress: string;
    totalTransfers: number;
    successfulTransfers: number;
    failedTransfers: number;
    results: Array<{
      index: number;
      to: string;
      amount: string;
      success: boolean;
      txHash?: string;
      error?: string;
    }>;
    message: string;
  }> {
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
      throw new Error("Private key not found in environment variables");
    }

    const client = getPublicClient(network);

    if (!privateKey) {
      throw new Error("Private key not found in environment variables");
    }

    const walletClient = getWalletClient(
      `0x${privateKey.replace("0x", "")}`,
      network
    );

    // Get token decimals for amount conversion
    const contract = getContract({
      address: tokenAddress as `0x${string}`,
      abi: MINIMAL_ERC20_ABI,
      client,
    });

    let decimals = 18; // Default to 18 decimals
    try {
      decimals = Number(await contract.read.decimals());
    } catch (error) {
      console.warn("Could not get token decimals, using default 18");
    }

    const results: Array<{
      index: number;
      to: string;
      amount: string;
      success: boolean;
      txHash?: string;
      error?: string;
    }> = [];

    let successfulTransfers = 0;
    let failedTransfers = 0;

    for (let i = 0; i < transfers.length; i++) {
      const transfer = transfers[i];

      if (!transfer) continue;

      try {
        const amountRaw = parseUnits(transfer.amount, decimals);

        const hash = await walletClient.writeContract({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [transfer.to, amountRaw],
          account: walletClient.account!,
          chain: walletClient.chain,
        });

        results.push({
          index: i,
          to: transfer.to,
          amount: transfer.amount,
          success: true,
          txHash: hash,
        });

        successfulTransfers++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        results.push({
          index: i,
          to: transfer.to,
          amount: transfer.amount,
          success: false,
          error: errorMessage,
        });

        failedTransfers++;
      }
    }

    return {
      network,
      tokenAddress,
      totalTransfers: transfers.length,
      successfulTransfers,
      failedTransfers,
      results,
      message: `Batch ERC20 transfer completed: ${successfulTransfers} successful, ${failedTransfers} failed`,
    };
  }
}
