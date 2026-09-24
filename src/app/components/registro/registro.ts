import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly authSvc = inject(AuthService);
  private readonly router = inject(Router);

  readonly enviando = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.enviando.set(true);

    this.authSvc.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.router.navigate(['/login'], { queryParams: { registrado: '1' } });
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.error.set(err.error?.error ?? 'No se pudo completar el registro.');
      },
    });
  }
}
