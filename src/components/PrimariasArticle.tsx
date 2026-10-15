'use client';

import React, { useState } from 'react';
import { ArticleToc, EditorialSection, type TocGroup } from './EditorialLayout';
import { Sub, Prose, Note, Bullets, NumberedSteps, DataTable } from './ArticleBlocks';
import { ScoredQuiz, type QuizQuestion } from './ScoredQuiz';
import NodeTreeGraph, { IdtOdtGraph } from './NodeTreeGraph';
import { ParallaxImage } from './ParallaxImage';

/**
 * Conteúdo da aula "Primárias": correção de cor primária no DaVinci Resolve, seguindo o take da garrafa de bebida.
 *
 * Ferramentas interativas (onde ajudam a entender o texto):
 *  - FalseColorGuide → escala do false color recriada, ao lado de uma imagem de exemplo.
 *  - NodeTreeGraph   → árvore de nodes da aula (Na prática).
 *  - ScoredQuiz      → teste final com pontuação.
 */

/* ------------------------------------------------------------------ ferramenta: leitura do false color */

/** Escala do false color (recriada): posição vertical = valor de 0 a 100. */
const SCALE_TOP = 20;
const SCALE_H = 480;
const sy = (v: number) => Math.round((SCALE_TOP + SCALE_H - (SCALE_H / 100) * v) * 10) / 10;

/** Paradas do degradê da escala, medidas na imagem original: [valor de 0 a 100, cor]. Entre uma cor e outra a barra faz transição suave. */
const SCALE_STOPS: [number, string][] = [
  [100, '#f70000'], [92.3, '#f70000'], [91, '#fd7501'], [90.4, '#fdff00'], [89.6, '#fdff00'], [88.5, '#ffffb8'], [87.8, '#f2f2f4'],
  [70, '#c1c1c3'], [60, '#a1a1a2'], [51.3, '#818183'],
  [50.7, '#828180'], [49.4, '#cfa3a7'], [48.1, '#ffc1cd'], [46.6, '#ffbeca'], [45.6, '#b9959d'], [44.9, '#8c7e7e'], [44.3, '#6b6b6b'], [42.4, '#646664'],
  [41.7, '#56b049'], [41.1, '#4dfc2b'], [39.8, '#3bff00'], [37.9, '#3cff0b'], [36.6, '#4a9b3b'], [36, '#4b4b4b'],
  [30, '#373438'], [25, '#232124'], [20, '#0c0c0c'], [19.3, '#060508'],
  [18, '#020064'], [17.4, '#0100a2'], [16.1, '#0200f0'], [14.8, '#0100ef'], [14.2, '#9600fb'], [12.9, '#ff00fd'],
  [0.7, '#ff01fd'], [0, '#ff00ff'],
];

function FalseColorScale() {
  return (
    <svg viewBox="0 0 340 520" role="img" aria-label="Escala do false color de 0 a 100: vermelho no clipping do branco, amarelo perto do clipping, rosa um stop acima do cinza médio, verde no cinza médio, azul perto da perda de detalhe no preto e magenta na perda de detalhe no preto" className="block h-auto w-full">
      <defs>
        <linearGradient id="fcs-bar" x1="0" x2="0" y1={sy(100)} y2={sy(0)} gradientUnits="userSpaceOnUse">
          {SCALE_STOPS.map(([v, color]) => (
            <stop key={v} offset={(100 - v) / 100} stopColor={color} />
          ))}
        </linearGradient>
      </defs>
      <g fontFamily="inherit" fontSize="13" fill="#1d1d1f">
        {/* números e marcas */}
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v) => (
          <g key={v}>
            <text x="30" y={sy(v) + 4} textAnchor="end" fontSize="12">{v}</text>
            <line x1="34" x2="44" y1={sy(v)} y2={sy(v)} stroke="#1d1d1f" strokeWidth="1" />
          </g>
        ))}

        {/* barra: degradê contínuo, como na escala original */}
        <rect x="44" y={SCALE_TOP} width="22" height={SCALE_H} fill="url(#fcs-bar)" />
        <rect x="44" y={SCALE_TOP} width="22" height={SCALE_H} fill="none" stroke="#1d1d1f" strokeWidth="1" />

        {/* legendas */}
        <g stroke="#1d1d1f" strokeWidth="1" strokeDasharray="3 2">
          <line x1="66" x2="76" y1={sy(91.5)} y2={sy(91.5)} />
          <line x1="66" x2="76" y1={sy(89)} y2={sy(89)} />
          <line x1="66" x2="76" y1={sy(47.7)} y2={sy(47.7)} />
          <line x1="66" x2="76" y1={sy(38.4)} y2={sy(38.4)} />
          <line x1="66" x2="76" y1={sy(16.5)} y2={sy(16.5)} />
          <line x1="66" x2="76" y1={sy(5)} y2={sy(5)} />
        </g>
        <text x="82" y={sy(97)}>95% Zebra</text>
        <text x="82" y={sy(93.7)}>Clipping do branco</text>
        <text x="82" y={sy(88)}>80% Zebra</text>
        <text x="82" y={sy(84.7)}>Quase clipping do branco</text>
        <text x="82" y={sy(48.7)}>1 stop acima do cinza médio</text>
        <text x="82" y={sy(45.3)}>(pele clara)</text>
        <text x="82" y={sy(39.4)}>38,4%</text>
        <text x="82" y={sy(36)}>Cinza médio (18%)</text>
        <text x="82" y={sy(17.5)}>Quase perda de detalhe</text>
        <text x="82" y={sy(14.1)}>no preto</text>
        <text x="82" y={sy(6)}>Perda de detalhe no preto</text>
      </g>
    </svg>
  );
}

