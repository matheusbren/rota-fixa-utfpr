import { HttpRequest } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../../../../environments/environment';
import { appConfig } from '../../../app.config';

// Os 13 câmpus da UTFPR, como o servidor os devolve.
const CAMPUS_NAMES = [
  'Apucarana',
  'Campo Mourão',
  'Cornélio Procópio',
  'Curitiba',
  'Dois Vizinhos',
  'Francisco Beltrão',
  'Guarapuava',
  'Londrina',
  'Medianeira',
  'Pato Branco',
  'Ponta Grossa',
  'Santa Helena',
  'Toledo',
];
const CAMPUSES = CAMPUS_NAMES.map((name, index) => ({ id: `${index + 1}`, name, city: name }));

// O id do câmpus de Guarapuava, como o servidor o devolve.
const GUARAPUAVA_ID = CAMPUSES.find(({ name }) => name === 'Guarapuava')?.id;

// A coleção das rotas no json-server.
const FIXED_ROUTES_URL = `${environment.apiUrl}/fixed_routes`;

// O que a tela mostra nos oito campos; nos grupos (Sentido e Dias da semana), as opções marcadas.
interface FormState {
  campus: string;
  direction: string[];
  postalCode: string;
  neighborhood: string;
  meetingPoint: string;
  weekdays: string[];
  departureTime: string;
  seats: string;
}

// O formulário como ele abre: nada escolhido, a não ser o sentido "Vou para o campus" (CA1).
const BLANK_FORM: FormState = {
  campus: '',
  direction: ['Vou para o campus'],
  postalCode: '',
  neighborhood: '',
  meetingPoint: '',
  weekdays: [],
  departureTime: '',
  seats: '',
};

// A dica do Ponto de encontro, que a tela mostra desde que abre (CA4).
const MEETING_POINT_HINT =
  'Um lugar público, como a frente de uma padaria. Nunca o endereço da sua casa.';

// Os dias que a tela oferece, de segunda a sábado (CA1).
const WEEKDAY_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// A mesma frase para Vagas abaixo de 1, acima de 4 ou com número quebrado (CA7).
const SEATS_RANGE_MESSAGE = 'Uma rota tem de 1 a 4 vagas';

// Os campos de texto de uma rota válida, cada um com um valor que todas as regras aceitam.
const VALID_TEXT_FIELDS: [label: string, value: string][] = [
  ['Bairro', 'Centro'],
  ['Ponto de encontro', 'Frente da Padaria Central'],
  ['Horário de saída', '07:30'],
  ['Vagas', '3'],
];

// O rótulo do campo CEP, que a pessoa enxerga na tela (CA1).
const POSTAL_CODE = 'CEP do bairro (opcional)';

// Os dois avisos da busca do CEP. Não são erro de validação: não marcam o campo (CA8).
const POSTAL_CODE_NOT_FOUND = 'Não achamos este CEP. Digite o bairro.';
const POSTAL_CODE_LOOKUP_FAILED = 'Não deu para buscar o CEP agora. Digite o bairro.';

// O endereço do ViaCEP para um CEP, só com os 8 números, como a API pede.
function viaCepUrl(digits: string): string {
  return `https://viacep.com.br/ws/${digits}/json/`;
}

// A resposta do ViaCEP para um CEP que existe. Da resposta, a tela só usa o bairro.
function viaCepAddress(bairro: string): Record<string, string> {
  return { logradouro: 'Rua XV de Novembro', bairro, localidade: 'Guarapuava', uf: 'PR' };
}

// Gravar é qualquer requisição que não seja leitura.
function isWrite(request: HttpRequest<unknown>): boolean {
  return request.method !== 'GET';
}

