# CONTA_TODO

Passos manuais e decisões da reformulação do modal "Minha Conta". Atualizado ao fim de cada sprint.

## Passos manuais (Sprints 1 e 2)

**Supabase**
- Aplicar `20261016000000_account_refund_deletion_notifications.sql` (depois das migrations de segurança anteriores).

**Asaas**
- Usar a chave e a URL do **sandbox** em todo teste: `ASAAS_API_URL=https://api-sandbox.asaas.com/v3`.
- A chave de API precisa da permissão **`PAYMENT_REFUND:WRITE`** (exigida pelo estorno de boleto; vale conferir também para cartão e Pix).
- Webhook: garantir que o evento **`PAYMENT_REFUNDED`** está marcado (ele conclui o pedido de reembolso).
- Conferir no sandbox que a cobrança devolve `confirmedDate` (o prazo usa `confirmedDate`; se faltar, usa `paymentDate` e depois `clientPaymentDate`; sem nenhuma, o reembolso fica indisponível). A documentação pública do Asaas não lista `confirmedDate` no objeto da cobrança, então confirme com uma cobrança real de teste.

**Vercel (variáveis, só servidor)**
- `ADMIN_ALERT_EMAIL`: recebe os alertas de reembolso que falharam ou foram para revisão manual.
- `CPF_HASH_SALT` (opcional): sal do hash de CPF; se vazio usa `RATE_LIMIT_HMAC_SECRET`.
- `CRON_SECRET` (usado na Sprint 3).

## Decisões e limitações

- **Reautenticação por senha.** `POST /api/account/reauth` confirma a senha e vale 5 minutos (chave `reauth:<userId>` no Redis; fora de produção, memória). O código OTP por e-mail ficou de fora: o pedido dizia "senha ou OTP". Em produção sem Redis a reautenticação recusa (503).
- **Acesso depois do pedido.** O acesso é revogado antes de falar com o Asaas (`payment_status = 'REFUND_REQUESTED'`). Como o pagamento continua "pago" no Asaas até o estorno terminar, a verificação de acesso e o webhook de pagamento pago **não** devolvem o acesso enquanto existir pedido de reembolso (exceto `manual_review`, que ainda não revogou nada).
- **Vídeos já abertos.** O token DRM do Panda dura 2 h e não dá para revogá-lo no Panda. Quem já está com um vídeo aberto pode terminar a reprodução em curso. Novas aulas e novos tokens são negados na hora (o acesso e as chaves `access:`, `drm:` e `signed:` são apagados).
- **Reembolso de boleto.** O Asaas devolve um link em que o pagador informa os dados bancários. O link fica em `refund_requests.bank_slip_refund_url` e aparece na aba Compras & Acesso.
- **Colunas extras** em `refund_requests` (além das pedidas): `cpf_hash`, `product_key` (limite de 1 reembolso por CPF e produto) e `bank_slip_refund_url`. O CPF em si não é guardado: vem do cliente do Asaas na hora e só o hash fica.
- **Chave do produto.** Derivada da descrição da cobrança ("Completo" no texto = `color-master-completo`; senão `color-master-produto`).
- **Falha do Asaas.** O pedido vira `failed`, o acesso continua revogado e o admin recebe e-mail. O aluno vê "reembolso em análise" (sem detalhe técnico) e a equipe conclui manualmente; quando o estorno sair, o webhook marca `completed`.
- **Testes automáticos:** `npm test` (elegibilidade, prazo e escolha do endpoint). Rodam sem rede. A UNIQUE de `asaas_payment_id` e os CHECKs foram testados num Postgres local descartável.

## Roteiro de testes manuais no sandbox do Asaas (Sprint 2)

Pré-requisitos: app apontando para o sandbox (`ASAAS_API_URL`), webhook do sandbox apontando para o app (use um túnel local ou um preview), e-mail de alerta configurado.

1. **Cartão à vista:** compre com cartão de teste (4444 4444 4444 4440), entre na área de membros, abra Minha Conta > Compras & Acesso. Deve aparecer "Você pode solicitar reembolso até DD/MM às 23:59". Solicite (senha + Turnstile). Esperado: status "Reembolso em processamento", vídeos negados em menos de 1 minuto, `refund_requests.status = processing`. Quando o Asaas enviar `PAYMENT_REFUNDED`: `completed`.
2. **Pix:** o mesmo fluxo com Pix (confirme o pagamento no painel do sandbox). Endpoint: `POST /payments/{id}/refund`.
3. **Boleto:** o mesmo fluxo com boleto (confirme no sandbox). Endpoint: `POST /payments/{id}/bankSlip/refund`; o link de dados bancários aparece no card.
4. **Cartão parcelado:** compre em 3x. Endpoint: `POST /installments/{installment}/refund` (confira nos logs do Asaas).
5. **Prazo:** no banco de teste, altere a data de confirmação (ou use uma cobrança antiga) e confira: às 23:58 do 7º dia aceita; às 00:01 do 8º dia recusa, **inclusive chamando a API direto**:
   `curl -X POST /api/account/refund -b <cookie> -d '{"paymentId":"pay_xxx"}'` deve dar 403 genérico fora do prazo.
6. **Concorrência:** dispare duas requisições ao mesmo tempo (dois `curl` em paralelo ou `xargs -P2`). Deve existir **uma** linha em `refund_requests` e **um** estorno no Asaas (a segunda resposta devolve o pedido existente).
7. **Falha simulada:** troque temporariamente a chave do Asaas por uma inválida, no momento do estorno. Esperado: `status = failed`, coluna `error` preenchida, e-mail de alerta recebido, acesso continua revogado.
8. **Segundo reembolso do mesmo CPF e produto:** depois de um reembolso `completed`, compre de novo com o mesmo CPF e peça outro reembolso. Esperado: `manual_review`, alerta ao admin e acesso mantido.
9. **Não devolve o acesso:** depois do pedido, reenvie o webhook `PAYMENT_CONFIRMED` do mesmo pagamento (ou reabra a área de membros): o acesso **não** volta.
