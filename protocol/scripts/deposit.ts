import { parseEther } from "viem";
import hre from "hardhat";
import { bnbPriceFeeds, daiAddress, daiPriceFeeds, swapRouterV3, usdcAddress, usdcPriceFeeds, userAddress } from "./helper";

async function main() {

  const value = parseEther("0.1", "wei")

  const GaslessFactory = await hre.viem.getContractAt("GaslessFactory", "0xdc0c61e97ffcd248dd9b4ebab4dbb5c8d0b62da0")

  const values = await GaslessFactory.read.getPoolAddresses()

  console.log("Gasless Factory: ", GaslessFactory.address)

  // const USDCPaymaster = await hre.viem.getContractAt("GaslessPaymaster", values[0].payMaster)

  // await USDCPaymaster.write.deposit([userAddress], { value: value })

  // const DAIPaymaster = await hre.viem.getContractAt("GaslessPaymaster", values[1].payMaster)

  // await DAIPaymaster.write.deposit([userAddress], { value: value })

  console.log(values)
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
