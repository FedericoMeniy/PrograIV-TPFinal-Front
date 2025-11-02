import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- NUEVAS INTERFACES (Basadas en tus DTOs de Java) ---

/**
 * Coincide con FichaTecnicaRequestDTO.java
 */
export interface FichaTecnicaRequest {
  motor: string;
  combustible: string;
  caja: string;
  puertas: string; // El DTO de Java lo define como String
  potencia: string;
}

/**
 * Coincide con AutoRequestDTO.java
 * (Nota: Usa 'marca', no 'nombre')
 */
export interface AutoRequest {
  marca: string; // <-- Cambio clave (antes era 'nombre')
  modelo: string;
  precio: number;
  anio: number;
  km: string;
  color: string;
  fichaTecnica: FichaTecnicaRequest;
}

/**
 * Esta es la solicitud para crear una publicación
 * (Asumiendo que PublicacionRequestDTO se ve así)
 */
export interface PublicacionRequest {
  descripcion: string;
  auto: AutoRequest;
  tipoPublicacion: string;
}

// --- INTERFACES DE RESPUESTA ---

/**
 * Coincide con FichaTecnicaResponseDTO.java
 */
export interface FichaTecnicaResponse {
  id: number;
  motor: string;
  combustible: string;
  caja: string;
  puertas: string;
  potencia: string;
}

/**
 * Coincide con AutoResponseDTO.java
 */
export interface AutoResponse {
  id: number;
  marca: string; // <-- Propiedad clave
  modelo: string;
  precio: number;
  anio: number;
  km: string;
  color: string;
  fichaTecnica: FichaTecnicaResponse;
}

/**
 * Coincide con PublicacionResponseDTO.java
 */
export interface PublicacionResponse {
  id: number;
  descripcion: string;
  auto: AutoResponse; // <-- Ahora está fuertemente tipado
  tipoPublicacion: string;
  estado: string; // Ej: 'PENDIENTE', 'APROBADA'
  vendedorEmail: string;
}


@Injectable({
  providedIn: 'root'
})
export class PublicacionService {

  private apiUrl = 'http://localhost:8080/publicacion';

  constructor(private http: HttpClient) { }

  /**
   * (Métodos existentes... no cambian)
   */
  crearPublicacion(publicacionDTO: PublicacionRequest): Observable<PublicacionResponse> {
    return this.http.post<PublicacionResponse>(
      `${this.apiUrl}/crearPublicacion`,
      publicacionDTO
    );
  }

  getMisPublicaciones(): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(`${this.apiUrl}/misPublicaciones`);
  }

  actualizarPublicacion(idPublicacion: number, publicacionDTO: PublicacionRequest): Observable<PublicacionResponse> {
    return this.http.put<PublicacionResponse>(`${this.apiUrl}/${idPublicacion}`, publicacionDTO);
  }

  eliminarPublicacion(idPublicacion: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idPublicacion}`);
  }

  // --- Métodos para ver inventario (de mi respuesta anterior) ---
  getCatalogoTienda(): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(`${this.apiUrl}/tienda`);
  }

  getCatalogoUsados(): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(`${this.apiUrl}/usados`);
  }
}