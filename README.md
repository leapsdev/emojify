# Emojify 🎨💬

A Web3 chat application where communication happens exclusively through emojis. Users can create their own custom emojis, mint them as NFTs, and trade them on the marketplace.

**Production URL**: [https://emoji-chat-leaps.vercel.app](https://emoji-chat-leaps.vercel.app) / [https://emojify.club](https://emojify.club)  
**Development URL**: [https://emoji-chat-develop.vercel.app](https://emoji-chat-develop.vercel.app)

## Features 🚀

### Authentication System
- **Privy Web3 Authentication**: Support for wallet, email, and social login
- **Multi-Wallet Management**: Connect and switch between multiple wallets  
- **Farcaster Mini App Integration**: Automatic authentication in Farcaster Mini App environment
- **Quick Auth Support**: Seamless authentication using Farcaster SDK
- **Firebase Authentication**: Server-side verification with custom tokens

### Chat Features
- **Real-time Chat**: Instant messaging powered by Firebase Realtime Database
- **Group Chat**: Multi-user group chat support
- **Emoji-Only Communication**: Text-free conversation using only emojis
- **Custom NFT Emojis**: Use your minted NFTs as custom emojis in chats
- **Unread Status Tracking**: Real-time unread message indicators

### Emoji & NFT System
- **Custom Emoji Creation**: Image upload via Pinata IPFS
- **NFT Minting**: ERC-1155 standard NFTs on Base Sepolia
- **Batch Minting**: Register multiple emojis in a single transaction via `registerNewEmojisBatch` function
- **Metadata Storage**: IPFS-based decentralized storage via Pinata
- **Search & Filter**: Browse owned and created emojis
- **Profile Display**: Manage emojis with Created/Collected tabs

### Farcaster Integration
- **Farcaster Mini App**: Native integration with Farcaster ecosystem
- **Frame Support**: Compatible with Farcaster Frames
- **Service Worker Integration**: Custom CORS proxy service worker for Farcaster SDK analytics
- **Base App Support**: Wallet-based authentication for Base app environment
- **Automated Authentication**: Auto-login with Farcaster credentials

### Progressive Web App (PWA)
- **Installable**: Add to home screen on mobile/desktop
- **Offline Support**: Dual Service Workers for caching and CORS proxy
- **Custom Service Worker**: Intercepts and proxies Farcaster SDK analytics requests
- **App Icons**: Custom icons for all platforms

## Tech Stack 🛠

### Frontend
- **[Next.js 15.2.1](https://nextjs.org/)** - React framework with App Router
- **[React 19.0.0](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Static typing
- **[Tailwind CSS 3.4.1](https://tailwindcss.com/)** - CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - UI component library (Radix UI)
- **[TanStack Query 5.74.4](https://tanstack.com/query)** - Data fetching and caching
- **[Conform 1.2.2](https://conform.guide/) + [Zod 3.24.2](https://zod.dev/)** - Form validation
- **[Lucide React 0.475.0](https://lucide.dev/)** - Icons

### Backend & Infrastructure
- **[Firebase 11.4.0](https://firebase.google.com/)** - Realtime Database + Authentication
- **[Firebase Admin 13.2.0](https://firebase.google.com/)** - Server-side Firebase operations
- **[Cloudinary 2.6.0](https://cloudinary.com/)** - Profile image storage and management
- **[Pinata SDK 2.4.9](https://pinata.cloud/)** - IPFS image storage for NFT metadata

### Web3 Integration
- **[Privy React Auth 2.13.1](https://docs.privy.io/)** - Web3 authentication & wallet management
- **[Wagmi 2.15.0](https://wagmi.sh/)** - React Hooks for Ethereum
- **[Viem 2.26.3](https://viem.sh/)** - TypeScript Ethereum client
- **[Coinbase Onchainkit 0.38.13](https://onchainkit.xyz/)** - Base chain integration
- **[Ethers.js 5.8.0](https://docs.ethers.io/)** - Ethereum library

### Farcaster Integration
- **[Farcaster Mini Apps SDK 0.1.8](https://miniapps.farcaster.xyz/)** - Native Farcaster integration
- **[Farcaster Frame SDK 0.1.8](https://docs.farcaster.xyz/developers/frames/)** - Frame development tools
- **[Farcaster Quick Auth 0.0.8](https://docs.farcaster.xyz/)** - Quick authentication
- **[Neynar SDK 3.34.0](https://neynar.com/)** - Farcaster API and development tools

### Smart Contracts
- **[Hardhat 2.24.0](https://hardhat.org/)** - Smart contract development framework
- **[OpenZeppelin Upgrades 3.9.0](https://docs.openzeppelin.com/upgrades/)** - Upgradeable contracts
- **[Hardhat Verify 2.0.13](https://hardhat.org/)** - Contract verification
- **ERC-1155**: Multi-token standard for emoji NFTs

### PWA & Progressive Features
- **[@ducanh2912/next-pwa 10.2.9](https://github.com/DuCanhGH/next-pwa)** - PWA support with Workbox
- **Custom Service Worker** (`public/custom-sw.js`): CORS proxy for Farcaster SDK analytics
- **Service Worker** (`public/sw.js`): Runtime caching strategies and offline functionality

### Development Tools
- **[pnpm](https://pnpm.io/)** - Package manager
- **[Biome 1.9.4](https://biomejs.dev/)** - Code formatter and linter
- **[ESLint 9](https://eslint.org/)** - Additional linter
- **[TSX 4.20.6](https://github.com/esbuild-kit/tsx)** - TypeScript execution

## Project Structure 📁

```
emoji-chat/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Authentication routes
│   │   │   ├── page.tsx         # Sign in/sign up page
│   │   │   └── signup/          # Sign up pages
│   │   ├── (main)/              # Main application routes
│   │   │   ├── chat/            # Chat features
│   │   │   │   ├── (list)/      # Chat room list
│   │   │   │   └── (room)/      # Individual chat rooms
│   │   │   ├── profile/         # Profile management
│   │   │   ├── choose-friends/  # Friend selection
│   │   │   ├── create-emoji/    # Emoji creation
│   │   │   └── explore/         # Explore & search
│   │   ├── api/                 # API Routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   │   ├── farcaster-firebase-token/
│   │   │   │   └── firebase-token/
│   │   │   ├── pinata-upload/   # Image upload
│   │   │   └── proxy/           # Proxy endpoints
│   │   ├── refresh/             # Token refresh
│   │   └── layout.tsx           # Root layout
│   ├── components/
│   │   ├── features/            # Feature-specific components
│   │   │   ├── auth/            # Authentication components
│   │   │   ├── chat/            # Chat functionality
│   │   │   ├── choose-friends/  # Friend selection
│   │   │   ├── collect-emoji/   # NFT collection
│   │   │   ├── create-emoji/    # Emoji creation
│   │   │   ├── create-profile/  # Profile creation
│   │   │   ├── explore/         # Explore features
│   │   │   ├── getStarted/      # Get started page
│   │   │   ├── profile/         # Profile management
│   │   │   └── signInSignUp/    # Auth components
│   │   ├── pages/               # Page components
│   │   ├── providers/           # Provider components
│   │   │   ├── AuthProvider.tsx        # Unified auth
│   │   │   ├── FarcasterAuthProvider.tsx
│   │   │   ├── OnchainKitProvider.tsx
│   │   │   ├── PrivyProvider.tsx
│   │   │   └── Providers.tsx
│   │   ├── shared/              # Shared components
│   │   │   ├── layout/          # Layout components
│   │   │   └── navigation/      # Navigation
│   │   └── ui/                  # Base UI components (shadcn/ui)
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useCollectWallet.ts
│   │   ├── useFarcasterAuth.ts
│   │   ├── usePrivyAuth.ts
│   │   ├── useUnifiedAuth.ts
│   │   ├── useUnifiedWallet.ts
│   │   └── useWalletManagement.ts
│   ├── lib/                     # Library configurations
│   │   ├── basename/            # Base chain setup
│   │   │   ├── basename.ts
│   │   │   ├── EthereumProviders.tsx
│   │   │   ├── l2ResolverAbi.ts
│   │   │   └── wagmi.ts
│   │   ├── contracts.ts         # Contract addresses
│   │   ├── farcaster.ts         # Farcaster SDK
│   │   ├── firebase-auth.ts     # Firebase config
│   │   ├── neynar.ts            # Neynar API
│   │   └── wallet-utils.ts      # Wallet utilities
│   ├── repository/              # Data access layer
│   │   └── db/
│   │       ├── chat/            # Chat operations
│   │       ├── chatroom/        # Chat room operations
│   │       ├── config/          # Client/server config
│   │       ├── user/            # User operations
│   │       └── database.ts      # Database types
│   ├── types/                   # TypeScript type definitions
│   ├── middleware.ts            # Next.js middleware
│   └── styles/
│       └── globals.css
├── public/
│   ├── .well-known/             # Farcaster verification files
│   │   ├── farcaster.json       # Generated Mini App manifest (auto-copied)
│   │   ├── farcaster.production.json  # Production manifest
│   │   └── farcaster.development.json  # Development manifest
│   ├── icons/                   # App icons (PWA)
│   ├── sw.js                    # Generated Service Worker (PWA)
│   ├── custom-sw.js             # Custom CORS proxy Service Worker
│   └── manifest.json            # PWA manifest
├── contract/                    # Smart contracts
│   ├── contracts/
│   │   └── EmojiChat.sol        # Main NFT contract
│   ├── test/
│   ├── ignition/                # Deployment scripts
│   └── hardhat.config.ts
├── scripts/
│   └── generate-farcaster-manifest.ts  # Build script
├── docs/                        # Documentation
├── .claude/                     # Claude AI agents
└── vercel.json                  # Vercel configuration
```

## Farcaster Mini App Setup 🚀

This application is configured as a **Farcaster Mini App** with the following features:

### Manifest File
The Farcaster manifest files contain Mini App configuration with:
- **Environment-based Files**: `farcaster.production.json` and `farcaster.development.json` are source files
- **Auto-generation**: `pnpm generate:manifest` copies appropriate file to `farcaster.json` during build
- **Manifest Configuration**: Includes app metadata, icons, splash screens, and button settings
- **Account Association**: Verified domain ownership with cryptographic signatures
- **Base Builder**: Owner address for Base app integration

### Key Features
- **Native Farcaster Integration**: Runs within Farcaster clients
- **Quick Auth**: Automatic authentication using Farcaster SDK
- **Custom Service Worker**: `custom-sw.js` intercepts Privy analytics requests and proxies them via `/api/proxy/privy-farcaster` to avoid CORS issues
- **PWA Service Worker**: Generated `sw.js` provides runtime caching and offline functionality
- **Wallet Integration**: Access to Farcaster wallet provider
- **Base App Support**: Special handling for Base app environment (FID: -1)

### Implementation Details
- **SDK Initialization**: Auto-initialization on app load
- **Context Detection**: Automatic Mini App environment detection  
- **Auto-login**: Seamless authentication without user interaction
- **Wallet Monitoring**: Automatic re-authentication on wallet change
- **Firebase Integration**: Custom token generation for database access

### Development vs Production
- **Development**: `farcaster.development.json` manifest with test configuration
- **Production**: `farcaster.production.json` manifest with live configuration
- **Environment Variable**: `NEXT_PUBLIC_ENVIRONMENT` controls active manifest
- **Build Script**: `scripts/generate-farcaster-manifest.ts` copies appropriate manifest

### Endpoints
- **Production URL**: `https://emoji-chat-leaps.vercel.app` and `https://emojify.club`
- **Development URL**: `https://emoji-chat-develop.vercel.app`
- **Manifest**: `/.well-known/farcaster.json`
- **Auth Endpoint**: `/api/auth/farcaster-firebase-token`
- **CORS Proxy**: `/api/proxy/privy-farcaster` for Farcaster SDK analytics

### Documentation
For more information about Farcaster Mini Apps, visit:
- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/docs/specification)
- [Frames Introduction](https://docs-farcaster.xyz/developers/frames/)
- [Farcaster SDK](https://docs.farcaster.xyz/developers/miniapps/getting-started)

## Setup 🔧

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Environment Variables 🔐

The following environment variables need to be set:

### Privy Authentication
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
```

### Firebase Configuration
```env
# Client-side Firebase config
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Server-side Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
```

### Cloudinary Image Storage
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Coinbase OnchainKit
```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
```

### Pinata IPFS
```env
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_GATEWAY_URL=https://your-gateway.pinata.cloud
```

### Neynar API (Required for Farcaster Mini App)
```env
NEYNAR_API_KEY=your_neynar_api_key
```

### Environment
```env
NEXT_PUBLIC_ENVIRONMENT=production  # or 'development'
```

### Smart Contract Configuration
```env
# Contract deployment network
PRIVATE_KEY=your_private_key
ALCHEMY_API_KEY=your_alchemy_api_key  # For Base Sepolia
```

## Development Commands 🛠

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Format code (Biome)
pnpm format

# Check format without writing
pnpm format:check

# Run linter (Next.js)
pnpm lint

# Run Biome linter
pnpm lint:biome

# Format and lint with auto-fix (Biome)
pnpm check

# CI check (Biome, no write)
pnpm check:ci
```

## Key Features Explained 📖

### Authentication Flow

#### Web Environment (Privy)
1. **Initial Access**: Users land on the Get Started page (`/`)
2. **Wallet Connection**: Connect via Privy (wallet/email/social)
3. **Auto-redirect**: Authenticated users automatically redirected to appropriate page
4. **Profile Creation**: New users directed to profile creation (`/profile/create`)

#### Farcaster Mini App Environment
1. **Automatic Detection**: Application detects Farcaster Mini App context
2. **Quick Auth**: Automatic authentication using Farcaster SDK
3. **Wallet Retrieval**: Fetches connected wallet from Farcaster
4. **Firebase Sync**: Creates Firebase custom token for database access
5. **Auto-login**: Seamless entry without manual authentication

### NFT Management
- **ERC-1155 Standard**: Multi-token standard for efficient emoji NFTs
- **Metadata Storage**: IPFS via Pinata for decentralized image storage  
- **Contract Integration**: Wagmi hooks for blockchain interactions
- **Batch Operations**: `registerNewEmojisBatch` for registering multiple emojis in single transaction
- **Revenue Sharing**: Creator fees (60%) and protocol fees (40%)
- **Mint Price**: Configurable mint price (default: 0.0005 ETH)

### Smart Contract Features
- **Upgradeable**: UUPS proxy pattern for contract upgrades
- **Pausable**: Emergency pause functionality
- **Supply Tracking**: Real-time supply tracking per token
- **URI Management**: Per-token URI support via ERC1155URIStorage
- **Reentrancy Protection**: NonReentrant modifiers for security

### Chat System
- **Real-time Messaging**: Firebase Realtime Database for instant delivery
- **Group Chat**: Multi-user room support
- **Custom Emoji Integration**: Use minted NFTs as emojis
- **Unread Tracking**: Last read timestamp per user
- **Message History**: Persistent chat history

### Multi-Wallet Support
- **Wallet Switching**: Switch between connected wallets seamlessly
- **Address Normalization**: Lowercase address handling for consistency
- **Privy Integration**: Embedded and external wallet support
- **Automatic Detection**: Environment-specific wallet providers

## Deployment 🚀

### Vercel Deployment
The application is configured for deployment on Vercel with:
- Environment-based Farcaster manifest generation via `pnpm generate:manifest`
- PWA support with dual Service Workers (custom-sw.js for CORS proxy and generated sw.js)
- Image optimization via Cloudinary for profile images
- IPFS integration via Pinata for NFT metadata

### Build Process
```bash
# Pre-build: Generate Farcaster manifest
pnpm generate:manifest

# Build for production
pnpm build

# Deploy to Vercel
vercel --prod
```

## Configuration Files 📝

### Biome (Code Formatting)
- Located in `biome.json`
- Handles formatting and linting
- Integrated with CI/CD pipeline

### Vercel (Deployment)
- Located in `vercel.json`
- Farcaster manifest routing
- Custom headers for `.well-known` endpoint

### Next.js PWA
- Located in `next.config.ts`
- Service Worker configuration
- Runtime caching strategies
- Image optimization settings

## License 📄

MIT
