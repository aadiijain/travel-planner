import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripStore } from '../../data-access/trip.store';
import { TripCardComponent } from './components/trip-card/trip-card.component';
import { Season, Trip } from '../../models/trip.model';

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

      <!-- Filter & Search Controls Bar -->
      <section class="controls-bar">
        <div class="search-box">
          <input
            type="text"
            placeholder="Search destination, keyword, tag..."
            [value]="store.searchQuery()"
            (input)="onSearch($event)"
          />
        </div>

        <div class="season-filters">
          <button
            *ngFor="let s of seasons"
            type="button"
            class="filter-chip"
            [class.active]="store.selectedSeason() === s"
            (click)="store.setSeason(s)"
          >
            {{ s }}
          </button>
        </div>
      </section>

      <!-- Loading / Error States -->
      <div *ngIf="store.loading()" class="state-message">
        Loading journeys...
      </div>

      <div *ngIf="store.error() as err" class="state-message error">
        {{ err }}
      </div>

      <!-- Trips Grid -->
      <section *ngIf="!store.loading() && !store.error()" class="trips-grid">
        <app-trip-card
          *ngFor="let trip of store.filteredTrips(); trackBy: trackTripId"
          [trip]="trip"
        />
        <div *ngIf="store.filteredTrips().length === 0" class="state-message empty">
          <p>No journeys found matching your current filter.</p>
          <button type="button" class="reset-btn" (click)="resetFilters()">Clear Filters</button>
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
      margin-bottom: 2rem;

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

    .controls-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2.5rem;
      background: #ffffff;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      .search-box {
        flex: 1;
        min-width: 260px;

        input {
          width: 100%;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;

          &:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          }
        }
      }

      .season-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;

        .filter-chip {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: #e2e8f0;
            color: #0f172a;
          }

          &.active {
            background: #0f172a;
            color: #ffffff;
            border-color: #0f172a;
          }
        }
      }
    }

    .trips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
      align-items: stretch;
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

      &.empty {
        grid-column: 1 / -1;

        p {
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .reset-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          font-weight: 600;
          cursor: pointer;

          &:hover {
            background: #1d4ed8;
          }
        }
      }
    }
  `]
})
export class TripsPageComponent implements OnInit {
  protected store = inject(TripStore);

  readonly seasons: (Season | 'ALL')[] = [
    'ALL',
    'spring',
    'summer',
    'autumn',
    'winter'
  ];
  ngOnInit(): void {
    this.store.loadTrips();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.store.setSearchQuery(input.value);
  }

  resetFilters(): void {
    this.store.setSeason('ALL');
    this.store.setSearchQuery('');
  }

  trackTripId(index: number, trip: Trip): string {
    return trip.id;
  }
}