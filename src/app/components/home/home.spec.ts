import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Home } from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let httpMock: HttpTestingController;
  let router: Router;

  const usuarioMock = {
    id: '1',
    nombre: 'Ana',
    apellido: 'Gomez',
    email: 'ana@test.com',
    telefono: '1122334455',
    tema: 'claro' as const,
    fechaAlta: new Date().toISOString(),
  };

  beforeEach(async () => {
    localStorage.setItem('ah-token', 'un-token-jwt');

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: [] }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deberia crearse y mostrar los datos del usuario logueado', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/me`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer un-token-jwt');
    req.flush(usuarioMock);

    fixture.detectChanges();

    expect(fixture.componentInstance.usuario()?.nombre).toBe('Ana');
    expect(fixture.nativeElement.textContent).toContain('Hola, Ana');
  });

  it('muestra un mensaje de error si falla la carga', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/me`);
    req.flush({ error: 'Token inválido' }, { status: 401, statusText: 'Unauthorized' });

    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBe('No se pudieron cargar los datos de tu cuenta.');
  });

  it('cerrar sesion borra el token y redirige a login', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/usuarios/me`).flush(usuarioMock);

    const navigateSpy = spyOn(router, 'navigate');

    fixture.componentInstance.cerrarSesion();

    expect(localStorage.getItem('ah-token')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
