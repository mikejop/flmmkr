'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';

const VISITOR_ID_KEY = 'flmmkr_visitor_id';
const ATTRIBUTION_STORAGE_KEY = 'flmmkr_traffic_attribution';

export function TrafficTelemetryTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Evita chamadas repetidas na mesma rota se nada mudou
    const fullPath = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    if (hasTrackedPath.current === fullPath) return;
    hasTrackedPath.current = fullPath;

    async function sendTelemetry() {
      try {
        // 1. Obter ou gerar Visitor ID persistente
        let visitorId = '';
        try {
          visitorId = localStorage.getItem(VISITOR_ID_KEY) || '';
          if (!visitorId) {
            visitorId = `vis_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem(VISITOR_ID_KEY, visitorId);
          }
        } catch {
          visitorId = `vis_${Date.now().toString(36)}`;
        }

        // 2. Obter Device Fingerprint de Hardware (MAC address digital)
        const deviceFingerprint = await getDeviceFingerprint();

        // 3. Capturar resolução de tela
        const screenResolution = typeof window !== 'undefined' && window.screen
          ? `${window.screen.width}x${window.screen.height}`
          : '';

        // 4. Capturar referrer do documento
        const clientReferrer = typeof document !== 'undefined' ? document.referrer : '';
        const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

        // 5. Enviar para a API de Telemetria
        const response = await fetch('/api/telemetry/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visitorId,
            deviceFingerprint,
            screenResolution,
            clientReferrer,
            currentUrl,
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData?.data?.attribution) {
            try {
              localStorage.setItem(
                ATTRIBUTION_STORAGE_KEY,
                JSON.stringify({
                  ...resData.data.attribution,
                  deviceFingerprint,
                  visitorId,
                  ip: resData.data.ip,
                })
              );
            } catch {}
          }
        }
      } catch (err) {
        // Falhas de telemetria não devem quebrar a experiência do usuário
        if (process.env.NODE_ENV === 'development') {
          console.warn('[TelemetryTracker] Falha silenciosa ao registrar telemetria:', err);
        }
      }
    }

    sendTelemetry();
  }, [pathname, searchParams]);

  return null;
}
