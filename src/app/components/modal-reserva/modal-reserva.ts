import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicacionResponse } from '../../services/publicacion/publicacion-service';
import { ReservaService, ReservaRequestDTO, UsuarioReservaDTO } from '../../services/reserva/reserva-service';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-modal-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-reserva.html',
  styleUrl: './modal-reserva.css'
})
export class ModalReservaComponent implements OnInit {

  @Input() publicacion!: PublicacionResponse;
  @Output() cerrar = new EventEmitter<void>();

  public fechaReserva: string = '';
  public horaReserva: string = '';
  public nombre: string = '';
  public email: string = '';
  public telefono: string = '';
  public procesando: boolean = false;
  public error: string = '';
  public fechaMinima: string = '';

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const usuario = this.authService.getUser();
    if (usuario) {
      this.email = usuario.email || '';
      this.nombre = usuario.nombre || '';
    }
    // Establecer fecha mínima como hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.fechaReserva = this.fechaMinima;
  }

  public onCerrarClick(): void {
    this.cerrar.emit();
  }

  public onModalContentClick(event: Event): void {
    event.stopPropagation();
  }

  public onSubmit(): void {
    this.error = '';
    
    // Verificar que el usuario esté autenticado
    if (!this.authService.isLoggedIn()) {
      this.error = 'Debes estar autenticado para realizar una reserva. Por favor, inicia sesión.';
      return;
    }

    // Validaciones
    if (!this.fechaReserva || !this.horaReserva) {
      this.error = 'Por favor, selecciona una fecha y hora para la reserva.';
      return;
    }

    if (!this.nombre || !this.email || !this.telefono) {
      this.error = 'Por favor, completa todos los datos de contacto.';
      return;
    }

    // Validar que la fecha no sea en el pasado
    const fechaHoraSeleccionada = new Date(`${this.fechaReserva}T${this.horaReserva}`);
    const ahora = new Date();
    if (fechaHoraSeleccionada <= ahora) {
      this.error = 'La fecha y hora de la reserva deben ser futuras.';
      return;
    }

    this.procesando = true;

    const usuarioReserva: UsuarioReservaDTO = {
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono
    };

    const fechaCompleta = `${this.fechaReserva}T${this.horaReserva}:00`;

    const reservaRequest: ReservaRequestDTO = {
      usuarioReservaDTO: usuarioReserva,
      idPublicacion: this.publicacion.id,
      fecha: fechaCompleta
    };

    this.reservaService.crearReserva(reservaRequest).subscribe({
      next: (urlMercadoPago: string) => {
        // Redirigir a MercadoPago
        if (urlMercadoPago && urlMercadoPago.startsWith('http')) {
          window.location.href = urlMercadoPago;
        } else {
          this.error = 'Error al obtener la URL de pago. Intenta nuevamente.';
          this.procesando = false;
        }
      },
      error: (err) => {
        console.error('Error al crear la reserva:', err);
        
        let mensajeError = 'Error al crear la reserva. ';
        
        if (err.status === 403) {
          mensajeError += 'No tienes permisos para realizar esta acción. Verifica que estés autenticado correctamente.';
        } else if (err.status === 401) {
          mensajeError += 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (err.status === 400) {
          mensajeError += err.error?.message || 'Los datos enviados son inválidos.';
        } else if (err.status === 500) {
          mensajeError += 'Error del servidor. Intenta nuevamente más tarde.';
        } else {
          mensajeError += err.error?.message || 'Intenta nuevamente.';
        }
        
        this.error = mensajeError;
        this.procesando = false;
      }
    });
  }
}

