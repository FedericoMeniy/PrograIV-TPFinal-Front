import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private apiUrl = 'http://localhost:8080/usuario';

  constructor(private http: HttpClient) { }

  registrar(datosUsuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, datosUsuario);
  }

  // Aquí también podrías añadir el método de login
  // login(credenciales: any): Observable<any> { ... }
}