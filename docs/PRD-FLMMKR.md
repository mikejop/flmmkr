# PRD — FLMMKR: plataforma de treinamentos audiovisuais

**Produto principal analisado:** Color Master | Produto  
**Status:** rascunho para validação de produto  
**Data:** 5 de outubro de 2026  
**Base:** comportamento, conteúdo e integrações presentes neste repositório

## 1. Resumo

FLMMKR é uma plataforma brasileira de educação em audiovisual conduzida por Michael Oliveira. Seu objetivo é transformar experiência profissional em direção de fotografia, iluminação, color grading e pós-produção em treinamentos digitais práticos, vendidos diretamente ao aluno e consumidos em uma área de membros própria.

O produto comercial prioritário no código é o **Color Master | Produto**: uma masterclass de color grading no DaVinci Resolve para comerciais e vídeos de produto. A proposta é ensinar o aluno a sair do material em LOG, analisar e corrigir imagens, criar um look e entregar um master comercial, usando footage real como material de prática.

A plataforma cobre o funil completo: landing page adaptada ao canal de origem, oferta com preço por lote e cronômetro, checkout com Pix e cartão, confirmação de pagamento pelo Asaas, criação de conta no Supabase, acesso à área de membros e recursos de estudo.

## 2. Problema e oportunidade

Videomakers, diretores de fotografia, editores e criadores de conteúdo precisam elevar a qualidade técnica e estética de vídeos comerciais, mas encontram conteúdos fragmentados, excessivamente teóricos ou baseados em exemplos distantes do mercado real.

O FLMMKR deve resolver esse problema oferecendo:

- Um caminho de aprendizagem orientado a decisões de trabalho, da pré-produção à entrega.
- Demonstrações práticas no DaVinci Resolve e materiais de projetos reais.
- Uma experiência de compra e ativação simples, sem depender de uma plataforma de cursos de terceiros.
- Uma área de estudo que ajude o aluno a consultar, praticar, marcar trechos relevantes e acompanhar sua evolução.

## 3. Visão do produto

> Permitir que profissionais de audiovisual tomem decisões mais seguras e entreguem imagens de padrão comercial, com uma formação prática, acessível e centrada em projetos reais.

### Proposta de valor do Color Master | Produto

- Ensina um fluxo de trabalho de color grading voltado a publicidade e vídeos de produto.
- Usa DaVinci Resolve como ferramenta principal, incluindo recursos nativos e, quando aplicável, Dehancer Pro e Look Creator.
- Inclui aulas práticas, arquivos/projetos e footage em LOG para exercício.
- Promete um ano de acesso após a confirmação do pagamento.
- Oferece uma sessão individual de mentoria de até três horas para os 10 primeiros inscritos, conforme disponibilidade da campanha.
- Aplica garantia incondicional de sete dias, conforme a comunicação comercial.

## 4. Público-alvo e perfis

### Visitante interessado

Chega pela bio de redes sociais, busca ou indicação. Quer entender rapidamente para quem é o treinamento, o resultado esperado, o conteúdo, o investimento e como comprar.

### Profissional de audiovisual

Videomaker, editor, colorista em formação ou diretor de fotografia que já conhece o básico da interface do DaVinci Resolve e quer ganhar repertório e previsibilidade em trabalhos comerciais.

### Criador de conteúdo e produtor de vídeo de produto

Produz campanhas, vídeos para marcas, e-commerce ou redes sociais e precisa de uma estética mais consistente e valorizada comercialmente.

### Aluno

Comprou, definiu uma senha e precisa acessar o conteúdo em qualquer momento do período contratado, retomar de onde parou, estudar em seu ritmo e administrar sua conta.

### Administrador/instrutor

Gerencia produtos, conteúdo, preços/lotes, vagas de mentoria, pagamentos, reembolsos e suporte. Este papel é necessário no produto, embora não exista ainda uma interface administrativa dedicada no repositório.

## 5. Objetivos e métricas

### Objetivos

