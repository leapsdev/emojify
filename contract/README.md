# EmojiChat Contract

Upgradeable ERC1155 token using UUPS pattern

## Features

- Compliant with ERC1155 token standard
- Implemented with UUPS upgrade pattern
- Includes pause functionality
- Records the first minter of each token

## Contract Structure

- `EmojiChat.sol` - Initial implementation
- `EmojiChatV2.sol` - Upgraded implementation (with additional features)
- `contracts/proxy/ERC1967Proxy.sol` - Import of OpenZeppelin's ERC1967Proxy

## Deployment Instructions

### Requirements

- Node.js
- npm
- Hardhat

### Installation

```bash
# Install dependencies
npm install
```

### Environment Setup

This project uses `dotenv` to manage environment variables. To set up your environment:

1. Copy the example environment file to create your own:

```bash
cp .env.example .env
```

2. Edit the `.env` file and add your values:

```
# Alchemy API Key
ALCHEMY_API_KEY=your_alchemy_api_key

# Private key of the deployer wallet
DEPLOYER_PRIVATE_KEY=your_private_key_without_0x_prefix

# Etherscan API Key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

These environment variables will be used by the Hardhat configuration for connecting to networks and verifying contracts.

### Available Scripts

The following npm scripts are available in the project:

```bash
# Run tests
npm run test

# Compile contracts
npm run compile

# Deploy contracts using Ignition
npm run deploy

# Upgrade contracts using Ignition
npm run upgrade

# Verify contract
npm run verify <network> <proxy-address>
```

### Running Tests

```bash
# Run tests
npx hardhat test
```

### Hardhat Ignition Deployment

This project uses Hardhat Ignition to deploy contracts.

#### Initial Deployment

To deploy the EmojiChat contract with UUPS upgrade pattern:

```bash
# Deploy contracts
npx hardhat ignition deploy ./ignition/modules/DeployEmojiChat.ts --network <network-name>
```

This will:
1. Deploy the EmojiChat implementation contract
2. Deploy the ERC1967Proxy
3. Call the initialize function

#### Contract Upgrade

To upgrade the contract to V2:

```bash
# Upgrade contract
npx hardhat ignition deploy ./ignition/modules/UpgradeEmojiChat.ts --network <network-name>
```

This will:
1. Deploy the EmojiChatV2 implementation contract
2. Update the proxy to point to the new implementation

### Contract Verification

This project uses the `@nomicfoundation/hardhat-verify` plugin to verify contract source code on block explorers like Etherscan.

#### Setup

Add your Etherscan API key to your `.env` file as described in the Environment Setup section.

#### Verify Contract

After deployment, verify your contract with:

```bash
# For implementation contract
npx hardhat verify --network <network> <implementation-address>

# For contracts with constructor arguments
npx hardhat verify --network <network> <contract-address> <constructor-arg1> <constructor-arg2>

# For more complex constructor arguments
npx hardhat verify --network <network> --constructor-args arguments.js <contract-address>
```

For verifying the proxy implementation, you'll need to verify the implementation contract address, not the proxy address.

## Additional Features in V2

EmojiChatV2 includes the following additional features:

- Token name and symbol settings
- Tracking of popular tokens
- Function to retrieve the most popular token