function FalseColorGuide() {
  const [on, setOn] = useState(true);

  return (
    <section aria-label="Como ler o false color" className="space-y-4 rounded-2xl border border-neutral-200 bg-[#f5f5f7] p-5 font-sans sm:p-6">
      <header className="space-y-1">
        <h5 className="text-lg font-bold text-neutral-900">Como ler o false color</h5>
        <p className="max-w-3xl text-sm text-neutral-600">
          Cada cor é uma faixa de exposição. Compare a escala com a imagem: o verde mostra o cinza médio, o rosa a pele iluminada, e o azul e o magenta as sombras sem detalhe. A escala pode variar um pouco conforme a ferramenta, então confira a legenda do seu false color.
        </p>
      </header>
      <div className="grid items-start gap-5 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[320px] rounded-xl border border-neutral-200 bg-white p-3">
          <FalseColorScale />
        </div>
        <figure className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <button
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() => setOn((v) => !v)}
              className="absolute left-3 top-3 z-10 flex min-h-11 items-center gap-3 rounded-full border border-neutral-200 bg-white/95 px-4 text-sm font-semibold text-neutral-900 shadow-md backdrop-blur-sm transition-colors duration-150 hover:bg-white active:scale-[0.97]"
            >
              <span
                aria-hidden="true"
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 motion-reduce:transition-none ${on ? 'bg-[#0071e3]' : 'bg-neutral-300'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-200 motion-reduce:transition-none ${on ? 'left-[22px]' : 'left-0.5'}`} />
              </span>
              False color: {on ? 'ligado' : 'desligado'}
            </button>
          {/* imagem original (por baixo) e false color (por cima): o botão mostra ou esconde a de cima */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/primarias/false-color-retrato-original.webp"
            alt="Retrato da mesma cena, sem false color: mulher de cabelo cacheado e casaco bege, de frente para a câmera, com o mar ao fundo"
            width={1248}
            height={1116}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/primarias/false-color-retrato.webp"
            alt={on ? 'Retrato em false color: verde e rosa nas partes iluminadas do rosto e da jaqueta, azul e magenta nas sombras do cabelo, e cinza no céu' : ''}
            aria-hidden={!on}
            width={1248}
            height={1116}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full transition-opacity duration-200 motion-reduce:transition-none ${on ? 'opacity-100' : 'opacity-0'}`}
          />
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ teste */

const PRIMARIAS_QUIZ: QuizQuestion[] = [
  { situation: 'Qual é o objetivo das primárias nesse primeiro momento?', options: ['Deixar a imagem neutra e equilibrada', 'Criar o look do filme', 'Selecionar a cor do produto', 'Aplicar uma LUT criativa'], answer: 0, explain: 'As primárias são ajustes na imagem inteira. Look e seleção de cor vêm depois, nas secundárias.' },
  { situation: 'O que o node IDT faz?', options: ['Transforma a informação da câmera num espaço de cor e gamma de trabalho', 'Transforma o espaço de trabalho em Rec.709', 'Mede a exposição com cores', 'Junta dois nodes em paralelo'], answer: 0, explain: 'IDT é o Input Device Transform, a entrada.' },
  { situation: 'Qual é a função do ODT?', options: ['Transformar o espaço de trabalho em Rec.709, a saída', 'Ler o log da câmera', 'Subir o contraste', 'Neutralizar o preto'], answer: 0, explain: 'ODT é o Output Device Transform, a saída.' },
  { situation: 'Por que a aula usou o ACES Transform em vez do Color Space Transform?', options: ['Nesse projeto, o suporte pra câmera (F-Log2 C) estava no ACES Transform', 'O CST não funciona com ACEScct', 'O ACES Transform é sempre mais preciso', 'O CST só serve pra Rec.709'], answer: 0, explain: 'Se o seu log não aparece numa ferramenta, procure na outra.' },
  { situation: 'Por que o ACEScct dá mais controle nas sombras do que o ACEScc?', options: ['A curva tem uma região perto do preto, chamada toe', 'Ele tem um gamut menor', 'Ele é a saída em Rec.709', 'Ele ignora as sombras'], answer: 0, explain: 'O toe deixa o ajuste mais parecido com o de uma imagem log tradicional.' },
  { situation: 'Qual controle sobe ou desce a imagem toda, mantendo a relação entre sombras, médios e altas luzes?', options: ['Offset', 'Gamma', 'Lift', 'Gain'], answer: 0, explain: 'O Offset é o mais parecido com abrir ou fechar o diafragma.' },
  { situation: 'Na garrafa, qual controle baixou os médios pra esconder o logo, segurando o preto?', options: ['Gamma', 'Offset', 'Lift', 'Contrast'], answer: 0, explain: 'O Gamma mexe principalmente nos médios, segurando pretos e brancos.' },
  { situation: 'Por que a exposição vem antes do balanço de branco na sequência de nodes?', options: ['Porque mexer na luz muda a percepção da cor', 'Porque o balanço de branco só funciona no fim', 'Porque o IDT exige essa ordem', 'Porque o Offset não mexe em cor'], answer: 0, explain: 'Uma ordem que funciona bem nas primárias é luz primeiro, cor depois.' },
  { situation: 'Por que o White Balance e o Black ficam em nodes paralelos?', options: ['Porque um não interfere no outro', 'Porque o Resolve exige nodes paralelos nas primárias', 'Porque o paralelo renderiza mais rápido', 'Porque o Black só funciona com o IDT'], answer: 0, explain: 'São duas coisas importantes pra ajustar nesse primeiro momento, e em paralelo uma não afeta a outra.' },
  { situation: 'Qual atalho cria um node paralelo?', options: ['Alt + P (Option + P no Mac)', 'Shift + 9', 'Ctrl/Command + D', 'Shift + 6'], answer: 0, explain: 'Alt + P cria o node paralelo.' },
  { situation: 'Como medir o tamanho do desvio de cor antes de escolher a ferramenta de balanço de branco?', options: ['Botão direito no viewer > Show Picker RGB Value', 'Ligando o false color', 'Desligando o HDR', 'Comparando com Ctrl/Command + D'], answer: 0, explain: 'Passando o mouse numa parte que deveria ser branca, você lê os valores R, G e B.' },
  { situation: 'Depois de usar o Pick Black Point, a imagem afunda. O que fazer?', options: ['Subir o Lift até a imagem voltar', 'Subir o Gain', 'Baixar o Gamma', 'Desligar o node'], answer: 0, explain: 'A imagem afunda inteira, e o Lift traz de volta.' },
  { situation: 'Qual contraste foi usado na aula, e por quê?', options: ['O do HDR, porque mexe só na luminosidade e preserva a saturação', 'O das Color Wheels, porque mexe nos canais RGB juntos', 'O das Curves, porque é mais rápido', 'O do Color Slice, porque é mais suave'], answer: 0, explain: 'O contraste das Color Wheels contrasta também a cor, e aqui a ideia é mexer só na luz.' },
  { situation: 'No false color, o que significa a cor vermelha?', options: ['Branco estourado, sem detalhe', 'O cinza médio', 'Detalhe perdido no preto', 'Perto de perder o detalhe no preto'], answer: 0, explain: 'O vermelho marca o clipping do branco, onde não sobra detalhe.' },
  { situation: 'Por que o gamma da palette HDR foi configurado como ACEScct?', options: ['Pra bater com o espaço de trabalho, e as zonas caírem no lugar certo', 'Porque o HDR só funciona em ACEScct', 'Pra converter a imagem pra Rec.709', 'Pra ligar o false color'], answer: 0, explain: 'ACEScct foi o espaço escolhido no gerenciamento de cores.' },
  { situation: 'O que acontece se você esquecer o false color ligado?', options: ['O filme é exportado com as cores do false color', 'Nada, ele é ignorado na renderização', 'O ODT para de funcionar', 'O waveform desaparece'], answer: 0, explain: 'Desligue o node antes de renderizar.' },
  { situation: 'Por que usar as Log Wheels no Shadow e no Highlight?', options: ['Elas trabalham faixas mais estreitas da escala tonal do que as Color Wheels', 'Elas mudam o espaço de cor do projeto', 'Elas substituem a palette HDR', 'Elas só funcionam em material log'], answer: 0, explain: 'Assim dá pra mexer na sombra sem afetar tanto os médios.' },
  { situation: 'Por que não se faz seleção de cor nas primárias?', options: ['Primárias são globais; seleção fica pras secundárias', 'O Resolve bloqueia seleções nessa etapa', 'A seleção piora o contraste', 'Só a palette HDR faz seleção'], answer: 0, explain: 'Uma seleção podia pegar várias partes que não interessam agora.' },
];

/* ------------------------------------------------------------------ sumário */

const TOC: TocGroup[] = [
  { title: 'Introdução', id: 'introducao-primarias' },
  {
    title: 'Antes das primárias',
    id: 'gerenciamento-antes-primarias',
    items: [
      { label: 'IDT e ODT', id: 'idt-e-odt' },
      { label: 'ACES Transform no lugar do CST', id: 'aces-transform-no-lugar-do-cst' },
      { label: 'Por que ACEScct', id: 'por-que-acescct' },
    ],
  },
  {
    title: 'Primeiro a proposta, depois a luz',
    id: 'proposta-e-luz',
    items: [{ label: 'O exemplo da garrafa', id: 'o-exemplo-da-garrafa' }],
  },
  {
    title: 'Exposição',
    id: 'exposicao-primarias',
    items: [{ label: 'Qual controle usar pra exposição', id: 'qual-controle-usar-pra-exposicao' }],
  },
  {
    title: 'Balanço de branco e ponto de preto',
    id: 'balanco-e-preto',
    items: [
      { label: 'Duas formas de fazer o balanço de branco', id: 'duas-formas-de-fazer-o-balanco-de-branco' },
      { label: 'Não use um Canhão para Matar uma Mosca', id: 'nao-use-um-canhao-para-matar-uma-mosca' },
      { label: 'Pick Black Point', id: 'pick-black-point-deixando-o-preto-neutro' },
    ],
  },
  {
    title: 'HDR, false color e contraste',
    id: 'hdr-false-color-contraste',
    items: [
      { label: 'As zonas do HDR', id: 'as-zonas-do-hdr' },
      { label: 'Baixando os picos', id: 'baixando-os-picos' },
      { label: 'False color', id: 'false-color-medindo-a-exposicao' },
      { label: 'Silhueta', id: 'silhueta-produto-escuro-fundo-claro' },
      { label: 'Contraste: use o do HDR', id: 'contraste-use-o-do-hdr' },
    ],
  },
  {
    title: 'Saturação e Log Wheels',
    id: 'saturacao-log-wheels',
    items: [
      { label: 'Um leve ajuste de saturação', id: 'um-leve-ajuste-de-saturacao' },
      { label: 'Log Wheels', id: 'log-wheels-descolando-as-sombras' },
    ],
  },
  { title: 'Na prática', id: 'na-pratica-primarias' },
  { title: 'Erros comuns', id: 'erros-primarias' },
  { title: 'Conclusão', id: 'conclusao-primarias' },
];

/** Enquadramento inicial da foto da garrafa (x, y em %). */
const BOTTLE_START: [number, number] = [55, 50];

const B = ({ children }: { children: React.ReactNode }) => <strong className="font-semibold text-neutral-900">{children}</strong>;

export default function PrimariasArticle() {
  return (
    <article className="relative w-full space-y-10 font-serif leading-relaxed text-[#111111] select-text">
      <ArticleToc groups={TOC} />

      {/* ===================== INTRODUÇÃO ===================== */}
      <EditorialSection
        id="introducao-primarias"
        kickerLeft="CORREÇÃO DE COR · PRIMÁRIAS"
        kickerRight="INTRODUÇÃO"
        title="CORREÇÃO DE COR PRIMÁRIA NO DAVINCI RESOLVE"
      >
        <Prose>
          <p>
            Bora colocar a mão na massa. Depois de analisar o material, entender o fluxo de trabalho e configurar o gerenciamento de cores, chegou a hora das primárias, a primeira etapa da correção de cor.
          </p>
          <p>
            As primárias são todos os ajustes aplicados na imagem inteira: exposição, balanço de branco, ponto de preto, contraste e saturação. Nesse primeiro momento, o objetivo é deixar a imagem o mais neutra e equilibrada possível, tá? Look e seleção de cor ficam pra depois: a seleção faz parte das secundárias.
          </p>
          <p>
            Nesse artigo, a gente vai seguir o que foi feito na aula, num take de uma garrafa de bebida: gerenciamento de cor com IDT e ODT, proposta narrativa, exposição, balanço de branco, ponto de preto, HDR, false color, contraste, saturação e Log Wheels.
          </p>
        </Prose>
      </EditorialSection>

      {/* ===================== GERENCIAMENTO DE CORES ===================== */}
      <EditorialSection
        id="gerenciamento-antes-primarias"
        kickerLeft="CORREÇÃO DE COR · PRIMÁRIAS"
        kickerRight="PREPARAÇÃO"
        title="ANTES DAS PRIMÁRIAS: O GERENCIAMENTO DE CORES"
      >
        <Prose>
          <p>
            A primeira coisa que a gente faz é o gerenciamento de cores, tá? Aqui a gente usa a técnica por nodes, que a gente viu na aula de gerenciamento de cores. Se ainda ficou alguma dúvida sobre isso, assiste a aula de novo ou deixa um comentário.
          </p>
        </Prose>

        <Sub title="IDT e ODT">
          <Prose>
            <p>
              A gente cria dois nodes: o primeiro chamado <B>IDT</B> (Input Device Transform, a entrada) e o último chamado <B>ODT</B> (Output Device Transform, a saída). Todo o resto da correção fica entre os dois.
            </p>
          </Prose>
          <IdtOdtGraph />
        </Sub>

        <Sub title="ACES Transform no lugar do CST">
          <Prose>
            <p>
              Nesse projeto, as imagens foram filmadas com uma Fuji em F-Log2 C. Pra esse perfil, a gente usou o efeito <B>ACES Transform</B> em vez do Color Space Transform, porque nesse projeto o suporte pra essa câmera estava no ACES Transform. Sempre confira: se o seu log não aparece numa ferramenta, procure na outra.
            </p>
            <p>A configuração ficou assim:</p>
          </Prose>
          <DataTable
            caption="Configuração do IDT e do ODT com o ACES Transform"
            head={['Node', 'Input Transform', 'Output Transform']}
            rows={[
              ['IDT (ACES Transform)', 'F-Log2 C (o log da câmera)', 'ACEScct (espaço de trabalho)'],
              ['ODT (ACES Transform)', 'ACEScct', 'Rec.709'],
            ]}
            minWidth={480}
          />
          <Note>Uma dica: dentro da lista do ACES Transform, apertar a letra inicial pula direto pras opções. F pra achar o F-Log, A pra achar o ACES.</Note>
        </Sub>

        <Sub title="Por que ACEScct">
          <Prose>
            <p>
              O ACEScct dá muito mais controle nas sombras do que o ACEScc, porque a curva tem uma região próxima do preto, chamada toe, que deixa o ajuste mais parecido com o de uma imagem log tradicional. Essa imagem tem muita sombra, então a gente precisa dessa flexibilidade. Mas eu sempre uso o ACEScct, não importa se a imagem tem muita ou pouca sombra.
            </p>
            <p>Pronto, gerenciamento de cores feito. Agora sim dá pra começar as primárias.</p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== PROPOSTA ===================== */}
      <EditorialSection
        id="proposta-e-luz"
        kickerLeft="CORREÇÃO DE COR · PRIMÁRIAS"
        kickerRight="PROPOSTA"
        title="PRIMEIRO A PROPOSTA, DEPOIS A LUZ"
      >
        <Prose>
          <p>
            Antes de mexer na iluminação, a gente precisa ter em mente qual é a proposta visual e qual é a proposta narrativa daquele take. As primárias deixam a imagem neutra, mas &ldquo;neutro&rdquo; depende do que o plano precisa comunicar.
          </p>
          <p>
            Os takes de um filme seguem uma proposta parecida, só que essa proposta evolui até o final do vídeo. Então não dá pra tratar todos exatamente igual.
          </p>
        </Prose>

        <Sub title="O exemplo da garrafa">
          <Prose>
            <p>
              Nesse take, a proposta é a seguinte: em menos de um segundo, o espectador tem que olhar e saber que aquilo é uma garrafa de bebida alcoólica. Mas eu não quero que ele veja o logo, não quero que ele saiba qual é a marca. A garrafa também não parece uma garrafa de cachaça, então no começo vai ser um mistério: é cachaça, uísque, gin?
            </p>
            <p>Essa proposta muda tudo nas primárias:</p>
          </Prose>
          <Bullets
            items={[
              { label: 'Não quero o logo visível:', text: 'preciso diminuir a iluminação daquela parte.' },
              { label: 'Quero a silhueta da garrafa muito clara:', text: 'preciso de contraste entre a garrafa escura e o fundo mais claro.' },
            ]}
          />
          <ParallaxImage
            src="/images/primarias/garrafa.webp"
            alt="Garrafa de bebida em cima de um barril, num ambiente escuro com barris ao fundo e a luz marcando o vidro, o líquido e o rótulo"
            width={2000}
            height={1141}
            frameClassName="rounded-2xl border border-neutral-200 bg-neutral-950"
            imgClassName="block aspect-[16/9] h-auto w-full object-cover sm:aspect-[21/9]"
            initial={BOTTLE_START}
          />
          <Prose>
            <p>
              Por isso é importante pensar na proposta antes de mexer na imagem. No produto, às vezes a proposta é mostrar tudo, cada detalhe do rótulo; às vezes é esconder, criar curiosidade. Sabendo disso antes, você evita corrigir algo que já estava certo.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== EXPOSIÇÃO ===================== */}
      <EditorialSection
        id="exposicao-primarias"
        kickerLeft="CORREÇÃO DE COR · PRIMÁRIAS"
        kickerRight="LUZ"
        title="EXPOSIÇÃO: NORMALIZAR A LUZ"
      >
        <Prose>
          <p>
            Depois do IDT, a gente cria um node chamado <B>Exposição</B>. É nele que fica o ajuste geral de iluminação: se está muito claro, a gente deixa menos claro; se está muito escuro, a gente tenta normalizar a luz.
          </p>
          <p>
            Na garrafa, como eu não quero que o logo apareça, eu fui no <B>Gamma</B> das Color Wheels e arrastei o slider pra esquerda, baixando um pouco os médios. Só isso, tá? Nesse primeiro momento eu só preciso fazer isso.
          </p>
        </Prose>

        <Sub title="Qual controle usar pra exposição">
          <Bullets
            items={[
              { label: 'Offset:', text: 'sobe ou desce a imagem toda, mantendo a relação entre sombras, médios e altas luzes. É o mais parecido com abrir ou fechar o diafragma.' },
              { label: 'Gamma:', text: 'mexe principalmente nos médios, segurando pretos e brancos. Foi o que a gente usou pra esconder o logo sem escurecer demais o preto.' },
              { label: 'Lift e Gain:', text: 'mexem nas extremidades, ou seja, nas sombras e nas altas luzes.' },
              { label: 'HDR (Exposure):', text: 'ajusta por zona, em stops, com mais isolamento. A gente usa ele daqui a pouco.' },
            ]}
          />
          <Prose>
            <p>
              Uma ordem que funciona bem nas primárias é luz primeiro, cor depois, porque mexer na luz muda a percepção da cor. Por isso a exposição vem antes do balanço de branco na nossa sequência de nodes.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== BALANÇO DE BRANCO E PRETO ===================== */}
      <EditorialSection
        id="balanco-e-preto"
        kickerLeft="CORREÇÃO DE COR · PRIMÁRIAS"
        kickerRight="COR"
        title="BALANÇO DE BRANCO E PONTO DE PRETO"
      >
        <Prose>
          <p>
            Depois da exposição, a gente aperta <B>Alt + P</B> (Option + P no Mac) pra criar um node paralelo. O de cima a gente chama de <B>White Balance</B>, e o de baixo de <B>Black</B>. Por quê? São duas coisas importantes pra ajustar nesse primeiro momento: o balanço de branco e a parte mais escura da imagem. Em paralelo, um não interfere no outro.
          </p>
        </Prose>

        <Sub title="Duas formas de fazer o balanço de branco">
          <Prose>
            <p>
              Balanço de branco dá pra fazer de várias formas. Até pelas curvas dá pra fazer: qualquer coisa que ajuste cor consegue fazer balanço. Mas tem duas que são as mais famosas e as melhores:
            </p>
          </Prose>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="space-y-2 rounded-2xl bg-[#f5f5f7] p-5">
              <h5 className="font-sans text-base font-bold text-neutral-900">1. Printer lights (pelo Offset)</h5>
              <div className="space-y-3 font-serif text-[16px] leading-snug text-neutral-800">
                <p>
                  O nome vem da época do filme: o color timer ajustava a luz vermelha, verde e azul que passava pela cópia, em pequenos incrementos. Esses printer points mexem no sinal inteiro e mantêm a relação entre sombras, médios e altas luzes. No Resolve, isso é feito pelo Offset, e tem atalhos de printer lights pra ajustar canal por canal.
                </p>
                <p>O printer light é muito bom porque consegue corrigir distorções muito acentuadas, de qualquer cor.</p>
              </div>
            </section>
            <section className="space-y-2 rounded-2xl bg-[#f5f5f7] p-5">
              <h5 className="font-sans text-base font-bold text-neutral-900">2. A ferramenta White Balance</h5>
              <p className="font-serif text-[16px] leading-snug text-neutral-800">
                Nas Primaries, tem o conta-gotas de White Balance e os controles de Temperatura e Tint. A temperatura só tem duas direções, azul e amarelo (frio e quente), e o tint só verde e magenta. É mais limitado, mas é rápido.
              </p>
            </section>
          </div>
        </Sub>

        <Sub title="Não use um Canhão para Matar uma Mosca">
          <Prose>
            <p>
              O printer light é como se fosse um canhão. E às vezes o problema que você tem é do tamanho de uma mosca, tá? Não vale a pena perder tempo com printer light pra um ajuste pequenininho.
            </p>
            <p>
              Como saber o tamanho do problema? Botão direito no viewer &gt; <B>Show Picker RGB Value</B>. Passando o mouse numa parte que deveria ser branca, na garrafa a gente viu R 229, G 228 e B 230. A diferença é mínima. Então eu usei o conta-gotas do White Balance, cliquei na parte branca e pronto, ajustado.
            </p>
            <p>
              Você tem que fazer esse tipo de análise: o que eu tenho que ajustar é grande o suficiente pra essa ferramenta? Se não for, use a ferramenta mais simples, aquela que muita gente acha simplista, mas que resolve do jeito mais rápido.
            </p>
          </Prose>
        </Sub>

        <Sub title="Pick Black Point: deixando o preto neutro">
          <Prose>
            <p>
              No node Black, a gente usa o conta-gotas de <B>Pick Black Point</B>, que ajusta a cor da parte mais escura da imagem. Serve pra quando o preto não está preto, está meio amarelado, meio azulado.
            </p>
          </Prose>
          <NumberedSteps
            items={[
              { title: 'Ache a parte mais escura', text: 'Nos três pontinhos do viewer, ative a opção de mostrar o foco do qualifier. Assim você vê onde está clicando.' },
              { title: 'Clique no Pick Black Point', text: 'Escolha a parte mais escura da imagem.' },
              { title: 'Suba o Lift', text: 'A imagem vai afundar inteira. Não tem problema: suba o Lift até ela voltar.' },
            ]}
          />
          <Prose>
            <p>
              Na garrafa, o preto já estava completamente preto. A imagem saiu da câmera muito bem balanceada, então aqui a gente roubou no jogo, mas o processo é esse.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== HDR, FALSE COLOR E CONTRASTE ===================== */}
      <EditorialSection
        id="hdr-false-color-contraste"
        kickerLeft="CORREÇÃO DE COR · PRIMÁRIAS"
        kickerRight="LUZ"
        title="HDR, FALSE COLOR E CONTRASTE"
      >
        <Prose>
          <p>
            Depois do balanço, a gente faz uns ajustes pontuais com a palette <B>HDR</B>. Por que não uma seleção de cor? O ideal até seria, mas nas primárias a gente não faz seleção, tá? Isso é das secundárias. E, do jeito que a imagem está, uma seleção ia pegar várias outras partes que não interessam agora. Profundidade, iluminação e contraste ficam nas primárias.
          </p>
        </Prose>

        <Sub title="As zonas do HDR">
          <Prose>
            <p>
              O HDR divide a luz da imagem em zonas: Black, Dark, Shadow, Light, Highlight e Specular, além do Global. Cada zona controla uma parte específica da iluminação, e também dá pra colorir só aquela faixa. Dá até pra fazer um color inteiro no HDR, mas daria muito mais trabalho.
            </p>
            <p>
              Antes de usar, um detalhe importante: nos três pontinhos da palette, configure o gamma do HDR pro mesmo espaço de trabalho do projeto. No nosso caso, <B>ACEScct</B>, porque foi o que a gente escolheu no gerenciamento de cores. Assim as zonas caem no lugar certo da imagem.
            </p>
          </Prose>
        </Sub>

        <Sub title="Baixando os picos">
          <Prose>
            <p>
              Na garrafa, o waveform mostrava uns picos muito altos. Nesse primeiro momento a gente quer a imagem neutra, então eu fui no <B>Specular</B>, arrastei a exposição pra esquerda, e ele baixou só esses picos. Depois baixei um pouquinho o <B>Highlight</B>. Na tela quase não dá pra ver, porque é um pedacinho muito pequeno, mas no scope a diferença aparece.
            </p>
          </Prose>
        </Sub>

        <Sub title="False color: medindo a exposição">
          <Prose>
            <p>
              Pra acertar o fundo, a gente cria um node logo depois do ODT chamado <B>False Color</B>. O false color mostra a exposição da imagem por meio de cores, então dá pra ver o que está subexposto e o que está superexposto.
            </p>
          </Prose>
          <Bullets
            single
            items={[
              { label: 'Resolve Studio:', text: 'é só buscar o efeito False Color.' },
              {
                label: 'Resolve gratuito:',
                text: (
                  <>
                    dá pra usar o plugin gratuito de false color da Dehancer, que funciona praticamente igual.{' '}
                    <a
                      href="https://www.dehancer.com/shop/davinci_resolve/monitor"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-sans font-semibold text-[#0071e3] underline-offset-2 hover:underline"
                    >
                      Baixar o Dehancer Monitor
                    </a>
                    .
                  </>
                ),
              },
            ]}
          />
          <FalseColorGuide />
        </Sub>

        <Sub title="Silhueta: produto escuro, fundo claro">
          <Prose>
            <p>
              O que eu quero é deixar o fundo, essa parte do barril, no verde. Por quê? Porque o desenho da silhueta da garrafa tem que ficar muito claro. Pra a silhueta ficar marcada, eu preciso de contraste: o objeto escuro e o fundo mais claro.
            </p>
            <p>
              No HDR, fui no <B>Shadow</B> e subi a exposição até o fundo ficar verde no false color. Só que, subindo o shadow, uma parte da garrafa que também está nas sombras subiu junto. Isso a gente resolve depois, nas secundárias.
            </p>
          </Prose>
        </Sub>

        <Sub title="Contraste: use o do HDR">
          <Prose>
            <p>
              Agora a gente cria um node chamado <B>Contraste</B>. Dá pra fazer no próprio node do HDR, mas separado fica mais didático.
            </p>
            <p>
              E aqui tem um detalhe importante: o contraste que a gente usa é o do <B>HDR</B>, não o das Color Wheels. O contraste das Color Wheels mexe nos canais RGB juntos, então além de contrastar a luz ele contrasta a cor: o que está saturado fica mais saturado, e o que está menos saturado fica menos ainda. O do HDR mexe só na luminosidade e preserva a saturação. É isso que a gente quer aqui.
            </p>
            <p>
              Suba o contraste com cuidado. Conforme ele aumenta, as sombras descem e os highlights sobem, e passando do ponto a imagem clipa embaixo e estoura em cima. Na garrafa, depois do contraste, eu voltei no HDR, baixei um pouco os <B>Highlights</B> e subi um pouco o <B>Black</B> pra controlar os extremos. Resultado: fundo mais claro e silhueta da garrafa bem marcada.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== SATURAÇÃO E LOG WHEELS ===================== */}
      <EditorialSection
        id="saturacao-log-wheels"
        kickerLeft="CORREÇÃO DE COR · PRIMÁRIAS"
        kickerRight="REFINAMENTO"
        title="SATURAÇÃO E REFINAMENTO COM LOG WHEELS"
      >
        <Sub title="Um leve ajuste de saturação">
          <Prose>
            <p>
              Com o contraste feito, a gente faz um leve ajuste de saturação. Na aula eu usei a palette <B>Color Slice</B> e subi um pouquinho a saturação. Pouca coisa, tá? Se subir muito, a imagem rasga e fica muito alaranjada. É só pra dar aquela corzinha.
            </p>
            <p>
              No produto, cuidado redobrado com a saturação: embalagem costuma ter cor forte, e é a primeira coisa que estoura o canal. Na dúvida, use menos.
            </p>
          </Prose>
        </Sub>

        <Sub title="Log Wheels: descolando as sombras">
          <Prose>
            <p>
              Pra fechar, eu criei mais dois nodes, em paralelo: <B>Shadow</B> e <B>Highlight</B>.
            </p>
            <p>
              No Shadow, a ideia é descolar de vez uma parte que estava muito colada no preto. Pra isso, as <B>Log Wheels</B>: elas trabalham faixas mais estreitas da escala tonal do que as Color Wheels, então dá pra mexer na sombra sem afetar tanto os médios. Subi um pouquinho o Shadow e pronto, descolou.
            </p>
            <p>No Highlight, baixei um pouco as altas luzes pra recuperar detalhe.</p>
          </Prose>
          <Note>
            Dá pra colocar tudo isso num node só, não tem problema. Eu separei pra ficar mais fácil de entender. Comparando com Ctrl/Command + D nos dois nodes, dá pra ver que a gente ganhou detalhe nas sombras.
          </Note>
        </Sub>
      </EditorialSection>

      {/* ===================== NA PRÁTICA ===================== */}
      <EditorialSection
        id="na-pratica-primarias"
        kickerLeft="CORREÇÃO DE COR · PRIMÁRIAS"
        kickerRight="NA PRÁTICA"
        title="NA PRÁTICA: A SEQUÊNCIA DE NODES USADA NA AULA"
      >
        <Prose>
          <p>
            Juntando tudo, esta foi a sequência de nodes usada na correção primária do take da garrafa de bebida, mostrada na aula. Clique em cada node para ver a ferramenta e o que foi feito nele:
          </p>
        </Prose>

        <NodeTreeGraph />

        <Prose>
          <p>
            Repare que, até aqui, nenhuma seleção foi feita e nenhum look foi aplicado. A imagem está neutra, equilibrada e de acordo com a proposta do take: a garrafa é reconhecível e a marca fica escondida.
          </p>
          <p>
            O próximo passo é o shot matching, pra que todos os takes pareçam estar na mesma unidade. Depois vêm as secundárias, onde a gente pega cada pedacinho da imagem: tira saturação de uma parte, ajusta a luz de outra, coloca uma sombra ali.
          </p>
        </Prose>
      </EditorialSection>

      {/* ===================== ERROS COMUNS ===================== */}
      <EditorialSection
        id="erros-primarias"
        kickerLeft="CORREÇÃO DE COR · PRIMÁRIAS"
        kickerRight="ATENÇÃO"
        title="ERROS COMUNS NAS PRIMÁRIAS"
      >
        <DataTable
          caption="Erros comuns nas primárias, o que acontece e como evitar"
          head={['Erro', 'O que acontece', 'Como evitar']}
          rows={[
            ['Mexer na luz sem saber a proposta', 'Você “corrige” o que estava certo, tipo revelar um logo que devia ficar escondido', 'Defina a proposta narrativa do take antes'],
            ['Usar o printer light num problema pequeno', 'Tempo perdido com printer light num desvio mínimo', 'Meça com o Picker RGB antes de escolher a ferramenta'],
            ['Fazer seleção nas primárias', 'A seleção pega partes erradas e bagunça a base', 'Primárias são globais; seleção fica pras secundárias'],
            ['HDR no gamma errado', 'As zonas caem no lugar errado da imagem', 'Configure o HDR no mesmo espaço de trabalho (ex.: ACEScct)'],
            ['Usar o contraste das Color Wheels', 'A saturação muda junto com o contraste', 'Use o contraste do HDR, que mexe só na luz'],
            ['Deixar highlight estourado', 'Perde textura que não volta', 'Deixe um pouco abaixo do limite, conferindo no false color'],
            ['Saturar demais', 'A imagem rasga e a embalagem estoura', 'Suba pouco e compare antes e depois'],
            ['Esquecer o false color ligado', 'O filme é exportado com as cores do false color', 'Desligue o node antes de renderizar'],
          ]}
          minWidth={680}
        />

        <ScoredQuiz
          title="Teste seus conhecimentos"
          hint="Leia cada pergunta e escolha a resposta certa. As respostas vêm do artigo."
          pool={PRIMARIAS_QUIZ}
        />
      </EditorialSection>

      {/* ===================== CONCLUSÃO ===================== */}
      <EditorialSection
        id="conclusao-primarias"
        kickerLeft="CORREÇÃO DE COR · PRIMÁRIAS"
        kickerRight="CONCLUSÃO"
        title="CONCLUSÃO"
      >
        <Prose>
          <p>
            As primárias são a base de tudo: gerenciamento de cor, exposição, balanço de branco, ponto de preto, contraste e saturação, sempre na imagem inteira e sempre buscando uma imagem neutra. Mesmo neutra, a imagem segue a proposta: a proposta narrativa do take decide o que mostrar e o que esconder.
          </p>
          <p>
            Escolha a ferramenta pelo tamanho do problema: desvio pequeno de balanço pede o conta-gotas, e o contraste do HDR mexe só na luz. Com a base bem feita, o shot matching, as secundárias e o look ficam muito mais fáceis.
          </p>
        </Prose>
      </EditorialSection>
    </article>
  );
}
