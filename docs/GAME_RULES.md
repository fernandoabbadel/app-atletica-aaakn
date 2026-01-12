# 🦈 SHARK LEGENDS - REGRAS DE PROGRESSÃO E ECONOMIA V2.0

## 1. Visão Geral
O Shark Legends é um "Real Life RPG". O objetivo é criar um ciclo onde o engajamento com a Atlética na vida real gera poder no jogo.

---

## 2. Atributos (Os 4 Pilares + Base)

| Atributo | Símbolo | Fonte Principal (Vida Real) | Impacto na Batalha (Jogo) |
| :--- | :---: | :--- | :--- |
| **FORÇA (STR)** | 💪 | **Gym / Treinos / GymRats** | Aumenta o Dano Físico Bruto (Golpe "Esmagar"). |
| **DEFESA (DEF)** | 🛡️ | **Loja / Sócio / Fidelidade** | Reduz o Dano Recebido e aumenta chance de Esquiva. |
| **INTELIGÊNCIA (INT)** | 🧠 | **Eventos / Social / Sugestões** | Aumenta a Chance de Crítico e o Dano do Golpe "Tática". |
| **ATAQUE (ATK)** | ⚔️ | **Games / Conquistas / Vitórias** | Aumenta a Precisão e o Dano do Golpe "Combo". |
| **STAMINA** | ⚡ | **Login Diário / Nível** | Energia usada para realizar ações em combate. |
| **HP (VIDA)** | ❤️ | **Nível do Usuário** | Resistência antes de ser derrotado. |

---

## 3. Tabela Completa de XP e Recompensas (Economy)

### 🏋️ GYM & ESPORTES (Foco: Força)
1.  **Presença no Treino:** +30 XP | +2 Força | +1 Stamina (Máx 1x/dia).
2.  **Post no Campeonato Gym:** +15 XP | +1 Força.
3.  **Finalizar GymRats (Top 10):** +500 XP | +10 Força | +10 Stamina (Recompensa de Temporada).

### 🛍️ FINANCEIRO (Foco: Defesa)
4.  **Compra na Loja:** +50 XP a cada R$ 10,00 | +1 Defesa a cada R$ 10,00.
5.  **Completar Fidelidade (Cartela Cheia):** +300 XP | +5 Defesa.
6.  **Plano de Sócio (Assinatura):**
    * *Plano Básico:* +200 XP/mês | +2 Defesa.
    * *Plano Premium:* +500 XP/mês | +5 Defesa | +2 Stamina.

### 🧠 SOCIAL & GESTÃO (Foco: Inteligência)
7.  **Check-in em Evento/Festa:** +100 XP | +3 Inteligência.
8.  **Enviar Sugestão de Melhoria (Aprovada):** +200 XP | +5 Inteligência (Valoriza quem pensa na Atlética).
9.  **Denúncia Válida (Moderação):** +10 XP (Pequeno incentivo para manter a ordem).
10. **Compartilhar App/Conquista:** +20 XP (Meta de viralização).

### ⚔️ GAME & CONSISTÊNCIA (Foco: Ataque/Stamina)
11. **Login Diário (Streaks):**
    * 7 Dias: +50 XP | +2 Stamina.
    * 15 Dias: +150 XP | +5 Stamina.
    * 30 Dias: +500 XP | +10 Stamina.
12. **Meta de Vitórias (PvP):** A cada 10 vitórias = +100 XP | +2 Ataque.
13. **Completar Conquistas (Badges):** Varia de +50 a +1000 XP dependendo da dificuldade.
14. **Meta da Turma (Coletivo):** Se a turma bater a meta de XP/Doações = Todos ganham +200 XP.

---

## 4. Sistema de Batalha (Math & Logic)

### Os 4 Golpes
1.  **Esmagar (Força):** Dano alto (80 base), gasta muita stamina (40).
2.  **Tática (Inteligência):** Dano médio (50 base), **ignora 50% da defesa inimiga**.
3.  **Combo (Ataque):** Dano baixo (35 base), gasta pouca stamina (15), alta precisão.
4.  **Postura (Defesa):** Não ataca. Recupera Vida/Stamina e reduz dano recebido em 80%.

### Fórmula de Dano
`DanoFinal = (PoderDoGolpe + AtributoDoAtacante) * ( 100 / (100 + DefesaDoInimigo) )`

---

## 5. Progressão de Nível
* **Nível 0:** O começo.
* **XP Necessário:** `Nível Atual * 100 * 1.5` (Curva exponencial).
* **Evolução Visual:** Lv 1 (Slime) -> Lv 20 (Shark Jovem) -> Lv 50 (Lendário).