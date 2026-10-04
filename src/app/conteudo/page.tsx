'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Folder,
  FolderOpen,
  CheckCircle2,
  Circle,
  Play,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Layers,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  Search,
  Check,
  Camera,
  Sun,
  SunMedium,
  Lamp,
  Palette,
  Contrast,
  Users,
  Wand2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { modulesData } from '@/data/courseData';
import { CourseModule, Subtopic } from '@/types/course';
import { LoginModal } from '@/components/LoginModal';

const getModuleIcon = (id: string, isCurrent: boolean) => {
  const colorClass = isCurrent ? 'text-[#0071e3]' : 'text-zinc-400';
  const size = 18;
  switch (id) {
    case 'mod0':
      return <Camera size={size} className={colorClass} />;
    case 'mod1':
      return <Sun size={size} className={colorClass} />;
    case 'mod2':
    case 'mod3':
      return <SunMedium size={size} className={colorClass} />;
    case 'mod4':
      return <Lamp size={size} className={colorClass} />;
    case 'mod5':
      return <Palette size={size} className={colorClass} />;
    case 'mod6':
      return <Contrast size={size} className={colorClass} />;
    case 'mod7':
      return <Users size={size} className={colorClass} />;
    case 'mod8':
      return <Wand2 size={size} className={colorClass} />;
    default:
      return <Folder size={size} className={colorClass} />;
  }
};

