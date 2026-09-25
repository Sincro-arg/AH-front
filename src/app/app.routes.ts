import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'cuenta',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
    canActivate: [authGuard],
  },
  {
    path: 'pozos',
    loadComponent: () => import('./components/pozos/pozos').then((m) => m.Pozos),
    canActivate: [authGuard],
  },
  {
    path: 'pozos/:id',
    loadComponent: () =>
      import('./components/pozo-detalle/pozo-detalle').then((m) => m.PozoDetalle),
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
  {
    path: 'mis-inversiones',
    loadComponent: () =>
      import('./components/mis-inversiones/mis-inversiones').then((m) => m.MisInversiones),
    canActivate: [authGuard],
  },
];
