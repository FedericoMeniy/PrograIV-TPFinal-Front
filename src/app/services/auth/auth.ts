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

  login(credenciales: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(respuesta => {
        if (respuesta && respuesta.token) {
          this.saveUser(respuesta);
        }
      })
    );
  }

  saveUser(usuario: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(usuario));
  }

  getUser() {
    const usuarioString = localStorage.getItem(this.storageKey);
    if (usuarioString) {
      try {
        return JSON.parse(usuarioString);
      } catch (e) {
        this.logout();
        return null;
      }
    }
    return null;
  }

  logout() {
    localStorage.removeItem(this.storageKey);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getToken(): string | null {
    const usuario = this.getUser();
    if (usuario && usuario.token) {
      return usuario.token;
    }
    return null;
  }
  
  public isAdmin(): boolean {
    const usuario = this.getUser();
    return usuario && usuario.rol === 'ADMIN'; 
  }

  actualizarNombre(id: number, nuevoNombre: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    const body = { nombre: nuevoNombre.trim() };
    return this.http.put(url, body);
  }

  updateLocalUser(usuarioActualizado: any) {
    let usuarioGuardado = this.getUser();
    if (usuarioGuardado) {
      const usuarioCombinado = { ...usuarioGuardado, ...usuarioActualizado };
      this.saveUser(usuarioCombinado);
    }
  }
}