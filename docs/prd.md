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

## 👤 3. Atores e Permissões

> ⚠️ A coluna **"Não pode"** vira Guard na rota e regra de acesso no BaaS
> (ex.: RLS no Supabase).

| Ator | Quem é | Pode | Não pode |
| :--- | :----- | :--- | :------- |
| **Visitante** | Quem ainda não entrou na plataforma. | Ver a página inicial, buscar rotas e ver campus, dias, horário e vagas livres. Criar conta e entrar. | Ver o nome, a foto, o contato ou o ponto de encontro de qualquer pessoa. Assinar rota, reservar vaga, publicar rota, avaliar. |
| **Passageiro** | Usuário autenticado com e-mail institucional. Todo usuário nasce passageiro. | Assinar rotas com vaga, liberar a vaga em uma viagem, reservar vaga avulsa, ver a própria agenda e o próprio histórico, ver a reputação e o veículo dos motoristas, avaliar quem viajou com ele, editar o próprio perfil, cadastrar um veículo e virar motorista. | Publicar rota sem veículo cadastrado. Assinar a própria rota. Ver o histórico ou as faltas de outro passageiro. Editar ou cancelar rota de terceiro. Avaliar quem não viajou com ele. Assinar rota nova enquanto estiver suspenso. |
| **Motorista** | Passageiro que cadastrou um veículo. Acumula os dois papéis. | Tudo o que o passageiro pode, mais: publicar rota fixa, editar campos que não afetam viagens confirmadas, encerrar a própria rota, cancelar uma viagem da própria rota, ver quem ocupa as vagas das próprias viagens, marcar ausência no ponto de encontro. | Ocupar vaga na própria rota. Ver a lista de passageiros de rota de terceiro. Remover falta ou avaliação já registrada. Editar dia ou horário de rota com viagem já confirmada. |
| **Administrador** | Integrante da equipe responsável pela moderação da plataforma. | Ver denúncias, suspender um usuário por prazo determinado com justificativa registrada, encerrar rota denunciada. | Editar PRD do negócio dentro do produto: criar, assinar ou avaliar rota em nome de outra pessoa. Apagar histórico de viagem. Alterar falta ou avaliação de terceiro. |

---

## 📝 4. Escopo Funcional (User Stories)

> Dois eixos por story, que não se misturam: **Prioridade (MoSCoW)** —
> `Must Have` é o escopo comprometido — e **Tamanho (esforço)** — `S` cabe numa
> sessão, `M` vira algumas tarefas, `L` pede divisão. O status percorre
> `Draft` → `Ready` → `Live`.

### US01 — Criar conta com e-mail institucional · `Must Have` · `M` · Status: `Ready`

**Como** estudante ou servidor da UTFPR, **eu quero** criar uma conta com o meu
e-mail institucional **para que** eu só divida carro com gente de dentro da
universidade.

**Critérios de aceite:**

- [ ] **Dado** que informo um e-mail institucional válido e uma senha que atende
      aos requisitos, **quando** confirmo o cadastro, **então** recebo a
      mensagem de que falta verificar o e-mail e a conta fica pendente.
- [ ] **Dado** que informo um e-mail de domínio não institucional, **quando**
      tento confirmar, **então** vejo "Use o seu e-mail da UTFPR" e nada é
      gravado.
- [ ] **Dado** que já existe conta com aquele e-mail, **quando** tento cadastrar
      de novo, **então** vejo a mensagem de e-mail já cadastrado com o caminho
      para entrar, e nenhuma conta duplicada é criada.
- [ ] **Dado** que a conta está pendente de verificação, **quando** tento entrar,
      **então** vejo o aviso de verificação pendente e a opção de reenviar.

**Regras relacionadas:** RN01

---

### US02 — Entrar e sair da plataforma · `Must Have` · `S` · Status: `Ready`

**Como** usuário cadastrado, **eu quero** entrar e sair da plataforma **para
que** as minhas caronas e os meus dados fiquem acessíveis só para mim.

**Critérios de aceite:**

- [ ] **Dado** que informo e-mail e senha corretos de uma conta verificada,
      **quando** entro, **então** chego na minha agenda da semana já autenticado.
