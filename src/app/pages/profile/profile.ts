import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth/auth';
import { PublicacionService, PublicacionResponse, PublicacionRequest, getImageUrl } from '../../services/publicacion/publicacion-service';
import { NotificationService } from '../../services/notification/notification.service';

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
  misPublicaciones: PublicacionResponse[] = [];
  
  editandoPublicacion: boolean = false;
  publicacionEditando: PublicacionResponse | null = null;
  publicacionForm!: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  tiposCombustible: string[] = ['Nafta', 'Diesel', 'GNC', 'Híbrido', 'Eléctrico'];
  tiposCaja: string[] = ['Manual', 'Automática'];
  tiposPuerta: number[] = [2, 3, 4, 5];

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private publicacionService: PublicacionService,
    private notificationService: NotificationService
  ) {
    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]]
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
      this.cargarMisPublicaciones();
      this.inicializarFormularioPublicacion();
    }
  }

  inicializarFormularioPublicacion(): void {
    this.publicacionForm = this.fb.group({
      descripcion: ['', [Validators.minLength(5), Validators.maxLength(500)]],
      auto: this.fb.group({
        marca: ['', [Validators.minLength(2), Validators.maxLength(30)]],
        modelo: ['', [Validators.minLength(2), Validators.maxLength(30)]],
        precio: ['', [Validators.min(0), Validators.max(1000000)]],
        anio: ['', [Validators.min(1885), Validators.max(new Date().getFullYear())]],
        km: ['', [Validators.pattern(/^[0-9]+$/), Validators.min(0), Validators.max(400000)]],
        color: ['', [Validators.minLength(4), Validators.maxLength(8), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
        fichaTecnica: this.fb.group({
          motor: ['', [Validators.pattern(/^[0-9]+(\.[0-9]+)?$/), Validators.min(0.1), Validators.max(6.6)]],
          combustible: [''],
          caja: [''],
          puertas: [''],
          potencia: ['', [Validators.pattern(/^[0-9]+$/), Validators.min(1), Validators.max(400)]]
        })
      })
    });
  }

  get autoForm() {
    return this.publicacionForm.get('auto') as FormGroup;
  }

  get fichaTecnicaForm() {
    return this.autoForm.get('fichaTecnica') as FormGroup;
  }

  get descripcion(): AbstractControl | null {
    return this.publicacionForm.get('descripcion');
  }

  get marca(): AbstractControl | null {
    return this.autoForm.get('marca');
  }

  get modelo(): AbstractControl | null {
    return this.autoForm.get('modelo');
  }

  get precio(): AbstractControl | null {
    return this.autoForm.get('precio');
  }

  get anio(): AbstractControl | null {
    return this.autoForm.get('anio');
  }

  get km(): AbstractControl | null {
    return this.autoForm.get('km');
  }

  get color(): AbstractControl | null {
    return this.autoForm.get('color');
  }

  get motor(): AbstractControl | null {
    return this.fichaTecnicaForm.get('motor');
  }

  get potencia(): AbstractControl | null {
    return this.fichaTecnicaForm.get('potencia');
  }

  cargarMisPublicaciones(): void {
    this.publicacionService.getMisPublicaciones().subscribe({
      next: (publicaciones) => {
        this.misPublicaciones = publicaciones;
      },
      error: (err) => {
      }
    });
  }

  marcarComoVendida(idPublicacion: number): void {
    const confirmacion = window.confirm('¿Estás seguro de que quieres marcar esta publicación como vendida? Se eliminará del catálogo.');

    if (confirmacion) {
      this.publicacionService.marcarComoVendida(idPublicacion).subscribe({
        next: () => {
          this.notificationService.success('Publicación marcada como vendida y eliminada correctamente.');
          this.cargarMisPublicaciones();
        },
        error: (err) => {
          this.notificationService.error('Error: No se pudo marcar como vendida y eliminar la publicación.');
        }
      });
    }
  }

  eliminarPublicacion(idPublicacion: number): void {
    const confirmacion = window.confirm('¿Estás seguro de que quieres eliminar esta publicación?');

    if (confirmacion) {
      this.publicacionService.eliminarPublicacion(idPublicacion).subscribe({
        next: () => {
          this.notificationService.success('Publicación eliminada correctamente.');
          this.cargarMisPublicaciones();
        },
        error: (err) => {
          this.notificationService.error('Error: No se pudo eliminar la publicación.');
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

    const nuevoNombre = this.editForm.value.nombre.trim();
    const usuarioId = this.usuario.id;

    this.authService.actualizarNombre(usuarioId, nuevoNombre).subscribe({
      next: (usuarioActualizado) => {
        this.authService.updateLocalUser(usuarioActualizado);

        this.usuario = this.authService.getUser();

        this.isEditing = false;

        this.notificationService.success('¡Nombre actualizado con éxito!');
      },
      error: (err) => {
        this.notificationService.error('Error: ' + err.error);
      }
    });
  }

  editarPublicacion(publicacion: PublicacionResponse): void {
    this.publicacionEditando = publicacion;
    this.editandoPublicacion = true;
    
    this.publicacionForm.patchValue({
      descripcion: publicacion.descripcion,
      auto: {
        marca: publicacion.auto.marca,
        modelo: publicacion.auto.modelo,
        precio: publicacion.auto.precio,
        anio: publicacion.auto.anio,
        km: publicacion.auto.km,
        color: publicacion.auto.color,
        fichaTecnica: {
          motor: publicacion.auto.fichaTecnica.motor,
          combustible: publicacion.auto.fichaTecnica.combustible,
          caja: publicacion.auto.fichaTecnica.caja,
          puertas: publicacion.auto.fichaTecnica.puertas,
          potencia: publicacion.auto.fichaTecnica.potencia
        }
      }
    });

    if (publicacion.auto.imagenesUrl && publicacion.auto.imagenesUrl.length > 0) {
      this.imagePreviews = publicacion.auto.imagenesUrl.map(url => getImageUrl(url));
    }
  }

  cancelarEdicion(): void {
    this.editandoPublicacion = false;
    this.publicacionEditando = null;
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.publicacionForm.reset();
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
    this.imagePreviews = [];
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      return;
    }

    for (const file of this.selectedFiles) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  guardarPublicacionEditada(): void {
    if (!this.publicacionEditando) {
      return;
    }

    const usuarioActual = this.authService.getUser();
    
    if (!this.authService.isAdmin() && usuarioActual && this.publicacionEditando.vendedorEmail && 
        this.publicacionEditando.vendedorEmail !== usuarioActual.email) {
      this.notificationService.warning('No tienes permiso para modificar esta publicación. Solo puedes editar tus propias publicaciones.');
      this.cancelarEdicion();
      return;
    }

    const formValue = this.publicacionForm.value;
    const datosAEnviar: any = {};
    if (formValue.descripcion && formValue.descripcion.trim() !== '' && 
        formValue.descripcion.trim() !== this.publicacionEditando.descripcion) {
      datosAEnviar.descripcion = formValue.descripcion.trim();
    }

    if (formValue.auto) {
      const autoCambios: any = {};
      let autoTieneCambios = false;

      if (formValue.auto.marca && formValue.auto.marca.trim() !== '' && 
          formValue.auto.marca.trim() !== this.publicacionEditando.auto.marca) {
        autoCambios.marca = formValue.auto.marca.trim();
        autoTieneCambios = true;
      }

      if (formValue.auto.modelo && formValue.auto.modelo.trim() !== '' && 
          formValue.auto.modelo.trim() !== this.publicacionEditando.auto.modelo) {
        autoCambios.modelo = formValue.auto.modelo.trim();
        autoTieneCambios = true;
      }

      if (formValue.auto.precio !== null && formValue.auto.precio !== undefined && 
          formValue.auto.precio !== '' && 
          Number(formValue.auto.precio) !== this.publicacionEditando.auto.precio) {
        autoCambios.precio = Number(formValue.auto.precio);
        autoTieneCambios = true;
      }

      if (formValue.auto.anio !== null && formValue.auto.anio !== undefined && 
          formValue.auto.anio !== '' && 
          Number(formValue.auto.anio) !== this.publicacionEditando.auto.anio) {
        autoCambios.anio = Number(formValue.auto.anio);
        autoTieneCambios = true;
      }

      if (formValue.auto.km && formValue.auto.km.trim() !== '' && 
          formValue.auto.km.trim() !== this.publicacionEditando.auto.km) {
        autoCambios.km = formValue.auto.km.trim();
        autoTieneCambios = true;
      }

      if (formValue.auto.color && formValue.auto.color.trim() !== '' && 
          formValue.auto.color.trim() !== this.publicacionEditando.auto.color) {
        autoCambios.color = formValue.auto.color.trim();
        autoTieneCambios = true;
      }

      if (formValue.auto.fichaTecnica) {
        const fichaCambios: any = {};
        let fichaTieneCambios = false;

        if (formValue.auto.fichaTecnica.motor && formValue.auto.fichaTecnica.motor.trim() !== '' && 
            formValue.auto.fichaTecnica.motor.trim() !== String(this.publicacionEditando.auto.fichaTecnica.motor)) {
          fichaCambios.motor = formValue.auto.fichaTecnica.motor.trim();
          fichaTieneCambios = true;
        }

        if (formValue.auto.fichaTecnica.combustible && formValue.auto.fichaTecnica.combustible !== '' && 
            formValue.auto.fichaTecnica.combustible !== this.publicacionEditando.auto.fichaTecnica.combustible) {
          fichaCambios.combustible = formValue.auto.fichaTecnica.combustible;
          fichaTieneCambios = true;
        }

        if (formValue.auto.fichaTecnica.caja && formValue.auto.fichaTecnica.caja !== '' && 
            formValue.auto.fichaTecnica.caja !== this.publicacionEditando.auto.fichaTecnica.caja) {
          fichaCambios.caja = formValue.auto.fichaTecnica.caja;
          fichaTieneCambios = true;
        }

        if (formValue.auto.fichaTecnica.puertas !== null && formValue.auto.fichaTecnica.puertas !== undefined && 
            formValue.auto.fichaTecnica.puertas !== '' && 
            Number(formValue.auto.fichaTecnica.puertas) !== Number(this.publicacionEditando.auto.fichaTecnica.puertas)) {
          fichaCambios.puertas = String(formValue.auto.fichaTecnica.puertas);
          fichaTieneCambios = true;
        }

        if (formValue.auto.fichaTecnica.potencia && formValue.auto.fichaTecnica.potencia.trim() !== '' && 
            formValue.auto.fichaTecnica.potencia.trim() !== String(this.publicacionEditando.auto.fichaTecnica.potencia)) {
          fichaCambios.potencia = formValue.auto.fichaTecnica.potencia.trim();
          fichaTieneCambios = true;
        }

        if (fichaTieneCambios) {
          autoCambios.fichaTecnica = fichaCambios;
          autoTieneCambios = true;
        }
      }

      if (autoTieneCambios) {
        datosAEnviar.auto = autoCambios;
      }
    }

    if (Object.keys(datosAEnviar).length === 0) {
      this.notificationService.warning('No hay cambios para guardar. Por favor, modifica al menos un campo.');
      return;
    }

    const descripcionControl = this.publicacionForm.get('descripcion');
    const marcaControl = this.publicacionForm.get('auto.marca');
    const modeloControl = this.publicacionForm.get('auto.modelo');
    const precioControl = this.publicacionForm.get('auto.precio');
    const anioControl = this.publicacionForm.get('auto.anio');
    const kmControl = this.publicacionForm.get('auto.km');
    const colorControl = this.publicacionForm.get('auto.color');
    const motorControl = this.publicacionForm.get('auto.fichaTecnica.motor');
    const potenciaControl = this.publicacionForm.get('auto.fichaTecnica.potencia');

    let hayErrores = false;

    if (datosAEnviar.descripcion && descripcionControl && descripcionControl.invalid) {
      hayErrores = true;
    }
    if (datosAEnviar.auto?.marca && marcaControl && marcaControl.invalid) {
      hayErrores = true;
    }
    if (datosAEnviar.auto?.modelo && modeloControl && modeloControl.invalid) {
      hayErrores = true;
    }
    if (datosAEnviar.auto?.precio !== undefined && precioControl && precioControl.invalid) {
      hayErrores = true;
    }
    if (datosAEnviar.auto?.anio !== undefined && anioControl && anioControl.invalid) {
      hayErrores = true;
    }
    if (datosAEnviar.auto?.km && kmControl && kmControl.invalid) {
      hayErrores = true;
    }
    if (datosAEnviar.auto?.color && colorControl && colorControl.invalid) {
      hayErrores = true;
    }
    if (datosAEnviar.auto?.fichaTecnica?.motor && motorControl && motorControl.invalid) {
      hayErrores = true;
    }
    if (datosAEnviar.auto?.fichaTecnica?.potencia && potenciaControl && potenciaControl.invalid) {
      hayErrores = true;
    }

    if (hayErrores) {
      this.publicacionForm.markAllAsTouched();
      this.notificationService.warning('Por favor, corrige los errores en los campos modificados.');
      return;
    }

    if (this.selectedFiles.length > 0) {
      this.publicacionService.actualizarPublicacionConArchivos(
        this.publicacionEditando.id,
        datosAEnviar,
        this.selectedFiles
      ).subscribe({
        next: (respuesta) => {
          this.notificationService.success('¡Publicación actualizada con éxito! Deberá ser aprobada nuevamente por el administrador.');
          this.cancelarEdicion();
          this.cargarMisPublicaciones();
        },
        error: (error) => {
          if (error.status === 403) {
            this.notificationService.warning('No tienes permiso para modificar esta publicación. Solo puedes editar tus propias publicaciones.');
          } else if (error.status === 404) {
            this.notificationService.error('La publicación no fue encontrada.');
          } else {
            this.notificationService.error(`Error al actualizar la publicación: ${error.error?.message || error.message || 'Error desconocido'}`);
          }
        }
      });
    } else {
      this.publicacionService.actualizarPublicacion(
        this.publicacionEditando.id,
        datosAEnviar
      ).subscribe({
        next: (respuesta) => {
          this.notificationService.success('¡Publicación actualizada con éxito! Deberá ser aprobada nuevamente por el administrador.');
          this.cancelarEdicion();
          this.cargarMisPublicaciones();
        },
        error: (error) => {
          if (error.status === 403) {
            this.notificationService.warning('No tienes permiso para modificar esta publicación. Solo puedes editar tus propias publicaciones.');
          } else if (error.status === 404) {
            this.notificationService.error('La publicación no fue encontrada.');
          } else {
            this.notificationService.error(`Error al actualizar la publicación: ${error.error?.message || error.message || 'Error desconocido'}`);
          }
        }
      });
    }
  }

  public getImageUrl = getImageUrl;
}