'use client'

import React, { type ReactNode } from 'react';

import { WagmiConfig } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { networks } from '@/config';
import { PROJECT_ID } from '@/constants/constants';

// 1) Проверяем projectId
if (!PROJECT_ID) {
  throw new Error('Project ID is not defined')
}

// 3) Создаём WagmiAdapter (он сам «подхватит» injected, WC и Coinbase)
const wagmiAdapter = new WagmiAdapter({
  projectId: PROJECT_ID,
  networks,
})

// 4) Получаем готовый wagmiConfig, который адаптер подготовил для wagmi@2
const wagmiConfig = wagmiAdapter.wagmiConfig

// 5) Создаём сам AppKit-модал (он в дальнейшем выдаёт лишь хуки для account/chain и т.д.)
createAppKit({
  adapters: [wagmiAdapter],
  projectId: PROJECT_ID,
  networks,
  metadata: {
    name: 'Reown AppKit Example',
    description: 'Hyperliquid + Reown AppKit + wagmi v2',
    url: 'https://your-domain.com',
    icons: ['https://assets.reown.com/reown-profile-pic.png'],
  },
  themeMode: 'dark',
  features: {
    analytics: true,
    socials: [],
    email: false,
  },
  themeVariables: {
    '--w3m-accent': '#000000',
  },
})

// 6) ContextProvider оборачивает всё дерево в WagmiConfig + React-Query Provider
export function ContextProvider({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  )
}
