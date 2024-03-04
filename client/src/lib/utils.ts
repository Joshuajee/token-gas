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
import { EXECUTOR_PRIVATE_KEY, GAS_PRICE } from "./constants";
import PoolAbi from "@abi/contracts/interfaces/pancake/IPancakeV3PoolState.sol/IPancakeV3PoolState.json";
import GaslessPaymasterAbi from "../abi/contracts/GaslessPaymaster.sol/GaslessPaymaster.json";
import FactoryAbi from "@abi/contracts/interfaces/pancake/IPancakeV3Factory.sol/IPancakeV3Factory.json";
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
    chain: getChain(),
    transport: custom((window as any)?.ethereum!),
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
    chain: getChain(),
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
    chain: getChain(),
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
    chain: getChain(),
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
    chain: getChain(),
    transport: http(),
  });

  const maxFee = await publicClient.readContract({
    address: contract,
    abi: PaymasterAbi,
    functionName: "estimateFees",
    args: [0, GAS_PRICE],
  });

  return maxFee;
};
export const getSwapMaxFee = async (contract: Address) => {
  const publicClient = createPublicClient({
    chain: getChain(),
    transport: http(),
  });

  const maxFee = await publicClient.readContract({
    address: contract,
    abi: PaymasterAbi,
    functionName: "estimateFees",
    args: [1, GAS_PRICE],
  });

  return maxFee;
};
export const getTokenShare = async (contract: Address, amount: bigint) => {
  const publicClient = createPublicClient({
    chain: getChain(),
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

export const getSwapQuote = async (pool: Address) => {
  const publicClient = createPublicClient({
    chain: getChain(),
    transport: http(),
  });

  const slot0 = await publicClient.readContract({
    address: pool,
    abi: PoolAbi,
    functionName: "slot0",
  });

  const sqrtRatioX96 = (slot0 as any)?.[0];

  /**
  sqrtPriceX96 = sqrt(price) * 2 ** 96
  // divide both sides by 2 ** 96
  sqrtPriceX96 / (2 ** 96) = sqrt(price)
  # square both sides
  (sqrtPriceX96 / (2 ** 96)) ** 2 = price
  # expand the squared fraction
  (sqrtPriceX96 ** 2) / ((2 ** 96) ** 2)  = price
  # multiply the exponents in the denominator to get the final expression
  */

  // sqrtRatioX96

  const price = sqrtRatioX96 ** 2n / 2n ** 192n; // = price

  return price;
};

export const getPool = async (token0: Address, token1: Address) => {
  const publicClient = createPublicClient({
    chain: getChain(),
    transport: http(),
  });

  const pool = await publicClient.readContract({
    address: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
    abi: FactoryAbi,
    functionName: "getPool",
    args: [token0, token1, FeeAmount.HIGH],
  });

  return pool;
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
    chain: getChain(),
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

export const getChain = () => {
  if (process.env.NODE_ENV === "development") return hardhat;
  return bscTestnet;
};

// console.log(getSwapQuote("0x1Ace7c13109B2B6F7ce83E769c781bF54342966d"));
//console.log(encodePath(["0x53524045cAC3154B466F379797CD17a5019f4389", "0x38d3B8C94f573C71d04A3f0F4151c37bC29B61C2"], [FeeAmount.HIGH]))
