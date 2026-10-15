'use client';

import React from 'react';
import { ArticleToc, EditorialSection, type TocGroup } from './EditorialLayout';
import BitDepthSimulator from './BitDepthSimulator';
import ChromaSubsamplingDemo from './ChromaSubsamplingDemo';

/**
 * Conteúdo da aula "Análise da Imagem", visível para todos os alunos:
 * "Como analisar uma filmagem de produto antes do color grading".
 *
 * Ferramentas interativas (só onde ajudam a entender o texto):
 *  - Profundidade de bits  → BitDepthSimulator (banding ao esticar a imagem)
 *  - Amostragem de croma   → ChromaSubsamplingDemo (4:4:4, 4:2:2, 4:2:0)
 *
 * O conteúdo completo anterior continua oculto em AnaliseImagemCompletaArticle.tsx
 * (só aparece para quem concluiu 100% das aulas).
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
function Bullets({ items }: { items: { label?: string; text: string }[] }) {
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
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

/* ------------------------------------------------------------------ tabela de problemas */

interface Problem {
  id: string;
  name: string;
  how: string;
  fix: string;
}

const PROBLEMS: Problem[] = [
  { id: 'entrada', name: 'Espaço de cor de entrada errado', how: 'Imagem leitosa, sombras esmagadas, cores estranhas', fix: 'Sim, configurando o log certo no Resolve' },
  { id: 'altas-luzes', name: 'Altas luzes estouradas', how: 'Brilho branco sem cor no vidro, metal ou rótulo', fix: 'Não. Dá só pra suavizar a transição' },
  { id: 'subexposicao', name: 'Subexposição', how: 'Ruído colorido e cor suja ao clarear as sombras', fix: 'Parcialmente, com redução de ruído' },
  { id: 'banding', name: 'Banding (8 bits)', how: 'Faixas em fundo infinito, degradê e garrafa', fix: 'Pouco. Dá pra disfarçar com grão' },
  { id: 'artefato', name: 'Artefato e craquelado', how: 'Blocos e quebras em brilho e áreas lisas', fix: 'Pouco. Depende de onde vai passar' },
  { id: 'bordas', name: 'Bordas ruins em 4:2:0', how: 'Seleção serrilhada no rótulo ou no produto', fix: 'Parcialmente, suavizando a máscara' },
  { id: 'luz-mista', name: 'Luz mista', how: 'Lado quente e lado frio no mesmo produto', fix: 'Parcialmente, com correção localizada' },
  { id: 'reflexo', name: 'Reflexo indesejado', how: 'Equipe, câmera ou parede refletida no produto', fix: 'Só com máscara, tracking ou limpeza' },
  { id: 'cor-marca', name: 'Cor do produto longe da marca', how: 'Vermelho alaranjado, branco amarelado', fix: 'Sim, com qualificador e Color Warper' },
  { id: 'planos', name: 'Planos inconsistentes', how: 'Produto muda de cor de um plano pro outro', fix: 'Sim, mas dá trabalho plano a plano' },
];

function ProblemsTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-left font-sans text-sm">
        <caption className="sr-only">Problemas mais comuns na hora de corrigir uma filmagem de produto</caption>
        <thead>
          <tr className="bg-[#f5f5f7] text-neutral-900">
            <th scope="col" className="p-3 font-bold">Problema</th>
            <th scope="col" className="p-3 font-bold">Como aparece</th>
            <th scope="col" className="p-3 font-bold">Dá pra resolver?</th>
          </tr>
        </thead>
        <tbody>
          {PROBLEMS.map((p) => (
            <tr key={p.id} className="border-t border-neutral-200 align-top">
              <th scope="row" className="p-3 font-semibold text-neutral-900">{p.name}</th>
              <td className="p-3 font-serif text-[15px] text-neutral-800">{p.how}</td>
              <td className="p-3 font-serif text-[15px] text-neutral-800">{p.fix}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ sumário */

const TOC: TocGroup[] = [
  { title: 'Introdução', id: 'introducao-analise-produto' },
  {
    title: 'Análise técnica',
    id: 'analise-tecnica-arquivo',
    items: [
      { label: 'Espaço de cor e gama', id: 'espaco-de-cor-e-gama' },
      { label: 'Log, RAW ou Rec.709 de câmera', id: 'log-raw-ou-rec-709-de-camera' },
      { label: 'Profundidade de bits', id: 'profundidade-de-bits' },
      { label: 'Amostragem de croma', id: 'amostragem-de-croma-4-4-4-4-2-2-4-2-0' },
      { label: 'Codec e compressão', id: 'codec-e-compressao' },
      { label: 'Grão, ruído e artefatos', id: 'grao-ruido-e-artefatos' },
    ],
  },
  {
    title: 'Exposição e luz',
    id: 'exposicao-e-luz-produto',
    items: [
      { label: 'Subexposição e superexposição', id: 'subexposicao-e-superexposicao' },
      { label: 'Altas luzes e reflexos no produto', id: 'altas-luzes-e-reflexos-no-produto' },
      { label: 'Qualidade e temperatura da luz', id: 'qualidade-e-temperatura-da-luz' },
    ],
  },
  {
    title: 'Cor do produto',
    id: 'cor-do-produto',
    items: [
      { label: 'Referência de cor da marca', id: 'pegue-a-referencia-de-cor-da-marca' },
      { label: 'Pantone não é vídeo', id: 'pantone-nao-e-video-ne' },
      { label: 'Color checker e balanço de branco', id: 'color-checker-e-balanco-de-branco' },
      { label: 'Materiais que enganam', id: 'materiais-que-enganam' },
    ],
  },
  {
    title: 'Análise artística',
    id: 'analise-artistica',
    items: [
      { label: 'Entenda a marca e o produto', id: 'entenda-a-marca-e-o-produto' },
      { label: 'Referências', id: 'referencias-o-que-da-pra-trazer-e-o-que-nao-da' },
      { label: 'Correção primeiro, estilo depois', id: 'correcao-primeiro-estilo-depois' },
      { label: 'Deixe claro o que é possível', id: 'deixe-claro-o-que-e-possivel' },
    ],
  },
  { title: 'O que mais dá problema', id: 'o-que-mais-da-problema' },
  { title: 'Passo a passo no Resolve', id: 'passo-a-passo-no-resolve' },
  { title: 'Conclusão', id: 'conclusao-analise-produto' },
];

/* ------------------------------------------------------------------ artigo */

export default function AnaliseImagemArticle() {
  return (
    <article className="relative w-full space-y-10 font-serif leading-relaxed text-[#111111] select-text">
      <ArticleToc groups={TOC} />

      {/* ===================== INTRODUÇÃO ===================== */}
      <EditorialSection
        id="introducao-analise-produto"
        kickerLeft="FUNDAMENTOS · ANÁLISE DA IMAGEM"
        kickerRight="FILMAGEM DE PRODUTO"
        title="COMO ANALISAR UMA FILMAGEM DE PRODUTO ANTES DO COLOR GRADING"
      >
        <Prose>
          <p>
            Toda vez que o colorista pega um material, é importante fazer uma análise técnica dele antes de qualquer coisa, pra entender quais são as possibilidades e tudo mais. Não tem como a gente chegar no resultado que a gente quer sem saber como essa imagem foi construída dentro do set: qual câmera, qual configuração, qual luz e qual intenção.
          </p>
          <p>
            E quando o assunto é produto, isso pesa ainda mais, tá? Num filme de ficção, uma pele um pouco mais quente ou um céu um pouco mais azul dificilmente vira problema. Num comercial, a cor do produto é a própria mensagem: o vermelho de uma lata, o dourado de um perfume, o tom exato de um cosmético. Isso tem que chegar na tela igual ao que a pessoa vai encontrar na prateleira.
          </p>
          <p>
            Nesse artigo, a gente vai ver o que analisar numa filmagem de produto antes de começar a colorir. Vamos passar pela parte técnica (o arquivo e a captação), pela exposição e pela luz, pela cor do produto e pela parte artística, que é a intenção e o look que o cliente quer. No final, tem um passo a passo pra aplicar no DaVinci Resolve e uma lista do que mais dá problema na hora de corrigir.
          </p>
        </Prose>
      </EditorialSection>

      {/* ===================== ANÁLISE TÉCNICA ===================== */}
      <EditorialSection
        id="analise-tecnica-arquivo"
        kickerLeft="O ARQUIVO E A CAPTAÇÃO"
        kickerRight="MARGEM DE MANOBRA"
        title="ANÁLISE TÉCNICA: ENTENDER COMO O ARQUIVO FOI GRAVADO"
      >
        <Prose>
          <p>
            A análise técnica responde uma pergunta: quanto de informação a câmera guardou e quanto disso a gente consegue usar. É ela que define a nossa margem de manobra antes de pensar em look.
          </p>
        </Prose>

        <Sub title="Espaço de cor e gama">
          <Prose>
            <p>
              A primeira coisa que a gente tem que saber de uma imagem é qual é o espaço de cor e o gama no qual ela foi gravada. Por que eu preciso saber disso? Porque eu trabalho no espaço da câmera (ou num espaço de trabalho mais amplo) e depois converto pro espaço de entrega, que normalmente é o Rec.709, o da projeção. E projeção é aquilo que vai ser projetado mesmo: na televisão, no celular, no cinema.
            </p>
            <p>
              Olhando, é praticamente impossível saber. Boa parte das imagens em log têm essa característica lavada, e S-Log3, C-Log3, F-Log e V-Log pedem conversões diferentes. Então pergunte pra produção ou pro diretor de fotografia qual câmera foi usada, qual perfil e qual gamut. Se você é o videomaker que gravou, fica muito mais fácil, porque você já sabe se foi S-Log1, S-Log2 ou S-Log3. Os metadados do clipe no Resolve também ajudam.
            </p>
            <p>
              No Resolve, essa informação vira o Input Color Space no gerenciamento de cor do projeto (DaVinci YRGB Color Managed) ou o nó de Color Space Transform. Se você escolher a entrada errada, a imagem fica leitosa ou com as sombras esmagadas, e esse é um dos erros mais comuns de quem está começando.
            </p>
          </Prose>
        </Sub>

        <Sub title="Log, RAW ou Rec.709 de câmera">
          <Prose>
            <p>
              O tipo de arquivo mostra quanto a imagem já foi processada. Em RAW ou log, você tem toda a informação que a câmera consegue capturar. Em Rec.709, você está comprimindo essa informação, e quando você grava com ela comprimida, não consegue recuperar, beleza?
            </p>
            <p>
              Olha a diferença na prática: numa sombra gravada em log, se você subir a luz, aparece textura, como a ferrugem de uma peça, a trama de um tecido, o relevo de uma embalagem. No mesmo trecho em Rec.709, essa informação não está lá. Vai ficar simplesmente acinzentado, tá?
            </p>
          </Prose>
        </Sub>

        <Sub title="Profundidade de bits">
          <Prose>
            <p>
              A profundidade de bits é quantos tons cada canal consegue registrar. Em 8 bits são 256 níveis por canal (umas 16,7 milhões de cores); em 10 bits são 1.024 níveis por canal, passando de um bilhão de combinações.
            </p>
            <p>
              Sem correção, os dois parecem quase iguais. A diferença aparece quando a gente estica a imagem no grading: em 8 bits, a câmera tem muito mais dificuldade nas transições em degradê, então aparecem umas estrias, o famoso banding, num fundo infinito, na curva de uma garrafa, num céu. E log em 8 bits piora, porque a curva espalha poucos tons numa faixa grande.
            </p>
          </Prose>
          <BitDepthSimulator />
        </Sub>

        <Sub title="Amostragem de croma (4:4:4, 4:2:2, 4:2:0)">
          <Prose>
            <p>
              A amostragem é quanta informação de cor foi guardada em relação à informação de luz. Em 4:4:4 cada pixel tem a sua cor; em 4:2:2 a cor é dividida entre dois pixels na horizontal; em 4:2:0 ela é compartilhada por blocos de 2×2 pixels.
            </p>
            <p>
              Quanto maior essa amostragem, mais detalhe a gente tem nas cores e na transição de luz. Quanto menor, menos detalhe a gente consegue enxergar e trabalhar. No produto, isso pesa na hora de selecionar: pegar a cor de um rótulo ou separar o produto do fundo fica serrilhado em 4:2:0. E cor muito saturada, que é comum em embalagem, mancha e vaza nas bordas quando você empurra a saturação.
            </p>
          </Prose>
          <ChromaSubsamplingDemo />
        </Sub>

        <Sub title="Codec e compressão">
          <Prose>
            <p>
              Codec muito comprimido, tipo o H.264 e o H.265 de câmera de entrada e de celular, joga fora detalhe fino pra economizar espaço. No produto, isso aparece como blocos nas áreas lisas, textura sumindo em superfície fosca e ruído “mastigado” nas sombras. Se o material vier em ProRes, BRAW ou RAW, a margem é bem maior.
            </p>
          </Prose>
        </Sub>

        <Sub title="Grão, ruído e artefatos">
          <Prose>
            <p>
              Outra coisa que a gente precisa ver é a quantidade e o tipo de grão. Um grão meio descolorido, mais preto e branco, não é um problema pra gente. O problema é aquele grão colorido, com pontos vermelhos, verdes e azuis nas sombras, e também o que a gente chama de artefato: aquele craquelado que aparece em degradê e brilho, principalmente em 8 bits.
            </p>
            <p>
              Esse craquelado é bem difícil de tirar. Normalmente a gente dá uma ignorada nele, dependendo do projeto, porque no celular ele fica meio invisível. Agora, se vai pra um telão, uma vitrine digital ou pro cinema, aí já começa a ficar ardido: numa tela de 5 metros de altura, não tem como não ver. Por isso, saber onde a peça vai passar ajuda a decidir quanto esforço vale gastar nisso.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== EXPOSIÇÃO E LUZ ===================== */}
      <EditorialSection
        id="exposicao-e-luz-produto"
        kickerLeft="LUZ"
        kickerRight="O QUE O SENSOR REGISTROU"
        title="EXPOSIÇÃO E LUZ: O QUE O SENSOR REALMENTE REGISTROU"
      >
        <Prose>
          <p>
            A exposição define quanta informação de luz chegou no arquivo. E ela limita o que a gente consegue fazer no grading mais do que qualquer configuração de câmera.
          </p>
        </Prose>

        <Sub title="Subexposição e superexposição">
          <Prose>
            <p>
              Veja se os planos estão subexpostos, superexpostos ou corretos, e se a exposição se mantém de um plano pro outro. Quando a gente filma subexposto, entrega menos informação de luz: na hora de clarear, aparece ruído e a cor fica suja nas sombras. Já a superexposição perde a alta luz de vez, e o que estourou não volta.
            </p>
            <p>
              Use o waveform em vez de confiar só no monitor, tá? Ele mostra onde estão as sombras, os médios e as altas luzes, e se alguma coisa encostou no topo (clipou) ou no fundo (esmagou).
            </p>
          </Prose>
        </Sub>

        <Sub title="Altas luzes e reflexos no produto">
          <Prose>
            <p>
              Produto quase sempre tem superfície que reflete: vidro, metal, plástico brilhante, tela, verniz. Nesses brilhos, a câmera costuma estourar, e o que estourou vira branco puro, sem cor e sem textura.
            </p>
            <p>
              Antes de colorir, ache esses pontos e separe o brilho que faz parte da forma do produto do brilho que atrapalha. Um reflexo controlado ajuda a mostrar a curva de uma garrafa ou o acabamento metálico; um ponto de luz duro ou um rótulo estourado apaga informação que nenhuma correção recupera.
            </p>
            <p>
              Repare também nos reflexos escuros ou coloridos. Superfície espelhada reflete o ambiente: a parede, a equipe, a câmera, uma luz de outra temperatura. No set, diretor de fotografia de publicidade controla isso com grandes superfícies brancas e difusas ou com tenda de produto. O que escapou vira trabalho de máscara ou de limpeza na pós.
            </p>
          </Prose>
        </Sub>

        <Sub title="Qualidade e temperatura da luz">
          <Prose>
            <p>
              Veja quantas fontes de luz tem e de que temperatura. Luz mista, tipo tungstênio com janela ou LED barato com luz do dia, cria dominantes diferentes no mesmo quadro, e um balanço de branco geral não resolve as duas ao mesmo tempo. No produto, isso é crítico: uma embalagem branca pode ficar quente de um lado e azulada do outro.
            </p>
            <p>
              Repare também no contraste da luz. Luz muito dura gera sombra densa e brilho estourado; luz suave e envolvente dá muito mais margem pra gente modelar o produto no grading.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== COR DO PRODUTO ===================== */}
      <EditorialSection
        id="cor-do-produto"
        kickerLeft="A COR É A MENSAGEM"
        kickerRight="PRATELEIRA"
        title="COR DO PRODUTO: A COR QUE O CLIENTE VAI ENCONTRAR NA PRATELEIRA"
      >
        <Prose>
          <p>
            Em comercial de produto, a cor do produto é a própria mensagem. O vermelho de uma lata, o dourado de um perfume, o tom de uma base: isso tem que chegar na tela igual ao que a pessoa vai ver quando pegar o produto na mão.
          </p>
        </Prose>

        <Sub title="Pegue a referência de cor da marca">
          <Prose>
            <p>
              Antes de colorir, a gente precisa saber qual é a cor oficial. Peça pro cliente ou pra agência o manual de marca, os códigos Pantone, RGB ou hex, e, se der, o próprio produto físico ou fotos aprovadas de catálogo.
            </p>
            <p>
              Uma lata de refrigerante, por exemplo, muitas vezes precisa ser isolada com qualificador e power window pra bater exatamente com a cor aprovada pela marca ou pela agência. Sem a referência, você vai ficar chutando, e chute em cor de marca é retrabalho na certa.
            </p>
          </Prose>
        </Sub>

        <Sub title="Pantone não é vídeo, né?">
          <Prose>
            <p>
              Uma coisa importante: código Pantone foi feito pra impressão, não pra tela. Bater o número exato no vídeo quase nunca funciona direto. O caminho é acertar primeiro o matiz e depois ajustar a intensidade, porque a cor “exata” costuma ficar saturada e brilhante demais na tela.
            </p>
            <p>
              Então, na análise, já veja se a cor do produto no arquivo está perto da referência ou muito longe. Se está muito longe porque a luz do set contaminou, você já avisa o cliente que vai precisar de correção localizada em todos os planos.
            </p>
          </Prose>
        </Sub>

        <Sub title="Color checker e balanço de branco">
          <Prose>
            <p>
              Se a produção gravou um color checker (aquela cartela com cinzas e cores) no começo dos planos, maravilha. Ela serve pra acertar o balanço de branco, conferir a exposição e igualar câmeras diferentes que filmaram o mesmo produto. No Resolve, dá pra usar a ferramenta Color Match em cima da cartela.
            </p>
            <p>
              Se não tem cartela, procure um neutro na cena: um fundo branco ou cinza, uma etiqueta branca, a tampa de um produto. Olhe no vectorscope e na parade se esse neutro está realmente neutro ou puxando pra algum lado.
            </p>
          </Prose>
        </Sub>

        <Sub title="Materiais que enganam">
          <Prose>
            <p>Alguns materiais pedem atenção redobrada:</p>
          </Prose>
          <Bullets
            items={[
              { label: 'Branco:', text: 'embalagem branca denuncia qualquer dominante. Se ela estiver amarelada ou azulada, o público percebe.' },
              { label: 'Metal e dourado:', text: 'dependem muito do que estão refletindo. Um dourado pode virar laranja ou verde dependendo do ambiente.' },
              { label: 'Vermelhos e laranjas muito saturados:', text: 'são os primeiros a estourar o canal e a perder textura, principalmente em 8 bits e 4:2:0.' },
              { label: 'Transparentes e líquidos:', text: 'um perfume ou uma bebida mudam de cor conforme o fundo que aparece atrás.' },
              { label: 'Comida:', text: 'precisa parecer apetitosa. Look dessaturado e de pouco contraste costuma matar comida.' },
            ]}
          />
        </Sub>
      </EditorialSection>

      {/* ===================== ANÁLISE ARTÍSTICA ===================== */}
      <EditorialSection
        id="analise-artistica"
        kickerLeft="A INTENÇÃO"
        kickerRight="O QUE O MATERIAL PERMITE"
        title="ANÁLISE ARTÍSTICA: O QUE O CLIENTE QUER E O QUE O MATERIAL PERMITE"
      >
        <Prose>
          <p>
            Depois de entender o arquivo, a gente precisa entender a intenção: que sensação esse filme tem que passar e se a fotografia que chegou consegue chegar lá.
          </p>
        </Prose>

        <Sub title="Entenda a marca e o produto">
          <Prose>
            <p>
              Antes da sessão, estude a marca. Veja os comerciais anteriores, as peças impressas, o site, as redes. Tem marca que mantém a mesma paleta há anos e não quer sair dela; tem marca que está aberta pra testar coisa nova.
            </p>
            <p>
              Pergunte também qual é o protagonista da peça: é o produto, é uma pessoa usando o produto ou é a atmosfera? Isso muda onde vai a atenção no grading.
            </p>
          </Prose>
        </Sub>

        <Sub title="Referências: o que dá pra trazer e o que não dá">
          <Prose>
            <p>
              Peça referências pro diretor ou pra agência: filmes, comerciais, fotos. Depois compare com o material real: assunto, ambiente, iluminação, lente. Escolha os dois ou três atributos da referência que realmente dá pra reproduzir.
            </p>
            <p>
              Às vezes o cliente quer algo impossível com o material que você recebeu. Ele filma subexposto e fala: “ah, mas eu queria algo parecido com o Asteroid City, do Wes Anderson”. Não tem como, né? Aquele filme tem muita informação de luz, e a filmagem subexposta entrega pouca. São coisas completamente diferentes.
            </p>
            <p>
              E detalhe: filmar em 8 bits não impede um look parecido com o do Oppenheimer. Até dá. Só que não vai ter a mesma qualidade, e às vezes o motivo é artístico mesmo, porque a fotografia foi pensada de outro jeito.
            </p>
          </Prose>
        </Sub>

        <Sub title="Correção primeiro, estilo depois">
          <Prose>
            <p>
              Em comercial, o trabalho costuma ser muito mais correção do que look. Equilibrar os planos, igualar um com o outro e deixar o produto bonito e fiel já resolve a maior parte. O toque de estilo, como um pouco mais quente ou mais frio, vem no final e sem exagero.
            </p>
            <p>
              O look importa, e tem dado sobre isso: um estudo da System1 com 2.100 consumidores viu que o grading mexe na resposta emocional ao anúncio, mesmo quando ninguém comenta sobre a cor. Tons quentes funcionaram melhor em histórias de celebração, e tons frios em histórias mais tensas. Ou seja, o look tem que servir à história e ao produto.
            </p>
          </Prose>
        </Sub>

        <Sub title="Deixe claro o que é possível">
          <Prose>
            <p>
              Com a análise técnica e artística na mão, já fala pro seu cliente, seja ele o diretor ou o diretor de fotografia, quais são as possibilidades. Olha, dependendo do que você quer, eu não vou conseguir chegar nesse resultado, porque vocês filmaram assim, assim e assim. Isso evita frustração e protege o seu trabalho.
            </p>
          </Prose>
        </Sub>
      </EditorialSection>

      {/* ===================== O QUE MAIS DÁ PROBLEMA ===================== */}
      <EditorialSection
        id="o-que-mais-da-problema"
        kickerLeft="DIAGNÓSTICO"
        kickerRight="O QUE TEM SOLUÇÃO"
        title="O QUE MAIS DÁ PROBLEMA NA HORA DE CORRIGIR"
      >
        <Prose>
          <p>
            Esses são os problemas que a gente mais encontra em filmagem de produto. Quanto antes você identificar, melhor, porque alguns têm solução e outros você só consegue disfarçar.
          </p>
        </Prose>

        <ProblemsTable />

        <Note>
          Um ponto importante: esses problemas se somam. Um vermelho saturado em 8 bits, 4:2:0, com luz mista, é o pior cenário, porque a seleção quebra exatamente no lugar onde você mais precisa mexer.
        </Note>

      </EditorialSection>

      {/* ===================== PASSO A PASSO ===================== */}
      <EditorialSection
        id="passo-a-passo-no-resolve"
        kickerLeft="NA PRÁTICA"
        kickerRight="DAVINCI RESOLVE"
        title="NA PRÁTICA: A ANÁLISE PASSO A PASSO NO DAVINCI RESOLVE"
      >
        <Prose>
          <p>
            Bora pra prática. Esse é o roteiro que dá pra seguir toda vez que pegar um material de produto, antes de abrir a primeira roda de cor.
          </p>
        </Prose>
        <NumberedSteps
          items={[
            { title: 'Levante as informações de captação.', text: 'Câmera, perfil (S-Log3, F-Log, C-Log etc.), gamut, bits, amostragem, codec. Pergunte pra produção e confira nos metadados do clipe.' },
            { title: 'Configure a entrada de cor.', text: 'No Project Settings, em Color Management, ou com um nó de Color Space Transform, informe o log e o gamut da câmera e a saída em Rec.709 (ou o que for a entrega).' },
            { title: 'Faça uma conversão rápida pra olhar.', text: 'Com a imagem convertida, veja se a cor e o contraste fazem sentido. Se ficou leitosa ou esquisita, a entrada provavelmente está errada.' },
            { title: 'Leia os scopes.', text: 'No waveform, confira sombras, médios e altas luzes, e o que está clipado. Na parade, veja se algum canal estourou. No vectorscope, veja se os neutros estão no centro.' },
            { title: 'Ache um neutro ou a cartela.', text: 'Se tiver color checker, use. Se não, um branco ou cinza na cena serve de referência pro balanço de branco.' },
            { title: 'Compare o produto com a referência da marca.', text: 'Coloque a foto aprovada ou os valores da marca como still na galeria e use o wipe pra comparar.' },
            { title: 'Estique a imagem pra testar os limites.', text: 'Suba e desça a exposição, aumente a saturação e faça uma seleção rápida no produto. Assim você descobre onde aparecem banding, artefato, ruído e bordas serrilhadas.' },
            { title: 'Marque os planos problemáticos.', text: 'Use marcadores ou cores de clipe na timeline pra separar reflexos, estouros e variações de cor.' },
            { title: 'Confira a consistência entre planos.', text: 'Veja a timeline em Lightbox e repare se o produto muda de cor de um plano pro outro.' },
            { title: 'Converse com o cliente.', text: 'Leve o que é possível, o que é limitado e o que não dá pra fazer, antes de começar a colorir de fato.' },
          ]}
        />
      </EditorialSection>

      {/* ===================== CONCLUSÃO ===================== */}
      <EditorialSection
        id="conclusao-analise-produto"
        kickerLeft="RESUMO"
        kickerRight="ANTES DO LOOK"
        title="CONCLUSÃO"
      >
        <Prose>
          <p>
            A análise técnica mostra até onde dá pra chegar com o material. Quando você entende como a imagem foi construída no set, você sabe o que dá pra extrair dela, o que vai dar problema e o que simplesmente não existe no arquivo.
          </p>
          <p>
            No produto, isso pesa em dobro, porque a cor da marca não tem margem pra erro. Então, toda vez que pegar um material, para, analisa e conversa com o cliente antes de colorir. O look vem depois, tá?
          </p>
        </Prose>
      </EditorialSection>
    </article>
  );
}
