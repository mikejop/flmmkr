'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, ChevronRight, ChevronDown, ChevronLeft,
  CheckCircle2, Lock, PanelLeftClose, PanelLeft, X, Search, Menu,
  BookOpen, Camera, Sun, SunMedium, Lamp, Contrast, Users, Wand2,
  Palette, Plus, User, LogIn, LogOut, Copy, Star, Compass
} from 'lucide-react';
import { modulesData } from '@/data/data';
import { UserProgress, CourseModule, ModuleId, Subtopic } from '@/types/course';
import { TextHighlighterTool } from '@/components/TextHighlighterTool';
import { fetchReadingState, saveReadingState } from '@/lib/readingStateService';
import { AccessibilityWidget } from '@/components/AccessibilityWidget';
import { LoginModal } from '@/components/LoginModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { supabase } from '@/lib/supabase';
import { getMediaUrl } from '@/lib/storage';
import { MemberPreloader } from '@/components/MemberPreloader';

// Lazy load heavy interactive tools and articles for instant initial render and 0 lag
const EquipamentosLessonArticle = lazy(() => import('@/components/EquipamentosLessonArticle'));
const InteractiveIdeationTheory = lazy(() => import('@/components/InteractiveIdeationTheory'));
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
    case 'mod0': return <Camera size={size} className={colorClass} />;
    case 'mod1': return <Sun size={size} className={colorClass} />;
    case 'mod2':
    case 'mod3': return <SunMedium size={size} className={colorClass} />;
    case 'mod4': return <Lamp size={size} className={colorClass} />;
    case 'mod5': return <Palette size={size} className={colorClass} />;
    case 'mod6': return <Contrast size={size} className={colorClass} />;
    case 'mod7': return <Users size={size} className={colorClass} />;
    case 'mod8': return <Wand2 size={size} className={colorClass} />;
    default: return <Folder size={size} className={colorClass} />;
  }
};

