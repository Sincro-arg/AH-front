import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { MiInversion } from '../../services/inversiones.service';
import { Home } from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let httpMock: HttpTestingController;

  const meUrl = `${environment.apiUrl}/usuarios/me`;
  const inversionesUrl = `${environment.apiUrl}/usuarios/me/inversiones`;

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

  const misInversionesMock: MiInversion[] = [
    {
      id: 'inv-1',
      pozoId: 'pozo-1',
      tituloPozo: 'Pozo Norte',
      estadoPozo: 'Comprado',
      monto: 1000,
      fecha: new Date().toISOString(),
      gananciaCorrespondiente: null,
    },
    {
      id: 'inv-2',
      pozoId: 'pozo-2',
      tituloPozo: 'Pozo Sur',
      estadoPozo: 'Vendido',
      monto: 500,
      fecha: new Date().toISOString(),
      gananciaCorrespondiente: 200,
    },
    {
      id: 'inv-3',
      pozoId: 'pozo-1',
      tituloPozo: 'Pozo Norte',
      estadoPozo: 'Comprado',
      monto: 300,
      fecha: new Date().toISOString(),
      gananciaCorrespondiente: null,
    },
  ];

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
    httpMock.expectOne(inversionesUrl).flush([]);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra un estado de carga mientras espera la respuesta', () => {
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Cargando');

    httpMock.expectOne(meUrl).flush(usuarioMock);
    httpMock.expectOne(inversionesUrl).flush([]);
  });

  it('muestra los datos del usuario logueado', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush(usuarioMock);
    httpMock.expectOne(inversionesUrl).flush([]);
    fixture.detectChanges();

    expect(fixture.componentInstance.usuario()).toEqual(usuarioMock);
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Ana');
    expect(texto).toContain('ana@test.com');
  });

  it('muestra "Primera vez" cuando ultimoAcceso es null', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush({ ...usuarioMock, ultimoAcceso: null });
    httpMock.expectOne(inversionesUrl).flush([]);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Primera vez');
  });

  it('muestra un estado de error real (no se queda en Cargando) si falla el pedido', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush({ error: 'No se pudo conectar' }, { status: 0, statusText: 'Unknown Error' });
    httpMock.expectOne(inversionesUrl).flush([]);
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
    httpMock.expectOne(inversionesUrl).flush([]);
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
    httpMock.expectOne(inversionesUrl).flush([]);

    const authSvc = TestBed.inject(AuthService);
    expect(authSvc.usuarioActual()).toEqual(usuarioMock);
  });

  it('calcula totalInvertido, gananciaTotal y cantidadPozosActivos a partir de mis inversiones', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush(usuarioMock);
    httpMock.expectOne(inversionesUrl).flush(misInversionesMock);
    fixture.detectChanges();

    // totalInvertido: suma de montos en pozos que no estan Vendidos (1000 + 300)
    expect(fixture.componentInstance.totalInvertido()).toBe(1300);
    // gananciaTotal: suma de gananciaCorrespondiente de todas las inversiones (0 + 200 + 0)
    expect(fixture.componentInstance.gananciaTotal()).toBe(200);
    // cantidadPozosActivos: pozos unicos no Vendidos (solo pozo-1)
    expect(fixture.componentInstance.cantidadPozosActivos()).toBe(1);
    expect(fixture.componentInstance.cargandoInversiones()).toBeFalse();
  });

  it('deja cargandoInversiones en false si falla el pedido de mis inversiones', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush(usuarioMock);
    httpMock
      .expectOne(inversionesUrl)
      .flush({ error: 'No se pudo conectar' }, { status: 0, statusText: 'Unknown Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.cargandoInversiones()).toBeFalse();
    expect(fixture.componentInstance.misInversiones()).toEqual([]);
    expect(fixture.componentInstance.totalInvertido()).toBe(0);
    expect(fixture.componentInstance.gananciaTotal()).toBe(0);
    expect(fixture.componentInstance.cantidadPozosActivos()).toBe(0);
  });
});
