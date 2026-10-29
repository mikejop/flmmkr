'use client';

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { PLUGIN_DOWNLOADS, type PluginOs } from '@/config/plugins';
import { OS_ICON } from '@/components/plugins/os';
import { usePluginsI18n } from '@/components/plugins/i18n/context';

const OS_LIST = Object.keys(PLUGIN_DOWNLOADS) as PluginOs[];

/** Passo a passo de instalação do FLMMKR FX, com uma aba por sistema (abre no sistema detectado). */
export default function PluginsInstall({ detectedOs }: { detectedOs: PluginOs | null }) {
  const { t } = usePluginsI18n();
  const [picked, setPicked] = useState<PluginOs | null>(null);
  const os = picked ?? detectedOs ?? 'macos';
  const steps = os === 'macos' ? t.install.mac : os === 'windows' ? t.install.windows : t.install.linux;
  const beta = os === 'macos' ? t.install.macBeta : os === 'windows' ? t.install.winBeta : t.install.linuxBeta;

  return (
    <section id="instalar" className="scroll-section relative z-10 w-full py-16 sm:py-28 border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-11">
      <div className="scroll-content max-w-[980px] mx-auto">
        <div className="mb-10 text-center">
          <span className="text-xs uppercase tracking-widest text-[#86868b] font-semibold mb-3 block">{t.install.eyebrow}</span>
          <h2 className="text-[1.875rem] leading-[1.1] sm:text-5xl sm:leading-tight font-semibold tracking-tight text-balance text-[#1d1d1f] mb-3">{t.install.title}</h2>
          <p className="text-[15px] leading-relaxed sm:text-xl text-[#86868b] max-w-xl mx-auto text-balance">{t.install.text}</p>
        </div>

        <div role="tablist" aria-label={t.install.title} className="mx-auto grid max-w-md grid-cols-3 gap-1 rounded-full bg-[#e8e8ed] p-1">
          {OS_LIST.map((key) => {
            const Icon = OS_ICON[key];
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={os === key}
                onClick={() => setPicked(key)}
                className={`flex h-10 items-center justify-center gap-2 rounded-full text-[14px] font-medium transition ${
                  os === key ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {PLUGIN_DOWNLOADS[key].label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" className="mt-8">
          <div className="flex gap-4 rounded-3xl border border-[#ff9f0a]/30 bg-[#ff9f0a]/[0.07] p-6 sm:p-8">
            <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-[#c93400]" aria-hidden="true" />
            <div>
              <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{t.install.betaTitle}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[#424245]">{beta}</p>
            </div>
          </div>

          <ol className="mt-6 space-y-4">
            {steps.map((s, i) => (
              <li key={s.title} className="flex items-start gap-4 rounded-3xl bg-[#f5f5f7] p-6 sm:p-8">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d1d1f] text-[15px] font-semibold text-white">{i + 1}</span>
                <div className="min-w-0">
                  <h3 className="text-[20px] font-semibold leading-tight tracking-tight text-[#1d1d1f] sm:text-[24px]">{s.title}</h3>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#6e6e73] sm:text-[17px]">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