const getModuleName = (title: string | undefined): string => {
  if (!title) return '';
  return title
    .replace(/^MÓDULO\s+\d+:\s*/i, '')
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
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>('mod0');
  const [activeLessonId, setActiveLessonId] = useState<string>('mod0-1');
  const [activeTab, setActiveTab] = useState<'teoria' | 'pratica' | 'desafio' | 'checklist'>('teoria');
  
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

  const [expandedEmenta, setExpandedEmenta] = useState<Record<string, boolean>>({
    mod0: true
  });

  // Current selected lesson and module (memoized for instant access)
  const activeModule = useMemo(() => {
    return modulesData.find(m => m.id === activeModuleId) || modulesData[0];
  }, [activeModuleId]);

  const activeLesson = useMemo(() => {
    return activeModule.subtopics.find(s => s.id === activeLessonId) || activeModule.subtopics[0];
  }, [activeModule, activeLessonId]);

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

          setUserProfile({
            firstName: nameParts[0] || 'Aluno',
            lastName: nameParts.slice(1).join(' ') || '',
            email: user.email || '',
            phone: prof?.phone || user.user_metadata?.phone || '',
            avatar: getMediaUrl('banners/hero_01.webp'),
            isAdmin
          });
        }
      } catch (err) {
        console.warn('Erro auth:', err);
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
      }
    });

    fetchReadingState().then(state => {
      if (state && state.lastLessonId) {
        setActiveModuleId(state.lastModuleId);
        setActiveLessonId(state.lastLessonId);
        if (state.lastTab) setActiveTab(state.lastTab);
        setExpandedEmenta(prev => ({ ...prev, [state.lastModuleId]: true }));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Save progress helper
  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    setIsLoggedIn(false);
    setIsPaidUser(false);
    setIsMasterAdmin(false);
    setIsProfileMenuOpen(false);
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
        setExpandedEmenta(prev => ({ ...prev, [nextMod.id]: true }));
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
        setExpandedEmenta(prev => ({ ...prev, [prevMod.id]: true }));
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
    setExpandedEmenta(prev => ({ ...prev, [modId]: true }));
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

  return (
    <div className="relative w-screen h-screen bg-[#0a0a0c] text-[#f5f5f7] flex items-center justify-center overflow-hidden font-sans select-none will-change-transform">
      {/* Brand Preloader exclusivo da Área de Membros */}
      <MemberPreloader />
      
      {/* Background Sutil com aceleração por GPU */}
      <div className="hidden md:block absolute inset-0 z-0 overflow-hidden pointer-events-none transform-gpu">
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-[#0d0e12] to-[#14151b] opacity-90" />
        <div className="absolute inset-0 bg-radial-gradient from-blue-900/10 via-transparent to-transparent" />
      </div>

      {/* FINDER WINDOW CONTAINER (Sem 'layout' prop pesada para 120fps fluidos) */}
      <div 
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
        className={`w-full h-full ${
          isMaximized 
            ? 'md:w-full md:h-full rounded-none border-none' 
            : 'md:w-[94vw] md:h-[94vh] rounded-[24px] border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]'
        } bg-[#121214]/90 flex flex-col md:flex-row overflow-hidden relative z-10 transition-all duration-300 ease-out`} 
        id="finder-window"
      >
          
          {/* SIDEBAR */}
          <aside className={`${isSidebarExpanded ? 'w-60' : 'w-16'} bg-[#141416]/70 border-r border-white/10 flex flex-col shrink-0 select-none transition-all duration-200 relative will-change-[width]`} id="window-sidebar">
            
            {/* Sidebar Header: Traffic Lights & Collapse Button */}
            <div className={`h-14 border-b border-white/10 flex items-center ${isSidebarExpanded ? 'px-3 justify-between' : 'px-0 justify-center'} select-none shrink-0 relative z-10 gap-1`}>
              
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
                
                {/* Course Overview Item */}
                <button 
                  onClick={() => {
                    setActiveLessonId('mod0-1');
                    setActiveModuleId('mod0');
                  }}
                  className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between px-3' : 'justify-center px-0'} py-2 rounded-[10px] text-left text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    activeLessonId === 'mod0-1' 
                      ? 'bg-white/15 text-white border border-white/20' 
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                  title={!isSidebarExpanded ? "Visão Geral" : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={15} className={activeLessonId === 'mod0-1' ? 'text-[#00c7fc]' : 'text-neutral-400'} />
                    {isSidebarExpanded && <span>Visão Geral</span>}
                  </div>
                </button>

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
                            setExpandedEmenta(prev => ({ ...prev, [mod.id]: !prev[mod.id] }));
                          }}
                          className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between px-3' : 'justify-center px-0'} py-2 rounded-[10px] text-xs transition-all duration-150 hover:scale-[1.02] text-left cursor-pointer ${
                            isCurrent 
                              ? 'bg-white/15 text-white border border-white/20 shadow-sm font-semibold' 
                              : 'text-neutral-300 hover:text-white hover:bg-white/5'
                          }`}
                          title={!isSidebarExpanded ? getModuleName(mod.title) : undefined}
                        >
                          <div className={`flex items-center ${isSidebarExpanded ? 'gap-2.5 truncate' : 'justify-center w-full'}`}>
                            {getModuleIcon(mod.id, isCurrent)}
                            {isSidebarExpanded && (
                              <span className="truncate text-xs">{getModuleName(mod.title)}</span>
                            )}
                          </div>

                          {isSidebarExpanded && (
                            <div className="shrink-0 flex items-center gap-1">
                              {isLockedModule ? (
                                <Lock size={11} className="text-neutral-400 shrink-0" />
                              ) : (
                                <>
                                  {isAllCompleted && <CheckCircle2 size={11} className="text-[#30d158] shrink-0 mr-1" />}
                                  {expandedEmenta[mod.id] ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                </>
                              )}
                            </div>
                          )}
                        </button>

                        {/* Lesson Nest under Expanded Module */}
                        {isSidebarExpanded && expandedEmenta[mod.id] && (
                          <div className="pl-2 ml-3 border-l border-white/5 space-y-0.5 py-1">
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
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Collapsed Sidebar Hover Flyout Panel */}
            {!isSidebarExpanded && activeFlyoutModule && (
              <div 
                className="absolute left-[68px] z-50 w-56 bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl space-y-1"
                style={{ top: '70px' }}
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
                    className="w-full text-left px-2 py-1 rounded text-[11px] text-neutral-300 hover:text-white hover:bg-white/10 flex justify-between items-center"
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
            
            {/* Toolbar */}
            <header className="h-14 bg-transparent border-b border-white/10 flex items-center px-6 justify-between select-none relative z-20 shrink-0">
              
              {/* Left Toolbar Info */}
              <div className="flex items-center gap-3">
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
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#f5f5f7] cursor-pointer"
                      title="Aula Anterior"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      onClick={handleNextLesson}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#f5f5f7] cursor-pointer"
                      title="Próxima Aula"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="border-l border-white/10 pl-3 hidden sm:block">
                    <span className="block text-xs font-bold tracking-tight text-white leading-none">FLMMKR Academy</span>
                  </div>
                </div>
              </div>

              {/* Center Progress Meter */}
              {isLoggedIn && (
                <div className="hidden lg:flex items-center gap-3 bg-neutral-900/40 px-3.5 py-1.5 rounded-full border border-white/5">
                  <span className="text-[10px] font-bold tracking-wider text-[#86868b] uppercase leading-none">Progresso</span>
                  <div className="w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#0071e3] to-[#00c7fc] transition-all duration-300"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#00c7fc] font-mono leading-none">{percentComplete}%</span>
                </div>
              )}

              {/* Right Search, Accessibility & Profile */}
              <div className="flex items-center gap-2.5">
                
                {/* Search Bar Trigger */}
                <div 
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden md:flex items-center bg-[#1d1d1f] border border-white/5 rounded-full px-3 py-1.5 w-28 cursor-pointer hover:bg-[#2c2c2e]/80 transition-colors"
                >
                  <Search size={11} className="text-[#86868b] mr-1.5" />
                  <span className="text-[11px] text-[#86868b] select-none">Buscar...</span>
                </div>

                {/* Accessibility Button */}
                <button
                  onClick={() => setIsAccessibilityOpen(true)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                  title="Acessibilidade"
                >
                  <Compass size={15} />
                </button>

                {/* User Profile / Login */}
                {isLoggedIn ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center gap-2 p-1 pl-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
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
                        className="w-7 h-7 rounded-full object-cover border border-[#0071e3]"
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
                          className="absolute right-0 top-11 w-52 z-50 overflow-hidden bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl p-2 space-y-1"
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
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-white/10 text-left font-medium"
                          >
                            <User size={14} />
                            <span>Minha Conta</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left font-medium"
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
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.05] pointer-events-none">
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
                      {activeModule.badge} · {activeModule.title}
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

                  {/* Navigation Tabs: Teoria, Na Prática, Desafio, Checklist */}
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-200/60">
                    <button
                      onClick={() => setActiveTab('teoria')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'teoria' 
                          ? 'bg-[#0071e3] text-white shadow-sm' 
                          : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                      }`}
                    >
                      Teoria
                    </button>
                    <button
                      onClick={() => setActiveTab('pratica')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'pratica' 
                          ? 'bg-[#0071e3] text-white shadow-sm' 
                          : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                      }`}
                    >
                      Na Prática (Simulador)
                    </button>
                    <button
                      onClick={() => setActiveTab('desafio')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'desafio' 
                          ? 'bg-[#0071e3] text-white shadow-sm' 
                          : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                      }`}
                    >
                      Exercício
                    </button>
                    <button
                      onClick={() => setActiveTab('checklist')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'checklist' 
                          ? 'bg-[#0071e3] text-white shadow-sm' 
                          : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                      }`}
                    >
                      Checklist
                    </button>
                  </div>
                </div>

                {/* Tab Content Rendering */}
                {activeTab === 'teoria' && (
                  <div className="space-y-6">
                    <Suspense fallback={<ToolFallback />}>
                      {activeLessonId === 'mod0-1' ? (
                        <EquipamentosLessonArticle />
                      ) : activeLessonId === 'mod1-1' ? (
                        <InteractiveIdeationTheory />
                      ) : (
                        <div className="bg-white rounded-[20px] border border-neutral-200/80 p-6 md:p-8 shadow-xs space-y-5">
                          <p className="text-neutral-800 text-[15px] leading-relaxed whitespace-pre-line font-normal">
                            {activeLesson.concept}
                          </p>

                          {activeLesson.steps && activeLesson.steps.length > 0 && (
                            <div className="space-y-2.5 pt-4 border-t border-neutral-100">
                              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Passos Recomendados</h4>
                              <div className="space-y-2">
                                {activeLesson.steps.map((step, idx) => (
                                  <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 leading-normal">
                                    <span className="w-4 h-4 rounded-full bg-[#0071e3]/10 text-[#0071e3] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {activeLesson.tips && activeLesson.tips.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-medium space-y-1">
                              <span className="font-bold flex items-center gap-1.5 text-amber-800 text-[11px]">
                                <Star size={13} className="text-amber-500 fill-amber-500" /> Dica de Ouro
                              </span>
                              <p>{activeLesson.tips.join(' ')}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Suspense>
                  </div>
                )}

                {activeTab === 'pratica' && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block">
                      FERRAMENTA INTERATIVA · {activeModule.title}
                    </span>
                    <div className="bg-white rounded-[20px] border border-neutral-200/80 p-5 shadow-xs overflow-hidden">
                      <Suspense fallback={<ToolFallback />}>
                        {renderInteractiveTool(activeModule.id)}
                      </Suspense>
                    </div>
                  </div>
                )}

                {activeTab === 'desafio' && (
                  <div className="space-y-5">
                    {activeModule.challenges.map(ch => (
                      <div key={ch.id} className="bg-white rounded-[20px] border border-neutral-200/80 p-6 shadow-xs space-y-5">
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-[#1d1d1f]">{ch.title}</h3>
                          <p className="text-xs text-neutral-500">{ch.description}</p>
                        </div>

                        <div className="space-y-3">
                          {ch.fields.map(field => {
                            const fieldKey = field.fieldId || field.key || 'field';
                            const val = progress.challengeDrafts[ch.id]?.[fieldKey] || '';
                            return (
                              <div key={fieldKey} className="space-y-1">
                                <label className="text-xs font-bold text-neutral-700 block">{field.label}</label>
                                {field.type === 'textarea' ? (
                                  <textarea
                                    value={val}
                                    onChange={(e) => handleChallengeFieldChange(ch.id, fieldKey, e.target.value)}
                                    placeholder={ch.placeholder}
                                    rows={3}
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#0071e3]"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={val}
                                    onChange={(e) => handleChallengeFieldChange(ch.id, fieldKey, e.target.value)}
                                    placeholder={ch.placeholder}
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#0071e3]"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleCopyChallenge(ch.id, ch.fields)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 transition-colors"
                          >
                            <Copy size={12} />
                            <span>{copiedChallengeId === ch.id ? 'Copiado!' : 'Copiar Respostas'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'checklist' && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-[20px] border border-neutral-200/80 p-6 shadow-xs space-y-3">
                      <h3 className="text-base font-bold text-[#1d1d1f]">Checklist Técnico</h3>
                      <div className="space-y-2">
                        {activeModule.checklistItems.map(item => {
                          const isDone = Boolean(progress.checklistStates[item.id]);
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleToggleChecklist(item.id)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${
                                isDone 
                                  ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900' 
                                  : 'bg-neutral-50 border-neutral-200/80 text-neutral-700 hover:bg-neutral-100'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <CheckCircle2 size={15} className={isDone ? 'text-emerald-500' : 'text-neutral-300'} />
                                <span className={`text-xs font-medium ${isDone ? 'line-through text-neutral-400' : ''}`}>
                                  {item.task}
                                </span>
                              </div>
                              <span className="text-[9px] uppercase font-bold text-neutral-400 bg-neutral-200/50 px-2 py-0.5 rounded-md">
                                {item.category}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Central Complete Lesson Button */}
                <div className="flex justify-center pt-6 pb-4">
                  <button
                    onClick={() => handleCompleteAndNext(activeLessonId)}
                    className="bg-[#0071e3] hover:bg-[#147ce5] text-white rounded-full px-7 py-3 font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer select-none"
                  >
                    Marcar como concluída & Próxima Aula
                  </button>
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
      {isAccountModalOpen && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAccountModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#1c1c1e] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">Minha Conta</h2>
                <p className="text-xs text-neutral-400">Dados cadastrais do aluno.</p>
              </div>
              <button onClick={() => setIsAccountModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Nome</label>
                  <input 
                    type="text" 
                    value={userProfile.firstName} 
                    onChange={(e) => setUserProfile({ ...userProfile, firstName: e.target.value })}
                    className="w-full bg-[#2c2c2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Sobrenome</label>
                  <input 
                    type="text" 
                    value={userProfile.lastName} 
                    onChange={(e) => setUserProfile({ ...userProfile, lastName: e.target.value })}
                    className="w-full bg-[#2c2c2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400">E-mail</label>
                <input 
                  type="email" 
                  value={userProfile.email} 
                  disabled
                  className="w-full bg-[#222224] border border-white/5 rounded-xl px-3 py-2 text-xs text-neutral-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400">Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  value={userProfile.phone} 
                  onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                  className="w-full bg-[#2c2c2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="px-5 py-2 bg-[#0071e3] text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

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
