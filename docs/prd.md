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

### US14 — Ver a minha reputação e as minhas faltas · `Should Have` · `S` · Status: `Draft`

**Como** passageiro, **eu quero** ver quantas faltas eu tenho e como estou
avaliado **para que** eu saiba onde estou antes de ser recusado por alguém.

**Critérios de aceite:**

- [ ] **Dado** que já viajei e tenho avaliações, **quando** abro o meu perfil,
      **então** vejo a minha nota média, o número de viagens concluídas e as
      faltas dos últimos 30 dias.
- [ ] **Dado** que nunca viajei, **quando** abro o meu perfil, **então** vejo o
      estado vazio explicando que a reputação começa depois da primeira viagem,
      e não uma nota zero.
- [ ] **Dado** que estou suspenso por faltas, **quando** abro o meu perfil,
      **então** vejo até que data a suspensão vale e o que ela impede.
- [ ] **Dado** que abro o perfil de outro passageiro, **quando** a tela carrega,
      **então** vejo a nota média e o número de viagens dele, mas não as faltas.

**Regras relacionadas:** RN09, RN10, RN17

---

### US15 — Avaliar quem viajou comigo · `Should Have` · `M` · Status: `Draft`

**Como** participante de uma viagem concluída, **eu quero** avaliar quem viajou
comigo **para que** a reputação de quem cumpre o combinado valha alguma coisa.

**Critérios de aceite:**

- [ ] **Dado** que a viagem foi concluída há menos de sete dias, **quando** dou
      uma nota e um comentário opcional, **então** a avaliação entra na média da
      pessoa e não pode mais ser editada.
- [ ] **Dado** que já avaliei aquela pessoa naquela viagem, **quando** volto à
      tela, **então** vejo a minha avaliação registrada e nenhum formulário novo.
- [ ] **Dado** que passaram mais de sete dias da viagem, **quando** abro o
      histórico, **então** a opção de avaliar não aparece mais.
- [ ] **Dado** que não participei daquela viagem, **quando** tento avaliar
      alguém dela, **então** a operação é recusada.

**Regras relacionadas:** RN14, RN15

---

### US16 — Informar o rateio sugerido · `Should Have` · `S` · Status: `Draft`

**Como** motorista, **eu quero** informar quanto sugiro por passageiro **para
que** a divisão de combustível seja combinada antes da viagem, e não dentro do
carro.

**Critérios de aceite:**

- [ ] **Dado** que informo um valor por passageiro na rota, **quando** salvo,
      **então** o valor aparece no detalhe da rota e nas viagens futuras dela.
- [ ] **Dado** que não informo valor nenhum, **quando** publico, **então** a rota
      aparece como "a combinar" e continua válida.
- [ ] **Dado** que abro o detalhe de uma rota com rateio, **quando** a tela
      carrega, **então** vejo o aviso de que o valor é sugestão e de que o
      pagamento acontece fora da plataforma.

**Regras relacionadas:** RN16

---

### US17 — Consultar a minha agenda sem internet · `Should Have` · `M` · Status: `Draft`

**Como** passageiro a caminho do ponto de encontro, **eu quero** abrir a agenda
mesmo sem sinal **para que** eu consiga conferir horário e local na rua.

**Critérios de aceite:**

- [ ] **Dado** que já abri a agenda com conexão, **quando** abro de novo sem
      internet, **então** vejo as viagens dos próximos dias com horário e ponto
      de encontro, marcadas como informação possivelmente desatualizada.
- [ ] **Dado** que estou sem internet, **quando** tento liberar uma vaga,
      **então** vejo que a ação precisa de conexão e nada é registrado pela
      metade.
- [ ] **Dado** que nunca abri a agenda com conexão, **quando** abro sem
      internet, **então** vejo a tela de sem conexão, e não uma tela em branco.
- [ ] **Dado** que a conexão volta, **quando** a agenda é atualizada, **então**
      o aviso de dado desatualizado some.

**Regras relacionadas:** RN17

---

### US18 — Ser avisado quando a minha viagem muda · `Could Have` · `M` · Status: `Draft`

**Como** passageiro com vaga confirmada, **eu quero** ser avisado quando a viagem
for cancelada ou alterada **para que** eu não descubra no ponto de encontro.

**Critérios de aceite:**

- [ ] **Dado** que o motorista cancela uma viagem minha, **quando** o
      cancelamento é gravado, **então** recebo um aviso com a data, o motivo e o
      caminho para procurar outra rota.
