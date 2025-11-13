// Archivo: src/app/services/auth.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/usuario';
  private storageKey = 'usuarioLogueado';

  constructor(private http: HttpClient) { }

  registrar(datosUsuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, datosUsuario);
  }

  // --- MÉTODO LOGIN MEJORADO ---
  login(credenciales: any): Observable<any> {
    // Usamos 'tap' para "espiar" la respuesta exitosa
    // y guardarla en localStorage automáticamente.
    return this.http.post<any>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(respuesta => {
        // Si la respuesta es válida y tiene un token, la guardamos
        if (respuesta && respuesta.token) {
          this.saveUser(respuesta);
        }
      })
    );
  }

  // 1. Guardar usuario en localStorage
  saveUser(usuario: any) {
    // Esto guarda el objeto completo, ej: { token: "...", id: 1, ... }
    localStorage.setItem(this.storageKey, JSON.stringify(usuario));
  }

  // 2. Obtener usuario desde localStorage
  getUser() {
    const usuarioString = localStorage.getItem(this.storageKey);
    if (usuarioString) {
      try {
        return JSON.parse(usuarioString); // Devuelve el objeto completo
      } catch (e) {
        console.error("Error al parsear 'usuarioLogueado' de localStorage", e);
        this.logout(); // Limpia el localStorage corrupto
        return null;
      }
    }
    return null;
  }

  // 3. Cerrar sesión
  logout() {
    localStorage.removeItem(this.storageKey);
  }

  // 4. Helper MEJORADO para saber si está logueado
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  // --- MÉTODO ARREGLADO (EL MÁS IMPORTANTE) ---
  // 5. Obtener solo el Token para el Interceptor
  getToken(): string | null {
    const usuario = this.getUser(); // Obtiene el objeto completo
    
    // Tu log de consola "Login exitoso" muestra que la propiedad se llama 'token'
    if (usuario && usuario.token) {
      return usuario.token; // Devuelve solo la propiedad 'token'
    }
    
    // La propiedad 'jwt' era incorrecta
    return null;
  }
  // --- FIN MÉTODO ARREGLADO ---
  
  /**
   * 6. [NUEVO] Verifica si el usuario logueado tiene el rol ADMIN.
   */
  public isAdmin(): boolean {
    const usuario = this.getUser();
    // Verifica si el usuario existe y si su rol es 'ADMIN'
    return usuario && usuario.rol === 'ADMIN'; 
  }

  // 1. Llama al endpoint PUT del backend
  actualizarNombre(id: number, nuevoNombre: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    const body = { nombre: nuevoNombre };
    return this.http.put(url, body);
  }

  // 2. Actualiza el usuario en localStorage
  updateLocalUser(usuarioActualizado: any) {
    let usuarioGuardado = this.getUser();
    if (usuarioGuardado) {
      // Combina el usuario guardado con los nuevos datos
      const usuarioCombinado = { ...usuarioGuardado, ...usuarioActualizado };
      this.saveUser(usuarioCombinado);
    }
  }
}