export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  socialDescription: string;
  url: string;
  badge: string;
  featured?: boolean;
  isAvailable: boolean;
  highlights: string[];
  iconName: 'play' | 'film' | 'sliders' | 'camera' | 'smartphone';
  ctaText: string;
  imageUrl?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'color-grading-youtubers',
    slug: 'color-grading-youtubers',
    name: 'Color Grading para YouTubers',
    subtitle: 'Tratamento de cor rápido para criadores de conteúdo',
    description: 'Treinamento focado em agilidade e tratamento de pele para quem produz conteúdo semanal para o YouTube.',
    socialDescription: 'Color Grading para YouTubers — Em Breve',
    url: '/produtos/color-grading-youtubers',
    badge: 'Em Breve',
    featured: false,
    isAvailable: false,
    highlights: [
      'Workflows ágeis para edição frequente',
      'Criação de identidade visual marcante',
      'Tratamento de pele e exposição rápida'
    ],
    iconName: 'play',
    ctaText: 'Fila de Espera',
    imageUrl: '/assets/produtos/color-youtuber/01.jpg'
  },
  {
    id: 'color-master-completo',
    slug: 'color-master-completo',
    name: 'Color Master - Treinamento Completo',
    subtitle: 'Formação definitiva em Color Grading profissional',
    description: 'Treinamento completo do básico ao nível avançado para dominar a arte da cor no audiovisual.',
    socialDescription: 'Color Master - Treinamento Completo — Em Breve',
    url: '/produtos/color-master-completo',
    badge: 'Em Breve',
    featured: false,
    isAvailable: false,
    highlights: [
      'Colorimetria avançada e ciência de cor',
      'Gestão de cor e pipelines ACES e DaVinci YRGB',
      'Desenvolvimento de Look de Cinema'
    ],
    iconName: 'film',
    ctaText: 'Fila de Espera',
    imageUrl: '/assets/produtos/color-master/01.jpg'
  },
  {
    id: 'color-master-produto',
    slug: 'color-master-produto',
    name: 'Color Master - Produtos',
    subtitle: 'Masterclass de Color Grading para vídeos de produto com padrão de comercial de TV',
    description: 'Aprenda a analisar, equilibrar, igualar e construir o look de imagens de produto no DaVinci Resolve. Treinamento prático com footage real de comerciais.',
    socialDescription: 'Color Master - Produtos — Inscrições Abertas',
    url: '/produtos/color-master-produto',
    badge: 'Disponível Agora',
    featured: true,
    isAvailable: true,
    highlights: [
      'Workflow de 8 etapas do LOG ao Look Comercial',
      'Análise de película, densidade e separação cromática',
      'Color grading para embalagens, cosméticos e metais',
      'Footage de produção real de comerciais para praticar'
    ],
    iconName: 'sliders',
    ctaText: 'Garantir Acesso Agora',
    imageUrl: '/images/products/color-master.jpg'
  },
  {
    id: 'direcao-de-fotografia',
    slug: 'direcao-de-fotografia',
    name: 'Direção de Fotografia',
    subtitle: 'Linguagem visual, iluminação e câmera',
    description: 'Formação completa em iluminação, enquadramento e narrativa cinematográfica.',
    socialDescription: 'Direção de Fotografia — Em Breve',
    url: '/produtos/direcao-de-fotografia',
    badge: 'Em Breve',
    featured: false,
    isAvailable: false,
    highlights: [
      'Composição e enquadramento cinematográfico',
      'Técnicas reais de iluminação de cena',
      'Movimento de câmera e narrativa'
    ],
    iconName: 'camera',
    ctaText: 'Fila de Espera',
    imageUrl: '/assets/produtos/direcao-fotografia/01.jpg'
  },
  {
    id: 'producao-de-video-para-empreendedores',
    slug: 'producao-de-video-para-empreendedores',
    name: 'Produção de Vídeo para Empreendedores',
    subtitle: 'Vídeos comerciais para o seu negócio usando o celular',
    description: 'Curso prático para gravar e publicar vídeos de vendas pelo smartphone.',
    socialDescription: 'Produção de Vídeo para Empreendedores — Em Breve',
    url: '/produtos/producao-de-video-para-empreendedores',
    badge: 'Em Breve',
    featured: false,
    isAvailable: false,
    highlights: [
      'Gravação em alta qualidade com o celular',
      'Iluminação simples que valoriza o produto',
      'Roteiro comercial de vendas'
    ],
    iconName: 'smartphone',
    ctaText: 'Fila de Espera',
    imageUrl: '/images/products/empreendedores.jpg'
  },
  {
    id: 'videomaker-premium',
    slug: 'videomaker-premium',
    name: 'Videomaker Premium',
    subtitle: 'Formação completa para o profissional do audiovisual',
    description: 'Trilha de aprendizado integrada cobrindo captação, edição, direção de fotografia e finalização de alto nível.',
    socialDescription: 'Videomaker Premium — Em Breve',
    url: '/produtos/videomaker-premium',
    badge: 'Em Breve',
    featured: false,
    isAvailable: false,
    highlights: [
      'Visão integrada da produção ao set',
      'Técnicas de captação e direção de cena',
      'Pós-produção completa e entrega profissional'
    ],
    iconName: 'film',
    ctaText: 'Fila de Espera'
  }
];
