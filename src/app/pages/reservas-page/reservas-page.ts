import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService, ReservaResponseDTO, EstadoReserva } from '../../services/reserva/reserva-service';
import { PublicacionService, PublicacionResponse } from '../../services/publicacion/publicacion-service';
import { FichaDetalleComponent } from '../../components/ficha-detalle/ficha-detalle';

@Component({
  selector: 'app-reservas-page',
  standalone: true,
  imports: [CommonModule, FichaDetalleComponent],
  templateUrl: './reservas-page.html',
  styleUrl: './reservas-page.css'
})
export class ReservasPage implements OnInit {
  
  public reservas: ReservaResponseDTO[] = [];
  public cargando: boolean = true;
  public publicacionesMap: Map<number, PublicacionResponse> = new Map();
  
  public mostrarFichaDetalle: boolean = false;
  public publicacionSeleccionada: PublicacionResponse | null = null;

  constructor(
    private reservaService: ReservaService,
    private publicacionService: PublicacionService
  ) { }

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.cargando = true;
    this.reservaService.obtenerTodasLasReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.cargarPublicaciones(reservas);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.cargando = false;
        alert('Error al cargar las reservas. Verifique el rol ADMIN.');
      }
    });
  }

  cargarPublicaciones(reservas: ReservaResponseDTO[]): void {
    const idsPublicaciones = [...new Set(reservas.map(r => r.idPublicacion))];
    
    // Cargar todas las publicaciones de la tienda una vez
    this.publicacionService.getCatalogoTienda().subscribe({
      next: (publicaciones) => {
        // Mapear todas las publicaciones encontradas
        idsPublicaciones.forEach(id => {
          const publi = publicaciones.find(p => p.id === id);
          if (publi) {
            this.publicacionesMap.set(id, publi);
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar publicaciones:', err);
      }
    });
  }

  obtenerPublicacion(idPublicacion: number): PublicacionResponse | null {
    return this.publicacionesMap.get(idPublicacion) || null;
  }

  mostrarFicha(publicacion: PublicacionResponse): void {
    this.publicacionSeleccionada = publicacion;
    this.mostrarFichaDetalle = true;
  }

  cerrarFicha(): void {
    this.mostrarFichaDetalle = false;
    this.publicacionSeleccionada = null;
  }

  aceptarReserva(reserva: ReservaResponseDTO): void {
    if (!confirm('¿Está seguro de que desea ACEPTAR esta reserva?')) {
      return;
    }
    this.reservaService.aceptarReserva(reserva).subscribe({
      next: () => {
        alert('Reserva aceptada con éxito.');
        this.cargarReservas();
      },
      error: (err) => {
        console.error('Error al aceptar la reserva:', err);
        alert('Error al aceptar la reserva.');
      }
    });
  }

  rechazarReserva(reserva: ReservaResponseDTO): void {
    if (!confirm('¿Está seguro de que desea RECHAZAR esta reserva?')) {
      return;
    }
    this.reservaService.rechazarReserva(reserva).subscribe({
      next: () => {
        alert('Reserva rechazada.');
        this.cargarReservas();
      },
      error: (err) => {
        console.error('Error al rechazar la reserva:', err);
        alert('Error al rechazar la reserva.');
      }
    });
  }

  eliminarReserva(id: number): void {
    if (!confirm('¿Está seguro de que desea ELIMINAR esta reserva?')) {
      return;
    }
    this.reservaService.eliminarReserva(id).subscribe({
      next: () => {
        alert('Reserva eliminada.');
        this.cargarReservas();
      },
      error: (err) => {
        console.error('Error al eliminar la reserva:', err);
        alert('Error al eliminar la reserva.');
      }
    });
  }

  getEstadoClass(estado: EstadoReserva): string {
    switch (estado) {
      case EstadoReserva.ACEPTADA:
        return 'estado-aceptada';
      case EstadoReserva.CANCELADA:
        return 'estado-cancelada';
      case EstadoReserva.PENDIENTE:
        return 'estado-pendiente';
      default:
        return '';
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No especificada';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
