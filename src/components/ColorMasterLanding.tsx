'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, X, AlertTriangle } from 'lucide-react';
import { SITE_CONFIG } from '@/config/siteConfig';
import { trackProductClick, trackSocialClick } from '@/utils/analytics';
import { ReticulaBackground } from '@/components/ReticulaBackground';
import { getRandomAuthorPhotos, AuthorPhotoPair } from '@/utils/authorPhotos';
import dynamic from 'next/dynamic';
import { InstagramIcon, YouTubeIcon, TikTokIcon } from '@/components/SocialIcons';
import { BrandPreloader } from '@/components/BrandPreloader';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';
import { formatAsaas12x, getAsaas12xInstallmentValue } from '@/utils/asaasPricing';

// Dynamic Modals (Carregados sob demanda para não pesar o bundle inicial)
const LoginModal = dynamic(
  () => import('@/components/LoginModal').then((mod) => mod.LoginModal),
  { ssr: false }
);
const PromoModals = dynamic(
  () => import('@/components/PromoModals').then((mod) => mod.PromoModals),
  { ssr: false }
);
const CheckoutModal = dynamic(
  () => import('@/components/CheckoutModal').then((mod) => mod.CheckoutModal),
  { ssr: false }
);

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

const MAX_EXPIRED_MODAL_VIEWS = 2;

const hasSeenPromoTooltip = (mac?: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    // 1. Checa cookies
    const cookieName = mac ? `flmmkr_promo_seen_${mac}` : 'flmmkr_promo_seen';
    if (document.cookie.includes(`${cookieName}=1`) || document.cookie.includes('flmmkr_promo_seen=1')) {
      return true;
    }
    // 2. Checa localStorage (chaves com mac e genéricas)
    const localKey = mac ? `flmmkr_seen_welcome_promo_${mac}` : 'flmmkr_seen_welcome_promo';
    return !!(
      localStorage.getItem(localKey) ||
      localStorage.getItem('flmmkr_seen_welcome_promo') ||
      localStorage.getItem('flmmkr_seen_promo_tooltip')
    );
  } catch {
    return false;
  }
};

const markPromoTooltipSeen = (mac?: string): void => {
  if (typeof window === 'undefined') return;
  try {
    // Salva no localStorage
    localStorage.setItem('flmmkr_seen_welcome_promo', 'true');
    localStorage.setItem('flmmkr_seen_promo_tooltip', 'true');
    if (mac) {
      localStorage.setItem(`flmmkr_seen_welcome_promo_${mac}`, 'true');
    }
    // Salva em cookie de longa duração (1 ano) para persistir mesmo se o localStorage for limpo
    const cookieExpires = new Date();
    cookieExpires.setFullYear(cookieExpires.getFullYear() + 1);
    const expiresStr = cookieExpires.toUTCString();
    document.cookie = `flmmkr_promo_seen=1; expires=${expiresStr}; path=/; SameSite=Lax`;
    if (mac) {
      document.cookie = `flmmkr_promo_seen_${mac}=1; expires=${expiresStr}; path=/; SameSite=Lax`;
    }
  } catch {}
};

const getExpiredModalViews = (mac?: string): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const key = mac ? `flmmkr_expired_views_${mac}` : 'flmmkr_expired_views';
    const val = localStorage.getItem(key) || localStorage.getItem('flmmkr_expired_views');
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
};

const recordExpiredModalView = (mac?: string): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const current = getExpiredModalViews(mac);
    const next = current + 1;
    localStorage.setItem('flmmkr_expired_views', next.toString());
    if (mac) {
      localStorage.setItem(`flmmkr_expired_views_${mac}`, next.toString());
    }
    return next;
  } catch {
    return 0;
  }
};