1. Converter visitantes qualificados em compradores do treinamento.
2. Liberar acesso confiável e rápido após a confirmação do pagamento.
3. Levar o aluno ao primeiro conteúdo e à primeira atividade prática sem atrito.
4. Aumentar a conclusão do treinamento e a percepção de valor por meio de prática, materiais e retomada de estudo.
5. Proteger contas, dados pessoais e regras comerciais sem prejudicar a experiência legítima.

### Métricas sugeridas

As metas numéricas devem ser definidas depois de uma linha de base de produção. Medir, no mínimo:

- Visita por origem, visualização da oferta, abertura de checkout e conversão de compra.
- Taxa de conclusão do checkout por Pix e cartão; pagamentos recusados, pendentes e expirados.
- Tempo entre pagamento confirmado e primeiro acesso autenticado.
- Percentual de compradores que definem senha e acessam a primeira aula em 24 horas.
- Alunos ativos, percentual de aulas concluídas, uso de destaques, checklists e desafios.
- Taxa de reembolso dentro de sete dias e principais motivos de contato/abandono.
- Erros de autenticação, bloqueios por tentativas inválidas e desconexões por sessão concorrente.

## 6. Escopo do MVP

O MVP é a operação ponta a ponta de venda e consumo de um treinamento digital. Inclui:

- Landing page do produto e páginas de catálogo/links.
- Variação de apresentação para navegadores internos de Instagram e TikTok.
- Conteúdo comercial, FAQ, SEO e rastreamento de eventos de aquisição.
- Oferta por lotes, cronômetro promocional de 15 minutos e preço regular após expiração.
- Checkout próprio com identificação, endereço, Pix ou cartão de crédito parcelado.
- Integração de cobrança e consulta de status com Asaas.
- Criação/provisionamento de usuário no Supabase após confirmação de pagamento.
- Definição de senha, login, recuperação de senha, edição de perfil e alteração de senha.
- Área de membros com navegação de módulos e aulas, busca, progresso, checklists, desafios, marcações e ferramentas interativas.
- Controle de uma sessão ativa por aluno, com aviso de desconexão ao entrar em outro dispositivo.

## 7. Decisão obrigatória de catálogo antes do lançamento

Há uma divergência material entre a promessa de venda e o conteúdo atualmente carregado na área de membros:

- A landing e o checkout vendem **Color Master | Produto**, uma formação de color grading com cinco etapas: preparação/gerenciamento de cores, análise/correção, refinamento, criação de look e finalização.
- A rota de área de membros `/color-master-produto` renderiza uma trilha diferente, com **74 aulas** sobre equipamentos, iluminação, composição e setups para YouTubers, distribuídas em nove módulos — de “O Que Importa” a “Estilo Autoral”. Há inclusive referências internas a “YouTuber Pro” e “ContentsPlace”.

Antes de disponibilizar a venda, o responsável de produto deve escolher uma das alternativas:

1. Migrar o conteúdo do Color Master para a área de membros e manter a rota atual para esse produto.
2. Tratar a trilha de iluminação como um produto separado, com nome, landing, rota e direito de acesso próprios.
3. Declarar explicitamente que ambos os conteúdos fazem parte do mesmo pacote e corrigir toda a comunicação comercial para refletir isso.

O PRD adota a primeira alternativa como hipótese de trabalho: **Color Master | Produto é o curso entregue após a compra**. A trilha de iluminação permanece como conteúdo legado ou futuro produto até uma decisão formal diferente.

## 8. Jornadas essenciais

### 8.1 Descoberta e decisão de compra

1. O visitante abre `/`, `/cursos`, `/links` ou a página do produto.
2. A página identifica, quando possível, acesso por navegador interno de rede social e exibe a versão adequada da experiência.
3. O visitante entende a promessa, perfil indicado, módulos, materiais, mentorias, garantia e preço.
4. O visitante abre o checkout a partir de uma chamada para ação.

**Resultado esperado:** a pessoa sabe exatamente o que receberá, quanto pagará e como terá acesso antes de informar dados pessoais.

### 8.2 Checkout e pagamento

