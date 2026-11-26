import { HttpRequest } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../../../../environments/environment';
import { appConfig } from '../../../app.config';

// A coleção das rotas e a dos câmpus no json-server.
const FIXED_ROUTES_URL = `${environment.apiUrl}/fixed_routes`;
const CAMPUSES_URL = `${environment.apiUrl}/campuses`;

// Os câmpus como o servidor os devolve; a rota guarda só o id do campus.
const CAMPUSES = [
  { id: 'curitiba', name: 'Curitiba', city: 'Curitiba' },
  { id: 'guarapuava', name: 'Guarapuava', city: 'Guarapuava' },
];

// Duas rotas ativas da pessoa de exemplo, como o servidor as devolve: uma de ida, do Centro para
// Guarapuava, e uma de volta, de Curitiba para o Batel, com uma vaga só.
const TO_CAMPUS_ROUTE = {
  id: 'rota-do-centro',
  driverId: 'sample-user',
  campusId: 'guarapuava',
  direction: 'to_campus',
  neighborhood: 'Centro',
  meetingPoint: 'Frente da Padaria Central',
  weekdays: [1, 3, 5],
  departureTime: '07:30',
  seats: 3,
  suggestedFareCents: null,
  status: 'active',
  closedAt: null,
  createdAt: '2026-11-20T10:00:00.000Z',
};
const FROM_CAMPUS_ROUTE = {
  ...TO_CAMPUS_ROUTE,
  id: 'rota-do-batel',
  campusId: 'curitiba',
  direction: 'from_campus',
  neighborhood: 'Batel',
  meetingPoint: 'Praça do Batel',
  weekdays: [2, 4],
  departureTime: '18:10',
  seats: 1,
};

// O que cada cartão mostra das duas rotas, na ordem em que o servidor as devolve: o sentido, os
// dias, o horário e as vagas (CA16), com as regras de texto do CA13.
const TWO_CARDS = [
  ['Centro → Guarapuava', 'seg, qua e sex', '07:30', '3 vagas'],
  ['Curitiba → Batel', 'ter e qui', '18:10', '1 vaga'],
];

const LOADING = 'Carregando as suas rotas…';
const NO_ROUTES = 'Você ainda não publicou nenhuma rota';
const LOAD_FAILED = 'Não foi possível carregar as suas rotas. Tente de novo.';

// A busca das rotas ativas da pessoa de exemplo, conferida pelo nome de cada parâmetro, e não pela
// URL inteira, que muda com a ordem deles.
function isActiveRoutesSearch(request: HttpRequest<unknown>): boolean {
  return (
    request.method === 'GET' &&
    request.url === FIXED_ROUTES_URL &&
    request.params.get('driverId') === 'sample-user' &&
    request.params.get('status') === 'active'
  );
}

