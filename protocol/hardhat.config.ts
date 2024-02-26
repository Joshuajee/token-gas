import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";

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
    hardhat: {
      forking: {
        enabled: true,
        url: "https://go.getblock.io/fa9c3b8a855d4dd5b786ece5594b8190",
      },
      chainId: 97,
    },
  },
};

export default config;
