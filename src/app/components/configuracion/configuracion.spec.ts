import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Configuracion } from './configuracion';

describe('Configuracion', () => {
  let fixture: ComponentFixture<Configuracion>;
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Configuracion],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Configuracion);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deberia crearse y cargar el usuario actual', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush(usuarioMock);

    expect(fixture.componentInstance.usuario()).toEqual(usuarioMock);
    expect(fixture.componentInstance.perfilForm.value.nombre).toBe('Ana');
  });

  it('guarda el perfil actualizado', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush(usuarioMock);

    const component = fixture.componentInstance;
    component.perfilForm.setValue({
      nombre: 'Ana',
      apellido: 'Gomez',
      telefono: '5599887766',
      email: 'ana@test.com',
    });
    component.guardarPerfil();

    const req = httpMock.expectOne(meUrl);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...usuarioMock, telefono: '5599887766' });

    expect(component.perfilExito()).toBeTrue();
  });

  it('cambia la contrasena', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush(usuarioMock);

    const component = fixture.componentInstance;
    component.passwordForm.setValue({ passwordActual: 'vieja1234', passwordNueva: 'nueva1234' });
    component.cambiarPassword();

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/me/password`);
    expect(req.request.method).toBe('PUT');
    req.flush({ mensaje: 'Contraseña actualizada' });

    expect(component.passwordExito()).toBeTrue();
  });

  it('cambia el tema', () => {
    fixture.detectChanges();
    httpMock.expectOne(meUrl).flush(usuarioMock);

    const component = fixture.componentInstance;
    component.cambiarTema('oscuro');

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/me/tema`);
    expect(req.request.method).toBe('PUT');
    req.flush({ tema: 'oscuro' });

    expect(component.usuario()?.tema).toBe('oscuro');
  });
});
