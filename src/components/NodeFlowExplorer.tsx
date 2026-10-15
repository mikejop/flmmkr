'use client';

import React, { useRef, useState } from 'react';

/**
 * Fluxo de color grading em nodes (interativo).
 *
 * O quadro do node graph (SVG escuro) mantém a aparência original. Clique (ou Enter / Espaço) em um node
 * para ver, no painel abaixo, o que acontece nessa etapa e quais ferramentas do Resolve usar.
 * O painel segue a identidade do site (fundo claro, cartões brancos, azul de destaque).
 */

type ZoneKey = 'primary' | 'secondary' | 'both' | 'mix';
/** [ferramenta/item, descrição, onde fica no Resolve, só na versão Studio?] */
type Item = [string, string, string, boolean?];

interface Group {
  title: string;
  ordered?: boolean;
  items: Item[];
}

interface Stage {
  num: string;
  zone: ZoneKey;
  stage: string;
  title: string;
  summary: string;
  groups: Group[];
  tip: string;
}

// Cores das zonas do node graph (mesmas do quadro).
const ACCENT: Record<ZoneKey, string> = { primary: '#e8c27a', secondary: '#d993c4', both: '#8cbfd6', mix: '#a8a8a8' };

const STAGES: Record<string, Stage> = {
  normalize: {
    num: '01', zone: 'primary', stage: 'Primary', title: 'Normalizing / Balancing',
    summary: 'Transforme a imagem plana (log ou raw) da câmera em um ponto de partida correto e neutro. Nada criativo acontece aqui: o objetivo é exposição, contraste e balanço de branco precisos, para que todos os nodes seguintes trabalhem sobre um sinal limpo.',
    groups: [
      { title: 'Normalizar a imagem', items: [
        ['Color Space Transform', 'Converte o gamma e o gamut log da câmera (S-Log3, LogC, V-Log, BRAW Film…) para o seu espaço de trabalho ou de exibição.', 'Color Space Transform OFX'],
        ['Color management', 'Ou deixe o projeto cuidar disso com DaVinci YRGB Color Managed ou ACES, definindo o espaço de cor de entrada de cada clipe.', 'Project Settings › Color Management'],
        ['LUT do fabricante da câmera', 'Uma conversão técnica rápida, quando você confia na LUT Rec.709 oficial do fabricante.', 'Node › LUT'],
        ['Decodificação raw', 'Em BRAW, R3D ou ARRIRAW, ajuste ISO, balanço de branco, tint e exposição direto na fonte, antes de gradear.', 'Camera Raw palette'],
        ['Espaço de trabalho', 'Gradear em um gamut amplo, como DaVinci Wide Gamut / Intermediate, mantém as ferramentas consistentes entre câmeras diferentes.', 'DWG / DaVinci Intermediate'],
      ] },
      { title: 'Balancear exposição e contraste', items: [
        ['Exposição', 'Defina o brilho geral com Offset ou Gain olhando o waveform, além do monitor.', 'Primaries › Offset / Gain'],
        ['Pontos de preto e branco', 'Posicione o detalhe mais escuro e o mais claro no lugar certo, sem estourar nem esmagar.', 'Lift / Gain · Waveform'],
        ['Contraste e pivot', 'Molde o contraste em torno dos meios-tons para que sombras e altas luzes se separem de forma natural.', 'Primaries › Contrast / Pivot'],
        ['HDR zones', 'Controle fino de faixas específicas de exposição (Dark, Shadow, Light, Highlight) sem afetar o resto da imagem.', 'HDR Palette'],
      ] },
      { title: 'Balancear cor', items: [
        ['Balanço de branco', 'Neutralize dominantes de cor com Temp e Tint, ou empurrando o Offset até que brancos e cinzas fiquem neutros.', 'Temp / Tint · Offset'],
        ['RGB parade', 'Alinhe os canais vermelho, verde e azul em algo que deveria ser neutro (uma parede, um cartão cinza, uma camisa).', 'Parade scope'],
        ['Pick Black Point', 'Clique em algo que deveria ser preto (uma sombra profunda). As áreas escuras ficam mais escuras e qualquer dominante de cor nas sombras é neutralizada, ajustando o Lift. Cuidado: amostrar um ponto errado pode esmagar os pretos.', 'Primaries › Pick Black Point (Lift)'],
        ['Saturação base', 'Leve a saturação a um nível natural: imagens log costumam pedir um aumento, algumas câmeras pedem menos.', 'Saturation'],
        ['Checagem de tom de pele', 'Depois do balanço, os rostos devem ficar próximos da linha de tom de pele no vectorscope.', 'Vectorscope › Skin Tone Indicator'],
      ] },
      { title: 'Limpeza (opcional, no início)', items: [
        ['Redução de ruído', 'Reduza o ruído antes de empurrar a imagem, para que o contraste aplicado depois não amplifique grão e ruído de croma.', 'Spatial / Temporal NR', true],
        ['Aberração cromática e correção de lente', 'Remova franjas roxas e a distorção da lente antes que as secundárias dependam de bordas limpas.', 'Chromatic Aberration / Lens Correction'],
      ] },
    ],
    tip: '<b>Regra de ouro:</b> se você não sabe dizer se um plano está quente demais, escuro demais ou chapado demais, quem decide aqui são os scopes. O gosto entra depois, no Creative Grade.',
  },

  matching: {
    num: '02', zone: 'primary', stage: 'Primary', title: 'Matching',
    summary: 'Faça com que todos os planos de uma cena pareçam ter sido filmados no mesmo instante, com a mesma câmera e a mesma luz. O espectador nunca deve perceber um corte por causa de um salto de cor ou de exposição.',
    groups: [
      { title: 'Comparar planos', items: [
        ['Stills de referência', 'Salve um still do plano principal e use-o como alvo para o restante da cena.', 'Gallery › Grab Still'],
        ['Split screen e wipes', 'Veja o plano atual ao lado da referência, ou vários planos de uma vez, para identificar as diferenças.', 'Viewer › Split Screen'],
        ['Scopes lado a lado', 'Compare o waveform e o vectorscope dos dois planos: casar números é melhor do que casar no olho.', 'Waveform / Vectorscope'],
      ] },
      { title: 'O que casar', items: [
        ['Exposição e contraste', 'Mesmo nível de preto, mesma posição dos meios-tons e mesmo nível de altas luzes ao longo do corte.', 'Offset / Contrast'],
        ['Balanço de branco', 'Os neutros precisam ficar no mesmo lugar, principalmente quando a luz muda ao longo do dia.', 'Temp / Tint · Parade'],
        ['Tons de pele', 'A mesma pessoa precisa ter a mesma tonalidade de pele em todos os ângulos e lentes.', 'Vectorscope'],
        ['Saturação e densidade', 'Cores como figurino, céu e vegetação devem manter a intensidade de um plano para o outro.', 'Saturation · Curves'],
        ['Câmeras diferentes', 'Traga um plano de B-cam ou drone (outro sensor e outra curva log) para o mesmo padrão da A-cam.', 'CST · Color Match'],
      ] },
      { title: 'Ganhar velocidade', items: [
        ['Shot Match', 'Clique com o botão direito em um plano e case-o automaticamente com uma referência, como primeiro passe.', 'Shot Match to This Clip'],
        ['Match por color chart', 'Use um plano com ColorChecker para alinhar câmeras com precisão.', 'Color Match palette'],
        ['Copiar grades', 'Aplique a grade já balanceada de um clipe nos demais e depois faça o ajuste fino.', 'Apply Grade · Middle-click'],
        ['Grupos', 'Os grupos Pre-Clip e Post-Clip permitem ajustar uma câmera ou uma cena inteira em um único lugar.', 'Group Pre-Clip / Post-Clip'],
        ['Comparar na timeline', 'Confira o primeiro, o do meio e o último plano da cena, além dos vizinhos.', 'Lightbox'],
      ] },
    ],
    tip: '<b>A ordem importa:</b> balanceie cada plano primeiro (node 01) e só depois faça o matching. Casar planos desbalanceados espalha o erro pela cena inteira.',
  },

  qualifier: {
    num: '03', zone: 'secondary', stage: 'Secondary', title: 'Secondary Grade w/ Qualifier',
    summary: 'Selecione uma faixa específica de cor ou de brilho da imagem e ajuste apenas ela. O qualifier cria uma máscara a partir de matiz, saturação e luminância, então a correção acompanha a cor por onde ela se mover no quadro.',
    groups: [
      { title: 'Tipos de qualifier', items: [
        ['HSL', 'Seleciona por matiz, saturação e luminância; é o mais usado para pele, céu e vegetação.', 'Qualifier › HSL'],
        ['3D', 'Desenhe traços sobre as cores que você quer e as que não quer; ótimo para seleções difíceis.', 'Qualifier › 3D'],
        ['Luminance', 'Seleciona só pelo brilho: altas luzes, sombras ou uma faixa específica de exposição.', 'Qualifier › LUM'],
        ['RGB', 'Seleciona pelos valores de cada canal, para keys técnicas ou muito saturadas.', 'Qualifier › RGB'],
      ] },
      { title: 'O que você pode fazer', items: [
        ['Uniformizar tons de pele', 'Isole os rostos e puxe manchas vermelhas, magenta ou amarelas para um matiz consistente.', 'HSL key + Hue rotate'],
        ['Aprofundar o céu', 'Selecione o céu azul e deixe-o mais rico ou mais escuro sem tocar na pele ou nos prédios.', 'HSL key + Gain / Sat'],
        ['Controlar a vegetação', 'Desloque os verdes para amarelo, oliva ou teal, ou reduza a saturação deles.', 'HSL key + Hue / Sat'],
        ['Domar cores chamativas', 'Dessature um letreiro de neon, um carro vermelho ou uma camisa chamativa que rouba a atenção.', 'Key + Saturation'],
        ['Cor de marca ou produto', 'Faça um logotipo, uma embalagem ou um figurino bater com a cor exata desejada.', 'Key + Offset'],
        ['Separar sujeito e fundo', 'Esquente a pele do sujeito e esfrie todo o resto usando a key invertida.', 'Invert key · Outside node'],
        ['Recuperar altas luzes', 'Selecione só as áreas estouradas ou quase estouradas e reduza-as com delicadeza.', 'LUM key + Gain'],
      ] },
      { title: 'Refinar a key', items: [
        ['Highlight mode', 'Veja exatamente o que está selecionado sobre um fundo cinza, para não deixar nada importante de fora.', 'Shift + H'],
        ['Clean black / white', 'Remova buracos dentro da key e pontos soltos fora dela.', 'Matte Finesse'],
        ['Blur radius', 'Suavize as bordas da key para que a correção se misture de forma natural.', 'Matte Finesse › Blur'],
        ['Limitar com uma window', 'Combine com uma window para que a key atue só em uma região do quadro.', 'Qualifier + Power Window'],
        ['Compartilhar a key', 'Envie a key pela porta azul para controlar outros nodes.', 'Key Output'],
      ] },
    ],
    tip: '<b>Alternativas sem key:</b> as curvas Hue vs Hue, Hue vs Sat e Hue vs Lum, ou o Color Warper, costumam dar resultados mais suaves para mudanças amplas de cor.',
  },

  window: {
    num: '04', zone: 'secondary', stage: 'Secondary', title: 'Secondary Grade w/ Window',
    summary: 'Direcione a luz e a atenção desenhando uma região do quadro. As windows funcionam como um kit de iluminação digital: iluminar um rosto, escurecer um céu, aplicar uma vinheta, tudo com tracking para acompanhar o movimento.',
    groups: [
      { title: 'Formas de window', items: [
        ['Circle & Linear', 'Ovais e retângulos rápidos, para rostos, vinhetas e áreas simples.', 'Power Window'],
        ['Gradient', 'Um filtro graduado suave, como um ND grad na lente.', 'Window › Gradient'],
        ['Polygon & Curve', 'Formas personalizadas, desenhadas ponto a ponto em volta de prédios, objetos ou pessoas.', 'Window › Polygon / Curve'],
        ['Magic Mask', 'Isolamento por IA de uma pessoa, rosto, roupa ou objeto, sem precisar desenhar.', 'Magic Mask', true],
        ['Depth Map', 'Separa o primeiro plano do fundo com base na profundidade estimada.', 'Depth Map OFX', true],
      ] },
      { title: 'O que você pode fazer', items: [
        ['Reiluminar um rosto', 'Levante a exposição no rosto do sujeito para criar uma luz principal que não existia no set.', 'Circle + Gamma / Gain'],
        ['Vinheta', 'Escureça as bordas para levar o olhar ao centro do quadro.', 'Inverted circle + Offset'],
        ['Escurecer um céu estourado', 'Um gradiente no topo recupera detalhe e dá drama.', 'Gradient + Gain'],
        ['Moldar o fundo', 'Abaixe levemente o fundo para o sujeito se destacar dele.', 'Outside node + Offset'],
        ['Corrigir luz irregular', 'Equilibre uma janela estourada, um abajur ou um canto escuro dentro do plano.', 'Polygon + Gain'],
        ['Beauty work', 'Suavize a pele ou ilumine os olhos em uma área com tracking.', 'Face Refinement', true],
        ['Luz direcional', 'Adicione calor de um dos lados para sugerir luz solar ou uma luminária em cena.', 'Linear + Temp'],
      ] },
      { title: 'Como deixar invisível', items: [
        ['Softness', 'Suavize bastante as bordas; uma window dura entrega o truque.', 'Window › Soft 1-4'],
        ['Tracking', 'Faça o tracking da window para que ela siga o rosto ou o objeto ao longo do plano.', 'Tracker › Cloud / Point'],
        ['Keyframes', 'Anime o tamanho ou a posição quando só o tracking não resolve.', 'Keyframes'],
        ['Combinar com uma key', 'Use uma window para restringir um qualifier a uma pessoa ou área.', 'Window + Qualifier'],
      ] },
    ],
    tip: '<b>Mantenha sutil:</b> o espectador deve sentir o movimento da window sem enxergá-lo. Ligue e desligue o node; se você consegue enxergar a forma, suavize mais ou reduza o ajuste.',
  },

  mixer: {
    num: '—', zone: 'mix', stage: 'Node', title: 'Parallel Mixer',
    summary: 'Combina os nodes de qualifier e de window para que os dois trabalhem a partir da mesma imagem já casada, em vez de um empilhar sobre o outro. Cada secundária fica isolada, o que torna a grade previsível e fácil de ajustar.',
    groups: [
      { title: 'Por que paralelo', items: [
        ['Mesma entrada para todos', 'Cada secundária enxerga a mesma imagem vinda do Matching, então uma mudança não interfere na key da outra.', 'Add Parallel Node · Alt+P'],
        ['Fácil de ligar e desligar', 'Desative um único ramo para comparar com e sem aquela correção.', 'Ctrl / Cmd + D'],
        ['Adicionar mais ramos', 'Cada entrada extra no mixer vira mais uma secundária independente.', 'Add Input'],
      ] },
      { title: 'Alternativas', items: [
        ['Serial nodes', 'Empilhe correções uma após a outra quando cada uma deve se basear na anterior.', 'Add Serial Node · Alt+S'],
        ['Layer Mixer', 'Parecido com o paralelo, mas a entrada de baixo vence onde há sobreposição, e há modos de composição.', 'Add Layer Node · Alt+L'],
      ] },
    ],
    tip: '',
  },

  creative: {
    num: '05', zone: 'both', stage: 'Primary / Secondary', title: 'Creative Grade',
    summary: 'É aqui que o look nasce. Com a imagem balanceada, casada e refinada, você empurra cor, contraste e textura para criar um clima: um look de filme, um teal & orange de blockbuster, um tom desbotado vintage ou o que a história pedir.',
    groups: [
      { title: 'Look de filme: passo a passo', ordered: true, items: [
        ['Curva de contraste de filme', 'Uma curva em S suave, com ombro macio nas altas luzes em vez de um corte seco.', 'Custom Curves · Soft Clip'],
        ['Roll-off das altas luzes', 'Comprima as áreas mais claras para que se dissolvam suavemente no branco, como no negativo de filme.', 'Soft Clip · HDR Highlight'],
        ['Pretos levantados ou densos', 'Levante levemente a base da curva para um visual fosco, ou mantenha pretos densos para um look de cópia mais rico.', 'Custom Curves · Lift'],
        ['Split toning', 'Esfrie as sombras para teal/azul e esquente as altas luzes para âmbar, de forma sutil.', 'Log Wheels › Shadow / Highlight'],
        ['Cor subtrativa / densidade', 'Faça as cores saturadas ficarem mais escuras conforme ficam mais intensas, como nos corantes do filme.', 'Color Slice · Sat vs Lum'],
        ['Deslocamentos de matiz', 'Puxe os verdes para oliva/amarelo, os vermelhos para um carmesim mais profundo e os céus para ciano.', 'Hue vs Hue'],
        ['Domar altas luzes saturadas', 'Dessature as áreas mais claras para que os brancos fiquem limpos e não pareçam digitais.', 'Lum vs Sat'],
        ['Emulação de cópia (print)', 'Uma LUT de filme de projeção, com intensidade baixa, dá uma resposta de cor com cara de filme.', 'LUT › Rec709 Kodak 2383'],
        ['Ponto de partida completo', 'O Film Look Creator reúne curva, cor, halation, grão e mais em um único node.', 'Film Look Creator', true],
      ] },
      { title: 'Textura e óptica', items: [
        ['Grão de filme', 'Grão orgânico fino, escolhido por tipo de filme e bitola (35mm, 16mm, Super 8).', 'Film Grain OFX'],
        ['Halation', 'Um brilho vermelho-alaranjado nas bordas claras, assinatura da emulsão de filme.', 'Halation OFX', true],
        ['Bloom / glow', 'Vazamento de luz em volta das altas luzes, para uma imagem mais suave e onírica.', 'Glow OFX'],
        ['Difusão suave', 'Imite um filtro Pro-Mist ou Black Satin para amaciar a nitidez digital.', 'Mist OFX', true],
        ['Vinheta e gate weave', 'Leve escurecimento das bordas e um movimento sutil do quadro, com sensação de projetor.', 'Vignette · Film Damage OFX'],
        ['Proporção de tela', 'Aplique letterbox em 2.39:1 ou 1.85:1 para um enquadramento cinematográfico.', 'Timeline › Output Blanking'],
      ] },
      { title: 'Outros looks que você pode criar', items: [
        ['Teal & Orange', 'Sombras e fundo para teal, com a pele mantida quente e protegida por um qualifier.', 'Log Wheels + Skin key'],
        ['Bleach Bypass', 'Alto contraste com pouca saturação e altas luzes prateadas; um visual cru e intenso.', 'Contrast + Saturation ↓'],
        ['Vintage / desbotado anos 70', 'Pretos levantados e leitosos, dominante amarelo-esverdeada quente e saturação suavizada.', 'Curves + Offset'],
        ['Pastel / suave', 'Baixo contraste, exposição alta e tons suaves e dessaturados; um visual leve e limpo.', 'Contrast ↓ + Gain'],
        ['Neo-noir / cidade à noite', 'Pretos profundos, com magenta e ciano nas altas luzes.', 'Hue vs Hue + Gain'],
        ['Day for night', 'Subexponha, esfrie tudo e reduza a saturação para simular uma cena noturna.', 'Offset ↓ + Temp'],
        ['Preto e branco', 'Misture os canais para controlar como cada cor vira cinza e depois adicione um leve tom.', 'RGB Mixer › Monochrome'],
      ] },
    ],
    tip: '<b>Mantenha flexível:</b> construa o look em alguns nodes separados (contraste, cor, textura) ou em um grupo Timeline / Post-Clip, para aplicar e ajustar um mesmo look no projeto inteiro.',
  },
};

