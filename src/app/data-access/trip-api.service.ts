import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';
import { Trip } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripApiService {
  private http = inject(HttpClient);
  private readonly dataUrl = 'assets/data/trips.json';

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.dataUrl).pipe(
      shareReplay(1),
      catchError((error) => {
        console.error('Failed to load trips data:', error);
        return throwError(() => new Error('Unable to load travel data. Please check connection.'));
      })
    );
  }
}