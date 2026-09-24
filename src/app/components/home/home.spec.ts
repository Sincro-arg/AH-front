import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { Home } from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let httpMock: HttpTestingController;

  const demoUsuariosUrl = `${environment.apiUrl}/auth/demo-usuarios`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deberia crearse', () => {
    fixture.detectChanges();
    httpMock.expectOne(demoUsuariosUrl).flush([]);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deberia cargar la lista de usuarios cuando el servicio responde OK', () => {
    const usuariosMock = [
      { id: '1', nombre: 'Ana', apellido: 'Gomez', email: 'ana@test.com' },
      { id: '2', nombre: 'Luis', apellido: 'Perez', email: 'luis@test.com' },
    ];

    fixture.detectChanges();

    const req = httpMock.expectOne(demoUsuariosUrl);
    expect(req.request.method).toBe('GET');
    req.flush(usuariosMock);

    const component = fixture.componentInstance;
    expect(component.usuarios()).toEqual(usuariosMock);
    expect(component.cargando()).toBeFalse();
    expect(component.error()).toBeNull();
  });

  it('deberia setear el error cuando el servicio falla', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(demoUsuariosUrl);
    req.flush('fallo', { status: 500, statusText: 'Server Error' });

    const component = fixture.componentInstance;
    expect(component.error()).toBe('No se pudo cargar la lista de usuarios.');
    expect(component.cargando()).toBeFalse();
    expect(component.usuarios()).toEqual([]);
  });
});
