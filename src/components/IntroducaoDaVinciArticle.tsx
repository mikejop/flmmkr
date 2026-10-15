'use client';

import React, { useState } from 'react';
import { getMediaUrl } from '@/lib/storage';
import { ScoredQuiz, type QuizQuestion } from './ScoredQuiz';
import { ArticleToc, EditorialSection, type TocGroup } from './EditorialLayout';
import { Sub, Prose, Note, Bullets, NumberedSteps, DataTable } from './ArticleBlocks';

/**
 * Conteúdo da aula "Introdução ao DaVinci Resolve": "Introdução ao DaVinci Resolve para color grading".
 *
 * Ferramenta interativa (onde ajuda a entender o texto):
 *  - NodeQuiz     → "Qual node resolve isso?": situações tiradas da tabela dos tipos de node.
 */

/* ------------------------------------------------------------------ blocos de apoio */

const IMG = 'assets/artigos/introducao-davinci/';

/** Imagem da interface do Resolve, na largura do bloco, junto do assunto que ela mostra. */
function Fig({ file, alt }: { file: string; alt: string }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={getMediaUrl(IMG + file)} alt={alt} loading="lazy" decoding="async" className="block h-auto w-full" />
    </figure>
  );
}

type Hotspot = { name: string; color: string; box: [number, number, number, number] };

