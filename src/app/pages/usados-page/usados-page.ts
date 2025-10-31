import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { PublicacionService, PublicacionRequest } from '../../services/publicacion-service';

@Component({
  selector: 'app-usados-page',
  // Se añade CommonModule (para @if) y HttpClientModule (para el servicio)
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule], 
  templateUrl: './usados-page.html',
  styleUrl: './usados-page.css'
})
export class UsadosPage implements OnInit {

  isUserLoggedIn: boolean = true; 
  mostrarFormulario: boolean = false;
  publicacionForm!: FormGroup; 

  tiposCombustible: string[] = ['Nafta', 'Diesel', 'GNC', 'Híbrido', 'Eléctrico'];
  tiposCaja: string[] = ['Manual', 'Automática'];

  // Inyectamos FormBuilder y nuestro nuevo servicio
  constructor(
    private fb: FormBuilder,
    private publicacionService: PublicacionService
  ) { }

  ngOnInit(): void {
    this.publicacionForm = this.fb.group({
      descripcion: ['', Validators.required],
      auto: this.fb.group({
        nombre: ['', Validators.required],
        modelo: ['', Validators.required],
        precio: [null, [Validators.required, Validators.min(0)]],
        anio: [null, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
        km: ['', Validators.required],
        color: ['', Validators.required],
        fichaTecnica: this.fb.group({
          motor: ['', Validators.required],
          combustible: ['', Validators.required],
          caja: ['', Validators.required],
          puertas: ['', [Validators.required, Validators.min(2)]],
          potencia: ['', Validators.required]
        })
      })
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  /**
   * Método actualizado para llamar al servicio
   */
  crearPublicacion(): void {
    if (this.publicacionForm.valid) {
      
      // Creamos el DTO con la estructura definida en el servicio
      // El valor del formulario (this.publicacionForm.value) ya coincide con AutoRequest y Descripcion
      const datosAEnviar: PublicacionRequest = {
        ...this.publicacionForm.value,
        tipoPublicacion: 'VENTA' // Se agrega el valor por defecto
      };
      
      console.log('Enviando datos:', datosAEnviar);

      this.publicacionService.crearPublicacion(datosAEnviar).subscribe({
        next: (respuesta) => {
          console.log('Publicación creada con éxito:', respuesta);
          alert('¡Publicación creada con éxito!');
          this.publicacionForm.reset();
          this.mostrarFormulario = false;
          // Aquí podrías agregar lógica para recargar las publicaciones
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

  // --- Getters para facilitar acceso en el template (si fuera necesario) ---
  get autoForm() {
    return this.publicacionForm.get('auto') as FormGroup;
  }

  get fichaTecnicaForm() {
    return this.autoForm.get('fichaTecnica') as FormGroup;
  }
}