import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, Tema, Usuario } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authSvc = inject(AuthService);
  private readonly usuariosSvc = inject(UsuariosService);
  private readonly themeSvc = inject(ThemeService);

  readonly usuario = signal<Usuario | null>(null);

  readonly perfilForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    telefono: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    passwordActual: ['', [Validators.required]],
    passwordNueva: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly perfilEnviando = signal(false);
  readonly perfilError = signal<string | null>(null);
  readonly perfilExito = signal(false);

  readonly passwordEnviando = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordExito = signal(false);

  readonly temaEnviando = signal(false);
  readonly temaError = signal<string | null>(null);

  ngOnInit(): void {
    this.usuariosSvc.obtenerMe().subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.authSvc.actualizarUsuarioActual(usuario);
        this.perfilForm.setValue({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          telefono: usuario.telefono,
          email: usuario.email,
        });
      },
    });
  }

  guardarPerfil(): void {
    if (this.perfilForm.invalid || this.perfilEnviando()) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    this.perfilEnviando.set(true);
    this.perfilError.set(null);
    this.perfilExito.set(false);

    this.usuariosSvc.actualizarMe(this.perfilForm.getRawValue()).subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.authSvc.actualizarUsuarioActual(usuario);
        this.perfilEnviando.set(false);
        this.perfilExito.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.perfilError.set(err.error?.error ?? 'No se pudo actualizar el perfil.');
        this.perfilEnviando.set(false);
      },
    });
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid || this.passwordEnviando()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordEnviando.set(true);
    this.passwordError.set(null);
    this.passwordExito.set(false);

    this.usuariosSvc.cambiarPassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.passwordEnviando.set(false);
        this.passwordExito.set(true);
        this.passwordForm.reset({ passwordActual: '', passwordNueva: '' });
      },
      error: (err: HttpErrorResponse) => {
        this.passwordError.set(err.error?.error ?? 'No se pudo cambiar la contraseña.');
        this.passwordEnviando.set(false);
      },
    });
  }

  cambiarTema(tema: Tema): void {
    if (this.temaEnviando() || this.usuario()?.tema === tema) {
      return;
    }

    this.temaEnviando.set(true);
    this.temaError.set(null);

    this.usuariosSvc.cambiarTema(tema).subscribe({
      next: ({ tema }) => {
        const actual = this.usuario();
        if (actual) {
          const actualizado = { ...actual, tema };
          this.usuario.set(actualizado);
          this.authSvc.actualizarUsuarioActual(actualizado);
        }
        this.themeSvc.set(tema);
        this.temaEnviando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.temaError.set(err.error?.error ?? 'No se pudo cambiar el tema.');
        this.temaEnviando.set(false);
      },
    });
  }
}
