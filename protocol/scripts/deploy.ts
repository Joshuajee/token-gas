import { formatEther, parseEther, zeroAddress } from "viem";
import hre from "hardhat";
import { deployPriceAggregator } from "./mockHelper";

async function main() {

  const { bnbPriceFeeds, usdcPriceFeeds, daiPriceFeeds } = await deployPriceAggregator()

  const mockUSDC = await hre.viem.deployContract("MockERC20WithPermit", ["USDC", "USDC"])

  const mockDAI = await hre.viem.deployContract("MockERC20WithPermit", ["DAI", "DAI"])

  const GaslessFactory = await hre.viem.deployContract("GaslessFactory", [
    zeroAddress,
    bnbPriceFeeds.address
  ])

  await GaslessFactory.write.createPool([mockUSDC.address, usdcPriceFeeds.address])

  await GaslessFactory.write.createPool([mockDAI.address, daiPriceFeeds.address])

  const values = await GaslessFactory.read.getPoolAddresses()

  console.log("Gasless Factory: ", GaslessFactory.address)

  console.log(values)
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
