import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>, 
  next: HttpHandlerFn
) => {

  const usuarioString = localStorage.getItem('usuarioLogueado');
  let authToken: string | null = null;

  if (usuarioString) {
    try {
      const usuario = JSON.parse(usuarioString);
      if (usuario && usuario.token) {
        authToken = usuario.token;
      }
    } catch (e) {
      return next(req);
    }
  }

  if (!authToken) {
    return next(req);
  }

  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authToken}`)
  });

  return next(authReq);
};

