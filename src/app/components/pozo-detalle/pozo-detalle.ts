import { Component, ElementRef, HostListener, OnInit, ViewChild, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InversionesService } from '../../services/inversiones.service';
import { InversionResumen, PozoDetalle as PozoDetalleModelo, PozosService } from '../../services/pozos.service';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'app-pozo-detalle',
  standalone: true,
  imports: [Spinner, ReactiveFormsModule, RouterLink],
  templateUrl: './pozo-detalle.html',
  styleUrl: './pozo-detalle.css',
})
export class PozoDetalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly pozosSvc = inject(PozosService);
  private readonly inversionesSvc = inject(InversionesService);
  private readonly authSvc = inject(AuthService);

  private readonly pozoId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly pozo = signal<PozoDetalleModelo | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly invertirForm = this.fb.nonNullable.group({
    monto: [0, [Validators.required, Validators.min(1)]],
  });

  readonly invirtiendo = signal(false);
  readonly invertirError = signal<string | null>(null);
  readonly invertirExito = signal(false);

  readonly editForm = this.fb.nonNullable.group({
    monto: [0, [Validators.required, Validators.min(1)]],
  });

  readonly editandoInversion = signal<InversionResumen | null>(null);
  readonly editEnviando = signal(false);
  readonly editError = signal<string | null>(null);
  readonly editExito = signal(false);

  readonly eliminarObjetivo = signal<InversionResumen | null>(null);
  readonly eliminarEnviando = signal(false);
  readonly eliminarError = signal<string | null>(null);

  @ViewChild('editInversionModal') private editInversionModalRef?: ElementRef<HTMLElement>;
  @ViewChild('confirmEliminarInversionModal') private confirmEliminarInversionModalRef?: ElementRef<HTMLElement>;
  private elementoConFocoPrevio: HTMLElement | null = null;

  ngOnInit(): void {
    this.cargarPozo();
  }

  /** Reintenta el pedido tras un error (boton "Reintentar"). */
  reintentar(): void {
    this.cargarPozo();
  }

  /** Porcentaje de progreso 0-100, acotado, para la barra. */
  progreso(): number {
    const pozo = this.pozo();
    if (!pozo || pozo.montoObjetivo <= 0) return 0;
    const pct = (pozo.montoRecaudado / pozo.montoObjetivo) * 100;
    return Math.min(100, Math.max(0, Math.round(pct)));
  }

  /** Monto formateado en pesos, sin decimales. */
  formatoMonto(monto: number): string {
    return monto.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    });
  }

  /** Fecha formateada corta. */
  formatoFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR');
  }

  /** Si la inversion pertenece al usuario logueado. */
  esMia(inv: InversionResumen): boolean {
    return inv.usuarioId === this.authSvc.usuarioActual()?.id;
  }

  invertir(): void {
    if (this.invertirForm.invalid || this.invirtiendo()) {
      this.invertirForm.markAllAsTouched();
      return;
    }

    this.invirtiendo.set(true);
    this.invertirError.set(null);
    this.invertirExito.set(false);

    const { monto } = this.invertirForm.getRawValue();

    this.inversionesSvc.crear(this.pozoId, { monto }).subscribe({
      next: () => {
        this.invertirForm.reset({ monto: 0 });
        this.invirtiendo.set(false);
        this.invertirExito.set(true);
        this.cargarPozo();
      },
      error: (err: HttpErrorResponse) => {
        this.invertirError.set(err.error?.error ?? 'No se pudo registrar la inversion.');
        this.invirtiendo.set(false);
      },
    });
  }

  /** Abre el modal para editar la inversion propia. */
  abrirEditarInversion(inv: InversionResumen): void {
    this.elementoConFocoPrevio = document.activeElement as HTMLElement | null;
    this.editForm.setValue({ monto: inv.monto });
    this.editError.set(null);
    this.editExito.set(false);
    this.editandoInversion.set(inv);

    setTimeout(() => {
      this.obtenerFocosDelModal(this.editInversionModalRef)[0]?.focus();
    });
  }

  cerrarEditarInversion(): void {
    this.editandoInversion.set(null);
    this.elementoConFocoPrevio?.focus();
    this.elementoConFocoPrevio = null;
  }

  guardarInversion(): void {
    const inv = this.editandoInversion();
    if (!inv || this.editForm.invalid || this.editEnviando()) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.editEnviando.set(true);
    this.editError.set(null);
    this.editExito.set(false);

    const { monto } = this.editForm.getRawValue();

    this.inversionesSvc.actualizar(inv.id, { monto }).subscribe({
      next: () => {
        this.editEnviando.set(false);
        this.editExito.set(true);
        this.cargarPozo();
      },
      error: (err: HttpErrorResponse) => {
        this.editError.set(err.error?.error ?? 'No se pudo actualizar la inversion.');
        this.editEnviando.set(false);
      },
    });
  }

  /** Abre el modal de confirmacion para borrar la inversion propia. */
  eliminarInversion(inv: InversionResumen): void {
    if (this.eliminarEnviando()) {
      return;
    }

    this.elementoConFocoPrevio = document.activeElement as HTMLElement | null;
    this.eliminarError.set(null);
    this.eliminarObjetivo.set(inv);

    setTimeout(() => {
      this.obtenerFocosDelModal(this.confirmEliminarInversionModalRef)[0]?.focus();
    });
  }

  cancelarEliminarInversion(): void {
    this.eliminarObjetivo.set(null);
    this.elementoConFocoPrevio?.focus();
    this.elementoConFocoPrevio = null;
  }

  confirmarEliminarInversion(): void {
    const inv = this.eliminarObjetivo();
    if (!inv) {
      return;
    }

    this.eliminarObjetivo.set(null);
    this.eliminarEnviando.set(true);
    this.eliminarError.set(null);

    this.inversionesSvc.eliminar(inv.id).subscribe({
      next: () => {
        this.eliminarEnviando.set(false);
        this.cargarPozo();
      },
      error: (err: HttpErrorResponse) => {
        this.eliminarError.set(err.error?.error ?? 'No se pudo eliminar la inversion.');
        this.eliminarEnviando.set(false);
      },
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.eliminarObjetivo()) {
      this.cancelarEliminarInversion();
    } else if (this.editandoInversion()) {
      this.cerrarEditarInversion();
    }
  }

  onEditModalKeydown(event: KeyboardEvent): void {
    this.atraparFoco(event, this.editInversionModalRef);
  }

  onEliminarModalKeydown(event: KeyboardEvent): void {
    this.atraparFoco(event, this.confirmEliminarInversionModalRef);
  }

  private atraparFoco(event: KeyboardEvent, modalRef?: ElementRef<HTMLElement>): void {
    if (event.key !== 'Tab') {
      return;
    }
    const focosables = this.obtenerFocosDelModal(modalRef);
    if (focosables.length === 0) {
      return;
    }
    const primero = focosables[0];
    const ultimo = focosables[focosables.length - 1];

    if (event.shiftKey && document.activeElement === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primero.focus();
    }
  }

  private obtenerFocosDelModal(modalRef?: ElementRef<HTMLElement>): HTMLElement[] {
    const modal = modalRef?.nativeElement;
    if (!modal) {
      return [];
    }
    return Array.from(
      modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );
  }

  private cargarPozo(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.pozosSvc.obtener(this.pozoId).subscribe({
      next: (pozo) => {
        this.pozo.set(pozo);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.error ?? 'No se pudo cargar el pozo. Revisa tu conexion.');
        this.cargando.set(false);
      },
    });
  }
}
