import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Se inyecta aca (sin usarlo) para que el tema guardado se aplique al
  // documento apenas arranca la app, antes de que se vea ninguna pantalla.
  private readonly theme = inject(ThemeService);
}
