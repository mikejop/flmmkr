'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Árvore de nodes da correção primária (take da garrafa), no mesmo estilo do node graph da aula
 * "Fluxo de trabalho": quadro escuro com grade, nodes com miniatura e portas, fios entre eles.
 * Clique (ou Enter / Espaço) em um node para ver, no painel abaixo, a ferramenta usada e o que foi feito.
 */

type Zone = 'primary' | 'secondary' | 'both' | 'mix';

interface TreeNode {
  id: string;
  num: string;
  label: string;
  zone: Exclude<Zone, never>;
  x: number;
  y: number;
  filter: string;
  thumb?: string;
  tool: string;
  did: string;
  text: string;
}

const ACCENT: Record<Zone, string> = { primary: '#e8c27a', secondary: '#d993c4', both: '#8cbfd6', mix: '#a8a8a8' };
const ZONE_NAME: Record<Zone, string> = { primary: 'Luz', secondary: 'Cor', both: 'Gerenciamento de cor', mix: 'Só medição' };

const VIEW_W = 1380;
const ROW1 = 225;
const ROW2 = 700;

const NODES: TreeNode[] = [
  {
    id: 'idt', num: '01', label: 'IDT', zone: 'both', x: 130, y: ROW1, filter: 'ptg-log',
    tool: 'ACES Transform', did: 'F-Log2 C → ACEScct',
    text: 'Primeiro node: o Input Device Transform, a entrada. Pega a informação da câmera (uma Fuji em F-Log2 C) e transforma no espaço de trabalho, o ACEScct. Nesse projeto o suporte pra essa câmera estava no ACES Transform e não no Color Space Transform. Se o seu log não aparece numa ferramenta, procure na outra.',
  },
  {
    id: 'exposure', num: '02', label: 'Exposição', zone: 'primary', x: 330, y: ROW1, filter: 'ptg-log',
    tool: 'Color Wheels (Gamma)', did: 'Baixou o Gamma até escurecer o logo',
    text: 'Fica logo depois do IDT e guarda o ajuste geral de iluminação. Como o logo da garrafa não podia aparecer, o Gamma foi arrastado pra esquerda, baixando um pouco os médios e segurando o preto.',
  },
  {
    id: 'wb', num: '03', label: 'White Balance', zone: 'secondary', x: 520, y: 105, filter: 'ptg-neutral',
    tool: 'Conta-gotas de White Balance', did: 'Neutralizou o branco (R 229, G 228, B 230)',
    text: 'Node paralelo, criado com Alt + P (Option + P no Mac). Antes de escolher a ferramenta, a diferença foi medida com Show Picker RGB Value, e era mínima. Então o conta-gotas resolveu, sem precisar de printer light.',
  },
  {
    id: 'black', num: '04', label: 'Black', zone: 'secondary', x: 520, y: 375, filter: 'ptg-neutral',
    tool: 'Pick Black Point + Lift', did: 'Deixou o preto neutro',
    text: 'Paralelo ao White Balance, então um não interfere no outro. O Pick Black Point corrige a cor da parte mais escura. A imagem afunda, e o Lift sobe até ela voltar. Na garrafa o preto já estava preto, mas o processo é esse.',
  },
  {
    id: 'hdr', num: '05', label: 'HDR', zone: 'primary', x: 860, y: ROW1, filter: 'ptg-neutral',
    tool: 'Specular, Highlight e Shadow', did: 'Baixou os picos e clareou o fundo até a faixa verde do false color',
    text: 'Palette HDR, com o gamma configurado pro mesmo espaço de trabalho (ACEScct). O Specular baixou só os picos do waveform, o Highlight desceu um pouco, e o Shadow subiu até o fundo ficar verde no false color, pra marcar a silhueta da garrafa.',
  },
  {
    id: 'contrast', num: '06', label: 'Contraste', zone: 'primary', x: 1050, y: ROW1, filter: 'ptg-contrast',
    tool: 'Contrast do HDR, Highlights e Black', did: 'Marcou a silhueta sem mexer na saturação',
    text: 'Usa o contraste do HDR, não o das Color Wheels: o do HDR mexe só na luminosidade e preserva a saturação. Depois de subir o contraste, os Highlights desceram um pouco e o Black subiu um pouco, pra controlar os extremos.',
  },
  {
    id: 'saturation', num: '07', label: 'Saturação', zone: 'secondary', x: 130, y: ROW2, filter: 'ptg-sat',
    tool: 'Color Slice', did: 'Aumentou levemente a saturação',
    text: 'Só uma corzinha. Subindo muito, a imagem rasga e fica alaranjada. No produto, cuidado redobrado: embalagem costuma ter cor forte, e é a primeira coisa que estoura o canal. Na dúvida, use menos.',
  },
  {
    id: 'shadow', num: '08', label: 'Shadow', zone: 'primary', x: 330, y: ROW2 - 120, filter: 'ptg-contrast',
    tool: 'Log Wheels', did: 'Descolou do preto a parte que estava muito escura',
    text: 'Node paralelo ao Highlight, como o White Balance e o Black. As Log Wheels trabalham faixas mais estreitas da escala tonal do que as Color Wheels, então dá pra mexer na sombra sem afetar tanto os médios. Um pouquinho no Shadow e a parte colada no preto descolou.',
  },
  {
    id: 'highlight', num: '09', label: 'Highlight', zone: 'primary', x: 330, y: ROW2 + 150, filter: 'ptg-contrast',
    tool: 'Log Wheels', did: 'Recuperou um pouco de detalhe nas altas luzes',
    text: 'Paralelo ao Shadow. Baixou um pouco as altas luzes pra recuperar detalhe. Dá pra juntar Shadow e Highlight num node só; aqui eles ficaram separados pra ficar mais fácil de entender. Comparando com Ctrl/Command + D, dá pra ver o detalhe ganho nas sombras.',
  },
  {
    id: 'odt', num: '10', label: 'ODT', zone: 'both', x: 660, y: ROW2, filter: 'ptg-neutral',
    tool: 'ACES Transform', did: 'ACEScct → Rec.709',
    text: 'Último node do grading: o Output Device Transform, a saída. Pega o espaço de trabalho (ACEScct) e transforma em Rec.709, o espaço que a gente usa pra projetar o filme.',
  },
];

