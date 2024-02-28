import { Address } from "viem"
import { decodeSignature, getPaymaster } from "./utils"
import { ITransactionDetails } from "./interfaces"


export const transfer = async (paymasterAddress: Address, permitSignature: string, transferSignature: string, transactionDetails: ITransactionDetails) => {

    const { sender, receiver, amount, deadline, maxFee } = transactionDetails
  
    console.log({maxFee})
    
    const decodePermit = decodeSignature(permitSignature)
  
    const decodeTransfer = decodeSignature(transferSignature)

    console.log(transferSignature == permitSignature)
  
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
  
  
    console.log(permitData, transferData)
  
  
    const { GaslessPaymaster } = await getPaymaster(paymasterAddress)
  
    // console.log(await GaslessPaymaster.read.eip712Domain())
  
    console.log(await GaslessPaymaster.read.totalAssets())
  
    await GaslessPaymaster.write.transferGasless([permitData, transferData])
  
  }