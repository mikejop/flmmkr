'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SITE_CONFIG } from '@/config/siteConfig';
import { trackProductClick, trackSocialClick } from '@/utils/analytics';
import { ReticulaBackground } from '@/components/ReticulaBackground';
import { getRandomAuthorPhotos, AuthorPhotoPair } from '@/utils/authorPhotos';
import { LoginModal } from '@/components/LoginModal';
import { PromoModals } from '@/components/PromoModals';
import { CheckoutModal } from '@/components/CheckoutModal';
import { InstagramIcon, YouTubeIcon, TikTokIcon } from '@/components/SocialIcons';
import { BrandPreloader } from '@/components/BrandPreloader';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';

const OFFER_IMAGES = [
  { src: '/assets/produtos/color-master/offer/offer-1.webp', alt: 'Material do Masterclass - Visual 1' },
  { src: '/assets/produtos/color-master/offer/offer-2.webp', alt: 'Material do Masterclass - Visual 2' },
  { src: '/assets/produtos/color-master/offer/offer-3.webp', alt: 'Material do Masterclass - Visual 3' },
  { src: '/assets/produtos/color-master/offer/offer-4.webp', alt: 'Material do Masterclass - Visual 4' },
  { src: '/assets/produtos/color-master/offer/offer-5.webp', alt: 'Material do Masterclass - Visual 5' },
];

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

