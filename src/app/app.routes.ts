import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./components/configuracion/configuracion').then((m) => m.Configuracion),
  },
];
