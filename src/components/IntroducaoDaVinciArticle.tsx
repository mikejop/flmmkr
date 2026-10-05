import React from 'react';
import { CheckCircle2, Command } from 'lucide-react';

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
          SEÇÃO 2 — A ABA COLOR
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>ESTRUTURA DA TELA</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-2">
          A ABA COLOR
        </h2>
        <h3 className="font-sans font-bold text-neutral-900 text-lg uppercase tracking-tight mt-1 mb-4">
          É AQUI QUE A IMAGEM COMEÇA A TOMAR FORMA
        </h3>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Quando você entra na página Color, a primeira coisa que precisa entender é como aquela tela está organizada.
          </p>
          <p>
            Você tem a imagem no centro, a timeline embaixo, os nodes, a Gallery e, na parte inferior, as ferramentas de correção.
          </p>
          <p>
            A gente vai trabalhar praticamente aqui.
          </p>

          <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
            <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
              “O colorista, ele trabalha praticamente na aba Color.”
            </p>
          </blockquote>

          <p>
            E não precisa ficar assustado com a quantidade de coisa que aparece.
          </p>
          <p>
            O Resolve tem um milhão de ferramentas. É impossível falar sobre todas elas.
          </p>
          <p className="font-sans font-bold text-neutral-900 text-xl pt-2">
            Então vamos entender o que realmente importa.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 3 — OS NODES
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>ARQUITETURA DE NODES</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-2">
          OS NODES
        </h2>
        <h3 className="font-sans font-bold text-neutral-900 text-lg uppercase tracking-tight mt-1 mb-4">
          A IMAGEM PASSA POR AQUI
        </h3>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Aqui embaixo a gente tem os nodes.
          </p>
          <p>
            Pensa no node como uma etapa do tratamento.
          </p>
          <p>
            Você faz uma correção em um node, depois pode fazer outra em outro node, depois outra. E vai construindo o tratamento da imagem aos poucos.
          </p>
          <p className="font-sans font-bold text-neutral-900 text-lg">
            Isso é importante porque você consegue separar as coisas.
          </p>

          <div className="space-y-3 bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 my-5 font-sans">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
              <span className="text-base text-neutral-800">Uma correção de exposição pode ficar em um node.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
              <span className="text-base text-neutral-800">Uma correção de balanço pode ficar em outro.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
              <span className="text-base text-neutral-800">Um ajuste de uma cor específica pode ficar em outro.</span>
            </div>
          </div>

          <p>
            E aí, quando alguma coisa não está legal, você sabe exatamente onde foi mexido.
          </p>
          <p>
            Também dá para trabalhar com diferentes estruturas de nodes, dependendo do que você quer fazer.
          </p>
          <p className="font-sans font-semibold text-neutral-900 bg-white p-5 rounded-xl border border-neutral-200">
            Não precisa decorar tudo agora. O importante é entender que o grade vai sendo construído dentro dessa estrutura.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 4 — PRIMARIES
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>CORREÇÕES INICIAIS</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-2">
          PRIMARIES
        </h2>
        <h3 className="font-sans font-bold text-neutral-900 text-lg uppercase tracking-tight mt-1 mb-4">
          ONDE A GENTE COMEÇA A CORRIGIR A IMAGEM
        </h3>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Aqui estão as ferramentas que você provavelmente mais vai usar no começo.
          </p>
          <p>
            Você vai encontrar <strong>Color Wheels</strong>, <strong>Color Bars</strong> e <strong>Log Wheels</strong>.
          </p>
          <p>
            As Color Wheels trabalham a imagem de uma maneira mais geral.
          </p>
          <p>
            Você tem controle sobre sombras, meios-tons e altas luzes e consegue fazer aquelas correções mais amplas de exposição, contraste e cor.
          </p>
          <p>
            Já as Log Wheels permitem ser mais específico dentro da escala tonal.
          </p>
          <p>
            Então, dependendo do que você quer corrigir, uma ferramenta vai funcionar melhor do que a outra.
          </p>

          <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
            <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
              “Qual que é a diferença entre eles, tá?”
            </p>
          </blockquote>

          <p>
            É essa pergunta que você precisa fazer sempre no color.
          </p>
          <p className="font-sans font-bold text-neutral-900 text-xl">
            O que eu quero mudar e qual ferramenta me dá mais controle sobre isso?
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 5 — COLOR WHEELS
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>FERRAMENTAS PRIMÁRIAS</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          COLOR WHEELS
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            As Color Wheels são divididas em áreas diferentes da imagem.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans my-4">
            <div className="p-4 bg-[#f5f5f7] rounded-xl border border-neutral-200">
              <strong className="block text-neutral-900 text-base mb-1">Lift</strong>
              <span className="text-sm text-neutral-600">Trabalha principalmente as regiões mais escuras.</span>
            </div>
            <div className="p-4 bg-[#f5f5f7] rounded-xl border border-neutral-200">
              <strong className="block text-neutral-900 text-base mb-1">Gamma</strong>
              <span className="text-sm text-neutral-600">Atua nos meios-tons da imagem.</span>
            </div>
            <div className="p-4 bg-[#f5f5f7] rounded-xl border border-neutral-200">
              <strong className="block text-neutral-900 text-base mb-1">Gain</strong>
              <span className="text-sm text-neutral-600">Trabalha as regiões mais claras.</span>
            </div>
          </div>

          <p>
            E você ainda tem controles como <strong>Contrast</strong>, <strong>Pivot</strong>, <strong>Saturation</strong>, <strong>Hue</strong>, <strong>Temperature</strong> e <strong>Tint</strong>.
          </p>
          <p>
            Aqui você consegue fazer aquela primeira organização da imagem:
          </p>

          <ul className="space-y-2 list-disc list-inside font-sans text-neutral-700 bg-neutral-50 p-5 rounded-xl border border-neutral-200">
            <li>Corrigir uma exposição que veio errada.</li>
            <li>Ajustar o balanço de branco.</li>
            <li>Aumentar ou diminuir contraste.</li>
            <li>Controlar saturação.</li>
            <li>Mudar uma dominante de cor.</li>
          </ul>

          <p className="font-sans font-bold text-neutral-900 text-lg pt-2">
            É aqui que normalmente começa o trabalho.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 6 — LOG WHEELS
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>AJUSTE TONAL DIRECIONADO</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          LOG WHEELS
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            As Log Wheels funcionam de forma mais direcionada.
          </p>
          <p>
            Em vez de tratar a imagem de uma maneira tão ampla, você consegue trabalhar faixas tonais mais específicas.
          </p>
          <p>
            Isso é muito útil quando você quer fazer um ajuste pequeno sem sair mexendo no resto da imagem.
          </p>
          <p>
            Por exemplo, você pode mexer em uma região mais clara sem afetar tanto os meios-tons.
          </p>
          <p>
            Ou trabalhar uma determinada região escura sem alterar tanto o restante.
          </p>
          <p className="font-sans font-bold text-[#0071e3] text-xl">
            É mais controle.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 7 — HDR
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>CONTROLE DE ZONAS</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          HDR
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Aqui você tem uma outra forma de trabalhar a escala tonal.
          </p>
          <p>
            No HDR, você consegue separar diferentes regiões da imagem e atuar de maneira bem mais precisa.
          </p>
          <p className="font-sans font-bold text-neutral-900 text-lg">
            Quer mexer só naquele pedaço de luz?
          </p>
          <p>
            Você consegue.
          </p>

          <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
            <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
              “No HDR, onde a gente vai mexer em cada pontinho.”
            </p>
          </blockquote>

          <p>
            É uma ferramenta muito interessante quando você precisa fazer uma correção localizada sem bagunçar toda a imagem.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 8 — RGB MIXER
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>CANAIS INDIVIDUAIS</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          RGB MIXER
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Aqui você consegue trabalhar cada canal individualmente:
          </p>
          <p className="font-sans font-semibold text-neutral-900">
            Vermelho, verde e azul.
          </p>

          <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
            <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
              “Aqui eu vou ter o RGB Mixer. Esse RGB Mixer, a gente consegue ajustar cada canal individualmente.”
            </p>
          </blockquote>

          <p>
            É uma ferramenta que permite fazer alterações bem específicas na relação entre os canais.
          </p>
          <p>
            Não é aquela ferramenta que você precisa ficar usando em todo grade.
          </p>
          <p className="font-sans font-bold text-neutral-900">
            Mas quando precisa, ela resolve.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 9 — CURVES
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>CONTROLE DE CURVAS</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          CURVES
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            As curvas são outra forma de controlar a imagem.
          </p>
          <p>
            Você pode trabalhar contraste, luminância e cor e também fazer ajustes mais específicos.
          </p>
          <p>
            Aqui entram ferramentas como:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans my-4">
            <div className="p-3.5 bg-[#f5f5f7] rounded-xl border border-neutral-200 font-bold text-neutral-800">
              Custom Curves
            </div>
            <div className="p-3.5 bg-[#f5f5f7] rounded-xl border border-neutral-200 font-bold text-neutral-800">
              Hue vs Hue
            </div>
            <div className="p-3.5 bg-[#f5f5f7] rounded-xl border border-neutral-200 font-bold text-neutral-800">
              Hue vs Saturation
            </div>
            <div className="p-3.5 bg-[#f5f5f7] rounded-xl border border-neutral-200 font-bold text-neutral-800">
              Hue vs Luminance
            </div>
            <div className="p-3.5 bg-[#f5f5f7] rounded-xl border border-neutral-200 font-bold text-neutral-800 sm:col-span-2">
              Luminance vs Saturation
            </div>
          </div>

          <p>
            É onde você começa a fazer aquelas correções mais cirúrgicas.
          </p>

          <div className="space-y-4 bg-neutral-50 p-6 rounded-2xl border border-neutral-200 my-4 font-sans">
            <div>
              <span className="text-neutral-500 text-sm block">Quer mudar o tom de uma cor sem mexer nas outras?</span>
              <strong className="text-[#0071e3] text-base">Hue vs Hue.</strong>
            </div>
            <div>
              <span className="text-neutral-500 text-sm block">Quer aumentar a saturação de uma determinada cor?</span>
              <strong className="text-[#0071e3] text-base">Hue vs Saturation.</strong>
            </div>
            <div>
              <span className="text-neutral-500 text-sm block">Quer alterar a luminosidade de uma determinada cor?</span>
              <strong className="text-[#0071e3] text-base">Hue vs Luminance.</strong>
            </div>
          </div>

          <p className="font-sans font-semibold text-neutral-900 text-lg">
            É basicamente isso.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 10 — QUALIFIER
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>ISOLAMENTO DE COR</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          QUALIFIER
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Agora a gente começa a selecionar.
          </p>
          <p>
            O Qualifier permite pegar uma determinada cor da imagem e trabalhar só nela.
          </p>
          <p>
            Você pode selecionar por <strong>Hue</strong>, <strong>Saturation</strong> e <strong>Luminance</strong>.
          </p>
          <p className="font-sans font-bold text-neutral-900 text-xl">
            Selecionou?
          </p>
          <p>
            Agora você consegue fazer a alteração sem precisar mexer na imagem inteira.
          </p>
          <p>
            Isso é fundamental quando você começa a fazer correções secundárias.
          </p>

          <div className="space-y-4 bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 my-4 font-sans">
            <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
              <span className="text-neutral-800">Quer mudar só aquele produto?</span>
              <span className="font-bold text-[#0071e3]">Seleciona.</span>
            </div>
            <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
              <span className="text-neutral-800">Quer reduzir a saturação de uma determinada área?</span>
              <span className="font-bold text-[#0071e3]">Seleciona.</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-800">Quer trocar a tonalidade de uma cor?</span>
              <span className="font-bold text-[#0071e3]">Seleciona.</span>
            </div>
          </div>

          <p className="font-sans font-bold text-neutral-900 text-lg">
            Depois você faz o ajuste.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 11 — POWER WINDOWS
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>MÁSCARAS VETORIAIS</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          POWER WINDOWS
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            O Power Window funciona de outra maneira.
          </p>
          <p>
            Aqui você cria uma área específica dentro da imagem.
          </p>
          <p>
            Pode ser um círculo, um quadrado, uma forma desenhada à mão...
          </p>
          <p>
            Você define a região e aplica a correção ali.
          </p>
          <p className="font-sans font-semibold text-neutral-900 bg-[#f5f5f7] p-5 rounded-xl border border-neutral-200">
            É muito usado para chamar atenção para uma determinada área, corrigir uma região da imagem ou controlar a luminosidade de uma parte específica.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 12 — TRACKER
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>RASTREAMENTO DE MOVIMENTO</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          TRACKER
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p className="font-sans font-bold text-neutral-900 text-lg">
            Criou uma Window e o objeto se mexe?
          </p>
          <p>
            Aí você usa o Tracker.
          </p>
          <p>
            Ele analisa o movimento da imagem e tenta acompanhar aquela região.
          </p>
          <p>
            Então você não precisa ficar reposicionando a máscara quadro por quadro.
          </p>
          <p className="font-sans font-semibold text-[#0071e3] text-xl">
            Faz o track e deixa o Resolve acompanhar.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 13 — MAGIC MASK
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>MÁSCARA POR INTELIGÊNCIA ARTIFICIAL</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          MAGIC MASK
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Quando você precisa isolar um objeto ou uma pessoa de maneira mais automática, entra o Magic Mask.
          </p>

          <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
            <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
              “Isso daqui é o Magic Mask.”
            </p>
          </blockquote>

          <p>
            Ele identifica o elemento que você quer selecionar e cria a máscara.
          </p>
          <p className="font-sans font-semibold text-neutral-900 bg-[#f5f5f7] p-5 rounded-xl border border-neutral-200">
            É uma ferramenta muito útil para situações em que fazer a seleção manualmente daria muito trabalho.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 14 — BLUR E SHARPEN
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>NITIDEZ E DESFOQUE</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          BLUR E SHARPEN
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Aqui você controla a nitidez e o desfoque da imagem.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans my-4">
            <div className="p-4 bg-[#f5f5f7] rounded-xl border border-neutral-200">
              <strong className="block text-neutral-900 text-base mb-1">Blur</strong>
              <span className="text-sm text-neutral-600">Suaviza a imagem e suas texturas.</span>
            </div>
            <div className="p-4 bg-[#f5f5f7] rounded-xl border border-neutral-200">
              <strong className="block text-neutral-900 text-base mb-1">Sharpen</strong>
              <span className="text-sm text-neutral-600">Aumenta a percepção de nitidez nos contornos.</span>
            </div>
          </div>
          <p>
            São ferramentas simples, mas precisam ser usadas com cuidado.
          </p>
          <p className="font-sans font-semibold text-amber-800 bg-amber-500/10 p-5 rounded-xl border border-amber-500/20">
            É muito fácil exagerar no sharpen e começar a criar uma imagem artificial.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 15 — KEY
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>OPACIDADE & INTENSIDADE DO NODE</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          KEY
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            O Key mostra a informação de transparência e o quanto aquele node está afetando a imagem.
          </p>
          <p>
            Então você consegue controlar a intensidade daquele tratamento.
          </p>
          <p className="font-sans font-bold text-neutral-900 text-lg">
            Fez uma correção e ficou forte demais?
          </p>
          <p>
            Você não precisa necessariamente refazer tudo.
          </p>
          <p className="font-sans font-semibold text-[#0071e3] text-lg">
            Pode simplesmente reduzir a intensidade do node.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 16 — SIZING
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>TRANSFORMAÇÃO E ENQUADRAMENTO</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          SIZING
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            No Sizing, você consegue fazer ajustes relacionados ao enquadramento e à transformação da imagem.
          </p>
          <p>
            Zoom, posição, rotação e outros controles desse tipo.
          </p>
          <p className="font-sans font-semibold text-neutral-700 bg-[#f5f5f7] p-5 rounded-xl border border-neutral-200">
            É uma parte mais operacional da página Color, mas também pode ser útil dependendo do trabalho.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 17 — SCOPES
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>MONITORAMENTO DE SINAL</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          SCOPES
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            E aqui tem uma coisa que eu recomendo você começar a usar desde cedo.
          </p>
          <p className="font-sans font-bold text-neutral-900 text-2xl">
            Os Scopes.
          </p>
          <p>
            Porque color não é só ficar olhando para a imagem.
          </p>
          <p>
            A gente também precisa entender o que está acontecendo com o sinal.
          </p>

          <div className="space-y-3 bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 my-4 font-sans">
            <div>
              <strong className="text-neutral-900 block">Na Waveform:</strong>
              <span className="text-neutral-600 text-sm">Você acompanha a luminosidade geral da cena.</span>
            </div>
            <div>
              <strong className="text-neutral-900 block">No Parade:</strong>
              <span className="text-neutral-600 text-sm">Você consegue olhar a intensidade separada de cada canal.</span>
            </div>
            <div>
              <strong className="text-neutral-900 block">No Vector Scope:</strong>
              <span className="text-neutral-600 text-sm">Você vê a distribuição das cores dentro do espectro visível.</span>
            </div>
          </div>

          <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
            <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
              “Aqui eu tenho o Vector Scope, onde eu consigo ver a distribuição de cores através do espectro visível.”
            </p>
          </blockquote>

          <p>
            Não precisa ficar olhando scope o tempo inteiro.
          </p>
          <p className="font-sans font-bold text-neutral-900 text-lg">
            Mas é bom saber o que ele está te mostrando.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 18 — SPLIT SCREEN
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>COMPARAÇÃO VISUAL</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          SPLIT SCREEN
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Quando você começa a fazer color, uma hora vai precisar comparar imagens.
          </p>
          <p className="font-sans font-bold text-neutral-900 text-lg">
            Aí entra o Split Screen.
          </p>
          <p>
            Ele divide a tela para você conseguir comparar diferentes imagens ou referências.
          </p>
          <p className="font-sans font-semibold text-[#0071e3] bg-[#f5f5f7] p-5 rounded-xl border border-neutral-200">
            É especialmente útil quando você está tentando manter consistência entre planos.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 19 — GALLERY
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>STILLS & REFERÊNCIAS</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          GALLERY
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            A Gallery serve para guardar referências e stills.
          </p>
          <p>
            Você pode fazer uma correção, pegar aquele frame e salvar como still.
          </p>

          <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
            <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
              “Qualquer color e botão direito, Grab Still.”
            </p>
          </blockquote>

          <p>
            Depois você pode usar esse still como referência ou aplicar o mesmo tratamento em outro plano.
          </p>
          <p className="font-sans font-semibold text-neutral-900">
            Quando você começa a trabalhar com vários planos, isso ajuda bastante.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 20 — COLOR MATCH
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>EQUALIZAÇÃO MULTICÂMERA</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          COLOR MATCH
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Quando você tem imagens de câmeras diferentes, precisa colocar tudo para conversar:
          </p>

          <div className="grid grid-cols-2 gap-3 font-sans text-sm text-neutral-700 my-3">
            <div className="p-3 bg-[#f5f5f7] rounded-xl border border-neutral-200">Uma câmera pode estar mais quente.</div>
            <div className="p-3 bg-[#f5f5f7] rounded-xl border border-neutral-200">Outra pode estar mais fria.</div>
            <div className="p-3 bg-[#f5f5f7] rounded-xl border border-neutral-200">Uma pode ter mais contraste.</div>
            <div className="p-3 bg-[#f5f5f7] rounded-xl border border-neutral-200">Outra menos.</div>
          </div>

          <p>
            O Color Match ajuda a fazer essa equalização inicial.
          </p>

          <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-7 shadow-xs">
            <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
              “Normalmente, quando você trabalha com mais de uma câmera e aí você tem que equalizar todas elas, a gente usa o Color Match.”
            </p>
          </blockquote>

          <p className="font-sans font-semibold text-neutral-900 text-lg">
            Depois disso você parte para o tratamento criativo.
          </p>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 21 — ATALHOS QUE VOCÊ PRECISA COMEÇAR A USAR
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>PRODUTIVIDADE & TECLADO</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          ATALHOS QUE VOCÊ PRECISA COMEÇAR A USAR
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Não precisa decorar vinte atalhos agora.
          </p>
          <p className="font-sans font-bold text-neutral-900 text-xl">
            Começa pelos que realmente aceleram o trabalho:
          </p>

          <div className="space-y-3 font-sans pt-2">
            {/* Shift + H */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/80 transition-colors gap-2">
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-800 shadow-xs">
                  Shift + H
                </kbd>
              </div>
              <span className="text-sm text-neutral-700">Liga e desliga o Highlight para visualizar a seleção de uma ferramenta.</span>
            </div>

            {/* Alt + S */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/80 transition-colors gap-2">
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-800 shadow-xs">
                  Alt + S
                </kbd>
              </div>
              <span className="text-sm text-neutral-700">Cria um novo Serial Node.</span>
            </div>

            {/* Shift + D */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/80 transition-colors gap-2">
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-800 shadow-xs">
                  Shift + D
                </kbd>
              </div>
              <span className="text-sm text-neutral-700">Liga e desliga o bypass do grade para comparar a imagem antes e depois.</span>
            </div>

            {/* Ctrl/Cmd + D */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/80 transition-colors gap-2">
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-800 shadow-xs">
                  Ctrl / Cmd + D
                </kbd>
              </div>
              <span className="text-sm text-neutral-700">Desativa ou ativa o node selecionado.</span>
            </div>

            {/* S */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/80 transition-colors gap-2">
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-800 shadow-xs">
                  S
                </kbd>
              </div>
              <span className="text-sm text-neutral-700">Seleciona o node atual como referência para fluxos de comparação e navegação.</span>
            </div>

            {/* Ctrl/Cmd + C / Ctrl/Cmd + V */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/80 transition-colors gap-2">
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-800 shadow-xs">
                  Cmd / Ctrl + C
                </kbd>
                <span className="text-neutral-400">/</span>
                <kbd className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-800 shadow-xs">
                  Cmd / Ctrl + V
                </kbd>
              </div>
              <span className="text-sm text-neutral-700">Copia e cola informações do tratamento.</span>
            </div>

            {/* Space */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/80 transition-colors gap-2">
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-800 shadow-xs">
                  Space
                </kbd>
              </div>
              <span className="text-sm text-neutral-700">Reproduz e pausa a timeline.</span>
            </div>

            {/* ← / → */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/80 transition-colors gap-2">
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-800 shadow-xs">
                  ←
                </kbd>
                <span className="text-neutral-400">/</span>
                <kbd className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-800 shadow-xs">
                  →
                </kbd>
              </div>
              <span className="text-sm text-neutral-700">Avança ou volta um frame.</span>
            </div>

            {/* Shift + ← / Shift + → */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/80 transition-colors gap-2">
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-800 shadow-xs">
                  Shift + ←
                </kbd>
                <span className="text-neutral-400">/</span>
                <kbd className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 font-mono text-xs font-bold text-neutral-800 shadow-xs">
                  Shift + →
                </kbd>
              </div>
              <span className="text-sm text-neutral-700">Avança ou volta vários frames de maneira mais rápida.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 22 — O QUE VOCÊ PRECISA GUARDAR
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>FUNDAMENTOS</span>
          <span>SÍNTESE DA AULA</span>
        </div>

        <h2 className="font-sans font-black text-[26px] sm:text-[36px] lg:text-[42px] tracking-tight uppercase leading-[1.0] text-[#0071e3] my-4">
          O QUE VOCÊ PRECISA GUARDAR
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <div className="font-serif text-lg text-neutral-800 leading-[1.7] space-y-5">
          <p>
            Você não precisa sair dessa aula sabendo cada botão do DaVinci Resolve.
          </p>
          <p>
            O que você precisa é bater o olho na página Color e saber:
          </p>
          <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 font-sans text-neutral-900 font-bold text-lg text-center">
            Onde eu estou, onde está a ferramenta que preciso e o que ela faz.
          </div>
          <p>
            Depois, conforme você for trabalhando, essas ferramentas vão ficando naturais.
          </p>

          <blockquote className="bg-[#0071e3] text-white p-6 sm:p-8 rounded-2xl my-7 shadow-md">
            <p className="font-serif italic font-medium text-2xl sm:text-3xl leading-snug text-center !mb-0">
              “É isso. Simples assim.”
            </p>
          </blockquote>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200/80 flex items-center justify-between text-xs font-sans text-neutral-500">
          <span>COLOR MASTER® · DA VINCI RESOLVE</span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <CheckCircle2 size={14} /> Aula 01 Concluível
          </span>
        </div>
      </section>
    </article>
  );
}
