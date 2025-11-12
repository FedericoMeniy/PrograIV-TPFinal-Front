import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'; 
import { FormsModule } from '@angular/forms'; 
// 1. Importa el servicio y la interfaz de respuesta
import { PublicacionService, PublicacionResponse } from '../../services/publicacion/publicacion-service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FormsModule, CommonModule], // Se añade FormsModule y CommonModule
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePageComponent implements OnInit { 

  public mostrarBuscador: boolean = false;
  public terminoBusqueda: string = ''; // Propiedad para vincular al input
  public cargando: boolean = true; // Estado para mostrar un spinner o mensaje

  // Esta es la lista "maestra" que viene del backend
  public publicaciones: PublicacionResponse[] = [];
  
  // Esta es la lista que se filtra y se muestra en el template
  public publicacionesMostradas: PublicacionResponse[] = [];

  // 2. Inyecta el PublicacionService en el constructor
  constructor(private publicacionService: PublicacionService) {}

  ngOnInit(): void {
    // 3. Al iniciar, llama al método para cargar las publicaciones
    this.cargarPublicacionesTienda();
  }

  /**
   * Carga el catálogo de la tienda (inventario principal) desde el servicio
   */
  cargarPublicacionesTienda(): void {
    this.cargando = true;
    this.publicacionService.getCatalogoTienda().subscribe({
      next: (data) => {
        this.publicaciones = data; // Guarda la lista maestra
        this.publicacionesMostradas = data; // Inicializa la lista mostrada
        this.cargando = false;
        console.log('Publicaciones de la tienda cargadas:', this.publicaciones);
      },
      error: (err) => {
        console.error('Error al cargar publicaciones de la tienda:', err);
        this.cargando = false;
        alert('No se pudo cargar el inventario. Intente más tarde.');
      }
    });
  }

  /**
   * Muestra el campo de búsqueda
   */
  public onBuscarClick(event: Event): void {
    event.preventDefault();
    this.mostrarBuscador = true;
  }

  /**
   * Filtra las publicaciones mostradas según el término de búsqueda
   */
  public onBusquedaSubmit(): void {
    // Si no hay término de búsqueda, mostrar todo
    if (!this.terminoBusqueda) {
      this.publicacionesMostradas = this.publicaciones;
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase();

    // Lógica de filtrado (basada en las propiedades de PublicacionResponse)
    this.publicacionesMostradas = this.publicaciones.filter(publi =>
      (publi.descripcion && publi.descripcion.toLowerCase().includes(termino)) ||
      (publi.auto.marca && publi.auto.marca.toLowerCase().includes(termino)) || 
      (publi.auto.modelo && publi.auto.modelo.toLowerCase().includes(termino))
    );
  }
}