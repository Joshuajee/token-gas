import hre from "hardhat";


async function main() {

    const mockUSDC = await hre.viem.deployContract("MockERC20WithPermit", ["USDC", "USDC"])

    const mockDAI = await hre.viem.deployContract("MockERC20WithPermit", ["DAI", "DAI"])

    console.log("USDC: ", mockUSDC.address)

    console.log("DAI: ",  mockDAI.address)
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
