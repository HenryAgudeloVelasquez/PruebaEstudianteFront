export interface MateriaDTO {
  id: number;
  nombre?: string;
  creditos: number;
  idProfesor: number;
  profesorNombre?: string;
  estado: boolean;
  fechaRegistro?: string;
}

export interface MateriaModel {
  id?: number;
  nombre: string;
  creditos: number;
  idProfesor: number;
  estado: boolean;
}
