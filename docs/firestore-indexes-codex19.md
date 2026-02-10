# Firestore Indexes - COMIIT CODEX 19

Objetivo: suportar as consultas da loja/admin sem erro de indice, com leitura limitada e sem listener em tempo real.

## Indices compostos adicionados

1. Collection: `reviews`
   Campos:
   - `productId` (`ASC`)
   - `createdAt` (`DESC`)
   Uso:
   - tela de detalhe do produto (`src/app/loja/[id]/page.tsx`).

2. Collection: `orders`
   Campos:
   - `userId` (`ASC`)
   - `productId` (`ASC`)
   - `createdAt` (`DESC`)
   Uso:
   - validacao do ultimo pedido do usuario no detalhe do produto (`src/app/loja/[id]/page.tsx`).

## Arquivo fonte

- `firestore.indexes.json`
