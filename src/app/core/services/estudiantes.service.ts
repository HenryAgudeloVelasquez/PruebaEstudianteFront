import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstudianteDTO, EstudianteModel } from '../models/estudiante.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class EstudiantesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Estudiantes`;

  getListAll(): Observable<ApiResponse<EstudianteDTO[]>> {
    return this.http.get<ApiResponse<EstudianteDTO[]>>(`${this.baseUrl}/GetListAll`);
  }

  get(id: number): Observable<EstudianteDTO> {
    return this.http.get<EstudianteDTO>(`${this.baseUrl}/Get/${id}`);
  }

  getByIdentificacion(identificacion: string): Observable<EstudianteDTO> {
    return this.http.get<EstudianteDTO>(`${this.baseUrl}/GetByIdentificacion/${encodeURIComponent(identificacion)}`);
  }

  getByCorreo(correo: string): Observable<EstudianteDTO> {
    return this.http.get<EstudianteDTO>(`${this.baseUrl}/GetByCorreo/${encodeURIComponent(correo)}`);
  }

  add(model: EstudianteModel): Observable<EstudianteDTO> {
    return this.http.post<EstudianteDTO>(`${this.baseUrl}/Add`, model);
  }

  edit(id: number, model: EstudianteModel): Observable<EstudianteDTO> {
    return this.http.put<EstudianteDTO>(`${this.baseUrl}/Edit/${id}`, model);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Delete/${id}`);
  }

  toggleEstado(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/ToggleEstado/${id}`, {});
  }
}
