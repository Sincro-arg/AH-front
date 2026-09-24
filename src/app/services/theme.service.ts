import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type Tema = 'claro' | 'oscuro';

const STORAGE_KEY = 'ah-tema';
const TOKEN_KEY = 'ah-token';

/** Maneja el tema claro/oscuro de la app: lo aplica al documento, lo persiste
 * en localStorage para que sobreviva a un refresh sin sesion, y si hay un
 * usuario logueado lo sincroniza con su cuenta via PUT /usuarios/me/tema. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly http = inject(HttpClient);

  readonly tema = signal<Tema>(this.leerInicial());

  constructor() {
    effect(() => {
      const tema = this.tema();
      document.documentElement.setAttribute('data-theme', tema);
      localStorage.setItem(STORAGE_KEY, tema);
    });
  }

  toggle(): void {
    this.set(this.tema() === 'oscuro' ? 'claro' : 'oscuro');
  }

  set(tema: Tema): void {
    this.tema.set(tema);

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    this.http
      .put(
        `${environment.apiUrl}/usuarios/me/tema`,
        { tema },
        { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) },
      )
      .subscribe({
        error: () => {
          // Si falla (sin red, sesion vencida, etc.) el tema ya quedo aplicado
          // y guardado localmente; no hace falta romper la UI por esto.
        },
      });
  }

  private leerInicial(): Tema {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado === 'oscuro' ? 'oscuro' : 'claro';
  }
}