1. O comprador informa nome, e-mail, CPF, telefone, data de nascimento, profissão e endereço; pode informar dados de pagador diferentes.
2. O endereço pode ser preenchido por consulta de CEP.
3. Escolhe Pix ou cartão de crédito e, para cartão, a quantidade de parcelas disponível.
4. O servidor determina o preço vigente; o navegador não é a fonte de verdade do valor.
5. Para Pix, o aluno recebe QR Code/código copia e cola e a interface consulta o status até confirmação ou expiração.
6. Para cartão aprovado, a confirmação é imediata quando retornada pelo provedor.

**Resultado esperado:** nenhum dado de cartão é persistido pela aplicação; cobrança, valor e estado do pagamento permanecem rastreáveis.

### 8.3 Liberação e primeiro acesso

1. Após pagamento confirmado, a aplicação cria ou atualiza a conta do aluno e o perfil associado.
2. O aluno é levado a uma tela para definir senha.
3. A tela realiza login e encaminha o aluno para a área de membros.
4. Em pagamentos assíncronos, o webhook do Asaas deve proporcionar a mesma liberação, de forma idempotente.

**Resultado esperado:** pagamento confirmado gera direito de acesso uma única vez, mesmo que status e webhook sejam recebidos em ordem diferente ou repetidos.

### 8.4 Estudo e retomada

1. O aluno autenticado escolhe um módulo e uma aula.
2. Consulta teoria, prática/ferramenta, desafio e checklist quando disponíveis.
3. Pode marcar uma aula como concluída, avançar para a próxima, pesquisar por assunto, destacar texto e anotar observações.
4. Ao voltar, retoma a última aula, aba e posição de leitura salvas.

**Resultado esperado:** o produto ajuda a aplicar conhecimento e não apenas a consumir uma lista de vídeos/textos.

### 8.5 Segurança de sessão

1. Ao entrar, o sistema registra o dispositivo e cria uma sessão de produto adicional à sessão de autenticação.
2. Se houver uma nova sessão para o mesmo usuário, a sessão ativa anterior é desativada.
3. O aluno anterior recebe aviso com dispositivo/local aproximado e é desconectado.

**Resultado esperado:** uma conta não pode ser usada simultaneamente em múltiplos dispositivos, respeitando a política comercial definida.

## 9. Requisitos funcionais

### Aquisição e páginas públicas

- **RF-01 — Landing responsiva:** apresentar a proposta de valor, autoridade do instrutor, conteúdo, materiais, FAQ, garantia, preço e CTA em desktop e mobile.
- **RF-02 — Origem social:** oferecer experiência leve e adequada para acessos em navegadores internos de Instagram/TikTok; permitir alternância explícita entre versões social e oficial.
- **RF-03 — Descoberta orgânica:** fornecer metadados, canonical, sitemap, robots e dados estruturados de curso/produto/FAQ para cada produto publicado.
- **RF-04 — Catálogo:** listar produtos disponíveis e produtos em fila de espera, sem permitir que uma chamada de compra venda produto indisponível.
- **RF-05 — Analytics:** registrar eventos de visualização e clique de produto, CTA e rede social, sem expor dados pessoais nos eventos.

### Oferta e regras de preço

- **RF-10 — Lotes:** o servidor calcula o preço do produto com base no lote vigente. Para o Color Master, o código prevê R$ 95 até 06/10/2026, R$ 125 até 09/10/2026, R$ 145 até 13/10/2026 e R$ 195 depois disso.
- **RF-11 — Cronômetro:** a oferta promocional dura 15 minutos por visitante/dispositivo, com expiração e cooldown de 36 horas conforme a regra atual. A decisão de usar identificação de dispositivo e IP deve ter base legal e comunicação de privacidade adequadas.
- **RF-12 — Fonte de verdade:** checkout e provedor de pagamentos recebem o preço calculado no servidor; parâmetros enviados pelo navegador não podem reduzir o valor devido.
- **RF-13 — Transparência:** a interface deve explicar preço final, parcelamento, prazo da promoção, condições de bônus e preço regular sem criar ambiguidade.

### Checkout e pagamento

