import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LeadService } from '../../core/services/lead.service';
import { AuthService } from '../../core/services/auth.service';
import { ScoreBadgeComponent } from '../../shared/components/score-badge/score-badge.component';
import { AddLeadModalComponent } from '../../shared/components/add-lead-modal/add-lead-modal.component';
import { Lead, PipelineStage, LeadPriority } from '../../models';

export type LeadScopeTab = 'active' | 'all' | 'won' | 'lost';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ScoreBadgeComponent, AddLeadModalComponent],
  template: `
    <div class="leads-page animate-fade-in">
      
      <!-- Top Title & Consistency Stats Bar -->
      <div class="page-header">
        <div>
          <div class="header-badge-row">
            <span class="consistency-chip">
              CRM Synchronized: {{ leadService.totalLeadsCount() }} Total Database Leads
            </span>
            <span class="active-opp-chip">
              {{ leadService.activeOpportunitiesCount() }} Active Opportunities
            </span>
          </div>

          <h1 class="page-title">
            {{ authService.isManager() ? 'All Leads' : 'My Active Leads' }}
          </h1>
          <p class="page-subtitle">
            Showing <strong class="highlight-count">{{ leadService.activeOpportunitiesCount() }} active opportunities</strong> of <strong class="highlight-count">{{ leadService.totalLeadsCount() }} total leads</strong> with real-time predictive AI scoring
          </p>
        </div>

        <div class="header-actions">
          <!-- Focus Mode Toggle Button (Requirement 9) -->
          <button 
            class="btn focus-toggle-btn"
            [class.focus-active]="leadService.focusMode()"
            (click)="leadService.toggleFocusMode()"
          >
            <span>🎯</span>
            <span>{{ leadService.focusMode() ? 'Focus Mode Active' : 'Focus High-Priority Leads' }}</span>
          </button>

          <button class="btn btn-outline btn-sm" (click)="resetFilters()">
            Reset Filters
          </button>
          <button class="btn btn-primary" (click)="showAddModal = true">
            <span>+</span> Add Lead
          </button>
        </div>
      </div>

      <!-- Focus Mode Banner (Requirement 9) -->
      <div class="focus-mode-banner" *ngIf="leadService.focusMode()">
        <div class="banner-left">
          <span class="focus-pulse-icon">🎯</span>
          <div class="banner-texts">
            <div class="banner-title">FOCUS MODE ACTIVE</div>
            <div class="banner-desc">Showing leads that need immediate attention (AI score ≥ 80, high engagement, rapid momentum, overdue follow-up, or stage stagnation).</div>
          </div>
        </div>
        <button class="clear-focus-btn" (click)="leadService.toggleFocusMode()">
          Clear Focus Mode ✕
        </button>
      </div>

      <!-- Scope Tabs (Active vs Completed Won/Lost separation - Requirement 5) -->
      <div class="scope-tabs-bar">
        <button 
          class="scope-tab" 
          [class.active]="scopeTab === 'active'"
          (click)="setScopeTab('active')"
        >
          <span>Active Opportunities</span>
          <span class="scope-count">{{ leadService.activeOpportunitiesCount() }}</span>
        </button>

        <button 
          class="scope-tab" 
          [class.active]="scopeTab === 'all'"
          (click)="setScopeTab('all')"
        >
          <span>All Pipeline</span>
          <span class="scope-count">{{ leadService.leads().length }}</span>
        </button>

        <button 
          class="scope-tab scope-won" 
          [class.active]="scopeTab === 'won'"
          (click)="setScopeTab('won')"
        >
          <span>Won Deals</span>
          <span class="scope-count won-count">{{ leadService.wonLeads().length }}</span>
        </button>

        <button 
          class="scope-tab scope-lost" 
          [class.active]="scopeTab === 'lost'"
          (click)="setScopeTab('lost')"
        >
          <span>Lost Deals</span>
          <span class="scope-count lost-count">{{ leadService.lostLeads().length }}</span>
        </button>
      </div>

      <!-- Filter & Search Control Panel -->
      <div class="control-panel">
        
        <!-- Search & Priority Tabs Row -->
        <div class="search-tabs-row">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              class="input search-input" 
              placeholder="Search leads, companies or contacts..."
              [(ngModel)]="searchQuery"
            />
            <button *ngIf="searchQuery" class="clear-search" (click)="searchQuery = ''">✕</button>
          </div>

          <!-- Priority Filter Tabs -->
          <div class="priority-tabs">
            <button 
              class="tab-btn" 
              [class.active]="priorityFilter === 'all'" 
              (click)="priorityFilter = 'all'"
            >
              All ({{ filteredBaseLeads.length }})
            </button>
            <button 
              class="tab-btn tab-hot" 
              [class.active]="priorityFilter === 'hot'" 
              (click)="priorityFilter = 'hot'"
            >
              🔥 Hot ({{ countByPriority('hot') }})
            </button>
            <button 
              class="tab-btn tab-warm" 
              [class.active]="priorityFilter === 'warm'" 
              (click)="priorityFilter = 'warm'"
            >
              ● Warm ({{ countByPriority('warm') }})
            </button>
            <button 
              class="tab-btn tab-nurture" 
              [class.active]="priorityFilter === 'nurture'" 
              (click)="priorityFilter = 'nurture'"
            >
              ● Nurture ({{ countByPriority('nurture') }})
            </button>
            <button 
              class="tab-btn tab-cold" 
              [class.active]="priorityFilter === 'cold'" 
              (click)="priorityFilter = 'cold'"
            >
              ○ Cold ({{ countByPriority('cold') }})
            </button>
          </div>
        </div>

        <!-- Dropdown Filters & Sorting Row -->
        <div class="dropdowns-row">
          <div class="filter-item">
            <label class="filter-label">PIPELINE STAGE</label>
            <select class="select filter-select" [(ngModel)]="stageFilter">
              <option value="all">All Stages</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Demo">Demo</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div class="filter-item">
            <label class="filter-label">LEAD SOURCE</label>
            <select class="select filter-select" [(ngModel)]="sourceFilter">
              <option value="all">All Sources</option>
              <option value="Website">Website</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referral">Referral</option>
              <option value="Outbound">Outbound</option>
              <option value="Event">Event</option>
              <option value="Webinar">Webinar</option>
              <option value="Advertisement">Advertisement</option>
            </select>
          </div>

          <div class="filter-item">
            <label class="filter-label">INDUSTRY</label>
            <select class="select filter-select" [(ngModel)]="industryFilter">
              <option value="all">All Industries</option>
              <option value="Enterprise Software">Enterprise Software</option>
              <option value="FinTech / Security">FinTech / Security</option>
              <option value="Healthcare">Healthcare & Life Sciences</option>
              <option value="Manufacturing">Manufacturing & Logistics</option>
              <option value="CleanTech">CleanTech & Energy</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
          </div>

          <div class="filter-item">
            <label class="filter-label">SCORE BRACKET</label>
            <select class="select filter-select" [(ngModel)]="scoreRangeFilter">
              <option value="all">All Scores</option>
              <option value="80+">80 - 100 (High Signal)</option>
              <option value="60-79">60 - 79 (Medium Signal)</option>
              <option value="40-59">40 - 59 (Nurture)</option>
              <option value="<40">&lt; 40 (Low Signal)</option>
            </select>
          </div>

          <div class="filter-item sort-item">
            <label class="filter-label">SORT BY</label>
            <select class="select filter-select sort-select" [(ngModel)]="sortBy">
              <option value="businessPriority">Business Priority (Highest)</option>
              <option value="aiScore">AI Score (Highest)</option>
              <option value="conversion">Conversion %</option>
              <option value="dealSize">Expected Investment</option>
              <option value="recentActivity">Recent Activity</option>
              <option value="company">Company Name</option>
              <option value="stage">Pipeline Stage</option>
            </select>
          </div>
        </div>

      </div>

      <!-- Main Leads Table Container (Horizontal Scroll without Page Clipping) -->
      <div class="table-container">
        <table class="leadiq-table">
          <thead>
            <tr>
              <th>Lead & Account</th>
              <th>Industry / Location</th>
              <th>Source</th>
              <th>Pipeline Stage</th>
              <th>AI Score</th>
              <th>Business Priority</th>
              <th>Conversion Probability</th>
              <th>Engagement</th>
              <th>Expected Investment</th>
              <th>Recommended Next Action</th>
              <th style="text-align: right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              *ngFor="let lead of paginatedLeads" 
              class="lead-row"
              [class.highlight-row]="lead.aiScore >= 80"
              [routerLink]="['/leads', lead.id]"
            >
              <!-- Lead & Company -->
              <td class="lead-primary-cell">
                <div class="lead-avatar-wrap">
                  <div class="company-avatar">{{ lead.company.substring(0, 2).toUpperCase() }}</div>
                </div>
                <div class="lead-meta">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span *ngIf="lead.publicLeadId" class="lead-id-pill mono font-semibold">{{ lead.publicLeadId }}</span>
                    <span class="lead-company-name">{{ lead.company }}</span>
                  </div>
                  <span class="lead-contact-name">{{ lead.contactName }} • <small>{{ lead.contactRole }}</small></span>
                </div>
              </td>

              <!-- Industry & Location -->
              <td>
                <div class="industry-box">
                  <span class="industry-badge">{{ lead.industry }}</span>
                  <span class="location-sub" *ngIf="lead.location">{{ lead.location }}</span>
                </div>
              </td>

              <!-- Source -->
              <td>
                <div class="source-cell-box">
                  <span class="source-tag" [class.source-referral]="lead.source === 'Referral'">
                    <span *ngIf="lead.source === 'Referral'">🤝</span> {{ lead.source }}
                  </span>
                  <div *ngIf="lead.source === 'Referral' && lead.referralInfo" class="referred-by-micro">
                    by {{ lead.referralInfo.referrerCustomerName }}
                  </div>
                </div>
              </td>

              <!-- Stage & Stagnation Indicator (Requirement 11) -->
              <td>
                <div class="stage-cell-wrap">
                  <span 
                    class="badge badge-stage stage-cell" 
                    [class.won-stage]="lead.stage === 'Won'"
                    [class.lost-stage]="lead.stage === 'Lost'"
                  >
                    {{ lead.stage }}
                  </span>

                  <!-- Stagnation Warning Indicator -->
                  <div 
                    *ngIf="lead.stagnationStatus === 'warning'" 
                    class="stagnation-pill warning-pill"
                    title="Lead has spent 9 days in current stage without progression"
                  >
                    <span>⚠️</span>
                    <span>Stage Stagnation ({{ lead.stageAgeDays }}d)</span>
                  </div>

                  <div 
                    *ngIf="lead.stagnationStatus === 'critical'" 
                    class="stagnation-pill critical-pill"
                    title="Critical Stagnation: Opportunity at risk of stalling"
                  >
                    <span>🚨</span>
                    <span>Critical Stagnation ({{ lead.stageAgeDays }}d)</span>
                  </div>

                  <span 
                    *ngIf="lead.stagnationStatus === 'normal' && lead.stage !== 'Won' && lead.stage !== 'Lost'"
                    class="stage-age-normal mono"
                  >
                    {{ lead.stageAgeDays }}d in stage
                  </span>
                </div>
              </td>

              <!-- AI Score -->
              <td>
                <app-score-badge 
                  [score]="lead.aiScore" 
                  [priority]="lead.priority"
                  [change]="lead.scoreChange"
                  size="md"
                ></app-score-badge>
              </td>

              <!-- Business Priority Score (Feature 1) -->
              <td>
                <div class="bp-table-cell" *ngIf="lead.businessPriorityScore !== undefined">
                  <div class="bp-badge-row">
                    <span 
                      class="bp-badge" 
                      [ngClass]="'bp-' + (lead.businessPriorityTier || 'LOW').toLowerCase().replace(' ', '-')"
                    >
                      <span *ngIf="lead.businessPriorityTier === 'VERY HIGH'">🔥</span>
                      {{ lead.businessPriorityScore }}<span class="bp-denom">/100</span>
                    </span>
                    <span 
                      class="bp-tier-tag" 
                      [ngClass]="'tier-' + (lead.businessPriorityTier || 'LOW').toLowerCase().replace(' ', '-')"
                    >
                      {{ lead.businessPriorityTier }}
                    </span>
                  </div>
                  <span class="bp-micro-caption">Commercial Priority</span>
                </div>
                <div *ngIf="lead.businessPriorityScore === undefined" class="bp-empty">
                  <span class="mono text-muted">--</span>
                </div>
              </td>

              <!-- Numerical Conversion Probability (Requirement 6 & 5) -->
              <td>
                <!-- Won Lead -->
                <div *ngIf="lead.stage === 'Won'" class="completed-conversion-box won-box">
                  <span class="conversion-status-pill won">Conversion: Won</span>
                  <span class="conversion-sub">Contract Finalized</span>
                </div>

                <!-- Lost Lead -->
                <div *ngIf="lead.stage === 'Lost'" class="completed-conversion-box lost-box">
                  <span class="conversion-status-pill lost">Conversion: Lost</span>
                  <span class="conversion-sub">Archived</span>
                </div>

                <!-- Active Lead with Numerical Probability -->
                <div *ngIf="lead.stage !== 'Won' && lead.stage !== 'Lost'" class="prob-num-wrap">
                  <span 
                    class="prob-tag" 
                    [ngClass]="'prob-' + lead.conversionProbability.toLowerCase()"
                  >
                    {{ lead.conversionProbability.toUpperCase() }} · {{ lead.conversionPercentage }}%
                  </span>
                  <span class="mock-ai-label">AI Win Probability</span>
                </div>
              </td>

              <!-- Engagement -->
              <td>
                <span class="eng-dot-row" [ngClass]="'eng-' + lead.engagementLevel.toLowerCase()">
                  <span class="eng-dot">●</span> {{ lead.engagementLevel }}
                </span>
              </td>

              <!-- Expected Investment / Deal ARR -->
              <td>
                <div class="deal-cell-box">
                  <span class="deal-size mono font-semibold">{{ lead.expectedInvestmentFormatted || lead.dealSize }}</span>
                  <span class="deal-sub-label">Deal Value</span>
                </div>
              </td>

              <!-- Recommended Next Action (Requirement 8) -->
              <td class="action-cell">
                <div class="next-action-row">
                  <span class="next-action-text">{{ lead.recommendedAction }}</span>
                  <button 
                    class="focus-now-mini-btn" 
                    (click)="focusOnLead(lead, $event)"
                    title="Focus immediate attention on this lead"
                  >
                    Focus Now
                  </button>
                </div>
              </td>

              <!-- Actions -->
              <td style="text-align: right" (click)="$event.stopPropagation()">
                <div style="display: inline-flex; align-items: center; gap: 6px;">
                  <a [routerLink]="['/leads', lead.id]" class="btn btn-secondary btn-sm table-view-btn">
                    Intelligence →
                  </a>
                  <button 
                    *ngIf="authService.isManager()"
                    type="button"
                    class="btn btn-outline btn-sm delete-lead-btn"
                    style="padding: 4px 8px; color: #C84B2E; border-color: rgba(200, 75, 46, 0.3);"
                    (click)="onDeleteLead(lead, $event)"
                    title="Delete lead (Manager/Admin)"
                  >
                    ✕
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State (Requirement 20) -->
            <tr *ngIf="paginatedLeads.length === 0">
              <td colspan="11" class="empty-state-cell">
                <div class="empty-state-card">
                  <div class="empty-icon">🔍</div>
                  <h3 class="empty-title">
                    {{ leadService.focusMode() ? 'No high-priority leads right now' : 'No leads match your filters' }}
                  </h3>
                  <p class="empty-sub">
                    {{ leadService.focusMode() ? 'All active opportunities have normal telemetry and are progressing on schedule.' : 'Try adjusting your search terms, stage filters, or reset to view all active opportunities.' }}
                  </p>
                  <div class="empty-actions">
                    <button 
                      *ngIf="leadService.focusMode()" 
                      class="btn btn-primary btn-sm" 
                      (click)="leadService.toggleFocusMode()"
                    >
                      Clear Focus Mode
                    </button>
                    <button class="btn btn-outline btn-sm" (click)="resetFilters()">
                      Reset All Filters
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="pagination-footer" *ngIf="filteredLeads.length > 0">
        <div class="pagination-info">
          Showing <span class="mono">{{ (currentPage - 1) * pageSize + 1 }}</span> to 
          <span class="mono">{{ Math.min(currentPage * pageSize, filteredLeads.length) }}</span> 
          of <span class="mono font-bold">{{ filteredLeads.length }}</span> records 
          <span class="pagination-total-hint">(from 524 total dataset)</span>
        </div>

        <div class="pagination-controls">
          <button 
            class="btn btn-outline btn-sm" 
            [disabled]="currentPage === 1"
            (click)="goToPage(currentPage - 1)"
          >
            ← Previous
          </button>

          <div class="page-numbers">
            <button 
              *ngFor="let p of totalPagesArray"
              class="page-num-btn"
              [class.active]="p === currentPage"
              (click)="goToPage(p)"
            >
              {{ p }}
            </button>
          </div>

          <button 
            class="btn btn-outline btn-sm" 
            [disabled]="currentPage === totalPages"
            (click)="goToPage(currentPage + 1)"
          >
            Next →
          </button>
        </div>
      </div>

      <!-- Add Lead Modal -->
      <app-add-lead-modal 
        *ngIf="showAddModal" 
        (closed)="showAddModal = false"
      ></app-add-lead-modal>

    </div>
  `,
  styles: [`
    .leads-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      min-width: 0;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .header-badge-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .consistency-chip {
      font-size: 11px;
      font-weight: 700;
      color: #228276;
      background: rgba(42, 157, 143, 0.1);
      border: 1px solid rgba(42, 157, 143, 0.25);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .active-opp-chip {
      font-size: 11px;
      font-weight: 700;
      color: #C84B2E;
      background: rgba(231, 111, 81, 0.1);
      border: 1px solid rgba(231, 111, 81, 0.25);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .page-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      line-height: 1.15;
    }

    .page-subtitle {
      font-size: 13.5px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .highlight-count {
      color: var(--text-primary);
      font-weight: 700;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Focus Mode Toggle Button */
    .focus-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-card);
      border: 1.5px solid #E76F51;
      color: #E76F51;
      font-weight: 700;
      font-size: 13px;
      padding: 7px 14px;
      border-radius: 8px;
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: 0 2px 6px rgba(231, 111, 81, 0.12);
    }
    .focus-toggle-btn:hover {
      background: rgba(231, 111, 81, 0.08);
      transform: translateY(-1px);
    }
    .focus-toggle-btn.focus-active {
      background: #E76F51;
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(231, 111, 81, 0.3);
    }

    /* Focus Mode Active Banner */
    .focus-mode-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 18px;
      border-radius: 10px;
      background: rgba(231, 111, 81, 0.1);
      border: 1.5px solid rgba(231, 111, 81, 0.35);
      animation: fadeIn 200ms ease;
    }

    .banner-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .focus-pulse-icon {
      font-size: 20px;
      animation: pulse 1.5s infinite;
    }

    .banner-title {
      font-size: 12.5px;
      font-weight: 800;
      color: #C84B2E;
      letter-spacing: 0.06em;
    }

    .banner-desc {
      font-size: 12px;
      color: var(--text-primary);
      margin-top: 1px;
    }

    .clear-focus-btn {
      background: var(--bg-card);
      border: 1px solid rgba(231, 111, 81, 0.4);
      color: #C84B2E;
      font-size: 11.5px;
      font-weight: 700;
      padding: 5px 10px;
      border-radius: 6px;
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition-fast);
    }
    .clear-focus-btn:hover {
      background: #E76F51;
      color: #FFFFFF;
    }

    /* Scope Tabs Bar */
    .scope-tabs-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 8px;
    }

    .scope-tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      background: transparent;
      border: 1px solid transparent;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .scope-tab:hover {
      background: rgba(32, 33, 36, 0.04);
      color: var(--text-primary);
    }
    .scope-tab.active {
      background: var(--bg-card);
      border-color: var(--border-medium);
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }

    .scope-count {
      font-size: 11px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      background: var(--bg-surface);
      color: var(--text-secondary);
    }
    .scope-won.active .scope-count {
      background: rgba(42, 157, 143, 0.15);
      color: #228276;
    }
    .scope-lost.active .scope-count {
      background: rgba(107, 107, 102, 0.15);
      color: #555550;
    }

    /* Control Panel */
    .control-panel {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 14px 16px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .search-tabs-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      width: 320px;
    }

    .search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 13px;
      color: #7B61FF;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding-left: 32px;
      padding-right: 28px;
      font-size: 13px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
    }

    .clear-search {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 12px;
    }

    .priority-tabs {
      display: flex;
      gap: 4px;
      background: var(--bg-surface);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid var(--border-subtle);
      overflow-x: auto;
    }

    .tab-btn {
      padding: 4px 10px;
      border-radius: 6px;
      border: none;
      background: transparent;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }
    .tab-btn:hover {
      color: var(--text-primary);
    }
    .tab-btn.active {
      background: var(--bg-card);
      color: var(--text-primary);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .dropdowns-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 10px;
      border-top: 1px solid var(--border-subtle);
      padding-top: 10px;
    }

    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .filter-label {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .filter-select {
      width: 100%;
      font-size: 12px;
      padding: 5px 8px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      color: var(--text-primary);
    }

    /* Table Container with Clean Scroll */
    .table-container {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      overflow-x: auto;
      max-width: 100%;
    }

    .leadiq-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 12.5px;
      white-space: nowrap;
    }

    .leadiq-table th {
      padding: 11px 14px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      text-transform: uppercase;
    }

    .lead-row {
      cursor: pointer;
      border-bottom: 1px solid var(--border-subtle);
      transition: background var(--transition-fast);
    }
    .lead-row:hover {
      background: var(--bg-card-hover, rgba(32, 33, 36, 0.025));
    }
    .lead-row.highlight-row {
      background: rgba(231, 111, 81, 0.02);
    }

    .leadiq-table td {
      padding: 10px 14px;
      vertical-align: middle;
    }

    .lead-primary-cell {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 180px;
    }

    .company-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #EFEAE1;
      border: 1px solid var(--border-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-primary);
      flex-shrink: 0;
    }

    .lead-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.25;
    }

    .lead-id-pill {
      display: inline-block;
      padding: 1px 6px;
      background: rgba(244, 96, 54, 0.08);
      border: 1px solid rgba(244, 96, 54, 0.25);
      color: #D9481C;
      border-radius: 4px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.3px;
      flex-shrink: 0;
    }

    .lead-company-name {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 13px;
    }

    .lead-contact-name {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .industry-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .industry-badge {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .location-sub {
      font-size: 10px;
      color: var(--text-muted);
    }

    .source-tag {
      font-size: 11px;
      background: var(--bg-surface);
      padding: 2px 7px;
      border-radius: 4px;
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }

    .stage-cell-wrap {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .badge-stage {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
      background: var(--bg-surface);
      color: var(--text-primary);
      width: fit-content;
    }
    .won-stage {
      background: rgba(42, 157, 143, 0.15);
      color: #228276;
      border: 1px solid rgba(42, 157, 143, 0.3);
    }
    .lost-stage {
      background: rgba(107, 107, 102, 0.15);
      color: #555550;
      border: 1px solid rgba(107, 107, 102, 0.3);
    }

    /* Stagnation Pills */
    .stagnation-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
      width: fit-content;
    }

    .warning-pill {
      background: rgba(233, 162, 59, 0.14);
      color: #A36209;
      border: 1px solid rgba(233, 162, 59, 0.35);
    }

    .critical-pill {
      background: rgba(217, 85, 85, 0.14);
      color: #C83B3B;
      border: 1px solid rgba(217, 85, 85, 0.35);
    }

    .stage-age-normal {
      font-size: 10px;
      color: var(--text-muted);
    }

    /* Numerical Conversion Probability Cell */
    .prob-num-wrap {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .prob-tag {
      font-size: 11.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 5px;
      width: fit-content;
      font-family: var(--font-mono);
    }

    .prob-high {
      background: rgba(42, 157, 143, 0.12);
      color: #1F7A6F;
      border: 1px solid rgba(42, 157, 143, 0.3);
    }

    .prob-medium {
      background: rgba(233, 162, 59, 0.12);
      color: #A36209;
      border: 1px solid rgba(233, 162, 59, 0.3);
    }

    .prob-nurture {
      background: rgba(123, 97, 255, 0.1);
      color: #5D43E0;
      border: 1px solid rgba(123, 97, 255, 0.25);
    }

    .prob-low {
      background: rgba(107, 107, 102, 0.1);
      color: #555550;
      border: 1px solid rgba(107, 107, 102, 0.25);
    }

    .mock-ai-label {
      font-size: 9px;
      color: var(--text-muted);
      letter-spacing: 0.04em;
    }

    .completed-conversion-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .conversion-status-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      width: fit-content;
    }
    .conversion-status-pill.won {
      background: #2A9D8F;
      color: #FFFFFF;
    }
    .conversion-status-pill.lost {
      background: #6B6B66;
      color: #FFFFFF;
    }

    .conversion-sub {
      font-size: 9.5px;
      color: var(--text-muted);
    }

    /* Engagement */
    .eng-dot-row {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-weight: 500;
    }
    .eng-dot { font-size: 9px; }
    .eng-high { color: #228276; }
    .eng-medium { color: #A36209; }
    .eng-low { color: #8C8C85; }

    .deal-size {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary);
    }

    /* Next Action */
    .action-cell {
      max-width: 280px;
    }

    .next-action-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .next-action-text {
      font-size: 11.5px;
      color: var(--text-primary);
      line-height: 1.3;
      white-space: normal;
      flex: 1;
    }

    .focus-now-mini-btn {
      background: rgba(231, 111, 81, 0.1);
      border: 1px solid rgba(231, 111, 81, 0.3);
      color: #C84B2E;
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 6px;
      border-radius: 4px;
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }
    .focus-now-mini-btn:hover {
      background: #E76F51;
      color: #FFFFFF;
    }

    .table-view-btn {
      font-size: 11.5px;
      padding: 4px 9px;
    }

    /* Empty state */
    .empty-state-cell {
      padding: 48px 16px;
      text-align: center;
    }

    .empty-state-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      max-width: 420px;
      margin: 0 auto;
    }

    .empty-icon {
      font-size: 32px;
      opacity: 0.6;
    }

    .empty-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .empty-sub {
      font-size: 12.5px;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .empty-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    /* Pagination Footer */
    .pagination-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 10px 4px;
      flex-wrap: wrap;
    }

    .pagination-info {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .pagination-total-hint {
      color: var(--text-muted);
      font-size: 11px;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-numbers {
      display: flex;
      gap: 4px;
    }

    .page-num-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }
    .page-num-btn:hover {
      background: var(--bg-card-hover);
      color: var(--text-primary);
    }
    .page-num-btn.active {
      background: #E76F51;
      color: #FFFFFF;
      border-color: #D65D3F;
    }

    /* Business Priority styling */
    .bp-table-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .bp-badge-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bp-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      font-family: var(--font-mono);
      letter-spacing: -0.02em;
    }

    .bp-denom {
      font-size: 10px;
      opacity: 0.75;
      font-weight: 500;
    }

    .bp-tier-tag {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .bp-micro-caption {
      font-size: 10px;
      color: var(--text-muted);
      letter-spacing: 0.02em;
    }

    .bp-very-high {
      background: #FFF1ED;
      color: #C84B2E;
      border: 1px solid rgba(244, 96, 54, 0.4);
      box-shadow: 0 1px 4px rgba(244, 96, 54, 0.15);
    }
    .tier-very-high {
      background: #F46036;
      color: #FFFFFF;
    }

    .bp-high {
      background: #FEF3C7;
      color: #B45309;
      border: 1px solid rgba(245, 158, 11, 0.35);
    }
    .tier-high {
      background: #F59E0B;
      color: #FFFFFF;
    }

    .bp-medium {
      background: #EEF2FF;
      color: #4338CA;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .tier-medium {
      background: #6366F1;
      color: #FFFFFF;
    }

    .bp-low {
      background: #F3F4F6;
      color: #6B7280;
      border: 1px solid #E5E7EB;
    }
    .tier-low {
      background: #9CA3AF;
      color: #FFFFFF;
    }

    .source-cell-box {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .source-referral {
      background: #F5F3FF !important;
      color: #6D28D9 !important;
      border-color: #DDD6FE !important;
    }

    .referred-by-micro {
      font-size: 10px;
      color: #7C3AED;
      font-weight: 600;
    }

    .deal-cell-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .deal-sub-label {
      font-size: 10px;
      color: var(--text-muted);
    }
  `]
})
export class LeadsComponent implements OnInit {
  public leadService = inject(LeadService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  Math = Math;
  searchQuery = '';
  priorityFilter: LeadPriority | 'all' = 'all';
  stageFilter: string = 'all';
  sourceFilter: string = 'all';
  industryFilter: string = 'all';
  scoreRangeFilter: string = 'all';
  sortBy: string = 'businessPriority';
  scopeTab: LeadScopeTab = 'active';

  currentPage = 1;
  pageSize = 8;
  showAddModal = false;

  ngOnInit(): void {
    if (this.leadService.leads().length === 0) {
      this.leadService.loadLeads();
    }

    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
      }
      if (params['priority']) {
        this.priorityFilter = params['priority'];
      }
      if (params['focus'] === 'true') {
        this.leadService.setFocusMode(true);
      }
    });

    if (this.leadService.globalSearchQuery()) {
      this.searchQuery = this.leadService.globalSearchQuery();
    }
  }

  async onDeleteLead(lead: Lead, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    const confirmed = confirm(`Are you sure you want to delete this lead?\n\nCompany: ${lead.company}\nContact: ${lead.contactName}`);
    if (confirmed) {
      await this.leadService.deleteLead(lead.id);
    }
  }

  setScopeTab(tab: LeadScopeTab): void {
    this.scopeTab = tab;
    this.currentPage = 1;
    if (tab === 'won') {
      this.stageFilter = 'Won';
    } else if (tab === 'lost') {
      this.stageFilter = 'Lost';
    } else {
      this.stageFilter = 'all';
    }
  }

  get filteredBaseLeads(): Lead[] {
    // If Focus Mode is active, take focus leads
    if (this.leadService.focusMode()) {
      return this.leadService.focusHighPriorityLeads();
    }

    if (this.scopeTab === 'active') {
      // For salesperson, prioritize their active leads
      return this.authService.isSalesperson() 
        ? this.leadService.myLeads() 
        : this.leadService.activeLeads();
    } else if (this.scopeTab === 'won') {
      return this.leadService.wonLeads();
    } else if (this.scopeTab === 'lost') {
      return this.leadService.lostLeads();
    } else {
      return [...this.leadService.leads()];
    }
  }

  get filteredLeads(): Lead[] {
    let list = [...this.filteredBaseLeads];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(l => 
        l.company.toLowerCase().includes(q) ||
        (l.publicLeadId && l.publicLeadId.toLowerCase().includes(q)) ||
        l.contactName.toLowerCase().includes(q) ||
        l.contactEmail.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q)
      );
    }

    if (this.priorityFilter !== 'all') {
      list = list.filter(l => l.priority === this.priorityFilter);
    }

    if (this.stageFilter !== 'all') {
      list = list.filter(l => l.stage === this.stageFilter);
    }

    if (this.sourceFilter !== 'all') {
      list = list.filter(l => l.source === this.sourceFilter);
    }

    if (this.industryFilter !== 'all') {
      list = list.filter(l => l.industry.toLowerCase().includes(this.industryFilter.toLowerCase()));
    }

    if (this.scoreRangeFilter === '80+') {
      list = list.filter(l => l.aiScore >= 80);
    } else if (this.scoreRangeFilter === '60-79') {
      list = list.filter(l => l.aiScore >= 60 && l.aiScore <= 79);
    } else if (this.scoreRangeFilter === '40-59') {
      list = list.filter(l => l.aiScore >= 40 && l.aiScore <= 59);
    } else if (this.scoreRangeFilter === '<40') {
      list = list.filter(l => l.aiScore < 40);
    }

    list.sort((a, b) => {
      if (this.sortBy === 'businessPriority') return (b.businessPriorityScore || 0) - (a.businessPriorityScore || 0);
      if (this.sortBy === 'aiScore') return b.aiScore - a.aiScore;
      if (this.sortBy === 'conversion') return (b.conversionPercentage || 0) - (a.conversionPercentage || 0);
      if (this.sortBy === 'dealSize') return (b.expectedInvestment || 0) - (a.expectedInvestment || 0);
      if (this.sortBy === 'company') return a.company.localeCompare(b.company);
      if (this.sortBy === 'stage') return a.stage.localeCompare(b.stage);
      return 0;
    });

    return list;
  }

  get paginatedLeads(): Lead[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLeads.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLeads.length / this.pageSize) || 1;
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  countByPriority(priority: LeadPriority): number {
    return this.filteredBaseLeads.filter(l => l.priority === priority).length;
  }

  focusOnLead(lead: Lead, event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/leads', lead.id]);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.priorityFilter = 'all';
    this.stageFilter = 'all';
    this.sourceFilter = 'all';
    this.industryFilter = 'all';
    this.scoreRangeFilter = 'all';
    this.sortBy = 'aiScore';
    this.scopeTab = 'active';
    this.currentPage = 1;
    this.leadService.setFocusMode(false);
  }
}
