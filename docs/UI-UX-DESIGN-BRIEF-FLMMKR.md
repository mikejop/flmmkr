# UI/UX Design — Briefing de Design FLMMKR

**Produto principal:** Color Master | Produto  
**Documentos relacionados:** [PRD](./PRD-FLMMKR.md) · [TRD](./TRD-FLMMKR.md) · [App Flow](./APP-FLOW-FLMMKR.md)  
**Status:** briefing de referência para produto, design e desenvolvimento  
**Data:** 5 de outubro de 2026

## 1. Objetivo

Definir a direção de experiência e interface da FLMMKR para que a marca pareça tão precisa quanto o trabalho audiovisual que ensina: premium, clara, segura e focada em resultado prático.

O design precisa ajudar a pessoa a entender rapidamente o treinamento, tomar uma decisão de compra informada, concluir o pagamento com confiança e estudar sem distração. A interface não é o protagonista; ela cria as condições para que imagens, exemplos, aulas e decisões técnicas sejam o centro da experiência.

## 2. Essência da marca

### Posicionamento percebido

FLMMKR é uma escola digital de audiovisual com repertório profissional de set e pós-produção. Para o Color Master | Produto, a percepção desejada é: “um treinamento técnico, prático e autoral de alguém que conhece o padrão de uma produção comercial”.

### Atributos que a experiência deve transmitir

- **Precisa:** informação organizada, números legíveis, preço transparente e estados inequívocos.
- **Autoral:** fotografia e footage reais sustentam a identidade; a interface não deve parecer um template genérico de curso.
- **Sofisticada:** superfícies discretas, ritmo visual, tipografia forte e detalhes bem acabados.
- **Acolhedora:** linguagem direta, sem intimidação técnica, com orientação clara para o próximo passo.
- **Confiável:** checkout, acesso, prazo, garantia e estados de pagamento são compreensíveis.
- **Focada:** pouca competição visual em torno da aula, da mídia e das ações de estudo.

### Princípio diretor

> A imagem conta a história; a interface dá clareza, ritmo e confiança para a pessoa agir.

## 3. Pessoas e necessidades de experiência

### Visitante vindo de rede social

Chega com pouca atenção disponível e, muitas vezes, por navegador interno. Precisa reconhecer o curso, entender o benefício e alcançar uma ação segura sem navegar por uma página pesada ou confusa.

**Resposta de design:** hero objetivo, CTA evidente, preço/condição visíveis, prova de autoridade, versão leve da landing e navegação curta.

### Profissional avaliando a compra

Compara investimento, profundidade técnica, materiais, ferramentas e aplicabilidade comercial. Desconfia de promessas vagas.

**Resposta de design:** currículo por etapas, exemplos reais, clareza sobre pré-requisitos, software, acesso, garantia e bônus. Mostrar o que será feito, não apenas adjetivos.

### Aluno em estudo

Quer retomar uma aula, consultar um conceito, fazer uma prática e registrar aprendizagem sem se perder na interface.

**Resposta de design:** estrutura estável, progresso legível, foco no conteúdo, controles discretos e ações de estudo próximas ao contexto.

### Aluno com necessidade de acessibilidade

Pode necessitar de texto maior, fonte mais legível, maior espaçamento, guia de leitura, redução de movimento ou navegação por teclado.

**Resposta de design:** acessibilidade como configuração permanente da experiência, não como remendo visual ou caminho secundário.

## 4. Arquitetura de experiência

### Superfícies principais

1. **Aquisição:** raiz, links, catálogo e página do produto.
2. **Conversão:** checkout, Pix, confirmação de pagamento e ativação inicial.
3. **Conta:** login, recuperação de senha, perfil, segurança e estado de sessão.
4. **Aprendizagem:** meus cursos, módulo, aula, prática, desafio, checklist, materiais, destaques e notas.
5. **Suporte:** pedidos, expiração de acesso, troca de dispositivo, reembolso e mentoria.

### Regra de continuidade

Uma pessoa nunca deve precisar redescobrir “onde estou”, “o que comprei”, “o que acontece agora” ou “como volto”. Cada tela deve responder pelo menos a uma dessas perguntas por meio de título, navegação, status ou ação principal.

### Jornada visual essencial

`Descobrir → Entender valor → Comprar → Confirmar → Ativar → Acessar curso → Estudar → Retomar → Concluir/aplicar`

