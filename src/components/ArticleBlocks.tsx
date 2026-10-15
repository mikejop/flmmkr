'use client';

import React from 'react';

/** Blocos de texto compartilhados pelos artigos das aulas (Introdução, Primárias...). */

export function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Assunto com barra azul e âncora própria (entra no sumário "Nesta página"). */
export function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div id={slugify(title)} className="scroll-mt-6 space-y-6 border-t border-neutral-200 pt-12 first:border-t-0 first:pt-0">
      <h4 className="flex items-center gap-3 font-sans text-[22px] font-black leading-tight tracking-tight text-neutral-900 sm:text-[26px]">
        <span aria-hidden="true" className="block h-8 w-1.5 shrink-0 rounded-full bg-[#0071e3]" />
        <span>{title}</span>
      </h4>
      {children}
    </div>
  );
}


export const PROSE = 'max-w-3xl space-y-3.5 font-serif text-[16px] sm:text-[17px] leading-[1.6] text-neutral-800';

export function Prose({ children }: { children: React.ReactNode }) {
  return <div className={PROSE}>{children}</div>;
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-l-4 border-[#0071e3] bg-[#f5f5f7] p-5">
      <p className="max-w-3xl font-serif text-[16px] leading-relaxed text-neutral-800">{children}</p>
    </div>
  );
}

/** Lista em blocos: "Rótulo: explicação" (rótulo em negrito). */
export function Bullets({ items, single = false, full = false }: { items: { label?: string; text: React.ReactNode }[]; single?: boolean; full?: boolean }) {
  return (
    <ul className={`grid gap-3 ${full ? '' : single ? 'max-w-3xl' : 'lg:grid-cols-2'}`}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-3.5 rounded-xl bg-[#f5f5f7] p-4 sm:p-5">
          <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0071e3]" />
          <p className="min-w-0 font-serif text-[16px] leading-snug text-neutral-800">
            {item.label && <strong className="font-sans font-bold text-neutral-900">{item.label} </strong>}
            {item.text}
          </p>
        </li>
      ))}
    </ul>
  );
}

/** Lista numerada, uma etapa embaixo da outra. */
export function NumberedSteps({ items, full = false }: { items: { title: string; text: string; action?: React.ReactNode }[]; full?: boolean }) {
  return (
    <ol className={`${full ? '' : 'max-w-3xl'} space-y-3`}>
      {items.map((item, i) => (
        <li key={item.title} className="flex items-start gap-3.5 rounded-xl bg-[#f5f5f7] p-4 sm:p-5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0071e3] font-sans text-sm font-bold text-white">
            {i + 1}
          </span>
          <div className="min-w-0 space-y-1">
            <h5 className="font-sans text-base font-bold text-neutral-900 sm:text-lg">{item.title}</h5>
            <p className="font-serif text-[16px] leading-snug text-neutral-800">{item.text}</p>
          </div>
          {item.action && <div className="ml-auto shrink-0 self-center">{item.action}</div>}
        </li>
      ))}
    </ol>
  );
}

/** Tabela simples e acessível (rola na horizontal em telas estreitas). */
export function DataTable({ caption, head, rows, minWidth = 560 }: { caption: string; head: string[]; rows: string[][]; minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full border-collapse text-left font-sans text-sm" style={{ minWidth }}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-[#f5f5f7] text-neutral-900">
            {head.map((h) => (
              <th key={h} scope="col" className="p-3 font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-t border-neutral-200 align-top">
              <th scope="row" className="p-3 font-semibold text-neutral-900">{row[0]}</th>
              {row.slice(1).map((cell, i) => (
                <td key={i} className="p-3 font-serif text-[15px] text-neutral-800">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


/** Cartão das ferramentas interativas. */
export function Interactive({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="space-y-5 rounded-2xl border border-[#0071e3]/30 bg-[#0071e3]/[0.04] p-5 font-sans sm:p-6">
      <header className="space-y-1">
        <h5 className="text-lg font-bold text-neutral-900">{title}</h5>
        <p className="max-w-3xl text-sm text-neutral-600">{hint}</p>
      </header>
      {children}
    </section>
  );
}
