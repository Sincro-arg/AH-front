import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Landing } from './landing';

describe('Landing', () => {
  let fixture: ComponentFixture<Landing>;
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
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'pozos', children: [] },
          { path: 'login', children: [] },
          { path: 'registro', children: [] },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Landing);
    authSvc = TestBed.inject(AuthService);
  });

  it('deberia crearse', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra la presentacion del producto, sin el cartel de en construccion', () => {
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('PozoAuto');
    expect(texto.toLowerCase()).not.toContain('en construccion');
    expect(texto).toContain('Invertí');
  });

  it('no muestra el indicador tecnico de conexion con el servidor', () => {
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).not.toContain('Servidor conectado');
    expect(texto).not.toContain('Sin conexion');
    expect(texto).not.toContain('Verificando conexion');
  });

  it('ofrece registrarse o ingresar si no hay usuario logueado', () => {
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Quiero invertir');
    expect(texto).toContain('Ya tengo cuenta');
  });

  it('ofrece ver los pozos si el usuario ya esta logueado', () => {
    authSvc.actualizarUsuarioActual(usuarioMock);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Ver pozos disponibles');
  });
});
