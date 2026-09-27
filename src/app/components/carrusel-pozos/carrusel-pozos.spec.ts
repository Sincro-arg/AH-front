import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pozo } from '../../services/pozos.service';
import { CarruselPozos } from './carrusel-pozos';

describe('CarruselPozos', () => {
  let fixture: ComponentFixture<CarruselPozos>;

  const crearPozo = (overrides: Partial<Pozo> = {}): Pozo => ({
    id: 'pozo-1',
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
    imagenUrl: null,
    precioVentaEstimado: null,
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselPozos],
    }).compileComponents();

    fixture = TestBed.createComponent(CarruselPozos);
    fixture.componentRef.setInput('titulo', 'Pozos disponibles');
  });

  it('deberia crearse', () => {
    fixture.componentRef.setInput('pozos', []);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('progresoPozo', () => {
    it('devuelve 0 cuando montoObjetivo es 0, sin dividir por cero', () => {
      const pozo = crearPozo({ montoObjetivo: 0, montoRecaudado: 500 });
      expect(fixture.componentInstance.progresoPozo(pozo)).toBe(0);
    });

    it('topea en 100 cuando montoRecaudado supera montoObjetivo', () => {
      const pozo = crearPozo({ montoObjetivo: 1000, montoRecaudado: 5000 });
      expect(fixture.componentInstance.progresoPozo(pozo)).toBe(100);
    });

    it('calcula el porcentaje redondeado en el caso normal', () => {
      const pozo = crearPozo({ montoObjetivo: 10000, montoRecaudado: 4000 });
      expect(fixture.componentInstance.progresoPozo(pozo)).toBe(40);
    });
  });

  describe('formatoMonto', () => {
    it('formatea el monto en pesos argentinos, sin decimales', () => {
      const texto = fixture.componentInstance.formatoMonto(1500000);
      expect(texto).toContain('$');
      expect(texto).toContain('1.500.000');
      expect(texto).not.toContain(',00');
    });

    it('formatea el 0 como $0', () => {
      const texto = fixture.componentInstance.formatoMonto(0);
      expect(texto).toContain('0');
      expect(texto).toContain('$');
    });
  });

  describe('boton "Pozo siguiente"', () => {
    it('llama a scrollBy del contenedor del carrusel al hacer click, sin tirar error', () => {
      fixture.componentRef.setInput('pozos', [crearPozo()]);
      fixture.detectChanges();

      const nativeEl = fixture.nativeElement as HTMLElement;
      const carruselEl = nativeEl.querySelector('.carrusel-pozos__carrusel') as HTMLElement;
      const scrollBySpy = spyOn(carruselEl, 'scrollBy');

      const btnSiguiente = nativeEl.querySelector<HTMLButtonElement>(
        'button[aria-label="Pozo siguiente"]',
      );

      expect(() => btnSiguiente?.click()).not.toThrow();
      expect(scrollBySpy).toHaveBeenCalledTimes(1);
      expect(scrollBySpy.calls.mostRecent().args[0]).toEqual(
        jasmine.objectContaining({ behavior: 'smooth', left: jasmine.any(Number) }),
      );
    });
  });
});
