import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ScoringWeights {
  pricing_quotation_requested: number;
  product_demo_completed: number;
  email_response: number;
  commercial_proposal_opened: number;
  executive_meeting_booked: number;
  pricing_page_visited: number;
  inactivity_decay: number;
  followup_unopened_decay: number;
  interest_weight?: number;
  conversion_weight?: number;
  investment_weight?: number;
}

export interface SettingsResponse {
  status: string;
  weights: ScoringWeights;
  description?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private api = inject(ApiService);

  public readonly weights = signal<ScoringWeights>({
    pricing_quotation_requested: 18,
    product_demo_completed: 15,
    email_response: 12,
    commercial_proposal_opened: 10,
    executive_meeting_booked: 8,
    pricing_page_visited: 6,
    inactivity_decay: -12,
    followup_unopened_decay: -8,
    interest_weight: 0.40,
    conversion_weight: 0.30,
    investment_weight: 0.30
  });

  public readonly isLoading = signal<boolean>(false);
  public readonly isSaving = signal<boolean>(false);
  public readonly saveSuccess = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  async loadSettings(): Promise<ScoringWeights | null> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const res = await firstValueFrom(this.api.get<SettingsResponse>('/settings/scoring'));
      if (res && res.weights) {
        this.weights.set(res.weights);
        return res.weights;
      }
      return null;
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Failed to load scoring weights from server');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveSettings(newWeights: ScoringWeights): Promise<boolean> {
    this.isSaving.set(true);
    this.saveSuccess.set(false);
    this.errorMessage.set(null);
    try {
      const res = await firstValueFrom(this.api.put<SettingsResponse>('/settings/scoring', newWeights));
      if (res && res.weights) {
        this.weights.set(res.weights);
      } else {
        this.weights.set(newWeights);
      }
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
      return true;
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Failed to persist scoring weights to database');
      return false;
    } finally {
      this.isSaving.set(false);
    }
  }
}
