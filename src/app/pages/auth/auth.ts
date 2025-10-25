import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth'; // 1. IMPORTAR EL SERVICIO

@Component({
  selector: 'app-auth',
  standalone: true,
  
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {

  isLoginView: boolean = true;
  loginForm;
  registerForm;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService // 2. INYECTAR EL SERVICIO
  ) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]], 
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  showLogin() {
    this.isLoginView = true;
  }

  showRegister() {
    this.isLoginView = false;
  }

  onLoginSubmit() {
    console.log('Login:', this.loginForm.value);
  }

  onRegisterSubmit() {
    if (this.registerForm.invalid) {
      console.error('Formulario inválido.');
      return; // Detener si el formulario no es válido
    }

    // Opcional: Validar que las contraseñas coincidan en el front
    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      console.error('Las contraseñas no coinciden.');
      // Aquí podrías mostrar un error al usuario
      return;
    }

    // Crear el objeto de datos que espera el backend (sin confirmPassword)
    const datosRegistro = {
      nombre: this.registerForm.value.nombre,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    // 4. LLAMAR AL SERVICIO
    this.authService.registrar(datosRegistro).subscribe({
      next: (respuesta) => {
        // Éxito
        console.log('Usuario registrado exitosamente:', respuesta);
        // Opcional: redirigir al login
        this.showLogin(); 
      },
      error: (error) => {
    
        console.error('Error al registrar usuario:', error);

        alert(`Error: ${error.error}`); 
      }
    });
  }

}