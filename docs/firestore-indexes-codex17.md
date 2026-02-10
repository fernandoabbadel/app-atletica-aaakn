# Firestore Indexes - COMIIT CODEX 17

Objetivo: garantir que as queries com `where + orderBy` usadas nas paginas de parceiros/empresa nao quebrem por falta de indice e reduzam releituras com `limit(...)`.

## Indices compostos adicionados

1. Collection: `scans`
   Campos:
   - `empresaId` (`ASC`)
   - `timestamp` (`DESC`)
   Uso: historico de scans por empresa em `src/app/empresa/[id]/page.tsx`.

2. Collection: `scans`
   Campos:
   - `empresaId` (`ASC`)
   - `data` (`DESC`)
   Uso: fallback seguro quando indice de timestamp ainda nao estiver pronto.

## Arquivo fonte

- `firestore.indexes.json`

## Deploy

- Com Firebase CLI autenticado no projeto:
  - `firebase deploy --only firestore:indexes --project <SEU_PROJECT_ID>`
