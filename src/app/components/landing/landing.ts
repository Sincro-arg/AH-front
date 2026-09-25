import { Component, OnInit, inject, signal } from '@angular/core';
import { PozosService } from '../../services/pozos.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit {
  private readonly pozosSvc = inject(PozosService);

  /** Estado del indicador de conexion, chico y aparte del cartel principal. */
  readonly estadoConexion = signal<'cargando' | 'conectado' | 'sinConexion'>('cargando');
  readonly cantidadPozos = signal(0);

  ngOnInit(): void {
    this.pozosSvc.listar().subscribe({
      next: (pozos) => {
        this.cantidadPozos.set(pozos.length);
        this.estadoConexion.set('conectado');
      },
      error: () => {
        this.estadoConexion.set('sinConexion');
      },
    });
  }
}
