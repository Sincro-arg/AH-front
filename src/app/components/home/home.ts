import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, UsuarioSesion } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly usuariosSvc = inject(UsuariosService);
  private readonly authSvc = inject(AuthService);
  private readonly router = inject(Router);
  private readonly themeSvc = inject(ThemeService);

  readonly usuario = signal<UsuarioSesion | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly fechaAlta = computed(() => {
    const u = this.usuario();
    return u ? new Date(u.fechaAlta).toLocaleDateString('es-AR') : '';
  });

  ngOnInit(): void {
    this.usuariosSvc.getMe().subscribe({
      next: (data) => {
        this.usuario.set(data);
        this.cargando.set(false);
        // Sincroniza el tema con el que trae la cuenta al restaurar la
        // sesion (recarga de la app con un token ya guardado), por si se
        // cambio desde otro dispositivo y todavia no se reflejo en este.
        this.themeSvc.set(data.tema);
      },
      error: () => {
        this.error.set('No se pudieron cargar los datos de tu cuenta.');
        this.cargando.set(false);
      },
    });
  }

  cerrarSesion(): void {
    this.authSvc.logout();
    this.router.navigate(['/login']);
  }
}