describe('MyRoutes', () => {
  let harness: RouterTestingHarness;
  let httpTesting: HttpTestingController;
  let page: HTMLElement;

  // O app inteiro, com a casca e o menu: a tela é aberta pelo menu, como a pessoa faz (CA16). A
  // configuração é a do app (app.config.ts), que entrega o id da URL à tela da rota aberta pelo
  // cartão. O teste faz o papel do servidor. Na tela da rota, as "Próximas viagens" só são
  // desenhadas quando a pessoa desce até elas (`@defer (on viewport)`), e o jsdom não sabe o que
  // está na tela (não tem `IntersectionObserver`): aqui ninguém desce, e o bloco fica fechado.
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });
    httpTesting = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create('/criar-conta');
    page = harness.fixture.nativeElement as HTMLElement;
  });

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

  // Abre "Minhas rotas" pelo menu, como a pessoa faz (CA16).
  function openFromMenu(): Promise<void> {
    return tap(menuLink('Minhas rotas'));
  }

  async function answerActiveRoutes(respond: (request: TestRequest) => void): Promise<void> {
    respond(httpTesting.expectOne(isActiveRoutesSearch));
    await harness.fixture.whenStable();
  }

  // O cartão mostra o nome do campus, e a rota só tem o id dele.
  async function answerCampuses(
    respond: (request: TestRequest) => void = (request) => request.flush(CAMPUSES),
  ): Promise<void> {
    respond(httpTesting.expectOne({ method: 'GET', url: CAMPUSES_URL }));
    await harness.fixture.whenStable();
  }

  // As rotas ativas que o teste escolhe, com os nomes dos câmpus.
  async function answerWithRoutes(routes: (typeof TO_CAMPUS_ROUTE)[]): Promise<void> {
    await answerActiveRoutes((request) => request.flush(routes));
    await answerCampuses();
  }

  function heading(): string | undefined {
    return page.querySelector('main h1')?.textContent?.trim();
  }

  function alertText(): string | undefined {
    return page.querySelector('main [role="alert"]')?.textContent?.trim();
  }

  // O elemento do palco achado pelo texto, como a pessoa o enxerga na tela. Só o palco: o menu tem
  // um link "Publicar uma rota fixa" com o mesmo texto.
  function byText<T extends HTMLElement>(selector: string, text: string): T | undefined {
    return Array.from(page.querySelectorAll<T>(`main ${selector}`)).find(
      (candidate) => candidate.textContent?.trim() === text,
    );
  }

  // Os cartões das rotas, um por item da lista.
  function cards(): HTMLButtonElement[] {
    return Array.from(page.querySelectorAll<HTMLButtonElement>('main li button'));
  }

  // O que cada cartão mostra, parte por parte, como a pessoa lê.
  function cardContents(): string[][] {
    return cards().map((card) =>
      Array.from(card.children).map((part) => part.textContent?.trim() ?? ''),
    );
  }

  // CA16: carregar é buscar as rotas e os nomes dos câmpus delas. Enquanto qualquer uma das duas
  // buscas não volta, a tela avisa que está carregando.
  it('abre pelo menu e mostra "Carregando as suas rotas…" até as rotas e os câmpus chegarem', async () => {
    await openFromMenu();

    expect(TestBed.inject(Router).url).toBe('/minhas-rotas');
    expect(heading()).toBe('Minhas rotas');
    expect(byText('p', LOADING)).toBeDefined();

    await answerActiveRoutes((request) => request.flush([TO_CAMPUS_ROUTE]));
    expect(byText('p', LOADING)).toBeDefined();
    expect(cards()).toHaveLength(0);

    await answerCampuses();
    expect(byText('p', LOADING)).toBeUndefined();
    expect(cards()).toHaveLength(1);
  });

  // CA16
  it('mostra um cartão por rota ativa, com o sentido, os dias, o horário e as vagas, na ordem do servidor', async () => {
    await openFromMenu();
    await answerWithRoutes([TO_CAMPUS_ROUTE, FROM_CAMPUS_ROUTE]);

    expect(cardContents()).toEqual(TWO_CARDS);
    expect(byText('p', NO_ROUTES)).toBeUndefined();
    expect(alertText()).toBeUndefined();
  });

  // CA16: tocar no cartão abre a tela da rota, que busca a rota pelo id e o nome do campus dela; o
  // teste faz o papel do servidor nas duas buscas.
  it('abre a tela da rota ao tocar no cartão dela', async () => {
    await openFromMenu();
    await answerWithRoutes([TO_CAMPUS_ROUTE, FROM_CAMPUS_ROUTE]);

    await tap(cards()[1]);

    expect(TestBed.inject(Router).url).toBe('/rotas/rota-do-batel');
    httpTesting
      .expectOne({ method: 'GET', url: `${FIXED_ROUTES_URL}/rota-do-batel` })
      .flush(FROM_CAMPUS_ROUTE);
    await harness.fixture.whenStable();
    await answerCampuses();
    expect(heading()).toBe('Curitiba → Batel');
  });

  // CA16
  it('avisa "Você ainda não publicou nenhuma rota" e oferece o link "Publicar uma rota fixa" quando não há rota ativa', async () => {
    await openFromMenu();
    await answerWithRoutes([]);

    expect(byText('p', NO_ROUTES)).toBeDefined();
    expect(byText<HTMLAnchorElement>('a', 'Publicar uma rota fixa')?.getAttribute('href')).toBe(
      '/minhas-rotas/nova',
    );
    expect(cards()).toHaveLength(0);
    expect(alertText()).toBeUndefined();
  });

  // CA16: carregar é buscar as rotas e os nomes dos câmpus delas; a falha de qualquer uma das duas,
  // sem conexão ou com erro do servidor, é a falha da busca. A nova tentativa é uma nova busca, que
  // pode dar certo.
  it.each([
    [
      'a busca das rotas fica sem conexão',
      () => answerActiveRoutes((request) => request.error(new ProgressEvent('error'))),
    ],
    [
      'o servidor responde erro na busca das rotas',
      () =>
        answerActiveRoutes((request) =>
          request.flush(null, { status: 500, statusText: 'Internal Server Error' }),
        ),
    ],
    [
      'a busca dos câmpus fica sem conexão',
      async () => {
        await answerActiveRoutes((request) => request.flush([TO_CAMPUS_ROUTE]));
        await answerCampuses((request) => request.error(new ProgressEvent('error')));
      },
    ],
    [
      'o servidor responde erro na busca dos câmpus',
      async () => {
        await answerActiveRoutes((request) => request.flush([TO_CAMPUS_ROUTE]));
        await answerCampuses((request) =>
          request.flush(null, { status: 500, statusText: 'Internal Server Error' }),
        );
      },
    ],
  ])(
    'quando %s, avisa que não carregou e "Tentar de novo" busca as rotas outra vez',
    async (_, fail) => {
      await openFromMenu();
      await fail();

      expect(alertText()).toBe(LOAD_FAILED);
      expect(byText('p', LOADING)).toBeUndefined();
      expect(cards()).toHaveLength(0);

      await tap(byText<HTMLButtonElement>('button', 'Tentar de novo'));
      expect(alertText()).toBeUndefined();
      expect(byText('p', LOADING)).toBeDefined();
      await answerWithRoutes([TO_CAMPUS_ROUTE, FROM_CAMPUS_ROUTE]);

      expect(alertText()).toBeUndefined();
      expect(byText<HTMLButtonElement>('button', 'Tentar de novo')).toBeUndefined();
      expect(cardContents()).toEqual(TWO_CARDS);
    },
  );
});
