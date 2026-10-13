/**
 * Prévias PÚBLICAS das aulas (lidas por Google, Bing, DuckDuckGo e IAs de busca).
 *
 * REGRAS:
 *  - Cada tópico tem UM parágrafo de abertura (`opening`, até ~320 caracteres).
 *  - Nunca colocar passos, dicas, imagens ou vídeo da aula aqui.
 *  - Este arquivo NÃO pode importar src/data/data.ts nem os artigos (vazaria o texto completo no JS público).
 *  - Gerado como rascunho por scripts/generate-lesson-seo.mjs: REVISAR cada parágrafo antes do deploy.
 */
export interface LessonSeoTopic {
  id: string;
  heading: string;
  opening: string;
}

export interface LessonSeo {
  id: string;
  moduleSlug: string;
  moduleTitle: string;
  slug: string;
  title: string;
  metaDescription: string;
  learningOutcomes: string[];
  topics: LessonSeoTopic[];
}

/**
 * Interruptor de publicação. Enquanto for false, /aulas e /aulas/** respondem 404 e saem do
 * sitemap/IndexNow. Mude para true SÓ depois de revisar cada parágrafo abaixo.
 */
export const LESSON_SEO_PUBLISHED = false;

/** Data da última revisão do conteúdo público (usada no sitemap). */
export const LESSON_SEO_UPDATED_AT = '2026-10-13';

