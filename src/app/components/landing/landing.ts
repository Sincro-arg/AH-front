import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
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
  private readonly router = inject(Router);

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
    {
      nombre: 'Lucia Fernandez',
      monto: 350000,
      frase: 'Arranque con un pozo y termine invirtiendo en tres al mismo tiempo, es simple de seguir.',
    },
    {
      nombre: 'Nicolas Peralta',
      monto: 620000,
      frase: 'Nunca antes habia invertido en nada y me quede tranquilo viendo cada paso del proceso.',
    },
    {
      nombre: 'Carla Medina',
      monto: 420000,
      frase: 'Lo que mas valoro es poder invertir montos chicos sin quedar afuera de pozos grandes.',
    },
    {
      nombre: 'Gaston Villalba',
      monto: 900000,
      frase: 'Ya vendi mi primer auto invertido y la plata se acredito sin vueltas, volveria a meter.',
    },
  ];

  ngOnInit(): void {
    if (this.authSvc.estaLogueado()) {
      this.router.navigate(['/cuenta']);
      return;
    }
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
