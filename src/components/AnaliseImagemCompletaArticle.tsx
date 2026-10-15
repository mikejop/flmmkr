'use client';

/**
 * CONTEÚDO COMPLETO da aula "Análise da Imagem" (10 pontos de análise, ordem de análise e conclusão).
 *
 * Fica OCULTO: só é carregado e exibido para quem concluiu 100% das aulas do masterclass (ou para o
 * admin). Veja `canSeeFullAnalysis` em MemberAreaApp.tsx. Carregado com React.lazy, então o código
 * deste arquivo não vai no pacote principal.
 */

import React from 'react';
import { EditorialSection } from './EditorialLayout';

/* ------------------------------------------------------------------ blocos de apoio */

/** "1. A intenção…" → "a-intencao" (âncora do assunto). */
function slugify(title: string): string {
  return title
    .replace(/^\d+\.\s+/, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Assunto numerado ("1. …"): número em selo azul e âncora própria (entra no sumário "Nesta página"). */
function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  const match = /^(\d+)\.\s+(.*)$/.exec(title);
  return (
    <div id={slugify(title)} className="scroll-mt-6 space-y-6 border-t border-neutral-200 pt-12 first:border-t-0 first:pt-0">
      <h4 className="flex items-center gap-3 font-sans text-[22px] font-black leading-tight tracking-tight text-neutral-900 sm:text-[26px]">
        {match ? (
          <>
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0071e3] text-lg font-black text-white sm:h-10 sm:w-10 sm:text-xl">
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
      </h4>
      {children}
    </div>
  );
}

const PROSE = 'max-w-3xl space-y-3.5 font-serif text-[16px] sm:text-[17px] leading-[1.6] text-neutral-800';

function Prose({ children }: { children: React.ReactNode }) {
  return <div className={PROSE}>{children}</div>;
}

/** Caixa de destaque, em coluna única. */
function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-l-4 border-[#0071e3] bg-[#f5f5f7] p-5">
      <p className="max-w-3xl font-serif text-[16px] leading-relaxed text-neutral-800">{children}</p>
    </div>
  );
}

/** Lista em blocos: "Rótulo: explicação" (rótulo em negrito). */
interface BulletImage {
  src: string;
  alt: string;
  source: string;
  sourceLabel: string;
}

function Bullets({ items }: { items: { label?: string; text: string; image?: BulletImage }[] }) {
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {items.map((item, i) => (
        <li key={i} className={`flex gap-3.5 rounded-xl bg-[#f5f5f7] p-4 sm:p-5`}>
          <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0071e3]" />
          {/* Com imagem: o texto fica em cima e o quadro da imagem embaixo, na largura inteira do bloco. */}
          <div className={`min-w-0 flex-1 ${item.image ? 'flex flex-col gap-4' : ''}`}>
            <p className="min-w-0 font-serif text-[16px] leading-snug text-neutral-800">
              {item.label && <strong className="font-sans font-bold text-neutral-900">{item.label} </strong>}
              {item.text}
            </p>
            {item.image && (
              <figure className="w-full space-y-1.5">
                {/* Quadro de altura fixa, na largura inteira do bloco e igual em todos: a imagem preenche o quadro (recorta o excesso). */}
                <div className="h-48 w-full overflow-hidden rounded-lg bg-neutral-200 sm:h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image.src} alt={item.image.alt} loading="lazy" decoding="async" className="block h-full w-full object-cover" />
                </div>
                <figcaption className="font-sans text-xs text-neutral-600">
                  <a href={item.image.source} target="_blank" rel="noreferrer" className="text-[#0071e3] hover:underline">{item.image.sourceLabel}</a>
                </figcaption>
              </figure>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Lista numerada, uma etapa embaixo da outra. */
function NumberedSteps({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol className="max-w-3xl space-y-3">
      {items.map((item, i) => (
        <li key={item.title} className="flex items-start gap-3.5 rounded-xl bg-[#f5f5f7] p-4 sm:p-5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0071e3] font-sans text-sm font-bold text-white">
            {i + 1}
          </span>
          <div className="min-w-0 space-y-1">
            <h5 className="font-sans text-base font-bold text-neutral-900 sm:text-lg">{item.title}</h5>
            <p className="font-serif text-[16px] leading-snug text-neutral-800">{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ artigo */

const TONAL_ROWS: { what: string; look: string }[] = [
  { what: 'Sombras', look: 'Se há detalhes suficientes nas regiões escuras e se os pretos estão adequados à intenção visual.' },
  { what: 'Tons médios', look: 'Como estão representados os rostos, os objetos e as principais áreas de interesse.' },
  { what: 'Realces', look: 'Se as áreas claras preservam detalhes e se as regiões muito luminosas estão controladas.' },
  { what: 'Contraste', look: 'Como os diferentes níveis tonais se relacionam e se a imagem tem a separação visual desejada.' },
  { what: 'Clipping', look: 'Se existem regiões ou canais de cor que atingiram os limites disponíveis no sinal.' },
  { what: 'Ruído', look: 'Se as sombras e outras regiões apresentam ruído que pode se tornar mais evidente durante a correção.' },
];

export default function AnaliseImagemCompletaArticle() {
  return (
    <article className="relative w-full space-y-10 font-serif leading-relaxed text-[#111111] select-text">
      {/* ===================== O QUE ANALISAR ===================== */}
      <EditorialSection
        id="o-que-analisar"
        kickerLeft="DIAGNÓSTICO"
        kickerRight="10 PONTOS DE ATENÇÃO"
        title="O QUE ANALISAR ANTES DE COMEÇAR O COLOR GRADING"
      >
        <Sub title="1. A intenção narrativa e estética da imagem">
          <Prose>
            <p>
              Antes de avaliar se uma imagem está muito quente, fria, contrastada ou saturada, o colorista precisa entender o que aquela imagem deve comunicar e qual foi a intenção da direção e da direção de fotografia.
            </p>
            <p>
              Uma imagem escura, por exemplo, pode representar um problema de exposição ou ser exatamente o que a cena exige. Da mesma forma, uma dominante azul pode ser indesejada ou fazer parte da iluminação e da proposta visual.
            </p>
            <p>Para compreender essa intenção, o colorista deve observar:</p>
          </Prose>
          <Bullets
            items={[
              {
                label: 'Função narrativa:',
                text: 'o que acontece na cena e qual é a sua importância para a história.',
                image: {
                  src: 'https://t.ctcdn.com.br/ri3z1Gty1J75RKhWWuAXpPhAu7w=/640x360/smart/i1010123.jpeg',
                  alt: 'Garota de vestido laranja olhando por binóculos, diante de um farol laranja, com céu azul e nuvens ao fundo',
                  source: 'https://canaltech.com.br/cinema/6-filmes-de-wes-anderson-para-conhecer-o-estilo-unico-do-diretor/',
                  sourceLabel: 'Fonte: Canaltech',
                },
              },
              {
                label: 'Intenção emocional:',
                text: 'quais sensações a imagem deve transmitir, como intimidade, tensão, tranquilidade ou estranhamento.',
                image: {
                  src: 'https://assets.qz.com/media/e3e21b2137e5f111847b9d7c1a3e3f3e.jpg',
                  alt: 'Mulher gigante de cabelo azul em um holograma rosa e magenta apontando para um homem de casaco, minúsculo, em uma passarela envolta em névoa',
                  source: 'https://qz.com/1094274/blade-runner-2049-a-visually-astonishing-deeply-ambitious-journey-into-the-future',
                  sourceLabel: 'Fonte: Quartz',
                },
              },
              {
                label: 'Referências visuais:',
                text: 'imagens, filmes, fotografias ou outros materiais que orientam o resultado esperado.',
                image: {
                  src: '/images/analise-imagem/referencias-visuais.jpg',
                  alt: 'Grade de fotogramas de filmes e animações, com cores e iluminações variadas, em um banco de referências visuais com barra de busca no topo',
                  source: 'https://i.redd.it/xm14yy1mpldg1.png',
                  sourceLabel: 'Banco de referências · Fonte: Reddit',
                },
              },
              {
                label: 'Direção de fotografia:',
                text: 'como luz, contraste, exposição, lente e composição foram utilizados para construir a imagem.',
                image: {
                  src: 'https://static.time.com/v3/assets/bltea6093859af6183b/blt93a490e8262bdc17/698a5a6b86f68ee10c6f5853/THE-BRUTALIST-Adrien-Brody-and-Felicity-Jones.jpg?branch=production&width=800&quality=75&auto=webp&crop=3:2',
                  alt: 'Adrien Brody e Felicity Jones em cena de The Brutalist, exemplo de como a direção de fotografia constrói a imagem com luz, contraste e composição',
                  source: 'https://time.com',
                  sourceLabel: 'The Brutalist · Fonte: TIME',
                },
              },
              {
                label: 'Direção de arte:',
                text: 'como cenários, figurinos, maquiagem e objetos participam da composição cromática.',
                image: {
                  src: 'https://s.studiobinder.com/wp-content/uploads/2020/09/Different-Meanings-of-Colors-Lighting-Phantom-Thread.jpg?resolution=2560,1',
                  alt: 'Salão com balões coloridos espalhados pelo chão, um foguete vermelho de cenário ao fundo e um feixe de luz cruzando o ambiente, exemplo de como a direção de arte participa da cor da imagem',
                  source: 'https://www.studiobinder.com',
                  sourceLabel: 'Phantom Thread · Fonte: StudioBinder',
                },
              },
            ]}
          />
          <Prose>
            <p>
              O diretor de fotografia Robert Richardson, ASC, por exemplo, descreve sua análise do trabalho de color grading considerando iluminação, interpretações dos atores, figurino, direção de arte, montagem e a emoção que o diretor pretende transmitir.
            </p>
          </Prose>
          <Note>A pergunta central é: o que precisa ser preservado na imagem e o que pode ser modificado para reforçar a intenção da cena?</Note>
        </Sub>

        <Sub title="2. O gerenciamento de cores e a interpretação correta do arquivo">
          <Prose>
            <p>
              Antes de julgar a exposição, o contraste e a saturação, é necessário verificar se a imagem está sendo visualizada corretamente no ambiente de color grading.
            </p>
            <p>O colorista precisa identificar:</p>
          </Prose>
          <Bullets
            items={[
              { text: 'Qual câmera e perfil de imagem foram utilizados.' },
              { text: 'Qual é o espaço de cor de entrada e qual é a curva de gamma do arquivo.' },
              { text: 'Se o material está em Log, RAW, Rec.709 ou outro formato de codificação.' },
              { text: 'Qual gerenciamento de cores está ativo no projeto.' },
              { text: 'Se existem LUTs ou transformações de cor anteriores ao processo de correção.' },
              { text: 'Qual é o espaço de cor e a condição de visualização da saída desejada.' },
            ]}
          />
          <Prose>
            <p>
              A aparência de um arquivo depende de como seus valores são interpretados e transformados para visualização.
            </p>
            <p>
              Um material gravado em Log pode apresentar baixo contraste e pouca saturação quando visualizado sem a transformação adequada. Isso não indica, por si só, subexposição ou cores erradas: a ARRI explica que o Log C utiliza uma codificação própria, que precisa ser transformada para uma condição de visualização como Rec.709, P3 ou um formato HDR.
            </p>
            <p>
              No ACES, as transformações de entrada normalizam a interpretação de diferentes fontes de imagem, enquanto as transformações de saída preparam o resultado para a condição de exibição pretendida.
            </p>
          </Prose>
          <Note>Portanto, antes de fazer qualquer julgamento visual, o colorista deve ter certeza de que está olhando para a imagem por meio do gerenciamento de cores correto.</Note>
        </Sub>

        <Sub title="3. A exposição e a distribuição tonal">
          <Prose>
            <p>
              Com a imagem sendo visualizada corretamente, o próximo passo é analisar a distribuição dos níveis de luminosidade.
            </p>
            <p>
              O colorista deve observar como a imagem se organiza entre sombras, tons médios e realces, verificando o brilho geral e também onde estão os elementos importantes da composição.
            </p>
          </Prose>

          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full min-w-[560px] border-collapse text-left font-sans text-sm">
              <caption className="sr-only">O que analisar na exposição e na distribuição tonal</caption>
              <thead>
                <tr className="bg-[#f5f5f7] text-neutral-900">
                  <th scope="col" className="p-3 font-bold">O que analisar</th>
                  <th scope="col" className="p-3 font-bold">O que observar</th>
                </tr>
              </thead>
              <tbody>
                {TONAL_ROWS.map((row) => (
                  <tr key={row.what} className="border-t border-neutral-200 align-top">
                    <th scope="row" className="whitespace-nowrap p-3 font-semibold text-neutral-900">{row.what}</th>
                    <td className="p-3 font-serif text-[15px] text-neutral-800">{row.look}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Prose>
            <p>
              Para essa avaliação, o colorista pode utilizar o Waveform, que ajuda a analisar os níveis de luminância, e o RGB Parade, que permite examinar separadamente os canais vermelho, verde e azul.
            </p>
            <p>
              A documentação da Blackmagic Design apresenta os scopes como ferramentas para avaliar níveis tonais, balancear imagens e identificar problemas nos níveis de sinal.
            </p>
            <p>
              Uma imagem não precisa ter pretos próximos de zero nem realces próximos do branco máximo para estar correta. Esses valores dependem da cena, da proposta estética e das condições de entrega.
            </p>
          </Prose>
          <Note>O que importa é se a distribuição tonal serve ao propósito da imagem e se há algum problema a corrigir.</Note>
        </Sub>

        <Sub title="4. O balanço de branco e as dominantes de cor">
          <Prose>
            <p>
              O colorista deve investigar como as cores estão distribuídas e se existe alguma dominante que precisa ser corrigida ou preservada. Essa análise inclui:
            </p>
          </Prose>
          <Bullets
            items={[
              { label: 'Temperatura de cor:', text: 'verificar se a imagem apresenta uma tendência visual quente ou fria e se ela corresponde à intenção da iluminação.' },
              { label: 'Matiz ou tint:', text: 'observar possíveis desvios entre verde e magenta, especialmente em áreas neutras e tons de pele.' },
              { label: 'Neutralidade:', text: 'quando existem objetos que deveriam ser neutros, como uma superfície cinza conhecida, eles podem servir de referência para avaliar o balanço cromático.' },
              { label: 'Mistura de fontes luminosas:', text: 'identificar diferenças de cor entre fontes de luz, como luz do dia, lâmpadas de tungstênio e LEDs.' },
              { label: 'Separação entre canais RGB:', text: 'observar, pelo RGB Parade, se há desequilíbrios relevantes entre os canais em determinadas regiões tonais.' },
            ]}
          />
          <Prose>
            <p>
              A ARRI inclui balanço de branco e compensação de diferenças cromáticas no contexto de suas transformações de entrada. No DaVinci Resolve, o balanceamento também é apresentado como uma etapa importante da correção primária.
            </p>
            <p>Corrigir o balanço de branco nem sempre significa neutralizar a imagem.</p>
            <p>
              Em uma cena iluminada por lâmpadas quentes, neutralizar completamente a dominante pode descaracterizar a fotografia. Em uma cena noturna, remover todo o azul pode eliminar uma escolha expressiva da iluminação.
            </p>
          </Prose>
          <Note>O trabalho consiste em diferenciar uma dominante indesejada de uma dominante que faz parte da linguagem visual da cena.</Note>
        </Sub>

        <Sub title="5. Os tons de pele e as cores dos elementos importantes">
          <Prose>
            <p>O colorista também deve identificar quais elementos precisam manter uma aparência cromática coerente.</p>
            <p>
              Em muitos tipos de produção, os tons de pele merecem atenção especial, mas a análise não deve se limitar às pessoas. Ela pode incluir produtos, figurinos, alimentos, vegetação, céu, cenários e objetos essenciais à narrativa.
            </p>
            <p>Algumas perguntas úteis são:</p>
          </Prose>
          <Bullets
            items={[
              { text: 'Os tons de pele estão coerentes com a iluminação e com a intenção fotográfica?' },
              { text: 'Existem desvios de matiz ou saturação que prejudicam a aparência dos personagens?' },
              { text: 'As cores dos objetos estão coerentes com o material original e com a direção de arte?' },
              { text: 'Alguma cor está excessivamente saturada ou perdendo distinção?' },
              { text: 'Existe alguma cor que precisa permanecer consistente entre planos diferentes?' },
            ]}
          />
          <Prose>
            <p>
              O Vectorscope ajuda a analisar a distribuição cromática e a saturação. Em conjunto com a imagem e os outros scopes, pode auxiliar na avaliação dos tons de pele e no balanceamento das cores.
            </p>
          </Prose>
          <Note>
            Não existe um único valor universal de matiz, saturação ou luminosidade que determine a pele correta para todas as pessoas e situações de iluminação. A referência deve ser a aparência pretendida, considerando a pele, a luz que a ilumina e o contexto da cena.
          </Note>
        </Sub>

        <Sub title="6. A qualidade da luz e a organização visual">
          <Prose>
            <p>Essa etapa é especialmente importante quando o objetivo é construir um look cinematográfico.</p>
            <p>
              O colorista deve observar como a luz foi utilizada para modelar os elementos da imagem. Isso envolve características da fotografia que não podem ser reduzidas à simples análise de valores RGB. Entre os pontos relevantes estão:
            </p>
          </Prose>
          <Bullets
            items={[
              { label: 'Direção da luz:', text: 'de onde vem a luz principal e como ela incide sobre os elementos.' },
              { label: 'Dureza e suavidade:', text: 'como as sombras se formam e quais características a fonte luminosa imprime.' },
              { label: 'Relação entre luz e sombra:', text: 'como o contraste organiza volumes e separa os elementos.' },
              { label: 'Separação entre sujeito e fundo:', text: 'se o personagem ou produto se destaca adequadamente do ambiente.' },
              { label: 'Hierarquia visual:', text: 'quais regiões chamam primeiro a atenção do espectador.' },
              { label: 'Realces e reflexos:', text: 'como superfícies brilhantes, pele, vidro e materiais diferentes respondem à luz.' },
            ]}
          />
          <Prose>
            <p>
              A análise das referências visuais recomendada pelo Mixing Light inclui justamente aspectos como estilo de iluminação, qualidade da luz, contraste e tonalidade.
            </p>
            <p>
              O objetivo é compreender como a imagem foi construída e decidir se o grading deve reforçar essa construção, recuperar algum elemento visual ou introduzir uma nova interpretação estética.
            </p>
            <p>
              Por exemplo, se um personagem está visualmente separado do fundo por uma diferença de luminosidade, aumentar excessivamente a exposição do fundo pode diminuir essa separação. Se a imagem depende de sombras profundas para criar tensão, levantá-las indiscriminadamente pode enfraquecer a proposta.
            </p>
          </Prose>
        </Sub>

        <Sub title="7. A paleta de cores e as relações cromáticas">
          <Prose>
            <p>Depois de identificar as cores presentes na imagem, é necessário compreender como elas se relacionam. O colorista deve observar:</p>
          </Prose>
          <Bullets
            items={[
              { text: 'Quais são as cores dominantes e quais funcionam como acentos.' },
              { text: 'Como as cores quentes e frias se relacionam.' },
              { text: 'Se existe contraste cromático entre personagem, cenário e objetos.' },
              { text: 'Quais cores concentram a atenção do espectador.' },
              { text: 'Se a saturação está distribuída de maneira coerente.' },
              { text: 'Se alguma cor compete desnecessariamente com o elemento principal.' },
            ]}
          />
          <Prose>
            <p>
              Considere uma cena em que uma personagem veste vermelho e está em um ambiente predominantemente verde. O contraste cromático pode contribuir para destacar a personagem. Se o colorista modifica os verdes, reduz a saturação do vermelho ou altera a luminosidade do fundo, ele interfere na maneira como o espectador percebe essa relação.
            </p>
            <p>
              As ferramentas de curvas e correções secundárias do DaVinci Resolve permitem modificar matiz, saturação e luminância de regiões ou faixas de cor específicas.
            </p>
          </Prose>
          <Note>A decisão deve partir da função visual de cada cor na composição, sem aplicar harmonias cromáticas no automático.</Note>
        </Sub>

        <Sub title="8. A continuidade entre os planos">
          <Prose>
            <p>
              O colorista não deve analisar uma imagem apenas como um quadro isolado. Em um filme, uma série, um comercial ou mesmo um vídeo curto, cada plano precisa funcionar em relação aos demais.
            </p>
            <p>É necessário examinar os planos anteriores e posteriores para entender:</p>
          </Prose>
          <Bullets
            items={[
              { text: 'Se existem diferenças de exposição entre tomadas da mesma cena.' },
              { text: 'Se o balanço de branco muda de maneira inesperada.' },
              { text: 'Se os tons de pele permanecem coerentes.' },
              { text: 'Se o contraste e a saturação variam excessivamente entre cortes.' },
              { text: 'Se a direção de arte e a paleta se mantêm consistentes.' },
              { text: 'Se alguma diferença entre os planos é intencional e deve ser preservada.' },
            ]}
          />
          <Prose>
            <p>
              O trabalho de correspondência entre planos, conhecido como shot matching, estabelece uma base consistente para o tratamento criativo, como destacam especialistas da FilmLight e o colorista Warren Eagles.
            </p>
            <p>
              A correspondência garante que as diferenças entre as imagens façam sentido dentro da sequência e não pareçam erros acidentais.
            </p>
            <p>
              Uma cena pode ter mudanças deliberadas de exposição, cor e contraste. O colorista precisa distinguir essas escolhas de inconsistências que prejudicam a continuidade.
            </p>
          </Prose>
        </Sub>

        <Sub title="9. As limitações técnicas do material">
          <Prose>
            <p>
              Antes de decidir como corrigir uma imagem, o colorista deve verificar a qualidade do material original e identificar possíveis limitações. Isso inclui:
            </p>
          </Prose>
          <Bullets
            items={[
              { text: 'Ruído excessivo, sobretudo nas sombras.' },
              { text: 'Realces ou sombras com perda de informação.' },
              { text: 'Artefatos de compressão.' },
              { text: 'Banding em gradientes suaves.' },
              { text: 'Canais de cor clippingados.' },
              { text: 'Perda de detalhe e alterações de cor em áreas específicas.' },
            ]}
          />
          <Prose>
            <p>Essa inspeção serve para definir quais ajustes são viáveis e quais podem agravar os problemas existentes.</p>
            <p>
              Por exemplo, aumentar significativamente a exposição de uma região muito escura pode revelar detalhes úteis, mas também tornar o ruído mais evidente. Da mesma maneira, elevar excessivamente a saturação pode intensificar artefatos ou prejudicar a reprodução de determinadas cores.
            </p>
          </Prose>
          <Note>
            É necessário distinguir entre informação que está presente no arquivo, mas precisa ser recuperada visualmente, e informação que foi perdida durante a captura ou o processamento. O grading pode melhorar a apresentação do material, mas não garante a reconstrução de detalhes que não foram registrados.
          </Note>
        </Sub>

        <Sub title="10. O formato de entrega">
          <Prose>
            <p>
              O colorista precisa saber onde e como a imagem será exibida. Uma entrega em SDR, por exemplo, tem condições de reprodução diferentes de uma entrega HDR. O espaço de cor de destino e a transformação de saída também influenciam a aparência final.
            </p>
            <p>Antes de trabalhar, é necessário confirmar:</p>
          </Prose>
          <Bullets
            items={[
              { text: 'Se a entrega é SDR ou HDR.' },
              { text: 'Qual espaço de cor será utilizado, como Rec.709 ou P3.' },
              { text: 'Qual transformação de saída corresponde ao destino.' },
              { text: 'Quais são os requisitos técnicos de níveis, faixa de sinal e gamut da entrega.' },
            ]}
          />
          <Prose>
            <p>
              No ACES, a transformação de saída prepara a imagem para um dispositivo e condições de visualização determinados. Portanto, a saída esperada faz parte das decisões técnicas que precisam ser conhecidas antes de finalizar o grading.
            </p>
            <p>
              Conhecer essa condição de saída desde o início permite tomar decisões coerentes ao longo do trabalho.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== ORDEM DE ANÁLISE ===================== */}
      <EditorialSection
        id="ordem-de-analise"
        kickerLeft="MÉTODO"
        kickerRight="CINCO ETAPAS"
        title="A ORDEM DE ANÁLISE RECOMENDADA"
      >
        <Prose>
          <p>Para transformar esses pontos em um método de trabalho, o processo pode ser organizado em cinco etapas.</p>
        </Prose>
        <NumberedSteps
          items={[
            { title: 'Compreender a intenção', text: 'Analisar a cena, a função narrativa do plano, a direção de fotografia e as referências visuais.' },
            { title: 'Confirmar o ambiente técnico', text: 'Verificar o gerenciamento de cores, o arquivo de origem, a transformação de entrada e as condições de visualização.' },
            { title: 'Diagnosticar a imagem', text: 'Avaliar exposição, distribuição tonal, balanço cromático, contraste, saturação, luz e limitações técnicas.' },
            { title: 'Analisar a sequência', text: 'Comparar os planos, verificar a continuidade e identificar quais diferenças precisam ser corrigidas ou preservadas.' },
            { title: 'Definir a estratégia de correção e look', text: 'Estabelecer o que precisa ser corrigido, o que deve ser mantido e quais decisões estéticas podem reforçar a intenção visual.' },
          ]}
        />
      </EditorialSection>

      {/* ===================== CONCLUSÃO ===================== */}
      <EditorialSection
        id="conclusao-analise"
        kickerLeft="RESUMO"
        kickerRight="QUATRO PERGUNTAS"
        title="A CONCLUSÃO MAIS IMPORTANTE"
      >
        <Prose>
          <p>A análise deve permitir que o colorista responda a quatro perguntas antes de fazer os primeiros ajustes:</p>
        </Prose>
        <NumberedSteps
          items={[
            { title: 'O que a imagem pretende comunicar?', text: 'Define a direção artística do trabalho.' },
            { title: 'Como o material está registrado e sendo interpretado?', text: 'Evita decisões baseadas em uma visualização tecnicamente incorreta.' },
            { title: 'Quais características precisam ser corrigidas e quais devem ser preservadas?', text: 'Orienta o diagnóstico de exposição, cor, contraste e qualidade do arquivo.' },
            { title: 'Como esta imagem precisa se relacionar com as outras imagens do projeto?', text: 'Garante continuidade sem eliminar diferenças criativas intencionais.' },
          ]}
        />
        <Prose>
          <p>
            Essas quatro perguntas resumem o raciocínio que antecede o grading. Os scopes, as ferramentas do DaVinci Resolve e os procedimentos de gerenciamento de cores ajudam a responder a elas, mas não substituem a interpretação artística da imagem.
          </p>
          <p>
            A documentação técnica estabelece o funcionamento das ferramentas e das transformações; a análise de intenção, composição e continuidade orienta como o colorista deve utilizá-las. Não existe uma sequência universal de ajustes válida para qualquer plano.
          </p>
        </Prose>
      </EditorialSection>
    </article>
  );
}
