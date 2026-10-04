# ContentsPlace — Conteúdo Interno da Área de Membros

Este diretório contém **exclusivamente a parte de conteúdo interno** do **ContentsPlace**, ou seja, exatamente o que o usuário/aluno acessa e visualiza **após realizar o login com sua conta**.

Foram excluídas todas as páginas públicas de vendas/marketing (Landing Page, cabeçalhos de vendas, seções de FAQ de compra, tabelas de preço de conversão e modais de checkout externos).

---

## 📁 Estrutura de Arquivos

```
ContentsPlace/
├── docs/                          # Ementa e guias de conteúdo em Markdown
│   ├── EMENTA_DO_CURSO.md         # Ementa completa detalhada de todos os módulos
│   └── EQUIPAMENTOS.md            # Guia aprofundado de equipamentos, câmeras e iluminação
│
├── data/                          # Dados estruturados de todos os módulos e aulas
│   ├── data.ts                    # Módulos 0 a 8 com sub-tópicos, desafios, checklists e dicas
│   └── lessons/                   # 22 arquivos individuais com o conteúdo de cada aula
│       ├── intro-1.ts, intro-2.ts
│       ├── mod1-1.ts, mod1-2.ts, mod1-3.ts
│       ├── mod2-1.ts, mod2-2.ts, mod2-3.ts
│       ├── mod3-1.ts, mod3-2.ts
│       ├── mod4-1.ts, mod4-2.ts
│       ├── mod5-1.ts, mod5-2.ts
│       ├── mod6-1.ts, mod6-2.ts
│       ├── mod7-1.ts, mod7-2.ts
│       ├── mod8-1.ts
│       └── mod9-1.ts, mod9-2.ts, mod9-3.ts
│
├── components/                    # Simuladores interativos e ferramentas do aluno
│   ├── EquipamentosLessonArticle.tsx   # Artigo editorial interativo do Módulo 0
│   ├── InteractiveIdeationTheory.tsx   # Ferramenta interativa de roteiro e ideação (Módulo 1)
│   ├── Iluminacao3Pontos.tsx           # Simulador 3D/interativo de estúdio com 3 pontos de luz
│   ├── ColorwheelsGrading.tsx          # Simulador de rodas de cores (Color Wheels) e LUTs
│   ├── AudioMixer.tsx                  # Simulador de mesa de som e equalização de áudio
│   ├── ExposureCalculator.tsx          # Calculadora interativa de exposição fotográfica
│   ├── PudovkinSequencer.tsx           # Sequenciador interativo com as 5 técnicas de Pudovkin
│   ├── CenarioPlanner.tsx              # Planejador interativo de cenários e estúdios
│   ├── AvEditorTeleprompter.tsx        # Editor de roteiro audiovisual e teleprompter
│   ├── DeliverExporter.tsx             # Simulador de codecs, resoluções e padrões de entrega
│   ├── IdeationFlowchart.tsx           # Fluxograma interativo de ideação de conteúdo
│   ├── CtrSimulator.tsx                # Simulador de testes de títulos e CTR no YouTube
│   ├── AceleracaoManager.tsx           # Gerenciador de exercícios práticos e aceleração
│   ├── TextHighlighterTool.tsx         # Marcador de texto e anotações para o aluno
│   ├── AccessibilityWidget.tsx         # Widget de acessibilidade (tamanho de fonte, contraste)
│   └── LiquidGlass/                    # Shaders e componentes de vidro líquido (Apple-style)
│
├── member-area/                   # Interface e player da área do aluno
│   └── MemberAreaApp.tsx          # Estrutura do app com sidebar de módulos, player de aula, etc.
│
├── lib/                           # Serviços de suporte da área de membros
│   ├── readingStateService.ts     # Persistência de leitura, scroll e progresso
│   ├── highlightsService.ts       # Armazenamento de grifos e destaques feitos pelo aluno
│   ├── storage.ts                 # Resolução de URLs de mídia e assets
│   └── utils.ts                   # Utilitários de formatação
│
├── types.ts                       # Tipos TypeScript do curso (CourseModule, Subtopic, Progress)
│
└── media/                         # Imagens, esquemas de luz e gráficos das aulas
    ├── 1 ponto de luz.webp
    ├── dois pontos de luz.webp
    ├── luz colorida rgb.webp
    ├── setup entrevista.webp
    ├── o que importa.webp
    ├── Photo-Album-1-*.webp
    └── ...
```

---

## 📚 Conteúdo dos Módulos Inclusos

1. **Módulo 0: O Que Importa** — Equipamentos, câmeras, sensores, lentes e luzes.
2. **Módulo 1: 1 Ponto de Luz** — Montagem de cena com luz única, dura vs difusa, proporções e histograma.
3. **Módulo 2: 2 Pontos de Luz** — Separação de fundo, iluminação de contorno (rim light) e waveform.
4. **Módulo 3: 3 Pontos de Luz** — Trio clássico (Key, Fill, Rim), false color e volume.
5. **Módulo 4: Luz de Ambiente** — Práticas, direção de arte, profundidade e cenografia.
6. **Módulo 5: Luz Colorida RGB** — Harmonias cromáticas, vectorscope e estilização visual.
7. **Módulo 6: Luz Dramática** — Iluminação low-key, contraste e isolamento visual.
8. **Módulo 7: Setup Entrevista** — Gravação em múltiplos planos, sincronismo e dinâmica.
9. **Módulo 8: Estilo Autoral** — Assinatura estética, consistência e fluxo de trabalho avançado.
