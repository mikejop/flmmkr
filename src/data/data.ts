import { CourseModule } from './types';

export const modulesData: CourseModule[] = [
  {
    id: 'mod0',
    title: 'O Que Importa',
    subtitle: 'Fundamentos de Câmeras, Lentes e Fontes de Luz',
    badge: 'START',
    iconName: 'Camera',
    isFree: true,
    subtopics: [
      {
        id: 'mod0-1',
        title: 'Equipamentos',
        isFree: true,
        concept: `Equipamento importa, sim, mas a hierarquia de prioridades precisa ser invertida: 1º Luz (dá qualidade à imagem), 2º Lente (dá nitidez, contraste e personalidade), 3º Câmera (registra e entrega os dados). Saber exatamente por que você precisa de cada ferramenta pode economizar uma boa grana.`,
        steps: [
          'Inverta a hierarquia tradicional de investimento: priorize Iluminação, depois Lentes e por último Câmeras.',
          'Utilize a luz natural (janelas, Sol) e modificadores caseiros (isopor, cortinas) antes de gastar em luzes.',
          'Compreenda como diferentes lentes alteram a nitidez, o contraste e a personalidade visual.',
          'Reconheça a câmera como o registrador de dados e identifique quando ela realmente se torna o gargalo.'
        ],
        tips: ['A luz dá qualidade à imagem. A lente dá nitidez, contraste e personalidade. A câmera registra e entrega os dados.']
      },
      {
        id: 'mod0-3',
        title: 'Câmeras',
        isFree: true,
        concept: 'Comparativo de equipamentos reais: Celular vs. Osmo Pocket vs. Compactas vs. Câmeras de lente intercambiável.',
        steps: [
          'Avalie a praticidade e agilidade de gravações com smartphone.',
          'Compare a estabilização e alcance de câmeras compactas e gimbals.',
          'Defina quando vale a pena migrar para câmeras de lente intercambiável.'
        ],
        tips: ['Celulares modernos com controle manual de exposição produzem vídeos incríveis com boa luz.']
      },
      {
        id: 'mod0-4',
        title: 'Lentes',
        isFree: true,
        concept: 'Como a mesma distância focal se comporta em sensores diferentes (crop factor) e a estética entregue por cada formato.',
        steps: [
          'Calcule o fator de corte (crop factor) do seu sensor.',
          'Entenda a equivalência de campo de visão entre 35mm, 50mm e 85mm.',
          'Ajuste a distância entre câmera e sujeito conforme a lente.'
        ],
        tips: ['Uma lente 35mm em sensor APS-C equivale visualmente a ~50mm em Full Frame.']
      },
      {
        id: 'mod0-5',
        title: 'Luzes',
        isFree: true,
        concept: 'Por que a luz de teto branca fria destrói a imagem e as diferenças de CRI, temperatura e fidelidade de cor das luzes de vídeo.',
        steps: [
          'Desligue a lâmpada central de teto ao gravar vídeos.',
          'Posicione fontes de luz dedicadas na altura dos olhos.',
          'Verifique o índice CRI/TLCI do seu iluminador (priorize 95+).',
          'Ajuste a intensidade e difusão da sua fonte de luz.'
        ],
        tips: ['Sombras nos olhos (efeito "mapache") acontecem quando a luz vem diretamente de cima.']
      },
      {
        id: 'mod0-6',
        title: 'Como Escolher o Equipamento Ideal',
        isFree: true,
        concept: 'Mapeamento dos equipamentos adequados para cada faixa de orçamento, preparando a estrutura para os próximos setups.',
        steps: [
          'Defina seu teto de investimento inicial.',
          'Priorize iluminação e áudio antes de trocar de câmera.',
          'Monte seu kit inicial com softbox, iluminador LED e difusores.'
        ],
        tips: ['Um celular com R$ 300 em iluminação supera uma câmera de R$ 10.000 sem luz.']
      }
    ],
    challenges: [
      {
        id: 'challenge-mod0',
        title: 'Diagnóstico do Kit Atual',
        description: 'Mapeie o equipamento que você já possui e defina o plano de ajuste para os próximos setups.',
        placeholder: 'Descreva seu equipamento e espaço...',
        fields: [
          { label: 'Câmera ou Celular Principal', fieldId: 'mod0_cam', type: 'text' },
          { label: 'Tamanho do Sensor ou Modelo', fieldId: 'mod0_sensor', type: 'text' },
          { label: 'Iluminação Atual Disponível', fieldId: 'mod0_light', type: 'textarea' }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod0-chk-1', task: 'Desligar a luz central de teto durante as gravações', category: 'Iluminação' },
      { id: 'mod0-chk-2', task: 'Configurar o Balanço de Branco manual na câmera/celular', category: 'Câmera' },
      { id: 'mod0-chk-3', task: 'Verificar se o iluminador principal possui CRI 95+', category: 'Qualidade' }
    ]
  },
  {
    id: 'mod1',
    title: '1 Ponto de Luz',
    subtitle: 'Dominando a Iluminação Principal e Qualidade de Luz',
    badge: 'FASE 1',
    iconName: 'Sun',
    isFree: false,
    subtopics: [
      {
        id: 'mod1-1',
        title: 'Montando uma Cena com 1 Fonte de Luz',
        isFree: false,
        concept: 'Montando uma cena limpa e intencional utilizando apenas uma única fonte de iluminação bem posicionada.',
        steps: [
          'Posicione a fonte de luz principal próxima ao sujeito.',
          'Ajuste a altura para ficar ligeiramente acima da linha dos olhos.',
          'Elimine reflexos indesejados em óculos ou superfícies.'
        ],
        tips: ['Quanto maior e mais próxima a fonte, mais suave será a transição de sombras.']
      },
      {
        id: 'mod1-2',
        title: 'Luz Dura vs Difusa: 80% do Resultado',
        isFree: false,
        concept: 'Qualidade de luz: a diferença entre sombra marcada e gradientes suaves determina a estética do seu vídeo.',
        steps: [
          'Utilize Softboxes, sombrinhas ou papéis difusores.',
          'Aumente a área de superfície da fonte emissora.',
          'Observe a transição de sombra nas bochechas e pescoço.'
        ],
        tips: ['Papel vegetal ou cortinas brancas funcionam como excelentes difusores low-budget.']
      },
      {
        id: 'mod1-3',
        title: 'Ângulos de Luz: Frontal, 45° e Lateral',
        isFree: false,
        concept: 'O ângulo de incidência comunica diferentes emoções: frontal (plano), 45° (natural/cinematográfico), lateral (dramático).',
        steps: [
          'Experimente a luz em 45 graus (estilo Rembrandt).',
          'Avalie o triângulo de luz formado na bochecha oposta.',
          'Ajuste o ângulo conforme o formato de rosto do sujeito.'
        ],
        tips: ['O ângulo de 45° levemente elevado é o mais elegante e natural para vídeos.']
      },
      {
        id: 'mod1-4',
        title: 'Peso Visual e Equilíbrio de 1 Sujeito',
        isFree: false,
        concept: 'Princípios de composição aplicada para equilibrar o sujeito no quadro quando iluminado por uma fonte assimétrica.',
        steps: [
          'Posicione o sujeito seguindo os terços da imagem.',
          'Balançar a iluminação com o lado sombreado do rosto.'
        ]
      },
      {
        id: 'mod1-5',
        title: 'Espaço Negativo Ativo no Enquadramento',
        isFree: false,
        concept: 'Como usar áreas escuras e não iluminadas do quadro para direcionar a atenção ao apresentador.',
        steps: [
          'Controle o vazamento de luz no fundo.',
          'Mantenha áreas de respiro no enquadramento.'
        ]
      },
      {
        id: 'mod1-6',
        title: 'Temperatura de Cor e Clima da Cena',
        isFree: false,
        concept: 'Definindo o tom emocional da cena através da escolha da temperatura Kelvin (3200K quente a 5600K luz do dia).',
        steps: [
          'Ajuste a luz para 5600K para visual neutro e moderno.',
          'Use 3200K para passar aconchego ou clima noturno.'
        ]
      },
      {
        id: 'mod1-7',
        title: 'Fotometria: Lendo a Cena no Histograma',
        isFree: false,
        concept: 'Lendo a exposição da cena simples no Histograma para garantir altas luzes preservadas e sombras sem ruído.',
        steps: [
          'Verifique se a curva do histograma não está estourada à direita.',
          'Mantenha os tons de pele no centro do gráfico.'
        ]
      },
      {
        id: 'mod1-8',
        title: 'Resultado: Talking Head Limpo e Intencional',
        isFree: false,
        concept: 'Revisão final da cena "talking head" com 1 ponto de luz, garantindo acabamento profissional e limpo.',
        steps: [
          'Faça o autodiagnóstico do enquadramento e exposição.',
          'Grave um teste de 15 segundos para validação.'
        ]
      }
    ],
    challenges: [
      {
        id: 'challenge-mod1',
        title: 'Desafio 1 Ponto de Luz',
        description: 'Grave um teste de 15s aplicando luz a 45° com difusão.',
        placeholder: 'Insira suas observações do teste...',
        fields: [
          { label: 'Difusor Utilizado', fieldId: 'mod1_diff', type: 'text' },
          { label: 'Ângulo de Incidência', fieldId: 'mod1_angle', type: 'select', options: ['45 Graus', 'Lateral', 'Frontal'] }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod1-chk-1', task: 'Posicionar a Key Light a 45° do rosto do apresentador', category: 'Posicionamento' },
      { id: 'mod1-chk-2', task: 'Usar difusor para suavizar as sombras do rosto', category: 'Difusão' }
    ]
  },
  {
    id: 'mod2',
    title: '2 Pontos de Luz',
    subtitle: 'Separação de Sujeito, Contraste e Contraluz',
    badge: 'FASE 2',
    iconName: 'SunMedium',
    isFree: false,
    subtopics: [
      {
        id: 'mod2-1',
        title: 'Adicionando a 2ª Fonte: Separação de Fundo',
        isFree: false,
        concept: 'Adicionando uma segunda fonte de iluminação para descolar o sujeito do fundo e criar tridimensionalidade.',
        steps: [
          'Posicione a segunda luz apontando para o fundo ou costas.',
          'Ajuste a intensidade para não competir com a luz principal.'
        ]
      },
      {
        id: 'mod2-2',
        title: 'Lighting Ratio: Contraste de Luz',
        isFree: false,
        concept: 'Controlando a razão de contraste entre a luz principal (Key) e a secundária (Fill/Rim).',
        steps: [
          'Defina o ratio desejado (ex: 2:1 para visual comercial ou 4:1 para dramático).',
          'Meça ou ajuste visualmente a diferença de pontos de luz.'
        ]
      },
      {
        id: 'mod2-3',
        title: 'Kicker e Rim Light: Contraluz Profissional',
        isFree: false,
        concept: 'Posicionando a luz de recorte (Contraluz/Rim Light) nos ombros e cabelo para destaque profissional.',
        steps: [
          'Coloque a Rim Light atrás do sujeito oposta à Key Light.',
          'Evite que a luz entre diretamente na lente da câmera (flare).'
        ]
      },
      {
        id: 'mod2-4',
        title: 'Camadas de Profundidade no Quadro',
        isFree: false,
        concept: 'Construindo primeiro plano, sujeito intermediário e fundo iluminado para máxima percepção de profundidade.',
        steps: [
          'Afaste o sujeito da parede em pelo menos 1.5 metros.',
          'Ilumine o fundo independentemente do sujeito.'
        ]
      },
      {
        id: 'mod2-5',
        title: 'Fotometria: Controlando Ratio no Waveform',
        isFree: false,
        concept: 'Utilizando o monitor Waveform para ajustar o ratio de exposição entre o rosto e a luz de recorte.',
        steps: [
          'Monitore o sinal IRE do rosto entre 60-70 IRE.',
          'Mantenha a Rim Light levemente acima da Key Light.'
        ]
      },
      {
        id: 'mod2-6',
        title: 'Temperatura Mista: Quente e Frio',
        isFree: false,
        concept: 'Combinando luz principal neutra/fria com acentos quentes de fundo para gerar contraste cromático elegante.',
        steps: [
          'Use 5600K na Key Light e 3200K no fundo ou recorte.',
          'Harmonize as cores sem poluir o tom de pele.'
        ]
      },
      {
        id: 'mod2-7',
        title: 'Resultado: Profundidade e Sujeito Destacado',
        isFree: false,
        concept: 'Resultado prático: vídeo com sensação de profundidade real e o apresentador destacado do cenário.',
        steps: [
          'Valide a separação em monitores de tamanhos diferentes.'
        ]
      }
    ],
    challenges: [],
    checklistItems: [
      { id: 'mod2-chk-1', task: 'Manter o sujeito afastado da parede de fundo', category: 'Profundidade' },
      { id: 'mod2-chk-2', task: 'Ajustar a Rim Light para criar recorte no cabelo/ombros', category: 'Contraluz' }
    ]
  },
  {
    id: 'mod3',
    title: '3 Pontos de Luz',
    subtitle: 'Key, Fill e Rim Light para Retratos e Podcasts',
    badge: 'FASE 3',
    iconName: 'SunMedium',
    isFree: false,
    subtopics: [
      {
        id: 'mod3-1',
        title: 'Trio Clássico: Key, Fill e Rim Light',
        isFree: false,
        concept: 'O setup clássico de três pontos (Principal, Preenchimento e Recorte) aplicado sem clichês.',
        steps: ['Monte a Key Light a 45°', 'Monte a Fill Light do lado oposto', 'Monte a Rim Light na traseira.']
      },
      {
        id: 'mod3-2',
        title: 'Fill Light: Preenchendo Sombras com Volume',
        isFree: false,
        concept: 'Como usar a luz de preenchimento para suavizar sombras no rosto sem achatar o volume tridimensional.',
        steps: ['Ajuste a intensidade da Fill Light para 30-50% da Key Light.']
      },
      {
        id: 'mod3-3',
        title: 'Linhas de Força e Direção do Olhar',
        isFree: false,
        concept: 'Direcionando o olhar do espectador utilizando o triângulo de luz e linhas de força no quadro.',
        steps: ['Guie o olhar para os olhos do sujeito.']
      },
      {
        id: 'mod3-4',
        title: 'Círculo Cromático: Contraste Quente e Frio',
        isFree: false,
        concept: 'Aplicação prática do círculo cromático para contraste entre a luz principal e a contraluz.',
        steps: ['Combine tons complementares no mapa de luz.']
      },
      {
        id: 'mod3-5',
        title: 'False Color: Exposição com 3 Fontes',
        isFree: false,
        concept: 'Garantindo exposição precisa das três fontes simultâneas usando o recurso False Color.',
        steps: ['Monitore a cor rosa/cinza no tom de pele no False Color.']
      },
      {
        id: 'mod3-6',
        title: 'Resultado: Retrato e Podcast com Volume',
        isFree: false,
        concept: 'Resultado final: retrato com volume impecável e dimensão facial em estúdio de podcast.',
        steps: ['Grave um take de teste completo.']
      }
    ],
    challenges: [],
    checklistItems: [
      { id: 'mod3-chk-1', task: 'Balancear a Fill Light para não achatar o rosto', category: 'Preenchimento' }
    ]
  },
  {
    id: 'mod4',
    title: 'Luz de Ambiente',
    subtitle: 'Fontes Práticas, Direção de Arte e Estúdio',
    badge: 'FASE 4',
    iconName: 'Lamp',
    isFree: false,
    subtopics: [
      {
        id: 'mod4-1',
        title: 'Fontes Práticas: Abajures e Luzes de Cena',
        isFree: false,
        concept: 'Iluminando o fundo utilizando fontes práticas visíveis no quadro (luminárias, abajures, fita LED).',
        steps: ['Posicione abajures nos cantos do cenário.', 'Ajuste lâmpadas com dimmer.']
      },
      {
        id: 'mod4-2',
        title: 'Direção de Arte: O Fundo Conta sua História',
        isFree: false,
        concept: 'Como os elementos e luzes do cenário comunicam a autoridade e o tema do seu canal.',
        steps: ['Selecione objetos de cena alinhados ao seu nicho.']
      },
      {
        id: 'mod4-3',
        title: 'Distribuição do Fundo sem Poluição Visual',
        isFree: false,
        concept: 'Espaçamento correto entre pontos de luz no fundo para evitar confusão e excesso de informação.',
        steps: ['Evite acúmulo de lâmpadas no mesmo plano.']
      },
      {
        id: 'mod4-4',
        title: 'Hierarquia Visual: Foco no Apresentador',
        isFree: false,
        concept: 'Garantindo que o apresentador seja sempre o ponto mais iluminado do enquadramento.',
        steps: ['Mantenha o fundo 1 a 2 stops abaixo do rosto.']
      },
      {
        id: 'mod4-5',
        title: 'Harmonia Análoga em Cenários Complexos',
        isFree: false,
        concept: 'Usando tons vizinhos no círculo cromático para iluminar cenários ricos em detalhes.',
        steps: ['Combine tons azuis e cianos ou laranjas e amarelos.']
      },
      {
        id: 'mod4-6',
        title: 'Mapa de Luz: Distribuição em Paredes',
        isFree: false,
        concept: 'Como distribuir 3-4 pontos práticos no cenário sem criar manchas ou zebrar a parede.',
        steps: ['Afaste as fontes práticas das paredes lisas.']
      },
      {
        id: 'mod4-7',
        title: 'Resultado: Visual Estúdio Pessoal Criativo',
        isFree: false,
        concept: 'Cenário estilo estúdio pessoal de criador, com atmosfera acolhedora e profissional.',
        steps: ['Avalie a estética geral do canal.']
      }
    ],
    challenges: [],
    checklistItems: [
      { id: 'mod4-chk-1', task: 'Manter a luz do fundo mais baixa que a luz do apresentador', category: 'Hierarquia' }
    ]
  },
  {
    id: 'mod5',
    title: 'Luz Colorida RGB',
    subtitle: 'Teoria da Cor, Árvore de Munsell e Vectorscope',
    badge: 'FASE 5',
    iconName: 'Palette',
    isFree: false,
    subtopics: [
      {
        id: 'mod5-1',
        title: 'Introduzindo Cor na Luz com Intenção',
        isFree: false,
        concept: 'Inserindo géis coloridos ou bastões LED RGB pela primeira vez com propósito narrativo.',
        steps: ['Escolha uma cor de acento que represente sua marca.']
      },
      {
        id: 'mod5-2',
        title: 'Teoria da Cor: Árvore de Munsell na Prática',
        isFree: false,
        concept: 'Entendendo Matiz (Hue), Valor (Value) e Croma (Chroma) para controlar a luz colorida.',
        steps: ['Ajuste a saturação da cor para não estourar os canais de cor da câmera.']
      },
      {
        id: 'mod5-3',
        title: 'Harmonias de Cor: Complementar e Tríade',
        isFree: false,
        concept: 'Construindo esquemas de cores profissionais: Roxo/Ciano, Azul/Laranja e Tríades.',
        steps: ['Use esquemas complementares para impacto visual rápido.']
      },
      {
        id: 'mod5-4',
        title: 'Contraste Narrativo: Roxo e Ciano na Prática',
        isFree: false,
        concept: 'Por que combinações consagradas funcionam e como evitar o erro do "RGB aleatório".',
        steps: ['Defina a paleta oficial de luz do seu canal.']
      },
      {
        id: 'mod5-5',
        title: 'Cor como Peso Visual no Quadro',
        isFree: false,
        concept: 'Utilizando pontos de cor saturada para reequilibrar composições assimétricas.',
        steps: ['Balanceie zonas escuras com acentos coloridos.']
      },
      {
        id: 'mod5-6',
        title: 'Vectorscope: Controlando Saturação de Cor',
        isFree: false,
        concept: 'Controlando a saturação no Vectorscope para evitar clipping e perda de textura.',
        steps: ['Mantenha os vetores de cor dentro dos limites do gráfico.']
      },
      {
        id: 'mod5-7',
        title: 'Resultado: Visual Estilizado e Identidade',
        isFree: false,
        concept: 'Resultado: estética marcante e alta identidade de marca visual para o canal.',
        steps: ['Grave a vinheta ou chamada do canal com a nova paleta.']
      }
    ],
    challenges: [],
    checklistItems: [
      { id: 'mod5-chk-1', task: 'Evitar clipping de saturação no Vectorscope', category: 'Cor' }
    ]
  },
  {
    id: 'mod6',
    title: 'Luz Dramática',
    subtitle: 'Contraste Alto, Estilo Cinematográfico e Luz Natural',
    badge: 'FASE 6',
    iconName: 'Contrast',
    isFree: false,
    subtopics: [
      {
        id: 'mod6-1',
        title: 'Low-Key: Controle de onde a Luz NÃO Vai',
        isFree: false,
        concept: 'Técnica Low-Key: usando bandeiras (flags) e grids para controlar exatamente onde a luz não deve incidir.',
        steps: ['Use bandeiras pretas para cortar vazamentos de luz.']
      },
      {
        id: 'mod6-2',
        title: 'Contraste Extremo sem Perder Sombras',
        isFree: false,
        concept: 'Criando drama e clima cinematográfico sem perder detalhes nas áreas de sombra.',
        steps: ['Monitore o limite inferior de exposição nas sombras.']
      },
      {
        id: 'mod6-3',
        title: 'Ponto Focal Isolado por Luz',
        isFree: false,
        concept: 'Isolando o sujeito exclusivamente pelo feixe de luz em um ambiente completamente escuro.',
        steps: ['Recorte a luz usando snoots ou barndoors.']
      },
      {
        id: 'mod6-4',
        title: 'Luz Natural de Janela com Controle',
        isFree: false,
        concept: 'Aproveitando a luz natural da janela utilizando rebatedores, cortinas e flags para um visual de cinema.',
        steps: ['Posicione o sujeito lateralmente à janela.']
      },
      {
        id: 'mod6-5',
        title: 'Paleta Fria Monocromática e Psicologia',
        isFree: false,
        concept: 'Usando tons frios e monocromáticos para transmitir seriedade, mistério e foco.',
        steps: ['Ajuste o balanço de branco para enfatizar tons frios.']
      },
      {
        id: 'mod6-6',
        title: 'Histograma + Waveform para Sombras',
        isFree: false,
        concept: 'Leitura combinada de Histograma e Waveform para preservar o shadow detail sem ruído.',
        steps: ['Evite achatar a curva no valor zero do gráfico.']
      },
      {
        id: 'mod6-7',
        title: 'Resultado: Cena Cinematográfica Low-Budget',
        isFree: false,
        concept: 'Resultado: cena de alto impacto emocional gravada com baixíssimo custo.',
        steps: ['Avalie o clima narrativo do vídeo.']
      }
    ],
    challenges: [],
    checklistItems: [
      { id: 'mod6-chk-1', task: 'Usar bandeira preta para bloquear vazamento no fundo', category: 'Controle' }
    ]
  },
  {
    id: 'mod7',
    title: 'Setup Entrevista',
    subtitle: 'Equilíbrio e Simetria para Podcasts com 2 Pessoas',
    badge: 'FASE 7',
    iconName: 'Users',
    isFree: false,
    subtopics: [
      {
        id: 'mod7-1',
        title: 'Iluminando 2 Pessoas com Equilíbrio',
        isFree: false,
        concept: 'Como iluminar dois sujeitos na mesma cena mantendo a mesma exposição e qualidade de luz para ambos.',
        steps: ['Posicione luzes cruzadas ou duas fontes idênticas.']
      },
      {
        id: 'mod7-2',
        title: 'Simetria vs Assimetria Proposital',
        isFree: false,
        concept: 'Quando utilizar setups simétricos espelhados vs iluminação assimétrica em diálogos.',
        steps: ['Avalie o formato da mesa e posição das câmeras.']
      },
      {
        id: 'mod7-3',
        title: 'Enquadramentos de Conversa e Podcasting',
        isFree: false,
        concept: 'Harmonizando a luz nos enquadramentos Over-the-Shoulder (OTS), plano aberto e closes dos participantes.',
        steps: ['Garanta que a luz funcione em todos os ângulos de câmera.']
      },
      {
        id: 'mod7-4',
        title: 'Mapa de Luz: 2 Softboxes Espelhados',
        isFree: false,
        concept: 'Desenho de mapa de luz com dois softboxes principais e luz de ambiente para evitar fundos lavados.',
        steps: ['Cruze as luzes para iluminação cruzada eficiente.']
      },
      {
        id: 'mod7-5',
        title: 'Consistência de Cor entre 2 Sujeitos',
        isFree: false,
        concept: 'Mantendo rigorosa consistência de temperatura de cor nos tons de pele de ambos os participantes.',
        steps: ['Use iluminadores do mesmo fabricante ou calibre com termocolorímetro.']
      },
      {
        id: 'mod7-6',
        title: 'Fotometria: Exposição Dupla Simultânea',
        isFree: false,
        concept: 'Comparando e igualando os níveis de exposição dos dois participantes no monitor de vídeo.',
        steps: ['Iguale os picos de pele nos dois lados do gráfico.']
      },
      {
        id: 'mod7-7',
        title: 'Resultado: Podcast com Alta Qualidade',
        isFree: false,
        concept: 'Resultado: formato podcast/entrevista com nível profissional de estúdio de transmissão.',
        steps: ['Grave um episódio de teste com a dupla.']
      }
    ],
    challenges: [],
    checklistItems: [
      { id: 'mod7-chk-1', task: 'Garantir a mesma temperatura de cor para ambos os participantes', category: 'Consistência' }
    ]
  },
  {
    id: 'mod8',
    title: 'Estilo Autoral',
    subtitle: 'Cenas Complexas com 4+ Fontes e Autodiagnóstico',
    badge: 'FASE 8',
    iconName: 'Wand2',
    isFree: false,
    subtopics: [
      {
        id: 'mod8-1',
        title: 'Planejando Cenas com 4+ Fontes de Luz',
        isFree: false,
        concept: 'Planejando do zero uma cena complexa com Key, Fill, Rim, luz de fundo e acentos coloridos.',
        steps: ['Desenhe o mapa de luz antes de ligar os equipamentos.']
      },
      {
        id: 'mod8-2',
        title: 'Mapa de Luz Completo: Desenhando o Setup',
        isFree: false,
        concept: 'Diagramação completa do set: distâncias, alturas, ângulos e modificadores de luz.',
        steps: ['Documente o mapa de luz para réplica fácil.']
      },
      {
        id: 'mod8-3',
        title: 'Revisão Geral de Composição e Luz',
        isFree: false,
        concept: 'Revisão integrada de todos os princípios (forma, peso visual, cor, luz e sombra) aplicados juntos.',
        steps: ['Avalie a cena como uma obra completa.']
      },
      {
        id: 'mod8-4',
        title: 'Adaptando Setup Completo para Low-Budget',
        isFree: false,
        concept: 'Estratégias de corte de custos sem perda de qualidade visual em setups multi-fonte.',
        steps: ['Substitua equipamentos caros por alternativas inteligentes.']
      },
      {
        id: 'mod8-5',
        title: 'Fotometria Completa: Todos os Scopes',
        isFree: false,
        concept: 'Fluxo completo de leitura fotométrica: Histograma + False Color + Waveform + Vectorscope.',
        steps: ['Cheque todos os scopes antes da gravação definitiva.']
      },
      {
        id: 'mod8-6',
        title: 'Checklist de Autodiagnóstico Profissional',
        isFree: false,
        concept: 'Checklist final de autodiagnóstico para garantir a qualidade impecável do resultado.',
        steps: ['Preencha o checklist de autodiagnóstico final.']
      },
      {
        id: 'mod8-7',
        title: 'Resultado: Cena Assinatura do Canal',
        isFree: false,
        concept: 'Resultado: a cena assinatura do seu canal, padronizada e replicável para todas as futuras gravações.',
        steps: ['Consolide o seu padrão visual autoral.']
      }
    ],
    challenges: [],
    checklistItems: [
      { id: 'mod8-chk-1', task: 'Executar a fotometria completa em todos os scopes', category: 'Fotometria' }
    ]
  }
];
