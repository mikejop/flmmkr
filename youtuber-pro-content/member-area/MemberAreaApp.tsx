import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, FolderOpen, FileText, ChevronRight, ChevronDown, ChevronLeft,
  Play, Clock, ArrowRight, Zap, CheckCircle2, Circle, Lock, 
  PanelLeftClose, PanelLeft, X, Search, Menu, Target, Wrench, 
  Image as ImageIcon, Shield, Star, GraduationCap, RefreshCw, Layers, Check, Copy, AlertTriangle, PlayCircle, BookOpen, Volume2,
  Compass, Mic, Camera, Sun, SunMedium, Lamp, Contrast, Users, Wand2, Video, Scissors, Palette, Activity, Plus, Upload, User, LogIn, LogOut, Mail, Phone, Eye, EyeOff, Trash2
} from 'lucide-react';
import { modulesData } from './data';
import { UserProgress, CourseModule, ModuleId, Subtopic } from './types';
import { PRICING_CONFIG } from './lib/pricing';
import { LandingPage } from './components/landing/LandingPage';
import { getCheckoutUrl } from './lib/offerManager';
import { formatTelefone } from './lib/utils';
import { EquipamentosLessonArticle } from './components/EquipamentosLessonArticle';
import { TextHighlighterTool } from './components/TextHighlighterTool';
import { fetchReadingState, saveReadingState } from './lib/readingStateService';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import { AdminApp } from '@/youtuber-pro-studio/src/AdminApp';

// Helper to render Apple-style module icons
const getModuleIcon = (modId: ModuleId, isCurrent: boolean) => {
  const colorClass = isCurrent ? 'text-[#0071e3]' : 'text-[#86868b]';
  const size = 20;
  switch (modId) {
    case 'mod0': // O Que Importa (Equipamentos/Câmeras)
      return <Camera size={size} className={colorClass} />;
    case 'mod1': // 1 Ponto de Luz
      return <Sun size={size} className={colorClass} />;
    case 'mod2': // 2 Pontos de Luz
      return <SunMedium size={size} className={colorClass} />;
    case 'mod3': // 3 Pontos de Luz
      return <SunMedium size={size} className={colorClass} />;
    case 'mod4': // Luz de Ambiente
      return <Lamp size={size} className={colorClass} />;
    case 'mod5': // Luz Colorida RGB
      return <Palette size={size} className={colorClass} />;
    case 'mod6': // Luz Dramática
      return <Contrast size={size} className={colorClass} />;
    case 'mod7': // Setup Entrevista
      return <Users size={size} className={colorClass} />;
    case 'mod8': // Estilo Autoral
      return <Wand2 size={size} className={colorClass} />;
    default:
      return <Folder size={size} className={colorClass} />;
  }
};

const getModuleName = (title: string | undefined): string => {
  if (!title) return '';
  const cleaned = title
    .replace(/^MÓDULO\s+\d+:\s*/i, '')
    .replace(/^INTRODUÇÃO:\s*/i, '')
    .trim();
  if (cleaned.startsWith('Deliver')) {
    return 'Deliver';
  }
  return cleaned;
};

// Importing the interactive modules
import AceleracaoManager from './components/AceleracaoManager';
import AvEditorTeleprompter from './components/AvEditorTeleprompter';
import CenarioPlanner from './components/CenarioPlanner';
import Iluminacao3Pontos from './components/Iluminacao3Pontos';
import ExposureCalculator from './components/ExposureCalculator';
import PudovkinSequencer from './components/PudovkinSequencer';
import AudioMixer from './components/AudioMixer';
import ColorwheelsGrading from './components/ColorwheelsGrading';
import CtrSimulator from './components/CtrSimulator';
import DeliverExporter from './components/DeliverExporter';
import IdeationFlowchart from './components/IdeationFlowchart';
import InteractiveIdeationTheory from './components/InteractiveIdeationTheory';
import LiquidGlass from './components/LiquidGlass';
import DefinirSenha from './components/DefinirSenha';
import EsqueciSenha from './components/EsqueciSenha';
import CriarContaCheckout from './components/CriarContaCheckout';
import Preloader from './components/Preloader';
import SeoGeoManager from './components/SeoGeoManager';
import SupabaseLoginModal from './components/SupabaseLoginModal';
import StripeCheckoutModal from './components/StripeCheckoutModal';
import WelcomeScreen from './components/WelcomeScreen';
import RequireSubscription from './components/RequireSubscription';
import NotFound from './components/NotFound';
import { supabase } from './lib/supabase';
import { sanitizeText, rateLimiter } from './lib/security';
import { getMediaUrl } from './lib/storage';

const STORAGE_KEY = 'youtuber_pro_academy_progress';
const LOGIN_KEY = 'youtuber_pro_academy_logged';
const PROFILE_KEY = 'youtuber_pro_academy_profile';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  avatar: string;
  isSocialLogin?: boolean;
  providerName?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Dan',
  lastName: 'Rocha',
  email: 'dojoacademybr@gmail.com',
  phone: '(11) 98765-4321',
  password: '••••••••',
  confirmPassword: '••••••••',
  avatar: getMediaUrl('banners/hero_01.webp')
};

const DEFAULT_PROGRESS: UserProgress = {
  completedModules: [],
  completedLessons: [],
  checklistStates: {},
  challengeDrafts: {},
  notes: {},
  scriptEditorAudio: '',
  scriptEditorVideo: '',
  activeTab: {}
};

const BG_VIDEOS = [
  getMediaUrl('bg/02.webm')
];

const BG_IMAGES = [
  getMediaUrl('bg/02.webp')
];

const HERO_IMAGES = [
  getMediaUrl('banners/hero_01.webp'),
  getMediaUrl('banners/hero_02.webp'),
  getMediaUrl('banners/hero_03.webp'),
  getMediaUrl('banners/hero_04.webp')
];

function shuffleIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

// FAQS
const FAQ_ITEMS = [
  { q: "Preciso de câmera cara para começar?", a: "Absolutamente não! No Módulo 04, mostramos como extrair imagem de cinema usando celulares intermediários através de exposição e iluminação estratégica de 3 pontos." },
  { q: "As ferramentas recomendadas são gratuitas?", a: "Sim, todos os assets do Kit de Aceleração são 100% gratuitos, livres de direitos autorais e prontos para uso comercial no YouTube." },
  { q: "Como funciona a garantia de 7 dias?", a: "Se você achar que o guia não serve para seu canal, envie um e-mail em até 7 dias e devolveremos seu valor integralmente, sem questionamentos." },
  { q: "Terei acesso vitalício?", a: "Sim, adquirindo o YouTuber Pro hoje você garante acesso a todas as atualizações futuras e novas ferramentas de simulação." }
];

