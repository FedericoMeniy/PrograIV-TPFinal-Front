import { Component } from '@angular/core';
// 1. Importa la interface que creaste

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true, // Asegúrate de que este componente sea standalone
  imports: [CommonModule], // <-- Importa el componente para usarlo en el HTML
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css']
})
export class HomePageComponent {

  

}