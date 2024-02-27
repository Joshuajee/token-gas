import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Address, createWalletClient, getContract, http, parseEther } from "viem";
import { ITransactionDetails } from "./interfaces";
import { hardhat, mainnet } from "viem/chains";
import { privateKeyToAccount } from 'viem/accounts'
import { EXECUTOR_PRIVATE_KEY } from "./constants";
import GaslessPaymasterAbi from "../abi/contracts/GaslessPaymaster.sol/GaslessPaymaster.json";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface IDomain {
    name: string,
    version: string,
    verifyingContract: Address,
    chainId: number
}

export async function createPermit(owner: Address, spender: Address, value: String, nonce: String, deadline: String, domain: IDomain) {

  const permit = { owner, spender, value, nonce, deadline }

  const Permit = [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ]

  const domainType = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ]

  const dataToSign : any = {
    types: {
      EIP712Domain: domainType,
      Permit: Permit
    },
    domain: domain,
    primaryType: "Permit",
    message: permit
  }

  return await signWithSignature(owner, dataToSign)

}



export async function createTransferPermit(owner: Address, to: Address, value: String, maxFee: String, domain: IDomain) {

  const permit = { to, amount: value, maxFee }

  const Permit = [
    { name: "to", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "maxFee", type: "uint256" },
  ]

  const domainType = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ]

  const dataToSign : any = {
    types: {
      EIP712Domain: domainType,
      Permit: Permit
    },
    domain: domain,
    primaryType: "Permit",
    message: permit
  }

  return await signWithSignature(owner, dataToSign)

}

const signWithSignature = async (owner: Address, dataToSign: any) => {

  const signature =  ""

  // const signature =  await (await viem.createClient(owner)).signTypedData(dataToSign)

  const pureSig = signature.replace("0x", "")

  const r = Buffer.from(pureSig.substring(0, 64), 'hex')
  const s = Buffer.from(pureSig.substring(64, 128), 'hex')
  const v = Buffer.from((parseInt(pureSig.substring(128, 130), 16)).toString());

  return {
    r: "0x" + r.toString('hex'), 
    s: "0x" + s.toString('hex'), 
    v: parseInt(v.toString()), 
    signature
  }
}


export const decodeSignature = (signature: string) => {

  const pureSig = signature.replace("0x", "")

  const r = Buffer.from(pureSig.substring(0, 64), 'hex')
  const s = Buffer.from(pureSig.substring(64, 128), 'hex')
  const v = Buffer.from((parseInt(pureSig.substring(128, 130), 16)).toString());

  return {
    r: "0x" + r.toString('hex'), 
    s: "0x" + s.toString('hex'), 
    v: parseInt(v.toString()), 
  }

}


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


  console.log(permitData, transferData)


  const { GaslessPaymaster } = await getPaymaster(paymasterAddress)

  console.log(await GaslessPaymaster.read.eip712Domain())

  console.log(await GaslessPaymaster.read.totalAssets())

  await GaslessPaymaster.write.transferGasless([permitData, transferData])

}


const getPaymaster = async (paymasterAddress: Address) => {

  const account = privateKeyToAccount(EXECUTOR_PRIVATE_KEY) 
 
  const client = createWalletClient({
    account,
    chain: hardhat,
    transport: http()
  })

  const GaslessPaymaster =  getContract({
    address: paymasterAddress,
    abi: GaslessPaymasterAbi,
    client: client,
  })

  return {GaslessPaymaster, client, account }
}

const stripAddress = (address: Address) => {
  return address.replace("0x", "")
}