export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all-year';

export const SEASONS: readonly Season[] = [
  'spring',
  'summer',
  'autumn',
  'winter',
  'all-year',
] as const;

export type Difficulty = 'easy' | 'moderate' | 'challenging';

export type StopType =
  | 'transport'
  | 'sightseeing'
  | 'culture'
  | 'food'
  | 'hiking'
  | 'adventure'
  | 'leisure'
  | 'stay';

export type Currency = 'INR' | 'USD' | 'EUR';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Destination {
  region: string;
  country: string;
  coordinates?: Coordinates;
}

export interface Budget {
  amount: number;
  currency: Currency;
}

export interface ItineraryStop {
  id: string;
  dayNumber: number;
  title: string;
  type: StopType;
  location?: string;
  startTime?: string;
  notes?: string;
  essentials: string[];
}

export interface Trip {
  id: string;
  title: string;
  tagline: string;
  summary: string;
  destination: Destination;
  startDate: string;
  endDate: string;
  season: Season;
  difficulty: Difficulty;
  coverImage: string;
  budget?: Budget;
  tags: string[];
  itinerary: ItineraryStop[];
}

export type NewTrip = Omit<Trip, 'id'>;