describe('RouteForm', () => {
  let harness: RouterTestingHarness;
  let httpTesting: HttpTestingController;
  let page: HTMLElement;

  // O app inteiro, com a casca e o menu: a tela é aberta pelo menu, como a pessoa faz (CA1). A
  // configuração é a do app (app.config.ts), que entrega o id da URL à tela da rota aberta depois
  // do envio (CA9). O teste faz o papel do servidor.
  async function openApp(): Promise<void> {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create('/criar-conta');
    page = harness.fixture.nativeElement as HTMLElement;
  }

  beforeEach(openApp);

  // Nenhuma requisição pode sobrar sem ter sido conferida pelo teste.
  afterEach(() => httpTesting.verify());

  async function tap(element: HTMLElement | null | undefined): Promise<void> {
    expect(element).toBeTruthy();
    element?.click();
    await harness.fixture.whenStable();
  }

  function menuLink(label: string): HTMLAnchorElement | undefined {
    return Array.from(page.querySelectorAll<HTMLAnchorElement>('app-side-nav a')).find(
      (link) => link.textContent?.trim() === label,
    );
  }

  // Abre "Publicar uma rota fixa" pelo menu. A tela pede os câmpus ao abrir, e o teste faz o
  // papel do servidor.
  async function openFromMenu(): Promise<void> {
    await tap(menuLink('Publicar uma rota fixa'));
    httpTesting.expectOne({ method: 'GET', url: `${environment.apiUrl}/campuses` }).flush(CAMPUSES);
    await harness.fixture.whenStable();
  }

  // O campo é achado pelo rótulo, como a pessoa o enxerga na tela.
  function field<T extends HTMLElement>(label: string, type: new () => T): T {
    const control = Array.from(page.querySelectorAll<HTMLLabelElement>('main label')).find(
      (element) => element.textContent?.trim() === label,
    )?.control;
    expect(control, `campo "${label}"`).toBeInstanceOf(type);
    return control as T;
  }

  // Sentido e Dias da semana são grupos de opções: o grupo é achado pela legenda, e cada opção
  // pelo próprio rótulo.
  function group(legend: string): HTMLFieldSetElement {
    const element = Array.from(page.querySelectorAll<HTMLFieldSetElement>('main fieldset')).find(
      (fieldset) => fieldset.querySelector('legend')?.textContent?.trim() === legend,
    );
    expect(element, `grupo "${legend}"`).toBeDefined();
    return element as HTMLFieldSetElement;
  }

  function choices(legend: string): HTMLLabelElement[] {
    return Array.from(group(legend).querySelectorAll('label'));
  }

  function choiceLabels(legend: string): string[] {
    return choices(legend).map((label) => label.textContent?.trim() ?? '');
  }

  function checkedChoices(legend: string): string[] {
    return choices(legend)
      .filter((label) => (label.control as HTMLInputElement | null)?.checked)
      .map((label) => label.textContent?.trim() ?? '');
  }

  function choice(legend: string, label: string): HTMLInputElement | null | undefined {
    return choices(legend).find((element) => element.textContent?.trim() === label)?.control as
      HTMLInputElement | null | undefined;
  }

  function formState(): FormState {
    return {
      campus: field('Campus', HTMLSelectElement).value,
      direction: checkedChoices('Sentido'),
      postalCode: field('CEP do bairro (opcional)', HTMLInputElement).value,
      neighborhood: field('Bairro', HTMLInputElement).value,
      meetingPoint: field('Ponto de encontro', HTMLInputElement).value,
      weekdays: checkedChoices('Dias da semana'),
      departureTime: field('Horário de saída', HTMLInputElement).value,
      seats: field('Vagas', HTMLInputElement).value,
    };
  }

  // As opções de câmpus, sem a que só pede para escolher.
  function campusOptions(): string[] {
    return Array.from(field('Campus', HTMLSelectElement).options)
      .filter((option) => option.value !== '')
      .map((option) => option.text.trim());
  }

  function submitButton(): HTMLButtonElement | undefined {
    return Array.from(page.querySelectorAll<HTMLButtonElement>('main button')).find(
      (element) => element.textContent?.trim() === 'Publicar rota',
    );
  }

  // Nenhum campo marcado como inválido e nenhum aviso do formulário.
  function expectNoMessages(): void {
    expect(page.querySelectorAll('main [aria-invalid="true"]')).toHaveLength(0);
    expect(page.querySelector('main [role="alert"]')).toBeNull();
  }

  async function chooseCampus(name: string): Promise<void> {
    const select = field('Campus', HTMLSelectElement);
    const option = Array.from(select.options).find((element) => element.text.trim() === name);
    expect(option, `câmpus "${name}"`).toBeDefined();
    select.value = option?.value ?? '';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
  }

  async function fillIn(label: string, value: string): Promise<void> {
    const input = field(label, HTMLInputElement);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();
  }

  // Sair do campo vale para qualquer um, inclusive a lista do Campus.
  async function leave(label: string): Promise<void> {
    field(label, HTMLElement).dispatchEvent(new Event('blur'));
    await harness.fixture.whenStable();
  }

  // Os textos que o campo (ou o grupo) anuncia como descrição (aria-describedby), na ordem: a dica,
  // se houver, e o aviso de erro.
  function descriptionsOf(element: HTMLElement): string[] {
    const ids = element.getAttribute('aria-describedby')?.split(' ') ?? [];
    return ids.map((id) => page.querySelector(`[id="${id}"]`)?.textContent?.trim() ?? '');
  }

  function descriptions(label: string): string[] {
    return descriptionsOf(field(label, HTMLElement));
  }

  function groupDescriptions(legend: string): string[] {
    return descriptionsOf(group(legend));
  }

  function isMarkedInvalid(label: string): boolean {
    return field(label, HTMLElement).getAttribute('aria-invalid') === 'true';
  }

  function isGroupMarkedInvalid(legend: string): boolean {
    return group(legend).getAttribute('aria-invalid') === 'true';
  }

  // Deixa a rota válida, menos o campo que o teste confere: assim o botão desligado prova a regra
  // dele. Ninguém sai de campo nenhum, então nenhum fica tocado e nenhum aviso aparece.
  async function fillInValidRouteExcept(skipped?: string): Promise<void> {
    if (skipped !== 'Campus') {
      await chooseCampus('Guarapuava');
    }
    for (const [label, value] of VALID_TEXT_FIELDS) {
      if (label !== skipped) {
        await fillIn(label, value);
      }
    }
    // Uma rota válida tem pelo menos um dia (CA5).
    if (skipped !== 'Dias da semana') {
      await tap(choice('Dias da semana', 'Segunda'));
    }
  }

  // A rota válida inteira, pronta para publicar.
  function fillInValidRoute(): Promise<void> {
    return fillInValidRouteExcept();
  }

  // Depois do envio, a tela da rota busca a rota pelo id e o nome do campus dela, e o teste faz o
  // papel do servidor nas duas buscas.
  async function answerRouteScreen(route: { id: string }): Promise<void> {
    httpTesting.expectOne({ method: 'GET', url: `${FIXED_ROUTES_URL}/${route.id}` }).flush(route);
    await harness.fixture.whenStable();
    httpTesting.expectOne({ method: 'GET', url: `${environment.apiUrl}/campuses` }).flush(CAMPUSES);
    await harness.fixture.whenStable();
  }

  // Os dados da rota na tela dela, pelo rótulo de cada um, como a pessoa os lê.
  function routeDetails(): Record<string, string> {
    return Object.fromEntries(
      Array.from(page.querySelectorAll('main dl dt')).map((term) => [
        term.textContent?.trim() ?? '',
        term.nextElementSibling?.textContent?.trim() ?? '',
      ]),
    );
  }

  // Fechar a aba apaga o app da memória; só o que estivesse guardado no navegador
  // (localStorage, sessionStorage) passaria para a próxima vez. Por isso a aba fechada é o
  // TestBed desmontado, e a aba nova, outro TestBed, no mesmo navegador de teste.
  async function closeTabAndReopen(): Promise<void> {
    harness.fixture.destroy();
    httpTesting.verify();
    TestBed.resetTestingModule();
    await openApp();
  }

  // CA1
  it('abre pelo menu com os oito campos, os 13 câmpus, nenhuma mensagem e o botão desligado', async () => {
    await openFromMenu();

    expect(TestBed.inject(Router).url).toBe('/minhas-rotas/nova');
    expect(page.querySelector('main h1')?.textContent?.trim()).toBe('Publicar uma rota fixa');
    expect(formState()).toEqual(BLANK_FORM);
    expect(campusOptions()).toEqual(CAMPUS_NAMES);
    expect(choiceLabels('Sentido')).toEqual(['Vou para o campus', 'Volto do campus']);
    expect(choiceLabels('Dias da semana')).toEqual(WEEKDAY_LABELS);
    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" desligado').toBe(true);
  });

  // CA17
  it.each([
    ['pelo menu', () => tap(menuLink('Criar conta'))],
    ['fechando a aba', closeTabAndReopen],
  ])(
    'volta em branco, sem mensagens e sem gravar nada, depois de sair %s no meio do preenchimento',
    async (_, leaveScreen) => {
      await openFromMenu();
      await chooseCampus('Guarapuava');
      await tap(choice('Sentido', 'Volto do campus'));
      await fillIn('Bairro', 'Centro');
      await tap(choice('Dias da semana', 'Quarta'));
      await leave('Ponto de encontro');
      expect(formState()).not.toEqual(BLANK_FORM);

      await leaveScreen();
      expect(page.querySelector('main h1')?.textContent?.trim()).not.toBe('Publicar uma rota fixa');
      await openFromMenu();

      expect(formState()).toEqual(BLANK_FORM);
      expectNoMessages();
      httpTesting.expectNone(isWrite);
    },
  );

  // CA2
  it('avisa ao sair do Campus sem escolher nenhum, mantém o botão desligado e tira o aviso quando um campus é escolhido', async () => {
    await openFromMenu();
    await fillInValidRouteExcept('Campus');
    expectNoMessages();

    await leave('Campus');

    expect(descriptions('Campus')).toEqual(['Uma das pontas precisa ser um campus da UTFPR']);
    expect(isMarkedInvalid('Campus')).toBe(true);
    expect(submitButton()?.disabled, 'botão "Publicar rota" desligado').toBe(true);

    await chooseCampus('Guarapuava');

    expect(descriptions('Campus')).toEqual([]);
    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);
  });

  // CA3: vazio, só com espaços, com 2 caracteres e com 2 cercados de espaços.
  it.each([
    ['', 'Informe o bairro da outra ponta'],
    ['   ', 'Informe o bairro da outra ponta'],
    ['Ce', 'O bairro precisa ter pelo menos 3 letras'],
    ['  Ce  ', 'O bairro precisa ter pelo menos 3 letras'],
  ])(
    'recusa o Bairro %j ao sair do campo, avisa "%s" e mantém o botão desligado',
    async (value, message) => {
      await openFromMenu();
      await fillInValidRouteExcept('Bairro');
      await fillIn('Bairro', value);
      expectNoMessages();

      await leave('Bairro');

      expect(descriptions('Bairro')).toEqual([message]);
      expect(isMarkedInvalid('Bairro')).toBe(true);
      expect(submitButton()?.disabled, 'botão "Publicar rota" desligado').toBe(true);
    },
  );

  // CA3
  it('tira o aviso do Bairro quando ele chega a 3 caracteres e liga o botão', async () => {
    await openFromMenu();
    await fillInValidRouteExcept('Bairro');
    await fillIn('Bairro', 'Ce');
    await leave('Bairro');
    expect(descriptions('Bairro')).toEqual(['O bairro precisa ter pelo menos 3 letras']);

    await fillIn('Bairro', 'Cen');
    await leave('Bairro');

    expect(descriptions('Bairro')).toEqual([]);
    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);
  });

  // CA4: a dica não é erro, então não marca o campo nem vira alerta.
  it('mostra a dica do Ponto de encontro desde que a tela abre, sem marcar o campo como errado', async () => {
    await openFromMenu();

    expect(descriptions('Ponto de encontro')).toEqual([MEETING_POINT_HINT]);
    expectNoMessages();
  });

  // CA4: vazio, só com espaços e com 4 caracteres.
  it.each([
    ['', 'Descreva o ponto de encontro'],
    ['   ', 'Descreva o ponto de encontro'],
    ['Praç', 'Descreva o ponto de encontro com pelo menos 5 caracteres'],
  ])(
    'recusa o Ponto de encontro %j ao sair do campo, avisa "%s", mantém a dica e o botão desligado',
    async (value, message) => {
      await openFromMenu();
      await fillInValidRouteExcept('Ponto de encontro');
      await fillIn('Ponto de encontro', value);
      expectNoMessages();

      await leave('Ponto de encontro');

      expect(descriptions('Ponto de encontro')).toEqual([MEETING_POINT_HINT, message]);
      expect(isMarkedInvalid('Ponto de encontro')).toBe(true);
      expect(submitButton()?.disabled, 'botão "Publicar rota" desligado').toBe(true);
    },
  );

  // CA4
  it('tira o aviso do Ponto de encontro quando ele chega a 5 caracteres e liga o botão', async () => {
    await openFromMenu();
    await fillInValidRouteExcept('Ponto de encontro');
    await fillIn('Ponto de encontro', 'Praç');
    await leave('Ponto de encontro');
    expect(descriptions('Ponto de encontro')).toEqual([
      MEETING_POINT_HINT,
      'Descreva o ponto de encontro com pelo menos 5 caracteres',
    ]);

    await fillIn('Ponto de encontro', 'Praça');
    await leave('Ponto de encontro');

    expect(descriptions('Ponto de encontro')).toEqual([MEETING_POINT_HINT]);
    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);
  });

  // CA5: o aviso dos dias aparece no primeiro toque numa caixa, não ao sair do grupo.
  it('aceita um dia, avisa quando o único dia é desmarcado, mantém o botão desligado e tira o aviso quando um dia é marcado', async () => {
    await openFromMenu();
    await fillInValidRouteExcept('Dias da semana');
    expectNoMessages();

    await tap(choice('Dias da semana', 'Segunda'));

    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);

    await tap(choice('Dias da semana', 'Segunda'));

    expect(groupDescriptions('Dias da semana')).toEqual(['Escolha pelo menos um dia da semana']);
    expect(isGroupMarkedInvalid('Dias da semana')).toBe(true);
    expect(submitButton()?.disabled, 'botão "Publicar rota" desligado').toBe(true);

    await tap(choice('Dias da semana', 'Quarta'));

    expect(groupDescriptions('Dias da semana')).toEqual([]);
    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);
  });

  // CA5
  it('aceita cinco dias, avisa ao marcar o sexto, mantém o botão desligado e tira o aviso quando volta a cinco', async () => {
    await openFromMenu();
    await fillInValidRouteExcept('Dias da semana');
    for (const label of WEEKDAY_LABELS.slice(0, 5)) {
      await tap(choice('Dias da semana', label));
    }

    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);

    await tap(choice('Dias da semana', 'Sábado'));

    expect(groupDescriptions('Dias da semana')).toEqual(['Uma rota tem no máximo 5 dias']);
    expect(isGroupMarkedInvalid('Dias da semana')).toBe(true);
    expect(submitButton()?.disabled, 'botão "Publicar rota" desligado').toBe(true);

    await tap(choice('Dias da semana', 'Segunda'));

    expect(groupDescriptions('Dias da semana')).toEqual([]);
    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);
  });

  // CA6
  it('avisa ao sair do Horário de saída vazio, mantém o botão desligado e tira o aviso quando o horário é informado', async () => {
    await openFromMenu();
    await fillInValidRouteExcept('Horário de saída');
    expectNoMessages();

    await leave('Horário de saída');

    expect(descriptions('Horário de saída')).toEqual(['Informe o horário de saída']);
    expect(isMarkedInvalid('Horário de saída')).toBe(true);
    expect(submitButton()?.disabled, 'botão "Publicar rota" desligado').toBe(true);

    await fillIn('Horário de saída', '07:30');
    await leave('Horário de saída');

    expect(descriptions('Horário de saída')).toEqual([]);
    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);
  });

  // CA7: vazio, abaixo de 1, acima de 4 e número quebrado. O campo numérico do navegador entrega o
  // 2,5 digitado como "2.5", com ponto, seja qual for a língua do aparelho.
  it.each([
    ['', 'Informe quantas vagas o carro oferece'],
    ['0', SEATS_RANGE_MESSAGE],
    ['5', SEATS_RANGE_MESSAGE],
    ['2.5', SEATS_RANGE_MESSAGE],
  ])(
    'recusa Vagas %j ao sair do campo, avisa "%s" e mantém o botão desligado',
    async (value, message) => {
      await openFromMenu();
      await fillInValidRouteExcept('Vagas');
      await fillIn('Vagas', value);
      expectNoMessages();

      await leave('Vagas');

      expect(descriptions('Vagas')).toEqual([message]);
      expect(isMarkedInvalid('Vagas')).toBe(true);
      expect(submitButton()?.disabled, 'botão "Publicar rota" desligado').toBe(true);
    },
  );

  // CA7: 1 e 4 são as pontas da faixa.
  it.each(['1', '4'])('tira o aviso de Vagas com %j e liga o botão', async (value) => {
    await openFromMenu();
    await fillInValidRouteExcept('Vagas');
    await fillIn('Vagas', '5');
    await leave('Vagas');
    expect(descriptions('Vagas')).toEqual([SEATS_RANGE_MESSAGE]);

    await fillIn('Vagas', value);
    await leave('Vagas');

    expect(descriptions('Vagas')).toEqual([]);
    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);
  });

  // CA3 e CA4: o navegador não deixa digitar além do limite do campo.
  it.each([
    ['Bairro', 60],
    ['Ponto de encontro', 120],
  ])('não deixa digitar no %s mais de %i caracteres', async (label, maxLength) => {
    await openFromMenu();

    expect(field(label, HTMLInputElement).maxLength).toBe(maxLength);
  });

  // O teste faz o papel do ViaCEP: responde à busca do CEP com os 8 números.
  async function answerPostalCode(
    digits: string,
    respond: (request: TestRequest) => void,
  ): Promise<void> {
    respond(httpTesting.expectOne({ method: 'GET', url: viaCepUrl(digits) }));
    await harness.fixture.whenStable();
  }

  function neighborhoodValue(): string {
    return field('Bairro', HTMLInputElement).value;
  }

  // CA8: a busca sai quando o CEP fica completo, sem esperar a pessoa sair do campo.
  it.each(['85010-000', '85010000'])(
    'preenche o Bairro com o bairro do CEP %j assim que os 8 números são digitados',
    async (value) => {
      await openFromMenu();
      await fillInValidRouteExcept('Bairro');

      await fillIn(POSTAL_CODE, value);
      await answerPostalCode('85010000', (request) => request.flush(viaCepAddress('Santa Cruz')));

      expect(neighborhoodValue()).toBe('Santa Cruz');
      expect(descriptions(POSTAL_CODE)).toEqual([]);
      expectNoMessages();
      expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);
    },
  );

  // CA8: o CEP só ajuda; quem decide o bairro é a pessoa.
  it('deixa editar o Bairro preenchido pelo CEP', async () => {
    await openFromMenu();
    await fillIn(POSTAL_CODE, '85010-000');
    await answerPostalCode('85010000', (request) => request.flush(viaCepAddress('Santa Cruz')));

    const neighborhood = field('Bairro', HTMLInputElement);
    expect(neighborhood.readOnly).toBe(false);
    expect(neighborhood.disabled).toBe(false);

    await fillIn('Bairro', 'Vila Carli');
    await leave('Bairro');

    expect(neighborhoodValue()).toBe('Vila Carli');
    expectNoMessages();
  });

  // CA3 e CA8: o Bairro não guarda mais de 60 caracteres, nem quando eles vêm do ViaCEP.
  it('corta em 60 caracteres o bairro do CEP que passa do limite do campo', async () => {
    const longNeighborhood = 'Conjunto Habitacional Jardim das Américas '.repeat(2);
    await openFromMenu();
    await fillInValidRouteExcept('Bairro');

    await fillIn(POSTAL_CODE, '85010-000');
    await answerPostalCode('85010000', (request) => request.flush(viaCepAddress(longNeighborhood)));

    expect(neighborhoodValue()).toBe(longNeighborhood.slice(0, 60));
    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);
  });

  // CA3 e CA8: o aviso do Bairro segue a regra de todos os campos, e só aparece depois que a
  // pessoa sai do Bairro, mesmo quando foi o CEP que o preencheu.
  it('só avisa do bairro curto vindo do CEP depois que a pessoa sai do Bairro', async () => {
    await openFromMenu();
    await fillInValidRouteExcept('Bairro');

    await fillIn(POSTAL_CODE, '01001-000');
    await answerPostalCode('01001000', (request) => request.flush(viaCepAddress('Sé')));

    expect(neighborhoodValue()).toBe('Sé');
    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" desligado').toBe(true);

    await leave('Bairro');

    expect(descriptions('Bairro')).toEqual(['O bairro precisa ter pelo menos 3 letras']);
  });

  // CA8: números de menos, de mais e letra não são CEP, e nada é buscado.
  it.each(['8501000', '850100001', '85010-0a0'])(
    'recusa o CEP %j ao sair do campo, avisa "O CEP tem 8 números", não busca e mantém o botão desligado',
    async (value) => {
      await openFromMenu();
      await fillInValidRouteExcept(POSTAL_CODE);
      await fillIn(POSTAL_CODE, value);
      expectNoMessages();

      await leave(POSTAL_CODE);

      expect(descriptions(POSTAL_CODE)).toEqual(['O CEP tem 8 números']);
      expect(isMarkedInvalid(POSTAL_CODE)).toBe(true);
      expect(submitButton()?.disabled, 'botão "Publicar rota" desligado').toBe(true);
      httpTesting.expectNone((request) => request.url.startsWith('https://viacep.com.br/'));
    },
  );

  // CA8: o CEP é opcional, então apagá-lo também tira o aviso.
  it('tira o aviso de formato e liga o botão quando o CEP é apagado', async () => {
    await openFromMenu();
    await fillInValidRouteExcept(POSTAL_CODE);
    await fillIn(POSTAL_CODE, '8501');
    await leave(POSTAL_CODE);
    expect(descriptions(POSTAL_CODE)).toEqual(['O CEP tem 8 números']);

    await fillIn(POSTAL_CODE, '');
    await leave(POSTAL_CODE);

    expect(descriptions(POSTAL_CODE)).toEqual([]);
    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);
  });

  // CA8
  it('tira o aviso de formato, busca o CEP e liga o botão quando o CEP é corrigido', async () => {
    await openFromMenu();
    await fillInValidRouteExcept(POSTAL_CODE);
    await fillIn(POSTAL_CODE, '8501');
    await leave(POSTAL_CODE);
    expect(descriptions(POSTAL_CODE)).toEqual(['O CEP tem 8 números']);

    await fillIn(POSTAL_CODE, '85010-000');
    await answerPostalCode('85010000', (request) => request.flush(viaCepAddress('Centro')));
    await leave(POSTAL_CODE);

    expect(descriptions(POSTAL_CODE)).toEqual([]);
    expectNoMessages();
    expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);
  });

  // CA8: os avisos da busca não são erro do campo. O Bairro fica como estava e o botão continua
  // ligado, porque o CEP é só uma ajuda.
  it.each([
    [
      'o CEP não existe',
      POSTAL_CODE_NOT_FOUND,
      (request: TestRequest) => request.flush({ erro: 'true' }),
    ],
    [
      'a busca fica sem conexão',
      POSTAL_CODE_LOOKUP_FAILED,
      (request: TestRequest) => request.error(new ProgressEvent('error')),
    ],
    [
      'o ViaCEP está fora do ar',
      POSTAL_CODE_LOOKUP_FAILED,
      (request: TestRequest) =>
        request.flush('', { status: 503, statusText: 'Service Unavailable' }),
    ],
  ])(
    'quando %s, avisa "%s" sem marcar o CEP, deixa o Bairro como estava e não bloqueia o botão',
    async (_, message, respond) => {
      await openFromMenu();
      await fillInValidRouteExcept(POSTAL_CODE);

      await fillIn(POSTAL_CODE, '85010-000');
      await answerPostalCode('85010000', respond);
      await leave(POSTAL_CODE);

      expect(descriptions(POSTAL_CODE)).toEqual([message]);
      expect(isMarkedInvalid(POSTAL_CODE)).toBe(false);
      expectNoMessages();
      expect(neighborhoodValue()).toBe('Centro');
      expect(submitButton()?.disabled, 'botão "Publicar rota" ligado').toBe(false);
    },
  );

  // CA8: só a resposta do último CEP digitado preenche o Bairro.
  it('cancela a busca do CEP anterior quando outro CEP é digitado', async () => {
    await openFromMenu();
    await fillIn(POSTAL_CODE, '85010-000');
    const previous = httpTesting.expectOne(viaCepUrl('85010000'));

    await fillIn(POSTAL_CODE, '85015-430');
    await answerPostalCode('85015430', (request) => request.flush(viaCepAddress('Santa Cruz')));

    expect(previous.cancelled).toBe(true);
    expect(neighborhoodValue()).toBe('Santa Cruz');
  });

  // CA9: o POST leva o que a pessoa informou e a pessoa de exemplo como motorista (spec, "Assume
  // que"), e não leva o CEP, que só ajuda a achar o bairro (CA8): o `toEqual` recusa qualquer campo a
  // mais. O teste faz o papel do json-server, que inventa o id da rota.
  it('publica a rota ativa, com a pessoa de exemplo como motorista, e abre a tela dela com "Rota publicada"', async () => {
    await openFromMenu();
    await chooseCampus('Guarapuava');
    await tap(choice('Sentido', 'Volto do campus'));
    await fillIn(POSTAL_CODE, '85010-000');
    await answerPostalCode('85010000', (request) => request.flush(viaCepAddress('Centro')));
    await fillIn('Ponto de encontro', '  Frente da Padaria Central ');
    for (const label of ['Segunda', 'Quarta', 'Sexta']) {
      await tap(choice('Dias da semana', label));
    }
    await fillIn('Horário de saída', '07:30');
    await fillIn('Vagas', '3');

    await tap(submitButton());

    const request = httpTesting.expectOne({ method: 'POST', url: FIXED_ROUTES_URL });
    expect(request.request.body).toEqual({
      driverId: 'sample-user',
      campusId: GUARAPUAVA_ID,
      direction: 'from_campus',
      neighborhood: 'Centro',
      meetingPoint: 'Frente da Padaria Central',
      weekdays: [1, 3, 5],
      departureTime: '07:30',
      seats: 3,
      suggestedFareCents: null,
      status: 'active',
      closedAt: null,
      createdAt: expect.any(String),
    });

    const published = { id: 'rota-nova', ...request.request.body };
    request.flush(published);
    await harness.fixture.whenStable();
    await answerRouteScreen(published);

    expect(TestBed.inject(Router).url).toBe('/rotas/rota-nova?publicada=1');
    expect(page.querySelector('main [role="status"]')?.textContent?.trim()).toBe('Rota publicada');
    expect(page.querySelector('main h1')?.textContent?.trim()).toBe('Guarapuava → Centro');
    expect(routeDetails()).toEqual({
      Campus: 'Guarapuava',
      'Ponto de encontro': 'Frente da Padaria Central',
      'Dias da semana': 'seg, qua e sex',
      'Horário de saída': '07:30',
      Vagas: '3 vagas',
    });
  });

  // CA10: do toque até a tela da rota abrir, um segundo toque não grava outra rota. Primeiro o
  // servidor ainda não respondeu; depois já respondeu, mas a tela da rota ainda não abriu.
  it('mostra "Publicando…" e bloqueia o botão enquanto grava, sem gravar duas vezes', async () => {
    await openFromMenu();
    await fillInValidRoute();
    // O botão é guardado antes do toque, porque o rótulo dele muda durante a gravação.
    const button = submitButton();
    await tap(button);
    const request = httpTesting.expectOne({ method: 'POST', url: FIXED_ROUTES_URL });

    expect(button?.disabled, 'botão bloqueado').toBe(true);
    expect(button?.textContent?.trim()).toBe('Publicando…');

    await tap(button);
    httpTesting.expectNone(isWrite);

    // A resposta chega, e a tela é desenhada antes de a navegação para a rota terminar.
    const published = { id: 'rota-nova', ...request.request.body };
    request.flush(published);
    harness.fixture.detectChanges();

    expect(page.querySelector('main h1')?.textContent?.trim()).toBe('Publicar uma rota fixa');
    expect(button?.disabled, 'botão bloqueado').toBe(true);
    expect(button?.textContent?.trim()).toBe('Publicando…');

    await tap(button);
    httpTesting.expectNone(isWrite);
    await answerRouteScreen(published);
    expect(TestBed.inject(Router).url).toBe('/rotas/rota-nova?publicada=1');
  });
});