O detalhamento de estados e transições está no [App Flow](./APP-FLOW-FLMMKR.md). O design deve seguir esse fluxo, sem criar caminhos que concedam acesso antes da confirmação ou escondam a condição de um pagamento pendente.

## 5. Direção visual

### Conceito: precisão cinematográfica com clareza editorial

Combinar dois modos visuais complementares:

- **Marketing e oferta:** contraste entre preto profundo, imagens de produção e superfícies claras de leitura. O preto funciona como palco para o footage; o branco/cinza claro organiza conteúdo, benefícios e decisão de compra.
- **Área de aprendizagem:** ambiente escuro, imersivo e silencioso, inspirado em ferramentas profissionais de pós-produção e em uma janela de aplicativo. O conteúdo precisa permanecer altamente legível e não competir com efeitos decorativos.

A referência de acabamento é a sobriedade de interfaces Apple: composição arejada, tipografia bem resolvida, transições suaves e resposta tátil. Isso não significa copiar elementos visuais da Apple literalmente ou usar skeuomorfismo.

### O que evitar

- Gradientes neon, efeitos “futuristas” genéricos ou fundos roxos/azuis que não tenham relação com a imagem mostrada.
- Cards empilhados em excesso, sombras pesadas e bordas chamativas sem função.
- Ícones decorativos em toda ação; ícones apoiam compreensão, não substituem texto.
- Urgência agressiva, pop-ups repetitivos ou contadores que prejudiquem leitura e decisão informada.
- Letras muito pequenas, textos em caixa alta extensos, parágrafos longos sobre vídeo em movimento e contraste insuficiente.
- Depender somente de cor para explicar preço, erro, progresso ou disponibilidade.

## 6. Fundamentos visuais

### Cores

O projeto atual já estabelece uma base que deve ser consolidada como tokens de design.

- **Azul de ação:** `#0071E3`. Usar para CTA principal, link ativo, foco e seleção.
- **Azul de destaque sobre fundo escuro:** `#2997FF`. Usar em rótulos, contadores e detalhes de alta visibilidade em superfícies escuras.
- **Preto de imersão:** `#0A0B0E` ou preto puro para hero/mídia e área de estudo.
- **Fundo editorial claro:** `#F5F5F7` para seções de leitura e comparação.
- **Superfície clara:** `#FFFFFF` para cartões, formulários e modais claros.
- **Texto principal claro:** `#1D1D1F`.
- **Texto secundário claro:** `#6E6E73` e `#86868B`, desde que aprovados em contraste.
- **Superfície escura elevada:** `#161617` e `#1C1C1E` para cards e diálogos no modo escuro.
- **Sucesso:** verde/emerald para pagamento confirmado, progresso concluído e ação bem-sucedida.
- **Alerta:** âmbar para atenção e pendência; vermelho para erro, expiração ou ação destrutiva.

O azul identifica ação e seleção, não decoração. Estados de sucesso, alerta e erro precisam de texto e ícone/formato além da cor.

### Tipografia

- Família principal: `-apple-system`, `BlinkMacSystemFont`, `SF Pro Display`, `SF Pro Text`, `Helvetica Neue`, Arial, sans-serif.
- Títulos: peso semibold, tracking discretamente negativo e frases curtas. Devem comunicar resultado antes de detalhe técnico.
- Corpo: 16 px como referência de leitura; altura de linha generosa, especialmente em aulas longas.
- Metadados e labels: 12–14 px apenas quando não forem conteúdo essencial. Não utilizar tamanhos menores que 12 px em interface de produto.
- Números de preço, cronômetro e progresso: usar algarismos tabulares quando alinhamento melhorar leitura.
- Todo texto em caixa alta deve ser curto: rótulo, etapa, status ou categoria; nunca parágrafo ou CTA longo.

### Espaçamento e forma

- Usar escala de espaçamento consistente baseada em múltiplos de 4 px.
- Seções de landing precisam de respiro vertical suficiente para separar argumento, prova e ação.
- Cards claros usam borda neutra leve e sombra mínima; cards escuros usam contraste de superfície e borda translúcida.
- Raios de borda: 12–16 px em controles e cards compactos; 20–24 px em grandes blocos ou modais; pill apenas em CTA, chips e status curtos.
- Divisores substituem cards quando a informação faz parte da mesma história.

