import { Injectable, inject, signal } from '@angular/core';
import { Trip } from '../models/trip.model';
import { TripApiService } from './trip-api.service';

@Injectable({
  providedIn: 'root'
})
export class TripStore {
  private api = inject(TripApiService);

  readonly trips = signal<Trip[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

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
        this.error.set(err.message ?? 'Unknown error');
        this.loading.set(false);
      }
    });
  }
}