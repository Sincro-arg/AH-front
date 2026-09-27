import { Component, ElementRef, TemplateRef, input, output, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Pozo } from '../../services/pozos.service';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'app-carrusel-pozos',
  standalone: true,
  imports: [Spinner, NgTemplateOutlet],
  templateUrl: './carrusel-pozos.html',
  styleUrl: './carrusel-pozos.css',
})
export class CarruselPozos {
  readonly titulo = input.required<string>();
  readonly pozos = input<Pozo[]>([]);
  readonly cargando = input(false);
  readonly error = input<string | null>(null);
  readonly mensajeVacio = input('Todavia no hay pozos para mostrar.');

  /** Contenido extra opcional por tarjeta (por ejemplo, precio estimado o dias desde apertura). */
  readonly extraTemplate = input<TemplateRef<{ $implicit: Pozo }> | null>(null);

  readonly reintentar = output<void>();

  private readonly carruselRef = viewChild<ElementRef<HTMLDivElement>>('carrusel');

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

  /** Desplaza el carrusel un ancho de tarjeta hacia adelante o atras. */
  desplazarCarrusel(direccion: 1 | -1): void {
    const el = this.carruselRef()?.nativeElement;
    if (!el) return;
    const item = el.querySelector<HTMLElement>('.carrusel-pozos__item');
    const ancho = (item?.offsetWidth ?? el.clientWidth) + 16;
    el.scrollBy({ left: direccion * ancho, behavior: 'smooth' });
  }
}
