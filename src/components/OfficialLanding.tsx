'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PRODUCTS, Product } from '@/config/products';
import { SITE_CONFIG } from '@/config/siteConfig';
import { GENERAL_FAQ } from '@/config/faq';
import { SocialPlatform } from '@/utils/detectBrowser';
import { trackProductClick, trackSocialClick, trackPageView } from '@/utils/analytics';
import { InstagramIcon, YouTubeIcon, TikTokIcon } from '@/components/SocialIcons';
import { DockCarousel } from '@/components/DockCarousel';
import { ReticulaBackground } from '@/components/ReticulaBackground';
import { getRandomAuthorPhotos, AuthorPhotoPair } from '@/utils/authorPhotos';
import { LoginModal } from '@/components/LoginModal';
import {
  Play,
  Film,
  Sliders,
  Camera,
  Smartphone,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  Award,
  Menu,
  X
} from 'lucide-react';

interface OfficialLandingProps {
  platform: SocialPlatform;
  onSwitchToSocial?: () => void;
}

const PRODUTORAS_LOGOS = [
  { name: 'Astronautas Filmes', src: '/assets/empresas/astronautas-filmes.jpg' },
  { name: 'At Work', src: '/assets/empresas/at-work.jpg' },
  { name: 'Embratur', src: '/assets/empresas/embratur.png' },
  { name: 'Malala Filmes', src: '/assets/empresas/malala-filmes.jpg' },
  { name: 'Mandrill', src: '/assets/empresas/mandrill.png' },
  { name: 'Maria Quitéria', src: '/assets/empresas/maria-quiteria.jpg' },
  { name: 'Mariposa Filmes', src: '/assets/empresas/mariposa-filmes.jpg' },
  { name: 'Pantanal Filmes', src: '/assets/empresas/pantanal-filmes.jpg' },
  { name: 'Plano B', src: '/assets/empresas/plano-b.jpg' },
];

