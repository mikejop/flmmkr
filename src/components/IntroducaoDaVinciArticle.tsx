'use client';

import React from 'react';
import { CheckCircle2, Command } from 'lucide-react';
import {
  EditorialSection,
  TwoColumnText,
  ImageAndText,
  EditorialQuote,
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
          imageAlt="Interface Principal da Página Color"
          caption="Visor central, timeline de clipes, grafo de nodes e painel de primárias"
          imagePosition="left"
        >
          <p>
            Quando você entra na página Color, a primeira coisa que precisa entender é como aquela tela está organizada. Você tem a imagem no centro, a timeline embaixo, os nodes à direita, a Gallery à esquerda e, na parte inferior, as ferramentas de correção.
          </p>
          <EditorialQuote
            quote="O colorista, ele trabalha praticamente na aba Color."
          />
          <p>
            E não precisa ficar assustado com a quantidade de coisa que aparece. O Resolve tem um milhão de ferramentas, mas aqui você vai dominar exatamente aquelas que transformam o visual do seu filme.
          </p>
          <p className="font-sans font-bold text-neutral-900 text-lg">
            Então vamos entender o que realmente importa.
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
        <TwoColumnText
          left={
            <>
              <p>
                Os nodes funcionam de um jeito muito simples. A imagem entra por um lado, você faz uma alteração e manda essa alteração para o próximo node. Depois você faz outra alteração, manda para o próximo, e assim por diante.
              </p>
              <EditorialQuote
                quote="O node é como se fosse uma camada, só que ele funciona de um jeito um pouco diferente."
              />
              <p>
                Em vez de empilhar tudo no mesmo lugar, você vai construindo o tratamento da imagem em etapas organizadas.
              </p>
            </>
          }
          right={
            <>
              <p>
                Isso é excelente porque você consegue saber exatamente o que cada node está fazendo. Se alguma coisa der errado, você não precisa desmontar o ajuste inteiro: é só ir no node responsável e corrigir.
              </p>
              <p>
                E se você deixar o node graph bagunçado, o Resolve resolve isso fácil: basta clicar com o botão direito e selecionar <strong className="font-sans text-neutral-900">Cleanup Node Graph</strong> para alinhar tudo em segundos.
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
        <TwoColumnText
          left={
            <>
              <p>
                Nas Primaries, você encontra três ferramentas fundamentais: <strong className="font-sans text-neutral-900">Color Wheels, Color Bars e Log Wheels</strong>. As três servem para trabalhar exposição, contraste e cor, mas cada uma tem um alcance diferente sobre os tons da imagem.
              </p>
              <p>
                A grande diferença entre elas está na forma como atuam na imagem: uma ferramenta é mais generalista, enquanto a outra é muito mais cirúrgica e específica.
              </p>
            </>
          }
          right={
            <>
              <EditorialQuote
                quote="Um é mais específico e o outro é mais generalista, tá?"
              />
              <p>
                Se você precisa mudar a imagem inteira de uma vez, vai para um ajuste mais geral. Se precisa mexer só numa faixa tonal restrita, usa uma ferramenta mais específica. É essa lógica que você precisa dominar.
              </p>
            </>
          }
        />
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
        <ImageAndText
          imageAlt="Painel das Color Wheels no DaVinci Resolve"
          caption="Lift (sombras), Gamma (médios), Gain (altas) e Offset (geral)"
          imagePosition="right"
        >
          <p>
            O <strong className="font-sans text-neutral-900">Lift</strong> mexe principalmente nas sombras. O <strong className="font-sans text-neutral-900">Gain</strong> trabalha as altas luzes. O <strong className="font-sans text-neutral-900">Gamma</strong> fica responsável pelos tons médios. E o <strong className="font-sans text-neutral-900">Offset</strong> move a imagem inteira de uma vez só, como se empurrasse toda a curva de luminância.
          </p>
          <EditorialQuote
            quote="O Lift trabalha a parte escura, o Gain trabalha a parte clara e o Gamma trabalha o meio."
          />
          <p>
            O detalhe essencial: quando você mexe no Lift, uma parte grande da imagem acompanha o ajuste de maneira suave, criando uma transição natural e contínua entre sombras e médios.
          </p>
        </ImageAndText>
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
        <TwoColumnText
          left={
            <>
              <p>
                As Log Wheels têm uma função parecida com as Color Wheels, mas com uma diferença crucial: elas são muito mais restritas e contidas na sua atuação tonal.
              </p>
              <p>
                Quando você mexe em <strong className="font-sans text-neutral-900">Shadow</strong>, você atua nas sombras sem arrastar os médios junto. Quando mexe em <strong className="font-sans text-neutral-900">Highlight</strong>, altera as altas luzes sem contaminar o resto da escala.
              </p>
            </>
          }
          right={
            <>
              <EditorialQuote
                quote="O Log é mais cirúrgico. Ele mexe onde você manda e não mexe no resto."
              />
              <p>
                Isso é ideal quando você já tem a imagem praticamente equilibrada e precisa apenas ajustar uma ponta específica da exposição sem desmanchar o trabalho feito nas primárias.
              </p>
            </>
          }
        />
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
          imageAlt="Painel HDR Palette com zonas zonais"
          caption="Zonas divididas: Black, Dark, Shadow, Light, Highlight e Specular"
          imagePosition="left"
        >
          <p>
            A paleta HDR permite fatiar a escala tonal em várias zonas distintas. Se você tem um ponto estourado no céu ou um reflexo especular que está chamando atenção demais, você vai diretamente nessa faixa sem prejudicar o rosto da pessoa ou as áreas escuras.
          </p>
          <EditorialQuote
            quote="Você consegue mexer naquele pedaço sem destruir o resto da imagem."
          />
          <p>
            Essa segmentação por zonas dá um nível de precisão cirúrgico, especialmente em produções filmadas em Log ou com câmeras de cinema com amplo alcance dinâmico.
          </p>
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
        <TwoColumnText
          left={
            <>
              <p>
                O RGB Mixer permite trabalhar cada canal de cor separadamente. Se a imagem está com uma dominante amarela ou verde que está incomodando, em vez de ficar corrigindo a imagem inteira com balanço geral, você mexe diretamente no canal responsável pela contaminação.
              </p>
              <EditorialQuote
                quote="Em vez de mexer na imagem inteira, você vai direto no canal que está incomodando."
              />
            </>
          }
          right={
            <>
              <p>
                Ele também é excelente para criar conversões de preto e branco de alta riqueza tonal: marcando a opção <strong className="font-sans text-neutral-900">Monochrome</strong> e ativando <strong className="font-sans text-neutral-900">Preserve Luminance</strong>, você dosa a contribuição de cada canal para a luminância monocromática.
              </p>
            </>
          }
        />
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
          imageAlt="Curvas Custom e Curvas HSL no DaVinci Resolve"
          caption="Curvas de controle visual: Hue vs Hue, Hue vs Sat e Hue vs Lum"
          imagePosition="right"
        >
          <p>
            As Curvas são das ferramentas mais usadas no dia a dia do colorista. Na <strong className="font-sans text-neutral-900">Curva Custom</strong>, você cria pontos para modelar contraste e exposição com precisão milimétrica.
          </p>
          <p>
            Mas o poder real aparece nas curvas HSL:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-base text-neutral-700 font-sans">
            <li><strong className="text-neutral-900">Hue vs Hue:</strong> seleciona uma cor e altera a própria cor dela.</li>
            <li><strong className="text-neutral-900">Hue vs Sat:</strong> pega uma cor e altera apenas a saturação dela.</li>
            <li><strong className="text-neutral-900">Hue vs Lum:</strong> ajusta a luminosidade de uma cor específica.</li>
          </ul>
          <EditorialQuote
            quote="A curva te dá um controle visual muito rápido de contraste e matiz."
          />
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
        <TwoColumnText
          left={
            <>
              <p>
                O Qualifier é a ferramenta clássica de seleção secundária por cor. Você pega a pipeta, clica no objeto que quer isolar — como uma parede de madeira, uma camiseta ou o céu — e o Resolve separa aquela informação com base em três eixos: <strong className="font-sans text-neutral-900">Hue, Saturation e Luminance</strong>.
              </p>
              <EditorialQuote
                quote="Você pega a pipeta, clica na cor e o DaVinci isola exatamente aquilo."
              />
            </>
          }
          right={
            <>
              <p>
                Para visualizar exatamente o que você selecionou, use o atalho essencial <kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs font-bold text-neutral-800">Shift + H</kbd> (Highlight).
              </p>
              <p>
                Você também pode inverter a seleção com um único clique para deixar o objeto intacto e tratar apenas todo o cenário de fundo.
              </p>
            </>
          }
        />
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
          imageAlt="Power Windows no DaVinci: Linear, Circular e Polígono"
          caption="Máscaras vetoriais com controle de penas e suavidade de borda"
          imagePosition="left"
        >
          <p>
            Enquanto o Qualifier isola por cor, a Power Window cria uma seleção espacial geométrica. Você pode desenhar máscaras lineares, circulares, poligonais ou curvas livres (Curve Window) em qualquer região do quadro.
          </p>
          <EditorialQuote
            quote="A Window cria uma máscara na região que você quiser, sem depender da cor."
          />
          <p>
            O controle de suavidade de borda (<strong className="font-sans text-neutral-900">Softness</strong>) permite fundir o ajuste de forma totalmente invisível, sem deixar marcas de corte na cena.
          </p>
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
        <TwoColumnText
          left={
            <>
              <p>
                Criou uma máscara numa pessoa e ela se mexeu? O Tracker analisa os padrões da imagem e faz a máscara acompanhar o movimento ao longo de todo o plano automaticamente.
              </p>
              <EditorialQuote
                quote="Fez a máscara, dá o track e o DaVinci acompanha o movimento sozinho."
              />
            </>
          }
          right={
            <>
              <p>
                Ele pode rastrear Pan, Tilt, Zoom, Rotação e Perspectiva tridimensional. E se em algum momento o rastreamento escapar ou falhar por causa de uma oclusão, você muda do modo <strong className="font-sans text-neutral-900">Clip</strong> para o modo <strong className="font-sans text-neutral-900">Frame</strong> e corrige manualmente quadro a quadro.
              </p>
            </>
          }
        />
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
          imageAlt="Magic Mask com DaVinci Neural Engine"
          caption="Isolamento de pessoas, roupas, braços e rostos com rede neural"
          imagePosition="right"
        >
          <p>
            Disponível no DaVinci Resolve Studio, a Magic Mask utiliza a rede neural proprietária (<strong className="font-sans text-neutral-900">DaVinci Neural Engine</strong>) para isolar pessoas inteiras, roupas, características faciais ou objetos individuais.
          </p>
          <EditorialQuote
            quote="Você passa o traço em cima da pessoa e a inteligência artificial faz a seleção."
          />
          <p>
            Basta traçar um risco com o pincel positivo sobre o que você deseja selecionar e o software rastreia o contorno com precisão impressionante, economizando horas de rotoscopia manual.
          </p>
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
        <TwoColumnText
          left={
            <>
              <p>
                O <strong className="font-sans text-neutral-900">Blur</strong> permite desfocar partes do plano, muito útil para direcionar o olhar do espectador, simular profundidade de campo ou suavizar imperfeições e ruídos no fundo.
              </p>
              <p>
                O <strong className="font-sans text-neutral-900">Sharpen</strong>, por sua vez, aumenta a percepção de nitidez aparente das bordas da imagem.
              </p>
            </>
          }
          right={
            <>
              <EditorialQuote
                quote="Sharpen demais deixa a imagem com cara de vídeo digital barato. Menos é mais."
              />
              <p>
                O cuidado aqui é crucial: o excesso de nitidez digital gera ruído pontiagudo e halos brancos ao redor das bordas. Use sempre com sutileza profissional.
              </p>
            </>
          }
        />
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
        <TwoColumnText
          left={
            <>
              <p>
                O painel Key controla o ganho e a intensidade da saída do node através do <strong className="font-sans text-neutral-900">Key Output</strong>. É o equivalente direto à opacidade de uma camada no Photoshop ou After Effects.
              </p>
              <EditorialQuote
                quote="Fez um look que ficou forte demais? Vai no Key e diminui pela metade."
              />
            </>
          }
          right={
            <>
              <p>
                Se você construiu um grade com contraste, saturação e tonalidade perfeita mas o cliente achou pesado demais, você não mexe em cada roda de cor: basta reduzir o <strong className="font-sans text-neutral-900">Key Output Gain</strong> de 1.0 para 0.5 e o efeito fica dosado com perfeição.
              </p>
            </>
          }
        />
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
          imageAlt="Painel Sizing do DaVinci Resolve"
          caption="Input Sizing vs Node Sizing: recomposição sem perda de qualidade"
          imagePosition="left"
        >
          <p>
            O painel Sizing permite dar zoom, rotacionar, corrigir linha de horizonte torta, ajustar proporção e reenquadrar o plano.
          </p>
          <EditorialQuote
            quote="O Sizing serve para recompor o plano quando a gravação precisou de ajuste."
          />
          <p>
            Existe uma distinção fundamental: o <strong className="font-sans text-neutral-900">Input Sizing</strong> altera o clipe inteiro antes dos nodes, enquanto o <strong className="font-sans text-neutral-900">Node Sizing</strong> permite aplicar transformações geométricas isoladas apenas dentro de um node específico.
          </p>
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
          imageAlt="Scopes de Sinal: Waveform, Parade e Vectorscope"
          caption="Análise de luminância e crominância objetiva sem ilusão de óptica"
          imagePosition="right"
        >
          <p>
            O olho humano se adapta muito rápido à luminosidade da sala e se acostuma facilmente com erros de matiz. Por isso, os Scopes são o instrumento de verdade do colorista:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-base text-neutral-700 font-sans">
            <li><strong className="text-neutral-900">Waveform:</strong> mede a escala de luminância de 0 (preto absoluto) a 1023 (branco estourado).</li>
            <li><strong className="text-neutral-900">RGB Parade:</strong> separa os canais R, G e B lado a lado para verificar balanço de branco.</li>
            <li><strong className="text-neutral-900">Vectorscope:</strong> mede a saturação e a matiz, com a linha de tom de pele (Skin Tone Line).</li>
          </ul>
          <EditorialQuote
            quote="O olho se acostuma com o erro. O scope mostra a verdade do sinal."
          />
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
        <TwoColumnText
          left={
            <>
              <p>
                O Split Screen divide a tela para comparar múltiplos clipes ao mesmo tempo. Você pode selecionar três ou quatro takes da mesma cena e visualizá-los em quadrantes simultâneos.
              </p>
              <EditorialQuote
                quote="Color grading é sobre contexto. Um plano só está bom se fizer sentido com o vizinho."
              />
            </>
          }
          right={
            <>
              <p>
                Isso é essencial para <strong className="font-sans text-neutral-900">Shot Matching</strong>: garante que a cena mantenha continuidade de tom de pele, brilho e saturação em todos os cortes, sem saltos visuais para quem está assistindo.
              </p>
            </>
          }
        />
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
          imageAlt="Gallery do DaVinci Resolve com Stills"
          caption="Biblioteca de stills estáticos e cópia direta de estrutura de nodes"
          imagePosition="left"
        >
          <p>
            A Gallery serve para duas coisas fundamentais: guardar imagens de referência estética do cliente e armazenar Stills dos seus próprios planos.
          </p>
          <EditorialQuote
            quote="A Gallery é a sua memória visual dentro do DaVinci."
          />
          <p>
            Ao clicar com o botão direito e escolher <strong className="font-sans text-neutral-900">Grab Still</strong>, o DaVinci não salva apenas a foto: salva a estrutura inteira de nodes com todos os ajustes. Para aplicar em outro clipe, basta clicar com o botão direito no still e selecionar <strong className="font-sans text-neutral-900">Apply Grade</strong>.
          </p>
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
        <TwoColumnText
          left={
            <>
              <p>
                Quando você trabalha com duas ou três câmeras diferentes na mesma gravação, cada sensor tem uma resposta de cor particular. O Color Match utiliza cartelas de cor padronizadas (<strong className="font-sans text-neutral-900">ColorChecker</strong>) filmadas no set para fazer o alinhamento técnico inicial.
              </p>
              <EditorialQuote
                quote="Primeiro você iguala todo mundo. Depois você cria o estilo do filme."
              />
            </>
          }
          right={
            <>
              <p>
                Você encaixa o grid da cartela sobre o ColorChecker na tela e o Resolve calibra as cores automaticamente para um espaço cromático de referência. Com todas as câmeras equalizadas na mesma base neutra, a etapa artística do Creative Grade flui com muito mais coerência.
              </p>
            </>
          }
        />
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
        <p className="font-serif text-lg text-neutral-700 leading-relaxed mb-6">
          Decorar atalhos não é questão de vaidade: é velocidade de entrega e fluidez criativa. Os principais coloristas de cinema mantêm uma mão no mouse/mesa e a outra nos atalhos essenciais:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-sans not-italic">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between shadow-xs">
            <span className="text-xs font-semibold text-neutral-800">Criar Serial Node</span>
            <kbd className="px-2.5 py-1 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs">
              Alt + S
            </kbd>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between shadow-xs">
            <span className="text-xs font-semibold text-neutral-800">Criar Parallel Node</span>
            <kbd className="px-2.5 py-1 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs">
              Alt + P
            </kbd>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between shadow-xs">
            <span className="text-xs font-semibold text-neutral-800">Criar Layer Node</span>
            <kbd className="px-2.5 py-1 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs">
              Alt + L
            </kbd>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between shadow-xs">
            <span className="text-xs font-semibold text-neutral-800">Desativar / Ativar Node</span>
            <kbd className="px-2.5 py-1 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs">
              Ctrl + D
            </kbd>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between shadow-xs">
            <span className="text-xs font-semibold text-neutral-800">Bypass de Todos os Grades</span>
            <kbd className="px-2.5 py-1 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs">
              Shift + D
            </kbd>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between shadow-xs">
            <span className="text-xs font-semibold text-neutral-800">Visualizar Seleção (Highlight)</span>
            <kbd className="px-2.5 py-1 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs">
              Shift + H
            </kbd>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between shadow-xs">
            <span className="text-xs font-semibold text-neutral-800">Salvar Still na Gallery</span>
            <kbd className="px-2.5 py-1 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs">
              Ctrl + Alt + G
            </kbd>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between shadow-xs">
            <span className="text-xs font-semibold text-neutral-800">Ativar Wipe de Referência</span>
            <kbd className="px-2.5 py-1 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs">
              Shift + W
            </kbd>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between shadow-xs">
            <span className="text-xs font-semibold text-neutral-800">Ajustar Imagem à Tela</span>
            <kbd className="px-2.5 py-1 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-900 shadow-2xs">
              Shift + Z
            </kbd>
          </div>
        </div>
      </EditorialSection>

      {/* ===================================================================
          SEÇÃO 22 — O QUE VOCÊ PRECISA GUARDAR
          =================================================================== */}
      <EditorialSection
        kickerLeft="SÍNTESE DA AULA"
        kickerRight="RESUMO PRÁTICO"
        title="O QUE VOCÊ PRECISA GUARDAR"
        subtitle="A MENTALIDADE DO COLORISTA PROFISSIONAL"
      >
        <TwoColumnText
          left={
            <>
              <p>
                O DaVinci Resolve tem centenas de ferramentas, mas você não precisa decorar todas elas para entregar trabalhos cinematográficos. O que define um bom colorista é a clareza sobre qual caminho escolher para cada desafio.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-base text-neutral-800">
                  <CheckCircle2 size={18} className="text-[#0071e3] shrink-0 mt-1" />
                  <span><strong>Domine a Página Color:</strong> é onde a mágica acontece. Conheça a localização de cada ferramenta.</span>
                </div>
                <div className="flex items-start gap-3 text-base text-neutral-800">
                  <CheckCircle2 size={18} className="text-[#0071e3] shrink-0 mt-1" />
                  <span><strong>Construa em Etapas:</strong> use os nodes para separar exposição, balanço, secundárias e look.</span>
                </div>
              </div>
            </>
          }
          right={
            <>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-base text-neutral-800">
                  <CheckCircle2 size={18} className="text-[#0071e3] shrink-0 mt-1" />
                  <span><strong>Generalista vs Cirúrgico:</strong> use Color Wheels para ajustes amplos e Log / HDR para pontas tonais restritas.</span>
                </div>
                <div className="flex items-start gap-3 text-base text-neutral-800">
                  <CheckCircle2 size={18} className="text-[#0071e3] shrink-0 mt-1" />
                  <span><strong>Confie nos Scopes:</strong> o olho se acostuma com o erro. Monitore luminância e canais pelos scopes.</span>
                </div>
                <div className="flex items-start gap-3 text-base text-neutral-800">
                  <CheckCircle2 size={18} className="text-[#0071e3] shrink-0 mt-1" />
                  <span><strong>Contexto é Tudo:</strong> compare tomadas vizinhas com Split Screen e Gallery antes de aprovar.</span>
                </div>
              </div>

              <EditorialQuote
                quote="Não tente decorar botões. Entenda o papel de cada ferramenta na imagem e o seu fluxo de trabalho vai fluir com naturalidade."
              />
            </>
          }
        />
      </EditorialSection>

    </article>
  );
}
