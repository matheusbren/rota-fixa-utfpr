---
issue: 1
status: rascunho   # rascunho | aprovada
---

# US01 — Criar conta com e-mail institucional

## O problema

Hoje a carona na UTFPR se combina em grupos de WhatsApp abertos: qualquer pessoa
entra, e quem oferece ou pega a carona não tem como saber se está dividindo o
carro com alguém da universidade. Sem uma porta de entrada que confirme o vínculo
com a UTFPR, o Rota Fixa herdaria o mesmo problema.

Esta é também a primeira tela de verdade do app, e ela não pode aparecer solta:
precisa de cabeçalho, navegação e rodapé em volta, a casca que as próximas telas
vão compartilhar. A aparência da casca segue o protótipo da Atividade 05 e os
breakpoints do `docs/design-tokens.md` (a partir de `lg`, os links ficam fixos
na lateral esquerda; abaixo disso, vão para a gaveta do ☰; o rodapé fica colado
no fim da tela quando há pouco conteúdo). Aparência não vira critério abaixo,
porque o navegador simulado dos testes não aplica CSS: a prova são os prints do
celular e do desktop no Pull Request.

## A história

**Como** estudante ou servidor da UTFPR, **eu quero** criar uma conta com o meu
e-mail institucional **para que** eu só divida carro com gente de dentro da
universidade.

## Critérios de aceite

- [ ] **CA1 — Dado** que abro o app na raiz, em `/criar-conta` ou em um endereço
      que não existe, **quando** a página carrega, **então** vejo a tela de
      cadastro no palco central, entre o cabeçalho (em cima) e o rodapé (embaixo).
- [ ] **CA2 — Dado** o app no celular, **quando** toco no ☰ do cabeçalho,
      **então** a gaveta abre com o link "Criar conta"; **quando** toco no link,
      **então** a gaveta fecha e a tela de cadastro aparece; **quando** toco fora
      da gaveta, **então** ela fecha e a tela continua como estava.
- [ ] **CA3 — Dado** que informo nome completo, um e-mail institucional válido e
      uma senha que atende aos requisitos, **quando** confirmo o cadastro,
      **então** vejo a mensagem de que falta verificar o e-mail e a conta é
      gravada como pendente.
- [ ] **CA4 — Dado** que informo um e-mail que não termina em
      `@alunos.utfpr.edu.br` nem em `@utfpr.edu.br` (inclusive os parecidos,
      como `ana@utfpr.edu.br.exemplo.com`), **quando** saio do campo, **então**
      vejo "Use o seu e-mail da UTFPR", o botão "Criar conta" fica desabilitado
      e nada é gravado. Maiúsculas e espaços nas pontas não contam:
      `Ana@UTFPR.edu.br ` é aceito.
