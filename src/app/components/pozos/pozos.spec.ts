import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Pozo } from '../../services/pozos.service';
import { Pozos } from './pozos';

describe('Pozos', () => {
  let fixture: ComponentFixture<Pozos>;
  let httpMock: HttpTestingController;

  const pozosUrl = `${environment.apiUrl}/pozos`;

  const pozoMock: Pozo = {
    id: '1',
    titulo: 'Fiat Cronos 2022',
    autoDescripcion: 'Fiat Cronos 2022, 30.000km',
    montoObjetivo: 10000,
    montoRecaudado: 4000,
    estado: 'Abierto',
    fechaCreacion: new Date().toISOString(),
    precioCompra: null,
    fechaCompra: null,
    precioVenta: null,
    fechaVenta: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pozos],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Pozos);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deberia crearse', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush([pozoMock]);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra un estado de carga mientras espera la respuesta', () => {
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Cargando');

    httpMock.expectOne(pozosUrl).flush([pozoMock]);
  });

  it('muestra el listado de pozos', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush([pozoMock]);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Fiat Cronos 2022');
    expect(texto).toContain('Abierto');
  });

  it('muestra un estado vacio si no hay pozos', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush([]);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Todavia no hay pozos');
  });

  it('muestra un estado de error si falla el pedido', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBeTruthy();
    expect(fixture.componentInstance.cargando()).toBeFalse();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Reintentar');
  });

  it('reintenta el pedido al hacer click en Reintentar', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    fixture.componentInstance.reintentar();
    fixture.detectChanges();
    expect(fixture.componentInstance.cargando()).toBeTrue();

    httpMock.expectOne(pozosUrl).flush([pozoMock]);
    fixture.detectChanges();

    expect(fixture.componentInstance.pozos()).toEqual([pozoMock]);
    expect(fixture.componentInstance.error()).toBeNull();
  });

  it('calcula el progreso como porcentaje acotado entre 0 y 100', () => {
    expect(fixture.componentInstance.progreso(pozoMock)).toBe(40);
    expect(
      fixture.componentInstance.progreso({ ...pozoMock, montoRecaudado: 20000 }),
    ).toBe(100);
    expect(fixture.componentInstance.progreso({ ...pozoMock, montoObjetivo: 0 })).toBe(0);
  });
});
