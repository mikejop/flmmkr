import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, Type, MoveVertical, Contrast, RefreshCw, X, 
  Check, ZoomIn, ZoomOut, AlignLeft, BookOpen, Layers
} from 'lucide-react';

interface AccessibilityPrefs {
  fontScale: number; // 100, 110, 120, 130, 140, 150 (%)
  useDyslexiaFont: boolean;
  expandedSpacing: boolean;
  themeMode: 'default' | 'offwhite' | 'highcontrast';
  readingGuide: boolean;
}

const DEFAULT_PREFS: AccessibilityPrefs = {
  fontScale: 100,
  useDyslexiaFont: false,
  expandedSpacing: false,
  themeMode: 'default',
  readingGuide: false,
};

const STORAGE_KEY = 'youtuber_pro_a11y_prefs';

export const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const guideRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoCloseTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startAutoCloseTimer = () => {
    clearAutoCloseTimer();
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 5000);
  };

  useEffect(() => {
    if (isOpen) {
      startAutoCloseTimer();
    } else {
      clearAutoCloseTimer();
    }
    return () => clearAutoCloseTimer();
  }, [isOpen]);

  const [prefs, setPrefs] = useState<AccessibilityPrefs>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error reading accessibility prefs:', e);
    }
    return DEFAULT_PREFS;
  });

  // Apply preferences to DOM document root and body
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.error('Error saving accessibility prefs:', e);
    }

    const root = document.documentElement;
    const body = document.body;

    // Font scaling scoped to lesson content area (does not affect side menu)
    const scale = prefs.fontScale / 100;
    root.style.setProperty('--lesson-zoom-scale', `${scale}`);
    root.style.setProperty('--lesson-font-scale', `${scale}`);
    window.dispatchEvent(new CustomEvent('youtuber_pro_zoom_update', { detail: prefs.fontScale }));

    // Dyslexia font toggle
    if (prefs.useDyslexiaFont) {
      body.classList.add('a11y-dyslexia-font');
    } else {
      body.classList.remove('a11y-dyslexia-font');
    }

    // Spacing toggle
    if (prefs.expandedSpacing) {
      body.classList.add('a11y-expanded-spacing');
    } else {
      body.classList.remove('a11y-expanded-spacing');
    }

    // Theme mode
    body.classList.remove('a11y-theme-offwhite', 'a11y-theme-highcontrast');
    if (prefs.themeMode === 'offwhite') {
      body.classList.add('a11y-theme-offwhite');
    } else if (prefs.themeMode === 'highcontrast') {
      body.classList.add('a11y-theme-highcontrast');
    }
  }, [prefs]);

  // Track mouse position for Reading Guide line with 0ms lag / 120fps hardware acceleration
  useEffect(() => {
    if (!prefs.readingGuide) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const clientY = e.clientY;
      rafId = requestAnimationFrame(() => {
        if (guideRef.current) {
          guideRef.current.style.transform = `translate3d(0, ${clientY - 20}px, 0)`;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [prefs.readingGuide]);

  const updatePref = <K extends keyof AccessibilityPrefs>(key: K, value: AccessibilityPrefs[K]) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const resetPrefs = () => {
    setPrefs(DEFAULT_PREFS);
  };

  const increaseFont = () => {
    if (prefs.fontScale < 200) {
      updatePref('fontScale', prefs.fontScale + 10);
    }
  };

  const decreaseFont = () => {
    if (prefs.fontScale > 50) {
      updatePref('fontScale', prefs.fontScale - 10);
    }
  };

  return (
    <>
      {/* Floating Reading Guide Overlay Line - Hardware Accelerated GPU Direct DOM */}
      {prefs.readingGuide && (
        <div 
          ref={guideRef}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-none border-b-2 border-blue-500/80 bg-blue-500/10 shadow-[0_0_15px_rgba(0,113,227,0.3)] will-change-transform"
          style={{ 
            height: '40px',
            transform: 'translate3d(0, -100px, 0)'
          }}
          aria-hidden="true"
        />
      )}

      {/* Floating Accessibility Launcher Button (Right Side with Dyslexia 'A' Icon) */}
      <div 
        className="fixed bottom-6 right-6 z-50"
        onMouseEnter={clearAutoCloseTimer}
        onMouseLeave={() => {
          if (isOpen) startAutoCloseTimer();
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir Menu de Acessibilidade Cognitiva e Dislexia"
          aria-expanded={isOpen}
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-400"
          title="Acessibilidade & Leitura"
        >
          {/* Stylized Dyslexic 'A' Icon */}
          <span className="font-sans font-black text-xl leading-none select-none tracking-tighter transition-transform group-hover:scale-110">
            A
          </span>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
          </span>
        </button>

        {/* Accessibility Control Panel Popover */}
        {isOpen && (
          <div 
            role="dialog"
            aria-label="Painel de Acessibilidade e Leitura"
            className="absolute bottom-16 right-0 w-80 sm:w-96 p-5 rounded-2xl bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/10 shadow-2xl text-white z-50 animate-fade-in"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <Type size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-base text-white">Acessibilidade & Leitura</h2>
                  <p className="text-xs text-gray-400">Ajustes para dislexia e foco</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Fechar menu de acessibilidade"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Font Size Scaling Controls */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-300 flex items-center gap-1.5">
                    <Type size={16} className="text-blue-400" /> Tamanho da Fonte
                  </span>
                  <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                    {prefs.fontScale}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={decreaseFont}
                    disabled={prefs.fontScale <= 50}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-white/10"
                    aria-label="Diminuir tamanho da fonte"
                  >
                    <ZoomOut size={16} /> Diminuir
                  </button>
                  <button
                    onClick={increaseFont}
                    disabled={prefs.fontScale >= 200}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-white/10"
                    aria-label="Aumentar tamanho da fonte"
                  >
                    <ZoomIn size={16} /> Aumentar
                  </button>
                </div>
              </div>

              {/* Dyslexia Font Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-medium text-white flex items-center gap-1.5">
                    <BookOpen size={16} className="text-emerald-400" /> Fonte para Dislexia
                  </div>
                  <div className="text-xs text-gray-400">Usa fonte Lexend com glifos amigáveis</div>
                </div>
                <button
                  onClick={() => updatePref('useDyslexiaFont', !prefs.useDyslexiaFont)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    prefs.useDyslexiaFont ? 'bg-emerald-500 justify-end' : 'bg-gray-600 justify-start'
                  }`}
                  aria-label="Alternar fonte para dislexia"
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                </button>
              </div>

              {/* Spacing Controls */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-medium text-white flex items-center gap-1.5">
                    <MoveVertical size={16} className="text-indigo-400" /> Espaçamento Expandido
                  </div>
                  <div className="text-xs text-gray-400">Aumenta entre linhas, palavras e letras</div>
                </div>
                <button
                  onClick={() => updatePref('expandedSpacing', !prefs.expandedSpacing)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    prefs.expandedSpacing ? 'bg-indigo-500 justify-end' : 'bg-gray-600 justify-start'
                  }`}
                  aria-label="Alternar espaçamento expandido"
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                </button>
              </div>

              {/* Reading Guide Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-medium text-white flex items-center gap-1.5">
                    <AlignLeft size={16} className="text-amber-400" /> Guia de Leitura
                  </div>
                  <div className="text-xs text-gray-400">Linha focalizadora que segue o cursor</div>
                </div>
                <button
                  onClick={() => updatePref('readingGuide', !prefs.readingGuide)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    prefs.readingGuide ? 'bg-amber-500 justify-end' : 'bg-gray-600 justify-start'
                  }`}
                  aria-label="Alternar guia de leitura visual"
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                </button>
              </div>

              {/* Contrast / Theme Selector */}
              <div>
                <span className="font-medium text-gray-300 flex items-center gap-1.5 mb-2">
                  <Contrast size={16} className="text-purple-400" /> Modo de Contraste & Cor
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => updatePref('themeMode', 'default')}
                    className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                      prefs.themeMode === 'default'
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    Padrão
                  </button>
                  <button
                    onClick={() => updatePref('themeMode', 'offwhite')}
                    className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                      prefs.themeMode === 'offwhite'
                        ? 'bg-amber-100 border-amber-400 text-gray-900 shadow-md'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    Off-White (#FAFAF8)
                  </button>
                  <button
                    onClick={() => updatePref('themeMode', 'highcontrast')}
                    className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                      prefs.themeMode === 'highcontrast'
                        ? 'bg-yellow-400 border-yellow-300 text-black font-bold shadow-md'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    Alto Contraste
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={resetPrefs}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RefreshCw size={14} /> Restaurar Padrões
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
