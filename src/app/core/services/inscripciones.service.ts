import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstudianteMateriaRelacionDTO, EstudianteMateriaRelacionModel } from '../models/inscripcion.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class InscripcionesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Inscripciones`;

  getListAll(): Observable<ApiResponse<EstudianteMateriaRelacionDTO[]>> {
    return this.http.get<ApiResponse<EstudianteMateriaRelacionDTO[]>>(`${this.baseUrl}/GetListAll`);
  }

  get(id: number): Observable<EstudianteMateriaRelacionDTO> {
    return this.http.get<EstudianteMateriaRelacionDTO>(`${this.baseUrl}/Get/${id}`);
  }

  getByEstudiante(idEstudiante: number): Observable<ApiResponse<EstudianteMateriaRelacionDTO[]>> {
    return this.http.get<ApiResponse<EstudianteMateriaRelacionDTO[]>>(`${this.baseUrl}/GetByEstudiante/${idEstudiante}`);
  }

  getByMateria(idMateria: number): Observable<ApiResponse<EstudianteMateriaRelacionDTO[]>> {
    return this.http.get<ApiResponse<EstudianteMateriaRelacionDTO[]>>(`${this.baseUrl}/GetByMateria/${idMateria}`);
  }

  add(model: EstudianteMateriaRelacionModel): Observable<EstudianteMateriaRelacionDTO> {
    return this.http.post<EstudianteMateriaRelacionDTO>(`${this.baseUrl}/Add`, model);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Delete/${id}`);
  }
}
