import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService, TOKEN_KEY } from '../../services/auth.service';
import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let router: Router;
  let authSvc: AuthService;

  const usuarioMock = {
    id: '1',
    nombre: 'Ana',
    apellido: 'Gomez',
    email: 'ana@test.com',
    telefono: '1122334455',
    tema: 'claro' as const,
    fechaAlta: new Date().toISOString(),
    ultimoAcceso: new Date().toISOString(),
    notificacionesEmail: true,
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: [] }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    router = TestBed.inject(Router);
    authSvc = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deberia crearse', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('no muestra el menu de sesion si no hay usuario logueado', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Salir');
  });

  it('muestra el menu de sesion si hay un usuario logueado', () => {
    authSvc.actualizarUsuarioActual(usuarioMock);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Salir');
  });

  it('muestra el link a configuracion si hay un usuario logueado', () => {
    authSvc.actualizarUsuarioActual(usuarioMock);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a[href="/configuracion"]');
    expect(link).toBeTruthy();
  });

  it('no muestra el link a configuracion si no hay usuario logueado', () => {
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a[href="/configuracion"]');
    expect(link).toBeFalsy();
  });

  it('cerrar sesion borra el token y redirige al inicio', () => {
    localStorage.setItem(TOKEN_KEY, 'un-token-jwt');
    authSvc.actualizarUsuarioActual(usuarioMock);
    fixture.detectChanges();
    const navigateSpy = spyOn(router, 'navigate');

    fixture.componentInstance.logout();

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});
