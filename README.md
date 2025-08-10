# Emoji Chat 🎨💬

A Web3 chat application that uses only emojis. Users can create and sell their own emojis, and purchase and use emojis from other users.

## Features 🚀

### Authentication
- Web3 authentication system using Privy
- Support for email, wallet, and social login

### Chat Features
- Real-time chat (Firebase Realtime Database)
- Group chat support
- Communication using only emojis

### Emoji System
- Original emoji creation
- Image upload using Cloudinary
- NFT conversion using Thirdweb
- Marketplace for buying and selling
- Emoji search functionality

## Tech Stack 🛠

### Frontend
- [Next.js 15](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Conform](https://conform.guide/) - Form validation
- [Zod](https://zod.dev/) - Schema validation
- [Tailwind CSS](https://tailwindcss.com/) - Styling

### Backend
- [Firebase](https://firebase.google.com/) - Realtime database
- [Cloudinary](https://cloudinary.com/) - Image storage
- [Thirdweb](https://thirdweb.com/) - Web3 infrastructure

### Web3 Integration
- [Privy](https://docs.privy.io/) - Web3 authentication & wallet management
- [Wagmi](https://wagmi.sh/) - React Hooks for Ethereum
- [Viem](https://viem.sh/) - TypeScript Ethereum client

### Development Tools
- [pnpm](https://pnpm.io/) - Package manager
- [Biome](https://biomejs.dev/) - Code formatter & linter

## Project Structure 📁

### Directory Structure
```
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── (main)/ # Main application
│ │ ├── (auth)/ # Authentication related
│ │ └── refresh/ # Refresh token
│ ├── components/
│ │ ├── ui/ # Basic UI components
│ │ ├── providers/ # Provider components
│ │ ├── shared/ # Shared components
│ │ ├── features/ # Feature-specific components
│ │ └── pages/ # Page components
│ ├── lib/ # Utility functions
│ ├── repository/ # Data access layer
│ ├── types/ # Type definitions
│ ├── utils/ # Helper functions
│ ├── styles/ # Global styles
│ └── middleware.ts # Next.js middleware
├── public/ # Static files
├── contract/ # Smart contracts
└── README.md        
```

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

# Build
pnpm build

# Format code
pnpm format

# Run linter
pnpm lint

# Biome check
pnpm check
```

## License 📄

MIT
