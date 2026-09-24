import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { Configuracion } from './configuracion';

const usuarioMock = {
  id: '1',
  nombre: 'Ana',
  apellido: 'García',
  email: 'ana@test.com',
  telefono: '1122334455',
  tema: 'claro' as const,
  fechaAlta: '2024-01-01T00:00:00.000Z',
};

describe('Configuracion', () => {
  let fixture: ComponentFixture<Configuracion>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('ah-token', 'token-de-prueba');

    await TestBed.configureTestingModule({
      imports: [Configuracion],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(Configuracion);
    fixture.detectChanges();

    httpMock.expectOne(`${environment.apiUrl}/usuarios/me`).flush(usuarioMock);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deberia crearse', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('carga los datos del usuario en el formulario', () => {
    expect(fixture.componentInstance['form'].value.nombre).toBe('Ana');
    expect(fixture.componentInstance['form'].value.email).toBe('ana@test.com');
  });

  it('arranca en tema claro por defecto', () => {
    expect(fixture.componentInstance['esOscuro']()).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('claro');
  });

  it('al tocar el toggle cambia a oscuro y lo persiste', () => {
    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    );

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    httpMock.expectOne(`${environment.apiUrl}/usuarios/me/tema`).flush({ tema: 'oscuro' });

    expect(fixture.componentInstance['esOscuro']()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('oscuro');
    expect(localStorage.getItem('ah-tema')).toBe('oscuro');
  });

  it('al guardar con exito muestra el mensaje de exito', () => {
    fixture.componentInstance['form'].controls.telefono.setValue('9999999999');
    fixture.componentInstance['guardar']();

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/me`);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...usuarioMock, telefono: '9999999999' });
    fixture.detectChanges();

    expect(fixture.componentInstance['exito']()).toBe('Tus datos se actualizaron correctamente.');
    expect(fixture.componentInstance['error']()).toBeNull();
  });

  it('al guardar y fallar muestra el mensaje de error del back', () => {
    fixture.componentInstance['guardar']();

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/me`);
    req.flush({ error: 'El email ya esta registrado' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(fixture.componentInstance['error']()).toBe('El email ya esta registrado');
    expect(fixture.componentInstance['exito']()).toBeNull();
  });

  it('no envia el formulario si es invalido', () => {
    fixture.componentInstance['form'].controls.nombre.setValue('');
    fixture.componentInstance['guardar']();

    httpMock.expectNone(`${environment.apiUrl}/usuarios/me`);
    expect(fixture.componentInstance['form'].controls.nombre.touched).toBe(true);
  });
});
