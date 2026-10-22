export interface EstudianteDTO {
  id: number;
  tipoDocumento?: string;
  identificacion?: string;
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
  correoElectronico?: string;
  fechaNacimiento: string;
  ciudadResidencia?: string;
  estado: boolean;
  fechaRegistro?: string;
  fechaModifica?: string;
}

export interface EstudianteModel {
  id?: number;
  tipoDocumento: string;
  identificacion: string;
  nombres: string;
  apellidos: string;
  correoElectronico: string;
  password?: string;
  fechaNacimiento: string;
  ciudadResidencia: string;
  estado?: boolean;
}
