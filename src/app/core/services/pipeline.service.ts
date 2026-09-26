import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { ApiPipelineOverview } from '../models/api.models';
import { PipelineStage, Lead } from '../../models';
import { mapStageToApi } from '../mappers/api-adapter';

@Injectable({
  providedIn: 'root'
})
export class PipelineService {
  private api = inject(ApiService);

  public readonly pipelineData = signal<ApiPipelineOverview | null>(null);
  public readonly isLoading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  async loadPipeline(): Promise<ApiPipelineOverview | null> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.api.get<ApiPipelineOverview>('/pipeline'));
      if (res) {
        this.pipelineData.set(res);
        return res;
      }
      return null;
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to load pipeline');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async moveLeadStage(leadId: string, newStage: PipelineStage): Promise<boolean> {
    try {
      const apiStage = mapStageToApi(newStage);
      await firstValueFrom(this.api.patch(`/leads/${leadId}/stage`, { stage: apiStage }));
      return true;
    } catch (err) {
      console.warn(`Failed to update stage for lead ${leadId}:`, err);
      return false;
    }
  }
}
