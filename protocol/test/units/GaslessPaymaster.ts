import {loadFixture} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre, { viem } from "hardhat";
import { checksumAddress, parseEther } from "viem";
import { IDomain, createPermit, createTransferPermit} from "../../scripts/helper";
import { calculatePrice, deployPriceAggregator } from "../../scripts/mockHelper";

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

        const domain : IDomain = {
            name: await mockERC20WithPermit.read.name(),
            version: "1",
            verifyingContract: mockERC20WithPermit.address,
            chainId: 31337
        }

        const domainInfo = await GaslessPaymaster.read.eip712Domain()

        const domain2 : IDomain = {
            name: domainInfo[1],
            version: domainInfo[2],
            verifyingContract: domainInfo[4],
            chainId: Number(domainInfo[3])
        }
        
        return {GaslessPaymaster, publicClient, domain, domain2, mockERC20WithPermit, ...priceAggregator, user1, user2, user3, user4}
    }


    async function deployAndSupplyLiquidity() {

        const deployed = await deploy()

        const value = parseEther("1", "wei") as any

        await deployed.GaslessPaymaster.write.deposit([deployed.user1.account.address],{value});
        
        return { ...deployed, value }
    }


    async function transfer(deployed: any, maxFee: bigint = 801384861899n) {

        const {GaslessPaymaster, publicClient, domain, domain2, mockERC20WithPermit, user1, user3 }  = deployed 

        const value = parseEther("1", "wei") as any

        await deployed.GaslessPaymaster.write.deposit([deployed.user1.account.address],{value});
                
        const caller = user1

        const nonces =  await mockERC20WithPermit.read.nonces([user1.account.address])

        const amount = parseEther("1", "wei")

        const amountWithFee = amount + maxFee

        const deadline = BigInt("10000000000999")

        const balance = await mockERC20WithPermit.read.balanceOf([user1.account.address])

        const signatures = await createPermit(
            user1.account.address, 
            GaslessPaymaster.address, 
            (amount + maxFee).toString(),
            nonces.toString(), 
            deadline.toString(), 
            domain
        )

        const tx_signatures = await createTransferPermit(
            user1.account.address, 
            user3.account.address, 
            user1.account.address, 
            amount.toString(),
            (await GaslessPaymaster.read.nonces([user1.account.address])).toString(), 
            (maxFee).toString(),
            domain2
        )
        
        // Recipient Balance should be equal to zero before Transfer
        const recipientBalInitial = await mockERC20WithPermit.read.balanceOf([user3.account.address])

        const initialTokenBalOfProtocol = await mockERC20WithPermit.read.balanceOf([GaslessPaymaster.address]);

        const permitData: any = [
            user1.account.address,
            amount + maxFee,
            deadline,
            signatures.v,
            signatures.r,
            signatures.s
        ]

        const transferData: any = [
            user3.account.address,
            user1.account.address,
            amount,
            maxFee,
            tx_signatures.v,
            tx_signatures.r,
            tx_signatures.s
        ]

        const callerInitialBalance = await publicClient.getBalance({address: caller.account.address})

        await GaslessPaymaster.write.transfer([permitData, transferData])

        // Recipient Balance should be equal to amount before after
        expect(await mockERC20WithPermit.read.balanceOf([user3.account.address])).to.be.equal(recipientBalInitial + amount)

        // Amount sent should be deducted from Sender Balance
        //expect(await mockERC20WithPermit.read.balanceOf([user1.account.address])).to.be.lessThan(balance)

        //
        expect(Number(await publicClient.getBalance({address: user1.account.address}) - callerInitialBalance)).to.be.gt(Number(await GaslessPaymaster.read.callerFeeAmountInEther()))
        
        // check if the contract received the fee
        //expect(await mockERC20WithPermit.read.balanceOf([GaslessPaymaster.address])).to.be.greaterThan(initialTokenBalOfProtocol)    

        return { ...deployed }
    }


    describe("Deployment",  function () {

        it("Should deploy", async ( ) => {

            const { GaslessPaymaster, user1, mockERC20WithPermit } = await loadFixture(deploy)

            expect(await GaslessPaymaster.read.token()).to.be.equal(checksumAddress(mockERC20WithPermit.address))

            expect(await GaslessPaymaster.read.owner()).to.be.equal(checksumAddress(user1.account.address))

        })
        
    })


    describe("Adding Liquidity",  function () {

        it("Should Add Liquidity and Mint LP tokens to receiver", async ( ) => {

            const { GaslessPaymaster, user1, user2  } = await loadFixture(deploy)

            const value = parseEther("1", "wei") as any

            await GaslessPaymaster.write.deposit([user1.account.address],{value});

            expect(await GaslessPaymaster.read.totalAssets()).to.be.equal(value)
            
            expect(await GaslessPaymaster.read.balanceOf([user1.account.address])).to.be.equal(value - 1n)

            await GaslessPaymaster.write.deposit([user2.account.address],{value});

            expect(await GaslessPaymaster.read.totalAssets()).to.be.equal(2n * value)
            
            expect(await GaslessPaymaster.read.balanceOf([user2.account.address])).to.be.equal(value - 1n)

        })
        
    })

    describe("Transfers",  function () {

        it("Should be able to transfer tokens", async ( ) => {

            const { GaslessPaymaster, publicClient, user1, user2, user3, domain, domain2, mockERC20WithPermit } = await loadFixture(deployAndSupplyLiquidity)

            const caller = user1

            const nonces =  await mockERC20WithPermit.read.nonces([user1.account.address])

            const amount = parseEther("1", "wei")

            const maxFee = 801384861899n

            const amountWithFee = amount + maxFee

            const deadline = BigInt("10000000000999")

            const balance = await mockERC20WithPermit.read.balanceOf([user1.account.address])

            const signatures = await createPermit(
                user1.account.address, 
                GaslessPaymaster.address, 
                (amount + maxFee).toString(),
                nonces.toString(), 
                deadline.toString(), 
                domain
            )


            const tx_signatures = await createTransferPermit(
                user1.account.address, 
                user3.account.address, 
                user1.account.address, 
                amount.toString(),
                (await GaslessPaymaster.read.nonces([user1.account.address])).toString(), 
                (maxFee).toString(),
                domain2
            )
            
            // Recipient Balance should be equal to zero before Transfer
            expect(await mockERC20WithPermit.read.balanceOf([user3.account.address])).to.be.equal(0n)

            const permitData: any = [
                user1.account.address,
                amount + maxFee,
                deadline,
                signatures.v,
                signatures.r,
                signatures.s
            ]

            const transferData: any = [
                user3.account.address,
                user1.account.address,
                amount,
                maxFee,
                tx_signatures.v,
                tx_signatures.r,
                tx_signatures.s
            ]


            const callerInitialBalance = await publicClient.getBalance({address: caller.account.address})

            await GaslessPaymaster.write.transfer([permitData, transferData])

            // Recipient Balance should be equal to amount before after
            expect(await mockERC20WithPermit.read.balanceOf([user3.account.address])).to.be.equal(amount)

            // Amount sent should be deducted from Sender Balance
            //expect(await mockERC20WithPermit.read.balanceOf([user1.account.address])).to.be.equal(balance - amountWithFee)

            //
            expect(Number(await publicClient.getBalance({address: user1.account.address}) - callerInitialBalance)).to.be.gt(Number(await GaslessPaymaster.read.callerFeeAmountInEther()))
            
            // check if the contract received the fee
            //expect(await mockERC20WithPermit.read.balanceOf([GaslessPaymaster.address])).to.be.equal(maxFee)
        
            console.log(await GaslessPaymaster.read.totalAssets())
        })
        

        it("Funds in Liquidity Pool Should Increase with Each Transfer Grow", async ( ) => {

            const deployed = await loadFixture(deployAndSupplyLiquidity)

            await transfer(deployed)

            console.log(await deployed.GaslessPaymaster.read.totalAssets())

            await transfer(deployed)

            console.log(await deployed.GaslessPaymaster.read.totalAssets())

            await transfer(deployed)

            console.log(await deployed.GaslessPaymaster.read.totalAssets())

            await transfer(deployed)

            console.log(await deployed.GaslessPaymaster.read.totalAssets())

            await transfer(deployed)

            console.log(await deployed.GaslessPaymaster.read.totalAssets())
        })



        it("Should be able pay Transaction with estimated fee", async ( ) => {

            const deployed = await loadFixture(deployAndSupplyLiquidity)

            //const gasPrice = await deployed.GaslessPaymaster.estimateGas()

            const maxFee = await deployed.GaslessPaymaster.read.estimateFees([0])

            console.log(maxFee)

            await transfer(deployed, maxFee)
        })

    })


    describe("Withdrawals",  function () {

        it("Should be able to correctly estimate Withdrawals", async () => {

            const deployed = await loadFixture(deployAndSupplyLiquidity)

            expect(await deployed.GaslessPaymaster.read.getFundShare([deployed.value])).to.deep.equal([
                0n, deployed.value
            ])

            await transfer(deployed)

            const contractUSDBal = (await deployed.mockERC20WithPermit.read.balanceOf([deployed.GaslessPaymaster.address]))

            const smallAmount = parseEther("0.0001", "wei")

            expect(await deployed.GaslessPaymaster.read.getFundShare([smallAmount])).to.deep.equal([
                await calculatePrice(smallAmount, deployed.usdcPriceFeeds.address, deployed.bnbPriceFeeds.address), 0n
            ])

            expect(await deployed.GaslessPaymaster.read.getFundShare([deployed.value])).to.deep.equal([
                contractUSDBal - 1n, (deployed.value - await calculatePrice(contractUSDBal, deployed.bnbPriceFeeds.address, deployed.usdcPriceFeeds.address))
            ])

        })

        it("Should be able to withdraw BNB", async ( ) => {

            const deployed = await loadFixture(deployAndSupplyLiquidity)

            console.log(await deployed.GaslessPaymaster.read.balanceOf([deployed.user1.account.address]))
    

            await deployed.GaslessPaymaster.write.withdraw([
                deployed.value / 2n, 
                deployed.user2.account.address, 
                deployed.user1.account.address
            ])

            console.log(await deployed.GaslessPaymaster.read.balanceOf([deployed.user1.account.address]))
    
        
        })




        // it("Should be able to withdraw BNB", async ( ) => {

        //     const deployed = await loadFixture(deployAndSupplyLiquidity)

        //     await deployed.GaslessPaymaster.write.withdraw([deployed.value, deployed.user2.account.address])

        //     await transfer(deployed)

        //     const contractUSDBal = (await deployed.mockERC20WithPermit.read.balanceOf([deployed.GaslessPaymaster.address]))

        //     const smallAmount = parseEther("0.0001", "wei")

        //     expect(await deployed.GaslessPaymaster.read.getFundShare([smallAmount])).to.deep.equal([
        //         await calculatePrice(smallAmount, deployed.usdcPriceFeeds.address, deployed.bnbPriceFeeds.address), 0n
        //     ])

        //     expect(await deployed.GaslessPaymaster.read.getFundShare([deployed.value])).to.deep.equal([
        //         contractUSDBal - 1n, (deployed.value - await calculatePrice(contractUSDBal, deployed.bnbPriceFeeds.address, deployed.usdcPriceFeeds.address))
        //     ])
            
        // })

    })

});
