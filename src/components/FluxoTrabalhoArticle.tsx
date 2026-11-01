'use client';

import React from 'react';
import { ArticleToc, EditorialSection, type TocGroup } from './EditorialLayout';
import NodeFlowExplorer from './NodeFlowExplorer';

/**
 * Conteúdo da aula "Fluxo de Trabalho": "Fluxo de trabalho do color grading em filmes de produto".
 *
 * Ferramenta interativa (uma só, onde ela ajuda a entender o texto):
 *  - NodeFlowExplorer → "A base": node graph clicável (Normalizing, Matching, Secondary, Creative) com o que fazer em cada etapa.
 */

/* ------------------------------------------------------------------ blocos de apoio */

function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Assunto com barra azul e âncora própria (entra no sumário "Nesta página"). */
function Sub({ title, children }: { title: string; children: React.ReactNode }) {
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

const PROSE = 'max-w-3xl space-y-3.5 font-serif text-[16px] sm:text-[17px] leading-[1.6] text-neutral-800';

function Prose({ children }: { children: React.ReactNode }) {
  return <div className={PROSE}>{children}</div>;
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-l-4 border-[#0071e3] bg-[#f5f5f7] p-5">
      <p className="max-w-3xl font-serif text-[16px] leading-relaxed text-neutral-800">{children}</p>
    </div>
  );
}

/** Lista em blocos: "Rótulo: explicação" (rótulo em negrito). */
function Bullets({ items, single = false }: { items: { label?: string; text: string }[]; single?: boolean }) {
  return (
    <ul className={`grid gap-3 ${single ? 'max-w-3xl' : 'lg:grid-cols-2'}`}>
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

/** Tabela simples e acessível (rola na horizontal em telas estreitas). */
function DataTable({ caption, head, rows }: { caption: string; head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-left font-sans text-sm">
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

/* ------------------------------------------------------------------ sumário */

const TOC: TocGroup[] = [
  { title: 'Introdução', id: 'introducao-fluxo-produto' },
  {
    title: 'A base: correção primeiro, grading depois',
    id: 'a-base-do-fluxo',
    items: [
      { label: 'O fluxo em nodes', id: 'o-fluxo-em-nodes' },
      { label: 'Por que nessa ordem?', id: 'por-que-nessa-ordem' },
      { label: 'A base se adapta ao seu trabalho', id: 'a-base-se-adapta-ao-seu-trabalho' },
    ],
  },
  {
    title: 'Antes das primárias',
    id: 'antes-das-primarias',
    items: [
      { label: 'Análise técnica e conversão de entrada', id: 'analise-tecnica-e-conversao-de-entrada' },
      { label: 'Uma ideia por nó', id: 'uma-ideia-por-no' },
      { label: 'Grupos: técnico, take e look', id: 'grupos-tecnico-take-e-look-separados' },
    ],
  },
  {
    title: 'Primárias',
    id: 'primarias-fluxo',
    items: [
      { label: 'A ordem dentro das primárias', id: 'a-ordem-dentro-das-primarias' },
      { label: 'Respeite a proposta', id: 'respeite-a-proposta' },
      { label: 'Toda câmera distorce um pouco', id: 'toda-camera-distorce-um-pouco' },
    ],
  },
  {
    title: 'Shot matching',
    id: 'shot-matching-fluxo',
    items: [
      { label: 'O take hero', id: 'o-take-hero' },
      { label: 'Um take inteiro de uma vez', id: 'nao-faca-o-color-de-um-take-inteiro-de-uma-vez' },
      { label: 'Publicidade e cinema', id: 'por-que-na-publicidade-e-diferente-do-cinema' },
      { label: 'Por que depois das primárias', id: 'por-que-o-matching-vem-depois-das-primarias' },
    ],
  },
  {
    title: 'Secundárias',
    id: 'secundarias-fluxo',
    items: [
      { label: 'Por que a cor muda de um take pro outro', id: 'por-que-a-cor-muda-de-um-take-pro-outro' },
      { label: 'A cor do produto mora aqui', id: 'a-cor-do-produto-mora-aqui' },
      { label: 'Organize os nós das secundárias', id: 'organize-os-nos-das-secundarias' },
    ],
  },
  {
    title: 'Creative grade',
    id: 'creative-grade-fluxo',
    items: [
      { label: 'Aplicado em todos', id: 'o-look-e-aplicado-em-todos-nao-ajustado-em-cada-um' },
      { label: 'No produto, o look tem limite', id: 'no-produto-o-look-tem-limite' },
    ],
  },
  {
    title: 'Finalização',
    id: 'finalizacao-fluxo',
    items: [
      { label: 'Assista do começo ao fim', id: 'assista-do-comeco-ao-fim' },
      { label: 'Limites legais e scopes', id: 'limites-legais-e-scopes' },
      { label: 'Pense no destino', id: 'pense-no-destino' },
      { label: 'Entrega', id: 'entrega' },
    ],
  },
  { title: 'Na prática: o fluxo num comercial', id: 'fluxo-na-pratica' },
  { title: 'Erros que mais atrapalham', id: 'erros-do-fluxo' },
  { title: 'Conclusão', id: 'conclusao-fluxo-produto' },
];

/* ------------------------------------------------------------------ artigo */

export default function FluxoTrabalhoArticle() {
  return (
    <article className="relative w-full space-y-10 font-serif leading-relaxed text-[#111111] select-text">
      <ArticleToc groups={TOC} />

      {/* ===================== INTRODUÇÃO ===================== */}
      <EditorialSection
        id="introducao-fluxo-produto"
        kickerLeft="FUNDAMENTOS · FLUXO DE TRABALHO"
        kickerRight="FILMES DE PRODUTO"
        title="FLUXO DE TRABALHO DO COLOR GRADING EM FILMES DE PRODUTO"
      >
        <Prose>
          <p>
            Um detalhe muito importante, tá? O fluxo de trabalho que a gente vai ver aqui não é uma regra que você precisa seguir sempre. Ele é a base. E, se você seguir essa base, vai ganhar produtividade e conseguir manter o controle de qualidade. Ou seja, o seu color vai ter mais qualidade com produtividade.
          </p>
          <p>
            Se você inventar de usar outro tipo de workflow a cada projeto, eu não posso garantir que vai manter sempre a mesma qualidade com a mesma produtividade. Às vezes a gente faz uma gambiarra que acelera o processo em um take, mas no outro take já não acelera. Então é importante manter a base do fluxo de trabalho e adaptar essa base ao nosso trabalho.
          </p>
          <p>
            Nesse artigo, a gente vai ver essa base aplicada a filmes de produto: comercial, VT, conteúdo de marca. A gente vai passar pela preparação no DaVinci Resolve, pelas primárias, pelo shot matching, pelas secundárias, pelo creative grade e pela finalização. No final, tem um passo a passo de um comercial de produto e os erros que mais atrapalham o fluxo.
          </p>
        </Prose>
      </EditorialSection>

      {/* ===================== A BASE ===================== */}
      <EditorialSection
        id="a-base-do-fluxo"
        kickerLeft="A BASE"
        kickerRight="ORDEM DE OPERAÇÕES"
        title="A BASE: CORREÇÃO DE COR PRIMEIRO, COLOR GRADING DEPOIS"
      >
        <Prose>
          <p>
            A base é o quê? Você faz as correções, faz os ajustes finos e, no final, aplica o color grading. Essa sempre vai ser a base, que é o que a gente chama de primárias, secundárias e creative grade, tá?
          </p>
          <p>
            O color grading, no sentido mais estrito, é só essa parte final, a criativa. O resto é correção de cor, o que a gente chama de color correction. E essa separação é a mesma que os coloristas profissionais usam: primeiro neutralizar e igualar, sem nenhum look; só depois aplicar o estilo.
          </p>
        </Prose>

        <DataTable
          caption="As quatro etapas do fluxo, o que são e o objetivo de cada uma"
          head={['Etapa', 'O que é', 'Objetivo']}
          rows={[
            ['Primárias', 'Ajustes na imagem inteira: balanços e normalização', 'Deixar cada take neutro e equilibrado'],
            ['Shot matching', 'Igualar todos os takes ao take hero', 'Transformar os takes numa unidade'],
            ['Secundárias', 'Ajustes num pedaço da imagem, com qualifier e window', 'Match mais específico, como a cor do produto'],
            ['Creative grade', 'O look, aplicado por cima de tudo', 'Dar a cara e a emoção do filme'],
          ]}
        />

        <Sub title="O fluxo em nodes">
          <NodeFlowExplorer />
        </Sub>

        <Sub title="Por que nessa ordem?">
          <Prose>
            <p>
              Nas primárias e nas secundárias, o objetivo é deixar as imagens neutras, entendeu? Então não é “eu quero fazer um filme de terror e quero deixar tudo azulado”. Você não faz isso nas primárias nem nas secundárias, você faz no creative grade.
            </p>
            <p>
              Trabalhar em cima de uma base equilibrada deixa o look mais previsível. E, se o cliente mudar de ideia sobre o estilo, as correções técnicas continuam valendo, então você não precisa refazer take por take. Fora isso, um problema que ficou pra trás, tipo uma dominante ou um estouro, o look só piora.
            </p>
          </Prose>
        </Sub>

        <Sub title="A base se adapta ao seu trabalho">
          <Prose>
            <p>
              Se você trabalha com casamento, vai ter um tipo de color grading pra casamento, porque o casamento exige um look específico, assim, assim, assado. Com produto é a mesma coisa: o filme tem pouco tempo, a cor da marca é sagrada e todos os takes precisam parecer um só. A base continua igual; o que muda é onde você coloca mais energia.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== ANTES DAS PRIMÁRIAS ===================== */}
      <EditorialSection
        id="antes-das-primarias"
        kickerLeft="PREPARAÇÃO"
        kickerRight="DAVINCI RESOLVE"
        title="ANTES DAS PRIMÁRIAS: PREPARAR O PROJETO E OS NÓS"
      >
        <Prose>
          <p>
            Antes de mexer em qualquer roda, a gente organiza a casa. Isso parece burocracia, mas é o que garante a produtividade no resto do fluxo, tá?
          </p>
        </Prose>

        <Sub title="Análise técnica e conversão de entrada">
          <Prose>
            <p>
              Tudo começa pela análise técnica do material: câmera, log, bits, amostragem. Com isso, você configura o gerenciamento de cor do projeto ou coloca um Color Space Transform pra levar o log pro espaço de trabalho e pro Rec.709. Essa conversão técnica vem antes de qualquer correção.
            </p>
          </Prose>
        </Sub>

        <Sub title="Uma ideia por nó">
          <Prose>
            <p>
              No Resolve, cada nó é uma ideia que você quer aplicar na imagem. A regra prática é: uma ideia por nó, com nome, pra você saber o que cada um faz e conseguir ligar e desligar pra conferir o efeito. Um começo comum é ter nós separados pra exposição, contraste e balanço de cor.
            </p>
            <p>
              Vale montar uma árvore padrão e salvar como template. Assim, todo take começa com a mesma estrutura, e você aplica com Apply Grade sem perder os nomes dos nós.
            </p>
          </Prose>
        </Sub>

        <Sub title="Grupos: técnico, take e look separados">
          <Prose>
            <p>Os grupos do Resolve têm três estágios, e eles casam direitinho com o nosso fluxo:</p>
          </Prose>
          <Bullets
            single
            items={[
              { label: 'Group Pre-Clip:', text: 'a parte técnica que vale pra todos, como o Color Space Transform.' },
              { label: 'Clip:', text: 'o ajuste de cada take, ou seja, primárias, matching e secundárias.' },
              { label: 'Group Post-Clip:', text: 'o creative grade, o look que vale pro filme inteiro.' },
            ]}
          />
          <Prose>
            <p>
              Num comercial de produto, muitas vezes todo o VT entra num grupo só, porque tudo precisa parecer uma unidade. Aí, quando o cliente pede pra deixar o look um pouco mais quente, você mexe num lugar e muda o filme inteiro.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== PRIMÁRIAS ===================== */}
      <EditorialSection
        id="primarias-fluxo"
        kickerLeft="IMAGEM INTEIRA"
        kickerRight="NORMALIZAÇÃO"
        title="PRIMÁRIAS: NORMALIZAÇÃO E BALANÇOS"
      >
        <Prose>
          <p>
            Dentro da correção de cor, a gente tem a normalização e os balanços: balanço de branco, exposição, saturação, contraste, tudo que envolve a imagem inteira. Todo ajuste aplicado na imagem inteira é chamado de primária.
          </p>
          <p>
            É como se você estivesse começando a lapidar um diamante, entendeu? Primeiro você tira o excesso. Tem muita luz, eu deixo mais baixo; está muito escuro, eu deixo um pouco mais claro.
          </p>
        </Prose>

        <Sub title="A ordem dentro das primárias">
          <Prose>
            <p>Uma ordem que funciona bem é luminância primeiro, cor depois:</p>
          </Prose>
          <NumberedSteps
            items={[
              { title: 'Exposição e contraste', text: 'Acerte pretos, médios e altas luzes olhando o waveform.' },
              { title: 'Balanço de branco e dominantes', text: 'Neutralize a imagem, usando a parade e o vectorscope como guia.' },
              { title: 'Saturação', text: 'Deixe a cor natural, pensando em pele, comida, folhagem e, no nosso caso, no produto.' },
            ]}
          />
          <Note>Mexer na luz muda a percepção da cor, por isso a luz vem antes.</Note>
        </Sub>

        <Sub title="Respeite a proposta">
          <Prose>
            <p>
              É claro que tudo depende da proposta do seu color grading. Às vezes o diretor quer que seja mais escuro, ele já filmou pra ser mais escuro. Então você não vai deixar isso mais claro. Mas você vai fazer o ajuste pra que a imagem fique mais equilibrada dentro dessa proposta.
            </p>
          </Prose>
        </Sub>

        <Sub title="Toda câmera distorce um pouco">
          <Prose>
            <p>
              Praticamente todas as câmeras vão te entregar a cor levemente distorcida, por causa da ciência de cor de cada uma. Numa, o rosto vai estar mais amarelo; em outra, mais esverdeado; em outra, mais avermelhado. No produto acontece igual: o branco da embalagem pode vir amarelado numa câmera e azulado na outra. Nas primárias, você faz esses ajustes pra imagem ficar o mais neutra possível.
            </p>
            <p>
              E nem sempre é só balanço de branco, tá? Por isso a gente fala em balanços e normalizações: às vezes é o preto que está levantado, às vezes é um canal inteiro deslocado.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== SHOT MATCHING ===================== */}
      <EditorialSection
        id="shot-matching-fluxo"
        kickerLeft="UNIDADE"
        kickerRight="TODOS OS TAKES"
        title="SHOT MATCHING: TODOS OS TAKES NUMA UNIDADE"
      >
        <Prose>
          <p>
            Depois que a gente faz todo esse balanço, vai pro matching. O que é o matching, ou shot matching? É fazer com que todos os takes de uma cena se transformem numa unidade. Todos eles precisam ter a mesma quantidade de iluminação: o highlight na mesma posição, os meio-tons na mesma posição, a mesma quantidade de luz no assunto principal.
          </p>
          <p>
            Isso é pra que, quando passa de um take pro outro, você não tenha aquele pulo, sabe? Como se estivesse filmando à noite e de repente ficasse mais claro, ou mudasse de iluminação, ou até trocasse do dia pra noite.
          </p>
        </Prose>

        <Sub title="O take hero">
          <Prose>
            <p>
              O matching é feito ajustando tudo com o seu hero. O que é o hero? É o seu take principal, aquele take tão bonito, tão bom, que vira referência pros outros. Ele precisa ser tecnicamente sólido, sem estouro e sem dominante forte, e de preferência parecido com o resto da cena.
            </p>
            <p>
              No produto, o hero normalmente é o packshot, aquele plano limpo do produto onde a cor da marca está perfeita. Se o produto está certo ali, ele vira a régua do filme inteiro.
            </p>
          </Prose>
        </Sub>

        <Sub title="Não faça o color de um take inteiro de uma vez">
          <Prose>
            <p>
              Um detalhe muito importante: você não faz todo o color grading de um take e depois vai pro outro take e pro outro. Não, não. Você faz a normalização de um take e aí faz a normalização de todos os takes daquela cena, ou, no caso do VT, do vídeo inteiro, já fazendo o matching com o hero.
            </p>
            <p>
              No Resolve, isso fica mais fácil com stills na galeria e o modo de comparação (wipe ou split screen), olhando os scopes lado a lado. Uma técnica comum é neutralizar com offset olhando a parade e depois comparar com o hero.
            </p>
          </Prose>
        </Sub>

        <Sub title="Por que na publicidade é diferente do cinema">
          <Prose>
            <p>
              Num documentário ou numa ficção, o matching é feito por cena. Cada cena é um cenário, tem uma direção de arte e uma direção de fotografia, então você iguala os takes daquela cena e depois parte pra outra, com base na iluminação da outra.
            </p>
            <p>
              Agora, se é comercial, se é pequeno, aí é diferente: todos os takes precisam estar batendo, mesmo que um tenha sido gravado fora e outro dentro. Você precisa achar um meio-termo pra que o que está à noite não pareça tão diferente do que está de dia. É um pouquinho mais complicado, mas funciona, vai por mim.
            </p>
            <p>
              Por que a publicidade não segue a mesma regra do cinema? Porque a publicidade tem 30 segundos. No cinema, 30 segundos às vezes é um take; na publicidade, é o vídeo inteiro. Não dá tempo do cérebro se acostumar com a mudança. Então, mesmo que um take tenha sido gravado numa balada, outro num parque e outro dentro de um avião, todos precisam parecer estar dentro da mesma unidade, tá?
            </p>
          </Prose>
        </Sub>

        <Sub title="Por que o matching vem depois das primárias">
          <Prose>
            <p>
              Porque a normalização é algo que a gente faz no início do processo. Se você tentar igualar takes que ainda estão com dominante, contraste e exposição diferentes, vai ficar caçando diferença que nem devia existir. Com todos neutros, o matching vira ajuste fino.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== SECUNDÁRIAS ===================== */}
      <EditorialSection
        id="secundarias-fluxo"
        kickerLeft="UM PEDAÇO DA IMAGEM"
        kickerRight="QUALIFIER E WINDOW"
        title="SECUNDÁRIAS: AJUSTAR UM PEDAÇO DA IMAGEM"
      >
        <Prose>
          <p>
            Depois que você fez o shot matching de iluminação, saturação etc. e todos os takes estão batendo, aí você vai pras secundárias. O que são secundárias? Você seleciona um pedaço da imagem pra fazer um ajuste. Pra isso a gente usa o qualifier e a window, a power window, que é a máscara.
          </p>
          <p>
            As secundárias servem pra fazer um match mais específico, entendeu? Às vezes o amarelo de um take está diferente do amarelo de outro. Vamos supor que o amarelo aqui ficou mais desbotado do que ali. Você faz um ajuste só no amarelo pra bater com o hero, ou com o resto dos takes.
          </p>
        </Prose>

        <Sub title="Por que a cor muda de um take pro outro">
          <Prose>
            <p>
              Tem vários motivos. Às vezes precisou subir o ISO, e quando você sobe o ISO você muda a cor. Por isso a gente sempre fala: filma no ISO nativo da sua câmera, porque assim você mantém o padrão de cor. A lente também muda a cor: dependendo da lente, o mesmo produto sai com outro tom.
            </p>
          </Prose>
        </Sub>

        <Sub title="A cor do produto mora aqui">
          <Prose>
            <p>
              No filme de produto, as secundárias são onde a cor da marca é garantida. É comum isolar uma lata ou uma embalagem com qualifier e window pra bater exatamente com a cor aprovada pela marca ou pela agência. Use o tracker pra a máscara acompanhar o produto quando ele se mexe.
            </p>
            <p>Outras secundárias comuns em produto:</p>
          </Prose>
          <Bullets
            single
            items={[
              { label: 'Recuperar áreas:', text: 'uma janela estourada ou uma parte escura do produto se resolve com power window, não com ajuste geral, que desequilibra a imagem toda.' },
              { label: 'Segurar cor saturada:', text: 'um vermelho de embalagem que estoura o canal se controla com qualifier.' },
              { label: 'Guiar o olhar:', text: 'escurecer levemente o fundo ou realçar o produto, sem exagerar, pra não parecer recortado.' },
            ]}
          />
        </Sub>

        <Sub title="Organize os nós das secundárias">
          <Prose>
            <p>
              Coloque cada secundária no seu próprio nó, com nome. Nós em paralelo ajudam: a secundária fica num ramo independente e não muda quando você ajusta as primárias depois. E o nó outside aproveita a mesma máscara pra mexer em tudo que está fora do produto.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== CREATIVE GRADE ===================== */}
      <EditorialSection
        id="creative-grade-fluxo"
        kickerLeft="O LOOK"
        kickerRight="COLOR GRADING"
        title="CREATIVE GRADE: O LOOK"
      >
        <Prose>
          <p>
            Fez tudo, acabou a correção de cor, fez as primárias e as secundárias, está lindo, está tudo batendo. Agora você vai pra parte criativa, o color grading.
          </p>
          <p>
            E aí sim você usa ferramentas de primárias e secundárias, que vão atingir a imagem toda e também um pedacinho dela. Isso depende do tipo de look que você quer dar: deixar o filme com cara de terror, com teal and orange, que é muito comum, ou dar um aspecto de textura de pintura. Tudo isso é feito no color grading.
          </p>
        </Prose>

        <Sub title="O look é aplicado em todos, não ajustado em cada um">
          <Prose>
            <p>
              Por isso que você tem que normalizar tudo e deixar todos os takes o mais neutros possível. Não é comum ficar ajustando o color grading take por take, tá? Não que não possa ser feito, mas o comum é pegar o nosso color grading e aplicar em todos os takes, e ele vai parecer padrão. Por quê? Porque a correção de cor já padronizou tudo. Na hora que você coloca o look, todos funcionam perfeitamente.
            </p>
            <p>
              No Resolve, o lugar natural do look é o Group Post-Clip ou um nó compartilhado. Se você usar LUT criativa, deixe ela no próprio nó, pra poder reaproveitar.
            </p>
          </Prose>
        </Sub>

        <Sub title="No produto, o look tem limite">
          <Prose>
            <p>
              Em comercial, o trabalho costuma ser muito mais correção do que estilo. O toque criativo, como um pouco mais quente ou mais frio, vem no final e sem exagero. Depois de aplicar o look, volte no packshot e confira: a cor da marca continua certa? Se o look puxou o vermelho da lata, você corrige isso com uma secundária protegendo o produto.
            </p>
            <p>
              Prepare duas ou três opções, da mais segura pra mais ousada, e explique cada uma. Assim o cliente acompanha o raciocínio e decide mais rápido.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== FINALIZAÇÃO ===================== */}
      <EditorialSection
        id="finalizacao-fluxo"
        kickerLeft="REVISÃO"
        kickerRight="CONTROLE DE QUALIDADE E ENTREGA"
        title="FINALIZAÇÃO: REVISÃO, CONTROLE DE QUALIDADE E ENTREGA"
      >
        <Prose>
          <p>
            O color não acaba quando o look está bonito no seu monitor. Antes de entregar, a gente revisa o filme inteiro e confere se ele vai chegar certo onde vai passar.
          </p>
        </Prose>

        <Sub title="Assista do começo ao fim">
          <Prose>
            <p>
              Assista o VT inteiro em tempo real, sem parar. É assim que você percebe um pulo de cor entre dois takes que, parado, parecia igual. Num filme de 30 segundos, qualquer pulo salta no olho.
            </p>
          </Prose>
        </Sub>

        <Sub title="Limites legais e scopes">
          <Prose>
            <p>
              Se a peça vai pra TV, ela precisa respeitar os limites de luminância e de saturação do Rec.709, senão a emissora pode rejeitar. O Resolve não tem um botão mágico de legalizar, então a checagem é feita olhando parade e vectorscope e controlando os excessos, durante a correção ou no final. Produto com amarelo, vermelho e ciano muito saturados é o primeiro a passar do limite.
            </p>
            <p>
              Revise num monitor calibrado e, se a emissora ou a plataforma tiver especificação própria, siga a especificação.
            </p>
          </Prose>
        </Sub>

        <Sub title="Pense no destino">
          <Prose>
            <p>
              Comercial de produto hoje passa em TV, YouTube, Instagram, TikTok e telão de ponto de venda. Confira no celular também, porque é onde boa parte das pessoas vai ver. Às vezes um preto que parece rico no monitor some num celular com brilho alto.
            </p>
          </Prose>
        </Sub>

        <Sub title="Entrega">
          <Prose>
            <p>
              Exporte no formato pedido, com o espaço de cor e o gama certos na exportação. Guarde o projeto, os stills de referência e as versões aprovadas. Se o cliente voltar daqui a três meses pedindo uma versão nova, você reabre e continua de onde parou.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== NA PRÁTICA ===================== */}
      <EditorialSection
        id="fluxo-na-pratica"
        kickerLeft="NA PRÁTICA"
        kickerRight="COMERCIAL DE PRODUTO"
        title="NA PRÁTICA: O FLUXO NUM COMERCIAL DE PRODUTO"
      >
        <Prose>
          <p>
            Bora pra prática. Imagina um VT de 30 segundos de um energético: tem take da lata girando em estúdio com fundo escuro, take de gente bebendo num parque de dia, take numa balada à noite e o packshot final com a lata e o logo.
          </p>
        </Prose>
        <NumberedSteps
          items={[
            { title: 'Análise e preparação.', text: 'Faça a análise técnica, configure a entrada de cor e coloque todos os takes num grupo. No Group Pre-Clip vai o Color Space Transform.' },
            { title: 'Escolha o hero.', text: 'O packshot é o hero: é onde a lata aparece limpa e a cor da marca tem que estar perfeita. Acerte esse take primeiro e guarde um still dele.' },
            { title: 'Primárias em todos os takes.', text: 'Take por take, acerte exposição, contraste, balanço e saturação, deixando tudo neutro. Não faça o look ainda, tá?' },
            { title: 'Shot matching com o hero.', text: 'Iguale cada take ao packshot usando wipe e scopes. A balada e o parque não vão ficar idênticos, mas precisam parecer o mesmo filme. Ache o meio-termo entre noite e dia.' },
            { title: 'Secundárias.', text: 'Isole a lata com qualifier e window, com tracking, e acerte a cor da marca em todos os takes. Recupere o rótulo onde estiver escuro e segure o vermelho onde estiver estourando.' },
            { title: 'Creative grade.', text: 'No Group Post-Clip, aplique o look: talvez um contraste mais forte e um toque mais frio nas sombras pra combinar com a energia do produto. Monte duas ou três opções.' },
            { title: 'Proteja o produto.', text: 'Volte no packshot e confira a cor da lata com o look ligado. Se puxou, corrija com uma secundária depois do look.' },
            { title: 'Revisão e QC.', text: 'Assista os 30 segundos inteiros, confira os scopes e os limites legais, e veja no celular.' },
            { title: 'Entrega.', text: 'Exporte nas versões pedidas (TV, YouTube, vertical pra redes) e guarde o projeto organizado.' },
          ]}
        />
        <Prose>
          <p>
            Repare que em nenhum momento a gente fez o color completo de um take pra depois ir pro próximo. Cada etapa passa por todos os takes antes de ir pra próxima, e é isso que deixa o filme coerente e o trabalho rápido.
          </p>
        </Prose>
      </EditorialSection>

      {/* ===================== ERROS ===================== */}
      <EditorialSection
        id="erros-do-fluxo"
        kickerLeft="ATENÇÃO"
        kickerRight="O QUE ATRAPALHA"
        title="ERROS QUE MAIS ATRAPALHAM O FLUXO"
      >
        <DataTable
          caption="Erros que mais atrapalham o fluxo, o que acontece e como evitar"
          head={['Erro', 'O que acontece', 'Como evitar']}
          rows={[
            ['Fazer o look nas primárias', 'Cada take fica com um look diferente e nada bate', 'Primárias só neutralizam; look vai no creative grade'],
            ['Colorir um take inteiro e depois o próximo', 'Os takes não conversam e você refaz tudo no fim', 'Passe cada etapa por todos os takes'],
            ['Pular a conversão de entrada', 'Imagem leitosa ou sombras esmagadas', 'Configure o log certo antes de tudo'],
            ['Corrigir problema local com ajuste geral', 'Arruma uma parte e estraga o resto da imagem', 'Use window ou qualifier pra problemas locais'],
            ['Matching por cena num comercial', 'O filme parece vários filmes em 30 segundos', 'Em publicidade, todos os takes numa unidade'],
            ['Hero mal escolhido', 'Todo o filme é igualado a um take ruim', 'Escolha um take limpo, sem estouro e sem dominante'],
            ['Esquecer o produto depois do look', 'A cor da marca muda no final', 'Confira o packshot com o look ligado'],
            ['Nós sem nome e sem ordem', 'Ninguém, nem você, entende o grade depois', 'Uma ideia por nó, com nome e template'],
            ['Não assistir o filme inteiro', 'Pulos de cor passam despercebidos', 'Assista em tempo real antes de entregar'],
          ]}
        />
      </EditorialSection>

      {/* ===================== CONCLUSÃO ===================== */}
      <EditorialSection
        id="conclusao-fluxo-produto"
        kickerLeft="RESUMO"
        kickerRight="A BASE"
        title="CONCLUSÃO"
      >
        <Prose>
          <p>
            O fluxo de trabalho é a base: correção de cor primeiro, com primárias, matching e secundárias deixando tudo neutro e igual; color grading depois, aplicado por cima de uma imagem que já está padronizada.
          </p>
          <p>
            No produto, essa base protege a coisa mais importante do filme: a cor da marca, igual do primeiro ao último segundo. Mantenha a base, adapte ao seu trabalho, e você vai ter um color com qualidade e com produtividade, tá?
          </p>
        </Prose>
      </EditorialSection>
    </article>
  );
}
