import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Registro } from './registro';

describe('Registro', () => {
  let fixture: ComponentFixture<Registro>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: [] }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function completarForm(): void {
    fixture.componentInstance.form.setValue({
      nombre: 'Ana',
      apellido: 'Gomez',
      email: 'ana@test.com',
      telefono: '1122334455',
      password: 'password123',
    });
  }

  it('deberia crearse', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('no envia si el formulario es invalido', () => {
    fixture.componentInstance.enviar();

    httpMock.expectNone(`${environment.apiUrl}/auth/register`);
    expect(fixture.componentInstance.form.controls.nombre.touched).toBe(true);
  });

  it('al registrarse con exito redirige a login', () => {
    const navigateSpy = spyOn(router, 'navigate');
    completarForm();

    fixture.componentInstance.enviar();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush({
      id: '1',
      nombre: 'Ana',
      apellido: 'Gomez',
      email: 'ana@test.com',
      telefono: '1122334455',
      fechaAlta: new Date().toISOString(),
    });

    expect(navigateSpy).toHaveBeenCalledWith(['/login'], { queryParams: { registrado: '1' } });
  });

  it('muestra el error de email duplicado que devuelve el back', () => {
    completarForm();
    fixture.componentInstance.enviar();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    req.flush({ error: 'El email ya esta registrado' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBe('El email ya esta registrado');
    expect(fixture.componentInstance.enviando()).toBe(false);
  });

  it('muestra el error de password corta que devuelve el back', () => {
    completarForm();
    fixture.componentInstance.enviar();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    req.flush(
      { error: 'La contraseña debe tener al menos 8 caracteres' },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBe('La contraseña debe tener al menos 8 caracteres');
  });
});
