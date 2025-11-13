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

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {

  private apiUrl = 'http://localhost:8080/publicacion';

  constructor(private http: HttpClient) { }

  // --------------------------------------------------
  //                MÉTODOS VENDEDOR
  // --------------------------------------------------
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

  actualizarPublicacion(idPublicacion: number, publicacionDTO: PublicacionRequest): Observable<PublicacionResponse> {
    return this.http.put<PublicacionResponse>(`${this.apiUrl}/${idPublicacion}`, publicacionDTO);
  }

  eliminarPublicacion(idPublicacion: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idPublicacion}`);
  }

  // Nuevo método para marcar como vendida y eliminar
  marcarComoVendida(idPublicacion: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/vendida/${idPublicacion}`, {});
  }


  // --------------------------------------------------
  //                MÉTODOS ADMIN
  // --------------------------------------------------

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


  // --------------------------------------------------
  //                MÉTODOS PÚBLICOS
  // --------------------------------------------------
  getCatalogoTienda(): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(`${this.apiUrl}/tienda`);
  }

  getCatalogoUsados(): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(`${this.apiUrl}/usados`);
  }
}