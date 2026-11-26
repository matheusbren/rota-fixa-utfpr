import { Routes } from '@angular/router';
import { MyRoutes } from './my-routes/my-routes';
import { RouteForm } from './route-form/route-form';

// Filhas de `/minhas-rotas` (app.routes.ts): a lista das rotas ativas e o formulário da rota nova.
export const driverRoutes: Routes = [
  { path: '', component: MyRoutes },
  { path: 'nova', component: RouteForm },
];
