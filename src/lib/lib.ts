import {
  createPublicClient,
  createWalletClient,
  http,
  type WalletClient,
  type PublicClient,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { TEST_NETWORK, CHAINS } from "../constants/constants";

export const getPublicClient = (network = TEST_NETWORK): PublicClient => {
  const chain = CHAINS.find(
    (item) => item.name.toLowerCase() === network.toLowerCase()
  );

  const chainRpc = chain?.rpcUrls.default.http[0];
  const client = createPublicClient({
    //@ts-ignore
    chain: chain,
    transport: http(chainRpc),
  });
  return client;
};

export const getWalletClient = (
  privateKey: Hex,
  network = TEST_NETWORK
): WalletClient => {
  const chain = CHAINS.find(
    (item) => item.name.toLowerCase() === network.toLowerCase()
  );

  const rpcUrl = chain?.rpcUrls.default.http[0];
  const account = privateKeyToAccount(privateKey);

  return createWalletClient({
    account,
    //@ts-ignore
    chain: chain,
    transport: http(rpcUrl),
  });
};
