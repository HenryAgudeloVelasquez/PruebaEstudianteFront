import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { EstudiantesService } from '../../core/services/estudiantes.service';
import { MateriasService } from '../../core/services/materias.service';
import { ProfesoresService } from '../../core/services/profesores.service';
import { InscripcionesService } from '../../core/services/inscripciones.service';
import { EstudianteDTO } from '../../core/models/estudiante.model';
import { MateriaDTO } from '../../core/models/materia.model';
import { ProfesorDTO } from '../../core/models/profesor.model';
import { EstudianteMateriaRelacionDTO } from '../../core/models/inscripcion.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inscripciones',
  standalone: true,
  imports: [CommonModule, FormsModule, Toast],
  templateUrl: './inscripciones.component.html',
  styleUrl: './inscripciones.component.scss',
})
export class InscripcionesComponent implements OnInit {
  private readonly estudiantesService = inject(EstudiantesService);
  private readonly materiasService = inject(MateriasService);
  private readonly profesoresService = inject(ProfesoresService);
  private readonly inscripcionesService = inject(InscripcionesService);
  private readonly messageService = inject(MessageService);

  readonly MAX_MATERIAS = environment.programCredits.maxSubjects; // 3
  readonly CREDITOS_POR_MATERIA = environment.programCredits.creditsPerSubject; // 3
  readonly MAX_CREDITOS = environment.programCredits.totalCredits; // 9

  readonly estudiantes = signal<EstudianteDTO[]>([]);
  readonly selectedEstudianteId = signal<number | null>(null);
  readonly materias = signal<MateriaDTO[]>([]);
  readonly profesores = signal<ProfesorDTO[]>([]);
  readonly inscripciones = signal<EstudianteMateriaRelacionDTO[]>([]);

  readonly loading = signal<boolean>(false);
  readonly processingMateriaId = signal<number | null>(null);

  // Computed state for active student
  readonly activeEstudiante = computed(() => {
    const id = this.selectedEstudianteId();
    return this.estudiantes().find(e => e.id === id) || null;
  });

  readonly materiasInscritasCount = computed(() => this.inscripciones().length);
  readonly creditosAcumulados = computed(() => this.inscripciones().length * this.CREDITOS_POR_MATERIA);
  readonly porcentajeProgreso = computed(() => (this.inscripciones().length / this.MAX_MATERIAS) * 100);

  // Set of professor IDs currently assigned to the student's enrolled courses
  readonly profesoresOcupadosMap = computed(() => {
    const map = new Map<number, string>();
    for (const inc of this.inscripciones()) {
      const mat = this.materias().find(m => m.id === inc.idMateria);
      if (mat) {
        map.set(mat.idProfesor, mat.nombre || 'Materia');
      }
    }
    return map;
  });

