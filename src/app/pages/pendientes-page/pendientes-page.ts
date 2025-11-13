import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { PublicacionService, PublicacionResponse, PublicacionEstadisticaResponse, PublicacionRequest, getImageUrl } from '../../services/publicacion/publicacion-service';
import { FichaDetalleComponent } from '../../components/ficha-detalle/ficha-detalle';
import { RouterLink } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-pendientes-page',
  standalone: true,
  imports: [CommonModule, FichaDetalleComponent, RouterLink, ReactiveFormsModule],
  templateUrl: './pendientes-page.html',
  styleUrl: './pendientes-page.css'
})
export class PendientesPage implements OnInit, AfterViewInit, OnDestroy {
  
  public publicacionesPendientes: PublicacionResponse[] = [];
  public cargando: boolean = true;
  public resumen: PublicacionEstadisticaResponse = {
    aceptadas: 0,
    rechazadas: 0,
    pendientes: 0
  };

  @ViewChild('estadoChart') estadoChartRef?: ElementRef<HTMLCanvasElement>;
  private estadoChart?: Chart;
  
  public mostrarFichaDetalle: boolean = false;
  public publicacionSeleccionada: PublicacionResponse | null = null;
  
  editandoPublicacion: boolean = false;
  publicacionEditando: PublicacionResponse | null = null;
  publicacionForm!: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  tiposCombustible: string[] = ['Nafta', 'Diesel', 'GNC', 'Híbrido', 'Eléctrico'];
  tiposCaja: string[] = ['Manual', 'Automática'];
  tiposPuerta: number[] = [2, 3, 4, 5];

  constructor(
    private publicacionService: PublicacionService,
    private fb: FormBuilder
  ) {
    this.inicializarFormularioPublicacion();
  }