/** Texto com <b>negrito</b> simples, sem usar dangerouslySetInnerHTML. */
function Rich({ html }: { html: string }) {
  const parts = html.split(/(<b>.*?<\/b>)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('<b>') ? <strong key={i} className="font-sans font-bold text-neutral-900">{p.slice(3, -4)}</strong> : <React.Fragment key={i}>{p}</React.Fragment>
      )}
    </>
  );
}

/* Estilos do quadro do node graph: iguais aos do arquivo original, com prefixo próprio. */
const GRAPH_CSS = `
.cgf{--canvas:#262626;--grid:#2e2e2e;--node:#353535;--node-border:#4a4a4a;--selected:#e5473c;--text:#d4d4d4;--muted:#8a8a8a;--wire:#8c8c8c;--rgb:#8fd400;--key:#2aa9f0;
  background:var(--canvas);color:var(--text);}
.cgf-flow{background-color:var(--canvas);background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:50px 50px;overflow-x:auto;-webkit-overflow-scrolling:touch;}
.cgf-flow svg{display:block;width:100%;min-width:880px;height:auto;margin:0 auto;max-width:1400px;}
.cgf .zone-edge{stroke-width:1;stroke-opacity:.35;}
.cgf .zone{font-size:14px;font-weight:700;letter-spacing:.14em;text-anchor:middle;}
.cgf .wire{stroke:var(--wire);stroke-width:2.5;fill:none;stroke-linecap:round;}
.cgf .node{cursor:pointer;outline:none;}
.cgf .node .body{stroke:var(--node-border);stroke-width:1.5;transition:stroke .15s,filter .15s;}
.cgf .node.z-primary .body{fill:#3a3631;}
.cgf .node.z-secondary .body{fill:#3a3238;}
.cgf .node.z-both .body{fill:#30373a;}
.cgf .node.z-mix .body{fill:var(--node);}
.cgf .node:hover .body{stroke:#7a7a7a;}
.cgf .node.selected .body{stroke:var(--selected);stroke-width:2;filter:drop-shadow(0 0 6px rgba(229,71,60,.35));}
.cgf .node:focus-visible .body{stroke:#b0b0b0;}
.cgf .node .bar{fill:#8ea2c4;}
.cgf .node .num{fill:#f2f2f2;font-size:20px;font-weight:500;}
.cgf .lbl{fill:var(--text);font-size:13px;text-anchor:middle;}
.cgf .port-rgb{fill:var(--rgb);stroke:#141414;stroke-width:1;}
.cgf .port-key{fill:var(--key);stroke:#141414;stroke-width:1;}
.cgf .hint{fill:#6f6f6f;font-size:12px;text-anchor:middle;}
.cgf .io .pill{fill:#3a3a3a;stroke:#555;stroke-width:1.5;}
.cgf .io .dot{fill:var(--rgb);stroke:#141414;stroke-width:1.2;}
.cgf .io-lbl{fill:var(--muted);font-size:12px;letter-spacing:.1em;text-anchor:middle;}
@keyframes cgf-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.cgf-fade{animation:cgf-fade .25s ease;}
@media (prefers-reduced-motion:reduce){.cgf-fade{animation:none;}}
`;

