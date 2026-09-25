import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PozosService } from '../../services/pozos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit {
  private readonly pozosSvc = inject(PozosService);
  private readonly authSvc = inject(AuthService);

  readonly estaLogueado = this.authSvc.estaLogueado;

  /** Estado del indicador de conexion, chico y aparte del cartel principal. */
  readonly estadoConexion = signal<'cargando' | 'conectado' | 'sinConexion'>('cargando');
  readonly cantidadPozos = signal(0);

  readonly haySoloUnPozo = computed(() => this.cantidadPozos() === 1);

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