- [ ] **Dado** que informo senha incorreta, **quando** tento entrar, **então**
      vejo "E-mail ou senha inválidos", sem dizer qual dos dois errei, e
      continuo na tela de entrada.
- [ ] **Dado** que estou autenticado, **quando** saio, **então** a sessão é
      encerrada e tentar abrir a agenda me leva de volta para a tela de entrada.
- [ ] **Dado** que não estou autenticado, **quando** abro pelo endereço direto
      uma tela que exige conta, **então** sou levado para a tela de entrada e,
      depois de entrar, chego na tela que eu havia pedido.

**Regras relacionadas:** RN01, RN17

---

### US03 — Cadastrar veículo e passar a oferecer carona · `Must Have` · `S` · Status: `Ready`

**Como** passageiro que também dirige, **eu quero** cadastrar o meu veículo
**para que** eu possa publicar rotas e os passageiros saibam qual carro procurar.

**Critérios de aceite:**

- [ ] **Dado** que informo modelo, cor e placa do veículo, **quando** salvo,
      **então** o veículo aparece no meu perfil e a opção de publicar rota fica
      disponível.
- [ ] **Dado** que deixo a placa em branco ou fora do formato, **quando** tento
      salvar, **então** vejo a mensagem no campo errado, o botão de salvar
      permanece desabilitado e nada é gravado.
- [ ] **Dado** que ainda não cadastrei veículo, **quando** abro a tela de
      publicar rota, **então** vejo o convite para cadastrar o veículo primeiro,
      em vez de um formulário que não posso concluir.

**Regras relacionadas:** RN02

---

### US04 — Publicar uma rota fixa · `Must Have` · `M` · Status: `Ready`

**Como** motorista, **eu quero** publicar de uma vez o trajeto que faço toda
semana **para que** eu não precise combinar carona de novo a cada viagem.

**Critérios de aceite:**

- [ ] **Dado** que informo origem, destino com um campus em uma das pontas, os
      dias da semana, o horário de saída, o ponto de encontro e de 1 a 4 vagas,
      **quando** publico, **então** a rota aparece em "Minhas rotas" e as viagens
      das próximas quatro semanas ficam visíveis na busca.
- [ ] **Dado** que nenhuma das pontas é um campus, **quando** tento publicar,
      **então** vejo "Uma das pontas precisa ser um campus da UTFPR" e nada é
      publicado.
- [ ] **Dado** que não marquei nenhum dia da semana, **quando** tento publicar,
      **então** o botão continua desabilitado e o campo de dias mostra o que
      falta.
- [ ] **Dado** que informo um horário e dias que coincidem com outra rota minha
      já ativa, **quando** tento publicar, **então** vejo qual rota conflita e a
      publicação é recusada.

**Regras relacionadas:** RN02, RN03, RN18

---

### US05 — Procurar rotas por campus, dia e horário · `Must Have` · `M` · Status: `Draft`

**Como** passageiro, **eu quero** filtrar as rotas pelo campus, pelo dia da
semana e pela faixa de horário **para que** eu encontre a que serve para a minha
grade de aulas.

**Critérios de aceite:**

- [ ] **Dado** que escolho um campus, um dia da semana e uma faixa de horário,
      **quando** busco, **então** vejo as rotas que atendem aos três filtros, com
      bairro de origem, horário, dias e vagas livres.
- [ ] **Dado** que nenhuma rota atende aos filtros, **quando** busco, **então**
      vejo o estado vazio explicando o que não encontrou e um caminho para
      afrouxar o filtro, sem lista em branco.
- [ ] **Dado** que sou visitante, **quando** vejo o resultado, **então** vejo
      campus, dias, horário e vagas livres, mas não vejo nome, contato nem ponto
      de encontro de ninguém.
- [ ] **Dado** que uma rota está com todas as vagas ocupadas, **quando** ela
      aparece no resultado, **então** está marcada como sem vaga e não oferece o
      botão de assinar.

**Regras relacionadas:** RN03, RN17

---

### US06 — Ver o detalhe de uma rota antes de decidir · `Must Have` · `S` · Status: `Draft`

**Como** passageiro, **eu quero** abrir a rota e ver quem dirige, que carro é e
como é o trajeto **para que** eu decida com informação, e não no escuro.