- **RF-20 — Dados de checkout:** validar campos obrigatórios, formatos de CPF, telefone, data de nascimento, CEP e endereço antes de criar cobrança.
- **RF-21 — Pagador distinto:** permitir dados de cobrança distintos dos dados do aluno, mantendo claro quem receberá o acesso.
- **RF-22 — Pix:** criar cobrança Pix, exibir QR Code/copia e cola, consultar o status com segurança e encaminhar à criação de senha quando confirmado.
- **RF-23 — Cartão:** criar cobrança de cartão com parcelamento de até 12 vezes, tratar aprovação, recusa e mensagens compreensíveis ao comprador.
- **RF-24 — Abandono/recusa:** registrar lead de abandono ou pagamento recusado em base separada de alunos confirmados, sujeito a consentimento/base legal e política de retenção.
- **RF-25 — Webhook:** validar token do Asaas, processar eventos de confirmação, expiração e estorno e garantir idempotência no provisionamento.
- **RF-26 — Garantia e reembolso:** disponibilizar um processo de suporte/reembolso de sete dias; quando um reembolso for confirmado, revogar ou ajustar o direito de acesso de maneira auditável.

### Conta, acesso e perfil

- **RF-30 — Provisionamento:** somente pagamentos confirmados devem criar ou conceder acesso a uma conta de aluno.
- **RF-31 — Primeiro acesso:** permitir ao comprador definir uma senha sem fricção, mas apenas mediante um token de ativação de uso único e com expiração.
- **RF-32 — Autenticação:** disponibilizar login com e-mail e senha e recuperação de senha por e-mail.
- **RF-33 — Perfil:** permitir ao usuário autenticado consultar e alterar nome, telefone, avatar e e-mail sob confirmação apropriada; permitir alteração de senha após validação da senha atual.
- **RF-34 — Sessão única:** aplicar a política de uma sessão ativa por conta, com aviso claro ao dispositivo substituído e opção de entrar novamente.
- **RF-35 — Proteção contra força bruta:** limitar tentativas inválidas progressivamente, registrar auditoria e alertar o titular em caso de comportamento suspeito.
- **RF-36 — Autorização:** todos os endpoints que leem ou alteram perfil, senha, sessões ou acesso devem derivar a identidade da sessão autenticada no servidor; `userId` enviado pelo navegador não é autorização suficiente.

### Área de aprendizagem

- **RF-40 — Entitlement:** a área deve mostrar somente cursos aos quais o aluno tem direito de acesso e bloquear conteúdo pago quando não houver entitlement válido.
- **RF-41 — Estrutura de curso:** oferecer módulos, aulas e busca textual por título e conceito, com navegação por módulo/aula e retomada de leitura.
- **RF-42 — Progresso:** permitir marcar aulas como concluídas, calcular percentual por curso e avançar/retroceder entre aulas.
- **RF-43 — Aprendizado ativo:** suportar teoria, atividades práticas, desafios com campos estruturados e checklists por módulo.
- **RF-44 — Destaques e notas:** permitir destacar texto com cor, contextualizar o trecho e adicionar/editar/remover nota.
- **RF-45 — Persistência:** salvar no dispositivo de forma imediata e sincronizar progresso, notas, destaques e ponto de leitura na nuvem para usuários autenticados.
- **RF-46 — Acessibilidade de leitura:** oferecer controles de tamanho de texto/zoom, boa navegação por teclado e labels acessíveis para os controles interativos.
- **RF-47 — Materiais:** disponibilizar para download os arquivos e footages prometidos, com controle de acesso e registro de versão/material disponibilizado.

### Operação e administração

- **RF-50 — Produtos e entitlements:** administrar produto, versão de conteúdo, preço, período de acesso, status de venda e direitos de cada aluno.
- **RF-51 — Mentoria:** controlar as 10 vagas promocionais, elegibilidade por pagamento confirmado, agenda e estado de realização. Não basta comunicar o bônus: a disponibilidade precisa ser verificável.
- **RF-52 — Suporte:** permitir localizar compra, status de pagamento, conta e acesso para resolver solicitações sem expor informações a pessoas não autorizadas.
- **RF-53 — Auditoria:** registrar eventos administrativos relevantes: concessão/revogação de acesso, reembolso, alteração de preço, mudança de papel e incidentes de segurança.

