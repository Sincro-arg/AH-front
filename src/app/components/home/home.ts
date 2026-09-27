import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { InversionesService, MiInversion } from '../../services/inversiones.service';
import { Pozo, PozosService } from '../../services/pozos.service';
import { Spinner } from '../spinner/spinner';

interface Testimonio {
  nombre: string;
  monto: number;
  frase: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DatePipe, RouterLink, Spinner],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly authSvc = inject(AuthService);
  private readonly usuariosSvc = inject(UsuariosService);
  private readonly inversionesSvc = inject(InversionesService);
  private readonly pozosSvc = inject(PozosService);

  readonly usuario = signal<Usuario | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly misInversiones = signal<MiInversion[]>([]);
  readonly cargandoInversiones = signal(true);

  readonly pozosRecientes = signal<Pozo[]>([]);
  readonly cargandoPozos = signal(true);
  readonly errorPozos = signal<string | null>(null);

  private readonly carruselRef = viewChild<ElementRef<HTMLDivElement>>('carrusel');

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

  /** Suma de lo invertido en pozos que todavia no se vendieron. */
  readonly totalInvertido = computed(() =>
    this.misInversiones()
      .filter((i) => i.estadoPozo !== 'Vendido')
      .reduce((acc, i) => acc + i.monto, 0),
  );

  /** Suma de la ganancia ya correspondida en pozos vendidos. */
  readonly gananciaTotal = computed(() =>
    this.misInversiones().reduce((acc, i) => acc + (i.gananciaCorrespondiente ?? 0), 0),
  );

  readonly cantidadPozosActivos = computed(
    () => new Set(this.misInversiones().filter((i) => i.estadoPozo !== 'Vendido').map((i) => i.pozoId)).size,
  );

  /** Saludo segun la hora del dia. */
  readonly saludo = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos dias';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  });

  /** Fecha de hoy formateada en español (capitalizada). */
  readonly fechaHoy = computed(() => {
    const txt = new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  });

  ngOnInit(): void {
    this.cargarUsuario();
    this.cargarInversiones();
    this.cargarPozosRecientes();
  }

  /** Reintenta el pedido tras un error (boton "Reintentar"). */
  reintentar(): void {
    this.cargarUsuario();
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

  /** Dias transcurridos desde que se creo el pozo, para mostrar "Abierto hace N dias". */
  diasDesdeApertura(pozo: Pozo): number {
    const ms = Date.now() - new Date(pozo.fechaCreacion).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  }

  /** Desplaza el carrusel de pozos recientes un ancho de tarjeta hacia adelante o atras. */
  desplazarCarrusel(direccion: 1 | -1): void {
    const el = this.carruselRef()?.nativeElement;
    if (!el) return;
    const item = el.querySelector<HTMLElement>('.home__carrusel-item');
    const ancho = (item?.offsetWidth ?? el.clientWidth) + 16;
    el.scrollBy({ left: direccion * ancho, behavior: 'smooth' });
  }

  private cargarUsuario(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.usuariosSvc.obtenerMe().subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.authSvc.actualizarUsuarioActual(usuario);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.error ?? 'No se pudo cargar tu cuenta. Revisa tu conexion.');
        this.cargando.set(false);
      },
    });
  }

  private cargarInversiones(): void {
    this.cargandoInversiones.set(true);

    this.inversionesSvc.misInversiones().subscribe({
      next: (inversiones) => {
        this.misInversiones.set(inversiones);
        this.cargandoInversiones.set(false);
      },
      error: () => {
        this.cargandoInversiones.set(false);
      },
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
