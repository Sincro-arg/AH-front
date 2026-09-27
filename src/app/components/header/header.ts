import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
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
  readonly verificandoSesion = this.authSvc.verificandoSesion;
  readonly usuario = computed(() => this.authSvc.usuarioActual());
  readonly menuOpen = signal(false);

  @ViewChild('drawer') private drawerRef?: ElementRef<HTMLElement>;
  private elementoConFocoPrevio: HTMLElement | null = null;

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

  toggleMenu(): void {
    if (this.menuOpen()) {
      this.cerrarMenu();
    } else {
      this.abrirMenu();
    }
  }

  abrirMenu(): void {
    this.elementoConFocoPrevio = document.activeElement as HTMLElement | null;
    this.menuOpen.set(true);

    setTimeout(() => {
      this.obtenerFocosDelModal()[0]?.focus();
    });
  }

  cerrarMenu(): void {
    this.menuOpen.set(false);
    this.elementoConFocoPrevio?.focus();
    this.elementoConFocoPrevio = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) {
      this.cerrarMenu();
    }
  }

  onDrawerKeydown(event: KeyboardEvent): void {
    this.atraparFoco(event);
  }

  private atraparFoco(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    const focosables = this.obtenerFocosDelModal();
    if (focosables.length === 0) {
      return;
    }
    const primero = focosables[0];
    const ultimo = focosables[focosables.length - 1];

    if (event.shiftKey && document.activeElement === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primero.focus();
    }
  }

  private obtenerFocosDelModal(): HTMLElement[] {
    const modal = this.drawerRef?.nativeElement;
    if (!modal) {
      return [];
    }
    return Array.from(
      modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );
  }
}
