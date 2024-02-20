import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre, { viem } from "hardhat";
import { Address, checksumAddress, parseEther } from "viem";

describe("GaslessPaymaster ", function () {

    async function deploy() {
        const publicClient = await viem.getPublicClient()
        const [user1, user2, user3, user4] = await hre.viem.getWalletClients();
        const mockERC20WithPermit = await hre.viem.deployContract("MockERC20WithPermit", ["mockUSDC", "mockUSDC"])
        const GaslessPaymaster = await hre.viem.deployContract("GaslessPaymaster", [mockERC20WithPermit.address])
        
        return {GaslessPaymaster, publicClient, mockERC20WithPermit, user1, user2, user3, user4}
    }


    describe("Deployment",  function () {

        it("Should deploy", async ( ) => {

            const { GaslessPaymaster, user1, mockERC20WithPermit } = await loadFixture(deploy)

            expect(await GaslessPaymaster.read.token()).to.be.equal(mockERC20WithPermit.address)

            expect(await GaslessPaymaster.read.owner()).to.be.equal(checksumAddress(user1.account.address))

        })
        
    })

    describe("Transfers",  function () {

        it("should be able to transfer tokens", async ( ) => {

        })
        
    })

});
