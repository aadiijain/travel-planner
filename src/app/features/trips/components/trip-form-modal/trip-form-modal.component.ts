import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Trip, Season, Difficulty, Currency, StopType } from '../../../../models/trip.model';

export const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const start = control.get('startDate')?.value;
  const end = control.get('endDate')?.value;
  if (!start || !end) return null;
  return new Date(end) >= new Date(start) ? null : { dateRangeInvalid: true };
};

interface PresetImage {
  id: string;
  label: string;
  url: string;
}

const PRESET_IMAGES: PresetImage[] = [
  {
    id: 'mountains',
    label: 'Mountains',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'lakes',
    label: 'Lakes & Valley',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'roadtrip',
    label: 'Road Trip',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'forest',
    label: 'Forest / Falls',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'heritage',
    label: 'Heritage & Cities',
    url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80'
  }
];

@Component({
  selector: 'app-trip-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal-dialog">
        <header class="modal-header">
          <div>
            <h2>{{ tripToEdit ? 'Edit Journey' : 'Log a Journey' }}</h2>
            <p class="subtitle">
              {{ tripToEdit ? 'Update details, highlights, or stops for this trip.' : 'Record highlights, routes, and day-by-day stops from a vacation.' }}
            </p>
          </div>
          <button type="button" class="close-btn" (click)="close.emit()">&times;</button>
        </header>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-body">
          <!-- Journey Title -->
          <div class="form-group">
            <label for="title">Journey Title *</label>
            <input
              id="title"
              type="text"
              formControlName="title"
              placeholder="e.g. Spiti Valley Odyssey"
            />
            <span class="field-error" *ngIf="isInvalid('title')">
              Title is required (min 4 characters).
            </span>
          </div>

          <!-- Highlight Tagline -->
          <div class="form-group">
            <label for="tagline">One-line Highlight *</label>
            <input
              id="tagline"
              type="text"
              formControlName="tagline"
              placeholder="e.g. High-altitude passes, ancient monasteries, and barren valleys"
            />
            <span class="field-error" *ngIf="isInvalid('tagline')">Highlight tagline is required.</span>
          </div>

          <!-- Summary -->
          <div class="form-group">
            <label for="summary">Trip Notes & Summary *</label>
            <textarea
              id="summary"
              rows="3"
              formControlName="summary"
              placeholder="How was the journey? Route conditions, key memories, transit experience..."
            ></textarea>
            <span class="field-error" *ngIf="isInvalid('summary')">Summary is required.</span>
          </div>

          <!-- Destination Row -->
          <div class="form-row">
            <div class="form-group">
              <label for="region">Region / State *</label>
              <input
                id="region"
                type="text"
                formControlName="region"
                placeholder="e.g. Himachal Pradesh"
              />
              <span class="field-error" *ngIf="isInvalid('region')">Region is required.</span>
            </div>
            <div class="form-group">
              <label for="country">Country *</label>
              <input
                id="country"
                type="text"
                formControlName="country"
                placeholder="e.g. India"
              />
              <span class="field-error" *ngIf="isInvalid('country')">Country is required.</span>
            </div>
          </div>

          <!-- Travel Dates -->
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Travel Start Date *</label>
              <input id="startDate" type="date" formControlName="startDate" />
              <span class="field-error" *ngIf="isInvalid('startDate')">Start date is required.</span>
            </div>
            <div class="form-group">
              <label for="endDate">Travel End Date *</label>
              <input id="endDate" type="date" formControlName="endDate" />
              <span class="field-error" *ngIf="isInvalid('endDate')">End date is required.</span>
              <span class="field-error" *ngIf="form.hasError('dateRangeInvalid') && form.get('endDate')?.touched">
                End date cannot be earlier than start date.
              </span>
            </div>
          </div>

          <!-- Season & Difficulty -->
          <div class="form-row">
            <div class="form-group">
              <label for="season">Season Traveled *</label>
              <select id="season" formControlName="season">
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="autumn">Autumn</option>
                <option value="winter">Winter</option>
                <option value="all-year">All Year</option>
              </select>
            </div>
            <div class="form-group">
              <label for="difficulty">Route Difficulty *</label>
              <select id="difficulty" formControlName="difficulty">
                <option value="easy">Easy (Paved, relaxed)</option>
                <option value="moderate">Moderate (Some hiking/rough roads)</option>
                <option value="challenging">Challenging (High altitude/long hikes)</option>
              </select>
            </div>
          </div>

          <!-- Total Spent Row -->
          <div class="form-row">
            <div class="form-group">
              <label for="budgetAmount">Total Spent / Budget *</label>
              <input
                id="budgetAmount"
                type="number"
                min="0"
                formControlName="budgetAmount"
                placeholder="e.g. 28000"
              />
              <span class="field-error" *ngIf="isInvalid('budgetAmount')">
                Valid amount required.
              </span>
            </div>
            <div class="form-group">
              <label for="budgetCurrency">Currency *</label>
              <select id="budgetCurrency" formControlName="budgetCurrency">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <!-- Dynamic Itinerary Stops Section -->
          <div class="stops-section">
            <div class="stops-header">
              <h3>Day-by-Day Stops ({{ stopsArray.length }})</h3>
              <button type="button" class="btn-add-stop" (click)="addStop()">+ Add Stop</button>
            </div>

            <div formArrayName="stops" class="stops-list">
              <div
                *ngFor="let stopGroup of stopsArray.controls; let i = index"
                [formGroupName]="i"
                class="stop-card"
              >
                <div class="stop-card-top">
                  <div class="stop-day-input">
                    <label>Day</label>
                    <input type="number" min="1" formControlName="dayNumber" />
                  </div>
                  <div class="stop-title-input">
                    <label>Stop Title *</label>
                    <input type="text" formControlName="title" placeholder="e.g. Drive to Rohtang Pass" />
                  </div>
                  <div class="stop-type-input">
                    <label>Type</label>
                    <select formControlName="type">
                      <option value="transport">Transport</option>
                      <option value="hiking">Hiking</option>
                      <option value="sightseeing">Sightseeing</option>
                      <option value="food">Food</option>
                      <option value="adventure">Adventure</option>
                      <option value="culture">Culture</option>
                      <option value="leisure">Leisure</option>
                      <option value="stay">Stay</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    class="btn-remove-stop"
                    *ngIf="stopsArray.length > 1"
                    (click)="removeStop(i)"
                    title="Remove stop"
                  >
                    &times;
                  </button>
                </div>

                <div class="stop-card-row">
                  <div class="form-group">
                    <label>Location</label>
                    <input type="text" formControlName="location" placeholder="e.g. Manali, Himachal Pradesh" />
                  </div>
                  <div class="form-group">
                    <label>Essentials (comma-separated)</label>
                    <input type="text" formControlName="essentials" placeholder="e.g. Warm jacket, ID, Water bottle" />
                  </div>
                </div>

                <div class="form-group">
                  <label>Notes / What happened</label>
                  <input type="text" formControlName="notes" placeholder="Road bottleneck near pass, start by 6 AM..." />
                </div>
              </div>
            </div>
          </div>

          <!-- Cover Image Section -->
          <div class="form-group image-section">
            <label>Cover Photo *</label>
            <div class="preset-gallery">
              <button
                type="button"
                *ngFor="let p of presets"
                class="preset-card"
                [class.selected]="form.get('coverImage')?.value === p.url"
                (click)="selectPreset(p.url)"
              >
                <img [src]="p.url" [alt]="p.label" />
                <span class="preset-name">{{ p.label }}</span>
              </button>
            </div>

            <div class="image-alternatives">
              <div class="upload-box">
                <input
                  type="file"
                  id="localFile"
                  accept="image/*"
                  class="file-input"
                  (change)="onFileSelected($event)"
                />
                <label for="localFile" class="upload-btn">
                  📁 Upload from Device
                </label>
              </div>

              <div class="url-input-wrap">
                <input
                  type="url"
                  formControlName="coverImage"
                  placeholder="Or paste custom image URL..."
                />
              </div>
            </div>

            <div class="active-preview" *ngIf="form.get('coverImage')?.value as activeImg">
              <span class="preview-label">Selected Preview:</span>
              <img [src]="activeImg" alt="Preview" class="preview-img" (error)="onThumbFallback($event)" />
            </div>
          </div>

          <!-- Tags -->
          <div class="form-group">
            <label for="tags">Tags (comma-separated)</label>
            <input
              id="tags"
              type="text"
              formControlName="tags"
              placeholder="road-trip, mountains, lakes"
            />
          </div>

          <footer class="modal-footer">
            <button type="button" class="btn-cancel" (click)="close.emit()">Cancel</button>
            <button type="submit" class="btn-submit" [disabled]="form.invalid">
              {{ tripToEdit ? 'Save Changes' : 'Save to Diary' }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1.5rem;
    }

    .modal-dialog {
      background: #ffffff;
      width: 100%;
      max-width: 660px;
      max-height: 90vh;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: modalFadeIn 0.2s ease-out;
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      h2 {
        font-size: 1.35rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 0.2rem;
      }

      .subtitle {
        font-size: 0.85rem;
        color: #64748b;
        margin: 0;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.75rem;
        color: #94a3b8;
        cursor: pointer;
        padding: 0 4px;
        line-height: 1;

        &:hover {
          color: #0f172a;
        }
      }
    }

    .form-body {
      padding: 1.25rem 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #475569;
      }

      input, select, textarea {
        padding: 0.6rem 0.8rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 0.9rem;
        font-family: inherit;
        outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;

        &:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
      }

      textarea {
        resize: vertical;
      }

      .field-error {
        font-size: 0.75rem;
        color: #ef4444;
      }
    }

    /* Dynamic Stops Styles */
    .stops-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .stops-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .btn-add-stop {
          background: #e0f2fe;
          color: #0284c7;
          border: 1px solid #bae6fd;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;

          &:hover {
            background: #bae6fd;
          }
        }
      }

      .stops-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .stop-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;

        .stop-card-top {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;

          .stop-day-input {
            width: 60px;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            label {
              font-size: 0.75rem;
              font-weight: 600;
              color: #64748b;
            }

            input {
              padding: 0.45rem 0.5rem;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              font-size: 0.85rem;
            }
          }

          .stop-title-input {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            label {
              font-size: 0.75rem;
              font-weight: 600;
              color: #64748b;
            }

            input {
              padding: 0.45rem 0.5rem;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              font-size: 0.85rem;
            }
          }

          .stop-type-input {
            width: 110px;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            label {
              font-size: 0.75rem;
              font-weight: 600;
              color: #64748b;
            }

            select {
              padding: 0.45rem 0.4rem;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              font-size: 0.82rem;
            }
          }

          .btn-remove-stop {
            background: none;
            border: none;
            color: #ef4444;
            font-size: 1.4rem;
            line-height: 1;
            cursor: pointer;
            padding: 0 4px;
            height: 32px;

            &:hover {
              color: #b91c1c;
            }
          }
        }

        .stop-card-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
        }
      }
    }

    .image-section {
      gap: 0.6rem;
    }

    .preset-gallery {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.5rem;

      .preset-card {
        position: relative;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
        padding: 0;
        background: #f8fafc;
        cursor: pointer;
        transition: all 0.15s ease;
        height: 60px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .preset-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.75);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 600;
          text-align: center;
          padding: 2px 0;
        }

        &:hover {
          transform: translateY(-2px);
          border-color: #94a3b8;
        }

        &.selected {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.35);
        }
      }
    }

    .image-alternatives {
      display: flex;
      gap: 0.75rem;
      align-items: center;

      .upload-box {
        .file-input {
          display: none;
        }

        .upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #334155;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s ease;

          &:hover {
            background: #e2e8f0;
          }
        }
      }

      .url-input-wrap {
        flex: 1;

        input {
          width: 100%;
        }
      }
    }

    .active-preview {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;

      .preview-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
      }

      .preview-img {
        width: 48px;
        height: 34px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #e2e8f0;
      }
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
      margin-top: 0.5rem;

      button {
        padding: 0.6rem 1.25rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .btn-cancel {
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        color: #475569;

        &:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
      }

      .btn-submit {
        background: #2563eb;
        border: none;
        color: #ffffff;

        &:hover:not(:disabled) {
          background: #1d4ed8;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  `]
})
export class TripFormModalComponent implements OnInit, OnDestroy {
  @Input() tripToEdit: Trip | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Trip>();

  readonly presets = PRESET_IMAGES;
  private fb = new FormBuilder();

  readonly form: FormGroup = this.fb.group(
    {
      title: ['', [Validators.required, Validators.minLength(4)]],
      tagline: ['', Validators.required],
      summary: ['', Validators.required],
      region: ['', Validators.required],
      country: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      season: ['autumn' as Season, Validators.required],
      difficulty: ['moderate' as Difficulty, Validators.required],
      budgetAmount: [null, [Validators.required, Validators.min(0)]],
      budgetCurrency: ['INR' as Currency, Validators.required],
      coverImage: [PRESET_IMAGES[0].url, Validators.required],
      tags: [''],
      stops: this.fb.array([
        this.createStopGroup(1, '', 'transport', '', '', '')
      ])
    },
    { validators: [dateRangeValidator] }
  );

  get stopsArray(): FormArray {
    return this.form.get('stops') as FormArray;
  }

  private createStopGroup(
    dayNumber = 1,
    title = '',
    type: StopType = 'sightseeing',
    location = '',
    notes = '',
    essentials = ''
  ): FormGroup {
    return this.fb.group({
      dayNumber: [dayNumber, [Validators.required, Validators.min(1)]],
      title: [title, Validators.required],
      type: [type, Validators.required],
      location: [location],
      notes: [notes],
      essentials: [essentials]
    });
  }

  addStop(): void {
    const currentLength = this.stopsArray.length;
    const lastDay = currentLength > 0 ? this.stopsArray.at(currentLength - 1).get('dayNumber')?.value ?? 1 : 1;
    this.stopsArray.push(this.createStopGroup(lastDay, '', 'sightseeing', '', '', ''));
  }

  removeStop(index: number): void {
    if (this.stopsArray.length > 1) {
      this.stopsArray.removeAt(index);
    }
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';

    if (this.tripToEdit) {
      this.patchTripData(this.tripToEdit);
    }
  }

  private patchTripData(t: Trip): void {
    this.form.patchValue({
      title: t.title,
      tagline: t.tagline,
      summary: t.summary,
      region: t.destination.region,
      country: t.destination.country,
      startDate: t.startDate,
      endDate: t.endDate,
      season: t.season,
      difficulty: t.difficulty,
      budgetAmount: t.budget?.amount ?? null,
      budgetCurrency: t.budget?.currency ?? 'INR',
      coverImage: t.coverImage,
      tags: t.tags.join(', ')
    });

    if (t.itinerary && t.itinerary.length > 0) {
      this.stopsArray.clear();
      t.itinerary.forEach((st) => {
        this.stopsArray.push(
          this.createStopGroup(
            st.dayNumber,
            st.title,
            st.type,
            st.location || '',
            st.notes || '',
            (st.essentials || []).join(', ')
          )
        );
      });
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  selectPreset(url: string): void {
    this.form.patchValue({ coverImage: url });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.form.patchValue({ coverImage: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  isInvalid(fieldName: string): boolean {
    const ctrl = this.form.get(fieldName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onThumbFallback(e: Event): void {
    (e.target as HTMLImageElement).src = PRESET_IMAGES[0].url;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const val = this.form.value;
    const slug = (val.title as string)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const tagsArray = val.tags
      ? (val.tags as string)
          .split(',')
          .map((t) => t.trim().replace(/^#/, ''))
          .filter((t) => t.length > 0)
      : [];

    const parsedStops = (val.stops as any[]).map((st, idx) => ({
      id: `stop-${Date.now()}-${idx + 1}`,
      dayNumber: Number(st.dayNumber) || 1,
      title: (st.title || '').trim(),
      type: st.type as StopType,
      location: st.location ? st.location.trim() : '',
      notes: st.notes ? st.notes.trim() : '',
      essentials: st.essentials
        ? (st.essentials as string)
            .split(',')
            .map((e) => e.trim())
            .filter((e) => e.length > 0)
        : []
    }));

    parsedStops.sort((a, b) => a.dayNumber - b.dayNumber);

    const newTrip: Trip = {
      id: this.tripToEdit ? this.tripToEdit.id : `${slug}-${Date.now().toString().slice(-4)}`,
      title: val.title.trim(),
      tagline: val.tagline.trim(),
      summary: val.summary.trim(),
      destination: {
        region: val.region.trim(),
        country: val.country.trim()
      },
      startDate: val.startDate,
      endDate: val.endDate,
      season: val.season,
      difficulty: val.difficulty,
      coverImage: val.coverImage.trim(),
      budget: {
        amount: Number(val.budgetAmount),
        currency: val.budgetCurrency
      },
      tags: tagsArray,
      itinerary: parsedStops
    };

    this.save.emit(newTrip);
  }
}