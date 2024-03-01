import {loadFixture} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre, { viem } from "hardhat";
import { checksumAddress } from "viem";
import { bnbPriceFeeds } from "../../scripts/helper";


describe("GaslessFactory ", function () {

    async function deploy() {

        const publicClient = await viem.getPublicClient()

        const [user1, user2, user3, user4] = await hre.viem.getWalletClients();

        const mockERC20WithPermit = await hre.viem.deployContract("MockERC20WithPermit", ["mockUSDC", "mockUSDC"])

        const GaslessFactory = await hre.viem.deployContract("GaslessFactory", [
            mockERC20WithPermit.address,
            bnbPriceFeeds
        ])

        return {GaslessFactory, publicClient, mockERC20WithPermit, user1, user2, user3, user4}

    }

    describe("Deployment",  function () {

        it("Should deploy with the correct Info", async () => {

            const { GaslessFactory } = await loadFixture(deploy)

            expect(await GaslessFactory.read.bnbPriceFeeds()).to.be.equal(checksumAddress(bnbPriceFeeds))

        })

    })   

});
