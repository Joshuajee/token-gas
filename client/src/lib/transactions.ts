import { Address } from "viem"
import { decodeSignature, getPaymaster } from "./utils"
import { ITransactionDetails } from "./interfaces"


export const transfer = async (paymasterAddress: Address, permitSignature: string, transferSignature: string, transactionDetails: ITransactionDetails) => {

    const { sender, receiver, amount, deadline, maxFee } = transactionDetails
    
    const decodePermit = decodeSignature(permitSignature)
  
    const decodeTransfer = decodeSignature(transferSignature)
  
    const permitData = [
      sender,
      BigInt(amount) + BigInt(maxFee),
      deadline,
      decodePermit.v,
      decodePermit.r,
      decodePermit.s
    ]
  
    const transferData = [
      receiver,
      amount,
      maxFee,
      decodeTransfer.v,
      decodeTransfer.r,
      decodeTransfer.s
    ]
  
    const { GaslessPaymaster } = await getPaymaster(paymasterAddress)
  
    return await GaslessPaymaster.write.transferGasless([permitData, transferData])
  
}