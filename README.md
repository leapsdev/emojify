# Emojify 🎨💬

A Web3 chat application where communication happens exclusively through emojis. Users can create their own custom emojis, mint them as NFTs, and trade them on the marketplace.

## Features 🚀

### Authentication System
- **Privy Web3 Authentication**: Support for wallet, email, and social login
- **Multi-Wallet Management**: Connect and switch between multiple wallets
- **Farcaster Integration**: Automatic authentication in Farcaster Mini App environment

### Chat Features
- **Real-time Chat**: Instant messaging powered by Firebase Realtime Database
- **Group Chat**: Multi-user group chat support
- **Emoji-Only Communication**: Text-free conversation using only emojis

### Emoji & NFT System
- **Custom Emoji Creation**: Image upload via Cloudinary
- **NFT Minting**: ERC-1155 standard NFTs on Base Sepolia
- **Marketplace**: Buy and sell emoji NFTs
- **Search & Filter**: Browse owned and created emojis
- **Profile Display**: Manage emojis with Created/Collected tabs

### Farcaster Integration
- **Farcaster Mini App**: Native integration with Farcaster ecosystem
- **Frame Support**: Compatible with Farcaster Frames
- **Account Association**: Verified domain ownership on Farcaster
- **Webhook Support**: Real-time notifications and event handling

## Tech Stack 🛠

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Static typing
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - UI component library
- **[TanStack Query](https://tanstack.com/query)** - Data fetching and caching
- **[Conform](https://conform.guide/) + [Zod](https://zod.dev/)** - Form validation

### Backend & Infrastructure
- **[Firebase](https://firebase.google.com/)** - Realtime Database + Authentication
- **[Cloudinary](https://cloudinary.com/)** - Image storage and management
- **[Pinata](https://pinata.cloud/)** - IPFS image storage

### Web3 Integration
- **[Privy](https://docs.privy.io/)** - Web3 authentication & wallet management
- **[Wagmi v2](https://wagmi.sh/)** - React Hooks for Ethereum
- **[Viem](https://viem.sh/)** - TypeScript Ethereum client
- **[Coinbase Onchainkit](https://onchainkit.xyz/)** - Base chain integration

### Farcaster Integration
- **[Farcaster Mini Apps](https://miniapps.farcaster.xyz/)** - Native Farcaster integration
- **[Farcaster Frame SDK](https://docs.farcaster.xyz/developers/frames/)** - Frame development tools
- **[Neynar SDK](https://neynar.com/)** - Farcaster API and development tools

### Development Tools
- **[pnpm](https://pnpm.io/)** - Package manager
- **[Biome](https://biomejs.dev/)** - Code formatter and linter
- **[ESLint](https://eslint.org/)** - Additional linter

## Project Structure 📁

```
emoji-chat/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (main)/              # Main application routes
│   │   │   ├── chat/            # Chat features
│   │   │   ├── profile/         # Profile management
│   │   │   ├── choose-friends/  # Friend selection
│   │   │   ├── create-emoji/    # Emoji creation
│   │   │   └── explore/         # Explore & search
│   │   ├── api/                 # API Routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   └── pinata-upload/   # Image upload
│   │   └── refresh/             # Token refresh
│   ├── components/
│   │   ├── features/            # Feature-specific components
│   │   │   ├── auth/            # Authentication
│   │   │   ├── chat/            # Chat functionality
│   │   │   ├── profile/         # Profile management
│   │   │   └── create-emoji/    # Emoji creation
│   │   ├── shared/              # Shared components
│   │   │   ├── layout/          # Layout components
│   │   │   └── navigation/      # Navigation
│   │   ├── pages/               # Page components
│   │   ├── providers/           # Provider components
│   │   └── ui/                  # Base UI components
│   ├── hooks/                   # Custom React Hooks
│   ├── lib/                     # Library configurations
│   │   ├── basename/            # Base chain setup
│   │   └── contracts/           # Smart contract definitions
│   ├── repository/              # Data access layer
│   │   └── db/                  # Firebase operations
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions
│   └── middleware.ts            # Next.js middleware
├── public/
│   ├── .well-known/             # Farcaster verification files
│   │   └── farcaster.json       # Mini App manifest
│   ├── icons/                   # App icons
│   └── sw.js                    # Service Worker (PWA)
├── contract/                    # Smart contracts
├── docs/                        # Documentation
└── .claude/                     # Claude AI configuration
```

## Farcaster Mini App Setup 🚀

This application is configured as a **Farcaster Mini App** with the following features:

### Manifest File
The `public/.well-known/farcaster.json` file contains the Mini App manifest with:
- **Frame Configuration** - App metadata and display settings
- **Account Association** - Verified domain ownership on Farcaster
- **Webhook Integration** - Real-time event handling

### Key Features
- **Native Farcaster Integration** - Runs within Farcaster clients
- **Frame Support** - Compatible with Farcaster Frames ecosystem
- **Verified Domain** - Cryptographically signed domain ownership
- **Real-time Events** - Webhook-based notification system

### Development Environment
- **Production URL**: `https://emoji-chat-leaps.vercel.app`
- **Development URL**: `https://emoji-chat-env-develop-leaps.vercel.app/`
- **Webhook Endpoint**: `/api/webhook`

For more information about Farcaster Mini Apps, visit:
- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/docs/specification)
- [Frames Introduction](https://docs-farcaster-xyz.vercel.app/developers/frames/)

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

```env
# Privy App Secret
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVY_APP_SECRET=

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin Configuration
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Onchainkit Configuration
NEXT_PUBLIC_ONCHAINKIT_API_KEY=

# Neynar API Configuration (Required for Farcaster Mini App)
NEYNAR_API_KEY=your_neynar_api_key_here

# Pinata
PINATA_API_KEY=
PINATA_API_SECRET=
PINATA_JWT=
NEXT_PUBLIC_GATEWAY_URL=
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
1. **Initial Access**: Users land on the Get Started page (`/`)
2. **Wallet Connection**: Connect via Privy (wallet/email/social)
3. **Auto-redirect**: Authenticated users automatically redirected to appropriate page
4. **Profile Creation**: New users directed to profile creation (`/profile/create`)
5. **Farcaster Mini App**: Automatic authentication with Farcaster credentials

### NFT Management
- **ERC-1155 Standard**: Multi-token standard for efficient emoji NFTs
- **Metadata Storage**: IPFS via Pinata for decentralized image storage
- **Contract Integration**: Wagmi hooks for blockchain interactions
- **Real-time Updates**: Streaming NFT fetching with duplicate prevention

### Multi-Wallet Support
- **Wallet Switching**: Switch between connected wallets seamlessly
- **Address Normalization**: Lowercase address handling for consistency
- **Privy Integration**: Embedded and external wallet support

## License 📄

MIT
