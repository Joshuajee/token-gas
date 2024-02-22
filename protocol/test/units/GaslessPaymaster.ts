import {loadFixture} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre, { viem } from "hardhat";
import { checksumAddress, parseEther } from "viem";
import { IDomain, createPermit} from "../../scripts/helper";
import { deployPriceAggregator } from "../../scripts/mockHelper";

describe("GaslessPaymaster ", function () {

    async function deploy() {

        const publicClient = await viem.getPublicClient()

        const [user1, user2, user3, user4] = await hre.viem.getWalletClients();

        const priceAggregator = await deployPriceAggregator()

        const mockERC20WithPermit = await hre.viem.deployContract("MockERC20WithPermit", ["mockUSDC", "mockUSDC"])

        const GaslessPaymaster = await hre.viem.deployContract("GaslessPaymaster", [
            mockERC20WithPermit.address, mockERC20WithPermit.address,
            priceAggregator.bnbPriceFeeds.address, priceAggregator.usdcPriceFeeds.address
        ])
        
        return {GaslessPaymaster, publicClient, mockERC20WithPermit, ...priceAggregator, user1, user2, user3, user4}
    }


    async function deployAndSupplyLiquidity() {

        const deployed = await deploy()

        await deployed.GaslessPaymaster.write.deposit({value: parseEther("1", "wei")});
        
        return { ...deployed }
    }


    describe("Deployment",  function () {

        it("Should deploy", async ( ) => {

            const { GaslessPaymaster, user1, mockERC20WithPermit } = await loadFixture(deploy)

            expect(await GaslessPaymaster.read.token()).to.be.equal(checksumAddress(mockERC20WithPermit.address))

            expect(await GaslessPaymaster.read.owner()).to.be.equal(checksumAddress(user1.account.address))

        })
        
    })

    describe("Transfers",  function () {

        it("should be able to transfer tokens", async ( ) => {

            const { GaslessPaymaster, publicClient, user1, user2, user3, mockERC20WithPermit } = await loadFixture(deployAndSupplyLiquidity)

            const caller = user2

            const callerBalance = await publicClient.getBalance({address: caller.account.address})

            const nonces =  await mockERC20WithPermit.read.nonces([user1.account.address])

            const domain : IDomain = {
                name: await mockERC20WithPermit.read.name(),
                version: "1",
                verifyingContract: mockERC20WithPermit.address,
                chainId: 31337
            }

            const amount = parseEther("1", "wei")

            const deadline = BigInt("10000000000999")

            const balance = await mockERC20WithPermit.read.balanceOf([user1.account.address])

            const signatures = await createPermit(
                user1.account.address, 
                GaslessPaymaster.address, 
                amount.toString(),
                nonces.toString(), 
                deadline.toString(), 
                domain
            )
            
            // Recipient Balance should be equal to zero before Transfer
            expect(await mockERC20WithPermit.read.balanceOf([user3.account.address])).to.be.equal(0n)

            const permitData: any = [
                user1.account.address,
                BigInt(amount),
                deadline,
                signatures.v,
                signatures.r,
                signatures.s
            ]

            const transferData: any = [
                user3.account.address,
                user1.account.address,
                100000000000n,
                28,
                signatures.r,
                signatures.s
            ]

            await GaslessPaymaster.write.transfer([permitData, transferData])

            // Recipient Balance should be equal to amount before after
            expect(await mockERC20WithPermit.read.balanceOf([user3.account.address])).to.be.equal(amount)

            // Amount sent should be deducted from Sender Balance
            expect(await mockERC20WithPermit.read.balanceOf([user1.account.address])).to.be.equal(balance - amount)

            console.log({callerBalance})

            console.log(await publicClient.getBalance({address: user1.account.address}))
        })
        
    })

});