export default function ConteudoPage() {
  const router = useRouter();
  const supabase = createClient();

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Course Navigation state
  const [selectedModule, setSelectedModule] = useState<CourseModule>(modulesData[0]);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic>(modulesData[0].subtopics[0]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Check Supabase Auth session & fetch profile
  useEffect(() => {
    async function loadAuth() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle();

          setProfile(prof);
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
      } finally {
        setAuthLoading(false);
      }
    }

    loadAuth();

    // Load progress from localStorage
    try {
      const saved = localStorage.getItem('flmmkr_completed_lessons');
      if (saved) setCompletedLessons(JSON.parse(saved));
    } catch (_) {}
  }, []);

  // Save progress
  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const updated = prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId];
      try {
        localStorage.setItem('flmmkr_completed_lessons', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Sign out handler
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/');
  };

  // Filter modules/lessons
  const filteredModules = modulesData.filter((mod) =>
    mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mod.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mod.subtopics.some((st) => st.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Total lessons count
  const allLessonsCount = modulesData.reduce((acc, m) => acc + m.subtopics.length, 0);
  const progressPercent = Math.round((completedLessons.length / (allLessonsCount || 1)) * 100);

  // Navigation Next/Prev
  const currentModuleIndex = modulesData.findIndex((m) => m.id === selectedModule.id);
  const currentSubtopicIndex = selectedModule.subtopics.findIndex((s) => s.id === selectedSubtopic.id);

  const goToNextLesson = () => {
    if (currentSubtopicIndex < selectedModule.subtopics.length - 1) {
      setSelectedSubtopic(selectedModule.subtopics[currentSubtopicIndex + 1]);
    } else if (currentModuleIndex < modulesData.length - 1) {
      const nextMod = modulesData[currentModuleIndex + 1];
      setSelectedModule(nextMod);
      setSelectedSubtopic(nextMod.subtopics[0]);
    }
  };

  const goToPrevLesson = () => {
    if (currentSubtopicIndex > 0) {
      setSelectedSubtopic(selectedModule.subtopics[currentSubtopicIndex - 1]);
    } else if (currentModuleIndex > 0) {
      const prevMod = modulesData[currentModuleIndex - 1];
      setSelectedModule(prevMod);
      setSelectedSubtopic(prevMod.subtopics[prevMod.subtopics.length - 1]);
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Aluno';
  const displayEmail = profile?.email || user?.email || '';

  return (
    <div className="min-h-screen bg-[#0E0E12] text-zinc-100 flex flex-col selection:bg-[#0071e3] selection:text-white">
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        redirectUrl="/conteudo"
      />

      {/* Top Glass Navbar */}
      <header
        className="sticky top-0 z-50 w-full border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between"
        style={{
          background: 'rgba(14,14,18,0.85)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)'
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80"
            aria-label="Abrir Menu de Aulas"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a href="/" className="font-semibold text-sm tracking-tight text-white hover:opacity-80 transition-opacity">
            FLMMKR
          </a>

          <span className="hidden sm:inline-block text-[11px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[#2997ff] font-semibold">
            ContentsPlace
          </span>
        </div>

        {/* User profile / status */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white">{displayName}</span>
                <span className="text-[11px] text-white/40">{displayEmail}</span>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-bold text-xs shadow-[0_2px_8px_rgba(0,113,227,0.5)]">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                title="Sair da conta"
                aria-label="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold transition-all active:scale-95 shadow-[0_2px_12px_rgba(0,113,227,0.4)] cursor-pointer"
              >
                Acessar Conta
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-80 lg:w-88 pt-16 lg:pt-0 bg-[#121217] border-r border-white/10 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          {/* Progress Overview Header */}
          <div className="p-4 sm:p-5 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">
                Progresso Geral
              </span>
              <span className="text-xs font-bold text-[#2997ff]">
                {progressPercent}% Concluído
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#0071e3] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-white/40">
              {completedLessons.length} de {allLessonsCount} aulas finalizadas
            </div>

            {/* Search Input */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar aulas ou tópicos..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#0071e3]"
              />
            </div>
          </div>

          {/* Module & Lessons List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredModules.map((mod, modIdx) => {
              const isCurrentMod = selectedModule.id === mod.id;
              const completedInMod = mod.subtopics.filter((st) => completedLessons.includes(st.id)).length;
              const isModCompleted = completedInMod === mod.subtopics.length;

              return (
                <div
                  key={mod.id}
                  className={`rounded-2xl border transition-all ${
                    isCurrentMod
                      ? 'bg-white/8 border-white/20'
                      : 'bg-white/2 border-white/5 hover:bg-white/4'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModule(mod);
                      setSelectedSubtopic(mod.subtopics[0]);
                      setSidebarOpen(false);
                    }}
                    className="w-full p-3.5 text-left flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-white/10">
                        {getModuleIcon(mod.id, isCurrentMod)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#2997ff]">
                            {mod.badge}
                          </span>
                          {isModCompleted && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white mt-0.5">
                          {mod.title}
                        </h4>
                        <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                          {mod.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Subtopics / Lessons under this module */}
                  {isCurrentMod && (
                    <div className="px-3 pb-3 pt-1 space-y-1 border-t border-white/5">
                      {mod.subtopics.map((st, stIdx) => {
                        const isCurrentSt = selectedSubtopic.id === st.id;
                        const isCompleted = completedLessons.includes(st.id);

                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              setSelectedSubtopic(st);
                              setSidebarOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                              isCurrentSt
                                ? 'bg-[#0071e3] text-white font-semibold shadow-sm'
                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span className="truncate pr-2">
                              {stIdx + 1}. {st.title}
                            </span>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLessonComplete(st.id);
                              }}
                              className="p-1 -m-1 hover:opacity-80"
                              title={isCompleted ? 'Desmarcar conclusão' : 'Marcar como concluída'}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrentSt ? 'text-white' : 'text-emerald-400'}`} />
                              ) : (
                                <Circle className={`w-3.5 h-3.5 ${isCurrentSt ? 'text-white/60' : 'text-white/20'}`} />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Lesson Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 max-w-4xl mx-auto w-full">
          {/* Breadcrumb & Module Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
              <span>{selectedModule.badge}</span>
              <span>/</span>
              <span>{selectedModule.title}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              {selectedSubtopic.title}
            </h1>
            <p className="text-sm text-white/60 mt-1">
              {selectedModule.subtitle}
            </p>
          </div>

          {/* Action Ribbon: Complete button & Next/Prev */}
          <div className="mb-8 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => toggleLessonComplete(selectedSubtopic.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                completedLessons.includes(selectedSubtopic.id)
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              {completedLessons.includes(selectedSubtopic.id) ? (
                <>
                  <Check className="w-4 h-4" /> Aula Concluída
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" /> Marcar como Concluída
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevLesson}
                disabled={currentModuleIndex === 0 && currentSubtopicIndex === 0}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-medium text-white flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </button>
              <button
                onClick={goToNextLesson}
                disabled={
                  currentModuleIndex === modulesData.length - 1 &&
                  currentSubtopicIndex === selectedModule.subtopics.length - 1
                }
                className="px-3 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-30 text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
              >
                Próxima <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Lesson Content Sections */}
          <div className="space-y-6">
            {/* 1. Conceito Central */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 shadow-lg">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#2997ff] font-semibold block mb-2">
                Conceito Fundamental
              </span>
              <p className="text-base sm:text-lg text-white/90 leading-relaxed font-normal">
                {selectedSubtopic.concept}
              </p>
            </div>

            {/* 2. Passo a Passo Prático de Aplicação */}
            {selectedSubtopic.steps && selectedSubtopic.steps.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#2997ff] font-semibold block mb-4">
                  Passo a Passo Prático no Set
                </span>
                <ol className="space-y-3">
                  {selectedSubtopic.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3.5 text-sm sm:text-base text-white/80">
                      <span className="w-6 h-6 rounded-full bg-[#0071e3]/20 border border-[#0071e3]/40 text-[#2997ff] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* 3. Dicas Profissionais de Set */}
            {selectedSubtopic.tips && selectedSubtopic.tips.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/10 border border-amber-500/25">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold block mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Dicas de Quem Vive de Imagem
                </span>
                <ul className="space-y-2.5">
                  {selectedSubtopic.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-amber-200/90 leading-relaxed">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bottom Next Lesson Navigation */}
            <div className="pt-8 flex justify-end">
              <button
                onClick={goToNextLesson}
                disabled={
                  currentModuleIndex === modulesData.length - 1 &&
                  currentSubtopicIndex === selectedModule.subtopics.length - 1
                }
                className="px-6 py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-40 text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_4px_16px_rgba(0,113,227,0.4)] active:scale-95 cursor-pointer"
              >
                <span>Avançar para Próxima Aula</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