### Imagem e vídeo

- Priorizar fotografia, frame e footage reais de Michael Oliveira, produtos, set e resultado de color grading.
- Cada mídia precisa justificar sua presença: prova de domínio, demonstração de técnica, contexto de produção ou atmosfera.
- No mobile, usar poster estático antes de vídeo de fundo; conteúdo e CTA precisam funcionar sem autoplay.
- Aplicar overlay escuro apenas o suficiente para garantir legibilidade; não apagar a qualidade da imagem.
- Usar alt text descritivo em imagens informativas. Mídia puramente decorativa fica oculta de leitores de tela.
- Padronizar o armazenamento de mídias antes de expandir o acervo: hoje há referências em `public/img`, `public/media` e `public/assets`. Definir uma pasta canônica, documentar a migração e usar WebP/AVIF para bitmaps novos quando compatível.

## 7. Briefing por tela e fluxo

### 7.1 Landing do produto

**Objetivo:** converter interesse em início de checkout sem esconder escopo, preço ou condições.

**Estrutura recomendada, em ordem:**

1. Cabeçalho compacto com marca, “Acessar” e CTA de compra.
2. Hero com nome do curso, transformação concreta, contexto de uso, preço/parcelamento e CTA principal.
3. Linha curta de confiança: acesso, garantia, materiais e segurança, sem excesso de selos.
4. “O que você vai aprender” organizado em cinco etapas do workflow de color grading, com acordeões ou expansão progressiva.
5. Prova de autoridade: instrutor, experiência, marcas/produtoras e imagens reais.
6. Entrega: aulas, footage, projetos, duração do acesso e pré-requisitos.
7. Mentoria: regra de elegibilidade, capacidade limitada, o que acontece depois da compra e como agendar.
8. Oferta: conteúdo incluído, preço presente, condições de pagamento, garantia e CTA final.
9. FAQ e suporte de decisão.
10. Rodapé com contato, políticas e redes sociais.

**Comportamentos:**

- O CTA “Garantir acesso” permanece fácil de alcançar, mas o banner fixo não pode encobrir foco, conteúdo ou controles em telas pequenas.
- Timer e preço devem funcionar como informação de campanha, não como interrupção. Após expiração, trocar a mensagem por estado claro, sem reabrir modais repetidamente.
- Acordeões mantêm apenas um item aberto em dispositivos pequenos, se isso reduzir rolagem; o conteúdo aberto precisa permanecer visível após interação.

### 7.2 Checkout

**Objetivo:** coletar somente os dados necessários e conduzir a pessoa até pagamento/ativação com confiança.

**Hierarquia:**

1. Identidade de “Checkout seguro” e resumo fixo do produto/preço.
2. Dados do aluno em grupos curtos e compreensíveis.
3. Endereço com CEP e possibilidade de preenchimento manual.
4. Escolha de método de pagamento antes de expor campos específicos.
5. Dados do pagador somente se a pessoa selecionar “pagador diferente”.
6. Campos de cartão ou instrução de Pix.
7. Botão de confirmação com valor final e estado de carregamento.
8. Ajuda/garantia em texto de apoio, sem competir com a ação.

**Regras de UX:**

- Mostrar por que CPF, data de nascimento ou endereço são solicitados no ponto em que aparecem.
- Aplicar máscaras sem impedir edição, colagem ou leitura por tecnologia assistiva.
- Validar cedo campos de formato; validar apenas no envio dados que dependem de outros campos.
- Manter valores preenchidos após erro de rede ou pagamento recusado; nunca manter número completo de cartão/CVV além da necessidade imediata do provedor.
- Em Pix, mostrar QR Code, cópia e cola, tempo de validade, estado de confirmação e ação clara para voltar/fechar sem ansiedade.
- Em cartão recusado, usar mensagem humana e neutra, com alternativas: conferir dados, tentar outro cartão ou usar Pix.

### 7.3 Pagamento confirmado e ativação

**Objetivo:** eliminar dúvida entre “paguei”, “tenho acesso” e “qual é meu próximo passo?”.

- Mostrar confirmação apenas depois do estado financeiro confiável.
- Exibir o nome do curso comprado, e-mail de acesso parcialmente mascarado e próximo passo único: criar senha ou abrir e-mail de ativação.
- A tela de ativação deve ter título simples, requisito de senha visível, campos mostrar/ocultar senha e feedback claro de erro/sucesso.
- Um token inválido ou expirado deve orientar reenvio seguro/contato, não oferecer campo livre para redefinir senha por e-mail.

