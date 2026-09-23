import { Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion {
  protected readonly theme = inject(ThemeService);

  protected readonly esOscuro = computed(() => this.theme.tema() === 'oscuro');
}
