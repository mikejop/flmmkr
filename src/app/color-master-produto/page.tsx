'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { MemberPreloader } from '@/components/MemberPreloader';
import { readCache, writeCache, removeCache } from '@/lib/clientCache';

const ACCESS_FRESH_MS = 6 * 60 * 60 * 1000;

const MemberAreaApp = dynamic(
  () => import('@/components/MemberAreaApp'),
  { ssr: false }
);

export default function ColorMasterProdutoPage() {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isPreloaderFinished, setIsPreloaderFinished] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Inicializando workspace...');

  useEffect(() => {
    let isMounted = true;

    async function verifyAndLoadEverything() {
      try {
        setStatusMessage('Verificando sessão de login...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (!user) {
          window.location.replace('/');
          return;
        }

        // 1. Verificação de Pagamento (Servidor + Asaas).
        // Aprovação fica 6 h neste aparelho: abrir a área de novo não repete a consulta ao
        // banco/Asaas. Arquivos e vídeos continuam sendo validados no servidor a cada pedido, e um
        // estorno derruba a sessão (webhook) — a checagem acima só poupa a abertura da tela.
        const accessKey = `access-ok:${user.id}`;
        const approved = readCache<boolean>(accessKey);
        if (!(approved && approved.value === true && approved.ageMs < ACCESS_FRESH_MS)) {
          setStatusMessage('Validando status de pagamento...');
          const checkRes = await fetch('/api/auth/verify-access');
          const checkData = await checkRes.json().catch(() => ({}));

          if (!checkRes.ok || !checkData.allowed) {
            console.warn('[Acesso Bloqueado] Pagamento não confirmado:', checkData);
            removeCache(accessKey);
            await supabase.auth.signOut();
            if (isMounted) {
              window.location.replace('/');
            }
            return;
          }
          writeCache(accessKey, true);
        }

        setStatusMessage('Carregando conteúdo da Área de Membros...');

        // 2. Aguarda o DOM estar 100% pronto
        if (typeof document !== 'undefined' && document.readyState !== 'complete') {
          await new Promise<void>((resolve) => {
            window.addEventListener('load', () => resolve(), { once: true });
            setTimeout(resolve, 600);
          });
        }

        // TUDO CARREGADO E PAGAMENTO VERIFICADO COM SUCESSO!
        if (isMounted) {
          setStatusMessage('Acesso confirmado. Abrindo...');
          setIsReady(true);
        }
      } catch (err) {
        console.error('Erro na validação de pagamento e carregamento:', err);
        if (isMounted) {
          window.location.replace('/');
        }
      }
    }

    verifyAndLoadEverything();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && isMounted) {
        window.location.replace('/');
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#0a0a0c] overflow-hidden select-none">
      {/* Carrega a área e o bundle das aulas somente após a validação do servidor. */}
      {isReady && <MemberAreaApp skipInternalPreloader={true} />}

      {/* 
        REGRA DO USUÁRIO: O preloader só sai da tela DEPOIS de tudo estar carregado,
        principalmente a verificação de pagamento.
      */}
      {!isPreloaderFinished && (
        <MemberPreloader
          isReady={isReady}
          statusText={statusMessage}
          onComplete={() => setIsPreloaderFinished(true)}
        />
      )}
    </div>
  );
}
