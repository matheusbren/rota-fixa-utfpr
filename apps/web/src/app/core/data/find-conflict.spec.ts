import { FixedRoute } from '../models/fixed-route';
import { findConflict } from './find-conflict';

// Uma rota ativa minha, com os dias e o horário que o teste confere. O resto não entra na regra.
function activeRoute(
  id: string,
  weekdays: number[],
  departureTime: string,
  neighborhood = 'Centro',
): FixedRoute {
  return {
    id,
    driverId: 'motorista-42',
    campusId: 'guarapuava',
    direction: 'to_campus',
    neighborhood,
    meetingPoint: 'Frente da Padaria Central',
    weekdays,
    departureTime,
    seats: 3,
    suggestedFareCents: null,
    status: 'active',
    closedAt: null,
    createdAt: '2026-11-20T10:00:00.000Z',
  };
}

// A rota nova, como a pessoa a informou: segunda, quarta e sexta, saindo às 07:30.
const NEW_ROUTE = { weekdays: [1, 3, 5], departureTime: '07:30' };

describe('findConflict', () => {
  // CA12: sem rota ativa, nada conflita.
  it('aceita a rota nova quando não há rota ativa', () => {
    expect(findConflict(NEW_ROUTE, [])).toBeUndefined();
  });

  // CA12: no mesmo dia, menos de 60 minutos entre as saídas, para depois ou para antes.
  it.each(['08:29', '06:31', '07:30'])(
    'recusa a rota nova das 07:30 quando outra rota ativa sai às %s no mesmo dia',
    (departureTime) => {
      const active = activeRoute('rota-ativa', [1, 3, 5], departureTime);

      expect(findConflict(NEW_ROUTE, [active])).toBe(active);
    },
  );

  // CA12: 60 minutos ou mais entre as saídas, para depois ou para antes, não conflita.
  it.each(['08:30', '06:30'])(
    'aceita a rota nova das 07:30 quando outra rota ativa sai às %s no mesmo dia',
    (departureTime) => {
      expect(findConflict(NEW_ROUTE, [activeRoute('rota-ativa', [1, 3, 5], departureTime)])).toBe(
        undefined,
      );
    },
  );

  // CA12: no mesmo horário, mas sem nenhum dia em comum.
  it('aceita a rota nova quando a rota ativa do mesmo horário é de outros dias', () => {
    expect(findConflict(NEW_ROUTE, [activeRoute('rota-ativa', [2, 4, 6], '07:30')])).toBe(
      undefined,
    );
  });

  // CA12: basta um dia em comum.
  it('recusa a rota nova quando a rota ativa tem só um dos dias dela', () => {
    const active = activeRoute('rota-ativa', [5, 6], '07:45');

    expect(findConflict(NEW_ROUTE, [active])).toBe(active);
  });

  // CA12: a tela mostra os dados de uma rota só, a primeira que conflita.
  it('devolve a primeira rota ativa que conflita, e não as que não conflitam', () => {
    const otherDays = activeRoute('outros-dias', [2, 4], '07:30', 'Batel');
    const first = activeRoute('primeira', [3], '08:00', 'Centro');
    const second = activeRoute('segunda', [1], '07:00', 'Santa Cruz');

    expect(findConflict(NEW_ROUTE, [otherDays, first, second])).toBe(first);
  });
});