  ngOnInit(): void {
    this.cargarPublicacionesPendientes();
    this.cargarResumenEstados();
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

  ngAfterViewInit(): void {
    this.actualizarGrafico();
  }

  ngOnDestroy(): void {
    this.estadoChart?.destroy();
  }

  cargarPublicacionesPendientes(): void {
    this.cargando = true;
    this.publicacionService.getPublicacionesPendientes().subscribe({
      next: (data: PublicacionResponse[]) => {
        this.publicacionesPendientes = data; 
        this.cargando = false;
      },
      error: (err: any) => {
        this.cargando = false;
        alert('Error al cargar publicaciones pendientes. Verifique el rol ADMIN.');
      }
    });
  }

  cargarResumenEstados(): void {
    this.publicacionService.getResumenPublicaciones().subscribe({
      next: (data) => {
        this.resumen = data;
        this.actualizarGrafico();
      },
      error: (err) => {
      }
    });
  }

  actualizarGrafico(): void {
    if (!this.estadoChartRef) {
      return;
    }

    const datos = [this.resumen.aceptadas, this.resumen.rechazadas, this.resumen.pendientes];
    const etiquetas = ['Aceptadas', 'Rechazadas', 'Pendientes'];

    if (this.estadoChart) {
      this.estadoChart.data.labels = etiquetas;
      this.estadoChart.data.datasets[0].data = datos;
      this.estadoChart.update();
      return;
    }

    this.estadoChart = new Chart(this.estadoChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: etiquetas,
        datasets: [
          {
            data: datos,
            backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
            borderColor: ['#1e7e34', '#c82333', '#e0a800'],
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const cantidad = tooltipItem.raw as number;
                const dataset = tooltipItem.dataset;
                const totalActual = (dataset.data as number[]).reduce((acc, val) => acc + val, 0);
                const porcentaje = totalActual > 0 ? ((cantidad / totalActual) * 100).toFixed(1) : '0';
                return `${tooltipItem.label}: ${cantidad} (${porcentaje}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  public mostrarFicha(publicacion: PublicacionResponse): void {
    this.publicacionSeleccionada = publicacion;
    this.mostrarFichaDetalle = true;
  }

  public cerrarFicha(): void {
    this.mostrarFichaDetalle = false;
    this.publicacionSeleccionada = null;
  }

  aprobar(id: number): void {
    if (!confirm('¿Está seguro de que desea APROBAR esta publicación?')) { 
      return;
    }
    this.publicacionService.aprobarPublicacion(id).subscribe({
      next: () => {
        alert('Publicación aprobada y publicada con éxito.');
        this.cargarPublicacionesPendientes();
        this.cargarResumenEstados();
      },
      error: (err: any) => {
        alert('Error al aprobar la publicación.');
      }
    });
  }

  rechazar(id: number): void {
    if (!confirm('¿Está seguro de que desea RECHAZAR y ELIMINAR esta publicación?')) {
      return;
    }
    this.publicacionService.rechazarPublicacion(id).subscribe({
      next: () => {
        alert('Publicación rechazada y eliminada.');
        this.cargarPublicacionesPendientes();
        this.cargarResumenEstados();
      },
      error: (err: any) => {
        alert('Error al rechazar la publicación.');
      }
    });
  }

  editarPublicacion(publicacion: PublicacionResponse): void {
    console.log('[DEBUG] Iniciando edición de publicación:', publicacion);
    console.log('[DEBUG] Email del vendedor:', publicacion.vendedorEmail);
    console.log('[DEBUG] ID de la publicación:', publicacion.id);
    
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
    
    console.log('[DEBUG] Formulario actualizado con los datos de la publicación');
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
      console.log('[DEBUG] No hay publicación en edición');
      return;
    }

    console.log('[DEBUG] Guardando publicación editada');
    console.log('[DEBUG] Publicación editando:', this.publicacionEditando);
    console.log('[DEBUG] ID de la publicación:', this.publicacionEditando.id);
    console.log('[DEBUG] Email del vendedor:', this.publicacionEditando.vendedorEmail);

    // Obtener valores del formulario y limpiar espacios vacíos
    const formValue = this.publicacionForm.value;
    console.log('[DEBUG] Valores del formulario:', formValue);
    const datosAEnviar: any = {};

    // Comparar y solo incluir campos modificados (que no estén vacíos después de trim)
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

    // Validar que al menos un campo haya sido modificado
    if (Object.keys(datosAEnviar).length === 0) {
      alert('No hay cambios para guardar. Por favor, modifica al menos un campo.');
      return;
    }

    // Validar que los campos modificados cumplan con las validaciones
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
      alert('Por favor, corrige los errores en los campos modificados.');
      return;
    }

    // Enviar actualización
    console.log('[DEBUG] Datos a enviar al backend:', JSON.stringify(datosAEnviar, null, 2));
    console.log('[DEBUG] Archivos seleccionados:', this.selectedFiles.length);
    
    if (this.selectedFiles.length > 0) {
      console.log('[DEBUG] Enviando actualización CON archivos');
      this.publicacionService.actualizarPublicacionConArchivos(
        this.publicacionEditando.id,
        datosAEnviar,
        this.selectedFiles
      ).subscribe({
        next: (respuesta) => {
          console.log('[DEBUG] Publicación actualizada con éxito (con archivos):', respuesta);
          alert('¡Publicación actualizada con éxito!');
          this.cancelarEdicion();
          this.cargarPublicacionesPendientes();
          this.cargarResumenEstados();
        },
        error: (error) => {
          console.error('[DEBUG] Error al actualizar (con archivos):', error);
          console.error('[DEBUG] Status:', error.status);
          console.error('[DEBUG] Error completo:', JSON.stringify(error, null, 2));
          alert(`Error al actualizar la publicación: ${error.message}`);
        }
      });
    } else {
      console.log('[DEBUG] Enviando actualización SIN archivos');
      this.publicacionService.actualizarPublicacion(
        this.publicacionEditando.id,
        datosAEnviar
      ).subscribe({
        next: (respuesta) => {
          console.log('[DEBUG] Publicación actualizada con éxito (sin archivos):', respuesta);
          alert('¡Publicación actualizada con éxito!');
          this.cancelarEdicion();
          this.cargarPublicacionesPendientes();
          this.cargarResumenEstados();
        },
        error: (error) => {
          console.error('[DEBUG] Error al actualizar (sin archivos):', error);
          console.error('[DEBUG] Status:', error.status);
          console.error('[DEBUG] Error completo:', JSON.stringify(error, null, 2));
          alert(`Error al actualizar la publicación: ${error.message}`);
        }
      });
    }
  }

  public getImageUrl = getImageUrl;
}