### 7.4 Login, recuperação e conta

**Objetivo:** permitir acesso rápido e comunicar segurança sem causar medo ou atrito.

- Modal ou página com e-mail, senha, link de recuperação e CTA único “Entrar”.
- Após bloqueio temporário, mostrar tempo restante em linguagem simples e caminho de recuperação apropriado.
- A tela de conta organiza dados pessoais, segurança, sessões e compras em seções previsíveis.
- Troca de dispositivo mostra aviso claro de que a sessão anterior foi encerrada, sem expor IP ou detalhes excessivos de outro aparelho.

### 7.5 Meus Cursos

**Objetivo:** ser o ponto de retorno do aluno.

- Exibir somente cursos com acesso ativo e, quando fizer sentido, histórico de curso expirado.
- Cada curso apresenta capa, nome, progresso, última aula e ação “Continuar de onde parei”.
- Para aluno com um único curso, priorizar a retomada sem esconder a estrutura completa do programa.
- Estados vazios distinguem: sem compras, acesso expirado, pagamento pendente e erro temporário.

### 7.6 Área de membros

**Objetivo:** oferecer concentração e orientação de progresso.

**Layout desktop:**

- Barra superior: marca, progresso geral, busca, acessibilidade e menu de conta.
- Coluna de navegação: módulos expansíveis, indicador de aula atual/concluída e acesso rápido a continuidade.
- Área principal: breadcrumb de módulo, título da aula, tabs de conteúdo e ação de avançar/concluir.
- Ferramentas auxiliares permanecem discretas e não diminuem a área de leitura.

**Layout mobile:**

- Cabeçalho curto com retorno, nome abreviado do curso, progresso e menu.
- Navegação de módulos em drawer/modal acessível.
- Conteúdo em coluna única; tabs devem acomodar nomes longos sem depender de rolagem horizontal oculta.
- Ação “Concluir e avançar” fica ao fim da aula e, se fixa, não pode cobrir conteúdo nem teclado virtual.

**Tabs de aula:**

- **Teoria:** texto, mídia e exemplos no ritmo de leitura.
- **Na prática:** simulador, ferramenta ou roteiro de aplicação com instrução curta.
- **Desafio:** campos claros, autosave e indicação de resposta salva.
- **Checklist:** itens pequenos, progresso visível e conclusão independente por item.

### 7.7 Destaques, notas e leitura acessível

- A seleção de texto abre uma ação contextual compacta: cor, nota e salvar.
- O painel de destaques mostra aula, seção e trecho suficiente para recuperar contexto; permite ir ao trecho e remover/editar nota.
- Controles de zoom, fonte para dislexia, espaçamento e guia de leitura devem ficar disponíveis sem cobrir a leitura.
- Preferências de acessibilidade persistem por usuário/dispositivo e respeitam `prefers-reduced-motion`.

## 8. Sistema de componentes

### Navegação

- **Header de marketing:** transparente/escuro sobre hero e superfície sólida após rolagem; marca à esquerda, conta e CTA à direita.
- **Navegação de curso:** módulos expansíveis, estados atual/concluído/bloqueado com texto e ícone, nunca apenas cor.
- **Breadcrumb:** curto, clicável apenas quando a ação tiver valor real; não repetir o título da página.

### Ações

- **CTA primário:** azul, texto direto de verbo + resultado (“Garantir acesso”, “Continuar aula”, “Confirmar pagamento”). Um por grupo visual.
- **CTA secundário:** neutro ou contornado, para explorar, voltar ou cancelar.
- **Ação destrutiva:** só em contexto explícito e com confirmação proporcional ao risco.
- Todos os controles interativos devem ter área de toque mínima de 44 × 44 px em mobile, estado de foco visível e feedback de carregamento.

### Formulários

- Label acima do campo, ajuda opcional abaixo e erro no mesmo contexto.
- Agrupar campos por finalidade, não por tipo técnico de dado.
- Usar input correto para e-mail, telefone, CPF, data e senha, sem placeholders como único rótulo.
- Campo desabilitado precisa comunicar motivo e próximo passo; evitar aparência de erro para estado somente indisponível.

### Feedback e status

