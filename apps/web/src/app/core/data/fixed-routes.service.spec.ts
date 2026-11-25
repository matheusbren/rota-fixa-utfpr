import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { FixedRoute } from '../models/fixed-route';
import { FixedRoutePublication, FixedRoutesService, NewFixedRoute } from './fixed-routes.service';

// O relógio parado no instante da publicação, para conferir o `createdAt` (architecture.md §5.1).
const NOW = '2026-11-25T10:00:00.000Z';

// A coleção das rotas no json-server.
const FIXED_ROUTES_URL = `${environment.apiUrl}/fixed_routes`;

// As rotas ativas do motorista que quem chama entrega, filtradas pelo json-server.
const ACTIVE_ROUTES_URL = `${FIXED_ROUTES_URL}?driverId=motorista-42&status=active`;

// A rota como quem chama a entrega: o que a pessoa informou, com os espaços das pontas que ela
// digitou no bairro e no ponto de encontro, mais o motorista.
const NEW_ROUTE: NewFixedRoute = {
  driverId: 'motorista-42',
  campusId: 'guarapuava',
  direction: 'from_campus',
  neighborhood: '  Centro ',
  meetingPoint: ' Frente da Padaria Central  ',
  weekdays: [1, 3, 5],
  departureTime: '07:30',
  seats: 3,
};

// A rota como ela é gravada: o que a pessoa informou, sem os espaços das pontas, mais o que o
// Service acrescenta. O id fica de fora: é o servidor que o inventa.
const RECORD = {
  driverId: 'motorista-42',
  campusId: 'guarapuava',
  direction: 'from_campus',
  neighborhood: 'Centro',
  meetingPoint: 'Frente da Padaria Central',
  weekdays: [1, 3, 5],
  departureTime: '07:30',
  seats: 3,
  suggestedFareCents: null,
  status: 'active',
  closedAt: null,
  createdAt: NOW,
};

// Uma rota ativa do mesmo motorista, já gravada, nos dias e no horário que o teste escolhe.
function activeRoute(id: string, weekdays: number[], departureTime: string): FixedRoute {
  return {
    id,
    driverId: 'motorista-42',
    campusId: 'guarapuava',
    direction: 'to_campus',
    neighborhood: 'Santa Cruz',
    meetingPoint: 'Praça da Catedral',
    weekdays,
    departureTime,
    seats: 2,
    suggestedFareCents: null,
    status: 'active',
    closedAt: null,
    createdAt: '2026-11-20T10:00:00.000Z',
  };
}

// As duas formas de a requisição falhar: sem conexão (o navegador nem recebe resposta) ou com erro
// do servidor.
const FAILURES: [string, (request: TestRequest) => void][] = [
  ['sem conexão', (request) => request.error(new ProgressEvent('error'))],
  [
    'com erro do servidor',
    (request) => request.flush(null, { status: 500, statusText: 'Internal Server Error' }),
  ],
];

