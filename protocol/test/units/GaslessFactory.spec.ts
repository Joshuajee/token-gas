import {loadFixture} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre, { viem } from "hardhat";
import { checksumAddress, parseEther } from "viem";
import { IDomain, createPermit} from "../../scripts/helper";
import { calculatePrice, deployPriceAggregator } from "../../scripts/mockHelper";

describe("GaslessFactory ", function () {

    async function deploy() {

        const publicClient = await viem.getPublicClient()

        const [user1, user2, user3, user4] = await hre.viem.getWalletClients();

        const priceAggregator = await deployPriceAggregator()

        const mockERC20WithPermit = await hre.viem.deployContract("MockERC20WithPermit", ["mockUSDC", "mockUSDC"])

        const GaslessFactory = await hre.viem.deployContract("GaslessFactory", [
            mockERC20WithPermit.address,
            priceAggregator.bnbPriceFeeds.address
        ])

        return {GaslessFactory, publicClient, mockERC20WithPermit, ...priceAggregator, user1, user2, user3, user4}

    }



    describe("Deployment",  function () {

        it("Should deploy with the correct Info", async () => {

            const { GaslessFactory, bnbPriceFeeds } = await loadFixture(deploy)

            expect(await GaslessFactory.read.bnbPriceFeeds()).to.be.equal(checksumAddress(bnbPriceFeeds.address))

        })

       
    })



   

});
