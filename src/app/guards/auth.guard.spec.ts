import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceMock: { estaLogueado: jasmine.Spy };
  let router: Router;

  beforeEach(() => {
    authServiceMock = { estaLogueado: jasmine.createSpy('estaLogueado') };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    });

    router = TestBed.inject(Router);
  });

  it('deja pasar cuando hay usuario logueado', () => {
    authServiceMock.estaLogueado.and.returnValue(true);

    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(resultado).toBe(true);
  });

  it('redirige a /login cuando no hay sesion', () => {
    authServiceMock.estaLogueado.and.returnValue(false);

    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(resultado).toEqual(router.parseUrl('/login'));
  });
});
