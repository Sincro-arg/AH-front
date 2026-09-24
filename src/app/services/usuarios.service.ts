import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService, UsuarioSesion } from './auth.service';

export interface ActualizarPerfilRequest {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
}

export interface CambiarPasswordRequest {
  passwordActual: string;
  passwordNueva: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly authSvc = inject(AuthService);

  getMe() {
    return this.http.get<UsuarioSesion>(`${environment.apiUrl}/usuarios/me`, {
      headers: this.authHeaders(),
    });
  }

  actualizarPerfil(datos: ActualizarPerfilRequest) {
    return this.http.put<UsuarioSesion>(`${environment.apiUrl}/usuarios/me`, datos, {
      headers: this.authHeaders(),
    });
  }

  cambiarPassword(datos: CambiarPasswordRequest) {
    return this.http.put<{ mensaje: string }>(`${environment.apiUrl}/usuarios/me/password`, datos, {
      headers: this.authHeaders(),
    });
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authSvc.getToken()}` });
  }
}