- **Sucesso:** confirmação breve, ação seguinte e, quando importante, persistência visual até a pessoa reconhecer o estado.
- **Erro:** o que ocorreu, o que a pessoa pode fazer e preservação dos dados não sensíveis já inseridos.
- **Carregamento:** texto de ação (“Criando Pix…”, “Confirmando pagamento…”) em vez de apenas spinner.
- **Progresso de curso:** percentual, aulas concluídas e contexto de continuidade; não criar sensação de falha para quem estuda em ritmo próprio.
- **Badges:** apenas para estado/benefício curto como “Bônus”, “Concluída” ou “Acesso ativo”; não transformar metadados em uma parede de chips.

### Modal e overlay

- Usar modal para tarefas focadas: login, checkout, confirmação de abandono ou acessibilidade.
- Em desktop, largura controlada e conteúdo resumido; em mobile, considerar sheet/tela completa quando o formulário for longo.
- Todo modal precisa de foco inicial, trap de foco, botão de fechar, Escape e retorno ao elemento que o abriu.
- Nunca usar modal para repetir uma mesma urgência depois de a pessoa fechar conscientemente.

## 9. Interação e movimento

### Linguagem de movimento

- Duração curta e natural: aproximadamente 150–300 ms para feedback e transições comuns.
- Curvas suaves, sem quique exagerado. O projeto já usa uma curva quadrática e `motion/react`; manter essa coerência.
- Preferir transformação e opacidade a animações que alteram layout repetidamente.
- Reduzir/desativar animações ao respeitar `prefers-reduced-motion`.

### Microinterações úteis

- Redução sutil de escala no toque de CTA, sem sacrificar foco ou legibilidade.
- Indicador de aba selecionada desliza em vez de piscar.
- Progresso atualiza no momento da conclusão e confirma salvamento sem toast repetitivo.
- Acordeão revela o conteúdo com transição curta e mantém o ponto de leitura estável.
- Hover é melhoria para mouse; nenhuma informação ou ação essencial depende dele.

## 10. Conteúdo e voz de interface

### Tom

Seguro, especialista, direto e humano. Explicar termos técnicos quando forem necessários, sem infantilizar a pessoa e sem usar promessas absolutas.

### Padrões de microcopy

- Preferir “Criar minha senha” a “Submeter”.
- Preferir “Pagamento confirmado. Agora crie sua senha.” a mensagens genéricas de sucesso.
- Preferir “Ainda não identificamos o pagamento Pix. Você pode manter esta tela aberta.” a “Aguardando”.
- Preferir “Seu acesso a este curso expirou em DD/MM/AAAA” a “Não autorizado”.
- Preferir “O cartão não foi aprovado. Confira os dados ou escolha Pix.” a expor razão técnica do emissor.

### Transparência comercial

Preço, parcelamento, duração de acesso, garantia, condição de bônus e estado de expiração devem ser compreensíveis sem a necessidade de abrir tooltip. Tooltips complementam; não escondem termos de compra.

## 11. Responsividade

### Prioridade mobile

Grande parte da descoberta ocorrerá por celular. A primeira tela deve carregar a proposta, preço e CTA de modo legível em 320 px de largura, sem depender de vídeo de fundo, hover ou texto reduzido.

### Faixas de layout

- **Até 639 px:** coluna única, header compacto, CTAs de largura confortável, formulários em uma coluna e navegação de curso em drawer.
- **640–1023 px:** duas colunas quando a comparação trouxer ganho real; manter leitura e checkout em coluna única quando houver campos longos.
- **1024 px ou mais:** landing com respiro amplo, grids de até três elementos e área de membros com navegação lateral persistente.

Em toda faixa, evitar largura de texto excessiva, scroll horizontal acidental, áreas clicáveis pequenas e mídia que cause mudança brusca de layout.

## 12. Acessibilidade

### Critério mínimo

Atender WCAG 2.2 AA nos caminhos de aquisição, checkout, ativação, login e estudo.

### Requisitos de design

