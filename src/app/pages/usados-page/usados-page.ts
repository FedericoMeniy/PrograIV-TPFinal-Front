import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { PublicacionService, PublicacionRequest, PublicacionResponse, getImageUrl } from '../../services/publicacion/publicacion-service';
import { FichaDetalleComponent } from '../../components/ficha-detalle/ficha-detalle';
import { AuthService } from '../../services/auth/auth';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-usados-page',
  standalone: true, 
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule, FichaDetalleComponent],
  templateUrl: './usados-page.html',
  styleUrl: './usados-page.css'
})
export class UsadosPage implements OnInit {

  isUserLoggedIn: boolean = false;
  public esAdmin: boolean = false;
  mostrarFormulario: boolean = false;
  publicacionForm!: FormGroup; 

  tiposCombustible: string[] = ['Nafta', 'Diesel', 'GNC', 'Híbrido', 'Eléctrico'];
  tiposCaja: string[] = ['Manual', 'Automática'];
  tiposPuerta: number[] = [2,3,4,5];

  public selectedFiles: File[] = [];
  public imagePreviews: string[] = [];
  public publicacionesUsados: PublicacionResponse[] = [];
  public publicacionesUsadosMostradas: PublicacionResponse[] = [];
  public cargandoUsados: boolean = true;
  public terminoBusqueda: string = '';
  
  public mostrarFichaDetalle: boolean = false;
  public publicacionSeleccionada: PublicacionResponse | null = null;

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
    private fb: FormBuilder,
    private publicacionService: PublicacionService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.esAdmin = this.authService.isAdmin();

    this.route.queryParamMap.subscribe(params => {
      if (params.get('abrirFormulario') === '1') {
        this.mostrarFormulario = true;
      }
    });

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
    this.cargarPublicacionesUsados();
  }

  get descripcion(): AbstractControl | null{
    return this.publicacionForm.get('descripcion')
  }

  get marca(): AbstractControl | null{
    return this.autoForm.get('marca')
  }

  get modelo(): AbstractControl | null{
    return this.autoForm.get('modelo')
  }

  get precio(): AbstractControl | null{
    return this.autoForm.get('precio')
  }

  get anio(): AbstractControl | null{
    return this.autoForm.get('anio')
  }

  get km(): AbstractControl | null{
    return this.autoForm.get('km')
  }

  get color(): AbstractControl | null{
    return this.autoForm.get('color')
  }

  get motor(): AbstractControl | null{
    return this.fichaTecnicaForm.get('motor')
  }

  get potencia(): AbstractControl | null{
    return this.fichaTecnicaForm.get('potencia')
  }

  get autoForm() {
    return this.publicacionForm.get('auto') as FormGroup;
  }

  get fichaTecnicaForm() {
    return this.autoForm.get('fichaTecnica') as FormGroup;
  }
  cargarPublicacionesUsados(): void {
    this.cargandoUsados = true;
    this.publicacionService.getCatalogoUsados().subscribe({
      next: (data) => {
        this.publicacionesUsados = data;
        this.cargandoUsados = false;
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
        this.cargandoUsados = false;
        alert('No se pudo cargar el inventario de usados.');
      }
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }
  public mostrarFicha(publicacion: PublicacionResponse): void {
    this.publicacionSeleccionada = publicacion;
    this.mostrarFichaDetalle = true;
  }

  public cerrarFicha(): void {
    this.mostrarFichaDetalle = false;
    this.publicacionSeleccionada = null;
  }

  public aplicarFiltros(): void {
    let resultados = [...this.publicacionesUsados];

    if (this.terminoBusqueda) {
      const termino = this.terminoBusqueda.toLowerCase();
      resultados = resultados.filter(publi =>
        (publi.descripcion && publi.descripcion.toLowerCase().includes(termino)) ||
        (publi.auto.marca && publi.auto.marca.toLowerCase().includes(termino)) ||
        (publi.auto.modelo && publi.auto.modelo.toLowerCase().includes(termino)) ||
        (publi.nombreVendedor && publi.nombreVendedor.toLowerCase().includes(termino))
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

    this.publicacionesUsadosMostradas = resultados;
  }
  
  public cambiarOrdenPrecio(): void {
    if (this.ordenPrecio === null) {
      this.ordenPrecio = 'asc';
    } else if (this.ordenPrecio === 'asc') {
      this.ordenPrecio = 'desc';
    } else {
      this.ordenPrecio = null;
    }
    this.aplicarFiltros();
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

  public onBusquedaSubmit(): void {
    this.aplicarFiltros();
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
    this.imagePreviews = [];
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      return;
    }

    for (const file of this.selectedFiles) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
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
          // Mensaje diferente para admin (las publicaciones de admin se aprueban automáticamente)
          const mensajeExito = this.esAdmin 
            ? '¡Publicación creada con éxito!'
            : '¡Publicación creada con éxito! Quedará pendiente de aprobación.';
          
          this.notificationService.success(mensajeExito);
          this.publicacionForm.reset();
          this.selectedFiles = [];
          this.imagePreviews = [];
          this.mostrarFormulario = false;
          // Recargar las publicaciones para mostrar la nueva
          this.cargarPublicacionesUsados();
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

  public getImageUrl = getImageUrl;
}