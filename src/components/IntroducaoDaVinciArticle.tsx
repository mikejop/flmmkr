import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function IntroducaoDaVinciArticle() {
  return (
    <article className="w-full text-[#111111] font-serif select-text leading-relaxed relative space-y-8">
      {/* ===================================================================
          SEÇÃO 1 — PRIMEIRO, VAMOS ENTENDER O DAVINCI RESOLVE
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>INTRODUÇÃO AO DAVINCI RESOLVE</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          PRIMEIRO, VAMOS ENTENDER O DAVINCI RESOLVE
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Antes de começar a mexer na imagem, vamos entender um pouco como o DaVinci Resolve funciona.
          </p>
          <p>
            Principalmente se você ainda não está muito familiarizado com o programa, porque a interface pode parecer meio confusa no começo. Tem bastante coisa na tela e, principalmente, tem ferramenta pra caramba.
          </p>
          <p className="font-sans font-bold text-neutral-900 text-xl">
            E não precisa querer aprender tudo agora.
          </p>
          <p>
            O DaVinci Resolve tem um milhão de ferramentas. É impossível falar sobre todas elas em um curso.
          </p>
          <p>
            Então a ideia aqui é outra. Você vai entender como o DaVinci Resolve está organizado e onde ficam as ferramentas que a gente vai usar no nosso trabalho de color grading.
          </p>
          <p>
            O Resolve é dividido em diferentes páginas, e cada uma delas tem uma função dentro do processo de pós-produção. A Media, por exemplo, é onde você vai trabalhar com os arquivos do projeto, trazendo para dentro do programa os arquivos que estão no computador.
          </p>
          <p>
            Depois você tem as outras áreas do programa, cada uma voltada para uma etapa do trabalho.
          </p>

          <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
            <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
              “Mas, para o que a gente vai fazer aqui, a página que mais interessa é a Color. É nela que você vai passar a maior parte do tempo.”
            </p>
          </blockquote>

          <p>
            E é justamente por isso que eu quero que você se familiarize primeiro com essa página.
          </p>
          <p>
            Quando você abre a Color, vai encontrar a imagem, a timeline, a Gallery, os nodes, os scopes e todas aquelas ferramentas de correção na parte inferior.
          </p>
          <p>
            No começo pode parecer muita coisa.
          </p>
          <p>
            Mas, conforme a gente for usando, você vai perceber que cada ferramenta tem uma função bem específica. Você não precisa decorar onde está cada botão. Precisa entender o que cada coisa faz e saber onde encontrar quando precisar.
          </p>
          <p>
            Por exemplo, os nodes são onde a gente vai construindo o tratamento da imagem. A Gallery serve para guardar referências e stills. O Split Screen ajuda a comparar imagens. Os scopes mostram informações sobre o sinal da imagem. E, nas ferramentas de correção, você vai encontrar diferentes maneiras de trabalhar exposição, contraste, cor e seleções específicas.
          </p>
          <p>
            A gente vai passar por tudo isso.
          </p>
          <p>
            Sem ficar enrolando e sem tentar transformar essa introdução num manual do programa inteiro.
          </p>
          <p className="font-sans font-semibold text-neutral-900 bg-[#f5f5f7] p-5 rounded-xl border border-neutral-200">
            A ideia é você terminar essa parte olhando para a página Color e já sabendo onde está cada coisa e para que ela serve. Aí sim a gente começa a trabalhar a imagem.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 2 — ORGANIZA A CASA
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>PÁGINA MEDIA & ESTRUTURA</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          ORGANIZA A CASA
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Na página Media, você vai trazer os arquivos do computador para dentro do projeto. E aqui tem um detalhe importante: mantenha a organização que você já fez no computador.
          </p>
          <p>
            Se você tem uma pasta com as brutas, outra com drone, outra com cada card, joga essa estrutura para os Bins. Assim o DaVinci mantém tudo organizado.
          </p>
        </div>

        {/* Citação Editorial em Destaque */}
        <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
          <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
            “Se você deixar organizado no seu computador, você consegue arrastar do computador pro DaVinci Resolve e ele vai continuar com a mesma organização.”
          </p>
        </blockquote>

        <p className="font-serif text-lg text-neutral-800 leading-[1.7]">
          Não tem motivo pra jogar tudo solto no Media Pool e depois ficar procurando arquivo no meio daquela bagunça.
        </p>
      </section>

      {/* ===================================================================
          SEÇÃO 3 — E NA EDIT, O COLORISTA PRECISA SABER O BÁSICO
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>TIMELINE LIMPA</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          E NA EDIT, O COLORISTA PRECISA SABER O BÁSICO
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Você não precisa virar editor porque está fazendo color.
          </p>
          <p>
            Mas precisa saber navegar na timeline e, principalmente, identificar aquilo que realmente vai aparecer no filme.
          </p>
          <p>
            Às vezes existem takes que estão na timeline, mas foram desativados ou simplesmente não aparecem no resultado final. Se eles continuarem ali, você pode acabar colorindo um clipe que ninguém vai ver.
          </p>
        </div>

        <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
          <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
            “Então, às vezes, você vai precisar fazer isso, vai precisar tirar ele.”
          </p>
        </blockquote>

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            É por isso que uma timeline limpa ajuda tanto. Você olha para ela e sabe exatamente o que precisa trabalhar.
          </p>
          <p>
            E isso também ajuda a calcular o tempo de color. Se você sabe que tem oito clipes para fazer, é uma coisa. Se aparecem quinze porque metade deles nem está sendo usada, já começa errado.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 4 — O NODE É O CAMINHO DA IMAGEM
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>ARQUITETURA DE NODES</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          O NODE É O CAMINHO DA IMAGEM
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Pensa no node de um jeito simples.
          </p>
          <p>
            A imagem entra, você faz um tratamento e manda esse tratamento para o próximo node. Depois outro tratamento. E outro. Até chegar no Output.
          </p>
          <p>
            É como se você fosse construindo a imagem por etapas.
          </p>
          <p>
            Isso é muito melhor do que sair colocando tudo no mesmo lugar, porque você consegue entender o que cada parte do grade está fazendo. E, se alguma coisa der errado, fica muito mais fácil encontrar o problema.
          </p>
          <div className="bg-[#f5f5f7] p-5 rounded-xl border border-neutral-200 text-neutral-900 font-sans text-base font-medium flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#0071e3] text-white flex items-center justify-center shrink-0 text-xs font-bold">
              TIP
            </span>
            <span>
              Também dá pra organizar o node graph. Botão direito, <strong>Cleanup Node Graph</strong>, e pronto. O próprio Resolve organiza aquilo que você deixou uma zona.
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 5 — ANTES DE MEXER NA COR, ENTENDA AS PRIMÁRIAS
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>FERRAMENTAS PRIMÁRIAS</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          ANTES DE MEXER NA COR, ENTENDA AS PRIMÁRIAS
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Aqui começa uma parte importante.
          </p>
          <p>
            Você vai encontrar Color Wheels, Color Bars e Log Wheels. As três servem para trabalhar a imagem, mas não fazem exatamente a mesma coisa.
          </p>
          <p>
            O Color Wheel trabalha de maneira mais ampla. Quando você mexe nele, uma parte grande da imagem acompanha a alteração.
          </p>
          <p>
            Já os controles de Highlight, Midtone e Shadow permitem ser mais específico.
          </p>
          
          <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 my-4 space-y-3 font-sans">
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
              Então pensa assim:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
                <span className="font-bold text-neutral-900 block text-base mb-1">Quero mudar a imagem inteira?</span>
                <span className="text-sm text-[#0071e3] font-semibold">Vai para um ajuste mais geral.</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
                <span className="font-bold text-neutral-900 block text-base mb-1">Quero mexer só em uma parte?</span>
                <span className="text-sm text-[#0071e3] font-semibold">Usa uma ferramenta mais específica.</span>
              </div>
            </div>
          </div>

          <p>
            É isso. Você não precisa decorar uma regra complicada. É só entender o alcance de cada ferramenta.
          </p>
        </div>

        <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
          <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
            “Um é mais específico e o outro é mais generalista, tá?”
          </p>
        </blockquote>
      </section>

      {/* ===================================================================
          SEÇÃO 6 — QUANDO O PROBLEMA ESTÁ SÓ EM UMA PARTE
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>AJUSTES ESPECÍFICOS & CURVAS</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          QUANDO O PROBLEMA ESTÁ SÓ EM UMA PARTE
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            É aqui que começam a aparecer ferramentas mais específicas.
          </p>
          <p>
            O HDR permite trabalhar diferentes partes da escala tonal. Então, se existe um ponto muito claro que está chamando atenção, você consegue mexer naquele pedaço sem destruir o resto da imagem.
          </p>
          <p>
            O RGB Mixer faz outra coisa. Ele permite trabalhar cada canal separadamente.
          </p>
          <p>
            Está tudo meio amarelado e você precisa corrigir uma dominante? Em vez de ficar mexendo na imagem inteira, você pode trabalhar diretamente no canal que está causando o problema.
          </p>
          <p>
            E aí começam a aparecer as curvas.
          </p>
          <p>
            Você pode selecionar uma determinada matiz e mudar a própria matiz. Pode pegar uma cor e mexer só na saturação dela. Pode mudar a luminosidade de uma cor específica.
          </p>
          <p className="font-sans font-semibold text-neutral-900 bg-[#f5f5f7] p-5 rounded-xl border border-neutral-200">
            É por isso que existem tantas ferramentas. Não é porque você precisa usar todas. É porque, dependendo do problema, um caminho vai ser melhor que o outro.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 7 — SELECIONA. AJUSTA. PRONTO.
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>MÁSCARAS & QUALIFIERS</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          SELECIONA. AJUSTA. PRONTO.
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            O Qualifier é uma das ferramentas mais importantes quando você precisa isolar uma cor.
          </p>
          <p>
            Quer mexer só na madeira? Seleciona a madeira. Quer mexer só em determinada cor? Seleciona aquela cor. Depois você faz a alteração só naquela região.
          </p>
          <p>
            O Window funciona de outra forma. Em vez de selecionar pela cor, você cria uma máscara vetorial. É parecido com trabalhar com uma máscara em outros programas.
          </p>
          <p>
            E aí vem o Tracker. Criou uma máscara e o objeto se mexe? Você faz o track e o Resolve acompanha aquele movimento.
          </p>
          <p>
            Quando precisa de uma seleção mais automatizada, existe o Magic Mask, disponível na versão Studio. Ele usa inteligência artificial para identificar o objeto que você quer selecionar.
          </p>
        </div>

        <blockquote className="bg-[#0071e3] text-white p-6 sm:p-8 rounded-2xl my-7 shadow-md">
          <p className="font-serif italic font-medium text-xl sm:text-2xl leading-snug text-center !mb-0">
            “Sacou a lógica? Você não precisa fazer tudo à mão. Mas precisa saber qual ferramenta resolve cada problema.”
          </p>
        </blockquote>
      </section>

      {/* ===================================================================
          SEÇÃO 8 — REFERÊNCIA É REFERÊNCIA
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>A GALERIA DE STILLS</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          REFERÊNCIA É REFERÊNCIA
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            A Gallery não serve só para guardar still. Ela também pode ser usada como referência.
          </p>
          <p>
            Você pode pegar uma imagem de referência, colocar dentro da Gallery e trabalhar comparando as duas imagens.
          </p>
          <p>
            Quer chegar perto de uma determinada estética? Coloca a referência ali e compara.
          </p>
          <p>
            O olho sozinho pode enganar. Quando você consegue olhar a referência e a sua imagem ao mesmo tempo, fica muito mais fácil perceber onde está diferente.
          </p>
          <p>
            E isso também ajuda quando você precisa levar um grade de uma imagem para outra. Você salva o still, copia o tratamento e aplica onde precisar.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 9 — COLOR MATCH: PRIMEIRO DEIXA TODO MUNDO NO MESMO LUGAR
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>EQUALIZAÇÃO MULTICÂMERA</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          COLOR MATCH: PRIMEIRO DEIXA TODO MUNDO NO MESMO LUGAR
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Quando você trabalha com mais de uma câmera, é comum precisar equalizar as imagens.
          </p>
          <p>
            Uma câmera pode vir um pouco mais quente. Outra, mais fria. Uma pode ter mais contraste. Outra, menos.
          </p>
          <p>
            Nesse caso, você precisa primeiro colocar todas elas no mesmo caminho. É aí que entra o Color Match.
          </p>
          <p>
            O professor resume de um jeito bem direto:
          </p>
        </div>

        <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
          <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
            “Normalmente, quando você trabalha com mais de uma câmera e aí você tem que equalizar todas elas, a gente usa o color match.”
          </p>
        </blockquote>

        <p className="font-serif text-lg text-neutral-800 leading-[1.7]">
          Depois que as câmeras estão conversando entre si, aí sim começa a parte mais criativa do grade.
        </p>
      </section>

      {/* ===================================================================
          SEÇÃO 10 — O OLHO VÊ. O SCOPE CONFIRMA.
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>LEITURA OBJETIVA DO SINAL</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          O OLHO VÊ. O SCOPE CONFIRMA.
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Você pode fazer color olhando para a imagem. Mas não precisa confiar só no olho.
          </p>
          <p>
            Os Scopes existem justamente para te dar uma leitura mais objetiva do sinal.
          </p>
          <p>
            Na Waveform, você acompanha a luminosidade. No Parade, consegue enxergar separadamente a intensidade de cada canal. E no Vector Scope, você vê como as cores estão distribuídas dentro do espectro.
          </p>
        </div>

        <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
          <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
            “Aqui eu tenho o vector scope, onde eu consigo ver a distribuição de cores através do espectro visível.”
          </p>
        </blockquote>

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            O Vector Scope também ajuda a entender saturação. Se a informação está mais concentrada no centro, a imagem está menos saturada. Se ela está se afastando bastante do centro, a saturação está aumentando.
          </p>
          <p>
            Passou daquele limite? Aí começa a dar problema.
          </p>
          <p className="font-sans font-semibold text-[#0071e3] text-lg">
            Por isso, não adianta simplesmente pensar: “quero mais cor”. Você precisa olhar quanto de cor está colocando.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 11 — UMA ÚLTIMA COISA ANTES DE COMEÇAR O COLOR
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>REGRA DE OURO</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          UMA ÚLTIMA COISA ANTES DE COMEÇAR O COLOR
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p className="font-sans font-bold text-xl text-red-600">
            Desliga o proxy.
          </p>
          <p>
            Se o editor trabalhou em proxy, ou se você deixou o proxy ligado, você pode acabar fazendo o grade em cima de uma versão que não é o material original.
          </p>
        </div>

        <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-red-500 my-7 shadow-xs">
          <p className="font-serif italic font-medium text-xl sm:text-2xl text-red-600 leading-snug !mb-0">
            “Sempre que você for fazer color grading, tira do proxy.”
          </p>
        </blockquote>

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            É uma coisa simples. Mas é o tipo de coisa que você quer descobrir antes de passar horas colorindo.
          </p>
          <p className="font-sans font-bold text-neutral-900 text-xl pt-2">
            E pronto.
          </p>
          <p>
            Você não precisa saber o DaVinci inteiro para começar. Precisa entender onde estão as coisas, o que cada ferramenta faz e, principalmente, qual ferramenta usar para cada problema.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200/80 flex items-center justify-between text-xs font-sans text-neutral-500">
          <span>COLOR MASTER® · DA VINCI RESOLVE</span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <CheckCircle2 size={14} /> Leitura Obrigatória
          </span>
        </div>
      </section>
    </article>
  );
}
