import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Trip } from '../../../../models/trip.model';
import { SeasonBadgeComponent } from '../../../../shared/ui/season-badge/season-badge.component';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule, RouterLink, SeasonBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="trip-card">
      <div class="card-image-wrap">
        <img [src]="trip.coverImage" [alt]="trip.title" (error)="onImgFallback($event)" />
        <div class="badge-overlay">
          <app-season-badge [season]="trip.season" />
        </div>
      </div>

      <div class="card-body">
        <span class="destination-text">{{ trip.destination.region }}, {{ trip.destination.country }}</span>
        <h3>{{ trip.title }}</h3>
        <p class="tagline">{{ trip.tagline }}</p>

        <div class="tags-row">
          <span *ngFor="let tag of trip.tags" class="tag">#{{ tag }}</span>
        </div>

        <div class="card-footer">
          <span *ngIf="trip.budget as b" class="budget">{{ b.currency }} {{ b.amount | number }}</span>
          <a [routerLink]="['/trips', trip.id]" class="view-btn">View Journey &rarr;</a>
        </div>
      </div>
    </article>
  `,
  styles: [`
    :host {
      display: flex;
      height: 100%;
    }

    .trip-card {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      border-radius: 12px;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
    }

    .card-image-wrap {
      position: relative;
      height: 200px;
      background: #e2e8f0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .badge-overlay {
        position: absolute;
        top: 12px;
        right: 12px;
      }
    }

    .card-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;

      .destination-text {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #64748b;
        letter-spacing: 0.05em;
        min-height: 2.2em;
      }

      h3 {
        margin: 0.4rem 0;
        font-size: 1.2rem;
        color: #0f172a;
      }

      .tagline {
        color: #475569;
        font-size: 0.88rem;
        margin-bottom: 1rem;
        flex: 1;
        line-height: 1.4;
      }

      .tags-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-bottom: 1.2rem;

        .tag {
          font-size: 0.72rem;
          background: #f1f5f9;
          color: #475569;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid #f1f5f9;

        .budget {
          font-weight: 700;
          color: #0f172a;
          font-size: 0.95rem;
        }

        .view-btn {
          text-decoration: none;
          color: #2563eb;
          font-weight: 600;
          font-size: 0.88rem;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  `]
})
export class TripCardComponent {
  @Input({ required: true }) trip!: Trip;

  onImgFallback(e: Event) {
    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
  }
}