- [ ] **Dado** que o motorista altera o ponto de encontro de uma viagem minha,
      **quando** a alteração é gravada, **então** recebo o aviso com o ponto
      antigo e o novo.
- [ ] **Dado** que não autorizei notificações no navegador, **quando** algo
      muda, **então** o aviso aparece na agenda ao abrir o aplicativo, e a
      informação não se perde.

**Regras relacionadas:** RN11, RN12

---

### US19 — Denunciar um comportamento e moderar · `Could Have` · `M` · Status: `Draft`

**Como** usuário que passou por um problema sério em uma carona, **eu quero**
denunciar **para que** a comunidade não fique sem recurso quando a reputação não
basta.

**Critérios de aceite:**

- [ ] **Dado** que participei de uma viagem concluída, **quando** denuncio um
      participante dela informando o motivo, **então** a denúncia entra na fila
      de moderação e recebo a confirmação de que foi registrada.
- [ ] **Dado** que sou administrador, **quando** abro a fila, **então** vejo as
      denúncias abertas com viagem, denunciante, denunciado e motivo.
- [ ] **Dado** que sou administrador e suspendo alguém, **quando** informo o
      prazo e a justificativa, **então** a suspensão passa a valer, a
      justificativa fica registrada e o usuário é avisado.
- [ ] **Dado** que não há denúncia aberta, **quando** o administrador abre a
      fila, **então** vê o estado vazio, e não uma tabela sem linhas.
- [ ] **Dado** que sou passageiro comum, **quando** tento abrir a fila de
      moderação pelo endereço direto, **então** sou barrado.

**Regras relacionadas:** RN14, RN15, RN17

---

## 🛡️ 5. Regras de Negócio (Constraints)

| ID | Regra |
| :-- | :---- |
| RN01 | Só cria conta quem tem e-mail de domínio institucional da UTFPR, e a conta só fica ativa depois que o e-mail é verificado. |
| RN02 | Publicar rota exige um veículo cadastrado com modelo, cor e placa. Sem veículo, o usuário é apenas passageiro. |
| RN03 | Toda rota fixa tem um campus da UTFPR em uma das pontas, de 1 a 5 dias da semana, de 1 a 4 vagas, um horário de saída e um ponto de encontro descrito em texto. |
| RN04 | A assinatura ocupa uma vaga em todas as viagens futuras da rota e só pode ser criada se houver vaga livre no momento da confirmação. |
| RN05 | Um passageiro não pode ter duas assinaturas ativas que coincidam em dia da semana com menos de 60 minutos entre os horários de saída. |
| RN06 | O motorista da rota não pode assiná-la nem reservar vaga avulsa nela. |
| RN07 | Liberar a vaga devolve o lugar apenas na viagem escolhida. A assinatura permanece ativa para as demais viagens da rota. |
| RN08 | Vaga liberada fica disponível como reserva avulsa até o horário de saída da viagem, por ordem de confirmação. A reserva avulsa vale para aquela viagem apenas. |
| RN09 | Gera falta no histórico do passageiro: liberar a vaga com menos de 2 horas para a saída, ou ser marcado como ausente pelo motorista depois da viagem. |
| RN10 | Três faltas em 30 dias suspendem o passageiro por 7 dias para novas assinaturas e reservas. As assinaturas já ativas continuam valendo. |
| RN11 | O motorista pode cancelar uma viagem a qualquer momento antes da saída, informando o motivo. Cancelamento com menos de 2 horas fica registrado no histórico dele. |
| RN12 | Encerrar a rota fixa encerra as assinaturas para as viagens futuras dela. As viagens já realizadas permanecem no histórico de todos os participantes. |
| RN13 | Dia da semana e horário de saída não podem ser alterados em rota que já tenha viagem futura com vaga ocupada: é preciso encerrar a rota e publicar outra. |
| RN14 | A avaliação só existe entre pessoas que participaram da mesma viagem concluída, uma por par e por viagem, dentro de 7 dias após a viagem. |
| RN15 | Viagem concluída é imutável: ocupação, falta, cancelamento e avaliação registrados não podem ser editados nem apagados por ninguém, inclusive pelo administrador. |
| RN16 | O rateio é um valor sugerido e informativo. A plataforma não recebe, não intermedeia e não processa pagamento. |
| RN17 | Nome completo, contato e ponto de encontro exato de uma viagem são visíveis apenas ao motorista dela e a quem tem vaga confirmada nela. Visitante não vê dado pessoal algum. |
| RN18 | As viagens de uma rota são geradas para as próximas 4 semanas e avançam conforme o tempo passa. |

