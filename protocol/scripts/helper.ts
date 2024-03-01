import { viem } from "hardhat";
import { Address, getContract, parseEther } from "viem";
import { utils } from 'ethers'
import { BigNumber } from 'ethers'
import PancakeV3Factory from "../abi/PancakeV3Factory.json"

export const bnbPriceFeeds =  "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"
export const usdcPriceFeeds = "0x90c069C4538adAc136E051052E14c1cD799C41B7"
export const daiPriceFeeds =  "0xE4eE17114774713d2De0eC0f035d4F7665fc025D"
export const swapRouterV3 =   "0x1b81D678ffb9C0263b24A97847620C99d213eB14"
export const factoryV3 =      "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865"
export const NFTPMangerV3 =   "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364"

export const DECIMAL = parseEther("1", "wei")

export const MaxUint128 = BigNumber.from(2).pow(128).sub(1)

export enum FeeAmount {
  LOW = 500,
  MEDIUM = 2500,
  HIGH = 10000,
}

export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUM]: 50,
  [FeeAmount.HIGH]: 200,
}

export const maxFee = 2537417792958679490n

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

    const signature =  await (await viem.getWalletClient(owner)).signTypedData(dataToSign)

    console.log(await (await viem.getWalletClient(owner)).account.address, "----")

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

export const setSigner = async (account: Address) => {
    return (await viem.getWalletClient(account))
}


export const createPoolPancakeSwap = async (tokenA: Address, tokenB: Address) => {

    const nFTPMangerV3 = await viem.getContractAt("IPoolInitializer", NFTPMangerV3)

    const hash = await nFTPMangerV3.write.createAndInitializePoolIfNecessary([tokenA, tokenB, FeeAmount.MEDIUM, 10000000000000n])

    console.log(hash)
}

export const addLiquidityPancakeSwap = async (tokenA: Address, tokenB: Address, amountADesired: bigint, amountBDesired: bigint, to: Address) => {

    const amountAMin = amountADesired / 10n

    const amountBMin = amountBDesired / 10n

    const deadline = Date.now()

    const nFTPMangerV3 = await viem.getContractAt("INonfungiblePositionManager", NFTPMangerV3)

    const TokenA = await viem.getContractAt("MockERC20WithPermit", tokenA)

    const TokenB = await viem.getContractAt("MockERC20WithPermit", tokenB)

    await TokenA.write.approve([swapRouterV3, amountADesired])

    await TokenB.write.approve([swapRouterV3, amountBDesired])

    await nFTPMangerV3.write.mint([[
        tokenA, tokenB, FeeAmount.MEDIUM, 0, 100000,  
        amountADesired, amountBDesired, amountAMin, amountBMin,
        to, deadline
    ]])


    

}

const ADDR_SIZE = 20
const FEE_SIZE = 3
const OFFSET = ADDR_SIZE + FEE_SIZE
const DATA_SIZE = OFFSET + ADDR_SIZE

export function encodePath(path: string[], fees: FeeAmount[]): string {

    if (path.length != fees.length + 1) {
        throw new Error('path/fee lengths do not match')
    }

    let encoded = '0x'
    for (let i = 0; i < fees.length; i++) {
        // 20 byte encoding of the address
        encoded += path[i].slice(2)
        // 3 byte encoding of the fee
        encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, '0')
    }
    // encode the final token
    encoded += path[path.length - 1].slice(2)

    return encoded.toLowerCase()

}

function decodeOne(tokenFeeToken: Buffer): [[string, string], number] {
    // reads the first 20 bytes for the token address
    const tokenABuf = tokenFeeToken.slice(0, ADDR_SIZE)
    const tokenA = utils.getAddress('0x' + tokenABuf.toString('hex'))

    // reads the next 2 bytes for the fee
    const feeBuf = tokenFeeToken.slice(ADDR_SIZE, OFFSET)
    const fee = feeBuf.readUIntBE(0, FEE_SIZE)

    // reads the next 20 bytes for the token address
    const tokenBBuf = tokenFeeToken.slice(OFFSET, DATA_SIZE)
    const tokenB = utils.getAddress('0x' + tokenBBuf.toString('hex'))

    return [[tokenA, tokenB], fee]
}

export function decodePath(path: string): [string[], number[]] {

    let data = Buffer.from(path.slice(2), 'hex')

    let tokens: string[] = []
    let fees: number[] = []
    let i = 0
    let finalToken: string = ''
    while (data.length >= DATA_SIZE) {
        const [[tokenA, tokenB], fee] = decodeOne(data)
        finalToken = tokenB
        tokens = [...tokens, tokenA]
        fees = [...fees, fee]
        data = data.slice((i + 1) * OFFSET)
        i += 1
    }
    tokens = [...tokens, finalToken]

    return [tokens, fees]
}



export const calculatePrice = async (amount: bigint, baseCurrencyAddress: Address, quoteCurrencyAddress: Address) => {
    
    const baseCurrency =  await viem.getContractAt("MockV3Aggregator", baseCurrencyAddress)
    
    const quoteCurrency =  await viem.getContractAt("MockV3Aggregator", quoteCurrencyAddress)

    const basePrice = await baseCurrency.read.latestAnswer()
    
    const quotePrice = await quoteCurrency.read.latestAnswer()

    return (amount * ((quotePrice * DECIMAL) / basePrice)) / DECIMAL
}
