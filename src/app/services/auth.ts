import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }

  // 1. Guardar usuario en localStorage
  saveUser(usuario: any) {
    // Esto guarda el objeto completo, ej: { jwt: "...", id: 1, ... }
    localStorage.setItem(this.storageKey, JSON.stringify(usuario));
  }

  // 2. Obtener usuario desde localStorage
  getUser() {
    const usuarioString = localStorage.getItem(this.storageKey);
    if (usuarioString) {
      return JSON.parse(usuarioString); // Devuelve el objeto completo
    }
    return null;
  }

  // 3. Cerrar sesión
  logout() {
    localStorage.removeItem(this.storageKey);
  }

  // 4. Helper MEJORADO para saber si está logueado
  isLoggedIn(): boolean {
    // Es más robusto comprobar si existe un token
    return this.getToken() !== null;
  }

  // --- MÉTODO NUEVO Y NECESARIO ---
  // 5. Obtener solo el Token para el Interceptor
  getToken(): string | null {
    const usuario = this.getUser(); // Obtiene el objeto completo
    // Tu backend devuelve un objeto con la propiedad 'jwt'
    if (usuario && usuario.jwt) {
      return usuario.jwt; // Devuelve solo la propiedad 'jwt'
    }
    return null;
  }
  // --- FIN MÉTODO NUEVO ---


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
      const usuarioCombinado = { ...usuarioGuardado, ...usuarioActualizado };
      this.saveUser(usuarioCombinado);
    }
  }
}