## 10. Conteúdo e catálogo pretendidos

### Color Master | Produto

O currículo comercial deve conter, no mínimo, as cinco etapas já descritas na landing:

1. Preparação e gerenciamento de cores: introdução ao DaVinci Resolve, gerenciamento de cores, ACES, CST e workflow.
2. Análise e correção: leitura artística/técnica, correções primárias e shot matching.
3. Refinamento da imagem: correções secundárias, seleções, pele, produto e fundo.
4. Criação de look: desenvolvimento manual, Look Creator e Dehancer Pro quando aplicável.
5. Finalização: Deliver, codecs, masterização e exportação para redes sociais, YouTube, TV e cinema.

Cada módulo deve definir objetivos de aprendizagem, aulas, prática, materiais, duração estimada e critério mínimo de conclusão. O conteúdo só deve ser anunciado como completo quando efetivamente publicado; durante beta, devem constar a lista de pendências, data de atualização e o que já está liberado.

### Trilha de iluminação existente

O conteúdo implementado hoje tem nove módulos: fundamentos de equipamento, um, dois e três pontos de luz, luz de ambiente, luz RGB, luz dramática, setup de entrevista e estilo autoral. Ele deve ser reclassificado no catálogo como produto independente ou transferido para a oferta correta antes de ser apresentado ao comprador do Color Master.

## 11. Dados e integrações

### Entidades de domínio necessárias

- **Usuário/perfil:** dados pessoais, função, status de acesso e identificadores externos de cobrança.
- **Produto e versão de curso:** catálogo, preço, disponibilidade e conteúdo correspondente.
- **Compra/pagamento:** aluno, produto, provedor, identificador de cobrança, valor, método, estado, datas e motivo de falha/reembolso.
- **Direito de acesso:** usuário, produto/curso, início, expiração, origem e estado de revogação.
- **Progresso de aprendizagem:** conclusão de aula/módulo, última leitura, desafios, checklists, destaques e notas.
- **Sessão de produto e segurança:** dispositivo, token, atividade, substituição, tentativas de login e log de auditoria.
- **Lead de checkout:** dados de abandono/recusa, separados dos dados de aluno e limitados por política de retenção.
- **Campanha/oferta:** lote, preço, vigência, cronômetro e elegibilidade de bônus.

### Integrações observadas

- **Supabase:** autenticação, PostgreSQL, perfis, persistência de dados de produto e políticas de acesso.
- **Asaas:** clientes, cobranças Pix/cartão, QR Code, consulta de status e webhook.
- **BrasilAPI e ViaCEP:** preenchimento de endereço a partir do CEP.
- **GA4 e Meta Pixel:** envio opcional de eventos de marketing no navegador.
- **Resend:** alerta de segurança por e-mail quando configurado.
- **YouTube (modo nocookie):** vídeo de fundo da landing em desktop.

## 12. Requisitos não funcionais

- **Privacidade e LGPD:** informar finalidade, base legal, retenção e canal para solicitações relativas a CPF, endereço, dados de contato, IP, localização aproximada, fingerprint de dispositivo e comportamento de checkout. Coletar o mínimo necessário.
- **Segurança:** chaves de Asaas, Supabase e e-mail ficam somente no servidor; não registrar número de cartão, CVV ou senhas; validar webhook; aplicar RLS e autorização no servidor; limitar requisições sensíveis.
- **Integridade financeira:** todo estado de pagamento deve ser confirmado no provedor ou webhook confiável, com idempotência e trilha de auditoria.
- **Disponibilidade:** landing e checkout devem degradar de forma compreensível quando CEP, Asaas ou banco estiverem indisponíveis; nenhuma confirmação deve ser assumida sem prova do pagamento.
- **Desempenho:** priorizar carregamento mobile, imagens otimizadas, carregamento preguiçoso de ferramentas pesadas e conteúdo legível antes de mídia decorativa.
- **Acessibilidade:** navegação por teclado, contraste adequado, foco visível, textos alternativos, formulários com labels/erros acessíveis e suporte a zoom de até 200%.
- **Compatibilidade:** funcionamento nas versões correntes de navegadores móveis e desktop suportados; experiência funcional em browsers internos de redes sociais.
- **Observabilidade:** logs estruturados e alertas para erros de checkout, webhook, provisionamento, autenticação e sincronização de progresso; nunca incluir segredos ou dados de cartão nos logs.

