import { viem } from "hardhat";
import { Address } from "viem";

export const bnbPriceFeeds = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"
export const usdcPriceFeeds = "0x90c069C4538adAc136E051052E14c1cD799C41B7"
export const daiPriceFeeds = "0xE4eE17114774713d2De0eC0f035d4F7665fc025D"
export const swapRouterV3 = "0x1b81D678ffb9C0263b24A97847620C99d213eB14"

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
