# Decisões — Tarefa 2, rodada 1

Os dois pareceres vieram APROVADO: não há apontamento para triar.

## Sugestões do revisor de código

- **O `maxlength` liga um validador sem mensagem:** adotada na Tarefa 4: o bairro que vier do ViaCEP é cortado em 60 caracteres antes de entrar no campo.
- **O `errorOf` repetido em duas features:** candidata a manutenção no fechamento da história, quando a forma dos avisos (dias, CEP) estiver conhecida.
- **Os testes fixam a ordem dica → erro no `aria-describedby`:** mantida. A ordem é a da tela (a dica vem primeiro), e é a que o leitor de tela lê.
