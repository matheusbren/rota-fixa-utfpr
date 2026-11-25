import { Routes } from '@angular/router';
import { RouteForm } from './route-form/route-form';

// Filhas de `/minhas-rotas` (app.routes.ts).
export const driverRoutes: Routes = [{ path: 'nova', component: RouteForm }];
