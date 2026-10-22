import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EstudiantesService } from '../../core/services/estudiantes.service';
import { MateriasService } from '../../core/services/materias.service';
import { InscripcionesService } from '../../core/services/inscripciones.service';
import { EstudianteDTO } from '../../core/models/estudiante.model';
import { MateriaDTO } from '../../core/models/materia.model';
import { EstudianteMateriaRelacionDTO } from '../../core/models/inscripcion.model';

export interface MateriaCompanerosGroup {
  materia: MateriaDTO;
  companerosNombres: string[];
}

@Component({
  selector: 'app-companeros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './companeros.component.html',
  styleUrl: './companeros.component.scss',
})
export class CompanerosComponent implements OnInit {
  private readonly estudiantesService = inject(EstudiantesService);
  private readonly materiasService = inject(MateriasService);
  private readonly inscripcionesService = inject(InscripcionesService);

  readonly estudiantes = signal<EstudianteDTO[]>([]);
  readonly selectedEstudianteId = signal<number | null>(null);
  readonly materias = signal<MateriaDTO[]>([]);
  readonly allInscripciones = signal<EstudianteMateriaRelacionDTO[]>([]);
  readonly loading = signal<boolean>(false);

  // Tab view: 'por-estudiante' or 'por-materia'
  readonly activeView = signal<'por-estudiante' | 'por-materia'>('por-estudiante');
  readonly selectedMateriaId = signal<number | null>(null);

  // Active student object
  readonly activeEstudiante = computed(() => {
    const id = this.selectedEstudianteId();
    return this.estudiantes().find(e => e.id === id) || null;
  });

  // Group of enrolled subjects with classmates (ONLY NAMES)
  readonly studentClassesWithCompaneros = computed<MateriaCompanerosGroup[]>(() => {
    const estId = this.selectedEstudianteId();
    if (!estId) return [];

    // All inscriptions for this student
    const myInscripciones = this.allInscripciones().filter(i => i.idEstudiante === estId);
    const groups: MateriaCompanerosGroup[] = [];

    for (const myInc of myInscripciones) {
      const materia = this.materias().find(m => m.id === myInc.idMateria);
      if (!materia) continue;

      // Find all OTHER students in this materia (strictly keeping ONLY names)
      const companeros = this.allInscripciones()
        .filter(i => i.idMateria === myInc.idMateria && i.idEstudiante !== estId)
        .map(i => i.estudianteNombre || 'Estudiante Matriculado')
        // Eliminate duplicate names if any
        .filter((value, index, self) => self.indexOf(value) === index);

      groups.push({
        materia,
        companerosNombres: companeros
      });
    }

    return groups;
  });

  // Companeros when viewing directly by single materia
  readonly singleMateriaCompaneros = computed(() => {
    const matId = this.selectedMateriaId();
    if (!matId) return [];
    return this.allInscripciones()
      .filter(i => i.idMateria === matId)
      .map(i => i.estudianteNombre || 'Estudiante')
      .filter((v, idx, s) => s.indexOf(v) === idx);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.estudiantesService.getListAll().subscribe({
      next: (res) => {
        const list = res.data || [];
        this.estudiantes.set(list);
        if (list.length > 0 && !this.selectedEstudianteId()) {
          this.selectedEstudianteId.set(list[0].id);
        }
      }
    });

    this.materiasService.getListAll().subscribe({
      next: (res) => {
        const mats = res.data || [];
        this.materias.set(mats);
        if (mats.length > 0 && !this.selectedMateriaId()) {
          this.selectedMateriaId.set(mats[0].id);
        }
      }
    });

    this.inscripcionesService.getListAll().subscribe({
      next: (res) => {
        this.allInscripciones.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  refresh(): void {
    this.loadData();
  }
}
