import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService, ReservaResponseDTO } from '../../services/reserva/reserva-service';

@Component({
  selector: 'app-modal-editar-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-editar-reserva.html',
  styleUrl: './modal-editar-reserva.css'
})
export class ModalEditarReservaComponent implements OnInit {

  @Input() reserva!: ReservaResponseDTO;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<ReservaResponseDTO>();

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
    private reservaService: ReservaService
  ) { }

  ngOnInit(): void {
    console.log('🔍 [DEBUG] Modal Editar Reserva - Reserva recibida:', this.reserva);
    
    // Generar horas disponibles de 8:00 a 20:00
    this.generarHorasDisponibles();
    
    if (this.reserva) {
      // Cargar los datos de la reserva
      this.nombre = this.reserva.usuarioReserva.nombre || '';
      this.email = this.reserva.usuarioReserva.email || '';
      this.telefono = this.reserva.usuarioReserva.telefono || '';
      
      console.log('🔍 [DEBUG] Datos cargados:', {
        nombre: this.nombre,
        email: this.email,
        telefono: this.telefono,
        fechaOriginal: this.reserva.fecha
      });
      
      // Parsear la fecha
      if (this.reserva.fecha) {
        const fechaObj = new Date(this.reserva.fecha);
        this.fechaReserva = fechaObj.toISOString().split('T')[0];
        const horas = fechaObj.getHours().toString().padStart(2, '0');
        const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
        const horaCompleta = `${horas}:${minutos}`;
        
        // Si la hora no está en el rango permitido, ajustarla al más cercano
        if (this.horasDisponibles.includes(horaCompleta)) {
          this.horaReserva = horaCompleta;
        } else {
          // Buscar la hora más cercana en el rango
          const horaNum = parseInt(horas);
          if (horaNum < 8) {
            this.horaReserva = '08:00';
          } else if (horaNum > 20) {
            this.horaReserva = '20:00';
          } else {
            // Redondear a la hora más cercana
            this.horaReserva = `${horaNum.toString().padStart(2, '0')}:00`;
          }
        }
        
        console.log('🔍 [DEBUG] Fecha parseada:', {
          fechaReserva: this.fechaReserva,
          horaReserva: this.horaReserva,
          fechaObj: fechaObj
        });
      }
    }
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    this.fechaMinima = hoy.toISOString().split('T')[0];
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

    if (!this.fechaReserva || !this.horaReserva) {
      this.error = 'Por favor, selecciona una fecha y hora para la reserva.';
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

    const fechaHoraSeleccionada = new Date(`${this.fechaReserva}T${this.horaReserva}`);
    const ahora = new Date();
    if (fechaHoraSeleccionada <= ahora) {
      this.error = 'La nueva fecha y hora de la reserva deben ser futuras.';
      return;
    }

    // Validar que el ID esté presente
    if (!this.reserva.id && this.reserva.id !== 0) {
      console.error('❌ [DEBUG] Error: La reserva no tiene ID. Reserva completa:', JSON.stringify(this.reserva, null, 2));
      this.error = 'Error: La reserva no tiene un ID válido. El backend no está enviando el ID de la reserva. Por favor, contacta al administrador del sistema.';
      return;
    }

    this.procesando = true;

    // Crear objeto de reserva modificada
    // El backend necesita el ID para identificar la reserva a modificar
    const reservaModificada: ReservaResponseDTO = {
      id: this.reserva.id, // Importante: incluir el ID para que el backend sepa qué reserva modificar
      usuarioReserva: {
        nombre: this.nombre.trim(),
        email: this.email.trim(),
        telefono: this.telefono.trim()
      },
      fecha: `${this.fechaReserva}T${this.horaReserva}:00`,
      idPublicacion: this.reserva.idPublicacion,
      montoReserva: this.reserva.montoReserva,
      estadoReserva: this.reserva.estadoReserva
    };

    console.log('🔍 [DEBUG] Reserva original:', JSON.stringify(this.reserva, null, 2));
    console.log('🔍 [DEBUG] Datos del formulario:', {
      fechaReserva: this.fechaReserva,
      horaReserva: this.horaReserva,
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono
    });
    console.log('🔍 [DEBUG] Objeto a enviar al backend:', JSON.stringify(reservaModificada, null, 2));
    console.log('🔍 [DEBUG] ID de la reserva:', reservaModificada.id);
    console.log('🔍 [DEBUG] Fecha formateada:', reservaModificada.fecha);

    this.reservaService.modificarReserva(reservaModificada).subscribe({
      next: (reservaActualizada) => {
        alert('Reserva actualizada con éxito.');
        this.guardado.emit(reservaActualizada);
        this.cerrar.emit();
      },
      error: (err) => {
        console.error('❌ [DEBUG] Error al modificar reserva:', err);
        console.error('❌ [DEBUG] Status:', err.status);
        console.error('❌ [DEBUG] Error completo:', JSON.stringify(err, null, 2));
        console.error('❌ [DEBUG] Error message:', err.message);
        console.error('❌ [DEBUG] Error error:', err.error);
        console.error('❌ [DEBUG] Error error (string):', typeof err.error === 'string' ? err.error : JSON.stringify(err.error));
        
        let mensajeError = 'Error al actualizar la reserva. ';
        
        if (err.status === 403) {
          mensajeError += 'No tienes permisos para realizar esta acción.';
        } else if (err.status === 401) {
          mensajeError += 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (err.status === 400) {
          const errorMsg = err.error?.message || err.error || 'Los datos enviados son inválidos.';
          console.error('❌ [DEBUG] Mensaje de error del backend:', errorMsg);
          mensajeError += errorMsg;
        } else if (err.status === 500) {
          mensajeError += 'Error del servidor. Intenta nuevamente más tarde.';
        } else {
          mensajeError += err.error?.message || err.error || 'Intenta nuevamente.';
        }
        
        this.error = mensajeError;
        this.procesando = false;
      }
    });
  }
}

