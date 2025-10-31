import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Ya no necesitamos AuthService ni throwError aquí para esto
// Ya no necesitamos HttpParams

// --- Interfaces (DTOs del Frontend) ---
// (Tus interfaces FichaTecnicaRequest, AutoRequest, etc. permanecen igual)
// ... (las dejo omitidas por brevedad, pero deben estar aquí) ...

export interface FichaTecnicaRequest {
  motor: string;
  combustible: string;
  caja: string;
  puertas: number;
  potencia: string;
}

export interface AutoRequest {
  nombre: string;
  modelo: string;
  precio: number;
  anio: number;
  km: string;
  color: string;
  fichaTecnica: FichaTecnicaRequest;
}

export interface PublicacionRequest {
  descripcion: string;
  auto: AutoRequest;
  tipoPublicacion: string;
}

export interface PublicacionResponse {
  id: number;
  descripcion: string;
  auto: any; 
  // ... otros campos
}

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {

  private apiUrl = 'http://localhost:8080/publicacion';

  constructor(
    private http: HttpClient
    // Ya no necesitamos AuthService aquí
  ) { }

  /**
   * Llama al endpoint para crear una nueva publicación.
   * El token JWT se añadirá automáticamente por el interceptor.
   */
  crearPublicacion(publicacionDTO: PublicacionRequest): Observable<PublicacionResponse> {
    // El backend NO espera idUsuario como param.
    // Lo obtiene del token JWT que el interceptor adjuntará.
    return this.http.post<PublicacionResponse>(
      `${this.apiUrl}/crearPublicacion`, // Endpoint
      publicacionDTO // Body
      // No se envían { params }
    );
  }

  /**
   * Obtiene las publicaciones del usuario logueado.
   * El interceptor se encarga de la autenticación.
   */
  getMisPublicaciones(): Observable<PublicacionResponse[]> {
    // El backend identifica al usuario por el token.
    return this.http.get<PublicacionResponse[]>(`${this.apiUrl}/misPublicaciones`);
  }

  /**
   * Actualiza una publicación existente.
   * El interceptor se encarga de la autenticación.
   */
  actualizarPublicacion(idPublicacion: number, publicacionDTO: PublicacionRequest): Observable<PublicacionResponse> {
    return this.http.put<PublicacionResponse>(`${this.apiUrl}/${idPublicacion}`, publicacionDTO);
  }

  /**
   * Elimina una publicación.
   * El interceptor se encarga de la autenticación.
   */
  eliminarPublicacion(idPublicacion: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idPublicacion}`);
  }
}
