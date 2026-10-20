import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripStore } from '../../data-access/trip.store';
import { TripCardComponent } from './components/trip-card/trip-card.component';

@Component({
  selector: 'app-trips-page',
  standalone: true,
  imports: [CommonModule, TripCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="page-container">
      <header class="header-section">
        <h1>Travel Diary & Guide</h1>
        <p>Curated itineraries, route bottlenecks, and packing essentials from real travels.</p>
      </header>

      <div *ngIf="store.loading()" class="state-message">
        Loading journeys...
      </div>

      <div *ngIf="store.error() as err" class="state-message error">
        {{ err }}
      </div>

      <section *ngIf="!store.loading() && !store.error()" class="trips-grid">
        <app-trip-card
          *ngFor="let trip of store.trips(); trackBy: trackTripId"
          [trip]="trip"
        />
        <div *ngIf="store.trips().length === 0" class="state-message">
          No journeys found.
        </div>
      </section>
    </main>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }

    .header-section {
      margin-bottom: 2.5rem;

      h1 {
        font-size: 2.2rem;
        color: #0f172a;
        margin-bottom: 0.5rem;
      }

      p {
        color: #64748b;
        font-size: 1.1rem;
      }
    }

    .trips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }

    .state-message {
      padding: 3rem;
      text-align: center;
      background: #f8fafc;
      border-radius: 8px;
      color: #64748b;

      &.error {
        background: #fef2f2;
        color: #ef4444;
      }
    }
  `]
})
export class TripsPageComponent implements OnInit {
  protected store = inject(TripStore);

  ngOnInit(): void {
    this.store.loadTrips();
  }

  trackTripId(index: number, trip: { id: string }): string {
    return trip.id;
  }
}