---

## 🚫 6. Fora de Escopo (Non-goals)

> O que o produto deliberadamente **não** faz neste semestre — o `Won't Have`
> do MoSCoW, com o motivo de cada corte.

- **Pagamento dentro da plataforma** (cobrança, split, carteira). Envolve meio de
  pagamento e responsabilidade financeira sobre dinheiro de terceiros, que a
  equipe não tem como sustentar em um semestre. O rateio fica informativo
  (RN16).
- **Mapa com o veículo em tempo real.** Exige rastreamento contínuo de
  localização — custo de privacidade alto para um ganho que o ponto de encontro
  descrito em texto já resolve.
- **Chat interno entre motorista e passageiros.** O contato liberado após a
  confirmação já resolve a comunicação, e um chat exigiria moderação de conteúdo
  que o produto não tem como oferecer.
- **Caronas intermunicipais ou de viagem longa.** O recorte da equipe é o
  deslocamento diário casa ↔ campus; rota longa tem outras regras (parada,
  bagagem, custo) que diluiriam o produto.
- **Cadastro de quem não pertence à UTFPR.** A confiança do produto vem de ser
  uma comunidade fechada (RN01).
- **Aplicativo publicado em loja (Play Store / App Store).** A experiência
  instalável pelo navegador cobre o uso no celular sem o custo de publicação e
  revisão de loja.
- **Escolha de assento no veículo.** Com no máximo 4 vagas, a combinação
  acontece naturalmente dentro do carro.
- **Importação automática da grade de aulas do sistema acadêmico.** A equipe não
  tem acesso autorizado aos dados institucionais.
- **Rota com mais de um campus ou com paradas intermediárias formais.** Uma
  ponta é o campus, a outra é o bairro; qualquer parada é combinada entre as
  pessoas, fora do sistema.

---

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)

- **Mobile-first de verdade.** O uso principal acontece no celular, na rua, a
  caminho do ponto de encontro. Toda tela funciona em 360 px de largura sem
  rolagem horizontal, e os alvos de toque não exigem precisão de mouse.
- **Experiência instalável.** O aplicativo pode ser instalado na tela inicial do
  celular e abre em modo próprio, com ícone, cor de tema e tela de abertura.
- **Tolerância a rede ruim.** A agenda dos próximos dias fica consultável sem
  conexão. Qualquer ação que exija rede e falhe avisa explicitamente — nunca
  falha em silêncio nem finge que gravou.
- **Nenhuma tela em branco.** Toda lista tem três estados desenhados: carregando,
  vazia e com erro. Estado vazio sempre oferece o próximo passo.
- **Retorno visível em toda gravação.** Toda operação que altera dado mostra
  estado de carregamento e termina em mensagem de sucesso ou de erro, sempre.
- **Privacidade por padrão.** Nenhum endereço residencial é armazenado. Dado
  pessoal só aparece para quem tem vaga confirmada na mesma viagem (RN17).
- **Acessibilidade.** Navegação completa por teclado, foco sempre visível, e
  contraste mínimo AA nos textos e nos botões principais.
- **Português do Brasil.** Interface, datas, horários e mensagens de erro em
  pt-BR, com datas e horas no formato brasileiro.
- **Mensagem de erro em linguagem de gente.** Nenhum código técnico ou texto de
  servidor chega à tela do usuário.

---

## 🛠️ 8. Histórico

| Data | Versão | O que mudou |
| :--- | :----- | :---------- |
| 20/09/2026 | 1.0.0 | Versão inicial: visão, glossário, atores, US01–US19, RN01–RN18, fora de escopo e requisitos não funcionais. |

---

## ❓ 9. Dúvidas em aberto

- O prazo de 2 horas para liberação sem falta precisa de ajuste depois de testar
  com gente de verdade? O número foi escolhido por ser tempo suficiente para
  outra pessoa reorganizar o dia.
- A geração de viagens para 4 semanas à frente é suficiente para o horizonte de
  um semestre letivo, ou vale estender para o fim do semestre?
- A suspensão de 7 dias por 3 faltas é dura demais para quem depende da carona
  para chegar na aula?
