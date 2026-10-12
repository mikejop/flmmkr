'use client';

import { useEffect } from 'react';
import { registerCacheProxy } from '@/lib/swBridge';
import { sweepClientCache } from '@/lib/clientCache';

/** Liga o proxy de cache do navegador e descarta cache de versões antigas do sistema. */
export function CacheProxyRegister() {
  useEffect(() => {
    sweepClientCache();
    registerCacheProxy();
  }, []);
  return null;
}
