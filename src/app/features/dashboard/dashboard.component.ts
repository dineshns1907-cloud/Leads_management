import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LeadService } from '../../core/services/lead.service';
import { ReferralService } from '../../core/services/referral.service';
import { AuthService } from '../../core/services/auth.service';
import { ScoreBadgeComponent } from '../../shared/components/score-badge/score-badge.component';
import { Lead } from '../../models';
import { formatCurrency } from '../../core/mappers/api-adapter';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ScoreBadgeComponent],
  template: `
    <div class="dashboard-page animate-fade-in">
      
      <!-- Greeting & Editorial Date Header -->
      <section class="welcome-header">
        <div class="welcome-text">
          <div class="greeting-row">
            <h1 class="greeting">Good morning, {{ authService.currentUser()?.name?.split(' ')?.[0] || 'Sales Pro' }}</h1>
            <span class="ai-status-pill">
              <span class="pulse-dot"></span>
              AI Re-scoring Online
            </span>
          </div>
          <p class="subtitle">
            {{ authService.isManager() 
              ? 'Executive Revenue Dashboard • Real-time pipeline health and predictive telemetry across all team accounts.' 
              : 'Sales Representative Workspace • Prioritized active opportunities and behavioral recommendations for today.' }}
          </p>
        </div>

        <div class="date-widget">
          <span class="calendar-coral-dot"></span>
          <div class="date-details">
            <span class="current-date">Friday, Sep 25, 2026</span>
            <span class="timezone-label">EST • {{ authService.currentUser()?.title || 'Sales Representative' }}</span>
          </div>
        </div>
      </section>

      <!-- Editorial Varied KPI Grid (Consistent 524 Total / 22 Active) -->
      <section class="kpi-grid">
        <!-- KPI 1: Total Leads (Neutral warm card) -->
        <div class="kpi-card kpi-neutral">
          <div class="kpi-top">
            <span class="kpi-label">TOTAL LEADS</span>
            <span class="kpi-icon-wrap icon-neutral">👥</span>
          </div>
          <div class="kpi-main">
            <div class="kpi-value mono">{{ leadService.totalLeadsCount() }}</div>
            <div class="kpi-trend trend-positive">
              <span class="trend-arrow">↑</span> Synced
            </div>
          </div>
          <div class="kpi-progress-bar">
            <div class="kpi-progress-fill fill-neutral" style="width: 100%"></div>
          </div>
          <div class="kpi-subtext">Addressable database leads in CRM</div>
        </div>

        <!-- KPI 2: Active Opportunities (Coral card) -->
        <div class="kpi-card kpi-coral">
          <div class="kpi-top">
            <span class="kpi-label text-coral-label">ACTIVE OPPORTUNITIES</span>
            <span class="kpi-icon-wrap icon-coral">⚡</span>
          </div>
          <div class="kpi-main">
            <div class="kpi-value mono text-coral">{{ leadService.activeOpportunitiesCount() }}</div>
            <div class="kpi-trend trend-coral">
              <span class="trend-arrow">●</span> {{ leadService.activeOpportunitiesCount() }} of {{ leadService.totalLeadsCount() }}
            </div>
          </div>
          <div class="kpi-progress-bar">
            <div class="kpi-progress-fill fill-coral" style="width: 65%"></div>
          </div>
          <div class="kpi-subtext">Active stages (New to Negotiation)</div>
        </div>

        <!-- KPI 3: Hot Leads (Amber card) -->
        <div class="kpi-card kpi-amber">
          <div class="kpi-top">
            <span class="kpi-label text-amber-label">HOT LEADS (≥ 80)</span>
            <span class="kpi-icon-wrap icon-amber">🔥</span>
          </div>
          <div class="kpi-main">
            <div class="kpi-value mono text-amber">{{ leadService.hotLeadsCount() }}</div>
            <div class="kpi-trend trend-amber">
              <span class="trend-arrow">↑</span> High Intent
            </div>
          </div>
          <div class="kpi-progress-bar">
            <div class="kpi-progress-fill fill-amber" style="width: 70%"></div>
          </div>
          <div class="kpi-subtext">AI score ≥ 80 with high conversion signals</div>
        </div>

        <!-- KPI 4: Average AI Score (Violet card) -->
        <div class="kpi-card kpi-violet">
          <div class="kpi-top">
            <span class="kpi-label text-violet-label">AVERAGE AI SCORE</span>
            <span class="kpi-icon-wrap icon-violet">🎯</span>
          </div>
          <div class="kpi-main">
            <div class="kpi-value mono text-violet">{{ leadService.averageScore() }}<small class="score-den">/100</small></div>
            <div class="kpi-trend trend-positive">
              <span class="trend-arrow">↑</span> {{ leadService.analytics().avgScoreTrend }}
            </div>
          </div>
          <div class="kpi-progress-bar">
            <div class="kpi-progress-fill fill-violet" [style.width.%]="leadService.averageScore()"></div>
          </div>
          <div class="kpi-subtext">Weighted behavioral intent index</div>
        </div>
      </section>

      <!-- Main Dashboard Content Split -->
      <div class="dashboard-split-layout">
        
        <!-- Left Column: Hero AI Priority Queue & Conversion Overview -->
        <div class="main-column">
          
          <!-- HERO COMPONENT: AI Priority Queue -->
          <div class="priority-queue-card">
            <div class="priority-queue-header">
              <div>
                <div class="hero-badge">
                  <span class="ai-spark-tag">⚡</span> AI PRIORITY DISCOVERY
                </div>
                <h2 class="section-title">AI Priority Queue</h2>
                <p class="section-subtitle">
                  Leads requiring your attention today based on recent behavioral velocity.
                </p>
              </div>

              <a routerLink="/leads" class="view-all-link">
                View all {{ leadService.activeOpportunitiesCount() }} active opportunities (of {{ leadService.totalLeadsCount() }} total) →
              </a>
            </div>

            <!-- Queue Lead List -->
            <div class="queue-list">
              <div 
                *ngFor="let lead of priorityLeads; trackBy: trackById" 
                class="queue-item"
                [routerLink]="['/leads', lead.id]"
              >
                <!-- Priority Dot & Company Info -->
                <div class="queue-item-primary">
                  <div class="priority-indicator-col">
                    <span *ngIf="lead.priority === 'hot'" class="fire-icon" title="High Priority: Hot Lead">🔥</span>
                    <span *ngIf="lead.priority === 'warm'" class="dot-icon warm-dot" title="Medium Priority">●</span>
                    <span *ngIf="lead.priority === 'nurture'" class="dot-icon nurture-dot" title="Nurture">●</span>
                    <span *ngIf="lead.priority === 'cold'" class="dot-icon cold-dot" title="Low Priority">○</span>
                  </div>

                  <div class="company-col">
                    <div class="company-name-row">
                      <span class="company-name">{{ lead.company }}</span>
                      <span class="deal-pill mono">{{ lead.dealSize }}</span>
                    </div>
                    <div class="contact-subline">
                      {{ lead.contactName }} • {{ lead.contactRole }}
                    </div>
                    <div class="industry-tag">{{ lead.industry }}</div>
                  </div>
                </div>

                <!-- Stage & Engagement & Stagnation -->
                <div class="queue-item-meta">
                  <div class="meta-row">
                    <span class="stage-tag">{{ lead.stage }}</span>
                    <span class="engagement-badge" [ngClass]="'eng-' + lead.engagementLevel.toLowerCase()">
                      {{ lead.engagementLevel }} Eng
                    </span>
                  </div>

                  <!-- Stagnation Warning -->
                  <div *ngIf="lead.stagnationStatus === 'warning'" class="stagnation-mini-pill warning">
                    <span>⚠️</span> {{ lead.stageAgeDays }}d stagnation
                  </div>
                  <div *ngIf="lead.stagnationStatus === 'critical'" class="stagnation-mini-pill critical">
                    <span>🚨</span> {{ lead.stageAgeDays }}d critical
                  </div>

                  <div class="last-activity-text">
                    <span class="clock-icon">🕒</span> {{ lead.lastActivity }}
                  </div>
                </div>

                <!-- AI Score Pill & Numerical Probability -->
                <div class="queue-item-score">
                  <app-score-badge 
                    [score]="lead.aiScore" 
                    [priority]="lead.priority" 
                    [change]="lead.scoreChange"
                    [showMax]="true"
                    size="md"
                  ></app-score-badge>
                  <div class="probability-label" [ngClass]="'prob-' + lead.conversionProbability.toLowerCase()">
                    {{ lead.conversionProbability.toUpperCase() }} · {{ lead.conversionPercentage }}%
                  </div>
                  <div *ngIf="lead.businessPriorityScore" class="queue-bp-tag" [ngClass]="'bp-' + (lead.businessPriorityTier?.toLowerCase()?.replace(' ', '-') || 'high')">
                    Priority: <strong>{{ lead.businessPriorityScore }}/100</strong>
                  </div>
                </div>

                <!-- Recommended Next Action & Action Trigger -->
                <div class="queue-item-action">
                  <div class="action-caption">RECOMMENDED ACTION</div>
                  <div class="action-title">{{ lead.recommendedAction }}</div>
                  <div class="action-cta">
                    <button class="btn btn-primary btn-sm" (click)="$event.stopPropagation(); goToLead(lead.id)">
                      Focus Now →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="priority-queue-footer">
              <span class="footer-ai-note">⚡ Real-time behavioral weighting dynamically reorders this queue.</span>
              <a routerLink="/leads" class="footer-link">Explore Filterable Table</a>
            </div>
          </div>

          <!-- FEATURE 1: HIGH-VALUE PRIORITY LEADS SECTION -->
          <div class="card high-value-leads-card animate-fade-in">
            <div class="card-header">
              <div>
                <div class="hero-badge" style="background: rgba(244, 96, 54, 0.12); color: #C84B2E; border-color: rgba(244, 96, 54, 0.3);">
                  <span>💎</span> REVENUE-AWARE LEAD PRIORITIZATION
                </div>
                <h3 class="card-title">High-Value Priority Leads</h3>
                <p class="card-subtitle">Prioritized by expected commercial investment, interest momentum, and win probability</p>
              </div>
              <a routerLink="/leads" class="view-all-link">Sort all in Leads Table →</a>
            </div>

            <div class="hv-leads-list">
              <div 
                *ngFor="let lead of highValuePriorityLeads; let i = index" 
                class="hv-lead-item"
                [routerLink]="['/leads', lead.id]"
              >
                <div class="hv-rank-badge mono">0{{ i + 1 }}</div>
                <div class="hv-lead-info">
                  <div class="hv-lead-name-row">
                    <span class="hv-company-name">{{ lead.company }}</span>
                    <span class="hv-stage-tag">{{ lead.stage }}</span>
                  </div>
                  <div class="hv-lead-meta">
                    <span class="hv-investment mono font-bold text-coral">{{ lead.expectedInvestmentFormatted || lead.dealSize }}</span>
                    <span class="meta-separator">•</span>
                    <span class="hv-interest">Interest: {{ lead.aiScore }}%</span>
                    <span class="meta-separator">•</span>
                    <span class="hv-conv">Conv: {{ lead.conversionPercentage }}%</span>
                  </div>
                </div>

                <div class="hv-priority-badge-col">
                  <div class="bp-badge" [ngClass]="'bp-' + (lead.businessPriorityTier || 'LOW').toLowerCase().replace(' ', '-')">
                    <span *ngIf="lead.businessPriorityTier === 'VERY HIGH'">🔥</span>
                    Priority {{ lead.businessPriorityScore ?? 75 }}
                  </div>
                  <span class="bp-tier-sub">{{ lead.businessPriorityTier }}</span>
                </div>

                <div class="hv-action-col">
                  <span class="hv-action-link">Inspect →</span>
                </div>
              </div>

              <div *ngIf="highValuePriorityLeads.length === 0" class="hv-empty">
                No active leads currently ranked.
              </div>
            </div>
          </div>

          <!-- CONVERSION OVERVIEW & PIPELINE HEALTH -->
          <div class="card conversion-card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Conversion Probability & Pipeline Health</h3>
                <p class="card-subtitle">Distribution of active pipeline across conversion likelihood tiers</p>
              </div>
            </div>

            <!-- Probability Distribution Bars -->
            <div class="probability-distribution-grid">
              <div class="prob-card prob-hot">
                <div class="prob-header">
                  <span class="prob-title">🔥 Hot Leads</span>
                  <span class="prob-percent mono">{{ leadService.probabilityDistribution().hotPct }}%</span>
                </div>
                <div class="prob-val mono">{{ leadService.probabilityDistribution().hot }}</div>
                <div class="prob-bar"><div class="prob-fill fill-hot" [style.width.%]="leadService.probabilityDistribution().hotPct"></div></div>
                <span class="prob-desc">High conversion signals</span>
              </div>

              <div class="prob-card prob-warm">
                <div class="prob-header">
                  <span class="prob-title">● Warm Leads</span>
                  <span class="prob-percent mono">{{ leadService.probabilityDistribution().warmPct }}%</span>
                </div>
                <div class="prob-val mono">{{ leadService.probabilityDistribution().warm }}</div>
                <div class="prob-bar"><div class="prob-fill fill-warm" [style.width.%]="leadService.probabilityDistribution().warmPct"></div></div>
                <span class="prob-desc">Active engagement</span>
              </div>

              <div class="prob-card prob-nurture">
                <div class="prob-header">
                  <span class="prob-title">● Nurture Leads</span>
                  <span class="prob-percent mono">{{ leadService.probabilityDistribution().nurturePct }}%</span>
                </div>
                <div class="prob-val mono">{{ leadService.probabilityDistribution().nurture }}</div>
                <div class="prob-bar"><div class="prob-fill fill-nurture" [style.width.%]="leadService.probabilityDistribution().nurturePct"></div></div>
                <span class="prob-desc">Educational cadence</span>
              </div>

              <div class="prob-card prob-cold">
                <div class="prob-header">
                  <span class="prob-title">○ Cold Leads</span>
                  <span class="prob-percent mono">{{ leadService.probabilityDistribution().coldPct }}%</span>
                </div>
                <div class="prob-val mono">{{ leadService.probabilityDistribution().cold }}</div>
                <div class="prob-bar"><div class="prob-fill fill-cold" [style.width.%]="leadService.probabilityDistribution().coldPct"></div></div>
                <span class="prob-desc">Decayed or inactive</span>
              </div>
            </div>

            <!-- Horizontal Pipeline Progression -->
            <div class="pipeline-health-section">
              <div class="pipeline-section-title">
                <span>PIPELINE VELOCITY PROGRESSION</span>
                <span class="total-pipeline-val mono">Total Value: {{ formatPipelineTotal() }}</span>
              </div>

              <div class="pipeline-stepper">
                <div 
                  *ngFor="let stageItem of leadService.analytics().pipelineHealth; let i = index; let last = last" 
                  class="stepper-step"
                  [class.step-won]="stageItem.stage === 'Won'"
                >
                  <div class="step-box">
                    <div class="step-num mono">0{{ i + 1 }}</div>
                    <div class="step-name">{{ stageItem.stage }}</div>
                    <div class="step-count mono">{{ stageItem.count }} deals</div>
                    <div class="step-val mono">{{ stageItem.value }}</div>
                    <div class="step-cr mono">Conv: {{ stageItem.conversionRate }}</div>
                  </div>
                  <div class="step-connector" *ngIf="!last">➔</div>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- Right Column: AI Insight Panel & Recent Activity -->
        <div class="side-column">
          
          <!-- FEATURE 2: REFERRAL ACTIVITY WIDGET -->
          <div class="card referral-activity-widget animate-fade-in">
            <div class="card-header">
              <div>
                <div class="hero-badge" style="background: rgba(124, 58, 237, 0.12); color: #7C3AED; border-color: rgba(124, 58, 237, 0.3);">
                  <span>🤝</span> ADVOCACY & REWARDS
                </div>
                <h3 class="card-title">Referral Activity</h3>
                <p class="card-subtitle">Active client introductions and reward status</p>
              </div>
              <a routerLink="/referrals" class="view-all-link">Manage →</a>
            </div>

            <!-- 3 Mini Stats -->
            <div class="ref-kpi-row">
              <div class="ref-kpi-box">
                <span class="ref-kpi-val text-success">{{ referralService.summary()?.successfulReferrals ?? 0 }}</span>
                <span class="ref-kpi-lbl">Successful</span>
              </div>
              <div class="ref-kpi-box">
                <span class="ref-kpi-val text-amber">{{ referralService.summary()?.pendingReferrals ?? 0 }}</span>
                <span class="ref-kpi-lbl">Pending</span>
              </div>
              <div class="ref-kpi-box">
                <span class="ref-kpi-val text-purple">{{ referralService.summary()?.formattedRewardsGranted || '₹0' }}</span>
                <span class="ref-kpi-lbl">Rewards</span>
              </div>
            </div>

            <!-- Recent Referral feed -->
            <div class="ref-recent-list">
              <div *ngFor="let ref of (referralService.summary()?.recentReferrals?.slice(0, 3) || [])" class="ref-recent-item">
                <div class="ref-pair">
                  <span class="ref-source-account">{{ ref.referrerCustomerName }}</span>
                  <span class="ref-arrow">➔</span>
                  <span class="ref-dest-account">{{ ref.referredLeadName }}</span>
                </div>
                <div class="ref-item-meta">
                  <span class="ref-status-mini" [ngClass]="'status-' + ref.status.toLowerCase()">{{ ref.status.replace('_', ' ') }}</span>
                  <span class="ref-val mono">{{ ref.dealValueFormatted || '₹20L' }}</span>
                  <span class="ref-rew font-semibold">{{ ref.rewardType === 'PERCENTAGE_DISCOUNT' ? (ref.rewardValue + '% Off') : 'Reward' }}</span>
                </div>
              </div>
              <div *ngIf="!referralService.summary()?.recentReferrals?.length" class="ref-empty-mini">
                <span>🌱</span> No recent referrals yet. Select "Referral" when adding new leads.
              </div>
            </div>
          </div>

          <!-- AI BEHAVIORAL INSIGHTS (Light Lavender Tint #F1EDFF) -->
          <div class="ai-insight-panel">
            <div class="insight-header">
              <div class="ai-badge-small">
                <span>⚡</span> AI BEHAVIORAL INTELLIGENCE
              </div>
              <h3 class="insight-panel-title">Active AI Insights</h3>
              <p class="insight-panel-subtitle">Algorithmic risk & acceleration signals detected across leads</p>
            </div>

            <div class="insights-stack">
              <!-- Insight 1: Positive acceleration (Emerald) -->
              <div class="insight-item insight-positive">
                <div class="insight-icon-box icon-emerald">⚡</div>
                <div class="insight-content">
                  <div class="insight-headline">AI noticed 8 leads with rapidly increasing engagement.</div>
                  <div class="insight-details">3+ website visits and email responses recorded in the last 48 hours.</div>
                  <a routerLink="/recommendations" class="insight-action-emerald">Inspect 8 accelerating leads →</a>
                </div>
              </div>

              <!-- Insight 2: Quotations requested (Amber) -->
              <div class="insight-item insight-amber">
                <div class="insight-icon-box icon-amber-tint">📄</div>
                <div class="insight-content">
                  <div class="insight-headline">5 leads requested quotations this week</div>
                  <div class="insight-details">High buying intent signals detected across Enterprise Software and FinTech.</div>
                  <span class="insight-meta mono">Deal value: ₹36.2L</span>
                </div>
              </div>

              <!-- Insight 3: Overdue follow-ups (Coral / Risk) -->
              <div class="insight-item insight-coral">
                <div class="insight-icon-box icon-coral-tint">⚠️</div>
                <div class="insight-content">
                  <div class="insight-headline">3 high-score leads have overdue follow-ups</div>
                  <div class="insight-details">Global Industries, TechCorp, and BioPulse require contact today.</div>
                  <a routerLink="/leads" class="insight-action-coral">Take immediate action →</a>
                </div>
              </div>

              <!-- Insight 4: Stage advancement (Emerald) -->
              <div class="insight-item insight-neutral">
                <div class="insight-icon-box icon-stage">🚀</div>
                <div class="insight-content">
                  <div class="insight-headline">7 leads recently moved to Proposal stage</div>
                  <div class="insight-details">Pipeline velocity increased by 22% compared to previous quarter.</div>
                </div>
              </div>

              <!-- Insight 5: Inactivity warning (Muted/decay) -->
              <div class="insight-item insight-decay">
                <div class="insight-icon-box icon-decay">⏸️</div>
                <div class="insight-content">
                  <div class="insight-headline">12 leads have become inactive</div>
                  <div class="insight-details">Automated re-engagement sequences recommended to prevent churn.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- RECENT CRM ACTIVITY FEED -->
          <div class="card recent-activity-card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Live CRM Activity Feed</h3>
                <p class="card-subtitle">Real-time interactions across team & prospects</p>
              </div>
              <a routerLink="/activity" class="view-all-link">All Activity →</a>
            </div>

            <div class="timeline-feed">
              <div *ngFor="let act of leadService.activities().slice(0, 6)" class="timeline-entry">
                <!-- Activity icon color-coded per prompt: Violet (Email), Emerald (Call/Stage), Amber (Quotation), Coral (Demo) -->
                <div class="timeline-marker" [ngClass]="'marker-' + act.type">
                  <span *ngIf="act.type === 'email'">✉️</span>
                  <span *ngIf="act.type === 'demo'">💻</span>
                  <span *ngIf="act.type === 'proposal'">📄</span>
                  <span *ngIf="act.type === 'quotation'">🏷️</span>
                  <span *ngIf="act.type === 'call'">📞</span>
                  <span *ngIf="act.type === 'meeting'">🤝</span>
                  <span *ngIf="act.type === 'stage_change'">🚀</span>
                </div>

                <div class="timeline-entry-content">
                  <div class="timeline-time-row">
                    <span class="timeline-time mono">{{ act.timestamp }}</span>
                    <span class="timeline-rep">{{ act.salesRep }}</span>
                  </div>
                  <div class="timeline-title">
                    <a [routerLink]="['/leads', act.leadId]" class="timeline-company-link">
                      {{ act.title }}
                    </a>
                  </div>
                  <p class="timeline-desc">{{ act.description }}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    /* Welcome Header */
    .welcome-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 0;
    }

    .greeting-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .greeting {
      font-size: 26px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.025em;
    }

    .subtitle {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 3px;
    }

    .ai-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 6px;
      background: var(--bg-ai-tint);
      border: 1px solid var(--bg-ai-tint-border);
      color: #5B40E8;
      font-size: 11px;
      font-weight: 600;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #7B61FF;
    }

    .date-widget {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 10px 16px;
    }

    .calendar-coral-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #E76F51;
      flex-shrink: 0;
    }

    .date-details {
      display: flex;
      flex-direction: column;
      text-align: right;
    }

    .current-date {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .timezone-label {
      font-size: 11px;
      color: var(--text-secondary);
    }

    /* Varied Editorial KPI Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
      position: relative;
    }
    .kpi-card:hover {
      border-color: var(--border-medium);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    /* Top accent indicators for varied cards */
    .kpi-card.kpi-coral {
      border-top: 3px solid #E76F51;
    }
    .kpi-card.kpi-violet {
      border-top: 3px solid #7B61FF;
    }
    .kpi-card.kpi-amber {
      border-top: 3px solid #E9A23B;
    }
    .kpi-card.kpi-neutral {
      border-top: 3px solid #6B6B66;
    }

    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .kpi-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--text-secondary);
    }
    .text-coral-label { color: #C84B2E; }
    .text-violet-label { color: #5B40E8; }
    .text-amber-label { color: #B57417; }

    .kpi-icon-wrap {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }
    .icon-neutral { background: var(--bg-surface); color: var(--text-secondary); }
    .icon-coral { background: rgba(231, 111, 81, 0.1); color: #E76F51; }
    .icon-violet { background: rgba(123, 97, 255, 0.1); color: #7B61FF; }
    .icon-amber { background: rgba(233, 162, 59, 0.1); color: #E9A23B; }

    .kpi-main {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }

    .kpi-value {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      letter-spacing: -0.02em;
    }
    .score-den {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
    }
    .text-coral { color: #C84B2E; }
    .text-violet { color: #5B40E8; }
    .text-amber { color: #B57417; }

    .kpi-trend {
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .trend-positive { color: #2A9D8F; }
    .trend-coral { color: #E76F51; }
    .trend-amber { color: #E9A23B; }
    .trend-alert-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #E9A23B;
    }

    .kpi-progress-bar {
      height: 4px;
      width: 100%;
      background: var(--bg-surface);
      border-radius: 2px;
      overflow: hidden;
    }
    .kpi-progress-fill {
      height: 100%;
      border-radius: 2px;
    }
    .fill-neutral { background: #6B6B66; }
    .fill-coral { background: #E76F51; }
    .fill-violet { background: #7B61FF; }
    .fill-amber { background: #E9A23B; }

    .kpi-subtext {
      font-size: 11px;
      color: var(--text-secondary);
    }

    /* Split Layout */
    .dashboard-split-layout {
      display: grid;
      grid-template-columns: 1.8fr 1.2fr;
      gap: 20px;
    }

    .main-column, .side-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Hero AI Priority Queue */
    .priority-queue-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 22px;
      box-shadow: var(--shadow-sm);
    }

    .priority-queue-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #5B40E8;
      background: var(--bg-ai-tint);
      border: 1px solid var(--bg-ai-tint-border);
      padding: 2px 8px;
      border-radius: 4px;
      margin-bottom: 6px;
    }
    .ai-spark-tag { font-size: 11px; }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .section-subtitle {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .view-all-link {
      font-size: 12px;
      color: #E76F51;
      text-decoration: none;
      font-weight: 600;
      transition: color var(--transition-fast);
    }
    .view-all-link:hover {
      text-decoration: underline;
      color: #D65D3F;
    }

    /* Queue List */
    .queue-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .queue-item {
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 14px 16px;
      display: grid;
      grid-template-columns: 2.2fr 1.6fr 1.2fr 1.8fr;
      gap: 16px;
      align-items: center;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
    }
    .queue-item:hover {
      border-color: var(--border-medium);
      background: #FFFDF8;
      transform: translateX(2px);
      box-shadow: var(--shadow-md);
    }

    .queue-item-primary {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .priority-indicator-col {
      padding-top: 2px;
    }
    .fire-icon { font-size: 14px; }
    .dot-icon { font-size: 11px; }
    .warm-dot { color: #E9A23B; }
    .nurture-dot { color: #7B61FF; }
    .cold-dot { color: #8C8C85; }

    .company-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .company-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .company-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .deal-pill {
      font-size: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      padding: 1px 5px;
      border-radius: 4px;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .contact-subline {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .industry-tag {
      font-size: 11px;
      color: var(--text-muted);
    }

    .queue-item-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .stage-tag {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--bg-surface);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }

    .engagement-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .eng-high { background: rgba(42, 157, 143, 0.1); color: #228276; }
    .eng-medium { background: rgba(233, 162, 59, 0.1); color: #B57417; }
    .eng-low { background: rgba(107, 107, 102, 0.08); color: #6B6B66; }

    .last-activity-text {
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .clock-icon { font-size: 10px; }

    .queue-item-score {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }

    .probability-label {
      font-size: 10px;
      font-weight: 600;
    }
    .prob-high { color: #C84B2E; }
    .prob-medium { color: #B57417; }
    .prob-low { color: #6B6B66; }

    .queue-item-action {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .action-caption {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #E76F51;
    }

    .action-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.3;
    }

    .priority-queue-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid var(--border-subtle);
      font-size: 11px;
    }

    .footer-ai-note {
      color: var(--text-secondary);
    }

    .footer-link {
      color: #E76F51;
      text-decoration: none;
      font-weight: 600;
    }
    .footer-link:hover {
      text-decoration: underline;
    }

    /* Conversion Overview & Pipeline Progression */
    .conversion-card {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .probability-distribution-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .prob-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .prob-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 600;
    }

    .prob-val {
      font-size: 22px;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
    }

    .prob-bar {
      height: 4px;
      background: var(--border-subtle);
      border-radius: 2px;
      overflow: hidden;
      margin: 2px 0;
    }
    .prob-fill { height: 100%; border-radius: 2px; }
    .fill-hot { background: #E76F51; }
    .fill-warm { background: #E9A23B; }
    .fill-nurture { background: #7B61FF; }
    .fill-cold { background: #6B6B66; }

    .prob-desc { font-size: 10px; color: var(--text-secondary); }

    .pipeline-health-section {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 16px;
    }

    .pipeline-section-title {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .total-pipeline-val {
      color: #2A9D8F;
      font-weight: 700;
    }

    .pipeline-stepper {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 6px;
    }

    .stepper-step {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .step-box {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 8px 10px;
      min-width: 95px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .step-won .step-box {
      border-color: rgba(42, 157, 143, 0.4);
      background: rgba(42, 157, 143, 0.06);
    }

    .step-num {
      font-size: 9px;
      color: var(--text-muted);
    }

    .step-name {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .step-count {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .step-val {
      font-size: 10px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .step-cr {
      font-size: 9px;
      color: #2A9D8F;
      font-weight: 700;
    }

    .step-connector {
      color: var(--text-muted);
      font-size: 11px;
    }

    /* AI Behavioral Insights Panel (#F1EDFF) */
    .ai-insight-panel {
      background: #F1EDFF;
      border: 1px solid rgba(123, 97, 255, 0.22);
      border-radius: 10px;
      padding: 20px;
      box-shadow: var(--shadow-sm);
    }

    .insight-header {
      margin-bottom: 16px;
    }

    .ai-badge-small {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #5B40E8;
      background: rgba(123, 97, 255, 0.12);
      border: 1px solid rgba(123, 97, 255, 0.3);
      padding: 1px 6px;
      border-radius: 4px;
      margin-bottom: 4px;
    }

    .insight-panel-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .insight-panel-subtitle {
      font-size: 12px;
      color: #555550;
      margin-top: 2px;
    }

    .insights-stack {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .insight-item {
      background: #FFFDF8;
      border: 1px solid rgba(123, 97, 255, 0.16);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      transition: all var(--transition-fast);
    }
    .insight-item:hover {
      box-shadow: var(--shadow-sm);
      transform: translateY(-1px);
    }

    .insight-item.insight-positive {
      border-left: 3px solid #2A9D8F;
    }

    .insight-item.insight-amber {
      border-left: 3px solid #E9A23B;
    }

    .insight-item.insight-coral {
      border-left: 3px solid #E76F51;
      background: #FFFBF9;
    }

    .insight-item.insight-neutral {
      border-left: 3px solid #7B61FF;
    }

    .insight-item.insight-decay {
      border-left: 3px solid #8C8C85;
    }

    .insight-icon-box {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      flex-shrink: 0;
    }
    .icon-emerald { background: rgba(42, 157, 143, 0.12); color: #2A9D8F; }
    .icon-amber-tint { background: rgba(233, 162, 59, 0.12); color: #E9A23B; }
    .icon-coral-tint { background: rgba(231, 111, 81, 0.12); color: #E76F51; }
    .icon-stage { background: rgba(123, 97, 255, 0.1); color: #7B61FF; }
    .icon-decay { background: rgba(107, 107, 102, 0.1); color: #6B6B66; }

    .insight-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .insight-headline {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.35;
    }

    .insight-details {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .insight-action-emerald {
      font-size: 11px;
      font-weight: 700;
      color: #228276;
      text-decoration: none;
      margin-top: 4px;
    }
    .insight-action-emerald:hover { text-decoration: underline; }

    .insight-action-coral {
      font-size: 11px;
      font-weight: 700;
      color: #E76F51;
      text-decoration: none;
      margin-top: 4px;
    }
    .insight-action-coral:hover { text-decoration: underline; }

    .insight-meta {
      font-size: 10px;
      color: #2A9D8F;
      font-weight: 600;
      margin-top: 2px;
    }

    /* Live CRM Activity Timeline Feed */
    .timeline-feed {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .timeline-entry {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      position: relative;
    }

    .timeline-marker {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    /* Activity icon color coding per design requirements */
    .marker-email { background: rgba(123, 97, 255, 0.1); color: #7B61FF; border: 1px solid rgba(123, 97, 255, 0.25); }
    .marker-call { background: rgba(42, 157, 143, 0.1); color: #2A9D8F; border: 1px solid rgba(42, 157, 143, 0.25); }
    .marker-quotation { background: rgba(233, 162, 59, 0.1); color: #E9A23B; border: 1px solid rgba(233, 162, 59, 0.25); }
    .marker-demo { background: rgba(231, 111, 81, 0.1); color: #E76F51; border: 1px solid rgba(231, 111, 81, 0.25); }
    .marker-proposal { background: rgba(123, 97, 255, 0.1); color: #7B61FF; border: 1px solid rgba(123, 97, 255, 0.25); }
    .marker-meeting { background: rgba(42, 157, 143, 0.1); color: #2A9D8F; border: 1px solid rgba(42, 157, 143, 0.25); }
    .marker-stage_change { background: rgba(42, 157, 143, 0.1); color: #2A9D8F; border: 1px solid rgba(42, 157, 143, 0.25); }

    .timeline-entry-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .timeline-time-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .timeline-time {
      font-size: 10px;
      color: var(--text-muted);
    }

    .timeline-rep {
      font-size: 10px;
      color: var(--text-secondary);
      background: var(--bg-surface);
      padding: 0 5px;
      border-radius: 3px;
      font-weight: 500;
    }

    .timeline-company-link {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary);
      text-decoration: none;
    }
    .timeline-company-link:hover {
      color: #E76F51;
    }

    .timeline-desc {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.35;
    }

    /* High-Value Priority Leads Styles (Feature 1) */
    .high-value-leads-card {
      border: 1.5px solid rgba(244, 96, 54, 0.25);
      background: linear-gradient(180deg, #FFFFFF 0%, #FFFDFB 100%);
    }

    .hv-leads-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 14px;
    }

    .hv-lead-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 14px;
      border-radius: 8px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .hv-lead-item:hover {
      background: #FFF8F5;
      border-color: rgba(244, 96, 54, 0.4);
      transform: translateY(-1px);
    }

    .hv-rank-badge {
      font-size: 13px;
      font-weight: 800;
      color: var(--text-muted);
      width: 24px;
    }

    .hv-lead-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .hv-lead-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hv-company-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .hv-stage-tag {
      font-size: 10.5px;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      font-weight: 600;
    }

    .hv-lead-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .hv-priority-badge-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .bp-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      font-family: var(--font-mono);
    }

    .bp-very-high {
      background: #FFF1ED;
      color: #C84B2E;
      border: 1px solid #F46036;
    }
    .bp-high {
      background: #FEF3C7;
      color: #B45309;
      border: 1px solid #F59E0B;
    }
    .bp-medium {
      background: #EEF2FF;
      color: #4338CA;
      border: 1px solid #6366F1;
    }
    .bp-low {
      background: #F3F4F6;
      color: #6B7280;
      border: 1px solid #D1D5DB;
    }

    .queue-bp-tag {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      margin-top: 3px;
      display: inline-block;
      font-family: var(--font-mono);
    }

    .bp-tier-sub {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.04em;
    }

    .hv-action-col {
      font-size: 12px;
      font-weight: 600;
      color: #E76F51;
      padding-left: 6px;
    }

    .hv-empty {
      padding: 20px;
      text-align: center;
      color: var(--text-muted);
      font-size: 13px;
    }

    /* Referral Activity Widget Styles (Feature 2) */
    .referral-activity-widget {
      border: 1.5px solid rgba(124, 58, 237, 0.25);
      background: linear-gradient(180deg, #FFFFFF 0%, #FAF8FF 100%);
    }

    .ref-kpi-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin: 12px 0;
    }

    .ref-kpi-box {
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .ref-kpi-val {
      font-size: 18px;
      font-weight: 800;
      font-family: var(--font-mono);
      line-height: 1.2;
    }

    .ref-kpi-lbl {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.02em;
    }

    .text-purple {
      color: #7C3AED;
    }
    .text-amber {
      color: #D97706;
    }

    .ref-recent-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ref-recent-item {
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .ref-pair {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
    }

    .ref-source-account {
      color: #7C3AED;
    }

    .ref-arrow {
      color: var(--text-muted);
      font-size: 11px;
    }

    .ref-dest-account {
      color: var(--text-primary);
    }

    .ref-item-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
    }

    .ref-status-mini {
      font-size: 9.5px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 3px;
      text-transform: uppercase;
      background: #FEF3C7;
      color: #B45309;
    }
    .ref-status-mini.status-won,
    .ref-status-mini.status-reward_eligible,
    .ref-status-mini.status-reward_granted {
      background: #D1FAE5;
      color: #065F46;
    }

    .ref-empty-mini {
      padding: 12px;
      font-size: 12px;
      color: var(--text-muted);
      text-align: center;
      background: #FFFFFF;
      border-radius: 6px;
      border: 1px dashed var(--border-subtle);
    }

    @media (max-width: 1200px) {
      .dashboard-split-layout {
        grid-template-columns: 1fr;
      }
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
      .queue-item {
        grid-template-columns: 1fr;
        gap: 8px;
      }
      .probability-distribution-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class DashboardComponent {
  leadService = inject(LeadService);
  referralService = inject(ReferralService);
  authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.leadService.loadDashboard();
    this.referralService.loadSummary();
    if (this.leadService.leads().length === 0) {
      this.leadService.loadLeads();
    }
  }

  get priorityLeads(): Lead[] {
    const list = [...this.leadService.activeLeads()];
    return list
      .sort((a, b) => (b.businessPriorityScore || b.aiScore) - (a.businessPriorityScore || a.aiScore))
      .slice(0, 6);
  }

  get highValuePriorityLeads(): Lead[] {
    const list = [...this.leadService.leads()];
    return list
      .filter(l => l.stage !== 'Won' && l.stage !== 'Lost')
      .sort((a, b) => (b.businessPriorityScore || 0) - (a.businessPriorityScore || 0))
      .slice(0, 5);
  }

  formatPipelineTotal(): string {
    return formatCurrency(this.leadService.pipelineValue());
  }

  trackById(index: number, lead: Lead): string {
    return lead.id;
  }

  goToLead(id: string): void {
    this.router.navigate(['/leads', id]);
  }
}
