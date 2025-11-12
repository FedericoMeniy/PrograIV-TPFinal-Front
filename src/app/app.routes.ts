import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page';
import { AuthComponent } from './pages/auth/auth'; 
import { UsadosPage } from './pages/usados-page/usados-page';
import { Profile } from './pages/profile/profile';

import { authGuard } from './guards/auth-guards';
import { guestGuard } from './guards/guest-guard';


export const routes: Routes = [
    {path: 'inicio' , component: HomePageComponent, canActivate: [authGuard]}, 
    {path: 'usados', component: UsadosPage, canActivate: [authGuard]}, 
    {path:'perfil', component: Profile, canActivate: [authGuard]},
    {path:'login', component: AuthComponent, canActivate: [guestGuard]},
    {path: '', redirectTo:'/inicio', pathMatch:'full'}
];