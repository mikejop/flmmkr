# Inventário de Dados Pessoais (LGPD - Lei nº 13.709/2018)

> **Nota de Conformidade Técnica**: Este documento mapeia a realidade técnica dos dados coletados, armazenados e processados pelo sistema FLMMKR. Não constitui parecer jurídico e deve ser revisado pelo Encarregado de Proteção de Dados (DPO) e assessoria jurídica.

---

## 1. Mapeamento Técnico de Dados Pessoais

| Dado Coletado | Finalidade Técnica / Operacional | Onde Fica Armazenado | Quem Acessa | Base Legal Sugerida (LGPD) | Prazo de Retenção Técnico |
|---|---|---|---|---|---|
| **Nome Completo** | Identificação do aluno, emissão de certificado e suporte | `public.profiles`, `public.pending_checkouts`, `auth.users (raw_user_meta_data)` | Aluno (próprio perfil), Administrador, Gateway Asaas | Execução de Contrato (Art. 7º, V) | Enquanto a conta estiver ativa + 5 anos (CDC / Prescrição Civil) |
| **E-mail** | Login, recuperação de senha, comunicações essenciais e faturamento | `auth.users.email`, `public.profiles.email`, `public.pending_checkouts` | Aluno, Sistema de Autenticação Supabase Auth, Resend (envio de alertas), Asaas | Execução de Contrato (Art. 7º, V) | Enquanto a conta estiver ativa + 5 anos |
| **CPF / CNPJ** | Emissão de nota fiscal e processamento anti-fraude no gateway de pagamento | `public.pending_checkouts.cpf_cnpj`, API externa Asaas | Asaas, Backend (temporariamente em trânsito) | Cumprimento de Obrigação Legal/Fiscal (Art. 7º, II) | 5 anos fiscais (Código Tributário Nacional / Art. 173) |
| **Telefone / WhatsApp** | Suporte urgente, alertas de segurança e validação de conta | `public.profiles.phone`, `public.pending_checkouts.phone` | Aluno, Administrador (suporte) | Execução de Contrato (Art. 7º, V) | Enquanto a conta estiver ativa |
| **Endereço Residencial** | Faturamento, validação fiscal do pagamento com cartão de crédito | `public.profiles.address`, `public.pending_checkouts.address`, Asaas | Asaas, Administrador | Cumprimento de Obrigação Fiscal (Art. 7º, II) | 5 anos fiscais |
| **Data de Nascimento / Idade** | Verificação de maioridade legal para contratação de serviços digitais | `public.profiles.birth_date`, `public.profiles.age` | Sistema (validação de cadastro) | Execução de Contrato (Art. 7º, V) | Enquanto a conta estiver ativa |
| **Profissão** | Personalização didática da formação e pesquisa de mercado | `public.profiles.profession`, `public.checkout_abandonment_leads` | Equipe pedagógica / Marketing interno | Consentimento / Legítimo Interesse (Art. 7º, I e IX) | 1 ano ou até revogação do titular |
| **Foto de Perfil (Avatar)** | Identificação visual na comunidade e comentários de aulas | Supabase Storage (`avatars` bucket), `public.profiles.avatar_url` | Público / Alunos da turma nos comentários | Consentimento / Execução de Contrato | Enquanto a conta estiver ativa |
| **Endereço IP** | Prevenção a fraudes, controle de concorrência de dispositivos e segurança | `login_security_tracking`, `user_active_sessions`, `site_traffic_analytics`, `offer_timer_sessions` | Sistema automatizado de segurança, Administrador | Proteção ao Crédito e Prevenção a Fraude (Art. 7º, X) e Marco Civil da Internet (Art. 15) | 6 meses (Marco Civil da Internet) |
| **Geolocalização (Cidade/Estado)** | Auditoria de acessos concorrentes e telemetria de tráfego | `user_active_sessions.location`, `site_traffic_analytics` | Sistema automatizado de segurança | Prevenção a Fraude e Legítimo Interesse | 6 meses |
| **Impressão Digital do Dispositivo (MAC/Fingerprint)** | Prevenção a compartilhamento indiscriminado de contas e abuso de cronômetro | `offer_timer_sessions.mac_address`, `member_bg_video_sessions`, cookies | Sistema automatizado de segurança | Prevenção a Fraude (Art. 7º, X) | 30 a 90 dias |
| **Dados de Abandono de Checkout (Lead)** | Entender gargalos no checkout e suporte a falhas de pagamento | `public.checkout_abandonment_leads` | Administrador / Equipe de Vendas | Legítimo Interesse (Art. 7º, IX) | 90 dias |
| **Progresso de Aulas / Comentários** | Continuidade do aprendizado e interação na comunidade | `public.user_reading_state`, `public.lesson_comments` | Aluno, Colegas de turma (se público), Administrador | Execução de Contrato (Art. 7º, V) | Enquanto a conta estiver ativa |

---

## 2. Minimização de Dados (Dados Desnecessários Propostos para Remoção)

