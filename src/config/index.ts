// import {
//   sepolia,
//   mainnet,
//   arbitrum,
//   avalanche,
//   base,
//   optimism,
//   polygon
// } from '@reown/appkit/networks';
// import { hyperliquidChain, hyperliquidTestnet } from '@/chains/hyperliquidChain';
import { hyperliquidTestnet } from '@/chains/hyperliquidChain';
import type { AppKitNetwork } from '@reown/appkit/networks';

import { PROJECT_ID } from '@/constants/constants';


if (!PROJECT_ID) {
  throw new Error('Project ID is not defined');
}

// export const networks = [hyperliquidChain, hyperliquidTestnet] as [AppKitNetwork, ...AppKitNetwork[]];
export const networks = [hyperliquidTestnet] as [AppKitNetwork, ...AppKitNetwork[]];