## 13. Regras de negócio

- O produto exibido na página, o valor cobrado e o curso liberado devem ser a mesma entidade de catálogo.
- A confirmação de pagamento é condição necessária para conceder o acesso; a criação de cobrança não concede acesso.
- Um evento de pagamento repetido não pode gerar contas, direitos de acesso ou benefícios duplicados.
- O acesso comercial do Color Master dura 365 dias a partir da confirmação. Essa expiração deve ser aplicada por uma regra de entitlement, e não apenas descrita na landing.
- A campanha de mentoria é limitada a 10 compradores elegíveis; pagamentos pendentes ou recusados não reservam vaga.
- O preço promocional e o prazo do cronômetro são calculados no servidor. A interface apenas os apresenta.
- A sessão única é uma regra comercial configurável por produto; suporte e administrador podem revogá-la em caso de troca legítima de aparelho.
- Produtos “Em breve” aceitam apenas interesse/lista de espera, nunca pagamento.
- Dados de leads de abandono não devem ser tratados como perfis de alunos nem receber acesso.

## 14. Critérios de aceite de lançamento

O produto está pronto para venda quando todos os pontos abaixo forem verdadeiros:

- A página de venda, checkout, confirmação e área de membros se referem ao mesmo produto e ao mesmo conteúdo.
- O aluno recebe exatamente o curso e os materiais anunciados após pagamento confirmado.
- Pix e cartão foram testados com aprovação, recusa, pendência, expiração e reenvio de webhook.
- Webhook, consulta de status e redirecionamento não duplicam usuário, pagamento ou entitlement.
- O primeiro acesso usa token seguro, com expiração e uso único; não permite que qualquer pessoa defina senha apenas conhecendo um e-mail de comprador.
- Nenhum endpoint de perfil, senha, sessão ou acesso aceita operar sobre outro usuário por meio de um `userId` arbitrário enviado pelo cliente.
- As migrações incluem todas as tabelas requeridas pelo código: controle de login, sessões ativas, auditoria, estado de leitura e destaques, além das tabelas de checkout já existentes.
- Os direitos de acesso de 365 dias, bônus de mentoria e reembolsos possuem estado persistido e verificável.
- A política de privacidade/cookies cobre os dados efetivamente coletados, inclusive identificadores de dispositivo e IP.
- Fluxos críticos foram validados em celular e desktop, com teclado e leitor de tela nos principais formulários e modais.
- Eventos de funil e erros críticos estão sendo medidos sem enviar dados sensíveis a ferramentas de analytics.

## 15. Riscos e lacunas identificadas no repositório

### Prioridade P0 — bloquear lançamento até resolver

- **Incoerência de produto entregue:** a área de membros de `/color-master-produto` não contém o currículo vendido nessa landing.
- **Autorização de APIs sensíveis:** existem endpoints que recebem `userId` no corpo para atualizar perfil, senha ou sessão. O requisito é validar o usuário autenticado no servidor e ignorar identidade arbitrária do navegador.
- **Ativação por e-mail:** a definição inicial de senha localiza usuário pelo e-mail informado na URL/formulário. O fluxo deve ser substituído por convite/token de ativação assinado, expirável e de uso único.
- **Migrations incompletas:** o código referencia `user_active_sessions`, `login_security_tracking`, `security_audit_logs`, `user_reading_state` e `user_highlights`, mas as migrações disponíveis criam apenas perfis, checkouts pendentes, leads e cronômetro de oferta.
- **Acesso de um ano apenas comunicado:** não há, nas entidades de perfil disponíveis, uma data de expiração de entitlement por produto para garantir os 365 dias prometidos.

