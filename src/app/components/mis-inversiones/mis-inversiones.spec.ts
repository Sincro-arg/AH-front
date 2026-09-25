import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MiInversion } from '../../services/inversiones.service';
import { MisInversiones } from './mis-inversiones';

describe('MisInversiones', () => {
  let fixture: ComponentFixture<MisInversiones>;
  let httpMock: HttpTestingController;

  const url = `${environment.apiUrl}/usuarios/me/inversiones`;

  const inversionMock: MiInversion = {
    id: '1',
    pozoId: '10',
    tituloPozo: 'Fiat Cronos 2022',
    estadoPozo: 'Abierto',
    monto: 5000,
    fecha: new Date().toISOString(),
    gananciaCorrespondiente: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisInversiones],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MisInversiones);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deberia crearse', () => {
    fixture.detectChanges();
    httpMock.expectOne(url).flush([inversionMock]);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra un estado de carga mientras espera la respuesta', () => {
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Cargando');

    httpMock.expectOne(url).flush([inversionMock]);
  });

  it('muestra el portafolio', () => {
    fixture.detectChanges();
    httpMock.expectOne(url).flush([inversionMock]);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Fiat Cronos 2022');
    expect(texto).toContain('Abierto');
  });

  it('muestra la ganancia solo si el pozo esta vendido', () => {
    fixture.detectChanges();
    httpMock
      .expectOne(url)
      .flush([{ ...inversionMock, estadoPozo: 'Vendido', gananciaCorrespondiente: 1200 }]);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Ganancia');
  });

  it('muestra un estado vacio si no hay inversiones', () => {
    fixture.detectChanges();
    httpMock.expectOne(url).flush([]);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('no invertiste');
  });

  it('muestra un estado de error si falla el pedido', () => {
    fixture.detectChanges();
    httpMock.expectOne(url).flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBeTruthy();
    expect(fixture.componentInstance.cargando()).toBeFalse();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Reintentar');
  });

  it('reintenta el pedido al hacer click en Reintentar', () => {
    fixture.detectChanges();
    httpMock.expectOne(url).flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    fixture.componentInstance.reintentar();
    fixture.detectChanges();
    expect(fixture.componentInstance.cargando()).toBeTrue();

    httpMock.expectOne(url).flush([inversionMock]);
    fixture.detectChanges();

    expect(fixture.componentInstance.inversiones()).toEqual([inversionMock]);
    expect(fixture.componentInstance.error()).toBeNull();
  });
});