export const ColorMasterLanding: React.FC = () => {
  const instructorCardRef = useRef<HTMLDivElement>(null);

  const [authorPhotos, setAuthorPhotos] = useState<AuthorPhotoPair>({
    profileSrc: '/assets/mike-photos/01.jpg',
    bgSrc: '/assets/bg/about-mike/02.jpg'
  });
  const [logos, setLogos] = useState<{ name: string; src: string }[]>(PRODUTORAS_LOGOS);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openModule, setOpenModule] = useState<number | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [showStickyTimer, setShowStickyTimer] = useState<boolean>(false);
  const [activeOfferBg, setActiveOfferBg] = useState<number>(0);

  // Auto cycle offer background footage stills every 60 seconds
  useEffect(() => {
    const bgTimer = setInterval(() => {
      setActiveOfferBg((prev) => (prev + 1) % OFFER_IMAGES.length);
    }, 60000); // 60 segundos por imagem
    return () => clearInterval(bgTimer);
  }, []);

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

  // Modais de Alerta (1:30) e Expiração (tempo esgotado)
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [expiredModalOpen, setExpiredModalOpen] = useState<boolean>(false);
  const [warningDismissed, setWarningDismissed] = useState<boolean>(false);
  const [expiredDismissed, setExpiredDismissed] = useState<boolean>(false);
  const [deviceMac, setDeviceMac] = useState<string>('');
  const hasWarnedRef = useRef<boolean>(false);
  const hasExpiredRef = useRef<boolean>(false);
  const prevTimeLeftRef = useRef<number>(900);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero-section');
      const ofertaSection = document.getElementById('oferta');

      const isPastHero = heroSection
        ? heroSection.getBoundingClientRect().bottom <= 100
        : window.scrollY > 400;

      const isReachedOferta = ofertaSection
        ? ofertaSection.getBoundingClientRect().top <= 120
        : false;

      // Mostra a barra após sair da Hero e oculta ao chegar na seção de Oferta
      setShowStickyTimer(isPastHero && !isReachedOferta);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setAuthorPhotos(getRandomAuthorPhotos());

    // Obter a impressão digital do computador (MAC Address de hardware)
    getDeviceFingerprint().then((mac) => {
      setDeviceMac(mac);

      // Sincronizar com o servidor: prioridade 1 = MAC Address, prioridade 2 = IP
      fetch(`/api/offer-timer?macAddress=${encodeURIComponent(mac)}`)
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

            // Se o cronômetro estiver zerado e o usuário acessar a página novamente,
            // o modal dizendo que a promoção acabou aparecerá automaticamente
            if (data.isExpired || data.remainingSeconds <= 0) {
              setExpiredModalOpen(true);
            }
          }
        })
        .catch(() => {});
    });

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

  // Monitoramento do cronômetro para os Modais de Aviso (01:30) e Expiração (tempo esgotado)
  useEffect(() => {
    const prev = prevTimeLeftRef.current;
    prevTimeLeftRef.current = timeLeft;

    // 1. Faltando 1 minuto e 30 segundos (<= 90 segundos e > 0)
    if (timeLeft <= 90 && timeLeft > 0 && !hasWarnedRef.current && !warningDismissed) {
      hasWarnedRef.current = true;
      setWarningModalOpen(true);
    }

    // 2. Quando o tempo acabar (zerar o cronômetro)
    if (timeLeft <= 0 && prev > 0 && !hasExpiredRef.current && !expiredDismissed) {
      hasExpiredRef.current = true;
      setWarningModalOpen(false); // Fecha o modal de aviso se ainda estivesse aberto
      setExpiredModalOpen(true); // Abre o modal de expiração com o valor real
    }
  }, [timeLeft, warningDismissed, expiredDismissed]);

  useEffect(() => {
    // YouTube IFrame API para controle de qualidade adaptativa (4K Desktop / HD Mobile)
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    const initPlayer = () => {
      if (typeof window !== 'undefined' && (window as any).YT && (window as any).YT.Player) {
        new (window as any).YT.Player('hero-yt-player', {
          events: {
            onReady: (event: any) => {
              event.target.mute();
              event.target.playVideo();
              const isMobile = window.innerWidth < 768;
              if (isMobile) {
                // Mobile: HD (720p) para economizar dados e garantir fluidez
                if (event.target.setPlaybackQuality) {
                  event.target.setPlaybackQuality('hd720');
                }
              } else {
                // Desktop: Preferência 4K (2160p/highres), adaptando para FHD/HD caso a conexão exija
                if (event.target.setPlaybackQuality) {
                  event.target.setPlaybackQuality('hd2160');
                }
              }
            },
            onStateChange: (event: any) => {
              // Loop suave ao terminar
              if (event.data === 0) {
                event.target.seekTo(0);
                event.target.playVideo();
              }
            }
          }
        });
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatInstallment = (price: number) => {
    const installment = (price / 12).toFixed(2).replace('.', ',');
    return `12x de R$ ${installment}`;
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
      subtitle: 'Padrões de entrega comercial, codecs e exportação para Redes Sociais, YouTube, TV e Cinema',
      lessons: [
        'Deliver (Configurações avançadas na aba Deliver)',
        'Exportação e masterização para Redes Sociais, YouTube, TV e Cinema'
      ]
    }
  ];

  // 07. Perguntas Frequentes
  const faqList = [
    {
      q: 'Para quem é o masterclass Color Master | Produto?',
      a: 'É indicado para videomakers, diretores de fotografia, editores e criadores de conteúdo que trabalham ou desejam atuar no mercado de comerciais, publicidade e vídeos de produto. Seja você um profissional buscando refinar suas tomadas de decisão ou alguém querendo elevar o padrão visual de seus projetos, a metodologia ensina o fluxo completo de ponta a ponta.'
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
      q: 'Como funciona o pagamento e quais são as formas disponíveis?',
      a: 'O pagamento é processado com total segurança pelo Asaas (instituição de pagamento autorizada pelo Banco Central). Você pode parcelar em até 12x no cartão de crédito, pagar à vista via Pix com liberação imediata ou via boleto bancário.'
    },
    {
      q: 'Terei acesso aos arquivos e footage de comerciais reais para praticar?',
      a: 'Sim. Você terá acesso aos arquivos de projeto e às mídias originais em formato profissional de comerciais reais produzidos para clientes e marcas do mercado, permitindo praticar exatamente no mesmo padrão de uma pós-produção comercial.'
    },
    {
      q: 'Como funciona a garantia incondicional de 7 dias?',
      a: 'Você tem 7 dias corridos a partir da compra para assistir às aulas e testar o conteúdo. Se por qualquer motivo sentir que o treinamento não atendeu às suas expectativas, basta enviar um e-mail para receber 100% do valor de volta, sem burocracia.'
    },
    {
      q: 'O treinamento emite certificado de conclusão?',
      a: 'Por se tratar de uma Masterclass de imersão prática (focada em tomada de decisão e workflow de comerciais), o foco primordial é a construção de repertório e portfólio real com footage comercial profissional.'
    }
  ];

  const getAsaasCheckoutUrl = () => {
    if (isExpired) {
      return 'https://www.asaas.com/000/c/iv2p2s5tkbt1qi79'; // R$ 195 (Regular)
    }
    if (priceData.promoPrice === 95) {
      return 'https://www.asaas.com/000/c/shb377el3w1mrucx'; // R$ 95 (Lote 1)
    }
    if (priceData.promoPrice === 125) {
      return 'https://www.asaas.com/000/c/nbka8c38x8ao6cl2'; // R$ 125 (Lote 2)
    }
    if (priceData.promoPrice === 145) {
      return 'https://www.asaas.com/000/c/8838cr0upgtyi6bp'; // R$ 145 (Lote 3)
    }
    return 'https://www.asaas.com/000/c/iv2p2s5tkbt1qi79'; // R$ 195 (Regular)
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased selection:bg-[#0071e3]/20 selection:text-[#0071e3]">
      {/* Brand Transition Preloader */}
      <BrandPreloader />

      {/* Login Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {/* Custom Checkout Modal (Asaas + Supabase) */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        price={priceData.promoPrice}
        regularPrice={priceData.regularPrice}
        isExpired={isExpired}
        macAddress={deviceMac}
      />

      {/* Modais de Alerta (1:30) e Expiração (Preço Real) */}
      <PromoModals
        warningOpen={warningModalOpen}
        onCloseWarning={() => {
          setWarningModalOpen(false);
          setWarningDismissed(true);
        }}
        expiredOpen={expiredModalOpen}
        onCloseExpired={() => {
          setExpiredModalOpen(false);
          setExpiredDismissed(true);
        }}
        timeLeft={timeLeft}
        promoPrice={priceData.promoPrice}
        regularPrice={priceData.regularPrice}
        checkoutUrl={isExpired ? 'https://www.asaas.com/000/c/iv2p2s5tkbt1qi79' : getAsaasCheckoutUrl()}
        formatTime={formatTime}
        onOpenCheckout={() => setCheckoutModalOpen(true)}
      />

      {/* TOP FIXED COUNTDOWN BANNER (SÓ APARECE APÓS SAIR DA HERO) */}
      <div
        className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-400 [transition-timing-function:cubic-bezier(0.45,0,0.55,1)] ${
          showStickyTimer
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        } ${
          isExpired
            ? 'bg-[#1c1c1e]/95 text-white border-b border-red-500/30'
            : 'bg-gradient-to-r from-[#0071e3] via-[#0051a8] to-[#0071e3] text-white border-b border-white/20'
        } backdrop-blur-md shadow-md`}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {!isExpired ? (
              <>
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2997ff] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2997ff]"></span>
                </span>
                <span className="font-bold text-white uppercase tracking-wider text-[10px] sm:text-xs truncate">
                  Oferta 15 Minutos
                </span>
                <span className="hidden md:inline text-white/90">
                  • Garanta por apenas <strong className="text-white underline decoration-white/60 font-bold">R$ {priceData.promoPrice}</strong> no lote promocional de lançamento!
                </span>
              </>
            ) : (
              <>
                <span className="text-red-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs shrink-0">
                  Tempo Expirado
                </span>
                <span className="text-white/80 hidden sm:inline truncate">
                  • Preço regular: R$ 195.
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!isExpired ? (
              <div className="flex items-center gap-1 sm:gap-1.5 bg-black/40 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-white/20">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/70">Tempo:</span>
                <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[#2997ff]">
                  {formatTime(timeLeft)}
                </span>
              </div>
            ) : (
              <span className="text-[10px] sm:text-xs font-bold text-red-300 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-800/40">
                Expirado
              </span>
            )}

            <a
              href="#oferta"
              className="px-2.5 sm:px-3 py-1 rounded-full bg-white text-[#0071e3] hover:bg-white/90 text-[11px] sm:text-xs font-bold transition-all shadow-xs shrink-0 active:scale-95"
            >
              {!isExpired ? 'Aproveitar' : 'Ver Preço'}
            </a>
          </div>
        </div>
      </div>

      {/* Glassmorphism Header Navigation */}
      <header
        className={`sticky z-40 w-full border-b border-white/10 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] transition-all duration-300 ${
          showStickyTimer ? 'top-[39px] sm:top-[42px]' : 'top-0'
        }`}
        style={{ background: 'rgba(14,14,18,0.85)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)' }}
      >
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between">
          <a href="/" className="font-semibold text-sm tracking-tight text-white hover:opacity-75 transition-opacity min-h-[44px] flex items-center">
            FLMMKR
          </a>

          <span className="hidden sm:inline-block text-xs text-white/80 font-semibold tracking-wide bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
            COLOR MASTER | PRODUTO
          </span>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 hover:border-white/30 transition-all active:scale-95 min-h-[44px] sm:min-h-0 flex items-center justify-center cursor-pointer"
            >
              Acessar
            </button>

            <button
              type="button"
              onClick={() => setCheckoutModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-[0_2px_12px_rgba(0,113,227,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all active:scale-95 min-h-[44px] sm:min-h-0 flex items-center justify-center cursor-pointer"
            >
              Garantir Acesso
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Landmark for Semantic SEO and Accessibility */}
      <main id="main-content">

      {/* ========================================================================= */}
      {/* 01. HERO: APRESENTAÇÃO DO PRODUTO (PRIORIDADE MÁXIMA)                     */}
      {/* ========================================================================= */}
      <section id="hero-section" className="relative z-10 overflow-hidden min-h-[100dvh] flex flex-col justify-center pt-8 pb-14 sm:pt-16 sm:pb-20 md:pt-24 md:pb-24 px-4 sm:px-6 lg:px-8 bg-black">
        {/* Mobile Poster Image Layer (Zero bandwidth waste, instant LCP < 1s) */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center md:hidden pointer-events-none select-none z-0"
          style={{ backgroundImage: `url('/assets/produtos/color-master/offer/offer-1.webp')` }}
        />

        {/* Desktop / Tablet Background Video Layer with Retícula Overlay */}
        <div className="hidden md:block absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          <iframe
            id="hero-yt-player"
            src="https://www.youtube-nocookie.com/embed/gp75L5H0kIU?autoplay=1&mute=1&controls=0&loop=1&playlist=gp75L5H0kIU&playsinline=1&rel=0&modestbranding=1&enablejsapi=1"
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

        {/* Mobile Retícula Overlay over Poster */}
        <div className="md:hidden absolute inset-0 z-1 pointer-events-none select-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.85) 1.2px, transparent 1.2px)`,
              backgroundSize: '5px 5px'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/75" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6 sm:mb-10">
            {/* Masterclass Identification Badge */}
            <div className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[12px] sm:text-xs font-semibold tracking-[0.04em] mb-4 sm:mb-5 border border-white/20 shadow-sm">
              <span className="tracking-wide uppercase font-semibold text-[#2997ff]">MASTERCLASS</span>
              <span className="mx-1.5 sm:mx-2 text-white/30">•</span>
              <span className="tracking-wide uppercase">COLOR MASTER | PRODUTO</span>
            </div>

            {/* Headline H1 with Apple Mobile Typographic Scale (34px mobile / 72px desktop) */}
            <h1 className="text-[34px] leading-[1.08] sm:text-6xl lg:text-7xl font-semibold tracking-[-0.015em] text-white mb-3.5 sm:mb-6 drop-shadow-xl max-w-4xl mx-auto">
              Potencialize seu trabalho com color grading.
            </h1>

            {/* Subtitle (Apple mobile subhead: 19px, leading 1.32) */}
            <p className="text-[19px] sm:text-xl text-white/80 font-normal leading-[1.32] mb-6 sm:mb-8 max-w-2xl drop-shadow-md">
              Trabalhe a cor com mais precisão, do material recebido ao look final, usando o DaVinci Resolve em projetos de produto para publicidade e conteúdos.
            </p>

            {/* Commercial Condition / Price Pill */}
            <div className="inline-flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1.5 sm:gap-y-2 px-4 py-2 sm:px-8 sm:py-3.5 rounded-2xl sm:rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-white shadow-2xl mb-6 sm:mb-8 max-w-full">
              {!isExpired ? (
                <>
                  <div className="flex items-baseline gap-1 sm:gap-1.5">
                    <span className="text-[12px] sm:text-sm text-white/70 font-medium">12x de</span>
                    <span className="text-[22px] sm:text-3xl font-extrabold text-white tracking-tight">
                      R$ {(priceData.promoPrice / 12).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <span className="text-white/30 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5 text-[13px] sm:text-sm text-white/70">
                    <span className="line-through text-white/40">R$ 195</span>
                    <span>ou <strong className="text-white font-bold text-[130%] sm:text-inherit">R$ {priceData.promoPrice}</strong> no Pix</span>
                  </div>
                  <span className="text-white/30 hidden sm:inline">•</span>
                  <span className="text-[12px] sm:text-sm text-white/80 font-medium">1 Ano de Acesso</span>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1 sm:gap-1.5">
                    <span className="text-[12px] sm:text-sm text-white/70 font-medium">12x de</span>
                    <span className="text-[22px] sm:text-3xl font-extrabold text-white tracking-tight">
                      R$ 16,25
                    </span>
                  </div>
                  <span className="text-white/30 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5 text-[13px] sm:text-sm text-white/70">
                    <span>
                      ou <strong className="text-white font-bold text-[130%] sm:text-inherit">R$ 195</strong> no Pix
                    </span>
                  </div>
                  <span className="text-white/30 hidden sm:inline">•</span>
                  <span className="text-[12px] sm:text-sm text-white/80 font-medium">1 Ano de Acesso</span>
                </>
              )}
            </div>

            {/* Main CTAs (Apple button typography: 14px / text-sm, compact pill) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 w-full sm:w-auto mb-4">
              <button
                type="button"
                onClick={() => {
                  trackProductClick('color-master-produto', 'Color Master Hero CTA', '#checkout', 'other');
                  setCheckoutModalOpen(true);
                }}
                className="w-full max-w-[260px] sm:max-w-none sm:w-auto px-5 sm:px-8 py-2.5 sm:py-4 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-[14px] sm:text-base transition-all shadow-[0_3px_14px_rgba(0,113,227,0.4)] flex items-center justify-center active:scale-95 cursor-pointer"
              >
                {!isExpired ? `Garantir por R$ ${priceData.promoPrice}` : 'Garantir Acesso à Masterclass'}
              </button>

              <a
                href="#aprendizado"
                className="w-full max-w-[260px] sm:max-w-none sm:w-auto px-4 sm:px-6 py-2.5 sm:py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-normal text-[14px] sm:text-sm transition-all border border-white/20 flex items-center justify-center active:scale-95 cursor-pointer"
              >
                Ver Conteúdo Completo
              </a>
            </div>

            {/* Trust highlights */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-1.5 sm:gap-y-2 mt-3 sm:mt-4 text-[12px] sm:text-sm text-white/70 font-normal">
              <div className="flex items-center gap-1.5">
                <span className="text-[#2997ff] font-bold">•</span>
                <span>1 Ano de Acesso</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#2997ff] font-bold">•</span>
                <span>Footages inclusos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03. CONTEÚDO DO MASTERCLASS                                               */}
      {/* ========================================================================= */}
      <section id="aprendizado" className="relative z-10 scroll-mt-14 sm:scroll-mt-20 py-12 sm:py-16 md:py-24 bg-[#000000] text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[#2997ff] font-semibold mb-2 block">
              CONTEÚDO DO MASTERCLASS
            </span>
            <h2 className="text-[28px] leading-[1.14] sm:text-4xl md:text-5xl font-semibold tracking-[-0.015em] text-white">
              Conteúdo do Masterclass
            </h2>
            <p className="text-[17px] leading-[1.47] sm:text-base md:text-lg text-white/70 mt-2.5 sm:mt-3 font-normal max-w-xl mx-auto">
              Aulas organizadas rigorosamente pelas 5 etapas do processo de pós-produção e color grading de produto.
            </p>
          </div>

          {/* Pipeline Overview Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 mb-8 sm:mb-10">
            {[
              { step: '01. Preparação', desc: 'Gerenciamento & ACES' },
              { step: '02. Análise & Correção', desc: 'Primárias & Matching' },
              { step: '03. Refinamento', desc: 'Secundárias & Detalhes' },
              { step: '04. Criação de Look', desc: 'DIY & Dehancer Pro' },
              { step: '05. Finalização', desc: 'Deliver & Exportação' },
            ].map((chip, idx) => (
              <div key={idx} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#161617] border border-white/10 shadow-xs text-center">
                <span className="text-[12px] sm:text-xs font-semibold text-[#2997ff] block">{chip.step}</span>
                <span className="text-[11px] sm:text-xs text-white/70 mt-0.5 block truncate sm:overflow-visible">{chip.desc}</span>
              </div>
            ))}
          </div>

          {/* Accordion List for Expandable Modules with Quadratic Easing */}
          <div className="space-y-3.5 sm:space-y-4">
            {learningModules.map((mod, idx) => {
              const isOpen = openModule === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl sm:rounded-3xl bg-[#161617] border border-white/10 overflow-hidden shadow-sm transition-all duration-300 hover:border-[#2997ff]/40"
                >
                  <button
                    onClick={() => toggleModule(idx)}
                    className="w-full p-4 sm:p-6 md:p-7 min-h-[56px] text-left flex items-center justify-between gap-3 sm:gap-4 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                      <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#2997ff]/15 text-[#2997ff] border border-[#2997ff]/30 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                        {mod.num}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[17px] sm:text-lg md:text-xl font-semibold text-white leading-snug truncate sm:overflow-visible">
                          {mod.title}
                        </h3>
                        <p className="text-[13px] sm:text-sm text-white/70 mt-0.5 sm:mt-1 font-normal line-clamp-1 sm:line-clamp-none">
                          {mod.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-white/80 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.45,0,0.55,1)]">
                      <span className={`inline-block transition-transform duration-500 [transition-timing-function:cubic-bezier(0.45,0,0.55,1)] ${isOpen ? 'rotate-45 text-[#2997ff]' : 'rotate-0'}`}>
                        +
                      </span>
                    </div>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-500 [transition-timing-function:cubic-bezier(0.45,0,0.55,1)] ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 sm:px-7 sm:pb-7 pt-2 border-t border-white/10 bg-[#111113]">
                        <span className="text-[12px] uppercase font-semibold text-[#2997ff] tracking-[0.04em] mb-2.5 sm:mb-3 block">
                          Aulas e Tópicos Deste Módulo:
                        </span>
                        <div className="space-y-2 sm:space-y-2.5">
                          {mod.lessons.map((lesson, lIdx) => (
                            <div
                              key={lIdx}
                              className="flex items-start gap-2.5 sm:gap-3 text-[14px] sm:text-sm leading-normal text-white/90 bg-[#1c1c1e] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-white/10"
                            >
                              <span className="text-xs font-mono font-bold text-[#2997ff] shrink-0 mt-0.5">
                                {(lIdx + 1).toString().padStart(2, '0')}.
                              </span>
                              <span>{lesson}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 04. APLICAÇÃO PROFISSIONAL                                                */}
      {/* ========================================================================= */}
      <section className="relative z-10 min-h-[100dvh] flex flex-col justify-center py-12 md:py-16 bg-[#f5f5f7] px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto w-full my-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[#0071e3] font-semibold mb-2 block">
              MERCADO DE TRABALHO REAL
            </span>
            <h2 className="text-[28px] leading-[1.14] sm:text-4xl md:text-5xl font-semibold tracking-[-0.015em] text-[#1d1d1f]">
              Aplicação Profissional
            </h2>
            <p className="text-[17px] leading-[1.47] sm:text-base md:text-lg text-[#6e6e73] mt-2.5 sm:mt-3 font-normal max-w-xl mx-auto">
              Domine as competências mais cobradas em produtoras, agências e clientes de alta exigência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-8 sm:mb-10">
            {/* Card 1: Publicidade */}
            <div className="p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col justify-between hover:border-[#0071e3]/30 transition-all">
              <div>
                <span className="inline-block px-3 sm:px-3.5 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[11px] sm:text-xs uppercase tracking-[0.04em] font-semibold mb-3 sm:mb-4 border border-[#0071e3]/20">
                  PUBLICIDADE
                </span>
                <h3 className="text-[21px] leading-[1.24] sm:text-2xl font-semibold text-[#1d1d1f] mb-2 sm:mb-3">
                  Comerciais & Campanhas de TV
                </h3>
                <p className="text-[15px] sm:text-base text-[#6e6e73] leading-[1.5]">
                  Leve projetos de produto a um acabamento visual à altura da publicidade. Trabalhe cor, contraste, consistência entre planos e construção de look para valorizar o produto e dar ao projeto a qualidade visual esperada em uma entrega para televisão.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-4 border-t border-[#e5e5e7] text-[12px] font-semibold text-[#1d1d1f]">
                Padrão Broadcast
              </div>
            </div>

            {/* Card 2: Conteúdo */}
            <div className="p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col justify-between hover:border-[#0071e3]/30 transition-all">
              <div>
                <span className="inline-block px-3 sm:px-3.5 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[11px] sm:text-xs uppercase tracking-[0.04em] font-semibold mb-3 sm:mb-4 border border-[#0071e3]/20">
                  CONTEÚDO
                </span>
                <h3 className="text-[21px] leading-[1.24] sm:text-2xl font-semibold text-[#1d1d1f] mb-2 sm:mb-3">
                  Filmes Digitais & Social Media
                </h3>
                <p className="text-[15px] sm:text-base text-[#6e6e73] leading-[1.5]">
                  Do conteúdo para YouTube aos vídeos de produto para redes sociais, o trabalho de cor ajuda a manter unidade, valorizar o que está em cena e dar mais qualidade visual a cada entrega.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-4 border-t border-[#e5e5e7] text-[12px] font-semibold text-[#1d1d1f]">
                Alta Performance no Digital
              </div>
            </div>
          </div>

          {/* Practical Callout Banner */}
          <div className="p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-[#ffffff] border border-[#0071e3]/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-[12px] font-semibold text-[#0071e3] uppercase tracking-[0.04em] block mb-1">
                Nada de Simulacro
              </span>
              <h3 className="text-[19px] sm:text-2xl font-semibold text-[#1d1d1f] mb-2 leading-[1.3] tracking-[-0.01em]">
                "Você não vai aprender usando imagens aleatórias, mas sim em projetos reais, com problemas reais e soluções reais."
              </h3>
              <p className="text-[15px] sm:text-base text-[#6e6e73] leading-[1.5]">
                Nada na nossa metodologia simula projetos de clientes que nunca existiram. Tudo é feito baseado em projetos reais, que fizemos para nossos clientes. Você vai aprender o workflow que funciona no mundo real e as soluções usadas dentro de um projeto que passou pelo crivo do cliente.
              </p>
            </div>
            <a
              href="#oferta"
              className="w-full max-w-[260px] sm:max-w-none sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-[14px] sm:text-sm transition-all shrink-0 active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
            >
              Garantir Minha Vaga
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 05. QUEM ENSINA: MICHAEL OLIVEIRA                                         */}
      {/* ========================================================================= */}
      <section className="relative z-10 min-h-[100dvh] flex flex-col justify-center py-12 md:py-16 bg-[#000000] px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ReticulaBackground
          bgImageSrc={authorPhotos.bgSrc}
          crossfadeScroll={true}
          fadeFromColor="#f5f5f7"
          fadeToColor="#000000"
          targetBlockRef={instructorCardRef}
        />

        <div
          ref={instructorCardRef}
          className="max-w-5xl mx-auto relative z-10 w-full my-auto will-change-[opacity]"
        >
          <div className="rounded-2xl sm:rounded-3xl bg-[#ffffff]/90 backdrop-blur-md border border-[#e5e5e7] p-6 sm:p-10 md:p-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
              {/* Teacher Photo */}
              <div className="md:col-span-4 flex justify-center items-center">
                <div className="relative w-full max-w-[200px] sm:max-w-[260px] md:max-w-[280px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#d2d2d7] bg-[#f5f5f7] shadow-md group">
                  <img
                    src={authorPhotos.profileSrc}
                    alt={SITE_CONFIG.author.name}
                    className="w-full h-auto object-contain block rounded-2xl sm:rounded-3xl transition-transform duration-500 ease-quadratic hover:scale-[1.02]"
                  />
                </div>
              </div>

              {/* Teacher Bio */}
              <div className="md:col-span-8 flex flex-col items-start">
                <span className="text-[12px] uppercase tracking-[0.04em] text-[#0071e3] font-semibold mb-1.5 sm:mb-2 block">
                  INSTRUTOR DA MASTERCLASS
                </span>
                <h2 className="text-[28px] leading-[1.14] sm:text-3xl md:text-4xl font-semibold tracking-[-0.015em] text-[#1d1d1f] mb-3 sm:mb-4">
                  Michael Oliveira
                </h2>

                <div className="space-y-3 sm:space-y-4 text-[16px] sm:text-base md:text-lg text-[#6e6e73] leading-[1.55] font-normal">
                  <p>
                    <span className="font-semibold text-[#1d1d1f]">Diretor, diretor de fotografia, colorista e finalizador</span> com <span className="font-medium text-[#3a3a3c]">mais de 20 anos de experiência no mercado audiovisual</span>.
                  </p>
                  <p>
                    Atuou em centenas de campanhas publicitárias, videoclipes, institucionais e conteúdos comerciais para grandes marcas e produtoras em todo o Brasil. É ex-professor de Color Grading da <strong className="font-semibold text-[#1d1d1f]">EBAC</strong> (Escola Britânica de Artes Criativas e Tecnologia).
                  </p>
                  <p>
                    Sua abordagem pedagógica combina fundamentos técnicos sólidos da ciência de cores com os atalhos e decisões práticas exigidas no fluxo de trabalho de pós-produção do dia a dia.
                  </p>
                </div>

                {/* Highlights pills */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 mt-6 sm:mt-8 w-full max-w-lg">
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#ffffff] border border-[#e5e5e7] text-[12px] sm:text-sm text-[#6e6e73] shadow-xs">
                    <span className="font-bold text-[#0071e3] block text-[16px] sm:text-base">+20 ANOS</span>
                    <span>Experiência Audiovisual</span>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#ffffff] border border-[#e5e5e7] text-[12px] sm:text-sm text-[#6e6e73] shadow-xs">
                    <span className="font-bold text-[#0071e3] block text-[16px] sm:text-base">EX-PROFESSOR</span>
                    <span>EBAC Color Grading</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Produtoras Atendidas Carousel */}
            <div className="mt-8 pt-6 sm:mt-10 sm:pt-8 border-t border-[#e5e5e7]/80 w-full">
              <span className="text-[12px] uppercase tracking-[0.04em] text-[#86868b] font-semibold mb-3 sm:mb-4 block text-center sm:text-left">
                Produtoras Atendidas e Projetos Relevantes
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
                      className="shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border border-[#e5e5e7] shadow-xs flex items-center justify-center bg-white"
                    >
                      <img
                        src={logo.src}
                        alt={logo.name}
                        className="h-10 sm:h-14 md:h-18 w-auto max-w-[130px] sm:max-w-[170px] object-cover block"
                      />
                    </div>
                  ))}
                </div>

                <div className="marquee-track py-2" aria-hidden="true">
                  {(logos.length > 0 && logos.length < 12 ? [...logos, ...logos] : logos).map((logo, lIdx) => (
                    <div
                      key={`t2-${lIdx}`}
                      className="shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border border-[#e5e5e7] shadow-xs flex items-center justify-center bg-white"
                    >
                      <img
                        src={logo.src}
                        alt=""
                        className="h-10 sm:h-14 md:h-18 w-auto max-w-[130px] sm:max-w-[170px] object-cover block"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 06. OFERTA E COMPRA                                                       */}
      {/* ========================================================================= */}
      <section id="oferta" className="relative z-10 scroll-mt-14 sm:scroll-mt-20 py-12 sm:py-16 md:py-24 bg-[#f5f5f7] px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[90dvh] flex flex-col justify-center">
        {/* Background Images Showcase Layer */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {OFFER_IMAGES.map((img, idx) => (
            <div
              key={idx}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out transform scale-105"
              style={{
                backgroundImage: `url('${img.src}')`,
                opacity: activeOfferBg === idx ? 1 : 0,
              }}
            />
          ))}

          {/* Pure Retícula Overlay (Black dots grid filter only) */}
          <div
            className="absolute inset-0 z-1 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.8) 1.2px, transparent 1.2px)`,
              backgroundSize: '5px 5px',
            }}
          />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10 w-full">
          <div className="p-6 sm:p-10 md:p-14 rounded-2xl sm:rounded-3xl bg-[#ffffff]/95 backdrop-blur-xl border border-[#0071e3]/30 shadow-2xl relative overflow-hidden">
            {/* Offer Header Tag */}
            <span className="px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[12px] sm:text-xs font-semibold uppercase tracking-[0.04em] mb-4 sm:mb-6 inline-block border border-[#0071e3]/20">
              OFERTA ESPECIAL DE ACESSO
            </span>

            <h2 className="text-[28px] leading-[1.14] sm:text-4xl md:text-5xl font-semibold tracking-[-0.015em] text-[#1d1d1f] mb-2 sm:mb-3">
              Color Master | Produto
            </h2>
            <p className="text-[17px] leading-[1.47] sm:text-base md:text-lg text-[#6e6e73] mb-6 sm:mb-8 font-normal">
              Masterclass completa de Color Grading para comerciais e imagens de produto no DaVinci Resolve.
            </p>

            {/* Checklist of What's Included */}
            <div className="text-left space-y-3 sm:space-y-3.5 max-w-lg mx-auto mb-6 sm:mb-8 text-[14px] sm:text-sm md:text-base leading-[1.5] text-[#1d1d1f] border-y border-[#e5e5e7] py-5 sm:py-6">
              <div className="py-1 border-b border-[#e5e5e7]/50 flex items-center gap-2">
                <span>• Masterclass Completo</span>
                <div className="relative group inline-flex items-center">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[#0071e3]/60 text-[#0071e3] hover:bg-[#0071e3] hover:text-white text-xs font-bold transition-colors cursor-help focus:outline-hidden"
                    aria-label="Informações sobre o Masterclass Completo"
                  >
                    i
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block group-focus-within:block w-72 p-3 bg-[#1d1d1f] text-white text-xs rounded-2xl shadow-2xl border border-white/15 z-30 pointer-events-none text-left animate-in fade-in zoom-in-95 duration-200">
                    <span className="font-semibold text-[#2997ff] block mb-1">
                      Acesso Antecipado &amp; <span className="text-[#2997ff] font-bold">BETA</span>
                    </span>
                    <span className="text-white/80 leading-relaxed block">
                      Até o dia 13 de outubro de 2026 o masterclass estará em <strong className="text-[#2997ff] font-bold">beta</strong> e por isso conta com este valor promocional exclusivo. No dia 13 de outubro estará tudo 100% completo e disponível.
                    </span>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1d1d1f]" />
                  </div>
                </div>
              </div>
              <div className="py-1 border-b border-[#e5e5e7]/50">
                • Aulas práticas gravadas em alta resolução no DaVinci Resolve
              </div>
              <div className="py-1 border-b border-[#e5e5e7]/50">
                • Footages reais de produto em LOG como material de apoio
              </div>
              <div className="py-1 font-semibold text-[#1d1d1f]">
                • 1 Ano de Acesso Completo e Ilimitado à Plataforma
              </div>
            </div>

            {/* Dynamic Price Box with 15-min countdown condition */}
            <div className="mb-6 sm:mb-8">
              {!isExpired ? (
                <>
                  <div className="inline-block px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[12px] font-semibold uppercase tracking-[0.04em] mb-2 border border-[#0071e3]/20">
                    Tempo Restante: {formatTime(timeLeft)}
                  </div>
                  <span className="text-[13px] sm:text-sm text-[#86868b] block line-through">
                    De R$ 195 por apenas:
                  </span>
                  <div className="text-[39px] leading-tight sm:text-5xl md:text-6xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">
                    R$ {priceData.promoPrice} <span className="text-base sm:text-xl font-normal text-[#6e6e73]">no Pix</span>
                  </div>
                  <div className="text-[15px] sm:text-lg font-bold text-[#0071e3] mt-1.5 sm:mt-2">
                    ou em {formatInstallment(priceData.promoPrice)} no cartão
                  </div>
                  <span className="text-[12px] sm:text-sm font-medium text-[#86868b] mt-1.5 block">
                    {priceData.batchName} {priceData.nextPriceDate ? `(Válido até ${priceData.nextPriceDate})` : ''}
                  </span>
                </>
              ) : (
                <>
                  <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-[12px] font-semibold uppercase tracking-[0.04em] mb-2 border border-red-500/30">
                    Tempo de 15 Minutos Expirado
                  </div>
                  <span className="text-[12px] text-[#86868b] uppercase font-semibold tracking-[0.04em] block mb-1">
                    Preço Regular Oficial
                  </span>
                  <div className="text-[39px] leading-tight sm:text-5xl md:text-6xl font-extrabold text-[#1d1d1f] tracking-tight">
                    R$ 195 <span className="text-base sm:text-xl font-normal text-[#6e6e73]">no Pix</span>
                  </div>
                  <div className="text-[15px] sm:text-lg font-bold text-[#0071e3] mt-1.5 sm:mt-2">
                    ou em 12x de R$ 16,25 no cartão
                  </div>
                </>
              )}
            </div>

            {/* Primary Buy CTA */}
            <button
              type="button"
              onClick={() => {
                trackProductClick('color-master-buy', 'Color Master Buy Checkout', '#checkout', 'other');
                setCheckoutModalOpen(true);
              }}
              className="w-full max-w-[280px] sm:max-w-none sm:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-[14px] sm:text-base transition-all shadow-[0_4px_24px_rgba(0,113,227,0.4)] inline-flex items-center justify-center active:scale-95 cursor-pointer"
            >
              GARANTIR MINHA VAGA AGORA
            </button>

            {/* Guarantee and Security */}
            <div className="mt-5 sm:mt-6 text-[12px] sm:text-sm text-[#6e6e73] font-medium">
              Garantia incondicional de 7 dias • Risco zero
            </div>
          </div>

          {/* Background Footage Indicator Pills (with >=44px touch area) */}
          <div className="mt-6 flex items-center justify-center gap-1 sm:gap-2">
            {OFFER_IMAGES.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveOfferBg(idx)}
                className="p-3 -m-1.5 inline-flex items-center justify-center cursor-pointer min-w-[36px] min-h-[36px]"
                aria-label={`Ver frame de fundo ${idx + 1}`}
              >
                <span
                  className={`h-1.5 rounded-full transition-all block ${
                    activeOfferBg === idx
                      ? 'w-6 bg-[#0071e3]'
                      : 'w-1.5 bg-[#1d1d1f]/20 hover:bg-[#1d1d1f]/40'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 07. PERGUNTAS FREQUENTES (FAQ ACCORDION)                                  */}
      {/* ========================================================================= */}
      <section id="faq" className="relative z-10 scroll-mt-14 sm:scroll-mt-20 min-h-[100dvh] flex flex-col justify-center py-12 sm:py-16 md:py-24 bg-[#f5f5f7] border-t border-[#d2d2d7]/60 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full my-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[#0071e3] font-semibold mb-2 block">
              DÚVIDAS FREQUENTES
            </span>
            <h2 className="text-[28px] leading-[1.14] sm:text-4xl md:text-5xl font-semibold tracking-[-0.015em] text-[#1d1d1f]">
              Perguntas Frequentes
            </h2>
            <p className="text-[17px] leading-[1.47] sm:text-base text-[#6e6e73] mt-2.5 max-w-xl mx-auto font-normal">
              Tudo o que você precisa saber sobre a masterclass, acesso e metodologia.
            </p>
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            {faqList.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#ffffff] border border-[#e5e5e7] overflow-hidden shadow-xs transition-all duration-300 hover:border-[#0071e3]/30"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-6 min-h-[52px] text-left flex items-center justify-between text-[16px] sm:text-base md:text-lg font-semibold text-[#1d1d1f] hover:text-[#0071e3] transition-colors cursor-pointer leading-snug"
                    aria-expanded={isOpen}
                  >
                    <span className="pr-3 sm:pr-4">{faq.q}</span>
                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-sm font-semibold text-[#86868b] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.45,0,0.55,1)]">
                      <span className={`inline-block transition-transform duration-500 [transition-timing-function:cubic-bezier(0.45,0,0.55,1)] ${isOpen ? 'rotate-45 text-[#0071e3]' : 'rotate-0'}`}>
                        +
                      </span>
                    </div>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-500 [transition-timing-function:cubic-bezier(0.45,0,0.55,1)] ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 sm:px-6 sm:pb-6 text-[15px] sm:text-sm md:text-base text-[#6e6e73] leading-[1.55] border-t border-[#e5e5e7] pt-3.5 sm:pt-4 bg-[#fafafc]">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 08. ENCERRAMENTO                                                          */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#000000] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-6 sm:p-12 md:p-16 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1c1c1e] to-[#0d0d0f] border border-white/10 shadow-2xl relative overflow-hidden">
            <h2 className="text-[26px] leading-[1.18] sm:text-4xl md:text-5xl font-semibold tracking-[-0.015em] text-white mb-3 sm:mb-4">
              Domine a construção visual de produtos e eleve seus comerciais.
            </h2>
            <p className="text-[17px] leading-[1.47] sm:text-base md:text-lg text-white/70 max-w-xl mx-auto mb-6 sm:mb-8 font-normal">
              Aprenda o método definitivo para analisar, equilibrar e finalizar imagens de alto impacto no DaVinci Resolve.
            </p>

            <a
              href="#oferta"
              className="w-full max-w-[280px] sm:max-w-none sm:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-[14px] sm:text-base transition-all shadow-[0_4px_24px_rgba(0,113,227,0.4)] inline-flex items-center justify-center active:scale-95 cursor-pointer"
            >
              ENTRAR NO COLOR MASTER | PRODUTO
            </a>
          </div>
        </div>
      </section>

      {/* Mobile Floating Bottom Bar (App-like UX for mobile conversion) */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 p-3 sm:hidden transition-all duration-300 ${
          showStickyTimer
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="flex items-center justify-between gap-3 bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/20 p-2.5 px-4 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col pl-1 min-w-0">
            <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider leading-none">Acesso Completo</span>
            <span className="text-sm font-extrabold text-white mt-0.5 leading-none truncate">
              {!isExpired ? <span className="text-[130%] inline-block font-black">R$ {priceData.promoPrice}</span> : 'R$ 195'}
              <span className="text-[10px] font-normal text-white/60 ml-1">no Pix</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCheckoutModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#0071e3] text-white text-xs font-bold shadow-md active:scale-95 shrink-0 min-h-[38px] flex items-center justify-center cursor-pointer"
          >
            Garantir Vaga
          </button>
        </div>
      </div>
      </main>

      {/* ========================================================================= */}
      {/* FOOTER & LINKS LEGAIS / SUPORTE                                           */}
      {/* ========================================================================= */}
      <footer className="relative z-10 py-10 pb-[max(2.5rem,calc(env(safe-area-inset-bottom)+2rem))] bg-[#ffffff] border-t border-[#d2d2d7]/60 text-[#6e6e73] text-xs px-4 sm:px-6 lg:px-8">
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
            <a href="mailto:contato@flmmkr.com.br" className="hover:text-[#1d1d1f] transition-colors py-1.5 px-1 min-h-[44px] flex items-center">
              Suporte ao Aluno
            </a>
            <span>•</span>
            <a href="/termos" className="hover:text-[#1d1d1f] transition-colors py-1.5 px-1 min-h-[44px] flex items-center">
              Termos de Uso
            </a>
            <span>•</span>
            <a href="/privacidade" className="hover:text-[#1d1d1f] transition-colors py-1.5 px-1 min-h-[44px] flex items-center">
              Política de Privacidade
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            {SITE_CONFIG.social.map((soc) => (
              <a
                key={soc.name}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackSocialClick(soc.name, 'other')}
                className="w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#6e6e73] hover:text-[#1d1d1f] border border-[#d2d2d7] transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                aria-label={soc.name}
                title={soc.name}
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
