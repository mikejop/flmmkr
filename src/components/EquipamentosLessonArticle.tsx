import React from 'react';

export default function EquipamentosLessonArticle() {
  return (
    <article className="w-full text-[#111111] font-serif select-text leading-relaxed relative space-y-10">

      {/* ===================================================================
          SEÇÃO 1 — Introdução: O Que Realmente Importa & A Hierarquia
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300">
        {/* Kicker neutro */}
        <div className="font-serif text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>EQUIPAMENTOS PARA YOUTUBERS</span>
          <span>2026</span>
        </div>

        {/* Headline */}
        <h1 className="font-sans font-black text-[32px] sm:text-[48px] lg:text-[60px] tracking-tight uppercase leading-[0.95] text-[#0071e3] my-6">
          O QUE REALMENTE IMPORTA
        </h1>

        {/* Linha divisória */}
        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        {/* IMAGEM — full-width no topo do bloco */}
        <div className="w-full h-[45vh] max-h-[540px] bg-black overflow-hidden relative rounded-2xl border border-neutral-200 mb-8 transition-all duration-300">
          <img
            src="/img/o que importa.webp"
            alt="Equipamentos em cima da mesa"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 right-4 text-[12px] font-sans text-white/90 italic backdrop-blur-md bg-black/40 px-3 py-1 rounded-full border border-white/20">
            Equipamentos em cima da mesa
          </div>
        </div>

        {/* Citação Inicial em Destaque Editorial */}
        <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-8 shadow-xs">
          <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug transition-all duration-300 !mb-0">
            “Se você entrar no YouTube agora e pesquisar sobre equipamentos para YouTubers, vai encontrar vídeos que se contradizem. Uns dizem que equipamento não importa. Outros dizem que importa e já começam a indicar quais câmeras, lentes e luzes você deveria comprar.”
          </p>
        </blockquote>

        {/* Corpo 2 colunas — Tese e Hierarquia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 font-serif text-lg text-neutral-800 leading-[1.65] mb-6 transition-all duration-300">
          <div className="space-y-5">
            <p>
              Pois bem. Equipamento importa, sim. Sem ele, não tem vídeo. A questão é que ele não importa do jeito que muita gente pensa.
            </p>
            <p>
              A primeira coisa que você precisa entender é que a hierarquia de prioridades está errada. Normalmente, todo mundo pensa primeiro na câmera, depois na lente e só por último na luz. Eu faria exatamente o contrário: <strong className="font-sans text-neutral-900">luz, lente e câmera.</strong>
            </p>
          </div>

          <div className="space-y-5">
            <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#0071e3] uppercase tracking-tight">
              E A PRINCIPAL FONTE DESSA INFORMAÇÃO É A LUZ
            </h2>
            <p>
              A luz é o que mais influencia a aparência da imagem. E você nem precisa comprar uma luz para começar. A luz do Sol é uma das melhores fontes que existem. Uma janela pode ser suficiente para fazer um vídeo muito bonito, mesmo usando um celular simples.
            </p>
          </div>
        </div>

        {/* Highlight Callout */}
        <blockquote className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-6 shadow-xs">
          <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug transition-all duration-300 !mb-0">
            “Muita gente tenta resolver com equipamento um problema que poderia ser resolvido mudando a posição da pessoa, da câmera ou da fonte de luz.”
          </p>
        </blockquote>
      </section>

      {/* ===================================================================
          SEÇÃO 2 — A Lente e A Câmera (Hierarquia Visual)
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative transition-all duration-300">
        <div className="font-serif text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>EQUIPAMENTOS PARA YOUTUBERS</span>
          <span>HIERARQUIA VISUAL</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 font-serif text-lg text-neutral-800 leading-[1.65] my-6 transition-all duration-300">
          {/* Coluna Lente */}
          <div className="space-y-5">
            <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#0071e3] uppercase tracking-tight">
              DEPOIS DA LUZ, VEM A LENTE
            </h2>
            <p>
              Depois vem a lente. Ela conduz a luz até o sensor e influencia diretamente a nitidez, o contraste, a quantidade de luz que chega à câmera, o campo de visão e a profundidade de campo. Mas ela também dá personalidade à imagem. Uma grande angular, uma lente normal e uma teleobjetiva não mostram o mesmo ambiente da mesma maneira.
            </p>
            <p className="font-sans font-semibold text-neutral-900 bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
              Por isso, uma boa lente pode fazer mais diferença na imagem do que trocar de câmera.
            </p>
          </div>

          {/* Coluna Câmera */}
          <div className="space-y-5">
            <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#0071e3] uppercase tracking-tight">
              E AÍ VEM A CÂMERA
            </h2>
            <p>
              Ela é importante, claro. Uma câmera melhor consegue entregar mais alcance dinâmico, trabalhar melhor em pouca luz, registrar mais informação e oferecer mais possibilidades na hora de finalizar o vídeo. Só que a função dela é registrar o que você colocou na frente dela.
            </p>

            <div className="bg-[#f5f5f7] p-5 rounded-xl border-l-4 border-[#0071e3]">
              <p className="font-sans font-semibold text-[#111111] !mb-0 leading-snug">
                Se a luz está ruim, ela registra uma luz ruim.
              </p>
              <p className="font-serif italic text-neutral-700 !mt-0 !mb-0 leading-snug">
                Se a lente não entrega uma boa imagem, a câmera não vai fazer milagre.
              </p>
            </div>
          </div>
        </div>

        {/* Citação em Destaque Central */}
        <blockquote className="bg-[#0071e3] text-white p-8 sm:p-10 rounded-2xl my-8 shadow-md transition-all duration-300">
          <p className="font-serif italic font-medium text-xl sm:text-2xl leading-snug text-center !mb-0">
            “A luz dá qualidade à imagem. A lente dá nitidez, contraste e personalidade. A câmera registra e entrega os dados para você finalizar essa imagem.”
          </p>
        </blockquote>
      </section>

      {/* ===================================================================
          SEÇÃO 3 — É Por Isso Que Essa Ordem Importa (Transição)
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative transition-all duration-300">
        <div className="font-serif text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>EQUIPAMENTOS PARA YOUTUBERS</span>
          <span>MUDANÇA DE PERSPECTIVA</span>
        </div>

        <h2 className="font-sans font-black text-[28px] sm:text-[36px] lg:text-[44px] tracking-tight uppercase leading-[0.95] text-[#0071e3] my-4">
          É POR ISSO QUE ESSA ORDEM IMPORTA
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        {/* Imagem do Mosaico */}
        <div className="w-full h-[40vh] max-h-[480px] bg-black overflow-hidden relative rounded-2xl border border-neutral-200 mb-8 transition-all duration-300">
          <img
            src="/img/Photo-Album-1---005.webp"
            alt="Mosaico dos quatro tipos de equipamentos"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 font-serif text-lg text-neutral-800 leading-[1.65] my-6 transition-all duration-300">
          <div className="space-y-5">
            <p>
              Antes de pensar em trocar de câmera, olha para a luz. Depois, olha para a lente. Só então veja se a câmera realmente está limitando o resultado que você quer alcançar.
            </p>
            <p>
              E é isso que vamos fazer neste capítulo. Não vou simplesmente listar equipamentos caros e dizer quais são os melhores. Quero te mostrar para que cada equipamento serve, quais características realmente importam e em que situação vale a pena investir.
            </p>
          </div>

          <div className="space-y-5">
            <p>
              Porque uma coisa é comprar equipamento porque alguém disse que ele é bom.
            </p>
            <p className="font-sans font-semibold text-[#0071e3]">
              Outra é saber exatamente por que você precisa dele.
            </p>
            <div className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] shadow-xs">
              <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug transition-all duration-300 !mb-0">
                “Essa diferença pode economizar uma boa grana.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 4 — Tipos de Luzes para Filmagem (PRIORIDADE #1 NA HIERARQUIA)
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative transition-all duration-300">
        <div className="font-serif text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>EQUIPAMENTOS PARA YOUTUBERS</span>
          <span>GUIA PRÁTICO DE ILUMINAÇÃO</span>
        </div>

        <h2 className="font-sans font-black text-[28px] sm:text-[40px] lg:text-[48px] tracking-tight uppercase text-[#0071e3] my-4">
          TIPOS DE LUZES PARA FILMAGEM
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <p className="font-sans font-normal text-xl leading-[1.45] text-[#111111] mb-6 transition-all duration-300">
          Você não precisa de equipamentos caros para ter uma imagem bonita, interessante e com personalidade. Antes de investir em iluminação artificial, o primeiro passo é dominar a luz que você já tem à disposição — como a luz natural de uma janela, que frequentemente supera vários LEDs mal posicionados.
        </p>

        <p className="font-serif text-lg text-neutral-800 leading-[1.65] mb-8">
          Na iluminação artificial, cada tipo de fonte atende a uma necessidade específica. A escolha ideal depende do seu objetivo de produção, da praticidade que você busca e do seu orçamento.
        </p>

        {/* Grid dos Tipos de Luzes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-serif text-lg text-neutral-800 leading-[1.65] mb-8">

          {/* 1. COB */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              1. COB (Chip on Board)
            </h3>
            <p>
              As luzes COB têm os LEDs concentrados em uma área pequena e funcionam perfeitamente com modificadores (softbox, refletor, fresnel, grid). Uma única luz pode assumir funções totalmente diferentes.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Versatilidade e alta potência. Pode se transformar em uma luz grande e suave (com softbox) ou em uma luz dura e direcionada.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                A luz sozinha precisa de modificadores e tripés robustos para ser aproveitada, ocupando mais espaço no ambiente.
              </p>
            </div>
          </div>

          {/* 2. Painéis LED */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              2. PAINÉIS LED
            </h3>
            <p>
              Populares pela praticidade de montagem, os painéis já possuem uma área de emissão nativamente grande para posicionar e gravar rapidamente.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Praticidade e rapidez. Coloca no tripé, ajusta a intensidade e está pronto para gravações em casa.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Menor variedade de modificadores. Se o painel for pequeno e ficar muito perto, gera uma luz mais dura do que o esperado.
              </p>
            </div>
          </div>

          {/* 3. Tubos LED */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              3. TUBOS LED
            </h3>
            <p>
              Extremamente versáteis, os tubos iluminam e também podem fazer parte do próprio cenário como luz de recorte ou ambientação.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Liberdade de composição. Acrescenta cor e profundidade ao cenário sem ocupar espaço no chão.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Potência menor. Funciona muito mais como ferramenta complementar do que como luz principal do rosto.
              </p>
            </div>
          </div>

          {/* 4. Fresnel */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              4. FRESNEL
            </h3>
            <p>
              Sistema óptico com lente desenhado para focar, controlar e concentrar o feixe de uma fonte luminosa.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Controle absoluto sobre onde a luz deve e não deve chegar na cena.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Equipamento mais caro e específico. Não costuma ser a primeira compra para quem grava no YouTube.
              </p>
            </div>
          </div>

          {/* 5. Luzes RGB */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              5. LUZES RGB
            </h3>
            <p>
              Reproduzem diversas cores para criar atmosferas estilizadas e separar o criador do fundo do cenário.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Possibilidade criativa para dar identidade visual e destacar a profundidade do estúdio.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ REGRA DE OURO
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                RGB não salva um rosto mal iluminado! Primeiro você ilumina bem a pessoa; depois pensa na cor do fundo.
              </p>
            </div>
          </div>

          {/* 6. Ring Light */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              6. RING LIGHT
            </h3>
            <p>
              Luz circular em torno da câmera para iluminação frontal uniforme em maquiagem, beleza e lives.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Preço baixo, fácil montagem e iluminação uniforme de preenchimento frontal.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Reduz o contraste (imagem chapada) e gera o reflexo circular característico nos olhos.
              </p>
            </div>
          </div>

        </div>

        {/* Conceito de Luz Dura e Suave */}
        <div className="bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-8 space-y-3">
          <h3 className="font-sans font-bold text-xl text-[#0071e3]">
            Luz Dura vs. Luz Suave: O Tamanho Aparente da Fonte
          </h3>
          <p className="font-serif text-lg text-neutral-800 leading-relaxed !mb-0">
            Uma fonte pequena e distante produz <strong>luz dura</strong> (sombras marcadas). Uma fonte grande e próxima produz <strong>luz suave</strong> (transições delicadas). É por isso que uma COB com um softbox grande gera uma luz totalmente diferente da mesma COB sem modificador.
          </p>
        </div>

        {/* Guia de Decisão de Iluminação */}
        <div className="bg-[#0071e3] text-white p-8 sm:p-10 rounded-2xl my-8 shadow-md">
          <h3 className="font-sans font-black text-xl sm:text-2xl uppercase mb-4 text-center">
            QUAL LUZ EU DEVERIA COMPRAR?
          </h3>
          <ul className="font-serif text-lg space-y-3 max-w-2xl mx-auto list-disc list-inside">
            <li><strong>Começando?</strong> Aproveite a luz natural (janelas) antes de investir dinheiro.</li>
            <li><strong>Primeira fonte artificial versátil?</strong> Uma luz COB com um bom softbox.</li>
            <li><strong>Praticidade e rapidez?</strong> Um painel LED.</li>
            <li><strong>Personalidade de cenário?</strong> Tubo LED ou luz RGB para o fundo.</li>
          </ul>
          <div className="mt-6 pt-6 border-t border-white/20 text-center font-serif italic text-lg sm:text-xl text-white/95">
            “Uma única luz bem usada costuma ser muito mais útil do que três ou quatro luzes mal usadas. Iluminação não é sobre quantas lâmpadas você tem, mas sobre como você usa a luz que tem.”
          </div>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 5 — Tipos de Câmeras
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative transition-all duration-300">
        <div className="font-serif text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>EQUIPAMENTOS PARA YOUTUBERS</span>
          <span>GUIA PRÁTICO DE CÂMERAS</span>
        </div>

        <h2 className="font-sans font-black text-[28px] sm:text-[40px] lg:text-[48px] tracking-tight uppercase text-[#0071e3] my-4">
          TIPOS DE CÂMERAS
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <p className="font-sans font-normal text-xl leading-[1.45] text-[#111111] mb-8 transition-all duration-300">
          Não existe uma câmera universalmente superior para todas as situações. Cada categoria foi desenvolvida para atender a necessidades específicas de mobilidade, controle manual e estilo de produção.
        </p>

        {/* Grid dos Tipos de Câmera */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-serif text-lg text-neutral-800 leading-[1.65] mb-8">
          
          {/* 1. Celular */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              1. CELULAR
            </h3>
            <p>
              O celular é provavelmente a câmera mais fácil de recomendar para quem está começando. Ele é pequeno, está sempre com você e permite gravar, editar e publicar praticamente no mesmo aparelho. Para Shorts, vlogs, vídeos externos, bastidores e conteúdos em que você precisa de agilidade, ele funciona muito bem.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Praticidade total. Você não precisa trocar lente, montar um rig ou carregar uma mochila. Com uma boa iluminação, até um celular simples entrega uma imagem de muita qualidade.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Controle limitado às lentes, ao sensor e aos recursos que o aparelho oferece, sem liberdade para construir a imagem com lentes intercambiáveis.
              </p>
            </div>

            <p className="font-sans font-semibold text-neutral-900 bg-white p-4 rounded-xl border border-neutral-200 !mb-0">
              Se o celular resolve o que você precisa, não existe motivo para trocar por uma câmera só para dizer que está usando uma câmera.
            </p>
          </div>

          {/* 2. Câmeras Compactas */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              2. CÂMERAS COMPACTAS
            </h3>
            <p>
              As compactas ficam em um meio-termo interessante. São pequenas, relativamente simples de operar e, dependendo do modelo, entregam uma qualidade de imagem bem superior à de muitos celulares.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Praticidade com câmera dedicada sem precisar montar um sistema inteiro. Ótima para vlogs, viagens e conteúdo externo.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Simplicidade e limitação óptica. Na maioria dos modelos a lente é fixa e há pouco espaço para expandir o sistema com o tempo.
              </p>
            </div>
          </div>

          {/* 3. Câmeras Mirrorless */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              3. CÂMERAS MIRRORLESS
            </h3>
            <p>
              Aqui começa a ficar realmente interessante para quem quer ter mais controle sobre a imagem. As mirrorless permitem trocar de lente, trabalhar com diferentes distâncias focais e montar o equipamento de acordo com o tipo de produção.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Flexibilidade total. Permite construir o sistema aos poucos e utilizar a mesma câmera para YouTube, fotos e produções comerciais.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Mais decisões e custos. Exige escolher lentes, entender exposição, pensar em acessórios e evitar transformar a gravação em um projeto de engenharia.
              </p>
            </div>

            <p className="font-sans font-semibold text-neutral-900 bg-white p-4 rounded-xl border border-neutral-200 !mb-0">
              Para YouTube, não precisa virar um projeto de engenharia.
            </p>
          </div>

          {/* 4. DSLR */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              4. DSLR
            </h3>
            <p>
              As DSLR tiveram um papel enorme na evolução do vídeo digital e ajudaram a popularizar aquela estética com sensor maior, lentes intercambiáveis e profundidade de campo evidente.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Excelente custo-benefício no mercado de usados para quem tem orçamento mais limitado.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Tecnologia de vídeo menos moderna, corpos maiores e menor praticidade em comparação às mirrorless atuais.
              </p>
            </div>

            <p className="font-sans font-semibold text-neutral-900 bg-white p-4 rounded-xl border border-neutral-200 !mb-0">
              Se você já tem uma DSLR, usa ela. Se vai comprar nova, olhe para as mirrorless.
            </p>
          </div>

          {/* 5. Câmeras de Cinema */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              5. CÂMERAS DE CINEMA
            </h3>
            <p>
              As câmeras de cinema são feitas pensando em produção audiovisual robusta, com formatos de arquivo enriquecidos e maior latitude de cor.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Controle total e arquivos com densidade imensa de dados para graduação de cor e pós-produção.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Custo e complexidade muito elevados. Exige monitores, baterias externas, mídias rápidas e estrutura de equipe.
              </p>
            </div>

            <p className="font-sans font-semibold text-[#0071e3] bg-white p-4 rounded-xl border border-neutral-200 !mb-0">
              Usar uma câmera de cinema não faz automaticamente o vídeo parecer cinematográfico.
            </p>
          </div>

          {/* 6. Camcorders */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              6. CAMCORDERS
            </h3>
            <p>
              As camcorders foram desenvolvidas para gravação contínua e operação rápida, com zoom óptico integrado e boa ergonomia.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Gravação por longas horas sem sobreaquecer, pronta para eventos, entrevistas e jornalismo.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Menor flexibilidade estética e incapacidade de trocar de lentes para criar desfoque acentuado.
              </p>
            </div>
          </div>

        </div>

        {/* Resumo Prático dos Tipos de Câmera */}
        <div className="bg-[#0071e3] text-white p-8 sm:p-10 rounded-2xl my-8 shadow-md">
          <h3 className="font-sans font-black text-xl sm:text-2xl uppercase mb-4 text-center">
            NO FINAL, ESCOLHER UMA CÂMERA É MUITO MAIS SIMPLES DO QUE PARECE:
          </h3>
          <ul className="font-serif text-lg space-y-2 max-w-2xl mx-auto list-disc list-inside">
            <li><strong>Quer praticidade?</strong> Celular ou compacta.</li>
            <li><strong>Quer mais controle e possibilidade de crescer?</strong> Mirrorless.</li>
            <li><strong>Já tem uma DSLR?</strong> Continue usando.</li>
            <li><strong>Precisa de um fluxo de produção mais elaborado?</strong> Câmera de cinema.</li>
            <li><strong>Precisa gravar por horas com agilidade?</strong> Camcorder.</li>
          </ul>
          <div className="mt-6 pt-6 border-t border-white/20 text-center font-sans font-bold text-lg sm:text-xl">
            O importante é não começar pela pergunta "qual câmera é melhor?", mas sim: <br className="hidden sm:inline" />
            <span className="underline decoration-2 underline-offset-4">"O que eu preciso que essa câmera faça?"</span>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SEÇÃO 6 — Tipos de LENTES
          =================================================================== */}
      <section className="w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative transition-all duration-300">
        <div className="font-serif text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
          <span>EQUIPAMENTOS PARA YOUTUBERS</span>
          <span>GUIA PRÁTICO DE LENTES</span>
        </div>

        <h2 className="font-sans font-black text-[28px] sm:text-[40px] lg:text-[48px] tracking-tight uppercase text-[#0071e3] my-4">
          TIPOS DE LENTES
        </h2>

        <div className="h-[2px] bg-[#0071e3] w-full my-6" />

        <p className="font-sans font-normal text-xl leading-[1.45] text-[#111111] mb-6 transition-all duration-300">
          A lente determina a estética, a nitidez e a perspectiva da imagem. Uma câmera excelente não compensa o uso de uma lente inadequada para a cena.
        </p>

        <p className="font-serif text-lg text-neutral-800 leading-[1.65] mb-8">
          A principal característica a observar é a distância focal (medida em milímetros, como 24 mm, 35 mm ou 50 mm), que define o campo de visão e o nível de enquadramento do ambiente.
        </p>

        {/* Grid dos Tipos de Lentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-serif text-lg text-neutral-800 leading-[1.65] mb-8">

          {/* 1. Grande Angular */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              1. GRANDE ANGULAR (Abaixo de 35mm)
            </h3>
            <p>
              As grande angulares são ótimas quando você precisa mostrar bastante coisa dentro do quadro, especialmente para quem grava em quartos pequenos e escritórios.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Enquadra mais espaço estando perto do assunto e valoriza cenários bem trabalhados.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Distorção facial em close-ups (rosto pode ficar estranho de perto) e revela cenários bagunçados.
              </p>
            </div>
          </div>

          {/* 2. Lentes Normais */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              2. LENTES NORMAIS (35mm a 50mm)
            </h3>
            <p>
              As lentes entre 35 mm e 50 mm são um meio-termo natural sem exagerar a perspectiva da imagem.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Altíssima versatilidade e estética natural que se adapta facilmente a diferentes tipos de gravação.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Em ambientes muito pequenos, uma 50 mm pode fechar demais o quadro por falta de espaço físico.
              </p>
            </div>
          </div>

          {/* 3. Teleobjetivas */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              3. TELEOBJETIVAS (Acima de 70mm)
            </h3>
            <p>
              Permitem enquadramentos mais fechados e criam excelente destaque para a pessoa, separando o assunto do fundo.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Excelente desfoque de fundo (bokeh) e compressão de perspectiva elegante sem deformar as feições do rosto.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Exige grande distância física entre a câmera e o criador de conteúdo.
              </p>
            </div>
          </div>

          {/* 4. Lentes Fixas (Prime) */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              4. LENTES FIXAS (PRIME)
            </h3>
            <p>
              Possuem uma única distância focal. Para alterar o enquadramento, é necessário mover a própria câmera.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Aberturas grandes (ex: f/1.4, f/1.8), altíssima nitidez óptica, construção leve e preço acessível.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Falta de zoom mecânico, exigindo reposicionar a câmera fisicamente.
              </p>
            </div>
          </div>

          {/* 5. Lentes Zoom */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              5. LENTES ZOOM
            </h3>
            <p>
              Permitem alterar a distância focal sem trocar de lente ou parar a gravação.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Praticidade total para adaptar o enquadramento rapidamente durante as gravações.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ DESVANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Maior peso, dimensões e valor elevado para modelos com abertura constante muito luminosa (f/2.8).
              </p>
            </div>
          </div>

          {/* 6. Lentes Luminosas & Abertura */}
          <div className="bg-[#f5f5f7] p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-sans font-black text-xl text-[#0071e3] uppercase">
              6. LENTES LUMINOSAS
            </h3>
            <p>
              Aberturas como f/1.4 deixam passar muito mais luz e criam desfoques de fundo acentuados.
            </p>

            <div className="bg-emerald-500/10 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-emerald-700 uppercase tracking-wide text-xs block mb-1">
                ✓ VANTAGEM
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Excelente desempenho em ambientes com pouca iluminação e grande controle de profundidade de campo.
              </p>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-neutral-900 my-2">
              <strong className="font-sans font-bold text-amber-700 uppercase tracking-wide text-xs block mb-1">
                ⚠ PEGADINHA / ATENÇÃO
              </strong>
              <p className="font-serif text-base leading-relaxed !mb-0 text-neutral-800">
                Gravar muito perto em f/1.4 pode deixar um olho focado e o outro desfocado. Abertura grande é uma ferramenta, não um selo de qualidade!
              </p>
            </div>
          </div>

        </div>

        {/* Guia de Decisão de Lentes */}
        <div className="bg-[#0071e3] text-white p-8 sm:p-10 rounded-2xl my-8 shadow-md">
          <h3 className="font-sans font-black text-xl sm:text-2xl uppercase mb-4 text-center">
            E QUAL LENTE EU COMPRO?
          </h3>
          <p className="font-serif text-lg text-center max-w-2xl mx-auto mb-6 text-white/90">
            Para YouTube, comece pensando no espaço onde você grava:
          </p>
          <ul className="font-serif text-lg space-y-3 max-w-2xl mx-auto list-disc list-inside">
            <li><strong>Ambiente pequeno?</strong> Uma grande angular (ex: 24 mm) faz mais sentido.</li>
            <li><strong>Tem espaço e quer focar na pessoa?</strong> Uma 50 mm ou 85 mm pode ser ideal.</li>
            <li><strong>Quer fazer várias coisas sem ficar trocando?</strong> Uma zoom é mais prática.</li>
          </ul>
          <div className="mt-6 pt-6 border-t border-white/20 text-center font-serif italic text-lg sm:text-xl text-white/95">
            “Você não precisa ter cinco lentes. Uma boa lente que funciona para o seu tipo de produção resolve praticamente tudo. Lente não é só uma peça que deixa a câmera mais cara — é uma das ferramentas que mais mudam a aparência do seu vídeo.”
          </div>
        </div>
      </section>

    </article>
  );
}
