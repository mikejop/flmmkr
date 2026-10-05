'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const MemberAreaApp = dynamic(
  () => import('@/components/MemberAreaApp'),
  { 
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-[#070709]" />
  }
);

export default function ConteudoPage() {
  return <MemberAreaApp />;
}
