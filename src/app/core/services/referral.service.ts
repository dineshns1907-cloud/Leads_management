import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';
import { 
  ApiReferralResponse, 
  ApiReferralSummary, 
  ApiCustomerOption 
} from '../models/api.models';
import { Referral, ReferralSummary } from '../../models';
import { mapReferralFromApi } from '../mappers/api-adapter';

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  private readonly _referrals = signal<Referral[]>([]);
  public readonly referrals = this._referrals.asReadonly();

  private readonly _summary = signal<ReferralSummary | null>(null);
  public readonly summary = this._summary.asReadonly();

  private readonly _customerOptions = signal<ApiCustomerOption[]>([]);
  public readonly customerOptions = this._customerOptions.asReadonly();

  private readonly _isLoading = signal<boolean>(false);
  public readonly isLoading = this._isLoading.asReadonly();

  async loadReferrals(): Promise<void> {
    this._isLoading.set(true);
    try {
      const data = await firstValueFrom(this.apiService.get<ApiReferralResponse[]>('/referrals'));
      const mapped = (data || []).map(mapReferralFromApi);
      this._referrals.set(mapped);
    } catch (err: any) {
      console.error('Failed to load referrals:', err);
      this.toastService.error('Failed to load referrals from server.');
    } finally {
      this._isLoading.set(false);
    }
  }

  async loadSummary(): Promise<void> {
    try {
      const sum = await firstValueFrom(this.apiService.get<ApiReferralSummary>('/referrals/summary'));
      if (sum) {
        this._summary.set({
          totalReferrals: sum.total_referrals,
          pendingReferrals: sum.pending_referrals,
          successfulReferrals: sum.successful_referrals,
          rewardEligibleReferrals: sum.reward_eligible_referrals,
          rewardsGrantedCount: sum.rewards_granted_count,
          totalRewardsGrantedValue: sum.total_rewards_granted_value,
          formattedRewardsGranted: sum.formatted_rewards_granted,
          recentReferrals: (sum.recent_referrals || []).map(mapReferralFromApi)
        });
      }
    } catch (err: any) {
      console.error('Failed to load referral summary:', err);
    }
  }

  async loadCustomerOptions(): Promise<ApiCustomerOption[]> {
    try {
      const customers = await firstValueFrom(this.apiService.get<ApiCustomerOption[]>('/referrals/customers'));
      this._customerOptions.set(customers || []);
      return customers || [];
    } catch (err: any) {
      console.error('Failed to load customer options:', err);
      return [];
    }
  }

  async grantReward(referralId: string): Promise<boolean> {
    try {
      const updated = await firstValueFrom(this.apiService.post<ApiReferralResponse>(`/referrals/${referralId}/grant`, {}));
      this.toastService.success(`Referral reward granted successfully!`);
      // Refresh list and summary
      await this.loadReferrals();
      await this.loadSummary();
      return true;
    } catch (err: any) {
      this.toastService.error(err?.message || 'Failed to grant referral reward.');
      return false;
    }
  }
}
