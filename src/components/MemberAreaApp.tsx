'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import BackToTopButton from './BackToTopButton';
import LessonTimeline, { LESSON_VIDEO_ANCHOR } from './LessonTimeline';
import { TocRegistryContext, type TocGroup } from './EditorialLayout';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useSidebarMotion, GsapCollapse, GsapChevron, SIDEBAR_WIDTH_OPEN, SIDEBAR_WIDTH_CLOSED } from '@/components/SidebarMotion';
import { 
  Folder, ChevronRight, ChevronLeft,
  CheckCircle2, Lock, PanelLeftClose, PanelLeft, X, Search, Menu,
  Wand2, Palette, User, LogIn, LogOut, Star, Compass, Undo2
} from 'lucide-react';
import { modulesData } from '@/data/data';
import { UserProgress, CourseModule, ModuleId, Subtopic, Challenge } from '@/types/course';
import { TextHighlighterTool } from '@/components/TextHighlighterTool';
import { fetchReadingState, saveReadingState, getLocalReadingState } from '@/lib/readingStateService';
import { readCache, writeCache, removeCache, purgeClientCache } from '@/lib/clientCache';
import { purgePrivateCache } from '@/lib/swBridge';
import { useDialogA11y } from '@/hooks/useDialogA11y';
import { AccessibilityWidget } from '@/components/AccessibilityWidget';
import { LoginModal } from '@/components/LoginModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { supabase } from '@/lib/supabase';
import { getMediaUrl } from '@/lib/storage';
import { MemberPreloader } from '@/components/MemberPreloader';
import { AccountSettingsModal } from '@/components/AccountSettingsModal';
import { DeviceSessionKickedModal } from '@/components/DeviceSessionKickedModal';
import VideoLessonPlayer, { VideoLessonPlayerHandle } from '@/components/VideoLessonPlayer';
import LessonComments from '@/components/LessonComments';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import DownloadMenu from '@/components/DownloadMenu';
import LessonCompletionTransition from '@/components/LessonCompletionTransition';
import IntroducaoDaVinciArticle from '@/components/IntroducaoDaVinciArticle';
import AnaliseImagemArticle from '@/components/AnaliseImagemArticle';
import FluxoTrabalhoArticle from '@/components/FluxoTrabalhoArticle';
import PrimariasArticle from '@/components/PrimariasArticle';
import DicasArticle from '@/components/DicasArticle';
import { useLessonRelease } from '@/hooks/useLessonRelease';
import { LessonReleaseTooltip, LessonLockedPanel } from '@/components/LessonReleaseTooltip';
import GerenciamentoCoresArticle from '@/components/GerenciamentoCoresArticle';
import GenericLessonArticle from '@/components/GenericLessonArticle';
import PandaPlaylistPlayer from '@/components/PandaPlaylistPlayer';
import { hasLessonVideo } from '@/config/lessonsWithVideo';
import FloatingCompleteButton from '@/components/FloatingCompleteButton';
import ScrollShrinkVideo, { type ScrollShrinkVideoHandle } from '@/components/ScrollShrinkVideo';

// Lazy load heavy interactive tools for instant initial render and 0 lag
// Conteúdo completo de "Análise da Imagem": só é baixado para quem pode vê-lo (ver canSeeFullAnalysis).
const AnaliseImagemCompletaArticle = lazy(() => import('@/components/AnaliseImagemCompletaArticle'));
const ExposureCalculator = lazy(() => import('@/components/ExposureCalculator'));
const ColorwheelsGrading = lazy(() => import('@/components/ColorwheelsGrading'));
const DeliverExporter = lazy(() => import('@/components/DeliverExporter'));

const ToolFallback = () => (
  <div role="status" className="w-full h-48 flex items-center justify-center text-sm text-neutral-600 animate-pulse motion-reduce:animate-none">
    Carregando ferramenta...
  </div>
);

// Helper to render Apple-style module icons
const getModuleIcon = (modId: ModuleId, isCurrent: boolean) => {
  const colorClass = isCurrent ? 'text-[#0071e3]' : 'text-[#a1a1a6]';
  const size = 18;
  switch (modId) {
    case 'mod1': return <Compass size={size} className={colorClass} />;
    case 'mod2': return <Palette size={size} className={colorClass} />;
    case 'mod3': return <Wand2 size={size} className={colorClass} />;
    case 'mod4': return <Star size={size} className={colorClass} />;
    default: return <Folder size={size} className={colorClass} />;
  }
};

const getModuleName = (title: string | undefined): string => {
  if (!title) return '';
  return title
    .replace(/^MÓDULO\s+\d+:\s*/i, '')
    .replace(/^MÓDULO\s+\d+\s*[-–—]\s*/i, '')
    .replace(/^MÓDULO\s+\d+\s*/i, '')
    .replace(/^MÓDULO\s+BÔNUS:\s*/i, '')
    .replace(/^INTRODUÇÃO:\s*/i, '')
    .trim();
};

const STORAGE_KEY = 'color_master_member_progress';
const PROFILE_FRESH_MS = 6 * 60 * 60 * 1000;      // perfil só é rebuscado no banco a cada 6 h
const HEARTBEAT_INTERVAL_MS = 60 * 1000;           // sessão única: checagem a cada 60 s (antes 10 s)

