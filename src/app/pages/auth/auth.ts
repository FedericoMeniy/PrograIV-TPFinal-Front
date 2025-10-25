import { Component } from '@angular/core';
// 1. Importa CommonModule y ReactiveFormsModule
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true, 
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {


  isLoginView: boolean = true;


  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });



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