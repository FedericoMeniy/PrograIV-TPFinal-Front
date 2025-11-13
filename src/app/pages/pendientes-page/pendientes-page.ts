import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importamos PublicacionService y la Interfaz PublicacionResponse
import { PublicacionService, PublicacionResponse, PublicacionEstadisticaResponse } from '../../services/publicacion/publicacion-service';
import { FichaDetalleComponent } from '../../components/ficha-detalle/ficha-detalle';
import { RouterLink } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-pendientes-page',
  standalone: true,
  imports: [CommonModule, FichaDetalleComponent, RouterLink],
  templateUrl: './pendientes-page.html',
  styleUrl: './pendientes-page.css'
})
export class PendientesPage implements OnInit, AfterViewInit, OnDestroy {
  
  // [CORREGIDO] Se utiliza la interfaz tipada y se inicializa como array vacío.
  public publicacionesPendientes: PublicacionResponse[] = [];
  public cargando: boolean = true;
  public resumen: PublicacionEstadisticaResponse = {
    aceptadas: 0,
    rechazadas: 0,
    pendientes: 0
  };

  @ViewChild('estadoChart') estadoChartRef?: ElementRef<HTMLCanvasElement>;
  private estadoChart?: Chart;
  
  // [CORREGIDO] Declaración de las propiedades para el modal de detalle
  public mostrarFichaDetalle: boolean = false;
  public publicacionSeleccionada: PublicacionResponse | null = null; 

  constructor(private publicacionService: PublicacionService) { }

  ngOnInit(): void {
    this.cargarPublicacionesPendientes();
    this.cargarResumenEstados();
  }

  ngAfterViewInit(): void {
    this.actualizarGrafico();
  }

  ngOnDestroy(): void {
    this.estadoChart?.destroy();
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

  cargarResumenEstados(): void {
    this.publicacionService.getResumenPublicaciones().subscribe({
      next: (data) => {
        this.resumen = data;
        this.actualizarGrafico();
      },
      error: (err) => {
        console.error('Error al obtener las estadísticas de publicaciones:', err);
      }
    });
  }

  actualizarGrafico(): void {
    if (!this.estadoChartRef) {
      return;
    }

    const datos = [this.resumen.aceptadas, this.resumen.rechazadas, this.resumen.pendientes];
    const etiquetas = ['Aceptadas', 'Rechazadas', 'Pendientes'];

    if (this.estadoChart) {
      this.estadoChart.data.labels = etiquetas;
      this.estadoChart.data.datasets[0].data = datos;
      this.estadoChart.update();
      return;
    }

    this.estadoChart = new Chart(this.estadoChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: etiquetas,
        datasets: [
          {
            data: datos,
            backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
            borderColor: ['#1e7e34', '#c82333', '#e0a800'],
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const cantidad = tooltipItem.raw as number;
                const dataset = tooltipItem.dataset;
                const totalActual = (dataset.data as number[]).reduce((acc, val) => acc + val, 0);
                const porcentaje = totalActual > 0 ? ((cantidad / totalActual) * 100).toFixed(1) : '0';
                return `${tooltipItem.label}: ${cantidad} (${porcentaje}%)`;
              }
            }
          }
        }
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
        this.cargarResumenEstados();
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
        this.cargarResumenEstados();
      },
      error: (err: any) => {
        console.error('Error al rechazar la publicación:', err);
        alert('Error al rechazar la publicación.');
      }
    });
  }
}