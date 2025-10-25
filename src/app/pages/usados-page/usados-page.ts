import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-usados-page',
  imports: [ReactiveFormsModule], 
  templateUrl: './usados-page.html',
  styleUrl: './usados-page.css'
})
export class UsadosPage implements OnInit {

  isUserLoggedIn: boolean = true; 
  mostrarFormulario: boolean = false;
  publicacionForm!: FormGroup; 

  // --- tiposPublicacion eliminado ---
  
  tiposCombustible: string[] = ['Nafta', 'Diesel', 'GNC', 'Híbrido', 'Eléctrico'];
  tiposCaja: string[] = ['Manual', 'Automática'];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.publicacionForm = this.fb.group({
      // --- tipoPublicacion eliminado ---
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

  crearPublicacion(): void {
    if (this.publicacionForm.valid) {
      console.log('Formulario válido. Enviando datos:');
      // Creamos el valor final, asumiendo 'VENTA'
      const datosAEnviar = {
        ...this.publicacionForm.value,
        tipoPublicacion: 'VENTA' // Se agrega el valor por defecto
      };
      console.log(datosAEnviar);
      
    } else {
      console.log('Formulario inválido. Revise los campos.');
      this.publicacionForm.markAllAsTouched();
    }
  }

  get autoForm() {
    return this.publicacionForm.get('auto') as FormGroup;
  }

  get fichaTecnicaForm() {
    return this.autoForm.get('fichaTecnica') as FormGroup;
  }
}