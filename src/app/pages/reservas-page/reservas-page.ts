import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService, ReservaResponseDTO, EstadoReserva } from '../../services/reserva/reserva-service';
import { PublicacionService, PublicacionResponse, getImageUrl } from '../../services/publicacion/publicacion-service';
import { FichaDetalleComponent } from '../../components/ficha-detalle/ficha-detalle';
import { ModalEditarReservaComponent } from '../../components/modal-editar-reserva/modal-editar-reserva';
import { NotificationService } from '../../services/notification/notification.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-reservas-page',
  standalone: true,
  imports: [CommonModule, FichaDetalleComponent, ModalEditarReservaComponent, ConfirmDialogComponent],
  templateUrl: './reservas-page.html',
  styleUrl: './reservas-page.css'
})
export class ReservasPage implements OnInit {
  
  public reservas: ReservaResponseDTO[] = [];
  public reservasPendientes: ReservaResponseDTO[] = [];
  public reservasAceptadas: ReservaResponseDTO[] = [];
  public cargando: boolean = true;
  public publicacionesMap: Map<number, PublicacionResponse> = new Map();
  
  public mostrarFichaDetalle: boolean = false;
  public publicacionSeleccionada: PublicacionResponse | null = null;
  
  public mostrarModalEditar: boolean = false;
  public reservaEditando: ReservaResponseDTO | null = null;

  // Propiedades para el diálogo de confirmación
  mostrarConfirmDialog: boolean = false;
  mensajeConfirmacion: string = '';
  accionConfirmacion: 'aceptar' | 'rechazar' | 'eliminar' | null = null;
  reservaAccion: ReservaResponseDTO | null = null;

  constructor(
    private reservaService: ReservaService,
    private publicacionService: PublicacionService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.cargando = true;
    this.reservaService.obtenerTodasLasReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.filtrarReservas();
        this.cargarPublicaciones(reservas);
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.notificationService.error('Error al cargar las reservas. Verifique el rol ADMIN.');
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
    this.mensajeConfirmacion = '¿Está seguro de que desea ACEPTAR esta reserva?';
    this.reservaAccion = reserva;
    this.accionConfirmacion = 'aceptar';
    this.mostrarConfirmDialog = true;
  }

  rechazarReserva(reserva: ReservaResponseDTO): void {
    this.mensajeConfirmacion = '¿Está seguro de que desea RECHAZAR esta reserva?';
    this.reservaAccion = reserva;
    this.accionConfirmacion = 'rechazar';
    this.mostrarConfirmDialog = true;
  }

  onConfirmarAccion(): void {
    if (!this.reservaAccion || !this.accionConfirmacion) {
      return;
    }

    const reserva = this.reservaAccion;
    const accion = this.accionConfirmacion;
    this.mostrarConfirmDialog = false;
    this.reservaAccion = null;
    this.accionConfirmacion = null;

    if (accion === 'aceptar') {
      this.reservaService.aceptarReserva(reserva).subscribe({
        next: () => {
          this.notificationService.success('Reserva aceptada con éxito.');
          this.cargarReservas();
        },
        error: (err) => {
          this.notificationService.error('Error al aceptar la reserva.');
        }
      });
    } else if (accion === 'rechazar') {
      this.reservaService.rechazarReserva(reserva).subscribe({
        next: () => {
          this.notificationService.success('Reserva rechazada.');
          this.cargarReservas();
        },
        error: (err) => {
          this.notificationService.error('Error al rechazar la reserva.');
        }
      });
    } else if (accion === 'eliminar') {
      if (!reserva.id && reserva.id !== 0) {
        this.notificationService.error('Error: La reserva no tiene un ID válido. No se puede eliminar.');
        return;
      }
      this.reservaService.eliminarReserva(reserva.id!).subscribe({
        next: () => {
          this.notificationService.success('Reserva eliminada con éxito.');
          this.cargarReservas();
        },
        error: (err) => {
          this.notificationService.error('Error al eliminar la reserva.');
        }
      });
    }
  }

  onCancelarAccion(): void {
    this.mostrarConfirmDialog = false;
    this.reservaAccion = null;
    this.accionConfirmacion = null;
  }

  editarReserva(reserva: ReservaResponseDTO): void {
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
      this.notificationService.error('Error: La reserva no tiene un ID válido. No se puede eliminar.');
      return;
    }

    this.mensajeConfirmacion = '¿Está seguro de que desea ELIMINAR esta reserva? Esta acción no se puede deshacer.';
    this.reservaAccion = reserva;
    this.accionConfirmacion = 'eliminar';
    this.mostrarConfirmDialog = true;
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

  filtrarReservas(): void {
    this.reservasPendientes = this.reservas.filter(r => r.estadoReserva === EstadoReserva.PENDIENTE);
    this.reservasAceptadas = this.reservas.filter(r => r.estadoReserva === EstadoReserva.ACEPTADA);
  }

  esReservaPasada(reserva: ReservaResponseDTO): boolean {
    if (!reserva.fecha) return false;
    const fechaReserva = new Date(reserva.fecha);
    const ahora = new Date();
    return fechaReserva < ahora;
  }

  public getImageUrl = getImageUrl;
}
