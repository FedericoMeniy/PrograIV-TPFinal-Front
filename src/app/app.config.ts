import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

// --- IMPORTACIONES ---
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './services/jwt.interceptor';    // <-- ESTE ES EL BUENO

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(),

    provideHttpClient(
      // Le decimos a Angular que use SÓLO este interceptor
      withInterceptors([jwtInterceptor]) 
    )
  ]
};