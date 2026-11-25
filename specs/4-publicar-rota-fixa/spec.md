---
issue: 4
status: aprovada
---

# US04 — Publicar uma rota fixa

## O problema

Quem dirige até a UTFPR faz o mesmo trajeto, nos mesmos dias e no mesmo horário,
semana após semana, mas hoje precisa oferecer a carona de novo a cada viagem, no
grupo de WhatsApp. Sem um jeito de publicar o compromisso uma vez só, a carona
recorrente, que é o centro do Rota Fixa, não existe: não há rota para ninguém
procurar, assinar ou liberar.

É também a primeira vez que o app **recebe** dados que valem para outras pessoas.
Um formulário que aceita qualquer coisa publicaria rota sem campus, sem dia ou com
zero vagas, e a busca (#5) e a assinatura (#6) herdariam o lixo. Por isso cada
regra de validação está escrita aqui, com a mensagem que a pessoa lê, e não fica
para o implementador decidir.

A tela segue o protótipo da Atividade 05 e o `docs/design-tokens.md`: um campo
por linha no celular, e o botão de publicar no fim do formulário. Aparência não
vira critério, porque o navegador simulado dos testes não aplica CSS: a prova são
os prints do celular no Pull Request.

## A história

**Como** motorista, **eu quero** publicar de uma vez o trajeto que faço toda
semana **para que** eu não precise combinar carona de novo a cada viagem.

## Critérios de aceite

### A tela e as regras de cada campo

Toda mensagem de erro de campo aparece **depois que a pessoa sai do campo** (o
campo "tocado"), e nunca antes: abrir a tela não mostra aviso nenhum. Enquanto
houver qualquer erro, o botão "Publicar rota" fica desligado.

- [ ] **CA1 — Dado** que abro "Publicar uma rota fixa" pelo menu, **quando** a
      tela carrega, **então** vejo os campos Campus (com os 13 câmpus da UTFPR),
      Sentido ("Vou para o campus", já marcado, ou "Volto do campus"), CEP do
      bairro (opcional), Bairro, Ponto de encontro, Dias da semana (segunda a
      sábado), Horário de saída e Vagas, nenhuma mensagem de erro, e o botão
      "Publicar rota" desligado.
- [ ] **CA2 — Dado** a tela aberta, **quando** saio do campo Campus sem escolher
      nenhum, **então** vejo "Uma das pontas precisa ser um campus da UTFPR" e o
      botão continua desligado; **quando** escolho um campus, **então** a mensagem
      some.
- [ ] **CA3 — Dado** a tela aberta, **quando** saio do campo Bairro vazio ou só
      com espaços, **então** vejo "Informe o bairro da outra ponta"; **quando**
      saio dele com menos de 3 caracteres (sem contar os espaços das pontas),
      **então** vejo "O bairro precisa ter pelo menos 3 letras". Com 3 ou mais, a
      mensagem some. O campo não deixa digitar mais de 60 caracteres.
- [ ] **CA4 — Dado** a tela aberta, **quando** saio do campo Ponto de encontro
      vazio ou só com espaços, **então** vejo "Descreva o ponto de encontro";
      **quando** saio dele com menos de 5 caracteres, **então** vejo "Descreva o
      ponto de encontro com pelo menos 5 caracteres". O campo mostra, antes de
      qualquer erro, a dica "Um lugar público, como a frente de uma padaria.
      Nunca o endereço da sua casa." e não deixa digitar mais de 120 caracteres.
- [ ] **CA5 — Dado** a tela aberta, **quando** marco um dia e desmarco, deixando
      nenhum, **então** vejo "Escolha pelo menos um dia da semana" e o botão
      continua desligado; **quando** marco o sexto dia, **então** vejo "Uma rota
      tem no máximo 5 dias"; com 1 a 5 dias marcados, a mensagem some.
- [ ] **CA6 — Dado** a tela aberta, **quando** saio do campo Horário de saída
      vazio, **então** vejo "Informe o horário de saída".
- [ ] **CA7 — Dado** a tela aberta, **quando** saio do campo Vagas vazio,
      **então** vejo "Informe quantas vagas o carro oferece"; **quando** saio dele
      com 0, 5 ou um número quebrado (2,5), **então** vejo "Uma rota tem de 1 a 4
      vagas". De 1 a 4, a mensagem some.

### O CEP, pela API pública ViaCEP

O CEP é só uma ajuda para preencher o Bairro: ele não é gravado, e o Bairro
continua editável, preenchido ou não pelo CEP.

- [ ] **CA8 — Dado** a tela aberta, **quando** termino de digitar os 8 números de
      um CEP que existe (com ou sem o traço), **então** o campo Bairro é
      preenchido com o bairro desse CEP e continua editável; **quando** saio do
      campo CEP com um formato que não é de CEP, **então** vejo "O CEP tem 8
      números" e o botão fica desligado até eu corrigir ou apagar o CEP;
      **quando** o CEP não existe, **então** vejo "Não achamos este CEP. Digite o
      bairro."; **quando** a busca falha (sem conexão ou o ViaCEP fora do ar),
      **então** vejo "Não deu para buscar o CEP agora. Digite o bairro." Nos dois
      últimos casos, o Bairro fica como estava e o botão não é bloqueado pelo
      CEP.

### O envio

- [ ] **CA9 — Dado** o formulário válido e sem conflito com outra rota minha,
      **quando** toco em "Publicar rota", **então** a rota é gravada como ativa,
      comigo como motorista, e vou para a tela da rota, que mostra "Rota
      publicada" e os dados que informei.
- [ ] **CA10 — Dado** que toquei em "Publicar rota", **quando** a gravação está
      em andamento, **então** o botão mostra "Publicando…" e fica bloqueado, e um
      segundo toque não grava uma segunda rota.
- [ ] **CA11 — Dado** o formulário válido, **quando** a gravação falha (sem
      conexão ou erro do servidor), **então** vejo "Não foi possível publicar a
      rota. Tente de novo.", todos os campos continuam preenchidos e posso tocar
      em "Publicar rota" de novo.
- [ ] **CA12 — Dado** que já tenho uma rota ativa que coincide com a nova em pelo
      menos um dia da semana, com menos de 60 minutos entre os horários de saída,
      **quando** toco em "Publicar rota", **então** vejo "Esta rota coincide com a
      sua rota de <bairro> (<dias> às <horário>)", com os dados da rota que
      conflita, os campos continuam preenchidos e nada é gravado.

### A tela da rota

- [ ] **CA13 — Dado** que abro `/rotas/<id>` de uma rota que existe, **quando** a
      tela carrega, **então** vejo o campus, o sentido ("Bairro → Campus" na ida,
      "Campus → Bairro" na volta), o ponto de encontro, os dias por extenso
      curto, em ordem ("seg, qua e sex"), o horário de saída ("07:30") e as vagas
      ("3 vagas", ou "1 vaga").
- [ ] **CA14 — Dado** que abro `/rotas/<id>` de uma rota que não existe,
      **quando** a tela carrega, **então** vejo "Não achamos esta rota" e o link
      "Minhas rotas"; **quando** a busca falha (sem conexão ou erro do servidor),
      **então** vejo "Não foi possível carregar a rota. Tente de novo." e o botão
      "Tentar de novo", que busca outra vez.
- [ ] **CA15 — Dado** a tela de uma rota ativa, **quando** desço até "Próximas
      viagens", **então** vejo as viagens desta semana (de hoje até domingo), uma
      por linha, com o dia e o horário ("qua., 25/11 às 07:30"), sem as de dias
      e horários que já passaram; **quando** escolho "4 semanas", **então** vejo
      todas as viagens das próximas 4 semanas, a contar de hoje (RN18); **quando**
      não há viagem nesta semana, **então** vejo "Nenhuma viagem nesta semana" e
      o caminho para ver as 4 semanas.

### Minhas rotas

- [ ] **CA16 — Dado** que abro "Minhas rotas" pelo menu, **quando** a tela
      carrega, **então** vejo um cartão por rota ativa minha (sentido, dias,
      horário e vagas), e tocar no cartão abre a tela dela; **quando** não tenho
      rota ativa, **então** vejo "Você ainda não publicou nenhuma rota" e o link
      "Publicar uma rota fixa"; **quando** a busca falha, **então** vejo "Não foi
      possível carregar as suas rotas. Tente de novo." e o botão "Tentar de novo".
      Enquanto carrega, vejo "Carregando as suas rotas…".

### Abandono

- [ ] **CA17 — Dado** que preenchi parte do formulário, **quando** saio da tela
      (pelo menu ou fechando a aba) e volto a "Publicar uma rota fixa", **então**
      o formulário vem em branco, sem mensagens, e nada foi gravado.

## Fora de escopo

- Exigir veículo cadastrado (RN02) e o convite para cadastrar o veículo antes de
  publicar (3º critério da US03): o cadastro de veículo é a US03 (#3).
- Ver a rota publicada na busca (a segunda parte do 1º critério da US04 no PRD):
  a busca é a US05 (#5). Aqui as viagens das próximas 4 semanas aparecem na tela
  da rota (CA15). O PRD é atualizado nesse sentido quando esta história fechar.
- Editar, encerrar ou cancelar a rota, e ver quem assina: é a US11 (#8) e a US12
  (#9).
- O rateio sugerido (RN16): a rota é gravada sem rateio, e a tela não mostra o
  campo. Ele entra com a edição da rota (US11, #8).
- A visão do passageiro na tela da rota, com o ponto de encontro escondido de
  quem não tem vaga (RN17): é a US06, ainda em `Draft`, e só faz sentido quando a
  busca (#5) levar outras pessoas até a tela. Aqui quem abre a tela é o próprio
  motorista.
- Guardar rascunho do formulário: ver "Abandono no meio".
- Gravar o CEP ou o endereço que o ViaCEP devolve: só o bairro é gravado, e só
  se a pessoa mantiver o que veio (PRD §7, privacidade).

## Abandono no meio

O PRD não registra pontos de desistência para a US04: a Atividade 05 só os
levantou para a US07 e a US09. Eles saíram de escrever esta spec.

- **Sai da tela no meio do preenchimento.** O formulário tem oito campos curtos,
  e um rascunho guardado exigiria decidir quando apagá-lo e o que fazer quando
  ele ficasse velho. A equipe decidiu que o que foi digitado se perde, sem
  aviso: refazer custa menos de um minuto. Vira o CA17, que também prova que
  nada é gravado pela metade.
- **A conexão cai ou o servidor falha no envio.** Sem tratamento, a pessoa toca,
  nada acontece e o que ela digitou some. Vira o CA11: mensagem clara, campos
  preservados e nova tentativa.
- **Toca duas vezes porque a resposta demora.** Sem proteção, vira duas rotas
  iguais, que depois conflitariam entre si. Vira o CA10.
- **O ViaCEP não responde ou o CEP não existe.** O CEP é ajuda, não obrigação:
  a pessoa digita o bairro e segue. Vira a segunda metade do CA8.
- **Publica uma rota que bate com outra que já tem.** O motorista não dirige dois
  carros ao mesmo tempo. Vira o CA12, com os dados da rota que conflita para ele
  decidir qual manter.
- **Abre o link de uma rota que não existe mais, ou sem internet.** Vira o CA14,
  sem tela em branco (PRD §7).

## Assume que

| Premissa                                                                                                                                                                                                                                                                               | Issue que fecha |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Não existe entrar e sair: quem publica, e de quem são as "Minhas rotas", é uma pessoa de exemplo fixa, gravada na coleção `users` do `db.json` e lida pelo `AuthService`.                                                                                                              | #2              |
| Essa pessoa de exemplo já tem veículo: nada confere a RN02 antes de publicar.                                                                                                                                                                                                          | #3              |
| As rotas vivem na coleção `fixed_routes` do `db.json` (json-server), e a conferência de conflito (CA12) é feita pelo Service antes de gravar, e não pelo banco.                                                                                                                        | #20             |
| As viagens das próximas 4 semanas (RN18) são calculadas na tela da rota a partir dos dias e do horário, e não gravadas na coleção `trips`: até existir assinatura, nenhuma viagem tem nada a guardar. Elas passam a ser gravadas com a assinatura.                                     | #6              |
| A tela da rota mostra tudo, inclusive o ponto de encontro, porque hoje só o motorista chega nela (pelo envio e por "Minhas rotas"). Quando a busca levar visitantes e passageiros até ela, o ponto de encontro passa a ser escondido de quem não tem vaga (RN17, 3º critério da US05). | #5              |

## Depende de

- #1 (US01), já na `develop`: a casca do app, o menu e o padrão de formulário
  (`form-field`, mensagens ao sair do campo).

## Dúvidas em aberto

| #   | Dúvida | Quem responde |
| --- | ------ | ------------- |
