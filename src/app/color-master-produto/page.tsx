'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { MemberPreloader } from '@/components/MemberPreloader';

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

        // 1. Verificação Estrita de Pagamento (Servidor + Asaas)
        setStatusMessage('Validando status de pagamento no Asaas...');
        const checkRes = await fetch('/api/auth/verify-access');
        const checkData = await checkRes.json().catch(() => ({}));

        if (!checkRes.ok || !checkData.allowed) {
          console.warn('[Acesso Bloqueado] Pagamento não confirmado:', checkData);
          await supabase.auth.signOut();
          if (isMounted) {
            window.location.replace('/');
          }
          return;
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
      {/* Monta a aplicação por baixo */}
      <MemberAreaApp skipInternalPreloader={true} />

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
