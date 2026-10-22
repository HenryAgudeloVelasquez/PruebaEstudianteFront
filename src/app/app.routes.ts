import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'estudiantes',
    pathMatch: 'full'
  },
  {
    path: 'estudiantes',
    loadComponent: () =>
      import('./features/estudiantes/estudiantes.component').then(m => m.EstudiantesComponent),
    title: 'Estudiantes & Registro - CampusCredits'
  },
  {
    path: 'inscripciones',
    loadComponent: () =>
      import('./features/inscripciones/inscripciones.component').then(m => m.InscripcionesComponent),
    title: 'Inscripción de Materias - CampusCredits'
  },
  {
    path: 'companeros',
    loadComponent: () =>
      import('./features/companeros/companeros.component').then(m => m.CompanerosComponent),
    title: 'Compañeros de Clase - CampusCredits'
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./features/catalogo/catalogo.component').then(m => m.CatalogoComponent),
    title: 'Catálogo Académico - CampusCredits'
  },
  {
    path: '**',
    redirectTo: 'estudiantes'
  }
];
