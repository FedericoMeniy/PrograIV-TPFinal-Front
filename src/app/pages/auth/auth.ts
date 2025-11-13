import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth';
import { Router } from '@angular/router';

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
    private authService: AuthService,
    private router: Router,
  ) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      // 1. AÑADIMOS EL CAMPO TELEFONO AL FORMULARIO
      telefono: ['', [Validators.required, Validators.minLength(8)]], // Puedes ajustar las validaciones
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
    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (respuesta) => {
        console.log('Login exitoso:', respuesta);
        this.router.navigate(['/perfil']);

      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        // Es mejor mostrar el error.error si existe
        const mensajeError = error.error ? error.error : 'Error desconocido. Intente de nuevo.';
        alert(`Error: ${mensajeError}`);
      }
    });
  }

  onRegisterSubmit() {
    if (this.registerForm.invalid) {
      console.error('Formulario inválido.');
      // Opcional: marcar todos los campos como "tocados" para mostrar errores
      this.registerForm.markAllAsTouched();
      return; // Detener si el formulario no es válido
    }

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      console.error('Las contraseñas no coinciden.');
      // Podrías setear un error específico en el control 'confirmPassword'
      this.registerForm.get('confirmPassword')?.setErrors({ noCoincide: true });
      return;
    }

    // 2. CREAR EL OBJETO COMPLETO QUE EL BACKEND ESPERA
    const datosRegistro = {
      nombre: this.registerForm.value.nombre,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      telefono: this.registerForm.value.telefono, 
      rol: 'USER' 
    };

    // 4. LLAMAR AL SERVICIO
    this.authService.registrar(datosRegistro).subscribe({
      next: (respuesta) => {
        // Éxito
        console.log('Usuario registrado exitosamente:', respuesta);
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.'); // Avisar al usuario
        this.showLogin();
      },
      error: (error) => {

        console.error('Error al registrar usuario:', error);
        let mensajeError = error.error ? error.error : 'Error desconocido.';
        if (error.status === 409) {
          mensajeError = 'El email ya está registrado. Intente con otro.';
        }
        
        alert(`Error: ${mensajeError}`);
      }
    });

    
  }

  
}