import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { PozoDetalle as PozoDetalleModelo } from '../../services/pozos.service';
import { Inversion } from '../../services/inversiones.service';
import { PozoDetalle } from './pozo-detalle';

describe('PozoDetalle', () => {
  let fixture: ComponentFixture<PozoDetalle>;
  let httpMock: HttpTestingController;

  const pozoUrl = `${environment.apiUrl}/pozos/1`;
  const inversionesUrl = `${environment.apiUrl}/pozos/1/inversiones`;

  const pozoMock: PozoDetalleModelo = {
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
    inversiones: [
      { id: 'i1', usuarioId: 'u1', nombreInversor: 'Juan Perez', monto: 4000, fecha: new Date().toISOString() },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PozoDetalle],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PozoDetalle);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deberia crearse', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozoUrl).flush(pozoMock);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra un estado de carga mientras espera la respuesta', () => {
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Cargando');

    httpMock.expectOne(pozoUrl).flush(pozoMock);
  });

  it('muestra los datos del pozo y sus inversores', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozoUrl).flush(pozoMock);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Fiat Cronos 2022');
    expect(texto).toContain('Juan Perez');
  });

  it('muestra un estado de error si falla el pedido', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozoUrl).flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBeTruthy();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Reintentar');
  });

  it('muestra el formulario de invertir solo si el pozo esta Abierto', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozoUrl).flush({ ...pozoMock, estado: 'Vendido' });
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).not.toContain('Invertir en este pozo');
  });

  it('invierte y muestra confirmacion, recargando el pozo', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozoUrl).flush(pozoMock);
    fixture.detectChanges();

    fixture.componentInstance.invertirForm.setValue({ monto: 500 });
    fixture.componentInstance.invertir();

    const inversionMock: Inversion = { id: 'i2', pozoId: '1', usuarioId: 'u1', monto: 500, fecha: new Date().toISOString() };
    httpMock.expectOne(inversionesUrl).flush(inversionMock);

    httpMock.expectOne(pozoUrl).flush({ ...pozoMock, montoRecaudado: 4500 });
    fixture.detectChanges();

    expect(fixture.componentInstance.invertirExito()).toBeTrue();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Inversion registrada correctamente');
  });
});
