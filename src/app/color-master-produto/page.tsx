'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { MemberPreloader } from '@/components/MemberPreloader';

const MemberAreaApp = dynamic(
  () => import('@/components/MemberAreaApp'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#070709] flex items-center justify-center">
        <MemberPreloader />
      </div>
    )
  }
);

export default function ColorMasterProdutoPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          window.location.replace('/');
        }
      } catch (err) {
        if (isMounted) {
          setIsAuthenticated(false);
          window.location.replace('/');
        }
      }
    }

    verifyAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && isMounted) {
        setIsAuthenticated(false);
        window.location.replace('/');
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Enquanto valida a autenticação ou se não estiver logado, exibe apenas o preloader
  if (isAuthenticated !== true) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] text-white flex items-center justify-center z-50">
        <MemberPreloader />
      </div>
    );
  }

  return <MemberAreaApp />;
}