export const OfficialLanding: React.FC<OfficialLandingProps> = ({
  platform,
  onSwitchToSocial
}) => {
  const [authorPhotos, setAuthorPhotos] = useState<AuthorPhotoPair>({
    profileSrc: '/assets/mike-photos/01.jpg',
    bgSrc: '/assets/bg/about-mike/02.jpg'
  });
  const [logos, setLogos] = useState<{ name: string; src: string }[]>(PRODUTORAS_LOGOS);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const loginParam = searchParams.get('login');
    if (loginParam === 'required' || loginParam === 'true') {
      setLoginModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    setAuthorPhotos(getRandomAuthorPhotos());

    // Dynamically fetch any newly added logos from the folder
    fetch('/api/empresas')
      .then((res) => res.json())
      .then((data) => {
        if (data.logos && data.logos.length > 0) {
          setLogos(data.logos);
        }
      })
      .catch(() => {});
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  useEffect(() => {
    trackPageView('official', platform);
  }, [platform]);

  // High-performance Scroll Section Observer (Zero DOM query overhead during scroll)
  useEffect(() => {
    const sections = document.querySelectorAll('.scroll-section');
    const observer = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.remove('is-visible');
          }
        }
      },
      {
        threshold: 0.15,
        rootMargin: '100px 0px 100px 0px'
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleProductClick = (product: Product) => {
    trackProductClick(product.id, product.name, product.url, platform);
  };

  const handleSocialClick = (name: string) => {
    trackSocialClick(name, platform);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#1d1d1f] font-sans antialiased selection:bg-[#0071e3]/20 selection:text-[#0071e3]">
      {/* Login Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {/* Glassmorphism Header Navigation — Dark Glass */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] transition-all duration-300"
        style={{ background: 'rgba(14,14,18,0.72)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)' }}
      >
        {/* Top specular rim */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#inicio"
            className="font-semibold text-sm tracking-tight text-white hover:opacity-75 transition-opacity"
          >
            FLMMKR
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-white/60">
            <a href="#inicio" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition-all">
              Início
            </a>
            <a href="#treinamentos" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition-all">
              Treinamentos
            </a>
            <a href="#sobre" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition-all">
              Sobre
            </a>
            <a href="#diferenciais" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition-all">
              Diferenciais
            </a>
            <a href="#faq" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition-all">
              FAQ
            </a>
          </nav>

          {/* Right Side: Social Icons + Acessar button */}
          <div className="hidden md:flex items-center gap-3">
            {/* Social Icons */}
            <div className="flex items-center gap-1.5 mr-1">
              {SITE_CONFIG.social.map((soc) => (
                <a
                  key={soc.name}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick(soc.name)}
                  aria-label={soc.name}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  {soc.name === 'Instagram' && <InstagramIcon className="w-3.5 h-3.5" />}
                  {soc.name === 'YouTube' && <YouTubeIcon className="w-3.5 h-3.5" />}
                  {soc.name === 'TikTok' && <TikTokIcon className="w-3.5 h-3.5" />}
                </a>
              ))}
            </div>

            {/* Separator */}
            <div className="w-px h-4 bg-white/15" />

            {/* Acessar button */}
            <button
              onClick={() => setLoginModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-[0_2px_12px_rgba(0,113,227,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all active:scale-95"
            >
              Acessar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-white/60 hover:text-white focus:outline-none"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown — Dark Glass */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-b border-white/10 px-4 py-4 space-y-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            style={{ background: 'rgba(14,14,18,0.88)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }}
          >
            <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-white/80 py-1">Início</a>
            <a href="#treinamentos" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-white/80 py-1">Treinamentos</a>
            <a href="#sobre" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-white/80 py-1">Sobre</a>
            <a href="#diferenciais" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-white/80 py-1">Diferenciais</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-white/80 py-1">FAQ</a>
            <div className="pt-3 border-t border-white/10 flex items-center gap-3">
              {/* Social icons on mobile */}
              {SITE_CONFIG.social.map((soc) => (
                <a
                  key={soc.name}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={soc.name}
                  className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all"
                >
                  {soc.name === 'Instagram' && <InstagramIcon className="w-3.5 h-3.5" />}
                  {soc.name === 'YouTube' && <YouTubeIcon className="w-3.5 h-3.5" />}
                  {soc.name === 'TikTok' && <TikTokIcon className="w-3.5 h-3.5" />}
                </a>
              ))}
              <button
                onClick={() => { setMobileMenuOpen(false); setLoginModalOpen(true); }}
                className="ml-auto px-5 py-2 rounded-full bg-[#0071e3] text-white text-xs font-semibold shadow-[0_2px_12px_rgba(0,113,227,0.35)]"
              >
                Acessar
              </button>
            </div>
          </div>
        )}
      </header>

      {/* FULLSCREEN HERO SECTION WITH PURE BACKGROUND VIDEO & ANIMATED SCROLL INDICATOR */}
      <section id="inicio" className="relative z-10 min-h-screen h-screen w-full flex flex-col justify-between items-center overflow-hidden pt-12 pb-20 md:pb-24 px-4 sm:px-6 lg:px-8 text-center bg-black snap-start snap-always scroll-mt-11">
        {/* Full Background Video Layer - 100% Pure without masks or effects */}
        {/* Full Background Video Layer - 100% Pure Background Video without player controls */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          <iframe
            src="https://www.youtube-nocookie.com/embed/RMKnx99UCUA?autoplay=1&mute=1&controls=0&loop=1&playlist=RMKnx99UCUA&playsinline=1&rel=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3&autohide=1"
            title="FLMMKR Background Video"
            className="absolute top-1/2 left-1/2 w-[300%] h-[300%] min-w-[300vw] min-h-[300vh] -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none select-none opacity-100 border-none"
            allow="autoplay; encrypted-media"
            tabIndex={-1}
          />
          {/* Retícula Overlay (Black dots grid filter over Hero video) */}
          <div
            className="absolute inset-0 z-5 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.8) 1.2px, transparent 1.2px)`,
              backgroundSize: '5px 5px'
            }}
          />
          {/* Transparent Shield Overlay to prevent any YouTube player interaction or control popups */}
          <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto bg-transparent select-none" aria-hidden="true" />
        </div>

        {/* Top Filler for Centering */}
        <div className="h-4" />

        {/* Hero Content (Centered) */}
        <div className="relative z-10 max-w-5xl mx-auto my-auto flex flex-col items-center">
          {/* Category Pill */}
          <div className="inline-block px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-xs sm:text-sm font-medium mb-6 shadow-sm border border-white/20">
            Treinamentos Audiovisual
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-semibold tracking-tight text-white leading-[1.05] max-w-4xl mx-auto mb-6 drop-shadow-xl">
            Aprenda a criar imagens melhores.
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-2xl text-white/90 font-normal tracking-tight max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-lg">
            Direção de Fotografia, Color Grading no DaVinci Resolve e produção audiovisual prática de nível profissional.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <a
              href="/produtos/color-master-produto"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold transition-all shadow-xl active:scale-95 text-center"
            >
              Conhecer Color Master - Produtos
            </a>
            <a
              href="#sobre"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/30 text-sm font-semibold transition-all text-center flex items-center justify-center gap-1 group shadow-lg backdrop-blur-md"
            >
              <span>Conhecer o Professor</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* ANIMATED TRANSPARENT OUTLINED SCROLL DOWN INDICATOR */}
        <a
          href="#treinamentos"
          className="relative z-10 mb-6 sm:mb-8 inline-flex flex-col items-center gap-2.5 group cursor-pointer select-none"
          aria-label="Rolar para baixo"
        >
          <span className="text-xs font-bold tracking-widest text-white/90 uppercase group-hover:text-[#2997ff] transition-colors drop-shadow-md">
            Role para explorar
          </span>
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md hover:bg-white/20 text-white flex items-center justify-center border-2 border-white/90 shadow-lg animate-scroll-bounce transition-all active:scale-90">
            <ChevronDown className="w-6 h-6 stroke-[2.5]" />
          </div>
        </a>
      </section>

      {/* TREINAMENTOS SECTION WITH MACOS DOCK BAR CAROUSEL & DARK BG (FULL HORIZONTAL SCREEN SPAN) */}
      <section id="treinamentos" className="scroll-section relative z-10 min-h-screen w-full flex flex-col justify-center items-center py-16 sm:py-20 border-t border-[#2c2c2e] bg-[#0A0B0E] text-white overflow-hidden snap-start snap-always scroll-mt-11">
        <div className="scroll-content w-full flex flex-col items-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center sm:text-left w-full">
            <span className="text-xs uppercase tracking-widest text-[#2997ff] font-bold block mb-2">
              FORMAÇÃO PROFISSIONAL
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-3">
              Treinamentos
            </h2>
          </div>

          {/* Dock Carousel - Full Horizontal Viewport Width */}
          <DockCarousel products={PRODUCTS} onProductClick={handleProductClick} />
        </div>
      </section>

      {/* APPLE ABOUT SECTION (LIGHT MODE WITH RETÍCULA BG) */}
      <section id="sobre" className="scroll-section relative z-10 min-h-screen w-full flex flex-col justify-center items-center py-16 sm:py-20 border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8 bg-[#f5f5f7] snap-start snap-always scroll-mt-11 overflow-hidden">
        <ReticulaBackground bgImageSrc={authorPhotos.bgSrc} />

        <div className="scroll-content max-w-5xl mx-auto w-full relative z-10">
          <div className="rounded-3xl bg-[#ffffff]/90 backdrop-blur-md border border-[#e5e5e7] p-8 sm:p-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex justify-center items-center">
                <div className="relative w-full max-w-[260px] sm:max-w-[280px] rounded-3xl overflow-hidden border border-[#d2d2d7] bg-[#f5f5f7] shadow-md group">
                  <img
                    src={authorPhotos.profileSrc}
                    alt={SITE_CONFIG.author.name}
                    className="w-full h-auto object-contain block rounded-3xl transition-transform duration-500 ease-quadratic hover:scale-[1.02]"
                  />
                </div>
              </div>

              <div className="md:col-span-8">
                <span className="text-xs uppercase tracking-widest text-[#86868b] font-semibold mb-2 block">
                  Sobre o Professor
                </span>
                <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f] mb-4">
                  {SITE_CONFIG.author.name}
                </h2>
                <div className="space-y-4 text-base sm:text-lg text-[#6e6e73] leading-relaxed font-normal">
                  <p>
                    <span className="font-semibold text-[#1d1d1f]">Diretor, diretor de fotografia, colorista e profissional de pós-produção</span>, com <span className="font-medium text-[#3a3a3c]">mais de 20 anos de experiência no audiovisual</span>.
                  </p>
                  <p>
                    Ao longo da carreira, trabalhou em diferentes etapas da produção, do set à pós-produção, desenvolvendo uma <span className="font-semibold text-[#1d1d1f]">visão prática e integrada sobre a construção da imagem</span>. É ex-professor de Color Grading da <strong className="font-semibold text-[#1d1d1f]">EBAC</strong> (Escola Britânica de Artes Criativas e Tecnologia).
                  </p>
                  <p>
                    Hoje, além de atuar no mercado, Michael dedica parte do seu trabalho ao ensino. Nos seus treinamentos, <span className="font-bold text-[#1d1d1f] tracking-tight">transforma a experiência adquirida em projetos reais em conhecimento aplicável</span>, ensinando técnica, fundamentos e, principalmente, <span className="font-semibold text-[#2c2c2e]">como tomar decisões diante dos desafios que aparecem em uma produção</span>.
                  </p>
                  <p className="font-semibold text-[#1d1d1f] pt-1">
                    Seu objetivo é <span className="font-bold">formar profissionais mais preparados, seguros e capazes de entregar trabalhos melhores no mercado.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Produtoras Atendidas Carousel — Full Width across bottom of card with true Alpha Transparency Fade */}
            <div className="mt-10 pt-8 border-t border-[#e5e5e7]/80 w-full">
              <span className="text-xs uppercase tracking-widest text-[#86868b] font-semibold mb-4 block">
                Produtoras Atendidas
              </span>
              <div
                className="relative w-full overflow-hidden select-none pointer-events-none marquee-container"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                }}
              >
                {/* Track 1 */}
                <div className="marquee-track py-2">
                  {(logos.length > 0 && logos.length < 12 ? [...logos, ...logos] : logos).map((logo, lIdx) => (
                    <div
                      key={`t1-${lIdx}`}
                      className="shrink-0 rounded-2xl overflow-hidden border border-[#e5e5e7] shadow-xs flex items-center justify-center bg-white"
                    >
                      <img
                        src={logo.src}
                        alt={logo.name}
                        className="h-14 sm:h-18 w-auto max-w-[170px] object-cover block"
                      />
                    </div>
                  ))}
                </div>

                {/* Track 2 (Exact clone to create continuous seamless 0% -> -100% loop) */}
                <div className="marquee-track py-2" aria-hidden="true">
                  {(logos.length > 0 && logos.length < 12 ? [...logos, ...logos] : logos).map((logo, lIdx) => (
                    <div
                      key={`t2-${lIdx}`}
                      className="shrink-0 rounded-2xl overflow-hidden border border-[#e5e5e7] shadow-xs flex items-center justify-center bg-white"
                    >
                      <img
                        src={logo.src}
                        alt=""
                        className="h-14 sm:h-18 w-auto max-w-[170px] object-cover block"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPLE BENEFITS BENTO GRID (LIGHT MODE) */}
      <section id="diferenciais" className="scroll-section relative z-10 min-h-screen w-full flex flex-col justify-center items-center py-16 sm:py-20 border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8 bg-[#f5f5f7] snap-start snap-always scroll-mt-11">
        <div className="scroll-content max-w-6xl mx-auto w-full">
          <div className="mb-10 text-center">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f] mb-3">
              Metodologia desenvolvida para o mercado real.
            </h2>
            <p className="text-base sm:text-xl text-[#86868b] font-normal max-w-xl mx-auto">
              Aqui, você aprende com materiais reais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
                  Metodologia desenvolvida para o mercado real
                </h3>
                <p className="text-sm sm:text-base font-medium text-[#1d1d1f] mb-3 leading-relaxed">
                  Aqui, você aprende da mesma forma que um profissional trabalha no mercado.
                </p>
                <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed">
                  Nossa metodologia foi desenvolvida a partir de <strong className="text-[#1d1d1f] font-semibold">projetos reais produzidos para clientes</strong>, utilizando situações, decisões e arquivos que fazem parte de uma produção profissional. Durante o treinamento, você tem acesso aos materiais e acompanha o processo como se estivesse dentro de um set de filmagem ou de uma ilha de edição, entendendo não apenas <strong className="text-[#1d1d1f] font-semibold">o que fazer</strong>, mas principalmente <strong className="text-[#1d1d1f] font-semibold">por que fazer</strong>.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
                  Aprenda com situações que acontecem de verdade
                </h3>
                <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed mb-3">
                  Em vez de exercícios genéricos, você trabalha com demandas, problemas e decisões que fazem parte da rotina profissional. Isso aproxima o aprendizado da realidade e ajuda você a desenvolver não apenas conhecimento técnico, mas também <strong className="text-[#1d1d1f] font-semibold">olhar, raciocínio e capacidade de decisão</strong>.
                </p>
                <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed">
                  Você aprende a analisar um projeto, identificar problemas, encontrar soluções e chegar a um resultado profissional, seguindo um processo muito próximo do que encontrará no mercado.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-3">
                  E isso continua depois do treinamento
                </h3>
                <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed mb-3">
                  Ao trabalhar com projetos reais, você também constrói material que pode demonstrar sua capacidade profissional. Para quem ainda não tem muitos trabalhos no portfólio, essa experiência pode ser especialmente importante: você passa a ter contato com materiais profissionais e aprende a apresentar melhor aquilo que sabe fazer.
                </p>
                <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed">
                  O objetivo é que, ao final do treinamento, você não tenha apenas assistido às aulas. <strong className="text-[#1d1d1f] font-semibold">Você tenha desenvolvido repertório, prática e mais confiança para aplicar esse conhecimento em projetos reais.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* 3 Summary Feature Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#ffffff] border border-[#e5e5e7] shadow-xs">
              <h4 className="text-sm sm:text-base uppercase tracking-wider text-[#0071e3] font-bold block mb-2">
                Projetos Reais
              </h4>
              <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed">
                Aprenda a partir de trabalhos produzidos para clientes e situações que realmente acontecem no mercado.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#ffffff] border border-[#e5e5e7] shadow-xs">
              <h4 className="text-sm sm:text-base uppercase tracking-wider text-[#0071e3] font-bold block mb-2">
                Prática Profissional
              </h4>
              <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed">
                Tenha acesso aos arquivos e acompanhe o processo como se estivesse no set, na pós-produção ou na ilha de edição.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#ffffff] border border-[#e5e5e7] shadow-xs">
              <h4 className="text-sm sm:text-base uppercase tracking-wider text-[#0071e3] font-bold block mb-2">
                Portfólio e Repertório
              </h4>
              <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed">
                Desenvolva trabalhos, decisões e resultados que ajudam você a construir experiência e apresentar melhor seu trabalho profissional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* APPLE FAQ SECTION (LIGHT MODE) */}
      <section id="faq" className="scroll-section relative z-10 min-h-screen w-full flex flex-col justify-center items-center py-16 sm:py-20 border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8 bg-[#f5f5f7] snap-start snap-always scroll-mt-11">
        <div className="scroll-content max-w-4xl mx-auto w-full">
          <div className="mb-10 text-center">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f] mb-3">
              Perguntas frequentes
            </h2>
            <p className="text-base sm:text-xl text-[#86868b] font-normal max-w-xl mx-auto">
              Tudo o que você precisa saber sobre a metodologia, formato e acesso aos treinamentos FLMMKR.
            </p>
          </div>

          <div className="space-y-4">
            {GENERAL_FAQ.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="rounded-2xl bg-[#ffffff] border border-[#e5e5e7] overflow-hidden shadow-xs transition-all">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 group focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors leading-snug">
                      {faq.question}
                    </h3>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#0071e3] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#86868b] shrink-0 group-hover:text-[#1d1d1f]" />
                    )}
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity,padding] duration-300 ease-quadratic ${
                      isOpen ? 'grid-rows-[1fr] opacity-100 px-6 pb-6 pt-4 border-t border-[#e5e5e7]' : 'grid-rows-[0fr] opacity-0 px-6 py-0 border-t-0'
                    }`}
                  >
                    <div className="overflow-hidden space-y-3 text-sm sm:text-base text-[#6e6e73] leading-relaxed font-normal">
                      {faq.answer.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* APPLE CALL TO ACTION & FOOTER (LIGHT MODE) */}
      <section id="contato" className="scroll-section relative z-10 min-h-screen w-full flex flex-col justify-between items-center pt-16 sm:pt-20 border-t border-[#d2d2d7]/60 bg-[#f5f5f7] snap-start snap-always scroll-mt-11">
        <div className="scroll-content w-full flex flex-col justify-between items-center my-auto">
          <div className="h-4" />
          <div className="max-w-4xl mx-auto text-center p-10 sm:p-16 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm my-auto w-full px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f] mb-4">
              Evolua a qualidade das suas imagens.
            </h2>
            <p className="text-base text-[#86868b] max-w-lg mx-auto mb-8 font-normal">
              Escolha o treinamento ideal e tenha acesso imediato a todas as aulas práticas.
            </p>
            <a
              href="#treinamentos"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              Ver Treinamentos Disponíveis
            </a>
          </div>
        </div>
      </section>

      {/* APPLE FOOTER (LIGHT MODE) */}
      <footer className="relative z-10 py-12 bg-[#ffffff] border-t border-[#d2d2d7]/60 text-[#6e6e73] text-xs px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-semibold text-[#1d1d1f] text-sm block mb-1">
              FLMMKR
            </span>
            <p className="text-[11px] text-[#86868b]">
              © {new Date().getFullYear()} FLMMKR. Todos os direitos reservados.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {SITE_CONFIG.social.map((soc) => (
              <a
                key={soc.name}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleSocialClick(soc.name)}
                className="p-2 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#6e6e73] hover:text-[#1d1d1f] border border-[#d2d2d7] transition-colors"
                aria-label={soc.name}
              >
                {soc.name === 'Instagram' && <InstagramIcon className="w-4 h-4" />}
                {soc.name === 'YouTube' && <YouTubeIcon className="w-4 h-4" />}
                {soc.name === 'TikTok' && <TikTokIcon className="w-4 h-4" />}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
