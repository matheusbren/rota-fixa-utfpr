import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Campus } from '../models/campus';
import { FixedRoute } from '../models/fixed-route';
import { CampusesService } from './campuses.service';
import { findConflict } from './find-conflict';

// O que a busca de uma rota devolve: a rota achada, com o campus dela; `not-found` quando ela não
// existe; ou `failed` quando a busca falha (CA13 e CA14). A tela não recebe o erro técnico
// (architecture.md §2.1).
export type FixedRouteLookup =
  | { status: 'found'; route: FixedRoute; campus: Campus }
  | { status: 'not-found' }
  | { status: 'failed' };

const FAILED: FixedRouteLookup = { status: 'failed' };

// A rota que a pessoa quer publicar: o que ela informou no formulário, mais o motorista. O Service
// não sabe de onde vem o id do motorista: quem chama o entrega.
export type NewFixedRoute = Pick<
  FixedRoute,
  | 'driverId'
  | 'campusId'
  | 'direction'
  | 'neighborhood'
  | 'meetingPoint'
  | 'weekdays'
  | 'departureTime'
  | 'seats'
>;

// A rota gravada, com o id que o servidor inventou (CA9).
export interface PublishedFixedRoute {
  status: 'published';
  route: FixedRoute;
}

// A rota ativa do mesmo motorista que coincide com a nova, que por isso não foi gravada. A tela
// mostra os dados dela, para a pessoa decidir qual rota manter (CA12).
export interface ConflictingFixedRoute {
  status: 'conflict';
  route: FixedRoute;
}

// O que a publicação devolve, como o `signUp` da US01: um resultado só, que a tela lê, e nunca o
// erro técnico (architecture.md §2.1). A rota publicada; a rota que conflita com a nova (CA12); ou
// `failed` quando a conferência ou a gravação falha, sem conexão ou com erro do servidor (CA11).
export type FixedRoutePublication =
  PublishedFixedRoute | ConflictingFixedRoute | { status: 'failed' };

// Mapeador (architecture.md §2.1): a resposta do servidor vira o modelo. Na E2 o db.json já usa
// os nomes do modelo; na E3 é aqui que o formato do Supabase é traduzido.
function toFixedRoute({
  id,
  driverId,
  campusId,
  direction,
  neighborhood,
  meetingPoint,
  weekdays,
  departureTime,
  seats,
  suggestedFareCents,
  status,
  closedAt,
  createdAt,
}: FixedRoute): FixedRoute {
  return {
    id,
    driverId,
    campusId,
    direction,
    neighborhood,
    meetingPoint,
    weekdays,
    departureTime,
    seats,
    suggestedFareCents,
    status,
    closedAt,
    createdAt,
  };
}

// A rota com o campus dela. O campus que não está na lista é dado quebrado, que a chave
// estrangeira da E3 impede (architecture.md §5.2): para a tela, a busca falhou.
function toFoundLookup(route: FixedRoute, campuses: Campus[]): FixedRouteLookup {
  const campus = campuses.find(({ id }) => id === route.campusId);
  return campus ? { status: 'found', route, campus } : FAILED;
}

@Service()
export class FixedRoutesService {
  private readonly http = inject(HttpClient);
  private readonly campuses = inject(CampusesService);
  private readonly url = `${environment.apiUrl}/fixed_routes`;

  // A rota pelo id da URL, com o campus dela, porque a tela mostra o nome do campus, e a rota só
  // guarda o id. Na E3 as duas buscas viram uma consulta só, e a tela não muda.
  // O 404 da rota é `not-found`; qualquer outra falha, da rota ou do campus, é `failed` (CA14).
  findById(id: string): Observable<FixedRouteLookup> {
    return this.http.get<FixedRoute>(`${this.url}/${encodeURIComponent(id)}`).pipe(
      switchMap((record) =>
        this.campuses.list().pipe(
          map((campuses) => toFoundLookup(toFixedRoute(record), campuses)),
          catchError(() => of(FAILED)),
        ),
      ),
      catchError((error: unknown) =>
        of<FixedRouteLookup>(
          error instanceof HttpErrorResponse && error.status === 404
            ? { status: 'not-found' }
            : FAILED,
        ),
      ),
    );
  }

  // As rotas ativas do motorista que quem chama entrega. Quem filtra é o servidor: na E2, o
  // json-server, pelo nome do campo na consulta.
  findActiveByDriver(driverId: string): Observable<FixedRoute[]> {
    return this.http
      .get<FixedRoute[]>(this.url, { params: { driverId, status: 'active' } })
      .pipe(map((records) => records.map(toFixedRoute)));
  }

  // Grava a rota ativa, sem rateio (RN16, que entra com a US11) e sem encerramento, com o instante
  // da publicação em ISO 8601 (architecture.md §5.1). O id é o servidor que inventa.
  // Os espaços das pontas do bairro e do ponto de encontro não contam (CA3 e CA4), e não são
  // gravados. Só os campos da rota são gravados: o CEP, que só ajuda a achar o bairro, não (CA8).
  // Antes de gravar, confere as rotas ativas do motorista: a que coincide com uma delas não é
  // gravada, e o resultado é a rota que conflita (CA12). Na E2 a conferência é daqui; na E3 ela vai
  // para o banco, e a tela não muda (architecture.md §2.1).
  // Sem conexão ou com erro do servidor, na conferência ou na gravação, o resultado é `failed`
  // (CA11): sem as rotas ativas não há como conferir, então nada é gravado. Até o
  // `errorInterceptor` nascer, é aqui que a falha vira o resultado que a tela espera
  // (architecture.md §2.1).
  publish({
    driverId,
    campusId,
    direction,
    neighborhood,
    meetingPoint,
    weekdays,
    departureTime,
    seats,
  }: NewFixedRoute): Observable<FixedRoutePublication> {
    const record: Omit<FixedRoute, 'id'> = {
      driverId,
      campusId,
      direction,
      neighborhood: neighborhood.trim(),
      meetingPoint: meetingPoint.trim(),
      weekdays,
      departureTime,
      seats,
      suggestedFareCents: null,
      status: 'active',
      closedAt: null,
      createdAt: new Date().toISOString(),
    };
    return this.findActiveByDriver(driverId).pipe(
      switchMap((activeRoutes) => {
        const conflict = findConflict(record, activeRoutes);
        if (conflict) {
          return of<FixedRoutePublication>({ status: 'conflict', route: conflict });
        }
        return this.http.post<FixedRoute>(this.url, record).pipe(
          map((created): FixedRoutePublication => ({
            status: 'published',
            route: toFixedRoute(created),
          })),
        );
      }),
      catchError(() => of<FixedRoutePublication>({ status: 'failed' })),
    );
  }
}
