import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    return this.http.get<ReservaResponseDTO[]>(`${this.apiUrl}/mis-reservas`);
  }

  obtenerTodasLasReservas(): Observable<ReservaResponseDTO[]> {
    return this.http.get<ReservaResponseDTO[]>(`${this.apiUrl}/admin/lista`);
  }

  modificarReserva(reserva: ReservaResponseDTO): Observable<ReservaResponseDTO> {
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

