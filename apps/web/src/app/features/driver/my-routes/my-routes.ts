import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { startWith, switchMap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { FixedRoutesService } from '../../../core/data/fixed-routes.service';
import { RouteCard } from './route-card/route-card';

@Component({
  selector: 'app-my-routes',
  imports: [RouterLink, RouteCard],
  templateUrl: './my-routes.html',
  host: { class: 'mx-auto flex w-full max-w-md flex-col gap-6' },
})
export class MyRoutes {
  private readonly auth = inject(AuthService);
  private readonly fixedRoutes = inject(FixedRoutesService);
  private readonly router = inject(Router);

  // Cada toque em "Tentar de novo" soma uma tentativa: um contador, e não um booleano, para cada
  // toque virar uma nova busca (CA16).
  private readonly attempts = signal(0);

  // A busca sai quando a tela abre, quando a pessoa da sessão muda e a cada nova tentativa; a busca
  // nova cancela a anterior (`switchMap`). Toda busca começa sem resultado, o que a tela mostra
  // como "Carregando as suas rotas…", e o Service já devolve a falha como resultado: o signal
  // nunca guarda um erro (architecture.md §2.1).
  protected readonly routesLookup = toSignal(
    toObservable(
      computed(() => ({ driverId: this.auth.currentUserId(), attempt: this.attempts() })),
    ).pipe(
      switchMap(({ driverId }) =>
        this.fixedRoutes.lookupActiveByDriver(driverId).pipe(startWith(undefined)),
      ),
    ),
  );

  protected retry(): void {
    this.attempts.update((count) => count + 1);
  }

  // O toque no cartão abre a tela da rota (CA16).
  protected openRoute(routeId: string): void {
    this.router.navigate(['/rotas', routeId]);
  }
}
