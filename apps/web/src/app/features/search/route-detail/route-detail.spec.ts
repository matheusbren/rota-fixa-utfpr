import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
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

// O relógio parado numa quarta, 25/11/2026, às 08:00. Em hora local, e não em UTC: o CI roda em
// UTC, e a viagem sai na hora do relógio de quem dirige (ID33).
const WEDNESDAY_8AM = new Date(2026, 10, 25, 8, 0);

// As viagens da rota de seg, qua e sex às 07:30 nas 4 semanas a contar da quarta, 25/11, sem a
// das 07:30 de hoje, que já passou: de sexta, 27/11, até segunda, 21/12 (CA15, RN18).
const FOUR_WEEKS_OF_TRIPS = [
  'sex., 27/11 às 07:30',
  'seg., 30/11 às 07:30',
  'qua., 02/12 às 07:30',
  'sex., 04/12 às 07:30',
  'seg., 07/12 às 07:30',
  'qua., 09/12 às 07:30',
  'sex., 11/12 às 07:30',
  'seg., 14/12 às 07:30',
  'qua., 16/12 às 07:30',
  'sex., 18/12 às 07:30',
  'seg., 21/12 às 07:30',
];

describe('RouteDetail', () => {
  let harness: RouterTestingHarness;
  let httpTesting: HttpTestingController;
  let page: HTMLElement;

  // A configuração do app inteiro (app.config.ts): é ela que entrega o `:routeId` da URL à tela
  // como input. O teste faz o papel do servidor. As "Próximas viagens" só aparecem quando a pessoa
  // desce até elas (`@defer (on viewport)`), e o jsdom não sabe o que está na tela (não tem
  // `IntersectionObserver`): o próprio teste desenha o bloco quando a pessoa desce.
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
      deferBlockBehavior: DeferBlockBehavior.Manual,
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

  // A parte "Próximas viagens" da tela, achada pelo título.
  function upcomingTripsSection(): HTMLElement {
    const section = Array.from(page.querySelectorAll<HTMLElement>('main section')).find(
      (candidate) => candidate.querySelector('h2')?.textContent?.trim() === 'Próximas viagens',
    );
    expect(section, 'parte "Próximas viagens"').toBeDefined();
    return section as HTMLElement;
  }

  // Descer até "Próximas viagens": no navegador, o bloco é desenhado quando entra na tela.
  async function scrollToUpcomingTrips(): Promise<void> {
    const [block] = await harness.fixture.getDeferBlocks();
    expect(block, 'bloco das próximas viagens').toBeDefined();
    await block.render(DeferBlockState.Complete);
    await harness.fixture.whenStable();
  }

  // As viagens, uma por linha, como a pessoa as lê.
  function tripLines(): string[] {
    return Array.from(upcomingTripsSection().querySelectorAll('li')).map(
      (line) => line.textContent?.trim() ?? '',
    );
  }

  // As opções do seletor ("Esta semana" | "4 semanas"), achadas pelo texto.
  function periodOption(label: string): HTMLButtonElement | undefined {
    return Array.from(upcomingTripsSection().querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === label,
    );
  }

  function isChosen(label: string): boolean {
    return periodOption(label)?.getAttribute('aria-pressed') === 'true';
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

  // CA15: as viagens são contadas a partir de agora, e o relógio fica parado numa quarta às 08:00.
  describe('nas próximas viagens', () => {
    beforeEach(() => vi.setSystemTime(WEDNESDAY_8AM));

    afterEach(() => vi.useRealTimers());

    // CA15: a semana vai de agora até domingo; a das 07:30 de hoje já passou, e a segunda, 30/11, já
    // é a semana que vem.
    it('mostra as viagens desta semana, de agora até domingo, uma por linha com o dia e o horário', async () => {
      await open(`/rotas/${ROUTE_ID}`);
      await answerWithRoute();
      await scrollToUpcomingTrips();

      expect(isChosen('Esta semana'), '"Esta semana" escolhida').toBe(true);
      expect(isChosen('4 semanas'), '"4 semanas" escolhida').toBe(false);
      expect(tripLines()).toEqual(['sex., 27/11 às 07:30']);
    });

    // CA15, RN18
    it('mostra todas as viagens das próximas 4 semanas, a contar de hoje, quando escolho "4 semanas"', async () => {
      await open(`/rotas/${ROUTE_ID}`);
      await answerWithRoute();
      await scrollToUpcomingTrips();

      await tap(periodOption('4 semanas'));

      expect(isChosen('4 semanas'), '"4 semanas" escolhida').toBe(true);
      expect(isChosen('Esta semana'), '"Esta semana" escolhida').toBe(false);
      expect(tripLines()).toEqual(FOUR_WEEKS_OF_TRIPS);

      await tap(periodOption('Esta semana'));

      expect(tripLines()).toEqual(['sex., 27/11 às 07:30']);
    });

    // CA15: uma rota de seg e qua às 07:30, olhada na quarta às 08:00, não tem mais viagem nesta
    // semana. O caminho para as 4 semanas continua ali.
    it('avisa "Nenhuma viagem nesta semana" e "4 semanas" mostra as viagens das semanas seguintes', async () => {
      await open(`/rotas/${ROUTE_ID}`);
      await answerRoute(ROUTE_ID, (request) => request.flush({ ...ROUTE, weekdays: [1, 3] }));
      await answerCampuses();
      await scrollToUpcomingTrips();

      expect(tripLines()).toEqual([]);
      expect(byText('p', 'Nenhuma viagem nesta semana')).toBeDefined();

      await tap(periodOption('4 semanas'));

      expect(byText('p', 'Nenhuma viagem nesta semana')).toBeUndefined();
      expect(tripLines()).toEqual([
        'seg., 30/11 às 07:30',
        'qua., 02/12 às 07:30',
        'seg., 07/12 às 07:30',
        'qua., 09/12 às 07:30',
        'seg., 14/12 às 07:30',
        'qua., 16/12 às 07:30',
        'seg., 21/12 às 07:30',
      ]);
    });
  });
});
