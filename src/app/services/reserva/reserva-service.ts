import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UsuarioReservaDTO {
  nombre: string;
  email: string;
  telefono: string;
}

export interface ReservaRequestDTO {
  usuarioReservaDTO: UsuarioReservaDTO;
  idPublicacion: number;
  fecha: string; // ISO string format
}

export enum EstadoReserva {
  PENDIENTE = 'PENDIENTE',
  ACEPTADA = 'ACEPTADA',
  CANCELADA = 'CANCELADA'
}

export interface ReservaResponseDTO {
  id?: number;
  usuarioReserva: UsuarioReservaDTO;
  fecha: string;
  idPublicacion: number;
  montoReserva: number;
  estadoReserva: EstadoReserva;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private apiUrl = 'http://localhost:8080/reserva';

  constructor(private http: HttpClient) { }

  crearReserva(reservaRequest: ReservaRequestDTO): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/crear`, reservaRequest, {
      responseType: 'text' as 'json'
    });
  }

  obtenerMisReservas(): Observable<ReservaResponseDTO[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-reservas`).pipe(
      map(reservas => {
        return reservas.map(reserva => {
          // Mapear el ID desde diferentes posibles nombres de campo
          const id = reserva.id || reserva.idReserva || reserva.reservaId || reserva.reserva_id || (reserva as any).id;
          
          return {
            id: id,
            usuarioReserva: reserva.usuarioReserva || reserva.usuarioReservaDTO,
            fecha: reserva.fecha,
            idPublicacion: reserva.idPublicacion,
            montoReserva: reserva.montoReserva || 0,
            estadoReserva: reserva.estadoReserva || reserva.estado
          } as ReservaResponseDTO;
        });
      })
    );
  }

  obtenerTodasLasReservas(): Observable<ReservaResponseDTO[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/lista`).pipe(
      map(reservas => {
        console.log('🔍 [DEBUG] ReservaService.obtenerTodasLasReservas - Respuesta raw del backend:', JSON.stringify(reservas, null, 2));
        return reservas.map(reserva => {
          // Mapear el ID desde diferentes posibles nombres de campo
          const id = reserva.id || reserva.idReserva || reserva.reservaId || reserva.reserva_id || (reserva as any).id;
          console.log('🔍 [DEBUG] ReservaService.obtenerTodasLasReservas - Mapeando reserva:', {
            original: reserva,
            idMapeado: id,
            keys: Object.keys(reserva)
          });
          
          return {
            id: id,
            usuarioReserva: reserva.usuarioReserva || reserva.usuarioReservaDTO,
            fecha: reserva.fecha,
            idPublicacion: reserva.idPublicacion,
            montoReserva: reserva.montoReserva || 0,
            estadoReserva: reserva.estadoReserva || reserva.estado
          } as ReservaResponseDTO;
        });
      })
    );
  }

  modificarReserva(reserva: ReservaResponseDTO): Observable<ReservaResponseDTO> {
    console.log('🔍 [DEBUG] ReservaService.modificarReserva - URL:', `${this.apiUrl}/modificar-reserva`);
    console.log('🔍 [DEBUG] ReservaService.modificarReserva - Datos a enviar:', JSON.stringify(reserva, null, 2));
    console.log('🔍 [DEBUG] ReservaService.modificarReserva - ID:', reserva.id);
    console.log('🔍 [DEBUG] ReservaService.modificarReserva - Fecha:', reserva.fecha);
    console.log('🔍 [DEBUG] ReservaService.modificarReserva - UsuarioReserva:', reserva.usuarioReserva);
    
    return this.http.put<ReservaResponseDTO>(`${this.apiUrl}/modificar-reserva`, reserva);
  }

  eliminarReserva(idReserva: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idReserva}`);
  }

  aceptarReserva(reserva: ReservaResponseDTO): Observable<ReservaResponseDTO> {
    const reservaModificada = { ...reserva, estadoReserva: EstadoReserva.ACEPTADA };
    return this.modificarReserva(reservaModificada);
  }

  rechazarReserva(reserva: ReservaResponseDTO): Observable<ReservaResponseDTO> {
    const reservaModificada = { ...reserva, estadoReserva: EstadoReserva.CANCELADA };
    return this.modificarReserva(reservaModificada);
  }
}

