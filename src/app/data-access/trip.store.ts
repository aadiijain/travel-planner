import { Injectable, computed, inject, signal } from '@angular/core';
import { TripApiService } from './trip-api.service';
import { Trip, Season, Currency } from '../models/trip.model';

const STORAGE_KEY = 'wanderlog_trips_data';
const CURRENCY_KEY = 'wanderlog_selected_currency';

// Baseline exchange rates relative to 1 INR
const RATES_FROM_INR: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011
};

@Injectable({
  providedIn: 'root'
})
export class TripStore {
  private readonly api = inject(TripApiService);

  // Core State Signals
  readonly trips = signal<Trip[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Filter & Preference Signals
  readonly selectedSeason = signal<Season | 'ALL'>('ALL');
  readonly searchQuery = signal<string>('');
  readonly activeCurrency = signal<Currency>(
    (localStorage.getItem(CURRENCY_KEY) as Currency) || 'INR'
  );

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

  setCurrency(curr: Currency): void {
    this.activeCurrency.set(curr);
    localStorage.setItem(CURRENCY_KEY, curr);
  }

  addTrip(trip: Trip): void {
    this.trips.update((existing) => {
      const updated = [trip, ...existing];
      this.saveToStorage(updated);
      return updated;
    });
  }

  updateTrip(updatedTrip: Trip): void {
    this.trips.update((existing) => {
      const updated = existing.map((t) => (t.id === updatedTrip.id ? updatedTrip : t));
      this.saveToStorage(updated);
      return updated;
    });
  }

  deleteTrip(tripId: string): void {
    this.trips.update((existing) => {
      const updated = existing.filter((t) => t.id !== tripId);
      this.saveToStorage(updated);
      return updated;
    });
  }

  /**
   * Converts any budget into the target active currency and formats it cleanly.
   */
  formatBudget(amount: number, fromCurrency: Currency): string {
    const target = this.activeCurrency();
    if (fromCurrency === target) {
      return `${target} ${amount.toLocaleString()}`;
    }

    // Step 1: Normalize source amount to INR
    const sourceRate = RATES_FROM_INR[fromCurrency] || 1;
    const amountInInr = amount / sourceRate;

    // Step 2: Convert from INR to target currency
    const targetRate = RATES_FROM_INR[target] || 1;
    const converted = Math.round(amountInInr * targetRate);

    return `${target} ${converted.toLocaleString()}`;
  }

  private saveToStorage(data: Trip[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage quota exceeded or unavailable', e);
    }
  }
}