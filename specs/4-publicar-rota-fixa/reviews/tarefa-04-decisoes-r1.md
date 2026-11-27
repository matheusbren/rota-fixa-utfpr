# Decisões — Tarefa 4, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | O CEP que existe mas vem sem bairro (CEP de cidade inteira) mostra "Não achamos este CEP. Digite o bairro." | conformidade | recusado | Não foi o implementador que inventou: a equipe decidiu este caso no despacho da tarefa (tratar como "não achamos" ou deixar o Bairro como estava, o que fosse mais simples). A mensagem leva a pessoa à única saída que a spec prevê para quando o CEP não ajuda ("O CEP é ajuda, não obrigação: a pessoa digita o bairro e segue", em "Abandono no meio"), e um texto novo só para esse caso seria mensagem que a spec não tem. Fica registrado aqui como decisão da equipe. |

## Sugestões do revisor de código

- **A tela traduz a falha da busca, e o §2.1 manda o Service fazer isso:** mantido o que o plano decidiu (a falha chega como erro e a tela a traduz em aviso no campo). No fechamento da história, o §2.1 registra a exceção para APIs de terceiros: quem chama traduz a falha, porque ela não é erro da tela inteira.
- **O comentário do endereço do ViaCEP cita o §5.3:** o fechamento da história registra no §5.3 que o endereço fixo de uma API pública mora no Service; a citação do comentário passa a valer.
- **`markAsDirty()` sem teste:** fica para a US11 (#8), quando a edição da rota precisar saber o que mudou.
- **Interceptors e a API de terceiros:** registrar no §2.1, no fechamento, que os interceptors conferem o endereço (`environment.apiUrl`) antes de agir.

## Confirmação do Matheus

Em 26/11/2026 li o apontamento 1 e a justificativa acima, e mantenho a recusa.
