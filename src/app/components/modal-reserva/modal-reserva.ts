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
  public horasDisponibles: string[] = [];

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Generar horas disponibles de 8:00 a 20:00
    this.generarHorasDisponibles();
    
    const usuario = this.authService.getUser();
    if (usuario) {
      this.email = usuario.email || '';
      this.nombre = usuario.nombre || '';
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.fechaReserva = this.fechaMinima;
    
    // Establecer hora por defecto (8:00 AM)
    this.horaReserva = '08:00';
  }

  private generarHorasDisponibles(): void {
    // Generar horas de 8:00 a 20:00 (8 AM a 8 PM)
    for (let hora = 8; hora <= 20; hora++) {
      this.horasDisponibles.push(`${hora.toString().padStart(2, '0')}:00`);
    }
  }

  public formatearHoraParaMostrar(hora: string): string {
    // Mostrar horario militar (24 horas) sin AM/PM
    const [horas, minutos] = hora.split(':');
    const horaNum = parseInt(horas);
    return `${horaNum}:00`;
  }

  public onCerrarClick(): void {
    this.cerrar.emit();
  }

  public onModalContentClick(event: Event): void {
    event.stopPropagation();
  }

  public onSubmit(): void {
    this.error = '';
    
    if (!this.authService.isLoggedIn()) {
      this.error = 'Debes estar autenticado para realizar una reserva. Por favor, inicia sesión.';
      return;
    }

    if (!this.nombre || !this.email || !this.telefono) {
      this.error = 'Por favor, completa todos los datos de contacto.';
      return;
    }

    if (!this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      this.error = 'Por favor, ingresa un email válido.';
      return;
    }

    if (this.telefono.length < 8 || this.telefono.length > 15) {
      this.error = 'El teléfono debe tener entre 8 y 15 caracteres.';
      return;
    }

    if (this.nombre.trim().length < 2) {
      this.error = 'El nombre debe tener al menos 2 caracteres.';
      return;
    }

    this.procesando = true;

    const usuarioReserva: UsuarioReservaDTO = {
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono
    };

    // Usar la fecha y hora actual
    const ahora = new Date();
    const fechaCompleta = ahora.toISOString();

    const reservaRequest: ReservaRequestDTO = {
      usuarioReservaDTO: usuarioReserva,
      idPublicacion: this.publicacion.id,
      fecha: fechaCompleta
    };

    this.reservaService.crearReserva(reservaRequest).subscribe({
      next: (urlMercadoPago: string) => {
        if (urlMercadoPago && urlMercadoPago.startsWith('http')) {
          window.location.href = urlMercadoPago;
        } else {
          this.error = 'Error al obtener la URL de pago. Intenta nuevamente.';
          this.procesando = false;
        }
      },
      error: (err) => {
        
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

