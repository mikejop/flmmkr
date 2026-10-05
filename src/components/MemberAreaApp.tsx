'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, ChevronRight, ChevronDown, ChevronLeft,
  CheckCircle2, Lock, PanelLeftClose, PanelLeft, X, Search, Menu,
  Camera, Sun, SunMedium, Lamp, Contrast, Users, Wand2,
  Palette, Plus, User, LogIn, LogOut, Copy, Star, Compass
} from 'lucide-react';
import { modulesData } from '@/data/data';
import { UserProgress, CourseModule, ModuleId, Subtopic } from '@/types/course';
import { TextHighlighterTool } from '@/components/TextHighlighterTool';
import { fetchReadingState, saveReadingState, getLocalReadingState } from '@/lib/readingStateService';
import { AccessibilityWidget } from '@/components/AccessibilityWidget';
import { LoginModal } from '@/components/LoginModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { supabase } from '@/lib/supabase';
import { getMediaUrl } from '@/lib/storage';
import { MemberPreloader } from '@/components/MemberPreloader';
import { AccountSettingsModal } from '@/components/AccountSettingsModal';
import { DeviceSessionKickedModal } from '@/components/DeviceSessionKickedModal';
import VideoLessonPlayer from '@/components/VideoLessonPlayer';
import LessonComments from '@/components/LessonComments';
import IntroducaoDaVinciArticle from '@/components/IntroducaoDaVinciArticle';
import GenericLessonArticle from '@/components/GenericLessonArticle';

// Lazy load heavy interactive tools for instant initial render and 0 lag
const AceleracaoManager = lazy(() => import('@/components/AceleracaoManager'));
const Iluminacao3Pontos = lazy(() => import('@/components/Iluminacao3Pontos'));
const ExposureCalculator = lazy(() => import('@/components/ExposureCalculator'));
const CenarioPlanner = lazy(() => import('@/components/CenarioPlanner'));
const PudovkinSequencer = lazy(() => import('@/components/PudovkinSequencer'));
const ColorwheelsGrading = lazy(() => import('@/components/ColorwheelsGrading'));
const AudioMixer = lazy(() => import('@/components/AudioMixer'));
const DeliverExporter = lazy(() => import('@/components/DeliverExporter'));
const CtrSimulator = lazy(() => import('@/components/CtrSimulator'));

const ToolFallback = () => (
  <div className="w-full h-48 flex items-center justify-center text-xs text-neutral-400 animate-pulse">
    Carregando ferramenta...
  </div>
);

