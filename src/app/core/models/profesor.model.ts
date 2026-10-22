export interface ProfesorDTO {
  id: number;
  identificacion?: string;
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
  estado: boolean;
  fechaRegistro?: string;
  fechaModifica?: string;
}

export interface ProfesorModel {
  id?: number;
  identificacion: string;
  nombres: string;
  apellidos: string;
  estado: boolean;
}
