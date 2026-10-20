import { Component, OnInit, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TripStore } from '../../data-access/trip.store';
import { SeasonBadgeComponent } from '../../shared/ui/season-badge/season-badge.component';
import { TripFormModalComponent } from './components/trip-form-modal/trip-form-modal.component';
import { Trip } from '../../models/trip.model';

@Component({
  selector: 'app-trip-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SeasonBadgeComponent, TripFormModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Loading State -->
    <div *ngIf="store.loading()" class="status-msg">
      Loading journey details...
    </div>

    <!-- Main Detail View -->
    <main class="detail-container" *ngIf="!store.loading() && trip() as currentTrip">
      <nav class="back-nav">
        <a routerLink="/trips" class="back-link">&larr; Back to all journeys</a>

        <!-- Edit & Delete Actions -->
        <div class="action-buttons">
          <button type="button" class="btn-edit" (click)="isEditModalOpen.set(true)">
            ✎ Edit
          </button>
          <button type="button" class="btn-delete" (click)="onDeleteTrip(currentTrip.id, currentTrip.title)">
            🗑 Delete
          </button>
        </div>
      </nav>

      <!-- Hero Header -->
      <header class="hero-card">
        <div class="hero-image-wrap">
          <img
            [src]="currentTrip.coverImage"
            [alt]="currentTrip.title"
            (error)="onImgFallback($event)"
          />
          <div class="badge-overlay">
            <app-season-badge [season]="currentTrip.season" />
          </div>
        </div>

        <div class="hero-info">
          <span class="destination-sub">
            {{ currentTrip.destination.region }}, {{ currentTrip.destination.country }}
          </span>
          <h1>{{ currentTrip.title }}</h1>
          <p class="tagline">{{ currentTrip.tagline }}</p>
          <p class="summary-text">{{ currentTrip.summary }}</p>

          <div class="meta-row">
            <div class="meta-item">
              <span class="label">Difficulty</span>
              <span class="value capitalize">{{ currentTrip.difficulty }}</span>
            </div>
            <div class="meta-item" *ngIf="currentTrip.budget as b">
              <span class="label">Est. Budget</span>
              <span class="value">{{ store.formatBudget(b.amount, b.currency) }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Season</span>
              <span class="value capitalize">{{ currentTrip.season }}</span>
            </div>
          </div>

          <div class="tags-row">
            <span *ngFor="let tag of currentTrip.tags" class="tag">#{{ tag }}</span>
          </div>
        </div>
      </header>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Day-by-Day Timeline -->
        <section class="itinerary-section">
          <h2>Day-by-Day Itinerary</h2>

          <div class="timeline" *ngIf="currentTrip.itinerary && currentTrip.itinerary.length > 0; else noItinerary">
            <div
              class="timeline-item"
              *ngFor="let stop of currentTrip.itinerary; let i = index"
              [class.same-day]="i > 0 && stop.dayNumber === currentTrip.itinerary[i - 1].dayNumber"
            >
              <!-- Primary Day Marker or Sub-marker Dot -->
              <div
                class="timeline-marker"
                *ngIf="i === 0 || stop.dayNumber !== currentTrip.itinerary[i - 1].dayNumber; else subMarker"
              >
                <span class="day-number">D{{ stop.dayNumber }}</span>
              </div>
              <ng-template #subMarker>
                <div class="timeline-submarker" title="Additional stop on Day {{ stop.dayNumber }}"></div>
              </ng-template>

              <div class="timeline-content">
                <div class="stop-header">
                  <h3>{{ stop.title }}</h3>
                  <span class="stop-badge type-{{ stop.type }}">{{ stop.type }}</span>
                </div>

                <p class="stop-location" *ngIf="stop.location">📍 {{ stop.location }}</p>
                <p class="stop-notes" *ngIf="stop.notes">{{ stop.notes }}</p>

                <div class="essentials-list" *ngIf="stop.essentials && stop.essentials.length > 0">
                  <span class="essentials-label">Essentials:</span>
                  <span class="essential-chip" *ngFor="let item of stop.essentials">{{ item }}</span>
                </div>
              </div>
            </div>
          </div>

          <ng-template #noItinerary>
            <p class="empty-msg">Detailed day-by-day stops coming soon.</p>
          </ng-template>
        </section>

        <!-- Sidebar / Essentials -->
        <aside class="sidebar-section">
          <div class="essentials-card">
            <h3>Trip Overview</h3>
            <ul class="overview-list">
              <li>
                <span class="label">Destination:</span>
                <span class="val">{{ currentTrip.destination.region }}, {{ currentTrip.destination.country }}</span>
              </li>
              <li>
                <span class="label">Dates:</span>
                <span class="val">{{ currentTrip.startDate }} to {{ currentTrip.endDate }}</span>
              </li>
              <li>
                <span class="label">Difficulty:</span>
                <span class="val capitalize">{{ currentTrip.difficulty }}</span>
              </li>
              <li *ngIf="currentTrip.budget as b">
                <span class="label">Est. Total:</span>
                <span class="val">{{ store.formatBudget(b.amount, b.currency) }}</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <!-- Edit Modal -->
      <app-trip-form-modal
        *ngIf="isEditModalOpen()"
        [tripToEdit]="currentTrip"
        (close)="isEditModalOpen.set(false)"
        (save)="onUpdateTrip($event)"
      />
    </main>

    <!-- Not Found State -->
    <div class="not-found-state" *ngIf="!store.loading() && !trip()">
      <h2>Journey Not Found</h2>
      <p>The journey details could not be found.</p>
      <a routerLink="/trips" class="back-btn">&larr; Return to Trips</a>
    </div>
  `,
  styles: [`
    .status-msg {
      text-align: center;
      padding: 6rem 1rem;
      color: #64748b;
      font-size: 1.15rem;
    }

    .detail-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 5rem;
    }

    .back-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-weight: 600;
        font-size: 0.95rem;
        color: #2563eb;
        text-decoration: none;
        transition: color 0.15s ease;

        &:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
      }

      .action-buttons {
        display: flex;
        gap: 0.6rem;

        button {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.85rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-edit {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #334155;

          &:hover {
            background: #e2e8f0;
            color: #0f172a;
          }
        }

        .btn-delete {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;

          &:hover {
            background: #fee2e2;
            color: #b91c1c;
          }
        }
      }
    }

    .hero-card {
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
      margin-bottom: 3rem;

      @media (min-width: 768px) {
        flex-direction: row;
      }

      .hero-image-wrap {
        position: relative;
        flex: 1;
        min-height: 280px;
        background: #e2e8f0;

        img {
          width: 100%;
          height: 100%;
          min-height: 280px;
          object-fit: cover;
          display: block;
        }

        .badge-overlay {
          position: absolute;
          top: 16px;
          right: 16px;
        }
      }

      .hero-info {
        flex: 1.25;
        padding: 2.25rem;
        display: flex;
        flex-direction: column;

        .destination-sub {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.06em;
          margin-bottom: 0.4rem;
        }

        h1 {
          font-size: 2rem;
          color: #0f172a;
          margin-bottom: 0.6rem;
          line-height: 1.25;
        }

        .tagline {
          font-size: 1.05rem;
          color: #475569;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .summary-text {
          font-size: 0.92rem;
          color: #64748b;
          line-height: 1.55;
          margin-bottom: 1.5rem;
        }

        .meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          padding: 1rem 0;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 1.25rem;

          .meta-item {
            display: flex;
            flex-direction: column;

            .label {
              font-size: 0.72rem;
              text-transform: uppercase;
              color: #94a3b8;
              font-weight: 700;
              letter-spacing: 0.04em;
              margin-bottom: 0.2rem;
            }

            .value {
              font-size: 1.15rem;
              font-weight: 700;
              color: #0f172a;

              &.capitalize {
                text-transform: capitalize;
              }
            }
          }
        }

        .tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;

          .tag {
            font-size: 0.78rem;
            color: #0284c7;
            background: #f0f9ff;
            border: 1px solid #e0f2fe;
            padding: 0.25rem 0.6rem;
            border-radius: 4px;
            font-weight: 500;
          }
        }
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.5rem;
      align-items: start;

      @media (min-width: 860px) {
        grid-template-columns: 2fr 1fr;
      }
    }

    .itinerary-section {
      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 1.75rem;
      }

      .timeline {
        position: relative;
        padding-left: 2rem;
        border-left: 2px solid #e2e8f0;

        .timeline-item {
          position: relative;
          margin-bottom: 2.25rem;

          &:last-child {
            margin-bottom: 0;
          }

          &.same-day {
            margin-top: -0.75rem;
          }

          .timeline-marker {
            position: absolute;
            left: -3rem;
            top: 0;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #0f172a;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 700;
            box-shadow: 0 0 0 4px #f8fafc;
          }

          .timeline-submarker {
            position: absolute;
            left: -2.35rem;
            top: 0.5rem;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #cbd5e1;
            border: 2.5px solid #ffffff;
            box-shadow: 0 0 0 2px #cbd5e1;
          }

          .timeline-content {
            padding-left: 0.5rem;

            .stop-header {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 0.6rem;
              margin-bottom: 0.35rem;

              h3 {
                font-size: 1.15rem;
                font-weight: 700;
                color: #0f172a;
                margin: 0;
              }

              .stop-badge {
                font-size: 0.68rem;
                text-transform: uppercase;
                font-weight: 700;
                padding: 0.15rem 0.45rem;
                border-radius: 4px;
                background: #f1f5f9;
                color: #475569;
                letter-spacing: 0.03em;

                &.type-hiking, &.type-adventure {
                  background: #ecfdf5;
                  color: #047857;
                }

                &.type-sightseeing, &.type-culture {
                  background: #eff6ff;
                  color: #1d4ed8;
                }

                &.type-food {
                  background: #fff7ed;
                  color: #c2410c;
                }

                &.type-transport {
                  background: #f8fafc;
                  color: #64748b;
                }

                &.type-leisure, &.type-stay {
                  background: #fdf4ff;
                  color: #a21caf;
                }
              }
            }

            .stop-location {
              font-size: 0.85rem;
              color: #64748b;
              font-weight: 500;
              margin-bottom: 0.4rem;
            }

            .stop-notes {
              font-size: 0.95rem;
              color: #475569;
              line-height: 1.5;
              margin-bottom: 0.65rem;
            }

            .essentials-list {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 0.4rem;

              .essentials-label {
                font-size: 0.72rem;
                font-weight: 600;
                color: #94a3b8;
                text-transform: uppercase;
              }

              .essential-chip {
                font-size: 0.75rem;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                color: #475569;
                padding: 0.15rem 0.5rem;
                border-radius: 4px;
              }
            }
          }
        }
      }

      .empty-msg {
        color: #64748b;
        font-style: italic;
      }
    }

    .sidebar-section {
      position: sticky;
      top: 2rem;

      .essentials-card {
        background: #ffffff;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        border: 1px solid #e2e8f0;

        h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1rem;
          padding-bottom: 0.6rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .overview-list {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.5rem 0;
            font-size: 0.9rem;
            border-bottom: 1px solid #f8fafc;

            &:last-child {
              border-bottom: none;
            }

            .label {
              font-weight: 600;
              color: #64748b;
              flex-shrink: 0;
            }

            .val {
              color: #0f172a;
              text-align: right;
              font-weight: 500;

              &.capitalize {
                text-transform: capitalize;
              }
            }
          }
        }
      }
    }

    .not-found-state {
      text-align: center;
      padding: 6rem 1rem;

      h2 {
        font-size: 1.75rem;
        color: #0f172a;
        margin-bottom: 0.5rem;
      }

      p {
        color: #64748b;
        margin-bottom: 1.5rem;
      }

      .back-btn {
        display: inline-block;
        padding: 0.6rem 1.25rem;
        background: #2563eb;
        color: #fff;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;

        &:hover {
          background: #1d4ed8;
        }
      }
    }
  `]
})
export class TripDetailPageComponent implements OnInit {
  protected readonly store = inject(TripStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly isEditModalOpen = signal<boolean>(false);
  private tripId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly trip = computed(() => {
    const trips = this.store.trips();
    return trips.find((t) => t.id === this.tripId) ?? null;
  });

  ngOnInit(): void {
    if (this.store.trips().length === 0) {
      this.store.loadTrips();
    }
  }

  onUpdateTrip(updatedTrip: Trip): void {
    this.store.updateTrip(updatedTrip);
    this.isEditModalOpen.set(false);
  }

  onDeleteTrip(id: string, title: string): void {
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`);
    if (confirmed) {
      this.store.deleteTrip(id);
      this.router.navigate(['/trips']);
    }
  }

  onImgFallback(e: Event): void {
    (e.target as HTMLImageElement).src =
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
  }
}