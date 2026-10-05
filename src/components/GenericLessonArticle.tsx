'use client';

import React from 'react';
import { Subtopic, LessonSubtab } from '../types/course';
import { CheckCircle2, Sparkles, Lightbulb } from 'lucide-react';
import {
  EditorialSection,
  TwoColumnText,
  ImageAndText,
  EditorialQuote,
} from './EditorialLayout';

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

  // Dividir o texto do conceito em duas partes para o layout de duas colunas
  const conceptText = activeContent.concept || '';
  const paragraphs = conceptText.split('\n\n').filter(p => p.trim().length > 0);
  const midPoint = Math.ceil(paragraphs.length / 2);
  const leftParagraphs = paragraphs.slice(0, midPoint);
  const rightParagraphs = paragraphs.slice(midPoint);

  return (
    <article className="w-full text-[#111111] font-serif select-text leading-relaxed relative space-y-10">
      
      {/* SEÇÃO 1: Fundamento & Conceito Editorial em 2 Colunas */}
      <EditorialSection
        kickerLeft={moduleTitle.toUpperCase()}
        kickerRight={currentSubtab ? currentSubtab.label.toUpperCase() : 'CONCEITO CENTRAL'}
        title={currentSubtab ? `${lesson.title}: ${currentSubtab.label}` : lesson.title}
        subtitle="FUNDAMENTOS TEÓRICOS E VISÃO DO COLORISTA"
      >
        <TwoColumnText
          left={
            <>
              {leftParagraphs.map((p, idx) => (
                <p key={idx} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
              {leftParagraphs.length === 0 && (
                <p className="whitespace-pre-line">{conceptText}</p>
              )}
            </>
          }
          right={
            <>
              {rightParagraphs.map((p, idx) => (
                <p key={idx} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
              {tips.length > 0 && (
                <EditorialQuote
                  quote={tips[0]}
                  author="Diretriz de Color Grading"
                />
              )}
            </>
          }
        />
      </EditorialSection>

      {/* SEÇÃO 2: Foto Editorial e Passo a Passo Recomendado */}
      {steps.length > 0 && (
        <EditorialSection
          kickerLeft="MÉTODO PRÁTICO"
          kickerRight="APLICAÇÃO NO DAVINCI"
          title="FLUXO DE TRABALHO E EXECUÇÃO"
          subtitle="PASSO A PASSO SEQUENCIAL DE COLOR GRADING"
        >
          <ImageAndText
            imageAlt={`Fluxo Prático: ${lesson.title}`}
            caption={`Aplicação prática de ${lesson.title} no DaVinci Resolve`}
            imagePosition="left"
          >
            <div className="space-y-4 font-sans">
              <h4 className="font-sans font-bold text-sm text-neutral-900 uppercase tracking-wider mb-2">
                Sequência de Ajustes
              </h4>
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/80 transition-colors shadow-2xs"
                >
                  <span className="w-6 h-6 rounded-full bg-[#0071e3] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {idx + 1}
                  </span>
                  <p className="font-serif text-base text-neutral-800 leading-snug pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </ImageAndText>

          {tips.length > 1 && (
            <div className="mt-6 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-900 text-sm font-sans flex items-start gap-3">
              <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-800 font-bold mb-1 uppercase tracking-wider text-xs">
                  Recomendação do Colorista
                </strong>
                <p className="leading-relaxed font-serif text-base">{tips.slice(1).join(' ')}</p>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-neutral-200/80 flex items-center justify-between text-xs font-sans text-neutral-500">
            <span>COLOR MASTER® · DA VINCI RESOLVE</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <CheckCircle2 size={14} /> Aula Concluível
            </span>
          </div>
        </EditorialSection>
      )}

    </article>
  );
}
