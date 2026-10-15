'use client';

import React from 'react';
import { ArrowRight, Maximize2 } from 'lucide-react';
import { ArticleToc, EditorialSection, type TocGroup } from './EditorialLayout';
import { ImageLightbox } from './ImageLightbox';
import { ScoredQuiz, type QuizQuestion } from './ScoredQuiz';

/* ------------------------------------------------------------------ blocos de apoio */

const PROSE = 'space-y-3.5 font-serif text-[16px] sm:text-[17px] leading-[1.6] text-neutral-800';

/** "1. O que é Color Science?" → "o-que-e-color-science" (âncora do assunto). */
function slugify(title: string): string {
  return title
    .replace(/^\d+\.\s+/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Conta os caracteres de texto de um trecho de JSX (para decidir se vale dividir em colunas). */
function textLength(node: React.ReactNode): number {
  if (typeof node === 'string' || typeof node === 'number') return String(node).length;
  if (Array.isArray(node)) return node.reduce<number>((sum, child) => sum + textLength(child), 0);
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textLength(node.props.children);
  return 0;
}

/**
 * Subtítulo de assunto em destaque (azul do site): número em selo azul quando o título é numerado
 * ("2. DaVinci YRGB…"), ou uma barra azul à esquerda nos demais. Cada assunto tem âncora própria
 * (passe o mouse no título para copiar o link) e entra no sumário "Nesta página".
 */
function Sub({ title, above, children }: { title: string; above?: React.ReactNode; children: React.ReactNode }) {
  const match = /^(\d+)\.\s+(.*)$/.exec(title);
  const id = slugify(title);
  return (
    <div id={id} className="scroll-mt-6 space-y-8 border-t border-neutral-200 pt-14 first:border-t-0 first:pt-0">
      {above}
      <h4 className="group flex items-center gap-3 font-sans text-[22px] font-black leading-tight tracking-tight text-neutral-900 sm:text-[26px]">
        {match ? (
          <>
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0071e3] text-lg font-black text-white sm:h-10 sm:w-10 sm:text-xl"
            >
              {match[1]}
            </span>
            <span>
              <span className="sr-only">{match[1]}. </span>
              {match[2]}
            </span>
          </>
        ) : (
          <>
            <span aria-hidden="true" className="block h-8 w-1.5 shrink-0 rounded-full bg-[#0071e3]" />
            <span>{title}</span>
          </>
        )}
        <a
          href={`#${id}`}
          aria-label={`Link para a seção: ${title}`}
          className="ml-1 text-xl font-bold text-[#0071e3] opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
        >
          #
        </a>
      </h4>
      {children}
    </div>
  );
}

/**
 * Texto corrido em colunas, como na página "Introdução ao DaVinci Resolve": nunca de ponta a ponta.
 * 2 colunas (3 em telas muito largas com `cols={3}`) só quando o texto tem volume (>= 600 caracteres);
 * trechos curtos ficam em coluna única com largura de leitura, para não picotar poucas linhas em duas.
 */
const MIN_CHARS_FOR_COLUMNS = 600;

function Prose({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  const long = textLength(children) >= MIN_CHARS_FOR_COLUMNS;
  const columns = cols === 1 || !long ? 'max-w-3xl' : cols === 3 ? 'sm:columns-2 2xl:columns-3' : 'sm:columns-2';
  return (
    <div
      className={`font-serif text-[16px] sm:text-[17px] leading-[1.6] text-neutral-800 gap-6 lg:gap-8 hyphens-auto [&_p]:mb-3.5 [&_p:last-child]:mb-0 [&_p]:text-justify ${columns}`}
    >
      {children}
    </div>
  );
}

/**
 * Lista em blocos alinhados: grade de 2 colunas (1 e 2 na primeira linha, 3 e 4 na segunda...), blocos da
 * mesma linha com a mesma altura e o mesmo espaçamento (32 px) em todos os lados. 1 coluna no celular.
 */
function BlockGrid({ cards, cardClassName, single = false }: { cards: React.ReactNode[]; cardClassName: string; single?: boolean }) {
  return (
    <ol className={`grid gap-8 ${single ? 'max-w-3xl' : 'lg:grid-cols-2'}`}>
      {cards.map((card, idx) => (
        <li key={idx} className={`h-full ${cardClassName}`}>
          {card}
        </li>
      ))}
    </ol>
  );
}

interface StepItem {
  title: string;
  body: React.ReactNode[];
}

function TitledSteps({ items, single = false }: { items: StepItem[]; single?: boolean }) {
  return (
    <BlockGrid
      single={single}
      cardClassName="flex items-start gap-3.5 rounded-xl bg-[#f5f5f7] p-4 sm:p-5"
      cards={items.map((item, idx) => (
        <React.Fragment key={item.title}>
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0071e3] font-sans text-sm font-bold text-white">
            {idx + 1}
          </span>
          <div className="min-w-0 space-y-2">
            <h5 className="font-sans text-base font-bold text-neutral-900 sm:text-lg">{item.title}</h5>
            <div className={PROSE}>
              {item.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            </div>
          </div>
        </React.Fragment>
      ))}
    />
  );
}

/** Caixa de destaque: texto em coluna única (sem dividir em colunas), com largura de leitura confortável. */
function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-l-4 border-[#0071e3] bg-[#f5f5f7] p-5">
      <p className="max-w-4xl font-serif text-[16px] leading-relaxed text-neutral-800">{children}</p>
    </div>
  );
}

/** Passos simples: lista vertical, 1, 2, 3... um embaixo do outro, alinhada à esquerda. */
type StepEntry = string | { text: string; action: React.ReactNode };

function Steps({ title, items }: { title: string; items: StepEntry[] }) {
  return (
    <div className="space-y-3 font-sans">
      <h5 className="text-sm font-bold uppercase tracking-wider text-neutral-900">{title}</h5>
      <ol className="max-w-3xl space-y-3">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-3.5 rounded-xl bg-[#f5f5f7] p-4"
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0071e3] font-sans text-sm font-bold text-white">
              {idx + 1}
            </span>
            <p className="min-w-0 flex-1 pt-0.5 font-serif text-base leading-snug text-neutral-800">
              {typeof item === 'string' ? item : item.text}
            </p>
            {typeof item !== 'string' && (
              <div className="ml-auto shrink-0 self-center [&>button]:ml-0">{item.action}</div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

type FlowStep = string | { title: string; sub: string | string[] };

function Flow({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="flex flex-col items-stretch gap-3 font-sans sm:flex-row">
      {steps.map((step, i) => {
        const title = typeof step === 'string' ? step : step.title;
        return (
          <React.Fragment key={title}>
            <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-neutral-200 bg-[#f5f5f7] p-5 text-center">
              <span className="text-lg font-black text-[#0071e3]">{title}</span>
              {typeof step !== 'string' &&
                (Array.isArray(step.sub) ? step.sub : [step.sub]).map((line) => (
                  <span key={line} className="text-sm font-medium text-neutral-600">{line}</span>
                ))}
            </div>
            {i < steps.length - 1 && (
              <ArrowRight aria-hidden="true" className="mx-auto h-6 w-6 shrink-0 rotate-90 self-center text-neutral-400 sm:rotate-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ProsCons({
  pro,
  con,
  proLabel = 'Vantagem',
  conLabel = 'Desvantagem',
  stacked = false,
}: {
  pro: React.ReactNode;
  con: React.ReactNode;
  proLabel?: string;
  conLabel?: string;
  /** true: um cartão embaixo do outro (para a coluna da direita de TextAndProsCons). */
  stacked?: boolean;
}) {
  const card = (label: string, tone: string, text: React.ReactNode) => (
    <section className={`space-y-3 rounded-2xl border bg-white p-5 sm:p-6 ${tone}`}>
      <h5 className="font-sans text-lg font-bold text-neutral-900">{label}</h5>
      <p className={PROSE}>{text}</p>
    </section>
  );
  return (
    <div className={stacked ? 'space-y-5' : 'grid gap-5 lg:grid-cols-2'}>
      {card(proLabel, 'border-emerald-200', pro)}
      {card(conLabel, 'border-amber-200', con)}
    </div>
  );
}

/* ------------------------------------------------------------------ artigo */

interface LessonImage {
  src: string;
  alt: string;
  caption: string;
}

const ARTICLE_IMAGES = {
  colorManagement: {
    src: '/images/gerenciamento-cores/color-manager.webp',
    alt: 'Project Settings do DaVinci Resolve com Color Management destacado no menu lateral e o painel Color Space & Transforms configurado em ACEScct',
    caption: 'Project Settings > Color Management (exemplo com ACEScct).',
  },
  acesColorScience: {
    src: '/images/gerenciamento-cores/acescc-cct.webp',
    alt: 'Menu Color science do DaVinci Resolve com as opções DaVinci YRGB, DaVinci YRGB Color Managed, ACEScc e ACEScct, e abaixo os campos ACES version, ACES AMF e Input Transform',
    caption: 'Color science: selecione ACEScc ou ACEScct.',
  },
  acesInput: {
    src: '/images/gerenciamento-cores/aces-input.webp',
    alt: 'Menu ACES Input Transform do DaVinci Resolve com uma lista de transformações de entrada, como Apple Log, ARRI LogC, Blackmagic Design Film Gen 5 e Canon Log',
    caption: 'ACES Input Transform: escolha a transformação correspondente à câmera ou ao formato de origem.',
  },
  acesOutput: {
    src: '/images/gerenciamento-cores/aces-output.webp',
    alt: 'Menu ACES Output Transform do DaVinci Resolve com opções como Rec.709 BT.1886, sRGB, DisplayP3 e Extended DisplayP3',
    caption: 'ACES Output Transform: escolha o destino de exibição ou entrega (aqui, Rec.709 BT.1886).',
  },
  automaticColor: {
    src: '/images/gerenciamento-cores/automatic-color.webp',
    alt: 'Project Settings do DaVinci Resolve com Color science em DaVinci YRGB Color Managed, a opção Automatic color management marcada e Color processing mode em SDR',
    caption: 'Automatic color management marcada: o Resolve identifica o espaço de cor de entrada.',
  },
  outputColorSpace: {
    src: '/images/gerenciamento-cores/sdr.webp',
    alt: 'Menu Output color space do DaVinci Resolve com as opções SDR Rec.709, SDR Rec.2020, SDR sRGB, HDR HLG e HDR PQ',
    caption: 'Output color space: escolha o formato de saída de acordo com o projeto.',
  },
  yrgbColorManaged: {
    src: '/images/gerenciamento-cores/davinci-yrgb-color-managed.webp',
    alt: 'Menu Color science no Project Settings do DaVinci Resolve, com as opções DaVinci YRGB, DaVinci YRGB Color Managed, ACEScc e ACEScct',
    caption: 'Color science: selecione DaVinci YRGB Color Managed.',
  },
  projectSettings: {
    src: '/images/gerenciamento-cores/proj-setting.webp',
    alt: 'Janela Project Settings do DaVinci Resolve com a seção Color Management aberta',
    caption: 'Project Settings > Color Management.',
  },
  select: {
    src: '/images/gerenciamento-cores/camera-raw.jpg',
    alt: 'Paleta Camera RAW do DaVinci Resolve, com o botão Camera Raw destacado em amarelo e os controles Decode Quality, Decode Using, Color Science, Color Space e Gamma',
    caption: 'Paleta Camera RAW na página Color (exemplo com Blackmagic RAW).',
  },
  decode: {
    src: '/images/gerenciamento-cores/camera-raw1.jpg',
    alt: 'Paleta Camera RAW do DaVinci Resolve com o controle Decode Using, ajustado para Clip, destacado em amarelo',
    caption: 'Decode Using: escolha entre configurações do clipe, do projeto ou metadados da câmera (aqui, modo Clip).',
  },
  convert: {
    src: '/images/gerenciamento-cores/camera-raw2.jpg',
    alt: 'Paleta Camera RAW do DaVinci Resolve com os controles Color Space e Gamma destacados em amarelo',
    caption: 'Controles Color Space e Gamma, onde a conversão para Rec.709 é escolhida, quando disponível.',
  },
} satisfies Record<string, LessonImage>;

type ImageKey = keyof typeof ARTICLE_IMAGES;

/* ------------------------------------------------------------------ tabela e ferramentas interativas */

function DataTable({ caption, head, rows, minWidth = 560 }: { caption: string; head: string[]; rows: string[][]; minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full border-collapse text-left font-sans text-sm" style={{ minWidth }}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-[#f5f5f7] text-neutral-900">
            {head.map((h, i) => (
              <th key={i} scope="col" className="p-3 font-bold">{h}</th>
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
function Interactive({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
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

const PILL = 'min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors duration-150 active:scale-[0.97]';
const PILL_OFF = 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100';
const PILL_ON = 'border-[#0071e3] bg-[#0071e3] text-white';

/** Grupo de botões de escolha única. */
function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (id: T) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-neutral-900">{label}</p>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)} className={`${PILL} ${value === o.id ? PILL_ON : PILL_OFF}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- ferramenta: monte o fluxo do seu projeto ---- */

type MethodId = 'rcm' | 'aces' | 'cst' | 'raw';
type CameraId = 'sony' | 'fuji';
type DeliveryId = 'sdr' | 'p3' | 'hdr';

const CAMERAS: Record<CameraId, { label: string; profile: string }> = {
  sony: { label: 'Sony (S-Log3)', profile: 'S-Gamut3.Cine / S-Log3' },
  fuji: { label: 'Fuji (F-Log)', profile: 'F-Log' },
};

const DELIVERIES: Record<DeliveryId, { label: string; output: string }> = {
  sdr: { label: 'TV e internet (SDR)', output: 'Rec.709 Gamma 2.4' },
  p3: { label: 'Cinema (monitoramento)', output: 'P3' },
  hdr: { label: 'HDR', output: 'Rec.2020 com PQ ou HLG, conforme a especificação de entrega' },
};

const METHODS: { id: MethodId; label: string }[] = [
  { id: 'rcm', label: 'RCM' },
  { id: 'aces', label: 'ACES' },
  { id: 'cst', label: 'CST em nodes' },
  { id: 'raw', label: 'Camera RAW' },
];

function buildFlow(method: MethodId, camera: CameraId, delivery: DeliveryId) {
  const cam = CAMERAS[camera].profile;
  const out = DELIVERIES[delivery].output;
  switch (method) {
    case 'rcm':
      return {
        where: 'Project Settings > Color Management (Shift + 9)',
        steps: [
          { title: 'Entrada', text: `Input Color Space: ${cam}. Com câmeras diferentes, atribua o perfil clipe a clipe no Media Pool (botão direito > Input Color Space).` },
          { title: 'Trabalho', text: 'Timeline Color Space: DaVinci Wide Gamut / DaVinci Intermediate.' },
          { title: 'Saída', text: `Output Color Space: ${out}.` },
        ],
        warning: 'Não adicione CSTs que repitam essas conversões: a imagem seria convertida duas vezes.',
      };
    case 'aces':
      return {
        where: 'Project Settings > Color Management, com Color Science em ACEScc ou ACEScct',
        steps: [
          { title: 'Entrada', text: `ACES Input Transform da câmera (${cam}).` },
          { title: 'Trabalho', text: 'ACEScct (ou ACEScc): é onde acontece o grading.' },
          { title: 'Saída', text: `ACES Output Transform para o destino: ${out}.` },
        ],
        warning: 'Em projeto compartilhado, use a versão do ACES que o pipeline pede, não a mais nova por padrão.',
      };
    case 'cst':
      return {
        where: 'Color Science do projeto em DaVinci YRGB (sem gerenciamento) e um node de CST em cada ponta',
        steps: [
          { title: 'Entrada', text: `CST de entrada no Group Pre-Clip: ${cam} para DaVinci Wide Gamut / DaVinci Intermediate.` },
          { title: 'Trabalho', text: 'Primárias, secundárias, curvas, qualifiers, windows e look, tudo nos nodes de grading.' },
          { title: 'Saída', text: `CST de saída no Timeline: DaVinci Wide Gamut / Intermediate para ${out}.` },
        ],
        warning: 'Se o projeto já usa RCM ou ACES, não coloque CSTs que repitam a mesma conversão.',
      };
    case 'raw':
      return {
        where: 'Palette Camera RAW, na página Color',
        steps: [
          { title: 'Entrada', text: 'Decodificação do RAW: mude de Camera Metadata para Clip (ou Project, para todos os clipes).' },
          { title: 'Trabalho', text: 'O próprio Rec.709: a imagem já sai normalizada, sem um espaço log para o grading.' },
          { title: 'Saída', text: 'Já sai em Rec.709, quando o formato oferece essa conversão.' },
        ],
        warning: 'Se já converteu para Rec.709 aqui, não aplique outra conversão para Rec.709 por cima.',
      };
  }
}

function ColorFlowBuilder() {
  const [method, setMethod] = React.useState<MethodId>('rcm');
  const [camera, setCamera] = React.useState<CameraId>('sony');
  const [delivery, setDelivery] = React.useState<DeliveryId>('sdr');
  const flow = buildFlow(method, camera, delivery);
  const rawMismatch = method === 'raw' && delivery !== 'sdr';

  return (
    <Interactive
      title="Monte o fluxo do seu projeto"
      hint="Escolha o método, a câmera e a entrega para ver onde cada etapa é configurada."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Choice label="Método" value={method} options={METHODS} onChange={setMethod} />
        <Choice label="Câmera" value={camera} options={(Object.keys(CAMERAS) as CameraId[]).map((id) => ({ id, label: CAMERAS[id].label }))} onChange={setCamera} />
        <Choice label="Entrega" value={delivery} options={(Object.keys(DELIVERIES) as DeliveryId[]).map((id) => ({ id, label: DELIVERIES[id].label }))} onChange={setDelivery} />
      </div>

      <div role="status" aria-live="polite" className="space-y-3">
        <p className="text-sm text-neutral-700"><strong className="text-neutral-900">Onde configurar:</strong> {flow.where}</p>
        <ol className="grid gap-3 lg:grid-cols-3">
          {flow.steps.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-1.5 rounded-xl border border-neutral-200 bg-white p-4">
              <span className="flex items-center gap-2 text-base font-black text-[#0071e3]">
                <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0071e3] text-xs text-white">{i + 1}</span>
                {s.title}
              </span>
              <span className="font-serif text-[16px] leading-snug text-neutral-800">{s.text}</span>
            </li>
          ))}
        </ol>
        {rawMismatch && (
          <p className="rounded-xl bg-amber-50 p-3 font-serif text-[16px] leading-snug text-amber-900">
            <strong className="font-sans">Atenção:</strong> o Camera RAW direto para Rec.709 serve para entrega SDR. Para essa entrega, escolha outro método.
          </p>
        )}
        <p className="rounded-xl bg-white p-3 font-serif text-[16px] leading-snug text-neutral-800">
          <strong className="font-sans text-neutral-900">Cuidado:</strong> {flow.warning}
        </p>
      </div>
    </Interactive>
  );
}

/* ---- bancos de perguntas dos quizzes (cada rodada sorteia 5) ---- */

const METHOD_OPTIONS = ['RCM', 'ACES', 'CST em nodes', 'Camera RAW'];

const METHOD_QUIZ: QuizQuestion[] = [
  { situation: 'Você vai fazer um comercial de perfume sozinho, com duas câmeras diferentes. Qual método costuma fazer mais sentido?', options: METHOD_OPTIONS, answer: 0, explain: 'No projeto de uma pessoa só, o RCM guarda tudo no Project Settings e deixa o node tree mais limpo.' },
  { situation: 'O filme vai passar por VFX, por outro colorista e por uma plataforma que exige ACES. Qual método usar?', options: METHOD_OPTIONS, answer: 1, explain: 'O ACES faz mais sentido quando o material passa por várias mãos, com uma arquitetura padronizada.' },
  { situation: 'Qual método deixa cada etapa da conversão visível em nodes, com opções que o RCM não tem, como as caixas de OOTF?', options: METHOD_OPTIONS, answer: 2, explain: 'No CST em nodes, cada etapa vira um node que você vê e controla.' },
  { situation: 'Qual método converte a imagem já na decodificação do arquivo, deixando o fluxo simples para material RAW?', options: METHOD_OPTIONS, answer: 3, explain: 'O Camera RAW converte na decodificação do arquivo, mas as opções dependem do formato.' },
  { situation: 'Você trabalha sozinho e precisa entregar uma versão SDR e outra HDR do mesmo projeto. Qual método facilita isso?', options: METHOD_OPTIONS, answer: 0, explain: 'O RCM facilita gerar versões SDR e HDR do mesmo projeto, trocando a saída.' },
  { situation: 'Qual método tem uma arquitetura padronizada de entrada e saída, pensada para trocar imagens entre câmeras, VFX e exibição?', options: METHOD_OPTIONS, answer: 1, explain: 'É o ACES (Academy Color Encoding System).' },
  { situation: 'Se um clipe vier com o perfil de câmera errado, qual método deixa você corrigir só o node de entrada, sem refazer o grade?', options: METHOD_OPTIONS, answer: 2, explain: 'No CST em nodes, a entrada fica separada dos nodes de correção.' },
  { situation: 'Em qual método a configuração fica toda no Project Settings, deixando o node tree mais limpo?', options: METHOD_OPTIONS, answer: 0, explain: 'No RCM, a configuração fica toda num lugar só, no Project Settings (Shift + 9).' },
  { situation: 'Qual método tem como desvantagem a perda da flexibilidade de trabalhar com uma imagem log no grading?', options: METHOD_OPTIONS, answer: 3, explain: 'Convertendo direto para uma curva de exibição no Camera RAW, você perde a imagem log para o grading.' },
  { situation: 'Em qual método o CST de entrada pode ficar no Group Pre-Clip e o de saída no Timeline?', options: METHOD_OPTIONS, answer: 2, explain: 'É uma organização do CST em nodes: assim você não repete a conversão em cada clipe.' },
  { situation: 'Qual método usa ACEScc ou ACEScct como espaço de trabalho?', options: METHOD_OPTIONS, answer: 1, explain: 'No ACES, o ambiente de trabalho é o ACEScc ou o ACEScct.' },
  { situation: 'Em qual método o Color Science do projeto fica em DaVinci YRGB, sem gerenciamento?', options: METHOD_OPTIONS, answer: 2, explain: 'No CST em nodes, o gerenciamento é feito à mão, então o projeto fica em DaVinci YRGB.' },
  { situation: 'Qual método depende do formato do arquivo e do decodificador, como BRAW, R3D, ARRIRAW e ProRes RAW?', options: METHOD_OPTIONS, answer: 3, explain: 'No Camera RAW, as opções variam conforme o formato e o fabricante.' },
  { situation: 'Qual método tenta identificar a entrada sozinho, pelos metadados e pelo codec, no modo automático?', options: METHOD_OPTIONS, answer: 0, explain: 'No RCM automático, o Resolve tenta identificar o espaço de cor de entrada de cada clipe.' },
];

const ERROR_QUIZ: QuizQuestion[] = [
  { situation: 'A imagem ficou leitosa, com a sombra esmagada e a cor estranha. Qual é o erro mais provável?', options: ['Input Color Space errado', 'Conversão duplicada', 'Rec.709 (Scene) na saída', 'Troca do color science no meio do projeto'], answer: 0, explain: 'O Resolve interpretou o arquivo com o perfil errado. Confirme a câmera e o perfil antes de tudo.' },
  { situation: 'O gamut está certo, mas o contraste e a exposição saíram desviados. O que está errado?', options: ['A curva (gamma)', 'O gamut', 'A saída em P3', 'O projeto em ACES'], answer: 0, explain: 'Gamut certo e curva errada desvia contraste e exposição. Ligue Use Separate Color Space and Gamma e informe os dois.' },
  { situation: 'Contraste e saturação ficaram exagerados num projeto em RCM que também tem CSTs nos nodes. O que aconteceu?', options: ['A imagem foi convertida duas vezes', 'O Input Color Space está errado', 'O Timeline Color Space está em Rec.709', 'A saída está em Rec.2020'], answer: 0, explain: 'Não misture RCM ou ACES com CSTs que fazem a mesma conversão.' },
  { situation: 'A saída SDR ficou com contraste diferente do esperado e estava em Rec.709 (Scene). Qual é o problema?', options: ['Rec.709 (Scene) não é o mesmo que Rec.709 Gamma 2.4', 'O gamut da câmera está errado', 'Falta um CST de entrada', 'O color science foi trocado'], answer: 0, explain: 'A entrega SDR normalmente é Rec.709 Gamma 2.4. Os nomes parecem, mas não são intercambiáveis.' },
  { situation: 'Você trocou o color science no meio do projeto e os grades já feitos mudaram. Por que isso acontece?', options: ['Os grades respondem diferente em cada sistema e precisam ser refeitos', 'O Resolve apagou o Input Color Space', 'A saída foi convertida duas vezes', 'A câmera mudou de perfil'], answer: 0, explain: 'Por isso o método deve ser escolhido no começo do projeto.' },
  { situation: 'Numa entrega de cinema, você usou o P3 de monitoramento como se fosse a codificação final. Qual é o erro?', options: ['O P3 de monitoramento não é a codificação de um DCP, que normalmente usa XYZ', 'O P3 só serve para HDR', 'O DCP usa Rec.709 Gamma 2.4', 'O P3 não existe no Resolve'], answer: 0, explain: 'Siga a especificação de entrega: o DCP normalmente usa XYZ.' },
  { situation: 'As altas luzes cortaram cedo num material log forte. O que dá mais margem para o grading?', options: ['Trabalhar num espaço amplo, como DaVinci Wide Gamut', 'Trabalhar em Rec.709', 'Desligar o Use Separate Color Space and Gamma', 'Converter para Rec.709 logo na entrada'], answer: 0, explain: 'O gamut amplo comporta mais cor, então nada corta antes da hora.' },
  { situation: 'Você converteu para Rec.709 no Camera RAW e converteu de novo no projeto. O que acontece com a imagem?', options: ['Ela é convertida duas vezes', 'Ela fica mais fiel à câmera', 'O Resolve ignora a segunda conversão', 'A saída vira HDR'], answer: 0, explain: 'Escolha um lugar só para converter.' },
  { situation: 'Você informou o gamut S-Gamut3.Cine, mas esqueceu a curva S-Log3. O que sai errado na imagem?', options: ['O contraste e a exposição', 'A cor', 'O frame rate', 'O tamanho do arquivo'], answer: 0, explain: 'Se acertar o gamut e errar a curva, a imagem vem com contraste e exposição errados.' },
  { situation: 'A curva S-Log3 está certa, mas o gamut escolhido não é o da câmera. O que sai errado na imagem?', options: ['A cor', 'O contraste e a exposição', 'O frame rate', 'A resolução'], answer: 0, explain: 'Se acertar a curva e errar o gamut, a imagem vem com a cor errada.' },
  { situation: 'O que é o Timeline Color Space?', options: ['O espaço de trabalho, onde o Resolve faz as contas da correção', 'O espaço de cor em que a câmera gravou', 'O padrão para o qual a imagem é entregue', 'Uma opção que só existe no ACES'], answer: 0, explain: 'Ele não é o espaço da câmera nem o da entrega.' },
  { situation: 'Num projeto compartilhado em ACES, qual versão você deve usar?', options: ['A que o pipeline pede', 'Sempre a mais nova', 'Sempre o ACES 1.x', 'A que vier nos metadados do clipe'], answer: 0, explain: 'Em projeto compartilhado, use a versão que o pipeline pede, não a mais nova por padrão.' },
  { situation: 'Num projeto novo em RCM, qual versão você deve usar?', options: ['O DaVinci YRGB Color Managed atual', 'O DaVinci YRGB Color Managed (Legacy)', 'O ACES 1.x', 'O Camera RAW'], answer: 0, explain: 'O Legacy existe para manter compatibilidade com projetos antigos.' },
  { situation: 'Num fluxo com CST em nodes, um clipe foi interpretado com o perfil errado. O que fazer?', options: ['Corrigir só o CST de entrada', 'Refazer todo o grade', 'Trocar o color science do projeto', 'Converter de novo para Rec.709'], answer: 0, explain: 'Como a entrada está separada dos nodes de correção, você corrige só o CST de entrada.' },
];

/** Sumário do artigo: cada item leva à âncora do assunto (sem rolagem animada). */
const TOC: TocGroup[] = [
  { title: 'Introdução', id: 'introducao-gerenciamento' },
  {
    title: 'Os conceitos',
    id: 'conceitos-de-cor',
    items: [
      { label: 'Color Science', id: 'color-science' },
      { label: 'Entrada, trabalho e saída', id: 'entrada-trabalho-e-saida' },
      { label: 'Gamut e gamma são coisas diferentes', id: 'gamut-e-gamma-sao-coisas-diferentes' },
    ],
  },
  {
    title: 'O painel Color Space & Transforms',
    id: 'color-science-e-transforms',
    items: [
      { label: 'Use Separate Color Space and Gamma', id: 'use-separate-color-space-and-gamma' },
      { label: 'Input Color Space', id: 'input-color-space' },
      { label: 'Timeline Color Space', id: 'timeline-color-space' },
      { label: 'Output Color Space', id: 'output-color-space' },
    ],
  },
  { title: 'Método 1: RCM', id: 'metodo-rcm' },
  {
    title: 'Método 2: ACES',
    id: 'metodo-aces',
    items: [
      { label: 'ACEScc ou ACEScct?', id: 'acescc-ou-acescct' },
      { label: 'ACES 2.0', id: 'aces-2-0' },
    ],
  },
  {
    title: 'Método 3: CST em nodes',
    id: 'fluxo-completo',
    items: [
      { label: 'CST de entrada', id: 'cst-de-entrada' },
      { label: 'Nodes de correção e grading', id: 'nodes-de-correcao-e-grading' },
      { label: 'CST de saída', id: 'cst-de-saida' },
      { label: 'O fluxo completo', id: 'o-fluxo-completo' },
    ],
  },
  { title: 'Método 4: Camera RAW', id: 'camera-raw' },
  { title: 'Qual método escolher?', id: 'qual-metodo' },
  {
    title: 'Na prática',
    id: 'na-pratica-gerenciamento',
    items: [{ label: 'E se tiver ColorChecker?', id: 'e-se-tiver-colorchecker' }],
  },
  { title: 'Erros comuns', id: 'erros-comuns-cor' },
  { title: 'Conclusão', id: 'conclusao-gerenciamento' },
];

const B = ({ children }: { children: React.ReactNode }) => <strong className="font-semibold text-neutral-900">{children}</strong>;

export default function GerenciamentoCoresArticle() {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxImage, setLightboxImage] = React.useState<ImageKey>('select');

  /** Botão "Ver imagem": a imagem só aparece quando a pessoa clica. */
  const viewImage = (key: ImageKey) => (
    <button
      type="button"
      onClick={() => {
        setLightboxImage(key);
        setLightboxOpen(true);
      }}
      aria-haspopup="dialog"
      className="ml-1 inline-flex items-center gap-2 rounded-full border border-[#0071e3]/40 bg-[#0071e3]/10 px-3.5 py-1.5 align-middle font-sans text-sm font-semibold text-[#0071e3] hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer"
    >
      <Maximize2 size={15} aria-hidden="true" />
      Ver imagem
    </button>
  );

  return (
    <article className="relative w-full space-y-10 font-serif leading-relaxed text-[#111111] select-text">
      <ArticleToc groups={TOC} />

      {/* ===================== INTRODUÇÃO ===================== */}
      <EditorialSection
        id="introducao-gerenciamento"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="INTRODUÇÃO"
        title="GERENCIAMENTO DE CORES NO DAVINCI RESOLVE"
      >
        <Prose>
          <p>
            Lembra quando a gente falou que não tem como chegar no resultado sem saber como a imagem foi gravada? O gerenciamento de cores é onde essa informação vira configuração dentro do DaVinci Resolve. É ele que diz pro programa como ler o arquivo da câmera, em que espaço trabalhar e pra qual padrão entregar.
          </p>
          <p>
            Errar aqui custa caro. Se o Resolve interpretar o arquivo errado, a imagem fica leitosa, ou com sombra esmagada, ou com a cor estranha, e você vai passar o grading inteiro brigando com um problema que não estava na gravação. No produto é pior ainda, porque a cor da marca começa errada antes de você mexer em qualquer roda.
          </p>
          <p>
            Nesse artigo, a gente vai entender os conceitos (color science, gamut, gamma, entrada, trabalho e saída), o painel Color Space & Transforms e os quatro jeitos de gerenciar cor no Resolve: RCM, ACES, CST em nodes e Camera RAW. No final, tem uma comparação pra você escolher o método, um passo a passo num comercial de produto e os erros mais comuns.
          </p>
        </Prose>
      </EditorialSection>

      {/* ===================== CONCEITOS ===================== */}
      <EditorialSection
        id="conceitos-de-cor"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="CONCEITOS"
        title="OS CONCEITOS: O QUE É GERENCIAR COR"
      >
        <Sub title="Color Science">
          <Prose>
            <p>
              Color Science é o sistema que define como o Resolve interpreta, processa e mostra as cores do projeto. Escolher ele é o primeiro passo, porque determina como as transformações vão ser organizadas e o que você vai poder controlar. Fica em Project Settings &gt; Color Management (Shift + 9).
            </p>
          </Prose>
        </Sub>

        <Sub title="Entrada, trabalho e saída">
          <Prose cols={1}>
            <p>Qualquer método de gerenciamento de cor segue três etapas:</p>
          </Prose>
          <Flow
            steps={[
              { title: 'Entrada', sub: 'interpretar como a câmera gravou' },
              { title: 'Trabalho', sub: 'corrigir e colorir num espaço adequado pro grading' },
              { title: 'Saída', sub: 'converter o resultado pro padrão de exibição ou entrega' },
            ]}
          />
          <Prose>
            <p>
              Exemplo: uma Sony gravando em S-Log3 / S-Gamut3.Cine. Na entrada, o Resolve interpreta esse log. No trabalho, você colore num espaço amplo, tipo DaVinci Wide Gamut. Na saída, o filme vira Rec.709 pra SDR.
            </p>
            <p>
              Ou seja, a imagem passa por duas conversões: uma na entrada, pro espaço de trabalho, e outra na saída, pro padrão de entrega. No meio, você corrige a cor num espaço amplo, onde nada corta antes da hora.
            </p>
          </Prose>
        </Sub>

        <Sub title="Gamut e gamma são coisas diferentes">
          <Prose>
            <p>
              O <B>color space</B> (ou gamut) define as cores primárias e, com isso, a faixa de cores que pode ser representada. O <B>gamma</B> é a curva de transferência: ela define como a luz da cena vira número no sinal.
            </p>
            <p>
              Na Sony, S-Log3 é a curva (gamma), e S-Gamut3.Cine é o gamut. Pro Resolve interpretar direito, ele precisa saber os dois, tá? Se acertar o gamut e errar a curva, a imagem vem com contraste e exposição errados. Se acertar a curva e errar o gamut, vem com a cor errada.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== PAINEL COLOR SPACE & TRANSFORMS ===================== */}
      <EditorialSection
        id="color-science-e-transforms"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="COLOR SCIENCE"
        title="O PAINEL COLOR SPACE & TRANSFORMS"
      >
        <Prose cols={1}>
          <p>
            Esse painel, dentro do Color Management, reúne as decisões de entrada, trabalho e saída. Bora ver cada opção.
          </p>
        </Prose>

        {/* Banner de borda a borda: anula o espaçamento interno da seção (p-6 / sm:p-10 / lg:p-12) */}
        <figure className="-mx-6 overflow-hidden border-y border-neutral-200 bg-[#1e1e1e] sm:-mx-10 lg:-mx-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/gerenciamento-cores/color-space-transform.webp"
            alt="Painel Color Space & Transforms das configurações do projeto no DaVinci Resolve, com as opções Color science, Use separate color space and gamma, Timeline color space e Output color space"
            width={1658}
            height={324}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        </figure>

        <Sub title="Use Separate Color Space and Gamma">
          <Prose>
            <p>
              Desligada, o Resolve mostra combinações prontas de gamut e curva. Ligada, você escolhe cada um separado. Ative quando precisar informar exatamente o gamut e a curva da câmera, ou quando quiser mais controle sobre a interpretação. O cuidado é sempre bater com a gravação original.
            </p>
          </Prose>
        </Sub>

        <Sub title="Input Color Space">
          <Prose>
            <p>
              É como a imagem foi gravada. Precisa corresponder ao material real: gamut e curva da câmera. No RCM personalizado, você define um padrão pro projeto e, se tiver câmeras diferentes, atribui o perfil certo em cada clipe no Media Pool (botão direito &gt; Input Color Space).
            </p>
          </Prose>
        </Sub>

        <Sub title="Timeline Color Space">
          <Prose>
            <p>
              É o espaço de trabalho, onde o Resolve faz as contas da correção. Não confunda com o espaço da câmera nem com o da entrega, tá?
            </p>
            <p>
              Uma opção muito versátil é <B>DaVinci Wide Gamut / DaVinci Intermediate</B>. O gamut amplo comporta mais cor do que o Rec.709, então nada corta antes da hora; a curva Intermediate é logarítmica, boa pra grading; e câmeras de marcas diferentes caem todas no mesmo espaço. E, se um dia precisar de uma versão HDR, o mesmo grade serve de base.
            </p>
            <p>
              Dá pra trabalhar em Rec.709 quando o projeto é só SDR e mais direto, mas o espaço amplo dá mais flexibilidade.
            </p>
          </Prose>
          <Note>
            Atenção com o <strong className="font-sans font-bold text-neutral-900">Rec.709 (Scene)</strong>: ele usa uma curva scene-referred e não é a mesma coisa que Rec.709 Gamma 2.4, que é a referência de exibição SDR. Os nomes parecem, mas não são intercambiáveis.
          </Note>
        </Sub>

        <Sub title="Output Color Space">
          <Prose cols={1}>
            <p>É o padrão pro qual a imagem vai ser convertida no final:</p>
          </Prose>
          <DataTable
            caption="Saídas possíveis e onde cada uma é usada"
            head={['Saída', 'Onde usa']}
            rows={[
              ['Rec.709 Gamma 2.4', 'Referência habitual pra SDR de broadcast'],
              ['P3', 'Cinema, monitoramento e distribuição de gamut amplo'],
              ['Rec.2020', 'Gamut amplo em vídeo, incluindo HDR'],
              ['PQ ou HLG', 'Saídas HDR, conforme a especificação de entrega'],
            ]}
            minWidth={420}
          />
          <Prose cols={1}>
            <p>
              A saída tem que bater com o que o projeto pede. Dá pra gerar outra versão trocando a saída no RCM, mas confira a imagem e ajuste os planos quando precisar.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== MÉTODO 1: RCM ===================== */}
      <EditorialSection
        id="metodo-rcm"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="MÉTODO 1"
        title="MÉTODO 1: DAVINCI YRGB COLOR MANAGED (RCM)"
      >
        <Prose>
          <p>
            O RCM (Resolve Color Management) é o gerenciamento do próprio Resolve. Ele automatiza as transformações entre câmera, espaço de trabalho e saída. No modo automático, o Resolve tenta identificar a entrada pelos metadados e pelo codec; no modo personalizado, você controla entrada, trabalho e saída.
          </p>
        </Prose>

        <Steps
          title="Como configurar o RCM"
          items={[
            { text: 'Abra Project Settings > Color Management (Shift + 9).', action: viewImage('projectSettings') },
            { text: 'Em Color Science, escolha DaVinci YRGB Color Managed.', action: viewImage('yrgbColorManaged') },
            { text: 'Escolha entre automático e personalizado.', action: viewImage('automaticColor') },
            { text: 'Defina o espaço de trabalho e a saída de acordo com o projeto.', action: viewImage('outputColorSpace') },
            'Confira se cada clipe está sendo interpretado direito.',
          ]}
        />

        <ProsCons
          proLabel="Vantagem"
          conLabel="Desvantagem"
          pro="A configuração fica toda num lugar só, e o node tree fica mais limpo. Facilita misturar câmeras diferentes e gerar versões SDR e HDR do mesmo projeto."
          con="Você enxerga menos o que está acontecendo. Se a entrada de algum clipe for identificada errado, aparecem diferenças de contraste, saturação e matiz. E as ferramentas de grading podem responder diferente de um projeto em outro sistema."
        />

        <Prose cols={1}>
          <p>
            O RCM costuma fazer sentido em projetos em que só você mexe no material, como comercial, YouTube e corporativo.
          </p>
        </Prose>
        <Note>
          <strong className="font-sans font-bold text-neutral-900">E o Legacy?</strong> O DaVinci YRGB Color Managed (Legacy) existe pra manter compatibilidade com projetos antigos. Pra projeto novo, use o atual.
        </Note>
      </EditorialSection>

      {/* ===================== MÉTODO 2: ACES ===================== */}
      <EditorialSection
        id="metodo-aces"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="MÉTODO 2"
        title="MÉTODO 2: ACES"
      >
        <Prose>
          <p>
            ACES significa Academy Color Encoding System. É um padrão criado pra facilitar a troca de imagens entre câmeras, pós-produção, efeitos visuais e exibição, com uma arquitetura padronizada de entrada e saída.
          </p>
          <p>O caminho da imagem no ACES é este:</p>
        </Prose>
        <Flow
          steps={[
            { title: 'ACES Input Transform', sub: 'do espaço da câmera pro ACES' },
            { title: 'Ambiente de trabalho ACES', sub: 'ACEScc ou ACEScct: correção e grading' },
            { title: 'ACES Output Transform', sub: 'do ACES pro destino, tipo Rec.709' },
          ]}
        />

        <Sub title="ACEScc ou ACEScct?">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h5 className="font-sans text-xl font-bold text-[#0071e3]">ACEScc</h5>
              <Prose cols={1}>
                <p>
                  Codificação logarítmica pra grading, com um corte mais seco nas sombras.
                </p>
              </Prose>
            </div>
            <div className="space-y-4">
              <h5 className="font-sans text-xl font-bold text-[#0071e3]">ACEScct</h5>
              <Prose cols={1}>
                <p>
                  Muda o começo da curva, perto do preto, com um &ldquo;pé&rdquo; (toe) que deixa o ajuste das sombras mais parecido com o de uma imagem log tradicional. Na prática, costuma ser mais intuitivo, e é o recomendado pela Netflix.
                </p>
              </Prose>
            </div>
          </div>
          <Note>
            Os dois dão imagens equivalentes do ponto de vista artístico. O que muda é como os ajustes respondem.
          </Note>
        </Sub>

        <Steps
          title="Como configurar o ACES"
          items={[
            { text: 'Abra o Project Settings (Shift + 9).', action: viewImage('projectSettings') },
            { text: 'Vá em Color Management.', action: viewImage('colorManagement') },
            { text: 'Em Color Science, escolha ACEScc ou ACEScct.', action: viewImage('acesColorScience') },
            { text: 'Configure o ACES Input Transform da câmera ou do formato.', action: viewImage('acesInput') },
            { text: 'Configure o ACES Output Transform pro destino.', action: viewImage('acesOutput') },
            'Salve e confira a interpretação dos clipes.',
          ]}
        />

        <Sub title="ACES 2.0">
          <Prose>
            <p>
              O Resolve 21 suporta até o ACES 2.0, que suaviza a transição das altas luzes e reduz o desvio de matiz que deixava pele amarelada no ACES 1.x. Em projeto compartilhado, use a versão que o pipeline pede, não a mais nova por padrão.
            </p>
            <p>
              O ACES faz mais sentido quando o material passa por várias mãos: VFX, outro colorista, estúdio, entrega pra plataforma que exige ACES.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== MÉTODO 3: CST EM NODES ===================== */}
      <EditorialSection
        id="fluxo-completo"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="MÉTODO 3"
        title="MÉTODO 3: CST EM NODES"
      >
        <Prose cols={1}>
          <p>
            Quando a gente não usa o RCM nem o ACES, dá pra montar o gerenciamento na mão, com nodes de Color Space Transform (CST). As três etapas são as mesmas, mas cada uma vira um node que você enxerga e controla. Pra isso, o Color Science do projeto fica em DaVinci YRGB (sem gerenciamento).
          </p>
        </Prose>

        <Sub title="1. CST de entrada">
          <Prose>
            <p>
              O primeiro node diz como a imagem foi gravada. No Input Color Space e no Input Gamma vai o perfil da câmera; no Output Color Space e no Output Gamma, o espaço de trabalho.
            </p>
            <p>
              No exemplo da Sony: entra S-Gamut3.Cine / S-Log3, sai DaVinci Wide Gamut / DaVinci Intermediate. Assim, câmeras diferentes passam a ter uma base comum.
            </p>
          </Prose>
        </Sub>

        <Sub title="2. Nodes de correção e grading">
          <Prose>
            <p>
              No meio ficam as primárias, as secundárias, as curvas, os qualifiers, as windows e o look, tudo no espaço de trabalho. Separar a entrada dos nodes de correção mostra onde termina a interpretação da câmera e onde começa o trabalho criativo. Se um clipe foi interpretado com o perfil errado, você corrige só o CST de entrada, sem refazer o grade.
            </p>
          </Prose>
        </Sub>

        <Sub title="3. CST de saída">
          <Prose>
            <p>
              O último node faz o caminho contrário: entra DaVinci Wide Gamut / Intermediate e sai Rec.709 / Gamma 2.4, por exemplo. Essa conversão adapta luz e cor ao padrão de exibição, com tone mapping e gamut mapping quando for o caso.
            </p>
            <p>
              E, se o destino for monitoramento P3 pra cinema, atenção: o P3 de monitoramento não é a mesma coisa que a codificação final de um DCP, que normalmente usa XYZ.
            </p>
          </Prose>
        </Sub>

        <Sub title="4. O fluxo completo">
          <Flow
            steps={[
              {
                title: 'CST de entrada',
                sub: [
                  'Input: gamut e curva da câmera',
                  'Output: DaVinci Wide Gamut / DaVinci Intermediate',
                ],
              },
              { title: 'Nodes de grading', sub: 'espaço de trabalho' },
              {
                title: 'CST de saída',
                sub: [
                  'Input: DaVinci Wide Gamut / DaVinci Intermediate',
                  'Output: Rec.709 / Gamma 2.4',
                ],
              },
            ]}
          />
          <Note>
            Num comercial, o CST de entrada pode ir no Group Pre-Clip e o de saída no Timeline, assim você não repete em cada clipe.
          </Note>
          <ProsCons
            proLabel="Vantagem"
            conLabel="Desvantagem"
            pro="Você vê e ajusta cada etapa, e tem opções que não existem no RCM, como as caixas de OOTF."
            con="Mais nodes e mais conhecimento de espaço de cor. E nunca misture: se o projeto já está em RCM ou ACES, não coloque CSTs que repetem a mesma conversão, senão você converte duas vezes."
          />
        </Sub>
      </EditorialSection>

      {/* ===================== MÉTODO 4: CAMERA RAW ===================== */}
      <EditorialSection
        id="camera-raw"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="MÉTODO 4"
        title="MÉTODO 4: CAMERA RAW DIRETO PRA REC.709"
      >
        <Prose>
          <p>
            Tem ainda um caminho que não passa pelo gerenciamento de cores do projeto: converter a imagem já na decodificação do arquivo RAW. A palette Camera RAW, na página Color, controla como o Resolve lê os dados do sensor. Dependendo do formato (BRAW, R3D, ARRIRAW, ProRes RAW), dá pra escolher o gamut e a curva da conversão e já sair com uma imagem normalizada pra SDR.
          </p>
        </Prose>

        <TitledSteps
          items={[
            {
              title: 'Selecione o clipe RAW',
              body: [
                <>
                  Na página Color, selecione o clipe e abra a palette Camera RAW. Os controles disponíveis variam conforme o formato e o fabricante da câmera.{' '}
                  {viewImage('select')}
                </>,
              ],
            },
            {
              title: 'Mude a decodificação',
              body: [
                <>
                  Em Camera RAW, mude a decodificação de Camera Metadata pra Clip (ou Project, pra todos os clipes).{' '}
                  {viewImage('decode')}
                </>,
              ],
            },
            {
              title: 'Escolha o Rec.709',
              body: [
                <>
                  Quando disponível, escolha Rec.709 como gamut e a curva adequada pra SDR. Cada fabricante tem opções próprias, como Video ou curvas específicas, e nomes parecidos não são necessariamente iguais.{' '}
                  {viewImage('convert')}
                </>,
              ],
            },
            {
              title: 'Confira o resultado',
              body: ['Confira contraste, saturação, pele e detalhes nas altas luzes e nas sombras antes de começar o grading.'],
            },
          ]}
        />

        <ProsCons
          proLabel="Vantagem"
          conLabel="Desvantagem"
          pro="A conversão acontece na decodificação, o fluxo fica simples e você dispensa transformações extras."
          con="As opções dependem do formato e do decodificador. E, convertendo direto pra uma curva de exibição, você perde a flexibilidade de trabalhar com uma imagem log no grading."
        />
        <Note>
          O cuidado principal: se já converteu pra Rec.709 no Camera RAW, não aplique outra conversão pra Rec.709 por cima, tá?
        </Note>
      </EditorialSection>

      {/* ===================== QUAL MÉTODO ESCOLHER ===================== */}
      <EditorialSection
        id="qual-metodo"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="COMPARAÇÃO"
        title="QUAL MÉTODO ESCOLHER?"
      >
        <Prose cols={1}>
          <p>
            Os métodos chegam no mesmo lugar, e nenhum é o melhor em absoluto. Cada um muda só o caminho.
          </p>
        </Prose>

        <DataTable
          caption="Comparação entre RCM, ACES, CST em nodes e Camera RAW"
          head={['Critério', 'RCM', 'ACES', 'CST em nodes', 'Camera RAW']}
          rows={[
            ['Entrada', 'Input Color Space (auto ou por clipe)', 'ACES Input Transform', 'CST de entrada', 'Decodificação do RAW'],
            ['Trabalho', 'Timeline Color Space (ex.: DWG / Intermediate)', 'ACEScc ou ACEScct', 'Espaço escolhido no CST', 'O próprio Rec.709'],
            ['Saída', 'Output Color Space (ex.: Rec.709 Gamma 2.4)', 'ACES Output Transform', 'CST de saída', 'Já sai em Rec.709'],
            ['Controle', 'Médio, tudo no Project Settings', 'Padronizado', 'Total, visível nos nodes', 'Limitado ao decodificador'],
            ['Melhor pra', 'Comercial, YouTube, projeto de uma pessoa', 'Várias empresas, VFX, plataformas', 'Quem quer ver e controlar cada etapa', 'Fluxo rápido com RAW'],
          ]}
          minWidth={760}
        />

        <Note>
          Uma regra que vale pra todos: escolha o método no começo do projeto. Trocar o color science no meio não é um ajuste simples, porque os grades já feitos vão responder diferente e você vai ter que refazer.
        </Note>

        <ColorFlowBuilder />
        <ScoredQuiz
          title="Qual método eu uso?"
          hint="Leia cada pergunta e escolha o método. As respostas vêm do artigo."
          pool={METHOD_QUIZ}
        />
      </EditorialSection>

      {/* ===================== NA PRÁTICA ===================== */}
      <EditorialSection
        id="na-pratica-gerenciamento"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="NA PRÁTICA"
        title="NA PRÁTICA: CONFIGURANDO UM COMERCIAL DE PRODUTO"
      >
        <Prose cols={1}>
          <p>
            Bora pra prática. Imagina um comercial de perfume com duas câmeras: uma Sony em S-Log3 / S-Gamut3.Cine pro packshot em estúdio, e uma Fuji em F-Log pros planos com modelo. A entrega é pra TV e internet em SDR.
          </p>
        </Prose>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <Steps
            title="Com RCM"
            items={[
              'Shift + 9 > Color Management > Color Science: DaVinci YRGB Color Managed, modo personalizado.',
              'Timeline Color Space: DaVinci Wide Gamut / DaVinci Intermediate.',
              'Output Color Space: Rec.709 Gamma 2.4.',
              'No Media Pool, selecione os clipes da Sony > botão direito > Input Color Space: S-Gamut3.Cine / S-Log3. Faça o mesmo com a Fuji, escolhendo F-Log.',
              'Na Color, confira os scopes: os pretos e as altas luzes estão num lugar coerente? O frasco tem a cor esperada?',
            ]}
          />
          <Steps
            title="Com CST em nodes"
            items={[
              'Color Science: DaVinci YRGB.',
              'Crie um grupo pra Sony e outro pra Fuji. No Group Pre-Clip de cada um, um CST de entrada com o perfil da câmera, saindo em DaVinci Wide Gamut / Intermediate.',
              'No Timeline, um CST de saída de DaVinci Wide Gamut / Intermediate pra Rec.709 / Gamma 2.4.',
              'Faça as primárias, o matching, as secundárias e o look nos nodes de clipe e no grupo, tudo no espaço de trabalho.',
            ]}
          />
        </div>

        <Prose cols={1}>
          <p>
            Nos dois casos, as duas câmeras caem no mesmo espaço de trabalho. Isso deixa o shot matching muito mais fácil, porque você compara coisa com coisa, sem misturar duas interpretações diferentes de log.
          </p>
        </Prose>

        <Sub title="E se tiver ColorChecker?">
          <Prose cols={1}>
            <p>
              Se a produção filmou a cartela, use o Color Match depois da conversão de entrada, pra deixar as câmeras ainda mais próximas antes das primárias.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== ERROS COMUNS ===================== */}
      <EditorialSection
        id="erros-comuns-cor"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="ATENÇÃO"
        title="ERROS COMUNS NO GERENCIAMENTO DE CORES"
      >
        <DataTable
          caption="Erros comuns, o que acontece e como evitar"
          head={['Erro', 'O que acontece', 'Como evitar']}
          rows={[
            ['Input Color Space errado', 'Imagem leitosa, sombras esmagadas, cor estranha', 'Confirme a câmera e o perfil antes de tudo'],
            ['Gamut certo e curva errada (ou o contrário)', 'Contraste, exposição ou cor desviados', 'Use Separate Color Space and Gamma e informe os dois'],
            ['Conversão duplicada', 'Contraste e saturação exagerados', 'Não misture RCM ou ACES com CSTs que fazem o mesmo'],
            ['Rec.709 (Scene) no lugar de Gamma 2.4', 'Contraste diferente do esperado na saída', 'Entrega SDR normalmente é Rec.709 Gamma 2.4'],
            ['Converter pra Rec.709 no Camera RAW e de novo no projeto', 'Imagem convertida duas vezes', 'Escolha um lugar só pra converter'],
            ['Trocar o color science no meio do projeto', 'Os grades mudam e precisam ser refeitos', 'Decida o método no início'],
            ['Trabalhar em Rec.709 com material log forte', 'Altas luzes cortando cedo e menos margem', 'Use um espaço amplo como DaVinci Wide Gamut'],
            ['Achar que P3 de monitoramento é DCP', 'Entrega de cinema errada', 'Siga a especificação de entrega (DCP usa XYZ)'],
          ]}
          minWidth={680}
        />

        <ScoredQuiz
          title="Teste seus conhecimentos"
          hint="Leia cada pergunta e escolha a resposta certa. As respostas vêm do artigo."
          pool={ERROR_QUIZ}
        />
      </EditorialSection>

      {/* ===================== CONCLUSÃO ===================== */}
      <EditorialSection
        id="conclusao-gerenciamento"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="CONCLUSÃO"
        title="CONCLUSÃO"
      >
        <Prose>
          <p>
            Gerenciar cor é dizer pro Resolve três coisas: como a imagem foi gravada, onde você vai trabalhar e pra onde ela vai. RCM, ACES, CST ou Camera RAW são só jeitos diferentes de fazer isso. Escolha um no começo, configure direito e confira nos scopes.
          </p>
          <p>
            Quando essa base está certa, todo o resto do fluxo de trabalho fica mais fácil, tá? As câmeras conversam, o matching anda rápido e a cor do produto começa no lugar certo.
          </p>
        </Prose>

        <p className="font-sans text-sm leading-relaxed text-neutral-700">
          <strong className="font-semibold text-neutral-900">Referências:</strong>{' '}
          <a href="https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-20-Colorist-Guide.pdf" target="_blank" rel="noreferrer noopener" className="text-[#0071e3] hover:underline">Colorist Guide to DaVinci Resolve, da Blackmagic Design</a>,{' '}
          <a href="https://docs.acescentral.com/system-components/input-transforms/" target="_blank" rel="noreferrer noopener" className="text-[#0071e3] hover:underline">documentação ACES sobre Input Transforms</a>,{' '}
          <a href="https://docs.acescentral.com/system-components/output-transforms/" target="_blank" rel="noreferrer noopener" className="text-[#0071e3] hover:underline">documentação ACES sobre Output Transforms</a>,{' '}
          <a href="https://www.imaster.org/docs/davinci-resolve-21-manual/part-2-setup-and-workflows/ch.-6-project-settings" target="_blank" rel="noreferrer noopener" className="text-[#0071e3] hover:underline">Manual do DaVinci Resolve 21, capítulo 6: Project Settings</a>,{' '}
          <a href="https://docs.imaster.org/davinci-resolve-21-manual/part-2-setup-and-workflows/ch.-9-data-levels,-color-management,-and-aces" target="_blank" rel="noreferrer noopener" className="text-[#0071e3] hover:underline">capítulo 9: Data Levels, Color Management, and ACES</a>,{' '}
          <a href="https://blog.frame.io/2024/10/07/should-you-use-resolve-color-management-or-color-space-transforms-csts/" target="_blank" rel="noreferrer noopener" className="text-[#0071e3] hover:underline">Frame.io: Should You Use Resolve Color Management or CSTs?</a>,{' '}
          <a href="https://tryuncle.com/learn/davinci-resolve/resolve-color-management-vs-aces-which-should-i-use" target="_blank" rel="noreferrer noopener" className="text-[#0071e3] hover:underline">Uncle: Resolve Color Management vs ACES</a>{' '}
          e{' '}
          <a href="https://gamut.io/why-davinci-wide-gamut-matters/" target="_blank" rel="noreferrer noopener" className="text-[#0071e3] hover:underline">Gamut: Why DaVinci Wide Gamut Matters</a>
          .
        </p>
      </EditorialSection>

      <ImageLightbox
        open={lightboxOpen}
        src={ARTICLE_IMAGES[lightboxImage].src}
        alt={ARTICLE_IMAGES[lightboxImage].alt}
        caption={ARTICLE_IMAGES[lightboxImage].caption}
        onClose={() => setLightboxOpen(false)}
      />
    </article>
  );
}
