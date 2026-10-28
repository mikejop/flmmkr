'use client';

import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Menu, X, Heart, ChevronDown, Download, Monitor } from 'lucide-react';
import { SITE_CONFIG } from '@/config/siteConfig';
import { InstagramIcon, YouTubeIcon, TikTokIcon } from '@/components/SocialIcons';
import { PLUGIN_DOWNLOADS, READY_PLUGINS, UPCOMING_PLUGINS, type PluginOs } from '@/config/plugins';
import { detectOs, isMobileDevice, OS_ICON } from '@/components/plugins/os';
import { trackPluginEvent } from '@/components/plugins/analytics';
import { PLUGIN_VISUALS } from '@/components/plugins/PluginVisuals';
import PluginsSignupModal from '@/components/plugins/PluginsSignupModal';
import PluginsDonateModal from '@/components/plugins/PluginsDonateModal';

// Quem já se cadastrou neste navegador baixa direto, sem repetir o formulário.
const REGISTERED_KEY = 'flmmkr_plugins_registered';
const OS_LIST = Object.keys(PLUGIN_DOWNLOADS) as PluginOs[];

const NAV = [
  { href: '#plugins', label: 'Plugins' },
  { href: '#em-producao', label: 'Em produção' },
  { href: '#doacao', label: 'Doação' },
];

const noopSubscribe = () => () => {};

function readRegistered(): boolean {
  try {
    return window.localStorage.getItem(REGISTERED_KEY) === '1';
  } catch {
    return false;
  }
}

