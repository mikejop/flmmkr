'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SITE_CONFIG } from '@/config/siteConfig';
import { trackProductClick, trackSocialClick } from '@/utils/analytics';
import { InstagramIcon, YouTubeIcon, TikTokIcon } from '@/components/SocialIcons';
import { ReticulaBackground } from '@/components/ReticulaBackground';
import { getRandomAuthorPhotos, AuthorPhotoPair } from '@/utils/authorPhotos';
import { LoginModal } from '@/components/LoginModal';
import {
  Sliders,
  Film,
  Camera,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Monitor,
  ShieldCheck,
  Check,
  Sparkles,
  Layers,
  Tv,
  FileCheck,
  HelpCircle,
  Clock,
  Infinity,
  PlayCircle,
  Zap,
  Award
} from 'lucide-react';
const PRODUTORAS_LOGOS = [
  { name: 'Astronautas Filmes', src: '/assets/empresas/astronautas-filmes.jpg' },
  { name: 'At Work', src: '/assets/empresas/at-work.jpg' },
  { name: 'Malala Filmes', src: '/assets/empresas/malala-filmes.jpg' },
  { name: 'Mariposa Filmes', src: '/assets/empresas/mariposa-filmes.jpg' },
  { name: 'Pantanal Filmes', src: '/assets/empresas/pantanal-filmes.jpg' },
  { name: 'Plano B', src: '/assets/empresas/plano-b.jpg' },
];

