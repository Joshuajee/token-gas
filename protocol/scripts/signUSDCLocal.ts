import { parseEther } from "viem";
import hre from "hardhat";
import { IDomain, createPermit, createTransferPermit, usdcAddress, usdcPaymaster } from "./helper";

const user = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const receiver = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

const nonce = "0"
const amount = parseEther("1000", "wei")
const maxFee = parseEther("1", "wei")
const amountWithFee = (amount + maxFee).toString()

console.log(amount)
console.log(maxFee)

const deadline = BigInt("100000000000000")

async function main() {

  const USDCPaymaster = await hre.viem.getContractAt("GaslessPaymaster", usdcPaymaster)

  const USDC = await hre.viem.getContractAt("MockERC20WithPermit", usdcAddress)

  await USDCPaymaster.write.deposit(["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"])


  const domain : IDomain = {
    name: await USDC.read.name(),
    version: "1",
    verifyingContract: usdcAddress,
    chainId: 31337
  }

  const domainInfo = await USDCPaymaster.read.eip712Domain()

  const domain2 : IDomain = {
    name: domainInfo[1],
    version: domainInfo[2],
    verifyingContract: usdcPaymaster,
    chainId: Number(domainInfo[5])
  }

  const signatures = await createPermit(
    user, 
    usdcPaymaster, 
    amountWithFee,
    nonce, 
    deadline.toString(), 
    domain
  )

  const tx_signatures = await createTransferPermit(
    user, 
    receiver,  
    amount.toString(),
    maxFee.toString(),
    domain2
  )

  console.log({signatures, tx_signatures})

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
