import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Configuracion } from './configuracion';

describe('Configuracion', () => {
  let fixture: ComponentFixture<Configuracion>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Configuracion],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Configuracion);
    fixture.detectChanges();
  });

  it('deberia crearse', () => {
    expect(fixture.componentInstance).toBeTruthy();
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

    expect(fixture.componentInstance['esOscuro']()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('oscuro');
    expect(localStorage.getItem('ah-tema')).toBe('oscuro');
  });
});
