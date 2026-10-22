import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { HeaderComponent } from './layout/header/header';
import { FooterComponent } from './layout/footer/footer';
import { PruebaInfoService } from './core/services/prueba-info.service';

export interface RequisitoPrueba {
  numero: number;
  titulo: string;
  enunciado: string;
  solucionFuncional: string;
  modulo: string;
  route?: string;
  icono: string;
  badgeClass: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    Dialog
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly pruebaInfo = inject(PruebaInfoService);
  private readonly router = inject(Router);

  readonly requisitos: RequisitoPrueba[] = [
    {
      numero: 1,
      titulo: 'CRUD de Registro en Línea',
      enunciado: 'Realizar un CRUD que le permita a un usuario realizar un registro en línea.',
      solucionFuncional: 'Módulo completo en "/estudiantes" con formulario reactivo validado para registro en línea. Permite Crear nuevos alumnos, Listar con buscador en vivo, Editar datos, Activar/Inactivar y Eliminar con confirmación modal de seguridad.',
      modulo: 'Módulo Estudiantes',
      route: '/estudiantes',
      icono: 'pi pi-user-plus',
      badgeClass: 'badge-cyan'
    },
    {
      numero: 2,
      titulo: 'Programa de Créditos Académicos',
      enunciado: 'El estudiante se adhiere a un programa de créditos.',
      solucionFuncional: 'Al registrarse, el estudiante ingresa automáticamente al programa curricular oficial estructurado en 9 créditos académicos semestrales, con medidores de avance en tiempo real y flujo guiado paso a paso.',
      modulo: 'Inscripción Guiada',
      route: '/inscripciones',
      icono: 'pi pi-graduation-cap',
      badgeClass: 'badge-emerald'
    },
    {
      numero: 3,
      titulo: 'Existencia de 10 Materias',
      enunciado: 'Existen 10 materias.',
      solucionFuncional: 'Catálogo curricular institucional con exactamente 10 asignaturas oficiales parametrizadas en base de datos (MAT-01 a MAT-10), accesibles en el catálogo general (/catalogo) y en la matrícula (/inscripciones).',
      modulo: 'Catálogo Curricular',
      route: '/catalogo',
      icono: 'pi pi-book',
      badgeClass: 'badge-purple'
    },
    {
      numero: 4,
      titulo: '3 Créditos por Materia',
      enunciado: 'Cada materia equivale a 3 créditos.',
      solucionFuncional: 'Carga estándar homogénea e inalterable: cada una de las 10 materias otorga exactamente 3 créditos académicos (+3 créditos por materia inscrita en el semestre).',
      modulo: 'Carga Académica',
      icono: 'pi pi-bolt',
      badgeClass: 'badge-amber'
    },
    {
      numero: 5,
      titulo: 'Límite Máximo: 3 Materias (9 Créditos)',
      enunciado: 'El estudiante sólo podrá seleccionar 3 materias.',
      solucionFuncional: 'Asistente con 3 ranuras ("Slots") estrictas: cada alumno puede inscribir un máximo de 3 asignaturas (total 9 créditos). Al completarlas, el sistema bloquea nuevas selecciones y valida la regla en frontend y backend.',
      modulo: 'Inscripciones (Paso 2)',
      route: '/inscripciones',
      icono: 'pi pi-check-square',
      badgeClass: 'badge-cyan'
    },
    {
      numero: 6,
      titulo: '5 Profesores con 2 Materias Cada Uno',
      enunciado: 'Hay 5 profesores que dictan 2 materias cada uno.',
      solucionFuncional: 'Planta docente conformada por 5 profesores titulares en la base de datos, cada uno asignado a exactamente 2 asignaturas diferentes de la malla curricular, identificados en cada tarjeta académica.',
      modulo: 'Planta Docente',
      route: '/catalogo',
      icono: 'pi pi-users',
      badgeClass: 'badge-emerald'
    },
    {
      numero: 7,
      titulo: 'Regla Anti-Cruce: No Repetir Profesor',
      enunciado: 'El estudiante no podrá tener clases con el mismo profesor.',
      solucionFuncional: 'Validación en vivo e inteligente: cuando se inscribe una materia con un docente, la segunda materia de ese mismo profesor se bloquea automáticamente con el aviso: "Docente ocupado: Ya tienes clase con este profesor", evitando duplicidad.',
      modulo: 'Inscripciones (Regla #7)',
      route: '/inscripciones',
      icono: 'pi pi-shield',
      badgeClass: 'badge-danger'
    },
    {
      numero: 8,
      titulo: 'Consulta en Línea de Registros de Otros Alumnos',
      enunciado: 'Cada estudiante puede ver en línea los registros de otros estudiantes.',
      solucionFuncional: 'Directorio general público y transparente en "/estudiantes": cualquier usuario puede consultar el listado completo de estudiantes registrados en tiempo real, filtrar por nombre, documento o ciudad y ver su estado de matrícula.',
      modulo: 'Directorio Público',
      route: '/estudiantes',
      icono: 'pi pi-eye',
      badgeClass: 'badge-purple'
    },
    {
      numero: 9,
      titulo: 'Privacidad Estricta: Ver Sólo Nombres de Compañeros',
      enunciado: 'El estudiante podrá ver sólo el nombre de los alumnos con quienes compartirá cada clase.',
      solucionFuncional: 'Módulo en "/companeros": al consultar las materias del estudiante, el sistema extrae y presenta ESTRICTAMENTE Y ÚNICA Y EXCLUSIVAMENTE LOS NOMBRES de sus compañeros de clase, protegiendo datos sensibles (cédula, correo, teléfono y ciudad quedan ocultos).',
      modulo: 'Compañeros de Clase',
      route: '/companeros',
      icono: 'pi pi-lock',
      badgeClass: 'badge-amber'
    }
  ];

  closeModal(): void {
    this.pruebaInfo.close();
  }

  goToModule(route?: string): void {
    if (route) {
      this.closeModal();
      this.router.navigate([route]);
    }
  }
}
