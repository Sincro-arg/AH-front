import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService, TOKEN_KEY } from './auth.service';
import { ThemeService } from './theme.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let themeSvc: ThemeService;

  const usuarioMock = {
    id: '1',
    nombre: 'Ana',
    apellido: 'Gomez',
    email: 'ana@test.com',
    telefono: '',
    tema: 'oscuro' as const,
    fechaAlta: new Date().toISOString(),
    ultimoAcceso: new Date().toISOString(),
    notificacionesEmail: true,
  };

  beforeEach(() => {
    localStorage.removeItem(TOKEN_KEY);

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    themeSvc = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(TOKEN_KEY);
  });

  it('guarda el token y el usuario al loguearse correctamente', () => {
    service.login('ana@test.com', 'unaPassword1').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'un-token', usuario: usuarioMock });

    expect(localStorage.getItem(TOKEN_KEY)).toBe('un-token');
    expect(service.usuarioActual()).toEqual(usuarioMock);
  });

  it('sincroniza el tema del usuario con ThemeService al loguearse', () => {
    const setSpy = spyOn(themeSvc, 'set');

    service.login('ana@test.com', 'unaPassword1').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ token: 'un-token', usuario: usuarioMock });

    expect(setSpy).toHaveBeenCalledWith('oscuro');
  });
});

describe('AuthService al recargar la app con sesion activa', () => {
  let httpMock: HttpTestingController;
  let themeSvc: ThemeService;

  beforeEach(() => {
    localStorage.setItem(TOKEN_KEY, 'un-token-existente');

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    themeSvc = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(TOKEN_KEY);
  });

  it('sincroniza el tema del usuario con ThemeService al cargar el usuario actual desde el token guardado', () => {
    const setSpy = spyOn(themeSvc, 'set');

    // El constructor de AuthService dispara cargarUsuarioActual() porque ya hay token en localStorage.
    TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/me`);
    expect(req.request.method).toBe('GET');
    req.flush({
      id: '1',
      nombre: 'Ana',
      apellido: 'Gomez',
      email: 'ana@test.com',
      telefono: '',
      tema: 'oscuro',
      fechaAlta: new Date().toISOString(),
      ultimoAcceso: new Date().toISOString(),
      notificacionesEmail: true,
    });

    expect(setSpy).toHaveBeenCalledWith('oscuro');
  });
});
