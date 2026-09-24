import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService, UsuarioSesion } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly authSvc = inject(AuthService);

  getMe() {
    return this.http.get<UsuarioSesion>(`${environment.apiUrl}/usuarios/me`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.authSvc.getToken()}` }),
    });
  }
}
