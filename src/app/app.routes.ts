import { Routes } from '@angular/router';
import {HomePageComponent} from './pages/home-page/home-page';
import { AuthComponent } from './pages/auth/auth';
import { UsadosPage } from './pages/usados-page/usados-page';
import { Profile } from './pages/profile/profile';
import { authGuard } from './guards/auth-guards';
import { guestGuard } from './guards/guest-guard';
import { adminGuard } from './guards/admin-guard';
import { PendientesPage } from './pages/pendientes-page/pendientes-page';
import { ReservasPage } from './pages/reservas-page/reservas-page';
import { PagoPendiente } from './pages/pago-pendiente/pago-pendiente';
import { PagoFallido } from './pages/pago-fallido/pago-fallido';
import { PagoExitoso } from './pages/pago-exitoso/pago-exitoso';

export const routes: Routes = [
    { path: 'inicio', component: HomePageComponent, canActivate: [authGuard] },
    { path: 'usados', component: UsadosPage, canActivate: [authGuard] },
    { path: 'perfil', component: Profile, canActivate: [authGuard] },
    { path: 'login', component: AuthComponent, canActivate: [guestGuard] },
    { path: 'admin/pendientes', component: PendientesPage, canActivate: [adminGuard] },
    { path: 'admin/reservas', component: ReservasPage, canActivate: [adminGuard] },
    { path: '', redirectTo: '/inicio', pathMatch: 'full' },
    { path: 'pago-exitoso', component: PagoExitoso },
    { path: 'pago-fallido', component: PagoFallido },
    { path: 'pago-pendiente', component:  PagoPendiente},
];