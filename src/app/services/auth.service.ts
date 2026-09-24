import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  register(datos: RegistroRequest) {
    return this.http.post<Usuario>(`${environment.apiUrl}/auth/register`, datos);
  }
}
