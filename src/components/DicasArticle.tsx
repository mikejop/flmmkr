'use client';

import React, { useState } from 'react';
import { ArticleToc, EditorialSection, type TocGroup } from './EditorialLayout';
import { Sub, Prose, Bullets, NumberedSteps, Interactive } from './ArticleBlocks';
import { ImageLightbox } from './ImageLightbox';
import { Maximize2 } from 'lucide-react';

/**
 * Conteúdo da aula "Dicas": configurações do DaVinci Resolve que facilitam o color grading.
 *
 * Ferramentas interativas:
 *  - Checklist  → "Aplicação prática": o aluno marca o que já configurou.
 */

/* ------------------------------------------------------------------ checklist */

const CHECKLIST: { id: string; text: React.ReactNode }[] = [
  { id: 'tab', text: <>Criar o atalho <strong>Tab</strong> para <strong>Label Selected Nodes</strong> em Keyboard Customization e salvar</> },
  { id: 'dqf', text: <>Ligar <strong>Display Qualifier Focus</strong> nos três pontinhos dos Scopes</> },
  { id: 'skin', text: <>Ligar <strong>Show Skin Tone Indicator</strong> nas configurações do Vectorscope</> },
  { id: 'wave', text: <>Waveform em <strong>Y</strong>, com <strong>Colorize</strong> desligado e <strong>Extents</strong> ligado</> },
  { id: 'parade', text: <>Parade com <strong>Extents</strong> ligado</> },
  { id: 'bright', text: <>Ajustar brilho do traço e da grade até ficar confortável de ler</> },
];

