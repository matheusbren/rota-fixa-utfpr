import { tripsThisWeek, upcomingTrips } from './upcoming-trips';

// O relógio parado numa quarta, 25/11/2026, às 08:00. Em hora local, e não em UTC: o CI roda em
// UTC, e a viagem sai na hora do relógio de quem dirige (ID33).
const WEDNESDAY_8AM = new Date(2026, 10, 25, 8, 0);

// Uma rota de segunda, quarta e sexta às 07:30: só os dias e o horário contam para as viagens.
const MON_WED_FRI = { weekdays: [1, 3, 5], departureTime: '07:30' };

// Um dia de novembro ou dezembro de 2026, à hora e ao minuto dados, em hora local.
function at(day: number, month: 11 | 12, hours: number, minutes: number): Date {
  return new Date(2026, month - 1, day, hours, minutes);
}

// As viagens de seg, qua e sex às 07:30 nas 4 semanas que começam na quarta, 25/11: de hoje até a
// segunda, 21/12, o 27º dia depois de hoje. A quarta, 23/12, já é a quinta semana.
const FOUR_WEEKS_FROM_WEDNESDAY = [
  at(25, 11, 7, 30),
  at(27, 11, 7, 30),
  at(30, 11, 7, 30),
  at(2, 12, 7, 30),
  at(4, 12, 7, 30),
  at(7, 12, 7, 30),
  at(9, 12, 7, 30),
  at(11, 12, 7, 30),
  at(14, 12, 7, 30),
  at(16, 12, 7, 30),
  at(18, 12, 7, 30),
  at(21, 12, 7, 30),
];

describe('upcomingTrips', () => {
  // CA15: a viagem das 07:30 de hoje já passou às 08:00.
  it('deixa de fora a viagem de hoje que já passou e começa pela de sexta', () => {
    const trips = upcomingTrips(MON_WED_FRI, WEDNESDAY_8AM, 4);

    expect(trips).not.toContainEqual(at(25, 11, 7, 30));
    expect(trips[0]).toEqual(at(27, 11, 7, 30));
  });

  // RN18: as 4 semanas são de calendário, a contar de hoje. Das 12 viagens, a de hoje já passou.
  it('dá as 11 viagens de seg, qua e sex das próximas 4 semanas, sem a de hoje, que já passou', () => {
    expect(upcomingTrips(MON_WED_FRI, WEDNESDAY_8AM, 4)).toEqual(
      FOUR_WEEKS_FROM_WEDNESDAY.slice(1),
    );
  });

  // RN18: antes das 07:30, a viagem de hoje ainda não passou, e as 4 semanas têm as 12 viagens.
  it('dá as 12 viagens das 4 semanas quando a de hoje ainda não passou', () => {
    expect(upcomingTrips(MON_WED_FRI, at(25, 11, 7, 0), 4)).toEqual(FOUR_WEEKS_FROM_WEDNESDAY);
  });

  // CA15: só fica de fora a viagem de antes de agora; a que sai agora ainda não passou.
  it('mantém a viagem que sai na hora exata de agora', () => {
    expect(upcomingTrips(MON_WED_FRI, at(25, 11, 7, 30), 4)[0]).toEqual(at(25, 11, 7, 30));
  });
});

describe('tripsThisWeek', () => {
  // CA15: "esta semana" vai de agora até o fim do domingo; a segunda, 30/11, já é a semana que vem.
  it('fica só com as viagens de hoje até domingo', () => {
    const trips = upcomingTrips(MON_WED_FRI, WEDNESDAY_8AM, 4);

    expect(tripsThisWeek(trips, WEDNESDAY_8AM)).toEqual([at(27, 11, 7, 30)]);
  });

  // CA15: o domingo inteiro ainda é esta semana, e a semana que vem começa à meia-noite da segunda.
  it('conta o domingo até o último minuto e deixa de fora a meia-noite da segunda', () => {
    const trips = [at(29, 11, 23, 59), at(30, 11, 0, 0)];

    expect(tripsThisWeek(trips, WEDNESDAY_8AM)).toEqual([at(29, 11, 23, 59)]);
  });

  // CA15: sem viagem de hoje até domingo, a semana fica vazia.
  it('fica vazia quando nenhuma viagem cai de hoje até domingo', () => {
    const trips = upcomingTrips({ weekdays: [1, 3], departureTime: '07:30' }, WEDNESDAY_8AM, 4);

    expect(tripsThisWeek(trips, WEDNESDAY_8AM)).toEqual([]);
  });
});
