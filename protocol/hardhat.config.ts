import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import 'solidity-coverage'
import dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = String(process.env.PRIVATE_KEY);

const BSC_RPC = String(process.env.BSC_RPC);

const BSC_SCAN = String(process.env.BSC_SCAN);

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
      {
        version: "0.7.6",
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
      only: ["GaslessFactory", "GaslessPaymaster", "MockERC20WithPermit", "IPancakeV3PoolState", "IPancakeV3Factory"],
    },
  ],
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ["GaslessFactory", "GaslessPaymaster"],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        enabled: true,
        url: BSC_RPC,
        blockNumber: 38205282,
      },
    },
    bscTestnet: {
      url: BSC_RPC,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: BSC_SCAN
  },
};

export default config;
