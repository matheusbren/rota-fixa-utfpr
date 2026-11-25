import { Routes } from '@angular/router';
import { RouteDetail } from './route-detail/route-detail';

// Filhas de `/rotas` (app.routes.ts). O `:routeId` chega à tela como `input()`.
export const searchRoutes: Routes = [{ path: ':routeId', component: RouteDetail }];