- [ ] **CA5 — Dado** que informo uma senha com menos de 8 caracteres, ou sem pelo
      menos uma letra e um número, **quando** saio do campo, **então** vejo qual
      requisito falta ("A senha precisa ter 8 caracteres ou mais" ou "A senha
      precisa ter letra e número"), o botão "Criar conta" fica desabilitado e
      nada é gravado.
- [ ] **CA6 — Dado** que já existe conta ativa com aquele e-mail (sem diferenciar
      maiúsculas de minúsculas), **quando** confirmo o cadastro, **então** vejo
      "Este e-mail já tem conta" com o link "Entrar", e nenhuma conta duplicada é
      criada.
- [ ] **CA7 — Dado** que já existe conta com aquele e-mail e ela está pendente de
      verificação, **quando** confirmo o cadastro, **então** vejo o aviso de
      verificação pendente com o botão "Reenviar e-mail de verificação" e
      nenhuma conta duplicada é criada; **quando** toco em "Reenviar e-mail de
      verificação", **então** vejo "E-mail reenviado".
- [ ] **CA8 — Dado** que confirmo um cadastro válido, **quando** a gravação está
      em andamento, **então** o botão mostra "Criando conta…" e fica bloqueado,
      e um segundo toque não cria uma segunda conta.
- [ ] **CA9 — Dado** que confirmo um cadastro válido, **quando** a gravação falha
      (sem conexão ou erro do servidor), **então** vejo "Não foi possível criar a
      conta. Tente de novo.", os campos continuam preenchidos e posso confirmar
      de novo.

## Fora de escopo

- A tela de entrar e o aviso de conta pendente **ao tentar entrar** (o 4º
  critério da US01 no PRD): só dá para demonstrá-lo com a tela de entrada, que
  nasce na US02 (#2). Aqui o mesmo caso é coberto no cadastro (CA7). O PRD é
  atualizado nesse sentido quando esta história for fechada.
- Ativar a conta pelo link do e-mail, enviar e-mail de verdade e limitar quantos
  reenvios a pessoa pode pedir: só chegam com o Supabase Auth, na Entrega 3.
- Abrir sessão: cadastrar não deixa a pessoa logada. Entrar e sair são a US02
  (#2).
- Os links do menu para telas de outras histórias: Entrar (#2), Procurar rotas
  (#5), Publicar uma rota fixa (#4), Perfil e veículo (#3). Cada história traz o
  seu link quando a tela dela existir; hoje o menu só tem "Criar conta".
- Telefone e foto no cadastro: o produto não guarda foto (PRD §3), e o telefone
  entra no perfil, depois da conta criada.

## Abandono no meio

O PRD não registra pontos de desistência para esta história: a Atividade 05 só os
levantou para a US07 e a US09 (PRD 1.1.0). Eles saíram de escrever esta spec.

- **Fecha a aba depois de confirmar, sem verificar o e-mail.** A conta já está
  gravada como pendente, mas a mensagem some e, ao voltar, o formulário vem em
  branco. A saída é cadastrar o mesmo e-mail de novo, e é aí que a pessoa precisa
  achar o caminho de volta: não pode ganhar uma segunda conta nem um "já cadastrado"
  que a empurre para uma tela de entrada onde ela não consegue entrar. Vira o CA7
  (conta pendente: aviso e reenvio), ao lado do CA6 (conta ativa: caminho para
  entrar).
- **A conexão cai ou o servidor falha no meio do envio.** A pessoa não sabe se a
  conta foi criada. Vira o CA9: mensagem clara, campos preservados e nova
  tentativa possível. Para a nova tentativa não gerar duplicata quando a primeira
  chegou a gravar, o CA7 e o CA6 tratam o e-mail repetido.
- **Toca duas vezes porque a resposta demora.** Sem proteção, vira duas contas.
  Vira o CA8: o botão trava enquanto grava.
- **Abre a gaveta e desiste.** Toca fora dela sem escolher nada. Vira a terceira
  parte do CA2: a gaveta fecha e a tela não muda.
- **Digita um e-mail pessoal ou uma senha curta e segue em frente.** Vira o CA4 e
  o CA5: o erro aparece ao sair do campo, antes de qualquer gravação.

## Assume que

| Premissa | Issue que fecha |
| --- | --- |
| As contas vivem na coleção `users` do `db.json` (json-server), com a senha em texto: é simulação de desenvolvimento, não Supabase Auth. | #20 |
| Nenhum e-mail é enviado e não existe link de ativação: a conta pendente (`emailVerified: false`) só vira ativa quando alguém edita o `db.json`, e o "Reenviar" apenas mostra a confirmação. | #20 |
| O link "Entrar" do CA6 aponta para `/entrar`, tela que só existe com a US02: até lá o endereço cai na rota coringa e volta ao cadastro. | #2 |
| A raiz `/` e qualquer endereço desconhecido levam ao cadastro, porque ainda não existe outra tela: a raiz passa a levar à agenda depois da entrada (#2) e o endereço desconhecido, à busca de rotas (#5), como no mapa de rotas do `architecture.md`. | #2, #5 |

## Dúvidas em aberto

| # | Dúvida | Quem responde |
| --- | --- | --- |
