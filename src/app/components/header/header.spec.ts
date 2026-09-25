import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let router: Router;

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
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deberia crearse', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('no muestra el menu de sesion si no hay token', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Cerrar sesión');
  });

  it('muestra el menu de sesion si hay token guardado', () => {
    localStorage.setItem('ah-token', 'un-token-jwt');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cerrar sesión');
  });

  it('muestra el link a configuracion si hay token guardado', () => {
    localStorage.setItem('ah-token', 'un-token-jwt');
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a[href="/configuracion"]');
    expect(link).toBeTruthy();
  });

  it('no muestra el link a configuracion si no hay token', () => {
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a[href="/configuracion"]');
    expect(link).toBeFalsy();
  });

  it('cerrar sesion borra el token y redirige a login', () => {
    localStorage.setItem('ah-token', 'un-token-jwt');
    fixture.detectChanges();
    const navigateSpy = spyOn(router, 'navigate');

    fixture.componentInstance.cerrarSesion();

    expect(localStorage.getItem('ah-token')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
