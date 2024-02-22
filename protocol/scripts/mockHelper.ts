import { viem } from "hardhat"
import { Address } from "viem";

export const DECIMAL = 10n ** 38n

export async function deployPriceAggregator() {

    // All the price here are quoted in USD

    const decimal = 8;

    const BNBInitailPrice = 4283849655582n

    const USDCInitailPrice = 4283849655582n

    const bnbPriceFeeds = await viem.deployContract("MockV3Aggregator", [decimal, BNBInitailPrice])

    const usdcPriceFeeds = await viem.deployContract("MockV3Aggregator", [decimal, USDCInitailPrice])

    
    return { 
        bnbPriceFeeds, usdcPriceFeeds, decimal  
    }

}



export async function deployTokens() {

    const gho = await viem.deployContract("MockERC20", ["gho", "gho"])

    return { gho }
}

// export const calculatePrice = async (amount: bigint, baseCurrencyAddress: Address, quoteCurrencyAddress: Address) => {
    
//     const baseCurrency =  await viem.getContractAt("MockV3Aggregator", baseCurrencyAddress)
//     const quoteCurrency =  await viem.getContractAt("MockV3Aggregator", quoteCurrencyAddress)

//     const basePrice = await baseCurrency.read.latestAnswer()
//     const quotePrice = await quoteCurrency.read.latestAnswer()

//     return (basePrice * DECIMAL / quotePrice) * amount
// }


// export const selectPriceFeeds = (currency: CurrencyType) => {



//     return 0
// }