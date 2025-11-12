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
 */
export interface AutoRequest {
  marca: string; 
  modelo: string;
  precio: number;
  anio: number;
  km: string;
  color: string;
  fichaTecnica: FichaTecnicaRequest;
  // Se elimina 'imagenesUrl' de aquí porque los archivos se envían por separado
}

/**
 * Esta es la solicitud para crear una publicación
 */
export interface PublicacionRequest {
  descripcion: string;
  auto: AutoRequest;
  tipoPublicacion: string; // El backend lo asignará según el Rol, pero puede ser útil enviarlo
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
  imagenesUrl: string[]; // <-- AÑADIDO: Para recibir las fotos
}

/**
 * Coincide con PublicacionResponseDTO.java
 */
export interface PublicacionResponse {
  id: number;
  descripcion: string;
  auto: AutoResponse; // <-- Ahora está fuertemente tipado (y contiene las URLs)
  tipoPublicacion: string;
  estado: string; // Ej: 'PENDIENTE', 'APROBADA'
  vendedorEmail: string;
  
  // ⭐️ CAMBIOS AGREGADOS ⭐️
  nombreVendedor: string;
  vendedorTelefono: string;
}


@Injectable({
  providedIn: 'root'
})
export class PublicacionService {

  private apiUrl = 'http://localhost:8080/publicacion';

  constructor(private http: HttpClient) { }

  /**
   * MÉTODO MODIFICADO PARA SUBIR ARCHIVOS
   * Acepta el DTO y una lista de archivos
   */
  crearPublicacion(publicacionDTO: PublicacionRequest, files: File[]): Observable<PublicacionResponse> {
    
    // 1. Crear un objeto FormData
    const formData = new FormData();

    // 2. Adjuntar el DTO como un String JSON
    // La clave "publicacion" DEBE coincidir con @RequestParam("publicacion") en Java
    formData.append('publicacion', JSON.stringify(publicacionDTO));

    // 3. Adjuntar los archivos
    // La clave "files" DEBE coincidir con @RequestParam("files") en Java
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i], files[i].name);
      }
    }

    // 4. Enviar el FormData.
    // El interceptor JWT (jwt.interceptor.ts) se encargará de añadir 
    // el token de autorización automáticamente.
    // No se debe setear el Content-Type, el navegador lo hace solo.
    return this.http.post<PublicacionResponse>(
      `${this.apiUrl}/crearPublicacion`,
      formData
    );
  }

  /**
   * (Resto de métodos sin cambios)
   */

  getMisPublicaciones(): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(`${this.apiUrl}/misPublicaciones`);
  }

  actualizarPublicacion(idPublicacion: number, publicacionDTO: PublicacionRequest): Observable<PublicacionResponse> {
    // Nota: La actualización de imágenes requeriría un endpoint PUT
    // que también acepte FormData, lo cual es más complejo.
    // Por ahora, este método solo actualiza el JSON.
    return this.http.put<PublicacionResponse>(`${this.apiUrl}/${idPublicacion}`, publicacionDTO);
  }

  eliminarPublicacion(idPublicacion: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idPublicacion}`);
  }

  // --- Métodos para ver inventario (públicos) ---
  getCatalogoTienda(): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(`${this.apiUrl}/tienda`);
  }

  getCatalogoUsados(): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(`${this.apiUrl}/usados`);
  }
}