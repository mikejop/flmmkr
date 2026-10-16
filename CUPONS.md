# Cupons (afiliados)

Cupom ativo: **MAGIC**, cupom de **preço fixo por data**. O preço do cupom é uma coisa e o desconto do cronômetro da oferta é outra: um **não soma** com o outro. Quem aplica o MAGIC paga o preço do cupom no lugar do preço que o site mostrava.

| Quando | Preço com o MAGIC |
|---|---|
| até 31/10/2026 às 23:59:59 (Brasília) | **R$ 67,00** |
| a partir de 01/11/2026 às 00:00 | **R$ 95,00** |

O cupom só vale se o preço do cupom for **menor** que o preço do site naquele momento (senão aparece "Este cupom não dá desconto no preço atual."). Os preços e as datas ficam na tabela `coupon_prices`, então dá para mudar sem alterar o código.

## Como funciona
1. O cliente digita o cupom no modal de compra (campo "Cupom": maiúsculas automáticas) e clica em **Aplicar**.
2. `POST /api/checkout/coupon` valida o cupom e calcula tudo **no servidor** (limite de 15 tentativas a cada 10 min por IP).
3. No pagamento, o navegador manda só o código. O servidor recalcula e cria a cobrança no Asaas já com o valor final.
4. No painel do Asaas a cobrança é identificável: `description` termina com ` - Cupom MAGIC` e `externalReference` termina com `|MAGIC` (ex.: `pix_<uuid>|MAGIC`, `cm_<timestamp>|MAGIC`).
5. Cada pedido com cupom é gravado em `coupon_orders` (cupom, preço original, desconto, valor final, id da cobrança).
6. O contador `coupons.used_count` só sobe quando o pagamento é **confirmado** (webhook), uma vez por pagamento.

O Asaas não tem cupom nativo (o `discount` da API é desconto por pagamento antecipado), por isso o cálculo é nosso e o Asaas recebe o valor final.

## Cadastrar um novo cupom
No SQL Editor do Supabase (a tabela só é acessível pela service role):
```sql
-- Cupom de PREÇO por data (como o MAGIC):
INSERT INTO public.coupons (code, discount_type, affiliate_name) VALUES ('NOVOCUPOM', 'fixed_price', 'Nome do afiliado');
INSERT INTO public.coupon_prices (coupon_id, price, starts_at, ends_at)
SELECT id, 80.00, NULL, '2026-12-01 00:00:00-03' FROM public.coupons WHERE code = 'NOVOCUPOM';

-- Cupom de PERCENTUAL sobre o preço do site:
INSERT INTO public.coupons (code, discount_type, discount_percent, affiliate_name, expires_at, max_uses)
VALUES ('OUTRO', 'percent', 20, 'Nome do afiliado', '2026-12-31 23:59:59-03', 100);
```
- `code`: MAIÚSCULAS, 3 a 32 caracteres (A-Z, 0-9, `_`, `-`).
- Em `coupon_prices`, o instante `ends_at` **não** entra na janela (`ends_at = 01/11 00:00` vale até 31/10 23:59:59).
- `starts_at`, `expires_at` e `max_uses` do cupom são opcionais.
- Desativar: `UPDATE public.coupons SET active = false WHERE code = 'MAGIC';`

## Relatório de vendas por afiliado
```sql
SELECT coupon_code, count(*) AS vendas, sum(final_price) AS total, sum(discount_amount) AS descontos
FROM public.coupon_orders WHERE status = 'CONFIRMED' GROUP BY coupon_code ORDER BY vendas DESC;
```

## Como testar no sandbox do Asaas
1. A migration `20261016010000_coupons.sql` já está aplicada em produção; aponte `ASAAS_API_URL=https://api-sandbox.asaas.com/v3` com a chave do sandbox.
2. Abra a landing, clique em comprar, digite `magic` e **Aplicar**: deve mostrar o preço riscado, `−R$ x` e o novo total.
3. Pague com Pix (confirme no painel do sandbox) e com cartão (4444 4444 4444 4440), à vista e parcelado.
4. No painel do Asaas, confira a descrição (`… - Cupom MAGIC`) e o `externalReference` (`…|MAGIC`).
5. Depois do webhook, `coupon_orders.status = 'CONFIRMED'` e `coupons.used_count` aumentou em 1 (repetir o webhook não soma de novo).
6. Cupom errado, inativo ou expirado mostra a mensagem em português e o checkout continua normal.

## Decisões e riscos
- O cupom vale só para o **Color Master | Produto**. O Completo (R$ 497) não aceita cupom.
- O preço do cupom não depende do cronômetro nem do desconto de 25% do tooltip: é o preço do cupom da data, desde que seja menor que o preço do site.
- O webhook aceitava cobranças sem pedido pendente a partir de R$ 95. Baixei o piso para R$ 60 e, quando há pedido com cupom, o valor pago precisa bater com o valor final registrado.
- O limite de usos é conferido na criação da cobrança; duas compras simultâneas no último uso podem passar do limite por 1.
- Reembolso: usa o valor da cobrança no Asaas, que já é o valor com desconto.
- Links de pagamento antigos do Asaas (R$ 95, 125, 145 e 195) continuam ativos e não passam pelo cupom.
