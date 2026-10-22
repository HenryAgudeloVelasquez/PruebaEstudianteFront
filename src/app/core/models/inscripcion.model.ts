export interface EstudianteMateriaRelacionDTO {
  id: number;
  idEstudiante: number;
  estudianteNombre?: string;
  estudianteIdentificacion?: string;
  estudianteCorreo?: string;
  idMateria: number;
  materiaNombre?: string;
  materiaCreditos?: number;
  profesorNombre?: string;
  fechaRegistro?: string;
}

export interface EstudianteMateriaRelacionModel {
  id?: number;
  idEstudiante: number;
  idMateria: number;
  fechaRegistro?: string;
}
