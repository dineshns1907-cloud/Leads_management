import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { 
  Lead, 
  Activity, 
  Recommendation, 
  AnalyticsData, 
  PipelineStage, 
  Note,
  StagnationStatus,
  ConversionProbability
} from '../../models';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import {
  ApiLeadResponse,
  ApiLeadDetailResponse,
  ApiActivityResponse,
  ApiRecommendationResponse,
  ApiFocusLeadResponse,
  ApiAnalyticsOverview,
  ApiDashboardResponse,
  ApiNoteResponse
} from '../models/api.models';
import {
  mapLeadFromApi,
  mapActivityFromApi,
  mapNoteFromApi,
  mapRecommendationFromApi,
  mapStageToApi,
  parseCurrencyValue
} from '../mappers/api-adapter';

export type ActivitySimulationType = 
  | 'email_reply' 
  | 'demo_attended' 
  | 'quotation_requested' 
  | 'proposal_opened'
  | 'meeting_booked'
  | 'pricing_visited'
  | 'inactivity'
  | 'followup_ignored'
  | 'discount_requested';

export interface LeadFilterParams {
  search?: string;
  stage?: string;
  source?: string;
  industry?: string;
  score_min?: number;
  score_max?: number;
  classification?: string;
  engagement?: string;
  owner_id?: string;
  status?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  page_size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  // Loading and error state signals
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  // Total database leads count (reactive from real API)
  private readonly _totalLeadsCount = signal<number>(0);
  public readonly totalLeadsCount = computed(() => {
    const val = this._totalLeadsCount();
    return val > 0 ? val : this._leads().length;
  });

  // Reactive State Signals
  private readonly _leads = signal<Lead[]>([]);
  public readonly leads = this._leads.asReadonly();

  private readonly _focusLeads = signal<Lead[]>([]);

  private readonly _recommendations = signal<Recommendation[]>([]);
  public readonly recommendations = this._recommendations.asReadonly();

  private readonly _activities = signal<Activity[]>([]);
  public readonly activities = this._activities.asReadonly();

  private readonly _analytics = signal<AnalyticsData>({
    totalLeads: 0,
    totalLeadsTrend: '+14% vs last month',
    hotLeads: 0,
    hotLeadsTrend: '+6 this week',
    avgScore: 0,
    avgScoreTrend: '+4 pts overall',
    followUpsDue: 0,
    followUpsDueTrend: 'Normal pace',
    conversionRate: 0,
    conversionRateTrend: '+3.2% vs Q2',
    avgDaysInPipeline: 21,
    pipelineHealth: [],
    probabilityDistribution: { hot: 0, warm: 0, nurture: 0, cold: 0 },
    leadsBySource: [],
    leadsByStage: [],
    conversionTrend: [],
    scoreDistribution: [],
    engagementTrend: []
  });
  public readonly analytics = this._analytics.asReadonly();

  // Search and global state
  public readonly globalSearchQuery = signal<string>('');

  // Focus Mode Signal
  public readonly focusMode = signal<boolean>(false);

  // Active vs Completed separation
  public readonly activeLeads = computed(() => 
    this._leads().filter(l => l.stage !== 'Won' && l.stage !== 'Lost')
  );

  public readonly wonLeads = computed(() => 
    this._leads().filter(l => l.stage === 'Won')
  );

  public readonly lostLeads = computed(() => 
    this._leads().filter(l => l.stage === 'Lost')
  );

  public readonly completedLeads = computed(() => 
    this._leads().filter(l => l.stage === 'Won' || l.stage === 'Lost')
  );

  public readonly activeOpportunitiesCount = computed(() => this.activeLeads().length);

  // Role-based lead filtering: Salesperson sees "My Leads", Manager sees "All Leads"
  public readonly myLeads = computed(() => {
    const user = this.authService.currentUser();
    const active = this.activeLeads();
    if (!user || user.role === 'manager' || user.role === 'admin') {
      return active;
    }
    const assigned = active.filter(l => l.leadOwner === user.name || l.leadOwner === 'Alex Rivera');
    return assigned.length > 0 ? assigned : active;
  });

  // Focus Mode high-priority filtered leads
  public readonly focusHighPriorityLeads = computed(() => {
    if (this._focusLeads().length > 0) {
      return this._focusLeads();
    }
    return this.activeLeads().filter(lead => this.isLeadHighPriority(lead));
  });

  public readonly hotLeadsCount = computed(() => 
    this.activeLeads().filter(l => l.priority === 'hot' || l.aiScore >= 80).length
  );

