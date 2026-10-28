/** Conteúdo da página /plugins (FLMMKR Plugins para DaVinci Resolve). */

export type PluginOs = 'macos' | 'windows' | 'linux';

const R2_BASE = 'https://pub-1a4bf0073da94c41bc4aa8cb13dc0aa1.r2.dev/flmmkr-fx';

/** Um único pacote (FLMMKR FX) instala todos os plugins prontos. */
export const PLUGIN_DOWNLOADS: Record<PluginOs, { label: string; url: string; file: string }> = {
  macos: { label: 'macOS', url: `${R2_BASE}/FLMMKR-FX-macOS.zip`, file: 'FLMMKR-FX-macOS.zip' },
  windows: { label: 'Windows', url: `${R2_BASE}/FLMMKR-FX-Windows.zip`, file: 'FLMMKR-FX-Windows.zip' },
  linux: { label: 'Linux', url: `${R2_BASE}/FLMMKR-FX-Linux.zip`, file: 'FLMMKR-FX-Linux.zip' },
};

/** Manifesto lido pelo app para avisar de atualização. */
export const PLUGIN_UPDATE_MANIFEST = `${R2_BASE}/latest.json`;

export type PluginInfo = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  beta?: boolean;
  /** Imagem do plugin em uso (em /public). Sem ela, o card mostra a ilustração em CSS/SVG. */
  image?: string;
  /** Imagem vertical (9:16): aparece inteira no card, como uma tela de celular, em vez de recortada. */
  imageVertical?: boolean;
};

export const READY_PLUGINS: PluginInfo[] = [
  {
    id: 'false-color',
    name: 'False Color',
    image: '/plugins/false-color.webp',
    tagline: 'False color sem precisar da versão Studio.',
    description:
      'Você não precisa mais pagar pelo DaVinci Resolve para ter false color. O plugin mostra a exposição em cores direto na viewer, é fácil de instalar, simples de usar e tem suporte a ACES.',
  },
  {
    id: 'skin',
    name: 'Skin',
    image: '/plugins/skin.webp',
    tagline: 'Pele em amarelo está no tom. Ciano ou azul, ainda não.',
    description:
      'O Skin pinta o tom de pele de amarelo direto na viewer. Quando a pele sai do tom, ele avisa: a área fica ciano ou azul. Você corrige olhando para a imagem, sem depender do vectorscope, mais rápido e com mais precisão.',
  },
  {
    id: 'social',
    name: 'Social',
    image: '/plugins/social.webp',
    imageVertical: true,
    tagline: 'As áreas seguras das redes, sobre o seu vídeo.',
    description:
      'Coloca na viewer o guideline vertical das redes sociais, com as áreas que a interface do app cobre. Você enquadra legendas, rostos e textos sabendo o que vai aparecer no feed.',
    beta: true,
  },
];

export const UPCOMING_PLUGINS: PluginInfo[] = [
  {
    id: 'chronus',
    name: 'Chronus',
    tagline: 'Quanto tempo o projeto levou e quanto ele rendeu.',
    description:
      'Conta o tempo que você trabalha em cada projeto. Informe o valor cobrado do cliente e veja quanto ganhou por hora. Ou informe também o seu valor-hora de costume e descubra se o projeto deu lucro ou prejuízo pelo tempo de entrega.',
  },
  {
    id: 'fibo',
    name: 'Fibo',
    tagline: 'Guias de composição na viewer.',
    description:
      'Distribuição áurea, regra dos terços, split screen vertical e horizontal e grades que dividem a tela em 2, 3, 4, 5 ou 6 partes. Tudo sobreposto à imagem enquanto você trabalha.',
  },
  {
    id: 'kine',
    name: 'Kine',
    tagline: 'Animação dentro do DaVinci Resolve.',
    description:
      'Crie animações sem sair do DaVinci Resolve, direto na sua timeline.',
  },
];

