# Firestore Indexes - COMIIT CODEX 21

Objetivo: suportar consultas de ranking por turma com ordenacao por XP e manter as paginas de games/gym/sharkround sem listener em tempo real.

## Indices compostos adicionados

1. Collection: `users`
   Campos:
   - `turma` (`ASC`)
   - `xp` (`DESC`)
   Uso:
   - ranking interno da turma (`src/app/ranking/[turmaId]/page.tsx`) com `where("turma","==",...) + orderBy("xp","desc") + limit(...)`.

## Arquivo fonte

- `firestore.indexes.json`
