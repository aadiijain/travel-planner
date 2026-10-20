import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'trips', pathMatch: 'full' },
  {
    path: 'trips',
    loadComponent: () =>
      import('./features/trips/trips-page.component').then(m => m.TripsPageComponent)
  }
];