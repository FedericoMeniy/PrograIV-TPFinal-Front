import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { PublicacionResponse, AutoResponse } from '../../services/publicacion/publicacion-service';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-ficha-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ficha-detalle.html',
  styleUrl: './ficha-detalle.css'
})
export class FichaDetalleComponent implements OnInit {

  @Input() publicacion!: PublicacionResponse; 
  @Output() cerrar = new EventEmitter<void>();
  @Output() reservar = new EventEmitter<PublicacionResponse>();

  public auto!: AutoResponse;
  public isLoggedIn: boolean = false;
  public isAdmin: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    if (this.publicacion) {
      this.auto = this.publicacion.auto;
    }
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
  }

  public onCerrarClick(): void {
    this.cerrar.emit();
  }

  public onModalContentClick(event: Event): void {
    event.stopPropagation();
  }

  public onReservarClick(): void {
    this.reservar.emit(this.publicacion);
  }
}