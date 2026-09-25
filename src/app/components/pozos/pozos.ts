import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Pozo, PozosService } from '../../services/pozos.service';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'app-pozos',
  standalone: true,
  imports: [Spinner],
  templateUrl: './pozos.html',
  styleUrl: './pozos.css',
})
export class Pozos implements OnInit {
  private readonly pozosSvc = inject(PozosService);

  readonly pozos = signal<Pozo[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarPozos();
  }

  /** Reintenta el pedido tras un error (boton "Reintentar"). */
  reintentar(): void {
    this.cargarPozos();
  }

  /** Porcentaje de progreso 0-100, acotado, para la barra de cada tarjeta. */
  progreso(pozo: Pozo): number {
    if (pozo.montoObjetivo <= 0) return 0;
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

  private cargarPozos(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.pozosSvc.listar().subscribe({
      next: (pozos) => {
        this.pozos.set(pozos);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.error ?? 'No se pudieron cargar los pozos. Revisa tu conexion.');
        this.cargando.set(false);
      },
    });
  }
}