- Contraste mínimo de 4,5:1 para texto de corpo e 3:1 para texto grande/elementos de interface, validado sobre sua superfície real.
- Ordem de foco igual à ordem visual e indicador de foco sempre perceptível.
- Cabeçalhos em hierarquia lógica; uma página tem um único `h1` principal.
- Labels visíveis, mensagens associadas ao campo e regiões `aria-live` para pagamento, validação e salvamento.
- Alternativa textual para mídia instrucional; legendas/transcrições para vídeo-aulas quando aplicável.
- Zoom do navegador de até 200% sem perda de conteúdo, função ou sobreposição crítica.
- Movimento reduzido por preferência do sistema e ausência de autoplay sonoro.
- Acessibilidade cognitiva: fonte legível, espaçamento opcional, guia de leitura, linguagem direta e consistência de padrões.

## 13. Handoff para desenvolvimento

### Tokens a consolidar

Criar um conjunto único de tokens para cor, tipografia, espaçamento, raio, borda, sombra, foco, duração e camada (`z-index`). Evitar valores hexadecimais, sombras e raios repetidos diretamente em componentes quando um token puder representar a intenção.

### Componentes prioritários

1. Botão primário, secundário e destrutivo.
2. Campo de formulário, máscara, erro, ajuda e grupo de campos.
3. Card de curso, card de benefício e card de conteúdo.
4. Header de marketing e header de membro.
5. Acordeão de módulo/FAQ.
6. Modal e sheet mobile acessíveis.
7. Banner de estado de pagamento/campanha.
8. Navegação de curso e indicador de progresso.
9. Tabs de aula, checklist, destaque e painel de notas.
10. Empty state, loading state, erro e sucesso.

### Critérios de revisão visual

- Conferir design em 320 px, 390 px, 768 px, 1024 px e 1440 px.
- Comparar estado padrão, hover, foco, pressionado, carregando, desabilitado, erro, vazio e sucesso de cada componente crítico.
- Testar teclado, leitor de tela e zoom de navegador nos modais e no checkout.
- Validar conteúdo real: títulos longos, preço em todos os lotes, CPF inválido, endereço sem complemento, pagamento Pix pendente/expirado e curso com aula concluída.
- Verificar que landing, checkout e área de membros usam o mesmo nome, escopo e identidade visual do produto vendido.

## 14. Métricas de UX

- Clique de CTA principal por origem de tráfego.
- Abertura, início e conclusão de checkout por método de pagamento.
- Erros por campo e abandono por etapa do formulário.
- Tempo entre pagamento confirmado, ativação concluída e primeira aula aberta.
- Taxa de retomada de curso, aula concluída e uso de recursos de estudo.
- Uso de ajustes de acessibilidade e taxa de conclusão dos fluxos por dispositivo.
- Chamados de suporte relacionados a pagamento, acesso, senha, curso errado ou troca de dispositivo.

Métricas servem para identificar atrito, não para induzir comportamento. Não enviar dados pessoais, respostas de aluno ou conteúdo de notas a ferramentas de analytics.

## 15. Regras de aceite de design

O design está pronto para implementação quando:

- A pessoa entende a proposta, o preço e a condição de acesso no primeiro percurso da landing.
- Um pagamento pendente, aprovado, recusado ou expirado tem estado visual distinto e próximo passo claro.
- O primeiro acesso não deixa dúvida sobre criação de senha e curso liberado.
- A área de membros permite retomar e concluir uma aula sem depender de memória ou navegação extensa.
- Componentes e estados são consistentes entre desktop e mobile.
- Não há texto essencial abaixo do mínimo de legibilidade, dependência exclusiva de cor ou ação somente em hover.
- Os fluxos críticos passam em teclado, leitor de tela e zoom de 200%.
- O conteúdo entregue visualmente corresponde ao curso anunciado comercialmente.

## 16. Decisões pendentes

1. Confirmar o curso efetivamente entregue após a compra do Color Master | Produto; hoje a área de membros está preenchida com uma trilha de iluminação distinta.
2. Definir padrão canônico para armazenamento e URL de mídias, eliminando duplicações atuais.
3. Definir se a sessão única é regra rígida para todos os produtos e como o suporte lida com troca legítima de aparelho.
4. Decidir o fluxo e a interface de reembolso, renovação e expiração de acesso após 365 dias.
5. Confirmar disponibilidade real, elegibilidade e agendamento das 10 vagas de mentoria antes de apresentá-las como benefício na interface.

Este briefing complementa o kit visual existente em `public/media/UI_DESIGN_KIT.md`. Em caso de conflito, as decisões de produto, acessibilidade, segurança e conteúdo correto deste documento têm prioridade; o kit serve como referência de linguagem visual e componentes.
