import { Address } from "viem"
import { decodeSignature, getPaymaster } from "./utils"
import { ISwapDetails, ITransferDetails } from "./interfaces"



export const transfer = async (paymasterAddress: Address, permitSignature: string, transferSignature: string, transactionDetails: ITransferDetails) => {

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


export const swapOnPancake = async (paymasterAddress: Address, permitSignature: string, swapSignature: string, swapDetails: ISwapDetails) => {

  const { sender, receiver, amountIn, amountOutMin, deadline, maxFee, path  } = swapDetails
  
  const decodePermit = decodeSignature(permitSignature)

  const decodeSwap = decodeSignature(swapSignature)

  const permitData = [
    paymasterAddress,
    BigInt(amountIn) + BigInt(maxFee),
    deadline,
    decodePermit.v,
    decodePermit.r,
    decodePermit.s
  ]

  const swapData = [
    path,
    receiver,
    amountIn,
    amountOutMin,
    maxFee,
    decodeSwap.v,
    decodeSwap.r,
    decodeSwap.s
  ]

  const { GaslessPaymaster } = await getPaymaster(paymasterAddress)

  return await GaslessPaymaster.write.swapPancakeSwapGasless([permitData, swapData])
  
}