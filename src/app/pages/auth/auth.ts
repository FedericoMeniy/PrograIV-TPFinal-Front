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
      telefono: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15), Validators.pattern(/^[0-9+\-\s()]+$/)]],
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
        this.router.navigate(['/inicio']);

      },
      error: (error) => {
        const mensajeError = error.error ? error.error : 'Error desconocido. Intente de nuevo.';
        alert(`Error: ${mensajeError}`);
      }
    });
  }

  onRegisterSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.registerForm.get('confirmPassword')?.setErrors({ noCoincide: true });
      return;
    }

    const datosRegistro = {
      nombre: (this.registerForm.value.nombre || '').trim(),
      email: (this.registerForm.value.email || '').trim().toLowerCase(),
      password: this.registerForm.value.password || '',
      telefono: (this.registerForm.value.telefono || '').trim(), 
      rol: 'USER' 
    };

    this.authService.registrar(datosRegistro).subscribe({
      next: (respuesta) => {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        this.showLogin();
      },
      error: (error) => {
        let mensajeError = error.error ? error.error : 'Error desconocido.';
        if (error.status === 409) {
          mensajeError = 'El email ya está registrado. Intente con otro.';
        }
        alert(`Error: ${mensajeError}`);
      }
    });
  }

  
}