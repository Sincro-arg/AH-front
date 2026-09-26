import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Logo } from '../logo/logo';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, Logo],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.Default,
  styleUrl: './header.css',
})
export class Header {
  private readonly authSvc = inject(AuthService);

  readonly estaLogueado = this.authSvc.estaLogueado;
  readonly usuario = computed(() => this.authSvc.usuarioActual());

  /** Fecha de hoy, corta y en español, para mostrar junto al usuario. */
  readonly fechaHoy = computed(() => {
    const txt = new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  });

  logout(): void {
    this.authSvc.logout();
  }
}