**Critérios de aceite:**

- [ ] **Dado** que abro uma rota estando autenticado, **quando** a tela carrega,
      **então** vejo o primeiro nome do motorista, a reputação dele, modelo e cor
      do veículo, os dias, o horário, as vagas livres e o rateio sugerido, se
      houver.
- [ ] **Dado** que ainda não tenho vaga confirmada nessa rota, **quando** vejo o
      detalhe, **então** o ponto de encontro exato e o contato do motorista
      aparecem ocultos, com a explicação de que são liberados após a confirmação.
- [ ] **Dado** que a rota foi encerrada enquanto eu a tinha aberta, **quando**
      tento assinar, **então** vejo "Esta rota foi encerrada" e volto para a
      busca, sem nada gravado.

**Regras relacionadas:** RN17

---

### US07 — Assinar uma vaga recorrente · `Must Have` · `M` · Status: `Draft`

**Como** passageiro autenticado, **eu quero** assinar a rota **para que** eu
tenha vaga garantida em todas as viagens dela, sem pedir de novo toda semana.

**Critérios de aceite:**

- [ ] **Dado** que a rota tem vaga livre e não conflita com nada meu, **quando**
      confirmo a assinatura, **então** as viagens das próximas quatro semanas
      passam a aparecer na minha agenda, e o ponto de encontro e o contato do
      motorista ficam visíveis.
- [ ] **Dado** que a última vaga foi ocupada enquanto eu decidia, **quando**
      confirmo, **então** vejo "Esta rota ficou sem vaga" e nada é gravado.
- [ ] **Dado** que eu já assino outra rota no mesmo dia e horário, **quando**
      tento assinar, **então** vejo qual assinatura conflita e a operação é
      recusada.
- [ ] **Dado** que sou o motorista daquela rota, **quando** abro o detalhe,
      **então** não existe botão de assinar.
- [ ] **Dado** que estou suspenso por faltas, **quando** tento assinar, **então**
      vejo até que data estou suspenso e a operação é recusada.

**Regras relacionadas:** RN04, RN05, RN06, RN10, RN17, RN18

---

### US08 — Ver a minha agenda da semana · `Must Have` · `M` · Status: `Draft`

**Como** passageiro ou motorista, **eu quero** ver em um só lugar as viagens que
tenho nos próximos dias **para que** eu saiba de relance onde e quando preciso
estar.

**Critérios de aceite:**

- [ ] **Dado** que tenho assinaturas ou reservas ativas, **quando** abro a
      agenda, **então** vejo as próximas viagens em ordem de data e hora, cada
      uma com dia, horário, ponto de encontro e o papel que tenho nela.
- [ ] **Dado** que não tenho nenhuma viagem, **quando** abro a agenda, **então**
      vejo o estado vazio com o convite para procurar uma rota ou publicar a
      minha.
- [ ] **Dado** que uma viagem da minha agenda foi cancelada pelo motorista,
      **quando** abro a agenda, **então** ela aparece marcada como cancelada,
      com o motivo, antes das viagens ativas do mesmo dia.
- [ ] **Dado** que a viagem já aconteceu, **quando** abro a agenda, **então** ela
      não aparece mais entre as próximas e passa a constar no meu histórico.

**Regras relacionadas:** RN15, RN17, RN18

---

### US09 — Liberar a minha vaga em uma viagem · `Must Have` · `S` · Status: `Draft`

**Como** passageiro assinante, **eu quero** avisar que não vou em um dia
específico **para que** o lugar não vá vazio e eu não perca a assinatura.

**Critérios de aceite:**

- [ ] **Dado** que falta mais de duas horas para a saída, **quando** libero a
      vaga, **então** a viagem sai da minha agenda, a vaga volta a ficar
      disponível para aquela viagem e minha assinatura continua ativa para as
      demais.
- [ ] **Dado** que falta menos de duas horas para a saída, **quando** libero,
      **então** vejo o aviso de que isso será registrado como falta, confirmo, e
      a falta aparece no meu histórico.
- [ ] **Dado** que a viagem já saiu, **quando** tento liberar, **então** vejo que
      não é mais possível e nada muda.

**Regras relacionadas:** RN07, RN09, RN10

---

