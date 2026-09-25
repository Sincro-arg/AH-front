import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly authSvc = inject(AuthService);
  private readonly usuariosSvc = inject(UsuariosService);

  readonly usuario = signal<Usuario | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

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
  }

  /** Reintenta el pedido tras un error (boton "Reintentar"). */
  reintentar(): void {
    this.cargarUsuario();
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
}
