import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
    {path: 'inicio' , component: HomePageComponent},
    {path:'perfil', component: Profile},
    {path: '', redirectTo:'/inicio', pathMatch:'full'}
];