export const ColorMasterLanding: React.FC = () => {
  const [authorPhotos, setAuthorPhotos] = useState<AuthorPhotoPair>({
    profileSrc: '/assets/mike-photos/01.jpg',
    bgSrc: '/assets/bg/about-mike/02.jpg'
  });
  const [logos, setLogos] = useState<{ name: string; src: string }[]>(PRODUTORAS_LOGOS);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  // 15-Minute Countdown & Batch Price State
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutos em segundos
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [priceData, setPriceData] = useState<{
    promoPrice: number;
    regularPrice: number;
    finalPrice: number;
    batchName: string;
    nextPriceDate?: string;
  }>({
    promoPrice: 95,
    regularPrice: 195,
    finalPrice: 95,
    batchName: 'Lote Especial de Abertura',
    nextPriceDate: '06/10/2026'
  });

  useEffect(() => {
    setAuthorPhotos(getRandomAuthorPhotos());

    // Gerar ou recuperar Client/Device ID no navegador
    let clientId = '';
    try {
      clientId = localStorage.getItem('flmmkr_client_device_id') || '';
      if (!clientId) {
        clientId = 'dev_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
        localStorage.setItem('flmmkr_client_device_id', clientId);
      }
    } catch {
      clientId = 'client_' + Date.now();
    }

    // Sincronizar com o servidor (grava IP e Client ID, preparado para Supabase)
    fetch(`/api/offer-timer?clientId=${encodeURIComponent(clientId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.remainingSeconds === 'number') {
          setTimeLeft(data.remainingSeconds);
          setIsExpired(data.isExpired);
          setPriceData({
            promoPrice: data.promoPrice,
            regularPrice: data.regularPrice,
            finalPrice: data.finalPrice,
            batchName: data.batchName,
            nextPriceDate: data.nextPriceDate
          });
        }
      })
      .catch(() => {});

    fetch('/api/empresas')
      .then((res) => res.json())
      .then((data) => {
        if (data.logos && data.logos.length > 0) {
          setLogos(data.logos);
        }
      })
      .catch(() => {});
  }, []);

  // Intervalo local do cronômetro de 15 minutos
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const toggleModule = (index: number) => {
    setOpenModule(openModule === index ? null : index);
  };

  // 03. O que você vai aprender - Organização das Aulas por Etapas do Trabalho
  const learningModules = [
    {
      num: '01',
      title: 'Preparação e gerenciamento de cores',
      subtitle: 'Configuração do projeto, ciência de cores e estruturação do fluxo de trabalho',
      lessons: [
        'Introdução ao DaVinci Resolve',
        'Gerenciamento de cores',
        'ACES',
        'CST (Color Space Transform)',
        'Fluxo de trabalho'
      ]
    },
    {
      num: '02',
      title: 'Análise e correção',
      subtitle: 'Leitura técnica e artística, equilíbrio da imagem e continuidade entre planos',
      lessons: [
        'Análise artística do vídeo',
        'Correções primárias',
        'Shot Matching'
      ]
    },
    {
      num: '03',
      title: 'Refinamento da imagem',
      subtitle: 'Isolamento cirúrgico de elementos, pele, produto e controle de fundo',
      lessons: [
        'Correções secundárias',
        'Seleções e ajustes localizados'
      ]
    },
    {
      num: '04',
      title: 'Criação de look',
      subtitle: 'Desenvolvimento de identidade visual e estética autoral com ferramentas dedicadas',
      lessons: [
        'DIY (Criação de look manual nativa)',
        'Look Creator',
        'Dehancer Pro'
      ]
    },
    {
      num: '05',
      title: 'Finalização',
      subtitle: 'Padrões de entrega comercial, codecs e exportação para TV e Web',
      lessons: [
        'Deliver',
        'Preparação e exportação do material final'
      ]
    }
  ];

  // 07. Perguntas Frequentes
  const faqList = [
    {
      q: 'Para quem é o masterclass Color Master | Produto?',
      a: 'É indicado para coloristas, videomakers, diretores de fotografia e editores que trabalham ou desejam atuar no mercado de comerciais, publicidade e vídeos de produto. Seja você um profissional buscando refinar suas tomadas de decisão ou alguém querendo elevar o padrão visual de seus projetos, a metodologia ensina o fluxo completo de ponta a ponta.'
    },
    {
      q: 'Quais conhecimentos prévios são necessários?',
      a: 'É recomendável ter noções básicas da interface do DaVinci Resolve (saber criar nós e navegar pelas abas). O curso foca intensamente na metodologia, leitura visual e tomada de decisões técnicas e estéticas, explicando cada passo com clareza.'
    },
    {
      q: 'Qual software e quais ferramentas são utilizados?',
      a: 'Utilizamos o DaVinci Resolve como plataforma central de trabalho. Além das ferramentas nativas do DaVinci (que cobrem todo o fluxo essencial), demonstramos ferramentas especializadas como o Dehancer Pro e Look Creator nos módulos dedicados de Look Development e emulação de película.'
    },
    {
      q: 'Como funciona o acesso e por quanto tempo terei direito?',
      a: 'O acesso é liberado imediatamente após a confirmação do pagamento e tem duração de 1 ano completo (365 dias). Durante esse período, você pode assistir a todas as aulas quantas vezes quiser, além de baixar os materiais e projetos.'
    },
    {
      q: 'Como funciona a mentoria em grupo para os 10 primeiros inscritos?',
      a: 'Os 10 primeiros alunos garantem vaga exclusiva em uma mentoria fechada ao vivo com Michael Oliveira. Nessa sessão, analisaremos os trabalhos e projetos de cada um individualmente, identificando pontos de melhoria e apontando soluções práticas para elevar o padrão estético e profissional das suas imagens.'
    },
    {
      q: 'Como funciona o desconto de 25% nos outros treinamentos?',
      a: 'Quem adquire o Color Master | Produto recebe automaticamente um cupom exclusivo de 25% de desconto para aplicar em qualquer outro curso ou masterclass da FLMMKR dentro da área de membros.'
    },
    {
      q: 'Como funciona o pagamento e quais são as formas disponíveis?',
      a: 'O pagamento é processado com total segurança pela plataforma Hotmart. Você pode parcelar em até 12x no cartão de crédito, pagar à vista via Pix ou boleto bancário.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased selection:bg-[#0071e3]/20 selection:text-[#0071e3]">
      {/* Login Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {/* TOP FIXED COUNTDOWN BANNER (15 MIN TIMER & BATCH PRICING) */}
      <div className={`sticky top-0 z-60 w-full transition-colors duration-300 ${
        isExpired 
          ? 'bg-[#1c1c1e] text-white border-b border-red-500/30' 
          : 'bg-gradient-to-r from-[#0071e3] via-[#0051a8] to-[#0071e3] text-white border-b border-white/20'
      } shadow-md`}>
        <div className="max-w-6xl mx-auto px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2">
            {!isExpired ? (
              <>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] sm:text-xs">
                  Oferta de Abertura (15 Minutos)
                </span>
                <span className="hidden md:inline text-white/90">
                  • Garanta por apenas <strong className="text-white underline decoration-amber-400 font-bold">R$ {priceData.promoPrice}</strong> + Mentoria em Grupo para os 10 primeiros!
                </span>
              </>
            ) : (
              <>
                <span className="text-red-400 font-bold uppercase tracking-wider text-[11px] sm:text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Tempo de 15 min expirado
                </span>
                <span className="text-white/80 hidden sm:inline">
                  • O valor promocional de R$ 95 encerrou para este dispositivo. Preço regular: R$ 195.
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {!isExpired ? (
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-wider text-amber-300">
                  {formatTime(timeLeft)}
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-red-300 bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-800/40">
                Expirado
              </span>
            )}

            <a
              href="#oferta"
              className="px-3 py-1 rounded-full bg-white text-[#0071e3] hover:bg-white/90 text-xs font-bold transition-all shadow-xs shrink-0 active:scale-95"
            >
              {!isExpired ? 'Aproveitar R$ ' + priceData.promoPrice : 'Ver Preço Regular'}
            </a>
          </div>
        </div>
      </div>

      {/* Glassmorphism Header Navigation */}
      <header
        className="sticky top-9 sm:top-10 z-50 w-full border-b border-white/10 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] transition-all duration-300"
        style={{ background: 'rgba(14,14,18,0.85)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)' }}
      >
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between">
          <a href="/" className="font-semibold text-sm tracking-tight text-white hover:opacity-75 transition-opacity">
            FLMMKR
          </a>

          <span className="hidden sm:inline-block text-xs text-white/80 font-semibold tracking-wide bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
            COLOR MASTER | PRODUTO
          </span>

          <div className="flex items-center gap-3">
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

      {/* ========================================================================= */}
      {/* 01. HERO: APRESENTAÇÃO DO PRODUTO (PRIORIDADE MÁXIMA)                     */}
      {/* ========================================================================= */}
      <section className="relative z-10 overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 bg-black">
        {/* Background Video Layer with Retícula Overlay */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          <iframe
            src="https://www.youtube-nocookie.com/embed/RMKnx99UCUA?autoplay=1&mute=1&controls=0&loop=1&playlist=RMKnx99UCUA&playsinline=1&rel=0&modestbranding=1&enablejsapi=1"
            title="Color Master Background Showcase"
            className="absolute top-1/2 left-1/2 w-[250%] h-[250%] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none opacity-90"
            allow="autoplay; encrypted-media"
          />
          <div
            className="absolute inset-0 z-5 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.85) 1.2px, transparent 1.2px)`,
              backgroundSize: '5px 5px'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none z-6" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
            {/* Masterclass Identification Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-xs font-semibold mb-5 border border-white/20 shadow-sm">
              <Sliders className="w-3.5 h-3.5 text-[#2997ff]" />
              <span className="tracking-wide uppercase">MASTERCLASS • COLOR MASTER | PRODUTO</span>
            </div>

            {/* Exclusive Mentorship Notice Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-semibold mb-6 shadow-lg">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>🔥 BÔNUS EXCLUSIVO: Os 10 primeiros inscritos ganham Mentoria em Grupo ao vivo com análise dos seus trabalhos!</span>
            </div>

            {/* Headline H1 */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.08] mb-6 drop-shadow-xl">
              Transforme uma boa fotografia de produto em uma imagem de comercial.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-white/90 font-normal leading-relaxed mb-8 max-w-2xl drop-shadow-md">
              Aprenda, na prática, como analisar, equilibrar, igualar e construir o look de imagens de produto no DaVinci Resolve com padrão de publicidade de alto nível.
            </p>

            {/* Commercial Condition / Price Pill */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-[#2997ff]" />
              {!isExpired ? (
                <>
                  <span className="line-through text-white/50">R$ 195</span>
                  <span className="font-bold text-amber-300 text-sm sm:text-base">R$ {priceData.promoPrice} à vista</span>
                  <span className="text-white/40">•</span>
                  <span>1 Ano de Acesso</span>
                  <span className="text-white/40">•</span>
                  <span className="text-emerald-400 font-semibold">+25% OFF nos outros cursos</span>
                </>
              ) : (
                <>
                  <span className="font-bold text-white text-sm sm:text-base">R$ 195 à vista</span>
                  <span className="text-white/40">•</span>
                  <span>1 Ano de Acesso</span>
                  <span className="text-white/40">•</span>
                  <span className="text-emerald-400 font-semibold">+25% OFF nos outros cursos</span>
                </>
              )}
            </div>

            {/* Main CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-4">
              <a
                href="#oferta"
                onClick={() => trackProductClick('color-master-produto', 'Color Master Hero CTA', '#oferta', 'other')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm sm:text-base transition-all shadow-[0_4px_20px_rgba(0,113,227,0.5)] flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{!isExpired ? `Garantir por R$ ${priceData.promoPrice}` : 'Garantir Acesso à Masterclass'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#aprendizado"
                className="w-full sm:w-auto px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all border border-white/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Ver Conteúdo Completo</span>
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>

            {/* Trust highlights */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-xs sm:text-sm text-white/80 font-normal">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Mentoria para os 10 primeiros</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#2997ff]" />
                <span>1 Ano de Acesso</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#2997ff]" />
                <span>Footages reais inclusos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#2997ff]" />
                <span>25% OFF em outros cursos</span>
              </div>
            </div>
          </div>

        </div>
      </section>



      {/* ========================================================================= */}
      {/* 03. CONTEÚDO DO MASTERCLASS                                               */}
      {/* ========================================================================= */}
      <section id="aprendizado" className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
            CONTEÚDO DO MASTERCLASS
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f]">
            Conteúdo do Masterclass
          </h2>
          <p className="text-base sm:text-lg text-[#6e6e73] mt-3 font-normal">
            Aulas organizadas rigorosamente pelas 5 etapas do processo real de pós-produção e color grading de produto.
          </p>
        </div>

        {/* Pipeline Overview Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {[
            { step: '01. Preparação', desc: 'Gerenciamento & ACES' },
            { step: '02. Análise & Correção', desc: 'Primárias & Matching' },
            { step: '03. Refinamento', desc: 'Secundárias & Detalhes' },
            { step: '04. Criação de Look', desc: 'DIY & Dehancer Pro' },
            { step: '05. Finalização', desc: 'Deliver & Exportação' },
          ].map((chip, idx) => (
            <div key={idx} className="p-3.5 sm:p-4 rounded-2xl bg-[#ffffff] border border-[#e5e5e7] shadow-xs text-center">
              <span className="text-xs font-bold text-[#0071e3] block">{chip.step}</span>
              <span className="text-xs text-[#86868b] mt-0.5 block">{chip.desc}</span>
            </div>
          ))}
        </div>

        {/* Accordion List for Expandable Modules */}
        <div className="space-y-4">
          {learningModules.map((mod, idx) => {
            const isOpen = openModule === idx;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-[#ffffff] border border-[#e5e5e7] overflow-hidden shadow-xs transition-all hover:border-[#0071e3]/30"
              >
                <button
                  onClick={() => toggleModule(idx)}
                  className="w-full p-6 sm:p-7 text-left flex items-center justify-between gap-4 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <span className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20 font-bold text-sm flex items-center justify-center shrink-0">
                      {mod.num}
                    </span>
                    <div>
                      <h3 className="text-base sm:text-xl font-semibold text-[#1d1d1f]">
                        {mod.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6e6e73] mt-1 font-normal">
                        {mod.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#86868b]">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#0071e3]" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-2 border-t border-[#e5e5e7]/80 bg-[#fafafc]">
                    <span className="text-xs uppercase font-bold text-[#0071e3] tracking-wider mb-3 block">
                      Aulas e Tópicos Deste Módulo:
                    </span>
                    <div className="space-y-2.5">
                      {mod.lessons.map((lesson, lIdx) => (
                        <div
                          key={lIdx}
                          className="flex items-start gap-3 text-xs sm:text-sm text-[#1d1d1f] bg-[#ffffff] p-3.5 rounded-2xl border border-[#e5e5e7]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#0071e3] shrink-0 mt-0.5" />
                          <span>{lesson}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 04. APLICAÇÃO PROFISSIONAL                                                */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 md:py-24 bg-[#f5f5f7] border-y border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
              MERCADO DE TRABALHO REAL
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f]">
              Aplicação Profissional
            </h2>
            <p className="text-base sm:text-lg text-[#6e6e73] mt-3 font-normal">
              Domine as 3 competências mais cobradas em produtoras, agências e clientes de alta exigência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Pilar 1: Tratamento de Cor e Densidade */}
            <div className="p-8 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/20 text-[#0071e3] flex items-center justify-center mb-6">
                  <Sliders className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#0071e3] block mb-2">
                  PILAR 01
                </span>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">
                  Tratamento de Cor & Densidade
                </h3>
                <p className="text-sm text-[#6e6e73] leading-relaxed">
                  Como calibrar luz, sombra e saturação com peso visual publicitário sem estourar canais nem introduzir artefatos na compressão de entrega.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#e5e5e7] text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#0071e3]" />
                <span>Padrão Broadcast & TV Comercial</span>
              </div>
            </div>

            {/* Pilar 2: Consistência entre Planos (Matching) */}
            <div className="p-8 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/20 text-[#0071e3] flex items-center justify-center mb-6">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#0071e3] block mb-2">
                  PILAR 02
                </span>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">
                  Consistência entre Planos (Matching)
                </h3>
                <p className="text-sm text-[#6e6e73] leading-relaxed">
                  Garantir que a embalagem, a cor do produto e o tom de pele mantenham absoluta coerência visual durante todos os cortes do vídeo.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#e5e5e7] text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#0071e3]" />
                <span>Continuidade Visual Perfeita</span>
              </div>
            </div>

            {/* Pilar 3: Criação de Looks Comerciais */}
            <div className="p-8 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/20 text-[#0071e3] flex items-center justify-center mb-6">
                  <Film className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#0071e3] block mb-2">
                  PILAR 03
                </span>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">
                  Criação de Looks Comerciais
                </h3>
                <p className="text-sm text-[#6e6e73] leading-relaxed">
                  Desenvolvimento de paletas de cor autorais sob medida para a proposta de cada marca, saindo da dependência de LUTs genéricos.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#e5e5e7] text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#0071e3]" />
                <span>Look Development Autoral</span>
              </div>
            </div>
          </div>

          {/* Practical Callout Banner */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#ffffff] border border-[#0071e3]/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-[#0071e3] uppercase tracking-wider block mb-1">
                Foco no Trabalho Real
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] mb-2">
                "Você não vai decorar comandos. Vai aprender a tomar decisões de cor."
              </h3>
              <p className="text-sm sm:text-base text-[#6e6e73]">
                Cada nó, qualifier e curva são ensinados com a justificativa técnica e criativa por trás do comercial.
              </p>
            </div>
            <a
              href="#oferta"
              className="px-6 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm transition-all shrink-0 active:scale-95 shadow-md"
            >
              Garantir Minha Vaga
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 05. QUEM ENSINA: MICHAEL OLIVEIRA                                         */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 md:py-24 bg-[#f5f5f7] px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ReticulaBackground bgImageSrc={authorPhotos.bgSrc} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            {/* Teacher Photo */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[340px] rounded-3xl overflow-hidden border border-[#d2d2d7] bg-[#ffffff] shadow-md group">
                <img
                  src={authorPhotos.profileSrc}
                  alt={SITE_CONFIG.author.name}
                  className="w-full h-auto object-contain block rounded-3xl transition-transform duration-500 hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* Teacher Bio */}
            <div className="md:col-span-7 flex flex-col items-start">
              <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2">
                INSTRUTOR DA MASTERCLASS
              </span>
              <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f] mb-6">
                Michael Oliveira
              </h2>

              <div className="space-y-4 text-base sm:text-lg text-[#6e6e73] leading-relaxed">
                <p>
                  <span className="font-semibold text-[#1d1d1f]">Diretor, diretor de fotografia, colorista e finalizador</span> com <span className="font-medium text-[#3a3a3c]">mais de 20 anos de experiência prática no mercado audiovisual</span>.
                </p>
                <p>
                  Atuou em centenas de campanhas publicitárias, videoclipes, institucionais e conteúdos comerciais para grandes marcas e produtoras em todo o Brasil. É ex-professor titular de Color Grading da <strong className="font-semibold text-[#1d1d1f]">EBAC</strong> (Escola Britânica de Artes Criativas e Tecnologia).
                </p>
                <p>
                  Sua abordagem pedagógica combina fundamentos técnicos sólidos da ciência de cores com os atalhos e decisões práticas exigidas no fluxo de trabalho de pós-produção do dia a dia.
                </p>
              </div>

              {/* Highlights pills */}
              <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-lg">
                <div className="p-4 rounded-2xl bg-[#ffffff] border border-[#e5e5e7] text-sm text-[#6e6e73] shadow-xs">
                  <span className="font-bold text-[#0071e3] block">+20 ANOS</span>
                  <span>Experiência no Audiovisual</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#ffffff] border border-[#e5e5e7] text-sm text-[#6e6e73] shadow-xs">
                  <span className="font-bold text-[#0071e3] block">EX-PROFESSOR</span>
                  <span>EBAC Color Grading</span>
                </div>
              </div>
            </div>
          </div>

          {/* Produtoras Atendidas Carousel */}
          <div className="mt-14 pt-8 border-t border-[#d2d2d7]/60 w-full">
            <span className="text-xs uppercase tracking-widest text-[#86868b] font-semibold mb-4 block text-center sm:text-left">
              Produtoras e Projetos Relevantes
            </span>
            <div
              className="relative w-full overflow-hidden select-none pointer-events-none marquee-container"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
              }}
            >
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

      {/* ========================================================================= */}
      {/* 06. OFERTA E COMPRA                                                       */}
      {/* ========================================================================= */}
      <section id="oferta" className="relative z-10 py-16 md:py-24 bg-[#f5f5f7] border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-8 sm:p-14 rounded-3xl bg-[#ffffff] border border-[#0071e3]/30 shadow-2xl relative overflow-hidden">
            {/* Offer Header Tag */}
            <span className="px-4 py-1.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold uppercase tracking-wider mb-6 inline-block border border-[#0071e3]/20">
              OFERTA ESPECIAL DE ACESSO
            </span>

            <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f] mb-3">
              Color Master | Produto
            </h2>
            <p className="text-base sm:text-lg text-[#6e6e73] mb-8 font-normal">
              Masterclass completa de Color Grading para comerciais e imagens de produto no DaVinci Resolve.
            </p>

            {/* Special Mentorship Callout Card for First 10 */}
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 border border-amber-400/40 text-left max-w-lg mx-auto shadow-xs">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1.5">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span>BÔNUS EXCLUSIVO (APENAS 10 PRIMEIROS)</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#1d1d1f] mb-1">
                Mentoria em Grupo ao Vivo com Michael Oliveira
              </h3>
              <p className="text-xs sm:text-sm text-[#48484a] leading-relaxed">
                Encontro fechado ao vivo para analisar os trabalhos e projetos de cada participante, diagnosticando gargalos e apontando soluções práticas para elevar suas produções ao nível de comercial.
              </p>
            </div>

            {/* Checklist of What's Included */}
            <div className="text-left space-y-3.5 max-w-lg mx-auto mb-8 text-sm sm:text-base text-[#1d1d1f] border-y border-[#e5e5e7] py-6">
              <div className="flex items-center gap-3 font-semibold text-amber-950 bg-amber-500/10 p-2.5 rounded-xl border border-amber-400/40">
                <Award className="w-5 h-5 text-amber-600 shrink-0" />
                <span>⭐ Vaga na Mentoria em Grupo ao Vivo (Primeiros 10 Alunos)</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#0071e3] shrink-0" />
                <span>Masterclass completa do básico ao acabamento final</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#0071e3] shrink-0" />
                <span>Aulas práticas gravadas em alta resolução no DaVinci Resolve</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#0071e3] shrink-0" />
                <span>Footages reais de produto (RAW / LOG) para acompanhar a prática</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#0071e3] shrink-0" />
                <span>Estrutura de Node Trees e PowerGrades prontos para uso</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#0071e3] shrink-0" />
                <span>Módulos de Look Development (Look Creator & Dehancer Pro)</span>
              </div>
              <div className="flex items-center gap-3 font-semibold text-[#1d1d1f]">
                <Clock className="w-5 h-5 text-[#0071e3] shrink-0" />
                <span>1 Ano de Acesso Completo e Ilimitado à Plataforma</span>
              </div>
              <div className="flex items-center gap-3 font-semibold text-[#0071e3] bg-[#0071e3]/10 p-2.5 rounded-xl border border-[#0071e3]/20">
                <Sparkles className="w-5 h-5 text-[#0071e3] shrink-0" />
                <span>🎁 Bônus: 25% de Desconto em Qualquer Outro Treinamento FLMMKR</span>
              </div>
            </div>

            {/* Dynamic Price Box with 15-min countdown condition */}
            <div className="mb-8">
              {!isExpired ? (
                <>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>Tempo Restante da Oferta: {formatTime(timeLeft)}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-[#86868b] block line-through">
                    De R$ 195 por apenas:
                  </span>
                  <div className="text-4xl sm:text-6xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">
                    R$ {priceData.promoPrice}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#0071e3] mt-1.5 block">
                    {priceData.batchName} {priceData.nextPriceDate ? `(Válido até ${priceData.nextPriceDate})` : ''}
                  </span>
                  <span className="text-xs text-[#86868b] mt-1 block">
                    ou em até 12x no cartão de crédito
                  </span>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-bold uppercase tracking-wider mb-2 border border-red-500/30">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tempo de 15 Minutos Expirado</span>
                  </div>
                  <span className="text-xs text-[#86868b] uppercase font-semibold block mb-1">
                    Preço Regular Oficial
                  </span>
                  <div className="text-4xl sm:text-6xl font-extrabold text-[#1d1d1f] tracking-tight">
                    R$ 195
                  </div>
                  <span className="text-xs text-[#86868b] mt-1.5 block">
                    ou em até 12x no cartão de crédito
                  </span>
                </>
              )}
            </div>

            {/* Primary Buy CTA */}
            <a
              href="https://pay.hotmart.com/placeholder"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackProductClick('color-master-buy', 'Color Master Buy Checkout', 'https://pay.hotmart.com/placeholder', 'other')}
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-base transition-all shadow-[0_4px_24px_rgba(0,113,227,0.4)] inline-flex items-center justify-center gap-2 active:scale-95"
            >
              <span>GARANTIR MINHA VAGA AGORA</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            {/* Guarantee and Security */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-[#6e6e73] font-medium">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Garantia incondicional de 7 dias • Risco zero</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 07. PERGUNTAS FREQUENTES (FAQ ACCORDION)                                  */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 md:py-24 bg-[#f5f5f7] border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-[#0071e3] font-bold mb-2 block">
              DÚVIDAS FREQUENTES
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f]">
              Perguntas Frequentes
            </h2>
            <p className="text-base text-[#6e6e73] mt-2">
              Tudo o que você precisa saber sobre a masterclass, acesso e metodologia.
            </p>
          </div>

          <div className="space-y-4">
            {faqList.map((faq, idx) => (
              <div key={idx} className="rounded-2xl bg-[#ffffff] border border-[#e5e5e7] overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between text-base sm:text-lg font-semibold text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
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

      {/* ========================================================================= */}
      {/* 08. ENCERRAMENTO                                                          */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-10 sm:p-16 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-xl relative overflow-hidden">
          {/* Subtle top rim glow */}
          <div className="w-16 h-16 rounded-3xl bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center mx-auto mb-6 text-[#0071e3]">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-semibold text-[#1d1d1f] mb-4 leading-tight">
            Domine a construção visual de produtos e eleve seus comerciais.
          </h2>
          <p className="text-base sm:text-lg text-[#6e6e73] max-w-xl mx-auto mb-8">
            Aprenda o método definitivo para analisar, equilibrar e finalizar imagens de alto impacto no DaVinci Resolve.
          </p>

          <a
            href="#oferta"
            className="px-10 py-4 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-base transition-all shadow-[0_4px_20px_rgba(0,113,227,0.4)] inline-flex items-center justify-center gap-2 active:scale-95"
          >
            <span>ENTRAR NO COLOR MASTER | PRODUTO</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER & LINKS LEGAIS / SUPORTE                                           */}
      {/* ========================================================================= */}
      <footer className="relative z-10 py-12 bg-[#ffffff] border-t border-[#d2d2d7]/60 text-[#6e6e73] text-xs px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-semibold text-[#1d1d1f] text-sm block mb-1">
              FLMMKR
            </span>
            <span className="text-[#86868b]">
              Color Master | Produto • Treinamento Oficial Michael Oliveira
            </span>
            <p className="text-xs text-[#86868b] mt-2">
              © {new Date().getFullYear()} FLMMKR. Todos os direitos reservados.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#6e6e73]">
            <a href="mailto:contato@flmmkr.com.br" className="hover:text-[#1d1d1f] transition-colors">
              Suporte ao Aluno
            </a>
            <span>•</span>
            <a href="/termos" className="hover:text-[#1d1d1f] transition-colors">
              Termos de Uso
            </a>
            <span>•</span>
            <a href="/privacidade" className="hover:text-[#1d1d1f] transition-colors">
              Política de Privacidade
            </a>
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
