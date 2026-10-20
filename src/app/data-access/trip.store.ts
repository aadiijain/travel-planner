import { Injectable, inject, signal, computed } from '@angular/core';
import { Trip, Season } from '../models/trip.model';
import { TripApiService } from './trip-api.service';

@Injectable({
  providedIn: 'root'
})
export class TripStore {
  private api = inject(TripApiService);

  readonly trips = signal<Trip[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Active filters
  readonly selectedSeason = signal<Season | 'ALL'>('ALL');
  readonly searchQuery = signal<string>('');

  // Reactive computed filtered trips
  readonly filteredTrips = computed(() => {
    const list = this.trips();
    const season = this.selectedSeason();
    const query = this.searchQuery().trim().toLowerCase();

    return list.filter((trip) => {
      const matchesSeason = season === 'ALL' || trip.season === season;
      const matchesSearch =
        query === '' ||
        trip.title.toLowerCase().includes(query) ||
        trip.tagline.toLowerCase().includes(query) ||
        (trip.destination.region && trip.destination.region.toLowerCase().includes(query)) ||
        (trip.destination.country && trip.destination.country.toLowerCase().includes(query)) ||
        trip.tags.some((t) => t.toLowerCase().includes(query));

      return matchesSeason && matchesSearch;
    });
  });

  loadTrips(): void {
    if (this.trips().length > 0) return;

    this.loading.set(true);
    this.error.set(null);

    this.api.getTrips().subscribe({
      next: (data) => {
        this.trips.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to load trips');
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
}