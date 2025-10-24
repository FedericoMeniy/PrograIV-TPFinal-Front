import { Component } from '@angular/core';
// 1. Importa la interface que creaste
import { Car } from '../../components/car-card/car-card'; // <-- 1. CORRECCIÓN: Quitamos ".component" del path
import { CarCardComponent } from '../../components/car-card/car-card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true, // Asegúrate de que este componente sea standalone
  imports: [CarCardComponent, CommonModule], // <-- Importa el componente para usarlo en el HTML
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css']
})
export class HomePageComponent {

  // 2. Crea tu lista de autos
  public cars: Car[] = [
    { 
      name: 'TESLA MODEL', 
      price: '$88.500 USD', 
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Tesla_Model_3_%282023%29_IMG_9488.jpg' 
    },
    { 
      name: 'MERCEDES-BENZ AMG GT', 
      price: '$99.300 USD', 
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/2015-2017_Mercedes-AMG_GT_%28C_190%29_S_coupe_%282017-07-15%29_01.jpg/1200px-2015-2017_Mercedes-AMG_GT_%28C_190%29_S_coupe_%282017-07-15%29_01.jpg' // <-- 2. CORRECCIÓN: "imageUrl"
    },
    { 
      name: 'VOLKSWAGEN GOL TREND', 
      price: '$9.300 USD', 
      imageUrl: 'https://cdncla.lavoz.com.ar/files/avisos/aviso_auto/aviso-auto-volkswagen-gol-trend-14593241.webp'  
    },
    { 
      name: 'BMW iES', 
      price: '$88.300 ESI', 
      imageUrl: 'https://cdn.motor1.com/images/mgl/P3JpGX/0:0:4028:3024/en-el-garage-de-insideevs-bmw-ix2-xdrive30-m-sport.webp' 
    }
  ];

}