### Prioridade P1 — resolver antes de escalar aquisição

- **Bônus de mentoria sem inventário:** não há controle transacional das 10 vagas, agenda ou status de realização.
- **Garantia sem fluxo operacional:** a promessa de sete dias não está acompanhada de solicitação, aprovação, evento de reembolso e revogação/ajuste de acesso.
- **Inconsistência de meios de pagamento:** a FAQ menciona boleto, mas o checkout implementa Pix e cartão.
- **Progresso parcialmente local:** conclusão, checklist e desafios são salvos em `localStorage`; leitura e destaques tentam sincronizar com Supabase. O produto deve definir o que sincroniza entre dispositivos.
- **Dependência de API de arquivos no runtime:** a rota de logos copia arquivos para `public` durante a requisição. Em ambientes serverless/imutáveis, a mídia deve ser publicada no build ou em storage apropriado.

### Prioridade P2 — evolução planejada

- Administração de catálogo, conteúdo, preço, entitlements, mentoria e suporte.
- Certificado somente se passar a fazer parte da proposta do produto; hoje não é prometido.
- Comunidade, comentários, avaliação de exercícios e recomendações personalizadas não fazem parte do escopo atual.
- Instrumentação de produto mais ampla: coortes de aprendizado, engajamento por aula e motivos de abandono qualitativos.

## 16. Sequência de entrega recomendada

### Fase 0 — decisão e preparação

Definir produto/curso entregue, corrigir nomes e rotas legadas, fechar currículo beta, materiais, vagas de mentoria, regras de acesso e política de reembolso.

### Fase 1 — venda confiável

Consolidar catálogo, preço no servidor, checkout, webhook idempotente, provisioning, convite de primeiro acesso seguro, entitlement por produto e observabilidade de pagamentos.

### Fase 2 — experiência de aprendizagem

Publicar o currículo correto, vídeos e materiais; sincronizar progresso e leitura; consolidar destaques/notas; garantir busca, acessibilidade e retomada entre dispositivos.

### Fase 3 — operação e crescimento

Criar backoffice mínimo, controle de mentoria e reembolso, atendimento, relatórios de funil/coortes e otimizações orientadas pelos dados de uso.

## 17. Fora de escopo neste PRD

- Marketplace de cursos de terceiros.
- Rede social/comunidade pública entre alunos.
- Aplicativos nativos para iOS ou Android.
- Certificação formal, prova ou correção humana de exercícios, salvo decisão posterior.
- Sistema de afiliados, cupons complexos ou assinaturas recorrentes.

## 18. Perguntas para validação com o responsável pelo produto

1. Qual curso, exatamente, o comprador de Color Master | Produto deve receber no lançamento?
2. O período de acesso é mesmo 365 dias para todos os produtos? O que ocorre após a expiração?
3. A mentoria é por ordem de pagamento confirmado, por lote, ou por outro critério? Como o aluno agenda?
4. Boleto continuará disponível? Se sim, qual é o prazo de compensação e a comunicação de acesso?
5. Quais materiais/footages podem ser baixados e quais direitos de uso acompanham esses arquivos?
6. A regra de uma sessão simultânea é indispensável para todos os produtos, e como o suporte resolve trocas legítimas de dispositivo?
7. Quais metas de receita, conversão, ativação e conclusão definem sucesso nos primeiros 30, 60 e 90 dias?

## 19. Evidências principais consultadas

- Páginas, rotas e componentes em `src/app/` e `src/components/`.
- Catálogo em `src/config/products.ts` e configuração de marca em `src/config/siteConfig.ts`.
- Currículos em `src/data/data.ts`, `src/data/courseData.ts` e `ContentsPlace/docs/`.
- Checkout, autenticação, sessões, preço e integrações em `src/app/api/`, `src/services/` e `src/utils/`.
- Modelo Prisma e migrações Supabase em `prisma/` e `supabase/migrations/`.

Este documento descreve requisitos de produto e riscos observados no código; não substitui revisão jurídica de LGPD, termos de venda, garantia ou licenciamento de footages.
