import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { EstudiantesService } from '../../core/services/estudiantes.service';
import { InscripcionesService } from '../../core/services/inscripciones.service';
import { EstudianteDTO, EstudianteModel } from '../../core/models/estudiante.model';
import { EstudianteMateriaRelacionDTO } from '../../core/models/inscripcion.model';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Dialog,
    Toast,
    ConfirmDialog
  ],
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.scss',
})
export class EstudiantesComponent implements OnInit {
  private readonly estudiantesService = inject(EstudiantesService);
  private readonly inscripcionesService = inject(InscripcionesService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);

  readonly estudiantes = signal<EstudianteDTO[]>([]);
  readonly filteredEstudiantes = signal<EstudianteDTO[]>([]);
  readonly loading = signal<boolean>(false);
  readonly searchTerm = signal<string>('');

  readonly activosCount = computed(() => this.estudiantes().filter(e => e.estado).length);

  // Dialog State
  readonly isDialogVisible = signal<boolean>(false);
  readonly isDetailVisible = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly selectedEstudiante = signal<EstudianteDTO | null>(null);
  readonly estudianteMaterias = signal<EstudianteMateriaRelacionDTO[]>([]);
  readonly saving = signal<boolean>(false);

  estudianteForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadEstudiantes();
  }

  initForm(): void {
    this.estudianteForm = this.fb.group({
      id: [0],
      tipoDocumento: ['CC', [Validators.required]],
      identificacion: ['', [Validators.required, Validators.maxLength(50)]],
      nombres: ['', [Validators.required, Validators.maxLength(100)]],
      apellidos: ['', [Validators.required, Validators.maxLength(100)]],
      correoElectronico: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      password: ['Estudiante2026*', [Validators.required, Validators.minLength(6)]],
      fechaNacimiento: ['2000-01-01', [Validators.required]],
      ciudadResidencia: ['', [Validators.required, Validators.maxLength(100)]],
      estado: [true]
    });
  }

  loadEstudiantes(): void {
    this.loading.set(true);
    this.estudiantesService.getListAll().subscribe({
      next: (response) => {
        const list = response.data || [];
        this.estudiantes.set(list);
        this.applyFilter(this.searchTerm());
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar estudiantes',
          detail: 'No fue posible conectar con el servidor.'
        });
      }
    });
  }

  applyFilter(query: string): void {
    this.searchTerm.set(query);
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filteredEstudiantes.set(this.estudiantes());
      return;
    }
    const filtered = this.estudiantes().filter(e =>
      (e.nombreCompleto?.toLowerCase().includes(q)) ||
      (e.identificacion?.toLowerCase().includes(q)) ||
      (e.correoElectronico?.toLowerCase().includes(q)) ||
      (e.ciudadResidencia?.toLowerCase().includes(q))
    );
    this.filteredEstudiantes.set(filtered);
  }

  openNew(): void {
    this.isEditing.set(false);
    this.estudianteForm.reset({
      id: 0,
      tipoDocumento: 'CC',
      identificacion: '',
      nombres: '',
      apellidos: '',
      correoElectronico: '',
      password: 'Estudiante2026*',
      fechaNacimiento: '2001-06-15',
      ciudadResidencia: 'Medellín',
      estado: true
    });
    this.isDialogVisible.set(true);
  }

  openEdit(est: EstudianteDTO): void {
    this.isEditing.set(true);
    const formattedDate = est.fechaNacimiento
      ? new Date(est.fechaNacimiento).toISOString().split('T')[0]
      : '2000-01-01';

    this.estudianteForm.patchValue({
      id: est.id,
      tipoDocumento: est.tipoDocumento || 'CC',
      identificacion: est.identificacion,
      nombres: est.nombres,
      apellidos: est.apellidos,
      correoElectronico: est.correoElectronico,
      password: 'UpdateSecurePass123*',
      fechaNacimiento: formattedDate,
      ciudadResidencia: est.ciudadResidencia,
      estado: est.estado
    });
    this.isDialogVisible.set(true);
  }

  viewDetail(est: EstudianteDTO): void {
    this.selectedEstudiante.set(est);
    this.estudianteMaterias.set([]);
    this.isDetailVisible.set(true);

    this.inscripcionesService.getByEstudiante(est.id).subscribe({
      next: (res) => {
        this.estudianteMaterias.set(res.data || []);
      },
      error: () => {
        this.estudianteMaterias.set([]);
      }
    });
  }

  saveEstudiante(): void {
    if (this.estudianteForm.invalid) {
      this.estudianteForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail: 'Por favor completa todos los campos requeridos.'
      });
      return;
    }

    this.saving.set(true);
    const formVal = this.estudianteForm.value;
    const model: EstudianteModel = {
      tipoDocumento: formVal.tipoDocumento,
      identificacion: formVal.identificacion,
      nombres: formVal.nombres,
      apellidos: formVal.apellidos,
      correoElectronico: formVal.correoElectronico,
      password: formVal.password,
      fechaNacimiento: new Date(formVal.fechaNacimiento).toISOString(),
      ciudadResidencia: formVal.ciudadResidencia,
      estado: formVal.estado
    };

    if (this.isEditing()) {
      model.id = formVal.id;
      this.estudiantesService.edit(formVal.id, model).subscribe({
        next: () => {
          this.saving.set(false);
          this.isDialogVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Actualización Exitosa',
            detail: `Estudiante ${model.nombres} actualizado.`
          });
          this.loadEstudiantes();
        },
        error: (err) => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error al actualizar',
            detail: err.error?.message || 'Verifica los datos e intenta nuevamente.'
          });
        }
      });
    } else {
      this.estudiantesService.add(model).subscribe({
        next: () => {
          this.saving.set(false);
          this.isDialogVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Registro Exitoso',
            detail: `Estudiante ${model.nombres} registrado en línea.`
          });
          this.loadEstudiantes();
        },
        error: (err) => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error en registro',
            detail: err.error?.message || 'Identificación o correo posiblemente ya existen.'
          });
        }
      });
    }
  }

  toggleEstado(est: EstudianteDTO): void {
    this.estudiantesService.toggleEstado(est.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Estado Modificado',
          detail: `Estado de ${est.nombreCompleto} actualizado.`
        });
        this.loadEstudiantes();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No fue posible cambiar el estado.'
        });
      }
    });
  }

  confirmDelete(est: EstudianteDTO): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el registro del estudiante "${est.nombreCompleto}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.estudiantesService.delete(est.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Estudiante eliminado con éxito.'
            });
            this.loadEstudiantes();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No fue posible eliminar el estudiante (verifique si tiene materias inscritas).'
            });
          }
        });
      }
    });
  }
}
