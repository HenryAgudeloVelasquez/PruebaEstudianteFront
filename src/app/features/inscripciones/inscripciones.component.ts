import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

export interface EnrolledSlot {
  index: number;
  filled: boolean;
  relacion?: EstudianteMateriaRelacionDTO;
  materia?: MateriaDTO;
}

@Component({
  selector: 'app-inscripciones',
  standalone: true,
  imports: [CommonModule, FormsModule, Toast, RouterLink],
  templateUrl: './inscripciones.component.html',
  styleUrl: './inscripciones.component.scss',
})
export class InscripcionesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly estudiantesService = inject(EstudiantesService);
  private readonly materiasService = inject(MateriasService);
  private readonly profesoresService = inject(ProfesoresService);
  private readonly inscripcionesService = inject(InscripcionesService);
  private readonly messageService = inject(MessageService);

  readonly MAX_MATERIAS = environment.programCredits.maxSubjects; // 3
  readonly CREDITOS_POR_MATERIA = environment.programCredits.creditsPerSubject; // 3
  readonly MAX_CREDITOS = environment.programCredits.totalCredits; // 9

  // Wizard Step Control: 1 = Estudiante, 2 = Materias, 3 = Resumen / Matrícula Oficial
  readonly currentStep = signal<number>(1);
  readonly isNewStudentFlow = signal<boolean>(false);

  readonly estudiantes = signal<EstudianteDTO[]>([]);
  readonly selectedEstudianteId = signal<number | null>(null);
  readonly studentSearchTerm = signal<string>('');

  readonly materias = signal<MateriaDTO[]>([]);
  readonly profesores = signal<ProfesorDTO[]>([]);
  readonly inscripciones = signal<EstudianteMateriaRelacionDTO[]>([]);

  // Filtering
  readonly filtroProfesor = signal<number | null>(null);
  readonly searchTerm = signal<string>('');

  readonly loading = signal<boolean>(false);
  readonly processingMateriaId = signal<number | null>(null);

  // Active student object
  readonly activeEstudiante = computed(() => {
    const id = this.selectedEstudianteId();
    return this.estudiantes().find(e => e.id === id) || null;
  });

  readonly filteredEstudiantes = computed(() => {
    const q = this.studentSearchTerm().trim().toLowerCase();
    if (!q) return this.estudiantes();
    return this.estudiantes().filter(e =>
      e.nombreCompleto?.toLowerCase().includes(q) ||
      e.identificacion?.toLowerCase().includes(q) ||
      e.correoElectronico?.toLowerCase().includes(q)
    );
  });

  readonly materiasInscritasCount = computed(() => this.inscripciones().length);
  readonly creditosAcumulados = computed(() => this.inscripciones().length * this.CREDITOS_POR_MATERIA);
  readonly porcentajeProgreso = computed(() => (this.inscripciones().length / this.MAX_MATERIAS) * 100);

  // Slots representation (3 slots)
  readonly enrolledSlots = computed<EnrolledSlot[]>(() => {
    const current = this.inscripciones();
    const slots: EnrolledSlot[] = [];

    for (let i = 0; i < this.MAX_MATERIAS; i++) {
      const inc = current[i];
      if (inc) {
        const mat = this.materias().find(m => m.id === inc.idMateria);
        slots.push({
          index: i + 1,
          filled: true,
          relacion: inc,
          materia: mat
        });
      } else {
        slots.push({
          index: i + 1,
          filled: false
        });
      }
    }
    return slots;
  });

  // Set of professor IDs currently assigned to student
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

  // Filtered materias
  readonly filteredMaterias = computed(() => {
    let list = this.materias();
    const profId = this.filtroProfesor();
    if (profId !== null) {
      list = list.filter(m => m.idProfesor === profId);
    }
    const q = this.searchTerm().trim().toLowerCase();
    if (q) {
      list = list.filter(m =>
        (m.nombre && m.nombre.toLowerCase().includes(q)) ||
        (m.profesorNombre && m.profesorNombre.toLowerCase().includes(q))
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading.set(true);

    this.estudiantesService.getListAll().subscribe({
      next: (res) => {
        const list = res.data || [];
        this.estudiantes.set(list);

        // Read query params
        this.route.queryParams.subscribe(params => {
          if (params['estudianteId']) {
            const id = Number(params['estudianteId']);
            this.selectedEstudianteId.set(id);
            this.loadInscripciones(id);
          } else if (list.length > 0 && !this.selectedEstudianteId()) {
            this.onSelectEstudiante(list[0].id);
          }

          if (params['step']) {
            const stepNum = Number(params['step']);
            if (stepNum >= 1 && stepNum <= 3) {
              this.currentStep.set(stepNum);
            }
          }

          if (params['nuevo'] === 'true') {
            this.isNewStudentFlow.set(true);
          }
        });
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

  isBloqueadaPorProfesor(materia: MateriaDTO): boolean {
    if (this.isInscrita(materia.id)) return false;
    return this.profesoresOcupadosMap().has(materia.idProfesor);
  }

  getNombreMateriaConflictoProfesor(materia: MateriaDTO): string | null {
    return this.profesoresOcupadosMap().get(materia.idProfesor) || null;
  }

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
        summary: 'Selecciona un Estudiante',
        detail: 'Debes seleccionar primero el estudiante a matricular en el Paso 1.'
      });
      this.currentStep.set(1);
      return;
    }

    if (this.materiasInscritasCount() >= this.MAX_MATERIAS) {
      this.messageService.add({
        severity: 'error',
        summary: 'Límite de Créditos Alcanzado',
        detail: `El estudiante sólo puede seleccionar un máximo de ${this.MAX_MATERIAS} materias (${this.MAX_CREDITOS} créditos).`
      });
      return;
    }

    if (this.isBloqueadaPorProfesor(materia)) {
      const materiaConflicto = this.getNombreMateriaConflictoProfesor(materia);
      this.messageService.add({
        severity: 'error',
        summary: 'Conflicto Docente No Permitido',
        detail: `El estudiante ya tiene inscrita la materia "${materiaConflicto}" con el docente ${materia.profesorNombre}. La regla académica no permite repetir profesor.`
      });
      return;
    }

    this.processingMateriaId.set(materia.id);
    this.inscripcionesService.add({
      idEstudiante: estudianteId,
      idMateria: materia.id
    }).subscribe({
      next: () => {
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

  // Stepper navigation
  setStep(step: number): void {
    if (step >= 2 && !this.selectedEstudianteId()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selecciona un Estudiante',
        detail: 'Por favor selecciona o confirma el estudiante en el Paso 1.'
      });
      this.currentStep.set(1);
      return;
    }
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextStep(): void {
    if (this.currentStep() < 3) {
      this.setStep(this.currentStep() + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.setStep(this.currentStep() - 1);
    }
  }

  printComprobante(): void {
    window.print();
  }

  goToCompaneros(): void {
    const id = this.selectedEstudianteId();
    this.router.navigate(['/companeros'], {
      queryParams: { estudianteId: id || undefined }
    });
  }

  goToEstudiantes(): void {
    this.router.navigate(['/estudiantes']);
  }

  resetWizard(): void {
    this.selectedEstudianteId.set(null);
    this.inscripciones.set([]);
    this.currentStep.set(1);
    this.isNewStudentFlow.set(false);
  }
}
