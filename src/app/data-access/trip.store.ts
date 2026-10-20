import { Injectable, computed, inject, signal } from '@angular/core';
import { TripApiService } from './trip-api.service';
import { Trip, Season } from '../models/trip.model';

const STORAGE_KEY = 'wanderlog_trips_data';

@Injectable({
  providedIn: 'root'
})
export class TripStore {
  private readonly api = inject(TripApiService);

  // Core State Signals
  readonly trips = signal<Trip[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Filter Signals
  readonly selectedSeason = signal<Season | 'ALL'>('ALL');
  readonly searchQuery = signal<string>('');

  // Computed Signal: Filtered trips based on season & search query
  readonly filteredTrips = computed(() => {
    const all = this.trips();
    const season = this.selectedSeason();
    const query = this.searchQuery().trim().toLowerCase();

    return all.filter((trip) => {
      const matchesSeason = season === 'ALL' || trip.season === season;
      if (!matchesSeason) return false;

      if (!query) return true;

      const titleMatch = trip.title.toLowerCase().includes(query);
      const tagMatch = trip.tags.some((t) => t.toLowerCase().includes(query));
      const regionMatch = trip.destination.region.toLowerCase().includes(query);
      const countryMatch = trip.destination.country.toLowerCase().includes(query);

      return titleMatch || tagMatch || regionMatch || countryMatch;
    });
  });

  loadTrips(): void {
    if (this.trips().length > 0) return;

    // Check localStorage first
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Trip[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.trips.set(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse cached trips from localStorage', e);
      }
    }

    this.loading.set(true);
    this.error.set(null);

    this.api.getTrips().subscribe({
      next: (data) => {
        this.trips.set(data);
        this.saveToStorage(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load journeys');
        this.loading.set(false);
      }
    });
  }

  setSeason(season: Season | 'ALL'): void {
    this.selectedSeason.set(season);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  addTrip(trip: Trip): void {
    this.trips.update((existing) => {
      const updated = [trip, ...existing];
      this.saveToStorage(updated);
      return updated;
    });
  }

  private saveToStorage(data: Trip[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage quota exceeded or unavailable', e);
    }
  }
}