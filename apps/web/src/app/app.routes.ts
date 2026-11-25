import { Routes } from '@angular/router';
import { AppShell } from './core/layout/app-shell/app-shell';

export const routes: Routes = [
  // TODO #2: a raiz passa a levar à agenda quando a tela de entrar existir.
  { path: '', pathMatch: 'full', redirectTo: 'criar-conta' },
  {
    path: '',
    component: AppShell,
    // `minhas-rotas` vem antes do caminho vazio: para saber se uma URL cabe no caminho vazio, o
    // roteador baixa as rotas de auth, e quem abre `/minhas-rotas` não precisa delas.
    children: [
      {
        path: 'minhas-rotas',
        loadChildren: () => import('./features/driver/driver.routes').then((m) => m.driverRoutes),
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