const GRAPH_CSS = `
.ptg{--canvas:#262626;--grid:#2e2e2e;--node:#353535;--node-border:#4a4a4a;--selected:#e5473c;--text:#d4d4d4;--muted:#8a8a8a;--wire:#8c8c8c;--rgb:#8fd400;--key:#2aa9f0;
  background:var(--canvas);color:var(--text);}
.ptg-flow{background-color:var(--canvas);background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:50px 50px;overflow-x:auto;-webkit-overflow-scrolling:touch;}
.ptg-canvas{position:relative;min-width:880px;max-width:1400px;margin:0 auto;}
.ptg-flow svg{display:block;width:100%;height:auto;}
.ptg .wire{stroke:var(--wire);stroke-width:2.5;fill:none;stroke-linecap:round;stroke-linejoin:round;}
.ptg .node{cursor:pointer;outline:none;}
.ptg .node .body{stroke:var(--node-border);stroke-width:1.5;transition:stroke .15s,filter .15s;}
.ptg .node.z-primary .body{fill:#3a3631;}
.ptg .node.z-secondary .body{fill:#3a3238;}
.ptg .node.z-both .body{fill:#30373a;}
.ptg .node.z-mix .body{fill:var(--node);}
.ptg .node:hover .body{stroke:#7a7a7a;}
.ptg .node.selected .body{stroke:var(--selected);stroke-width:2;filter:drop-shadow(0 0 6px rgba(229,71,60,.35));}
.ptg .node:focus-visible .body{stroke:#b0b0b0;}
.ptg .node .bar{fill:#8ea2c4;}
.ptg .node .num{fill:#f2f2f2;font-size:20px;font-weight:500;}
.ptg svg text{font-family:inherit;}
.ptg .lbl{fill:var(--text);font-size:13px;text-anchor:middle;}
.ptg .port-rgb{fill:var(--rgb);stroke:#141414;stroke-width:1;}
.ptg .port-key{fill:var(--key);stroke:#141414;stroke-width:1;}
.ptg .hint{fill:#6f6f6f;font-size:12px;text-anchor:middle;}
.ptg .io .pill{fill:#3a3a3a;stroke:#555;stroke-width:1.5;}
.ptg .io .dot{fill:var(--rgb);stroke:#141414;stroke-width:1.2;}
.ptg .io-lbl{fill:var(--muted);font-size:12px;letter-spacing:.1em;text-anchor:middle;}
@keyframes ptg-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.ptg-fade{animation:ptg-fade .25s ease;}
@media (prefers-reduced-motion:reduce){.ptg-fade{animation:none;}}
`;

