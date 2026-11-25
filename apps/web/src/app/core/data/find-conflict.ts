import { FixedRoute } from '../models/fixed-route';

// Com menos que isto entre as saídas, no mesmo dia, o motorista não faz as duas rotas: ele não
// dirige dois carros ao mesmo tempo (CA12).
const MINIMUM_GAP_MINUTES = 60;

// "07:30" → 450: os minutos desde a meia-noite, para comparar dois horários de saída.
function minutesOf(departureTime: string): number {
  const [hours, minutes] = departureTime.split(':').map(Number);
  return hours * 60 + minutes;
}

// A primeira rota ativa que coincide com a nova: pelo menos um dia da semana em comum e menos de
// 60 minutos entre as saídas, para antes ou para depois (CA12). Sem nenhuma, `undefined`.
// Regra pura, sem servidor: quem busca as rotas ativas é o `FixedRoutesService`.
export function findConflict(
  newRoute: Pick<FixedRoute, 'weekdays' | 'departureTime'>,
  activeRoutes: readonly FixedRoute[],
): FixedRoute | undefined {
  const departure = minutesOf(newRoute.departureTime);
  return activeRoutes.find(
    ({ weekdays, departureTime }) =>
      weekdays.some((day) => newRoute.weekdays.includes(day)) &&
      Math.abs(minutesOf(departureTime) - departure) < MINIMUM_GAP_MINUTES,
  );
}
