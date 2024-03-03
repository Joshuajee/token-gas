import hre, { viem } from "hardhat";
import { Address, createTestClient, http, keccak256, parseEther } from "viem";
import erc20Abi from '../abi/ERC20.json';
import { hardhat } from 'viem/chains'
import { utils } from 'ethers'



export const deployer = "0x5103BC779fdd4799Cfd5efC6ee827F7B1D57789B"

export const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

export const usdcAddress = "0x53524045cac3154b466f379797cd17a5019f4389"
export const daiAddress  =  "0x38d3b8c94f573c71d04a3f0f4151c37bc29b61c2"

export const bnbPriceFeeds =  "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"
export const usdcPriceFeeds = "0x90c069C4538adAc136E051052E14c1cD799C41B7"
export const daiPriceFeeds =  "0xE4eE17114774713d2De0eC0f035d4F7665fc025D"
export const swapRouterV3 =   "0x1b81D678ffb9C0263b24A97847620C99d213eB14"
export const factoryV3 =      "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865"
export const NFTPMangerV3 =   "0x427bF5b37357632377eCbEC9de3626C71A5396c1"
export const SwapRouterV2 =   "0xD99D1c33F9fC3444f8101754aBC46c52416550D1"


export const usdcPaymaster = "0x07FaBe0FEF648b719b0E9EF8302Cd3037693F587"
export const daiPaymaster  = "0xA1C9931d3695CC5fec1EE0B94D40EE32Ae12aa76"


export const DECIMAL = parseEther("1", "wei")


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

export const testClient = createTestClient({
    chain: hardhat,
    mode: "hardhat",
    transport: http(), 
})

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


export async function createSwapPermit(owner: Address, to: Address, path: string, amountIn: String, amountOutMin: string, maxFee: String, domain: IDomain) {

    const pathHash = keccak256(path as Address)

    const permit = { pathHash, to, amountIn, amountOutMinimum: amountOutMin, maxFee }

    const Permit = [
      { name: "pathHash", type: "bytes32" },
      { name: "to", type: "address" },
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMinimum", type: "uint256" },
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

export const getSigner = async (account: Address) => {
    return (await viem.getWalletClient(account))
}

export const transferTokens = async () => {

    const amount = parseEther("5000000", "wei")

    // const USDC = await viem.getContractAt("MockERC20WithPermit", usdcAddress);

    // const DAI  = await viem.getContractAt("MockERC20WithPermit", daiAddress);

    await testClient.impersonateAccount({ 
        address: deployer
    })

    const walletClient =  await viem.getWalletClient(deployer)

    await testClient.setBalance({ 
        address: deployer,
        value: parseEther('500000')
    })

    await walletClient.writeContract({
        account: deployer,
        address: usdcAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [userAddress, amount]
    })

    await walletClient.writeContract({
        account: deployer,
        address: daiAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [userAddress, amount]
    })

    await testClient.stopImpersonatingAccount({ 
        address: deployer
    })

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
