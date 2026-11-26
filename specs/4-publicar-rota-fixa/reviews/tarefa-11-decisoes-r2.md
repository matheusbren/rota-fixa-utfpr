# Decisões — Tarefa 11, rodada 2

Os dois pareceres vieram APROVADO, sem apontamento e sem sugestão: os quatro apontamentos
aceitos na rodada 1 (A a D) foram aplicados como decididos, e nada além deles mudou. A
coluna "Por quê" da linha `shared/ui/` do §3 também ganhou o segundo critério; os dois
revisores a contaram como parte da correção B, e não como escopo novo.

## Observações que não foram promovidas

- **O comentário da árvore do §3 diz que `shared/ui/` tem "componentes burros (só
  input()/output())"**, e o `segmented-control` usa `model()` e o `weekday-picker` usa
  `ControlValueAccessor`. A linha não está neste diff, e a rodada 2 é a última: candidata a
  Issue de manutenção, para dizer que o componente de `shared/ui/` não injeta Service e liga o
  valor por `input()`/`output()`/`model()` ou `ControlValueAccessor`.
- **O `docs/architecture.md` continua sem passar no `prettier --check`**, com os mesmos trechos
  de antes da branch: já registrado em `tarefa-11-decisoes-r1.md` como candidata a Issue
  `chore`.
