'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { detectSocialBrowser, SocialPlatform } from '@/utils/detectBrowser';
import { SocialLanding } from '@/components/SocialLanding';
import { OfficialLanding } from '@/components/OfficialLanding';
import { trackEvent } from '@/utils/analytics';

interface MainClientSwitcherProps {
  initialPlatform?: SocialPlatform;
  initialIsInApp?: boolean;
}

export const MainClientSwitcher: React.FC<MainClientSwitcherProps> = ({
  initialPlatform = 'other',
  initialIsInApp = false
}) => {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view'); // 'social' | 'official' | null

  const [platform, setPlatform] = useState<SocialPlatform>(initialPlatform);
  const [isInApp, setIsInApp] = useState<boolean>(initialIsInApp);
  const [overrideView, setOverrideView] = useState<'social' | 'official' | null>(
    viewParam === 'social' || viewParam === 'official' ? viewParam : null
  );

  useEffect(() => {
    // Executa detecção no client-side para garantir suporte caso o header do server não esteja completo
    const detected = detectSocialBrowser();
    setPlatform(detected.platform);
    setIsInApp(detected.isInAppBrowser);

    trackEvent('detected_platform', {
      platform: detected.platform,
      is_in_app: detected.isInAppBrowser
    });
  }, []);

  // Atualiza override caso o parâmetro de busca mude
  useEffect(() => {
    if (viewParam === 'social' || viewParam === 'official') {
      setOverrideView(viewParam);
    }
  }, [viewParam]);

  // Se o usuário passou um parâmetro explícito na URL, obedece essa escolha
  if (overrideView === 'social') {
    return (
      <SocialLanding
        platform={platform}
        onSwitchToOfficial={() => setOverrideView('official')}
      />
    );
  }

  if (overrideView === 'official') {
    return (
      <OfficialLanding
        platform={platform}
        onSwitchToSocial={() => setOverrideView('social')}
      />
    );
  }

  // Se for Instagram ou TikTok e estiver dentro de in-app browser (ou detectado como tal)
  if (isInApp || platform === 'instagram' || platform === 'tiktok') {
    return (
      <SocialLanding
        platform={platform}
        onSwitchToOfficial={() => setOverrideView('official')}
      />
    );
  }

  // Padrão: Navegador normal ou origem geral -> Página Oficial
  return (
    <OfficialLanding
      platform={platform}
      onSwitchToSocial={() => setOverrideView('social')}
    />
  );
};
