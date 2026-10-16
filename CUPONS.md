# Cupons de desconto (afiliados)

Cupom ativo: **MAGIC** (29,473684%, ou seja, R$ 95 → R$ 67). O desconto é percentual e acompanha o preço que o site mostra naquele momento (fase de preço, cronômetro e desconto do tooltip). Nunca há valor fixo em reais no código.

| Preço atual | Com MAGIC |
|---|---|
| R$ 95 | R$ 67,00 |
| R$ 125 | R$ 88,16 |
| R$ 150 | R$ 105,79 |
| R$ 195 | R$ 137,53 |

## Como funciona
1. O cliente digita o cupom no checkout (maiúsculas/minúsculas e espaços não importam) e clica em **Aplicar**.
2. `POST /api/checkout/coupon` valida o cupom e calcula o desconto **no servidor**, sobre o preço atual (limite de 15 tentativas a cada 10 min por IP).
3. No pagamento, o navegador manda só o código. O servidor recalcula tudo e cria a cobrança no Asaas já com o valor final.
4. A cobrança fica identificável no painel do Asaas: `description` termina com ` - Cupom MAGIC` e `externalReference` termina com `|MAGIC` (ex.: `pix_<uuid>|MAGIC`, `cm_<timestamp>|MAGIC`).
5. Cada pedido com cupom é gravado em `coupon_orders` (cupom, preço original, desconto, valor final, id da cobrança no Asaas).
6. O contador `coupons.used_count` só sobe quando o pagamento é **confirmado** (webhook), uma vez por pagamento.

O Asaas não tem campo nativo de cupom (o objeto `discount` da API é desconto por pagamento antecipado), por isso usamos o valor final calculado + `description`/`externalReference`.

## Cadastrar um novo cupom
No SQL Editor do Supabase (a tabela só é acessível pela service role):
```sql
INSERT INTO public.coupons (code, discount_percent, affiliate_name, expires_at, max_uses)
VALUES ('NOVOCUPOM', 20, 'Nome do afiliado', '2026-12-31 23:59:59-03', 100);
```
- `code`: MAIÚSCULAS, 3 a 32 caracteres (A-Z, 0-9, `_`, `-`).
- `discount_percent`: percentual (ex.: 20 = 20%). `expires_at`, `starts_at` e `max_uses` são opcionais.
- Desativar: `UPDATE public.coupons SET active = false WHERE code = 'MAGIC';`

## Relatório de vendas por afiliado
```sql
SELECT coupon_code, count(*) AS vendas, sum(final_price) AS total, sum(discount_amount) AS descontos
FROM public.coupon_orders WHERE status = 'CONFIRMED' GROUP BY coupon_code ORDER BY vendas DESC;
```

## Como testar no sandbox do Asaas
1. Aplique a migration `20261016010000_coupons.sql` e aponte `ASAAS_API_URL=https://api-sandbox.asaas.com/v3` com a chave do sandbox.
2. Abra a landing, clique em comprar, digite `magic` e **Aplicar**: deve mostrar o preço riscado, `−R$ x` e o novo total.
3. Pague com Pix (confirme no painel do sandbox) e com cartão (4444 4444 4444 4440), à vista e parcelado.
4. No painel do Asaas, confira a descrição (`… - Cupom MAGIC`) e o `externalReference` (`…|MAGIC`).
5. Depois do webhook, `coupon_orders.status = 'CONFIRMED'` e `coupons.used_count` aumentou em 1 (repetir o webhook não soma de novo).
6. Cupom errado, inativo ou expirado mostra a mensagem em português e o checkout continua normal.

## Decisões e riscos
- O cupom vale só para o **Color Master | Produto** (o preço com fases e cronômetro). O Completo (R$ 497) não aceita cupom.
- Ele se soma ao preço mostrado, inclusive ao preço do cronômetro e ao desconto de 25% do tooltip (é sobre "o valor que o site está oferecendo").
- O webhook aceitava cobranças sem pedido pendente a partir de R$ 95. Baixei o piso para R$ 60 e, quando há pedido com cupom, o valor pago precisa bater com o valor final registrado.
- O limite de usos é conferido na criação da cobrança; duas compras simultâneas no último uso podem passar do limite por 1 (o contador soma na confirmação).
- Reembolso: usa o valor da cobrança no Asaas, que já é o valor com desconto. Nada mudou nesse fluxo.
