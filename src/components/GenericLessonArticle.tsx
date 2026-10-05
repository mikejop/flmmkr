import React from 'react';
import { Subtopic, LessonSubtab } from '../types/course';
import { CheckCircle2, Sparkles, Lightbulb } from 'lucide-react';

interface GenericLessonArticleProps {
  moduleTitle: string;
  lesson: Subtopic;
  currentSubtab?: LessonSubtab | null;
}

export default function GenericLessonArticle({
  moduleTitle,
  lesson,
  currentSubtab
}: GenericLessonArticleProps) {
  const activeContent = currentSubtab || lesson;
  const steps = activeContent.steps || [];
  const tips = activeContent.tips || [];

  return (
    <article className="w-full text-[#111111] font-serif select-text leading-relaxed relative space-y-8">
      {/* SEÇÃO 1: Fundamento & Conceito */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>{moduleTitle.toUpperCase()}</span>
          <span>{currentSubtab ? currentSubtab.label.toUpperCase() : 'CONCEITO CENTRAL'}</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          {currentSubtab ? `${lesson.title}: ${currentSubtab.label}` : lesson.title}
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p className="whitespace-pre-line">
            {activeContent.concept}
          </p>
        </div>

        {/* Citação Editorial / Highlight */}
        {tips.length > 0 && (
          <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-[#0071e3] font-sans font-bold text-xs uppercase tracking-wider">
              <Lightbulb size={14} /> Dica de Ouro
            </div>
            <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
              “{tips[0]}”
            </p>
          </blockquote>
        )}
      </section>

      {/* SEÇÃO 2: Passo a Passo & Aplicação Técnica */}
      {steps.length > 0 && (
        <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
          <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
            <span>MÉTODO PRÁTICO</span>
            <span>DIRETRIZES TÉCNICAS</span>
          </div>

          <h3 className="font-sans font-black text-[24px] sm:text-[32px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
            FLUXO RECOMENDADO NO DAVINCI
          </h3>

          <div className="h-[2px] bg-[#0071e3] w-full my-6" />

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/80 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-[#0071e3] text-white font-sans font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {idx + 1}
                </span>
                <p className="font-serif text-base sm:text-lg text-neutral-800 leading-snug pt-0.5">
                  {step}
                </p>
              </div>
            ))}
          </div>

          {tips.length > 1 && (
            <div className="mt-8 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-900 text-sm font-sans flex items-start gap-3">
              <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-800 font-bold mb-1 uppercase tracking-wider text-xs">
                  Recomendação do Colorista
                </strong>
                <p className="leading-relaxed">{tips.slice(1).join(' ')}</p>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-neutral-200/80 flex items-center justify-between text-xs font-sans text-neutral-500">
            <span>COLOR MASTER® · DA VINCI RESOLVE</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <CheckCircle2 size={14} /> Aula Concluível
            </span>
          </div>
        </section>
      )}
    </article>
  );
}
