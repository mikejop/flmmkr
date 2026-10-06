# Mapeamento Completo de Captura e Telemetria de Dados · FLMMKR (flmmkr.site)

> **Documento Técnico de Auditoria de Dados e Privacidade**  
> **Data de Atualização:** 05 de Outubro de 2026  
> **Escopo:** Todo o site (`https://flmmkr.site`), APIs internas, checkout, área de membros e ferramentas terceirizadas integradas.

---

## 1. Visão Geral da Arquitetura de Coleta

O site **FLMMKR** coleta dados em quatro níveis principais:
1. **Telemetria de Navegação Própria (First-Party):** Registrada silenciosamente na navegação para atribuição de tráfego, medição de campanhas e inteligência de conversão.
2. **Identificação de Hardware & Anti-Fraude:** Impressão digital do dispositivo (Device Fingerprint) para controle de ofertas temporárias (lotes promocionais de 72h) e limitação de sessão simultânea.
3. **Dados Fornecidos pelo Usuário (Checkout e Autenticação):** Informações cadastrais e financeiras para emissão de nota, cobrança e criação de conta de aluno.
4. **Ferramentas de Terceiros (Tags e Analytics):** Scripts externos de métricas, gravação de tela e eventos de conversão.

---

## 2. Telemetria e Navegação Própria (First-Party)

Executada pelo componente `TrafficTelemetryTracker` (`/api/telemetry/visit`) e salva na tabela `site_traffic_analytics` do Supabase:

| Categoria | Dado Capturado | Origem / Método | Finalidade |
| :--- | :--- | :--- | :--- |
| **Identificador** | `visitor_id` | Gerado e armazenado em `localStorage` (`flmmkr_visitor_id`) | Identificar o mesmo visitante entre sessões |
| **Hardware** | `device_fingerprint` | Hash SHA-256 de CPU, RAM, GPU WebGL, Canvas 2D e tela | Reconhecer o aparelho físico sem depender de cookies |
| **Rede** | `ip` (Endereço IP) | Cabeçalhos `x-forwarded-for` / `x-real-ip` | Registro de rede e segurança |
| **Geolocalização** | `country`, `region`, `city`, `latitude`, `longitude` | Cabeçalhos de borda da Vercel (`x-vercel-ip-*`) | Mapeamento geográfico de acessos e personalização |
| **Dispositivo** | `device_type` (desktop, mobile, tablet) | Análise do `user-agent` | Otimização de interface |
| **Sistema & Navegador** | `os` (Mac OS, Windows, iOS, Android), `browser` (Chrome, Safari, etc.) | Análise do `user-agent` | Compatibilidade técnica |
| **Tela** | `screen_resolution` (ex: `1920x1080`) | Propriedade `window.screen` do navegador | Estatísticas de resolução |
| **Atribuição de Tráfego** | `traffic_category` (Orgânico, Pago, Redes Sociais, Direto, etc.) | Detector de origem (`detectTrafficSource`) | Identificar canais de aquisição |
| **Fonte do Tráfego** | `source_name` (Google, Instagram, YouTube, TikTok, Facebook, etc.) | Leitura do Referrer e parâmetros de URL | Origem exata do tráfego |
| **Parâmetros de Campanha** | `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` | Parâmetros de Query String na URL | Rastreamento de anúncios e criativos |
| **Origem do Clique** | `referrer_url` | `document.referrer` e cabeçalho `referer` | URL da página anterior |
| **Página de Entrada** | `landing_path` e `currentUrl` | Rota acessada (`window.location.href`) | Identificar por qual página o usuário iniciou |
| **User Agent Completo** | `user_agent` | Cabeçalho HTTP `user-agent` | Auditoria detalhada do navegador/dispositivo |

---

## 3. Impressão Digital de Hardware (Device Fingerprint)

Como o navegador não tem acesso direto à placa de rede (MAC address real) por restrições do sistema operacional, o arquivo `deviceFingerprint.ts` combina sinais determinísticos de hardware para criar uma impressão digital única:

1. **CPU:** Número de núcleos de processador (`navigator.hardwareConcurrency`).
2. **Memória RAM:** Quantidade aproximada de memória do dispositivo (`navigator.deviceMemory`).
3. **Placa de Vídeo / GPU:** Vendor e Renderer WebGL desmascarados (`WEBGL_debug_renderer_info`).
4. **Assinatura Gráfica Canvas 2D:** Renderização de formas geométricas, gradientes e texto com antialiasing subpixel.
5. **Display:** Resolução de tela (`width x height`), profundidade de cor (`colorDepth`) e proporção de pixels (`devicePixelRatio`).
6. **Sistema Operacional & Localidade:** Plataforma (`navigator.platform`), fuso horário (`Intl.DateTimeFormat().resolvedOptions().timeZone`) e idioma (`navigator.language`).

**Uso desse dado:**
* Controle anti-fraude do cronômetro de oferta e lote de desconto (`/api/offer-timer`).
* Memorização do último frame de vídeo de fundo por 72 horas (`/api/member/bg-video`).
* Vínculo da visita com abandono de carrinho ou compra finalizada.

---

## 4. Dados Coletados no Checkout (Asaas & Abandonos)

### A. Ao Tentar Comprar (Checkout Concluído via `/api/checkout/asaas`)
Salvo no Asaas (Gateway de Pagamento) e no Supabase:

* **Dados Pessoais:**
  * Nome Completo (`name`)
  * E-mail (`email`)
  * CPF ou CNPJ (`cpfCnpj`)
  * Telefone Celular com DDD (`phone`)
  * Data de Nascimento (`birthDate`)
  * Idade calculada (`age`)
  * Profissão (`profession`)
