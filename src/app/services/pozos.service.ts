import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type EstadoPozo = 'Abierto' | 'Comprado' | 'Vendido';

export interface Pozo {
  id: string;
  titulo: string;
  autoDescripcion: string;
  montoObjetivo: number;
  montoRecaudado: number;
  estado: EstadoPozo;
  fechaCreacion: string;
  precioCompra: number | null;
  fechaCompra: string | null;
  precioVenta: number | null;
  fechaVenta: string | null;
}

export interface InversionResumen {
  id: string;
  usuarioId: string;
  nombreInversor: string;
  monto: number;
  fecha: string;
}

export interface PozoDetalle extends Pozo {
  inversiones: InversionResumen[];
}

export interface DatosPozo {
  titulo: string;
  autoDescripcion: string;
  montoObjetivo: number;
}

@Injectable({ providedIn: 'root' })
export class PozosService {
  private readonly http = inject(HttpClient);

  listar() {
    return this.http.get<Pozo[]>(`${environment.apiUrl}/pozos`);
  }

  obtener(id: string) {
    return this.http.get<PozoDetalle>(`${environment.apiUrl}/pozos/${id}`);
  }

  crear(datos: DatosPozo) {
    return this.http.post<Pozo>(`${environment.apiUrl}/pozos`, datos);
  }

  actualizar(id: string, datos: DatosPozo) {
    return this.http.put<Pozo>(`${environment.apiUrl}/pozos/${id}`, datos);
  }

  eliminar(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/pozos/${id}`);
  }
}
