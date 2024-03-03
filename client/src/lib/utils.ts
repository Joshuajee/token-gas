import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
  keccak256,
  parseEther,
} from "viem";
import { hardhat, bscTestnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { EXECUTOR_PRIVATE_KEY } from "./constants";
import GaslessPaymasterAbi from "../abi/contracts/GaslessPaymaster.sol/GaslessPaymaster.json";
import QuoterAbi from "@abi/contracts/interfaces/pancake/IQuoterV2.sol/IQuoterV2.json";
import { FeeAmount } from "./enums";

const ADDR_SIZE = 20;
const FEE_SIZE = 3;
const OFFSET = ADDR_SIZE + FEE_SIZE;
const DATA_SIZE = OFFSET + ADDR_SIZE;

export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUM]: 50,
  [FeeAmount.HIGH]: 200,
};

import MockERC20Abi from "@/abi/contracts/mocks/MockERC20WithPermit.sol/MockERC20WithPermit.json";
import PaymasterAbi from "@/abi/contracts/GaslessPaymaster.sol/GaslessPaymaster.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface IDomain {
  name: string;
  version: string;
  verifyingContract: Address;
  chainId: number;
}

export async function createPermit(
  owner: Address,
  spender: Address,
  value: String,
  nonce: String,
  deadline: String,
  domain: IDomain
) {
  const permit = { owner, spender, value, nonce, deadline };

  const Permit = [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ];

  const domainType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ];

  const dataToSign: any = {
    types: {
      EIP712Domain: domainType,
      Permit: Permit,
    },
    domain: domain,
    primaryType: "Permit",
    message: permit,
  };

  return await signWithSignature(owner, dataToSign);
}

export async function createTransferPermit(
  owner: Address,
  to: Address,
  value: String,
  maxFee: String,
  domain: IDomain
) {
  const permit = { to, amount: value, maxFee };

  const Permit = [
    { name: "to", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "maxFee", type: "uint256" },
  ];

  const domainType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ];

  const dataToSign: any = {
    types: {
      EIP712Domain: domainType,
      Permit: Permit,
    },
    domain: domain,
    primaryType: "Permit",
    message: permit,
  };

  return await signWithSignature(owner, dataToSign);
}

export async function createSwapPermit(
  owner: Address,
  to: Address,
  path: string,
  amountIn: String,
  amountOutMin: string,
  maxFee: String,
  domain: IDomain
) {
  const pathHash = keccak256(path as Address);

  const permit = {
    pathHash,
    to,
    amountIn,
    amountOutMinimum: amountOutMin,
    maxFee,
  };

  const Permit = [
    { name: "pathHash", type: "bytes32" },
    { name: "to", type: "address" },
    { name: "amountIn", type: "uint256" },
    { name: "amountOutMinimum", type: "uint256" },
    { name: "maxFee", type: "uint256" },
  ];

  const domainType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ];

  const dataToSign: any = {
    types: {
      EIP712Domain: domainType,
      Permit: Permit,
    },
    domain: domain,
    primaryType: "Permit",
    message: permit,
  };

  return await signWithSignature(owner, dataToSign);
}

const signWithSignature = async (owner: Address, dataToSign: any) => {
  const client = createWalletClient({
    account: owner,
    chain: hardhat,
    transport: custom(window?.ethereum!),
  });

  const signature = await client.signTypedData(dataToSign);

  const pureSig = signature.replace("0x", "");

  const r = Buffer.from(pureSig.substring(0, 64), "hex");
  const s = Buffer.from(pureSig.substring(64, 128), "hex");
  const v = Buffer.from(parseInt(pureSig.substring(128, 130), 16).toString());

  return {
    r: "0x" + r.toString("hex"),
    s: "0x" + s.toString("hex"),
    v: parseInt(v.toString()),
    signature,
  };
};

export const getTokenDomain = async (contract: Address, owner: Address) => {
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });

  const tokenDomainInfo = await publicClient.readContract({
    address: contract,
    abi: MockERC20Abi,
    functionName: "eip712Domain",
  });
  //console.log("🚀 ~ getTokenDomain ~ tokenDomainInfo:", tokenDomainInfo);
  return tokenDomainInfo;
};

export const getPaymasterDomain = async (contract: Address) => {
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });

  const paymasterDomainInfo = await publicClient.readContract({
    address: contract,
    abi: PaymasterAbi,
    functionName: "eip712Domain",
  });

  return paymasterDomainInfo;
};

export const getTokenNonce = async (contract: Address, owner: Address) => {
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });

  const nonce = await publicClient.readContract({
    address: contract,
    abi: MockERC20Abi,
    functionName: "nonces",
    args: [owner],
  });
  // console.log("🚀 ~ getTokenNonce ~ nonce:", nonce);
  return nonce;
};

export const getMaxFee = async (contract: Address) => {
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });

  const maxFee = await publicClient.readContract({
    address: contract,
    abi: PaymasterAbi,
    functionName: "estimateFees",
    args: [0, 10365794880n],
  });

  return maxFee;
};
export const getSwapMaxFee = async (contract: Address) => {
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });

  const maxFee = await publicClient.readContract({
    address: contract,
    abi: PaymasterAbi,
    functionName: "estimateFees",
    args: [1, 10365794880n],
  });

  return maxFee;
};
export const getTokenShare = async (contract: Address, amount: bigint) => {
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });

  const maxFee = await publicClient.readContract({
    address: contract,
    abi: PaymasterAbi,
    functionName: "getFundShare",
    args: [amount],
  });

  return maxFee;
};

export const getSwapQuote = async (
  contract: Address,
  path: string,
  amtIn: bigint
) => {
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });

  const quote = await publicClient.readContract({
    address: contract,
    abi: QuoterAbi,
    functionName: "quoteExactInput",
    args: [path, amtIn],
  });

  return quote;
};

export const decodeSignature = (signature: string) => {
  const pureSig = signature.replace("0x", "");

  const r = Buffer.from(pureSig.substring(0, 64), "hex");
  const s = Buffer.from(pureSig.substring(64, 128), "hex");
  const v = Buffer.from(parseInt(pureSig.substring(128, 130), 16).toString());

  return {
    r: "0x" + r.toString("hex"),
    s: "0x" + s.toString("hex"),
    v: parseInt(v.toString()),
  };
};

export const getPaymaster = async (paymasterAddress: Address) => {
  const account = privateKeyToAccount(EXECUTOR_PRIVATE_KEY);

  const client = createWalletClient({
    account,
    chain: hardhat,
    transport: http(),
  });

  const GaslessPaymaster = getContract({
    address: paymasterAddress,
    abi: GaslessPaymasterAbi,
    client: client,
  });

  return { GaslessPaymaster, client, account };
};

export function encodePath(path: string[], fees: FeeAmount[]): string {
  if (path.length != fees.length + 1) {
    throw new Error("path/fee lengths do not match");
  }

  let encoded = "0x";
  for (let i = 0; i < fees.length; i++) {
    // 20 byte encoding of the address
    encoded += path[i].slice(2);
    // 3 byte encoding of the fee
    encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, "0");
  }
  // encode the final token
  encoded += path[path.length - 1].slice(2);

  return encoded.toLowerCase();
}
