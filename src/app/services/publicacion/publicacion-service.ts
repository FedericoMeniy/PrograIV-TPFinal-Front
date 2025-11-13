import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FichaTecnicaRequest {
  motor: string;
  combustible: string;
  caja: string;
  puertas: string;
  potencia: string;
}

export interface AutoRequest {
  marca: string;
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

export interface FichaTecnicaResponse {
  id: number;
  motor: string;
  combustible: string;
  caja: string;
  puertas: string;
  potencia: string;
}

export interface AutoResponse {
  id: number;
  marca: string;
  modelo: string;
  precio: number;
  anio: number;
  km: string;
  color: string;
  fichaTecnica: FichaTecnicaResponse;
  imagenesUrl: string[];
}

export interface PublicacionResponse {
  id: number;
  descripcion: string;
  auto: AutoResponse;
  estado: string;
  vendedorEmail: string;
  nombreVendedor: string;
  vendedorTelefono: string;
}

export interface PublicacionEstadisticaResponse {
  aceptadas: number;
  rechazadas: number;
  pendientes: number;
}

/**
 * Normaliza la URL de una imagen, asegurándose de que tenga el prefijo correcto del backend
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return 'assets/images/placeholder-auto.png';
  }
  
  // Si ya tiene http:// o https://, devolverla tal cual
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si empieza con /, agregar el dominio del backend
  if (imageUrl.startsWith('/')) {
    return `http://localhost:8080${imageUrl}`;
  }
  
  // Si no empieza con /, agregarlo
  return `http://localhost:8080/${imageUrl}`;
}

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {

  private apiUrl = 'http://localhost:8080/publicacion';

  constructor(private http: HttpClient) { }

  crearPublicacion(publicacionDTO: PublicacionRequest, files: File[]): Observable<PublicacionResponse> {

    const formData = new FormData();
    formData.append('publicacion', JSON.stringify(publicacionDTO));

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i], files[i].name);
      }
    }

    return this.http.post<PublicacionResponse>(
      `${this.apiUrl}/crearPublicacion`,
      formData
    );
  }

  getMisPublicaciones(): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(`${this.apiUrl}/misPublicaciones`);
  }

  actualizarPublicacion(idPublicacion: number, publicacionDTO: Partial<PublicacionRequest>): Observable<PublicacionResponse> {
    return this.http.put<PublicacionResponse>(`${this.apiUrl}/${idPublicacion}`, publicacionDTO);
  }

  actualizarPublicacionConArchivos(idPublicacion: number, publicacionDTO: Partial<PublicacionRequest>, files: File[]): Observable<PublicacionResponse> {
    // Nota: El backend no soporta actualización con archivos, 
    // por lo que se actualiza sin archivos usando el endpoint estándar
    return this.http.put<PublicacionResponse>(
      `${this.apiUrl}/${idPublicacion}`,
      publicacionDTO
    );
  }

  eliminarPublicacion(idPublicacion: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idPublicacion}`);
  }

  marcarComoVendida(idPublicacion: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/vendida/${idPublicacion}`, {});
  }



  getPublicacionesPendientes(): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(`${this.apiUrl}/admin/pendientes`);
  }

  getResumenPublicaciones(): Observable<PublicacionEstadisticaResponse> {
    return this.http.get<PublicacionEstadisticaResponse>(`${this.apiUrl}/admin/estadisticas`);
  }

  aprobarPublicacion(idPublicacion: number): Observable<PublicacionResponse> {
    return this.http.patch<PublicacionResponse>(`${this.apiUrl}/admin/aprobar/${idPublicacion}`, {});
  }

  rechazarPublicacion(idPublicacion: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/rechazar/${idPublicacion}`);
  }


  getCatalogoTienda(): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(`${this.apiUrl}/tienda`);
  }

  getCatalogoUsados(): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(`${this.apiUrl}/usados`);
  }
}