describe('FixedRoutesService', () => {
  let fixedRoutes: FixedRoutesService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    vi.setSystemTime(NOW);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixedRoutes = TestBed.inject(FixedRoutesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  // Nenhuma requisição pode sobrar sem ter sido conferida pelo teste.
  afterEach(() => {
    httpTesting.verify();
    vi.useRealTimers();
  });

  // Publica a rota nova e guarda o que a publicação devolve.
  function publish(): { result: () => FixedRoutePublication | undefined; failure: () => unknown } {
    let publication: FixedRoutePublication | undefined;
    let failure: unknown;
    fixedRoutes.publish(NEW_ROUTE).subscribe({
      next: (result) => (publication = result),
      error: (reason: unknown) => (failure = reason),
    });
    return { result: () => publication, failure: () => failure };
  }

  // O teste faz o papel do json-server: responde à busca das rotas ativas do motorista.
  function answerActiveRoutes(routes: FixedRoute[]): void {
    httpTesting.expectOne({ method: 'GET', url: ACTIVE_ROUTES_URL }).flush(routes);
  }

  // As rotas ativas do motorista são as que "Minhas rotas" mostra (CA16) e as que a publicação
  // confere antes de gravar (CA12). Quem filtra é o json-server.
  it('busca as rotas ativas do motorista entregue', () => {
    const routes = [activeRoute('rota-1', [1, 3, 5], '07:30'), activeRoute('rota-2', [2], '18:00')];
    let found: FixedRoute[] | undefined;
    fixedRoutes.findActiveByDriver('motorista-42').subscribe((result) => (found = result));

    answerActiveRoutes(routes);

    expect(found).toEqual(routes);
  });

  // CA9: a rota é gravada ativa, sem rateio (spec, "Fora de escopo") e sem encerramento, com o
  // motorista que quem chama entrega: o Service não sabe de onde vem esse id. Antes, confere as
  // rotas ativas desse motorista (CA12). O teste faz o papel do json-server, que devolve a rota
  // gravada com o id que inventou.
  it('grava a rota ativa do motorista entregue, sem os espaços das pontas, e devolve a rota publicada', () => {
    const publication = publish();

    answerActiveRoutes([]);
    const request = httpTesting.expectOne({ method: 'POST', url: FIXED_ROUTES_URL });
    expect(request.request.body).toEqual(RECORD);

    request.flush({ id: 'rota-nova', ...RECORD });

    expect(publication.result()).toEqual({
      status: 'published',
      route: { id: 'rota-nova', ...RECORD },
    });
  });

  // CA12: a conferência vem antes da gravação. A rota que coincide com outra ativa do mesmo
  // motorista não é gravada, e a publicação devolve a rota que conflita, para a tela mostrar os
  // dados dela.
  it('não grava a rota que coincide com outra rota ativa do motorista e devolve a rota que conflita', () => {
    const conflicting = activeRoute('rota-ativa', [3], '08:15');
    const publication = publish();

    answerActiveRoutes([activeRoute('outros-dias', [2, 4], '07:30'), conflicting]);

    httpTesting.expectNone({ method: 'POST', url: FIXED_ROUTES_URL });
    expect(publication.result()).toEqual({ status: 'conflict', route: conflicting });
  });

  // CA9 e CA12: a rota ativa que não coincide não impede a gravação.
  it('grava a rota quando as rotas ativas do motorista não coincidem com ela', () => {
    const publication = publish();

    answerActiveRoutes([
      activeRoute('outros-dias', [2, 4], '07:30'),
      activeRoute('cedo', [1], '06:30'),
    ]);
    httpTesting
      .expectOne({ method: 'POST', url: FIXED_ROUTES_URL })
      .flush({ id: 'rota-nova', ...RECORD });

    expect(publication.result()?.status).toBe('published');
  });

  // CA11 e CA12: sem as rotas ativas não há como conferir o conflito, então nada é gravado. A
  // publicação devolve `failed`, a mesma falha da gravação, e nunca o erro técnico.
  it.each(FAILURES)(
    'devolve a publicação que falhou, sem gravar, quando a busca das rotas ativas fica %s',
    (_, fail) => {
      const publication = publish();

      fail(httpTesting.expectOne({ method: 'GET', url: ACTIVE_ROUTES_URL }));

      httpTesting.expectNone({ method: 'POST', url: FIXED_ROUTES_URL });
      expect(publication.failure()).toBeUndefined();
      expect(publication.result()).toEqual({ status: 'failed' });
    },
  );

  // CA11: a gravação falha sem conexão (o navegador nem recebe resposta) ou com erro do servidor. A
  // publicação devolve `failed`, e nunca o erro técnico (architecture.md §2.1): o Observable não
  // termina em erro, então a tela que o lê não guarda erro nenhum.
  it.each(FAILURES)(
    'devolve a publicação que falhou, sem o erro técnico, quando a gravação fica %s',
    (_, fail) => {
      const publication = publish();

      answerActiveRoutes([]);
      fail(httpTesting.expectOne({ method: 'POST', url: FIXED_ROUTES_URL }));

      expect(publication.failure()).toBeUndefined();
      expect(publication.result()).toEqual({ status: 'failed' });
    },
  );
});
