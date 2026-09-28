import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Pozo } from '../../services/pozos.service';
import { Landing } from './landing';

describe('Landing', () => {
  let fixture: ComponentFixture<Landing>;
  let httpMock: HttpTestingController;

  const pozosUrl = `${environment.apiUrl}/pozos`;

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
    httpMock.expectOne(pozosUrl).flush([]);
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('PozoAuto');
    expect(texto.toLowerCase()).not.toContain('en construccion');
    expect(texto).toContain('Invertí');
  });

  it('no muestra el indicador tecnico de conexion con el servidor', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush([]);
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).not.toContain('Servidor conectado');
    expect(texto).not.toContain('Sin conexion');
    expect(texto).not.toContain('Verificando conexion');
  });

  it('muestra los testimonios con el aviso de que son de ejemplo', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush([]);

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Lo que dicen nuestros inversores');
    expect(texto).toContain('Testimonios de ejemplo, no corresponden a inversores reales.');
  });

  it('muestra la seccion "Como funciona" con sus beneficios', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush([]);

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Como funciona PozoAuto');
    expect(texto).toContain('Diversifica tu inversion');
    expect(texto).toContain('Transparencia total');
  });

  it('ofrece registrarse o ingresar si no hay usuario logueado', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush([]);

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Quiero invertir');
    expect(texto).toContain('Ya tengo cuenta');
  });

  it('llama a PozosService.listar() y muestra el estado vacio cuando no hay pozos', () => {
    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush([]);
    fixture.detectChanges();

    expect(fixture.componentInstance.pozosRecientes()).toEqual([]);
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Todavia no hay pozos para mostrar.');
  });

  it('ordena los pozos recientes por fechaCreacion descendente y toma los primeros 6', () => {
    const pozosMock: Pozo[] = Array.from({ length: 8 }, (_, i) => ({
      id: `pozo-${i}`,
      titulo: `Pozo ${i}`,
      autoDescripcion: 'auto',
      montoObjetivo: 1000,
      montoRecaudado: 0,
      estado: 'Abierto',
      fechaCreacion: new Date(2024, 0, i + 1).toISOString(),
      precioCompra: null,
      fechaCompra: null,
      precioVenta: null,
      fechaVenta: null,
      imagenUrl: null,
      precioVentaEstimado: null,
    }));

    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush(pozosMock);
    fixture.detectChanges();

    const recientes = fixture.componentInstance.pozosRecientes();
    expect(recientes.length).toBe(6);
    expect(recientes[0].id).toBe('pozo-7');
    expect(recientes[5].id).toBe('pozo-2');
  });

  it('el carrusel muestra la cantidad correcta de tarjetas cuando hay varios pozos', () => {
    const pozosMock: Pozo[] = Array.from({ length: 3 }, (_, i) => ({
      id: `pozo-${i}`,
      titulo: `Pozo ${i}`,
      autoDescripcion: 'auto',
      montoObjetivo: 1000,
      montoRecaudado: 200,
      estado: 'Abierto',
      fechaCreacion: new Date(2024, 0, i + 1).toISOString(),
      precioCompra: null,
      fechaCompra: null,
      precioVenta: null,
      fechaVenta: null,
      imagenUrl: null,
      precioVentaEstimado: null,
    }));

    fixture.detectChanges();
    httpMock.expectOne(pozosUrl).flush(pozosMock);
    fixture.detectChanges();

    const tarjetas = (fixture.nativeElement as HTMLElement).querySelectorAll('.carrusel-pozos__item');
    expect(tarjetas.length).toBe(3);
  });

  it('muestra el estado de error del carrusel cuando falla el pedido de pozos', () => {
    fixture.detectChanges();
    httpMock
      .expectOne(pozosUrl)
      .flush({ error: 'No se pudieron cargar los pozos recientes.' }, { status: 0, statusText: 'Unknown Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.errorPozos()).toBeTruthy();
    expect(fixture.componentInstance.cargandoPozos()).toBeFalse();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('No se pudieron cargar los pozos recientes.');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.carrusel-pozos__item').length).toBe(0);
  });
});
