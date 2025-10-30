import { Component, OnInit } from '@angular/core'; // Se importa OnInit
import { FormsModule } from '@angular/forms'; // Se importa FormsModule

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FormsModule], // Se añade FormsModule a los imports
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePageComponent implements OnInit { // Se implementa OnInit

  public mostrarBuscador: boolean = false;
  public terminoBusqueda: string = ''; // Propiedad para vincular al input
  public publicacionesMostradas: any[] = []; // Lista para mostrar en el template

  publicacionInterface = {
    id: 0,
    titulo: '',
    precio: 0,
    marca: '',
    modelo: '',
    anio: 0,
    kilometraje: 0,
    urlFoto: ''
  };

  // Esta es la lista "maestra" que no se modificará
  public publicaciones: any[] = [
    {
      id: 1,
      titulo: 'Toyota Corolla 1.8 SE-G',
      precio: 28500,
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2021,
      kilometraje: 35000,
      urlFoto: 'https://i.imgur.com/g8sNBsL.png'
    },
    {
      id: 2,
      titulo: 'Ford Ranger 3.2 LIMITED 4x4',
      precio: 42000,
      marca: 'Ford',
      modelo: 'Ranger',
      anio: 2022,
      kilometraje: 15000,
      urlFoto: 'https://i.imgur.com/v8FV2cR.png'
    },
    {
      id: 3,
      titulo: 'VW Amarok 2.0 HIGHLINE 4x2',
      precio: 39500,
      marca: 'Volkswagen',
      modelo: 'Amarok',
      anio: 2021,
      kilometraje: 42000,
      urlFoto: 'https://i.imgur.com/iR3vjGv.png'
    },
    {
      id: 4,
      titulo: 'Chevrolet Onix 1.2 PREMIER',
      precio: 21000,
      marca: 'Chevrolet',
      modelo: 'Onix',
      anio: 2023,
      kilometraje: 5000,
      urlFoto: 'https://i.imgur.com/hYfNqTj.png'
    }
  ];

  ngOnInit(): void {
    // Al iniciar, la lista mostrada es igual a la lista completa
    this.publicacionesMostradas = this.publicaciones;
  }

  public onBuscarClick(event: Event): void {
    event.preventDefault();
    this.mostrarBuscador = true;
  }

  public onBusquedaSubmit(): void {
    // Si no hay término de búsqueda, mostrar todo
    if (!this.terminoBusqueda) {
      this.publicacionesMostradas = this.publicaciones;
      return;
    }

    // Lógica de filtrado
    const termino = this.terminoBusqueda.toLowerCase();
    this.publicacionesMostradas = this.publicaciones.filter(publi =>
      publi.titulo.toLowerCase().includes(termino) ||
      publi.marca.toLowerCase().includes(termino) ||
      publi.modelo.toLowerCase().includes(termino)
    );
  }

}