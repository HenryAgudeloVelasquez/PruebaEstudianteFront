import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MateriaDTO, MateriaModel } from '../models/materia.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Materias`;

  getListAll(): Observable<ApiResponse<MateriaDTO[]>> {
    return this.http.get<ApiResponse<MateriaDTO[]>>(`${this.baseUrl}/GetListAll`);
  }

  get(id: number): Observable<MateriaDTO> {
    return this.http.get<MateriaDTO>(`${this.baseUrl}/Get/${id}`);
  }

  getByProfesor(idProfesor: number): Observable<ApiResponse<MateriaDTO[]>> {
    return this.http.get<ApiResponse<MateriaDTO[]>>(`${this.baseUrl}/GetByProfesor/${idProfesor}`);
  }

  add(model: MateriaModel): Observable<MateriaDTO> {
    return this.http.post<MateriaDTO>(`${this.baseUrl}/Add`, model);
  }

  edit(id: number, model: MateriaModel): Observable<MateriaDTO> {
    return this.http.put<MateriaDTO>(`${this.baseUrl}/Edit/${id}`, model);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Delete/${id}`);
  }

  toggleEstado(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/ToggleEstado/${id}`, {});
  }
}
