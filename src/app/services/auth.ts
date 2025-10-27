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

  // Aquí también podrías añadir el método de login
  // login(credenciales: any): Observable<any> { ... }

  login(credenciales: any): Observable<any> {
    // Llama al nuevo endpoint del backend
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }

  // 1. Guardar usuario en localStorage
  saveUser(usuario: any) {
    // Convertimos el objeto usuario a string para guardarlo
    localStorage.setItem(this.storageKey, JSON.stringify(usuario));
  }

  // 2. Obtener usuario desde localStorage
  getUser() {
    const usuarioString = localStorage.getItem(this.storageKey);
    if (usuarioString) {
      return JSON.parse(usuarioString); // Lo volvemos a convertir a objeto
    }
    return null;
  }

  // 3. Cerrar sesión
  logout() {
    localStorage.removeItem(this.storageKey);
  }

  // 4. (Opcional) Un helper para saber si está logueado
  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  // 1. Llama al endpoint PUT del backend
  actualizarNombre(id: number, nuevoNombre: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    const body = { nombre: nuevoNombre };
    return this.http.put(url, body);
  }

  // 2. Actualiza el usuario en localStorage
  updateLocalUser(usuarioActualizado: any) {
    // Obtenemos el usuario actual
    let usuarioGuardado = this.getUser();
    if (usuarioGuardado) {
      // Combinamos el usuario actual con los nuevos datos
      // (esto mantiene el ID, email, etc. y solo actualiza el nombre)
      const usuarioCombinado = { ...usuarioGuardado, ...usuarioActualizado };
      this.saveUser(usuarioCombinado);
    }
  }

}