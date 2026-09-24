import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.Default,
  styleUrl: './header.css',
})
export class Header {
  private readonly authSvc = inject(AuthService);

  readonly estaLogueado = this.authSvc.estaLogueado;
  readonly usuario = computed(() => this.authSvc.usuarioActual());

  logout(): void {
    this.authSvc.logout();
  }
}
