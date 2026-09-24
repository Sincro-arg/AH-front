import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Misma clave que usa ThemeService para leer el token del usuario logueado.
const TOKEN_KEY = 'ah-token';

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaAlta: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UsuarioSesion extends Usuario {
  tema: 'claro' | 'oscuro';
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioSesion;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  register(datos: RegistroRequest) {
    return this.http.post<Usuario>(`${environment.apiUrl}/auth/register`, datos);
  }

  login(datos: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, datos)
      .pipe(tap((res) => localStorage.setItem(TOKEN_KEY, res.token)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  estaLogueado(): boolean {
    return this.getToken() !== null;
  }
}
