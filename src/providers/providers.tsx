'use client'

import React, { type ReactNode } from 'react';
import { ContextProvider } from '@/context';

// Этот компонент рендерится только на клиенте и оборачивает children внутрь ContextProvider + modal.Provider
export function AppProviders({ children }: { children: ReactNode }) {
  return <ContextProvider>{children}</ContextProvider>
}

