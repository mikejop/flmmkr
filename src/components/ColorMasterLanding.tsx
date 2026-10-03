'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SITE_CONFIG } from '@/config/siteConfig';
import { trackProductClick, trackSocialClick } from '@/utils/analytics';
import { InstagramIcon, YouTubeIcon, TikTokIcon } from '@/components/SocialIcons';
import { ReticulaBackground } from '@/components/ReticulaBackground';
import { getRandomAuthorPhotos, AuthorPhotoPair } from '@/utils/authorPhotos';
import { LoginModal } from '@/components/LoginModal';
import {
  Play,
  Film,
  Sliders,
  Camera,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Monitor,
  ShieldCheck,
  Check,
  Folder,
  Tv
} from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeLabel?: string;
  afterLabel?: string;
  beforeTitle?: string;
  afterTitle?: string;
  heightClass?: string;
}

const PRODUTORAS_LOGOS = [
  { name: 'Astronautas Filmes', src: '/assets/empresas/astronautas-filmes.jpg' },
  { name: 'At Work', src: '/assets/empresas/at-work.jpg' },
  { name: 'Malala Filmes', src: '/assets/empresas/malala-filmes.jpg' },
  { name: 'Mariposa Filmes', src: '/assets/empresas/mariposa-filmes.jpg' },
  { name: 'Pantanal Filmes', src: '/assets/empresas/pantanal-filmes.jpg' },
  { name: 'Plano B', src: '/assets/empresas/plano-b.jpg' },
];

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeLabel = 'FOOTAGE RAW / FLAT',
  afterLabel = 'GRADE PUBLICITÁRIO FINAL',
  beforeTitle = 'Sem contraste, cores desbotadas',
  afterTitle = 'Contraste, densidade e look de comercial',
  heightClass = 'h-[360px] sm:h-[450px] md:h-[520px]'
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPos(percentage);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className={`relative w-full ${heightClass} rounded-3xl overflow-hidden select-none border border-[#d2d2d7] shadow-xl cursor-ew-resize bg-[#ffffff] group`}
    >
      {/* AFTER IMAGE (FULL WIDTH BACKGROUND) */}
      <div className="absolute inset-0 w-full h-full bg-[#1c1c1e] flex flex-col justify-between p-6 sm:p-8">
        <div className="flex items-center justify-between z-10">
          <span className="px-3.5 py-1 rounded-full bg-[#0071e3] text-white text-xs font-semibold tracking-wide">
            {afterLabel}
          </span>
          <span className="text-xs font-medium text-white/80 bg-black/40 px-3 py-1 rounded-full border border-white/20">
            DaVinci Resolve Grade
          </span>
        </div>

        {/* Visual Simulated Commercial Grade Content */}
        <div className="my-auto flex flex-col items-center justify-center text-center py-8">
          <div className="w-20 h-20 rounded-full bg-[#0071e3]/20 border border-[#0071e3]/40 flex items-center justify-center mb-4">
            <Tv className="w-8 h-8 text-[#2997ff]" />
          </div>
          <span className="text-xl sm:text-3xl font-semibold tracking-tight text-white max-w-md">
            {afterTitle}
          </span>
          <span className="text-sm text-white/70 mt-2 font-normal">
            Rec.709 • Film Print Emulation • High Contrast
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-white/70 z-10 font-medium">
          <span>Look: Publicidade TV</span>
          <span>Resultado Final</span>
        </div>
      </div>

      {/* BEFORE IMAGE (CLIPPED SLIDER OVERLAY) */}
      <div
        className="absolute top-0 bottom-0 left-0 overflow-hidden bg-[#8e8e93] border-r border-white/40 flex flex-col justify-between p-6 sm:p-8 z-20"
        style={{ width: `${sliderPos}%` }}
      >
        <div className="flex items-center justify-between z-10 whitespace-nowrap">
          <span className="px-3.5 py-1 rounded-full bg-black/40 border border-white/30 text-white text-xs font-semibold">
            {beforeLabel}
          </span>
        </div>

        {/* Visual Simulated Flat Footage */}
        <div className="my-auto flex flex-col items-center justify-center text-center py-8 whitespace-nowrap">
          <div className="w-20 h-20 rounded-full bg-black/20 border border-white/20 flex items-center justify-center mb-4 opacity-75">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <span className="text-xl sm:text-3xl font-semibold text-white/90 max-w-md">
            {beforeTitle}
          </span>
          <span className="text-sm text-white/70 mt-2 font-normal">
            LOG / Flat Profile • Sem Tratamento
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-white/80 z-10 whitespace-nowrap font-medium">
          <span>Camera Native</span>
          <span>RAW Original</span>
        </div>
      </div>

      {/* SLIDER DIVIDER DRAG HANDLE */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-[#0071e3] cursor-ew-resize z-30 shadow-[0_0_15px_rgba(0,113,227,0.8)]"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-bold shadow-xl border-2 border-white group-hover:scale-110 transition-transform">
          <div className="flex items-center gap-0.5 text-xs font-black">
            ‹›
          </div>
        </div>
      </div>
    </div>
  );
};

