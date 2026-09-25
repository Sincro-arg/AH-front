import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ThemeService } from './theme.service';

export type Tema = 'claro' | 'oscuro';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tema: Tema;
  fechaAlta: string;
}

export interface DatosRegistro {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
}

interface RespuestaLogin {
  token: string;
  usuario: Usuario;
}

export const TOKEN_KEY = 'ah_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly themeSvc = inject(ThemeService);

  readonly usuarioActual = signal<Usuario | null>(null);
  readonly estaLogueado = computed(() => !!this.usuarioActual());

  constructor() {
    if (this.getToken()) {
      this.cargarUsuarioActual();
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string) {
    return this.http
      .post<RespuestaLogin>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
          this.usuarioActual.set(res.usuario);
          this.themeSvc.set(res.usuario.tema);
        }),
      );
  }

  registrar(datos: DatosRegistro) {
    return this.http.post<Usuario>(`${environment.apiUrl}/auth/register`, datos);
  }

  /** Trae el usuario autenticado con el token guardado, para restaurar sesion al recargar. */
  private cargarUsuarioActual(): void {
    this.http.get<Usuario>(`${environment.apiUrl}/usuarios/me`).subscribe({
      next: (usuario) => {
        this.usuarioActual.set(usuario);
        this.themeSvc.set(usuario.tema);
      },
      error: () => this.limpiarSesion(),
    });
  }

  actualizarUsuarioActual(usuario: Usuario): void {
    this.usuarioActual.set(usuario);
  }

  private limpiarSesion(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.usuarioActual.set(null);
  }

  logout(): void {
    this.limpiarSesion();
    this.router.navigate(['/']);
  }
}
