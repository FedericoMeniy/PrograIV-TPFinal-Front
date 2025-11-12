import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth'; // Asegúrate que la ruta a tu AuthService sea correcta

/**
 * Interceptor funcional de JWT.
 * Intercepta todas las solicitudes HTTP salientes para agregar el
 * token JWT de autenticación si está disponible.
 */
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {

  // Inyectamos el AuthService para acceder al token
  const authService = inject(AuthService);
  const token = authService.getToken(); // Obtenemos el token desde localStorage

  // Comprobamos si el usuario está logueado (si existe el token)
  if (authService.isLoggedIn() && token) {
    
    // Clonamos la solicitud original (req) para modificarla
    const clonedReq = req.clone({
      // Agregamos el header 'Authorization' con el token Bearer
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Dejamos que la solicitud clonada (y autenticada) continúe su camino
    return next(clonedReq);
  }

  // Si no hay token, dejamos que la solicitud original continúe sin modificarse
  return next(req);
};