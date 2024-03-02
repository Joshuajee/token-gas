import { Address } from "viem";

export interface ITransactions {
  sender: Address;
  to: Address;
  permitSignature: string;
  transactionSignature: string;
  amount: string;
  fee: string;
  nonce: string;
  paymasterAddress: Address;
  amountOutMin?: string; // for swaps
  path?: string; // for swaps
  deadline: string;
}

export interface ITransferDetails {
  sender: Address;
  receiver: Address;
  deadline: string;
  amount: string;
  maxFee: string;
}


export interface ISwapDetails {
  sender: Address;
  receiver: Address;
  deadline: string;
  amount: string;
  amountIn: string;
  amountOutMin: string;
  maxFee: string;
  path: string
}