  public readonly averageScore = computed(() => {
    const list = this.activeLeads();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + curr.aiScore, 0);
    return Math.round(sum / list.length);
  });

  public readonly highPriorityQueue = computed(() => {
    return this.activeLeads()
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 6);
  });

  public readonly probabilityDistribution = computed(() => {
    const list = this.activeLeads();
    const fallback = this._analytics().probabilityDistribution;
    if (list.length === 0) {
      return {
        hot: fallback.hot || 11,
        warm: fallback.warm || 10,
        nurture: fallback.nurture || 5,
        cold: fallback.cold || 0,
        hotPct: 42,
        warmPct: 38,
        nurturePct: 19,
        coldPct: 0
      };
    }
    let hot = 0;
    let warm = 0;
    let nurture = 0;
    let cold = 0;
    for (const l of list) {
      if (l.priority === 'hot' || l.aiScore >= 80) hot++;
      else if (l.priority === 'warm' || l.aiScore >= 60) warm++;
      else if (l.priority === 'nurture' || l.aiScore >= 40) nurture++;
      else cold++;
    }
    const total = list.length || 1;
    return {
      hot,
      warm,
      nurture,
      cold,
      hotPct: Math.round((hot / total) * 100),
      warmPct: Math.round((warm / total) * 100),
      nurturePct: Math.round((nurture / total) * 100),
      coldPct: Math.round((cold / total) * 100)
    };
  });

  public readonly pipelineValue = computed(() => {
    const list = this.activeLeads();
    if (list.length === 0) return 2712000;
    return list.reduce((sum, l) => sum + parseCurrencyValue(l.dealSize), 0);
  });

  constructor() {
    // Automatically load data when user is authenticated
    if (this.authService.isAuthenticated()) {
      this.loadAllData();
    }
  }

  // -------------------------------------------------------------
  // Data Loading & Synchronization
  // -------------------------------------------------------------
  async loadAllData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await Promise.allSettled([
        this.loadDashboard(),
        this.loadLeads(),
        this.loadRecommendations(),
        this.loadActivities(),
        this.loadAnalytics()
      ]);
    } catch (e: any) {
      this.errorMessage.set(e?.message || 'Failed to load initial data from LeadIQ API.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadDashboard(): Promise<void> {
    try {
      const res = await firstValueFrom(this.apiService.get<ApiDashboardResponse>('/dashboard'));
      if (res) {
        this._totalLeadsCount.set(res.total_leads);
        
        if (res.priority_leads && res.priority_leads.length > 0 && this._leads().length === 0) {
          this._leads.set(res.priority_leads.map(mapLeadFromApi));
        }

        if (res.recommendations && res.recommendations.length > 0) {
          this._recommendations.set(res.recommendations.map(mapRecommendationFromApi));
        }

        if (res.recent_activities && res.recent_activities.length > 0) {
          this._activities.set(res.recent_activities.map(mapActivityFromApi));
        }

        if (res.conversion_probability_summary || res.probability_distribution) {
          const p = res.conversion_probability_summary || res.probability_distribution!;
          this._analytics.update(curr => ({
            ...curr,
            totalLeads: res.total_leads,
            activeOpportunities: res.active_opportunities,
            hotLeads: res.hot_leads_count,
            avgScore: Math.round(res.average_score),
            conversionRate: Math.round(res.conversion_rate),
            pipelineValue: res.pipeline_value,
            probabilityDistribution: {
              hot: p.hot,
              warm: p.warm,
              nurture: p.nurture,
              cold: p.cold
            }
          }));
        }
      }
    } catch (err: any) {
      console.warn('Dashboard API error:', err);
    }
  }

  async loadLeads(filters?: LeadFilterParams): Promise<Lead[]> {
    try {
      const params: Record<string, any> = {
        page: filters?.page || 1,
        page_size: filters?.page_size || 100
      };

      if (filters?.search) params['search'] = filters.search;
      if (filters?.stage && filters.stage !== 'all') params['stage'] = filters.stage.toUpperCase();
      if (filters?.source && filters.source !== 'all') params['source'] = filters.source;
      if (filters?.industry && filters.industry !== 'all') params['industry'] = filters.industry;
      if (filters?.score_min !== undefined) params['score_min'] = filters.score_min;
      if (filters?.score_max !== undefined) params['score_max'] = filters.score_max;
      if (filters?.classification && filters.classification !== 'all') params['classification'] = filters.classification.toUpperCase();
      if (filters?.engagement && filters.engagement !== 'all') params['engagement'] = filters.engagement.toUpperCase();
      if (filters?.owner_id) params['owner_id'] = filters.owner_id;
      if (filters?.status && filters.status !== 'all') params['status'] = filters.status.toUpperCase();
      if (filters?.sort_by) params['sort_by'] = filters.sort_by;
      if (filters?.sort_order) params['sort_order'] = filters.sort_order;

      const res = await firstValueFrom(
        this.apiService.getWithHeaders<ApiLeadResponse[]>('/leads', params)
      );

      const items = res.body || [];
      const totalHeader = res.headers.get('X-Total-Count');
      if (totalHeader) {
        this._totalLeadsCount.set(parseInt(totalHeader, 10));
      } else {
        this._totalLeadsCount.set(items.length);
      }

      const mapped = items.map(mapLeadFromApi);
      this._leads.set(mapped);

      // Re-evaluate distribution from active loaded leads
      let hotC = 0, warmC = 0, nurtureC = 0, coldC = 0;
      mapped.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').forEach(l => {
        if (l.priority === 'hot' || l.aiScore >= 80) hotC++;
        else if (l.priority === 'warm' || l.aiScore >= 60) warmC++;
        else if (l.priority === 'nurture' || l.aiScore >= 40) nurtureC++;
        else coldC++;
      });
      this._analytics.update(a => ({
        ...a,
        probabilityDistribution: {
          hot: hotC,
          warm: warmC,
          nurture: nurtureC,
          cold: coldC
        }
      }));

      return mapped;
    } catch (err: any) {
      console.error('Failed to load leads from API:', err);
      this.toastService.show(
        'Lead Fetch Failed',
        'Could not load leads from server. Check your connection.',
        'warning'
      );
      return [];
    }
  }

  async fetchLeadDetail(leadId: string): Promise<Lead | undefined> {
    try {
      const res = await firstValueFrom(this.apiService.get<ApiLeadDetailResponse>(`/leads/${leadId}`));
      if (res) {
        const mapped = mapLeadFromApi(res);
        // Merge into loaded leads array
        this._leads.update(current => {
          const index = current.findIndex(l => l.id === leadId);
          if (index >= 0) {
            const next = [...current];
            next[index] = mapped;
            return next;
          }
          return [mapped, ...current];
        });
        return mapped;
      }
    } catch (err: any) {
      console.warn(`Lead detail fetch failed for ${leadId}:`, err);
    }
    return this.getLeadById(leadId);
  }

  getLeadById(id: string): Lead | undefined {
    return this._leads().find(l => l.id === id);
  }

  // -------------------------------------------------------------
  // Focus Mode
  // -------------------------------------------------------------
  isLeadHighPriority(lead: Lead): boolean {
    if (lead.stage === 'Won' || lead.stage === 'Lost') return false;
    if (lead.aiScore >= 80) return true;
    if (lead.engagementLevel === 'High') return true;
    if (lead.scoreChange >= 10) return true;
    if (lead.stagnationStatus === 'warning' || lead.stagnationStatus === 'critical') return true;
    if (lead.activities.some(a => a.type === 'quotation' || a.type === 'proposal' || a.type === 'demo')) return true;
    return false;
  }

  async toggleFocusMode(): Promise<void> {
    const nextVal = !this.focusMode();
    this.focusMode.set(nextVal);
    if (nextVal) {
      await this.loadFocusLeads();
      this.toastService.show(
        '🎯 Focus Mode Active',
        'Showing high-priority leads that need immediate attention based on AI signals.',
        'ai'
      );
    } else {
      this._focusLeads.set([]);
      this.toastService.show(
        'Focus Mode Cleared',
        'Displaying full active pipeline view.',
        'info'
      );
    }
  }

  async setFocusMode(enabled: boolean): Promise<void> {
    this.focusMode.set(enabled);
    if (enabled) {
      await this.loadFocusLeads();
    } else {
      this._focusLeads.set([]);
    }
  }

  async loadFocusLeads(): Promise<void> {
    try {
      const res = await firstValueFrom(this.apiService.get<ApiFocusLeadResponse[]>('/recommendations/focus'));
      if (res && res.length > 0) {
        // Map focus responses to leads
        const focusItems: Lead[] = res.map(f => {
          const existing = this.getLeadById(f.lead_id);
          if (existing) return existing;
          return {
            id: f.lead_id,
            company: f.company_name,
            contactName: f.contact_name,
            contactEmail: 'contact@' + f.company_name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
            contactPhone: '+1 (555) 012-3456',
            contactRole: f.contact_role || 'Decision Maker',
            industry: f.industry,
            source: 'Website',
            stage: (f.stage.charAt(0).toUpperCase() + f.stage.slice(1).toLowerCase()) as PipelineStage,
            dealSize: `$${Math.round(f.estimated_value / 1000)}k ARR`,
            estimatedAnnualValue: `$${Math.round(f.estimated_value / 1000)}k ARR`,
            aiScore: f.score,
            previousScore: f.score,
            scoreChange: 0,
            conversionProbability: f.score >= 80 ? 'High' : (f.score >= 60 ? 'Medium' : 'Nurture'),
            conversionPercentage: Math.round((f.conversion_probability || 0.5) * 100),
            priority: (f.classification.toLowerCase() || 'hot') as any,
            engagementLevel: (f.engagement_level ? f.engagement_level.charAt(0).toUpperCase() + f.engagement_level.slice(1).toLowerCase() : 'High') as any,
            stageAgeDays: f.days_in_current_stage,
            stagnationStatus: (f.stagnation_status.toLowerCase() || 'normal') as any,
            companySize: '250-500 employees',
            location: 'San Francisco, CA',
            leadOwner: 'Alex Rivera',
            createdDate: 'Recent',
            previousInteractions: 'Active pipeline opportunity',
            recommendedAction: f.recommended_action,
            actionReason: f.focus_reason,
            actionCompleted: false,
            lastActivity: f.focus_reason,
            lastActivityDate: 'Today',
            nextAction: f.recommended_action,
            scoreBreakdown: {
              explanation: f.focus_reason,
              positiveSignals: [{ signal: 'High buying intent detected', points: 15 }],
              negativeSignals: []
            },
            notes: [],
            activities: []
          };
        });
        this._focusLeads.set(focusItems);
      }
    } catch (err: any) {
      console.warn('Failed to load focus leads from API:', err);
    }
  }

  async loadRecommendations(category?: string, priority?: string): Promise<Recommendation[]> {
    try {
      const params: Record<string, any> = {};
      if (category && category !== 'all') params['category'] = category;
      if (priority && priority !== 'all') params['priority'] = priority;
      const res = await firstValueFrom(this.apiService.get<ApiRecommendationResponse[]>('/recommendations', params));
      if (res) {
        const mapped = res.map(mapRecommendationFromApi);
        this._recommendations.set(mapped);
        return mapped;
      }
    } catch (err: any) {
      console.warn('Failed to load recommendations from API:', err);
    }
    return this._recommendations();
  }

  async completeRecommendation(recId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.apiService.put<{ status: string }>(`/recommendations/${recId}/complete`, {}));
      this._recommendations.update(recs =>
        recs.map(r => r.id === recId ? { ...r, completed: true } : r)
      );
      this.toastService.show(
        'Action Completed',
        'Recommendation marked as completed in database.',
        'success'
      );
      return true;
    } catch (err: any) {
      this._recommendations.update(recs =>
        recs.map(r => r.id === recId ? { ...r, completed: true } : r)
      );
      return false;
    }
  }

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  calculateProbability(score: number, stage: PipelineStage): { prob: ConversionProbability; pct: number } {
    if (stage === 'Won') return { prob: 'Won', pct: 100 };
    if (stage === 'Lost') return { prob: 'Lost', pct: 0 };
    if (score >= 80) return { prob: 'High', pct: Math.min(96, Math.max(80, Math.round(score * 0.94))) };
    if (score >= 60) return { prob: 'Medium', pct: Math.min(79, Math.max(60, Math.round(score * 0.95))) };
    if (score >= 40) return { prob: 'Nurture', pct: Math.min(59, Math.max(40, Math.round(score * 0.96))) };
    return { prob: 'Low', pct: Math.min(39, Math.max(12, Math.round(score * 0.85))) };
  }

  calculateStagnation(days: number, stage: PipelineStage): StagnationStatus {
    if (stage === 'Won' || stage === 'Lost') return 'normal';
    if (days >= 14) return 'critical';
    if (days >= 7) return 'warning';
    return 'normal';
  }

  // -------------------------------------------------------------
  // Lead Mutations (CRUD)
  // -------------------------------------------------------------
  async addLead(newLeadData: Partial<Lead>): Promise<Lead | null> {
    const estVal = newLeadData.expectedInvestment !== undefined
      ? Number(newLeadData.expectedInvestment)
      : parseCurrencyValue(newLeadData.dealSize);

    const payload: Record<string, any> = {
      company_name: newLeadData.company || 'Unnamed Enterprise',
      contact_name: newLeadData.contactName || 'Primary Contact',
      contact_email: newLeadData.contactEmail || 'contact@example.com',
      contact_phone: newLeadData.contactPhone || null,
      industry: newLeadData.industry || 'Technology',
      contact_role: newLeadData.contactRole || 'Decision Maker',
      lead_source: newLeadData.source || 'Website',
      estimated_value: estVal,
      expected_investment: estVal,
      referred_by_id: newLeadData.referredById || null,
      stage: mapStageToApi(newLeadData.stage || 'New')
    };

    try {
      const apiRes = await firstValueFrom(this.apiService.post<ApiLeadResponse>('/leads', payload));
      const createdLead = mapLeadFromApi(apiRes);

      // Prepend to reactive state
      this._leads.update(current => [createdLead, ...current]);
      this._totalLeadsCount.update(c => c + 1);

      const idNotice = createdLead.publicLeadId ? `Lead ID: ${createdLead.publicLeadId}` : '';
      this.toastService.show(
        'Lead created successfully!',
        idNotice ? `${createdLead.company} · ${idNotice}` : `${createdLead.company} added to database.`,
        'success'
      );

      // Refresh dashboard KPIs in background
      this.loadDashboard();

      return createdLead;
    } catch (err: any) {
      const msg = err?.message || 'Failed to create lead. Please check input fields.';
      this.toastService.show('Error Adding Lead', msg, 'warning');
      return null;
    }
  }

  async updateLead(leadId: string, leadUpdate: Partial<Lead>): Promise<Lead | null> {
    const payload: Record<string, any> = {};
    if (leadUpdate.company) payload['company_name'] = leadUpdate.company;
    if (leadUpdate.contactName) payload['contact_name'] = leadUpdate.contactName;
    if (leadUpdate.contactEmail) payload['contact_email'] = leadUpdate.contactEmail;
    if (leadUpdate.contactPhone) payload['contact_phone'] = leadUpdate.contactPhone;
    if (leadUpdate.industry) payload['industry'] = leadUpdate.industry;
    if (leadUpdate.expectedInvestment !== undefined) {
      payload['expected_investment'] = Number(leadUpdate.expectedInvestment);
      payload['estimated_value'] = Number(leadUpdate.expectedInvestment);
    }
    if (leadUpdate.referredById !== undefined) payload['referred_by_id'] = leadUpdate.referredById;
    if (leadUpdate.dealSize) payload['estimated_value'] = parseCurrencyValue(leadUpdate.dealSize);
    if (leadUpdate.stage) payload['stage'] = mapStageToApi(leadUpdate.stage);

    try {
      const apiRes = await firstValueFrom(this.apiService.put<ApiLeadResponse>(`/leads/${leadId}`, payload));
      const updatedLead = mapLeadFromApi(apiRes);

      this._leads.update(leads => leads.map(l => l.id === leadId ? updatedLead : l));
      this.toastService.show(
        'Lead Updated',
        `Changes saved for ${updatedLead.company}.`,
        'success'
      );
      return updatedLead;
    } catch (err: any) {
      this.toastService.show('Update Failed', err?.message || 'Unable to update lead details.', 'warning');
      return null;
    }
  }

  async deleteLead(leadId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.apiService.delete<void>(`/leads/${leadId}`));

      this._leads.update(leads => leads.filter(l => l.id !== leadId));
      this._totalLeadsCount.update(c => Math.max(0, c - 1));

      this.toastService.show(
        'Lead Deleted',
        'Opportunity removed from CRM.',
        'info'
      );
      return true;
    } catch (err: any) {
      if (err?.message?.includes('permission') || err?.status === 403) {
        this.toastService.show(
          'Permission Denied',
          'You do not have permission to delete this lead.',
          'warning'
        );
      } else {
        this.toastService.show('Delete Failed', err?.message || 'Could not delete lead.', 'warning');
      }
      return false;
    }
  }

  // -------------------------------------------------------------
  // Pipeline Stage Transitions
  // -------------------------------------------------------------
  async updateLeadStage(leadId: string, newStage: PipelineStage): Promise<void> {
    const currentLeads = this._leads();
    const lead = currentLeads.find(l => l.id === leadId);
    if (!lead || lead.stage === newStage) return;

    const previousStage = lead.stage;

    // Optimistic UI update
    this._leads.update(leads => leads.map(l => {
      if (l.id === leadId) {
        return { ...l, stage: newStage };
      }
      return l;
    }));

    try {
      const apiRes = await firstValueFrom(
        this.apiService.patch<ApiLeadResponse>(`/leads/${leadId}/stage`, {
          stage: mapStageToApi(newStage),
          note: `Stage progressed to ${newStage}`
        })
      );

      const updated = mapLeadFromApi(apiRes);

      this._leads.update(leads => leads.map(l => l.id === leadId ? updated : l));

      // Append stage activity to timeline
      const newAct: Activity = {
        id: 'act-stage-' + Date.now(),
        leadId,
        leadCompany: lead.company,
        type: 'stage_change',
        title: `Moved from ${previousStage} to ${newStage}`,
        description: 'Opportunity stage updated in sales pipeline.',
        timestamp: 'Just now',
        salesRep: this.authService.currentUser()?.name || 'Sales Representative',
        stage: newStage
      };
      this._activities.update(acts => [newAct, ...acts]);

      this.toastService.show(
        'Pipeline Stage Updated',
        `Lead moved to ${newStage}`,
        newStage === 'Won' ? 'success' : (newStage === 'Lost' ? 'warning' : 'info')
      );
    } catch (err: any) {
      // Rollback on failure
      this._leads.update(leads => leads.map(l => {
        if (l.id === leadId) {
          return { ...l, stage: previousStage };
        }
        return l;
      }));

      this.toastService.show(
        'Stage Update Error',
        'Unable to update pipeline stage. Restored previous position.',
        'warning'
      );
    }
  }

  // -------------------------------------------------------------
  // Notes Integration
  // -------------------------------------------------------------
  async addNote(leadId: string, content: string, aiSignals: string[] = []): Promise<void> {
    try {
      const apiNote = await firstValueFrom(
        this.apiService.post<ApiNoteResponse>(`/leads/${leadId}/notes`, { content })
      );

      const note = mapNoteFromApi(apiNote);
      const lead = this.getLeadById(leadId);

      const noteActivity: Activity = {
        id: 'act-note-' + Date.now(),
        leadId,
        leadCompany: lead?.company || 'Lead',
        type: 'note',
        title: 'Sales note logged',
        description: content.length > 80 ? content.slice(0, 80) + '...' : content,
        timestamp: 'Just now',
        salesRep: note.author
      };

      this._leads.update(leads => leads.map(l => {
        if (l.id === leadId) {
          return {
            ...l,
            notes: [note, ...l.notes],
            activities: [noteActivity, ...l.activities],
            lastActivity: 'Note added: ' + (note.aiSignals[0] || 'Touchpoint'),
            lastActivityDate: 'Just now'
          };
        }
        return l;
      }));

      this._activities.update(acts => [noteActivity, ...acts]);

      this.toastService.show(
        'Note Logged & AI Signals Extracted',
        `Identified ${note.aiSignals.length} behavioral signal(s) from rep notes.`,
        'ai'
      );
    } catch (err: any) {
      this.toastService.show('Failed to Save Note', err?.message || 'Could not record note.', 'warning');
    }
  }

  // -------------------------------------------------------------
  // AI Score Recalculate
  // -------------------------------------------------------------
  async recalculateScore(leadId: string): Promise<void> {
    try {
      this.toastService.show('Recalculating AI Score...', 'Analyzing recent customer behavioral telemetry.', 'ai');
      const res = await firstValueFrom(
        this.apiService.post<any>(`/leads/${leadId}/score/recalculate`, {})
      );

      if (res) {
        this._leads.update(leads => leads.map(l => {
          if (l.id === leadId) {
            const prob = res.conversion_probability >= 0.8 ? 'High' : (res.conversion_probability >= 0.6 ? 'Medium' : 'Nurture');
            return {
              ...l,
              aiScore: res.new_score,
              scoreChange: res.score_change,
              previousScore: res.previous_score,
              conversionProbability: prob,
              conversionPercentage: Math.round(res.conversion_probability * 100),
              priority: (res.classification?.toLowerCase() || 'warm') as any,
              engagementLevel: (res.engagement_level === 'HIGH' ? 'High' : (res.engagement_level === 'LOW' ? 'Low' : 'Medium')) as any
            };
          }
          return l;
        }));

        this.toastService.show(
          'Score Recalculated',
          `AI score updated to ${res.new_score} (${res.score_change >= 0 ? '+' : ''}${res.score_change} pts).`,
          'success'
        );
      }
    } catch (err: any) {
      this.toastService.show('Recalculation Failed', err?.message || 'Could not recalculate score.', 'warning');
    }
  }

  // -------------------------------------------------------------
  // Customer Activity Simulation & Real Touchpoints
  // -------------------------------------------------------------
  simulateActivity(leadId: string, type: ActivitySimulationType): { oldScore: number; newScore: number; delta: number } {
    const lead = this.getLeadById(leadId);
    if (!lead) return { oldScore: 0, newScore: 0, delta: 0 };

    const oldScore = lead.aiScore;

    // Map simulation type to backend ActivityType & description
    let actType = 'CALL';
    let title = 'Customer touchpoint logged';
    let desc = 'Customer interaction logged in CRM.';
    let delta = 5;

    switch (type) {
      case 'email_reply':
        actType = 'EMAIL_RESPONSE';
        title = 'Customer replied to email';
        desc = `${lead.contactName} replied: "Thanks for the information, let's connect regarding next steps."`;
        delta = 12;
        break;
      case 'demo_attended':
        actType = 'DEMO';
        title = 'Customer attended demo';
        desc = `${lead.contactName} and team attended live platform demonstration with high interaction.`;
        delta = 15;
        break;
      case 'quotation_requested':
        actType = 'QUOTATION';
        title = 'Customer requested quotation';
        desc = `${lead.contactName} requested custom formal quotation for ${lead.dealSize} via portal.`;
        delta = 18;
        break;
      case 'proposal_opened':
        actType = 'PROPOSAL';
        title = 'Customer opened proposal';
        desc = 'Commercial proposal viewed by decision-maker for 14 minutes.';
        delta = 10;
        break;
      case 'meeting_booked':
        actType = 'MEETING';
        title = 'Customer booked meeting';
        desc = `${lead.contactName} reserved a 30-minute calendar slot for executive review.`;
        delta = 8;
        break;
      case 'pricing_visited':
        actType = 'PRICING_PAGE_VISIT';
        title = 'Customer visited pricing page';
        desc = 'Prospect visited enterprise tier calculator and requested SLA breakdown.';
        delta = 6;
        break;
      case 'inactivity':
        actType = 'FOLLOW_UP';
        title = 'Customer became inactive';
        desc = 'No response received after multiple touchpoints. Time-decay algorithm applied.';
        delta = -12;
        break;
      case 'followup_ignored':
        actType = 'EMAIL';
        title = 'Customer ignored follow-up';
        desc = 'Follow-up email unopened after 5 business days. Engagement cooled.';
        delta = -8;
        break;
      case 'discount_requested':
        actType = 'QUOTATION';
        title = 'Customer requested discount';
        desc = `${lead.contactName} asked for volume pricing discount terms for enterprise annual commit.`;
        delta = 5;
        break;
    }

    // Call backend API asynchronously
    this.apiService.post<ApiActivityResponse>(`/leads/${leadId}/activities`, {
      activity_type: actType,
      description: desc
    }).subscribe({
      next: (apiAct) => {
        // Backend recalculates score and persists it
        this.fetchLeadDetail(leadId);
        const mappedAct = mapActivityFromApi(apiAct);
        this._activities.update(acts => [mappedAct, ...acts]);
      },
      error: (e) => {
        console.warn('API activity logging failed:', e);
      }
    });

    const newScore = Math.min(99, Math.max(15, oldScore + delta));
    const effectiveDelta = newScore - oldScore;

    // Optimistic UI updates
    const { prob, pct } = this.calculateProbability(newScore, lead.stage);
    const newPriority = newScore >= 80 ? 'hot' : (newScore >= 60 ? 'warm' : 'nurture');

    const optimAct: Activity = {
      id: 'act-sim-' + Date.now(),
      leadId,
      leadCompany: lead.company,
      type: (actType === 'DEMO' ? 'demo' : (actType === 'QUOTATION' ? 'quotation' : 'call')) as any,
      title,
      description: desc,
      timestamp: 'Just now (Simulated)',
      salesRep: this.authService.currentUser()?.name || 'Sales Representative',
      impactScore: effectiveDelta,
      stage: lead.stage
    };

    this._leads.update(leads => leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          aiScore: newScore,
          previousScore: oldScore,
          scoreChange: effectiveDelta,
          conversionProbability: prob,
          conversionPercentage: pct,
          priority: newPriority,
          recentSimulationNote: `Score ${effectiveDelta >= 0 ? 'increased' : 'decreased'} (${effectiveDelta >= 0 ? '+' : ''}${effectiveDelta}) due to ${title.toLowerCase()}.`,
          lastActivity: title,
          lastActivityDate: 'Just now',
          activities: [optimAct, ...l.activities]
        };
      }
      return l;
    }));

    this.toastService.show(
      'Behavioral Signal Simulated',
      `AI score ${effectiveDelta >= 0 ? 'increased' : 'decreased'} by ${Math.abs(effectiveDelta)} points due to ${title.toLowerCase()}. (${oldScore} → ${newScore})`,
      effectiveDelta >= 0 ? 'ai' : 'warning',
      5500
    );

    return { oldScore, newScore, delta: effectiveDelta };
  }

  // -------------------------------------------------------------
  // Activities Feed
  // -------------------------------------------------------------
  async loadActivities(): Promise<void> {
    try {
      const res = await firstValueFrom(this.apiService.get<ApiActivityResponse[]>('/activities'));
      if (res) {
        this._activities.set(res.map(mapActivityFromApi));
      }
    } catch (err: any) {
      console.warn('Failed to load global activities from API:', err);
    }
  }

  // -------------------------------------------------------------
  // Analytics
  // -------------------------------------------------------------
  async loadAnalytics(): Promise<void> {
    try {
      const [overview, sources, stages, engagement, conversion] = await Promise.all([
        firstValueFrom(this.apiService.get<ApiAnalyticsOverview>('/analytics/overview')),
        firstValueFrom(this.apiService.get<any[]>('/analytics/sources')),
        firstValueFrom(this.apiService.get<any[]>('/analytics/stages')),
        firstValueFrom(this.apiService.get<any[]>('/analytics/engagement')),
        firstValueFrom(this.apiService.get<any[]>('/analytics/conversion'))
      ]);

      if (overview) {
        this._analytics.set({
          totalLeads: overview.total_leads,
          totalLeadsTrend: overview.total_leads_trend || '+14% vs last month',
          hotLeads: this.hotLeadsCount(),
          hotLeadsTrend: '+6 this week',
          avgScore: Math.round(overview.average_score),
          avgScoreTrend: overview.avg_score_trend || '+4 pts overall',
          followUpsDue: 8,
          followUpsDueTrend: 'Normal pace',
          conversionRate: Math.round(overview.conversion_rate * 100),
          conversionRateTrend: overview.conversion_rate_trend || '+3.2% vs Q2',
          avgDaysInPipeline: overview.average_pipeline_time || 21,
          pipelineHealth: (stages || []).map((s: any) => ({
            stage: (s.stage.charAt(0).toUpperCase() + s.stage.slice(1).toLowerCase()) as PipelineStage,
            count: s.count,
            value: s.formatted_value || `$${Math.round(s.value / 1000)}k ARR`,
            conversionRate: s.conversion_rate || '25%'
          })),
          probabilityDistribution: {
            hot: this._leads().filter(l => l.priority === 'hot').length,
            warm: this._leads().filter(l => l.priority === 'warm').length,
            nurture: this._leads().filter(l => l.priority === 'nurture').length,
            cold: this._leads().filter(l => l.priority === 'cold').length
          },
          leadsBySource: (sources || []).map((s: any) => ({
            source: s.source,
            count: s.count,
            percentage: Math.round(s.percentage),
            color: s.color || '#E76F51'
          })),
          leadsByStage: (stages || []).map((s: any) => ({
            stage: (s.stage.charAt(0).toUpperCase() + s.stage.slice(1).toLowerCase()) as PipelineStage,
            count: s.count,
            value: s.formatted_value || `$${Math.round(s.value / 1000)}k`
          })),
          conversionTrend: (conversion || []).map((c: any) => ({
            month: c.month,
            rate: Math.round(c.rate * 100),
            benchmark: Math.round(c.benchmark * 100)
          })),
          scoreDistribution: [
            { range: '80 - 100 (Hot)', count: this._leads().filter(l => l.aiScore >= 80).length, percentage: 35 },
            { range: '60 - 79 (Warm)', count: this._leads().filter(l => l.aiScore >= 60 && l.aiScore < 80).length, percentage: 40 },
            { range: '40 - 59 (Nurture)', count: this._leads().filter(l => l.aiScore >= 40 && l.aiScore < 60).length, percentage: 18 },
            { range: '0 - 39 (Cold)', count: this._leads().filter(l => l.aiScore < 40).length, percentage: 7 }
          ],
          engagementTrend: (engagement || []).map((e: any) => ({
            week: e.week,
            calls: e.calls,
            emails: e.emails,
            demos: e.demos
          }))
        });
      }
    } catch (err: any) {
      console.warn('Analytics API error:', err);
    }
  }
}
