import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Pozo, PozosService } from '../../services/pozos.service';
import { CarruselPozos } from '../carrusel-pozos/carrusel-pozos';

interface Testimonio {
  nombre: string;
  monto: number;
  frase: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CarruselPozos],
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

  /** Testimonios fijos para la seccion "Lo que dicen nuestros inversores". */
  readonly testimonios: Testimonio[] = [
    {
      nombre: 'Marcela Ibañez',
      monto: 250000,
      frase: 'Empece con un pozo chico para probar y ya recupere la inversion en el segundo auto.',
    },
    {
      nombre: 'Ruben Casaretto',
      monto: 500000,
      frase: 'Me gusta poder ver en tiempo real cuanto se recaudo antes de comprar el auto.',
    },
    {
      nombre: 'Florencia Otero',
      monto: 150000,
      frase: 'Diversifico entre varios pozos y asi no dependo de que se venda uno solo bien.',
    },
    {
      nombre: 'Damian Sosa',
      monto: 800000,
      frase: 'La transparencia de quien invirtio cuanto me dio confianza para meter mas plata.',
    },
  ];

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
