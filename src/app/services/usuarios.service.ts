import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface DemoUsuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);

  getDemoUsuarios() {
    return this.http.get<DemoUsuario[]>(`${environment.apiUrl}/auth/demo-usuarios`);
  }
}
