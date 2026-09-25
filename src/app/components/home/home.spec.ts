import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { Home } from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let httpMock: HttpTestingController;

  const meUrl = `${environment.apiUrl}/usuarios/me`;

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
      imports: [Home],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deberia crearse', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush(usuarioMock);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra un estado de carga mientras espera la respuesta', () => {
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Cargando');

    httpMock.expectOne(meUrl).flush(usuarioMock);
  });

  it('muestra los datos del usuario logueado', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush(usuarioMock);
    fixture.detectChanges();

    expect(fixture.componentInstance.usuario()).toEqual(usuarioMock);
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Ana');
    expect(texto).toContain('ana@test.com');
  });

  it('muestra "Primera vez" cuando ultimoAcceso es null', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush({ ...usuarioMock, ultimoAcceso: null });
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Primera vez');
  });

  it('muestra un estado de error real (no se queda en Cargando) si falla el pedido', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush({ error: 'No se pudo conectar' }, { status: 0, statusText: 'Unknown Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBeTruthy();
    expect(fixture.componentInstance.cargando()).toBeFalse();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).not.toContain('Cargando...');
    expect(texto).toContain('Reintentar');
  });

  it('reintenta el pedido al hacer click en Reintentar', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    fixture.componentInstance.reintentar();
    fixture.detectChanges();
    expect(fixture.componentInstance.cargando()).toBeTrue();

    httpMock.expectOne(meUrl).flush(usuarioMock);
    fixture.detectChanges();

    expect(fixture.componentInstance.usuario()).toEqual(usuarioMock);
    expect(fixture.componentInstance.error()).toBeNull();
  });

  it('sincroniza el usuario cargado con AuthService', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush(usuarioMock);

    const authSvc = TestBed.inject(AuthService);
    expect(authSvc.usuarioActual()).toEqual(usuarioMock);
  });
});