  // Set of enrolled materia IDs
  readonly inscritasIds = computed(() => {
    return new Set<number>(this.inscripciones().map(i => i.idMateria));
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading.set(true);
    // Load estudiantes, materias, profesores in parallel
    this.estudiantesService.getListAll().subscribe({
      next: (res) => {
        const list = res.data || [];
        this.estudiantes.set(list);
        if (list.length > 0 && !this.selectedEstudianteId()) {
          this.onSelectEstudiante(list[0].id);
        }
      }
    });

    this.materiasService.getListAll().subscribe({
      next: (res) => {
        this.materias.set(res.data || []);
      }
    });

    this.profesoresService.getListAll().subscribe({
      next: (res) => {
        this.profesores.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSelectEstudiante(id: number | null): void {
    this.selectedEstudianteId.set(id);
    if (!id) {
      this.inscripciones.set([]);
      return;
    }
    this.loadInscripciones(id);
  }

  loadInscripciones(estudianteId: number): void {
    this.inscripcionesService.getByEstudiante(estudianteId).subscribe({
      next: (res) => {
        this.inscripciones.set(res.data || []);
      },
      error: () => {
        this.inscripciones.set([]);
      }
    });
  }

  isInscrita(materiaId: number): boolean {
    return this.inscritasIds().has(materiaId);
  }

  getInscripcionId(materiaId: number): number | null {
    const item = this.inscripciones().find(i => i.idMateria === materiaId);
    return item ? item.id : null;
  }

  // Verifica si la materia está bloqueada porque ya se tiene clase con el mismo profesor
  isBloqueadaPorProfesor(materia: MateriaDTO): boolean {
    if (this.isInscrita(materia.id)) return false;
    return this.profesoresOcupadosMap().has(materia.idProfesor);
  }

  getNombreMateriaConflictoProfesor(materia: MateriaDTO): string | null {
    return this.profesoresOcupadosMap().get(materia.idProfesor) || null;
  }

  // Verifica si está bloqueada por haber completado las 3 materias
  isBloqueadaPorLimite(materia: MateriaDTO): boolean {
    if (this.isInscrita(materia.id)) return false;
    return this.materiasInscritasCount() >= this.MAX_MATERIAS;
  }

  canInscribir(materia: MateriaDTO): boolean {
    if (!this.selectedEstudianteId()) return false;
    if (this.isInscrita(materia.id)) return false;
    if (this.isBloqueadaPorLimite(materia)) return false;
    if (this.isBloqueadaPorProfesor(materia)) return false;
    return true;
  }

  inscribirMateria(materia: MateriaDTO): void {
    const estudianteId = this.selectedEstudianteId();
    if (!estudianteId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selecciona un estudiante',
        detail: 'Debes seleccionar primero el estudiante a matricular.'
      });
      return;
    }

    // Validación de regla 5: Máximo 3 materias
    if (this.materiasInscritasCount() >= this.MAX_MATERIAS) {
      this.messageService.add({
        severity: 'error',
        summary: 'Límite de Créditos Alcanzado',
        detail: `El estudiante sólo puede seleccionar un máximo de ${this.MAX_MATERIAS} materias (${this.MAX_CREDITOS} créditos).`
      });
      return;
    }

    // Validación de regla 7: No repetir profesor
    if (this.isBloqueadaPorProfesor(materia)) {
      const materiaConflicto = this.getNombreMateriaConflictoProfesor(materia);
      this.messageService.add({
        severity: 'error',
        summary: 'Conflicto Docente No Permitido',
        detail: `El estudiante ya tiene inscrita la materia "${materiaConflicto}" con el docente ${materia.profesorNombre}. La regla académica estipula que no se puede tener clases con el mismo profesor.`
      });
      return;
    }

    this.processingMateriaId.set(materia.id);
    this.inscripcionesService.add({
      idEstudiante: estudianteId,
      idMateria: materia.id
    }).subscribe({
      next: (res) => {
        this.processingMateriaId.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Materia Inscrita',
          detail: `"${materia.nombre}" inscrita exitosamente (+3 créditos).`
        });
        this.loadInscripciones(estudianteId);
      },
      error: (err) => {
        this.processingMateriaId.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al inscribir',
          detail: err.error?.message || 'No fue posible completar la inscripción.'
        });
      }
    });
  }

  retirarMateria(materia: MateriaDTO): void {
    const inscripcionId = this.getInscripcionId(materia.id);
    const estudianteId = this.selectedEstudianteId();
    if (!inscripcionId || !estudianteId) return;

    this.processingMateriaId.set(materia.id);
    this.inscripcionesService.delete(inscripcionId).subscribe({
      next: () => {
        this.processingMateriaId.set(null);
        this.messageService.add({
          severity: 'info',
          summary: 'Materia Retirada',
          detail: `Se retiró "${materia.nombre}" (-3 créditos).`
        });
        this.loadInscripciones(estudianteId);
      },
      error: () => {
        this.processingMateriaId.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al retirar',
          detail: 'No fue posible retirar la materia.'
        });
      }
    });
  }
}