function SetupChecklist() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const count = CHECKLIST.filter((i) => done[i.id]).length;

  return (
    <Interactive title="Confira as suas configurações" hint="Marque cada item conforme for configurando no seu Resolve.">
      <ul className="space-y-2">
        {CHECKLIST.map((item) => (
          <li key={item.id}>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl bg-white p-3 font-serif text-[16px] leading-snug text-neutral-800 [&_strong]:font-sans [&_strong]:font-bold [&_strong]:text-neutral-900">
              <input
                type="checkbox"
                checked={!!done[item.id]}
                onChange={(e) => setDone((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[#0071e3]"
              />
              <span className={done[item.id] ? 'text-neutral-500 line-through' : ''}>{item.text}</span>
            </label>
          </li>
        ))}
      </ul>
      <div role="status" aria-live="polite" className="space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
          <div className="h-full rounded-full bg-[#0071e3] transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${(count / CHECKLIST.length) * 100}%` }} />
        </div>
        <p className="text-sm font-semibold text-neutral-700">
          {count === CHECKLIST.length ? 'Tudo configurado. Agora é só testar num plano do seu projeto.' : `${count} de ${CHECKLIST.length} configurados`}
        </p>
      </div>
    </Interactive>
  );
}

/* ------------------------------------------------------------------ sumário */

const TOC: TocGroup[] = [
  { title: 'Introdução', id: 'introducao-dicas' },
  {
    title: 'Renomear nodes com o Tab',
    id: 'atalho-tab',
    items: [
      { label: 'Como configurar o atalho', id: 'como-configurar-o-atalho' },
      { label: 'Por que a tecla Tab?', id: 'por-que-a-tecla-tab' },
    ],
  },
  {
    title: 'Display Qualifier Focus',
    id: 'display-qualifier-focus',
    items: [
      { label: 'Como ligar', id: 'como-ligar-o-display-qualifier-focus' },
      { label: 'Para que serve na prática', id: 'para-que-serve-na-pratica' },
    ],
  },
  {
    title: 'Skin Tone Indicator',
    id: 'skin-tone-indicator',
    items: [
      { label: 'Como ligar', id: 'como-ligar-o-skin-tone-indicator' },
      { label: 'Pele clara, pele escura', id: 'pele-clara-pele-escura-muda-alguma-coisa' },
    ],
  },
  {
    title: 'Waveform e Parade',
    id: 'waveform-e-parade',
    items: [
      { label: 'O que é o Extents', id: 'o-que-e-o-extents' },
      { label: 'Waveform: só luminância', id: 'waveform-so-luminancia' },
      { label: 'Brilho e grade', id: 'brilho-e-grade' },
      { label: 'Linhas de referência', id: 'linhas-de-referencia' },
      { label: 'Parade', id: 'parade' },
    ],
  },
  { title: 'Aplicação prática', id: 'aplicacao-pratica-dicas' },
  { title: 'Conclusão', id: 'conclusao-dicas' },
];

/* ------------------------------------------------------------------ passos com miniatura */

interface StepImage {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  /** Parte da imagem que aparece na miniatura (object-position). */
  position?: string;
}

/** Conteúdo com uma miniatura ao lado, na altura do conteúdo. Clique na imagem para ver inteira (lightbox). */
function WithImage({ image, onOpen, children, minHeight = false }: { image: StepImage; onOpen: (image: StepImage) => void; children: React.ReactNode; minHeight?: boolean }) {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-stretch">
      <div className="min-w-0">{children}</div>
      {/* A miniatura ocupa toda a altura do conteúdo (no celular, desce para baixo dele) */}
      <figure className="m-0">
        <button
          type="button"
          onClick={() => onOpen(image)}
          aria-haspopup="dialog"
          aria-label={`Ampliar a imagem: ${image.caption}`}
          className={`group relative block aspect-[10/7] w-full cursor-zoom-in overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 lg:aspect-auto lg:h-full ${minHeight ? 'lg:min-h-[260px]' : ''}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
            style={{ objectPosition: image.position || '50% 50%' }}
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/35 p-4 transition-colors duration-200 group-hover:bg-black/20 motion-reduce:transition-none">
            <span className="flex max-w-full items-center gap-2 rounded-full bg-white px-4 py-2.5 text-center font-sans text-sm font-semibold leading-tight text-neutral-900 shadow-lg transition-transform duration-200 group-hover:scale-[1.04] group-active:scale-[0.98] motion-reduce:transition-none">
              <Maximize2 size={16} aria-hidden="true" className="shrink-0 text-[#0071e3]" />
              <span>Para ver a imagem inteira, clique aqui</span>
            </span>
          </span>
        </button>
      </figure>
    </div>
  );
}

/** Passos numerados com uma miniatura ao lado. */
function StepsWithImage({ items, image, onOpen }: { items: { title: string; text: string }[]; image: StepImage; onOpen: (image: StepImage) => void }) {
  return (
    <WithImage image={image} onOpen={onOpen}>
      <NumberedSteps full items={items} />
    </WithImage>
  );
}

const KEYBOARD_IMAGE: StepImage = {
  src: '/images/dicas/keyboard-customization.webp',
  alt: 'Menu DaVinci Resolve com Keyboard Customization destacado e, abaixo, a janela Keyboard Customization com a busca por Label e o comando Label Selected Node, em Color > Nodes, com a tecla Tab atribuída',
  caption: 'DaVinci Resolve > Keyboard Customization: busque por Label e atribua a tecla Tab ao comando Label Selected Node.',
  width: 2000,
  height: 1406,
  position: '78% 50%',
};

const SKIN_TONE_IMAGE: StepImage = {
  src: '/images/dicas/skin-tone-indicator.webp',
  alt: 'Painel de Scopes do DaVinci Resolve em Vectorscope, com o botão Settings destacado e, no menu aberto, a opção Show Skin Tone Indicator marcada',
  caption: 'Vectorscope > Settings: ative o Show Skin Tone Indicator.',
  width: 2000,
  height: 1406,
  position: '82% 45%',
};

const EXTENTS_IMAGE: StepImage = {
  src: '/images/dicas/waveform-extents.webp',
  alt: 'Painel de Scopes do DaVinci Resolve em Waveform, com o botão Settings destacado e, no menu aberto, as opções Y selecionado, Colorize desligado e Extents ligado',
  caption: 'Waveform > Settings: Y selecionado, Colorize desligado e Extents ligado.',
  width: 2000,
  height: 1406,
  position: '78% 30%',
};

const LUMINANCE_IMAGE: StepImage = {
  src: '/images/dicas/waveform-luminancia.webp',
  alt: 'Painel de Scopes do DaVinci Resolve em Waveform, com o modo Y destacado no menu de Settings, Colorize desligado e Extents ligado',
  caption: 'Waveform > Settings: modo Y (luminância), Colorize desligado e Extents ligado.',
  width: 1489,
  height: 1156,
  position: '90% 20%',
};

const PARADE_IMAGE: StepImage = {
  src: '/images/dicas/parade.webp',
  alt: 'Parade do DaVinci Resolve mostrando os canais vermelho, verde e azul lado a lado, com o menu de Settings aberto e o Extents ligado',
  caption: 'Parade > Settings: configurações padrão, só com o Extents ligado.',
  width: 2000,
  height: 1555,
  position: '88% 25%',
};

const BRIGHTNESS_IMAGE: StepImage = {
  src: '/images/dicas/brilho-e-grade.webp',
  alt: 'Menu de Settings da Waveform do DaVinci Resolve com os controles de brilho do traço (Waveform) e da grade (Graticule) destacados em amarelo',
  caption: 'Waveform > Settings: os controles Waveform (brilho do traço) e Graticule (grade).',
  width: 1478,
  height: 1147,
  position: '88% 30%',
};

const REFERENCE_IMAGE: StepImage = {
  src: '/images/dicas/linhas-de-referencia.webp',
  alt: 'Menu de Settings da Waveform do DaVinci Resolve com Show Reference Levels marcado e os campos Low (36) e High (999) destacados em amarelo',
  caption: 'Waveform > Settings: Show Reference Levels, com as linhas Low e High.',
  width: 1471,
  height: 1144,
  position: '88% 48%',
};

const QUALIFIER_FOCUS_IMAGE: StepImage = {
  src: '/images/dicas/display-qualifier-focus.webp',
  alt: 'Painel de Scopes do DaVinci Resolve em Waveform, com o menu dos três pontinhos aberto e a opção Display Qualifier Focus marcada',
  caption: 'Painel de Scopes > três pontinhos: ative o Display Qualifier Focus.',
  width: 1040,
  height: 832,
  position: '75% 25%',
};

const B = ({ children }: { children: React.ReactNode }) => <strong className="font-semibold text-neutral-900">{children}</strong>;

export default function DicasArticle() {
  const [lightbox, setLightbox] = useState<StepImage | null>(null);
  // Mantém a última imagem enquanto o lightbox faz a animação de saída
  const [lastImage, setLastImage] = useState<StepImage>(KEYBOARD_IMAGE);
  const openImage = (image: StepImage) => { setLastImage(image); setLightbox(image); };

  return (
    <article className="relative w-full space-y-10 font-serif leading-relaxed text-[#111111] select-text">
      <ArticleToc groups={TOC} />

      {/* ===================== INTRODUÇÃO ===================== */}
      <EditorialSection
        id="introducao-dicas"
        kickerLeft="FUNDAMENTOS · DICAS"
        kickerRight="INTRODUÇÃO"
        title="CONFIGURAÇÕES DO DAVINCI RESOLVE QUE FACILITAM O COLOR GRADING"
      >
        <Prose>
          <p>
            Antes de sair mexendo em roda de cor, vale a pena gastar cinco minutos deixando o DaVinci Resolve do jeito certo. São configurações pequenas, mas que vão facilitar muito a sua vida na hora do color grading, tá?
          </p>
          <p>Nesta aula a gente vê quatro coisas:</p>
        </Prose>
        <ol aria-label="Assuntos da aula" className="max-w-3xl divide-y divide-neutral-200 border-y border-neutral-300 font-serif text-[16px] leading-snug text-neutral-800 sm:text-[17px]">
          {[
            <>um atalho para renomear os nodes com a tecla <B>Tab</B></>,
            <>o <B>Display Qualifier Focus</B>, que mostra nos scopes onde está cada pedaço da imagem</>,
            <>o <B>Skin Tone Indicator</B> no Vectorscope</>,
            <>como eu deixo configurados a <B>Waveform</B> e o <B>Parade</B></>,
          ].map((item, i) => (
            <li key={i} className="flex items-baseline gap-4 py-3.5">
              <span aria-hidden="true" className="w-7 shrink-0 font-sans text-sm font-bold tabular-nums text-[#0071e3]">{String(i + 1).padStart(2, '0')}</span>
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ol>
        <Prose>
          <p>
            Tudo isso fica na página <B>Color</B>. É coisa que você configura uma vez e usa em todo projeto.
          </p>
        </Prose>
      </EditorialSection>

      {/* ===================== ATALHO TAB ===================== */}
      <EditorialSection
        id="atalho-tab"
        kickerLeft="FUNDAMENTOS · DICAS"
        kickerRight="NODES"
        title="ATALHO PARA RENOMEAR NODES COM A TECLA TAB"
      >
        <Prose>
          <p>
            Todo node precisa ter nome, tá bom? Quando a sua árvore de nodes cresce, é o nome que te diz o que cada um faz. Só que o DaVinci Resolve não vem com um atalho pronto para isso. Então a gente cria um.
          </p>
        </Prose>

        <Sub title="Como configurar o atalho">
          <StepsWithImage
            image={KEYBOARD_IMAGE}
            onOpen={openImage}
            items={[
              { title: 'Abra o Keyboard Customization', text: 'Vá no menu DaVinci Resolve > Keyboard Customization, ou use Ctrl + Alt + K no Windows / Cmd + Option + K no Mac.' },
              { title: 'Busque o comando', text: 'No campo de busca, no cantinho da janela, digite Label.' },
              { title: 'Encontre o Label Selected Nodes', text: 'O comando fica dentro de Nodes.' },
              { title: 'Aperte a tecla Tab', text: 'Clique no comando e aperte a tecla Tab.' },
              { title: 'Salve', text: 'Clique em Save.' },
            ]}
          />
          <Prose>
            <p>
              Pronto. Agora é só selecionar o node, apertar <B>Tab</B> e digitar o nome.
            </p>
          </Prose>
        </Sub>

        <Sub title="Por que a tecla Tab?">
          <Prose>
            <p>
              Você pode usar a tecla que quiser. Eu uso o Tab porque ela não tem nenhuma função no DaVinci Resolve. Então a gente dá esse significado para ela e não perde nenhum outro atalho no caminho.
            </p>
            <p>
              Se preferir sem atalho, também dá para renomear clicando com o botão direito no node e escolhendo <B>Node Label</B>, ou pelo menu <B>Color &gt; Nodes</B>. Mas com o atalho é muito mais rápido.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== DISPLAY QUALIFIER FOCUS ===================== */}
      <EditorialSection
        id="display-qualifier-focus"
        kickerLeft="FUNDAMENTOS · DICAS"
        kickerRight="SCOPES"
        title="DISPLAY QUALIFIER FOCUS: VEJA NOS SCOPES ONDE ESTÁ CADA PARTE DA IMAGEM"
      >
        <Prose>
          <p>
            Essa aqui é uma das minhas favoritas. Com ela ligada, quando você passa o mouse em cima da imagem, aparece um círculo nos scopes mostrando onde aquele pedaço está dentro do sinal.
          </p>
        </Prose>

        <Sub title="Como ligar o Display Qualifier Focus">
          <StepsWithImage
            image={QUALIFIER_FOCUS_IMAGE}
            onOpen={openImage}
            items={[
              { title: 'Vá no painel de Scopes', text: 'Na página Color, abra o painel de Scopes.' },
              { title: 'Abra o menu', text: 'Clique nos três pontinhos no canto superior direito.' },
              { title: 'Ative a opção', text: 'Ative Display Qualifier Focus.' },
              { title: 'Selecione o Qualifier', text: 'No viewer, selecione a ferramenta Qualifier, que é o conta-gotas.' },
            ]}
          />
          <Prose>
            <p>Agora é só passar o conta-gotas pela imagem e olhar os scopes.</p>
          </Prose>
        </Sub>

        <Sub title="Para que serve na prática">
          <Bullets
            single
            items={[
              { label: 'Na Waveform:', text: 'você descobre qual é a parte mais escura da imagem. Às vezes a gente acha que é uma área e, olhando o círculo, confirma (ou não). Também dá para achar onde está aquele specular, aquele brilho mais forte.' },
              { label: 'No Vectorscope:', text: 'sabe aquela ponta que está esticando lá para fora? Passando o mouse, você descobre qual pedaço da imagem é esse, normalmente uma área extremamente saturada. Aí você consegue controlar só aquele pedaço, para tirar ou aumentar a saturação.' },
            ]}
          />
          <Prose>
            <p>
              Funciona também no Parade e no Histograma. Para quem está começando a ler scopes, é uma das melhores formas de entender a relação entre o que aparece no gráfico e o que está na imagem.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== SKIN TONE INDICATOR ===================== */}
      <EditorialSection
        id="skin-tone-indicator"
        kickerLeft="FUNDAMENTOS · DICAS"
        kickerRight="VECTORSCOPE"
        title="SKIN TONE INDICATOR NO VECTORSCOPE"
      >
        <Prose>
          <p>
            O Skin Tone Indicator é uma linha diagonal no Vectorscope que mostra o matiz da pele humana. Ela fica entre o vermelho e o amarelo.
          </p>
        </Prose>

        <Sub title="Como ligar o Skin Tone Indicator">
          <StepsWithImage
            image={SKIN_TONE_IMAGE}
            onOpen={openImage}
            items={[
              { title: 'Deixe um scope no Vectorscope', text: 'Escolha o Vectorscope em um dos scopes.' },
              { title: 'Abra o Settings', text: 'Clique no botãozinho de Settings dele.' },
              { title: 'Ative a opção', text: 'Ative Show Skin Tone Indicator.' },
            ]}
          />
        </Sub>

        <Sub title="Pele clara, pele escura: muda alguma coisa?">
          <Prose>
            <p>
              Essa é uma dúvida muito comum: &ldquo;e se eu estiver colorindo uma pele negra?&rdquo;. A linha continua a mesma, tá?
            </p>
            <p>
              A cor da pele de todo mundo, não interessa a etnia, fica no mesmo matiz. A diferença está na <B>luminosidade</B>: algumas pessoas têm a pele mais escura e outras têm a pele mais clara. É só isso. De resto, é a mesma cor.
            </p>
            <p>
              Isso porque, para a gente que é colorista, <B>cor e luminosidade são coisas diferentes</B>. O Vectorscope mostra matiz e saturação; a luminosidade a gente lê na Waveform.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== WAVEFORM E PARADE ===================== */}
      <EditorialSection
        id="waveform-e-parade"
        kickerLeft="FUNDAMENTOS · DICAS"
        kickerRight="SCOPES"
        title="CONFIGURANDO A WAVEFORM E O PARADE"
      >
        <Prose>
          <p>Aqui o objetivo é deixar cada scope mostrando só o que importa para você, sem poluir a leitura.</p>
        </Prose>

        <Sub title="O que é o Extents">
          <Prose>
            <p>
              O <B>Extents</B> desenha um contorno em volta de todo o sinal, mostrando até onde ele vai, inclusive os picos mais fracos que às vezes passam despercebidos.
            </p>
          </Prose>
          <WithImage image={EXTENTS_IMAGE} onOpen={openImage}>
            <Bullets
              full
              items={[
                { label: 'No Vectorscope:', text: 'dá para ligar, mas ele suja muito a visualização. Eu particularmente não gosto. Só vale se você quiser ver todo o espectro mesmo, até onde ele está indo.' },
                { label: 'Na Waveform e no Parade:', text: 'aqui eu gosto de deixar ligado. Sem o Extents, tem coisas que eu não vejo, por exemplo qual parte do sinal está chegando em um valor específico da escala.' },
              ]}
            />
          </WithImage>
        </Sub>

        <Sub title="Waveform: só luminância">
          <Prose>
            <p>
              Como eu falei, para o colorista cor e iluminação são separados. Eu faço ajuste de iluminação sem necessariamente mexer na cor, e ajuste de cor sem necessariamente mexer na iluminação. Por isso uso a Waveform só para ver a iluminação.
            </p>
            <p>Nas configurações da Waveform, eu deixo assim:</p>
          </Prose>
          <WithImage image={LUMINANCE_IMAGE} onOpen={openImage}>
            <Bullets
              full
              items={[
                { label: 'Y', text: <>selecionado (Y é a luminância);</> },
                { label: 'Colorize', text: <>desligado, porque não gosto daquela visualização colorida;</> },
                { label: 'Extents', text: <>ligado.</> },
              ]}
            />
          </WithImage>
          <Prose>
            <p>
              Assim eu vejo perfeitamente como está a minha iluminação, só a minha iluminação.
            </p>
            <p>
              Evite os outros modos nesse caso: o <B>YCbCr</B> fica muito difícil de entender, e o <B>RGB</B> na Waveform não faz sentido para essa leitura. Para ver os canais de cor, a gente tem o Parade.
            </p>
          </Prose>
        </Sub>

        <Sub title="Brilho e grade">
          <WithImage image={BRIGHTNESS_IMAGE} onOpen={openImage} minHeight>
            <Prose>
              <p>
                Nas configurações você também consegue deixar o traço mais claro, mais difuso ou mais transparente. O mesmo vale para a <B>grade</B> (as linhas de fundo). Ajuste até ficar confortável de ler.
              </p>
            </Prose>
          </WithImage>
        </Sub>

        <Sub title="Linhas de referência">
          <WithImage image={REFERENCE_IMAGE} onOpen={openImage}>
            <Prose>
              <p>
                Você pode ligar <B>Show Reference Levels</B> e definir uma linha <B>Low</B> e uma linha <B>High</B>. Por exemplo: meu highlight só vai até aqui, e meus blacks começam aqui. Isso cria uma referência visual que ajuda muito na hora de montar o seu look. A gente usa isso mais para frente, quando for criar o look.
              </p>
            </Prose>
          </WithImage>
        </Sub>

        <Sub title="Parade">
          <WithImage image={PARADE_IMAGE} onOpen={openImage} minHeight>
            <Prose>
              <p>
                No Parade, eu deixo as configurações padrão. A única coisa que faço é <B>ligar o Extents</B>. Assim consigo ver quanto tem de cada cor (vermelho, verde e azul).
              </p>
              <p>De resto, não precisa mexer em absolutamente mais nada.</p>
            </Prose>
          </WithImage>
        </Sub>
      </EditorialSection>

      {/* ===================== APLICAÇÃO PRÁTICA ===================== */}
      <EditorialSection
        id="aplicacao-pratica-dicas"
        kickerLeft="FUNDAMENTOS · DICAS"
        kickerRight="NA PRÁTICA"
        title="APLICAÇÃO PRÁTICA"
      >
        <Prose>
          <p>Abre o DaVinci Resolve agora e bora deixar tudo configurado. Use esta lista para conferir:</p>
        </Prose>

        <SetupChecklist />

        <Prose>
          <p>
            Depois, faça um teste: pegue um plano do seu projeto, renomeie os nodes com o Tab e passe o conta-gotas pela imagem. Procure a área mais escura, o brilho mais forte e a parte mais saturada, olhando onde cada uma aparece na Waveform e no Vectorscope.
          </p>
        </Prose>

      </EditorialSection>

      {/* ===================== CONCLUSÃO ===================== */}
      <EditorialSection
        id="conclusao-dicas"
        kickerLeft="FUNDAMENTOS · DICAS"
        kickerRight="CONCLUSÃO"
        title="CONCLUSÃO"
      >
        <Prose>
          <p>
            São ajustes rápidos, mas que mudam o seu dia a dia no color grading: nodes com nome, scopes que mostram exatamente onde está cada parte da imagem e uma Waveform que mostra só a iluminação. E guarda essa ideia, que vai aparecer o curso inteiro: cor e luminosidade são coisas diferentes.
          </p>
          <p>Qualquer dúvida, sugestão ou feedback, só deixar aqui embaixo. Te espero na próxima aula!</p>
        </Prose>
      </EditorialSection>

      <ImageLightbox
        open={lightbox !== null}
        src={lastImage.src}
        alt={lastImage.alt}
        caption={lastImage.caption}
        onClose={() => setLightbox(null)}
      />
    </article>
  );
}
