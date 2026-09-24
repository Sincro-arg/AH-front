import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.Default,
  styleUrl: './footer.css',
})
export class Footer {
  readonly anio = new Date().getFullYear();
}
