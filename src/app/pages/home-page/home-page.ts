import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';
import { PublicacionService, PublicacionResponse, getImageUrl } from '../../services/publicacion/publicacion-service';
import { FichaDetalleComponent } from '../../components/ficha-detalle/ficha-detalle';
import { ModalReservaComponent } from '../../components/modal-reserva/modal-reserva';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FormsModule, CommonModule, FichaDetalleComponent, ModalReservaComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePageComponent implements OnInit {

  public mostrarBuscador: boolean = false;
  public terminoBusqueda: string = '';
  public cargando: boolean = true;
  public isAdmin: boolean = false;

  public publicaciones: PublicacionResponse[] = [];
  public publicacionesMostradas: PublicacionResponse[] = [];
  public publicacionSeleccionada: PublicacionResponse | null = null;
  public publicacionParaReservar: PublicacionResponse | null = null;

  constructor(
    private publicacionService: PublicacionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.cargarPublicacionesTienda();
  }

  cargarPublicacionesTienda(): void {
    this.cargando = true;
    this.publicacionService.getCatalogoTienda().subscribe({
      next: (data) => {
        this.publicaciones = data;
        this.publicacionesMostradas = data;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        alert('No se pudo cargar el inventario. Intente más tarde.');
      }
    });
  }

  public onBuscarClick(event: Event): void {
    event.preventDefault();
    this.mostrarBuscador = true;
  }

  public onBusquedaSubmit(): void {
    if (!this.terminoBusqueda) {
      this.publicacionesMostradas = this.publicaciones;
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase();

    this.publicacionesMostradas = this.publicaciones.filter(publi =>
      (publi.descripcion && publi.descripcion.toLowerCase().includes(termino)) ||
      (publi.auto.marca && publi.auto.marca.toLowerCase().includes(termino)) ||
      (publi.auto.modelo && publi.auto.modelo.toLowerCase().includes(termino))
    );
  }

  public onVerFicha(event: Event, publi: PublicacionResponse): void {
    event.preventDefault();
    event.stopPropagation();
    this.publicacionSeleccionada = publi;
  }

  public onCerrarModal(): void {
    this.publicacionSeleccionada = null;
  }

  public onCrearPublicacionClick(): void {
    this.router.navigate(['/usados'], { queryParams: { abrirFormulario: '1' } });
  }

  public onReservarClick(publicacion: PublicacionResponse): void {
    this.publicacionSeleccionada = null; // Cerrar ficha-detalle
    this.publicacionParaReservar = publicacion; // Abrir modal de reserva
  }

  public onCerrarModalReserva(): void {
    this.publicacionParaReservar = null;
  }

  public getImageUrl = getImageUrl;
}
