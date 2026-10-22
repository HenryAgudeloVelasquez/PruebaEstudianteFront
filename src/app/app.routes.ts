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
    title: 'Estudiantes & Registro - Henry Agudelo'
  },
  {
    path: 'inscripciones',
    loadComponent: () =>
      import('./features/inscripciones/inscripciones.component').then(m => m.InscripcionesComponent),
    title: 'Inscripción de Materias - Henry Agudelo'
  },
  {
    path: 'companeros',
    loadComponent: () =>
      import('./features/companeros/companeros.component').then(m => m.CompanerosComponent),
    title: 'Compañeros de Clase - Henry Agudelo'
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./features/catalogo/catalogo.component').then(m => m.CatalogoComponent),
    title: 'Catálogo Académico - Henry Agudelo'
  },
  {
    path: '**',
    redirectTo: 'estudiantes'
  }
];