* **Endereço Completo (para emissão fiscal):**
  * CEP (`postalCode`)
  * Logradouro, Número e Complemento
  * Bairro, Cidade e Estado (UF)
* **Dados de Pagamento:**
  * Forma de pagamento escolhida (PIX ou Cartão de Crédito)
  * Quantidade de parcelas selecionadas
  * *No caso de Cartão:* Nome impresso no cartão, 4 últimos dígitos (o número completo e CVV vão criptografados diretamente para a API PCI-DSS do Asaas e **não** ficam salvos em texto puro no servidor do site).
* **Dados Técnicos Vinculados à Compra:**
  * Endereço IP do comprador
  * Device Fingerprint / MAC digital
  * Origem do tráfego (`trafficSource`) e parâmetros `utm_source`
  * ID do lote e status do cronômetro de desconto no momento da compra

### B. Ao Desistir ou Fechar o Checkout (Lead de Abandono via `/api/checkout/abandon`)
Salvo na tabela `checkout_abandonment_leads` do Supabase:

* Nome informado
* E-mail informado
* Telefone informado
* Localização / CEP preenchido
* Profissão
* Motivo da desistência ou fechamento do modal
* Forma de pagamento que estava selecionada
* Endereço IP, Device Fingerprint e URL de referência

---

## 5. Área de Membros e Autenticação de Alunos

Salvo no Supabase Auth e nas tabelas `user_active_sessions` e `profiles`:

* **Credenciais:** E-mail cadastrado, Hash da senha (criptografia via bcrypt/Argon2 do Supabase).
* **Perfil do Aluno:** Nome, foto/avatar (`upload-avatar`), bio, profissão, apelido público (`nickname`).
* **Sessões Ativas e Bloqueio de Compartilhamento:**
  * Nome amigável do dispositivo (ex: *"Mac OS · Chrome"*, *"Windows · Edge"*)
  * Endereço IP no momento do login
  * Cidade e Estado aproximados de acesso
  * Data e hora do último batimento de coração da sessão (`last_heartbeat_at`)
  * Identificador da sessão anterior desativada quando o aluno conecta em outro lugar
* **Progresso e Interações:**
  * Aulas assistidas e status de leitura/conclusão (`reading-state`)
  * Comentários publicados e curtidas em comentários (`comments`, `comments/like`)
  * Notificações lidas

---

## 6. Cookies e Armazenamento Local (Cookies / LocalStorage)

| Nome da Chave | Onde Fica | Duração | O que Guarda |
| :--- | :--- | :--- | :--- |
| `flmmkr_visitor_id` | `localStorage` | Permanente | ID anônimo do visitante |
| `flmmkr_traffic_attribution` | `localStorage` | Permanente | Canal de tráfego, campanha e referrer da primeira visita |
| `flmmkr_device_mac_v3` | `localStorage` | Permanente | Hash do Device Fingerprint do computador |
| `flmmkr_attribution` | Cookie | 30 dias | Dados compactados de atribuição repassados ao checkout |
| `flmmkr_device_mac` | Cookie | 36 horas | Identificador de hardware para validação do cronômetro de oferta |
| `sb-*-auth-token` | Cookie / LocalStorage | Sessão/Persistente | Token JWT de autenticação do Supabase |

---

## 7. Ferramentas e Tags de Terceiros Integradas

### 1. Google Analytics (GA4)
* **IDs Ativos:** `G-RD157QZHM5` (Geral do site) e `G-44TKSTB0X1` (Página de Produto Color Master)
* **O que captura:** Visualizações de páginas (Page Views), tempo de permanência, taxa de rejeição, rolagem de página, cliques em links e botões, modelo do dispositivo, país/cidade estimada e engajamento.

### 2. Google Tag Manager (GTM)
* **IDs Ativos:** `GTM-TZ3FJT5D` (Geral do site) e `GTM-K4F5JBQ5` (Página de Produto Color Master)
* **O que captura:** Disparador central de tags de marketing, pixels de conversão e eventos customizados.

### 3. Microsoft Clarity
* **ID Ativo:** `yt873eayk5`
* **O que captura:**
  * Mapas de calor (Heatmaps) de cliques e rolagem.
  * Gravação em vídeo anônima da sessão do usuário (movimentação do mouse, toques no celular).
  * Detecção de comportamentos de frustração (*Rage Clicks*, *Dead Clicks*, rolagem excessiva).
  * Mascaramento automático: O Clarity mascara campos confidenciais de digitação (senhas e dados sensíveis) por padrão.

### 4. Asaas Gestão Financeira
* **O que processa:** Processamento seguro de pagamentos, validação de transações e prevenção a fraudes de cartão.

---

## 8. Conformidade com a LGPD (Lei nº 13.709/2018)

* **Bases Legais Utilizadas:**
  * *Execução de Contrato:* Dados coletados no checkout para prestação do serviço educacional.
  * *Cumprimento de Obrigação Legal/Fiscal:* Guarda de dados fiscais (CPF, endereço) exigida pelas leis tributárias.
  * *Legítimo Interesse e Segurança:* Impressão digital de hardware, IP e cookies técnicos para prevenção a fraudes e controle de acesso individual à plataforma.
  * *Consentimento e Análise:* Ferramentas de métricas e analytics para melhoria contínua da experiência de uso.
* **Direitos do Titular:** O usuário pode a qualquer momento solicitar a consulta, correção ou exclusão de seus dados pessoais entrando em contato pelos canais oficiais de privacidade informados em `https://flmmkr.site/privacidade`.
