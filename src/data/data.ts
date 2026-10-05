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
        concept: `O DaVinci Resolve é o padrão global da indústria cinematográfica e publicitária para pós-produção e tratamento de cor. Compreender a arquitetura das abas, a lógica baseada em nós (nodes) e a interface é a base sólida para trabalhar com velocidade e consistência.`,
        steps: [
          'Configure a página Color e familiarize-se com a área de Scopes, Node Graph e Primaries.',
          'Entenda a diferença estrutural entre nós seriais, nós paralelos e nós de camada (layer mixer).',
          'Organize seu projeto para máxima performance de reprodução em tempo real.',
          'Domine as teclas de atalho essenciais da página Color para acelerar seu fluxo diário.'
        ],
        tips: ['Estruture sua árvore de nós com uma convenção de nomes consistente desde a primeira aula.']
      },
      {
        id: 'mod1-2',
        title: 'Gerenciamento de Cores',
        isFree: true,
        concept: `Gerenciar cor com rigor técnico garante que as informações capturadas pelo sensor da câmera sejam mapeadas com precisão matemática para o espaço de cor de exibição correto, evitando perdas de alcance dinâmico e distorções cromáticas.`,
        steps: [
          'Defina o espaço de trabalho entre DaVinci YRGB e DaVinci YRGB Color Managed.',
          'Compreenda a relação entre Gamut da câmera e Gamma de gravação (Log vs. Linear vs. Rec.709).',
          'Evite quebras de gradientes ajustando o processamento em ponto flutuante de 32 bits.',
          'Mantenha consistência de saturação em altas luzes e sombras profundas.'
        ],
        tips: ['Nunca aplique ajustes criativos antes de normalizar o espaço de cor da sua gravação.']
      },
      {
        id: 'mod1-3',
        title: 'ACES e Ciência de Cor',
        isFree: true,
        concept: `A Academy Color Encoding System (ACES) é o padrão da Academia de Cinema que unifica câmeras de diferentes fabricantes em um espaço de cor gigantesco, garantindo preservação máxima de dados e consistência entre sensores variados.`,
        steps: [
          'Selecione a versão ACES adequada para o seu projeto comercial.',
          'Configure o IDT (Input Device Transform) correspondente a cada câmera da cena.',
          'Estabeleça o ODT (Output Device Transform) correto para sua tela de entrega (ex: Rec.709 / sRGB).',
          'Compare o comportamento de realce (highlight roll-off) entre ACEScc e ACEScct.'
        ],
        tips: ['ACEScct oferece resposta mais suave nos controles de sombra (Lift), ideal para comerciais.']
      },
      {
        id: 'mod1-4',
        title: 'CST (Color Space Transform)',
        isFree: true,
        concept: `O nó CST (Color Space Transform) é o método nodal mais flexível e transparente do DaVinci Resolve para converter perfeitamente qualquer perfil Log de qualquer câmera para o espaço de trabalho e saída desejados.`,
        steps: [
          'Insira o nó CST no início (ou final) da sua cadeia de nós conforme a metodologia sanduíche.',
          'Selecione o Input Color Space e Input Gamma exatos da sua câmera.',
          'Ative os algoritmos de Tone Mapping e Gamut Mapping para evitar clipping severo.',
          'Crie um nó composto reutilizável para padronizar todos os planos do projeto.'
        ],
        tips: ['O Tone Mapping DaVinci preserva detalhes sutis em reflexos estourados de produtos.']
      },
      {
        id: 'mod1-5',
        title: 'Fluxo de Trabalho e Setup do Projeto',
        isFree: true,
        concept: `A estruturação profissional do projeto, gerenciamento de mídias otimizadas, proxy, timeline correta e hierarquia de nodes determinam a produtividade e a segurança em entregas comerciais de alto nível.`,
        steps: [
          'Configure as preferências de projeto, taxa de quadros e monitoramento com precisão.',
          'Crie uma estrutura de nós padronizada em PowerGrade para aplicar em novos projetos com um clique.',
          'Utilize Grupos de Planos (Clip Groups) para aplicar ajustes globais e individuais com agilidade.',
          'Habilite backups automáticos de linha do tempo e salvamento em tempo real.'
        ],
        tips: ['Um template de PowerGrade bem planejado reduz seu tempo de grading inicial pela metade.']
      }
    ],
    challenges: [
      {
        id: 'challenge-mod1',
        title: 'Setup e Normalização de Projeto',
        description: 'Configure o gerenciamento de cor via CST para planos gravados em perfil Log e valide a precisão técnica nos Scopes.',
        placeholder: 'Descreva a câmera usada e os parâmetros de CST configurados...',
        fields: [
          { label: 'Câmera e Perfil de Cor Gravado', fieldId: 'mod1_cam', type: 'text' },
          { label: 'Input Color Space / Input Gamma', fieldId: 'mod1_cst', type: 'text' },
          { label: 'Espaço de Cor de Saída (Output)', fieldId: 'mod1_output', type: 'text' }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod1-chk-1', task: 'Configurar a página Color e verificar scopes ativos', category: 'Interface' },
      { id: 'mod1-chk-2', task: 'Normalizar o material via Color Space Transform (CST)', category: 'Ciência de Cor' },
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
        title: 'Análise Artística do Vídeo',
        isFree: false,
        concept: `A leitura de uma imagem vai muito além do gosto pessoal: envolve entender a intenção narrativa, a identidade do produto, a iluminação da cena e a leitura precisa dos Scopes (Waveform, Vectorscope, Histograma e Parade).`,
        steps: [
          'Analise a distribuição de luminância pelo Waveform e identifique clipping de sombras e altas.',
          'Verifique a predominância de matiz (color cast) no RGB Parade.',
          'Identifique os tons de pele e do produto no Vectorscope com a linha de Skin Tone ativada.',
          'Estabeleça as prioridades de correção antes de iniciar os ajustes.'
        ],
        tips: ['Os scopes nunca mentem: mesmo em monitores não calibrados, eles guiam sua precisão técnica.']
      },
      {
        id: 'mod2-2',
        title: 'Correções Primárias e Balanço de Branco',
        isFree: false,
        concept: `A correção primária balanceia a imagem como um todo. O equilíbrio correto de pretos, brancos e tons médios (Lift, Gamma, Gain e Offset) restaura o contraste natural e a fidelidade cromática indispensáveis para comerciais.`,
        steps: [
          'Ajuste o ponto de preto com o Lift até assentar na base do Waveform sem esmagar sombras.',
          'Ajuste o ponto de branco com o Gain para dar brilho e vida sem estourar highlights.',
          'Equilibre os tons médios com o Gamma e neutralize qualquer tom indesejado.',
          'Utilize o Offset para correções rápidas de balanço de temperatura global.'
        ],
        tips: ['Sempre neutralize o branco e o preto antes de decidir quanto contraste o plano merece.']
      },
      {
        id: 'mod2-3',
        title: 'Shot Matching e Continuidade',
        isFree: false,
        concept: `Em comerciais de produtos, cortes entre diferentes ângulos, lentes e iluminações precisam parecer rigorosamente do mesmo momento. O Shot Matching garante continuidade visual imperceptível para o espectador.`,
        steps: [
          'Selecione o plano de referência (Hero Shot) que define o visual da cena.',
          'Utilize a visualização Split Screen e Wipe para comparar lado a lado.',
          'Equalize primeiro a luminância (exposição e contraste) antes de mexer na cor.',
          'Ajuste os canais de cor individualmente pelo RGB Parade até os gráficos casarem perfeitamente.'
        ],
        tips: ['Case sempre os tons médios e os destaques do produto antes de comparar o fundo.']
      },
      {
        id: 'mod2-4',
        title: 'Correções Secundárias e Ajustes Localizados',
        isFree: false,
        concept: `Ajustes secundários isolam regiões específicas com Power Windows, Qualifiers e Magic Mask para realçar o produto, valorizar texturas, aperfeiçoar o tom de pele e guiar o foco do olhar do consumidor.`,
        steps: [
          'Isole o produto ou a pele utilizando o 3D Qualifier ou Magic Mask.',
          'Refine as bordas da máscara com Clean Black/White e Blur Radius para mesclagem invisível.',
          'Aplique Power Windows com tracking preciso em objetos em movimento.',
          'Subtraia seleções com nós combinados para evitar que ajustes vazem para áreas indesejadas.'
        ],
        tips: ['Suavize sempre as bordas de qualquer seleção: máscaras duras denunciam o corte amador.']
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
        title: 'Look Development e Estética Comercial',
        isFree: false,
        concept: `O Look Development é a construção artística que confere personalidade única ao vídeo. No mercado de produtos, cada nicho (bebidas, cosméticos, eletrônicos, gastronomia) exige paletas de cores, densidades e contrastes específicos.`,
        steps: [
          'Defina a paleta de cores dominante respeitando a psicologia das cores para o produto.',
          'Separe a imagem em camadas tonais com nós de split-toning (sombras frias, altas quentes).',
          'Controle a densidade cromática sem saturar de forma artificial.',
          'Garanta que a estética valorize as qualidades táteis do produto em cena.'
        ],
        tips: ['Cores desaturadas com contraste profundo transmitem sofisticação; cores vibrantes e limpas transmitem energia.']
      },
      {
        id: 'mod3-2',
        title: 'Criação de Look Manual (DIY)',
        isFree: false,
        concept: `Criar looks manualmente com as ferramentas nativas do DaVinci Resolve (Custom Curves, Hue vs Hue/Sat, Color Warper e RGB Mixer) proporciona controle total e independência artística absoluta.`,
        steps: [
          'Modele a curva de resposta tonal usando as curvas Custom com proteção de roll-off.',
          'Isole matizes específicos no Hue vs Hue para direcionar tons adjacentes.',
          'Utilize o Hue vs Sat para enriquecer as cores institucionais do produto.',
          'Explore o RGB Mixer para manipular a luminância relativa de cada canal.'
        ],
        tips: ['Com o Color Warper é possível fazer variações tonais refinadas com poucos nós.']
      },
      {
        id: 'mod3-3',
        title: 'Look Creator e Ferramentas Especializadas',
        isFree: false,
        concept: `O uso de ferramentas avançadas e plugins de Look Development acelera a busca por atmosferas cinematográficas sofisticadas, permitindo testes rápidos de contrastes e paletas harmoniosas.`,
        steps: [
          'Aplique presets de base analítica para explorar direções visuais para o cliente.',
          'Module o contraste perceptual através de curvas de compressão tonal.',
          'Equilibre a saturação não-linear para manter cores agradáveis aos olhos.',
          'Integre o plugin na árvore de nós de forma não destrutiva.'
        ],
        tips: ['Plugins dedicados são amplificadores de velocidade quando apoiados em uma boa correção primária.']
      },
      {
        id: 'mod3-4',
        title: 'Dehancer Pro e Emulação de Película',
        isFree: false,
        concept: `A textura analógica e a resposta de filme cinematográfico (Kodak 5219, 5207, Fuji ETERNA) trazem peso orgânico e qualidade de cinema aos comerciais digitais.`,
        steps: [
          'Configure o perfil de filme de acordo com o clima desejado.',
          'Ajuste o Halation nas altas luzes para simular a dispersão da camada vermelha da película.',
          'Adicione Bloom óptico suave para amaciar o aspecto excessivamente nítido do digital.',
          'Calibre o grão do filme de acordo com o tamanho do sensor e a resolução de entrega.'
        ],
        tips: ['Menos é mais: o grão e a halação devem ser sentidos, e não chamar mais atenção que o produto.']
      },
      {
        id: 'mod3-5',
        title: 'Finalização e Padrões de Exportação',
        isFree: false,
        concept: `O processo de Deliver transforma todo o trabalho criativo em arquivos finais perfeitos para exibição em redes sociais, YouTube, televisão ou cinema, sem perda de cor ou contraste.`,
        steps: [
          'Configure os parâmetros de exportação no DaVinci Deliver (ProRes, DNxHR, H.264/H.265).',
          'Ajuste as tags de Color Space e Gamma Tag (Rec.709-A para reprodução fiel no QuickTime/Apple).',
          'Verifique a nitidez final (Sharpening sutil) otimizada para compressão do Instagram/YouTube.',
          'Exporte versões de masterização e versões de exibição para arquivo permanente.'
        ],
        tips: ['Defina Gamma Tag como Rec.709-A para evitar o famoso "desbotamento" de cor no Mac e iPhone.']
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
        title: 'Pack de PowerGrades & LUTs Exclusivos',
        isFree: false,
        concept: `Coleção de PowerGrades nodais prontos para uso em comerciais de produto, estruturados para DaVinci Wide Gamut e ACES, permitindo aplicar looks testados no mercado em instantes.`,
        steps: [
          'Importe a pasta de PowerGrades para a Galeria do seu DaVinci Resolve.',
          'Compreenda o propósito de cada nó da árvore antes de aplicar no seu plano.',
          'Ajuste os nós de exposição e balanço para adaptar o preset ao seu material.',
          'Salve variações personalizadas para compor sua biblioteca própria.'
        ],
        tips: ['Use os PowerGrades como base de estudo para dissecar como grandes coloristas constroem seus nós.']
      },
      {
        id: 'mod4-2',
        title: 'Assets de Textura e Grão de Película 35mm',
        isFree: false,
        concept: `Overlays de granulação 35mm escaneada em alta resolução, halation matte e artefatos analógicos de alta qualidade para adicionar acabamento orgânico a qualquer produção digital.`,
        steps: [
          'Importe os arquivos de textura em ProRes 4444 para o seu media pool.',
          'Aplique o modo de mesclagem (Composite Mode) correto: Overlay, Soft Light ou Screen.',
          'Ajuste a opacidade para integrar o grão sem ruído perceptível no produto.',
          'Use máscaras para manter o produto com máxima nitidez e o grão nas áreas abertas.'
        ],
        tips: ['Texturas de grão 35mm dão sensação de filme de alto orçamento mesmo em vídeos para redes sociais.']
      },
      {
        id: 'mod4-3',
        title: 'Guia de Atalhos e Workflow Rápido no DaVinci Resolve',
        isFree: false,
        concept: `Guia definitivo de produtividade com atalhos de teclado, layouts customizados e rotinas de trabalho para diminuir o tempo de entrega e aumentar a lucratividade em comerciais.`,
        steps: [
          'Configure seu mapa de atalhos otimizado para mouse ou mesa digitalizadora.',
          'Aprenda a navegar entre nós e versões de grading com comandos de uma tecla.',
          'Utilize marcadores coloridos para organizar o status de aprovação de cada plano.',
          'Automatize tarefas repetitivas de exportação em lote.'
        ],
        tips: ['Trabalhar sem tirar a mão do teclado dobra sua velocidade em timelines com dezenas de planos.']
      }
    ],
    challenges: [
      {
        id: 'challenge-mod4',
        title: 'Otimização de Workflow com Assets',
        description: 'Instale os PowerGrades na sua galeria e configure seus atalhos personalizados para iniciar seu próximo trabalho com velocidade.',
        placeholder: 'Descreva como você organizou sua galeria de PowerGrades...',
        fields: [
          { label: 'PowerGrade Favorito Selecionado', fieldId: 'mod4_pg', type: 'text' },
          { label: 'Atalhos Customizados Principais', fieldId: 'mod4_shortcuts', type: 'text' }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod4-chk-1', task: 'Instalar a biblioteca de PowerGrades na galeria', category: 'Assets' },
      { id: 'mod4-chk-2', task: 'Testar os overlays de granulação analógica 35mm', category: 'Texturas' },
      { id: 'mod4-chk-3', task: 'Mapear atalhos de navegação de nós no teclado', category: 'Produtividade' }
    ]
  }
];
