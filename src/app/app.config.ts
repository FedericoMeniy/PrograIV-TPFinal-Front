import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

// --- IMPORTACIONES NUEVAS ---
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/auth.interceptor'; // Importa tu nuevo interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(),

    // --- CONFIGURACIÓN ACTUALIZADA ---
    // Esto reemplaza al antiguo HttpClientModule y registra tu interceptor.
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
