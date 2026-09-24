import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConnectionErrorService } from './services/connection-error.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly connectionError = inject(ConnectionErrorService);
}
