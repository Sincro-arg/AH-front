import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { InversionesService, MiInversion } from '../../services/inversiones.service';
import { Spinner } from '../spinner/spinner';

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

  readonly usuario = signal<Usuario | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly misInversiones = signal<MiInversion[]>([]);
  readonly cargandoInversiones = signal(true);

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
  }

  /** Reintenta el pedido tras un error (boton "Reintentar"). */
  reintentar(): void {
    this.cargarUsuario();
  }

  /** Monto formateado en pesos, sin decimales. */
  formatoMonto(monto: number): string {
    return monto.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    });
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
}
