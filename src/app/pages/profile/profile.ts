import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth';
import { PublicacionService, PublicacionResponse } from '../../services/publicacion/publicacion-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  usuario: any = null;
  isEditing: boolean = false;
  editForm: FormGroup;
  misPublicaciones: PublicacionResponse[] = []; // Nueva propiedad para publicaciones

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private publicacionService: PublicacionService // Inyectar PublicacionService
  ) {
    this.editForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.usuario = this.authService.getUser();

    if (!this.usuario) {
      this.router.navigate(['/login']);
    } else {
      this.editForm.patchValue({
        nombre: this.usuario.nombre
      });
      this.cargarMisPublicaciones(); // Cargar publicaciones al iniciar
    }
  }

  cargarMisPublicaciones(): void {
    this.publicacionService.getMisPublicaciones().subscribe({
      next: (publicaciones) => {
        this.misPublicaciones = publicaciones;
      },
      error: (err) => {
        console.error('Error al cargar mis publicaciones:', err);
        // Podrías mostrar un mensaje al usuario aquí
      }
    });
  }

  marcarComoVendida(idPublicacion: number): void {
    const confirmacion = window.confirm('¿Estás seguro de que quieres marcar esta publicación como vendida? Se eliminará del catálogo.');

    if (confirmacion) {
      this.publicacionService.marcarComoVendida(idPublicacion).subscribe({
        next: () => {
          alert('Publicación marcada como vendida y eliminada correctamente.');
          this.cargarMisPublicaciones(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al marcar como vendida:', err);
          alert('Error: No se pudo marcar como vendida y eliminar la publicación.');
        }
      });
    }
  }

  eliminarPublicacion(idPublicacion: number): void {
    const confirmacion = window.confirm('¿Estás seguro de que quieres eliminar esta publicación?');

    if (confirmacion) {
      this.publicacionService.eliminarPublicacion(idPublicacion).subscribe({
        next: () => {
          alert('Publicación eliminada correctamente.');
          this.cargarMisPublicaciones(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('Error: No se pudo eliminar la publicación.');
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.editForm.reset({
        nombre: this.usuario.nombre
      });
    }
  }

  onSave(): void {
    if (this.editForm.invalid) {
      return;
    }

    const nuevoNombre = this.editForm.value.nombre;
    const usuarioId = this.usuario.id;

    this.authService.actualizarNombre(usuarioId, nuevoNombre).subscribe({
      next: (usuarioActualizado) => {
        this.authService.updateLocalUser(usuarioActualizado);

        this.usuario = this.authService.getUser();

        this.isEditing = false;

        alert('¡Nombre actualizado con éxito!');
      },
      error: (err) => {
        console.error('Error al actualizar el nombre:', err);
        alert('Error: ' + err.error);
      }
    });
  }
}