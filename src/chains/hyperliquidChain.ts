import type { AppKitNetwork } from '@reown/appkit/networks'

// Hyperliquid Mainnet
export const hyperliquidChain: AppKitNetwork = {
  id: 999,
  name: 'Hyperliquid Mainnet',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: { 
      http: ['https://rpc.hyperliquid.xyz/evm']
    },
    // public:  { http: ['https://rpc.hyperliquid.xyz/evm'] },
  },
  blockExplorers: {
    default: {
      name: 'Hyperliquid Explorer',
      url: 'https://hyperfoundation.org',
    },
  },
  testnet: false,
}

// Hyperliquid Testnet
export const hyperliquidTestnet: AppKitNetwork = {
  id: 998,
  name: 'Hyperliquid Testnet',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid-testnet.xyz/evm']
    },
  },
  blockExplorers: {
    default: {
      name: 'Hyperliquid Testnet Explorer',
      url: 'https://app.hyperliquid-testnet.xyz/explorer',
    },
  },
  testnet: true,
}
