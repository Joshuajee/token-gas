import { parseEther } from "viem";
import hre, { viem } from "hardhat";
import { addLiquidityPancakeSwap, bnbPriceFeeds, createPoolPancakeSwap, daiPriceFeeds, swapRouterV3, usdcPriceFeeds } from "./helper";

const user = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const receiver = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

async function main() {

  const publicClient = await viem.getPublicClient()

  const value = parseEther("100", "wei")

  const mockUSDC = await hre.viem.deployContract("MockERC20WithPermit", ["USDC", "USDC"])

  const mockDAI = await hre.viem.deployContract("MockERC20WithPermit", ["DAI", "DAI"])

  const daiAddress = mockDAI.address
  const usdcAddress = mockUSDC.address

  const GaslessFactory = await hre.viem.deployContract("GaslessFactory", [
    swapRouterV3,
    bnbPriceFeeds
  ])

  await GaslessFactory.write.createPool([mockUSDC.address, usdcPriceFeeds])

  await GaslessFactory.write.createPool([mockDAI.address, daiPriceFeeds])

  const values = await GaslessFactory.read.getPoolAddresses()

  console.log("Gasless Factory: ", GaslessFactory.address)

  const USDCPaymaster = await hre.viem.getContractAt("GaslessPaymaster", values[0].payMaster)

  await USDCPaymaster.write.deposit([user], { value: value })

  const DAIPaymaster = await hre.viem.getContractAt("GaslessPaymaster", values[1].payMaster)

  await DAIPaymaster.write.deposit([user], { value: value })


  console.log(values)

  console.log(await mockUSDC.read.balanceOf(["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"]))

  console.log(await USDCPaymaster.read.eip712Domain())

  console.log(await mockUSDC.read.eip712Domain())

  const amount = parseEther("10000000", "wei")

  await createPoolPancakeSwap(usdcAddress, daiAddress)

  //await addLiquidityPancakeSwap(usdcAddress, daiAddress, amount, amount, user)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
