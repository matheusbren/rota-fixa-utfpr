import { FixedRoute } from '../../../core/models/fixed-route';

// O dia da semana no padrão ISO do `weekdays` da rota (1 = segunda … 7 = domingo); o `getDay()`
// do JavaScript conta o domingo como 0.
function isoWeekday(date: Date): number {
  return date.getDay() || 7;
}

// As viagens da rota nas `weeks` semanas de calendário que começam hoje (de hoje até o fim do
// dia `weeks × 7 − 1` dias depois), em ordem, sem as que saíram antes de `now` (RN18, CA15). As
// datas são calculadas em hora local, como o horário de saída da rota.
export function upcomingTrips(
  route: Pick<FixedRoute, 'weekdays' | 'departureTime'>,
  now: Date,
  weeks: number,
): Date[] {
  const [hours, minutes] = route.departureTime.split(':').map(Number);
  const trips: Date[] = [];
  for (let offset = 0; offset < weeks * 7; offset++) {
    const departsAt = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset,
      hours,
      minutes,
    );
    if (route.weekdays.includes(isoWeekday(departsAt)) && departsAt >= now) {
      trips.push(departsAt);
    }
  }
  return trips;
}

// Só as viagens desta semana, que vai até o fim do domingo; a semana que vem começa à meia-noite
// da segunda (CA15).
export function tripsThisWeek(trips: readonly Date[], now: Date): Date[] {
  const nextMonday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 8 - isoWeekday(now),
  );
  return trips.filter((departsAt) => departsAt < nextMonday);
}
