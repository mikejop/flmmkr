'use client';

import React from 'react';
import { CheckCircle2, Command } from 'lucide-react';
import {
  EditorialSection,
  TwoColumnText,
  ImageAndText,
  EditorialQuote,
  FullWidthImage,
} from './EditorialLayout';

export default function IntroducaoDaVinciArticle() {
  return (
    <article className="w-full text-[#111111] font-serif select-text leading-relaxed relative space-y-10">

      {/* ===================================================================
          SEÇÃO 1 — PRIMEIRO, VAMOS ENTENDER O DAVINCI RESOLVE
          =================================================================== */}
      <EditorialSection
        kickerLeft="FUNDAMENTOS · INTRODUÇÃO"
        kickerRight="VISÃO GERAL"
        title="PRIMEIRO, VAMOS ENTENDER O DAVINCI RESOLVE"
        subtitle="COMO O PROGRAMA ESTÁ ORGANIZADO E ONDE VOCÊ VAI TRABALHAR"
      >
        <FullWidthImage
          src="/assets/artigos/introducao-davinci/davinci-resolve.webp"
          alt="DaVinci Resolve"
          loading="eager"
          fetchPriority="high"
        />

        <TwoColumnText
          left={
            <>
              <p>
                Antes de começar a mexer na imagem, vamos entender um pouco como o DaVinci Resolve funciona. Principalmente se você ainda não está muito familiarizado com o programa, porque a interface pode parecer meio confusa no começo. Tem bastante coisa na tela e, principalmente, tem ferramenta pra caramba.
              </p>
              <p className="font-sans font-bold text-neutral-900 text-xl">
                E não precisa querer aprender tudo agora.
              </p>
              <p>
                O DaVinci Resolve tem um milhão de ferramentas. É impossível falar sobre todas elas em um curso. Então a ideia aqui é outra: você vai entender como o DaVinci Resolve está organizado e onde ficam as ferramentas que a gente vai usar no nosso trabalho de color grading.
              </p>
            </>
          }
          right={
            <>
              <p>
                O Resolve é dividido em diferentes páginas, e cada uma delas tem uma função dentro do processo de pós-produção. A Media, por exemplo, é onde você vai trabalhar com os arquivos do projeto, trazendo para dentro do programa os arquivos que estão no computador. Depois você tem as outras áreas do programa, cada uma voltada para uma etapa do trabalho.
              </p>
              <EditorialQuote
                quote="Mas, para o que a gente vai fazer aqui, a página que mais interessa é a Color. É nela que você vai passar a maior parte do tempo."
              />
              <p>
                Quando você abre a Color, vai encontrar a imagem, a timeline, a Gallery, os nodes, os scopes e todas aquelas ferramentas de correção na parte inferior. No começo pode parecer muita coisa, mas cada ferramenta tem uma função bem específica.
              </p>
            </>
          }
        />

        <div className="bg-[#f5f5f7] p-5 rounded-2xl border border-neutral-200 text-neutral-800 text-base font-serif italic text-center">
          “A ideia é você terminar essa parte olhando para a página Color e já sabendo onde está cada coisa e para que ela serve. Aí sim a gente começa a trabalhar a imagem.”
        </div>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 2 — A ABA COLOR
          =================================================================== */}
      <EditorialSection
        kickerLeft="FUNDAMENTOS"
        kickerRight="ESTRUTURA DA TELA"
        title="A ABA COLOR"
        subtitle="É AQUI QUE A IMAGEM COMEÇA A TOMAR FORMA"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/color-page.webp"
          imageAlt="Interface Principal da Página Color"
          imagePosition="left"
        >
          <p>
            Quando você chega à página Color do DaVinci Resolve, encontra um ambiente pensado especificamente para transformar e finalizar a imagem. Diferente da página Edit, onde a principal preocupação é organizar e montar o filme, aqui cada elemento da interface existe para permitir que você analise, controle e construa a aparência de cada plano.
          </p>
          <p>
            A imagem ocupa o centro da tela porque é ela que precisa ser observada o tempo inteiro. Na parte inferior, a timeline permite navegar pelo projeto e selecionar os planos. À esquerda, a Gallery reúne stills, referências e grades que podem ser reutilizadas ao longo do trabalho. À direita, os nodes mostram a estrutura da correção, tornando visível a ordem em que cada transformação acontece.
          </p>
          <p>
            Na parte inferior ficam as ferramentas que você vai usar para modificar a imagem: rodas de cor, curvas, seletores, qualifiers, janelas, tracking e uma série de outros recursos que permitem trabalhar desde uma simples correção de exposição até transformações muito mais complexas.
          </p>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 3 — OS NODES
          =================================================================== */}
      <EditorialSection
        kickerLeft="FUNDAMENTOS"
        kickerRight="FLUXO SEQUENCIAL"
        title="OS NODES"
        subtitle="A IMAGEM PASSA POR AQUI"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/NODES.webp"
          imageAlt="Node Graph no DaVinci Resolve"
          imagePosition="right"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                No DaVinci Resolve, o tratamento da imagem é construído por meio de uma sequência de nodes. Cada node recebe o sinal de imagem, aplica uma ou mais operações e envia o resultado para a etapa seguinte. Essa estrutura permite dividir o processo de correção e criação do look em partes independentes e organizadas.
              </p>
              <p>
                Um node pode ser responsável pelo gerenciamento de cor, outro pela exposição, outro pelo balanço de branco, outro pelo contraste e outros por ajustes específicos, como correções de pele, controle de saturação, recuperação de determinadas áreas ou construção do look. A combinação dessas etapas forma o node tree, que representa o percurso da imagem dentro do processo de color grading.
              </p>
            </div>
            <div className="space-y-3.5">
              <h4 className="font-sans font-bold text-lg text-neutral-900 tracking-tight not-italic">
                A ordem importa
              </h4>
              <p>
                As operações realizadas nos nodes acontecem na ordem em que estão conectadas. Uma alteração feita no início da cadeia modifica o sinal que será recebido pelos nodes seguintes. Por essa razão, a organização do node tree acompanha a lógica do processo de tratamento da imagem.
              </p>
              <p>
                Uma estrutura simples pode começar com a transformação do espaço de cor do material de origem, passar pelas correções primárias, seguir para ajustes secundários e terminar na construção do look e na transformação de saída. Cada etapa ocupa uma posição determinada dentro desse fluxo.
              </p>
              <p>
                Essa organização facilita a leitura do projeto e permite localizar com precisão cada intervenção feita na imagem.
              </p>
            </div>
          </div>
        </ImageAndText>

        <TwoColumnText
          className="pt-2"
          left={
            <>
              <h4 className="font-sans font-bold text-lg text-neutral-900 tracking-tight not-italic">
                Nodes seriais
              </h4>
              <p>
                O node serial é a estrutura mais básica e também a mais utilizada. O sinal passa por um node e segue diretamente para o próximo, formando uma cadeia contínua de processamento. É comum utilizar nodes seriais para separar funções do grading:
              </p>
            </>
          }
          right={
            <>
              <p>
                Também torna mais simples revisar uma correção, comparar versões, ajustar uma etapa específica e manter consistência entre os planos de uma sequência ao longo de todo o trabalho.
              </p>
            </>
          }
        />

        {/* ===================================================================
            GRÁFICO REALISTA DO NODE TREE DO DAVINCI RESOLVE
            =================================================================== */}
        <div 
          style={{ contain: 'layout paint' }}
          className="my-8 rounded-2xl bg-[#141416] border border-[#2b2b30] p-5 sm:p-7 shadow-md overflow-hidden select-none"
        >
          {/* Header estilo janela do DaVinci */}
          <div className="flex items-center justify-between pb-4 border-b border-[#232328] mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span className="font-mono text-xs font-semibold tracking-wider text-[#a1a1aa] uppercase">
                Node Graph · Serial Workflow
              </span>
            </div>
          </div>

          {/* Canvas interativo/scroll horizontal em telas menores */}
          <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-thin">
            <div className="flex items-center gap-3 sm:gap-4 min-w-[780px] justify-between py-2">
              
              {/* SOURCE / IN */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-[#71717a] mb-1 tracking-wider uppercase font-semibold">Source</span>
                <div className="w-9 h-9 rounded-xl bg-[#1e1e22] border-2 border-[#10b981] flex items-center justify-center shadow-lg relative group">
                  <div className="w-3 h-3 bg-[#10b981] rounded-xs rotate-45" />
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-[10px] font-mono text-[#a1a1aa] px-2 py-0.5 rounded whitespace-nowrap border border-white/10 pointer-events-none">
                    RGB Input
                  </span>
                </div>
              </div>

              {/* CONEXÃO IN -> NODE 01 COM FLECHA */}
              <div className="flex-1 flex items-center">
                <div className="h-[2px] w-full bg-[#10b981] relative flex items-center justify-end">
                  <span className="border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[#10b981] translate-x-[1px]" />
                </div>
              </div>

              {/* LISTA DE NODES SERIAIS */}
              {[
                { num: '01', title: 'Transformação', sub: 'de cor', desc: 'CST / IDT' },
                { num: '02', title: 'Exposição', sub: 'e balanço', desc: 'Primaries' },
                { num: '03', title: 'Contraste', sub: 'e saturação', desc: 'Curves' },
                { num: '04', title: 'Correções', sub: 'secundárias', desc: 'Qualifier / HSL' },
                { num: '05', title: 'Look', sub: 'criativo', desc: 'Tone & Palette' },
                { num: '06', title: 'Output', sub: 'final', desc: 'ODT / Rec.709' },
              ].map((node, index, arr) => (
                <React.Fragment key={node.num}>
                  {/* CARD DO NODE ESTILO DAVINCI */}
                  <div className="w-[110px] shrink-0 flex flex-col items-center group">
                    <div className="w-full bg-[#1e1e22] hover:bg-[#25252b] transition-all duration-200 rounded-xl border border-[#323238] hover:border-[#3b82f6] shadow-md p-2 relative">
                      {/* Portas de Entrada (Verde RGB / Azul Alpha) */}
                      <div className="absolute -left-1.5 top-3 w-2.5 h-2.5 bg-[#10b981] rounded-xs rotate-45 border border-[#141416]" title="RGB In" />
                      <div className="absolute -left-1.5 bottom-3 w-2 h-2 bg-[#3b82f6] rounded-full border border-[#141416]" title="Key/Alpha In" />

                      {/* Header do Node com Número */}
                      <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#28282e]">
                        <span className="font-mono text-[11px] font-bold text-amber-400/90 tracking-wide">
                          {node.num}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      </div>

                      {/* Thumbnail / Área central do Node */}
                      <div className="w-full h-10 rounded-md bg-[#161619] border border-[#26262b] flex flex-col items-center justify-center p-1 text-center mb-1.5">
                        <span className="font-sans text-[11px] font-semibold text-white leading-tight line-clamp-1">
                          {node.title}
                        </span>
                        <span className="font-sans text-[10px] text-[#9ca3af] leading-tight line-clamp-1">
                          {node.sub}
                        </span>
                      </div>

                      {/* Tag inferior */}
                      <div className="text-center">
                        <span className="font-mono text-[9px] text-[#71717a] uppercase tracking-wider block truncate">
                          {node.desc}
                        </span>
                      </div>

                      {/* Portas de Saída (Verde RGB / Azul Alpha) */}
                      <div className="absolute -right-1.5 top-3 w-2.5 h-2.5 bg-[#10b981] rounded-xs rotate-45 border border-[#141416]" title="RGB Out" />
                      <div className="absolute -right-1.5 bottom-3 w-2 h-2 bg-[#3b82f6] rounded-full border border-[#141416]" title="Key/Alpha Out" />
                    </div>

                    {/* Rótulo inferior */}
                    <span className="font-mono text-[10px] text-[#71717a] mt-2 font-medium">
                      Node {node.num}
                    </span>
                  </div>

                  {/* CABO DE LIGAÇÃO SERIAL COM FLECHA */}
                  {index < arr.length - 1 && (
                    <div className="flex-1 flex items-center">
                      <div className="h-[2px] w-full bg-[#10b981] relative flex items-center justify-end">
                        <span className="border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[#10b981] translate-x-[1px]" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}

              {/* CONEXÃO NODE 06 -> OUT COM FLECHA */}
              <div className="flex-1 flex items-center">
                <div className="h-[2px] w-full bg-[#10b981] relative flex items-center justify-end">
                  <span className="border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[#10b981] translate-x-[1px]" />
                </div>
              </div>

              {/* DESTINATION / OUT */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-[#71717a] mb-1 tracking-wider uppercase font-semibold">Output</span>
                <div className="w-9 h-9 rounded-xl bg-[#1e1e22] border-2 border-[#10b981] flex items-center justify-center shadow-lg relative group">
                  <div className="w-3 h-3 bg-[#10b981] rounded-xs rotate-45" />
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-[10px] font-mono text-[#a1a1aa] px-2 py-0.5 rounded whitespace-nowrap border border-white/10 pointer-events-none">
                    RGB Output
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Legenda técnica estilo DaVinci */}
          <div className="mt-4 pt-3 border-t border-[#232328] flex items-center gap-4 text-[11px] font-mono text-[#71717a]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#10b981] rounded-xs rotate-45" />
              Linha Verde: Sinal RGB de Imagem
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#3b82f6] rounded-full" />
              Ponto Azul: Key / Alpha Mask
            </span>
          </div>
        </div>

        <TwoColumnText
          className="pt-2"
          left={
            <>
              <p>
                Essa separação permite que cada etapa seja analisada individualmente e ajuda a manter o trabalho organizado durante todo o processo.
              </p>
              <EditorialQuote
                quote="O node tree é a estrutura que organiza o tratamento da imagem."
              />
            </>
          }
          right={
            <>
              <p>
                À medida que o trabalho se torna mais complexo, o Resolve oferece outras estruturas, como nodes paralelos, Layer Mixer, Splitter e Combiner. Cada uma delas altera a maneira como o sinal é distribuído e combinado dentro do node tree.
              </p>
              <p>
                O domínio dos nodes começa pela compreensão desse fluxo. Quando você sabe de onde o sinal vem, quais transformações já foram aplicadas e o que acontecerá nas etapas seguintes, o node tree deixa de ser apenas uma representação visual e passa a funcionar como o mapa do seu grading.
              </p>
            </>
          }
        />
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 4 — PRIMARIES
          =================================================================== */}
      <EditorialSection
        kickerLeft="FUNDAMENTOS"
        kickerRight="AJUSTE DE BASE"
        title="PRIMARIES"
        subtitle="ONDE A GENTE COMEÇA A CORRIGIR A IMAGEM"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/PRIMARIES.webp"
          imageAlt="Painel Primaries no DaVinci Resolve"
          imagePosition="left"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                As Primaries são o primeiro conjunto de ferramentas utilizado na construção da imagem dentro do processo de color grading. Elas permitem trabalhar a estrutura geral do plano, estabelecendo relações de exposição, contraste, balanço de cor e saturação antes das correções mais específicas.
              </p>
              <p>
                O objetivo dessa etapa é criar uma base sólida para a imagem. A partir dela, o colorista consegue equilibrar os planos, corrigir diferenças de exposição ou temperatura de cor e estabelecer uma reprodução mais próxima da intenção visual do projeto.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                No DaVinci Resolve, as ferramentas de primárias estão organizadas em diferentes modos de controle, cada um com uma forma específica de atuar sobre a imagem. Color Wheels, Primary Bars e Log Wheels oferecem maneiras diferentes de controlar as regiões tonais e cromáticas, permitindo escolher a abordagem mais adequada para cada situação.
              </p>
              <p>
                O trabalho com primárias exige uma leitura constante da imagem. Antes de buscar um look, é preciso entender como a luz está distribuída, onde estão as sombras, os tons médios e as altas luzes, como as cores estão se relacionando e quais características do material precisam ser preservadas ou ajustadas.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 5 — COLOR WHEELS
          =================================================================== */}
      <EditorialSection
        kickerLeft="PRIMÁRIAS"
        kickerRight="RODAS CROMÁTICAS"
        title="COLOR WHEELS"
        subtitle="LIFT, GAMMA, GAIN E OFFSET"
      >
        <FullWidthImage
          src="/assets/artigos/introducao-davinci/COLOR WHEELS.webp"
          alt="Painel das Color Wheels no DaVinci Resolve"
        />

        <TwoColumnText
          className="pt-2"
          left={
            <>
              <p>
                As Color Wheels são uma das principais interfaces de controle das Primaries no DaVinci Resolve. Elas permitem trabalhar simultaneamente a luminância e a crominância de diferentes regiões da escala tonal, oferecendo uma forma visual e intuitiva de construir o equilíbrio da imagem.
              </p>
              <p>
                As rodas são divididas em áreas tonais. Essa separação permite fazer alterações direcionadas às sombras, aos tons médios e às altas luzes, enquanto o controle global atua sobre toda a imagem. Ao deslocar o ponto dentro de uma roda, você modifica a distribuição de cor daquela região tonal. Ao alterar seu nível, controla a quantidade de luz presente nela.
              </p>
              <p>
                O valor das Color Wheels está justamente na possibilidade de trabalhar cor e luminância de forma relacionada, observando como uma alteração em uma região da escala tonal afeta a percepção geral da imagem.
              </p>
            </>
          }
          right={
            <>
              <p>
                Esse comportamento torna as Color Wheels especialmente úteis para estabelecer o balanço cromático e a estrutura tonal de um plano. Uma pequena alteração nas sombras, por exemplo, pode mudar a sensação de temperatura da cena sem interferir da mesma maneira nas altas luzes. Da mesma forma, um ajuste nos tons médios pode modificar a reprodução de pele e outros elementos importantes sem necessariamente alterar todo o quadro.
              </p>
              <p>
                No processo de grading, elas são usadas tanto para correções técnicas quanto para decisões estéticas. O mesmo controle que pode neutralizar uma dominante de cor também pode ser utilizado para criar relações cromáticas deliberadas entre sombras, médios e altas luzes.
              </p>
            </>
          }
        />
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 6 — LOG WHEELS
          =================================================================== */}
      <EditorialSection
        kickerLeft="PRIMÁRIAS"
        kickerRight="CONTROLE CIRÚRGICO"
        title="LOG WHEELS"
        subtitle="SHADOW, MIDTONE E HIGHLIGHT"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/LOG WHEELS.webp"
          imageAlt="Painel das Log Wheels no DaVinci Resolve"
          imagePosition="left"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                As Log Wheels permitem trabalhar regiões mais específicas da escala tonal. Em comparação com as Color Wheels tradicionais, suas faixas de atuação são mais estreitas e definidas, possibilitando realizar ajustes com maior isolamento entre sombras, tons médios e altas luzes.
              </p>
              <p>
                Essa característica é especialmente útil quando uma determinada região da imagem precisa ser modificada sem provocar alterações perceptíveis nas regiões vizinhas.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                O colorista pode, por exemplo, trabalhar uma faixa de sombras mantendo os tons médios mais estáveis, ou ajustar uma área de altas luzes sem interferir da mesma maneira no restante da imagem.
              </p>
              <p>
                As Log Wheels são particularmente importantes em etapas de refinamento. Depois de estabelecer a estrutura geral do plano com as ferramentas primárias, elas permitem fazer ajustes mais precisos dentro dessa estrutura, controlando de maneira mais localizada a relação entre luminância e cor.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 7 — HDR
          =================================================================== */}
      <EditorialSection
        kickerLeft="FERRAMENTAS ESPECÍFICAS"
        kickerRight="ALTA PRECISÃO"
        title="HDR"
        subtitle="QUANDO O AJUSTE PRECISA SER AINDA MAIS CIRÚRGICO"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/HDR.webp"
          imageAlt="Painel HDR Palette com zonas zonais"
          imagePosition="right"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                A ferramenta HDR do DaVinci Resolve permite controlar a imagem por meio de uma divisão mais precisa da faixa tonal. Em vez de trabalhar apenas com grandes grupos como sombras, médios e altas luzes, o HDR Palette oferece uma série de zonas tonais que podem ser ajustadas de forma independente.
              </p>
              <p>
                Essa organização permite separar com maior precisão regiões como Black, Dark, Shadow, Light, Highlight e Specular, além do Global, que atua sobre toda a imagem. Cada zona possui controles próprios de luminância e cor, permitindo modificar uma determinada faixa tonal sem alterar de maneira significativa as áreas adjacentes.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                A principal vantagem está na capacidade de refinar a estrutura da imagem. É possível, por exemplo, recuperar ou aprofundar determinadas regiões das sombras, controlar a densidade dos médios, trabalhar as altas luzes ou preservar detalhes especulares enquanto outras partes do quadro são modificadas.
              </p>
              <p>
                A ferramenta também oferece controles específicos de Exposure, Contrast e Saturation para essas regiões, tornando o ajuste mais preciso e permitindo construir transições tonais mais suaves.
              </p>
              <p>
                No fluxo de trabalho, o HDR pode ser utilizado tanto para correções quanto para decisões estéticas, especialmente quando é necessário controlar a distribuição da luz com maior precisão.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 8 — RGB MIXER
          =================================================================== */}
      <EditorialSection
        kickerLeft="FERRAMENTAS ESPECÍFICAS"
        kickerRight="CANAIS DE COR"
        title="RGB MIXER"
        subtitle="ISOLANDO OS CANAIS VERMELHO, VERDE E AZUL"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/RGB MIXER.webp"
          imageAlt="RGB Mixer no DaVinci Resolve"
          imagePosition="left"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                O RGB Mixer permite controlar como os canais Red, Green e Blue contribuem para cada canal de saída da imagem. Em vez de trabalhar diretamente sobre as regiões tonais, como nas Color Wheels, ele atua sobre a relação entre os próprios canais RGB.
              </p>
              <p>
                Na prática, cada canal de saída possui uma combinação dos três canais de entrada. Ao alterar essas proporções, você pode modificar a maneira como a informação de cor é distribuída pela imagem, criando mudanças de matiz, saturação e separação cromática.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                Isso torna o RGB Mixer uma ferramenta muito útil para ajustes de balanço, manipulação cromática e criação de looks. Ele também permite explorar técnicas como a mistura entre canais e o tratamento de uma imagem monocromática a partir da contribuição específica de cada canal.
              </p>
              <p>
                Por trabalhar diretamente com a estrutura RGB do sinal, pequenas alterações podem produzir mudanças bastante amplas na aparência da imagem. Por isso, seu uso costuma estar relacionado a decisões mais específicas dentro do node tree.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 9 — CURVES
          =================================================================== */}
      <EditorialSection
        kickerLeft="FERRAMENTAS ESPECÍFICAS"
        kickerRight="CURVAS DE CORREÇÃO"
        title="CURVES"
        subtitle="CONTRASTE, MATIZ E SATURAÇÃO"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/CURVES.webp"
          imageAlt="Curvas Custom e Curvas HSL no DaVinci Resolve"
          imagePosition="right"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                As Curves permitem modificar a relação entre os valores de entrada e os valores de saída da imagem por meio de uma representação gráfica. O eixo horizontal mostra o valor original e o eixo vertical mostra o resultado depois do ajuste. A partir dessa relação, é possível controlar com grande precisão a luminância e a informação cromática.
              </p>
              <p>
                Na Custom Curve, por exemplo, a diagonal representa a relação original entre entrada e saída. Ao adicionar pontos e deslocá-los, você pode alterar regiões específicas da escala tonal. Isso permite construir contrastes com muito controle, comprimir ou expandir determinadas zonas e criar transições mais suaves entre sombras, tons médios e altas luzes.
              </p>
              <p>
                As curvas também podem trabalhar diretamente sobre os canais RGB, permitindo modificar individualmente a contribuição de vermelho, verde e azul e realizar ajustes cromáticos com grande precisão.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                O DaVinci Resolve amplia esse conceito com curvas que relacionam diferentes propriedades da imagem, como Hue vs Hue, Hue vs Saturation, Hue vs Luminance, Luminance vs Saturation e Saturation vs Saturation. Essas ferramentas permitem selecionar uma característica da imagem e alterar outra a partir dela. Uma determinada faixa de matiz pode ter sua saturação reduzida, uma cor pode ser deslocada para outra ou uma região de luminância pode receber um tratamento específico.
              </p>
              <p>
                Esse conjunto de ferramentas faz das Curves um dos recursos mais precisos para refinar a estrutura tonal e cromática da imagem. Elas podem participar tanto da construção das primárias quanto das correções seletivas e da criação do look.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 10 — QUALIFIER
          =================================================================== */}
      <EditorialSection
        kickerLeft="ISOLAMENTO"
        kickerRight="SELEÇÃO POR COR"
        title="QUALIFIER"
        subtitle="SELECIONANDO PELA COR DA IMAGEM"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/QUALIFIER.webp"
          imageAlt="Qualifier no DaVinci Resolve"
          imagePosition="left"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                O Qualifier é uma ferramenta de seleção que permite isolar partes da imagem a partir de características específicas da cor e da luminância. A seleção pode ser construída utilizando Hue, Saturation e Luminance, definindo com precisão quais valores serão incluídos ou excluídos da área selecionada.
              </p>
              <p>
                A partir dessa seleção, o ajuste realizado no node pode afetar apenas aquela região da imagem. Isso permite trabalhar uma cor, um objeto ou uma faixa tonal de maneira independente do restante do quadro.
              </p>
              <p>
                Em uma correção de pele, por exemplo, o Qualifier pode ser utilizado para selecionar os tons correspondentes à pele e, a partir dessa seleção, ajustar temperatura, matiz, saturação ou luminância.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                O mesmo princípio pode ser aplicado a produtos, roupas, cenários e outras áreas que possuam características cromáticas bem definidas.
              </p>
              <p>
                A qualidade da seleção depende da precisão dos parâmetros utilizados e da própria imagem. Por isso, o Resolve oferece ferramentas como Matte Finesse, Denoise, Blur Radius e Clean Black / Clean White, que ajudam a refinar o matte e controlar as transições da seleção.
              </p>
              <p>
                O Qualifier ocupa um papel importante nas correções secundárias, quando a imagem já possui uma base estabelecida e determinadas áreas precisam receber tratamentos diferentes.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 11 — POWER WINDOWS
          =================================================================== */}
      <EditorialSection
        kickerLeft="ISOLAMENTO"
        kickerRight="MÁSCARAS VETORIAIS"
        title="POWER WINDOWS"
        subtitle="MÁSCARAS GEOMÉTRICAS E VETORIAIS"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/POWER WINDOWS.webp"
          imageAlt="Power Windows no DaVinci: Linear, Circular e Polígono"
          imagePosition="right"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                As Power Windows são ferramentas de seleção espacial que permitem definir uma área específica do quadro para receber um tratamento independente. Diferentemente de uma seleção baseada apenas em cor, a Power Window utiliza a posição e a forma dentro da imagem para determinar onde o ajuste será aplicado.
              </p>
              <p>
                O DaVinci Resolve oferece diferentes formas geométricas, como círculos, quadrados, polígonos e curvas personalizadas, que podem ser combinadas para acompanhar a estrutura de um objeto ou de uma cena. A seleção também pode receber ajustes de feather, permitindo criar transições suaves entre a área afetada e o restante da imagem.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                Elas são utilizadas para direcionar a atenção, equilibrar a luminosidade e criar separação entre elementos. Um rosto pode receber uma pequena compensação de exposição, o fundo pode ser reduzido para ganhar profundidade ou uma área específica do produto pode receber um tratamento diferente do restante do quadro.
              </p>
              <p>
                Quando o elemento se movimenta, o Tracker permite acompanhar seu deslocamento ao longo do plano. Combinadas ao Qualifier e controles de cor, formam a base de correções secundárias com alta precisão espacial.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 12 — TRACKER
          =================================================================== */}
      <EditorialSection
        kickerLeft="AUTOMAÇÃO"
        kickerRight="TRACKING DE MOVIMENTO"
        title="TRACKER"
        subtitle="ACOMPANHANDO O MOVIMENTO DO OBJETO"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/TRACKER.webp"
          imageAlt="Painel Tracker no DaVinci Resolve"
          imagePosition="left"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                O Tracker é a ferramenta responsável por acompanhar o movimento de elementos dentro do plano. Ele analisa o deslocamento, a escala e a perspectiva de uma determinada área da imagem e utiliza essas informações para fazer com que uma correção acompanhe esse movimento ao longo do tempo.
              </p>
              <p>
                No color grading, isso permite manter uma Power Window, um ponto de correção ou outro elemento de seleção associado ao objeto que está se deslocando. Em vez de reposicionar manualmente a área em cada quadro, o Tracker calcula o movimento do elemento e reproduz esse deslocamento dentro do node.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                O Tracker é especialmente útil em planos com movimento de câmera ou de elementos dentro da cena. Pode acompanhar, por exemplo, o rosto de uma pessoa, um produto em movimento ou uma região específica do enquadramento que precisa receber uma correção localizada.
              </p>
              <p>
                O resultado do tracking depende da informação visual disponível no elemento acompanhado. Áreas com contraste, textura e características visuais bem definidas tendem a oferecer informações mais consistentes para o rastreamento. Quando necessário, o resultado pode ser ajustado manualmente para corrigir pequenas imprecisões.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 13 — MAGIC MASK
          =================================================================== */}
      <EditorialSection
        kickerLeft="RECURSO STUDIO"
        kickerRight="INTELIGÊNCIA ARTIFICIAL"
        title="MAGIC MASK"
        subtitle="SELEÇÃO AUTOMÁTICA POR INTELIGÊNCIA ARTIFICIAL"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/MAGIC MASK.webp"
          imageAlt="Magic Mask com DaVinci Neural Engine"
          imagePosition="right"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                O Magic Mask é uma ferramenta de seleção baseada em inteligência artificial que permite isolar pessoas, objetos e elementos específicos da imagem. A partir de uma indicação feita pelo usuário, o DaVinci Resolve identifica o elemento selecionado e gera uma máscara que pode ser utilizada para aplicar correções de forma independente.
              </p>
              <p>
                Essa seleção permite trabalhar características específicas de um elemento sem precisar construir manualmente toda a máscara. Uma pessoa pode receber um ajuste de exposição, um produto pode ter sua cor modificada ou um objeto pode ser separado do fundo para receber um tratamento diferente.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                Depois de criada a seleção, o Magic Mask pode acompanhar o elemento ao longo do plano, mantendo a máscara conforme o movimento acontece. O resultado pode ser refinado para melhorar a definição das bordas e reduzir áreas que tenham sido incluídas ou excluídas incorretamente.
              </p>
              <p>
                Dentro do fluxo de color grading, o Magic Mask é especialmente útil quando a separação entre elementos seria trabalhosa utilizando apenas ferramentas tradicionais. Ele amplia as possibilidades das correções secundárias e permite trabalhar objetos complexos diretamente dentro do node tree.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 14 — BLUR E SHARPEN
          =================================================================== */}
      <EditorialSection
        kickerLeft="TRATAMENTO ÓPTICO"
        kickerRight="NITIDEZ E TEXTURA"
        title="BLUR E SHARPEN"
        subtitle="NITIDEZ, TEXTURA E DESFOQUE"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/BLUR E SHARPEN.webp"
          imageAlt="Blur e Sharpen no DaVinci Resolve"
          imagePosition="left"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                Blur e Sharpen controlam a percepção de definição e suavidade da imagem. Enquanto o Blur reduz a definição dos detalhes, o Sharpen aumenta a percepção de nitidez ao reforçar informações de alta frequência.
              </p>
              <p>
                O Blur pode ser utilizado para suavizar detalhes, reduzir a aparência de pequenas imperfeições ou controlar a definição de uma área específica do plano.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                Em conjunto com máscaras e seleções, também permite criar diferenças de foco aparente entre elementos do quadro. O Sharpen atua reforçando contornos e detalhes, aumentando a sensação de definição. Seu uso exige controle, especialmente em imagens com ruído ou compressão.
              </p>
              <p>
                Dentro do color grading, esses controles participam principalmente do refinamento da textura e da percepção de detalhe. A quantidade de definição aplicada influencia diretamente a aparência de materiais, pele e objetos, além da relação visual entre primeiro plano e fundo.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 15 — KEY
          =================================================================== */}
      <EditorialSection
        kickerLeft="CONTROLE DE FLUXO"
        kickerRight="OPACIDADE E MÁSCARA"
        title="KEY"
        subtitle="A OPACIDADE DO SEU NODE"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/KEY.webp"
          imageAlt="Painel Key no DaVinci Resolve"
          imagePosition="right"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                O Key controla a intensidade e o comportamento das informações de máscara, ou key, utilizadas dentro dos nodes. Essas informações determinam quanto de uma correção será aplicado à imagem e podem ser geradas por ferramentas como Qualifier, Power Windows e Magic Mask.
              </p>
              <p>
                Na paleta Key, o colorista consegue ajustar com precisão a força da seleção que entra no node e a força da saída desse node.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                O Key Output Gain, por exemplo, controla a intensidade com que a correção daquele node participa do resultado final. Um valor menor reduz a influência da intervenção sem alterar os parâmetros que foram utilizados para construí-la.
              </p>
              <p>
                Esse controle é fundamental em correções secundárias: depois de criar uma seleção precisa, você ajusta sua influência para que o ajuste se integre perfeitamente à imagem. A mesma lógica se aplica quando diferentes nodes são combinados em estruturas paralelas ou em um Layer Mixer.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 16 — SIZING
          =================================================================== */}
      <EditorialSection
        kickerLeft="ENQUADRAMENTO"
        kickerRight="GEOMETRIA"
        title="SIZING"
        subtitle="REPOSICIONANDO A IMAGEM"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/SIZING.webp"
          imageAlt="Painel Sizing do DaVinci Resolve"
          imagePosition="left"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                O Sizing reúne os controles responsáveis pela geometria e pelo enquadramento da imagem dentro do DaVinci Resolve. A ferramenta permite alterar a posição, escala, rotação e proporção do plano, além de controlar parâmetros relacionados ao enquadramento.
              </p>
              <p>
                Esses ajustes são realizados diretamente sobre a imagem e podem ser utilizados para corrigir pequenos problemas de enquadramento, reposicionar elementos, ajustar a escala do plano ou preparar diferentes versões de uma mesma imagem.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                O Sizing também pode participar do processo de finalização quando o projeto exige alterações de formato, reenquadramentos ou adaptações para diferentes proporções de tela.
              </p>
              <p>
                Como esses parâmetros fazem parte do processamento da imagem, sua posição dentro do fluxo de trabalho deve ser considerada de acordo com a função que o ajuste desempenha.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 17 — SCOPES
          =================================================================== */}
      <EditorialSection
        kickerLeft="CALIBRAÇÃO E TÉCNICA"
        kickerRight="MONITORAMENTO DO SINAL"
        title="SCOPES"
        subtitle="NÃO CONFIE SÓ NO SEU OLHO"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/SCOPES.webp"
          imageAlt="Scopes de Sinal: Waveform, Parade e Vectorscope"
          imagePosition="right"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                Os Scopes são ferramentas de análise que representam matematicamente as características do sinal de vídeo. Eles permitem avaliar informações de luminância, distribuição de cor, saturação e relação entre os canais RGB, oferecendo uma referência objetiva para as decisões de color grading.
              </p>
              <p>
                Enquanto a imagem na tela mostra como o plano é percebido visualmente, os Scopes mostram como o sinal está distribuído. Essa leitura é indispensável para avaliar exposição e consistência.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                O DaVinci Resolve oferece diferentes tipos de Scopes: Waveform, Parade, Vectorscope e Histogram apresentam a mesma imagem sob perspectivas complementares e, em conjunto, permitem compreender com máxima precisão o comportamento da cor e da luz.
              </p>
              <p>
                Eles também são essenciais para comparar planos. Ao analisar duas imagens lado a lado, é possível identificar diferenças de balanço, contraste ou níveis de preto e branco que seriam difíceis de detectar apenas olhando o monitor.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 18 — SPLIT SCREEN
          =================================================================== */}
      <EditorialSection
        kickerLeft="CONSISTÊNCIA CROMÁTICA"
        kickerRight="COMPARAÇÃO DIRETA"
        title="SPLIT SCREEN"
        subtitle="COMPARANDO CLIPES LADO A LADO"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/SPLIT SCREEN.webp"
          imageAlt="Split Screen no DaVinci Resolve"
          imagePosition="left"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                O Split Screen é uma ferramenta de comparação dentro da página Color. Ele permite visualizar duas ou mais imagens simultaneamente no Viewer, facilitando a análise das diferenças entre planos, versões ou referências.
              </p>
              <p>
                Durante o color grading, a comparação é fundamental para manter continuidade e consistência entre tomadas vizinhas.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                Um plano pode parecer equilibrado quando visto isoladamente, mas revelar diferenças evidentes de exposição, contraste, saturação ou temperatura quando colocado lado a lado com outro plano da mesma sequência.
              </p>
              <p>
                O Split Screen também é utilizado para comparar o resultado atual com referências, testar versões do mesmo plano ou analisar múltiplos frames simultaneamente. Assim, o colorista avalia a imagem dentro do contexto real da narrativa.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 19 — GALLERY
          =================================================================== */}
      <EditorialSection
        kickerLeft="MEMÓRIA VISUAL"
        kickerRight="STILLS E REFERÊNCIAS"
        title="GALLERY"
        subtitle="GUARDANDO REFERÊNCIAS E COPIANDO TRATAMENTOS"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/GALLERY.webp"
          imageAlt="Gallery do DaVinci Resolve com Stills"
          imagePosition="right"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6]">
            <div className="space-y-3.5">
              <p>
                A Gallery reúne as referências visuais e os tratamentos de cor salvos durante o trabalho. Nela, o colorista pode guardar stills dos planos, comparar diferentes versões e reutilizar grades em outros planos ou projetos.
              </p>
              <p>
                Durante o grading, a Gallery funciona como uma memória visual do projeto. Um frame pode ser salvo como referência de uma determinada cena, de uma correção ou de um look e permanecer disponível para comparação enquanto outros planos são trabalhados. Isso facilita o processo de matching, principalmente quando diferentes planos precisam manter a mesma relação de cor e contraste.
              </p>
            </div>
            <div className="space-y-3.5">
              <p>
                Os stills também podem ser organizados em álbuns e utilizados para copiar tratamentos entre planos. O PowerGrade amplia essa possibilidade, permitindo manter grades e estruturas de nodes disponíveis para outros projetos dentro da mesma biblioteca.
              </p>
              <p>
                A Gallery, portanto, participa diretamente do processo de construção e continuidade da imagem. Ela permite que o colorista tenha referências concretas ao longo do trabalho e mantenha um registro das decisões tomadas durante o grading.
              </p>
            </div>
          </div>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 20 — COLOR MATCH
          =================================================================== */}
      <EditorialSection
        kickerLeft="TÉCNICA DE CALIBRAÇÃO"
        kickerRight="EQUALIZAÇÃO DE CÂMERAS"
        title="COLOR MATCH"
        subtitle="DEIXANDO AS CÂMERAS NO MESMO PONTO DE PARTIDA"
      >
        <ImageAndText
          imageSrc="/assets/artigos/introducao-davinci/COLOR MATCH.webp"
          imageAlt="Color Match no DaVinci Resolve"
          imagePosition="left"
        >
          <p>
            Quando você trabalha com duas ou três câmeras diferentes na mesma gravação, cada sensor tem uma resposta de cor particular. O Color Match utiliza cartelas de cor padronizadas (<strong className="font-sans text-neutral-900">ColorChecker</strong>) filmadas no set para fazer o alinhamento técnico inicial.
          </p>
          <EditorialQuote
            quote="Primeiro você iguala todo mundo. Depois você cria o estilo do filme."
          />
          <p>
            Você encaixa o grid da cartela sobre o ColorChecker na tela e o Resolve calibra as cores automaticamente para um espaço cromático de referência. Com todas as câmeras equalizadas na mesma base neutra, a etapa artística do Creative Grade flui com muito mais coerência.
          </p>
        </ImageAndText>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 21 — ATALHOS QUE VOCÊ PRECISA COMEÇAR A USAR
          =================================================================== */}
      <EditorialSection
        kickerLeft="PRODUTIVIDADE"
        kickerRight="TECLADO DO COLORISTA"
        title="ATALHOS QUE VOCÊ PRECISA COMEÇAR A USAR"
        subtitle="ACELERE SEU FLUXO DE TRABALHO NO DIA A DIA"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 font-serif text-[16px] sm:text-[17px] text-neutral-800 leading-[1.6] mb-10">
          <div className="space-y-3.5">
            <p>
              O trabalho de color grading envolve centenas de pequenas ações repetidas ao longo de um projeto. Criar nodes, navegar entre planos, comparar imagens, ativar máscaras, salvar referências e verificar o resultado são operações que aparecem continuamente durante uma sessão de grading.
            </p>
          </div>
          <div className="space-y-3.5">
            <p>
              Os atalhos permitem manter o fluxo de trabalho concentrado na imagem e reduzir a quantidade de movimentos entre teclado, mouse e interface. Alguns deles passam a fazer parte da rotina desde os primeiros projetos.
            </p>
            <p className="text-base text-neutral-600">
              A lista abaixo reúne os atalhos mais importantes para trabalhar na página Color do DaVinci Resolve. O Resolve permite personalizar praticamente todos os comandos pelo <em>Keyboard Customization</em>, portanto a combinação pode variar caso o teclado tenha sido modificado.
            </p>
          </div>
        </div>

        {/* Tabelas de Atalhos Organizadas */}
        <div className="space-y-8 max-w-4xl font-sans not-italic">
          {/* NAVEGAÇÃO E REPRODUÇÃO */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
            <div className="bg-neutral-100/75 px-5 py-3 border-b border-neutral-200/80">
              <h4 className="text-xs font-bold tracking-widest text-neutral-700 uppercase">Navegação e Reprodução</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200/60 text-neutral-500 font-medium text-xs bg-neutral-50/50">
                    <th className="py-2.5 px-5">Comando</th>
                    <th className="py-2.5 px-5 w-40">macOS</th>
                    <th className="py-2.5 px-5 w-40">Windows</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Página Color</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Shift + 6</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Shift + 6</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Reproduzir / Pausar</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Space</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Space</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Reproduzir para frente</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">L</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">L</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Reproduzir para trás</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">J</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">J</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Pausar</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">K</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">K</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Próximo frame</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">→</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">→</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Frame anterior</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">←</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">←</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Próximo clip</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">↓</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">↓</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Clip anterior</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">↑</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">↑</kbd></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* NODES */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
            <div className="bg-neutral-100/75 px-5 py-3 border-b border-neutral-200/80">
              <h4 className="text-xs font-bold tracking-widest text-neutral-700 uppercase">Nodes</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200/60 text-neutral-500 font-medium text-xs bg-neutral-50/50">
                    <th className="py-2.5 px-5">Comando</th>
                    <th className="py-2.5 px-5 w-48">macOS</th>
                    <th className="py-2.5 px-5 w-48">Windows</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Adicionar Serial Node</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Option + S</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Alt + S</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Adicionar Serial Node antes do atual</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Option + Shift + S</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Alt + Shift + S</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Adicionar Parallel Node</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Option + P</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Alt + P</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Adicionar Layer Node</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Option + L</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Alt + L</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Adicionar Outside Node</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Option + O</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Alt + O</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Adicionar Splitter / Combiner</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Option + Y</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Alt + Y</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Ativar / desativar node selecionado</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Command + D</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Ctrl + D</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Desativar todos os grades</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Shift + D</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Shift + D</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Resetar o node selecionado</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Shift + Home</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Shift + Home</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Resetar todo o grade</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Command + Shift + Home</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Ctrl + Shift + Home</kbd></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-neutral-50/70 border-t border-neutral-200/60 font-serif text-sm text-neutral-600">
              Os atalhos para criação e controle de nodes são particularmente importantes porque a estrutura do node tree acompanha praticamente todo o processo de construção da imagem.
            </div>
          </div>

          {/* ANÁLISE E COMPARAÇÃO */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
            <div className="bg-neutral-100/75 px-5 py-3 border-b border-neutral-200/80">
              <h4 className="text-xs font-bold tracking-widest text-neutral-700 uppercase">Análise e Comparação</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200/60 text-neutral-500 font-medium text-xs bg-neutral-50/50">
                    <th className="py-2.5 px-5">Comando</th>
                    <th className="py-2.5 px-5 w-48">macOS</th>
                    <th className="py-2.5 px-5 w-48">Windows</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Highlight / visualizar máscara</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Shift + H</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Shift + H</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Wipe de referência</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Command + W</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Ctrl + W</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Inverter Wipe</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Option + W</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Alt + W</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Bypass de todos os grades</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Shift + D</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Shift + D</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Desfazer</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Command + Z</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Ctrl + Z</kbd></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-medium">Refazer</td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Command + Shift + Z</kbd></td>
                    <td className="py-2.5 px-5"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">Ctrl + Shift + Z</kbd></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-neutral-50/70 border-t border-neutral-200/60 font-serif text-sm text-neutral-600">
              O <strong>Shift + H</strong> merece atenção especial: ele permite visualizar a área selecionada por qualifiers e máscaras, tornando a avaliação da seleção muito mais rápida e precisa.
            </div>
          </div>

          {/* GALLERY E STILLS & VERSIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-neutral-100/75 px-5 py-3 border-b border-neutral-200/80">
                  <h4 className="text-xs font-bold tracking-widest text-neutral-700 uppercase">Gallery e Stills</h4>
                </div>
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-neutral-100 text-neutral-800">
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Capturar Still</td>
                      <td className="py-2.5 px-4 text-right"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">⌥⌘G / Ctrl+Alt+G</kbd></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Próximo Still</td>
                      <td className="py-2.5 px-4 text-right"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">⌥⌘N / Ctrl+Alt+N</kbd></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Still anterior</td>
                      <td className="py-2.5 px-4 text-right"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">⌥⌘B / Ctrl+Alt+B</kbd></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Wipe do Still</td>
                      <td className="py-2.5 px-4 text-right"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">⌘W / Ctrl+W</kbd></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3.5 bg-neutral-50/70 border-t border-neutral-200/60 font-serif text-xs text-neutral-600">
                Stills e memórias podem ser associados a atalhos personalizados, acelerando comparações e aplicação repetida de grades.
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-neutral-100/75 px-5 py-3 border-b border-neutral-200/80">
                  <h4 className="text-xs font-bold tracking-widest text-neutral-700 uppercase">Versions</h4>
                </div>
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-neutral-100 text-neutral-800">
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Nova Version</td>
                      <td className="py-2.5 px-4 text-right"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">⌘Y / Ctrl+Y</kbd></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Voltar para Default Version</td>
                      <td className="py-2.5 px-4 text-right"><kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs">⌘U / Ctrl+U</kbd></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3.5 bg-neutral-50/70 border-t border-neutral-200/60 font-serif text-xs text-neutral-600">
                Versions permitem testar caminhos criativos alternativos no mesmo clipe sem perder o tratamento base anterior.
              </div>
            </div>
          </div>

          {/* UMA REGRA SIMPLES */}
          <div className="mt-10 p-6 md:p-8 rounded-2xl bg-neutral-100/70 border border-neutral-200">
            <h4 className="text-xs font-bold tracking-widest text-neutral-500 uppercase mb-4">Uma Regra Simples</h4>
            <p className="font-serif text-lg text-neutral-800 leading-relaxed mb-4">
              Aprenda primeiro os atalhos que correspondem às ações que você repete o tempo inteiro:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-sans mb-6">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs shrink-0">Option + S</kbd>
                <span className="text-neutral-700">para criar nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs shrink-0">Command + D</kbd>
                <span className="text-neutral-700">para verificar um node isoladamente</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs shrink-0">Shift + D</kbd>
                <span className="text-neutral-700">para comparar o grade com o original</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs shrink-0">Shift + H</kbd>
                <span className="text-neutral-700">para visualizar máscaras</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs shrink-0">Command + W</kbd>
                <span className="text-neutral-700">para comparar referências</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs shrink-0">⌥ + ⌘ + G</kbd>
                <span className="text-neutral-700">para salvar um Still</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <kbd className="px-2 py-1 rounded bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs shrink-0">J / K / L</kbd>
                <span className="text-neutral-700">para navegar pelo material na timeline</span>
              </div>
            </div>
            <p className="font-serif text-base text-neutral-700 leading-relaxed border-t border-neutral-200 pt-4">
              Depois que essas combinações passam a fazer parte da memória muscular, a interface começa a desaparecer do processo. Você consegue permanecer muito mais tempo olhando para a imagem e tomando decisões sobre ela.
            </p>
          </div>
        </div>
      </EditorialSection>

    </article>
  );
}
