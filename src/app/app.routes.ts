import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page';
import { AuthComponent } from './pages/auth/auth'; 
import { UsadosPage } from './pages/usados-page/usados-page';

export const routes: Routes = [
    {path: 'inicio' , component: HomePageComponent},
    {path: 'usados', component: UsadosPage},
    {path:'perfil', component: AuthComponent},
    {path: '', redirectTo:'/inicio', pathMatch:'full'}
];