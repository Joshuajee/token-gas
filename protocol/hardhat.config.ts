import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
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