/** Parallel Mixer: junta os dois nodes em paralelo. */
function ParallelMixer({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`} pointerEvents="none">
      <text className="lbl" x="17" y="-12">Parallel Mixer</text>
      <rect x="0" y="0" width="34" height="116" rx="6" fill="#353535" stroke="#4a4a4a" strokeWidth="1.5" />
      <polygon className="port-rgb" points="-15,22 -1,30 -15,38" />
      <polygon className="port-rgb" points="-15,78 -1,86 -15,94" />
      <rect className="port-rgb" x="36" y="51" width="14" height="14" />
    </g>
  );
}

function GraphNode({ node, selected, onSelect }: { node: TreeNode; selected: boolean; onSelect: (id: string) => void }) {
  return (
    <g
      className={`node z-${node.zone}${selected ? ' selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Node ${node.num}: ${node.label}`}
            transform={`translate(${node.x},${node.y})`}
      onClick={() => onSelect(node.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(node.id); } }}
    >
      <text className="lbl" x="63" y="-12">{node.label}</text>
      <rect className="body" width="126" height="110" rx="7" />
      <use href={`#${node.thumb || 'ptg-thumb'}`} x="8" y="8" width="110" height="56" filter={`url(#${node.filter})`} />
      <rect className="bar" x="8" y="70" width="110" height="5" rx="2.5" />
      <text className="num" x="18" y="99">{node.num}</text>
      <polygon className="port-rgb" points="-15,25 -1,33 -15,41" />
      <polygon className="port-key" points="-15,72 -1,80 -15,88" />
      <rect className="port-rgb" x="128" y="26" width="14" height="14" />
      <rect className="port-key" x="128" y="73" width="14" height="14" />
    </g>
  );
}

function GraphDefs() {
  return (
    <defs>
      <linearGradient id="ptg-g-top" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#ff1a1a" /><stop offset=".5" stopColor="#ff9a1a" /><stop offset="1" stopColor="#fff41a" />
      </linearGradient>
      <linearGradient id="ptg-g-bot" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#1a1aff" /><stop offset=".5" stopColor="#1a9aff" /><stop offset="1" stopColor="#1affe8" />
      </linearGradient>
      <linearGradient id="ptg-g-fade" x1="0" x2="0" y1="0" y2="1">
        <stop offset=".1" stopColor="#000" /><stop offset=".9" stopColor="#fff" />
      </linearGradient>
      <mask id="ptg-m-fade"><rect width="110" height="56" fill="url(#ptg-g-fade)" /></mask>
      <symbol id="ptg-thumb" viewBox="0 0 110 56">
        <rect width="110" height="56" fill="url(#ptg-g-top)" />
        <rect width="110" height="56" fill="url(#ptg-g-bot)" mask="url(#ptg-m-fade)" />
      </symbol>
      <filter id="ptg-log" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0.22" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.55" intercept="0.24" />
          <feFuncG type="linear" slope="0.55" intercept="0.24" />
          <feFuncB type="linear" slope="0.55" intercept="0.24" />
        </feComponentTransfer>
      </filter>
      <filter id="ptg-neutral" colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="0.8" /></filter>
      <filter id="ptg-contrast" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0.9" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="1.12" intercept="-0.05" />
          <feFuncG type="linear" slope="1.12" intercept="-0.05" />
          <feFuncB type="linear" slope="1.12" intercept="-0.05" />
        </feComponentTransfer>
      </filter>
      <filter id="ptg-sat" colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="1.15" /></filter>
    </defs>
  );
}

/** Tooltip com a ferramenta e a explicação do node clicado. Vai para o <body> (fixo na janela): fica acima de tudo. */
const TIP_W = 352;
const TIP_EDGE = 8;

const NodeTooltip = React.forwardRef<HTMLDivElement, { node: TreeNode; onClose: () => void }>(function NodeTooltip({ node, onClose }, ref) {
  return (
    <div
      ref={ref}
      data-ptg-tip
      role="dialog"
      aria-label={`Node ${node.num}: ${node.label}`}
      className="ptg-fade fixed z-[1000] space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 font-sans text-neutral-900 shadow-2xl"
      style={{ width: `min(${TIP_W}px, calc(100vw - ${TIP_EDGE * 2}px))`, visibility: 'hidden' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: ACCENT[node.zone] }} />
            <span className="tabular-nums text-neutral-900">Node {node.num}</span>
            <span aria-hidden="true">·</span>
            <span>{ZONE_NAME[node.zone]}</span>
          </p>
          <h5 className="text-lg font-black leading-tight tracking-tight">{node.label}</h5>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>
      </div>

      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Ferramenta</dt>
          <dd className="font-serif text-[15px] leading-snug text-neutral-900">{node.tool}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">O que fez</dt>
          <dd className="font-serif text-[15px] leading-snug text-neutral-900">{node.did}</dd>
        </div>
      </dl>

      <p className="border-t border-neutral-200 pt-3 font-serif text-[15px] leading-snug text-neutral-700">{node.text}</p>
    </div>
  );
});

