import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre, { viem } from "hardhat";
import { Address, checksumAddress, parseEther } from "viem";

describe("AdsPaymaster ", function () {

    async function deploy() {
        const publicClient = await viem.getPublicClient()
        const [user1, user2, user3, user4] = await hre.viem.getWalletClients();
        const AdsPaymaster = await hre.viem.deployContract("AdsPaymaster")
        const mockUSDT = await hre.viem.deployContract("MockERC20", ["mockUSDT", "mockUSDT"])
        return {AdsPaymaster, publicClient, mockUSDT, user1, user2, user3, user4}
    }

    async function createCampaign() {
        const _deploy = await deploy()
        const amount1 = parseEther("1", "wei")
        const maxPerPerView1 = parseEther("0.0000001", "wei")
        await _deploy.AdsPaymaster.write.addExecutor([_deploy.user1.account.address])
        await _deploy.AdsPaymaster.write.createCampaign([_deploy.user1.account.address, maxPerPerView1], { value: amount1})
        return { ..._deploy }
    }

    async function signer(address: Address) {
        return await viem.getWalletClient(address)
    }

    describe("Deployment",  function () {

        it("Should deploy", async ( ) => {

            const { AdsPaymaster, user1 } = await loadFixture(deploy)

            expect(await AdsPaymaster.read.owner()).to.be.equal(checksumAddress(user1.account.address))

        })
        
    })

    describe("Campaign",  function () {

        it("should create and fund campaign", async ( ) => {

            const { AdsPaymaster, publicClient, user1, user2 } = await loadFixture(deploy)

            const amount1 = parseEther("1", "wei")

            const maxPerPerView1 = parseEther("0.0000001", "wei")

            expect(await AdsPaymaster.read.campaignId()).to.be.equal(1n)

            await AdsPaymaster.write.createCampaign([user1.account.address, maxPerPerView1], { value: amount1})

            expect(await AdsPaymaster.read.campaignId()).to.be.equal(2n)

            expect(await AdsPaymaster.read.campaigns([1n])).deep.be.equal([
                checksumAddress(user1.account.address),
                maxPerPerView1,
                amount1
            ])

            expect(await publicClient.getBalance({ address: AdsPaymaster.address})).to.be.equal(amount1)

            const amount2 = parseEther("10", "wei")

            const maxPerPerView2 = parseEther("0.00001", "wei")

            await AdsPaymaster.write.createCampaign([user2.account.address, maxPerPerView2], { value: amount2})

            expect(await AdsPaymaster.read.campaignId()).to.be.equal(3n)

            expect(await AdsPaymaster.read.campaigns([2n])).deep.be.equal([
                checksumAddress(user2.account.address),
                maxPerPerView2,
                amount2
            ])

            expect(await publicClient.getBalance({ address: AdsPaymaster.address})).to.be.equal(amount1 + amount2)

        })
        
    })


    describe("Execute Order",  function () {

        it("should transfer ERC20 tokens", async ( ) => {

            const { AdsPaymaster, mockUSDT, user1, user2 } = await loadFixture(createCampaign)

            const amount1 = parseEther("1", "wei")

            console.log(await mockUSDT.read.balanceOf([user1.account.address]))

            expect(await mockUSDT.read.balanceOf([user2.account.address])).to.be.equal(0n)

            const transferSignature = (await (await signer(user1.account.address)).signMessage(
                {
                    message:`transfer(address,uint256),${user2.account.address},${amount1}`
                })
            )

            console.log(`transfer(address,uint256),${user2.account.address},${amount1}`)

            await (await signer(user2.account.address)).sendTransaction({
                to: mockUSDT.address,
                data: transferSignature
            })

            console.log(transferSignature)


            // console.log("====", user1.account.address)

            // console.log("++++++", mockUSDT.address)

            // console.log(await mockUSDT.read.balanceOf([user1.account.address]))

            // // console.log(await AdsPaymaster.read.encodeWithSignature([user2.account.address, amount1]))

            // await AdsPaymaster.write.executeOrder([1n ,mockUSDT.address, await AdsPaymaster.read.encodeWithSignature([user2.account.address, amount1])])


            // console.log(user1.account.address)


            // expect(await mockUSDT.read.balanceOf([user2.account.address])).to.be.equal(amount1)

        })
        
    })



});
