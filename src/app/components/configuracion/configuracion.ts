import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { UsuariosService } from '../../services/usuarios.service';

function passwordsCoinciden(control: AbstractControl): ValidationErrors | null {
  const nueva = control.get('passwordNueva')?.value;
  const confirmacion = control.get('passwordConfirmacion')?.value;
  return nueva === confirmacion ? null : { noCoincide: true };
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion implements OnInit {
  protected readonly theme = inject(ThemeService);
  private readonly usuariosSvc = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);

  protected readonly esOscuro = computed(() => this.theme.tema() === 'oscuro');

  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly exito = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.required],
  });

  protected readonly cambiandoPassword = signal(false);
  protected readonly errorPassword = signal<string | null>(null);
  protected readonly exitoPassword = signal<string | null>(null);

  protected readonly passwordForm = this.fb.nonNullable.group(
    {
      passwordActual: ['', Validators.required],
      passwordNueva: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirmacion: ['', Validators.required],
    },
    { validators: passwordsCoinciden },
  );

  ngOnInit(): void {
    this.usuariosSvc.getMe().subscribe({
      next: (usuario) => {
        this.form.setValue({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          telefono: usuario.telefono,
        });
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los datos de tu cuenta.');
        this.cargando.set(false);
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.exito.set(null);
    this.guardando.set(true);

    this.usuariosSvc.actualizarPerfil(this.form.getRawValue()).subscribe({
      next: () => {
        this.guardando.set(false);
        this.exito.set('Tus datos se actualizaron correctamente.');
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(err.error?.error ?? 'No se pudieron guardar los cambios.');
      },
    });
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.errorPassword.set(null);
    this.exitoPassword.set(null);
    this.cambiandoPassword.set(true);

    const { passwordActual, passwordNueva } = this.passwordForm.getRawValue();

    this.usuariosSvc.cambiarPassword({ passwordActual, passwordNueva }).subscribe({
      next: () => {
        this.cambiandoPassword.set(false);
        this.exitoPassword.set('Contraseña actualizada.');
        this.passwordForm.reset({
          passwordActual: '',
          passwordNueva: '',
          passwordConfirmacion: '',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.cambiandoPassword.set(false);
        this.errorPassword.set(err.error?.error ?? 'No se pudo cambiar la contraseña.');
      },
    });
  }
}
