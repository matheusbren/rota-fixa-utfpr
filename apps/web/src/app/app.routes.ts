import { Routes } from '@angular/router';
import { AppShell } from './core/layout/app-shell/app-shell';

export const routes: Routes = [
  // TODO #2: a raiz passa a levar à agenda quando a tela de entrar existir.
  { path: '', pathMatch: 'full', redirectTo: 'criar-conta' },
  {
    path: '',
    component: AppShell,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
      },
    ],
  },
  // TODO #5: o endereço desconhecido passa a levar à busca de rotas.
  { path: '**', redirectTo: 'criar-conta' },
];
