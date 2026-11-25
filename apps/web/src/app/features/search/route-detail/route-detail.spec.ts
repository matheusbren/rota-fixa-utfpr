import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../../../../environments/environment';
import { appConfig } from '../../../app.config';

// Os câmpus como o servidor os devolve; a rota guarda só o id do campus.
const CAMPUSES = [
  { id: 'curitiba', name: 'Curitiba', city: 'Curitiba' },
  { id: 'guarapuava', name: 'Guarapuava', city: 'Guarapuava' },
];

// Uma rota de ida como o servidor a devolve: o db.json usa os nomes do modelo (architecture.md §5.1).
const ROUTE_ID = 'rota-centro';
const ROUTE = {
  id: ROUTE_ID,
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
  createdAt: '2026-11-25T10:00:00.000Z',
};

// O que a tela mostra da rota de ida, pelo rótulo de cada dado (CA13).
const ROUTE_DETAILS = {
  Campus: 'Guarapuava',
  'Ponto de encontro': 'Frente da Padaria Central',
  'Dias da semana': 'seg, qua e sex',
  'Horário de saída': '07:30',
  Vagas: '3 vagas',
};

const LOAD_FAILED = 'Não foi possível carregar a rota. Tente de novo.';

describe('RouteDetail', () => {
  let harness: RouterTestingHarness;
  let httpTesting: HttpTestingController;
  let page: HTMLElement;

  // A configuração do app inteiro (app.config.ts): é ela que entrega o `:routeId` da URL à tela
  // como input. O teste faz o papel do servidor.
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  // Nenhuma requisição pode sobrar sem ter sido conferida pelo teste.
  afterEach(() => httpTesting.verify());

  // Abre o endereço da rota, como quem chega pelo link.
  async function open(url: string): Promise<void> {
    harness = await RouterTestingHarness.create(url);
    page = harness.fixture.nativeElement as HTMLElement;
  }

  async function answerRoute(id: string, respond: (request: TestRequest) => void): Promise<void> {
    respond(
      httpTesting.expectOne({ method: 'GET', url: `${environment.apiUrl}/fixed_routes/${id}` }),
    );
    await harness.fixture.whenStable();
  }

  // A tela mostra o nome do campus, e a rota só tem o id dele.
  async function answerCampuses(
    respond: (request: TestRequest) => void = (request) => request.flush(CAMPUSES),
  ): Promise<void> {
    respond(httpTesting.expectOne({ method: 'GET', url: `${environment.apiUrl}/campuses` }));
    await harness.fixture.whenStable();
  }

  // A rota de ida, achada, com o nome do campus.
  async function answerWithRoute(): Promise<void> {
    await answerRoute(ROUTE_ID, (request) => request.flush(ROUTE));
    await answerCampuses();
  }

  async function tap(element: HTMLElement | null | undefined): Promise<void> {
    expect(element).toBeTruthy();
    element?.click();
    await harness.fixture.whenStable();
  }

  function heading(): string | undefined {
    return page.querySelector('main h1')?.textContent?.trim();
  }

  // Os dados da rota, pelo rótulo de cada um, como a pessoa os lê na tela.
  function details(): Record<string, string> {
    return Object.fromEntries(
      Array.from(page.querySelectorAll('main dl dt')).map((term) => [
        term.textContent?.trim() ?? '',
        term.nextElementSibling?.textContent?.trim() ?? '',
      ]),
    );
  }

  function alertText(): string | undefined {
    return page.querySelector('main [role="alert"]')?.textContent?.trim();
  }

  // O aviso de sucesso (o `Banner` de shared/ui/), que o leitor de tela anuncia sem tirar o foco.
  function statusText(): string | undefined {
    return page.querySelector('main [role="status"]')?.textContent?.trim();
  }

  // O elemento achado pelo texto, como a pessoa o enxerga na tela.
  function byText<T extends HTMLElement>(selector: string, text: string): T | undefined {
    return Array.from(page.querySelectorAll<T>(`main ${selector}`)).find(
      (candidate) => candidate.textContent?.trim() === text,
    );
  }

  // CA13
  it('mostra o sentido da ida, do bairro ao campus, o campus, o ponto de encontro, os dias, o horário e as vagas', async () => {
    await open(`/rotas/${ROUTE_ID}`);
    await answerWithRoute();

    expect(heading()).toBe('Centro → Guarapuava');
    expect(details()).toEqual(ROUTE_DETAILS);
  });

  // CA13: na volta o sentido se inverte, e uma vaga só fica no singular.
  it('mostra o sentido da volta, do campus ao bairro, e "1 vaga" no singular', async () => {
    await open('/rotas/rota-volta');
    await answerRoute('rota-volta', (request) =>
      request.flush({
        ...ROUTE,
        id: 'rota-volta',
        direction: 'from_campus',
        weekdays: [2, 4],
        departureTime: '18:10',
        seats: 1,
      }),
    );
    await answerCampuses();

    expect(heading()).toBe('Guarapuava → Centro');
    expect(details()).toEqual({
      ...ROUTE_DETAILS,
      'Dias da semana': 'ter e qui',
      'Horário de saída': '18:10',
      Vagas: '1 vaga',
    });
  });

  // CA9: quem chega pelo envio vê o aviso junto com os dados que informou. O envio marca a URL
  // com `publicada`, que chega à tela como input (`withComponentInputBinding()`).
  it('mostra "Rota publicada" e os dados da rota a quem chega pelo envio', async () => {
    await open(`/rotas/${ROUTE_ID}?publicada=1`);
    await answerWithRoute();

    expect(statusText()).toBe('Rota publicada');
    expect(heading()).toBe('Centro → Guarapuava');
    expect(details()).toEqual(ROUTE_DETAILS);
  });

  // CA9: o aviso fala do envio que acabou de dar certo; quem abre o endereço da rota direto não
  // publicou nada agora.
  it('não mostra "Rota publicada" a quem abre o endereço da rota direto', async () => {
    await open(`/rotas/${ROUTE_ID}`);
    await answerWithRoute();

    expect(statusText()).toBeUndefined();
    expect(details()).toEqual(ROUTE_DETAILS);
  });

  // CA14
  it('avisa "Não achamos esta rota" e oferece o link "Minhas rotas" quando a rota não existe', async () => {
    await open('/rotas/rota-apagada');
    await answerRoute('rota-apagada', (request) =>
      request.flush('Not Found', { status: 404, statusText: 'Not Found' }),
    );

    expect(heading()).toBe('Não achamos esta rota');
    expect(byText<HTMLAnchorElement>('a', 'Minhas rotas')?.getAttribute('href')).toBe(
      '/minhas-rotas',
    );
    expect(details()).toEqual({});
    expect(alertText()).toBeUndefined();
  });

  // CA14: carregar a rota é buscar a rota e o nome do campus dela; a falha de qualquer uma das
  // duas é a falha da busca. O campus que não existe (dado quebrado) também.
  it.each([
    [
      'a busca da rota fica sem conexão',
      () => answerRoute(ROUTE_ID, (request) => request.error(new ProgressEvent('error'))),
    ],
    [
      'o servidor responde erro na busca da rota',
      () =>
        answerRoute(ROUTE_ID, (request) =>
          request.flush('', { status: 500, statusText: 'Internal Server Error' }),
        ),
    ],
    [
      'a busca do campus fica sem conexão',
      async () => {
        await answerRoute(ROUTE_ID, (request) => request.flush(ROUTE));
        await answerCampuses((request) => request.error(new ProgressEvent('error')));
      },
    ],
    [
      'o campus da rota não existe',
      async () => {
        await answerRoute(ROUTE_ID, (request) =>
          request.flush({ ...ROUTE, campusId: 'campus-apagado' }),
        );
        await answerCampuses();
      },
    ],
  ])(
    'quando %s, avisa que não carregou e "Tentar de novo" busca a rota outra vez',
    async (_, fail) => {
      await open(`/rotas/${ROUTE_ID}`);
      await fail();

      expect(alertText()).toBe(LOAD_FAILED);
      expect(details()).toEqual({});

      await tap(byText<HTMLButtonElement>('button', 'Tentar de novo'));
      expect(alertText()).toBeUndefined();
      await answerWithRoute();

      expect(alertText()).toBeUndefined();
      expect(byText<HTMLButtonElement>('button', 'Tentar de novo')).toBeUndefined();
      expect(heading()).toBe('Centro → Guarapuava');
      expect(details()).toEqual(ROUTE_DETAILS);
    },
  );
});
