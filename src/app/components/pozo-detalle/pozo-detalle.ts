import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InversionesService } from '../../services/inversiones.service';
import { PozoDetalle as PozoDetalleModelo, PozosService } from '../../services/pozos.service';
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
