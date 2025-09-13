import {
  CHAINS,
  ERC20_ABI,
  ERC721_TOKEN_ABI,
  MINIMAL_ERC20_ABI,
  MINIMAL_ERC721_ABI,
  TEST_NETWORK,
} from "../constants/constants";

import {
  formatEther,
  formatUnits,
  getContract,
  parseEther,
  parseUnits,
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
   * @param {string} [network=this.network] - The blockchain network to query
   * @returns {Promise<bigint>} The gas price in wei
   */
  async getGasPrice(network: string = this.network): Promise<bigint> {
    const client = getPublicClient(network);
    return await client.getGasPrice();
  }

  /**
   * Gets complete transaction fee data
   * @param {string} [network=TEST_NETWORK] - The blockchain network to query
   * @returns {Promise<Object>} Object with gasPrice, maxFeePerGas and maxPriorityFeePerGas
   */
  async getFeeData(network: string = TEST_NETWORK): Promise<{
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
   * @param {string} [network=TEST_NETWORK] - The blockchain network to query
   * @param {string} ensName - The ENS name to resolve (e.g., 'alice.eth')
   * @returns {Promise<string|null>} The resolved address or null if not found
   */
  async resolveENS(
    network: string = TEST_NETWORK,
    ensName: string
  ): Promise<string | null> {
    const client = getPublicClient(network);

    try {
      return await client.getEnsAddress({ name: ensName });
    } catch (error) {
      return null;
    }
  }

  /**
   * Gets the ENS name associated with an address
   * @param {string} [network=TEST_NETWORK] - The blockchain network to query
   * @param {string} address - The Ethereum address to query
   * @returns {Promise<string|null>} The ENS name or null if not found
   */
  async reverseENS(
    network: string = TEST_NETWORK,
    address: string
  ): Promise<string | null> {
    const client = getPublicClient(network);
    return await client.getEnsName({
      address: `0x${address.replace("0x", "")}`,
    });
  }

  /**
   * Gets detailed information about a specific block
   * @param {string} [network=this.network] - The blockchain network to query
   * @param {number} blockNumber - The block number to get
   * @returns {Promise<Object>} Complete block data
   * @throws {Error} If the block is not found
   */
  async getBlockByNumber(
    network: string = this.network,
    blockNumber: number
  ): Promise<any> {
    const client = getPublicClient(network);
    const block = await client.getBlock({ blockNumber: BigInt(blockNumber) });

    if (!block) {
      throw new Error(`Block ${blockNumber} not found`);
    }

    return block;
  }

  /**
   * Gets the latest block from the network
   * @param {string} [network=this.network] - The blockchain network to query
   * @returns {Promise<Object>} The latest block data
   */
  async getLatestBlock(network: string = this.network): Promise<Block> {
    const client = getPublicClient(network);
    return await client.getBlock();
  }

  /**
   * Gets the SST (native token) balance of an address
   * @param {string} [network=this.network] - The blockchain network to query
   * @param {string} address - The address to query
   * @returns {Promise<Object>} Object with balance in wei and SST format
   */
  async getBalance(
    network: string = this.network,
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
   * @param {string} [network=this.network] - The blockchain network to query
   * @param {string} address - The token owner's address
   * @param {string} tokenAddress - The ERC20 token contract address
   * @returns {Promise<Object>} Object with raw balance, formatted balance and token information
   * @throws {Error} If contract methods are not available
   */
  async getERC20Balance(
    network: string = this.network,
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
   * @param {string} [network=this.network] - The blockchain network to query
   * @param {string} transactionHash - The transaction hash
   * @returns {Promise<Object>} The transaction data
   */
  async getTransaction(
    network: string = this.network,
    transactionHash: string
  ): Promise<Transaction> {
    const client = getPublicClient(network);
    return (await client.getTransaction({
      hash: `0x${transactionHash.replace("0x", "")}`,
    })) as Transaction;
  }

  /**
   * Gets the transaction receipt by its hash
   * @param {string} [network=this.network] - The blockchain network to query
   * @param {string} transactionHash - The transaction hash
   * @returns {Promise<Object>} The transaction receipt
   */
  async getTransactionReceipt(
    network: string = this.network,
    transactionHash: string
  ): Promise<TransactionReceipt> {
    const client = getPublicClient(network);
    return (await client.getTransactionReceipt({
      hash: `0x${transactionHash.replace("0x", "")}`,
    })) as TransactionReceipt;
  }

  /**
   * Gets the number of transactions sent from an address
   * @param {string} [network=TEST_NETWORK] - The blockchain network to query
   * @param {string} address - The address to query
   * @returns {Promise<number>} The transaction count (nonce)
   */
  async getTransactionCount(
    network: string = TEST_NETWORK,
    address: string
  ): Promise<number> {
    const client = getPublicClient(network);
    return await client.getTransactionCount({
      address: address as `0x${string}`,
    });
  }

  /**
   * Estimates the gas needed for a transaction
   * @param {EstimateGasParameters} params - The transaction parameters
   * @param {string} [network=TEST_NETWORK] - The blockchain network to use
   * @returns {Promise<bigint>} The estimated gas amount
   */
  async estimateGas(
    params: EstimateGasParameters,
    network: string = TEST_NETWORK
  ): Promise<bigint> {
    const client = getPublicClient(network);
    return await client.estimateGas(params);
  }

  /**
   * Transfers SST (native token) to another address
   * @param {string} to - The destination address
   * @param {string} amount - The amount of SST to transfer
   * @param {string} [network=TEST_NETWORK] - The blockchain network to use
   * @returns {Promise<string>} The transaction hash
   * @throws {Error} If the private key is not found in environment variables
   */
  async transferNativeToken(
    to: string,
    amount: string,
    network: string = TEST_NETWORK
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
   * @param {string} tokenAddress - The ERC20 token contract address
   * @param {string} to - The destination address
   * @param {string} amount - The amount of tokens to transfer
   * @param {string} [network=TEST_NETWORK] - The blockchain network to use
   * @returns {Promise<Object>} Object with transaction hash, amount and token information
   * @throws {Error} If private key or token information is not found
   */
  async transferErc20Token(
    tokenAddress: string,
    to: string,
    amount: string,
    network = TEST_NETWORK
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
   * @param {string} [network=TEST_NETWORK] - The blockchain network to query
   * @param {string} tokenAddress - The ERC20 token contract address
   * @returns {Promise<Object>} Object with token name, symbol, decimals, and total supply
   * @throws {Error} If token information is not available
   */
  async getERC20TokenInfo(
    network: string = TEST_NETWORK,
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
   * @param {string} [network=TEST_NETWORK] - The blockchain network to query
   * @param {string} tokenAddress - The NFT token contract address
   * @param {string} tokenId - The NFT token ID
   * @returns {Promise<Object>} Object with token name, symbol, and URI
   * @throws {Error} If token information is not available
   */
  async getERC721TokenInfo(
    network: string = TEST_NETWORK,
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
   * @param {string} [network=TEST_NETWORK] - The blockchain network to query
   * @param {string} tokenAddress - The NFT token contract address
   * @param {string} ownerAddress - The address to verify
   * @param {bigint} tokenId - The NFT token ID
   * @returns {Promise<boolean>} True if the address is the owner, false otherwise
   */
  checkERC721Ownership = async (
    network: string = TEST_NETWORK,
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
   * @param {string} [network=TEST_NETWORK] - The blockchain network to query
   * @param {string} address - The owner's address
   * @param {string} tokenAddress - The NFT token contract address
   * @returns {Promise<bigint>} The number of NFT tokens owned by the address
   */
  async getERC721Balance(
    network: string = TEST_NETWORK,
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
   * @param {string} [network=TEST_NETWORK] - The blockchain network to query
   * @param {string} address - The address to verify
   * @returns {Promise<boolean>} True if it's a contract, false if it's an external account
   */
  async isContract(
    network: string = TEST_NETWORK,
    address: string
  ): Promise<boolean> {
    const client = getPublicClient(network);
    const code = await client.getCode({
      address: address as `0x${string}`,
    });
    return code !== undefined && code !== "0x";
  }

  /**
   * Reads data from a smart contract without modifying state
   * @param {ReadContractParameters} params - Parameters to read the contract
   * @param {string} [network=TEST_NETWORK] - The blockchain network to use
   * @returns {Promise<any>} Data returned by the contract function
   */
  async readContract(
    params: ReadContractParameters,
    network: string = TEST_NETWORK
  ): Promise<any> {
    const client = getPublicClient(network);
    return await client.readContract(params);
  }
}