// DEPOIMENTOS
const TESTIMONIALS = [
  { name: "Thiago Rocha", title: "CRIADOR COM 120K INSCRITOS", text: "O simulador de 3 pontos mudou meu set de gravação. Meus vídeos parecem gravados em estúdio de TV agora!", rating: 5 },
  { name: "Mariana Alencar", title: "VIDEOMAKER INDEPENDENTE", text: "As fórmulas de áudio e a regra de Pudovkin me salvaram de dezenas de horas de edição travada. Recomendadíssimo!", rating: 5 },
  { name: "Pedro Mendes", title: "CRIADOR DE CONTEÚDO TECH", text: "O Teleprompter integrado e o sequenciador de ganchos narratives me ajudaram a dobrar minha retenção média no YouTube.", rating: 5 }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>('mod0');
  const [activeLessonId, setActiveLessonId] = useState<string>(''); // empty means Dashboard
  const [activeTab, setActiveTab] = useState<'teoria' | 'pratica' | 'desafio' | 'checklist'>('teoria');
  
  const [bgPlaylist, setBgPlaylist] = useState<number[]>(() => shuffleIndices(BG_VIDEOS.length));
  const [playlistIndex, setPlaylistIndex] = useState<number>(0);
  const currentBgIndex = bgPlaylist[playlistIndex] ?? 0;

  // Random hero banner image on page load / F5 refresh
  const [randomHeroIndex] = useState<number>(() => {
    return Math.floor(Math.random() * (HERO_IMAGES.length || 1));
  });
  const [heroScrollY, setHeroScrollY] = useState<number>(0);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    return localStorage.getItem(LOGIN_KEY) === 'true';
  });
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isExclusiveModalOpen, setIsExclusiveModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const lessonContainerRef = useRef<HTMLDivElement>(null);
  const savedScrollTopRef = useRef<number>(0);
  const scrollDebounceTimerRef = useRef<any>(null);
  const [isSupabaseLoginOpen, setIsSupabaseLoginOpen] = useState<boolean>(false);
  const [loginNoticeMessage, setLoginNoticeMessage] = useState<string>('');
  const [isPaidUser, setIsPaidUser] = useState<boolean>(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [checkoutModalInfo, setCheckoutModalInfo] = useState<{ title?: string; description?: string }>({});
  const [copiedChallengeId, setCopiedChallengeId] = useState<string | null>(null);
  const [scrollProgressPercent, setScrollProgressPercent] = useState<number>(0);

  // Route state for /definir-senha, /esqueci-senha, /criar-conta e 404
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    const hash = window.location.hash.toLowerCase();
    const port = window.location.port;

    if (port === '9812' || path.includes('/admin') || path.includes('/studio')) {
      return 'admin';
    }
    if (path.includes('/definir-senha') || hash.includes('type=recovery') || hash.includes('type=invite')) {
      return 'definir-senha';
    }
    if (path.includes('/esqueci-senha')) {
      return 'esqueci-senha';
    }
    if (path.includes('/criar-conta')) {
      return 'criar-conta';
    }
    if (path.includes('/404') || (path !== '' && path !== '/' && !path.includes('/auth/callback') && !path.includes('/api/'))) {
      return '404';
    }
    return 'main';
  });
  
  // Timer for Urgency Section
  const [countdown, setCountdown] = useState<string>("15:00");
  const [expandedFAQ, setExpandedFAQ] = useState<Record<number, boolean>>({});
  const [expandedEmenta, setExpandedEmenta] = useState<Record<string, boolean>>({});
  const [activeFlyoutModule, setActiveFlyoutModule] = useState<string | null>(null);

  // Automatically expand active module and collapse all other modules in sidebar
  useEffect(() => {
    if (activeModuleId) {
      setExpandedEmenta({ [activeModuleId]: true });
    }
  }, [activeModuleId]);
  const [hoveredTrafficLight, setHoveredTrafficLight] = useState<boolean>(false);
  const [activePreviewVideo, setActivePreviewVideo] = useState<boolean>(false);
  const [hoveredModuleIndex, setHoveredModuleIndex] = useState<number | null>(null);
  const [hoveredLessonIndex, setHoveredLessonIndex] = useState<number | null>(null);

  // Liquid Glass Procedural Distortion Parameters
  const [glassDistortionScale, setGlassDistortionScale] = useState<number>(25);
  const [glassBaseFrequency, setGlassBaseFrequency] = useState<number>(0.012);

  // User Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    }
    return DEFAULT_PROFILE;
  });

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [saveToastVisible, setSaveToastVisible] = useState<boolean>(false);

  const saveToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // Auto-save user profile (com sanitização XSS)
  const updateUserProfile = (fields: Partial<UserProfile>) => {
    const sanitizedFields: Partial<UserProfile> = {};
    if (fields.firstName) sanitizedFields.firstName = sanitizeText(fields.firstName);
    if (fields.lastName) sanitizedFields.lastName = sanitizeText(fields.lastName);
    if (fields.email) sanitizedFields.email = sanitizeText(fields.email);

    setUserProfile(prev => {
      const updated = { ...prev, ...fields, ...sanitizedFields };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      return updated;
    });

    setSaveToastVisible(true);
    if (saveToastTimeoutRef.current) clearTimeout(saveToastTimeoutRef.current);
    saveToastTimeoutRef.current = setTimeout(() => {
      setSaveToastVisible(false);
    }, 2000);
  };

  // Close profile dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateUserProfile({ avatar: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress({
          ...DEFAULT_PROGRESS,
          ...parsed
        });
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }

    const savedLogged = localStorage.getItem(LOGIN_KEY);
    if (savedLogged === 'true') {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setIsSidebarExpanded(false);
    }

    // Helper para verificar status de pagamento conectado ao Asaas e Supabase
    const checkSubscriptionStatus = async (userId: string, email: string, userMetadata?: any) => {
      try {
        const cleanEmail = email.toLowerCase().trim();

        // Extrai o nome e a foto do perfil de redes sociais (Google / LinkedIn)
        const fullName = userMetadata?.full_name || userMetadata?.name || '';
        const avatarUrl = userMetadata?.avatar_url || userMetadata?.picture || userMetadata?.avatar || '';
        if (fullName || avatarUrl) {
          const names = fullName ? fullName.trim().split(' ') : [];
          setUserProfile((prev) => ({
            ...prev,
            firstName: names[0] || prev.firstName,
            lastName: names.slice(1).join(' ') || prev.lastName,
            email: cleanEmail,
            avatar: avatarUrl || prev.avatar,
          }));
        }

        // REGRA OBRIGATÓRIA DE EXCEÇÃO ADMIN: dojoacademybr@gmail.com e dojoacademy@gmail.com possuem status de Pago VIP permanente
        if (cleanEmail === 'dojoacademybr@gmail.com' || cleanEmail === 'dojoacademy@gmail.com') {
          console.log('👑 Acesso Admin VIP ativado sem necessidade de validação no Asaas:', cleanEmail);
          setIsPaidUser(true);
          setIsSidebarExpanded(true);
          return;
        }

        // PASSO 1: Busca o status de pagamento no Supabase (Atualizado via API/Webhook do Asaas)
        const { data: subData } = await supabase
          .from('subscribers')
          .select('status, access_status')
          .or(`id.eq.${userId},email.eq.${cleanEmail}`)
          .maybeSingle();

        const { data: pedidoData } = await supabase
          .from('pedidos')
          .select('status')
          .eq('cliente_email', cleanEmail)
          .eq('status', 'pago_pix')
          .maybeSingle();

        if (subData?.status === 'active' || subData?.status === 'paid' || subData?.access_status === 'ACTIVE' || pedidoData?.status === 'pago_pix') {
          console.log('✅ Status de Pago ativado via Asaas/Supabase:', cleanEmail);
          setIsPaidUser(true);
          setIsSidebarExpanded(true);

          const hasSeenWelcome = sessionStorage.getItem('ytp_welcome_seen');
          if (!hasSeenWelcome) {
            setShowWelcomeScreen(true);
            sessionStorage.setItem('ytp_welcome_seen', 'true');
          }
          return;
        }

        // Usuário logado sem status de pago: Permanece logado, acessa Módulo 0 gratuito, sem redirecionamento forçado para pagamento
        console.log('ℹ️ Usuário autenticado (Conta Gratuita / Não Pago). Módulo 0 liberado.');
        setIsPaidUser(false);
        setIsSidebarExpanded(true);
      } catch (e) {
        console.warn('⚠️ Erro ao verificar status de pagamento:', e);
        setIsPaidUser(false);
      }
    };

    const extractProviderInfo = (sessionUser: any) => {
      const rawProvider = sessionUser?.app_metadata?.provider || sessionUser?.identities?.[0]?.provider || (sessionUser?.app_metadata?.providers?.[0]);
      const isSocial = Boolean(rawProvider && rawProvider !== 'email');
      const providerName = rawProvider === 'google' ? 'Google' : (rawProvider ? (rawProvider.charAt(0).toUpperCase() + rawProvider.slice(1)) : 'Google');
      return { isSocial, providerName };
    };

    // Check Supabase Auth active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setIsSidebarExpanded(true); // O side menu de quem está logado é MAXIMIZADO
        localStorage.setItem(LOGIN_KEY, 'true');
        const { isSocial, providerName } = extractProviderInfo(session.user);
        if (session.user.email) {
          setUserProfile(prev => ({ 
            ...prev, 
            email: session.user.email || prev.email,
            isSocialLogin: isSocial,
            providerName: providerName,
          }));
          checkSubscriptionStatus(session.user.id, session.user.email, session.user.user_metadata);
        }
      } else {
        setIsPaidUser(false);
        setIsSidebarExpanded(false); // Visitantes/não logados ficam com o menu colapsado
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setIsSidebarExpanded(true); // O side menu de quem está logado é MAXIMIZADO
        localStorage.setItem(LOGIN_KEY, 'true');
        const { isSocial, providerName } = extractProviderInfo(session.user);
        if (session.user.email) {
          setUserProfile(prev => ({ 
            ...prev, 
            email: session.user.email || prev.email,
            isSocialLogin: isSocial,
            providerName: providerName,
          }));
          checkSubscriptionStatus(session.user.id, session.user.email, session.user.user_metadata);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setIsPaidUser(false);
        setIsSidebarExpanded(false); // Visitantes/não logados ficam com o menu colapsado
        localStorage.setItem(LOGIN_KEY, 'false');
      }
    });

    // Protection Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Background rotador (WebM video rotation + 100ms crossfade)
  useEffect(() => {
    if (BG_VIDEOS.length <= 1) return;

    const interval = setInterval(() => {
      setPlaylistIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < bgPlaylist.length) {
          return nextIndex;
        } else {
          let newPlaylist = shuffleIndices(BG_VIDEOS.length);
          if (BG_VIDEOS.length > 1 && newPlaylist[0] === bgPlaylist[prevIndex]) {
            const swapIdx = 1;
            [newPlaylist[0], newPlaylist[swapIdx]] = [newPlaylist[swapIdx], newPlaylist[0]];
          }
          setBgPlaylist(newPlaylist);
          return 0;
        }
      });
    }, 120000);

    return () => clearInterval(interval);
  }, [bgPlaylist.length]);

  // Dynamically update header progress bar on scroll (0% to 100%)
  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      const landing = document.getElementById('landing-container');
      const lesson = document.getElementById('lesson-view-container');
      const container = landing || lesson;

      if (container) {
        const scrollTop = container.scrollTop;
        const docHeight = container.scrollHeight - container.clientHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        setScrollProgressPercent(Math.min(100, Math.max(0, pct)));
      } else {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        setScrollProgressPercent(Math.min(100, Math.max(0, pct)));
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    const landingContainer = document.getElementById('landing-container');
    const lessonContainer = document.getElementById('lesson-view-container');

    landingContainer?.addEventListener('scroll', onScroll, { passive: true });
    lessonContainer?.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    updateScrollProgress();

    return () => {
      landingContainer?.removeEventListener('scroll', onScroll);
      lessonContainer?.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, [activeLessonId, isPaidUser, isLoggedIn]);

  // Restore last reading location (module, lesson, tab, scroll position) on mount / login
  useEffect(() => {
    fetchReadingState().then(state => {
      if (state && state.lastLessonId) {
        setActiveModuleId(state.lastModuleId);
        setActiveLessonId(state.lastLessonId);
        if (state.lastTab) setActiveTab(state.lastTab);
        savedScrollTopRef.current = state.scrollTop || 0;
      }
    });
  }, [isLoggedIn]);

  // Scroll to saved position when lesson container renders
  useEffect(() => {
    if (!activeLessonId) return;

    const timer = setTimeout(() => {
      const container = document.getElementById('lesson-view-container') || lessonContainerRef.current;
      if (container && savedScrollTopRef.current > 0) {
        container.scrollTop = savedScrollTopRef.current;
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [activeLessonId]);

  // Continuously save reading location & scroll position
  useEffect(() => {
    if (!activeLessonId) return;

    const container = document.getElementById('lesson-view-container') || lessonContainerRef.current;
    
    const handleSaveLocation = () => {
      const currentScrollTop = container ? container.scrollTop : window.scrollY;
      
      if (scrollDebounceTimerRef.current) {
        clearTimeout(scrollDebounceTimerRef.current);
      }

      scrollDebounceTimerRef.current = setTimeout(() => {
        saveReadingState({
          lastModuleId: activeModuleId,
          lastLessonId: activeLessonId,
          lastTab: activeTab,
          scrollTop: currentScrollTop
        });
      }, 400);
    };

    container?.addEventListener('scroll', handleSaveLocation, { passive: true });
    window.addEventListener('scroll', handleSaveLocation, { passive: true });

    handleSaveLocation();

    return () => {
      container?.removeEventListener('scroll', handleSaveLocation);
      window.removeEventListener('scroll', handleSaveLocation);
      if (scrollDebounceTimerRef.current) {
        clearTimeout(scrollDebounceTimerRef.current);
      }
    };
  }, [activeModuleId, activeLessonId, activeTab]);

  // Countdown Timer Simulation
  useEffect(() => {
    let seconds = 899; // 14m 59s
    const timer = setInterval(() => {
      if (seconds <= 0) {
        seconds = 899; // reset loop
      } else {
        seconds--;
      }
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      setCountdown(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save progress helper
  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem(LOGIN_KEY, 'true');
    setIsExclusiveModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Note on signOut:', e);
    }
    setIsLoggedIn(false);
    localStorage.setItem(LOGIN_KEY, 'false');
    setActiveLessonId('');
    setIsSidebarExpanded(false);
  };

  const handleToggleMaximize = () => {
    setIsMaximized(prev => !prev);
  };

  // Toggle lesson complete
  const handleToggleLessonComplete = (lessonId: string) => {
    if (!isLoggedIn) {
      setIsExclusiveModalOpen(true);
      return;
    }

    const completed = [...progress.completedLessons];
    const isCompleted = completed.includes(lessonId);
    
    let nextCompleted;
    if (isCompleted) {
      nextCompleted = completed.filter(id => id !== lessonId);
    } else {
      nextCompleted = [...completed, lessonId];
    }

    const finalCompletedModules = [...progress.completedModules];
    modulesData.forEach(m => {
      const allLessonsCompleted = m.subtopics.every(s => nextCompleted.includes(s.id));
      const hasCompletedRecord = finalCompletedModules.includes(m.id);
      
      if (allLessonsCompleted && !hasCompletedRecord) {
        finalCompletedModules.push(m.id);
      } else if (!allLessonsCompleted && hasCompletedRecord) {
        const index = finalCompletedModules.indexOf(m.id);
        if (index > -1) finalCompletedModules.splice(index, 1);
      }
    });
    
    saveProgress({ 
      ...progress, 
      completedLessons: nextCompleted,
      completedModules: finalCompletedModules
    });
  };

  const handleCompleteAndNext = (lessonId: string) => {
    if (!isLoggedIn) {
      setIsExclusiveModalOpen(true);
      return;
    }
    if (!progress.completedLessons.includes(lessonId)) {
      handleToggleLessonComplete(lessonId);
    }
    handleNextLesson();
    setTimeout(() => {
      const container = document.getElementById('lesson-view-container');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // Toggle checklist item progress
  const handleToggleChecklist = (itemId: string) => {
    if (!isLoggedIn) {
      setIsExclusiveModalOpen(true);
      return;
    }
    const nextStates = { ...progress.checklistStates, [itemId]: !progress.checklistStates[itemId] };
    saveProgress({ ...progress, checklistStates: nextStates });
  };

  // Form field challenge draft changes
  const handleChallengeFieldChange = (challengeId: string, key: string, value: string) => {
    if (!isLoggedIn) {
      setIsExclusiveModalOpen(true);
      return;
    }
    const drafts = { ...progress.challengeDrafts };
    if (!drafts[challengeId]) {
      drafts[challengeId] = {};
    }
    drafts[challengeId][key] = value;
    saveProgress({ ...progress, challengeDrafts: drafts });
  };

  // Notes change
  const handleNotesChange = (modId: string, text: string) => {
    if (!isLoggedIn) {
      setIsExclusiveModalOpen(true);
      return;
    }
    const nextNotes = { ...progress.notes, [modId]: text };
    saveProgress({ ...progress, notes: nextNotes });
  };

  const handleCopyChallenge = (challengeId: string, fields: any[]) => {
    let copyText = `📋 PLANO DE ESTUDO & EXERCÍCIO\n`;
    copyText += `==============================================\n\n`;
    
    const draft = progress.challengeDrafts[challengeId] || {};
    fields.forEach(field => {
      const fieldKey = field.fieldId || field.key;
      const val = draft[fieldKey] || '';
      copyText += `👉 ${field.label}:\n   ${val || 'Não preenchido.'}\n\n`;
    });

    navigator.clipboard.writeText(copyText);
    setCopiedChallengeId(challengeId);
    setTimeout(() => setCopiedChallengeId(null), 2000);
  };

  const handleNextLesson = () => {
    if (!activeLessonId) return;
    const currentModule = modulesData.find(m => m.id === activeModuleId);
    if (!currentModule) return;

    const currentIdx = currentModule.subtopics.findIndex(s => s.id === activeLessonId);
    if (currentIdx < currentModule.subtopics.length - 1) {
      const nextLesson = currentModule.subtopics[currentIdx + 1];
      setActiveLessonId(nextLesson.id);
      setActiveTab('teoria');
    } else {
      const moduleIdx = modulesData.findIndex(m => m.id === activeModuleId);
      if (moduleIdx < modulesData.length - 1) {
        const nextMod = modulesData[moduleIdx + 1];
        setActiveModuleId(nextMod.id);
        setActiveLessonId(nextMod.subtopics[0].id);
        setActiveTab('teoria');
      } else {
        // finished course or go to dashboard
        setActiveLessonId('');
      }
    }
  };

  const handlePrevLesson = () => {
    if (!activeLessonId) return;
    const currentModule = modulesData.find(m => m.id === activeModuleId);
    if (!currentModule) return;

    const currentIdx = currentModule.subtopics.findIndex(s => s.id === activeLessonId);
    if (currentIdx > 0) {
      const prevLesson = currentModule.subtopics[currentIdx - 1];
      setActiveLessonId(prevLesson.id);
      setActiveTab('teoria');
    } else {
      const moduleIdx = modulesData.findIndex(m => m.id === activeModuleId);
      if (moduleIdx > 0) {
        const prevMod = modulesData[moduleIdx - 1];
        setActiveModuleId(prevMod.id);
        setActiveLessonId(prevMod.subtopics[prevMod.subtopics.length - 1].id);
        setActiveTab('teoria');
      }
    }
  };

  // Find the module that actually owns the activeLessonId, or fallback to activeModuleId
  const activeModule = activeLessonId 
    ? (modulesData.find(m => m.subtopics.some(s => s.id === activeLessonId)) || modulesData.find(m => m.id === activeModuleId) || modulesData[0])
    : (modulesData.find(m => m.id === activeModuleId) || modulesData[0]);

  const activeLesson = activeModule?.subtopics.find(s => s.id === activeLessonId);

  // Total lessons count
  const totalLessons = modulesData.reduce((acc, m) => acc + m.subtopics.length, 0);
  const completedCount = progress.completedLessons.length;
  const percentComplete = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Search results calculation
  const searchResults = searchQuery.trim() 
    ? modulesData.flatMap(m => 
        m.subtopics
          .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.concept.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(s => ({ module: m, lesson: s }))
      )
    : [];

  const handleSelectSearchResult = (modId: ModuleId, lessonId: string) => {
    const targetMod = modulesData.find(m => m.id === modId);
    const targetSub = targetMod?.subtopics.find(s => s.id === lessonId);
    const isLockedLesson = (!targetSub?.isFree && !targetMod?.isFree) && !isPaidUser;

    if (isLockedLesson) {
      setCheckoutModalInfo({
        title: 'Desbloquear todo o conteúdo',
        description: 'Esta aula é exclusiva para assinantes. Ative sua inscrição do YouTuber Pro para liberar!'
      });
      setIsCheckoutModalOpen(true);
      return;
    }
    if (!isLoggedIn) {
      setLoginNoticeMessage("Para acessar esta aula gratuita, faça login na sua conta ou crie um cadastro grátis.");
      setIsSupabaseLoginOpen(true);
      return;
    }

    setActiveModuleId(modId);
    setActiveLessonId(lessonId);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Route-based early rendering for /definir-senha, /esqueci-senha e /admin (Porta 9812 ou /admin)
  if (currentRoute === 'admin') {
    return <AdminApp />;
  }

  if (currentRoute === 'definir-senha') {
    return <DefinirSenha onSuccessRedirect={() => { setCurrentRoute('main'); window.location.href = '/'; }} />;
  }

  if (currentRoute === 'esqueci-senha') {
    return <EsqueciSenha onBackToLogin={() => setCurrentRoute('main')} />;
  }

  // Se a tela de boas-vindas estiver ativa (após o pagamento), exibe a apresentação com o nome
  if (showWelcomeScreen) {
    return (
      <WelcomeScreen
        userName={userProfile.firstName || 'Criador'}
        userEmail={userProfile.email}
        userAvatar={userProfile.avatar}
        onContinue={() => {
          setShowWelcomeScreen(false);
          setCurrentRoute('main');
        }}
      />
    );
  }

  if (currentRoute === 'criar-conta') {
    return (
      <CriarContaCheckout
        onBackToMain={() => setCurrentRoute('main')}
        onSuccessWelcome={() => setShowWelcomeScreen(true)}
        onOpenLoginModal={() => setIsSupabaseLoginOpen(true)}
      />
    );
  }

  if (currentRoute === '404') {
    return (
      <NotFound
        onGoHome={() => {
          setCurrentRoute('main');
          window.history.pushState({}, '', '/');
        }}
        onExploreFreeModule={() => {
          setCurrentRoute('main');
          setActiveModuleId('mod0');
          setActiveLessonId('mod0-1');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // Flyout on hover for collapsed sidebar
  const handleModuleMouseEnter = (modId: string) => {
    if (isSidebarExpanded) return;
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
    setActiveFlyoutModule(modId);
  };

  const handleModuleMouseLeave = () => {
    if (isSidebarExpanded) return;
    flyoutTimeoutRef.current = setTimeout(() => {
      setActiveFlyoutModule(null);
    }, 150);
  };

  // Render the interactive tools inside 'Na Prática' block
  const renderInteractiveTool = (moduleId: ModuleId) => {
    const getTool = () => {
      switch (moduleId) {
        case 'mod0': return <AceleracaoManager />;
        case 'mod1': return <Iluminacao3Pontos />;
        case 'mod2': return <ExposureCalculator />;
        case 'mod3': return <CenarioPlanner />;
        case 'mod4': return <PudovkinSequencer />;
        case 'mod5': return <ColorwheelsGrading />;
        case 'mod6': return <AudioMixer />;
        case 'mod7': return <DeliverExporter />;
        case 'mod8': return <CtrSimulator />;
        default: return null;
      }
    };

    return (
      <RequireSubscription onOpenLoginModal={() => setIsSupabaseLoginOpen(true)}>
        {getTool()}
      </RequireSubscription>
    );
  };

  return (
    <div className="h-screen w-screen bg-[#000000] text-[#f5f5f7] flex items-center justify-center font-sans overflow-hidden selection:bg-[#0071e3]/30 selection:text-white relative" id="app-viewport-root">
      
      {/* High-End Page Preloader */}
      <Preloader />

      {/* SEO, GEO/AEO & Anti-Cloaking Paywall JSON-LD Manager */}
      <SeoGeoManager activeModuleId={activeModuleId} activeLessonId={activeLessonId} />

      {/* Background Geral (Vídeos WebM em Loop com Crossfade de 100ms) */}
      <div className="hidden md:block absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentBgIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.1,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 w-full h-full"
          >
            {BG_VIDEOS[currentBgIndex]?.toLowerCase().endsWith('.webm') ? (
              <video
                src={BG_VIDEOS[currentBgIndex]}
                autoPlay
                muted
                playsInline
                onEnded={(e) => {
                  e.currentTarget.pause();
                }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${BG_VIDEOS[currentBgIndex]})` }}
              />
            )}
          </motion.div>
        </AnimatePresence>
        {/* Subtle Dark Contrast Overlay */}
        <div className="absolute inset-0 bg-black/25 backdrop-blur-xs" />
      </div>

      {/* Procedural SVG Glass Distortion Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <defs>
          <filter id="liquid-glass-distortion" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={glassBaseFrequency}
              numOctaves={2}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={glassDistortionScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* ALWAYS RENDER THE FINDER WINDOW */}
      <motion.div 
        layout
        transition={{
          layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }, // Ultra-smooth easy-out transition
          default: { ease: "easeOut" }
        }}
        style={{
          backdropFilter: `blur(20px)`,
          WebkitBackdropFilter: `blur(20px)`
        }}
        className={`w-full h-full ${isMaximized ? 'md:w-full md:h-full rounded-none border-none' : `${isLoggedIn ? 'md:w-[85vw]' : 'md:w-[70vw]'} md:h-[95vh] rounded-[24px] border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]`} bg-[#121214]/80 flex flex-col md:flex-row overflow-hidden relative z-10`} 
        id="finder-window"
      >
          
          {/* SIDEBAR */}
          <aside className={`${isSidebarExpanded ? 'w-56' : 'w-16'} bg-transparent border-r border-white/10 flex flex-col shrink-0 overflow-y-auto select-none transition-all duration-300 relative`} id="window-sidebar">
            
            {/* Liquid Glass Organic Floating Blobs (Neutral frosted effect) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-15">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-[45px] animate-pulse" />
              <div className="absolute bottom-1/4 -right-12 w-24 h-24 bg-white/10 rounded-full blur-[40px] animate-pulse" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-32 bg-white/15 rounded-full blur-[35px]" />
            </div>
            
            {/* Sidebar Header: Traffic Lights & Collapse Button */}
            <div className={`h-14 border-b border-white/15 bg-transparent flex items-center ${isSidebarExpanded ? 'px-3 justify-between' : 'px-0 justify-center'} select-none shrink-0 relative z-10 gap-1`} id="sidebar-header">
              
              {/* Traffic Lights */}
              {isSidebarExpanded && (
                <div 
                  className="flex items-center gap-1.5 shrink-0"
                  onMouseEnter={() => setHoveredTrafficLight(true)}
                  onMouseLeave={() => setHoveredTrafficLight(false)}
                >
                  <button 
                    onClick={handleToggleMaximize}
                    className={`w-3 h-3 rounded-full ${isMaximized ? 'bg-[#27c93f]' : 'bg-[#8e8e93]'} hover:brightness-110 active:brightness-90 flex items-center justify-center cursor-pointer border border-black/15 shrink-0 transition-colors`}
                    title={isMaximized ? "Restaurar Janela" : "Maximizar na Janela"}
                  >
                    {hoveredTrafficLight && <span className="text-[7px] text-neutral-950 font-black leading-none">＋</span>}
                  </button>
                </div>
              )}

              {/* Collapse Trigger Button */}
              {isSidebarExpanded ? (
                <button 
                  onClick={() => setIsSidebarExpanded(false)}
                  className="text-[#86868b] hover:text-white transition-colors p-1 rounded-md hover:bg-white/5 cursor-pointer shrink-0"
                  title="Recolher Barra"
                >
                  <PanelLeftClose size={15} />
                </button>
              ) : (
                <button 
                  onClick={() => setIsSidebarExpanded(true)}
                  className="text-[#86868b] hover:text-white transition-colors p-2 rounded-md hover:bg-white/10 cursor-pointer shrink-0 flex items-center justify-center"
                  title="Expandir Barra"
                >
                  <PanelLeft size={16} />
                </button>
              )}
            </div>

            {/* Sidebar Content Tree */}
            <div className="flex-1 py-4 px-2 space-y-4 custom-scrollbar overflow-y-auto relative z-10 bg-transparent border-t border-white/15">
              <div className="space-y-4 w-full">
                
                {/* Dashboard Return Button */}
                <button 
                  onClick={() => {
                    const currentIsFree = modulesData.find(m => m.id === activeModuleId)?.isFree;
                    if (!currentIsFree && !isPaidUser) {
                      setCheckoutModalInfo({
                        title: 'Visão Geral Reservada para Alunos',
                        description: 'A visão geral e ferramentas dos módulos avançados são exclusivas para inscritos no YouTuber Pro. Desbloqueie sua vaga com o Stripe para acessar!'
                      });
                      setIsCheckoutModalOpen(true);
                      return;
                    }
                    setActiveLessonId('');
                  }}
                  className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between px-3' : 'justify-center px-0'} py-2.5 rounded-[12px] text-left text-xs font-semibold cursor-pointer transition-colors ${
                    !activeLessonId 
                      ? 'bg-white/15 text-white border border-white/20' 
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                  title={!isSidebarExpanded ? "Visão Geral" : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={16} className={!activeLessonId ? 'text-[#00c7fc]' : 'text-neutral-400'} />
                    {isSidebarExpanded && <span>Visão Geral</span>}
                  </div>
                  {isSidebarExpanded && !modulesData.find(m => m.id === activeModuleId)?.isFree && !isPaidUser && (
                    <Lock size={12} className="text-neutral-400 shrink-0" />
                  )}
                </button>

                <div className="space-y-1" onMouseLeave={() => setHoveredModuleIndex(null)}>
                  {isSidebarExpanded && (
                    <span className="text-[9px] font-bold text-[#86868b] tracking-widest uppercase block px-3 mb-2">MÓDULOS</span>
                  )}
                  
                  {modulesData.map((mod, mIdx) => {
                    const isCurrent = activeLessonId 
                      ? mod.subtopics.some(s => s.id === activeLessonId)
                      : false;
                    const completedLessons = mod.subtopics.filter(s => progress.completedLessons.includes(s.id)).length;
                    const isAllCompleted = completedLessons === mod.subtopics.length;
                    const isLockedModule = !mod.isFree && !isPaidUser;

                    // Cálculo de Proximidade para Degradê do Cadeado & Efeito macOS Dock Magnification Centralizado
                    let lockOpacity = 0;
                    let dockScale = 1;

                    if (hoveredModuleIndex !== null) {
                      const dist = Math.abs(mIdx - hoveredModuleIndex);
                      if (dist === 0) {
                        lockOpacity = 1;      // Módulo focado: Cadeado 100% visível
                        dockScale = 1.035;    // Magnificação macOS Dock centralizada
                      } else if (dist === 1) {
                        lockOpacity = 0.5;    // Vizinhos 1: Cadeado 50% visível (degradê)
                        dockScale = 1.018;    // Escala vizinha suave
                      } else if (dist === 2) {
                        lockOpacity = 0.2;    // Vizinhos 2: Cadeado 20% visível (degradê)
                        dockScale = 1.008;
                      }
                    }

                    return (
                      <div 
                        key={mod.id} 
                        className="space-y-0.5 w-full overflow-hidden"
                        style={{
                          transform: `scale(${dockScale})`,
                          transformOrigin: 'center center',
                          transition: 'transform 220ms cubic-bezier(0.25, 1, 0.5, 1), opacity 300ms ease-out',
                        }}
                        onMouseEnter={() => {
                          setHoveredModuleIndex(mIdx);
                          handleModuleMouseEnter(mod.id);
                        }}
                        onMouseLeave={handleModuleMouseLeave}
                      >
                        
                        {/* Module Button */}
                        <button
                          onClick={() => {
                            if (isLockedModule) {
                              setCheckoutModalInfo({
                                title: 'Desbloquear todo o conteúdo',
                                description: 'Este módulo técnico é exclusivo para assinantes. Ative sua inscrição do YouTuber Pro para liberar!'
                              });
                              setIsCheckoutModalOpen(true);
                              return;
                            }
                            if (!isLoggedIn) {
                              setLoginNoticeMessage("Para acessar os conteúdos gratuitos deste módulo, faça login na sua conta ou crie um cadastro grátis.");
                              setIsSupabaseLoginOpen(true);
                              return;
                            }
                            setActiveModuleId(mod.id);
                            if (!isSidebarExpanded) {
                              setIsSidebarExpanded(true);
                            }
                            setExpandedEmenta({ [mod.id]: true });
                          }}
                          className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between px-3' : 'justify-center px-0'} py-2.5 rounded-[12px] text-[13px] transition-all text-left cursor-pointer ${
                            isCurrent 
                              ? 'bg-white/15 text-white border border-white/20 shadow-sm' 
                              : 'text-neutral-300 hover:text-white hover:bg-white/5'
                          }`}
                          title={!isSidebarExpanded ? getModuleName(mod.title) : undefined}
                        >
                          <div className={`flex items-center ${isSidebarExpanded ? 'gap-2.5 truncate' : 'justify-center w-full'}`}>
                            {getModuleIcon(mod.id, isCurrent)}
                            {isSidebarExpanded && (
                              <span className="truncate font-semibold text-xs">{getModuleName(mod.title)}</span>
                            )}
                          </div>

                          {isSidebarExpanded && (
                            <div className="shrink-0 flex items-center gap-1">
                              {isLockedModule ? (
                                <Lock 
                                  size={12} 
                                  className="text-neutral-300 shrink-0 transition-opacity duration-300 ease-out" 
                                  style={{ opacity: lockOpacity }}
                                />
                              ) : (
                                <>
                                  {isAllCompleted && <CheckCircle2 size={11} className="text-[#30d158] shrink-0 mr-1" />}
                                  {expandedEmenta[mod.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                </>
                              )}
                            </div>
                          )}
                        </button>

                        {/* Lesson Nest under Expanded Module */}
                        <AnimatePresence initial={false}>
                          {isSidebarExpanded && expandedEmenta[mod.id] && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: "easeInOut" }}
                              className="pl-2 ml-3 border-l border-white/5 space-y-0.5 py-1 overflow-hidden"
                              onMouseLeave={() => setHoveredLessonIndex(null)}
                            >
                              {mod.subtopics.map((sub, sIdx) => {
                                const isCurrentLesson = activeLessonId === sub.id;
                                const isCompleted = progress.completedLessons.includes(sub.id);
                                const isLockedLesson = !sub.isFree && !mod.isFree && !isPaidUser;

                                let lessonLockOpacity = 0;
                                let lessonDockScale = 1;

                                if (hoveredLessonIndex !== null) {
                                  const lDist = Math.abs(sIdx - hoveredLessonIndex);
                                  if (lDist === 0) {
                                    lessonLockOpacity = 1;
                                    lessonDockScale = 1.025;
                                  } else if (lDist === 1) {
                                    lessonLockOpacity = 0.5;
                                    lessonDockScale = 1.01;
                                  } else if (lDist === 2) {
                                    lessonLockOpacity = 0.2;
                                  }
                                }

                                return (
                                  <button
                                    key={sub.id}
                                    onMouseEnter={() => setHoveredLessonIndex(sIdx)}
                                    onClick={() => {
                                      if (isLockedLesson) {
                                        setCheckoutModalInfo({
                                          title: 'Desbloquear todo o conteúdo',
                                          description: 'Esta aula prática e seus simuladores são exclusivos para assinantes. Ative sua inscrição do YouTuber Pro para liberar!'
                                        });
                                        setIsCheckoutModalOpen(true);
                                        return;
                                      }
                                      if (!isLoggedIn) {
                                        setLoginNoticeMessage("Para acessar esta aula gratuita, faça login na sua conta ou crie um cadastro grátis.");
                                        setIsSupabaseLoginOpen(true);
                                        return;
                                      }
                                      setActiveModuleId(mod.id);
                                      setActiveLessonId(sub.id);
                                      setActiveTab('teoria');
                                    }}
                                    style={{
                                      transform: `scale(${lessonDockScale})`,
                                      transformOrigin: 'center center',
                                      transition: 'transform 220ms cubic-bezier(0.25, 1, 0.5, 1), opacity 300ms ease-out',
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[10px] text-[11px] transition-all text-left cursor-pointer ${
                                      isCurrentLesson
                                        ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/10'
                                        : 'text-[#a1a1a6] hover:text-[#f5f5f7] hover:bg-white/5'
                                    }`}
                                  >
                                     <span className="whitespace-normal break-words leading-tight pr-1">{sub.title.replace(/^\d+\.\s*/, '')}</span>
                                    {isLockedLesson ? (
                                      <Lock 
                                        size={10} 
                                        className="text-[#a1a1a6] shrink-0 ml-1 transition-opacity duration-300 ease-out" 
                                        style={{ opacity: lessonLockOpacity }}
                                      />
                                    ) : (
                                      isCompleted && (
                                        <CheckCircle2 size={10} className={isCurrentLesson ? 'text-white' : 'text-[#30d158]'} />
                                      )
                                    )}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Collapsed Sidebar Hover Flyout Panel */}
            {!isSidebarExpanded && activeFlyoutModule && (
              <div 
                className="absolute left-[84px] z-50 w-64"
                style={{ top: '80px' }}
                onMouseEnter={() => {
                  if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
                }}
                onMouseLeave={handleModuleMouseLeave}
              >
                <LiquidGlass cornerRadius={16} padding="8px" className="w-full">
                  <div className="w-full">
                    <div className="px-2.5 py-1.5 border-b border-white/5 mb-1.5">
                      <span className="text-[10px] font-bold text-[#00c7fc] uppercase font-mono tracking-wider">
                        {activeFlyoutModule === 'mod0' ? 'Gratuito' : 'Exclusivo'}
                      </span>
                      <p className="text-xs font-bold text-white truncate">
                        {getModuleName(modulesData.find(m => m.id === activeFlyoutModule)?.title)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      {modulesData.find(m => m.id === activeFlyoutModule)?.subtopics.map((sub, idx) => {
                        const isCompleted = progress.completedLessons.includes(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              const targetMod = modulesData.find(m => m.id === activeFlyoutModule);
                              const isLockedLesson = !sub.isFree && !targetMod?.isFree && !isPaidUser;
                              if (isLockedLesson) {
                                setCheckoutModalInfo({
                                  title: 'Desbloquear todo o conteúdo',
                                  description: 'Esta aula é exclusiva para assinantes. Ative sua inscrição do YouTuber Pro para liberar!'
                                });
                                setIsCheckoutModalOpen(true);
                                return;
                              }
                              if (!isLoggedIn) {
                                setLoginNoticeMessage("Para acessar esta aula gratuita, faça login na sua conta ou crie um cadastro grátis.");
                                setIsSupabaseLoginOpen(true);
                                return;
                              }
                              setActiveModuleId(activeFlyoutModule as ModuleId);
                              setActiveLessonId(sub.id);
                              setActiveFlyoutModule(null);
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] text-[#a1a1a6] hover:text-white hover:bg-white/5 text-left cursor-pointer"
                          >
                            <span className="whitespace-normal break-words leading-tight pr-1">{sub.title.replace(/^\d+\.\s*/, '')}</span>
                            {isCompleted && <CheckCircle2 size={10} className="text-[#30d158]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </LiquidGlass>
              </div>
            )}

          </aside>

          {/* MAIN SPACE (TOOLBAR + CONTENT) */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Seção 3.2 · Toolbar */}
            <header className={`h-14 bg-transparent border-b border-white/15 ${isMaximized ? '' : 'md:rounded-tr-[24px]'} flex items-center px-6 justify-between select-none relative z-20 shrink-0`}>
              
              {/* Left Toolbar Info */}
              <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle Button */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden text-white hover:text-neutral-300 p-1 rounded-md"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <button 
                      onClick={handlePrevLesson}
                      disabled={!activeLessonId}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#f5f5f7] disabled:opacity-20 cursor-pointer"
                      title="Aula Anterior"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      onClick={handleNextLesson}
                      disabled={!activeLessonId}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#f5f5f7] disabled:opacity-20 cursor-pointer"
                      title="Próxima Aula"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="border-l border-white/10 pl-3 hidden sm:block">
                    <span className="block text-sm font-bold tracking-tight text-white leading-none">Dojo Academy</span>
                  </div>
                </div>
              </div>

              {/* Center Progress Meter */}
              {isLoggedIn && (
                <div className="hidden lg:flex items-center gap-3 bg-neutral-900/30 px-4 py-1.5 rounded-full border border-white/5">
                  <span className="text-[10px] font-bold tracking-wider text-[#86868b] uppercase leading-none">Progresso Geral</span>
                  <div className="w-40 h-1.5 rounded-full bg-white/10 border border-white/5 shadow-inner overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#0071e3] to-[#00c7fc] shadow-[0_0_8px_rgba(0,199,252,0.4)] transition-all duration-500"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-[#00c7fc] font-mono leading-none">{percentComplete}%</span>
                </div>
              )}

              {/* Right Search & Profile */}
              <div className="flex items-center gap-3">
                
                {/* Search Bar Trigger */}
                <div 
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden md:flex items-center bg-[#1d1d1f] border border-white/5 rounded-full px-3 py-1.5 w-32 cursor-pointer hover:bg-[#2c2c2e]/80 transition-colors relative"
                >
                  <Search size={12} className="text-[#86868b] mr-1.5" />
                  <span className="text-[11px] text-[#86868b] select-none">Buscar...</span>
                </div>

                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="md:hidden text-white p-1 rounded-full hover:bg-white/5"
                >
                  <Search size={16} />
                </button>

                {/* Profile Avatar & Menu Dropdown (Visível somente quando logado) */}
                {isLoggedIn ? (
                  <div className="relative flex items-center gap-2" ref={profileMenuRef}>
                    <button
                      onClick={() => setIsProfileMenuOpen(prev => !prev)}
                      className="flex items-center gap-1.5 p-0.5 pr-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer group"
                      title="Menu da Conta"
                    >
                      <img 
                        src={userProfile.avatar} 
                        alt="Perfil" 
                        loading="lazy"
                        decoding="async"
                        className="w-8 h-8 rounded-full border border-white/20 group-hover:border-[#0071e3] transition-colors object-cover shrink-0"
                      />
                      <ChevronDown size={12} className={`text-neutral-400 group-hover:text-white transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute right-0 top-11 w-64 z-50 overflow-hidden"
                        >
                          <LiquidGlass 
                            displacementScale={24}
                            aberrationIntensity={1.5}
                            blurAmount={0.15}
                            cornerRadius={16} 
                            padding="8px" 
                            className="w-full"
                          >
                            {/* Profile Summary */}
                            <div className="px-3 py-2.5 border-b border-white/10 flex items-center gap-3">
                              <img 
                                src={userProfile.avatar} 
                                alt="Perfil" 
                                loading="lazy"
                                decoding="async"
                                className="w-9 h-9 rounded-full border border-white/20 object-cover shrink-0"
                              />
                              <div className="overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">{userProfile.firstName} {userProfile.lastName}</p>
                                <p className="text-[11px] text-neutral-400 truncate">{userProfile.email}</p>
                              </div>
                            </div>

                            <div className="py-1 space-y-0.5">
                              {/* Minha Conta option */}
                              <button
                                onClick={() => {
                                  setIsProfileMenuOpen(false);
                                  setIsAccountModalOpen(true);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-[#0071e3] transition-colors cursor-pointer text-left font-medium"
                              >
                                <User size={15} />
                               <span>Minha Conta</span>
                              </button>

                              {/* Sair option */}
                              <button
                                onClick={() => {
                                  setIsProfileMenuOpen(false);
                                  handleLogout();
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-200 hover:bg-red-500/20 transition-colors cursor-pointer text-left font-medium"
                              >
                                <LogOut size={15} />
                                <span>Sair</span>
                              </button>
                            </div>
                          </LiquidGlass>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSupabaseLoginOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <LogIn size={13} />
                    <span>Entrar</span>
                  </button>
                )}
              </div>

              {/* Dynamic Scroll Progress Line on bottom edge of header */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.05] pointer-events-none">
                <div 
                  className="h-full bg-gradient-to-r from-[#0071e3] via-[#00c7fc] to-[#30d158] transition-[width] duration-150 ease-out" 
                  style={{ width: `${scrollProgressPercent}%` }}
                />
              </div>
            </header>

            {/* CONTENT SPACE ROUTER */}
            {!isLoggedIn || (!isPaidUser && !activeLessonId) ? (
              /* LANDING PAGE (DESLOGADO OU SEM PLANO ATIVO) */
              <div 
                className="flex-1 overflow-y-auto bg-black text-[#f5f5f7] select-text custom-scrollbar dark" 
                id="landing-container"
              >
                <LandingPage 
                  onOpenCheckout={() => {
                    const url = getCheckoutUrl();
                    window.open(url, '_blank');
                  }} 
                />
              </div>
            ) : !activeLessonId ? (
              <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-6 md:p-10 space-y-8 select-text">
                
                {/* Welcoming Header */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        <span className="block bg-clip-text text-transparent bg-gradient-to-b from-[#1d1d1f] via-[#2c2c2e] to-[#636366]">Seja bem-vindo ao</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0071e3] via-[#00c7fc] to-[#30d158] font-extrabold block">YouTuber Pro</span>
                      </h1>
                    </div>

                    <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
                      Seu acesso completo à engrenagem de produção está liberado. Utilize os simuladores integrados a cada aula técnica para obter parâmetros perfeitos para seus vídeos.
                    </p>

                    <div className="pt-2 flex items-center">
                      <button 
                        onClick={() => {
                          // Go to first lesson
                          setActiveModuleId('mod0');
                          setActiveLessonId('mod0-1');
                          setActiveTab('teoria');
                        }}
                        className="px-8 py-3 bg-[#0071e3] text-white rounded-full font-semibold text-xs hover:scale-105 active:scale-95 shadow-md shadow-blue-500/10 transition-all cursor-pointer"
                      >
                        Começar ou Continuar Estudos
                      </button>
                    </div>
                  </motion.div>

                </div>
            ) : (
              
              /* LESSON VIEW (ACTIVE LESSON) */
              <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24 relative select-text custom-scrollbar flex flex-col" id="lesson-view-container" ref={lessonContainerRef}>
                <TextHighlighterTool lessonId={activeLessonId} containerRef={lessonContainerRef} />
                
                <motion.div 
                  id="lesson-zoom-content"
                  key={activeLessonId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full lg:w-[80%] max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8"
                >
                  
                  {/* Lesson Header */}
                  <div className="space-y-4">
                    {progress.completedLessons.includes(activeLessonId) && (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 px-3 py-1 text-xs font-bold uppercase tracking-wider animate-fade-in">
                          <CheckCircle2 size={13} /> Concluída
                        </span>
                      </div>
                    )}

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-[#1d1d1f] via-[#2c2c2e] to-[#636366]">
                      {activeLesson.title}
                    </h1>
                  </div>

                  {/* Section Label: Teoria */}
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase block">TEORIA E FUNDAMENTOS</span>
                    {activeLessonId === 'mod0-1' ? (
                      <EquipamentosLessonArticle />
                    ) : activeLessonId === 'mod1-1' ? (
                      <InteractiveIdeationTheory />
                    ) : (
                      <div className="bg-white rounded-[24px] border border-neutral-200/80 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0071e3]/5 to-transparent rounded-full blur-xl pointer-events-none" />
                        <p className="text-neutral-800 text-[15px] leading-relaxed whitespace-pre-line font-normal">{activeLesson.concept}</p>
                        <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-neutral-400 group-hover:text-neutral-700 transition-colors">
                          <Plus size={14} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botão de Conclusão e Avanço Centralizado no final da aula */}
                  <div className="flex justify-center pt-8 pb-4">
                    <button
                      onClick={() => handleCompleteAndNext(activeLessonId)}
                      className="bg-[#0071e3] hover:bg-[#147ce5] text-white rounded-full px-8 py-3.5 font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
                    >
                      Marcar como concluída
                    </button>
                  </div>

                </motion.div>

              </div>
            )}

          </main>

      </motion.div>

      {/* OVERLAY MODAL: BUSCA (SEARCH MODAL) */}
      {isSearchOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-[#1c1c1e]/95 border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl max-h-[70vh] flex flex-col overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-2.5 p-4 border-b border-white/10 shrink-0">
              <Search size={18} className="text-[#86868b]" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-[#86868b]"
                placeholder="Busque por tópicos, conceitos, equipamentos..."
                autoFocus
              />
              <button 
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-[#0071e3] hover:text-[#147ce5] cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {searchQuery.trim() === '' ? (
                <div className="p-8 text-center text-xs text-[#86868b] space-y-1">
                  <p className="font-bold">Dicas de Busca</p>
                  <p>Procure por 'roteiro', 'contraste', 'iluminação', 'exposição', etc.</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#86868b]">
                  Nenhum resultado encontrado para "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-0.5">
                  {searchResults.map(({ module, lesson }) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectSearchResult(module.id, lesson.id)}
                      className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer flex justify-between items-center"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-[#00c7fc] uppercase tracking-wider">
                          {getModuleName(module.title)}
                        </span>
                        <h4 className="text-sm font-semibold text-[#f5f5f7] group-hover:text-white truncate">
                          {lesson.title}
                        </h4>
                        <p className="text-xs text-[#86868b] line-clamp-1">
                          {lesson.concept}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-neutral-600 group-hover:text-white transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* OVERLAY MODAL: LOGIN PROMPT / CONTEÚDO EXCLUSIVO */}
      {isExclusiveModalOpen && (
        <SupabaseLoginModal
          isOpen={isExclusiveModalOpen}
          onClose={() => setIsExclusiveModalOpen(false)}
          onSuccessLogin={() => {
            setIsExclusiveModalOpen(false);
            setIsLoggedIn(true);
          }}
          noticeMessage="Você precisa fazer login na sua conta para poder acessar e usufruir de todos os conteúdos do YouTuber Pro."
        />
      )}

      {/* MODAL MINHA CONTA */}
      <AnimatePresence>
        {isAccountModalOpen && (
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsAccountModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-lg bg-[#1c1c1e] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white space-y-6 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white tracking-tight">Minha Conta</h2>
                  <p className="text-xs text-neutral-400">
                    Gerencie seus dados pessoais. Todas as alterações são salvas automaticamente.
                  </p>
                </div>
                
                <button
                  onClick={() => setIsAccountModalOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Auto-save notification pill */}
              <AnimatePresence>
                {saveToastVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 bg-[#30d158]/15 border border-[#30d158]/30 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#30d158]"
                  >
                    <Check size={14} />
                    <span>Alterações salvas automaticamente!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content Form */}
              <div className="space-y-4">
                
                {/* 1. Mudar Imagem de Perfil */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">Foto de Perfil</label>
                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                    <img 
                      src={userProfile.avatar} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#0071e3] shadow-md shrink-0"
                    />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="cursor-pointer bg-[#0071e3] hover:bg-[#147ce5] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
                          <Upload size={13} />
                          <span>Mudar Imagem</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAvatarFileChange} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-tight">
                        Selecione qualquer arquivo de imagem (.webp, .png, .jpg) do seu computador.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Nome e Sobrenome */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300 block">Nome</label>
                    <input 
                      type="text"
                      value={userProfile.firstName}
                      onChange={(e) => updateUserProfile({ firstName: e.target.value })}
                      placeholder="Seu nome"
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-[#0071e3] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300 block">Sobrenome</label>
                    <input 
                      type="text"
                      value={userProfile.lastName}
                      onChange={(e) => updateUserProfile({ lastName: e.target.value })}
                      placeholder="Seu sobrenome"
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-[#0071e3] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 3. E-mail */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-300 block">E-mail</label>
                    {userProfile.isSocialLogin && (
                      <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
                        <Lock size={10} /> Vinculado ao {userProfile.providerName || 'Google'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input 
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => !userProfile.isSocialLogin && updateUserProfile({ email: e.target.value })}
                      disabled={userProfile.isSocialLogin}
                      placeholder="seu.email@exemplo.com"
                      className={`w-full bg-[#2c2c2e] border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                        userProfile.isSocialLogin
                          ? 'opacity-60 cursor-not-allowed border-white/5 bg-[#222224]'
                          : 'border-white/10 focus:border-[#0071e3]'
                      }`}
                    />
                  </div>
                </div>

                {/* 4. Número de Telefone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300 block">Número de Telefone</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input 
                      type="tel"
                      value={formatTelefone(userProfile.phone)}
                      onChange={(e) => updateUserProfile({ phone: formatTelefone(e.target.value) })}
                      placeholder="(11) 98765-4321"
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-[#0071e3] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 5. Mudar a Senha ou Aviso de Login Social */}
                {userProfile.isSocialLogin ? (
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start space-x-3 text-xs text-blue-300 my-1">
                    <Shield size={18} className="shrink-0 mt-0.5 text-blue-400" />
                    <div className="space-y-1">
                      <p className="font-bold text-white text-xs">
                        Login via {userProfile.providerName || 'Google'}
                      </p>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        Como você realizou a autenticação com o <strong>{userProfile.providerName || 'Google'}</strong> (rede social), não é possível alterar o e-mail nem a senha diretamente por este painel.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-300 block">Senha</label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                          <input 
                            type={showPassword ? "text" : "password"}
                            value={userProfile.password}
                            onChange={(e) => updateUserProfile({ password: e.target.value })}
                            placeholder="Sua senha"
                            className="w-full bg-[#2c2c2e] border border-white/10 focus:border-[#0071e3] rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            title={showPassword ? "Ocultar senha" : "Exibir senha"}
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-300 block">Confirmar Senha</label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                          <input 
                            type={showConfirmPassword ? "text" : "password"}
                            value={userProfile.confirmPassword ?? userProfile.password}
                            onChange={(e) => updateUserProfile({ confirmPassword: e.target.value })}
                            placeholder="Repita a senha"
                            className={`w-full bg-[#2c2c2e] border rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                              userProfile.password !== (userProfile.confirmPassword ?? userProfile.password)
                                ? 'border-red-500/60 focus:border-red-500'
                                : 'border-white/10 focus:border-[#0071e3]'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            title={showConfirmPassword ? "Ocultar senha" : "Exibir senha"}
                          >
                            {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {userProfile.confirmPassword !== undefined && userProfile.password !== userProfile.confirmPassword && (
                      <p className="text-[11px] text-red-400 font-medium">As senhas não coincidem.</p>
                    )}
                  </>
                )}

              </div>

              {/* Modal Footer */}
              {(() => {
                const isFormComplete = userProfile.isSocialLogin
                  ? (
                      Boolean(userProfile.firstName?.trim()) &&
                      Boolean(userProfile.lastName?.trim()) &&
                      Boolean(userProfile.email?.trim()) &&
                      Boolean(userProfile.phone?.trim())
                    )
                  : (
                      Boolean(userProfile.firstName?.trim()) &&
                      Boolean(userProfile.lastName?.trim()) &&
                      Boolean(userProfile.email?.trim()) &&
                      Boolean(userProfile.phone?.trim()) &&
                      Boolean(userProfile.password) &&
                      Boolean(userProfile.confirmPassword ?? userProfile.password) &&
                      userProfile.password === (userProfile.confirmPassword ?? userProfile.password)
                    );

                return (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between min-h-[44px]">
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                      {isFormComplete ? (
                        <>
                          <CheckCircle2 size={13} className="text-[#30d158]" />
                          Salvo em tempo real
                        </>
                      ) : (
                        <span className="text-amber-400/90 text-[11px]">
                          Preencha todos os campos e confirme a senha
                        </span>
                      )}
                    </span>
                    {isFormComplete && (
                      <button 
                        onClick={() => setIsAccountModalOpen(false)}
                        className="px-5 py-2 bg-[#0071e3] hover:bg-[#147ce5] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-md shadow-blue-500/20"
                      >
                        Concluído
                      </button>
                    )}
                  </div>
                );
              })()}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER MOBILE MENU (Para telas pequenas) */}
      {isMobileMenuOpen && isLoggedIn && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <motion.div 
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-72 h-full bg-[#111112]/85 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-[#86868b] uppercase tracking-wider">Módulos de Estudo</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#86868b] hover:text-white p-1 rounded-md">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              <button 
                onClick={() => {
                  setActiveLessonId('');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-left text-xs font-semibold ${
                  !activeLessonId ? 'bg-[#0071e3]/20 text-[#0071e3]' : 'text-white'
                }`}
              >
                <BookOpen size={14} />
                <span>Visão Geral do Curso</span>
              </button>

              {modulesData.map(mod => (
                <div key={mod.id} className="space-y-1">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block px-2.5 pt-2">{getModuleName(mod.title)}</span>
                  {mod.subtopics.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveModuleId(mod.id);
                        setActiveLessonId(sub.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex justify-between items-center ${
                        activeLessonId === sub.id ? 'bg-[#0071e3] text-white' : 'text-neutral-400'
                      }`}
                    >
                      <span className="whitespace-normal break-words leading-tight pr-1">{sub.title.replace(/^\d+\.\s*/, '')}</span>
                      {progress.completedLessons.includes(sub.id) && <CheckCircle2 size={10} className="text-[#30d158] ml-2 shrink-0" />}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <button 
              onClick={handleLogout}
              className="w-full py-2.5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Fazer Logout
            </button>
          </motion.div>
        </div>
      )}

      {/* Supabase Auth Login Modal */}
      <SupabaseLoginModal
        isOpen={isSupabaseLoginOpen}
        onClose={() => setIsSupabaseLoginOpen(false)}
        onSuccessLogin={(email) => {
          setIsLoggedIn(true);
          localStorage.setItem(LOGIN_KEY, 'true');
          updateUserProfile({ email });
        }}
        onNavigateForgotPassword={() => {
          setCurrentRoute('esqueci-senha');
        }}
      />

      {/* Stripe In-Page Glassmorphic Checkout Modal */}
      <StripeCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title={checkoutModalInfo.title}
        description={checkoutModalInfo.description}
      />

      {/* Cognitive & Dyslexia Accessibility Widget */}
      <AccessibilityWidget />

    </div>
  );
}
