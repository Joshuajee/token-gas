import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY  = String(process.env.PRIVATE_KEY)

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  abiExporter: [
    {
      path: "../client/src/abi",
      pretty: false,
      runOnCompile: true,
      only: ["GaslessFactory", "GaslessPaymaster", "MockERC20WithPermit"],
    },
  ],
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ["GaslessFactory", "GaslessPaymaster"],
  },
  networks: {
    // hardhat: {
    //   forking: {
    //     enabled: true,
    //     url: "https://go.getblock.io/9d50c51d7b8744e1bba0dded3cdb360f"
    //   },
    //   chainId: 97
    // },
    bscTestnet:{
      url: "https://go.getblock.io/9d50c51d7b8744e1bba0dded3cdb360f",
      accounts: [PRIVATE_KEY]
    },
    // bscFork: {
    //   forking: {
    //     enabled: true,
    //     url: "https://go.getblock.io/9d50c51d7b8744e1bba0dded3cdb360f"
    //   },
    //   chainId: 97
    // },

  }
};

export default config;
