import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { Landing } from './landing';

describe('Landing', () => {
  let fixture: ComponentFixture<Landing>;
  let httpMock: HttpTestingController;

  const pozosUrl = `${environment.apiUrl}/pozos`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [provideHttpClient(), provideHttpClientTesting()],
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

  it('muestra siempre el cartel principal, sin depender de la conexion', () => {
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('PozoAuto');
    expect(texto).toContain('En construccion');

    httpMock.expectOne(pozosUrl).flush([]);
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
