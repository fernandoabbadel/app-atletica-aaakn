# Firestore Indexes - COMIIT CODEX 20

Objetivo: reduzir leituras no guia (`admin` e publico) carregando por categoria com limite, sem listener em tempo real.

## Consultas aplicadas

1. Collection: `guia_data`
   Filtro:
   - `where("categoria", "==", <categoria>)`
   Limite:
   - `limit(200)` no admin
   - `limit(60)` no publico por categoria

## Indices compostos

- Nenhum indice composto novo foi necessario neste bloco.
- As consultas usam um unico campo filtrado (`categoria`), coberto por indexacao padrao do Firestore.

## Arquivo fonte

- `src/lib/guiaService.ts`
