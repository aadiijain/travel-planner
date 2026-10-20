import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Season } from '../../../models/trip.model';

@Component({
  selector: 'app-season-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="season-badge" [class]="season">
      {{ season | uppercase }}
    </span>
  `,
  styles: [`
    .season-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      letter-spacing: 0.05em;
      display: inline-block;

      &.spring { background: #dcfce7; color: #15803d; }
      &.summer { background: #ffedd5; color: #c2410c; }
      &.autumn { background: #fee2e2; color: #b91c1c; }
      &.winter { background: #e0f2fe; color: #0369a1; }
      &.all-year { background: #f3e8ff; color: #7e22ce; }
    }
  `]
})
export class SeasonBadgeComponent {
  @Input({ required: true }) season!: Season;
}