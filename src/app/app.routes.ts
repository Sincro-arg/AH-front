import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./components/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./components/configuracion/configuracion').then((m) => m.Configuracion),
    canActivate: [authGuard],
  },
];
