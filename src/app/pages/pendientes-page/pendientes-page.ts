import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { PublicacionService, PublicacionResponse, PublicacionEstadisticaResponse, PublicacionRequest, getImageUrl } from '../../services/publicacion/publicacion-service';
import { FichaDetalleComponent } from '../../components/ficha-detalle/ficha-detalle';
import { RouterLink } from '@angular/router';
import Chart from 'chart.js/auto';
import { NotificationService } from '../../services/notification/notification.service';

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
    private fb: FormBuilder,
    private notificationService: NotificationService
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
        this.notificationService.error('Error al cargar publicaciones pendientes. Verifique el rol ADMIN.');
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
        this.notificationService.success('Publicación aprobada y publicada con éxito.');
        this.cargarPublicacionesPendientes();
        this.cargarResumenEstados();
      },
      error: (err: any) => {
        this.notificationService.error('Error al aprobar la publicación.');
      }
    });
  }

  rechazar(id: number): void {
    if (!confirm('¿Está seguro de que desea RECHAZAR y ELIMINAR esta publicación?')) {
      return;
    }
    this.publicacionService.rechazarPublicacion(id).subscribe({
      next: () => {
        this.notificationService.success('Publicación rechazada y eliminada.');
        this.cargarPublicacionesPendientes();
        this.cargarResumenEstados();
      },
      error: (err: any) => {
        this.notificationService.error('Error al rechazar la publicación.');
      }
    });
  }

  editarPublicacion(publicacion: PublicacionResponse): void {
    this.publicacionEditando = publicacion;
    this.editandoPublicacion = true;
    this.selectedFiles = [];
    
    const auto = publicacion.auto || {};
    const fichaTecnica = auto.fichaTecnica || {};
    
    this.publicacionForm.patchValue({
      descripcion: publicacion.descripcion || '',
      auto: {
        marca: auto.marca || '',
        modelo: auto.modelo || '',
        precio: auto.precio != null ? auto.precio : '',
        anio: auto.anio != null ? auto.anio : '',
        km: auto.km || '',
        color: auto.color || '',
        fichaTecnica: {
          motor: fichaTecnica.motor || '',
          combustible: fichaTecnica.combustible || '',
          caja: fichaTecnica.caja || '',
          puertas: fichaTecnica.puertas || '',
          potencia: fichaTecnica.potencia || ''
        }
      }
    });

    if (auto.imagenesUrl && auto.imagenesUrl.length > 0) {
      this.imagePreviews = auto.imagenesUrl.map(url => getImageUrl(url));
    } else {
      this.imagePreviews = [];
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

    const formValue = this.publicacionForm.value;
    const datosAEnviar: any = {};
    
    const descripcionForm = (formValue.descripcion || '').trim();
    const descripcionOriginal = (this.publicacionEditando.descripcion || '').trim();
    if (descripcionForm !== descripcionOriginal) {
      datosAEnviar.descripcion = descripcionForm;
    }

    if (formValue.auto) {
      const autoCambios: any = {};
      let autoTieneCambios = false;

      const marcaForm = (formValue.auto.marca || '').trim();
      const marcaOriginal = (this.publicacionEditando.auto.marca || '').trim();
      if (marcaForm !== marcaOriginal && marcaForm !== '') {
        autoCambios.marca = marcaForm;
        autoTieneCambios = true;
      }

      const modeloForm = (formValue.auto.modelo || '').trim();
      const modeloOriginal = (this.publicacionEditando.auto.modelo || '').trim();
      if (modeloForm !== modeloOriginal && modeloForm !== '') {
        autoCambios.modelo = modeloForm;
        autoTieneCambios = true;
      }

      const precioFormValue = formValue.auto.precio;
      if (precioFormValue !== null && precioFormValue !== undefined && precioFormValue !== '') {
        const precioForm = Number(precioFormValue);
        const precioOriginal = Number(this.publicacionEditando.auto.precio);
        
        if (!isNaN(precioForm) && precioForm !== precioOriginal) {
          autoCambios.precio = precioForm;
          autoTieneCambios = true;
        }
      }

      const anioForm = formValue.auto.anio !== null && formValue.auto.anio !== undefined && formValue.auto.anio !== '' 
        ? Number(formValue.auto.anio) 
        : null;
      const anioOriginal = this.publicacionEditando.auto.anio;
      if (anioForm !== null && anioForm !== anioOriginal) {
        autoCambios.anio = anioForm;
        autoTieneCambios = true;
      }

      const kmForm = (formValue.auto.km || '').trim();
      const kmOriginal = (this.publicacionEditando.auto.km || '').trim();
      if (kmForm !== kmOriginal && kmForm !== '') {
        autoCambios.km = kmForm;
        autoTieneCambios = true;
      }

      const colorForm = (formValue.auto.color || '').trim();
      const colorOriginal = (this.publicacionEditando.auto.color || '').trim();
      if (colorForm !== colorOriginal && colorForm !== '') {
        autoCambios.color = colorForm;
        autoTieneCambios = true;
      }

      if (formValue.auto.fichaTecnica) {
        const fichaCambios: any = {};
        let fichaTieneCambios = false;

        const motorForm = (formValue.auto.fichaTecnica.motor || '').trim();
        const motorOriginal = String(this.publicacionEditando.auto.fichaTecnica.motor || '').trim();
        if (motorForm !== motorOriginal && motorForm !== '') {
          fichaCambios.motor = motorForm;
          fichaTieneCambios = true;
        }

        const combustibleForm = (formValue.auto.fichaTecnica.combustible || '').trim();
        const combustibleOriginal = (this.publicacionEditando.auto.fichaTecnica.combustible || '').trim();
        if (combustibleForm !== combustibleOriginal && combustibleForm !== '') {
          fichaCambios.combustible = combustibleForm;
          fichaTieneCambios = true;
        }

        const cajaForm = (formValue.auto.fichaTecnica.caja || '').trim();
        const cajaOriginal = (this.publicacionEditando.auto.fichaTecnica.caja || '').trim();
        if (cajaForm !== cajaOriginal && cajaForm !== '') {
          fichaCambios.caja = cajaForm;
          fichaTieneCambios = true;
        }

        const puertasForm = formValue.auto.fichaTecnica.puertas !== null && formValue.auto.fichaTecnica.puertas !== undefined && formValue.auto.fichaTecnica.puertas !== '' 
          ? Number(formValue.auto.fichaTecnica.puertas) 
          : null;
        const puertasOriginal = Number(this.publicacionEditando.auto.fichaTecnica.puertas);
        if (puertasForm !== null && puertasForm !== puertasOriginal) {
          fichaCambios.puertas = String(puertasForm);
          fichaTieneCambios = true;
        }

        const potenciaForm = (formValue.auto.fichaTecnica.potencia || '').trim();
        const potenciaOriginal = String(this.publicacionEditando.auto.fichaTecnica.potencia || '').trim();
        if (potenciaForm !== potenciaOriginal && potenciaForm !== '') {
          fichaCambios.potencia = potenciaForm;
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
          this.notificationService.success('¡Publicación actualizada con éxito!');
          this.cancelarEdicion();
          this.cargarPublicacionesPendientes();
          this.cargarResumenEstados();
        },
        error: (error) => {
          this.notificationService.error(`Error al actualizar la publicación: ${error.message}`);
        }
      });
    } else {
      this.publicacionService.actualizarPublicacion(
        this.publicacionEditando.id,
        datosAEnviar
      ).subscribe({
        next: (respuesta) => {
          this.notificationService.success('¡Publicación actualizada con éxito!');
          this.cancelarEdicion();
          this.cargarPublicacionesPendientes();
          this.cargarResumenEstados();
        },
        error: (error) => {
          this.notificationService.error(`Error al actualizar la publicación: ${error.message}`);
        }
      });
    }
  }

  public getImageUrl = getImageUrl;
}