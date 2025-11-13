import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { PublicacionService, PublicacionRequest, PublicacionResponse } from '../../services/publicacion/publicacion-service';
import { FichaDetalleComponent } from '../../components/ficha-detalle/ficha-detalle'; // [EXISTENTE, PERO IMPORTANTE]

@Component({
  selector: 'app-usados-page',
  standalone: true, 
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule, FichaDetalleComponent], // [CORREGIDO] Añadido FichaDetalleComponent
  templateUrl: './usados-page.html',
  styleUrl: './usados-page.css'
})
export class UsadosPage implements OnInit {

  // --- Propiedades para el Formulario ---
  isUserLoggedIn: boolean = true; // Asumimos que el usuario está logueado
  mostrarFormulario: boolean = false;
  publicacionForm!: FormGroup; 

  tiposCombustible: string[] = ['Nafta', 'Diesel', 'GNC', 'Híbrido', 'Eléctrico'];
  tiposCaja: string[] = ['Manual', 'Automática'];

  // --- NUEVAS PROPIEDADES PARA ARCHIVOS ---
  public selectedFiles: File[] = [];
  public imagePreviews: string[] = []; // Para las previsualizaciones

  // --- Propiedades para Visualizar el Inventario ---
  public publicacionesUsados: PublicacionResponse[] = [];
  public publicacionesUsadosMostradas: PublicacionResponse[] = [];
  public cargandoUsados: boolean = true;
  public mostrarBuscador: boolean = false;
  public terminoBusqueda: string = '';
  
  // [NUEVO] Propiedades para el modal de detalle
  public mostrarFichaDetalle: boolean = false;
  public publicacionSeleccionada: PublicacionResponse | null = null;

  // Inyectamos FormBuilder y nuestro servicio
  constructor(
    private fb: FormBuilder,
    private publicacionService: PublicacionService
  ) { }

  ngOnInit(): void {
    // 1. Define la estructura del formulario (coincidiendo con los DTOs)
    this.publicacionForm = this.fb.group({
      descripcion: ['', Validators.required],
      auto: this.fb.group({
        marca: ['', Validators.required], 
        modelo: ['', Validators.required],
        precio: [null, [Validators.required, Validators.min(0)]],
        anio: [null, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
        km: ['', Validators.required],
        color: ['', Validators.required],
        fichaTecnica: this.fb.group({
          motor: ['', Validators.required],
          combustible: ['', Validators.required],
          caja: ['', Validators.required],
          puertas: ['', Validators.required], 
          potencia: ['', Validators.required]
        })
      })
    });
    
    // 2. Carga el inventario de autos usados al iniciar la página
    this.cargarPublicacionesUsados();
  }

  /**
   * Obtiene la lista de autos usados desde el backend
   */
  cargarPublicacionesUsados(): void {
    this.cargandoUsados = true;
    this.publicacionService.getCatalogoUsados().subscribe({
      next: (data) => {
        this.publicacionesUsados = data;
        this.publicacionesUsadosMostradas = data;
        this.cargandoUsados = false;
        console.log('Publicaciones de usados cargadas:', data);
      },
      error: (err) => {
        console.error('Error al cargar publicaciones de usados:', err);
        this.cargandoUsados = false;
        alert('No se pudo cargar el inventario de usados.');
      }
    });
  }

  /**
   * Muestra u oculta el formulario de creación
   */
  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }
  
  // [NUEVO] Muestra el modal de la ficha técnica
  public mostrarFicha(publicacion: PublicacionResponse): void {
    this.publicacionSeleccionada = publicacion;
    this.mostrarFichaDetalle = true;
  }

  // [NUEVO] Cierra el modal de la ficha técnica
  public cerrarFicha(): void {
    this.mostrarFichaDetalle = false;
    this.publicacionSeleccionada = null;
  }

  /**
   * Habilita el buscador
   */
  public onBuscarClick(event: Event): void {
    event.preventDefault();
    this.mostrarBuscador = true;
  }

  /**
   * Filtra el listado de publicaciones de usados
   */
  public onBusquedaSubmit(): void {
    if (!this.terminoBusqueda) {
      this.publicacionesUsadosMostradas = this.publicacionesUsados;
      return;
    }

    const termino = this.terminoBusqueda.toLowerCase();
    this.publicacionesUsadosMostradas = this.publicacionesUsados.filter(publi =>
      (publi.descripcion && publi.descripcion.toLowerCase().includes(termino)) ||
      (publi.auto.marca && publi.auto.marca.toLowerCase().includes(termino)) ||
      (publi.auto.modelo && publi.auto.modelo.toLowerCase().includes(termino)) ||
      (publi.nombreVendedor && publi.nombreVendedor.toLowerCase().includes(termino))
    );
  }

  // --- NUEVO MÉTODO ---
  /**
   * Se ejecuta cuando el usuario selecciona archivos en el input
   */
  onFileSelected(event: any): void {
    // Convierte el FileList a un Array de Files
    this.selectedFiles = Array.from(event.target.files);
    
    // Generar previsualizaciones
    this.imagePreviews = [];
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      return; // No hay nada que previsualizar
    }

    for (const file of this.selectedFiles) {
      const reader = new FileReader();
      // Cuando el archivo se lee...
      reader.onload = (e: any) => {
        // Añade el resultado (URL en base64) al array de previsualizaciones
        this.imagePreviews.push(e.target.result);
      };
      // Lee el archivo como una Data URL
      reader.readAsDataURL(file);
    }
  }


  // --- MÉTODO MODIFICADO ---
  /**
   * Envía el formulario para crear una nueva publicación de usado
   */
  crearPublicacion(): void {
    if (this.publicacionForm.valid) {
      
      // 1. El DTO de solicitud se arma con los valores del formulario
      // (Eliminamos 'tipoPublicacion', el backend lo asigna según el rol)
      const datosAEnviar: PublicacionRequest = this.publicacionForm.value;
      
      console.log('Enviando datos:', datosAEnviar);
      console.log('Enviando archivos:', this.selectedFiles);

      // 2. Se llama al servicio modificado, pasando el DTO y los archivos
      this.publicacionService.crearPublicacion(datosAEnviar, this.selectedFiles).subscribe({
        next: (respuesta) => {
          console.log('Publicación creada con éxito:', respuesta);
          alert('¡Publicación creada con éxito! Quedará pendiente de aprobación.');
          
          // Resetea el formulario y los archivos
          this.publicacionForm.reset();
          this.selectedFiles = [];
          this.imagePreviews = [];
          this.mostrarFormulario = false;
          
          // Opcional: Recargar la lista. 
          // Nota: La nueva publicación no aparecerá hasta que sea APROBADA.
          // this.cargarPublicacionesUsados(); 
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al crear la publicación:', error.message);
          alert(`Error al crear la publicación: ${error.message}`);
        }
      });
      
    } else {
      console.log('Formulario inválido. Revise los campos.');
      this.publicacionForm.markAllAsTouched(); // Muestra errores de validación
    }
  }

  // --- Getters para facilitar acceso en el template (opcional) ---
  get autoForm() {
    return this.publicacionForm.get('auto') as FormGroup;
  }

  get fichaTecnicaForm() {
    return this.autoForm.get('fichaTecnica') as FormGroup;
  }
}