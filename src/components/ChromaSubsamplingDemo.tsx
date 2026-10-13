'use client';

import { useState } from 'react';

const formats = {
  '4:2:0': {
    title: '4:2:0',
    summary: 'Uma amostra de cor compartilhada por cada bloco de 2 × 2 pixels.',
    chroma: [
      ['#e4c900', '#e4c900', '#7565dc', '#7565dc'],
      ['#e4c900', '#e4c900', '#7565dc', '#7565dc'],
    ],
  },
  '4:2:2': {
    title: '4:2:2',
    summary: 'Uma amostra de cor para cada par horizontal de pixels; a resolução vertical é mantida.',
    chroma: [
      ['#e4c900', '#e4c900', '#7565dc', '#7565dc'],
      ['#d10022', '#d10022', '#ed9bd2', '#ed9bd2'],
    ],
  },
  '4:4:4': {
    title: '4:4:4',
    summary: 'Cada pixel tem sua própria amostra de cor, sem redução da resolução cromática.',
    chroma: [
      ['#e4c900', '#1683e8', '#8e75db', '#920067'],
      ['#d10022', '#088b0b', '#ed9bd2', '#0075d8'],
    ],
  },
} as const;

type ChromaFormat = keyof typeof formats;
const order: ChromaFormat[] = ['4:2:0', '4:2:2', '4:4:4'];
const sampleLabels: Record<ChromaFormat, { values: string[]; ratio: string }> = {
  '4:2:0': { values: ['1', '2'], ratio: '2:0' },
  '4:2:2': { values: ['1', '2', '1', '2'], ratio: '2:2' },
  '4:4:4': { values: ['1', '2', '3', '4', '1', '2', '3', '4'], ratio: '4:4' },
};

const luma = [
  ['#686868', '#cecece', '#a2a2a2', '#d2d2d2'],
  ['#a9a9a9', '#858585', '#cdcdcd', '#555555'],
];

function Matrix({ values, label }: { values: readonly (readonly string[])[]; label: string }) {
  return (
    <div role="img" aria-label={label} className="grid aspect-[2/1] grid-cols-4 overflow-hidden border border-neutral-300">
      {values.flatMap((row, y) => row.map((color, x) => <div key={`${x}-${y}`} style={{ backgroundColor: color }} className="border-r border-b border-white/40" />))}
    </div>
  );
}

export default function ChromaSubsamplingDemo() {
  const [selected, setSelected] = useState<ChromaFormat>('4:2:0');
  const [view, setView] = useState<'color' | 'luma' | 'combined'>('combined');
  const format = formats[selected];
  const combined = luma.map((row, y) => row.map((gray, x) => {
    const color = format.chroma[y][x];
    const luminance = [1, 3, 5].map((offset) => parseInt(gray.slice(offset, offset + 2), 16));
    const chrominance = [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16));
    return `rgb(${chrominance.map((channel, index) => Math.round(channel * 0.62 + luminance[index] * 0.38)).join(' ')})`;
  }));
  const visible = view === 'luma' ? luma : view === 'combined' ? combined : format.chroma;
  const viewLabels = { luma: 'Luminância', color: 'Cor', combined: 'Luminância + cor' } as const;
  const labels = sampleLabels[selected];
  const overlayGridClass = selected === '4:2:0' ? 'grid-cols-2 grid-rows-1' : selected === '4:2:2' ? 'grid-cols-2 grid-rows-2' : 'grid-cols-4 grid-rows-2';

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7" aria-label="Demonstração interativa de chroma subsampling">
      <p className="mb-2 font-sans text-xs font-bold uppercase tracking-wide text-neutral-500">Amostragem de cor</p>
      <div className="flex flex-wrap gap-2" aria-label="Selecione a amostragem de cor">
        {order.map((item) => <button key={item} type="button" aria-pressed={selected === item} onClick={() => setSelected(item)} className={`rounded-full border px-5 py-2.5 font-sans text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] ${selected === item ? 'border-[#0071e3] bg-[#0071e3] text-white' : 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100'}`}>
          {item}
        </button>)}
      </div>

      <div className="mt-5 border-t border-neutral-200 pt-5">
        <p className="mb-2 font-sans text-xs font-bold uppercase tracking-wide text-neutral-500">Visualizar</p>
        <div className="flex flex-wrap gap-2" aria-label="Selecione o componente visualizado">
          {(['luma', 'color', 'combined'] as const).map((item) => <button key={item} type="button" aria-pressed={view === item} onClick={() => setView(item)} className={`rounded-full border px-4 py-2 font-sans text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] ${view === item ? 'border-[#0071e3] bg-[#0071e3] text-white' : 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100'}`}>
            {viewLabels[item]}
          </button>)}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-sans text-xl font-bold text-neutral-900">{viewLabels[view]} · {format.title}</h4>
        <p className="mt-1 font-serif text-sm text-neutral-600">{view === 'luma' ? 'A luminância em preto e branco é amostrada em cada pixel.' : view === 'color' ? format.summary : 'Luminância e cor combinadas em cada pixel.'} Os blocos mostram uma representação visual simplificada.</p>
        <div className="mt-5 max-w-4xl">
          {view === 'color' ? <div tabIndex={0} aria-label={`Passe o mouse ou foque para ver as amostras. Luma 4:4, crominância ${labels.ratio}.`} className="group relative cursor-help outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2">
            <Matrix values={visible} label={`Amostras de cor no padrão ${selected}`} />
            <div aria-hidden="true" className={`pointer-events-none absolute inset-0 grid ${overlayGridClass} opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100`}>
              {labels.values.map((value, index) => <span key={`${selected}-${index}`} className="flex items-center justify-center font-sans text-2xl font-black text-neutral-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)] sm:text-4xl">{value}</span>)}
            </div>
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-900 px-3 py-1 font-sans text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Luma 4:4 · CbCr {labels.ratio}</span>
          </div> : <Matrix values={visible} label={`${viewLabels[view]} no padrão ${selected}`} />}
        </div>
        <p className="mt-3 text-center font-sans text-xs text-neutral-500">A luma mantém uma amostra por pixel nos três formatos. O que muda entre as abas é a resolução espacial da cor.</p>
      </div>
    </section>
  );
}
