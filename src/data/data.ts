import { CourseModule } from './types';

export const modulesData: CourseModule[] = [
  {
    id: 'mod1',
    title: 'Fundamentos',
    subtitle: 'Configuração do projeto, ciência de cores e estruturação do fluxo de trabalho no DaVinci Resolve',
    badge: '',
    iconName: 'Compass',
    isFree: true,
    subtopics: [
      {
        id: 'mod1-1',
        title: 'Introdução ao DaVinci Resolve',
        isFree: true,
        videoUrl: 'https://b-vz-5bb7b1c1-d28.tv.pandavideo.com.br/e559c1ae-4471-4c85-84ab-62154cb40b9f/playlist.m3u8',
        concept: `O DaVinci Resolve é o padrão global da indústria cinematográfica e publicitária para pós-produção e tratamento de cor. Compreender a interface da página Color, a navegação ágil e a lógica de nós (nodes) cria o alicerce indispensável para trabalhar com velocidade e consistência técnica.`,
        steps: [
          'Conheça a interface da página Color (Node Graph, Scopes, Paletas Primárias e Galeria).',
          'Domine a lógica de nós seriais, nós paralelos e nós de camada (layer mixer).',
          'Configure preferências de reprodução para performance fluida em tempo real.',
          'Memorize os atalhos de navegação essenciais da página Color para acelerar seu fluxo diário.'
        ],
        tips: ['Mantenha sempre os Scopes visíveis em uma janela flutuante para monitorar os níveis com precisão matemática.']
      },
      {
        id: 'mod1-2',
        title: 'Gerenciamento de Cores',
        isFree: true,
        concept: `O gerenciamento de cor correto no DaVinci Resolve garante que as informações capturadas pelo sensor da câmera em perfil Log sejam mapeadas com fidelidade matemática e máximo alcance dinâmico para o espaço de cor de exibição correto (Rec.709). Escolha entre a abordagem nodal com CST ou a padronização unificada da Academia com ACES nas abas abaixo.`,
        subtabs: [
          {
            id: 'cst',
            label: 'CST',
            concept: `O nó CST (Color Space Transform) é o método nodal mais transparente e versátil do DaVinci Resolve. Ele permite aplicar uma conversão matemática precisa do Input Color Space e Input Gamma específicos da sua câmera diretamente na árvore de nós, mantendo controle manual absoluto sobre cada etapa do processamento.`,
            steps: [
              'Insira o nó CST no ponto de conversão da sua cadeia de nós (metodologia sanduíche).',
              'Defina o Input Color Space e o Input Gamma conforme a câmera gravada (ex: Sony S-Gamut3.Cine / S-Log3, Canon Cinema Gamut / Canon Log 3, Blackmagic Gen 5).',
              'Configure o Output Color Space como Rec.709 e Output Gamma como Gamma 2.4 (ou Rec.709).',
              'Habilite Tone Mapping (DaVinci) e Gamut Mapping para comprimir altas luzes e saturações extremas sem clipping severo.'
            ],
            tips: ['O Tone Mapping do CST preserva gradientes suaves nos reflexos estourados de produtos brilhantes.']
          },
          {
            id: 'aces',
            label: 'ACES',
            concept: `A Academy Color Encoding System (ACES) é o padrão de gerenciamento de cores desenvolvido pela Academia de Cinema dos EUA. Ele transforma materiais de diferentes marcas e modelos de câmeras em um espaço de cor gigantesco e linear (ACEScg / ACEScc / ACEScct), garantindo consistência fotométrica perfeita em produções multicâmera.`,
            steps: [
              'Ative o Color Science como ACEScc ou ACEScct nas configurações do projeto.',
              'Defina a versão ACES mais recente e selecione o IDT (Input Device Transform) correspondente a cada câmera da cena.',
              'Configure o ODT (Output Device Transform) correto para sua tela de entrega comercial (ex: Rec.709).',
              'Utilize ACEScct para uma resposta mais orgânica e suave nos controles de sombras e Lift.'
            ],
            tips: ['ACEScct é a escolha recomendada para comerciais, pois evita que ajustes de sombra quebrem bruscamente a curva tonal.']
          }
        ],
        steps: [
          'Selecione a abordagem de gerenciamento de cor mais adequada para a produção (CST ou ACES).',
          'Padronize a conversão de entrada (Input) e saída (Output).',
          'Valide a integridade do histograma e dos níveis de saturação após a conversão.'
        ],
        tips: ['Nunca aplique ajustes criativos antes de normalizar o espaço de cor da sua gravação.']
      },
      {
        id: 'mod1-3',
        title: 'Como fazer a análise artística do vídeo',
        isFree: true,
        concept: `Antes de mexer em qualquer controle de cor, é indispensável realizar a análise analítica e estética do material. Isso envolve entender o gênero do produto, o contraste desejado, a iluminação da cena e cruzar o olhar artístico com a leitura dos Scopes (Waveform, RGB Parade, Vectorscope e Histograma).`,
        steps: [
          'Analise a distribuição de iluminação pelo Waveform e identifique sombras esmagadas ou altas estouradas.',
          'Use o RGB Parade para detectar contaminações indesejadas (color casts) em pretos e brancos.',
          'Verifique no Vectorscope a fidelidade e saturação das cores do produto e o alinhamento da linha de Skin Tone.',
          'Determine a intenção estética (clean comercial, dramático, quente/frio, vintage) antes de iniciar o grading.'
        ],
        tips: ['O monitor pode enganar por calibragem ou iluminação ambiente; os scopes fornecem a verdade numérica absoluta.']
      },
      {
        id: 'mod1-4',
        title: 'Fluxo de Trabalho',
        isFree: true,
        concept: `Um fluxo de trabalho profissional e organizado define a velocidade de entrega, evita retrabalho e garante a integridade dos arquivos durante todas as etapas do projeto comercial.`,
        steps: [
          'Estruture uma árvore de nós fixa e padronizada em PowerGrade para aplicar em novos projetos com um clique.',
          'Agrupe planos semelhantes em Clip Groups (Pre-Clip, Clip, Post-Clip) para ajustes em lote.',
          'Utilize mídias otimizadas ou proxies em timelines 4K para garantir reprodução em 24/30fps cravados.',
          'Ative os backups automáticos com versionamento de timeline.'
        ],
        tips: ['Nomear cada nó com sua função (Ex: CST_In, Exp, WB, Contrast, Look, CST_Out) economiza horas nas revisões com clientes.']
      }
    ],
    challenges: [
      {
        id: 'challenge-mod1',
        title: 'Setup e Normalização de Projeto',
        description: 'Configure o gerenciamento de cor via CST ou ACES para planos gravados em perfil Log e valide a precisão técnica nos Scopes.',
        placeholder: 'Descreva a câmera usada e os parâmetros de gerenciamento configurados...',
        fields: [
          { label: 'Câmera e Perfil de Cor Gravado', fieldId: 'mod1_cam', type: 'text' },
          { label: 'Método Escolhido (CST ou ACES)', fieldId: 'mod1_cst', type: 'text' },
          { label: 'Espaço de Cor de Saída (Output)', fieldId: 'mod1_output', type: 'text' }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod1-chk-1', task: 'Configurar a página Color e verificar scopes ativos', category: 'Interface' },
      { id: 'mod1-chk-2', task: 'Normalizar o material via Color Space Transform (CST) ou ACES', category: 'Ciência de Cor' },
      { id: 'mod1-chk-3', task: 'Salvar árvore de nós padrão na galeria de PowerGrades', category: 'Workflow' }
    ]
  },
  {
    id: 'mod2',
    title: 'Correção de Cor',
    subtitle: 'Leitura técnica e artística, equilíbrio da imagem e continuidade entre planos',
    badge: '',
    iconName: 'Palette',
    isFree: false,
    subtopics: [
      {
        id: 'mod2-1',
        title: 'Primárias',
        isFree: false,
        concept: `As correções primárias atuam sobre a totalidade da imagem. O objetivo é equilibrar a exposição, o contraste global e o balanço de branco, restaurando a neutralidade e o peso tonal natural que preparam a imagem para o look criativo.`,
        steps: [
          'Ajuste o ponto de preto com o controle Lift até assentar a base das sombras no Waveform.',
          'Ajuste o ponto de branco com o controle Gain para conferir brilho aos destaques sem queimar dados.',
          'Modele os tons médios e a sensação de luminosidade geral através do controle Gamma.',
          'Corrija dominantes de cor indesejadas utilizando as Color Wheels ou os controles de Temp/Tint.'
        ],
        tips: ['Uma correção primária perfeita é invisível: a imagem parece naturalmente bem capturada e balanceada.']
      },
      {
        id: 'mod2-2',
        title: 'Shot Matching',
        isFree: false,
        concept: `Em comerciais de produto com múltiplos ângulos, câmeras e takes, cortes entre planos diferentes não podem apresentar saltos de brilho, saturação ou temperatura de cor. O Shot Matching garante continuidade visual imperceptível entre todas as cenas.`,
        steps: [
          'Defina o plano Hero Shot (o plano de referência principal que ditará o padrão estético da cena).',
          'Utilize a ferramenta de Split Screen e Image Wipe para comparar a referência com o plano a ser corrigido lado a lado.',
          'Equalize primeiro a exposição e o contraste observando o Waveform.',
          'Alinhe o equilíbrio cromático pelo RGB Parade até que ambos os planos casem com exatidão visual.'
        ],
        tips: ['Concentre o matching na luminância do produto e nos tons de pele antes de ajustar o fundo.']
      },
      {
        id: 'mod2-3',
        title: 'Secundárias',
        isFree: false,
        concept: `As correções secundárias isolam partes específicas da imagem (o produto, rótulos, elementos de cena, pele ou fundo) utilizando Power Windows, Qualifiers HSL/3D e Magic Mask para refinamento cirúrgico de cor, nitidez e realce.`,
        steps: [
          'Isole o produto com o 3D Qualifier ou Magic Mask.',
          'Suavize as bordas da seleção usando Softness e Blur Radius para mesclagem limpa e imperceptível.',
          'Aplique Power Windows com tracking inteligente para seguir o movimento do produto na cena.',
          'Realce a saturação, contraste local e microcontraste do produto para destacá-lo do cenário.'
        ],
        tips: ['Seleções secundárias com bordas duras denunciam corte amador; suavize sempre as máscaras.']
      }
    ],
    challenges: [
      {
        id: 'challenge-mod2',
        title: 'Shot Matching Comercial',
        description: 'Faça o matching perfeito de 2 planos de produto gravados em momentos diferentes, alinhando luminância e crominância.',
        placeholder: 'Descreva a estratégia adotada no matching...',
        fields: [
          { label: 'Plano de Referência (Hero Shot)', fieldId: 'mod2_ref', type: 'text' },
          { label: 'Ajustes no Waveform (Luminância)', fieldId: 'mod2_wave', type: 'text' },
          { label: 'Ajustes no RGB Parade (Crominância)', fieldId: 'mod2_parade', type: 'text' }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod2-chk-1', task: 'Neutralizar balanço de branco e níveis de preto/branco', category: 'Primárias' },
      { id: 'mod2-chk-2', task: 'Alinhar planos no Split Screen Wipe com o Hero Shot', category: 'Matching' },
      { id: 'mod2-chk-3', task: 'Isolar e polir o produto com Power Window e Tracking', category: 'Secundárias' }
    ]
  },
  {
    id: 'mod3',
    title: 'Creative Grade',
    subtitle: 'Desenvolvimento de identidade visual, estética autoral e emulação de película',
    badge: '',
    iconName: 'Wand2',
    isFree: false,
    subtopics: [
      {
        id: 'mod3-1',
        title: 'Criando um Look',
        isFree: false,
        concept: `O look criativo é a assinatura estética do filme comercial. Define a personalidade da marca através de contrastes tonais, relações de cores complementares e resposta analógica, podendo ser construído manualmente sem plugins ou potencializado por ferramentas dedicadas. Explore as três abordagens nas abas abaixo.`,
        subtabs: [
          {
            id: 'sem_plugins',
            label: 'Criando look sem plugins',
            concept: `A construção de looks manuais nativos no DaVinci Resolve utiliza Custom Curves, Hue vs Hue/Sat/Lum, Color Warper e RGB Mixer. Proporciona controle total sobre a matemática das cores sem depender de plugins de terceiros, garantindo máxima compatibilidade e independência técnica.`,
            steps: [
              'Modele a curva de resposta tonal com formato em S nas curvas Custom, suavizando os extremos para evitar clipping.',
              'Crie separação tonal de cores (Split Toning) resfriando as sombras e aquecendo as altas luzes.',
              'Isole e refine os tons secundários nas curvas Hue vs Hue e Hue vs Sat.',
              'Manipule o RGB Mixer para alterar o peso perceptual dos canais vermelho, verde e azul.'
            ],
            tips: ['Dominar o método sem plugins capacita você a atingir qualquer visual comercial em qualquer estação de trabalho.']
          },
          {
            id: 'film_look_creator',
            label: 'Film Look Creator',
            concept: `O Film Look Creator é a ferramenta de emulação cinematográfica moderna do DaVinci Resolve Studio. Ele integra em um único painel a modelagem de contraste de película, halation, bloom, resposta espectral de filme negativo/print e grão fotoquímico.`,
            steps: [
              'Insira o nó Film Look Creator após a correção primária normalizada.',
              'Escolha o perfil de película e ajuste a intensidade da emulação tonal.',
              'Calibre os controles de Halation para gerar a dispersão de luz avermelhada nas bordas de contraste.',
              'Adicione Bloom óptico suave para simular a difusão orgânica de lentes de cinema.'
            ],
            tips: ['O Film Look Creator oferece processamento acelerado por GPU nativo com preservação total de 32-bit float.']
          },
          {
            id: 'dehancer_pro',
            label: 'Dehancer Pro',
            concept: `O Dehancer Pro é o plugin padrão da indústria para emulação analógica ultrarrealista. Simula com precisão física o processo fotoquímico completo: emulsão do filme (Kodak 5219, 5207, Fuji ETERNA), revelação química, halação na camada anti-halo, bloom nas altas luzes, grão analógico realista e compressão de filme print.`,
            steps: [
              'Selecione o perfil de filme de captura e o perfil de filme print desejado.',
              'Ajuste a curva de densidade cromática para obter cores profundas e orgânicas no produto.',
              'Configure os parâmetros de Halation e Bloom com máscaras baseadas em luminância.',
              'Ajuste o tamanho e densidade do grão analógico de acordo com a resolução da timeline (4K vs 1080p).'
            ],
            tips: ['No Dehancer, reduza a intensidade do Grain para 15-25% em comerciais de produtos de luxo e beleza para manter textura sem perder nitidez.']
          }
        ],
        steps: [
          'Escolha a abordagem do look (manual sem plugins, Film Look Creator nativo ou Dehancer Pro).',
          'Construa o contraste e a paleta respeitando a identidade da marca do produto.',
          'Aplique textura cinematográfica e valide o resultado final em diferentes tipos de display.'
        ],
        tips: ['O look deve valorizar o produto, nunca sufocá-lo ou esconder seus detalhes.']
      }
    ],
    challenges: [
      {
        id: 'challenge-mod3',
        title: 'Criação de Look Comercial de Produto',
        description: 'Desenvolva um look autoral completo para um comercial de produto, combinando curvas manuais e emulação de película.',
        placeholder: 'Explique as decisões visuais e os nós utilizados no look...',
        fields: [
          { label: 'Conceito Artístico do Produto', fieldId: 'mod3_concept', type: 'text' },
          { label: 'Perfil de Película ou Curvas Usadas', fieldId: 'mod3_film', type: 'text' },
          { label: 'Tags de Exportação (Color Space & Gamma)', fieldId: 'mod3_tags', type: 'text' }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod3-chk-1', task: 'Definir paleta tonal e contraste autoral do produto', category: 'Look Dev' },
      { id: 'mod3-chk-2', task: 'Calibrar grão, bloom e halation com moderação', category: 'Textura' },
      { id: 'mod3-chk-3', task: 'Exportar com Gamma Tag Rec.709-A para evitar gamma shift', category: 'Deliver' }
    ]
  },
  {
    id: 'mod4',
    title: 'Bônus',
    subtitle: 'Materiais complementares, presets profissionais e recursos exclusivos para acelerar seu fluxo',
    badge: '',
    iconName: 'Star',
    isFree: false,
    subtopics: [
      {
        id: 'mod4-1',
        title: 'Color Grading em Frutas',
        isFree: false,
        concept: `Alimentos e frutas exigem cores vívidas, apetitosas e frescas. Esta aula ensina como realçar o brilho das texturas, proteger e saturar tons orgânicos (vermelhos, laranjas, amarelos e verdes) e criar contraste de volume que desperta o apetite no espectador.`,
        steps: [
          'Isole as cores da fruta no Hue vs Sat e aumente a vivacidade sem estourar detalhes finos.',
          'Use Power Windows ovais com tracking para realçar reflexos e gotas de água na casca da fruta.',
          'Equalize as sombras com tons levemente quentes para passar sensação de frescor natural.',
          'Ajuste o microcontraste (Midtone Detail) para intensificar a percepção de textura da fruta.'
        ],
        tips: ['O Vectorscope para frutas vermelhas (como morangos e maçãs) deve chegar perto da linha de segurança sem ultrapassar o limite de broadcast.']
      },
      {
        id: 'mod4-2',
        title: 'Color Grading em Roupas',
        isFree: false,
        concept: `No mercado de moda, vestuário e e-commerce têxtil, a fidelidade de cor dos tecidos é uma exigência contratual rigorosa. Aprenda a preservar a cor exata das peças de roupa sob diferentes fontes de luz, tratar texturas de tecidos e garantir continuidade entre catálogo e vídeo.`,
        steps: [
          'Compare a cor do tecido gravado com a cartela Pantone ou referência física da marca.',
          'Isole a peça de roupa usando o 3D Qualifier ou Magic Mask para correções localizadas.',
          'Corrija o matiz com Hue vs Hue até bater rigorosamente com a amostra original do produto.',
          'Trate vincos, sombras e textura do tecido com controle fino de contraste e saturação de luminância (Lum vs Sat).'
        ],
        tips: ['Em vídeos de roupas brancas ou pretas, garanta que sombras e altas luzes não fiquem contaminadas por reflexos de luz do estúdio.']
      },
      {
        id: 'mod4-3',
        title: 'Fundamentos da Cor',
        isFree: false,
        concept: `O domínio da teoria cromática: Círculo Cromático de Munsell, harmonias de cor (complementar, análoga, triádica), contraste simultâneo, psicologia da percepção visual e como o cérebro humano interpreta calor, profundidade e emoção através das cores.`,
        steps: [
          'Estude as relações harmônicas no Círculo Cromático aplicadas à composição de comerciais.',
          'Compreenda o fenômeno do contraste simultâneo (como cores adjacentes alteram a percepção uma da outra).',
          'Aplique harmonias complementares (como Teal & Orange ou Ciano & Âmbar) com intencionalidade dramática.',
          'Utilize cores quentes para avançar o produto no plano e cores frias para empurrar o fundo para trás, criando profundidade tridimensional.'
        ],
        tips: ['Cores quentes expandem e parecem mais próximas do observador; cores frias retraem e dão sensação de distância.']
      }
    ],
    challenges: [
      {
        id: 'challenge-mod4',
        title: 'Color Grading de Produto e Teoria Cromática',
        description: 'Aplique os fundamentos de cor em um plano de fruta ou vestuário, garantindo fidelidade de matiz e volume visual.',
        placeholder: 'Descreva as ferramentas e harmonias cromáticas utilizadas...',
        fields: [
          { label: 'Tipo de Produto (Fruta ou Roupa)', fieldId: 'mod4_prod', type: 'text' },
          { label: 'Harmonia Cromática Escolhida', fieldId: 'mod4_harmonia', type: 'text' },
          { label: 'Estratégia de Fidelidade de Cor', fieldId: 'mod4_fidelidade', type: 'text' }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod4-chk-1', task: 'Realçar saturação e textura orgânica no produto', category: 'Alimentos & Moda' },
      { id: 'mod4-chk-2', task: 'Verificar alinhamento de matiz de tecido com Pantone de referência', category: 'Precisão' },
      { id: 'mod4-chk-3', task: 'Aplicar contraste quente/frio para criar profundidade 3D', category: 'Teoria da Cor' }
    ]
  }
];
