'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const MemberAreaApp = dynamic(
  () => import('@/components/MemberAreaApp'),
  { ssr: false }
);

export default function ConteudoPage() {
  return <MemberAreaApp />;
}
