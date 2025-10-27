// Contenido para: src/app/pages/profile/profile.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // 1. IMPORTAR
import { AuthService } from '../../services/auth'; // 2. IMPORTAR
import { Router } from '@angular/router'; // 3. IMPORTAR
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true, // 4. HACER STANDALONE
  imports: [CommonModule, ReactiveFormsModule], // 5. AÑADIR IMPORTS
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit { // 6. IMPLEMENTAR OnInit

  usuario: any = null; // 7. Propiedad para guardar el usuario
  isEditing: boolean = false; // 3. Variable para modo edición
  editForm: FormGroup; // 4. El formulario

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder // 5. Inyectar FormBuilder
  ) {
    // Inicializar el formulario (vacío al principio)
    this.editForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  // 8. ngOnInit se ejecuta cuando el componente carga
  ngOnInit(): void {
    this.usuario = this.authService.getUser();

    // Si no hay usuario guardado, lo echamos al login
    if (!this.usuario) {
      this.router.navigate(['/login']); // O a la ruta de login que definiste
    } else {
      // 6. Asignar el valor del usuario al formulario
      this.editForm.patchValue({
        nombre: this.usuario.nombre
      });
    }
  }

  // 9. Método para cerrar sesión
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // O a la ruta de inicio
  }

  // 7. Activa/desactiva el modo edición
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    // Si cancelamos, resetea el formulario al valor original
    if (!this.isEditing) {
      this.editForm.reset({
        nombre: this.usuario.nombre
      });
    }
  }

  // 8. Se llama al guardar el formulario
  onSave(): void {
    if (this.editForm.invalid) {
      return; // No hacer nada si el formulario no es válido
    }

    const nuevoNombre = this.editForm.value.nombre;
    const usuarioId = this.usuario.id;

    this.authService.actualizarNombre(usuarioId, nuevoNombre).subscribe({
      next: (usuarioActualizado) => {
        // 1. Actualizar el localStorage
        this.authService.updateLocalUser(usuarioActualizado);
        
        // 2. Actualizar la vista (this.usuario)
        this.usuario = this.authService.getUser();
        
        // 3. Salir del modo edición
        this.isEditing = false;
        
        alert('¡Nombre actualizado con éxito!');
      },
      error: (err) => {
        console.error('Error al actualizar el nombre:', err);
        alert('Error: ' + err.error);
      }
    });
  }
}