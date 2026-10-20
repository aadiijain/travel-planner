import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripStore } from '../../data-access/trip.store';
import { TripCardComponent } from './components/trip-card/trip-card.component';
import { TripFormModalComponent } from './components/trip-form-modal/trip-form-modal.component';
import { Season, Trip, Currency } from '../../models/trip.model';

@Component({
  selector: 'app-trips-page',
  standalone: true,
  imports: [CommonModule, TripCardComponent, TripFormModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="page-container">
      <header class="header-section">
        <div class="header-title-wrap">
          <h1>Travel Diary & Guide</h1>
          <p>Curated itineraries, route bottlenecks, and packing essentials from real travels.</p>
        </div>

        <div class="header-actions">
          <!-- Currency Toggle Switcher -->
          <div class="currency-toggle">
            <button
              *ngFor="let curr of currencies"
              type="button"
              class="curr-btn"
              [class.active]="store.activeCurrency() === curr"
              (click)="store.setCurrency(curr)"
            >
              {{ curr }}
            </button>
          </div>

          <button type="button" class="btn-primary" (click)="openModal()">
            + Log Journey
          </button>
        </div>
      </header>

      <!-- Filter & Search Controls Bar -->
      <section class="controls-bar">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>

          <input
            #searchInput
            type="text"
            placeholder="Search destination, keyword, tag..."
            [value]="store.searchQuery()"
            (input)="onSearch(searchInput.value)"
          />

          <button
            *ngIf="store.searchQuery()"
            type="button"
            class="clear-search-btn"
            title="Clear search"
            (click)="clearSearch(searchInput)"
          >
            &times;
          </button>
        </div>

        <div class="season-filters">
          <button
            *ngFor="let s of seasons"
            type="button"
            class="filter-chip"
            [class.active]="store.selectedSeason() === s"
            (click)="store.setSeason(s)"
          >
            {{ s | uppercase }}
          </button>
        </div>
      </section>

      <!-- Results Feedback Counter -->
      <div
        *ngIf="!store.loading() && !store.error() && (store.searchQuery() || store.selectedSeason() !== 'ALL')"
        class="filter-summary"
      >
        <span>
          Showing <strong>{{ store.filteredTrips().length }}</strong> of {{ store.trips().length }} journeys
          <span *ngIf="store.searchQuery()">for "<em>{{ store.searchQuery() }}</em>"</span>
        </span>
        <button type="button" class="clear-all-link" (click)="resetFilters(searchInput)">Reset all</button>
      </div>

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
          <p>No journeys found matching your criteria.</p>
          <button type="button" class="reset-btn" (click)="resetFilters(searchInput)">Clear Filters</button>
        </div>
      </section>

      <!-- Journey Modal -->
      <app-trip-form-modal
        *ngIf="isModalOpen()"
        (close)="closeModal()"
        (save)="onTripCreated($event)"
      />
    </main>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }

    .header-section {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 2rem;

      .header-title-wrap {
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

      .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;

        .currency-toggle {
          display: flex;
          background: #f1f5f9;
          padding: 3px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;

          .curr-btn {
            background: none;
            border: none;
            padding: 0.45rem 0.75rem;
            font-size: 0.8rem;
            font-weight: 700;
            color: #64748b;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.15s ease;

            &:hover {
              color: #0f172a;
            }

            &.active {
              background: #ffffff;
              color: #0f172a;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
          }
        }
      }

      .btn-primary {
        background: #2563eb;
        color: #ffffff;
        border: none;
        padding: 0.7rem 1.4rem;
        border-radius: 10px;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        transition: background 0.15s ease, transform 0.1s ease;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);

        &:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }

    .controls-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      background: #ffffff;
      padding: 0.85rem 1.25rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
      border: 1px solid #f1f5f9;

      .search-box {
        position: relative;
        flex: 1;
        min-width: 260px;
        display: flex;
        align-items: center;

        .search-icon {
          position: absolute;
          left: 12px;
          width: 18px;
          height: 18px;
          color: #94a3b8;
          pointer-events: none;
        }

        input {
          width: 100%;
          padding: 0.65rem 2.2rem 0.65rem 2.4rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 0.95rem;
          background: #f8fafc;
          outline: none;
          transition: all 0.2s ease;

          &:focus {
            background: #ffffff;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
          }
        }

        .clear-search-btn {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          font-size: 1.25rem;
          line-height: 1;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;

          &:hover {
            color: #475569;
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
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;

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

    .filter-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.75rem;
      padding: 0 0.5rem;
      font-size: 0.9rem;
      color: #64748b;

      strong {
        color: #0f172a;
      }

      .clear-all-link {
        background: none;
        border: none;
        color: #2563eb;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        padding: 0;

        &:hover {
          text-decoration: underline;
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
  protected readonly store = inject(TripStore);

  readonly isModalOpen = signal<boolean>(false);
  readonly currencies: Currency[] = ['INR', 'USD', 'EUR'];

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

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  onSearch(query: string): void {
    this.store.setSearchQuery(query);
  }

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.store.setSearchQuery('');
    input.focus();
  }

  resetFilters(input: HTMLInputElement): void {
    input.value = '';
    this.store.setSeason('ALL');
    this.store.setSearchQuery('');
  }

  onTripCreated(newTrip: Trip): void {
    this.store.addTrip(newTrip);
    this.closeModal();
  }

  trackTripId(index: number, trip: Trip): string {
    return trip.id;
  }
}