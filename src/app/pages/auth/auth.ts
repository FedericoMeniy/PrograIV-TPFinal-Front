import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group({
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
    // Lógica de inicio de sesión (a futuro)
    console.log('Login:', this.loginForm.value);
  }

  onRegisterSubmit() {
    // Lógica de registro (a futuro)
    console.log('Register:', this.registerForm.value);
  }

}