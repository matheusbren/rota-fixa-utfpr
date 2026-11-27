// O sentido da rota: do bairro para o campus (ida) ou do campus para o bairro (volta).
export type FixedRouteDirection = 'to_campus' | 'from_campus';

// Uma rota encerrada deixa de receber assinatura, mas não sai da coleção (RN15).
export type FixedRouteStatus = 'active' | 'closed';

// O trajeto que o motorista faz toda semana, nos mesmos dias e horário (architecture.md §5.1).
export interface FixedRoute {
  id: string;
  driverId: string;
  campusId: string;
  direction: FixedRouteDirection;
  // O bairro da outra ponta, a que não é o campus.
  neighborhood: string;
  meetingPoint: string;
  // Os dias pelo número ISO: 1 = segunda … 7 = domingo.
  weekdays: number[];
  // Só a hora, como "07:30".
  departureTime: string;
  seats: number;
  // Em centavos; `null` é "a combinar" (RN16).
  suggestedFareCents: number | null;
  status: FixedRouteStatus;
  closedAt: string | null;
  createdAt: string;
}
