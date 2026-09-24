import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConnectionErrorService } from './services/connection-error.service';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly connectionError = inject(ConnectionErrorService);
}
