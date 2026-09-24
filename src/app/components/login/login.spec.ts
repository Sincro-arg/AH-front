import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Login } from './login';
import { ThemeService } from '../../services/theme.service';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let httpMock: HttpTestingController;
  let router: Router;
  let themeService: ThemeService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '', children: [] }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  function completarForm(): void {
    fixture.componentInstance.form.setValue({
      email: 'ana@test.com',
      password: 'password123',
    });
  }

  it('deberia crearse', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('no envia si el formulario es invalido', () => {
    fixture.componentInstance.enviar();

    httpMock.expectNone(`${environment.apiUrl}/auth/login`);
    expect(fixture.componentInstance.form.controls.email.touched).toBe(true);
  });

  it('al loguearse con exito guarda el token y redirige a home', () => {
    const navigateSpy = spyOn(router, 'navigate');
    spyOn(themeService, 'set');
    completarForm();

    fixture.componentInstance.enviar();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({
      token: 'un-token-jwt',
      usuario: {
        id: '1',
        nombre: 'Ana',
        apellido: 'Gomez',
        email: 'ana@test.com',
        telefono: '1122334455',
        tema: 'claro',
        fechaAlta: new Date().toISOString(),
      },
    });

    expect(localStorage.getItem('ah-token')).toBe('un-token-jwt');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('sincroniza el tema del usuario con ThemeService al loguearse', () => {
    spyOn(themeService, 'set');
    completarForm();

    fixture.componentInstance.enviar();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({
      token: 'un-token-jwt',
      usuario: {
        id: '1',
        nombre: 'Ana',
        apellido: 'Gomez',
        email: 'ana@test.com',
        telefono: '1122334455',
        tema: 'oscuro',
        fechaAlta: new Date().toISOString(),
      },
    });

    expect(themeService.set).toHaveBeenCalledWith('oscuro');
  });

  it('muestra un mensaje generico si las credenciales son incorrectas', () => {
    completarForm();
    fixture.componentInstance.enviar();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(
      { error: 'Email o contraseña incorrectos' },
      { status: 401, statusText: 'Unauthorized' },
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBe('Email o contraseña incorrectos');
    expect(fixture.componentInstance.enviando()).toBe(false);
    expect(localStorage.getItem('ah-token')).toBeNull();
  });

  it('muestra un aviso si no hay conexion con el back', () => {
    completarForm();
    fixture.componentInstance.enviar();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBe(
      'No se pudo conectar con el servidor. Probá de nuevo en un momento.',
    );
  });
});
