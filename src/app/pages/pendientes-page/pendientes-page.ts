import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importamos PublicacionService y la Interfaz PublicacionResponse
import { PublicacionService, PublicacionResponse } from '../../services/publicacion/publicacion-service';
import { FichaDetalleComponent } from '../../components/ficha-detalle/ficha-detalle';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pendientes-page',
  standalone: true,
  imports: [CommonModule, FichaDetalleComponent, RouterLink],
  templateUrl: './pendientes-page.html',
  styleUrl: './pendientes-page.css'
})
export class PendientesPage implements OnInit {
  
  // [CORREGIDO] Se utiliza la interfaz tipada y se inicializa como array vacío.
  public publicacionesPendientes: PublicacionResponse[] = [];
  public cargando: boolean = true;
  
  // [CORREGIDO] Declaración de las propiedades para el modal de detalle
  public mostrarFichaDetalle: boolean = false;
  public publicacionSeleccionada: PublicacionResponse | null = null; 

  constructor(private publicacionService: PublicacionService) { }

  ngOnInit(): void {
    this.cargarPublicacionesPendientes();
  }

  /**
   * Carga la lista de publicaciones con estado PENDIENTE desde el backend.
   */
  cargarPublicacionesPendientes(): void {
    this.cargando = true;
    this.publicacionService.getPublicacionesPendientes().subscribe({
      next: (data: PublicacionResponse[]) => {
        // Aseguramos que data es un array de PublicacionResponse
        this.publicacionesPendientes = data; 
        this.cargando = false;
        console.log('Publicaciones pendientes cargadas:', data);
      },
      error: (err: any) => {
        console.error('Error al cargar publicaciones pendientes:', err);
        this.cargando = false;
        alert('Error al cargar publicaciones pendientes. Verifique el rol ADMIN.');
      }
    });
  }
  
  /**
   * Muestra el modal con la ficha técnica de la publicación seleccionada.
   */
  public mostrarFicha(publicacion: PublicacionResponse): void {
    this.publicacionSeleccionada = publicacion;
    this.mostrarFichaDetalle = true;
  }

  /**
   * Cierra el modal de la ficha técnica.
   */
  public cerrarFicha(): void {
    this.mostrarFichaDetalle = false;
    this.publicacionSeleccionada = null;
  }

  /**
   * Aprueba la publicación, la publica y refresca la lista.
   */
  aprobar(id: number): void {
    // Usamos confirm() temporalmente, pero se recomienda usar un modal
    if (!confirm('¿Está seguro de que desea APROBAR esta publicación?')) { 
      return;
    }
    this.publicacionService.aprobarPublicacion(id).subscribe({
      next: () => {
        alert('Publicación aprobada y publicada con éxito.');
        this.cargarPublicacionesPendientes(); // Recarga la lista
      },
      error: (err: any) => {
        console.error('Error al aprobar la publicación:', err);
        alert('Error al aprobar la publicación.');
      }
    });
  }

  /**
   * Rechaza la publicación (la elimina) y refresca la lista.
   */
  rechazar(id: number): void {
    // Usamos confirm() temporalmente, pero se recomienda usar un modal
    if (!confirm('¿Está seguro de que desea RECHAZAR y ELIMINAR esta publicación?')) {
      return;
    }
    this.publicacionService.rechazarPublicacion(id).subscribe({
      next: () => {
        alert('Publicación rechazada y eliminada.');
        this.cargarPublicacionesPendientes(); // Recarga la lista
      },
      error: (err: any) => {
        console.error('Error al rechazar la publicación:', err);
        alert('Error al rechazar la publicación.');
      }
    });
  }
}