Em estrita observância ao **Princípio da Necessidade e Minimização (Art. 6º, III da LGPD)**, avaliamos os dados atualmente coletados:

1. **Idade / Data de Nascimento em Compras de Cursos Livres**:
   - *Situação Atual*: O checkout solicita `birthDate` e calcula `age`.
   - *Avaliação Técnica*: Para a venda de cursos livres de pós-produção audiovisual via cartão/Pix, o Asaas já valida a titularidade pelo CPF. A data de nascimento do aluno não é obrigatória para a prestação do serviço educacional.
   - *Proposta*: **Remover o campo obrigatório de data de nascimento** no formulário de checkout, substituindo por uma declaração simples nos Termos de Uso ("Declaro ter mais de 18 anos ou estar devidamente assistido por responsável legal").
2. **Coleta de Leads em Abandono de Carrinho via `sendBeacon` sem Consentimento Explícito**:
   - *Situação Atual*: Em `CheckoutModal.tsx`, se o usuário preenche o nome e fecha o modal, a rota `/api/checkout/abandon` salva os dados no banco sem que o usuário tenha clicado em "Concordo".
   - *Avaliação Técnica*: Pode configurar coleta excessiva sem aviso transparente.
   - *Proposta*: Exibir banner de política clara ou só registrar leads de abandono caso o usuário tenha interagido concordando com o envio de suporte.
3. **CPF armazenado em tabelas desnecessárias**:
   - *Situação Atual*: O CPF fica registrado na tabela `pending_checkouts`.
   - *Proposta*: Garantir que, após a confirmação do pagamento pelo Asaas e geração da fatura, o CPF do pagador não permaneça salvo em texto aberto no banco de aplicação, sendo consultado apenas na API do gateway fiscal sob demanda.

---

## 3. Funcionalidades do Titular (Exportação e Exclusão / Anonimização)

### A. Direito de Portabilidade e Acesso (Exportar Dados - Art. 18, II e V)
O titular tem o direito de receber todos os seus dados em formato legível por máquina (JSON/CSV).
- **Dados a exportar**: Perfil cadastral (`profiles`), histórico de sessões (`user_active_sessions`), progresso e notas (`user_reading_state`), comentários postados (`lesson_comments`).
- **Implementação recomendada**: Endpoint autenticado `GET /api/user/export-data` que valida a sessão do aluno e retorna um payload estruturado.

### B. Direito de Eliminação / Anonimização (Art. 18, VI)
- **Regra de Negócio e Conflito Legal**: Dados estritamente cadastrais e de interação (avatar, comentários, sessões ativas) podem ser eliminados imediatamente. Contudo, dados fiscais de pagamento (histórico no Asaas, notas fiscais, logs de acesso ao sistema conforme o Art. 15 do Marco Civil da Internet) **devem ser mantidos pelo prazo legal obrigatório de 5 anos**.
- **Mecanismo de Anonimização**:
  1. No `profiles`: substituir `full_name` por "Usuário Anonimizado", remover `phone`, `address`, `nickname`, e desvincular avatar.
  2. No Supabase Auth: desativar / excluir o usuário no `auth.users`.
  3. No `lesson_comments`: manter o texto da dúvida para não quebrar a ordem da aula, mas com autor exibido como "Aluno Removido".

---

## 4. Gestão de Consentimento e Registro de Versões

1. **Local do Aceite**:
   - No modal de finalização de compra (`CheckoutModal.tsx`), há a checkbox obrigatória: *"Li e concordo com os Termos de Uso e a Política de Privacidade"*.
2. **Lacuna Técnica Identificada**:
   - O sistema valida no front-end `acceptedTerms === true`, mas **NÃO grava** no banco a data/hora exata do aceite nem a versão dos termos aceitos.
3. **Correção Recomendada no Banco**:
   - Adicionar na tabela `public.profiles` e `public.pending_checkouts`:
     - `accepted_terms_at TIMESTAMPTZ NOT NULL`
     - `terms_version TEXT NOT NULL DEFAULT 'v1.0-202610'`
     - `accepted_terms_ip TEXT NOT NULL`

---

## 5. Criptografia e Segurança dos Dados

1. **Tráfego em Trânsito (TLS / HTTPS)**:
   - Todo o tráfego é forçado em HTTPS via Vercel Edge Network e Supabase API com TLS 1.3 / 1.2.
   - HSTS (Strict-Transport-Security) deve ser ativado nos headers de resposta.
2. **Dados em Repouso**:
   - O banco de dados gerenciado pelo Supabase utiliza criptografia em repouso AES-256 no volume de armazenamento (AWS KMS).
   - Senhas de usuários são criptografadas com hash bcrypt/Argon2 nativo do Supabase Auth.
3. **Dados de Cartão de Crédito**:
   - Nenhum dado completo de cartão de crédito (número, CVV) é armazenado no banco de dados da FLMMKR. A tokenização e cobrança são operadas pelo Asaas (PCI-DSS compliant).

---

