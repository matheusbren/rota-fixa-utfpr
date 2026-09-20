# 📄 Product Requirements Document (PRD)

**Projeto:** Rota Fixa UTFPR
**Versão:** 1.0.0
**Última atualização:** 20/09/2026

> 🤖 **Este documento é a fonte da verdade sobre o QUE o produto faz.** Regra de
> negócio que não estiver aqui não existe — nem para a equipe, nem para a IA.
> Tecnologia **não** se discute aqui: isso é assunto do `architecture.md`.

---

## 🎯 1. Visão Geral e Objetivo

**O problema:** quem estuda na UTFPR faz quase sempre o *mesmo* trajeto, nos
*mesmos* dias, no *mesmo* horário — casa ↔ campus, semana após semana. Hoje essa
combinação acontece em grupos de WhatsApp: a cada viagem alguém repete "alguém
vai pro campus às 18h?", as vagas são acertadas por ordem de quem viu a mensagem
primeiro, e não há registro de quem combinou o quê. O resultado é carro andando
com lugar vazio enquanto tem gente esperando ônibus, e combinado furado sem
nenhuma consequência para quem furou.

**A solução:** o Rota Fixa trata a carona como um **compromisso recorrente**, e
não como um pedido avulso. O motorista publica uma **rota fixa** — origem,
destino, dias da semana, horário e vagas — uma única vez. O passageiro **assina**
essa rota e passa a ter vaga garantida em todas as viagens dela, sem precisar
pedir de novo. Quando não vai em um dia específico, ele **libera a vaga**, que
fica disponível para outro passageiro naquela viagem apenas — a assinatura dele
continua valendo para as demais. Liberar em cima da hora é registrado como
falta, e falta repetida limita novas assinaturas.

**Como saberemos que deu certo:**

- Um passageiro combina a carona **uma vez** e atravessa o mês sem pedir de novo:
  a rota assinada aparece sozinha na agenda dele a cada semana.
- Vaga desocupada em cima da hora é **reaproveitada** — a viagem sai com a vaga
  ocupada por outro passageiro, e não vazia.
- Quem furou o combinado é identificável pelo histórico, sem depender da memória
  de ninguém no grupo.

---

## 📖 2. Glossário Ubíquo

> Os termos do negócio, como a comunidade fala. É daqui que o `architecture.md`
> deriva os nomes das entidades.

| Termo | Significa | Não confundir com |
| :---- | :-------- | :---------------- |
| **Rota fixa** | O compromisso recorrente publicado pelo motorista: origem, destino, dias da semana, horário de saída e número de vagas. É um molde, não acontece em si. | **Viagem** — a rota é o molde; a viagem é a ocorrência dele em uma data. |
| **Viagem** | A ocorrência de uma rota fixa em uma data específica (ex.: a rota "Centro → Campus, seg/qua/sex 18h" na quarta-feira 23/09). É o que de fato acontece. | **Rota fixa** — cancelar uma viagem não encerra a rota. |
| **Assinatura** | O vínculo do passageiro com uma rota fixa. Garante uma vaga em **todas** as viagens futuras daquela rota, sem pedido novo a cada semana. | **Reserva avulsa** — a assinatura é recorrente; a reserva vale para uma viagem só. |
| **Vaga** | Um lugar no veículo em uma viagem. Ocupada por assinatura ou por reserva avulsa. | **Assento físico** — o produto não escolhe onde a pessoa senta. |
| **Liberação** | O passageiro assinante avisa que não vai em uma viagem específica. A vaga dele volta a ficar disponível **naquela viagem**; a assinatura continua. | **Cancelar assinatura** — liberar é para um dia; cancelar encerra o vínculo inteiro. |
| **Reserva avulsa** | A tomada de uma vaga liberada, válida para uma única viagem, por quem não assina a rota. | **Assinatura** — não se repete na semana seguinte. |
| **Falta** | Liberação feita perto demais da saída, ou ausência no ponto de encontro. Fica no histórico do passageiro. | **Liberação com antecedência** — essa não gera falta. |
| **Ponto de encontro** | O local combinado de embarque, descrito em texto pelo motorista na rota. | **Endereço residencial** — o produto nunca expõe endereço de casa. |
| **Campus** | Uma unidade da UTFPR. Toda rota fixa tem um campus em uma das pontas. | **Destino** — o campus pode ser a origem (volta) ou o destino (ida). |
| **Motorista** | Quem dirige e publica a rota. É sempre também um usuário da plataforma, com veículo cadastrado. | **Dono do veículo** — o produto não registra propriedade, só quem dirige. |
| **Rateio sugerido** | Valor por passageiro que o motorista informa como sugestão de divisão de combustível. Informativo. | **Pagamento** — nada é cobrado nem processado na plataforma. |

---