interface FrameApi { selected: string | null; toggle: (id: string) => void }

/** Quadro do node graph (fundo escuro com grade) + tooltip + legenda. Cada gráfico só desenha o SVG. */
function NodeGraphFrame({
  nodes, viewW, ariaLabel, legend = true, children,
}: {
  nodes: TreeNode[]; viewW: number; ariaLabel: string; legend?: boolean;
  children: (api: FrameApi) => React.ReactNode;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const node = nodes.find((n) => n.id === selected) ?? null;
  const toggle = (id: string) => setSelected((cur) => (cur === id ? null : id));

  // Esc ou clique fora (do node e do tooltip) fecham o tooltip
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest('.node, [data-ptg-tip]')) setSelected(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [selected]);

  // O tooltip é fixo na janela: a posição vem do node na tela e é refeita direto no elemento a cada rolagem
  // (sem passar pelo React), então ele fica colado no node e acima de qualquer bloco.
  useLayoutEffect(() => {
    if (!node) return;
    const place = () => {
      const canvas = canvasRef.current;
      const tip = tipRef.current;
      if (!canvas || !tip) return;
      const box = canvas.getBoundingClientRect();
      const k = box.width / viewW;
      const top = box.top + node.y * k;
      const bottom = top + 110 * k;
      const centerX = box.left + (node.x + 63) * k;
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      const left = Math.min(Math.max(centerX - w / 2, TIP_EDGE), window.innerWidth - w - TIP_EDGE);
      // Abre embaixo do node; se não couber na janela, abre em cima.
      const below = bottom + 12;
      const above = top - 18 - h;
      const y = below + h > window.innerHeight - TIP_EDGE && above > TIP_EDGE ? above : below;
      tip.style.left = `${left}px`;
      tip.style.top = `${Math.max(TIP_EDGE, y)}px`;
      tip.style.visibility = bottom < 0 || top > window.innerHeight ? 'hidden' : 'visible';
    };
    place();
    document.addEventListener('scroll', place, { capture: true, passive: true });
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('scroll', place, { capture: true });
      window.removeEventListener('resize', place);
    };
  }, [node, viewW]);

  return (
    <div className="space-y-5">
      <style>{GRAPH_CSS}</style>

      <div className="ptg overflow-hidden rounded-2xl border border-[#2b2b30] font-sans">
        <section className="ptg-flow" aria-label={ariaLabel}>
          <div ref={canvasRef} className="ptg-canvas">
            {children({ selected, toggle })}
          </div>
        </section>
        {legend && (
          <ul className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#3a3a3a] px-4 py-3 font-sans text-xs text-[#b8b8b8]" aria-label="Legenda das cores dos nodes">
            {(Object.keys(ACCENT) as Zone[]).filter((z) => z !== 'mix').map((z) => (
              <li key={z} className="flex items-center gap-2">
                <span aria-hidden="true" className="h-3 w-3 rounded-[3px]" style={{ backgroundColor: ACCENT[z] }} />
                {ZONE_NAME[z]}
              </li>
            ))}
          </ul>
        )}
      </div>

      {node && createPortal(<NodeTooltip ref={tipRef} node={node} onClose={() => setSelected(null)} />, document.body)}
    </div>
  );
}

