import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservas-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas-page.html',
  styleUrl: './reservas-page.css'
})
export class ReservasPage implements OnInit {
  public cargando: boolean = true;
  public reservas: any[] = [];

  constructor() { }

  ngOnInit(): void {
    // Aquí se cargaría la lista de reservas
    console.log('Componente de Administrar Reservas cargado.');
    this.cargando = false;
  }
}