'use client';

import React, { useState } from 'react';

/**
 * Quiz com pontuação de 0 a 100. A cada rodada sorteia as perguntas do banco e embaralha as opções;
 * cada pergunta vale 100 ÷ (número de perguntas) pontos e conta a primeira resposta. Ao final mostra a nota
 * e uma mensagem conforme a faixa. O sorteio acontece ao clicar em "Começar" (nunca na renderização),
 * para o servidor e o navegador mostrarem a mesma tela inicial.
 */

export interface QuizQuestion {
  situation: string;
  options: string[];
  /** Índice da opção correta em `options`. */
  answer: number;
  /** Mostrada depois de responder. */
  explain: string;
  /** Opcional: o que dizer quando o aluno escolhe cada opção errada (mesmo índice de `options`). */
  why?: (string | undefined)[];
}

interface RoundQuestion {
  q: QuizQuestion;
  options: { label: string; original: number }[];
}

const MAX_OPTIONS = 4;

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Mostra no máximo 4 opções: a certa e distratores sorteados (a posição final também é sorteada). */
function pickOptions(q: QuizQuestion): { label: string; original: number }[] {
  const all = q.options.map((label, original) => ({ label, original }));
  if (all.length <= MAX_OPTIONS) return all;
  const wrong = shuffle(all.filter((o) => o.original !== q.answer)).slice(0, MAX_OPTIONS - 1);
  return [all[q.answer], ...wrong];
}

function verdict(score: number): { title: string; text: string; tone: string } {
  if (score > 80) return { title: 'Você foi muito bem!', text: 'Já está quase no nível de um samurai do color grading.', tone: 'border-emerald-300 bg-emerald-50 text-emerald-900' };
  if (score >= 50) return { title: 'Está bom, mas dá para melhorar.', text: 'Você já domina boa parte do conteúdo, mas ainda precisa estudar mais. Releia as seções acima e tente de novo.', tone: 'border-sky-300 bg-sky-50 text-sky-900' };
  if (score >= 25) return { title: 'Você está no caminho.', text: 'Ainda há pontos importantes para fixar. Revise o conteúdo com calma e tente outra vez.', tone: 'border-amber-300 bg-amber-50 text-amber-900' };
  return { title: 'Vale rever o conteúdo com calma.', text: 'Este tema precisa de mais estudo, e o quanto antes. Releia o artigo desde o começo e refaça o quiz.', tone: 'border-orange-300 bg-orange-50 text-orange-900' };
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','));

const BTN = 'min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors duration-150 active:scale-[0.97]';
const BTN_OFF = 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100';

export function ScoredQuiz({ title, hint, pool, draw = 10 }: { title: string; hint: string; pool: QuizQuestion[]; draw?: number }) {
  const total = Math.min(draw, pool.length);
  const [round, setRound] = useState<RoundQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null); // posição na tela da opção escolhida
  const [hits, setHits] = useState(0);
  const [done, setDone] = useState(false);

  const start = () => {
    setRound(
      shuffle(pool).slice(0, total).map((q) => ({
        q,
        options: shuffle(pickOptions(q)),
      })),
    );
    setIndex(0);
    setPicked(null);
    setHits(0);
    setDone(false);
  };

  const perQuestion = 100 / total;
  const score = Math.round(hits * perQuestion);
  const current = round?.[index];
  const answered = picked !== null;

  const answer = (position: number) => {
    if (!current || answered) return;
    setPicked(position);
    if (current.options[position].original === current.q.answer) setHits((h) => h + 1);
  };

  const next = () => {
    if (index + 1 >= total) setDone(true);
    else { setIndex((i) => i + 1); setPicked(null); }
  };

  return (
    <section aria-label={title} className="space-y-5 rounded-2xl border border-[#0071e3]/30 bg-[#0071e3]/[0.04] p-5 font-sans sm:p-6">
      <header className="space-y-1">
        <h5 className="text-lg font-bold text-neutral-900">{title}</h5>
        <p className="max-w-3xl text-sm text-neutral-600">{hint}</p>
      </header>

      {!round && (
        <div className="space-y-4">
          <p className="max-w-3xl font-serif text-[16px] leading-snug text-neutral-800">
            São {total} perguntas sorteadas a cada rodada. Cada uma vale {fmt(perQuestion)} pontos, e a nota final vai de 0 a 100.
          </p>
          <button type="button" onClick={start} className={`${BTN} border-[#0071e3] bg-[#0071e3] text-white hover:bg-[#0062c4]`}>
            Começar
          </button>
        </div>
      )}

      {round && !done && current && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-neutral-600">Pergunta {index + 1} de {total}</p>
          <p className="max-w-3xl font-serif text-[17px] leading-snug text-neutral-900">{current.q.situation}</p>

          <div role="group" aria-label="Opções" className="flex flex-wrap gap-2">
            {current.options.map((opt, position) => {
              const isCorrect = opt.original === current.q.answer;
              const isPicked = picked === position;
              const style = !answered
                ? BTN_OFF
                : isCorrect
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : isPicked
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-neutral-200 bg-white text-neutral-400';
              return (
                <button key={opt.label} type="button" disabled={answered} aria-pressed={isPicked} onClick={() => answer(position)} className={`${BTN} ${style}`}>
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div role="status" aria-live="polite">
            {answered && (
              <p className={`max-w-3xl rounded-xl p-3 font-serif text-[16px] leading-snug ${current.options[picked].original === current.q.answer ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-900'}`}>
                {current.options[picked].original === current.q.answer ? (
                  <><strong className="font-sans">Isso mesmo.</strong> {current.q.explain}</>
                ) : (
                  <>
                    <strong className="font-sans">Não foi dessa vez.</strong>{' '}
                    {current.q.why?.[current.options[picked].original] ?? ''} A resposta certa era <strong className="font-sans">{current.q.options[current.q.answer]}</strong>. {current.q.explain}
                  </>
                )}
              </p>
            )}
          </div>

          {answered && (
            <button type="button" onClick={next} className={`${BTN} ${BTN_OFF}`}>
              {index + 1 >= total ? 'Ver minha nota' : 'Próxima pergunta'}
            </button>
          )}
        </div>
      )}

      {round && done && (() => {
        const v = verdict(score);
        return (
          <div className="space-y-4" role="status" aria-live="polite">
            <p className="text-sm font-semibold text-neutral-600">Você acertou {hits} de {total}</p>
            <p className="font-sans text-5xl font-black text-neutral-900">
              {score}<span className="text-2xl font-bold text-neutral-500"> / 100</span>
            </p>
            <div className={`max-w-3xl space-y-1 rounded-xl border p-4 ${v.tone}`}>
              <p className="font-sans text-base font-bold">{v.title}</p>
              <p className="font-serif text-[16px] leading-snug">{v.text}</p>
            </div>
            <button type="button" onClick={start} className={`${BTN} ${BTN_OFF}`}>
              Refazer com novas perguntas
            </button>
          </div>
        );
      })()}
    </section>
  );
}
