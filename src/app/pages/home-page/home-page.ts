import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';
import { PublicacionService, PublicacionRequest, PublicacionResponse, getImageUrl } from '../../services/publicacion/publicacion-service';
import { FichaDetalleComponent } from '../../components/ficha-detalle/ficha-detalle';
import { ModalReservaComponent } from '../../components/modal-reserva/modal-reserva';
import { NotificationService } from '../../services/notification/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, FichaDetalleComponent, ModalReservaComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePageComponent implements OnInit {

  public mostrarBuscador: boolean = false;
  public terminoBusqueda: string = '';
  public cargando: boolean = true;
  public isAdmin: boolean = false;
  public mostrarFormulario: boolean = false;
  public publicacionForm!: FormGroup;
  
  public tiposCombustible: string[] = ['Nafta', 'Diesel', 'GNC', 'Híbrido', 'Eléctrico'];
  public tiposCaja: string[] = ['Manual', 'Automática'];
  public tiposPuerta: number[] = [2, 3, 4, 5];
  
  public selectedFiles: File[] = [];
  public imagePreviews: string[] = [];

  public publicaciones: PublicacionResponse[] = [];
  public publicacionesMostradas: PublicacionResponse[] = [];
  public publicacionSeleccionada: PublicacionResponse | null = null;
  public publicacionParaReservar: PublicacionResponse | null = null;

  // Filtros

  public filtroPrecioMin: number = 0;
  public filtroPrecioMax: number = 1000000;
  public filtroAnioMin: number = 1885;
  public filtroAnioMax: number = new Date().getFullYear();
  public filtroKmMax: number = 400000;
  
  public precioMinReal: number = 0;
  public precioMaxReal: number = 1000000;
  public anioMinReal: number = 1885;
  public anioMaxReal: number = new Date().getFullYear();
  public kmMaxReal: number = 400000;
  
  public ordenPrecio: 'asc' | 'desc' | null = null;
  
  public filtrosCombustible: string[] = [];
  public filtrosCaja: string[] = [];
  public filtrosPuertas: number[] = [];

  constructor(
    private publicacionService: PublicacionService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.inicializarFormulario();
    this.cargarPublicacionesTienda();
  }

  inicializarFormulario(): void {
    this.publicacionForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      auto: this.fb.group({
        marca: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
        modelo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
        precio: ['', [Validators.required, Validators.min(1), Validators.max(1000000)]],
        anio: ['', [Validators.required, Validators.min(1885), Validators.max(new Date().getFullYear())]],
        km: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(0), Validators.max(400000)]],
        color: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
        fichaTecnica: this.fb.group({
          motor: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/), Validators.min(0.1), Validators.max(6.6)]],
          combustible: ['', Validators.required],
          caja: ['', Validators.required],
          puertas: ['', Validators.required],
          potencia: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(1), Validators.max(400)]]
        })
      })
    });
  }

  get descripcion(): AbstractControl | null {
    return this.publicacionForm.get('descripcion');
  }

  get marca(): AbstractControl | null {
    return this.publicacionForm.get('auto.marca');
  }

  get modelo(): AbstractControl | null {
    return this.publicacionForm.get('auto.modelo');
  }

  get precio(): AbstractControl | null {
    return this.publicacionForm.get('auto.precio');
  }

  get anio(): AbstractControl | null {
    return this.publicacionForm.get('auto.anio');
  }

  get km(): AbstractControl | null {
    return this.publicacionForm.get('auto.km');
  }

  get color(): AbstractControl | null {
    return this.publicacionForm.get('auto.color');
  }

  get motor(): AbstractControl | null {
    return this.publicacionForm.get('auto.fichaTecnica.motor');
  }

  get potencia(): AbstractControl | null {
    return this.publicacionForm.get('auto.fichaTecnica.potencia');
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.publicacionForm.reset();
      this.selectedFiles = [];
      this.imagePreviews = [];
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
      this.imagePreviews = [];
      
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.imagePreviews.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  crearPublicacion(): void {
    if (this.publicacionForm.valid) {
      if (this.selectedFiles.length === 0) {
        this.notificationService.error('Debe seleccionar al menos una imagen.');
        return;
      }

      const datosAEnviar: PublicacionRequest = this.publicacionForm.value;

      this.publicacionService.crearPublicacion(datosAEnviar, this.selectedFiles).subscribe({
        next: (respuesta) => {
          const mensajeExito = this.isAdmin 
            ? '¡Publicación creada con éxito!'
            : '¡Publicación creada con éxito! Quedará pendiente de aprobación.';
          
          this.notificationService.success(mensajeExito);
          this.publicacionForm.reset();
          this.selectedFiles = [];
          this.imagePreviews = [];
          this.mostrarFormulario = false;
          this.cargarPublicacionesTienda();
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.error(`Error al crear la publicación: ${error.message || 'Error desconocido'}`);
        }
      });
    } else {
      this.publicacionForm.markAllAsTouched();
      this.notificationService.error('Por favor, complete todos los campos requeridos correctamente.');
    }
  }

  cargarPublicacionesTienda(): void {
    this.cargando = true;
    this.publicacionService.getCatalogoTienda().subscribe({
      next: (data) => {
        this.publicaciones = data;
        this.cargando = false;
        if (data.length > 0) {
          const precios = data.map(p => p.auto.precio);
          const anios = data.map(p => p.auto.anio);
          const kms = data.map(p => parseInt(p.auto.km.toString().replace(/[^\d]/g, '')) || 0);
          
          this.precioMinReal = 0;
          this.precioMaxReal = Math.min(Math.max(...precios), 1000000);
          this.anioMinReal = 1885;
          this.anioMaxReal = new Date().getFullYear();
          this.kmMaxReal = 400000;
          
          this.filtroPrecioMin = this.precioMinReal;
          this.filtroPrecioMax = this.precioMaxReal;
          this.filtroAnioMin = this.anioMinReal;
          this.filtroAnioMax = this.anioMaxReal;
          this.filtroKmMax = this.kmMaxReal;
        }
        
        this.filtrosCombustible = [];
        this.filtrosCaja = [];
        this.filtrosPuertas = [];
        this.aplicarFiltros();
      },
      error: (err) => {
        this.cargando = false;
        this.notificationService.error('No se pudo cargar el inventario. Intente más tarde.');
      }
    });
  }

  public onBuscarClick(event: Event): void {
    event.preventDefault();
    this.mostrarBuscador = true;
  }

  public onBusquedaSubmit(): void {
    this.aplicarFiltros();
  }

  public aplicarFiltros(): void {
    let resultados = [...this.publicaciones];

    if (this.terminoBusqueda) {
      const termino = this.terminoBusqueda.toLowerCase();
      resultados = resultados.filter(publi =>
        (publi.descripcion && publi.descripcion.toLowerCase().includes(termino)) ||
        (publi.auto.marca && publi.auto.marca.toLowerCase().includes(termino)) ||
        (publi.auto.modelo && publi.auto.modelo.toLowerCase().includes(termino))
      );
    }

    resultados = resultados.filter(publi => 
      publi.auto.precio >= this.filtroPrecioMin && 
      publi.auto.precio <= this.filtroPrecioMax
    );

    resultados = resultados.filter(publi => 
      publi.auto.anio >= this.filtroAnioMin && 
      publi.auto.anio <= this.filtroAnioMax
    );

    resultados = resultados.filter(publi => {
      const km = parseInt(publi.auto.km.toString().replace(/[^\d]/g, '')) || 0;
      return km <= this.filtroKmMax;
    });

    if (this.filtrosCombustible.length > 0) {
      resultados = resultados.filter(publi => 
        publi.auto.fichaTecnica && 
        this.filtrosCombustible.includes(publi.auto.fichaTecnica.combustible)
      );
    }

    if (this.filtrosCaja.length > 0) {
      resultados = resultados.filter(publi => 
        publi.auto.fichaTecnica && 
        this.filtrosCaja.includes(publi.auto.fichaTecnica.caja)
      );
    }

    if (this.filtrosPuertas.length > 0) {
      resultados = resultados.filter(publi => 
        publi.auto.fichaTecnica && 
        this.filtrosPuertas.includes(parseInt(publi.auto.fichaTecnica.puertas, 10))
      );
    }

    if (this.ordenPrecio === 'asc') {
      resultados.sort((a, b) => a.auto.precio - b.auto.precio);
    } else if (this.ordenPrecio === 'desc') {
      resultados.sort((a, b) => b.auto.precio - a.auto.precio);
    }

    this.publicacionesMostradas = resultados;
  }

  public toggleCombustible(combustible: string): void {
    const index = this.filtrosCombustible.indexOf(combustible);
    if (index > -1) {
      this.filtrosCombustible.splice(index, 1);
    } else {
      this.filtrosCombustible.push(combustible);
    }
    this.aplicarFiltros();
  }

  public toggleCaja(caja: string): void {
    const index = this.filtrosCaja.indexOf(caja);
    if (index > -1) {
      this.filtrosCaja.splice(index, 1);
    } else {
      this.filtrosCaja.push(caja);
    }
    this.aplicarFiltros();
  }

  public togglePuertas(puertas: string | number): void {
    const puertasNum = typeof puertas === 'string' ? parseInt(puertas, 10) : puertas;
    const index = this.filtrosPuertas.indexOf(puertasNum);
    if (index > -1) {
      this.filtrosPuertas.splice(index, 1);
    } else {
      this.filtrosPuertas.push(puertasNum);
    }
    this.aplicarFiltros();
  }

  public limpiarFiltros(): void {
    this.filtroPrecioMin = this.precioMinReal;
    this.filtroPrecioMax = this.precioMaxReal;
    this.filtroAnioMin = this.anioMinReal;
    this.filtroAnioMax = this.anioMaxReal;
    this.filtroKmMax = this.kmMaxReal;
    this.filtrosCombustible = [];
    this.filtrosCaja = [];
    this.filtrosPuertas = [];
    this.terminoBusqueda = '';
    this.ordenPrecio = null;
    this.aplicarFiltros();
  }

  public formatearNumero(num: number): string {
    return num.toLocaleString('es-AR');
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
    this.mostrarFormulario = true;
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
