import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { PublicacionService, PublicacionRequest, PublicacionResponse } from '../../services/publicacion-service';

@Component({
  selector: 'app-usados-page',
  standalone: true, // Asumiendo que es standalone basado en tus otros componentes
  // Se añade CommonModule (para *ngIf/*ngFor) y ReactiveFormsModule (para el form)
  // HttpClientModule debe proveerse en app.config.ts (o aquí si es necesario)
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule], 
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

  // --- Propiedades para Visualizar el Inventario ---
  public publicacionesUsados: PublicacionResponse[] = [];
  public cargandoUsados: boolean = true;

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
        marca: ['', Validators.required], // Corregido: 'marca' en lugar de 'nombre'
        modelo: ['', Validators.required],
        precio: [null, [Validators.required, Validators.min(0)]],
        anio: [null, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
        km: ['', Validators.required],
        color: ['', Validators.required],
        fichaTecnica: this.fb.group({
          motor: ['', Validators.required],
          combustible: ['', Validators.required],
          caja: ['', Validators.required],
          puertas: ['', Validators.required], // Corregido: Es un String según el DTO
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

  /**
   * Envía el formulario para crear una nueva publicación de usado
   */
  crearPublicacion(): void {
    if (this.publicacionForm.valid) {
      
      // El DTO de solicitud se arma con los valores del formulario
      const datosAEnviar: PublicacionRequest = {
        ...this.publicacionForm.value,
        tipoPublicacion: 'VENTA' // Se agrega el valor por defecto para usados
      };
      
      console.log('Enviando datos:', datosAEnviar);

      this.publicacionService.crearPublicacion(datosAEnviar).subscribe({
        next: (respuesta) => {
          console.log('Publicación creada con éxito:', respuesta);
          alert('¡Publicación creada con éxito!');
          this.publicacionForm.reset();
          this.mostrarFormulario = false;
          
          // ¡Importante! Recarga la lista de usados para mostrar el nuevo auto
          this.cargarPublicacionesUsados(); 
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