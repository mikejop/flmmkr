'use client';

import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Menu, X, Heart, ChevronDown, Download, Monitor } from 'lucide-react';
import { SITE_CONFIG } from '@/config/siteConfig';
import { InstagramIcon, YouTubeIcon, TikTokIcon } from '@/components/SocialIcons';
import { PLUGIN_DOWNLOADS, READY_PLUGINS, UPCOMING_PLUGINS, type PluginOs } from '@/config/plugins';
import { detectOs, isMobileDevice, OS_ICON } from '@/components/plugins/os';
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
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className={`inline-flex cursor-not-allowed items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold ${
              dark ? 'bg-white/10 border border-white/20 text-white/60' : 'bg-[#e8e8ed] border border-[#d2d2d7] text-[#86868b]'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Exclusivo para computador
          </button>
          <p className={`text-xs ${dark ? 'text-white/60' : 'text-[#86868b]'}`}>
            Abra esta página no seu computador (macOS, Windows ou Linux) para baixar.
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
      <section id="inicio" className="relative z-10 min-h-[calc(100svh-3.25rem)] w-full flex flex-col justify-between items-center overflow-hidden pt-12 pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 text-center bg-black">
        <div className="absolute inset-0 pointer-events-none select-none z-0" aria-hidden="true">
          {/* Faixas de false color ao fundo, apagadas pela retícula */}
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: 'linear-gradient(115deg, #2a0f45 0%, #0f2a6b 22%, #111 45%, #10391f 60%, #3d2a05 78%, #4a0a0a 100%)' }}
          />
          <div className="absolute inset-0 reticula-pattern" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="h-4" />

        <div className="relative z-10 max-w-5xl mx-auto my-auto flex flex-col items-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-xs sm:text-sm font-medium mb-6 shadow-sm border border-white/20">
            Grátis hoje e sempre
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.05] max-w-4xl mx-auto mb-6 drop-shadow-xl">
            Plugins para DaVinci Resolve.
          </h1>
          <p className="text-base sm:text-2xl text-white/90 font-normal tracking-tight max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-lg">
            Todos os plugins daqui são feitos para a comunidade do audiovisual e distribuídos de graça. Sem taxa, sem marca d&apos;água e sem cobrança surpresa.
          </p>
          {renderDownload(true)}
          <p className="mt-8 max-w-lg text-sm text-white/60 leading-relaxed text-balance">
            Quer ajudar a criar os próximos? Dá para{' '}
            <button type="button" onClick={openDonate} className="text-white underline underline-offset-4 decoration-[#ff375f] hover:decoration-2">
              fazer uma doação
            </button>
            , de qualquer valor. É opcional: os plugins continuam grátis para todo mundo.
          </p>
        </div>

        <a href="#plugins" className="relative z-10 mt-10 inline-flex flex-col items-center gap-2.5 group cursor-pointer select-none" aria-label="Ver os plugins">
          <span className="text-xs font-bold tracking-widest text-white/90 uppercase group-hover:text-[#2997ff] transition-colors">
            Conheça os plugins
          </span>
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md hover:bg-white/20 text-white flex items-center justify-center border-2 border-white/90 shadow-lg animate-scroll-bounce transition-all active:scale-90">
            <ChevronDown className="w-6 h-6 stroke-[2.5]" />
          </div>
        </a>
      </section>

      {/* PRONTOS — dark, como a seção de treinamentos */}
      <section id="plugins" className="scroll-section relative z-10 w-full py-20 sm:py-28 border-t border-[#2c2c2e] bg-[#0A0B0E] text-white scroll-mt-11">
        <div className="scroll-content max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:text-left">
            <span className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-2 block">Prontos para baixar</span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-3">Três plugins, um instalador.</h2>
            <p className="text-base sm:text-xl text-white/60 max-w-2xl">
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
                  <div className="p-7 sm:p-8 flex flex-col gap-3 flex-1">
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
      <section id="em-producao" className="scroll-section relative z-10 w-full py-20 sm:py-28 border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8 bg-[#f5f5f7] scroll-mt-11">
        <div className="scroll-content max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <span className="text-xs uppercase tracking-widest text-[#86868b] font-semibold mb-2 block">Em produção</span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f] mb-3">O que vem por aí.</h2>
            <p className="text-base sm:text-xl text-[#86868b] max-w-xl mx-auto">
              Quem tem cadastro recebe o aviso quando cada um sair.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {UPCOMING_PLUGINS.map((p) => {
              return (
                <article key={p.id} className="rounded-3xl bg-white border border-[#e5e5e7] shadow-sm overflow-hidden flex flex-col">
                  <div className="p-7 sm:p-8 flex flex-col gap-3 flex-1">
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
      <section id="doacao" className="scroll-section relative z-10 w-full py-20 sm:py-28 border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8 bg-[#f5f5f7] scroll-mt-11">
        <div className="scroll-content max-w-4xl mx-auto">
          <div className="rounded-3xl bg-white border border-[#e5e5e7] shadow-sm p-8 sm:p-14 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#ff375f]/10 text-[#ff375f]">
              <Heart className="w-6 h-6" fill="currentColor" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f] mb-4">Apoie os plugins.</h2>
            <p className="text-base sm:text-lg text-[#6e6e73] max-w-xl mx-auto mb-8 leading-relaxed">
              Os plugins são gratuitos. Se eles economizam o seu tempo, uma doação de qualquer valor ajuda a manter as atualizações e a lançar os próximos.
            </p>

            <button
              type="button"
              onClick={openDonate}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              Doar com Pix ou cartão
            </button>
            <p className="mt-5 text-xs text-[#86868b]">Pix ou cartão de crédito, a partir de R$ 5. Pagamento processado pelo Asaas.</p>
          </div>
        </div>
      </section>

      {/* CHAMADA FINAL */}
      <section className="scroll-section relative z-10 w-full py-20 sm:py-28 border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8 bg-[#f5f5f7]">
        <div className="scroll-content max-w-4xl mx-auto text-center p-10 sm:p-16 rounded-3xl bg-white border border-[#e5e5e7] shadow-sm">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f] mb-4">Baixe e teste hoje.</h2>
          <p className="text-base text-[#86868b] max-w-lg mx-auto mb-8">
            Cadastro grátis, um instalador e os três plugins na sua próxima sessão de cor.
          </p>
          {renderDownload(false)}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-12 bg-white border-t border-[#d2d2d7]/60 text-[#6e6e73] text-xs px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="font-semibold text-[#1d1d1f] text-sm block mb-1">FLMMKR Plugins</span>
            <p className="text-[11px] text-[#86868b]">
              © {new Date().getFullYear()} FLMMKR. DaVinci Resolve é marca da Blackmagic Design; os plugins não são afiliados a ela.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/plugins/termos" className="text-[#0066cc] hover:underline">Termos de Uso e Privacidade</Link>
            <Link href="/" className="text-[#0066cc] hover:underline">flmmkr.site</Link>
            {SITE_CONFIG.social.map((soc) => (
              <a
                key={soc.name}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#6e6e73] hover:text-[#1d1d1f] border border-[#d2d2d7] transition-colors"
                aria-label={soc.name}
              >
                <SocialIcon name={soc.name} className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