## 6. Plano de Resposta a Incidentes de Segurança (Rascunho)

### Comitê de Crise e Tomada de Decisão
- **Responsável pela Decisão**: Gestor Geral / DPO da FLMMKR.
- **Responsável Técnico**: Engenheiro de Segurança / Tech Lead.

### Fluxo de Contenção Imediata
1. **Identificação e Isolamento**:
   - Desconectar imediatamente sessões ativas (`user_active_sessions`).
   - Se houver suspeita de vazamento de credenciais: **Rotacionar imediatamente** `SUPABASE_SECRET_KEY`, `ASAAS_API_KEY`, `RESEND_API_KEY` na Vercel e reiniciar os deployments.
   - Revogar tokens de API e bloquear IPs atacantes no Firewall/WAF da Vercel.
2. **Avaliação de Impacto e Dados Comprometidos**:
   - Verificar nos logs do Supabase e da Vercel quais registros e tabelas foram acessados.
3. **Comunicação à ANPD e aos Titulares (Prazos Legais)**:
   - **Prazo à ANPD**: Comunicação inicial em até **3 dias úteis** após a ciência do incidente grave (ou **6 dias úteis** caso configurada como agente de pequeno porte / MEI / ME), com relatório consolidado em até 20 dias úteis.
   - **Informações Obrigatórias na Notificação**:
     - Natureza dos dados afetados;
     - Número de titulares afetados;
     - Medidas de mitigação adotadas;
     - Riscos potenciais aos titulares;
     - Contato do responsável pela segurança/DPO.

### Modelo de Comunicado aos Titulares (Alunos)
```text
Assunto: Comunicado Importante de Segurança - FLMMKR

Prezado(a) Aluno(a),

Em respeito à sua privacidade e com total compromisso de transparência com nossa comunidade, informamos que identificamos em [DATA/HORA] um incidente de segurança em um de nossos servidores que pode ter exposto informações cadastrais limitadas a [DESCREVER DADOS, ex: nome e e-mail].

Ressaltamos categoricamente que nenhuma informação de cartão de crédito ou senha em texto plano foi comprometida, uma vez que tais dados são gerenciados sob criptografia estrita por nossos processadores de pagamento e autenticação.

Medidas Imediatas Tomadas:
1. O acesso não autorizado foi bloqueado imediatamente e a vulnerabilidade corrigida.
2. Todas as chaves e credenciais do sistema foram rotacionadas.
3. Notificamos formalmente a Autoridade Nacional de Proteção de Dados (ANPD).

Recomendações ao Aluno:
Por precaução, recomendamos a redefinição da sua senha de acesso através da plataforma. Caso note qualquer comunicação suspeita em nosso nome, entre em contato imediatamente pelo canal oficial de segurança: suporte@flmmkr.com.br.

Atenciosamente,
Equipe de Segurança FLMMKR
```

---

## 7. Cláusulas Específicas nos Termos de Uso (Anti-Pirataria e Conta Única)

> **RASCUNHO TÉCNICO PARA REVISÃO DE ADVOGADO ESPECIALISTA EM DIREITO DIGITAL**

### Cláusula: Pessoalidade, Intransferibilidade e Bloqueio de Compartilhamento
1. *O acesso à plataforma de formação, materiais de apoio, footages de comerciais reais e projetos do DaVinci Resolve é estritamente pessoal, individual e intransferível.*
2. *É expressamente vedado ao aluno compartilhar suas credenciais de acesso (e-mail e senha) com quaisquer terceiros, bem como utilizar a mesma conta para acesso concomitante em múltiplos dispositivos não autorizados.*
3. *A plataforma monitora ativamente acessos simultâneos por endereços IP e identificadores de dispositivos. A detecção de tentativas sistemáticas de compartilhamento de conta resultará na desconexão automática de sessões e poderá ensejar a suspensão definitiva da conta por violação contratual, sem direito a reembolso.*

### Cláusula: Propriedade Intelectual, Proibição de Gravação e DRM Watermark
1. *Todo o conteúdo em vídeo, áudio, apostilas, textos e materiais brutos de comerciais disponibilizados na plataforma são de titularidade exclusiva da FLMMKR e de Michael Oliveira, protegidos pela Lei de Direitos Autorais (Lei nº 9.610/1998).*
2. *É expressamente proibido ripar, gravar a tela (screen capture/screen recording), baixar, recomprimir, retransmitir ou redistribuir, total ou parcialmente, qualquer aula ou material didático em redes sociais, torrents, grupos de mensagens ou fóruns.*
3. *O aluno declara ciência de que os vídeos são protegidos por tecnologia de marca d'água dinâmica e identificador individual de reprodução (DRM Watermark), a qual insere, de forma visual e/ou forense, a identificação do aluno comprador (nome e e-mail cadastrado) durante a exibição. Qualquer vazamento identificado na internet ensejará a imediata identificação do responsável e a adoção de medidas cíveis de indenização e criminais por contrafação (Art. 184 do Código Penal).*
