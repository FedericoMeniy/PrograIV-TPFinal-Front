import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { PublicacionResponse, AutoResponse } from '../../services/publicacion/publicacion-service';
// Asegúrate de que las interfaces PublicacionResponse y AutoResponse son accesibles.

@Component({
  selector: 'app-ficha-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ficha-detalle.html',
  styleUrl: './ficha-detalle.css'
})
export class FichaDetalleComponent implements OnInit {

  // 1. INPUT: Recibe la publicación desde el componente padre (home-page)
  @Input() publicacion!: PublicacionResponse; 
  
  // 2. OUTPUT: Emite un evento para notificar al padre que debe cerrar el modal
  @Output() cerrar = new EventEmitter<void>();

  public auto!: AutoResponse;

  ngOnInit(): void {
    // Inicialización para facilitar el acceso en el template
    if (this.publicacion) {
      this.auto = this.publicacion.auto;
    }
  }

  /**
   * Cierra el modal, emitiendo el evento al componente padre.
   */
  public onCerrarClick(): void {
    this.cerrar.emit();
  }

  /**
   * Evita que el click dentro del contenido del modal lo cierre.
   */
  public onModalContentClick(event: Event): void {
    event.stopPropagation();
  }
}