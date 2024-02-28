# Token Gas

## Problem Statement

Transfering tokens requires gas fees to be paid in the Native token of the blockchain in question, for example to Transfer USDC on Binance Smart Chain (BSC), requires that a user (EOA) pay gas fees in the native token of the BSC network which is BNB.

Token gas hopes to solve this by allowing users (EOA) pay for gas with the token available on their wallet. With Token Gas users (EOA), can transfer, swap and do many more with ERC20 tokens, without need to pay in native tokens, such as BNB.

## Description

Token Gas is a decentralized protocol that allows users(EOA), to pay for Gases using ERC20 tokens instead of Bnb. Token gas does this by taking advantage of ERC20 Permit function on ERC20 token.

Token Gas has basically three type of users:

- The User (EOA): This is the person that wants to transfer or swap their ERC20 token and want to pay in ERC20 token instead of Native token like BNB.
- The Liquidity Provider: These are people that lock up native token (BNB) into a Liquidity pool (ERC4626 Vault), this native token will be used to pay for gas fees. Liquidity Providers collect the transaction cost in the user provided token. For example a user wants to transfer 100USDC, and the gas fee is 0.0025 BNB, which is about 1 USDC as at the time of writing, so the Liquidity Providers covers the gas fees of 0.0025 BNB and collect the users (EOA) token 1 USDC plus some fees, therefore earning interests.
- The Executors: These are EOAs, anyone can become an executor, the role of executors are to send the offchain signatures to the blockchain. Executors initially pays for the transaction fee but are later refunded by the protocol with a small Fee.
  