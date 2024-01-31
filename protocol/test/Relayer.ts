import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre, { viem } from "hardhat";
import { checksumAddress, parseEther } from "viem";

describe("Relayer ", function () {

    async function deploy() {
        const publicClient = await viem.getPublicClient()
        const [user1, user2, user3, user4] = await hre.viem.getWalletClients();
        const relayer = await hre.viem.deployContract("Relayer")
        return {relayer, publicClient, user1, user2, user3, user4}
    }

    describe("Deployment",  function () {

        it("Should deploy", async ( ) => {

            const { relayer, user1 } = await loadFixture(deploy)

            expect(await relayer.read.owner()).to.be.equal(checksumAddress(user1.account.address))

        })
        
    })

    describe("Campaign",  function () {

        it("should create and fund campaign", async ( ) => {

            const { relayer, publicClient, user1, user2 } = await loadFixture(deploy)

            const amount1 = parseEther("1", "wei")

            const maxPerPerView1 = parseEther("0.0000001", "wei")

            expect(await relayer.read.campaignId()).to.be.equal(1n)

            await relayer.write.createCampaign([user1.account.address, maxPerPerView1], { value: amount1})

            expect(await relayer.read.campaignId()).to.be.equal(2n)

            expect(await relayer.read.campaigns([1n])).deep.be.equal([
                checksumAddress(user1.account.address),
                maxPerPerView1,
                amount1
            ])

            expect(await publicClient.getBalance({ address: relayer.address})).to.be.equal(amount1)

            const amount2 = parseEther("10", "wei")

            const maxPerPerView2 = parseEther("0.00001", "wei")

            await relayer.write.createCampaign([user2.account.address, maxPerPerView2], { value: amount2})

            expect(await relayer.read.campaignId()).to.be.equal(3n)

            expect(await relayer.read.campaigns([2n])).deep.be.equal([
                checksumAddress(user2.account.address),
                maxPerPerView2,
                amount2
            ])

            expect(await publicClient.getBalance({ address: relayer.address})).to.be.equal(amount1 + amount2)

        })
        
    })



});