// Helper to render Apple-style module icons
const getModuleIcon = (modId: ModuleId, isCurrent: boolean) => {
  const colorClass = isCurrent ? 'text-[#0071e3]' : 'text-[#86868b]';
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

const STORAGE_KEY = 'flmmkr_member_progress';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
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

export function MemberAreaApp() {
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
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const lessonContainerRef = useRef<HTMLDivElement>(null);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  
  const [isPaidUser, setIsPaidUser] = useState<boolean>(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState<boolean>(false);
  
  const [copiedChallengeId, setCopiedChallengeId] = useState<string | null>(null);
  const [scrollProgressPercent, setScrollProgressPercent] = useState<number>(0);
  const [activeFlyoutModule, setActiveFlyoutModule] = useState<string | null>(null);
  const flyoutTimeoutRef = useRef<any>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
  const activeModule = useMemo(() => {
    return modulesData.find(m => m.id === activeModuleId) || modulesData[0];
  }, [activeModuleId]);

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

  const currentSubtab = useMemo(() => {
    if (!activeLesson?.subtabs || activeLesson.subtabs.length === 0) return null;
    return activeLesson.subtabs.find(t => t.id === activeSubtabId) || activeLesson.subtabs[0];
  }, [activeLesson, activeSubtabId]);

  // Overall course progress percentage
  const totalLessonsCount = useMemo(() => {
    return modulesData.reduce((acc, curr) => acc + curr.subtopics.length, 0);
  }, []);

  const percentComplete = useMemo(() => {
    return Math.min(100, Math.round((progress.completedLessons.length / (totalLessonsCount || 1)) * 100));
  }, [progress.completedLessons.length, totalLessonsCount]);

  // 1. Initial Load & Auth State
  useEffect(() => {
    try {
      const savedProg = localStorage.getItem(STORAGE_KEY);
      if (savedProg) setProgress(JSON.parse(savedProg));
    } catch (_) {}

    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsLoggedIn(true);
          setIsAuthChecking(false);
          setCurrentUserId(user.id);
          const metaRole = user.app_metadata?.role || user.user_metadata?.role;
          const metaAccess = user.app_metadata?.has_full_access || user.user_metadata?.has_full_access;

          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          const isAdmin = metaRole === 'admin' || metaAccess === true || prof?.role === 'admin' || prof?.has_full_access === true;
          const isStudent = isAdmin || prof?.has_access === true || prof?.role === 'student' || user.user_metadata?.has_access === true;

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
            isAdmin
          });

          // Registrar / sincronizar sessão para controle de dispositivo único
          let sessionToken = localStorage.getItem('flmmkr_session_token');
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

          // Recuperar última página/aula onde o aluno parou (memória em nuvem do Supabase)
          try {
            const remoteState = await fetchReadingState(user.id);
            if (remoteState && remoteState.lastLessonId) {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkAuth();
      } else {
        setIsLoggedIn(false);
        setIsPaidUser(false);
        setIsMasterAdmin(false);
        setCurrentUserId(null);
        window.location.replace('/');
      }
    });

    fetchReadingState().then(state => {
      if (state && state.lastLessonId) {
        setActiveModuleId(state.lastModuleId);
        setActiveLessonId(state.lastLessonId);
        if (state.lastSubtabId) setActiveSubtabId(state.lastSubtabId);
        if (state.lastTab) setActiveTab(state.lastTab);
        setExpandedEmenta(prev => ({ ...prev, [state.lastModuleId]: true }));
      }
    });

    return () => {
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

    const interval = setInterval(checkSessionHeartbeat, 10000);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    localStorage.removeItem('flmmkr_session_token');
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

  const handleCompleteAndNext = (lessonId: string) => {
    if (!progress.completedLessons.includes(lessonId)) {
      handleToggleLessonComplete(lessonId);
    }
    handleNextLesson();
    if (lessonContainerRef.current) {
      lessonContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  const handleCopyChallenge = (challengeId: string, fields: any[]) => {
    let copyText = `📋 PLANO DE ESTUDO & EXERCÍCIO\n==============================================\n\n`;
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
    const currentIndex = activeModule.subtopics.findIndex(s => s.id === activeLessonId);
    if (currentIndex < activeModule.subtopics.length - 1) {
      const nextLesson = activeModule.subtopics[currentIndex + 1];
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
    setActiveModuleId(modId);
    setActiveLessonId(lessonId);
    setExpandedEmenta({ [modId]: true });
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Throttled Scroll Progress listener with requestAnimationFrame
  useEffect(() => {
    const el = lessonContainerRef.current;
    if (!el) return;
    let rAF: number | null = null;
    const handleScroll = () => {
      if (rAF !== null) return;
      rAF = requestAnimationFrame(() => {
        const total = el.scrollHeight - el.clientHeight;
        if (total > 0) {
          setScrollProgressPercent(Math.round((el.scrollTop / total) * 100));
        }
        rAF = null;
      });
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (rAF !== null) cancelAnimationFrame(rAF);
    };
  }, [activeLessonId]);

  // Se ainda estiver checando ou se não estiver autenticado, exibe apenas a tela segura do preloader
  if (isAuthChecking || !isLoggedIn) {
    return (
      <div className="relative w-screen h-screen bg-[#0a0a0c] text-[#f5f5f7] flex items-center justify-center overflow-hidden font-sans select-none">
        <MemberPreloader />
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-[#0a0a0c] text-[#f5f5f7] flex items-center justify-center overflow-hidden font-sans select-none will-change-transform">
      {/* Brand Preloader exclusivo da Área de Membros */}
      <MemberPreloader />
      
      {/* Background Geral (Vídeo WebM do YouTuber Pro) */}
      <div className="hidden md:block absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          src={getMediaUrl('bg/02.webm')}
          poster={getMediaUrl('bg/02.webp')}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle Dark Contrast Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        
        {/* Ambient Color Nodes for Glassmorphism Refraction */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0071e3]/18 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/4 -right-24 w-80 h-80 bg-[#00c7fc]/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#5856d6]/15 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* FINDER WINDOW CONTAINER (Glassmorphism Frame) */}
      <div 
        style={{
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)'
        }}
        className={`w-full h-full ${
          isMaximized 
            ? 'md:w-full md:h-full rounded-none border-none' 
            : 'md:w-[94vw] md:h-[94vh] rounded-[24px] border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)]'
        } bg-[#0c0c0f]/45 flex flex-col md:flex-row overflow-hidden relative z-10 transition-all duration-300 ease-out`} 
        id="finder-window"
      >
          
          {/* SIDEBAR com Glassmorphism Apple */}
          <aside 
            style={{
              transition: 'width 320ms cubic-bezier(0.455, 0.03, 0.515, 0.955)',
              backdropFilter: 'blur(28px) saturate(190%) contrast(105%)',
              WebkitBackdropFilter: 'blur(28px) saturate(190%) contrast(105%)',
            }}
            className={`${isSidebarExpanded ? 'w-64' : 'w-16'} ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'} bg-[#121216]/55 border-r border-white/12 flex-col shrink-0 select-none relative will-change-[width] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_-1px_0_0_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.3)]`} 
            id="window-sidebar"
          >
            {/* Glass Sheen Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-transparent pointer-events-none" />
            
            {/* Sidebar Header: Traffic Lights & Collapse Button */}
            <div 
              style={{
                transitionTimingFunction: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
              }}
              className={`h-14 border-b border-white/10 bg-white/[0.02] backdrop-blur-xl flex items-center ${isSidebarExpanded ? 'px-3 justify-between' : 'px-0 justify-center'} select-none shrink-0 relative z-10 gap-1 transition-all duration-300`}
            >
              
              {/* Traffic Lights */}
              {isSidebarExpanded && (
                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  <button 
                    onClick={() => setIsMaximized(!isMaximized)}
                    className={`w-3 h-3 rounded-full ${isMaximized ? 'bg-[#27c93f]' : 'bg-[#8e8e93]'} hover:brightness-110 active:brightness-90 flex items-center justify-center cursor-pointer border border-black/15 shrink-0 transition-colors`}
                    title={isMaximized ? "Restaurar Janela" : "Maximizar na Janela"}
                  />
                </div>
              )}

              {/* Collapse Trigger Button */}
              {isSidebarExpanded ? (
                <button 
                  onClick={() => setIsSidebarExpanded(false)}
                  className="text-[#86868b] hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/5 cursor-pointer shrink-0"
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
            <div className="flex-1 py-3 px-2 space-y-3 custom-scrollbar overflow-y-auto relative z-10">
              <div className="space-y-3 w-full">
                <div className="space-y-1">
                  {isSidebarExpanded && (
                    <span className="text-[9px] font-bold text-[#86868b] tracking-widest uppercase block px-3 mb-1.5">MÓDULOS</span>
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
                      >
                        
                        {/* Module Button com aceleração CSS leve */}
                        <button
                          onClick={() => {
                            if (isLockedModule) {
                              setIsCheckoutModalOpen(true);
                              return;
                            }
                            setActiveModuleId(mod.id);
                            if (!isSidebarExpanded) setIsSidebarExpanded(true);
                            
                            // Regra: quando um módulo estiver aberto, os outros estarão fechados
                            setExpandedEmenta(prev => {
                              const isCurrentlyOpen = !!prev[mod.id];
                              return isCurrentlyOpen ? {} : { [mod.id]: true };
                            });
                          }}
                          style={{ transitionTimingFunction: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)' }}
                          className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between px-3' : 'justify-center px-0'} py-2 rounded-[10px] text-xs transition-all duration-300 hover:scale-[1.02] text-left cursor-pointer ${
                            isCurrent 
                              ? 'bg-white/15 text-white border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] font-semibold backdrop-blur-md' 
                              : 'text-neutral-300 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/10'
                          }`}
                          title={!isSidebarExpanded ? getModuleName(mod.title) : undefined}
                        >
                          <div className={`flex items-center ${isSidebarExpanded ? 'gap-2.5 truncate min-w-0' : 'justify-center w-full'}`}>
                            <div className="shrink-0 flex items-center justify-center">
                              {getModuleIcon(mod.id, isCurrent)}
                            </div>
                            {isSidebarExpanded && (
                              <span className="truncate text-xs whitespace-nowrap">{getModuleName(mod.title)}</span>
                            )}
                          </div>

                          {isSidebarExpanded && (
                            <div className="shrink-0 flex items-center gap-1 pl-1">
                              {isLockedModule ? (
                                <Lock size={11} className="text-neutral-400 shrink-0" />
                              ) : (
                                <>
                                  {isAllCompleted && <CheckCircle2 size={11} className="text-[#30d158] shrink-0 mr-1" />}
                                  <ChevronRight 
                                    size={12} 
                                    className={`text-neutral-400 transition-transform duration-300 ${
                                      expandedEmenta[mod.id] ? 'rotate-90 text-white' : 'rotate-0'
                                    }`}
                                    style={{
                                      transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                                    }}
                                  />
                                </>
                              )}
                            </div>
                          )}
                        </button>

                        {/* Lesson Nest under Expanded Module com AnimatePresence e Curva Quadrática */}
                        <AnimatePresence initial={false}>
                          {isSidebarExpanded && expandedEmenta[mod.id] && (
                            <motion.div
                              key={`module-lessons-${mod.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ 
                                height: 'auto', 
                                opacity: 1,
                                transition: {
                                  height: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
                                  opacity: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                                }
                              }}
                              exit={{ 
                                height: 0, 
                                opacity: 0,
                                transition: {
                                  height: { duration: 0.22, ease: [0.455, 0.03, 0.515, 0.955] },
                                  opacity: { duration: 0.16, ease: [0.455, 0.03, 0.515, 0.955] }
                                }
                              }}
                              className="overflow-hidden pl-2 ml-3 border-l border-white/10 space-y-0.5 py-1"
                            >
                              {mod.subtopics.map((sub) => {
                                const isCurrentLesson = activeLessonId === sub.id;
                                const isCompleted = progress.completedLessons.includes(sub.id);
                                const isLockedLesson = !sub.isFree && !mod.isFree && !isPaidUser;

                                return (
                                  <button
                                    key={sub.id}
                                    onClick={() => {
                                      if (isLockedLesson) {
                                        setIsCheckoutModalOpen(true);
                                        return;
                                      }
                                      setActiveModuleId(mod.id);
                                      setActiveLessonId(sub.id);
                                      saveReadingState({
                                        lastModuleId: mod.id,
                                        lastLessonId: sub.id,
                                        lastTab: activeTab,
                                        scrollTop: 0
                                      });
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-[11px] transition-colors text-left cursor-pointer ${
                                      isCurrentLesson
                                        ? 'bg-[#0071e3] text-white font-medium shadow-sm'
                                        : 'text-[#a1a1a6] hover:text-[#f5f5f7] hover:bg-white/5'
                                    }`}
                                  >
                                    <span className="truncate pr-1">{sub.title.replace(/^\d+\.\s*/, '')}</span>
                                    {isLockedLesson ? (
                                      <Lock size={10} className="text-[#a1a1a6] shrink-0 ml-1" />
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

            {/* Collapsed Sidebar Hover Flyout Panel com Glassmorphism */}
            {!isSidebarExpanded && activeFlyoutModule && (
              <div 
                style={{
                  top: '70px',
                  backdropFilter: 'blur(28px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(28px) saturate(190%)',
                }}
                className="absolute left-[68px] z-50 w-56 bg-[#16161a]/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] space-y-1"
                onMouseEnter={() => {
                  if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
                }}
                onMouseLeave={handleModuleMouseLeave}
              >
                <p className="text-[11px] font-bold text-white truncate border-b border-white/10 pb-1 mb-1 px-1">
                  {getModuleName(modulesData.find(m => m.id === activeFlyoutModule)?.title)}
                </p>
                {modulesData.find(m => m.id === activeFlyoutModule)?.subtopics.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      const targetMod = modulesData.find(m => m.id === activeFlyoutModule);
                      const isLocked = !sub.isFree && !targetMod?.isFree && !isPaidUser;
                      if (isLocked) {
                        setIsCheckoutModalOpen(true);
                        return;
                      }
                      setActiveModuleId(activeFlyoutModule as ModuleId);
                      setActiveLessonId(sub.id);
                      setActiveFlyoutModule(null);
                    }}
                    className="w-full text-left px-2 py-1 rounded text-[11px] text-neutral-300 hover:text-white hover:bg-white/10 flex justify-between items-center transition-colors"
                  >
                    <span className="truncate">{sub.title}</span>
                    {progress.completedLessons.includes(sub.id) && <CheckCircle2 size={10} className="text-[#30d158]" />}
                  </button>
                ))}
              </div>
            )}

          </aside>

          {/* MAIN SPACE (TOOLBAR + CONTENT) */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Toolbar com Efeito Glassmorphism Apple */}
            <header 
              style={{
                backdropFilter: 'blur(28px) saturate(190%) contrast(105%)',
                WebkitBackdropFilter: 'blur(28px) saturate(190%) contrast(105%)',
              }}
              className="h-14 bg-[#121216]/55 backdrop-blur-2xl border-b border-white/12 flex items-center px-6 justify-between select-none relative z-20 shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]"
            >
              {/* Glass Sheen Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/[0.04] via-transparent to-white/[0.02] pointer-events-none" />
              
              {/* Left Toolbar Info */}
              <div className="flex items-center gap-3 relative z-10">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden text-white hover:text-neutral-300 p-1 rounded-md"
                >
                  {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <button 
                      onClick={handlePrevLesson}
                      className="p-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#f5f5f7] border border-white/10 backdrop-blur-md shadow-xs transition-all active:scale-95 cursor-pointer"
                      title="Aula Anterior"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      onClick={handleNextLesson}
                      className="p-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#f5f5f7] border border-white/10 backdrop-blur-md shadow-xs transition-all active:scale-95 cursor-pointer"
                      title="Próxima Aula"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="border-l border-white/15 pl-3 hidden sm:block">
                    <span className="block text-xs font-bold tracking-tight text-white leading-none">FLMMKR</span>
                  </div>
                </div>
              </div>

              {/* Center Progress Meter */}
              {isLoggedIn && (
                <div className="hidden lg:flex items-center gap-3 bg-white/[0.05] hover:bg-white/[0.08] px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] relative z-10 transition-colors">
                  <span className="text-[10px] font-bold tracking-wider text-[#86868b] uppercase leading-none">Progresso</span>
                  <div className="w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#0071e3] to-[#00c7fc] transition-all duration-300 shadow-[0_0_8px_rgba(0,199,252,0.5)]"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#00c7fc] font-mono leading-none">{percentComplete}%</span>
                </div>
              )}

              {/* Right Search, Accessibility & Profile */}
              <div className="flex items-center gap-2.5 relative z-10">
                
                {/* Search Bar Trigger */}
                <div 
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden md:flex items-center bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-full px-3 py-1.5 w-28 cursor-pointer backdrop-blur-md shadow-xs transition-all"
                >
                  <Search size={11} className="text-[#86868b] mr-1.5" />
                  <span className="text-[11px] text-[#86868b] select-none">Buscar...</span>
                </div>

                {/* Accessibility Button */}
                <button
                  onClick={() => setIsAccessibilityOpen(true)}
                  className="p-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-neutral-200 hover:text-white border border-white/10 backdrop-blur-md shadow-xs transition-all cursor-pointer"
                  title="Acessibilidade"
                >
                  <Compass size={15} />
                </button>

                {/* User Profile / Login */}
                {isLoggedIn ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 backdrop-blur-md shadow-xs cursor-pointer transition-all"
                    >
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold text-white block leading-none">{userProfile.firstName}</span>
                        <span className="text-[9px] text-[#00c7fc] font-semibold block leading-none mt-0.5">
                          {isMasterAdmin ? 'ADMIN' : 'ALUNO'}
                        </span>
                      </div>
                      <img 
                        src={userProfile.avatar} 
                        alt="Avatar" 
                        className="w-7 h-7 rounded-full object-cover border border-[#0071e3] shadow-xs"
                      />
                    </button>

                    {/* Profile Dropdown */}
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          transition={{ duration: 0.12 }}
                          style={{
                            backdropFilter: 'blur(28px) saturate(190%)',
                            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
                          }}
                          className="absolute right-0 top-11 w-52 z-50 overflow-hidden bg-[#16161a]/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] p-2 space-y-1"
                        >
                          <div className="px-3 py-2 border-b border-white/10">
                            <p className="text-xs font-bold text-white truncate">{userProfile.firstName} {userProfile.lastName}</p>
                            <p className="text-[11px] text-neutral-400 truncate">{userProfile.email}</p>
                          </div>
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              setIsAccountModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-white/10 text-left font-medium transition-colors"
                          >
                            <User size={14} />
                            <span>Minha Conta</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left font-medium transition-colors"
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
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <LogIn size={13} />
                    <span>Entrar</span>
                  </button>
                )}
              </div>

              {/* Scroll Progress line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.06] pointer-events-none">
                <div 
                  className="h-full bg-gradient-to-r from-[#0071e3] via-[#00c7fc] to-[#30d158] transition-[width] duration-100 ease-out" 
                  style={{ width: `${scrollProgressPercent}%` }}
                />
              </div>
            </header>

            {/* LESSON CANVAS */}
            <div 
              className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24 relative select-text custom-scrollbar flex flex-col text-[#1d1d1f]" 
              id="lesson-view-container" 
              ref={lessonContainerRef}
            >
              <TextHighlighterTool lessonId={activeLessonId} containerRef={lessonContainerRef} />
              
              <div className="w-full lg:w-[85%] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
                
                {/* Lesson Header */}
                <div className="space-y-3 border-b border-neutral-200/80 pb-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] font-bold tracking-widest text-[#0071e3] uppercase">
                      {activeModule.badge ? `${activeModule.badge} · ` : ''}{activeModule.title}
                    </span>
                    
                    {progress.completedLessons.includes(activeLessonId) && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 size={12} /> Concluída
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight text-[#1d1d1f]">
                    {activeLesson.title}
                  </h1>

                  {/* Subtabs Selector (e.g. CST / ACES ou Métodos de Look) no TOPO do vídeo */}
                  {activeLesson.subtabs && activeLesson.subtabs.length > 0 && (
                    <div className="pt-2">
                      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-neutral-200/60 rounded-2xl w-fit border border-neutral-300/80 shadow-xs">
                        {activeLesson.subtabs.map(tab => {
                          const isSelected = (currentSubtab?.id || activeLesson.subtabs![0].id) === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveSubtabId(tab.id)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0071e3] text-white shadow-xs'
                                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/60'
                              }`}
                            >
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Lesson Body: Video on Top, Editorial Article Below */}
                <div className="space-y-8">
                  {/* Video Player on Top */}
                  <div className="w-full">
                    <VideoLessonPlayer
                      videoUrl={currentSubtab?.videoUrl || activeLesson.videoUrl}
                      title={currentSubtab ? `${activeLesson.title} — ${currentSubtab.label}` : activeLesson.title}
                    />
                  </div>

                  {/* Campo de Comentários da Aula */}
                  <LessonComments
                    lessonId={activeLessonId}
                    moduleId={activeModuleId}
                    userId={currentUserId || undefined}
                    userProfile={userProfile}
                    isAdmin={isMasterAdmin}
                  />

                  {/* Editorial Text Layout under the video */}
                  <Suspense fallback={<ToolFallback />}>
                    {activeLessonId === 'mod1-1' ? (
                      <IntroducaoDaVinciArticle />
                    ) : (
                      <GenericLessonArticle
                        moduleTitle={activeModule.title}
                        lesson={activeLesson}
                        currentSubtab={currentSubtab}
                      />
                    )}
                  </Suspense>

                  {/* Botão de Conclusão e Avanço no final da aula */}
                  <div className="flex justify-center pt-8 pb-4">
                    <button
                      onClick={() => handleCompleteAndNext(activeLessonId)}
                      className="bg-[#0071e3] hover:bg-[#147ce5] text-white rounded-full px-8 py-3.5 font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer select-none flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} />
                      <span>{progress.completedLessons.includes(activeLessonId) ? 'Próxima Aula' : 'Marcar como concluída'}</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </main>

      </div>

      {/* SEARCH MODAL */}
      {isSearchOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] p-4">
          <div className="bg-[#1c1c1e]/95 border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl max-h-[70vh] flex flex-col overflow-hidden">
            <div className="flex items-center gap-2.5 p-4 border-b border-white/10 shrink-0">
              <Search size={16} className="text-[#86868b]" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white text-xs focus:outline-none placeholder:text-[#86868b]"
                placeholder="Busque por tópicos, conceitos, equipamentos..."
                autoFocus
              />
              <button 
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-[#0071e3] cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#86868b]">
                  {searchQuery ? `Nenhum resultado para "${searchQuery}"` : 'Digite para buscar...'}
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map(({ module, lesson }) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectSearchResult(module.id, lesson.id)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 transition-colors flex justify-between items-center text-white"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-[#00c7fc] uppercase">{module.title}</span>
                        <h4 className="text-xs font-semibold">{lesson.title}</h4>
                      </div>
                      <ChevronRight size={13} className="text-neutral-500" />
                    </button>
                  ))}
                </div>
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
          setUserProfile((prev) => ({
            ...prev,
            ...updated,
          }));
        }}
      />

      {/* MODAL DE SESSÃO DERRUBADA POR OUTRO DISPOSITIVO */}
      <DeviceSessionKickedModal
        isOpen={kickedModalOpen}
        replacedByDevice={kickedDeviceName}
        replacedByLocation={kickedDeviceLocation}
        replacedAt={kickedAt}
        onReLogin={() => {
          setKickedModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* ACCESSIBILITY WIDGET */}
      {isAccessibilityOpen && (
        <AccessibilityWidget />
      )}

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
  );
}
export default MemberAreaApp;
