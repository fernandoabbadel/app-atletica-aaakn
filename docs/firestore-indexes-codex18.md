# Firestore Indexes - COMIIT CODEX 18

Objetivo: evitar erro de indice em consultas de eventos e reduzir custo com pagina publica/admin usando `limit(...)` e carregamento sob demanda.

## Indices compostos adicionados

1. Collection: `solicitacoes_ingressos`
   Campos:
   - `eventoId` (`ASC`)
   - `dataSolicitacao` (`DESC`)
   Uso:
   - lista financeira no admin (`src/app/admin/eventos/page.tsx`).

2. Collection: `solicitacoes_ingressos`
   Campos:
   - `userId` (`ASC`)
   - `eventoId` (`ASC`)
   - `dataSolicitacao` (`DESC`)
   Uso:
   - pedidos do usuario na tela do evento (`src/app/eventos/[id]/page.tsx`).

## Arquivo fonte

- `firestore.indexes.json`
