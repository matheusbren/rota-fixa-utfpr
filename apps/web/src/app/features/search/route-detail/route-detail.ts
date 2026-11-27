import { DatePipe, I18nPluralPipe } from '@angular/common';
import { Component, booleanAttribute, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { startWith, switchMap } from 'rxjs';
import { FixedRoutesService } from '../../../core/data/fixed-routes.service';
import { WeekdaysPipe } from '../../../shared/pipes/weekdays.pipe';
import { Banner } from '../../../shared/ui/banner/banner';
import { SegmentedControl } from '../../../shared/ui/segmented-control/segmented-control';
import type { SegmentedOption } from '../../../shared/ui/segmented-control/segmented-control';
import { tripsThisWeek, upcomingTrips } from './upcoming-trips';

// As viagens de uma rota vão até 4 semanas à frente, a contar de hoje (RN18).
const UPCOMING_WEEKS = 4;

// O recorte das próximas viagens que a pessoa escolhe ver (CA15).
type TripsPeriod = 'this-week' | 'four-weeks';

@Component({
  selector: 'app-route-detail',
  imports: [DatePipe, I18nPluralPipe, RouterLink, WeekdaysPipe, Banner, SegmentedControl],
  templateUrl: './route-detail.html',
  host: { class: 'mx-auto flex w-full max-w-md flex-col gap-6' },
})
export class RouteDetail {
  // O `:routeId` da URL, entregue pelo roteador (`withComponentInputBinding()`, architecture.md §4).
  readonly routeId = input.required<string>();

  // O `?publicada` da URL, que só o envio da rota põe (CA9); sem ele, nenhum aviso. Também chega
  // pelo roteador, que liga o input pelo nome do parâmetro, e o lint não deixa dar outro nome ao
  // input (`alias`): por isso o nome é o da URL que a pessoa vê, em português (architecture.md §2).
  readonly publicada = input(false, { transform: booleanAttribute });

  private readonly fixedRoutes = inject(FixedRoutesService);

  // Cada toque em "Tentar de novo" soma uma tentativa: um contador, e não um booleano, para cada
  // toque virar uma nova busca (CA14).
  private readonly attempts = signal(0);

  // A busca sai quando a tela abre, quando o id da URL muda e a cada nova tentativa; o id novo
  // cancela a busca do anterior (`switchMap`). Toda busca começa sem resultado, e o Service já
  // devolve a falha como resultado: o signal nunca guarda um erro (architecture.md §2.1).
  protected readonly routeLookup = toSignal(
    toObservable(computed(() => ({ routeId: this.routeId(), attempt: this.attempts() }))).pipe(
      switchMap(({ routeId }) => this.fixedRoutes.findById(routeId).pipe(startWith(undefined))),
    ),
  );

  // "1 vaga" no singular e "3 vagas" no plural (CA13).
  protected readonly seatsLabels = { '=1': '1 vaga', other: '# vagas' };

  // As opções do seletor das próximas viagens, na ordem da tela (CA15).
  protected readonly periods: readonly SegmentedOption<TripsPeriod>[] = [
    { value: 'this-week', label: 'Esta semana' },
    { value: 'four-weeks', label: '4 semanas' },
  ];

  // A tela abre mostrando só esta semana; o `segmented-control` troca o recorte (CA15).
  protected readonly period = signal<TripsPeriod>('this-week');

  // As viagens são calculadas, e não buscadas: saem dos dias e do horário da rota (spec, "Assume
  // que"). O "agora" é lido de novo a cada troca de recorte, para a viagem que passou com a tela
  // aberta sair da lista.
  // TODO #6: as viagens passam a ser gravadas em `trips` quando a assinatura existir. Nessa hora,
  // a geração (`upcomingTrips`) sobe para `core/`, porque o `core/` não importa de `features/`
  // (architecture.md §3).
  protected readonly trips = computed(() => {
    const lookup = this.routeLookup();
    if (lookup?.status !== 'found') {
      return [];
    }
    const now = new Date();
    const trips = upcomingTrips(lookup.route, now, UPCOMING_WEEKS);
    return this.period() === 'this-week' ? tripsThisWeek(trips, now) : trips;
  });

  // "sex., 27/11 às 07:30", pelo `DatePipe` em pt-BR (app.config.ts).
  protected readonly tripFormat = "EEE, dd/MM 'às' HH:mm";

  protected retry(): void {
    this.attempts.update((count) => count + 1);
  }
}