/** Um node com a miniatura (thumb), as barras e as portas, como no quadro original. */
function GraphNode({
  id, selected, onSelect, zone, x, y, num, label, filter, extra,
}: {
  id: string; selected: boolean; onSelect: (id: string) => void;
  zone: 'primary' | 'secondary' | 'both'; x: number; y: number; num: string; label: string; filter: string; extra?: React.ReactNode;
}) {
  return (
    <g
      className={`node z-${zone}${selected ? ' selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Node ${num}: ${label}`}
      aria-controls="cgf-panel"
      transform={`translate(${x},${y})`}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); } }}
    >
      <text className="lbl" x="63" y="-12">{label}</text>
      <rect className="body" width="126" height="110" rx="7" />
      <use href="#cgf-thumb" x="8" y="8" width="110" height="56" filter={`url(#${filter})`} />
      {extra}
      <rect className="bar" x="8" y="70" width="110" height="5" rx="2.5" />
      <text className="num" x="18" y="99">{num}</text>
      <polygon className="port-rgb" points="-15,25 -1,33 -15,41" />
      <polygon className="port-key" points="-15,72 -1,80 -15,88" />
      <rect className="port-rgb" x="128" y="26" width="14" height="14" />
      <rect className="port-key" x="128" y="73" width="14" height="14" />
    </g>
  );
}

