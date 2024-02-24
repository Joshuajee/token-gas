import { Address } from "viem";

export interface ITransactions {
    sender: Address;
    to: Address;   
    permitSignature: string;
    transactionSignature: string;
    amount: string,
    fee: string,            
    permitNonce: string,
    transferNonce: string,
    paymasterAddress: Address,
    minAmountOut: string, // for swaps
    path: string, // for swaps
    deadline: number,
    verifyingContract: string
}