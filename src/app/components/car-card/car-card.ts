import { Component, Input } from '@angular/core';

// 1. (Opcional pero recomendado) Define la estructura de un auto
export interface Car {
  name: string;
  price: string;
  imageUrl: string;
}

@Component({
  selector: 'app-car-card',
  templateUrl: './car-card.html',
  styleUrls: ['./car-card.css']
})
export class CarCardComponent {


  @Input() carData: Car = {
    name: 'Auto por defecto',
    price: '$0 USD',
    imageUrl: ''
  };

}