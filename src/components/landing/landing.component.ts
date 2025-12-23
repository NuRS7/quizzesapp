import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  // FIX: Set change detection to OnPush for better performance.
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class LandingComponent {
  uploadCsv = output<void>();
  viewDemo = output<void>();
}
