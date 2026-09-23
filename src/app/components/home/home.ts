import { Component, inject, OnInit, signal } from '@angular/core';
import { DemoUsuario, UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly usuariosSvc = inject(UsuariosService);

  readonly usuarios = signal<DemoUsuario[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.usuariosSvc.getDemoUsuarios().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de usuarios.');
        this.cargando.set(false);
      },
    });
  }
}
