import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { AuthService, LoginResponse } from './auth.service';
import { ThemeService } from './theme.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let themeService: ThemeService;

  const respuestaLogin: LoginResponse = {
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
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    themeService = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('guarda el token en localStorage tras un login exitoso', () => {
    service.login({ email: 'ana@test.com', password: 'password123' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(respuestaLogin);

    expect(localStorage.getItem('ah-token')).toBe('un-token-jwt');

    // ThemeService.set ya encuentra el token guardado y sincroniza el tema
    // contra el back; esa request tambien hay que responderla.
    const reqTema = httpMock.expectOne(`${environment.apiUrl}/usuarios/me/tema`);
    reqTema.flush({ tema: 'oscuro' });
  });

  it('sincroniza el tema del usuario con ThemeService tras un login exitoso', () => {
    spyOn(themeService, 'set');

    service.login({ email: 'ana@test.com', password: 'password123' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(respuestaLogin);

    expect(themeService.set).toHaveBeenCalledWith('oscuro');
  });
});