/** Árvore completa da correção primária (seção "Na prática"). */
export default function NodeTreeGraph() {
  return (
    <NodeGraphFrame
      nodes={NODES}
      viewW={VIEW_W}
      ariaLabel="Árvore de nodes da correção primária. Clique em um node para ver o que foi feito nele."
    >
      {(api) => (
        <svg viewBox="0 0 1380 1020" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Node graph: IDT, exposição, white balance e black em paralelo, HDR, contraste, saturação, shadow e highlight em paralelo e ODT">
          <title>Árvore de nodes da correção primária: IDT, exposição, white balance e black em paralelo, HDR, contraste, saturação, shadow e highlight em paralelo e ODT.</title>
          <GraphDefs />
          {/* conexões */}
          <path className="wire" d="M53 258 L115 258" />
          <path className="wire" d="M272 258 L315 258" />
          <path className="wire" d="M472 258 L505 138" />
          <path className="wire" d="M472 258 L505 408" />
          <path className="wire" d="M662 138 L725 230" />
          <path className="wire" d="M662 408 L725 286" />
          <path className="wire" d="M790 258 L845 258" />
          <path className="wire" d="M1002 258 L1035 258" />
          <path className="wire" d="M1192 258 L1240 258 L1240 540 L80 540 L80 733 L115 733" />
          <path className="wire" d="M272 733 L315 613" />
          <path className="wire" d="M272 733 L315 883" />
          <path className="wire" d="M472 613 L535 705" />
          <path className="wire" d="M472 883 L535 761" />
          <path className="wire" d="M600 733 L645 733" />
          <path className="wire" d="M802 733 L860 733" />

          {/* input */}
          <g className="io" transform="translate(40,236)">
            <rect className="pill" width="26" height="44" rx="7" /><circle className="dot" cx="13" cy="22" r="7" />
          </g>
          <text className="io-lbl" x="53" y="308">INPUT</text>

          {NODES.slice(0, 4).map((n) => <GraphNode key={n.id} node={n} selected={api.selected === n.id} onSelect={api.toggle} />)}

          <ParallelMixer x={740} y={200} />
          <ParallelMixer x={550} y={ROW2 + 33 - 58} />

          {NODES.slice(4).map((n) => <GraphNode key={n.id} node={n} selected={api.selected === n.id} onSelect={api.toggle} />)}

          {/* output */}
          <g className="io" transform="translate(860,711)">
            <rect className="pill" width="26" height="44" rx="7" /><circle className="dot" cx="13" cy="22" r="7" />
          </g>
          <text className="io-lbl" x="873" y="783">OUTPUT</text>

          <text className="hint" x="690" y="1004">Clique em um node para ver o que foi feito nele</text>
        </svg>
      )}
    </NodeGraphFrame>
  );
}

/* ------------------------------------------------------------------ só IDT e ODT (seção "IDT e ODT") */

const IDT_ODT_NODES: TreeNode[] = [
  {
    id: 'idt', num: '01', label: 'IDT', zone: 'both', x: 130, y: 117, filter: 'ptg-log',
    tool: 'ACES Transform', did: 'F-Log2 C → ACEScct',
    text: 'IDT é o Input Device Transform, a entrada. Pega a informação da câmera e transforma num espaço de cor e num gamma de trabalho. Como usar: crie o primeiro node, chame de IDT e configure o ACES Transform com o log da câmera na entrada (aqui, F-Log2 C) e o espaço de trabalho na saída (ACEScct).',
  },
  {
    id: 'odt', num: '10', label: 'ODT', zone: 'both', x: 600, y: 117, filter: 'ptg-neutral',
    tool: 'ACES Transform', did: 'ACEScct → Rec.709',
    text: 'ODT é o Output Device Transform, a saída. Pega o espaço de trabalho e transforma em Rec.709, o espaço que a gente usa pra projetar o filme. Como usar: crie o último node, chame de ODT e configure o ACES Transform com o ACEScct na entrada e o Rec.709 na saída. Todo o resto da correção fica entre os dois.',
  },
];

/** Os dois nodes do gerenciamento de cor (IDT e ODT), no mesmo estilo da árvore. Clique para ver como usar. */
export function IdtOdtGraph() {
  return (
    <NodeGraphFrame
      nodes={IDT_ODT_NODES}
      viewW={880}
      legend={false}
      ariaLabel="IDT e ODT. Clique em um node para ver como usar."
    >
      {(api) => (
        <svg viewBox="0 0 880 300" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Node graph: IDT na entrada e ODT na saída, com a correção entre os dois">
          <title>IDT na entrada e ODT na saída, com todo o resto da correção entre os dois.</title>
          <GraphDefs />

          <path className="wire" d="M53 150 L115 150" />
          <path className="wire" d="M272 150 L585 150" strokeDasharray="2 9" />
          <path className="wire" d="M742 150 L800 150" />
          <text className="hint" x="428" y="138">todo o resto da correção</text>

          <g className="io" transform="translate(40,128)">
            <rect className="pill" width="26" height="44" rx="7" /><circle className="dot" cx="13" cy="22" r="7" />
          </g>
          <text className="io-lbl" x="53" y="200">INPUT</text>

          {IDT_ODT_NODES.map((n) => <GraphNode key={n.id} node={n} selected={api.selected === n.id} onSelect={api.toggle} />)}

          <g className="io" transform="translate(800,128)">
            <rect className="pill" width="26" height="44" rx="7" /><circle className="dot" cx="13" cy="22" r="7" />
          </g>
          <text className="io-lbl" x="813" y="200">OUTPUT</text>

          <text className="hint" x="440" y="276">Clique em um node para ver como usar</text>
        </svg>
      )}
    </NodeGraphFrame>
  );
}
