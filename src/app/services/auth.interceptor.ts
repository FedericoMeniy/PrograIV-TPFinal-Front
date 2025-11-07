import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>, 
  next: HttpHandlerFn
) => {

  // --- OBTENER TOKEN (LÓGICA CORREGIDA) ---
  
  // 1. Obtener el OBJETO de usuario guardado (que contiene el token)
  const usuarioString = localStorage.getItem('usuarioLogueado');
  let authToken: string | null = null;

  if (usuarioString) {
    try {
      // 2. Parsear el JSON
      const usuario = JSON.parse(usuarioString);
      
      // 3. Extraer la propiedad 'token' (basado en tu log de "Login exitoso")
      if (usuario && usuario.token) {
        authToken = usuario.token;
      } else {
        console.warn('AuthInterceptor: Se encontró "usuarioLogueado", pero no tiene la propiedad "token".');
      }
    } catch (e) {
      console.error('AuthInterceptor: Error al parsear "usuarioLogueado" del localStorage', e);
    }
  }

  // Si no hay token (authToken sigue siendo null)
  if (!authToken) {
    console.warn('AuthInterceptor: No se adjuntará ningún token.');
    return next(req);
  }

  // Clona la solicitud para añadir la nueva cabecera
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authToken}`)
  });

  // Envía la solicitud clonada
  return next(authReq);
};

