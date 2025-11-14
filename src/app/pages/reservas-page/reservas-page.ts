import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService, ReservaResponseDTO, EstadoReserva } from '../../services/reserva/reserva-service';
import { PublicacionService, PublicacionResponse, getImageUrl } from '../../services/publicacion/publicacion-service';
import { FichaDetalleComponent } from '../../components/ficha-detalle/ficha-detalle';
import { ModalEditarReservaComponent } from '../../components/modal-editar-reserva/modal-editar-reserva';

@Component({
  selector: 'app-reservas-page',
  standalone: true,
  imports: [CommonModule, FichaDetalleComponent, ModalEditarReservaComponent],
  templateUrl: './reservas-page.html',
  styleUrl: './reservas-page.css'
})
export class ReservasPage implements OnInit {
  
  public reservas: ReservaResponseDTO[] = [];
  public cargando: boolean = true;
  public publicacionesMap: Map<number, PublicacionResponse> = new Map();
  
  public mostrarFichaDetalle: boolean = false;
  public publicacionSeleccionada: PublicacionResponse | null = null;
  
  public mostrarModalEditar: boolean = false;
  public reservaEditando: ReservaResponseDTO | null = null;

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
        console.log('🔍 [DEBUG] ReservasPage.cargarReservas - Respuesta completa del backend:', JSON.stringify(reservas, null, 2));
        console.log('🔍 [DEBUG] ReservasPage.cargarReservas - Primera reserva completa:', reservas.length > 0 ? JSON.stringify(reservas[0], null, 2) : 'No hay reservas');
        if (reservas.length > 0) {
          console.log('🔍 [DEBUG] ReservasPage.cargarReservas - Keys de la primera reserva:', Object.keys(reservas[0]));
          console.log('🔍 [DEBUG] ReservasPage.cargarReservas - ID de la primera reserva:', (reservas[0] as any).id);
          console.log('🔍 [DEBUG] ReservasPage.cargarReservas - ID (otro nombre posible):', (reservas[0] as any).idReserva || (reservas[0] as any).reservaId || (reservas[0] as any).reserva_id);
        }
        this.reservas = reservas;
        this.cargarPublicaciones(reservas);
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        alert('Error al cargar las reservas. Verifique el rol ADMIN.');
      }
    });
  }

  cargarPublicaciones(reservas: ReservaResponseDTO[]): void {
    const idsPublicaciones = [...new Set(reservas.map(r => r.idPublicacion))];
    
    this.publicacionService.getCatalogoTienda().subscribe({
      next: (publicaciones) => {
        idsPublicaciones.forEach(id => {
          const publi = publicaciones.find(p => p.id === id);
          if (publi) {
            this.publicacionesMap.set(id, publi);
          }
        });
      },
      error: (err) => {
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
        alert('Error al rechazar la reserva.');
      }
    });
  }

  editarReserva(reserva: ReservaResponseDTO): void {
    console.log('🔍 [DEBUG] ReservasPage.editarReserva - Reserva seleccionada:', JSON.stringify(reserva, null, 2));
    console.log('🔍 [DEBUG] ReservasPage.editarReserva - ID de reserva:', reserva.id);
    console.log('🔍 [DEBUG] ReservasPage.editarReserva - Fecha:', reserva.fecha);
    console.log('🔍 [DEBUG] ReservasPage.editarReserva - UsuarioReserva:', reserva.usuarioReserva);
    console.log('🔍 [DEBUG] ReservasPage.editarReserva - EstadoReserva:', reserva.estadoReserva);
    console.log('🔍 [DEBUG] ReservasPage.editarReserva - IdPublicacion:', reserva.idPublicacion);
    console.log('🔍 [DEBUG] ReservasPage.editarReserva - MontoReserva:', reserva.montoReserva);
    
    this.reservaEditando = reserva;
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.reservaEditando = null;
  }

  onReservaGuardada(reservaActualizada: ReservaResponseDTO): void {
    this.cargarReservas();
  }

  eliminarReserva(reserva: ReservaResponseDTO): void {
    if (!reserva.id && reserva.id !== 0) {
      alert('Error: La reserva no tiene un ID válido. No se puede eliminar.');
      return;
    }

    if (!confirm('¿Está seguro de que desea ELIMINAR esta reserva? Esta acción no se puede deshacer.')) {
      return;
    }

    this.reservaService.eliminarReserva(reserva.id!).subscribe({
      next: () => {
        alert('Reserva eliminada con éxito.');
        this.cargarReservas();
      },
      error: (err) => {
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

  public getImageUrl = getImageUrl;
}