/** Imagem com áreas destacadas: ao passar o mouse (ou tocar/focar) a borda colorida e o nome da área aparecem. */
function AnnotatedFig({ file, alt, width, height, spots }: { file: string; alt: string; width: number; height: number; spots: Hotspot[] }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <figure className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getMediaUrl(IMG + file)} alt={alt} width={width} height={height} loading="lazy" decoding="async" className="block h-auto w-full" />
        {spots.map((s) => {
          const [x0, y0, x1, y1] = s.box;
          const on = active === s.name;
          return (
            <button
              key={s.name}
              type="button"
              aria-label={s.name}
              aria-pressed={on}
              onMouseEnter={() => setActive(s.name)}
              onMouseLeave={() => setActive((a) => (a === s.name ? null : a))}
              onFocus={() => setActive(s.name)}
              onBlur={() => setActive((a) => (a === s.name ? null : a))}
              onClick={() => setActive((a) => (a === s.name ? null : s.name))}
              className="group absolute cursor-pointer rounded-md outline-none"
              style={{
                left: `${(x0 / width) * 100}%`,
                top: `${(y0 / height) * 100}%`,
                width: `${((x1 - x0) / width) * 100}%`,
                height: `${((y1 - y0) / height) * 100}%`,
                border: `3px solid ${on ? s.color : 'transparent'}`,
                backgroundColor: on ? `${s.color}1f` : 'transparent',
                transition: 'border-color 150ms, background-color 150ms',
              }}
            >
              <span
                className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-0.5 font-sans text-[11px] font-black uppercase tracking-wide transition-opacity duration-150 sm:px-3 sm:py-1 sm:text-base lg:text-xl ${on ? 'opacity-100' : 'opacity-0'}`}
                style={{ color: s.color, textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
              >
                {s.name}
              </span>
            </button>
          );
        })}
      </div>
    </figure>
  );
}

const COLOR_PAGE_SPOTS: Hotspot[] = [
  { name: 'Gallery', color: '#2dd4bf', box: [100, 10, 196, 48] },
  { name: 'Viewer', color: '#ffc700', box: [22, 72, 878, 618] },
  { name: 'Nodes', color: '#1e90ff', box: [880, 72, 1580, 618] },
  { name: 'Inspector', color: '#a855f7', box: [1583, 50, 1983, 618] },
  { name: 'Timeline', color: '#22c55e', box: [22, 625, 1330, 760] },
  { name: 'Color Wheels', color: '#fb923c', box: [20, 815, 755, 1215] },
  { name: 'Curves', color: '#f472b6', box: [758, 815, 1262, 1215] },
  { name: 'Scopes', color: '#ef4444', box: [1493, 815, 1983, 1215] },
  { name: 'Páginas', color: '#e5e5e5', box: [640, 1217, 1960, 1246] },
];

/** Diagramas de nodes lado a lado, com legenda. */
function NodeDiagrams({ items }: { items: { file: string; alt: string; label: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((d) => (
        <figure key={d.file} className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <div className="flex aspect-[3/2] items-center justify-center overflow-hidden rounded-lg bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getMediaUrl(IMG + d.file)} alt={d.alt} loading="lazy" decoding="async" className="h-full w-full object-contain" />
          </div>
          <figcaption className="font-sans text-xs font-semibold text-neutral-700">{d.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ dados das tabelas */

const COLOR_AREAS: { id: string; name: string; where: string; use: string }[] = [
  { id: 'viewer', name: 'Viewer', where: 'Centro', use: 'A imagem, que precisa ser observada o tempo inteiro' },
  { id: 'gallery', name: 'Gallery', where: 'Esquerda', use: 'Stills, referências e grades salvos' },
  { id: 'nodes', name: 'Nodes', where: 'Direita', use: 'A estrutura da correção e a ordem de cada ajuste' },
  { id: 'timeline', name: 'Timeline e thumbnails', where: 'Meio, abaixo do viewer', use: 'Navegar pelo projeto e escolher os planos' },
  { id: 'palettes', name: 'Ferramentas (palettes)', where: 'Parte de baixo', use: 'Rodas, curvas, qualifier, windows, tracker, key, sizing' },
  { id: 'scopes', name: 'Scopes', where: 'Parte de baixo, à direita, ou em janela separada', use: 'Leitura objetiva de luz e cor' },
];

interface NodeType {
  id: string;
  name: string;
  how: string;
  when: string;
  /** Situação, vista pelo aluno no quiz (sem citar o nome do node). */
  situation: string;
}

const NODE_TYPES: NodeType[] = [
  { id: 'serial', name: 'Serial', how: 'Um depois do outro; cada um recebe a imagem já tratada', when: 'Primárias, balanço, contraste, look. É a estrutura principal', situation: 'Você vai fazer as primárias, o balanço, o contraste e o look, um ajuste depois do outro, cada um sobre a imagem já tratada.' },
  { id: 'parallel', name: 'Parallel', how: 'Vários partem da mesma imagem e são somados no Parallel Mixer', when: 'Secundárias independentes: pele, céu, produto', situation: 'Você quer secundárias independentes, de pele, de céu e de produto, todas partindo da mesma imagem.' },
  { id: 'layer', name: 'Layer Mixer', how: 'Combina ramos por camadas, com prioridade', when: 'Sobrepor regiões corrigidas separadamente', situation: 'Duas regiões foram corrigidas separadamente e você precisa sobrepor uma à outra, com prioridade.' },
  { id: 'outside', name: 'Outside', how: 'Inverte a seleção do node anterior', when: 'Tratar tudo que está fora do produto ou do rosto', situation: 'Você já selecionou o produto e agora quer tratar tudo que está fora dele.' },
  { id: 'splitter', name: 'Splitter/Combiner', how: 'Separa R, G e B e junta de novo', when: 'Tratamentos avançados por canal', situation: 'Você precisa de um tratamento avançado, trabalhando o vermelho, o verde e o azul separadamente.' },
  { id: 'keymixer', name: 'Key Mixer', how: 'Junta seleções, não imagens', when: 'Combinar dois qualifiers ou máscaras', situation: 'Você fez dois qualifiers, ou duas máscaras, e quer juntar as seleções numa só.' },
  { id: 'shared', name: 'Shared Node', how: 'Uma correção ligada em vários clipes', when: 'Mesmo ajuste em todos os takes de uma câmera', situation: 'Você quer o mesmo ajuste em todos os takes de uma câmera, ligado a vários clipes de uma vez.' },
  { id: 'compound', name: 'Compound Node', how: 'Agrupa vários nodes num só', when: 'Deixar um node tree grande mais limpo', situation: 'O seu node tree ficou enorme e você quer deixá-lo mais limpo, agrupando vários nodes num só.' },
];

/* ------------------------------------------------------------------ barra das páginas do Resolve */

type ResolvePage = { name: string; what: string; use: string; level: 'yes' | 'some' | 'rare' | 'no'; icon: React.ReactNode };

const LEVEL_DOT: Record<ResolvePage['level'], string> = { yes: 'bg-[#34c759]', some: 'bg-[#ff9f0a]', rare: 'bg-[#8e8e93]', no: 'bg-[#ff3b30]' };

const ICON = { viewBox: '0 0 24 24', 'aria-hidden': true, className: 'h-6 w-6 fill-none stroke-current sm:h-[26px] sm:w-[26px]', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const RESOLVE_PAGES: ResolvePage[] = [
  { name: 'Media', level: 'yes', what: 'Trazer os arquivos do computador pro projeto e organizar no Media Pool', use: 'Sim, no começo',
    icon: <svg {...ICON}><rect x="3" y="6" width="18" height="13" rx="1.5" /><path d="M5 3.5h14" /><circle cx="8.5" cy="10.5" r="1.4" /><path d="M4 17l5-4.5 3.5 3 3-2.5L20 17" /></svg> },
  { name: 'Photo', level: 'rare', what: 'Tratamento de fotos com as ferramentas de cor do Resolve', use: 'Raramente',
    icon: <svg {...ICON}><rect x="3" y="7" width="18" height="13" rx="3" /><circle cx="12" cy="13.5" r="3.6" /><path d="M8 7l1.5-2.5h5L16 7" /></svg> },
  { name: 'Cut', level: 'rare', what: 'Montagem rápida, pra prazo curto', use: 'Raramente',
    icon: <svg {...ICON}><rect x="9" y="5" width="12" height="14" rx="1.5" /><path d="M13 5v14M17 5v14" /><path d="M2 9h5M3 12h4M2 15h5" /></svg> },
  { name: 'Edit', level: 'some', what: 'Montagem completa do filme na timeline', use: 'Às vezes, pra conferir o corte',
    icon: <svg {...ICON}><path d="M12 3v18" /><rect x="4" y="6" width="6" height="3" rx="1" /><rect x="14" y="6" width="6" height="3" rx="1" /><rect x="3" y="11" width="7" height="3" rx="1" /><rect x="14" y="11" width="4" height="3" rx="1" /><rect x="5" y="16" width="5" height="3" rx="1" /><rect x="14" y="16" width="7" height="3" rx="1" /></svg> },
  { name: 'Fusion', level: 'rare', what: 'Efeitos visuais e motion graphics', use: 'Raramente',
    icon: <svg {...ICON}><path d="M5 20l9-9" /><path d="M14 11l2-5 2 5-2 1z" /><path d="M6 5v3M4.5 6.5h3M10 3v2M9 4h2M19 15v3M17.5 16.5h3" /></svg> },
  { name: 'Color', level: 'yes', what: 'Correção de cor e color grading', use: 'Sim, o tempo todo',
    icon: <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 sm:h-[26px] sm:w-[26px]"><circle cx="12" cy="4.5" r="2" fill="#ff453a" /><circle cx="17.3" cy="6.7" r="2" fill="#ff9f0a" /><circle cx="19.5" cy="12" r="2" fill="#ffd60a" /><circle cx="17.3" cy="17.3" r="2" fill="#32d74b" /><circle cx="12" cy="19.5" r="2" fill="#64d2ff" /><circle cx="6.7" cy="17.3" r="2" fill="#0a84ff" /><circle cx="4.5" cy="12" r="2" fill="#bf5af2" /><circle cx="6.7" cy="6.7" r="2" fill="#ff375f" /></svg> },
  { name: 'Fairlight', level: 'no', what: 'Áudio: edição e mixagem', use: 'Não',
    icon: <svg {...ICON}><path d="M9 18V6l11-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></svg> },
  { name: 'Deliver', level: 'yes', what: 'Exportar o filme final', use: 'Sim, no final',
    icon: <svg {...ICON}><path d="M14.5 4.5c3-1.5 5.5-1 5.5-1s.5 2.5-1 5.5l-6 6-4.5-4.5z" /><circle cx="15.5" cy="8.5" r="1.4" /><path d="M8.5 10.5L5 11l-2 3 4 .5M13.5 15.5L13 19l-3 2-.5-4" /><path d="M6 18l-2 2" /></svg> },
];

function PageTip({ page }: { page: ResolvePage }) {
  return (
    <>
      <p className="font-sans text-base font-black leading-tight text-neutral-900">{page.name}</p>
      <p className="mt-1.5 font-serif text-[16px] leading-snug text-neutral-800">{page.what}</p>
      <p className="mt-2.5 flex items-center gap-2 border-t border-neutral-200 pt-2.5 font-sans text-xs text-neutral-600">
        <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${LEVEL_DOT[page.level]}`} />
        <span>O colorista usa? <strong className="font-bold text-neutral-900">{page.use}</strong></span>
      </p>
    </>
  );
}

function ResolvePagesBar() {
  const [active, setActive] = useState('Color');
  const [shown, setShown] = useState('Color'); // painel para telas pequenas (sem hover)
  const shownPage = RESOLVE_PAGES.find((p) => p.name === shown)!;
  const last = RESOLVE_PAGES.length - 1;

  return (
    <div className="space-y-3 pb-2 sm:pb-36">
      <nav aria-label="Páginas do DaVinci Resolve" className="flex rounded-t-md border-b border-[#2a2a2c] bg-[#1c1c1e] font-sans">
        {RESOLVE_PAGES.map((page, i) => {
          const isActive = active === page.name;
          const edge = i === 0 ? 'left-0' : i === last ? 'right-0' : 'left-1/2 -translate-x-1/2';
          const arrow = i === 0 ? 'left-10' : i === last ? 'right-10' : 'left-1/2 -translate-x-1/2';
          return (
            <button
              key={page.name}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => { setActive(page.name); setShown(page.name); }}
              onMouseEnter={() => setShown(page.name)}
              onFocus={() => setShown(page.name)}
              className={`group relative flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1.5 px-0.5 pb-2 pt-2.5 outline-none transition-colors duration-150 sm:px-1 ${
                isActive ? 'bg-black font-semibold text-white' : 'text-[#8e8e93] hover:text-[#d1d1d6] focus-visible:text-[#d1d1d6]'
              }`}
            >
              {page.icon}
              <span className="text-[10px] tracking-[0.01em] sm:text-[15px]">{page.name}</span>
              {isActive && <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-[3px] bg-[#e5534b]" />}

              <span
                role="tooltip"
                className={`pointer-events-none invisible absolute top-[calc(100%+12px)] z-20 hidden w-[270px] translate-y-1.5 rounded-2xl border border-neutral-200 bg-white p-4 text-left font-normal opacity-0 shadow-xl transition-[opacity,transform] duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none sm:block ${edge}`}
              >
                <span aria-hidden="true" className={`absolute -top-1.5 h-3 w-3 rotate-45 border-l border-t border-neutral-200 bg-white ${arrow}`} />
                <PageTip page={page} />
              </span>
            </button>
          );
        })}
      </nav>

      {/* Telas pequenas: sem passar o mouse, a explicação aparece aqui embaixo */}
      <div role="status" aria-live="polite" className="rounded-2xl border border-neutral-200 bg-white p-4 sm:hidden">
        <PageTip page={shownPage} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ ferramenta: qual node resolve isso? */

const NODE_QUIZ: QuizQuestion[] = [
  ...NODE_TYPES.map((n, i) => ({
    situation: `${n.situation.replace(/\.$/, '')}. Qual tipo de node resolve isso?`,
    options: NODE_TYPES.map((o) => o.name),
    answer: i,
    explain: `${n.name}: ${n.how.charAt(0).toLowerCase() + n.how.slice(1)}.`,
    why: NODE_TYPES.map((o) => `O ${o.name} serve para: ${o.when.charAt(0).toLowerCase() + o.when.slice(1)}.`),
  })),
  { situation: 'Qual mixer combina seleções, como dois qualifiers ou duas máscaras?', options: ['Parallel Mixer', 'Layer Mixer', 'Key Mixer', 'Compound Node'], answer: 2, explain: 'O Key Mixer junta seleções. O Parallel Mixer soma correções e o Layer Mixer sobrepõe camadas.' },
  { situation: 'Qual mixer soma as correções de nodes que partem da mesma imagem?', options: ['Parallel Mixer', 'Layer Mixer', 'Key Mixer', 'Shared Node'], answer: 0, explain: 'O Parallel Mixer soma as correções paralelas.' },
  { situation: 'Qual mixer sobrepõe camadas, com prioridade entre elas?', options: ['Parallel Mixer', 'Layer Mixer', 'Key Mixer', 'Outside'], answer: 1, explain: 'O Layer Mixer sobrepõe camadas.' },
  { situation: 'Qual node só organiza o node tree, sem reaproveitar a correção em outros lugares?', options: ['Shared Node', 'Compound Node', 'Serial', 'Parallel'], answer: 1, explain: 'O Compound só organiza. Quem reaproveita uma correção em vários lugares é o Shared.' },
  { situation: 'Em qual estágio do grupo fica a parte técnica que vale para todos os clipes?', options: ['Pre-Clip', 'Clip', 'Post-Clip', 'Timeline'], answer: 0, explain: 'O Pre-Clip cuida da parte técnica que vale para todos.' },
  { situation: 'Em qual estágio do grupo fica o look do grupo?', options: ['Pre-Clip', 'Clip', 'Post-Clip', 'Timeline'], answer: 2, explain: 'O Post-Clip guarda o look do grupo e permite mexer no look do filme inteiro num lugar só.' },
  { situation: 'Qual atalho liga e desliga um node, para você ver o que ele está fazendo?', options: ['Command/Ctrl + D', 'Shift + 6', 'Shift + 8', 'Command/Ctrl + Z'], answer: 0, explain: 'Command/Ctrl + D liga e desliga o node selecionado.' },
];

function NodeQuiz() {
  return (
    <ScoredQuiz
      title="Qual node resolve isso?"
      hint="Leia cada pergunta e escolha a resposta certa. As respostas vêm do artigo."
      pool={NODE_QUIZ}
    />
  );
}

/* ------------------------------------------------------------------ sumário */

const TOC: TocGroup[] = [
  { title: 'Introdução', id: 'introducao-resolve' },
  { title: 'As páginas do Resolve', id: 'paginas-do-resolve' },
  {
    title: 'Organização',
    id: 'organizacao-resolve',
    items: [
      { label: 'O Project Manager', id: 'o-project-manager' },
      { label: 'Banco de dados, não arquivo', id: 'o-resolve-nao-salva-arquivo-salva-em-banco-de-dados' },
      { label: 'Backup', id: 'backup-nao-deixe-pra-depois' },
      { label: 'Exportar x arquivar', id: 'exportar-x-arquivar' },
      { label: 'Media Pool e gerenciamento de cor', id: 'media-pool-e-gerenciamento-de-cor' },
    ],
  },
  { title: 'A página Color', id: 'pagina-color' },
  {
    title: 'Nodes',
    id: 'nodes-resolve',
    items: [
      { label: 'A ordem importa', id: 'a-ordem-importa' },
      { label: 'Os tipos de node', id: 'os-tipos-de-node' },
      { label: 'Grupos e o node tree do filme', id: 'grupos-e-o-node-tree-do-filme-inteiro' },
    ],
  },
  {
    title: 'Primárias e ferramentas específicas',
    id: 'primarias-resolve',
    items: [
      { label: 'Color Wheels', id: 'color-wheels-lift-gamma-gain-e-offset' },
      { label: 'Primary Bars e Log Wheels', id: 'primary-bars-e-log-wheels' },
      { label: 'HDR', id: 'hdr-ajuste-preciso-por-faixa-tonal' },
      { label: 'RGB Mixer', id: 'rgb-mixer-os-canais-de-cor' },
      { label: 'Curves', id: 'curves-contraste-matiz-e-saturacao' },
    ],
  },
  {
    title: 'Isolamento',
    id: 'isolamento-resolve',
    items: [
      { label: 'Qualifier', id: 'qualifier-selecao-por-cor' },
      { label: 'Power Windows', id: 'power-windows-selecao-por-forma' },
      { label: 'Tracker', id: 'tracker-acompanhando-o-movimento' },
      { label: 'Magic Mask', id: 'magic-mask-selecao-por-inteligencia-artificial' },
      { label: 'Key', id: 'key-a-forca-do-seu-node' },
      { label: 'Blur, Sharpen e Sizing', id: 'blur-sharpen-e-sizing' },
    ],
  },
  {
    title: 'Análise e comparação',
    id: 'analise-e-comparacao-resolve',
    items: [
      { label: 'Scopes', id: 'scopes' },
      { label: 'Split Screen', id: 'split-screen' },
      { label: 'Gallery', id: 'gallery' },
      { label: 'Color Match', id: 'color-match' },
      { label: 'Versions', id: 'versions' },
    ],
  },
  { title: 'Na prática: num comercial de produto', id: 'resolve-na-pratica' },
  { title: 'Atalhos', id: 'atalhos-resolve' },
  { title: 'Conclusão', id: 'conclusao-resolve' },
];

/* ------------------------------------------------------------------ artigo */

export default function IntroducaoDaVinciArticle() {
  return (
    <article className="relative w-full space-y-10 font-serif leading-relaxed text-[#111111] select-text">
      <ArticleToc groups={TOC} />

      {/* ===================== INTRODUÇÃO ===================== */}
      <EditorialSection
        id="introducao-resolve"
        kickerLeft="FUNDAMENTOS · DAVINCI RESOLVE"
        kickerRight="COLOR GRADING"
        title="INTRODUÇÃO AO DAVINCI RESOLVE PARA COLOR GRADING"
      >
        <Prose>
          <p>
            Antes de começar a mexer na imagem, bora entender como o DaVinci Resolve funciona. Principalmente se você ainda não está muito familiarizado com o programa, porque a interface pode parecer meio confusa no começo: tem bastante coisa na tela e, principalmente, tem ferramenta pra caramba.
          </p>
          <p>
            E não precisa querer aprender tudo agora, tá? O Resolve tem um milhão de ferramentas, e é impossível falar de todas elas. Aqui você vai entender como o programa está organizado, como manter seus projetos em ordem e onde ficam as ferramentas que a gente usa no fluxo de trabalho do color grading.
          </p>
          <p>
            Nesse artigo, a gente começa pela organização (Project Manager, bancos de dados, backups e gerenciamento de cor) e depois entra na página Color: nodes, primárias, ferramentas de isolamento, scopes e comparação. No final, tem um passo a passo mostrando onde cada ferramenta entra num comercial de produto e os atalhos que você precisa começar a usar.
          </p>
        </Prose>
        <Fig file="davinci-resolve.webp" alt="DaVinci Resolve" />
      </EditorialSection>

      {/* ===================== AS PÁGINAS ===================== */}
      <EditorialSection
        id="paginas-do-resolve"
        kickerLeft="PÓS-PRODUÇÃO"
        kickerRight="ONDE O COLORISTA TRABALHA"
        title="AS PÁGINAS DO RESOLVE: ONDE O COLORISTA TRABALHA"
      >
        <Prose>
          <p>
            O Resolve é dividido em páginas, e cada uma tem uma função dentro da pós-produção. Elas ficam na barra de baixo da tela, na ordem em que o trabalho costuma acontecer.
          </p>
        </Prose>

        <DataTable
          caption="As páginas do Resolve, para que servem e se o colorista as usa"
          head={['Página', 'Pra que serve', 'O colorista usa?']}
          rows={[
            ['Media', 'Trazer os arquivos do computador pro projeto e organizar no Media Pool', 'Sim, no começo'],
            ['Cut', 'Montagem rápida, pra prazo curto', 'Raramente'],
            ['Edit', 'Montagem completa do filme na timeline', 'Às vezes, pra conferir o corte'],
            ['Fusion', 'Efeitos visuais e motion graphics', 'Raramente'],
            ['Color', 'Correção de cor e color grading', 'Sim, o tempo todo'],
            ['Fairlight', 'Áudio: edição e mixagem', 'Não'],
            ['Deliver', 'Exportar o filme final', 'Sim, no final'],
          ]}
        />

        <ResolvePagesBar />

        <Prose>
          <p>
            Pra o que a gente vai fazer aqui, a página que mais interessa é a Color. É nela que você vai passar a maior parte do tempo. A Media e a Deliver entram nas pontas: uma pra trazer o material, a outra pra entregar o filme.
          </p>
        </Prose>
        <Note>Um atalho que ajuda: as páginas têm números. Shift + 6 te leva direto pra Color, e Shift + 8 pra Deliver.</Note>
      </EditorialSection>

      {/* ===================== ORGANIZAÇÃO ===================== */}
      <EditorialSection
        id="organizacao-resolve"
        kickerLeft="ANTES DE COLORIR"
        kickerRight="PROJETOS E BACKUP"
        title="ORGANIZAÇÃO: ANTES DE COLORIR, ARRUME A CASA"
      >
        <Prose>
          <p>
            Antes de abrir a Color, a gente precisa entender onde o Resolve guarda o trabalho e como manter tudo organizado. Isso parece burocracia, mas é o que salva você quando o cliente volta três meses depois pedindo uma versão nova, ou quando o computador resolve dar problema.
          </p>
        </Prose>

        <Sub title="O Project Manager">
          <Prose>
            <p>
              O Project Manager é a tela onde ficam todos os seus projetos. Você abre ele com Shift + 1 ou clicando no ícone de casinha no canto inferior direito. Ali você cria, abre, renomeia, organiza em pastas, exporta e arquiva projetos.
            </p>
            <p>
              Uma dica de organização: crie pastas por cliente ou por ano, e dê nomes que façam sentido, tipo “2026_MarcaX_Comercial30s”. Em pouco tempo você vai ter dezenas de projetos, e achar o certo vira um problema.
            </p>
          </Prose>
        </Sub>

        <Sub title="O Resolve não salva arquivo, salva em banco de dados">
          <Prose>
            <p>
              Aqui tem uma diferença importante pra quem vem do Premiere ou do Final Cut, tá? O Resolve não salva cada projeto como um arquivo solto no seu computador. Os projetos ficam dentro de um banco de dados central, chamado Project Library.
            </p>
            <p>
              Você pode ter mais de uma library: uma pros trabalhos de cliente, outra pros estudos, por exemplo. Elas aparecem no painel lateral do Project Manager, em Show/Hide Project Libraries.
            </p>
          </Prose>
        </Sub>

        <Sub title="Backup: não deixe pra depois">
          <Prose>
            <p>
              Como tudo fica num banco de dados só, se ele der problema, você perde tudo de uma vez. Por isso, configure o backup logo no primeiro dia:
            </p>
          </Prose>
          <Bullets
            single
            items={[
              { label: 'Live Save:', text: 'em Preferences > User > Project Save and Load, ative o Live Save. Ele salva cada alteração na hora.' },
              { label: 'Project Backups:', text: 'na mesma tela, ative os backups automáticos e escolha a frequência e a pasta. Pra restaurar, é no Project Manager, com o botão direito em Project Backups.' },
              { label: 'Backup da library:', text: 'de tempos em tempos, faça o backup manual da library inteira, pelo ícone de detalhes no painel de libraries. Ele gera um arquivo .diskdb que você restaura em outro computador.' },
            ]}
          />
        </Sub>

        <Sub title="Exportar x arquivar">
          <Prose>
            <p>São duas coisas diferentes, e vale entender a diferença:</p>
          </Prose>
          <Bullets
            single
            items={[
              { label: 'Export Project:', text: 'gera um arquivo pequeno com o projeto, mas sem as mídias, só com os links pra elas. Serve pra mandar pra outro colorista que tem acesso ao mesmo material.' },
              { label: 'Export Project Archive:', text: 'gera uma pasta com o projeto e uma cópia de todas as mídias usadas. É o ideal pra guardar o trabalho depois de aprovado, porque tudo fica junto. Só que é pesado e demora.' },
            ]}
          />
        </Sub>

        <Sub title="Media Pool e gerenciamento de cor">
          <Prose>
            <p>
              Na página Media, você traz os arquivos pro Media Pool. Organize em bins (pastas): material bruto, referências, áudio, gráficos. No color, as referências do cliente, como fotos do produto e o manual da marca, ficam fáceis de achar.
            </p>
            <p>
              Antes de colorir, configure também o gerenciamento de cor do projeto em Project Settings &gt; Color Management: o espaço de entrada, o de trabalho e o de saída. A gente já falou disso na análise técnica, e é aqui que essa informação vira configuração.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== PÁGINA COLOR ===================== */}
      <EditorialSection
        id="pagina-color"
        kickerLeft="O AMBIENTE"
        kickerRight="ONDE A IMAGEM TOMA FORMA"
        title="A PÁGINA COLOR: É AQUI QUE A IMAGEM TOMA FORMA"
      >
        <Prose>
          <p>
            Quando você chega na página Color, encontra um ambiente pensado pra transformar e finalizar a imagem. Diferente da Edit, onde a preocupação é montar o filme, aqui cada elemento existe pra você analisar, controlar e construir a aparência de cada plano.
          </p>
          <p>No começo pode parecer muita coisa, mas cada área tem uma função bem específica:</p>
        </Prose>
        <AnnotatedFig file="color-page.webp" alt="Interface da página Color" width={2000} height={1264} spots={COLOR_PAGE_SPOTS} />

        <DataTable
          caption="As áreas da página Color, onde ficam e para que servem"
          head={['Área', 'Onde fica', 'Pra que serve']}
          rows={COLOR_AREAS.map((a) => [a.name, a.where, a.use])}
        />

        <Prose>
          <p>
            A ideia é você terminar esse artigo olhando pra página Color e já sabendo onde está cada coisa e pra que ela serve. Aí sim a gente começa a trabalhar a imagem.
          </p>
        </Prose>
      </EditorialSection>

      {/* ===================== NODES ===================== */}
      <EditorialSection
        id="nodes-resolve"
        kickerLeft="A ESTRUTURA"
        kickerRight="O CAMINHO DA IMAGEM"
        title="NODES: A IMAGEM PASSA POR AQUI"
      >
        <Prose>
          <p>
            No Resolve, o tratamento da imagem é construído numa sequência de nodes. Cada node recebe a imagem, aplica um ou mais ajustes e manda o resultado pro próximo. Um node pode cuidar do gerenciamento de cor, outro da exposição, outro do balanço de branco, outro do look. A combinação disso tudo forma o node tree, que é o caminho da imagem dentro do color grading.
          </p>
        </Prose>
        <Fig file="NODES.webp" alt="Node Graph no DaVinci Resolve" />

        <Sub title="A ordem importa">
          <Prose>
            <p>
              Os ajustes acontecem na ordem em que os nodes estão ligados. Uma mudança no começo da cadeia muda o que chega nos nodes seguintes. Por isso, a organização do node tree acompanha o fluxo de trabalho: transformação de entrada, primárias, secundárias, look e transformação de saída.
            </p>
            <p>
              A regra prática é: uma ideia por node, com nome. Assim você liga e desliga cada um (Command/Ctrl + D) pra ver o que ele está fazendo de verdade.
            </p>
          </Prose>
        </Sub>

        <Sub title="Os tipos de node">
          <DataTable
            caption="Os tipos de node, como funcionam e quando usar"
            head={['Node', 'Como funciona', 'Quando usar']}
            rows={NODE_TYPES.map((n) => [n.name, n.how, n.when])}
          />
          <Prose>
            <p>
              Não confunda os mixers, tá? O Parallel Mixer soma correções, o Layer Mixer sobrepõe camadas e o Key Mixer junta seleções. E também não confunda Shared com Compound: o Shared reaproveita uma correção em vários lugares; o Compound só organiza.
            </p>
          </Prose>
          <NodeDiagrams
            items={[
              { file: 'nodes/serial.png', alt: 'Diagrama de nodes conectados em série', label: 'Serial' },
              { file: 'nodes/paralelo.png', alt: 'Diagrama de nodes paralelos ligados a um Parallel Mixer', label: 'Parallel' },
              { file: 'nodes/layer.png', alt: 'Diagrama de nodes combinados em camadas', label: 'Layer Mixer' },
              { file: 'nodes/outside.png', alt: 'Diagrama de Outside Node depois de uma seleção', label: 'Outside' },
              { file: 'nodes/spliter.png', alt: 'Diagrama de Splitter separando os canais', label: 'Splitter' },
              { file: 'nodes/combiner.png', alt: 'Diagrama de Combiner reunindo os canais', label: 'Combiner' },
              { file: 'nodes/key%20mixer.png', alt: 'Diagrama de nodes ligados a um Key Mixer', label: 'Key Mixer' },
            ]}
          />
          <NodeQuiz />
        </Sub>

        <Sub title="Grupos e o node tree do filme inteiro">
          <Prose>
            <p>
              Além dos nodes de cada clipe, o Resolve tem os grupos, com três estágios: Pre-Clip (a parte técnica que vale pra todos), Clip (o ajuste de cada take) e Post-Clip (o look do grupo). Num comercial, isso permite mexer no look do filme inteiro num lugar só.
            </p>
            <p>
              Não existe uma árvore ideal pra todas as cenas. A melhor estrutura é a que te deixa fazer os ajustes com clareza e controle, sem complicar mais do que o projeto precisa. Quando achar a sua, salve como template e use em todo projeto.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== PRIMÁRIAS ===================== */}
      <EditorialSection
        id="primarias-resolve"
        kickerLeft="IMAGEM INTEIRA"
        kickerRight="FERRAMENTAS ESPECÍFICAS"
        title="PRIMÁRIAS E FERRAMENTAS ESPECÍFICAS"
      >
        <Prose>
          <p>
            As primárias são o primeiro conjunto de ferramentas que a gente usa. Elas trabalham a imagem inteira: exposição, contraste, balanço de cor e saturação. O objetivo aqui é criar uma base sólida, deixando os planos equilibrados e neutros antes das correções mais específicas.
          </p>
        </Prose>
        <Fig file="PRIMARIES.webp" alt="Painel Primaries no DaVinci Resolve" />

        <Sub title="Color Wheels: Lift, Gamma, Gain e Offset">
          <Prose>
            <p>
              As Color Wheels são a interface mais usada nas primárias. Cada roda cuida de uma região: Lift nas sombras, Gamma nos médios, Gain nas altas luzes e Offset na imagem toda. Você mexe no ponto dentro da roda pra mudar a cor daquela região, e na barra de baixo pra mudar a quantidade de luz.
            </p>
            <p>
              O legal é que o mesmo controle serve pra corrigir e pra criar. A roda que neutraliza uma dominante nas sombras também pode, no creative grade, deixar as sombras um pouco mais frias de propósito.
            </p>
          </Prose>
          <Fig file="COLOR WHEELS.webp" alt="Painel das Color Wheels" />
        </Sub>

        <Sub title="Primary Bars e Log Wheels">
          <Prose>
            <p>
              As Primary Bars fazem a mesma coisa que as rodas, mas com barras separadas por canal, o que dá mais precisão num ajuste fino. Já as Log Wheels (Shadow, Midtone e Highlight) trabalham faixas mais estreitas da escala tonal. Elas servem pra mexer nas sombras sem mexer tanto nos médios, por exemplo. São ótimas pra refinar depois que a base está pronta.
            </p>
          </Prose>
          <Fig file="LOG WHEELS.webp" alt="Painel das Log Wheels" />
        </Sub>

        <Sub title="HDR: ajuste preciso por faixa tonal">
          <Prose>
            <p>
              A palette HDR divide a imagem em mais zonas: Black, Dark, Shadow, Light, Highlight e Specular, além do Global. Cada zona tem seu controle de luz e cor, então dá pra mexer numa faixa sem afetar as vizinhas. No produto, isso ajuda muito a segurar o brilho especular de um vidro ou de um metal sem escurecer o resto.
            </p>
          </Prose>
          <Fig file="HDR.webp" alt="Painel HDR" />
        </Sub>

        <Sub title="RGB Mixer: os canais de cor">
          <Prose>
            <p>
              O RGB Mixer controla como os canais vermelho, verde e azul contribuem pra cada canal de saída. Ele é útil pra balanço, separação de cor e criação de look, e também pra transformar a imagem em preto e branco escolhendo quanto de cada canal entra. Como ele mexe direto na estrutura do sinal, pequenas mudanças fazem bastante diferença, tá?
            </p>
          </Prose>
          <Fig file="RGB MIXER.webp" alt="Painel RGB Mixer" />
        </Sub>

        <Sub title="Curves: contraste, matiz e saturação">
          <Prose>
            <p>
              As curvas relacionam o valor de entrada com o de saída. Na Custom Curve você constrói contraste com muito controle, adicionando pontos na diagonal. Além dela, o Resolve tem as curvas que relacionam uma propriedade com outra:
            </p>
          </Prose>
          <Fig file="CURVES.webp" alt="Painel Curves" />
          <Bullets
            single
            items={[
              { label: 'Hue vs Hue:', text: 'muda uma cor pra outra, tipo puxar um vermelho alaranjado de volta pro vermelho da marca.' },
              { label: 'Hue vs Sat:', text: 'muda a saturação de uma cor só.' },
              { label: 'Hue vs Lum:', text: 'clareia ou escurece uma cor só.' },
              { label: 'Lum vs Sat:', text: 'controla a saturação por faixa de luz, tipo tirar cor das sombras.' },
              { label: 'Sat vs Sat:', text: 'segura o que já está muito saturado.' },
            ]}
          />
          <Prose>
            <p>No filme de produto, essas curvas são uma mão na roda pra acertar a cor da embalagem sem precisar de máscara.</p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== ISOLAMENTO ===================== */}
      <EditorialSection
        id="isolamento-resolve"
        kickerLeft="SECUNDÁRIAS"
        kickerRight="SÓ NUM PEDAÇO DA IMAGEM"
        title="ISOLAMENTO: MEXER SÓ NUM PEDAÇO DA IMAGEM"
      >
        <Prose>
          <p>
            As ferramentas de isolamento são as que a gente usa nas secundárias. Elas definem onde um ajuste vai acontecer, seja por cor, por forma ou por inteligência artificial.
          </p>
        </Prose>

        <Sub title="Qualifier: seleção por cor">
          <Prose>
            <p>
              O Qualifier seleciona partes da imagem por matiz, saturação e luminosidade (HSL). Você escolhe a cor, e o ajuste do node passa a valer só ali. Serve pra pele, céu, vegetação e, no nosso caso, pro produto: a cor de uma lata, de um rótulo, de uma embalagem.
            </p>
            <p>
              A qualidade da seleção depende da imagem (lembra da amostragem 4:2:0?) e dos ajustes. Pra limpar a seleção, use o Matte Finesse: Denoise, Blur Radius, Clean Black e Clean White. E aperte Shift + H pra ver exatamente o que está selecionado.
            </p>
          </Prose>
          <Fig file="QUALIFIER.webp" alt="Painel Qualifier" />
        </Sub>

        <Sub title="Power Windows: seleção por forma">
          <Prose>
            <p>
              As Power Windows são máscaras: círculo, retângulo, polígono, curva livre e gradiente linear. Aqui o que define a área é a posição e a forma, não a cor. Com o feather, você suaviza a borda pra o ajuste não parecer recortado.
            </p>
            <p>
              Elas servem pra direcionar o olhar, equilibrar luz e separar elementos: escurecer um pouco o fundo, dar uma luz no rótulo, recuperar uma área estourada.
            </p>
          </Prose>
          <Fig file="POWER WINDOWS.webp" alt="Painel Power Windows" />
        </Sub>

        <Sub title="Tracker: acompanhando o movimento">
          <Prose>
            <p>
              Quando o produto ou a câmera se mexem, o Tracker acompanha o movimento e faz a window ir junto, quadro a quadro, sem você reposicionar na mão. Ele funciona melhor em áreas com contraste e textura. Se errar em algum trecho, dá pra corrigir manualmente.
            </p>
          </Prose>
          <Fig file="TRACKER.webp" alt="Painel Tracker" />
        </Sub>

        <Sub title="Magic Mask: seleção por inteligência artificial">
          <Prose>
            <p>
              O Magic Mask usa inteligência artificial pra isolar pessoas e objetos. Você marca o elemento e o Resolve gera a máscara e acompanha o movimento. No Resolve 20 ele ganhou uma nova versão, com marcação por pontos e re-rastreamento. Ele é ótimo quando separar um produto do fundo daria muito trabalho com window e qualifier.
            </p>
          </Prose>
          <Fig file="MAGIC MASK.webp" alt="Painel Magic Mask" />
        </Sub>

        <Sub title="Key: a força do seu node">
          <Prose>
            <p>
              A palette Key controla a intensidade da seleção que entra no node e da correção que sai dele. O Key Output Gain, por exemplo, diminui a força de um ajuste sem você precisar mexer nos parâmetros. É tipo uma opacidade do node, e ajuda muito a integrar uma secundária na imagem.
            </p>
          </Prose>
          <Fig file="KEY.webp" alt="Painel Key" />
        </Sub>

        <Sub title="Blur, Sharpen e Sizing">
          <Prose>
            <p>
              O Blur suaviza detalhes, e o Sharpen reforça contornos. Em produto, um pouco de sharpen pode valorizar a textura de um tecido ou de um rótulo, mas cuidado com ruído e compressão, porque ele realça os defeitos também. Já o Sizing cuida de posição, escala e rotação, útil pra pequenos reenquadramentos e pras versões em outros formatos, como o vertical pras redes.
            </p>
          </Prose>
          <Fig file="BLUR E SHARPEN.webp" alt="Painel Blur e Sharpen" />
          <Fig file="SIZING.webp" alt="Painel Sizing" />
        </Sub>
      </EditorialSection>

      {/* ===================== ANÁLISE E COMPARAÇÃO ===================== */}
      <EditorialSection
        id="analise-e-comparacao-resolve"
        kickerLeft="MEDIR E COMPARAR"
        kickerRight="SCOPES, STILLS E VERSIONS"
        title="ANÁLISE E COMPARAÇÃO: NÃO CONFIE SÓ NO SEU MONITOR"
      >
        <Prose>
          <p>
            O olho engana, tá? Depois de alguns minutos olhando uma imagem, ele se acostuma com uma dominante e para de enxergar. Por isso a gente tem ferramentas pra medir e pra comparar.
          </p>
        </Prose>

        <Sub title="Scopes">
          <Prose>
            <p>
              Os scopes mostram matematicamente como o sinal está distribuído. Enquanto a imagem mostra como o plano é percebido, o scope mostra o que realmente está lá.
            </p>
          </Prose>
          <Fig file="SCOPES.webp" alt="Scopes no DaVinci Resolve" />
          <DataTable
            caption="Os scopes, o que mostram e para que a gente usa"
            head={['Scope', 'O que mostra', 'Pra que a gente usa']}
            rows={[
              ['Waveform', 'A luz da imagem, da esquerda pra direita', 'Exposição, pretos, altas luzes, clipping'],
              ['Parade', 'Waveform separado em R, G e B', 'Balanço de branco e dominantes'],
              ['Vectorscope', 'Matiz e saturação num círculo', 'Neutros, saturação e cor do produto'],
              ['Histogram', 'Quantos pixels tem em cada nível de luz', 'Distribuição geral de tons'],
            ]}
          />
          <Prose>
            <p>
              Eles ajudam a comparar planos: diferenças de balanço, contraste e níveis de preto que passam batido no monitor aparecem na hora no scope.
            </p>
          </Prose>
        </Sub>

        <Sub title="Split Screen">
          <Prose>
            <p>
              O Split Screen mostra duas ou mais imagens ao mesmo tempo no viewer. Um plano pode parecer equilibrado sozinho e mostrar uma diferença clara quando você coloca do lado de outro da mesma sequência. Ele também serve pra comparar com referências e testar versões.
            </p>
          </Prose>
          <Fig file="SPLIT SCREEN.webp" alt="Split Screen no DaVinci Resolve" />
        </Sub>

        <Sub title="Gallery">
          <Prose>
            <p>
              A Gallery é a memória visual do projeto. Ali você guarda stills dos planos (Option/Ctrl + Alt + G), compara com o wipe (Command/Ctrl + W) e copia grades de um plano pro outro. No produto, o still do packshot aprovado vira a régua do filme inteiro.
            </p>
            <p>
              Os stills podem ser organizados em álbuns. E as PowerGrades guardam grades e estruturas de nodes pra usar em outros projetos, como os seus templates de node tree.
            </p>
          </Prose>
          <Fig file="GALLERY.webp" alt="Gallery no DaVinci Resolve" />
        </Sub>

        <Sub title="Color Match">
          <Prose>
            <p>
              Quando o projeto tem duas ou três câmeras, cada sensor responde de um jeito. O Color Match usa uma cartela de cor (ColorChecker) filmada no set pra alinhar todas as câmeras numa base neutra. Você encaixa o grid sobre a cartela e o Resolve faz o ajuste. Primeiro você iguala todo mundo, depois cria o estilo do filme.
            </p>
          </Prose>
          <Fig file="COLOR MATCH.webp" alt="Painel Color Match" />
        </Sub>

        <Sub title="Versions">
          <Prose>
            <p>
              As Versions deixam você testar caminhos diferentes no mesmo clipe sem perder o tratamento anterior. Command/Ctrl + Y cria uma versão nova. Perfeito pra quando o cliente quer ver duas ou três opções de look.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== NA PRÁTICA ===================== */}
      <EditorialSection
        id="resolve-na-pratica"
        kickerLeft="NA PRÁTICA"
        kickerRight="COMERCIAL DE PRODUTO"
        title="NA PRÁTICA: ONDE CADA FERRAMENTA ENTRA NUM COMERCIAL DE PRODUTO"
      >
        <Prose>
          <p>
            Bora juntar tudo. Imagina aquele VT de 30 segundos de um energético, com lata em estúdio, take em parque, take em balada e o packshot final. Olha onde cada ferramenta aparece:
          </p>
        </Prose>
        <NumberedSteps
          items={[
            { title: 'Project Manager.', text: 'Crie o projeto com um nome claro, na pasta do cliente, e confira se o Live Save e os backups estão ligados.' },
            { title: 'Project Settings.', text: 'Configure o gerenciamento de cor: entrada no log da câmera e saída em Rec.709.' },
            { title: 'Media.', text: 'Importe o material e as referências da marca. Organize em bins.' },
            { title: 'Color: nodes.', text: 'Aplique seu template de node tree em todos os takes e coloque o VT num grupo.' },
            { title: 'Primary wheels, HDR e scopes.', text: 'Faça as primárias de todos os takes olhando waveform e parade.' },
            { title: 'Gallery e Split Screen.', text: 'Salve um still do packshot (o hero) e iguale os outros takes a ele com o wipe.' },
            { title: 'Qualifier, Power Windows, Tracker e Magic Mask.', text: 'Isole a lata e acerte a cor da marca em todos os takes. Use Shift + H pra conferir a seleção.' },
            { title: 'Curves e Key.', text: 'Use Hue vs Hue e Hue vs Sat pra ajustes finos de cor, e o Key Output Gain pra dosar.' },
            { title: 'Group Post-Clip e Versions.', text: 'Monte o look no grupo e crie duas ou três versões pro cliente escolher.' },
            { title: 'Deliver.', text: 'Exporte nos formatos pedidos e, depois de aprovado, arquive o projeto pelo Project Manager.' },
          ]}
        />
        <Prose>
          <p>
            Cada ferramenta tem um momento certo, então não precisa aprender todas de uma vez. Aprendendo essas, você já consegue fazer um comercial do começo ao fim.
          </p>
        </Prose>
      </EditorialSection>

      {/* ===================== ATALHOS ===================== */}
      <EditorialSection
        id="atalhos-resolve"
        kickerLeft="VELOCIDADE"
        kickerRight="MEMÓRIA MUSCULAR"
        title="ATALHOS QUE VOCÊ PRECISA COMEÇAR A USAR"
      >
        <Prose>
          <p>
            O color grading tem centenas de pequenas ações repetidas: criar node, trocar de plano, comparar, ver máscara, salvar still. Os atalhos deixam você concentrado na imagem em vez de ficar caçando botão. Dá pra personalizar tudo em Keyboard Customization, então se o seu teclado foi modificado, as combinações podem mudar.
          </p>
        </Prose>

        <DataTable
          caption="Atalhos do Resolve no macOS e no Windows"
          head={['Ação', 'macOS', 'Windows']}
          rows={[
            ['Abrir o Project Manager', 'Shift + 1', 'Shift + 1'],
            ['Ir pra página Color', 'Shift + 6', 'Shift + 6'],
            ['Reproduzir pra trás / pausar / pra frente', 'J / K / L', 'J / K / L'],
            ['Próximo clipe / clipe anterior', '↓ / ↑', '↓ / ↑'],
            ['Novo Serial Node', 'Option + S', 'Alt + S'],
            ['Novo Parallel Node', 'Option + P', 'Alt + P'],
            ['Novo Layer Node', 'Option + L', 'Alt + L'],
            ['Novo Outside Node', 'Option + O', 'Alt + O'],
            ['Ligar / desligar o node', 'Command + D', 'Ctrl + D'],
            ['Ligar / desligar todo o grade', 'Shift + D', 'Shift + D'],
            ['Resetar o node', 'Shift + Home', 'Shift + Home'],
            ['Ver a máscara (highlight)', 'Shift + H', 'Shift + H'],
            ['Salvar still', 'Option + Command + G', 'Ctrl + Alt + G'],
            ['Wipe com o still', 'Command + W', 'Ctrl + W'],
            ['Nova Version', 'Command + Y', 'Ctrl + Y'],
          ]}
          minWidth={520}
        />

        <Note>
          Aprenda primeiro os que você repete o tempo inteiro: Option/Alt + S pra criar node, Command/Ctrl + D pra conferir um node, Shift + D pra comparar com o original, Shift + H pra ver máscara, Command/Ctrl + W pra comparar referência e J, K, L pra navegar. Depois que isso vira memória muscular, a interface meio que some e você passa muito mais tempo olhando pra imagem.
        </Note>
      </EditorialSection>

      {/* ===================== CONCLUSÃO ===================== */}
      <EditorialSection
        id="conclusao-resolve"
        kickerLeft="RESUMO"
        kickerRight="UM MOMENTO CERTO PARA CADA FERRAMENTA"
        title="CONCLUSÃO"
      >
        <Prose>
          <p>
            O DaVinci Resolve parece assustador no começo, mas ele é bem organizado: cada página tem uma função, e cada ferramenta da página Color tem um momento certo dentro do fluxo de trabalho. Organização e backup primeiro, primárias depois, isolamento nas secundárias, scopes e comparação o tempo todo.
          </p>
          <p>
            Não tenta aprender tudo de uma vez, tá? Domina essas ferramentas, cria o seu template de nodes e decora os atalhos principais. O resto vem com a prática.
          </p>
        </Prose>
      </EditorialSection>
    </article>
  );
}