### US10 — Pegar uma vaga liberada · `Must Have` · `M` · Status: `Draft`

**Como** passageiro sem assinatura naquela rota, **eu quero** ocupar uma vaga que
alguém liberou **para que** eu resolva a carona de um dia específico.

**Critérios de aceite:**

- [ ] **Dado** que existe vaga liberada em uma viagem que ainda não saiu,
      **quando** reservo, **então** a viagem entra na minha agenda com ponto de
      encontro e contato do motorista, valendo só para aquela data.
- [ ] **Dado** que outra pessoa reservou a vaga antes de mim, **quando**
      confirmo, **então** vejo "Esta vaga já foi ocupada" e nada é gravado.
- [ ] **Dado** que a viagem já saiu, **quando** a busca é atualizada, **então**
      ela não aparece mais entre as vagas disponíveis.
- [ ] **Dado** que a semana seguinte chega, **quando** abro a agenda, **então** a
      reserva avulsa não se repete — ela valeu para aquela viagem apenas.

**Regras relacionadas:** RN06, RN08, RN10, RN17

---

### US11 — Gerenciar a minha rota · `Must Have` · `M` · Status: `Draft`

**Como** motorista, **eu quero** ajustar ou encerrar a rota que publiquei **para
que** ela reflita a minha realidade quando o semestre ou a rotina mudam.

**Critérios de aceite:**

- [ ] **Dado** que altero o ponto de encontro, o rateio sugerido ou aumento o
      número de vagas, **quando** salvo, **então** a mudança vale para as viagens
      futuras e quem tem vaga confirmada continua com ela.
- [ ] **Dado** que tento reduzir as vagas abaixo do número de vagas já ocupadas
      em uma viagem futura, **quando** salvo, **então** vejo quantas estão
      ocupadas e a redução é recusada.
- [ ] **Dado** que tento alterar dia da semana ou horário de uma rota com viagem
      futura já ocupada, **quando** salvo, **então** vejo que isso exige encerrar
      a rota e publicar outra, e nada é alterado.
- [ ] **Dado** que encerro a rota, **quando** confirmo, **então** as viagens
      futuras somem da agenda de todo mundo com aviso do encerramento, e as
      viagens já realizadas permanecem no histórico.

**Regras relacionadas:** RN03, RN12, RN13, RN15

---

### US12 — Cancelar uma viagem · `Must Have` · `S` · Status: `Draft`

**Como** motorista, **eu quero** avisar que não vou fazer o trajeto em um dia
específico **para que** ninguém fique esperando no ponto.

**Critérios de aceite:**

- [ ] **Dado** que informo o motivo e falta mais de duas horas para a saída,
      **quando** cancelo a viagem, **então** ela aparece como cancelada na agenda
      de todos os ocupantes, com o motivo, e a rota continua ativa nas demais
      datas.
- [ ] **Dado** que falta menos de duas horas, **quando** cancelo, **então** vejo
      que o cancelamento ficará registrado no meu histórico, confirmo, e o
      registro é criado.
- [ ] **Dado** que deixo o motivo em branco, **quando** tento cancelar, **então**
      o botão continua desabilitado e nada é cancelado.

**Regras relacionadas:** RN11, RN15

---

### US13 — Ver quem embarca e registrar ausência · `Must Have` · `M` · Status: `Draft`

**Como** motorista, **eu quero** ver quem tem vaga na viagem de hoje e marcar
quem não apareceu **para que** o combinado tenha consequência.

**Critérios de aceite:**

- [ ] **Dado** que a viagem é hoje, **quando** abro os detalhes dela, **então**
      vejo o nome e o contato de cada pessoa com vaga confirmada e o ponto de
      encontro.
- [ ] **Dado** que a viagem já saiu e alguém não apareceu, **quando** marco a
      ausência, **então** a falta entra no histórico daquele passageiro e a
      marcação não pode mais ser alterada.
- [ ] **Dado** que a viagem ainda não saiu, **quando** abro os detalhes, **então**
      a opção de marcar ausência ainda não está disponível.
- [ ] **Dado** que a viagem é de outro motorista, **quando** abro o detalhe,
      **então** não vejo a lista de passageiros dela.

**Regras relacionadas:** RN09, RN15, RN17

---
