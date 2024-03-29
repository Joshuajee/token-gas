import { parseEther } from "viem";
import hre from "hardhat";
import { bnbPriceFeeds, daiAddress, daiPriceFeeds, swapRouterV3, transferTokens, usdcAddress, usdcPriceFeeds } from "./helper";

const user = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const receiver = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

async function main() {

  const value = parseEther("100", "wei")

  const GaslessFactory = await hre.viem.deployContract("GaslessFactory", [
    swapRouterV3,
    bnbPriceFeeds
  ])

  await GaslessFactory.write.createPool([usdcAddress, usdcPriceFeeds])

  await GaslessFactory.write.createPool([daiAddress, daiPriceFeeds])

  const values = await GaslessFactory.read.getPoolAddresses()

  console.log("Gasless Factory: ", GaslessFactory.address)

  const USDCPaymaster = await hre.viem.getContractAt("GaslessPaymaster", values[0].payMaster)

  await USDCPaymaster.write.deposit([user], { value: value })

  const DAIPaymaster = await hre.viem.getContractAt("GaslessPaymaster", values[1].payMaster)

  await DAIPaymaster.write.deposit([user], { value: value })

  console.log(values)

  await transferTokens()

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