export const LESSON_SEO: LessonSeo[] = [
  {
    "id": "mod1-1",
    "moduleSlug": "fundamentos",
    "moduleTitle": "Fundamentos",
    "slug": "introducao-ao-davinci-resolve",
    "title": "Introdução ao DaVinci Resolve",
    "metaDescription": "O DaVinci Resolve é o padrão global da indústria cinematográfica e publicitária para pós-produção e tratamento de cor. Compreender a interface da página…",
    "learningOutcomes": [],
    "topics": [
      {
        "id": "primeiro-vamos-entender-o-davinci-resolve-1",
        "heading": "Primeiro, vamos entender o DaVinci resolve",
        "opening": "Antes de começar a mexer na imagem, vamos entender um pouco como o DaVinci Resolve funciona. Principalmente se você ainda não está muito familiarizado com o programa, porque a interface pode parecer meio confusa no começo. Tem bastante coisa na tela e, principalmente, tem ferramenta pra caramba."
      },
      {
        "id": "a-aba-color-2",
        "heading": "A aba color",
        "opening": "Quando você chega à página Color do DaVinci Resolve, encontra um ambiente pensado especificamente para transformar e finalizar a imagem."
      },
      {
        "id": "os-nodes-3",
        "heading": "Os nodes",
        "opening": "No DaVinci Resolve, o tratamento da imagem é construído por meio de uma sequência de nodes. Cada node recebe o sinal de imagem, aplica uma ou mais operações e envia o resultado para a etapa seguinte. Essa estrutura permite dividir o processo de correção e criação do look em partes independentes e organizadas."
      },
      {
        "id": "primarias-4",
        "heading": "Primárias",
        "opening": "As Primaries são o primeiro conjunto de ferramentas utilizado na construção da imagem dentro do processo de color grading. Elas permitem trabalhar a estrutura geral do plano, estabelecendo relações de exposição, contraste, balanço de cor e saturação antes das correções mais específicas."
      },
      {
        "id": "ferramentas-especificas-5",
        "heading": "Ferramentas específicas",
        "opening": "A ferramenta HDR do DaVinci Resolve permite controlar a imagem por meio de uma divisão mais precisa da faixa tonal. Em vez de trabalhar apenas com grandes grupos como sombras, médios e altas luzes, o HDR Palette oferece uma série de zonas tonais que podem ser ajustadas de forma independente."
      },
      {
        "id": "isolamento-6",
        "heading": "Isolamento",
        "opening": "O Qualifier é uma ferramenta de seleção que permite isolar partes da imagem a partir de características específicas da cor e da luminância. A seleção pode ser construída utilizando Hue, Saturation e Luminance, definindo com precisão quais valores serão incluídos ou excluídos da área selecionada."
      },
      {
        "id": "tracker-7",
        "heading": "Tracker",
        "opening": "O Tracker é a ferramenta responsável por acompanhar o movimento de elementos dentro do plano. Ele analisa o deslocamento, a escala e a perspectiva de uma determinada área da imagem e utiliza essas informações para fazer com que uma correção acompanhe esse movimento ao longo do tempo."
      },
      {
        "id": "magic-mask-8",
        "heading": "Magic mask",
        "opening": "O Magic Mask é uma ferramenta de seleção baseada em inteligência artificial que permite isolar pessoas, objetos e elementos específicos da imagem."
      },
      {
        "id": "blur-e-sharpen-9",
        "heading": "Blur e sharpen",
        "opening": "Blur e Sharpen controlam a percepção de definição e suavidade da imagem. Enquanto o Blur reduz a definição dos detalhes, o Sharpen aumenta a percepção de nitidez ao reforçar informações de alta frequência."
      },
      {
        "id": "key-10",
        "heading": "Key",
        "opening": "O Key controla a intensidade e o comportamento das informações de máscara, ou key, utilizadas dentro dos nodes. Essas informações determinam quanto de uma correção será aplicado à imagem e podem ser geradas por ferramentas como Qualifier, Power Windows e Magic Mask."
      },
      {
        "id": "sizing-11",
        "heading": "Sizing",
        "opening": "O Sizing reúne os controles responsáveis pela geometria e pelo enquadramento da imagem dentro do DaVinci Resolve. A ferramenta permite alterar a posição, escala, rotação e proporção do plano, além de controlar parâmetros relacionados ao enquadramento."
      },
      {
        "id": "scopes-12",
        "heading": "Scopes",
        "opening": "Os Scopes são ferramentas de análise que representam matematicamente as características do sinal de vídeo. Eles permitem avaliar informações de luminância, distribuição de cor, saturação e relação entre os canais RGB, oferecendo uma referência objetiva para as decisões de color grading."
      },
      {
        "id": "split-screen-13",
        "heading": "Split screen",
        "opening": "O Split Screen é uma ferramenta de comparação dentro da página Color. Ele permite visualizar duas ou mais imagens simultaneamente no Viewer, facilitando a análise das diferenças entre planos, versões ou referências."
      },
      {
        "id": "gallery-14",
        "heading": "Gallery",
        "opening": "A Gallery reúne as referências visuais e os tratamentos de cor salvos durante o trabalho. Nela, o colorista pode guardar stills dos planos, comparar diferentes versões e reutilizar grades em outros planos ou projetos."
      },
      {
        "id": "color-match-15",
        "heading": "Color match",
        "opening": "Quando você trabalha com duas ou três câmeras diferentes na mesma gravação, cada sensor tem uma resposta de cor particular. O Color Match utiliza cartelas de cor padronizadas ( ColorChecker ) filmadas no set para fazer o alinhamento técnico inicial."
      },
      {
        "id": "atalhos-que-voce-precisa-comecar-a-usar-16",
        "heading": "Atalhos que você precisa começar a usar",
        "opening": "O trabalho de color grading envolve centenas de pequenas ações repetidas ao longo de um projeto. Criar nodes, navegar entre planos, comparar imagens, ativar máscaras, salvar referências e verificar o resultado são operações que aparecem continuamente durante uma sessão de grading."
      }
    ]
  },
  {
    "id": "mod1-analise-tecnica",
    "moduleSlug": "fundamentos",
    "moduleTitle": "Fundamentos",
    "slug": "analise-tecnica",
    "title": "Análise Técnica",
    "metaDescription": "Antes de iniciar o tratamento de cor, faça uma leitura técnica do material para entender como a imagem foi capturada e identificar possíveis limitações.…",
    "learningOutcomes": [],
    "topics": [
      {
        "id": "profundidade-de-bits-1",
        "heading": "Profundidade de bits",
        "opening": "Quando uma câmera grava em 8, 10, 12 ou 16 bits, esse número indica quantos níveis digitais podem representar cada amostra do sinal. O sensor capta luz, e a câmera converte essas informações em valores numéricos que, depois do processamento, formam a imagem."
      },
      {
        "id": "quais-cameras-gravam-em-cada-profundidade-2",
        "heading": "Quais câmeras gravam em cada profundidade?",
        "opening": "Os exemplos abaixo ilustram possibilidades de gravação. A profundidade efetiva depende do modo, resolução, taxa de quadros e formato escolhidos; confirme sempre as especificações do modo de gravação usado."
      },
      {
        "id": "bits-nao-sao-latitude-3",
        "heading": "Bits não são latitude",
        "opening": "Indica quantos valores digitais estão disponíveis para representar cada amostra. A faixa dinâmica descreve a extensão entre os níveis de sinal mais baixos e mais altos que o sistema registra, de acordo com critérios definidos."
      },
      {
        "id": "chroma-subsampling-4",
        "heading": "Chroma subsampling",
        "opening": "Chroma subsampling, ou subamostragem de crominância, reduz a resolução espacial da informação de cor para diminuir a quantidade de dados do vídeo. A luminância — relacionada à estrutura de brilho e detalhes — permanece em resolução completa."
      },
      {
        "id": "profundidade-de-bits-nos-dispositivos-de-visualizacao-5",
        "heading": "Profundidade de bits nos dispositivos de visualização",
        "opening": "Monitores, televisores e celulares recebem um sinal de imagem, processam suas informações e as transformam em luz por meio dos pixels da tela. Nesse contexto, a profundidade de bits determina a precisão potencial para reproduzir gradações de cor e luminosidade."
      },
      {
        "id": "qual-profundidade-de-bits-devo-escolher-6",
        "heading": "Qual profundidade de bits devo escolher?",
        "opening": "A escolha depende do tipo de produção, da liberdade necessária na pós e da estrutura disponível para gravar, editar e armazenar o material. Um videomaker que produz para redes sociais, um filmmaker que grava videoclipes e um diretor de fotografia de publicidade podem ter necessidades bem diferentes."
      }
    ]
  },
  {
    "id": "mod1-2",
    "moduleSlug": "fundamentos",
    "moduleTitle": "Fundamentos",
    "slug": "gerenciamento-de-cores",
    "title": "Gerenciamento de Cores",
    "metaDescription": "O gerenciamento de cor correto no DaVinci Resolve garante que as informações capturadas pelo sensor da câmera em perfil Log sejam mapeadas com fidelidade…",
    "learningOutcomes": [],
    "topics": [
      {
        "id": "cst-1",
        "heading": "CST",
        "opening": "O nó CST (Color Space Transform) é o método nodal mais transparente e versátil do DaVinci Resolve. Ele permite aplicar uma conversão matemática precisa do Input Color Space e Input Gamma específicos da sua câmera diretamente na árvore de nós, mantendo controle manual absoluto sobre cada etapa do processamento."
      },
      {
        "id": "aces-2",
        "heading": "ACES",
        "opening": "A Academy Color Encoding System (ACES) é o padrão de gerenciamento de cores desenvolvido pela Academia de Cinema dos EUA. Ele transforma materiais de diferentes marcas e modelos de câmeras em um espaço de cor gigantesco e linear (ACEScg / ACEScc / ACEScct), garantindo consistência fotométrica perfeita em produções…"
      }
    ]
  },
  {
    "id": "mod1-3",
    "moduleSlug": "fundamentos",
    "moduleTitle": "Fundamentos",
    "slug": "como-fazer-a-analise-artistica-do-video",
    "title": "Como fazer a análise artística do vídeo",
    "metaDescription": "Antes de mexer em qualquer controle de cor, é indispensável realizar a análise analítica e estética do material. Isso envolve entender o gênero do…",
    "learningOutcomes": [],
    "topics": [
      {
        "id": "visao-geral-1",
        "heading": "Visão geral",
        "opening": "Antes de mexer em qualquer controle de cor, é indispensável realizar a análise analítica e estética do material. Isso envolve entender o gênero do produto, o contraste desejado, a iluminação da cena e cruzar o olhar artístico com a leitura dos Scopes (Waveform, RGB Parade, Vectorscope e Histograma)."
      }
    ]
  },
  {
    "id": "mod1-4",
    "moduleSlug": "fundamentos",
    "moduleTitle": "Fundamentos",
    "slug": "fluxo-de-trabalho",
    "title": "Fluxo de Trabalho",
    "metaDescription": "Um fluxo de trabalho profissional e organizado define a velocidade de entrega, evita retrabalho e garante a integridade dos arquivos durante todas as…",
    "learningOutcomes": [],
    "topics": [
      {
        "id": "visao-geral-1",
        "heading": "Visão geral",
        "opening": "Um fluxo de trabalho profissional e organizado define a velocidade de entrega, evita retrabalho e garante a integridade dos arquivos durante todas as etapas do projeto comercial."
      }
    ]
  },
  {
    "id": "mod2-1",
    "moduleSlug": "correcao-de-cor",
    "moduleTitle": "Correção de Cor",
    "slug": "primarias",
    "title": "Primárias",
    "metaDescription": "As correções primárias atuam sobre a totalidade da imagem. O objetivo é equilibrar a exposição, o contraste global e o balanço de branco, restaurando a…",
    "learningOutcomes": [],
    "topics": [
      {
        "id": "visao-geral-1",
        "heading": "Visão geral",
        "opening": "As correções primárias atuam sobre a totalidade da imagem. O objetivo é equilibrar a exposição, o contraste global e o balanço de branco, restaurando a neutralidade e o peso tonal natural que preparam a imagem para o look criativo."
      }
    ]
  },
  {
    "id": "mod2-2",
    "moduleSlug": "correcao-de-cor",
    "moduleTitle": "Correção de Cor",
    "slug": "shot-matching",
    "title": "Shot Matching",
    "metaDescription": "Em comerciais de produto com múltiplos ângulos, câmeras e takes, cortes entre planos diferentes não podem apresentar saltos de brilho, saturação ou…",
    "learningOutcomes": [],
    "topics": [
      {
        "id": "visao-geral-1",
        "heading": "Visão geral",
        "opening": "Em comerciais de produto com múltiplos ângulos, câmeras e takes, cortes entre planos diferentes não podem apresentar saltos de brilho, saturação ou temperatura de cor. O Shot Matching garante continuidade visual imperceptível entre todas as cenas."
      }
    ]
  },
  {
    "id": "mod2-3",
    "moduleSlug": "correcao-de-cor",
    "moduleTitle": "Correção de Cor",
    "slug": "secundarias",
    "title": "Secundárias",
    "metaDescription": "As correções secundárias isolam partes específicas da imagem (o produto, rótulos, elementos de cena, pele ou fundo) utilizando Power Windows, Qualifiers…",
    "learningOutcomes": [],
    "topics": [
      {
        "id": "visao-geral-1",
        "heading": "Visão geral",
        "opening": "As correções secundárias isolam partes específicas da imagem (o produto, rótulos, elementos de cena, pele ou fundo) utilizando Power Windows, Qualifiers HSL/3D e Magic Mask para refinamento cirúrgico de cor, nitidez e realce."
      }
    ]
  },
  {
    "id": "mod3-1",
    "moduleSlug": "creative-grade",
    "moduleTitle": "Creative Grade",
    "slug": "criando-um-look",
    "title": "Criando um Look",
    "metaDescription": "O look criativo é a assinatura estética do filme comercial. Define a personalidade da marca através de contrastes tonais, relações de cores complementares…",
    "learningOutcomes": [],
    "topics": [
      {
        "id": "criando-look-sem-plugins-1",
        "heading": "Criando look sem plugins",
        "opening": "A construção de looks manuais nativos no DaVinci Resolve utiliza Custom Curves, Hue vs Hue/Sat/Lum, Color Warper e RGB Mixer. Proporciona controle total sobre a matemática das cores sem depender de plugins de terceiros, garantindo máxima compatibilidade e independência técnica."
      },
      {
        "id": "film-look-creator-2",
        "heading": "Film Look Creator",
        "opening": "O Film Look Creator é a ferramenta de emulação cinematográfica moderna do DaVinci Resolve Studio. Ele integra em um único painel a modelagem de contraste de película, halation, bloom, resposta espectral de filme negativo/print e grão fotoquímico."
      },
      {
        "id": "dehancer-pro-3",
        "heading": "Dehancer Pro",
        "opening": "O Dehancer Pro é o plugin padrão da indústria para emulação analógica ultrarrealista. Simula com precisão física o processo fotoquímico completo: emulsão do filme (Kodak 5219, 5207, Fuji ETERNA), revelação química, halação na camada anti-halo, bloom nas altas luzes, grão analógico realista e compressão de filme print."
      }
    ]
  },
  {
    "id": "mod4-1",
    "moduleSlug": "bonus",
    "moduleTitle": "Bônus",
    "slug": "color-grading-em-frutas",
    "title": "Color Grading em Frutas",
    "metaDescription": "Alimentos e frutas exigem cores vívidas, apetitosas e frescas. Esta aula ensina como realçar o brilho das texturas, proteger e saturar tons orgânicos…",
    "learningOutcomes": [],
    "topics": [
      {
        "id": "visao-geral-1",
        "heading": "Visão geral",
        "opening": "Alimentos e frutas exigem cores vívidas, apetitosas e frescas. Esta aula ensina como realçar o brilho das texturas, proteger e saturar tons orgânicos (vermelhos, laranjas, amarelos e verdes) e criar contraste de volume que desperta o apetite no espectador."
      }
    ]
  },
  {
    "id": "mod4-2",
    "moduleSlug": "bonus",
    "moduleTitle": "Bônus",
    "slug": "color-grading-em-roupas",
    "title": "Color Grading em Roupas",
    "metaDescription": "No mercado de moda, vestuário e e-commerce têxtil, a fidelidade de cor dos tecidos é uma exigência contratual rigorosa. Aprenda a preservar a cor exata…",
    "learningOutcomes": [],
    "topics": [
      {
        "id": "visao-geral-1",
        "heading": "Visão geral",
        "opening": "No mercado de moda, vestuário e e-commerce têxtil, a fidelidade de cor dos tecidos é uma exigência contratual rigorosa. Aprenda a preservar a cor exata das peças de roupa sob diferentes fontes de luz, tratar texturas de tecidos e garantir continuidade entre catálogo e vídeo."
      }
    ]
  },
  {
    "id": "mod4-3",
    "moduleSlug": "bonus",
    "moduleTitle": "Bônus",
    "slug": "fundamentos-da-cor",
    "title": "Fundamentos da Cor",
    "metaDescription": "O domínio da teoria cromática: Círculo Cromático de Munsell, harmonias de cor (complementar, análoga, triádica), contraste simultâneo, psicologia da…",
    "learningOutcomes": [],
    "topics": [
      {
        "id": "visao-geral-1",
        "heading": "Visão geral",
        "opening": "O domínio da teoria cromática: Círculo Cromático de Munsell, harmonias de cor (complementar, análoga, triádica), contraste simultâneo, psicologia da percepção visual e como o cérebro humano interpreta calor, profundidade e emoção através das cores."
      }
    ]
  }
];
