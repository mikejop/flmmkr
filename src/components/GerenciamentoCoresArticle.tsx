'use client';

import React from 'react';
import { ArrowRight, Maximize2 } from 'lucide-react';
import { ArticleToc, EditorialSection, type TocGroup } from './EditorialLayout';
import { ImageLightbox } from './ImageLightbox';

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

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc pl-6 font-serif text-[16px] sm:text-[17px] leading-[1.6] text-neutral-800 sm:columns-2 gap-8 [&>li]:mb-2 [&>li]:break-inside-avoid">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
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

/** Sumário do artigo: cada item leva à âncora do assunto (sem rolagem animada). */
const TOC: TocGroup[] = [
  {
    title: 'Color Science e Color Space & Transforms',
    id: 'color-science-e-transforms',
    items: [
      { label: 'O que é Color Science?', id: 'o-que-e-color-science' },
      { label: 'Use Separate Color Space and Gamma', id: 'use-separate-color-space-and-gamma' },
      { label: 'Input Color Space', id: 'input-color-space' },
      { label: 'Timeline Color Space', id: 'timeline-color-space' },
      { label: 'Output Color Space', id: 'output-color-space' },
      { label: 'As três etapas em cada sistema', id: 'as-tres-etapas-em-cada-sistema' },
    ],
  },
  {
    title: 'Configurar no Project Settings',
    id: 'metodos-no-project-settings',
    items: [
      { label: 'DaVinci YRGB Color Managed', id: 'davinci-yrgb-color-managed' },
      { label: 'ACEScc e ACEScct', id: 'acescc-e-acescct' },
    ],
  },
  {
    title: 'Camera RAW para Rec.709',
    id: 'camera-raw',
    items: [
      { label: 'Como fazer', id: 'como-fazer' },
      { label: 'Vantagens e desvantagens', id: 'vantagens-e-desvantagens-deste-metodo' },
    ],
  },
  {
    title: 'Nodes e CST',
    id: 'fluxo-completo',
    items: [
      { label: 'CST de entrada', id: 'cst-de-entrada' },
      { label: 'Nodes de correção e grading', id: 'nodes-de-correcao-e-grading' },
      { label: 'CST de saída', id: 'cst-de-saida' },
      { label: 'O fluxo completo em nodes', id: 'o-fluxo-completo-em-nodes' },
    ],
  },
];

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


      {/* ===================== COLOR SCIENCE E COLOR SPACE & TRANSFORMS ===================== */}
      <EditorialSection
        id="color-science-e-transforms"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="COLOR SCIENCE"
        title="COLOR SCIENCE E COLOR SPACE & TRANSFORMS NO DAVINCI RESOLVE 21"
      >
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

        <Sub title="1. O que é Color Science?">
          <Prose>
            <p>
              Color Science é o sistema que define como o DaVinci Resolve interpreta, processa e apresenta as cores do projeto. Escolhê-lo é o primeiro passo do gerenciamento de cores, porque determina como as transformações serão organizadas e quais parâmetros você poderá controlar.
            </p>
            <p>
              Em qualquer método, o trabalho segue três etapas: interpretar a gravação da câmera (entrada), trabalhar a imagem em um espaço de cor adequado ao grading (trabalho) e converter o resultado para o padrão de exibição ou entrega (saída). Uma gravação Sony em S-Log3 e S-Gamut3.Cine, por exemplo, é interpretada na entrada, corrigida no espaço de trabalho e entregue em Rec.709 para SDR.
            </p>
            <p>
              O painel Color Space & Transforms, mostrado acima, reúne essas decisões. As próximas seções explicam cada opção dele e, depois, os métodos que as aplicam.
            </p>
          </Prose>
        </Sub>

        <Sub title="2. Use Separate Color Space and Gamma">
          <Prose cols={3}>
            <p>
              Para entender essa opção, primeiro precisamos compreender que o espaço de cor e a curva de transferência são duas características diferentes da imagem. Embora trabalhem juntas, cada uma tem uma função específica na maneira como o DaVinci Resolve interpreta a gravação.
            </p>
            <p>
              O <strong className="font-semibold text-neutral-900">Color Space</strong> define as primárias utilizadas para representar as cores e, consequentemente, o gamut, ou seja, a faixa de cores que pode ser representada naquele espaço. Já o <strong className="font-semibold text-neutral-900">Gamma</strong> define a curva de transferência utilizada para codificar os valores de luminosidade da imagem. É essa curva que determina como as informações de luz da cena são representadas numericamente no sinal.
            </p>
            <p>
              No exemplo da câmera Sony, ao gravar em S-Log3 e S-Gamut3.Cine você está utilizando duas configurações diferentes: S-Log3 é a curva de transferência, enquanto S-Gamut3.Cine define o gamut. Para que o DaVinci Resolve interprete corretamente essa gravação, precisamos informar os dois parâmetros.
            </p>
            <p>
              É justamente para isso que serve a opção <strong className="font-semibold text-neutral-900">Use Separate Color Space and Gamma</strong>. Quando ela está desativada, o Resolve apresenta combinações predefinidas de espaço de cor e curva de transferência. Ao ativá-la, você pode selecionar cada parâmetro separadamente, quando o método de gerenciamento escolhido permitir.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">Quando devemos ativar essa opção?</strong> Quando precisamos especificar o gamut e a curva de transferência de forma independente, seja porque o material utiliza uma combinação específica da câmera, seja porque precisamos de maior controle sobre a interpretação da imagem.
            </p>
            <p>
              O cuidado principal é selecionar os parâmetros correspondentes à gravação original. Se escolhermos o espaço de cor correto, mas atribuirmos uma curva de transferência diferente da utilizada pela câmera, o Resolve interpretará os valores de luminosidade de maneira incorreta. O resultado pode apresentar diferenças de contraste, exposição aparente e reprodução das cores.
            </p>
          </Prose>
        </Sub>

        <Sub title="3. Input Color Space">
          <Prose>
            <p>
              O espaço de cor de entrada descreve como a imagem original foi registrada ou codificada. Ele precisa corresponder às características reais do material, tanto o gamut quanto a curva usados pela câmera.
            </p>
            <p>
              No RCM personalizado, é possível definir o espaço de entrada padrão e atribuir perfis específicos aos clipes no Media Pool.
            </p>
          </Prose>
        </Sub>

        <Sub title="4. Timeline Color Space">
          <Prose cols={3}>
            <p>
              O Timeline Color Space define o espaço de trabalho no qual o Resolve realiza as operações de correção de cor. Ele determina como os ajustes são processados matematicamente e não deve ser confundido com o espaço de cor da câmera nem com o da entrega final.
            </p>
            <p>
              Uma opção muito versátil para o RCM é DaVinci Wide Gamut com DaVinci Intermediate. O gamut amplo permite trabalhar com uma faixa extensa de cores, enquanto a curva Intermediate oferece uma codificação logarítmica apropriada ao grading.
            </p>
            <p>
              Também é possível trabalhar em Rec.709 quando o projeto exige uma abordagem mais direta para SDR, mas um espaço amplo oferece mais flexibilidade em determinados fluxos de trabalho.
            </p>
          </Prose>
          <Note>
            <strong className="font-sans font-bold text-neutral-900">Rec.709 (Scene)</strong> merece atenção especial: essa opção utiliza uma curva de transferência associada à representação scene-referred do Rec.709. Ela não é equivalente a Rec.709 Gamma 2.4, usado habitualmente como referência para exibição SDR. Os nomes não devem ser tratados como intercambiáveis.
          </Note>
        </Sub>

        <Sub title="5. Output Color Space">
          <Prose>
            <p>
              O Output Color Space determina o padrão de cor e a curva de saída para os quais a imagem será convertida no RCM.
            </p>
            <p>Alguns exemplos são:</p>
          </Prose>
          <BulletList
            items={[
              <><strong className="font-sans font-semibold text-neutral-900">Rec.709 Gamma 2.4:</strong> referência habitual para entregas SDR de broadcast.</>,
              <><strong className="font-sans font-semibold text-neutral-900">P3:</strong> utilizado em diferentes contextos de cinema, monitoramento e distribuição de gamut amplo.</>,
              <><strong className="font-sans font-semibold text-neutral-900">Rec.2020:</strong> padrão de gamut amplo usado em vídeo, incluindo fluxos HDR.</>,
              <><strong className="font-sans font-semibold text-neutral-900">Saídas HDR com PQ ou HLG:</strong> utilizadas conforme a especificação de masterização e entrega.</>,
            ]}
          />
          <Prose>
            <p>
              A saída deve corresponder aos requisitos técnicos do projeto. Para criar uma versão em outro padrão, você pode alterar o espaço de saída no RCM, mas precisa conferir a imagem e ajustar os planos quando necessário.
            </p>
          </Prose>
        </Sub>

        <Sub title="6. As três etapas em cada sistema">
          <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
            <table className="w-full min-w-[640px] border-collapse text-left font-sans text-[15px]">
              <thead>
                <tr className="bg-[#f5f5f7] text-sm font-bold text-neutral-900">
                  <th scope="col" className="px-5 py-3">Etapa</th>
                  <th scope="col" className="px-5 py-3">RCM (Project Settings)</th>
                  <th scope="col" className="px-5 py-3">CST (nodes)</th>
                  <th scope="col" className="px-5 py-3">ACES</th>
                </tr>
              </thead>
              <tbody className="align-top text-neutral-800 [&_td]:border-t [&_td]:border-neutral-200 [&_td]:px-5 [&_td]:py-3.5 [&_th]:border-t [&_th]:border-neutral-200 [&_th]:px-5 [&_th]:py-3.5">
                <tr>
                  <th scope="row" className="font-bold text-[#0071e3]">Entrada</th>
                  <td>Input Color Space (automático ou por clipe)</td>
                  <td>CST de entrada: Input Color Space e Input Gamma</td>
                  <td>ACES Input Transform</td>
                </tr>
                <tr>
                  <th scope="row" className="font-bold text-[#0071e3]">Trabalho</th>
                  <td>Timeline Color Space, como DaVinci Wide Gamut / DaVinci Intermediate</td>
                  <td>Espaço de trabalho escolhido no CST, com os nodes de grading entre os dois CSTs</td>
                  <td>ACEScc ou ACEScct</td>
                </tr>
                <tr>
                  <th scope="row" className="font-bold text-[#0071e3]">Saída</th>
                  <td>Output Color Space, como Rec.709 Gamma 2.4</td>
                  <td>CST de saída: Output Color Space e Output Gamma</td>
                  <td>ACES Output Transform</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Sub>
      </EditorialSection>

      <EditorialSection
        id="metodos-no-project-settings"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="MÉTODOS"
        title="COMO CONFIGURAR O GERENCIAMENTO DE CORES NO PROJETO"
      >
        <Prose cols={1}>
          <p>
            No Resolve 21, o Color Science oferece dois caminhos principais: o <strong className="font-semibold text-neutral-900">DaVinci YRGB Color Managed</strong> (RCM), o gerenciamento do próprio Resolve, e o <strong className="font-semibold text-neutral-900">ACEScc ou ACEScct</strong>, que seguem o padrão ACES. Os dois aplicam as três etapas automaticamente; muda quem define as regras e como as ferramentas respondem no grading.
          </p>
        </Prose>

        <Sub title="1. DaVinci YRGB Color Managed">
          <Prose>
            <p>
              O DaVinci YRGB Color Managed, também conhecido como RCM (Resolve Color Management), automatiza as transformações entre o espaço de cor da câmera, o espaço de trabalho e o formato de saída.
            </p>
            <p>
              No modo automático, o Resolve tenta identificar o espaço de cor de entrada conforme os metadados, formatos e codecs disponíveis. No modo personalizado, você tem mais controle sobre as configurações de entrada, o espaço de trabalho e a saída.
            </p>
          </Prose>
          <Steps
            title="Como configurar"
            items={[
              { text: 'Abra Project Settings > Color Management.', action: viewImage('projectSettings') },
              { text: 'Em Color Science, selecione DaVinci YRGB Color Managed.', action: viewImage('yrgbColorManaged') },
              { text: 'Escolha entre o gerenciamento automático e o gerenciamento personalizado.', action: viewImage('automaticColor') },
              { text: 'Defina o espaço de trabalho e o formato de saída de acordo com o projeto.', action: viewImage('outputColorSpace') },
              'Confira se cada clipe está sendo interpretado corretamente.',
            ]}
          />
          <ProsCons
            proLabel="Vantagens"
            conLabel="Desvantagens"
            pro="O RCM reduz a necessidade de aplicar transformações manuais em cada clipe. Também facilita a mistura de câmeras diferentes e a criação de versões SDR e HDR de um mesmo projeto."
            con="É necessário atribuir corretamente os espaços de cor de entrada. Uma identificação incorreta pode gerar diferenças de contraste, saturação e matiz. Além disso, os ajustes de grading podem responder de maneira diferente quando comparados a projetos que utilizam outro sistema."
          />
          <Note>
            <strong className="font-sans font-bold text-neutral-900">DaVinci YRGB Color Managed (Legacy):</strong> essa opção existe para preservar a compatibilidade com projetos antigos que utilizam a versão anterior do gerenciamento de cores do Resolve. Para projetos novos, normalmente é preferível utilizar o sistema atual, salvo quando houver uma exigência específica de compatibilidade.
          </Note>
        </Sub>

        <Sub title="2. ACEScc e ACEScct">
          <Prose>
            <p>
              ACES significa Academy Color Encoding System. É um sistema de gerenciamento de cores criado para facilitar a troca de imagens entre câmeras, departamentos de pós-produção, empresas de efeitos visuais e ambientes de exibição, com uma arquitetura padronizada que organiza a interpretação da imagem de origem e sua conversão para o destino.
            </p>
            <p>No ACES, o percurso da imagem é este:</p>
          </Prose>
          <Flow
            steps={[
              { title: 'ACES Input Transform', sub: 'Color Space da Câmera → ACEScc ou ACEScct' },
              { title: 'Ambiente de trabalho ACES', sub: 'correção de cor e grading' },
              { title: 'ACES Output Transform', sub: 'ACEScc ou ACEScct → Rec.709 BT.1886' },
            ]}
          />
          <Prose cols={1}>
            <p>
              Para o grading, o ambiente de trabalho usa uma de duas codificações, o ACEScc ou o ACEScct. Veja a diferença entre elas.
            </p>
          </Prose>

          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h5 className="font-sans text-xl font-bold text-[#0071e3]">ACEScc</h5>
              <Prose cols={1}>
                <p>
                  O ACEScc utiliza uma codificação logarítmica para o trabalho de correção de cor. Sua estrutura é baseada em uma codificação log do tipo Cineon, adaptada ao ambiente ACES.
                </p>
              </Prose>
            </div>
            <div className="space-y-4">
              <h5 className="font-sans text-xl font-bold text-[#0071e3]">ACEScct</h5>
              <Prose cols={1}>
                <p>
                  O ACEScct é uma variação do ACEScc que modifica a região inicial da curva, próxima do preto. Essa característica torna alguns ajustes de elevação e abertura das sombras mais familiares para quem trabalha com imagens logarítmicas tradicionais.
                </p>
                <p>Na prática, é frequentemente uma opção mais intuitiva para o grading convencional.</p>
              </Prose>
            </div>
          </div>
          <Note>
            Nenhum dos dois métodos garante uma imagem artisticamente superior. A principal diferença está na codificação utilizada para o processamento e na maneira como os ajustes respondem.
          </Note>

          <Steps
            title="Como configurar o ACES"
            items={[
              { text: 'Abra o Project Settings clicando na engrenagem ou pressionando Shift+9.', action: viewImage('projectSettings') },
              { text: 'No Project Settings, vá até a aba Color Management.', action: viewImage('colorManagement') },
              { text: 'Em Color Science, selecione ACEScc ou ACEScct.', action: viewImage('acesColorScience') },
              { text: 'Configure o ACES Input Transform correspondente à câmera ou ao formato de origem.', action: viewImage('acesInput') },
              { text: 'Configure o ACES Output Transform para o destino de exibição ou entrega.', action: viewImage('acesOutput') },
              'Salve as configurações e confira a interpretação dos clipes.',
            ]}
          />
          <Prose>
            <p>
              O Resolve 21 oferece suporte a versões da especificação até ACES 2.0. Em projetos compartilhados, mantenha a versão exigida pelo pipeline em vez de escolher automaticamente a mais recente, para evitar diferenças de processamento.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      <EditorialSection
        id="camera-raw"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="CAMERA RAW"
        title="COMO CONVERTER ARQUIVOS RAW PARA REC.709 USANDO O CAMERA RAW"
      >
        <Prose>
          <p>
            Existe ainda uma alternativa que não passa pelo gerenciamento de cores do projeto: converter a imagem já na decodificação do arquivo RAW. O Camera RAW permite controlar como o DaVinci Resolve interpreta e decodifica os dados capturados por diferentes câmeras. Dependendo do formato, é possível escolher o espaço de cor e a curva de transferência utilizados na conversão, obtendo diretamente uma imagem normalizada para exibição SDR.
          </p>
        </Prose>

        <Sub title="Como fazer">
          <TitledSteps
            items={[
              {
                title: 'Selecione o arquivo RAW',
                body: [
                  <>
                    Na página Color, selecione o clipe e abra a paleta Camera RAW. Os controles disponíveis variam conforme o formato e o fabricante da câmera.{' '}
                    {viewImage('select')}
                  </>,
                ],
              },
              {
                title: 'Defina o método de decodificação',
                body: [
                  <>
                    Escolha se deseja utilizar as configurações individuais do clipe, as configurações do projeto ou os metadados da câmera, conforme as opções disponíveis. Para configurar um plano individualmente, utilize o modo Clip.{' '}
                    {viewImage('decode')}
                  </>,
                ],
              },
              {
                title: 'Configure a conversão para Rec.709',
                body: [
                  <>
                    Procure os controles Color Space e Gamma, ou seus equivalentes no decodificador da câmera.{' '}
                    {viewImage('convert')}
                  </>,
                  'Quando disponíveis, selecione Rec.709 como espaço de cor e a curva de transferência apropriada para a saída SDR. Alguns formatos oferecem opções como Rec.709, Video ou outras curvas específicas do fabricante. Escolha a combinação compatível com o decodificador e o resultado desejado, sem presumir que nomes semelhantes sejam matematicamente idênticos.',
                ],
              },
              {
                title: 'Confira o resultado',
                body: [
                  'Observe contraste, saturação, tons de pele e detalhes nas altas luzes e sombras. Se necessário, ajuste a interpretação do arquivo antes de iniciar o grading.',
                ],
              },
            ]}
          />
        </Sub>

        <Sub title="Vantagens e desvantagens deste método">
          <ProsCons
            pro="A principal vantagem é realizar a conversão durante a decodificação, simplificando o fluxo de trabalho e reduzindo a necessidade de transformações adicionais."
            con="A desvantagem é que as possibilidades dependem do formato RAW e do decodificador. Além disso, uma conversão direta para uma curva de exibição oferece menos flexibilidade visual para trabalhar com uma imagem log durante o grading."
          />
          <Note>
            O ponto fundamental é verificar quais conversões cada câmera disponibiliza, escolher as configurações corretas e evitar aplicar uma segunda transformação para Rec.709 sobre uma imagem que já foi normalizada.
          </Note>
        </Sub>
      </EditorialSection>

      <EditorialSection
        id="fluxo-completo"
        kickerLeft="FUNDAMENTOS · GERENCIAMENTO DE CORES"
        kickerRight="FLUXO"
        title="GERENCIAMENTO DE CORES UTILIZANDO NODES E CST"
      >
        <Prose cols={1}>
          <p>
            Quando não usamos o RCM nem o ACES, podemos montar o gerenciamento de cores manualmente, com nodes de Color Space Transform, o CST. As três etapas continuam as mesmas (entrada, trabalho e saída), mas cada uma passa a ser um node que você configura e controla.
          </p>
        </Prose>

        <Sub title="1. CST de entrada">
          <Prose>
            <p>
              O primeiro node informa ao Resolve como a imagem foi gravada. No efeito Color Space Transform, isso é feito com o <strong className="font-semibold text-neutral-900">Input Color Space</strong> e o <strong className="font-semibold text-neutral-900">Input Gamma</strong>, que devem corresponder ao espaço de cor e à curva de transferência da câmera; em seguida, escolhemos o espaço de cor e a curva para os quais a imagem será convertida.
            </p>
            <p>
              No exemplo da Sony, o CST recebe S-Gamut3.Cine / S-Log3 e converte para DaVinci Wide Gamut / DaVinci Intermediate, o espaço de trabalho. Assim, câmeras diferentes passam a ter uma base comum, desde que a transformação corresponda ao perfil real da gravação.
            </p>
            <p>
              Atenção: um CST que converte direto para DaVinci Wide Gamut não é, em sentido estrito, um ACES Input Transform, que tem como destino o ACES2065-1.
            </p>
          </Prose>
        </Sub>

        <Sub title="2. Nodes de correção e grading">
          <Prose>
            <p>
              Depois do CST de entrada, ficam os nodes de primárias, secundárias, curvas, qualifiers, Power Windows e as demais ferramentas. Primeiro estabelecemos consistência entre os planos, ajustando exposição, balanço de branco, contraste e saturação; depois isolamos regiões, modificamos cores e construímos a aparência artística. Todos esses ajustes acontecem no espaço de trabalho definido no primeiro CST.
            </p>
            <p>
              Manter a entrada separada dos nodes de correção mostra onde termina a interpretação da câmera e onde começa o trabalho criativo. Se um clipe foi interpretado com o perfil errado, corrigimos só o CST de entrada, sem refazer a cadeia de grading.
            </p>
          </Prose>
        </Sub>

        <Sub title="3. CST de saída">
          <Prose>
            <p>
              O último node converte a imagem do espaço de trabalho para o padrão de exibição ou entrega. Ele inverte a lógica do primeiro: o <strong className="font-semibold text-neutral-900">Input Color Space</strong> e o <strong className="font-semibold text-neutral-900">Input Gamma</strong> passam a ser o espaço de trabalho, e o <strong className="font-semibold text-neutral-900">Output Color Space</strong> e o <strong className="font-semibold text-neutral-900">Output Gamma</strong> correspondem ao destino, como Rec.709 com Gamma 2.4 em um fluxo de referência SDR convencional.
            </p>
            <p>
              Essa conversão não serve apenas para alterar a aparência: ela adapta luminosidade e cores ao espaço de saída, respeitando o padrão de exibição. Para isso, podem ser usados tone mapping e gamut mapping, quando apropriado.
            </p>
            <p>
              Se o destino for um monitoramento P3 para cinema, a saída precisa corresponder à especificação de exibição usada. O P3 de monitoramento não deve ser confundido com a codificação final de um DCP, que normalmente utiliza XYZ.
            </p>
          </Prose>
        </Sub>

        <Sub title="4. O fluxo completo em nodes">
          <Flow
            steps={[
              {
                title: 'CST de entrada',
                sub: [
                  'Input Color Space → Color Space da Câmera',
                  'Input Gamma → Gamma da Câmera',
                  'Output Color Space → DaVinci Wide Gamut',
                  'Output Gamma → DaVinci Intermediate',
                ],
              },
              { title: 'Espaço de trabalho', sub: 'nodes de correção e grading' },
              {
                title: 'CST de saída',
                sub: [
                  'Input Color Space → DaVinci Wide Gamut',
                  'Input Gamma → DaVinci Intermediate',
                  'Output Color Space → Rec.709',
                  'Output Gamma → Gamma 2.4',
                ],
              },
            ]}
          />
          <Note>
            Esse fluxo pressupõe transformações manuais. Se o projeto já usa o Resolve Color Management ou o gerenciamento ACES nas configurações, não adicione CSTs que repitam as mesmas transformações: isso provocaria conversões duplicadas. O ACES completo, aliás, não se resume a dois nodes de conversão: ele tem uma arquitetura própria de transformações de entrada e saída.
          </Note>
        </Sub>

        <p className="font-sans text-sm leading-relaxed text-neutral-700">
          <strong className="font-semibold text-neutral-900">Referências:</strong>{' '}
          <a href="https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-20-Colorist-Guide.pdf" target="_blank" rel="noreferrer noopener" className="text-[#0071e3] hover:underline">Colorist Guide to DaVinci Resolve, da Blackmagic Design</a>,{' '}
          <a href="https://docs.acescentral.com/system-components/input-transforms/" target="_blank" rel="noreferrer noopener" className="text-[#0071e3] hover:underline">documentação ACES sobre Input Transforms</a>,{' '}
          <a href="https://docs.acescentral.com/system-components/output-transforms/" target="_blank" rel="noreferrer noopener" className="text-[#0071e3] hover:underline">documentação ACES sobre Output Transforms</a>,{' '}
          <a
            href="https://www.imaster.org/docs/davinci-resolve-21-manual/part-2-setup-and-workflows/ch.-6-project-settings"
            target="_blank"
            rel="noreferrer noopener"
            className="text-[#0071e3] hover:underline"
          >
            Manual do DaVinci Resolve 21, capítulo 6: Project Settings
          </a>{' '}
          e{' '}
          <a
            href="https://docs.imaster.org/davinci-resolve-21-manual/part-2-setup-and-workflows/ch.-9-data-levels,-color-management,-and-aces"
            target="_blank"
            rel="noreferrer noopener"
            className="text-[#0071e3] hover:underline"
          >
            capítulo 9: Data Levels, Color Management, and ACES
          </a>
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