function startDownload(os: PluginOs) {
  trackPluginEvent('plugin_download', os);
  const a = document.createElement('a');
  a.href = PLUGIN_DOWNLOADS[os].url;
  a.download = PLUGIN_DOWNLOADS[os].file;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function SocialIcon({ name, className }: { name: string; className: string }) {
  if (name === 'Instagram') return <InstagramIcon className={className} />;
  if (name === 'YouTube') return <YouTubeIcon className={className} />;
  if (name === 'TikTok') return <TikTokIcon className={className} />;
  return null;
}

export function PluginsLanding() {
  // Sistema e cadastro só existem no navegador: no servidor (e na hidratação) ficam vazios.
  const osReady = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const os = osReady ? detectOs() : null;
  // Celular e tablet: no lugar do download aparece um botão desativado (os plugins são só para computador).
  const mobile = osReady && isMobileDevice();
  const [justRegistered, setJustRegistered] = useState(false);
  const registered = justRegistered || (osReady && readRegistered());
  const [modalOs, setModalOs] = useState<PluginOs | null | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll('.scroll-section');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) entry.target.classList.add('is-visible');
      },
      { threshold: 0.15, rootMargin: '100px 0px 100px 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  /** Baixa direto se já tem cadastro; senão abre o cadastro com o sistema já escolhido (ou detectado). */
  const requestDownload = (target: PluginOs | null) => {
    trackPluginEvent('plugin_download_click', target);
    if (registered && target) return startDownload(target);
    setModalOs(target);
  };

  const onRegistered = useCallback((chosen: PluginOs) => {
    try {
      window.localStorage.setItem(REGISTERED_KEY, '1');
    } catch {}
    setJustRegistered(true);
    startDownload(chosen);
  }, []);

  const closeModal = useCallback(() => setModalOs(undefined), []);

  const otherOs = OS_LIST.filter((o) => o !== os);

  const renderDownload = (dark: boolean) => {
    if (!osReady) return <div className="h-[52px]" />;
    if (mobile) {
      return (
        <div className="flex w-full flex-col items-center">
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-describedby="computer-only-hint"
            className={`inline-flex h-12 w-full max-w-[320px] cursor-not-allowed items-center justify-center gap-2 rounded-full text-[15px] font-medium ${
              dark ? 'bg-white/[0.06] border border-white/15 text-white/60' : 'bg-[#e8e8ed] border border-[#d2d2d7] text-[#86868b]'
            }`}
          >
            <Monitor className="w-[18px] h-[18px]" aria-hidden="true" />
            Exclusivo para computador
          </button>
          <p id="computer-only-hint" className={`mt-3 max-w-[30ch] text-[13px] leading-snug text-balance ${dark ? 'text-white/50' : 'text-[#86868b]'}`}>
            Abra no computador (macOS, Windows ou Linux) para baixar.
          </p>
        </div>
      );
    }
    if (os) {
      const Icon = OS_ICON[os];
      return (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => requestDownload(os)}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold transition-all shadow-xl active:scale-95"
          >
            <Icon className="w-4 h-4" />
            Baixar para {PLUGIN_DOWNLOADS[os].label}
          </button>
          <p className={`text-xs ${dark ? 'text-white/60' : 'text-[#86868b]'}`}>
            Usa outro sistema?{' '}
            {otherOs.map((o, i) => (
              <React.Fragment key={o}>
                {i > 0 && ' ou '}
                <button onClick={() => requestDownload(o)} className={`underline underline-offset-2 ${dark ? 'hover:text-white' : 'hover:text-[#1d1d1f]'}`}>
                  {PLUGIN_DOWNLOADS[o].label}
                </button>
              </React.Fragment>
            ))}
          </p>
        </div>
      );
    }
    // Computador com sistema não reconhecido: o usuário escolhe pelo ícone.
    return (
      <div className="flex flex-col items-center gap-3">
        <p className={`text-sm ${dark ? 'text-white/80' : 'text-[#6e6e73]'}`}>Escolha o seu sistema para baixar:</p>
        <div className="flex gap-3">
          {OS_LIST.map((o) => {
            const Icon = OS_ICON[o];
            return (
              <button
                key={o}
                onClick={() => requestDownload(o)}
                className={`flex w-24 flex-col items-center gap-2 rounded-2xl border px-4 py-4 text-xs font-semibold transition-all active:scale-95 ${
                  dark ? 'border-white/25 bg-black/50 text-white hover:bg-white/15 backdrop-blur-md' : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#0071e3]'
                }`}
              >
                <Icon className="w-6 h-6" />
                {PLUGIN_DOWNLOADS[o].label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const openDonate = () => setDonateOpen(true);
  const closeDonate = useCallback(() => setDonateOpen(false), []);

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#1d1d1f] font-sans antialiased selection:bg-[#0071e3]/20 selection:text-[#0071e3]">
      {donateOpen && <PluginsDonateModal onClose={closeDonate} />}
      {modalOs !== undefined && <PluginsSignupModal initialOs={modalOs ?? os} onClose={closeModal} onRegistered={onRegistered} />}

      {/* Header — Dark Glass, igual à raiz */}
      <header
        className="sticky top-0 z-50 w-full border-b border-white/10 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)]"
        style={{ background: 'rgba(14,14,18,0.72)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)' }}
      >
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between">
          <a href="#inicio" className="font-semibold text-sm tracking-tight text-white hover:opacity-75 transition-opacity">
            FLMMKR <span className="text-white/50 font-normal">Plugins</span>
          </a>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-white/60">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition-all">
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 mr-1">
              {SITE_CONFIG.social.map((soc) => (
                <a
                  key={soc.name}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={soc.name}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  <SocialIcon name={soc.name} className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
            <div className="w-px h-4 bg-white/15" />
            <button
              type="button"
              onClick={openDonate}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 text-[#ff375f]" fill="currentColor" />
              Doar
            </button>
            {mobile ? (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/50 text-xs font-semibold"
              >
                <Monitor className="w-3.5 h-3.5" />
                Só no computador
              </button>
            ) : (
              <button
                onClick={() => requestDownload(os)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-[0_2px_12px_rgba(0,113,227,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-white/60 hover:text-white focus:outline-none"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div
            className="md:hidden border-b border-white/10 px-4 py-4 space-y-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            style={{ background: 'rgba(14,14,18,0.88)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }}
          >
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-white/80 py-1">
                {n.label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/10 flex items-center gap-3">
              {SITE_CONFIG.social.map((soc) => (
                <a
                  key={soc.name}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={soc.name}
                  className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all"
                >
                  <SocialIcon name={soc.name} className="w-3.5 h-3.5" />
                </a>
              ))}
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); openDonate(); }}
                className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold"
              >
                <Heart className="w-3.5 h-3.5 text-[#ff375f]" fill="currentColor" />
                Doar
              </button>
              {mobile ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/50 text-xs font-semibold"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Só no computador
                </button>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); requestDownload(os); }}
                  className="px-5 py-2 rounded-full bg-[#0071e3] text-white text-xs font-semibold shadow-[0_2px_12px_rgba(0,113,227,0.35)]"
                >
                  Baixar
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="inicio" className="relative z-10 min-h-[calc(100svh-3.25rem)] w-full flex flex-col justify-between items-center overflow-hidden pt-16 pb-12 sm:pt-12 md:pb-20 px-5 sm:px-6 lg:px-8 text-center bg-black">
        <div className="absolute inset-0 pointer-events-none select-none z-0" aria-hidden="true">
          {/* Faixas de false color ao fundo, apagadas pela retícula */}
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: 'linear-gradient(115deg, #2a0f45 0%, #0f2a6b 22%, #111 45%, #10391f 60%, #3d2a05 78%, #4a0a0a 100%)' }}
          />
          <div className="absolute inset-0 reticula-pattern" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="hidden sm:block h-4" />

        <div className="relative z-10 w-full max-w-5xl mx-auto my-auto flex flex-col items-center">
          {/* Selo */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[13px] sm:text-sm font-medium border border-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" aria-hidden="true" />
            Grátis hoje e sempre
          </div>

          {/* Título: equilibrado em duas linhas no celular, sem palavra sozinha */}
          <h1 className="mt-5 sm:mt-6 text-[2.5rem] sm:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] text-white leading-[1.05] max-w-4xl text-balance drop-shadow-xl">
            Plugins para DaVinci&nbsp;Resolve.
          </h1>

          {/* Apoio: frase principal mais suave, promessa em destaque */}
          <p className="mt-4 sm:mt-6 max-w-[34ch] sm:max-w-2xl text-[17px] sm:text-2xl leading-[1.5] sm:leading-relaxed tracking-tight text-white/70 text-pretty">
            Feitos para a comunidade do audiovisual e distribuídos de graça.{' '}
            <span className="text-white font-medium">Sem taxa, sem marca d&apos;água e sem cobrança surpresa.</span>
          </p>

          <div className="mt-8 sm:mt-10 w-full flex justify-center">{renderDownload(true)}</div>

          {/* Doação: nível mais baixo da hierarquia, separada do download */}
          <div className="mt-10 sm:mt-12 w-full max-w-sm sm:max-w-lg border-t border-white/10 pt-6">
            <p className="text-[13px] sm:text-sm leading-relaxed text-white/55 text-balance">
              Quer ajudar a criar os próximos?{' '}
              <button type="button" onClick={openDonate} className="font-medium text-white underline underline-offset-4 decoration-[#ff375f] decoration-2 hover:text-[#ff8fa3] transition-colors">
                Faça uma doação
              </button>{' '}
              de qualquer valor. É opcional: os plugins continuam grátis para todo mundo.
            </p>
          </div>
        </div>

        <a href="#plugins" className="relative z-10 mt-10 hidden sm:inline-flex flex-col items-center gap-2.5 group cursor-pointer select-none" aria-label="Ver os plugins">
          <span className="text-xs font-bold tracking-widest text-white/90 uppercase group-hover:text-[#2997ff] transition-colors">
            Conheça os plugins
          </span>
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md hover:bg-white/20 text-white flex items-center justify-center border-2 border-white/90 shadow-lg animate-scroll-bounce transition-all active:scale-90">
            <ChevronDown className="w-6 h-6 stroke-[2.5]" />
          </div>
        </a>
      </section>

      {/* PRONTOS — dark, como a seção de treinamentos */}
      <section id="plugins" className="scroll-section relative z-10 w-full py-16 sm:py-28 border-t border-[#2c2c2e] bg-[#0A0B0E] text-white scroll-mt-11">
        <div className="scroll-content max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:text-left">
            <span className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-3 block">Prontos para baixar</span>
            <h2 className="text-[1.875rem] leading-[1.1] sm:text-5xl sm:leading-tight font-semibold tracking-tight text-balance text-white mb-3">Três plugins, um instalador.</h2>
            <p className="text-[15px] leading-relaxed sm:text-xl text-white/60 max-w-2xl text-balance mx-auto sm:mx-0">
              O pacote FLMMKR FX instala os três de uma vez, na versão gratuita ou na Studio do DaVinci Resolve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {READY_PLUGINS.map((p) => {
              const Visual = PLUGIN_VISUALS[p.id];
              return (
                <article key={p.id} className="rounded-3xl bg-[#16171b] border border-white/10 overflow-hidden flex flex-col">
                  <div className="h-56 bg-[#0d0e11] border-b border-white/10 overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={`Plugin ${p.name} aplicado na viewer do DaVinci Resolve`} loading="lazy"
                        className={p.imageVertical ? 'mx-auto h-full w-auto py-4 object-contain rounded-[18px]' : 'h-full w-full object-cover'}
                      />
                    ) : (
                      <Visual />
                    )}
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col gap-2.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-semibold tracking-tight">{p.name}</h3>
                      {p.beta && (
                        <span className="rounded-full border border-[#ff9f0a]/50 bg-[#ff9f0a]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ffb340]">
                          Beta
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-white/80">{p.tagline}</p>
                    <p className="text-sm text-white/55 leading-relaxed">{p.description}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-14">
            {renderDownload(true)}
          </div>
        </div>
      </section>

      {/* EM PRODUÇÃO — light */}
      <section id="em-producao" className="scroll-section relative z-10 w-full py-16 sm:py-28 border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8 bg-[#f5f5f7] scroll-mt-11">
        <div className="scroll-content max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <span className="text-xs uppercase tracking-widest text-[#86868b] font-semibold mb-3 block">Em produção</span>
            <h2 className="text-[1.875rem] leading-[1.1] sm:text-5xl sm:leading-tight font-semibold tracking-tight text-balance text-[#1d1d1f] mb-3">O que vem por aí.</h2>
            <p className="text-[15px] leading-relaxed sm:text-xl text-[#86868b] max-w-xl mx-auto text-balance">
              Quem tem cadastro recebe o aviso quando cada um sair.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {UPCOMING_PLUGINS.map((p) => {
              return (
                <article key={p.id} className="rounded-3xl bg-white border border-[#e5e5e7] shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 sm:p-8 flex flex-col gap-2.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">{p.name}</h3>
                      <span className="rounded-full bg-[#e8e8ed] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6e6e73]">Em breve</span>
                    </div>
                    <p className="text-sm font-medium text-[#1d1d1f]">{p.tagline}</p>
                    <p className="text-sm text-[#6e6e73] leading-relaxed">{p.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* DOAÇÃO */}
      <section id="doacao" className="scroll-section relative z-10 w-full py-16 sm:py-28 border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8 bg-[#f5f5f7] scroll-mt-11">
        <div className="scroll-content max-w-4xl mx-auto">
          <div className="rounded-3xl bg-white border border-[#e5e5e7] shadow-sm px-6 py-10 sm:p-14 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#ff375f]/10 text-[#ff375f]">
              <Heart className="w-6 h-6" fill="currentColor" />
            </div>
            <h2 className="text-[1.875rem] leading-[1.1] sm:text-5xl sm:leading-tight font-semibold tracking-tight text-balance text-[#1d1d1f] mb-4">Apoie os plugins.</h2>
            <p className="text-[15px] sm:text-lg text-[#6e6e73] max-w-xl mx-auto mb-8 leading-relaxed text-balance">
              Os plugins são gratuitos. Se eles economizam o seu tempo, uma doação de qualquer valor ajuda a manter as atualizações e a lançar os próximos.
            </p>

            <button
              type="button"
              onClick={openDonate}
              className="w-full max-w-[320px] sm:w-auto h-12 px-8 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[15px] sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              Doar com Pix ou cartão
            </button>
            <p className="mt-5 text-xs text-[#86868b]">Pix ou cartão de crédito, a partir de R$ 5. Pagamento processado pelo Asaas.</p>
          </div>
        </div>
      </section>

      {/* CHAMADA FINAL */}
      <section className="scroll-section relative z-10 w-full py-16 sm:py-28 border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8 bg-[#f5f5f7]">
        <div className="scroll-content max-w-4xl mx-auto text-center px-6 py-10 sm:p-16 rounded-3xl bg-white border border-[#e5e5e7] shadow-sm">
          <h2 className="text-[1.875rem] leading-[1.1] sm:text-5xl sm:leading-tight font-semibold tracking-tight text-balance text-[#1d1d1f] mb-4">Baixe e teste hoje.</h2>
          <p className="text-[15px] sm:text-base leading-relaxed text-[#86868b] max-w-lg mx-auto mb-8 text-balance">
            Cadastro grátis, um instalador e os três plugins na sua próxima sessão de cor.
          </p>
          {renderDownload(false)}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-10 sm:py-12 bg-white border-t border-[#d2d2d7]/60 text-[#6e6e73] text-xs px-5 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="font-semibold text-[#1d1d1f] text-sm block mb-1.5">FLMMKR Plugins</span>
            <p className="text-[12px] leading-relaxed text-[#86868b] max-w-[36ch] md:max-w-none text-balance">
              © {new Date().getFullYear()} FLMMKR. DaVinci Resolve é marca da Blackmagic Design; os plugins não são afiliados a ela.
            </p>
          </div>
          {/* Links numa linha e redes sociais na outra (no celular); lado a lado no desktop */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <nav aria-label="Links do rodapé" className="flex items-center gap-5 text-[13px]">
              <Link href="/plugins/termos" className="py-2 text-[#0066cc] hover:underline">Termos de Uso e Privacidade</Link>
              <Link href="/" className="py-2 text-[#0066cc] hover:underline">flmmkr.site</Link>
            </nav>
            <div className="flex items-center gap-3">
              {SITE_CONFIG.social.map((soc) => (
                <a
                  key={soc.name}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#6e6e73] hover:text-[#1d1d1f] border border-[#d2d2d7] transition-colors"
                  aria-label={soc.name}
                >
                  <SocialIcon name={soc.name} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
