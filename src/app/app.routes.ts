import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page';
import { AuthComponent } from './pages/auth/auth';
import { UsadosPage } from './pages/usados-page/usados-page';
import { Profile } from './pages/profile/profile';
import { authGuard } from './guards/auth-guards';
import { guestGuard } from './guards/guest-guard';
import { PendientesPage } from './pages/pendientes-page/pendientes-page';
import { ReservasPage } from './pages/reservas-page/reservas-page';

export const routes: Routes = [
    { path: 'inicio', component: HomePageComponent, canActivate: [authGuard] },
    { path: 'usados', component: UsadosPage, canActivate: [authGuard] },
    { path: 'perfil', component: Profile, canActivate: [authGuard] },
    { path: 'login', component: AuthComponent, canActivate: [guestGuard] },
    { path: 'admin/pendientes',component: PendientesPage, canActivate: [authGuard]},
    { path: 'admin/reservas',component: ReservasPage, canActivate: [authGuard]},
    { path: '', redirectTo: '/inicio', pathMatch: 'full' }
];