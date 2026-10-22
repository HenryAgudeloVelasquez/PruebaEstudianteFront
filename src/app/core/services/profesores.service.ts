import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfesorDTO, ProfesorModel } from '../models/profesor.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProfesoresService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Profesores`;

  getListAll(): Observable<ApiResponse<ProfesorDTO[]>> {
    return this.http.get<ApiResponse<ProfesorDTO[]>>(`${this.baseUrl}/GetListAll`);
  }

  get(id: number): Observable<ProfesorDTO> {
    return this.http.get<ProfesorDTO>(`${this.baseUrl}/Get/${id}`);
  }

  getByIdentificacion(identificacion: string): Observable<ProfesorDTO> {
    return this.http.get<ProfesorDTO>(`${this.baseUrl}/GetByIdentificacion/${encodeURIComponent(identificacion)}`);
  }

  add(model: ProfesorModel): Observable<ProfesorDTO> {
    return this.http.post<ProfesorDTO>(`${this.baseUrl}/Add`, model);
  }

  edit(id: number, model: ProfesorModel): Observable<ProfesorDTO> {
    return this.http.put<ProfesorDTO>(`${this.baseUrl}/Edit/${id}`, model);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Delete/${id}`);
  }

  toggleEstado(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/ToggleEstado/${id}`, {});
  }
}