export default function NodeFlowExplorer() {
  const [selected, setSelected] = useState('normalize');
  const panelRef = useRef<HTMLDivElement>(null);
  const stage = STAGES[selected];
  const accent = ACCENT[stage.zone];

  const select = (id: string) => {
    setSelected(id);
    // Se o painel está abaixo da área visível, leva até ele (como no arquivo original).
    requestAnimationFrame(() => {
      const el = panelRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top > window.innerHeight - 120) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    });
  };

  return (
    <div className="space-y-5">
      <style>{GRAPH_CSS}</style>

      {/* ===== Quadro do node graph: aparência original ===== */}
      <div className="cgf overflow-hidden rounded-2xl border border-[#2b2b30]">
        <section className="cgf-flow" aria-label="Fluxo de color grading em nodes. Clique em um node para ver a etapa.">
          <svg viewBox="0 0 1380 540" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Node graph: input, normalizing e balancing, matching, secondary grades com qualifier e window, parallel mixer, creative grade e output">
            <title>Color grading workflow: input, normalizing and balancing, matching, secondary grades with qualifier and window, parallel mixer, creative grade, output.</title>
            <defs>
              <linearGradient id="cgf-g-top" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#ff1a1a" /><stop offset=".5" stopColor="#ff9a1a" /><stop offset="1" stopColor="#fff41a" />
              </linearGradient>
              <linearGradient id="cgf-g-bot" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#1a1aff" /><stop offset=".5" stopColor="#1a9aff" /><stop offset="1" stopColor="#1affe8" />
              </linearGradient>
              <linearGradient id="cgf-g-fade" x1="0" x2="0" y1="0" y2="1">
                <stop offset=".1" stopColor="#000" /><stop offset=".9" stopColor="#fff" />
              </linearGradient>
              <mask id="cgf-m-fade"><rect width="110" height="56" fill="url(#cgf-g-fade)" /></mask>
              <radialGradient id="cgf-g-vig" cx=".5" cy=".5" r=".6">
                <stop offset=".45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".75" />
              </radialGradient>
              <symbol id="cgf-thumb" viewBox="0 0 110 56">
                <rect width="110" height="56" fill="url(#cgf-g-top)" />
                <rect width="110" height="56" fill="url(#cgf-g-bot)" mask="url(#cgf-m-fade)" />
              </symbol>
              <filter id="cgf-f-log" colorInterpolationFilters="sRGB">
                <feColorMatrix type="saturate" values="0.22" />
                <feComponentTransfer>
                  <feFuncR type="linear" slope="0.55" intercept="0.24" />
                  <feFuncG type="linear" slope="0.55" intercept="0.24" />
                  <feFuncB type="linear" slope="0.55" intercept="0.24" />
                </feComponentTransfer>
              </filter>
              <filter id="cgf-f-match" colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="0.8" /></filter>
              <filter id="cgf-f-qual" colorInterpolationFilters="sRGB">
                <feColorMatrix type="saturate" values="0.95" /><feColorMatrix type="hueRotate" values="14" />
              </filter>
              <filter id="cgf-f-creative" colorInterpolationFilters="sRGB">
                <feColorMatrix type="matrix" values="1.05 0.08 0 0 0.02 0.02 0.92 0.06 0 0.02 0 0.12 0.85 0 0.06 0 0 0 1 0" />
              </filter>
            </defs>

            {/* faixas das etapas */}
            <rect x="110" y="0" width="470" height="540" fill="#e8c27a" fillOpacity=".07" />
            <rect x="580" y="0" width="385" height="540" fill="#d993c4" fillOpacity=".07" />
            <rect x="965" y="0" width="250" height="540" fill="#8cbfd6" fillOpacity=".08" />
            <line className="zone-edge" x1="110" y1="0" x2="110" y2="540" stroke="#e8c27a" />
            <line className="zone-edge" x1="580" y1="0" x2="580" y2="540" stroke="#d993c4" />
            <line className="zone-edge" x1="965" y1="0" x2="965" y2="540" stroke="#8cbfd6" />
            <line className="zone-edge" x1="1215" y1="0" x2="1215" y2="540" stroke="#8cbfd6" />
            <text className="zone" x="345" y="44" fill="#e8c27a">PRIMARY</text>
            <text className="zone" x="772" y="44" fill="#d993c4">SECONDARY</text>
            <text className="zone" x="1090" y="36" fill="#8cbfd6">PRIMARY /</text>
            <text className="zone" x="1090" y="56" fill="#8cbfd6">SECONDARY</text>

            {/* conexões */}
            <path className="wire" d="M53 258 L155 258" />
            <path className="wire" d="M312 258 L365 258" />
            <path className="wire" d="M522 258 L625 138" />
            <path className="wire" d="M522 258 L625 408" />
            <path className="wire" d="M782 138 L865 230" />
            <path className="wire" d="M782 408 L865 286" />
            <path className="wire" d="M930 258 L995 258" />
            <path className="wire" d="M1152 258 L1333 258" />

            {/* input */}
            <g className="io" transform="translate(40,236)">
              <rect className="pill" width="26" height="44" rx="7" /><circle className="dot" cx="13" cy="22" r="7" />
            </g>
            <text className="io-lbl" x="53" y="308">INPUT</text>

            <GraphNode id="normalize" selected={selected === 'normalize'} onSelect={select} zone="primary" x={170} y={225} num="01" label="Normalizing / Balancing" filter="cgf-f-log" />
            <GraphNode id="matching" selected={selected === 'matching'} onSelect={select} zone="primary" x={380} y={225} num="02" label="Matching" filter="cgf-f-match" />
            <GraphNode id="qualifier" selected={selected === 'qualifier'} onSelect={select} zone="secondary" x={640} y={105} num="03" label="Secondary Grade w/ Qualifier" filter="cgf-f-qual" />
            <GraphNode
              id="window" selected={selected === 'window'} onSelect={select} zone="secondary" x={640} y={375} num="04" label="Secondary Grade w/ Window" filter="cgf-f-match"
              extra={
                <>
                  <rect x="8" y="8" width="110" height="56" fill="url(#cgf-g-vig)" />
                  <ellipse cx="63" cy="36" rx="34" ry="19" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1" />
                </>
              }
            />

            {/* parallel mixer */}
            <g
              className={`node z-mix${selected === 'mixer' ? ' selected' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={selected === 'mixer'}
              aria-label="Parallel Mixer"
              aria-controls="cgf-panel"
              transform="translate(880,200)"
              onClick={() => select('mixer')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select('mixer'); } }}
            >
              <text className="lbl" x="17" y="-12">Parallel Mixer</text>
              <rect className="body" width="34" height="116" rx="6" />
              <polygon className="port-rgb" points="-15,22 -1,30 -15,38" />
              <polygon className="port-rgb" points="-15,78 -1,86 -15,94" />
              <rect className="port-rgb" x="36" y="51" width="14" height="14" />
            </g>

            <GraphNode id="creative" selected={selected === 'creative'} onSelect={select} zone="both" x={1010} y={225} num="05" label="Creative Grade" filter="cgf-f-creative" />

            {/* output */}
            <g className="io" transform="translate(1320,236)">
              <rect className="pill" width="26" height="44" rx="7" /><circle className="dot" cx="13" cy="22" r="7" />
            </g>
            <text className="io-lbl" x="1333" y="308">OUTPUT</text>

            <text className="hint" x="345" y="526">Clique em um node para ver o que acontece nessa etapa</text>
          </svg>
        </section>
      </div>

      {/* ===== Painel da etapa: identidade do site ===== */}
      <section id="cgf-panel" ref={panelRef} aria-live="polite" className="scroll-mt-6 rounded-2xl bg-[#f5f5f7] p-5 font-sans sm:p-7">
        <div key={selected} className="cgf-fade space-y-6">
          <header className="space-y-3">
            <p className="flex items-center gap-2.5 text-sm font-semibold text-neutral-600">
              <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-[3px]" style={{ backgroundColor: accent }} />
              <span className="tabular-nums text-neutral-900">{stage.num === '—' ? 'Node' : `Node ${stage.num}`}</span>
              <span aria-hidden="true">·</span>
              <span>{stage.stage}</span>
            </p>
            <h5 className="text-[22px] font-black leading-tight tracking-tight text-neutral-900 sm:text-[26px]">{stage.title}</h5>
            <p className="max-w-3xl font-serif text-[16px] leading-[1.6] text-neutral-700 sm:text-[17px]">{stage.summary}</p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stage.groups.map((g) => (
              <section key={g.title} className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h6 className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-900">
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: accent }} />
                  {g.title}
                </h6>
                <ul className="divide-y divide-neutral-200">
                  {g.items.map(([name, desc, tool, studio], i) => (
                    <li key={name} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                      {g.ordered && (
                        <span className="mt-0.5 w-6 shrink-0 text-xs font-bold tabular-nums text-[#0071e3]">{String(i + 1).padStart(2, '0')}</span>
                      )}
                      <div className="min-w-0">
                        <p className="font-serif text-[15px] leading-snug text-neutral-700">
                          <strong className="font-sans font-semibold text-neutral-900">{name}</strong>: {desc}
                        </p>
                        <span
                          className={`mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                            studio ? 'bg-amber-50 text-amber-800' : 'bg-[#0071e3]/10 text-[#0058b0]'
                          }`}
                        >
                          {tool}{studio ? ' · Studio' : ''}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {stage.tip && (
            <div className="rounded-2xl border-l-4 border-[#0071e3] bg-white p-5">
              <p className="max-w-3xl font-serif text-[16px] leading-relaxed text-neutral-800">
                <Rich html={stage.tip} />
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
