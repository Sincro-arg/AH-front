import { Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Pozo, PozosService } from '../../services/pozos.service';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, Spinner],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit {
  private readonly authSvc = inject(AuthService);
  private readonly pozosSvc = inject(PozosService);

  readonly estaLogueado = this.authSvc.estaLogueado;

  readonly pozosRecientes = signal<Pozo[]>([]);
  readonly cargandoPozos = signal(true);
  readonly errorPozos = signal<string | null>(null);

  private readonly carruselRef = viewChild<ElementRef<HTMLDivElement>>('carrusel');

  ngOnInit(): void {
    this.cargarPozosRecientes();
  }

  /** Reintenta la carga de pozos recientes tras un error (boton "Reintentar"). */
  reintentarPozos(): void {
    this.cargarPozosRecientes();
  }

  /** Monto formateado en pesos, sin decimales. */
  formatoMonto(monto: number): string {
    return monto.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    });
  }

  /** Porcentaje de recaudacion de un pozo (0 a 100), para la barra de progreso. */
  progresoPozo(pozo: Pozo): number {
    if (pozo.montoObjetivo <= 0) return 0;
    return Math.min(100, Math.round((pozo.montoRecaudado / pozo.montoObjetivo) * 100));
  }

  /** Desplaza el carrusel de pozos recientes un ancho de tarjeta hacia adelante o atras. */
  desplazarCarrusel(direccion: 1 | -1): void {
    const el = this.carruselRef()?.nativeElement;
    if (!el) return;
    const item = el.querySelector<HTMLElement>('.landing__carrusel-item');
    const ancho = (item?.offsetWidth ?? el.clientWidth) + 16;
    el.scrollBy({ left: direccion * ancho, behavior: 'smooth' });
  }

  private cargarPozosRecientes(): void {
    this.cargandoPozos.set(true);
    this.errorPozos.set(null);

    this.pozosSvc.listar().subscribe({
      next: (pozos) => {
        const ordenados = [...pozos].sort(
          (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime(),
        );
        this.pozosRecientes.set(ordenados.slice(0, 6));
        this.cargandoPozos.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorPozos.set(err.error?.error ?? 'No se pudieron cargar los pozos recientes.');
        this.cargandoPozos.set(false);
      },
    });
  }
}
