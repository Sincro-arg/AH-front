import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { Landing } from './landing';

describe('Landing', () => {
  let fixture: ComponentFixture<Landing>;
  let httpMock: HttpTestingController;
  let authSvc: AuthService;

  const pozosUrl = `${environment.apiUrl}/pozos`;

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
    httpMock = TestBed.inject(HttpTestingController);
    authSvc = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deberia crearse', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush([]);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra la presentacion del producto, sin el cartel de en construccion', () => {
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('PozoAuto');
    expect(texto.toLowerCase()).not.toContain('en construccion');
    expect(texto).toContain('Invertí');

    httpMock.expectOne(pozosUrl).flush([]);
  });

  it('ofrece registrarse o ingresar si no hay usuario logueado', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush([]);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Quiero invertir');
    expect(texto).toContain('Ya tengo cuenta');
  });

  it('ofrece ver los pozos si el usuario ya esta logueado', () => {
    authSvc.actualizarUsuarioActual(usuarioMock);
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush([]);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Ver pozos disponibles');
  });

  it('muestra la cantidad de pozos cuando el servidor responde', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush([{ id: '1' }, { id: '2' }]);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Servidor conectado (2 pozos)');
  });

  it('muestra "Sin conexion" si el pedido falla, sin quedar colgado en "Verificando"', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush(null, { status: 0, statusText: 'Unknown Error' });
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Sin conexion');
    expect(texto).not.toContain('Verificando conexion');
  });
});
