import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { FixedRoutePublication, FixedRoutesService } from './fixed-routes.service';

// O relógio parado no instante da publicação, para conferir o `createdAt` (architecture.md §5.1).
const NOW = '2026-11-25T10:00:00.000Z';

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

  // CA9: a rota é gravada ativa, sem rateio (spec, "Fora de escopo") e sem encerramento, com o
  // motorista que quem chama entrega: o Service não sabe de onde vem esse id. O teste faz o papel
  // do json-server, que devolve a rota gravada com o id que inventou.
  it('grava a rota ativa do motorista entregue, sem os espaços das pontas, e devolve a rota publicada', () => {
    let publication: FixedRoutePublication | undefined;
    fixedRoutes
      .publish({
        driverId: 'motorista-42',
        campusId: 'guarapuava',
        direction: 'from_campus',
        neighborhood: '  Centro ',
        meetingPoint: ' Frente da Padaria Central  ',
        weekdays: [1, 3, 5],
        departureTime: '07:30',
        seats: 3,
      })
      .subscribe((result) => (publication = result));

    const request = httpTesting.expectOne({
      method: 'POST',
      url: `${environment.apiUrl}/fixed_routes`,
    });
    expect(request.request.body).toEqual(RECORD);

    request.flush({ id: 'rota-nova', ...RECORD });

    expect(publication).toEqual({ status: 'published', route: { id: 'rota-nova', ...RECORD } });
  });
});