interface ProfileRow {
  id?: string;
  role?: string;
  has_access?: boolean;
  has_full_access?: boolean;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  nickname?: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  nickname?: string;
  isAdmin?: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Aluno',
  lastName: 'FLMMKR',
  email: '',
  phone: '',
  avatar: getMediaUrl('banners/hero_01.webp'),
  isAdmin: false
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

export function MemberAreaApp({ skipInternalPreloader = false }: { skipInternalPreloader?: boolean } = {}) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>(() => {
    const saved = getLocalReadingState();
    return (saved?.lastModuleId as ModuleId) || 'mod1';
  });
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    const saved = getLocalReadingState();
    return saved?.lastLessonId || 'mod1-1';
  });
  const [activeTab, setActiveTab] = useState<'teoria' | 'pratica' | 'desafio' | 'checklist'>(() => {
    const saved = getLocalReadingState();
    return saved?.lastTab || 'teoria';
  });
  
  // Preferência de largura no desktop; no celular a barra lateral é uma gaveta sempre expandida.
  const [sidebarPref, setIsSidebarExpanded] = useState<boolean>(true);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  // Aulas liberadas por data (hora do servidor): isReleaseLocked(id) = ainda bloqueada.
  const { isLocked: isReleaseLocked } = useLessonRelease();
  const [releaseTip, setReleaseTip] = useState<{ id: string; rect: DOMRect } | null>(null);
  const activeLocked = isReleaseLocked(activeLessonId);
  // Título/módulo da aula ficam numa barra fixa no topo do quadro assim que o conteúdo aparece (fim do modo cinema).
  const [isTitleStuck, setIsTitleStuck] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const isSidebarExpanded = sidebarPref || isMobileMenuOpen;
  const lessonContainerRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  // Largura inicial (sem salto na primeira pintura); depois quem anima é o GSAP.
  const [initialSidebarWidth] = useState(() => (isSidebarExpanded ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED));
  // Textos do menu: continuam desenhados enquanto o menu fecha, para sumirem em fade em vez de cortar de uma vez.
  const { setAside, labelsShown } = useSidebarMotion(isSidebarExpanded);
  const [articleToc, setArticleToc] = useState<TocGroup[]>([]);
  const timelineGroups = useMemo<TocGroup[]>(
    () => (articleToc.length ? [{ title: 'Vídeo da aula', id: LESSON_VIDEO_ANCHOR }, ...articleToc] : []),
    [articleToc]
  );
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  
  const [isPaidUser, setIsPaidUser] = useState<boolean>(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState<boolean>(false);
  
  const [copiedChallengeId, setCopiedChallengeId] = useState<string | null>(null);
  const [activeFlyoutModule, setActiveFlyoutModule] = useState<string | null>(null);
  // Painel das aulas do módulo (menu recolhido): entra com fade, leve deslocamento e desaceleração.
  useGSAP(() => {
    if (!flyoutRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(flyoutRef.current, { opacity: 0, x: -10, scale: 0.97 }, { opacity: 1, x: 0, scale: 1, duration: 0.26, ease: 'power3.out', transformOrigin: 'left top', clearProps: 'transform' });
  }, { dependencies: [activeFlyoutModule, isSidebarExpanded] });
  const flyoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [completionTransitionData, setCompletionTransitionData] = useState<{
    completedLessonTitle: string;
    nextLesson: {
      id: string;
      title: string;
      moduleId: string;
      moduleTitle: string;
    } | null;
  } | null>(null);

  // Comentário/resposta a abrir (vindo de uma notificação)
  const [focusCommentId, setFocusCommentId] = useState<string | null>(null);
  const playerRef = useRef<VideoLessonPlayerHandle>(null);
  const shrinkRef = useRef<ScrollShrinkVideoHandle>(null);
  const sidebarCollapsedForLessonRef = useRef<string | null>(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Nome pessoal do aluno para avisos
  const studentDisplayName = useMemo(() => {
    const first = userProfile.firstName?.trim();
    if (first && first.toLowerCase() !== 'aluno') {
      return first;
    }
    const last = userProfile.lastName?.trim();
    if (last && last.toLowerCase() !== 'flmmkr' && last.length > 0) {
      return `${first || ''} ${last}`.trim();
    }
    return 'Aluno';
  }, [userProfile.firstName, userProfile.lastName]);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const searchDialogRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const progressKey = (uid: string | null) => (uid ? `${STORAGE_KEY}:${uid}` : STORAGE_KEY);
  const [kickedModalOpen, setKickedModalOpen] = useState<boolean>(false);
  const [kickedDeviceName, setKickedDeviceName] = useState<string>('Outro Dispositivo');
  const [kickedDeviceLocation, setKickedDeviceLocation] = useState<string>('Brasil');
  const [kickedAt, setKickedAt] = useState<string>('');

  const [expandedEmenta, setExpandedEmenta] = useState<Record<string, boolean>>(() => {
    const saved = getLocalReadingState();
    const mod = (saved?.lastModuleId as string) || 'mod1';
    return { [mod]: true };
  });

  // Current selected lesson and module (memoized for instant access)
  // A aula aberta manda: o módulo exibido é sempre o dono dela, mesmo que activeModuleId tenha mudado (ex.: clique no nome de um módulo).
  const activeModule = useMemo(() => {
    return modulesData.find(m => m.subtopics.some(s => s.id === activeLessonId))
      || modulesData.find(m => m.id === activeModuleId)
      || modulesData[0];
  }, [activeModuleId, activeLessonId]);

  const activeLesson = useMemo(() => {
    return activeModule.subtopics.find(s => s.id === activeLessonId) || activeModule.subtopics[0];
  }, [activeModule, activeLessonId]);

  const [activeSubtabId, setActiveSubtabId] = useState<string>(() => {
    const saved = getLocalReadingState();
    return saved?.lastSubtabId || '';
  });

  useEffect(() => {
    if (activeLesson?.subtabs && activeLesson.subtabs.length > 0) {
      setActiveSubtabId(prev => {
        if (prev && activeLesson.subtabs?.some(t => t.id === prev)) {
          return prev;
        }
        const saved = getLocalReadingState();
        if (saved?.lastSubtabId && activeLesson.subtabs?.some(t => t.id === saved.lastSubtabId)) {
          return saved.lastSubtabId;
        }
        return activeLesson.subtabs![0].id;
      });
    } else {
      setActiveSubtabId('');
    }
  }, [activeLessonId, activeLesson]);


  // Overall course progress percentage
  const totalLessonsCount = useMemo(() => {
    return modulesData.reduce((acc, curr) => acc + curr.subtopics.length, 0);
  }, []);

  const percentComplete = useMemo(() => {
    return Math.min(100, Math.round((progress.completedLessons.length / (totalLessonsCount || 1)) * 100));
  }, [progress.completedLessons.length, totalLessonsCount]);

  // Conteúdo completo de "Análise da Imagem": oculto até a pessoa concluir 100% das aulas (todas marcadas como
  // concluídas; assistir o vídeo até o fim já marca a aula). Vale para todos, inclusive admin.
  // Para o admin revisar sem concluir tudo: troque por `isMasterAdmin || percentComplete >= 100`.
  const canSeeFullAnalysis = percentComplete >= 100;

  // Cor do número do progresso: 0% branco → 50% azul-ciano (a cor de antes) → 100% verde.
  const progressColor = useMemo(() => {
    const stops: [number, number, number][] = [[255, 255, 255], [0, 199, 252], [48, 209, 88]];
    const t = Math.min(100, Math.max(0, percentComplete)) / 50; // 0..2
    const i = Math.min(1, Math.floor(t));
    const f = t - i;
    const [a, b] = [stops[i], stops[i + 1]];
    return `rgb(${[0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * f)).join(' ')})`;
  }, [percentComplete]);

  // 1. Initial Load & Auth State
  useEffect(() => {
    let cancelled = false;

    // Carrega o progresso local do aluno (por usuário; migra a chave antiga única).
    const loadProgress = (uid: string | null) => {
      try {
        const scoped = uid ? localStorage.getItem(progressKey(uid)) : null;
        const legacy = localStorage.getItem(STORAGE_KEY);
        const raw = scoped ?? legacy;
        if (raw) setProgress({ ...DEFAULT_PROGRESS, ...JSON.parse(raw) });
        if (uid && !scoped && legacy) localStorage.setItem(progressKey(uid), legacy);
      } catch (_) {}
    };

    async function checkAuth() {
      try {
        // A página já validou o usuário no servidor antes de montar esta tela: aqui basta a sessão
        // local (sem ida ao servidor de auth).
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (cancelled) return;
        if (user) {
          currentUserIdRef.current = user.id;
          setIsLoggedIn(true);
          setIsAuthChecking(false);
          setCurrentUserId(user.id);
          loadProgress(user.id);
          const metaRole = user.app_metadata?.role;
          const metaAccess = user.app_metadata?.has_full_access;

          // Perfil: 1 consulta ao banco a cada 6 h por aparelho (cache de até 7 dias, limpo no logout).
          const profileKey = `profile:${user.id}`;
          let prof: ProfileRow | null = null;
          const cachedProfile = readCache<ProfileRow>(profileKey);
          if (cachedProfile && cachedProfile.ageMs < PROFILE_FRESH_MS) {
            prof = cachedProfile.value;
          } else {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            if (!error && data) {
              prof = data;
              writeCache(profileKey, data);
            } else {
              prof = cachedProfile?.value ?? null;
            }
          }
          if (cancelled) return;

          const isAdmin = metaRole === 'admin' || metaAccess === true || prof?.role === 'admin' || prof?.has_full_access === true;
          const isStudent = isAdmin || prof?.has_access === true || prof?.role === 'student';

          setIsMasterAdmin(isAdmin);
          setIsPaidUser(isAdmin || isStudent);

          const fullName = prof?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'Aluno';
          const nameParts = fullName.split(' ');
          const loadedFirstName = prof?.first_name || user.user_metadata?.first_name || nameParts[0] || 'Aluno';
          const loadedLastName = prof?.last_name || user.user_metadata?.last_name || nameParts.slice(1).join(' ') || '';

          setUserProfile({
            firstName: loadedFirstName,
            lastName: loadedLastName,
            email: user.email || prof?.email || '',
            phone: prof?.phone || user.user_metadata?.phone || '',
            avatar: prof?.avatar_url || user.user_metadata?.avatar_url || getMediaUrl('banners/hero_01.webp'),
            nickname: prof?.nickname || '',
            isAdmin
          });

          // Garante um @nickname para quem ainda não tem (só chama o servidor se faltar)
          if (!prof?.nickname) {
            fetch(`/api/user/ensure-nickname?userId=${encodeURIComponent(user.id)}`)
              .then(r => r.json())
              .then(d => {
                if (d?.nickname) {
                  setUserProfile(prev => ({ ...prev, nickname: d.nickname }));
                  removeCache(profileKey);
                }
              })
              .catch(() => {});
          }

          // Registrar / sincronizar sessão para controle de dispositivo único
          const sessionToken = localStorage.getItem('flmmkr_session_token');
          if (!sessionToken) {
            try {
              const regRes = await fetch('/api/auth/register-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
              });
              const regData = await regRes.json();
              if (regData?.sessionToken) {
                localStorage.setItem('flmmkr_session_token', regData.sessionToken);
              }
            } catch (_) {}
          }

          // Recuperar última aula (nuvem no máximo 1x/hora por aparelho; senão usa o estado local)
          try {
            const remoteState = await fetchReadingState(user.id);
            if (!cancelled && remoteState && remoteState.lastLessonId) {
              setActiveModuleId(remoteState.lastModuleId);
              setActiveLessonId(remoteState.lastLessonId);
              if (remoteState.lastSubtabId) {
                setActiveSubtabId(remoteState.lastSubtabId);
              }
              if (remoteState.lastTab) {
                setActiveTab(remoteState.lastTab);
              }
              setExpandedEmenta(prev => ({ ...prev, [remoteState.lastModuleId]: true }));
            }
          } catch (_) {}
        } else {
          // Usuário não autenticado: bloqueia acesso e redireciona para a landing page
          setIsLoggedIn(false);
          setIsAuthChecking(false);
          window.location.replace('/');
        }
      } catch (err) {
        console.warn('Erro auth:', err);
        setIsLoggedIn(false);
        setIsAuthChecking(false);
        window.location.replace('/');
      }
    }

    checkAuth();

    // Só reage a login de outra conta e a logout. TOKEN_REFRESHED / INITIAL_SESSION / USER_UPDATED
    // não refazem a carga (antes cada um disparava perfil + sessão + estado de leitura de novo).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        if (event === 'SIGNED_IN' && session.user.id !== currentUserIdRef.current) checkAuth();
      } else if (event === 'SIGNED_OUT') {
        currentUserIdRef.current = null;
        setIsLoggedIn(false);
        setIsPaidUser(false);
        setIsMasterAdmin(false);
        setCurrentUserId(null);
        window.location.replace('/');
      }
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  // Memória contínua da área do aluno: salva a aula, módulo e subtab sempre que o aluno navegar
  useEffect(() => {
    if (!activeLessonId) return;
    saveReadingState(
      {
        lastModuleId: activeModuleId,
        lastLessonId: activeLessonId,
        lastSubtabId: activeSubtabId || undefined,
        lastTab: activeTab,
        scrollTop: 0
      },
      currentUserId || undefined
    );
  }, [activeModuleId, activeLessonId, activeSubtabId, activeTab, currentUserId]);

  // Monitoramento de Concorrência de Dispositivo Único (Heartbeat)
  useEffect(() => {
    if (!isLoggedIn || !currentUserId) return;

    const checkSessionHeartbeat = async () => {
      if (document.visibilityState === 'hidden') return; // aba em segundo plano não consome servidor
      const sessionToken = localStorage.getItem('flmmkr_session_token');
      if (!sessionToken) return;

      try {
        const res = await fetch('/api/auth/session-heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken, userId: currentUserId }),
        });
        const data = await res.json();

        if (data && data.valid === false && data.replaced === true) {
          // Conta logou em outro dispositivo -> desconectar este
          setKickedDeviceName(data.replacedByDevice || 'Outro Dispositivo');
          setKickedDeviceLocation(data.replacedByLocation || 'Brasil');
          setKickedAt(data.replacedAt || new Date().toISOString());
          setKickedModalOpen(true);
          localStorage.removeItem('flmmkr_session_token');
          handleLogout();
        }
      } catch (e) {
        // Silêncio em caso de instabilidade pontual de conexão
      }
    };

    const interval = setInterval(checkSessionHeartbeat, HEARTBEAT_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkSessionHeartbeat();
    };
    window.addEventListener('focus', checkSessionHeartbeat);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkSessionHeartbeat);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isLoggedIn, currentUserId]);

  // Save progress helper
  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(progressKey(currentUserIdRef.current), JSON.stringify(newProgress));
    } catch (_) {}
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    localStorage.removeItem('flmmkr_session_token');
    // Computador compartilhado: apaga dados e arquivos privados guardados por este sistema.
    purgeClientCache();
    purgePrivateCache();
    currentUserIdRef.current = null;
    setIsLoggedIn(false);
    setIsPaidUser(false);
    setIsMasterAdmin(false);
    setIsProfileMenuOpen(false);
    window.location.replace('/');
  };

  const handleToggleLessonComplete = (lessonId: string) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    const completed = [...progress.completedLessons];
    const isCompleted = completed.includes(lessonId);
    const nextCompleted = isCompleted ? completed.filter(id => id !== lessonId) : [...completed, lessonId];

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

  const handleLessonFinished = (finishedLessonId?: string) => {
    const targetLessonId = finishedLessonId || activeLessonId;
    
    // 1. Adicionar à barra de progresso imediatamente
    const nextCompleted = progress.completedLessons.includes(targetLessonId)
      ? progress.completedLessons
      : [...progress.completedLessons, targetLessonId];

    const finalCompletedModules = [...progress.completedModules];
    modulesData.forEach(m => {
      const allLessonsCompleted = m.subtopics.every(s => nextCompleted.includes(s.id));
      const hasCompletedRecord = finalCompletedModules.includes(m.id);
      if (allLessonsCompleted && !hasCompletedRecord) {
        finalCompletedModules.push(m.id);
      }
    });

    saveProgress({ 
      ...progress, 
      completedLessons: nextCompleted,
      completedModules: finalCompletedModules
    });

    // 2. Determinar próxima aula (próxima do mesmo módulo ou primeira do próximo módulo)
    const currentIndex = activeModule.subtopics.findIndex(s => s.id === targetLessonId);
    let nextLessonInfo: { id: string; title: string; moduleId: string; moduleTitle: string } | null = null;

    if (currentIndex < activeModule.subtopics.length - 1) {
      // Próxima aula do mesmo módulo
      const nextSub = activeModule.subtopics[currentIndex + 1];
      nextLessonInfo = {
        id: nextSub.id,
        title: nextSub.title,
        moduleId: activeModule.id,
        moduleTitle: activeModule.title
      };
    } else {
      // Última aula do módulo -> primeira aula do próximo módulo
      const nextModIndex = modulesData.findIndex(m => m.id === activeModuleId) + 1;
      if (nextModIndex < modulesData.length) {
        const nextMod = modulesData[nextModIndex];
        nextLessonInfo = {
          id: nextMod.subtopics[0].id,
          title: nextMod.subtopics[0].title,
          moduleId: nextMod.id,
          moduleTitle: nextMod.title
        };
      }
    }

    // Se a próxima aula ainda não foi liberada, a tela de transição não oferece o avanço.
    if (nextLessonInfo && isReleaseLocked(nextLessonInfo.id)) nextLessonInfo = null;

    // 3. Abrir tela de transição com confetes dentro da tela de conteúdo
    if (lessonContainerRef.current) {
      lessonContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    setCompletionTransitionData({
      completedLessonTitle: activeLesson.title,
      nextLesson: nextLessonInfo,
    });
  };

  const handleProceedToNextLesson = () => {
    if (completionTransitionData?.nextLesson) {
      const next = completionTransitionData.nextLesson;
      setActiveModuleId(next.moduleId as ModuleId);
      setActiveLessonId(next.id);
      setExpandedEmenta(prev => ({ ...prev, [next.moduleId]: true }));
      saveReadingState({
        lastModuleId: next.moduleId as ModuleId,
        lastLessonId: next.id,
        lastTab: activeTab,
        scrollTop: 0
      }, currentUserId || undefined);
    }
    setCompletionTransitionData(null);
    if (lessonContainerRef.current) {
      lessonContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Ao dar play, recolhe o menu lateral (uma vez por aula, para não brigar com quem reabre o menu).
  const handleVideoPlay = () => {
    if (sidebarCollapsedForLessonRef.current === activeLessonId) return;
    sidebarCollapsedForLessonRef.current = activeLessonId;
    setIsSidebarExpanded(false);
  };

  // Fim do último vídeo da aula: conclui e faz o player diminuir sozinho.
  const handleLastVideoEnded = () => {
    handleLessonFinished(activeLessonId);
    shrinkRef.current?.reveal();
  };

  const handleCompleteAndNext = (lessonId: string) => {
    handleLessonFinished(lessonId);
  };

  const handleToggleChecklist = (itemId: string) => {
    const nextStates = { ...progress.checklistStates, [itemId]: !progress.checklistStates[itemId] };
    saveProgress({ ...progress, checklistStates: nextStates });
  };

  const handleChallengeFieldChange = (challengeId: string, key: string, value: string) => {
    const drafts = { ...progress.challengeDrafts };
    if (!drafts[challengeId]) drafts[challengeId] = {};
    drafts[challengeId][key] = value;
    saveProgress({ ...progress, challengeDrafts: drafts });
  };

  const handleCopyChallenge = (challengeId: string, fields: Challenge['fields']) => {
    let copyText = `📋 PLANO DE ESTUDO & EXERCÍCIO\n==============================================\n\n`;
    const draft = progress.challengeDrafts[challengeId] || {};
    fields.forEach(field => {
      const fieldKey = field.fieldId || field.key || "";
      const val = draft[fieldKey] || '';
      copyText += `👉 ${field.label}:\n   ${val || 'Não preenchido.'}\n\n`;
    });
    navigator.clipboard.writeText(copyText);
    setCopiedChallengeId(challengeId);
    setTimeout(() => setCopiedChallengeId(null), 2000);
  };

  const handleNextLesson = () => {
    const currentIndex = activeModule.subtopics.findIndex(s => s.id === activeLessonId);
    if (currentIndex < activeModule.subtopics.length - 1) {
      const nextLesson = activeModule.subtopics[currentIndex + 1];
      if (isReleaseLocked(nextLesson.id)) return;
      setActiveLessonId(nextLesson.id);
      saveReadingState({
        lastModuleId: activeModuleId,
        lastLessonId: nextLesson.id,
        lastTab: activeTab,
        scrollTop: 0
      });
    } else {
      const nextModIndex = modulesData.findIndex(m => m.id === activeModuleId) + 1;
      if (nextModIndex < modulesData.length) {
        const nextMod = modulesData[nextModIndex];
        if (isReleaseLocked(nextMod.subtopics[0].id)) return;
        setActiveModuleId(nextMod.id);
        setActiveLessonId(nextMod.subtopics[0].id);
        setExpandedEmenta({ [nextMod.id]: true });
        saveReadingState({
          lastModuleId: nextMod.id,
          lastLessonId: nextMod.subtopics[0].id,
          lastTab: activeTab,
          scrollTop: 0
        });
      }
    }
  };

  const handlePrevLesson = () => {
    const currentIndex = activeModule.subtopics.findIndex(s => s.id === activeLessonId);
    if (currentIndex > 0) {
      const prevLesson = activeModule.subtopics[currentIndex - 1];
      if (isReleaseLocked(prevLesson.id)) return;
      setActiveLessonId(prevLesson.id);
      saveReadingState({
        lastModuleId: activeModuleId,
        lastLessonId: prevLesson.id,
        lastTab: activeTab,
        scrollTop: 0
      });
    } else {
      const prevModIndex = modulesData.findIndex(m => m.id === activeModuleId) - 1;
      if (prevModIndex >= 0) {
        const prevMod = modulesData[prevModIndex];
        const lastLesson = prevMod.subtopics[prevMod.subtopics.length - 1];
        if (isReleaseLocked(lastLesson.id)) return;
        setActiveModuleId(prevMod.id);
        setActiveLessonId(lastLesson.id);
        setExpandedEmenta({ [prevMod.id]: true });
        saveReadingState({
          lastModuleId: prevMod.id,
          lastLessonId: lastLesson.id,
          lastTab: activeTab,
          scrollTop: 0
        });
      }
    }
  };

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

  // Render the interactive tools inside 'Na Prática' tab
  const renderInteractiveTool = (moduleId: ModuleId) => {
    switch (moduleId) {
      case 'mod1': return <ExposureCalculator />;
      case 'mod2': return <ColorwheelsGrading />;
      case 'mod3': return <ColorwheelsGrading />;
      case 'mod4': return <DeliverExporter />;
      default: return null;
    }
  };

  // Search Results Filter (memoized)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { module: CourseModule; lesson: Subtopic }[] = [];
    modulesData.forEach(m => {
      m.subtopics.forEach(sub => {
        if (
          sub.title.toLowerCase().includes(q) ||
          sub.concept.toLowerCase().includes(q) ||
          m.title.toLowerCase().includes(q)
        ) {
          results.push({ module: m, lesson: sub });
        }
      });
    });
    return results;
  }, [searchQuery]);

  const handleSelectSearchResult = (modId: ModuleId, lessonId: string) => {
    if (isReleaseLocked(lessonId)) return;
    setActiveModuleId(modId);
    setActiveLessonId(lessonId);
    setExpandedEmenta({ [modId]: true });
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery('');
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Busca: Esc fecha, Tab fica no diálogo, foco volta ao botão de busca.
  useDialogA11y(searchDialogRef, isSearchOpen, closeSearch);
  // Menu da conta: Esc fecha e devolve o foco ao botão do perfil.
  useDialogA11y(profileMenuRef, isProfileMenuOpen, () => setIsProfileMenuOpen(false), { trapFocus: false });

  // Clique fora fecha o menu da conta.
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      const wrap = profileMenuRef.current?.parentElement;
      if (wrap && !wrap.contains(e.target as Node)) setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isProfileMenuOpen]);


  // Se ainda estiver checando ou se não estiver autenticado, exibe apenas a tela segura do preloader
  if (isAuthChecking || !isLoggedIn) {
    if (skipInternalPreloader) {
      return (
        <div className="relative w-screen h-dvh bg-[#0a0a0c] text-[#f5f5f7] flex items-center justify-center overflow-hidden font-sans select-none" />
      );
    }
    return (
      <div className="relative w-screen h-dvh bg-[#0a0a0c] text-[#f5f5f7] flex items-center justify-center overflow-hidden font-sans select-none">
        <MemberPreloader isReady={false} />
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative w-screen h-dvh bg-[#0a0a0c] text-[#f5f5f7] flex items-center justify-center overflow-hidden font-sans">
      {/* Atalho de teclado: pula a navegação e vai direto à aula */}
      <a
        href="#lesson-view-container"
        onClick={(e) => { e.preventDefault(); lessonContainerRef.current?.focus(); }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:text-[#1d1d1f] focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-semibold"
      >
        Pular para o conteúdo da aula
      </a>
      {/* Brand Preloader exclusivo da Área de Membros */}
      {!skipInternalPreloader && <MemberPreloader isReady={!isAuthChecking && isLoggedIn} />}
      
      {/* Background geral da área de membros */}
      <div className="hidden md:block absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Fundo estático (último quadro do vídeo antigo): sem vídeo, sem animação, sem chamadas ao servidor */}
        <img
          src="/images/member-bg.webp"
          alt=""
          aria-hidden="true"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle Dark Contrast Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* FINDER WINDOW CONTAINER (Glassmorphism Frame) */}
      <div 
        className={`w-full h-full ${
          isMaximized 
            ? 'md:w-full md:h-full rounded-none border-none' 
            : 'md:w-[94vw] md:h-[94vh] rounded-[24px] border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)]'
        } bg-[#0c0c0f]/30 flex flex-col md:flex-row overflow-hidden relative z-10 transition-all duration-300 ease-out`} 
        id="finder-window"
      >
          
          {/* Fundo da gaveta no celular: toque fora fecha o menu */}
          {isMobileMenuOpen && (
            <button
              type="button"
              aria-label="Fechar menu de aulas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm cursor-default"
            />
          )}

          {/* SIDEBAR com Glassmorphism Apple (gaveta sobreposta no celular) */}
          <aside 
            ref={setAside}
            style={{ width: initialSidebarWidth }}
            aria-label="Módulos e aulas"
            className={`max-w-[85vw] md:max-w-none ${isMobileMenuOpen ? 'flex fixed inset-y-0 left-0 z-40 md:relative md:z-auto' : 'hidden md:flex'} bg-[#121216] border-r border-white/12 flex-col shrink-0 select-none relative will-change-[width] overflow-hidden`}
            id="window-sidebar"
          >
            {/* Sidebar Header: Traffic Lights & Collapse Button */}
            <div 
              className={`h-14 border-b border-white/12 bg-[#121216] flex items-center ${labelsShown ? 'px-3 justify-between' : 'px-0 justify-center'} select-none shrink-0 relative z-10 gap-1`}
            >
              
              {/* Traffic Lights */}
              {labelsShown && (
                <div className="sb-fade flex items-center gap-1.5 shrink-0 pl-1">
                  <button 
                    onClick={() => setIsMaximized(!isMaximized)}
                    aria-label={isMaximized ? 'Restaurar janela' : 'Maximizar janela'}
                    aria-pressed={isMaximized}
                    className={`w-3 h-3 rounded-full ${isMaximized ? 'bg-[#27c93f]' : 'bg-[#8e8e93]'} hover:brightness-110 active:brightness-90 flex items-center justify-center cursor-pointer border border-black/15 shrink-0 transition-colors`}
                    title={isMaximized ? "Restaurar Janela" : "Maximizar na Janela"}
                  />
                </div>
              )}

              {isMobileMenuOpen && (
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Fechar menu de aulas"
                  className="md:hidden ml-auto text-[#a1a1a6] hover:text-white p-2.5 rounded-md hover:bg-white/10 cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}

            </div>

            {/* Botão de recolher/expandir: fica preso à borda direita do menu, então acompanha a largura e nunca some durante a animação */}
            <button
              type="button"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              aria-label={isSidebarExpanded ? 'Recolher barra lateral' : 'Expandir barra lateral'}
              title={isSidebarExpanded ? 'Recolher Barra' : 'Expandir Barra'}
              className={`absolute right-3 top-[10px] z-20 h-9 w-9 items-center justify-center rounded-md text-[#a1a1a6] hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${isSidebarExpanded ? 'hidden md:flex' : 'flex'}`}
            >
              {isSidebarExpanded ? <PanelLeftClose size={15} /> : <PanelLeft size={16} />}
            </button>

            {/* Sidebar Content Tree */}
            <div className={`flex-1 py-3 px-2 space-y-3 custom-scrollbar overflow-y-auto relative z-10 `}>
              <div className="space-y-3 w-full">
                <div className="space-y-1">
                  {labelsShown && (
                    <span className="sb-fade text-[13px] font-bold text-[#a1a1a6] tracking-widest uppercase block px-3 mb-1.5">MÓDULOS</span>
                  )}
                  
                  {modulesData.map((mod) => {
                    const isCurrent = activeModuleId === mod.id;
                    const completedLessons = mod.subtopics.filter(s => progress.completedLessons.includes(s.id)).length;
                    const isAllCompleted = completedLessons === mod.subtopics.length;
                    const isLockedModule = !mod.isFree && !isPaidUser;

                    return (
                      <div 
                        key={mod.id} 
                        className="space-y-0.5 w-full"
                        onMouseEnter={() => handleModuleMouseEnter(mod.id)}
                        onMouseLeave={handleModuleMouseLeave}
                        onFocus={() => handleModuleMouseEnter(mod.id)}
                        onBlur={handleModuleMouseLeave}
                      >
                        
                        {/* Module Button com aceleração CSS leve */}
                        <button
                          onClick={() => {
                            if (isLockedModule) {
                              setIsCheckoutModalOpen(true);
                              return;
                            }
                            // Só abre/fecha o módulo: trocar o módulo ativo aqui deixava o título de uma aula e o conteúdo de outra.
                            if (!isSidebarExpanded) setIsSidebarExpanded(true);
                            
                            // Regra: quando um módulo estiver aberto, os outros estarão fechados
                            setExpandedEmenta(prev => {
                              const isCurrentlyOpen = !!prev[mod.id];
                              return isCurrentlyOpen ? {} : { [mod.id]: true };
                            });
                          }}
                          className={`w-full flex items-center justify-between px-[14px] py-2 rounded-[10px] text-[13px] transition-[background-color,border-color,color,box-shadow] duration-300 ease-out text-left cursor-pointer ${
                            isCurrent 
                              ? 'bg-white/15 text-white border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] font-semibold backdrop-blur-md' 
                              : 'text-neutral-300 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/10'
                          }`}
                          title={!isSidebarExpanded ? getModuleName(mod.title) : undefined}
                          aria-expanded={isSidebarExpanded ? !!expandedEmenta[mod.id] : undefined}
                          aria-label={!isSidebarExpanded ? `${getModuleName(mod.title)}${isLockedModule ? ' (bloqueado)' : ''}` : undefined}
                        >
                          <div className="flex items-center gap-2.5 truncate min-w-0">
                            <div className="shrink-0 flex items-center justify-center">
                              {getModuleIcon(mod.id, isCurrent)}
                            </div>
                            {labelsShown && (
                              <span className="sb-fade truncate text-[13px] whitespace-nowrap">{getModuleName(mod.title)}</span>
                            )}
                          </div>

                          {labelsShown && (
                            <div className="sb-fade shrink-0 flex items-center gap-1 pl-1">
                              {isLockedModule ? (
                                <Lock size={11} className="text-neutral-300 shrink-0" />
                              ) : (
                                <>
                                  {isAllCompleted && <CheckCircle2 size={11} className="text-[#30d158] shrink-0 mr-1" />}
                                  <GsapChevron open={!!expandedEmenta[mod.id]} className={expandedEmenta[mod.id] ? 'text-white' : 'text-neutral-300'}>
                                    <ChevronRight size={12} />
                                  </GsapChevron>
                                </>
                              )}
                            </div>
                          )}
                        </button>

                        {/* Lesson Nest under Expanded Module com AnimatePresence e Curva Quadrática */}
                        <GsapCollapse open={isSidebarExpanded && !!expandedEmenta[mod.id]} className="overflow-hidden pl-2 ml-3 border-l border-white/10 space-y-0.5 py-1">
                          {(
                            <>
                              {mod.subtopics.map((sub) => {
                                const isCurrentLesson = activeLessonId === sub.id;
                                const isCompleted = progress.completedLessons.includes(sub.id);
                                const isLockedLesson = !sub.isFree && !mod.isFree && !isPaidUser;
                                const releaseLocked = isReleaseLocked(sub.id);

                                return (
                                  <button
                                    key={sub.id}
                                    aria-current={isCurrentLesson ? 'page' : undefined}
                                    aria-disabled={releaseLocked || undefined}
                                    onMouseEnter={releaseLocked ? (e) => setReleaseTip({ id: sub.id, rect: e.currentTarget.getBoundingClientRect() }) : undefined}
                                    onFocus={releaseLocked ? (e) => setReleaseTip({ id: sub.id, rect: e.currentTarget.getBoundingClientRect() }) : undefined}
                                    onMouseLeave={releaseLocked ? () => setReleaseTip(null) : undefined}
                                    onBlur={releaseLocked ? () => setReleaseTip(null) : undefined}
                                    onClick={(e) => {
                                      if (releaseLocked) {
                                        // No celular não existe hover: o toque abre e fecha o tooltip.
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setReleaseTip((cur) => (cur?.id === sub.id ? null : { id: sub.id, rect }));
                                        return;
                                      }
                                      if (isLockedLesson) {
                                        setIsCheckoutModalOpen(true);
                                        return;
                                      }
                                      setActiveModuleId(mod.id);
                                      setActiveLessonId(sub.id);
                                      setIsMobileMenuOpen(false);
                                      saveReadingState({
                                        lastModuleId: mod.id,
                                        lastLessonId: sub.id,
                                        lastTab: activeTab,
                                        scrollTop: 0
                                      });
                                    }}
                                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 min-h-10 rounded-[8px] text-[13px] transition-colors text-left ${releaseLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${
                                      isCurrentLesson
                                        ? 'bg-[#0071e3] text-white font-medium shadow-sm'
                                        : 'text-[#c7c7cc] hover:text-white hover:bg-white/10'
                                    }`}
                                  >
                                    <span className="truncate pr-1">{sub.title.replace(/^\d+\.\s*/, '')}</span>
                                    {releaseLocked ? (
                                      <Lock size={13} aria-label="Bloqueada até a data de liberação" className="text-[#c7c7cc] shrink-0 ml-1" />
                                    ) : isLockedLesson ? (
                                      <Lock size={13} aria-label="Bloqueada" className="text-[#c7c7cc] shrink-0 ml-1" />
                                    ) : (
                                      isCompleted && (
                                        <CheckCircle2 size={14} aria-label="Concluída" className={isCurrentLesson ? 'text-white' : 'text-[#30d158]'} />
                                      )
                                    )}
                                  </button>
                                );
                              })}
                            </>
                          )}
                        </GsapCollapse>

                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Collapsed Sidebar Hover Flyout Panel com Glassmorphism */}
            {!isSidebarExpanded && activeFlyoutModule && (
              <div 
                ref={flyoutRef}
                style={{
                  top: '70px',
                  backdropFilter: 'blur(28px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(28px) saturate(190%)',
                }}
                role="group"
                aria-label="Aulas do módulo"
                className="absolute left-[68px] z-50 w-64 bg-[#16161a]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] space-y-1"
                onMouseEnter={() => {
                  if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
                }}
                onMouseLeave={handleModuleMouseLeave}
              >
                <p className="text-[13px] font-bold text-white truncate border-b border-white/10 pb-1 mb-1 px-1">
                  {getModuleName(modulesData.find(m => m.id === activeFlyoutModule)?.title)}
                </p>
                {modulesData.find(m => m.id === activeFlyoutModule)?.subtopics.map(sub => (
                  <button
                    key={sub.id}
                    aria-disabled={isReleaseLocked(sub.id) || undefined}
                    onMouseEnter={isReleaseLocked(sub.id) ? (e) => setReleaseTip({ id: sub.id, rect: e.currentTarget.getBoundingClientRect() }) : undefined}
                    onMouseLeave={isReleaseLocked(sub.id) ? () => setReleaseTip(null) : undefined}
                    onClick={() => {
                      const targetMod = modulesData.find(m => m.id === activeFlyoutModule);
                      const isLocked = !sub.isFree && !targetMod?.isFree && !isPaidUser;
                      if (isReleaseLocked(sub.id)) return;
                      if (isLocked) {
                        setIsCheckoutModalOpen(true);
                        return;
                      }
                      setActiveModuleId(activeFlyoutModule as ModuleId);
                      setActiveLessonId(sub.id);
                      setActiveFlyoutModule(null);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded text-[13px] text-neutral-200 hover:text-white hover:bg-white/10 flex justify-between items-center transition-colors"
                  >
                    <span className="truncate">{sub.title}</span>
                    {isReleaseLocked(sub.id)
                      ? <Lock size={10} aria-label="Bloqueada até a data de liberação" className="shrink-0 text-[#c7c7cc]" />
                      : progress.completedLessons.includes(sub.id) && <CheckCircle2 size={10} className="text-[#30d158]" />}
                  </button>
                ))}
              </div>
            )}

          </aside>

          {/* MAIN SPACE (TOOLBAR + CONTENT) */}
          <main ref={setMainEl} className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Toolbar com o mesmo fundo sólido do menu lateral */}
            <header
              className="h-14 bg-[#121216] border-b border-white/12 flex items-center px-3 sm:px-6 justify-between gap-2 select-none relative z-[45] shrink-0"
            >
              
              {/* Left Toolbar Info */}
              <div className="flex items-center gap-3 relative z-10">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={isMobileMenuOpen ? 'Fechar menu de aulas' : 'Abrir menu de aulas'}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="window-sidebar"
                  className="md:hidden text-white hover:text-neutral-300 p-2.5 -ml-1 rounded-md"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <button 
                      onClick={handlePrevLesson}
                      aria-label="Aula anterior"
                      className="p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#f5f5f7] border border-white/10 backdrop-blur-md shadow-xs transition-all active:scale-95 cursor-pointer"
                      title="Aula Anterior"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      onClick={handleNextLesson}
                      aria-label="Próxima aula"
                      className="p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#f5f5f7] border border-white/10 backdrop-blur-md shadow-xs transition-all active:scale-95 cursor-pointer"
                      title="Próxima Aula"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="border-l border-white/15 pl-3 hidden sm:block">
                    <span className="block text-[13px] font-bold tracking-tight text-white leading-none">FLMMKR</span>
                  </div>
                </div>
              </div>

              {/* Center Progress Meter */}
              {isLoggedIn && (
                <div role="progressbar" aria-label="Progresso do curso" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentComplete} className="hidden lg:flex items-center gap-3 relative z-10">
                  <span className="text-[11px] font-bold tracking-tight text-white uppercase leading-none">Progresso</span>
                  <div className="w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-[width,background-color,box-shadow] duration-700 ease-out"
                      style={{ width: `${percentComplete}%`, backgroundColor: progressColor, boxShadow: `0 0 8px ${progressColor}` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold font-mono leading-none transition-colors duration-700 ease-out" style={{ color: progressColor }}>{percentComplete}%</span>
                </div>
              )}

              {/* Progresso compacto (celular e tablet) */}
              {isLoggedIn && (
                <span className="lg:hidden text-[13px] font-bold font-mono tabular-nums bg-white/[0.06] border border-white/10 rounded-full px-2.5 py-1" style={{ color: progressColor }}>
                  {percentComplete}%<span className="sr-only"> do curso concluído</span>
                </span>
              )}

              {/* Right Search, Accessibility & Profile */}
              <div className="flex items-center gap-2.5 relative z-10">
                
                {/* Search Bar Trigger */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Buscar aulas"
                  aria-haspopup="dialog"
                  className="flex items-center justify-center md:justify-start bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-full p-2.5 md:px-3.5 md:py-2 md:w-32 cursor-pointer backdrop-blur-md shadow-xs transition-all"
                >
                  <Search size={15} className="text-[#a1a1a6] md:mr-1.5" aria-hidden="true" />
                  <span className="hidden md:inline text-[13px] text-[#a1a1a6] select-none">Buscar...</span>
                </button>

                {/* Material de apoio (download direto do projeto) */}
                <DownloadMenu userId={currentUserId} />

                {/* Notifications Button & Dropdown */}
                <NotificationsDropdown
                  userId={currentUserId}
                  onNavigateToLesson={(modId, lesId, commentId) => {
                    if (lesId && isReleaseLocked(lesId)) return;
                    if (modId) setActiveModuleId(modId as ModuleId);
                    if (lesId) setActiveLessonId(lesId);
                    setCompletionTransitionData(null);
                    setFocusCommentId(commentId || null);
                  }}
                />

                {/* Acessibilidade: entre o sino e o perfil */}
                <AccessibilityWidget placement="header" />

                {/* User Profile / Login */}
                {isLoggedIn ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      aria-label={`Menu da conta de ${userProfile.firstName}`}
                      aria-haspopup="menu"
                      aria-expanded={isProfileMenuOpen}
                      className="flex items-center p-0.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 backdrop-blur-md shadow-xs cursor-pointer transition-all"
                    >
                      <img 
                        src={userProfile.avatar} 
                        alt="" 
                        className="w-8 h-8 rounded-full object-cover border border-[#0071e3] shadow-xs"
                      />
                    </button>

                    {/* Profile Dropdown */}
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          ref={profileMenuRef}
                          role="menu"
                          aria-label="Conta"
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          transition={{ duration: 0.12 }}
                          style={{
                            backdropFilter: 'blur(28px) saturate(190%)',
                            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
                          }}
                          className="absolute right-0 top-11 w-60 max-w-[90vw] z-50 overflow-hidden bg-[#16161a]/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] p-2 space-y-1"
                        >
                          <div className="px-3 py-2 border-b border-white/10">
                            <p className="text-[13px] font-bold text-white truncate">{userProfile.firstName} {userProfile.lastName}</p>
                            <p className="text-[13px] text-neutral-300 truncate">{userProfile.email}</p>
                          </div>
                          <button
                            role="menuitem"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              setIsAccountModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] text-neutral-200 hover:text-white hover:bg-white/10 text-left font-medium transition-colors"
                          >
                            <User size={14} />
                            <span>Minha Conta</span>
                          </button>
                          <button
                            role="menuitem"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left font-medium transition-colors"
                          >
                            <LogOut size={14} />
                            <span>Sair</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-[13px] transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <LogIn size={13} />
                    <span>Entrar</span>
                  </button>
                )}
              </div>

            </header>

            {/* LESSON CANVAS */}
            <div 
              className={`flex-1 ${completionTransitionData ? 'overflow-hidden' : 'overflow-y-auto'} bg-[#f5f5f7] pb-24 relative select-text custom-scrollbar flex flex-col text-[#1d1d1f] focus:outline-none [scroll-behavior:auto]`} 
              id="lesson-view-container" 
              ref={lessonContainerRef}
              tabIndex={-1}
            >
              {/* Tela de Transição com Confetes coloridos ao finalizar a aula */}
              {completionTransitionData && (
                <LessonCompletionTransition
                  completedLessonTitle={completionTransitionData.completedLessonTitle}
                  nextLesson={completionTransitionData.nextLesson}
                  onProceed={handleProceedToNextLesson}
                  onStay={() => setCompletionTransitionData(null)}
                  studentName={studentDisplayName}
                />
              )}

              <div
                id="lesson-zoom-target"
                style={{ zoom: 'var(--lesson-zoom-scale, 1)' }}
                className="sticky top-0 z-30 w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 pt-[4.5rem] pb-8 flex-1 space-y-8"
              >
                
                {/* Aula ainda não liberada: mostra só o aviso com a contagem (o vídeo e o conteúdo nem são carregados) */}
                {activeLocked ? (
                  <LessonLockedPanel lessonId={activeLessonId} title={activeLesson.title} />
                ) : (
                <div className="space-y-8">
                  {/* Video Player on Top */}
                  <div id={LESSON_VIDEO_ANCHOR} className="w-full">
                    <ScrollShrinkVideo ref={shrinkRef} containerRef={lessonContainerRef} resetKey={activeLessonId} onRevealChange={setIsTitleStuck}>
                    {hasLessonVideo(activeLessonId) ? (
                      // Mesmo player Panda em todas as aulas que têm vídeo (key reinicia o estado a cada aula)
                      <PandaPlaylistPlayer
                        key={activeLessonId}
                        lessonId={activeLessonId}
                        studentName={studentDisplayName}
                        onLessonEnded={handleLastVideoEnded}
                        onPlay={handleVideoPlay}
                      />
                    ) : (
                      <VideoLessonPlayer
                        ref={playerRef}
                        videoUrl={activeLesson.videoUrl}
                        lessonId={activeLessonId}
                        title={activeLesson.title}
                        studentName={studentDisplayName}
                        onLessonEnded={handleLastVideoEnded}
                        onPlay={handleVideoPlay}
                      />
                    )}
                    </ScrollShrinkVideo>
                  </div>

                  {/* Campo de Comentários da Aula */}
                  <LessonComments
                    lessonId={activeLessonId}
                    moduleId={activeModuleId}
                    userId={currentUserId || undefined}
                    userProfile={userProfile}
                    isAdmin={isMasterAdmin}
                    focusCommentId={focusCommentId}
                    onFocusHandled={() => setFocusCommentId(null)}
                  />

                  {/* Editorial Text Layout under the video */}
                  <TocRegistryContext.Provider value={setArticleToc}>
                  <Suspense fallback={<ToolFallback />}>
                    {activeLessonId === 'mod1-1' ? (
                      <IntroducaoDaVinciArticle />
                    ) : activeLessonId === 'mod1-analise-tecnica' ? (
                      <>
                        <AnaliseImagemArticle />
                        {canSeeFullAnalysis && <AnaliseImagemCompletaArticle />}
                      </>
                    ) : activeLessonId === 'mod1-2' ? (
                      <GerenciamentoCoresArticle />
                    ) : activeLessonId === 'mod1-4' ? (
                      <FluxoTrabalhoArticle />
                    ) : activeLessonId === 'mod1-dicas' ? (
                      <DicasArticle />
                    ) : activeLessonId === 'mod2-1' ? (
                      <PrimariasArticle />
                    ) : (
                      activeLesson.subtabs && activeLesson.subtabs.length > 0 ? (
                        // Sem botões de aba: o conteúdo de cada variação (ex.: CST e ACES) aparece em sequência.
                        activeLesson.subtabs.map((tab) => (
                          <GenericLessonArticle
                            key={tab.id}
                            moduleTitle={activeModule.title}
                            lesson={activeLesson}
                            currentSubtab={tab}
                          />
                        ))
                      ) : (
                        <GenericLessonArticle moduleTitle={activeModule.title} lesson={activeLesson} />
                      )
                    )}
                  </Suspense>
                  </TocRegistryContext.Provider>

                  {/* Botão de Conclusão e Avanço no final da aula */}
                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-8 pb-4">
                    <button
                      onClick={handlePrevLesson}
                      className="min-h-12 px-6 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-semibold text-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                      <span>Aula anterior</span>
                    </button>
                    {progress.completedLessons.includes(activeLessonId) ? (
                      <button
                        onClick={() => handleToggleLessonComplete(activeLessonId)}
                        className="min-h-12 rounded-full border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 px-8 font-bold text-sm active:scale-[0.98] transition-colors cursor-pointer select-none flex items-center justify-center gap-2"
                      >
                        <Undo2 size={16} aria-hidden="true" />
                        <span>Desfazer</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCompleteAndNext(activeLessonId)}
                        className="min-h-12 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full px-8 font-bold text-sm shadow-md active:scale-[0.98] transition-colors cursor-pointer select-none flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} aria-hidden="true" />
                        <span>Concluir e avançar</span>
                      </button>
                    )}
                  </div>
                </div>
                )}

              </div>

              {/* Pista de rolagem do efeito do vídeo: mantém o conteúdo congelado enquanto o player diminui (ScrollShrinkVideo) */}
              <div aria-hidden="true" className="shrink-0" style={{ height: 'var(--hero-runway, 0px)' }} />

              {/* Zoom, Marcações e voltar ao topo: aparecem no canto inferior direito do quadro do conteúdo (portal para o <main>) */}
              <TextHighlighterTool lessonId={activeLessonId} containerRef={lessonContainerRef} trailing={<BackToTopButton containerRef={lessonContainerRef} />} portalTarget={mainEl} />

            </div>

          {/* Barra fixa: módulo + título (e selo "Concluída"). Aparece quando o modo cinema termina e não some mais ao rolar. */}
          <div
            aria-hidden={!isTitleStuck}
            // Acompanha a rolagem (mesma variável do fundo e do conteúdo): aparece junto com o resto e some conforme o player cresce.
            style={{
              opacity: 'var(--hero-fade, 1)',
              transform: 'translateY(calc((1 - var(--hero-fade, 1)) * -0.5rem))',
            }}
            className={`absolute inset-x-0 top-14 z-[35] border-b border-neutral-200 bg-[#f5f5f7] ${
              isTitleStuck ? '' : 'pointer-events-none'
            }`}
          >
            <div className="mx-auto flex h-11 w-full max-w-[1536px] items-center gap-3 px-4 sm:px-6 lg:px-10">
              <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-[#0071e3]">
                {activeModule.badge ? `${activeModule.badge} · ` : ''}{activeModule.title}
              </span>
              <span aria-hidden="true" className="h-4 w-px shrink-0 bg-neutral-300" />
              <h1 className="min-w-0 flex-1 truncate text-base font-bold tracking-tight text-[#1d1d1f]">{activeLesson.title}</h1>
              {progress.completedLessons.includes(activeLessonId) && (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={12} aria-hidden="true" /> Concluída
                </span>
              )}
            </div>
          </div>
          {timelineGroups.length > 0 && <LessonTimeline groups={timelineGroups} containerRef={lessonContainerRef} />}
          {isLoggedIn && !activeLocked && !completionTransitionData && !progress.completedLessons.includes(activeLessonId) && (
            <div data-hero-hide className={`absolute right-6 z-30 transition-[opacity,top] duration-300 ${isTitleStuck ? 'top-[112px]' : 'top-[72px]'}`}>
              <FloatingCompleteButton onComplete={() => handleCompleteAndNext(activeLessonId)} />
            </div>
          )}
          </main>

      </div>

      {releaseTip && isReleaseLocked(releaseTip.id) && <LessonReleaseTooltip lessonId={releaseTip.id} anchor={releaseTip.rect} />}

      {/* SEARCH MODAL */}
      {isSearchOpen && (
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeSearch(); }}
        >
          <div
            ref={searchDialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Buscar aulas"
            className="bg-[#1c1c1e]/95 border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl max-h-[70vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-2.5 p-4 border-b border-white/10 shrink-0">
              <Search size={18} className="text-[#a1a1a6]" aria-hidden="true" />
              <input 
                type="search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults[0]) {
                    handleSelectSearchResult(searchResults[0].module.id, searchResults[0].lesson.id);
                  }
                }}
                aria-label="Buscar por tópicos, conceitos, equipamentos"
                className="flex-1 bg-transparent text-white text-base focus:outline-none placeholder:text-[#a1a1a6]"
                placeholder="Busque por tópicos, conceitos, equipamentos..."
                autoFocus
              />
              <button 
                onClick={closeSearch}
                className="text-sm font-semibold text-[#4da3ff] cursor-pointer px-2 py-1"
              >
                Cancelar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar" aria-live="polite">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#a1a1a6]">
                  {searchQuery ? `Nenhum resultado para "${searchQuery}"` : 'Digite para buscar...'}
                </div>
              ) : (
                <ul className="space-y-1">
                  {searchResults.map(({ module, lesson }) => (
                    <li key={lesson.id}>
                      <button
                        onClick={() => handleSelectSearchResult(module.id, lesson.id)}
                        className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-colors flex justify-between items-center text-white min-h-12"
                      >
                        <div>
                          <span className="text-[13px] font-bold text-[#00c7fc] uppercase">{module.title}</span>
                          <h4 className="text-sm font-semibold">{lesson.title}</h4>
                        </div>
                        <ChevronRight size={16} className="text-neutral-300" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MINHA CONTA MODAL */}
      <AccountSettingsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        userProfile={userProfile}
        userId={currentUserId || undefined}
        onProfileUpdated={(updated) => {
          if (currentUserId) removeCache(`profile:${currentUserId}`);
          setUserProfile((prev) => ({
            ...prev,
            ...updated,
          }));
        }}
      />

      {/* MODAL DE SESSÃO DERRUBADA POR OUTRO DISPOSITIVO */}
      <DeviceSessionKickedModal
        isOpen={kickedModalOpen}
        studentName={studentDisplayName}
        replacedByDevice={kickedDeviceName}
        replacedByLocation={kickedDeviceLocation}
        replacedAt={kickedAt}
        onReLogin={() => {
          setKickedModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />


      {/* ACCESSIBILITY WIDGET */}

      {/* LOGIN MODAL */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* ASAAS CHECKOUT MODAL */}
      <CheckoutModal 
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        price={95}
      />

    </div>
    </MotionConfig>
  );
}
export default MemberAreaApp;