export const ColorMasterLanding: React.FC = () => {
  const [authorPhotos, setAuthorPhotos] = useState<AuthorPhotoPair>({
    profileSrc: '/assets/mike-photos/01.webp',
    bgSrc: '/assets/bg/about-mike/02.webp'
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
  const [isPriceLoaded, setIsPriceLoaded] = useState<boolean>(false);
  const [priceData, setPriceData] = useState<{
    promoPrice: number;
    currentBatchPrice?: number;
    regularPrice: number;
    finalPrice: number;
    batchName: string;
    nextPriceDate?: string;
    isLaunchPhase?: boolean;
  }>({
    promoPrice: 95,
    currentBatchPrice: 95,
    regularPrice: 195,
    finalPrice: 95,
    batchName: 'Lote Especial de Lançamento',
    nextPriceDate: '09/10/2026',
    isLaunchPhase: true
  });

  // Tooltip de boas-vindas falando a partir do logo FLMMKR (+50% de desconto)
  const [showPromoTooltip, setShowPromoTooltip] = useState<boolean>(false);
  const [promoTooltipExiting, setPromoTooltipExiting] = useState<boolean>(false);
  const promoTooltipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Tooltip de 'A promoção acabou' apontando para o preço (com link de 25% de desconto)
  const [showExpiredTooltip, setShowExpiredTooltip] = useState<boolean>(false);
  const [expiredTooltipExiting, setExpiredTooltipExiting] = useState<boolean>(false);
  const [hasDiscount25, setHasDiscount25] = useState<boolean>(false);
  const expiredTooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expiredTooltipDelayRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredExpiredTooltipRef = useRef<boolean>(false);

  // Modal de Alerta (1:30)
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [warningDismissed, setWarningDismissed] = useState<boolean>(false);
  const [deviceMac, setDeviceMac] = useState<string>('');
  const [isPastHero, setIsPastHero] = useState<boolean>(false);
  const [showNavCheckout, setShowNavCheckout] = useState<boolean>(false);
  const [isPlayingProjectVideo, setIsPlayingProjectVideo] = useState<boolean>(true);
  const [isMutedProjectVideo, setIsMutedProjectVideo] = useState<boolean>(true);
  const [isShowcaseIframeLoaded, setIsShowcaseIframeLoaded] = useState<boolean>(false);
  const projectVideoIframeRef = useRef<HTMLIFrameElement | null>(null);
  const hasWarnedRef = useRef<boolean>(false);
  const hasExpiredRef = useRef<boolean>(false);
  const prevTimeLeftRef = useRef<number>(900);

  // Fecha o tooltip do logo FLMMKR com animação suave quadrática
  const closePromoTooltip = () => {
    if (promoTooltipTimerRef.current) {
      clearTimeout(promoTooltipTimerRef.current);
      promoTooltipTimerRef.current = null;
    }
    setPromoTooltipExiting(true);
    setTimeout(() => {
      setShowPromoTooltip(false);
      setPromoTooltipExiting(false);
    }, 350); // Duração da animação de saída
  };

  // Inicia o timer de 4 segundos para sumir se o usuário não passar o mouse por cima
  const startTooltipAutoDismiss = () => {
    if (promoTooltipTimerRef.current) clearTimeout(promoTooltipTimerRef.current);
    promoTooltipTimerRef.current = setTimeout(() => {
      closePromoTooltip();
    }, 4000);
  };

  // Cancela o auto-dismiss quando o mouse entra no tooltip
  const handleTooltipMouseEnter = () => {
    if (promoTooltipTimerRef.current) {
      clearTimeout(promoTooltipTimerRef.current);
      promoTooltipTimerRef.current = null;
    }
  };

  // Retoma o timer de 4 segundos quando o mouse sai do tooltip
  const handleTooltipMouseLeave = () => {
    startTooltipAutoDismiss();
  };

  // Funções do Tooltip de Expiração apontando para o Preço
  const closeExpiredTooltip = () => {
    if (expiredTooltipTimerRef.current) {
      clearTimeout(expiredTooltipTimerRef.current);
      expiredTooltipTimerRef.current = null;
    }
    setExpiredTooltipExiting(true);
    setTimeout(() => {
      setShowExpiredTooltip(false);
      setExpiredTooltipExiting(false);
    }, 350);
  };

  // Some depois de 4 segundos que o tooltip apareceu
  const startExpiredTooltipAutoDismiss = () => {
    if (expiredTooltipTimerRef.current) clearTimeout(expiredTooltipTimerRef.current);
    expiredTooltipTimerRef.current = setTimeout(() => {
      closeExpiredTooltip();
    }, 4000);
  };

  const handleExpiredTooltipMouseEnter = () => {
    if (expiredTooltipTimerRef.current) {
      clearTimeout(expiredTooltipTimerRef.current);
      expiredTooltipTimerRef.current = null;
    }
  };

  const handleExpiredTooltipMouseLeave = () => {
    startExpiredTooltipAutoDismiss();
  };

  const handleApply25Discount = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setHasDiscount25(true);
    try {
      sessionStorage.setItem('flmmkr_discount_25', 'true');
    } catch {}
    closeExpiredTooltip();
    setCheckoutModalOpen(true);
  };

  // Disparado ao concluir o preloader: se for a primeira visita, abre o tooltip no logo FLMMKR (apenas 1 vez por usuário)
  const handlePreloaderComplete = () => {
    if (typeof window === 'undefined') return;
    try {
      const alreadySeen = hasSeenPromoTooltip(deviceMac);
      if (!alreadySeen && !isExpired) {
        // Marca imediatamente como visto para nunca mais exibir para este usuário
        markPromoTooltipSeen(deviceMac);
        // Pequeno atraso de 200ms após o fade do preloader para transição suave
        setTimeout(() => {
          setShowPromoTooltip(true);
          startTooltipAutoDismiss();
        }, 200);
      }
    } catch {
      // Ignora erro de local storage
    }
  };

  // Carrega o iframe do YouTube somente após o evento window.load da página
  useEffect(() => {
    const enableIframe = () => {
      // Pequeno atraso de 800ms após o carregamento completo para não competir com TTI e TBT
      setTimeout(() => {
        setIsShowcaseIframeLoaded(true);
      }, 800);
    };

    if (document.readyState === 'complete') {
      enableIframe();
    } else {
      window.addEventListener('load', enableIframe, { once: true });
      return () => window.removeEventListener('load', enableIframe);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero-section');
      const ofertaSection = document.getElementById('oferta');

      const pastHero = heroSection
        ? heroSection.getBoundingClientRect().bottom <= 80
        : window.scrollY > 400;

      const isReachedOferta = ofertaSection
        ? ofertaSection.getBoundingClientRect().top <= 120
        : false;

      setIsPastHero(pastHero);
      // Mostra a barra após sair da Hero e oculta ao chegar na seção de Oferta
      setShowStickyTimer(pastHero && !isReachedOferta);

      // Controle de visibilidade do botão 'Garantir Acesso' da barra de navegação:
      // Só deve aparecer em seções que NÃO possuem botão que leva à compra.
      const sections = [
        { id: 'hero-section', hasBuyButton: true },
        { id: 'aprendizado', hasBuyButton: false },
        { id: 'aplicacao', hasBuyButton: true },
        { id: 'instrutor', hasBuyButton: false },
        { id: 'oferta', hasBuyButton: true },
        { id: 'faq', hasBuyButton: false },
        { id: 'encerramento', hasBuyButton: true },
      ];

      const triggerY = Math.min(window.innerHeight * 0.35, 250);
      let activeSectionHasBuyButton = true; // Por padrão na Hero (topo), possui botão de compra

      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i].id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerY && rect.bottom > triggerY) {
          activeSectionHasBuyButton = sections[i].hasBuyButton;
          break;
        }
      }

      setShowNavCheckout(!activeSectionHasBuyButton);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setAuthorPhotos(getRandomAuthorPhotos());

    // Timeout de segurança caso a rede demore muito (evita preloader travado eternamente)
    const safetyTimeout = setTimeout(() => {
      setIsPriceLoaded(true);
    }, 6000);

    // Obter a impressão digital do computador (MAC Address de hardware)
    getDeviceFingerprint()
      .then((mac) => {
        setDeviceMac(mac);

        // Sincronizar com o servidor: prioridade 1 = MAC Address, prioridade 2 = IP
        return fetch(`/api/offer-timer?macAddress=${encodeURIComponent(mac)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && typeof data.remainingSeconds === 'number') {
              setTimeLeft(data.remainingSeconds);
              setIsExpired(Boolean(data.isExpired));
              setPriceData({
                promoPrice: data.promoPrice,
                currentBatchPrice: data.currentBatchPrice || data.finalPrice,
                regularPrice: data.regularPrice,
                finalPrice: data.finalPrice,
                batchName: data.batchName,
                nextPriceDate: data.nextPriceDate,
                isLaunchPhase: Boolean(data.isLaunchPhase)
              });

              // Tooltip apontando para o preço quando o tempo já estiver expirado:
              // Só aparece depois de 1 segundo que a página abriu e some 4 segundos após aparecer
              if (data.isExpired && !data.isLaunchPhase && !hasTriggeredExpiredTooltipRef.current) {
                hasTriggeredExpiredTooltipRef.current = true;
                expiredTooltipDelayRef.current = setTimeout(() => {
                  setShowExpiredTooltip(true);
                  startExpiredTooltipAutoDismiss();
                }, 1000);
              }
            }
          });
      })
      .catch(() => {})
      .finally(() => {
        setIsPriceLoaded(true);
      });

    fetch('/api/empresas')
      .then((res) => res.json())
      .then((data) => {
        if (data.logos && data.logos.length > 0) {
          setLogos(data.logos);
        }
      })
      .catch(() => {});

    try {
      if (sessionStorage.getItem('flmmkr_discount_25') === 'true') {
        setHasDiscount25(true);
      }
    } catch {}

    return () => {
      clearTimeout(safetyTimeout);
      if (expiredTooltipDelayRef.current) clearTimeout(expiredTooltipDelayRef.current);
      if (expiredTooltipTimerRef.current) clearTimeout(expiredTooltipTimerRef.current);
    };
  }, []);

  // Intervalo local do cronômetro de 15 minutos (só roda se não estiver na fase de lançamento)
  useEffect(() => {
    if (priceData.isLaunchPhase) return;

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
  }, [timeLeft, priceData.isLaunchPhase]);

  // Monitoramento do cronômetro para o Modal de Aviso (01:30) e Tooltip de Expiração
  useEffect(() => {
    if (priceData.isLaunchPhase) return;

    const prev = prevTimeLeftRef.current;
    prevTimeLeftRef.current = timeLeft;

    // 1. Faltando 1 minuto e 30 segundos (<= 90 segundos e > 0)
    if (timeLeft <= 90 && timeLeft > 0 && !hasWarnedRef.current && !warningDismissed) {
      hasWarnedRef.current = true;
      setWarningModalOpen(true);
    }

    // 2. Quando o tempo acabar (zerar o cronômetro)
    if (timeLeft <= 0 && prev > 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      setIsExpired(true);
      setWarningModalOpen(false); // Fecha o modal de aviso se ainda estivesse aberto
      if (!hasTriggeredExpiredTooltipRef.current) {
        hasTriggeredExpiredTooltipRef.current = true;
        expiredTooltipDelayRef.current = setTimeout(() => {
          setShowExpiredTooltip(true);
          startExpiredTooltipAutoDismiss();
        }, 1000);
      }
    }
  }, [timeLeft, warningDismissed, priceData.isLaunchPhase]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatInstallment = (price: number) => {
    return formatAsaas12x(price);
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
      title: 'Fundamentos',
      subtitle: 'Configuração do projeto, ciência de cores e estruturação do fluxo de trabalho no DaVinci Resolve',
      lessons: [
        'Introdução ao DaVinci Resolve',
        'Gerenciamento de Cores (com abas dedicadas para CST e ACES)',
        'Como fazer a análise artística do vídeo',
        'Fluxo de Trabalho'
      ]
    },
    {
      num: '02',
      title: 'Correção de Cor',
      subtitle: 'Leitura técnica e artística, equilíbrio da imagem e continuidade entre planos',
      lessons: [
        'Primárias',
        'Shot Matching',
        'Secundárias'
      ]
    },
    {
      num: '03',
      title: 'Creative Grade',
      subtitle: 'Desenvolvimento de identidade visual, estética autoral e emulação de película',
      lessons: [
        'Criando um Look (com abas para Criando look sem plugins, Film Look Creator e Dehancer Pro)'
      ]
    },
    {
      num: '04',
      title: 'Bônus',
      subtitle: 'Aplicações práticas em nichos comerciais de alto valor e teoria cromática avançada',
      lessons: [
        'Color Grading em Frutas',
        'Color Grading em Roupas',
        'Fundamentos da Cor'
      ]
    }
  ];

  // 07. Perguntas Frequentes
  const faqList = [
    {
      q: 'Para quem é o masterclass Color Master® | Produtos?',
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

  const togglePlayProjectVideo = () => {
    if (!projectVideoIframeRef.current?.contentWindow) return;
    const command = isPlayingProjectVideo ? 'pauseVideo' : 'playVideo';
    projectVideoIframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: command, args: [] }),
      '*'
    );
    setIsPlayingProjectVideo(!isPlayingProjectVideo);
  };

  const toggleMuteProjectVideo = () => {
    if (!projectVideoIframeRef.current?.contentWindow) return;
    const command = isMutedProjectVideo ? 'unMute' : 'mute';
    projectVideoIframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: command, args: [] }),
      '*'
    );
    setIsMutedProjectVideo(!isMutedProjectVideo);
  };

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
    if (priceData.promoPrice === 145 || priceData.promoPrice === 150) {
      return 'https://www.asaas.com/000/c/8838cr0upgtyi6bp'; // R$ 150 / R$ 145 (Lote 3)
    }
    return 'https://www.asaas.com/000/c/iv2p2s5tkbt1qi79'; // R$ 195 (Regular)
  };

  // Preço base do lote vigente
  const baseBatchPrice = priceData.isLaunchPhase
    ? 95
    : !isExpired
    ? 95
    : (priceData.currentBatchPrice || priceData.regularPrice);

  // Preço final (com 25% de desconto caso acionado pelo tooltip)
  const displayPrice = hasDiscount25 && isExpired
    ? Math.round(baseBatchPrice * 0.75)
    : baseBatchPrice;

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased selection:bg-[#0071e3]/20 selection:text-[#0071e3]">
      {/* Brand Transition Preloader */}
      <BrandPreloader isReady={isPriceLoaded} onComplete={handlePreloaderComplete} />

      {/* Login Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {/* Custom Checkout Modal (Asaas + Supabase) */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        price={displayPrice}
        regularPrice={priceData.regularPrice}
        isExpired={isExpired}
        macAddress={deviceMac}
        hasDiscount25={hasDiscount25}
      />

      {/* Modais de Alerta (1:30) */}
      <PromoModals
        warningOpen={warningModalOpen}
        onCloseWarning={() => {
          setWarningModalOpen(false);
          setWarningDismissed(true);
        }}
        expiredOpen={false}
        onCloseExpired={() => {}}
        timeLeft={timeLeft}
        promoPrice={priceData.promoPrice}
        regularPrice={priceData.regularPrice}
        checkoutUrl={isExpired ? 'https://www.asaas.com/000/c/iv2p2s5tkbt1qi79' : getAsaasCheckoutUrl()}
        formatTime={formatTime}
        onOpenCheckout={() => setCheckoutModalOpen(true)}
      />

      {/* TOP FIXED COUNTDOWN BANNER (SÓ APARECE APÓS SAIR DA HERO E SE NÃO ESTIVER NA FASE DE LANÇAMENTO NEM EXPIRADO) */}
      {!isExpired && !priceData.isLaunchPhase && (
        <div
          className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-400 [transition-timing-function:cubic-bezier(0.45,0,0.55,1)] ${
            showStickyTimer
              ? 'translate-y-0 opacity-100 pointer-events-auto'
              : '-translate-y-full opacity-0 pointer-events-none'
          } bg-gradient-to-r from-[#0071e3] via-[#0051a8] to-[#0071e3] text-white border-b border-white/20 backdrop-blur-md shadow-md`}
        >
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
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
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1 sm:gap-1.5 bg-black/40 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-white/20">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/70">Tempo:</span>
                <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[#2997ff]">
                  {formatTime(timeLeft)}
                </span>
              </div>

              <a
                href="#oferta"
                className="px-2.5 sm:px-3 py-1 rounded-full bg-white text-[#0071e3] hover:bg-white/90 text-[11px] sm:text-xs font-bold transition-all shadow-xs shrink-0 active:scale-95"
              >
                Aproveitar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Glassmorphism Header Navigation */}
      <header
        className={`sticky z-40 w-full border-b border-white/10 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] transition-all duration-300 ${
          showStickyTimer && !isExpired ? 'top-[39px] sm:top-[42px]' : 'top-0'
        }`}
        style={{ background: 'rgba(14,14,18,0.85)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)' }}
      >
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between">
          <div className="relative flex items-center">
            <a href="/" className="font-semibold text-sm tracking-tight text-white hover:opacity-75 transition-opacity min-h-[44px] flex items-center">
              FLMMKR
            </a>

            {/* Tooltip em balão de fala saindo do logo FLMMKR (+50% de desconto) */}
            {showPromoTooltip && (
              <aside
                role="status"
                aria-live="polite"
                aria-label="Aviso de promoção: mais de 50% de desconto disponível"
                onMouseEnter={handleTooltipMouseEnter}
                onMouseLeave={handleTooltipMouseLeave}
                className={`absolute left-0 top-[calc(100%+8px)] z-50 w-[290px] sm:w-[320px] rounded-2xl bg-[#16161a]/95 backdrop-blur-xl border border-[#0071e3]/40 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.7),0_0_24px_rgba(0,113,227,0.25)] p-3.5 sm:p-4 text-white select-none ${
                  promoTooltipExiting ? 'animate-speech-bubble-exit' : 'animate-speech-bubble-enter'
                }`}
                style={{
                  WebkitBackdropFilter: 'blur(20px)',
                  transformOrigin: 'top left',
                }}
              >
                {/* Rabicho do balão de fala apontando exatamente para o logo FLMMKR */}
                <div
                  className="absolute -top-2 left-5 w-0 h-0 border-x-[7px] border-x-transparent border-b-[8px] border-b-[#0071e3]/50"
                  aria-hidden="true"
                />
                <div
                  className="absolute -top-[7px] left-5 w-0 h-0 border-x-[7px] border-x-transparent border-b-[7px] border-b-[#16161a]"
                  aria-hidden="true"
                />

                {/* Conteúdo simples, fácil e rápido de ler */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2997ff] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2997ff]"></span>
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2997ff]">
                      +50% DE DESCONTO
                    </span>
                  </div>

                  {/* Botão fechar discreto */}
                  <button
                    type="button"
                    onClick={closePromoTooltip}
                    className="p-1 -m-1 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10 cursor-pointer"
                    aria-label="Fechar aviso"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[13px] sm:text-[13.5px] leading-snug font-medium text-white/90 mb-3">
                  Promoção de abertura liberada por{' '}
                  <strong className="text-white font-bold">{formatTime(timeLeft)}</strong>: de{' '}
                  <span className="line-through text-white/50">R$ {priceData.regularPrice}</span> por apenas{' '}
                  <strong className="text-[#2997ff] font-extrabold text-[14px]">R$ {priceData.promoPrice}</strong>.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      closePromoTooltip();
                      setCheckoutModalOpen(true);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                  >
                    Garantir Vaga
                  </button>

                  <button
                    type="button"
                    onClick={closePromoTooltip}
                    className="py-1.5 px-2.5 rounded-full text-white/60 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Dispensar
                  </button>
                </div>
              </aside>
            )}
          </div>

          <span
            className={`hidden sm:inline-block text-xs text-white/80 font-semibold tracking-wide bg-white/10 px-3.5 py-1 rounded-full border border-white/15 transition-all duration-300 ${
              isPastHero
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
            }`}
          >
            COLOR MASTER® | PRODUTOS
          </span>

          <div className="flex items-center">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 hover:border-white/30 transition-all active:scale-95 min-h-[44px] sm:min-h-0 flex items-center justify-center cursor-pointer shrink-0"
            >
              Acessar
            </button>

            <button
              type="button"
              onClick={() => setCheckoutModalOpen(true)}
              className={`rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-[0_2px_12px_rgba(0,113,227,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-95 flex items-center justify-center cursor-pointer whitespace-nowrap overflow-hidden ${
                showNavCheckout
                  ? 'opacity-100 scale-100 ml-2 sm:ml-3 px-3.5 sm:px-4 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 pointer-events-auto max-w-[160px]'
                  : 'opacity-0 scale-90 max-w-0 ml-0 px-0 py-0 border-0 shadow-none pointer-events-none'
              }`}
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
        {/* Background Video Layer with Retícula Overlay (Carregado localmente via servidor) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/assets/videos/dom-dourado-poster.webp"
            className="w-full h-full object-cover pointer-events-none opacity-90 scale-105"
          >
            <source src="/assets/videos/dom-dourado.webm" type="video/webm" />
            {/* AV1 desativado estaticamente para contingência: */}
            {/* <source src="/assets/videos/dom-dourado-av1.mp4" type="video/mp4" /> */}
          </video>
          <div className="absolute inset-0 z-5 pointer-events-none reticula-pattern" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none z-6" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6 sm:mb-10">
            {/* Masterclass Identification Badge */}
            <div className="inline-flex items-center px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[12px] sm:text-xs font-semibold tracking-[0.04em] mb-4 sm:mb-5 border border-white/20 shadow-sm">
              <span className="tracking-wide uppercase font-semibold text-[#2997ff]">MASTERCLASS</span>
              <span className="mx-1.5 sm:mx-2 text-white/30">•</span>
              <span className="tracking-wide uppercase">COLOR MASTER® | PRODUTOS</span>
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
                      R$ {getAsaas12xInstallmentValue(priceData.promoPrice)}
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
                      R$ {getAsaas12xInstallmentValue(195)}
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

            {/* Main CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center w-full sm:w-auto mb-4">
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
              Aulas organizadas rigorosamente pelas etapas do processo de pós-produção e color grading de produto.
            </p>
          </div>

          {/* Pipeline Overview Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-8 sm:mb-10">
            {[
              { step: '01. Fundamentos', desc: 'Gerenciamento & ACES' },
              { step: '02. Correção de Cor', desc: 'Primárias & Matching' },
              { step: '03. Creative Grade', desc: 'Looks & Emulação' },
              { step: '04. Bônus', desc: 'PowerGrades & Assets' },
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
      {/* 03.1 PROJETO PRÁTICO DO MASTERCLASS (ESTILO APPLE TV+ RIGOROSO)            */}
      {/* ========================================================================= */}
      <section id="projeto-pratico" className="relative z-10 py-16 sm:py-24 bg-[#f5f5f7] text-[#1d1d1f] overflow-hidden border-t border-[#d2d2d7]/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 sm:mb-14">
          <span className="text-[12px] uppercase tracking-[0.04em] text-[#0071e3] font-semibold mb-2 block">
            PROJETO DO MASTERCLASS
          </span>
          <h2 className="text-[32px] leading-[1.1] sm:text-5xl md:text-6xl font-semibold tracking-[-0.015em] text-[#1d1d1f]">
            O seu laboratório será um projeto real.
          </h2>
          <p className="text-[17px] sm:text-xl text-[#6e6e73] mt-3 font-normal max-w-2xl mx-auto leading-relaxed">
            O projeto do Masterclass é um comercial produzido para um cliente real e finalizado em uma ilha de color grading profissional.
            <br className="hidden sm:inline" />{' '}
            Você vai receber esse material e acompanhar todo o processo a partir dele, trabalhando com as mesmas imagens, câmeras e situações que fizeram parte do projeto original.
          </p>
        </div>

        {/* CONTAINER EM LARGURA TOTAL COM TRANSBORDAMENTO NAS LATERAIS (APPLE BLEED OUT) */}
        <div className="w-full space-y-3 sm:space-y-4">
          {/* FILEIRA 1 (SUPERIOR): CARDS GRANDES (MESMA ALTURA VERTICAL QUE O VÍDEO CENTRAL) */}
          <div className="flex items-stretch justify-center gap-3 sm:gap-4 overflow-hidden w-full">
            {/* Card Esquerdo Sangrando (Mesma altura vertical do vídeo, transbordando à esquerda) */}
            <div className="flex-1 min-w-[280px] max-w-[620px] overflow-hidden bg-black/5 shrink-0 relative select-none">
              <img
                src={OFFER_IMAGES[0].src}
                alt={OFFER_IMAGES[0].alt}
                loading="lazy"
                decoding="async"
                width={1600}
                height={899}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card Central (Vídeo Player Ativo) */}
            <div className="w-[85vw] max-w-[760px] sm:w-[560px] md:w-[680px] lg:w-[780px] aspect-[16/9] overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.35)] shrink-0 relative group">
              {isShowcaseIframeLoaded ? (
                <iframe
                  ref={projectVideoIframeRef}
                  id="project-showcase-yt-player"
                  src="https://www.youtube-nocookie.com/embed/gp75L5H0kIU?autoplay=1&mute=1&controls=0&loop=1&playlist=gp75L5H0kIU&playsinline=1&rel=0&modestbranding=1&enablejsapi=1"
                  title="Projeto Prático Comercial - Color Master"
                  className="w-full h-full object-cover pointer-events-none"
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <div className="w-full h-full relative overflow-hidden bg-black">
                  <img
                    src="https://img.youtube.com/vi/gp75L5H0kIU/maxresdefault.jpg"
                    alt="Projeto Prático Comercial - Color Master"
                    className="w-full h-full object-cover opacity-80"
                    loading="lazy"
                    decoding="async"
                    width={1280}
                    height={720}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 animate-pulse">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Controles discretos no rodapé do player */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-20 flex items-center gap-2">
                {/* Botão Play / Pause */}
                <button
                  type="button"
                  onClick={togglePlayProjectVideo}
                  aria-label={isPlayingProjectVideo ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                  className="h-9 sm:h-10 px-4 rounded-full bg-white text-black hover:bg-white/90 text-xs sm:text-[13px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg"
                >
                  {isPlayingProjectVideo ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Assistir</span>
                    </>
                  )}
                </button>

                {/* Botão de Áudio */}
                <button
                  type="button"
                  onClick={toggleMuteProjectVideo}
                  aria-label={isMutedProjectVideo ? 'Ativar áudio' : 'Desativar áudio'}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-lg"
                  title={isMutedProjectVideo ? 'Ativar som' : 'Desativar som'}
                >
                  {isMutedProjectVideo ? (
                    <VolumeX className="w-4 h-4 text-white/80" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Card Direito Sangrando (Mesma altura vertical do vídeo, transbordando à direita) */}
            <div className="flex-1 min-w-[280px] max-w-[620px] overflow-hidden bg-black/5 shrink-0 relative select-none">
              <img
                src={OFFER_IMAGES[1].src}
                alt={OFFER_IMAGES[1].alt}
                loading="lazy"
                decoding="async"
                width={1600}
                height={895}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* FILEIRA 2 (INFERIOR): CARDS MENORES NA PROPORÇÃO REAL SEM REPETIÇÃO E COM QUINAS RETAS */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 overflow-hidden w-full">
            {/* Imagem 1 (Índice 2) */}
            <div className="w-[180px] sm:w-[240px] md:w-[280px] lg:w-[320px] aspect-[16/9] overflow-hidden bg-black/5 shrink-0 relative select-none">
              <img
                src={OFFER_IMAGES[2].src}
                alt={OFFER_IMAGES[2].alt}
                loading="lazy"
                decoding="async"
                width={1600}
                height={895}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Imagem 2 (Índice 3) */}
            <div className="w-[180px] sm:w-[240px] md:w-[280px] lg:w-[320px] aspect-[16/9] overflow-hidden bg-black/5 shrink-0 relative select-none">
              <img
                src={OFFER_IMAGES[3].src}
                alt={OFFER_IMAGES[3].alt}
                loading="lazy"
                decoding="async"
                width={1600}
                height={898}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Imagem 3 (Índice 4) */}
            <div className="w-[180px] sm:w-[240px] md:w-[280px] lg:w-[320px] aspect-[16/9] overflow-hidden bg-black/5 shrink-0 relative select-none">
              <img
                src={OFFER_IMAGES[4].src}
                alt={OFFER_IMAGES[4].alt}
                loading="lazy"
                decoding="async"
                width={1600}
                height={896}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Imagem 4 (Color Grading 01) */}
            <div className="w-[180px] sm:w-[240px] md:w-[280px] lg:w-[320px] aspect-[16/9] overflow-hidden bg-black/5 shrink-0 relative select-none">
              <img
                src="/assets/produtos/color-grade-produto/01.jpg"
                alt="Processo de Cor e Grading do Produto"
                loading="lazy"
                decoding="async"
                width={1280}
                height={720}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Imagem 5 (Color Grading 02) */}
            <div className="w-[180px] sm:w-[240px] md:w-[280px] lg:w-[320px] aspect-[16/9] overflow-hidden bg-black/5 shrink-0 relative select-none">
              <img
                src="/assets/produtos/color-grade-produto/02.jpg"
                alt="Resultado Final Comercial"
                loading="lazy"
                decoding="async"
                width={1280}
                height={720}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03.2 PARA QUEM É ESTE MASTERCLASS                                         */}
      {/* ========================================================================= */}
      <section id="para-quem" className="relative z-10 py-14 sm:py-20 md:py-28 bg-[#111113] text-white px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[#2997ff] font-semibold mb-2 block">
              PÚBLICO
            </span>
            <h2 className="text-[28px] leading-[1.14] sm:text-4xl md:text-5xl font-semibold tracking-[-0.015em] text-white">
              Para quem é este Masterclass?
            </h2>
            <p className="text-[16px] sm:text-lg text-white/70 mt-3 font-normal max-w-2xl mx-auto leading-relaxed">
              Desenvolvido estrategicamente para quem precisa elevar a barra técnica e o valor percebido de suas produções visuais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#18181b] border border-white/10 shadow-sm flex flex-col justify-between hover:border-[#2997ff]/40 transition-all overflow-hidden group">
              <div>
                <div className="w-full aspect-[16/10] overflow-hidden bg-black/40 border-b border-white/10 relative">
                  <img
                    src="/assets/produtos/color-grade-produto/editor01.jpg"
                    alt="Editores de vídeo no DaVinci Resolve"
                    loading="lazy"
                    decoding="async"
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="p-6 sm:p-7 pb-0">
                  <h3 className="text-[19px] sm:text-xl font-semibold text-white mb-2 leading-snug">
                    Editores
                  </h3>
                  <p className="text-[14px] sm:text-[15px] text-white/70 leading-relaxed">
                    Profissionais que já trabalham com edição e querem incorporar o color grading ao próprio fluxo de pós-produção. Para quem quer entender como organizar, tratar e finalizar a imagem de um projeto comercial dentro do DaVinci Resolve.
                  </p>
                </div>
              </div>
              <div className="px-6 sm:px-7 pb-6 sm:pb-7 mt-6">
                <div className="pt-4 border-t border-white/10 text-[12px] text-[#2997ff] font-medium">
                  Refinamento &amp; Workflow de Alto Nível
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#18181b] border border-white/10 shadow-sm flex flex-col justify-between hover:border-[#2997ff]/40 transition-all overflow-hidden group">
              <div>
                <div className="w-full aspect-[16/10] overflow-hidden bg-black/40 border-b border-white/10 relative">
                  <img
                    src="/assets/produtos/color-grade-produto/videomaker01.jpg"
                    alt="Filmmakers e Videomakers operando câmeras em LOG"
                    loading="lazy"
                    decoding="async"
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="p-6 sm:p-7 pb-0">
                  <h3 className="text-[19px] sm:text-xl font-semibold text-white mb-2 leading-snug">
                    Filmmakers/Videomakers
                  </h3>
                  <p className="text-[14px] sm:text-[15px] text-white/70 leading-relaxed">
                    Profissionais que querem ter mais controle sobre o resultado final das próprias imagens. Para quem busca entender o processo de color grading e transformar um material bem captado em uma imagem consistente, precisa e esteticamente construída.
                  </p>
                </div>
              </div>
              <div className="px-6 sm:px-7 pb-6 sm:pb-7 mt-6">
                <div className="pt-4 border-t border-white/10 text-[12px] text-[#2997ff] font-medium">
                  Controle Autoral &amp; Valor de Produção
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#18181b] border border-white/10 shadow-sm flex flex-col justify-between hover:border-[#2997ff]/40 transition-all overflow-hidden group">
              <div>
                <div className="w-full aspect-[16/10] overflow-hidden bg-black/40 border-b border-white/10 relative">
                  <img
                    src="/assets/produtos/color-grade-produto/marketing01.jpg"
                    alt="Produtoras, agências e equipes de marketing de produto"
                    loading="lazy"
                    decoding="async"
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="p-6 sm:p-7 pb-0">
                  <h3 className="text-[19px] sm:text-xl font-semibold text-white mb-2 leading-snug">
                    Produtoras, Agências e Pequenas/Médias Empresas
                  </h3>
                  <p className="text-[14px] sm:text-[15px] text-white/70 leading-relaxed">
                    Para quem produz conteúdo para apresentar produtos, próprios ou de clientes, em e-commerce, publicidade, redes sociais e outros canais de venda. O Masterclass ajuda a construir imagens mais precisas, consistentes e cuidadas, capazes de valorizar o produto sem distorcer suas características.
                  </p>
                </div>
              </div>
              <div className="px-6 sm:px-7 pb-6 sm:pb-7 mt-6">
                <div className="pt-4 border-t border-white/10 text-[12px] text-[#2997ff] font-medium">
                  Padrão Broadcast &amp; Escalabilidade
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 04. APLICAÇÃO PROFISSIONAL                                                */}
      {/* ========================================================================= */}
      <section id="aplicacao" className="relative z-10 min-h-[100dvh] flex flex-col justify-center py-12 md:py-16 bg-[#f5f5f7] px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto w-full my-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-[12px] uppercase tracking-[0.04em] text-[#0071e3] font-semibold mb-2 block">
              MERCADO DE TRABALHO REAL
            </span>
            <h2 className="text-[28px] leading-[1.14] sm:text-4xl md:text-5xl font-semibold tracking-[-0.015em] text-[#1d1d1f]">
              Da publicidade ao conteúdo digital, o color grading faz parte da entrega profissional de uma imagem.
            </h2>
            <p className="text-[17px] leading-[1.47] sm:text-base md:text-lg text-[#6e6e73] mt-2.5 sm:mt-3 font-normal max-w-2xl mx-auto">
              Aprenda a trabalhar a cor em diferentes tipos de produção, entendendo o que cada projeto exige da imagem e do processo de finalização.
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
                  Comerciais &amp; Campanhas de TV
                </h3>
                <p className="text-[15px] sm:text-base text-[#6e6e73] leading-[1.5]">
                  Em publicidade, a imagem precisa apresentar o produto com precisão, consistência e intenção estética. Você vai entender como trabalhar cor, contraste, textura e matching entre planos e câmeras para construir uma imagem que funcione para a campanha e para o produto.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-4 border-t border-[#e5e5e7] text-[12px] font-semibold text-[#1d1d1f]">
                Cor, precisão e consistência para publicidade.
              </div>
            </div>

            {/* Card 2: Conteúdo */}
            <div className="p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-[#ffffff] border border-[#e5e5e7] shadow-sm flex flex-col justify-between hover:border-[#0071e3]/30 transition-all">
              <div>
                <span className="inline-block px-3 sm:px-3.5 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[11px] sm:text-xs uppercase tracking-[0.04em] font-semibold mb-3 sm:mb-4 border border-[#0071e3]/20">
                  CONTEÚDO
                </span>
                <h3 className="text-[21px] leading-[1.24] sm:text-2xl font-semibold text-[#1d1d1f] mb-2 sm:mb-3">
                  Filmes Digitais &amp; Social Media
                </h3>
                <p className="text-[15px] sm:text-base text-[#6e6e73] leading-[1.5]">
                  Vídeos para YouTube, redes sociais e campanhas digitais também precisam de uma imagem bem construída. O processo de color grading ajuda a manter consistência entre diferentes cenas e produções, além de valorizar produtos, pessoas e ambientes mesmo em trabalhos com prazos e volumes maiores.
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
                NADA DE SIMULAÇÃO
              </span>
              <h3 className="text-[19px] sm:text-2xl font-semibold text-[#1d1d1f] mb-2 leading-[1.3] tracking-[-0.01em]">
                Você vai aprender usando um projeto que realmente foi produzido para um cliente.
              </h3>
              <p className="text-[15px] sm:text-base text-[#6e6e73] leading-[1.5]">
                O projeto usado no Masterclass saiu de uma produção real e passou por todas as etapas de uma ilha de color grading profissional. O material tem diferentes câmeras, problemas de exposição e cor, decisões de look e outras situações que fazem parte do trabalho cotidiano de um colorista.
                <br className="hidden sm:inline" />{' '}
                É esse projeto que você vai receber para trabalhar durante o Masterclass. O aprendizado acontece sobre imagens reais, dentro de um contexto real de produção.
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
      <section id="instrutor" className="relative z-10 min-h-[100dvh] flex flex-col justify-center py-12 md:py-16 bg-[#000000] px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ReticulaBackground
          bgImageSrc={authorPhotos.bgSrc}
          crossfadeScroll={false}
        />

        <div className="max-w-5xl mx-auto relative z-10 w-full my-auto">
          <div className="rounded-2xl sm:rounded-3xl bg-[#ffffff]/90 backdrop-blur-md border border-[#e5e5e7] p-6 sm:p-10 md:p-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
              {/* Teacher Photo */}
              <div className="md:col-span-4 flex justify-center items-center">
                <div className="relative w-full max-w-[200px] sm:max-w-[260px] md:max-w-[280px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#d2d2d7] bg-[#f5f5f7] shadow-md group">
                  <img
                    src={authorPhotos.profileSrc}
                    alt={SITE_CONFIG.author.name}
                    loading="lazy"
                    decoding="async"
                    width={720}
                    height={1080}
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
                        loading="lazy"
                        decoding="async"
                        width={170}
                        height={72}
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
                        loading="lazy"
                        decoding="async"
                        width={170}
                        height={72}
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
      <section id="oferta" className="relative z-10 scroll-mt-14 sm:scroll-mt-20 min-h-[100dvh] w-full flex flex-col justify-center py-8 sm:py-12 md:py-16 bg-[#f5f5f7] px-4 sm:px-6 lg:px-8 overflow-hidden">
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
          <div className="absolute inset-0 z-1 pointer-events-none reticula-pattern" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 w-full my-auto">
          <div className="p-6 sm:p-10 md:p-12 lg:p-14 rounded-2xl sm:rounded-3xl bg-[#ffffff]/95 backdrop-blur-xl border border-[#0071e3]/30 shadow-2xl relative overflow-hidden">
            {/* Offer Header Tag */}
            <span className="px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[12px] sm:text-xs font-semibold uppercase tracking-[0.04em] mb-4 sm:mb-6 inline-block border border-[#0071e3]/20">
              OFERTA ESPECIAL DE ACESSO
            </span>

            <h2 className="text-[28px] leading-[1.14] sm:text-4xl md:text-5xl font-semibold tracking-[-0.015em] text-[#1d1d1f] mb-2 sm:mb-3">
              Color Master® | Produtos
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
                • Aulas práticas gravadas em alta resolução
              </div>
              <div className="py-1 border-b border-[#e5e5e7]/50">
                • Footages em LOG como material de apoio
              </div>
              <div className="py-1 font-semibold text-[#1d1d1f]">
                • 1 Ano de Acesso Completo e Ilimitado à Plataforma
              </div>
            </div>

            {/* Dynamic Price Box with 15-min countdown condition and Expired Tooltip */}
            <div id="price-box" className="relative mb-6 sm:mb-8">
              {/* Tooltip 'A promoção acabou' Apontando Diretamente para o Preço */}
              {showExpiredTooltip && (
                <aside
                  role="status"
                  aria-live="polite"
                  aria-label="Aviso de promoção de lançamento encerrada com oferta de 25% de desconto"
                  onMouseEnter={handleExpiredTooltipMouseEnter}
                  onMouseLeave={handleExpiredTooltipMouseLeave}
                  className={`absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-[360px] sm:max-w-[410px] rounded-2xl bg-[#16161a]/95 backdrop-blur-2xl border border-amber-500/40 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_0_24px_rgba(245,158,11,0.2)] p-4 text-white text-left select-none ${
                    expiredTooltipExiting ? 'animate-price-tooltip-exit' : 'animate-price-tooltip-enter'
                  }`}
                  style={{
                    WebkitBackdropFilter: 'blur(24px)',
                  }}
                >
                  {/* Rabicho do balão apontando para o box do preço abaixo */}
                  <div
                    className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[8px] border-x-transparent border-t-[10px] border-t-amber-500/50"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[7px] border-x-transparent border-t-[8px] border-t-[#16161a]"
                    aria-hidden="true"
                  />

                  {/* Header do Tooltip com Tag e Botão Fechar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold uppercase tracking-wider">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>A promoção de R$ 95 acabou</span>
                    </div>
                    <button
                      type="button"
                      onClick={closeExpiredTooltip}
                      className="p-1 -m-1 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10 cursor-pointer"
                      aria-label="Fechar aviso"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Texto lamentando pelo fato de ter perdido */}
                  <p className="text-[13px] leading-snug text-white/90 font-normal mb-2.5">
                    Que pena! A condição especial de lançamento encerrou e o período de 15 minutos expirou.
                  </p>

                  {/* Chamada para ganhar 25% de desconto */}
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 mb-2.5 flex items-center justify-between gap-2">
                    <span className="text-[12px] text-white/80">
                      Quer resgatar <strong className="text-emerald-400 font-bold">25% de desconto</strong> no valor vigente?
                    </span>
                    <span className="text-xs font-bold text-emerald-400 shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      25% OFF
                    </span>
                  </div>

                  {/* Link / Botão no próprio tooltip para garantir o desconto */}
                  <button
                    type="button"
                    onClick={handleApply25Discount}
                    className="w-full py-2 px-3 rounded-full bg-amber-400 hover:bg-amber-300 text-[#121214] font-bold text-[12.5px] shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Garantir 25% de desconto agora →</span>
                  </button>
                </aside>
              )}

              {/* Conteúdo do Price Box */}
              {priceData.isLaunchPhase ? (
                <>
                  <div className="inline-block px-3.5 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[12px] font-semibold uppercase tracking-[0.04em] mb-2 border border-[#0071e3]/20">
                    Lote Especial de Lançamento • Válido até 09/10
                  </div>
                  <span className="text-[13px] sm:text-sm text-[#86868b] block line-through">
                    De R$ 195 por apenas:
                  </span>
                  <div className="text-[39px] leading-tight sm:text-5xl md:text-6xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">
                    R$ 95 <span className="text-base sm:text-xl font-normal text-[#6e6e73]">no Pix</span>
                  </div>
                  <div className="text-[15px] sm:text-lg font-bold text-[#0071e3] mt-1.5 sm:mt-2">
                    ou em {formatInstallment(95)} no cartão
                  </div>
                  <span className="text-[12px] sm:text-sm font-medium text-[#86868b] mt-1.5 block">
                    {priceData.batchName} (Garantido até 09/10/2026 às 23:59)
                  </span>
                </>
              ) : !isExpired ? (
                <>
                  <div className="inline-block px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[12px] font-semibold uppercase tracking-[0.04em] mb-2 border border-[#0071e3]/20">
                    Tempo Restante: {formatTime(timeLeft)}
                  </div>
                  <span className="text-[13px] sm:text-sm text-[#86868b] block line-through">
                    De R$ {priceData.currentBatchPrice || 195} por apenas:
                  </span>
                  <div className="text-[39px] leading-tight sm:text-5xl md:text-6xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">
                    R$ 95 <span className="text-base sm:text-xl font-normal text-[#6e6e73]">no Pix</span>
                  </div>
                  <div className="text-[15px] sm:text-lg font-bold text-[#0071e3] mt-1.5 sm:mt-2">
                    ou em {formatInstallment(95)} no cartão
                  </div>
                  <span className="text-[12px] sm:text-sm font-medium text-[#86868b] mt-1.5 block">
                    Condição Especial de 15 Minutos (Promoção de Lançamento)
                  </span>
                </>
              ) : (
                <>
                  {hasDiscount25 ? (
                    <>
                      <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[12px] font-semibold uppercase tracking-[0.04em] mb-2 border border-emerald-500/30">
                        Desconto Especial de 25% OFF Ativado
                      </div>
                      <span className="text-[13px] sm:text-sm text-[#86868b] block line-through">
                        De R$ {baseBatchPrice} por apenas:
                      </span>
                      <div className="text-[39px] leading-tight sm:text-5xl md:text-6xl font-extrabold text-[#1d1d1f] tracking-tight">
                        R$ {displayPrice} <span className="text-base sm:text-xl font-normal text-[#6e6e73]">no Pix</span>
                      </div>
                      <div className="text-[15px] sm:text-lg font-bold text-emerald-600 mt-1.5 sm:mt-2">
                        ou em {formatInstallment(displayPrice)} no cartão
                      </div>
                      <span className="text-[12px] sm:text-sm font-medium text-emerald-600 mt-1.5 block">
                        25% de Desconto Garantido no Checkout
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-[12px] font-semibold uppercase tracking-[0.04em] mb-2 border border-red-500/30">
                        Tempo de 15 Minutos Expirado
                      </div>
                      <span className="text-[12px] text-[#86868b] uppercase font-semibold tracking-[0.04em] block mb-1">
                        Preço Vigente Oficial
                      </span>
                      <div className="text-[39px] leading-tight sm:text-5xl md:text-6xl font-extrabold text-[#1d1d1f] tracking-tight">
                        R$ {displayPrice} <span className="text-base sm:text-xl font-normal text-[#6e6e73]">no Pix</span>
                      </div>
                      <div className="text-[15px] sm:text-lg font-bold text-[#0071e3] mt-1.5 sm:mt-2">
                        ou em {formatInstallment(displayPrice)} no cartão
                      </div>
                      <span className="text-[12px] sm:text-sm font-medium text-[#86868b] mt-1.5 block">
                        {priceData.batchName} {priceData.nextPriceDate ? `(Válido até ${priceData.nextPriceDate})` : ''}
                      </span>
                    </>
                  )}
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
      <section id="encerramento" className="relative z-10 py-16 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#000000] text-white">
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
              ENTRAR NO COLOR MASTER® | PRODUTOS
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
              <span className="text-[130%] inline-block font-black">R$ {displayPrice}</span>
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
              Color Master® | Produtos • Treinamento Oficial Michael Oliveira
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
