# Firestore Indexes - COMIIT CODEX 4

Objetivo: reduzir custo de leitura e evitar erro de `failed-precondition` nas queries com `where + orderBy`.

## Composite indexes recomendados

1. Collection: `solicitacoes_ingressos`
   Campos:
   - `userId` (`ASC`)
   - `dataSolicitacao` (`DESC`)

2. Collection: `pedidos_loja`
   Campos:
   - `userId` (`ASC`)
   - `createdAt` (`DESC`)

3. Collection: `solicitacoes_adesao`
   Campos:
   - `userId` (`ASC`)
   - `dataSolicitacao` (`DESC`)

4. Collection: `support_requests`
   Campos:
   - `userId` (`ASC`)
   - `createdAt` (`DESC`)

## Observacoes de custo aplicadas no bloco

1. Todas as leituras do bloco usam `limit(...)`.
2. Paginas de pedidos e suporte usam cache curto local para reduzir releitura em navegacao rapida.
3. Para queries com `where + orderBy`, existe fallback para leitura sem ordenacao no servidor se o indice ainda nao existir, evitando quebra da pagina.
