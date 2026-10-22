import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfesoresService } from '../../core/services/profesores.service';
import { MateriasService } from '../../core/services/materias.service';
import { InscripcionesService } from '../../core/services/inscripciones.service';
import { ProfesorDTO } from '../../core/models/profesor.model';
import { MateriaDTO } from '../../core/models/materia.model';
import { EstudianteMateriaRelacionDTO } from '../../core/models/inscripcion.model';

export interface ProfesorConMaterias {
  profesor: ProfesorDTO;
  materias: MateriaDTO[];
}

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogoComponent implements OnInit {
  private readonly profesoresService = inject(ProfesoresService);
  private readonly materiasService = inject(MateriasService);
  private readonly inscripcionesService = inject(InscripcionesService);

  readonly profesores = signal<ProfesorDTO[]>([]);
  readonly materias = signal<MateriaDTO[]>([]);
  readonly inscripciones = signal<EstudianteMateriaRelacionDTO[]>([]);
  readonly loading = signal<boolean>(false);

  // Groups each professor with their 2 assigned subjects
  readonly profesoresConMaterias = computed<ProfesorConMaterias[]>(() => {
    return this.profesores().map(p => {
      const mats = this.materias().filter(m => m.idProfesor === p.id);
      return {
        profesor: p,
        materias: mats
      };
    });
  });

  ngOnInit(): void {
    this.loadAcademicData();
  }

  loadAcademicData(): void {
    this.loading.set(true);
    this.profesoresService.getListAll().subscribe({
      next: (res) => {
        this.profesores.set(res.data || []);
      }
    });

    this.materiasService.getListAll().subscribe({
      next: (res) => {
        this.materias.set(res.data || []);
      }
    });

    this.inscripcionesService.getListAll().subscribe({
      next: (res) => {
        this.inscripciones.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getInscritosCount(materiaId: number): number {
    return this.inscripciones().filter(i => i.idMateria === materiaId).length;
  }
}
