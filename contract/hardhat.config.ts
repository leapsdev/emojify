import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-verify';
import '@openzeppelin/hardhat-upgrades';
import * as dotenv from 'dotenv';
import type { HardhatUserConfig } from 'hardhat/config';

dotenv.config();

// If not set, it uses Alchemy's default API key.
const providerApiKey = process.env.ALCHEMY_API_KEY || '';
// If not set, it uses the hardhat default account.
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY || '';
// If not set, it uses the default Etherscan API key.
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || '';
const baseScanApiKey = process.env.BASESCAN_API_KEY || '';

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  defaultNetwork: 'hardhat',
  networks: {
    // Local networks
    hardhat: {
      // forking: {
      //   url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
      //   enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      // },
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    // Test networks
    baseSepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
    // Mainnet and L2s
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: etherscanApiKey,
      base: baseScanApiKey,
      baseSepolia: baseScanApiKey,
    },
  },
};

export default config;
