import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Home } from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let authSvc: AuthService;

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
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    authSvc = TestBed.inject(AuthService);
  });

  it('deberia crearse', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra los datos del usuario logueado', () => {
    authSvc.actualizarUsuarioActual(usuarioMock);
    fixture.detectChanges();

    expect(fixture.componentInstance.usuario()).toEqual(usuarioMock);
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Ana');
    expect(texto).toContain('ana@test.com');
  });
});
