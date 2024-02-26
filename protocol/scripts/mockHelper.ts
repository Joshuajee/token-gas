import { viem } from "hardhat"
import { Address } from "viem";

export const DECIMAL = 10n ** 18n

export async function deployPriceAggregator() {

    // All the price here are quoted in USD

    const decimal = 8;

    const BNBInitailPrice = 38155749243n

    const USDCInitailPrice = 100004660n

    const bnbPriceFeeds = await viem.deployContract("MockV3Aggregator", [decimal, BNBInitailPrice])

    const usdcPriceFeeds = await viem.deployContract("MockV3Aggregator", [decimal, USDCInitailPrice])

    const daiPriceFeeds = await viem.deployContract("MockV3Aggregator", [decimal, USDCInitailPrice])

    return { 
        bnbPriceFeeds, usdcPriceFeeds, daiPriceFeeds, decimal  
    }

}


export const calculatePrice = async (amount: bigint, baseCurrencyAddress: Address, quoteCurrencyAddress: Address) => {
    
    const baseCurrency =  await viem.getContractAt("MockV3Aggregator", baseCurrencyAddress)
    const quoteCurrency =  await viem.getContractAt("MockV3Aggregator", quoteCurrencyAddress)

    const basePrice = await baseCurrency.read.latestAnswer()
    const quotePrice = await quoteCurrency.read.latestAnswer()

    return (basePrice * amount / quotePrice) 
}


// export const selectPriceFeeds = (currency: CurrencyType) => {



//     return 0
// }