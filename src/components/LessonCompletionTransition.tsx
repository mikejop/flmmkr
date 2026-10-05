'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ArrowRight, RotateCcw, Sparkles, Trophy, ShieldAlert, Headphones } from 'lucide-react';

interface NextLessonInfo {
  id: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
}

interface LessonCompletionTransitionProps {
  completedLessonTitle: string;
  nextLesson: NextLessonInfo | null;
  onProceed: () => void;
  onStay: () => void;
  studentName?: string;
  disableAutoAdvance?: boolean;
  backgroundReason?: 'background_mode' | 'window_unfocused' | null;
}

const CONFETTI_COLORS = [
  '#0071e3', // FLMMKR Blue
  '#00c7fc', // Cyan
  '#ffcc00', // Gold
  '#34c759', // Green
  '#ff2d55', // Red / Magenta
  '#af52de', // Purple
  '#ff9500', // Amber
];

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  wobble: number;
  vWobble: number;
  isCircle: boolean;
}

export default function LessonCompletionTransition({
  completedLessonTitle,
  nextLesson,
  onProceed,
  onStay,
  studentName = 'Aluno',
  disableAutoAdvance = false,
  backgroundReason = null,
}: LessonCompletionTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [secondsLeft, setSecondsLeft] = useState(4);

  // 1. ANIMAÇÃO DE CONFETES COLORIDOS CAINDO (HTML5 Canvas Nativo 60FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Criar 140 partículas de confete
    const particleCount = 140;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * -height - 20, // começa acima da tela para cair suavemente
        w: Math.random() * 8 + 6,
        h: Math.random() * 12 + 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        vx: (Math.random() - 0.5) * 2.5,
        vy: Math.random() * 3 + 2.5, // velocidade de queda
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 8,
        wobble: Math.random() * 10,
        vWobble: Math.random() * 0.1 + 0.05,
        isCircle: Math.random() > 0.6,
      });
    }

    let isRunning = true;
    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.wobble) * 1.5;
        p.wobble += p.vWobble;
        p.rotation += p.vRot;

        // Se sair por baixo, reinicia no topo
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        ctx.fillStyle = p.color;
        if (p.isCircle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 2. CONTAGEM REGRESSIVA PARA TRANSIÇÃO AUTOMÁTICA
  // Se disableAutoAdvance for true, ou se o aluno NÃO estiver na página (document.hidden / blur), o avanço é bloqueado!
  useEffect(() => {
    if (!nextLesson || disableAutoAdvance) return;

    const checkIsActive = () => {
      if (typeof document === 'undefined') return true;
      return !document.hidden && document.hasFocus();
    };

    if (secondsLeft <= 0) {
      if (checkIsActive()) {
        onProceed();
      }
      return;
    }

    const timer = setInterval(() => {
      // Só decrementa se o aluno estiver efetivamente com a página aberta e com foco
      if (checkIsActive()) {
        setSecondsLeft((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, nextLesson, onProceed, disableAutoAdvance]);

  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 select-none overflow-hidden animate-fadeIn">
      {/* CANVAS DE CONFETES COLORIDOS CAINDO */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* CONTEÚDO DA TRANSIÇÃO (TELA BRANCA COM ALTO CONTRASTE) */}
      <div className="relative z-20 max-w-lg w-full text-center space-y-6 animate-scaleUp">
        {/* ÍCONE DE TROFÉU / CELEBRAÇÃO */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#0071e3] to-[#00c7fc] p-0.5 shadow-2xl shadow-blue-500/30 flex items-center justify-center animate-bounce">
          <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-[#0071e3]" />
          </div>
        </div>

        {/* MENSAGEM DE PARABÉNS PERSONALIZADA */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 size={13} />
            <span>Aula Finalizada com Sucesso!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Parabéns, {studentName}!
          </h2>

          <p className="text-sm text-neutral-600 font-medium max-w-md mx-auto line-clamp-2">
            {completedLessonTitle}
          </p>
        </div>

        {/* AVISO DE SEGUNDO PLANO / FOCO OU CONTAGEM REGRESSIVA */}
        {nextLesson ? (
          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 shadow-sm text-left space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-[#0071e3]">
                {disableAutoAdvance ? 'Avanço Automático Pausado' : `Próxima Aula (${secondsLeft}s)`}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                {nextLesson.moduleTitle}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
              {nextLesson.title}
            </h3>

            {disableAutoAdvance ? (
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5">
                <Headphones size={16} className="text-[#0071e3] shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-700 leading-relaxed">
                  <strong>{studentName}</strong>, como a aula terminou em segundo plano ou fora da tela, o avanço automático foi desativado para garantir que você não perca o início da próxima aula. Clique abaixo quando estiver pronto.
                </p>
              </div>
            ) : (
              /* BARRA DE PROGRESSO DE TEMPO */
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0071e3] to-[#00c7fc] transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${((4 - secondsLeft) / 4) * 100}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-2">
            <Sparkles className="w-6 h-6 text-[#0071e3] mx-auto" />
            <h3 className="text-lg font-bold text-neutral-900">
              {studentName}, você concluiu todos os módulos do curso!
            </h3>
            <p className="text-xs text-neutral-600">
              Parabéns por essa conquista extraordinária no Color Master.
            </p>
          </div>
        )}

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {nextLesson && (
            <button
              type="button"
              onClick={onProceed}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Ir para a próxima aula agora</span>
              <ArrowRight size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={onStay}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm transition-all cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Rever esta aula</span>
          </button>
        </div>
      </div>
    </div>
  );
}
