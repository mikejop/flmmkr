'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Prisma2DownloadModal from '@/components/prisma2/Prisma2DownloadModal';
import { DEFAULT_LANG, DICT, LANGS, detectLang, type LangCode } from '@/components/prisma2/i18n';

const STORAGE_KEY = 'prisma2-lang';
const STEP_IMAGES = [
  { src: '/prisma2/passo-1-aviso.png', w: 522, h: 580 },
  null,
  { src: '/prisma2/passo-2-privacidade.jpg', w: 1396, h: 516 },
  { src: '/prisma2/passo-3-abrir.png', w: 376, h: 505 },
  null,
] as const;
// Qual das três imagens (alts) vai em cada passo.
const ALT_INDEX = [0, -1, 1, 2, -1];

export default function Prisma2Download() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<LangCode>(DEFAULT_LANG);
  const close = useCallback(() => setOpen(false), []);

  // Idioma: escolha salva do visitante, senão o idioma do navegador.
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch {}
    const known = LANGS.find((l) => l.code === saved)?.code;
    setLang(known ?? detectLang(navigator.languages?.length ? navigator.languages : [navigator.language]));
  }, []);

  const meta = LANGS.find((l) => l.code === lang) ?? LANGS[1];
  const t = DICT[lang];

  useEffect(() => {
    document.documentElement.lang = meta.code;
  }, [meta.code]);

  const changeLang = (code: LangCode) => {
    setLang(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  };

  const cta = 'inline-flex h-12 items-center rounded-full bg-[#0071e3] px-8 text-[17px] font-medium text-white transition hover:bg-[#0077ed] active:bg-[#006edb]';

  return (
    <div dir={meta.dir} className="min-h-screen bg-white font-sans text-[#1d1d1f] antialiased selection:bg-[#0071e3]/20">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur-xl">
        <div dir="ltr" className="mx-auto flex h-12 max-w-[980px] items-center justify-between px-6">
          <span className="text-[15px] font-semibold tracking-[0.18em]">FLMMKR</span>
          <div className="flex items-center gap-3">
            <label className="relative flex h-7 items-center gap-1 rounded-full px-2 text-[12px] text-[#6e6e73] transition hover:bg-black/5 focus-within:bg-black/5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" /></svg>
              <span aria-hidden="true">{lang === 'pt-BR' ? 'PT' : lang.toUpperCase()}</span>
              <select
                aria-label={t.language}
                value={lang}
                onChange={(e) => changeLang(e.target.value as LangCode)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-[#0071e3] px-3.5 py-1 text-[12px] font-medium text-white transition hover:bg-[#0077ed]">
              {t.download}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="px-6 pb-20 pt-16 text-center sm:pt-24">
          <Image src="/prisma2/prisma2-icon.png" alt="PRISMA 2" width={128} height={128} priority className="mx-auto h-28 w-28 drop-shadow-xl sm:h-32 sm:w-32" />
          <h1 dir="ltr" className="mt-8 text-[56px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[96px]">PRISMA 2</h1>
          <p dir="ltr" className="mt-3 text-[24px] font-medium leading-tight tracking-tight text-[#1d1d1f] sm:text-[32px]">Screen Capture for MacOS</p>
          <p className="mx-auto mt-5 max-w-xl text-[19px] leading-snug text-[#6e6e73]">{t.version}</p>
          <button type="button" onClick={() => setOpen(true)} className={`${cta} mt-9`}>{t.heroButton}</button>
          <p className="mt-4 text-[12px] text-[#86868b]">{t.heroNote}</p>
        </section>

        <section className="bg-[#f5f5f7] px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-[980px]">
            <h2 className="mx-auto max-w-2xl text-center text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[48px]">{t.installTitle}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-center text-[19px] leading-snug text-[#6e6e73] sm:text-[21px]">{t.installIntro}</p>

            <ol className="mt-14 space-y-6">
              {t.steps.map((s, i) => {
                const img = STEP_IMAGES[i];
                return (
                  <li key={i} className="overflow-hidden rounded-[28px] bg-white p-7 sm:p-10">
                    <div className="flex items-start gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d1d1f] text-[15px] font-semibold text-white">{i + 1}</span>
                      <div className="min-w-0">
                        <h3 className="text-[24px] font-semibold leading-tight tracking-tight sm:text-[28px]">{s.title}</h3>
                        <p className="mt-2 max-w-2xl text-[17px] leading-snug text-[#6e6e73]">{s.text}</p>
                      </div>
                    </div>
                    {img && (
                      <div dir="ltr" className="mt-8 flex justify-center rounded-2xl bg-[#1d1d1f] p-4 sm:p-8">
                        <Image
                          src={img.src}
                          alt={t.alts[ALT_INDEX[i]]}
                          width={img.w}
                          height={img.h}
                          sizes="(min-width: 980px) 640px, 90vw"
                          className="h-auto w-full rounded-xl"
                          style={{ maxWidth: Math.min(img.w, 640) }}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="px-6 py-20 text-center sm:py-28">
          <h2 className="text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[48px]">{t.ctaTitle}</h2>
          <button type="button" onClick={() => setOpen(true)} className={`${cta} mt-8`}>{t.heroButton}</button>
        </section>
      </main>

      <footer className="border-t border-black/10 bg-[#f5f5f7] px-6 py-8">
        <div className="mx-auto flex max-w-[980px] flex-col gap-2 text-[12px] text-[#6e6e73] sm:flex-row sm:justify-between">
          <span>{t.rights}</span>
          <span className="flex gap-4">
            <a href="/privacidade" className="hover:underline">{t.privacy}</a>
            <a href="/termos" className="hover:underline">{t.terms}</a>
          </span>
        </div>
      </footer>

      {open && <Prisma2DownloadModal onClose={close} t={t} privacyHref="/privacidade" />}
    </div>
  );
}
