import { Routes } from '@angular/router';
import { AppShell } from './core/layout/app-shell/app-shell';

export const routes: Routes = [
  // TODO #2: a raiz passa a levar à agenda quando a tela de entrar existir.
  { path: '', pathMatch: 'full', redirectTo: 'criar-conta' },
  {
    path: '',
    component: AppShell,
    // `minhas-rotas` e `rotas` vêm antes do caminho vazio: para saber se uma URL cabe no caminho
    // vazio, o roteador baixa as rotas de auth, e quem abre essas telas não precisa delas.
    children: [
      // TODO #2: as rotas de `minhas-rotas` passam a exigir o `authGuard` quando a tela de entrar
      // existir (architecture.md §4).
      {
        path: 'minhas-rotas',
        loadChildren: () => import('./features/driver/driver.routes').then((m) => m.driverRoutes),
      },
      {
        path: 'rotas',
        loadChildren: () => import('./features/search/search.routes').then((m) => m.searchRoutes),
      },
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
      },
    ],
  },
  // TODO #5: o endereço desconhecido passa a levar à busca de rotas.
  { path: '**', redirectTo: 'criar-conta' },
];
