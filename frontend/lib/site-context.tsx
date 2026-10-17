'use client';

import { createContext, useContext } from 'react';
import type { ServiceItem, SiteInfo } from './types';

interface SiteContextValue {
  site: SiteInfo;
  services: ServiceItem[];
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ value, children }: { value: SiteContextValue; children: React.ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const v = useContext(SiteContext);
  if (!v) throw new Error('useSite must be used inside <SiteProvider>');
  return v;
}

export { callCta } from './cta';
