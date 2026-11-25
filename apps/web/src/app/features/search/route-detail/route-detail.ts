import { I18nPluralPipe } from '@angular/common';
import { Component, booleanAttribute, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { startWith, switchMap } from 'rxjs';
import { FixedRoutesService } from '../../../core/data/fixed-routes.service';
import { WeekdaysPipe } from '../../../shared/pipes/weekdays.pipe';
import { Banner } from '../../../shared/ui/banner/banner';

@Component({
  selector: 'app-route-detail',
  imports: [I18nPluralPipe, RouterLink, WeekdaysPipe, Banner],
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

  protected retry(): void {
    this.attempts.update((count) => count + 1);
  }
}