export const ColorMasterLanding: React.FC = () => {
  const [authorPhotos, setAuthorPhotos] = useState<AuthorPhotoPair>({
    profileSrc: '/assets/mike-photos/01.jpg',
    bgSrc: '/assets/bg/about-mike/02.jpg'
  });
  const [logos, setLogos] = useState<{ name: string; src: string }[]>(PRODUTORAS_LOGOS);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

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
    setOpenFaq(openFaq === index ? null : index);
  };

  const stepsPipeline = [
    {
      title: '01. FOOTAGE ORIGINAL',
      subtitle: 'Perfil LOG/Flat direto da câmera',
      desc: 'Imagem lavada, sem profundidade de cor ou contraste definido.',
      colorBg: 'bg-[#1c1c1e] text-white',
      badge: 'RAW Original'
    },
    {
      title: '02. BALANCE',
      subtitle: 'Exposição, Contraste e Temperatura',
      desc: 'Ajuste inicial dos pontos de preto, branco e correção de tom de pele.',
      colorBg: 'bg-[#2c2c2e] text-white',
      badge: 'Correção Primária'
    },
    {
      title: '03. MATCHING',
      subtitle: 'Harmonização entre diferentes planos',
      desc: 'Garantia de continuidade visual perfeita entre os cortes do comercial.',
      colorBg: 'bg-[#1d1d1f] text-white',
      badge: 'Continuidade Visual'
    },
    {
      title: '04. LOOK',
      subtitle: 'Identidade visual do produto',
      desc: 'Densidade de cores, separação cromática e tom publicitário marcante.',
      colorBg: 'bg-[#0071e3] text-white',
      badge: 'Look Development'
    },
    {
      title: '05. FINAL',
      subtitle: 'Acabamento & Film Print Emulation',
      desc: 'Textura de película, controle de destaques e entrega pronta para TV e Web.',
      colorBg: 'bg-[#0051a8] text-white',
      badge: 'Resultado Comercial'
    }
  ];

  const faqList = [
    {
      q: 'Preciso saber usar o DaVinci Resolve?',
      a: 'A masterclass foi estruturada para ser prática e direta. É ideal que você já conheça a interface básica do DaVinci Resolve, pois o foco principal é ensinar a metodologia de tomada de decisões e criação do look comercial.'
    },
    {
      q: 'A masterclass é para iniciantes?',
      a: 'É perfeita tanto para quem está começando no color grading e quer aprender a ordem correta das decisões, quanto para profissionais que desejam elevar o nível estético do seu trabalho com imagens de produto e publicidade.'
    },
    {
      q: 'Vou receber o footage utilizado?',
      a: 'Sim! Você receberá acesso aos arquivos do projeto e às footages de produto utilizadas nas aulas para praticar exatamente a mesma cena acompanhando a masterclass.'
    },
    {
      q: 'Preciso do DaVinci Resolve Studio (pago)?',
      a: 'A maioria esmagadora dos conceitos e técnicas pode ser executada perfeitamente na versão gratuita do DaVinci Resolve. Ferramentas específicas como o Dehancer Pro são abordadas como módulos de acabamento opcional.'
    },
    {
      q: 'O Dehancer Pro é obrigatório?',
      a: 'Não. O Dehancer Pro é apresentado em um módulo especial para quem deseja explorar film emulation avançado, mas você aprenderá a construir o look completo usando os recursos nativos do DaVinci Resolve.'
    },
    {
      q: 'Preciso ter o Look Creator?',
      a: 'Não. Mostramos a aplicação prática do Look Creator como ferramenta auxiliar de Look Development, mas ensinamos todo o raciocínio fundamentado para que você crie seus próprios grades independentemente de plugins.'
    },
    {
      q: 'Posso usar as técnicas em outros tipos de projetos?',
      a: 'Com certeza! Embora o foco principal seja imagens de produto e comerciais, a metodologia de análise, balanceamento, matching e construção de look aplica-se a videoclipes, filmes, documentários e conteúdo corporativo.'
    },
    {
      q: 'Por quanto tempo terei acesso?',
      a: 'Você terá acesso vitalício a todas as aulas, atualizações futuras e materiais de apoio disponibilizados na plataforma.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased selection:bg-[#0071e3]/20 selection:text-[#0071e3]">
      {/* Login Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {/* Glassmorphism Header Navigation — Dark Glass */}
      <header
        className="sticky top-0 z-50 w-full border-b border-white/10 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] transition-all duration-300"
        style={{ background: 'rgba(14,14,18,0.72)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)' }}
      >
        {/* Top specular rim */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between">
          <a href="/" className="font-semibold text-sm tracking-tight text-white hover:opacity-75 transition-opacity">
            FLMMKR
          </a>

          <span className="hidden sm:inline-block text-xs text-white/70 font-semibold tracking-wide bg-white/8 px-3.5 py-1 rounded-full border border-white/15"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            COLOR MASTER | PRODUTO
          </span>

          <div className="flex items-center gap-3">
            {/* Social Icons */}
            <div className="hidden sm:flex items-center gap-1.5">
              {SITE_CONFIG.social.map((soc) => (
                <a
                  key={soc.name}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={soc.name}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  {soc.name === 'Instagram' && <InstagramIcon className="w-3.5 h-3.5" />}
                  {soc.name === 'YouTube' && <YouTubeIcon className="w-3.5 h-3.5" />}
                  {soc.name === 'TikTok' && <TikTokIcon className="w-3.5 h-3.5" />}
                </a>
              ))}
              <div className="w-px h-4 bg-white/15 mx-1" />
            </div>

            {/* Acessar button */}
            <button
              onClick={() => setLoginModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 hover:border-white/30 transition-all active:scale-95"
            >
              Acessar
            </button>

            <a
              href="#oferta"
              className="px-4 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-[0_2px_12px_rgba(0,113,227,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Garantir Acesso</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH PURE BACKGROUND VIDEO */}
      <section className="relative z-10 overflow-hidden pt-16 pb-24 md:pt-28 md:pb-36 px-4 sm:px-6 lg:px-8 bg-black">
        {/* Full Background Video Layer - 100% Pure without masks or effects */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          <iframe
            src="https://www.youtube-nocookie.com/embed/RMKnx99UCUA?autoplay=1&mute=1&controls=0&loop=1&playlist=RMKnx99UCUA&playsinline=1&rel=0&modestbranding=1&enablejsapi=1"
            title="Color Master Background Video"
            className="absolute top-1/2 left-1/2 w-[250%] h-[250%] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none opacity-100"
            allow="autoplay; encrypted-media"
          />
          {/* Retícula Overlay (Black dots grid filter over Hero video) */}
          <div
            className="absolute inset-0 z-5 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.8) 1.2px, transparent 1.2px)`,
              backgroundSize: '5px 5px'
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
            {/* Top Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-xs font-medium mb-6 border border-white/20 shadow-sm">
              <Sliders className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>COLOR MASTER | PRODUTO</span>
            </div>

            {/* Headline H1 */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.08] mb-6 drop-shadow-xl">
              Transforme uma boa fotografia de produto em uma imagem de comercial.
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-xl text-white/90 font-normal leading-relaxed mb-8 max-w-2xl drop-shadow-lg">
              Aprenda, na prática, como analisar, equilibrar, igualar e construir o look de imagens de produto no DaVinci Resolve.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-4">
              <a
                href="#oferta"
                onClick={() => trackProductClick('color-master-produto', 'Color Master - Produtos', '#oferta', 'other')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-sm transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Quero aprender Color Grading de Produto</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Trust line */}
            <p className="text-sm text-white/80 flex items-center gap-1.5 justify-center font-normal drop-shadow-md">
              <Check className="w-4 h-4 text-[#2997ff]" />
              <span>Aulas práticas usando footage de produção real.</span>
            </p>
          </div>

          {/* Hero Interactive Before / After Comparison Slider */}
          <div className="w-full max-w-4xl mx-auto">
            <BeforeAfterSlider
              beforeLabel="FOOTAGE ORIGINAL (FLAT)"
              afterLabel="GRADE COMERCIAL FINAL"
              beforeTitle="Sem presença de marca, sem contraste"
              afterTitle="Densidade visual e brilho de comercial de TV"
            />
            <div className="mt-3 text-center">
              <span className="text-sm text-white/80 flex items-center justify-center gap-1 drop-shadow-sm font-medium">
                Arraste o divisor para comparar o resultado antes e depois da grading
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 02. A PROPOSTA VISUAL (APPLE LIGHT BENTO) */}
      <section className="relative z-10 py-16 md:py-24 bg-[#f5f5f7] border-y border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
              METODOLOGIA APLICADA À PUBLICIDADE
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
              Você vai aprender a construir a imagem, não apenas aplicar um LUT.
            </h2>
            <p className="text-base sm:text-lg text-[#6e6e73] mt-3 font-normal">
              Veja o resultado aplicado a diferentes categorias de produtos comerciais exigentes.
            </p>
          </div>

          {/* 4 Product Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cosmético */}
            <div className="p-6 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#0071e3] bg-[#0071e3]/10 px-3 py-1 rounded-full border border-[#0071e3]/20">
                  COSMÉTICO & BELEZA
                </span>
                <span className="text-xs font-medium text-[#86868b]">Pele & Reflexos</span>
              </div>
              <BeforeAfterSlider
                heightClass="h-[260px] sm:h-[300px]"
                beforeTitle="Pele lavada e sem vida"
                afterTitle="Tom de pele radiante & contraste orgânico"
              />
            </div>

            {/* Bebida */}
            <div className="p-6 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#0071e3] bg-[#0071e3]/10 px-3 py-1 rounded-full border border-[#0071e3]/20">
                  BEBIDAS & LÍQUIDOS
                </span>
                <span className="text-xs font-medium text-[#86868b]">Transparência & Highlights</span>
              </div>
              <BeforeAfterSlider
                heightClass="h-[260px] sm:h-[300px]"
                beforeTitle="Gotas e vidro opacos"
                afterTitle="Destaque de refração e apetite visual"
              />
            </div>

            {/* Alimento */}
            <div className="p-6 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#0071e3] bg-[#0071e3]/10 px-3 py-1 rounded-full border border-[#0071e3]/20">
                  ALIMENTOS & GASTRONOMIA
                </span>
                <span className="text-xs font-medium text-[#86868b]">Saturação & Textura</span>
              </div>
              <BeforeAfterSlider
                heightClass="h-[260px] sm:h-[300px]"
                beforeTitle="Cor sem apetite"
                afterTitle="Cores ricas, contraste e apetite appeal"
              />
            </div>

            {/* Tecnologia */}
            <div className="p-6 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#0071e3] bg-[#0071e3]/10 px-3 py-1 rounded-full border border-[#0071e3]/20">
                  PRODUTOS TECNOLÓGICOS
                </span>
                <span className="text-xs font-medium text-[#86868b]">Metais, Telas & Vidro</span>
              </div>
              <BeforeAfterSlider
                heightClass="h-[260px] sm:h-[300px]"
                beforeTitle="Superfície plástica"
                afterTitle="Estética premium, acabamento metálico"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 03. O PROBLEMA */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-3 block">
              DIAGNÓSTICO TÉCNICO
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold text-[#1d1d1f] mb-6 leading-snug">
              Você olha para a imagem e sabe que ela ainda não chegou lá.
            </h2>
            <p className="text-base sm:text-lg text-[#6e6e73] mb-8 leading-relaxed">
              Você provavelmente já domina as ferramentas do DaVinci Resolve. Porém, na hora de finalizar um projeto de produto, os problemas voltam a acontecer:
            </p>

            <div className="space-y-4 mb-8">
              {[
                'A imagem não está equilibrada tecnicamente;',
                'Os planos gravados não conversam entre si no corte;',
                'O produto perde presença e destaque para o fundo;',
                'As cores parecem artificiais ou estouradas;',
                'O look fica refém e dependente de LUTs genéricos;',
                'A imagem não transmite a densidade visual de um comercial de TV.'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3.5 text-sm sm:text-base text-[#1d1d1f] bg-[#f5f5f7] p-4 rounded-2xl border border-[#e5e5e7]">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/30">
              <p className="text-base sm:text-lg font-semibold text-[#0071e3] leading-relaxed">
                "O problema geralmente não é falta de ferramentas. É não saber tomar as decisões certas na ordem certa."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 04. O QUE É O COLOR MASTER */}
      <section className="relative z-10 py-16 md:py-24 bg-[#f5f5f7] border-y border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            {/* Left Info Column */}
            <div className="md:col-span-6 flex flex-col items-start">
              <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2">
                FORMAÇÃO ESPECÍFICA
              </span>
              <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f] mb-4">
                Color Master | Produto
              </h2>
              <p className="text-base sm:text-lg text-[#6e6e73] leading-relaxed mb-6 font-normal">
                Uma masterclass focada em uma situação específica: como pegar footage de produto e conduzir a imagem até um resultado final de publicidade profissional.
              </p>

              {/* Workflow Chain Visual */}
              <div className="w-full bg-[#ffffff] p-6 rounded-3xl border border-[#e5e5e7] space-y-2.5 shadow-sm">
                <h3 className="text-xs font-bold text-[#0071e3] block mb-3 uppercase tracking-wider">
                  FLUXO DE TRABALHO COMPLETO:
                </h3>
                {[
                  'Footage RAW / Flat Original',
                  'Análise de Exposição & Histograma',
                  'Balance (Correção Primária)',
                  'Matching (Consistência entre Planos)',
                  'Secundárias (Pele, Produto & Fundo)',
                  'Look (Identidade Visual)',
                  'Look Development (Look Creator / Dehancer)',
                  'Finalização & Entrega Comercial'
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs sm:text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] px-4 py-2.5 rounded-xl border border-[#e5e5e7]">
                    <span className="text-[#0071e3] font-bold">0{idx + 1}.</span>
                    <span>{step}</span>
                    <span className="text-xs text-[#86868b]">Passo {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual Room Column */}
            <div className="md:col-span-6 flex justify-center">
              <div className="relative w-full max-w-lg rounded-3xl bg-[#ffffff] border border-[#e5e5e7] p-8 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-full h-64 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e] flex items-center justify-center relative mb-6">
                  <Monitor className="w-16 h-16 text-[#2997ff]" />
                  <span className="absolute bottom-3 right-3 text-xs bg-black/60 px-3 py-1 rounded-full text-white border border-white/20">
                    DaVinci Resolve Grade Room
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Processo de Grading Profissional</h3>
                <p className="text-sm sm:text-base text-[#6e6e73] max-w-sm">
                  Você acompanha o pensamento e a tomada de decisão em tempo real direto na interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05. O GRANDE BLOCO: O QUE VOCÊ VAI APRENDER (TIMELINE 01 A 08) */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
            ESTRUTURA DAS AULAS
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f]">
            Dentro da Color Master
          </h2>
          <p className="text-base sm:text-lg text-[#6e6e73] mt-3 font-normal">
            Acompanhe a timeline de color grading como em uma sessão de pós-produção real.
          </p>
        </div>

        {/* Timeline Vertical */}
        <div className="relative border-l-2 border-[#0071e3]/30 ml-4 sm:ml-8 space-y-10 pl-6 sm:pl-10">
          {[
            {
              num: '01',
              title: 'ORGANIZANDO O PROJETO',
              desc: 'Antes de tocar na imagem, você vai entender como estruturar o projeto para trabalhar de maneira organizada e eficiente.',
              detail: 'Node Tree Estruturada • Gerenciamento de Cor ACES/RCM • Color Space Transform'
            },
            {
              num: '02',
              title: 'ANALISANDO AS FOOTAGES',
              desc: 'Antes de corrigir, é preciso entender o que existe na imagem. Você vai aprender a observar exposição, contraste, temperatura, saturação, cor e diferenças entre os planos.',
              detail: 'Leitura de Scopes • Vector Scope • Waveform • Histograma'
            },
            {
              num: '03',
              title: 'PRIMÁRIAS / BALANCE',
              desc: 'O primeiro passo para construir uma imagem sólida. Exposição, contraste, temperatura, saturação e equilíbrio geral da imagem.',
              detail: 'Lift/Gamma/Gain • Offset Balance • Skin Tone Indicator'
            },
            {
              num: '04',
              title: 'COLOR MATCHING',
              desc: 'Uma das partes mais importantes de um comercial. Você vai aprender a fazer diferentes planos conversarem entre si e construir continuidade visual.',
              detail: 'Matching de Câmeras • Consistência entre Cortes • Split Screen Comparison'
            },
            {
              num: '05',
              title: 'SECUNDÁRIAS',
              desc: 'Agora entramos nos detalhes. Selecionar, isolar e trabalhar partes específicas da imagem para controlar produto, fundo, pele, materiais e cores.',
              detail: 'Qualifiers HSL • Power Windows • Tracker 3D • Window Rotoscoping'
            },
            {
              num: '06',
              title: 'CRIANDO UM LOOK',
              desc: 'Depois que a imagem está tecnicamente resolvida, começa a parte criativa. Você vai aprender a desenvolver uma identidade visual para o produto.',
              detail: 'Color Contrast • Complementary Palette • Density Controls'
            },
            {
              num: '07',
              title: 'LOOK COM LOOK CREATOR',
              desc: 'Uma abordagem de look development utilizando o Look Creator. Mostrar o antes e depois, mas principalmente mostrar o raciocínio por trás da construção.',
              detail: 'Custom Look Development • Curvas de Resposta de Cor • Split Toning'
            },
            {
              num: '08',
              title: 'LOOK COM DEHANCER PRO',
              desc: 'Explorar o Dehancer Pro como ferramenta de criação e acabamento. Comparação Digital vs. Film com zoom em textura, contraste, highlights, cores e densidade.',
              detail: 'Film Grain • Halation • Bloom • Film Print Emulation Kodak/Fuji'
            }
          ].map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Bullet Node */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-0 w-9 h-9 rounded-full bg-[#ffffff] border-2 border-[#0071e3] text-[#0071e3] font-bold text-xs flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                {item.num}
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm hover:border-[#0071e3]/40 transition-all">
                <span className="text-xs uppercase tracking-wider text-[#0071e3] font-bold block mb-1">
                  ETAPA {item.num}
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] mb-3">{item.title}</h3>
                <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed mb-4">{item.desc}</p>
                <div className="text-xs sm:text-sm text-[#1d1d1f] font-medium bg-[#f5f5f7] p-3 rounded-xl border border-[#e5e5e7] flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0071e3] shrink-0" />
                  <span>{item.detail}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 06. DECISÕES, NÃO APENAS COMANDOS */}
      <section className="relative z-10 py-16 md:py-24 bg-[#f5f5f7] border-y border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
              DIFERENCIAL PEDAGÓGICO
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f]">
              Você vai acompanhar as decisões, não apenas os comandos.
            </h2>
          </div>

          {/* Interactive Frame Annotation Preview */}
          <div className="relative p-6 sm:p-10 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm">
            <div className="w-full h-64 sm:h-96 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e] p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white bg-[#0071e3] px-3.5 py-1 rounded-full">
                  COMERCIAL DE PRODUTO • FRAME ANÁLISE
                </span>
                <span className="text-xs text-white/70">DaVinci Session</span>
              </div>

              {/* Callouts grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 my-auto">
                <div className="p-3 rounded-xl bg-black/60 border border-white/20 text-xs font-medium text-white">
                  Por que essa exposição?
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/20 text-xs font-medium text-white">
                  Por que essa temperatura?
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/20 text-xs font-medium text-white">
                  Por que essa saturação?
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/20 text-xs font-medium text-white">
                  Por que essa cor?
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/20 text-xs font-medium text-white col-span-2 sm:col-span-1">
                  Por que esse contraste?
                </div>
              </div>

              <div className="text-xs text-white/70">
                Aprenda o raciocínio por trás de cada nó
              </div>
            </div>

            <div className="mt-8 text-center max-w-xl mx-auto">
              <p className="text-base sm:text-xl font-semibold text-[#1d1d1f] leading-relaxed">
                "O objetivo não é decorar onde ficam as ferramentas do DaVinci Resolve. É aprender a olhar para uma imagem e entender o que precisa ser feito."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 07. A TRANSFORMAÇÃO: STEPPER MULTISTAGE */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
            EVOLUÇÃO PASSO A PASSO
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f]">
            Do footage ao comercial
          </h2>
          <p className="text-base sm:text-lg text-[#6e6e73] mt-2">
            Clique nas etapas abaixo para ver a evolução gradual da imagem durante a masterclass.
          </p>
        </div>

        {/* Stepper Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          {stepsPipeline.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeStep === idx
                  ? 'bg-[#0071e3] text-white shadow-md scale-105'
                  : 'bg-[#ffffff] text-[#6e6e73] hover:text-[#1d1d1f] border border-[#d2d2d7]'
              }`}
            >
              {step.title}
            </button>
          ))}
        </div>

        {/* Active Stage Display Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm">
          <div className={`w-full h-72 sm:h-96 rounded-2xl ${stepsPipeline[activeStep].colorBg} p-8 flex flex-col justify-between relative`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold bg-white/20 text-white px-3.5 py-1 rounded-full border border-white/30">
                {stepsPipeline[activeStep].badge}
              </span>
              <span className="text-xs text-white/80 font-medium">
                Etapa {activeStep + 1} de {stepsPipeline.length}
              </span>
            </div>

            <div className="my-auto text-center max-w-xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
                {stepsPipeline[activeStep].title}
              </h3>
              <p className="text-base sm:text-lg text-white/90 font-medium mb-2">
                {stepsPipeline[activeStep].subtitle}
              </p>
              <p className="text-sm sm:text-base text-white/80">
                {stepsPipeline[activeStep].desc}
              </p>
            </div>

            <div className="flex justify-between items-center text-xs text-white/70 font-medium">
              <span>Status: Ativo</span>
              <span>DaVinci Pipeline Stage</span>
            </div>
          </div>
        </div>
      </section>

      {/* 08. PARA QUEM É */}
      <section className="relative z-10 py-16 md:py-24 bg-[#f5f5f7] border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
              PERFIL DE ALUNOS
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f]">
              Essa masterclass é para quem trabalha com imagem de produto.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: 'COLORISTA',
                desc: 'Quer melhorar seu portfólio e atuação profissional com publicidade e produtos comerciais.',
                icon: Sliders
              },
              {
                role: 'VIDEOMAKER',
                desc: 'Quer elevar drasticamente a qualidade estética dos comerciais e vídeos que produz.',
                icon: Film
              },
              {
                role: 'DIRETOR DE FOTOGRAFIA',
                desc: 'Quer entender exatamente o que acontece com a sua luz e fotografia durante a pós-produção.',
                icon: Camera
              },
              {
                role: 'EDITOR',
                desc: 'Quer desenvolver domínio de color grading para entregar imagens prontas e completas.',
                icon: Monitor
              }
            ].map((card, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/20 text-[#0071e3] flex items-center justify-center mb-6">
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">{card.role}</h3>
                  <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed">{card.desc}</p>
                </div>
                <span className="text-xs text-[#0071e3] font-medium mt-6 block">Perfil Recomendado</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 09. O QUE VOCÊ VAI CONSEGUIR FAZER */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
            RESULTADOS CONCRETOS
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f]">
            Depois da masterclass, você vai saber:
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'ANALISAR',
              desc: 'Identificar com precisão o que uma imagem precisa antes mesmo de começar a mexer nos nós.'
            },
            {
              title: 'BALANCEAR',
              desc: 'Construir uma base tecnicamente sólida, equilibrando exposição, preto, branco e tom de pele.'
            },
            {
              title: 'IGUALAR',
              desc: 'Fazer diferentes planos, lentes e câmeras conversarem entre si com perfeita continuidade.'
            },
            {
              title: 'CONTROLAR',
              desc: 'Trabalhar partes específicas da cena isolando produto, fundo, iluminação e pele com secundárias.'
            },
            {
              title: 'CRIAR',
              desc: 'Desenvolver uma identidade visual e um look próprio sob medida para cada tipo de produto.'
            },
            {
              title: 'FINALIZAR',
              desc: 'Levar a imagem até um resultado final com densidade e acabamento com padrão de publicidade de TV.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#0071e3] bg-[#0071e3]/10 px-3 py-1 rounded-full border border-[#0071e3]/20 mb-4 inline-block">
                  {item.title}
                </span>
                <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed mt-2">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. O PROFESSOR: MICHAEL OLIVEIRA */}
      <section className="relative z-10 py-16 md:py-24 bg-[#f5f5f7] border-y border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ReticulaBackground bgImageSrc={authorPhotos.bgSrc} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] rounded-3xl overflow-hidden border border-[#d2d2d7] bg-[#ffffff] shadow-md group">
                <img
                  src={authorPhotos.profileSrc}
                  alt={SITE_CONFIG.author.name}
                  className="w-full h-auto object-contain block rounded-3xl transition-transform duration-500 ease-quadratic hover:scale-[1.02]"
                />
              </div>
            </div>

            <div className="md:col-span-7 flex flex-col items-start">
              <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2">
                QUEM ESTÁ POR TRÁS DA COLOR MASTER
              </span>
              <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f] mb-6">
                Michael Oliveira
              </h2>

              <div className="space-y-4 text-base sm:text-lg text-[#6e6e73] leading-relaxed">
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

              <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-lg">
                <div className="p-4 rounded-2xl bg-[#ffffff] border border-[#e5e5e7] text-sm text-[#6e6e73] shadow-xs">
                  <span className="font-bold text-[#0071e3] block">100% PRÁTICO</span>
                  <span>Footage de produção real</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#ffffff] border border-[#e5e5e7] text-sm text-[#6e6e73] shadow-xs">
                  <span className="font-bold text-[#0071e3] block">PUBLICIDADE</span>
                  <span>Padrão de entrega comercial</span>
                </div>
              </div>
            </div>
          </div>

          {/* Produtoras Atendidas Carousel — Full Width across Sobre section with true Alpha Transparency Fade */}
          <div className="mt-12 pt-8 border-t border-[#d2d2d7]/60 w-full">
            <span className="text-xs uppercase tracking-widest text-[#86868b] font-semibold mb-4 block text-center sm:text-left">
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

              {/* Track 2 (Exact clone for seamless loop) */}
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
      </section>

      {/* 11. FOOTAGE DA MASTERCLASS */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
          MATERIAL PRÁTICO
        </span>
        <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f] mb-4">
          Você vai aprender trabalhando com imagens.
        </h2>
        <p className="text-base sm:text-lg text-[#6e6e73] max-w-2xl mx-auto mb-10">
          Em vez de aprender apenas através de imagens perfeitas de demonstração, você vai acompanhar o processo de construção do grade em footage de produto real.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['PRODUTO 01 (Cosmético)', 'PRODUTO 02 (Bebida)', 'PRODUTO 03 (Gastronomia)', 'PRODUTO 04 (Tech)'].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col items-center">
              <Folder className="w-8 h-8 text-[#0071e3] mb-3" />
              <span className="text-sm font-semibold text-[#1d1d1f]">{item}</span>
              <span className="text-xs text-[#86868b] mt-1">RAW / LOG Included</span>
            </div>
          ))}
        </div>
      </section>

      {/* 12. COMO FUNCIONA */}
      <section className="relative z-10 py-16 md:py-24 bg-[#f5f5f7] border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
            PASSO A PASSO DA EXPERIÊNCIA
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f] mb-12">
            Como funciona o treinamento
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: '1. Você assiste', desc: 'Entende o processo e o raciocínio das decisões de cor.' },
              { title: '2. Você abre o projeto', desc: 'Acompanha com as mesmas footages no DaVinci Resolve.' },
              { title: '3. Você pratica', desc: 'Reproduz o processo passo a passo no seu computador.' },
              { title: '4. Você desenvolve', desc: 'Aplica a metodologia em seus próprios comerciais e clientes.' }
            ].map((step, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm text-left">
                <span className="text-xs font-bold text-[#0071e3] mb-2 block">ETAPA 0{idx + 1}</span>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">{step.title}</h3>
                <p className="text-sm text-[#6e6e73] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. O CONTEÚDO COMPLETO */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
            FLUXO DE APRENDIZADO
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f]">
            Currículo Completo
          </h2>
        </div>

        <div className="space-y-4">
          {[
            { title: '01. Organizando o projeto', desc: 'Estrutura de nós, color management e preparação técnica.' },
            { title: '02. Analisando as footages', desc: 'Leitura da imagem, scopes e identificação dos problemas.' },
            { title: '03. Primárias / Balance', desc: 'Ajustes de exposição, contraste, temperatura e saturação.' },
            { title: '04. Color Matching', desc: 'Consistência de cor entre diferentes planos e cortes.' },
            { title: '05. Secundárias', desc: 'Seleção, isolamento e controle fino de elementos da cena.' },
            { title: '06. Criando um Look', desc: 'Construção da identidade visual e estética do produto.' },
            { title: '07. Look com Look Creator', desc: 'Desenvolvimento de look avançado com ferramenta dedicada.' },
            { title: '08. Look com Dehancer Pro', desc: 'Film emulation, textura, grain e acabamento de película.' }
          ].map((item, idx) => (
            <div key={idx} className="p-5 sm:p-6 rounded-2xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#1d1d1f]">{item.title}</h3>
                <p className="text-sm text-[#6e6e73] mt-1">{item.desc}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#0071e3] shrink-0 ml-4" />
            </div>
          ))}
        </div>
      </section>

      {/* 14. OFERTA */}
      <section id="oferta" className="relative z-10 py-16 md:py-24 bg-[#f5f5f7] border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-8 sm:p-14 rounded-3xl bg-[#ffffff] border border-[#0071e3]/30 shadow-xl relative overflow-hidden">
            <span className="px-4 py-1.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold uppercase tracking-wider mb-6 inline-block border border-[#0071e3]/20">
              OFERTA ESPECIAL DE LANÇAMENTO
            </span>

            <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f] mb-3">
              Color Master | Produto
            </h2>
            <p className="text-base sm:text-lg text-[#6e6e73] mb-8 font-normal">
              Masterclass de Color Grading para comerciais e imagens de produto.
            </p>

            {/* Checklist */}
            <div className="text-left space-y-3.5 max-w-md mx-auto mb-8 text-sm sm:text-base text-[#1d1d1f] border-y border-[#e5e5e7] py-6">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#0071e3] shrink-0" />
                <span>Masterclass completa do básico ao acabamento final</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#0071e3] shrink-0" />
                <span>Aulas práticas no DaVinci Resolve</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#0071e3] shrink-0" />
                <span>Projetos e Node Trees utilizados nas aulas</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#0071e3] shrink-0" />
                <span>Footages de produto para prática</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#0071e3] shrink-0" />
                <span>Acesso vitalício às aulas e atualizações</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="mb-8">
              <span className="text-xs text-[#86868b] uppercase font-semibold block mb-1">Investimento único</span>
              <div className="text-4xl sm:text-6xl font-extrabold text-[#1d1d1f] tracking-tight">
                R$ 497
              </div>
              <span className="text-sm text-[#6e6e73] mt-2 block">ou 12x de R$ 49,60 no cartão</span>
            </div>

            <a
              href="https://pay.hotmart.com/placeholder"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackProductClick('color-master-buy', 'Color Master | Buy CTA', 'https://pay.hotmart.com/placeholder', 'other')}
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-base transition-all shadow-xl inline-flex items-center justify-center gap-2 active:scale-95"
            >
              <span>QUERO ENTRAR NA COLOR MASTER</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs sm:text-sm text-[#6e6e73] font-medium">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Garantia incondicional de 7 dias</span>
            </div>
          </div>
        </div>
      </section>

      {/* 15. PROVA SOCIAL */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
            TRANSFORMAÇÃO DOS ALUNOS
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f]">
            Resultados de quem aplicou o método
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-[#0071e3] block mb-3 uppercase tracking-wider">PROJETO COMERCIAL</span>
              <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed italic mb-6">
                "Eu tinha extrema dificuldade em fazer os cortes de produtos diferentes combinarem no mesmo comercial. Depois de aplicar o módulo de Color Matching, o fluxo ficou automático."
              </p>
            </div>
            <div className="flex items-center gap-3.5 pt-4 border-t border-[#e5e5e7]">
              <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/30 font-bold text-[#0071e3] flex items-center justify-center text-sm">
                LR
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#1d1d1f]">Lucas R.</span>
                <span className="text-xs text-[#86868b]">Filmmaker & Colorista</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-[#0071e3] block mb-3 uppercase tracking-wider">PRODUTOS ELETRÔNICOS</span>
              <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed italic mb-6">
                "O grande diferencial foi entender as secundárias em materiais como metal e vidro. As imagens dos meus comerciais ganharam um ar sofisticado de comercial de TV."
              </p>
            </div>
            <div className="flex items-center gap-3.5 pt-4 border-t border-[#e5e5e7]">
              <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/30 font-bold text-[#0071e3] flex items-center justify-center text-sm">
                MB
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#1d1d1f]">Mateus B.</span>
                <span className="text-xs text-[#86868b]">Diretor de Pós-Produção</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 16. FAQ */}
      <section className="relative z-10 py-16 md:py-24 bg-[#f5f5f7] border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
              DÚVIDAS FREQUENTES
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f]">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqList.map((faq, idx) => (
              <div key={idx} className="rounded-2xl bg-[#ffffff] border border-[#e5e5e7] overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between text-base font-semibold text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-[#0071e3] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#86868b] shrink-0" />
                  )}
                </button>

                {openFaq === idx && (
                  <div className="px-6 pb-6 text-sm sm:text-base text-[#6e6e73] leading-relaxed border-t border-[#e5e5e7] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 17. CTA FINAL */}
      <section className="relative z-10 py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-10 sm:p-16 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm">
          <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f] mb-4 leading-tight">
            Agora você sabe como a imagem chegou até aqui.
          </h2>
          <p className="text-base sm:text-lg text-[#6e6e73] max-w-xl mx-auto mb-8">
            Aprenda o processo completo de color grading para produto e comerciais no DaVinci Resolve.
          </p>

          <a
            href="#oferta"
            className="px-10 py-4 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-base transition-all shadow-xl inline-flex items-center justify-center gap-2 active:scale-95"
          >
            <span>QUERO FAZER A COLOR MASTER</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-12 bg-[#ffffff] border-t border-[#d2d2d7]/60 text-[#6e6e73] text-xs px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-semibold text-[#1d1d1f] text-sm block mb-1">
              FLMMKR
            </span>
            <span className="text-[#86868b]">
              Color Master | Produto • Michael Oliveira
            </span>
            <p className="text-xs text-[#86868b] mt-2">
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
                onClick={() => trackSocialClick(soc.name, 'other')}
                className="p-2.5 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#6e6e73] hover:text-[#1d1d1f] border border-[#d2d2d7] transition-colors"
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
