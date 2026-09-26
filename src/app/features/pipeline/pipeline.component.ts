import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeadService } from '../../core/services/lead.service';
import { AuthService } from '../../core/services/auth.service';
import { ScoreBadgeComponent } from '../../shared/components/score-badge/score-badge.component';
import { Lead, PipelineStage } from '../../models';
import { formatCurrency, parseCurrencyValue } from '../../core/mappers/api-adapter';

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [CommonModule, RouterModule, ScoreBadgeComponent],
  template: `
    <div class="pipeline-page animate-fade-in">
      
      <!-- Pipeline Header Bar -->
      <div class="pipeline-header">
        <div class="header-left-col">
          <div class="pipeline-badges">
            <span class="active-badge">{{ leadService.activeOpportunitiesCount() }} Active Opportunities</span>
            <span class="total-crm-badge">{{ leadService.totalLeadsCount() }} Database Leads</span>
          </div>
          <h1 class="pipeline-title">Opportunity Pipeline</h1>
          <p class="pipeline-subtitle">
            Visual stage progression with behavioral AI prioritization. Drag & drop cards to progress opportunities.
          </p>
        </div>

        <div class="pipeline-actions-col">
          <!-- Horizontal Scroll Navigator Controls -->
          <div class="scroll-controls">
            <button class="scroll-arrow-btn" (click)="scrollBoard(-320)" title="Scroll pipeline left">
              ← Left
            </button>
            <button class="scroll-arrow-btn" (click)="scrollBoard(320)" title="Scroll pipeline right">
              Right →
            </button>
          </div>

          <!-- Focus High-Priority Leads Toggle (Requirement 9 & 10) -->
          <button 
            class="btn focus-pipeline-btn"
            [class.active-focus]="leadService.focusMode()"
            (click)="leadService.toggleFocusMode()"
          >
            <span>🎯</span>
            <span>{{ leadService.focusMode() ? 'Focus Mode Active' : 'Focus High-Priority Leads' }}</span>
          </button>

          <!-- Stage Filter Toggle -->
          <button 
            class="btn btn-outline btn-sm"
            [class.btn-active-filter]="selectedStageFilter === 'all'"
            (click)="filterStage('all')"
          >
            All Stages (8)
          </button>
        </div>
      </div>

      <!-- Focus Mode Banner -->
      <div class="focus-banner" *ngIf="leadService.focusMode()">
        <div class="focus-banner-content">
          <span class="focus-fire-icon">🎯</span>
          <div class="focus-banner-text">
            <strong>FOCUS MODE ACTIVE:</strong> Showing only high-priority leads requiring immediate sales engagement (Score ≥ 80, high engagement, momentum surges, or stage stagnation).
          </div>
        </div>
        <button class="focus-clear-btn" (click)="leadService.toggleFocusMode()">
          Clear Focus Mode ✕
        </button>
      </div>

      <!-- Summary Metrics Strip -->
      <div class="pipeline-metrics-strip">
        <div class="summary-pill">
          <span class="pill-label">Active Deals:</span>
          <span class="pill-val mono">{{ leadService.activeOpportunitiesCount() }}</span>
        </div>
        <div class="summary-pill">
          <span class="pill-label">Active ARR:</span>
          <span class="pill-val mono text-coral">{{ calculateTotalActiveARR() }}</span>
        </div>
        <div class="summary-pill">
          <span class="pill-label">Won Pipeline:</span>
          <span class="pill-val mono text-emerald">{{ calculateWonARR() }}</span>
        </div>
        <div class="summary-pill">
          <span class="pill-label">Avg AI Score:</span>
          <span class="pill-val mono text-ai">{{ leadService.averageScore() }} / 100</span>
        </div>
      </div>

      <!-- Kanban Board Columns Container (Smooth horizontal scroll without clipping) -->
      <div class="kanban-scroll-viewport" #kanbanViewport>
        <div class="kanban-board">
          
          <div 
            *ngFor="let col of visibleColumns" 
            class="kanban-column"
            [class.won-column]="col === 'Won'"
            [class.lost-column]="col === 'Lost'"
            [class.drag-over-col]="isDraggingOverCol === col"
            (dragover)="onDragOver($event, col)"
            (dragleave)="onDragLeave($event, col)"
            (drop)="onDrop($event, col)"
          >
            <!-- Column Header -->
            <div class="column-header">
              <div class="column-title-row">
                <span class="stage-dot" [ngClass]="getStageDotClass(col)"></span>
                <span class="column-name">{{ col }}</span>
                <span class="column-count mono">{{ getLeadsForStage(col).length }}</span>
              </div>
              <div class="column-total-val mono">
                {{ calculateStageValue(col) }}
              </div>
            </div>

            <!-- Column Cards Container -->
            <div class="cards-container">
              <div 
                *ngFor="let lead of getLeadsForStage(col); trackBy: trackById"
                class="kanban-card"
                [class.hot-card]="lead.priority === 'hot'"
                [class.stagnant-card]="lead.stagnationStatus !== 'normal' && lead.stage !== 'Won' && lead.stage !== 'Lost'"
                draggable="true"
                (dragstart)="onDragStart($event, lead.id)"
                [routerLink]="['/leads', lead.id]"
              >
                <!-- Card Top: Company & Deal Value -->
                <div class="card-top">
                  <div class="card-company-wrap">
                    <span *ngIf="lead.publicLeadId" class="card-lead-id mono">{{ lead.publicLeadId }}</span>
                    <span class="card-company">{{ lead.company }}</span>
                    <span class="card-owner-sub" *ngIf="lead.leadOwner">{{ lead.leadOwner }}</span>
                  </div>
                  <div class="card-deal-col">
                    <span class="card-deal mono font-bold text-coral">{{ lead.expectedInvestmentFormatted || lead.dealSize }}</span>
                    <span *ngIf="lead.source === 'Referral'" class="card-ref-badge" title="Referral Lead">🤝 Ref</span>
                  </div>
                </div>

                <!-- Contact & Role -->
                <div class="card-contact">
                  {{ lead.contactName }} • <small>{{ lead.contactRole }}</small>
                </div>

                <!-- AI Score, Business Priority & Probability Row -->
                <div class="card-metrics-row">
                  <app-score-badge 
                    [score]="lead.aiScore" 
                    [priority]="lead.priority"
                    [change]="lead.scoreChange"
                    size="sm"
                  ></app-score-badge>

                  <!-- Business Priority Pill (Feature 1) -->
                  <span 
                    *ngIf="lead.businessPriorityScore !== undefined"
                    class="card-bp-pill mono" 
                    [ngClass]="'bp-' + (lead.businessPriorityTier || 'LOW').toLowerCase().replace(' ', '-')"
                    [title]="'Business Priority: ' + lead.businessPriorityScore + '/100 (' + lead.businessPriorityTier + ')'"
                  >
                    <span *ngIf="lead.businessPriorityTier === 'VERY HIGH'">🔥</span>
                    P: {{ lead.businessPriorityScore }}
                  </span>

                  <!-- Numerical Probability -->
                  <span class="card-prob-pill mono" [ngClass]="'prob-' + lead.conversionProbability.toLowerCase()">
                    {{ lead.conversionPercentage }}%
                  </span>
                </div>

                <!-- Stagnation Warning Indicator (Requirement 11) -->
                <div 
                  *ngIf="lead.stagnationStatus === 'warning' && lead.stage !== 'Won' && lead.stage !== 'Lost'" 
                  class="stagnation-warning-pill warning"
                >
                  <span>⚠️</span> Stage Stagnation ({{ lead.stageAgeDays }}d)
                </div>

                <div 
                  *ngIf="lead.stagnationStatus === 'critical' && lead.stage !== 'Won' && lead.stage !== 'Lost'" 
                  class="stagnation-warning-pill critical"
                >
                  <span>🚨</span> Critical Stagnation ({{ lead.stageAgeDays }}d)
                </div>

                <div 
                  *ngIf="lead.stagnationStatus === 'normal' && lead.stage !== 'Won' && lead.stage !== 'Lost'" 
                  class="card-time-in-stage mono"
                >
                  <span>⏱️</span> {{ lead.stageAgeDays }}d in stage
                </div>

                <!-- Recommended Next Action (Requirement 10) -->
                <div class="card-next-action-box" *ngIf="lead.recommendedAction">
                  <div class="action-box-title">NEXT ACTION</div>
                  <div class="action-box-text">{{ lead.recommendedAction }}</div>
                </div>

                <!-- Card Footer: Engagement & Last Activity -->
                <div class="card-footer">
                  <span class="eng-chip" [ngClass]="'eng-' + lead.engagementLevel.toLowerCase()">
                    {{ lead.engagementLevel }} Eng.
                  </span>
                  <span class="card-last-act mono" [title]="lead.lastActivity">
                    {{ lead.lastActivityDate }}
                  </span>
                </div>
              </div>

              <!-- Empty Drop Zone -->
              <div *ngIf="getLeadsForStage(col).length === 0" class="empty-drop-zone">
                <span class="drop-hint-icon">📥</span>
                <span>Drag opportunity here</span>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .pipeline-page {
      display: flex;
      flex-direction: column;
      gap: 14px;
      width: 100%;
      min-width: 0;
      height: calc(100vh - var(--header-height) - 40px);
    }

    .pipeline-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 12px;
      flex-shrink: 0;
    }

    .pipeline-badges {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .active-badge {
      font-size: 11px;
      font-weight: 700;
      color: #C84B2E;
      background: rgba(231, 111, 81, 0.12);
      border: 1px solid rgba(231, 111, 81, 0.25);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .total-crm-badge {
      font-size: 11px;
      font-weight: 700;
      color: #228276;
      background: rgba(42, 157, 143, 0.1);
      border: 1px solid rgba(42, 157, 143, 0.25);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .pipeline-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
      line-height: 1.15;
    }

    .pipeline-subtitle {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 3px;
    }

    .pipeline-actions-col {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    /* Scroll Navigation Controls */
    .scroll-controls {
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 2px;
    }

    .scroll-arrow-btn {
      background: transparent;
      border: none;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--text-secondary);
      padding: 5px 10px;
      border-radius: 6px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .scroll-arrow-btn:hover {
      background: var(--bg-card);
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }

    /* Focus Mode Button */
    .focus-pipeline-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-card);
      border: 1.5px solid #E76F51;
      color: #E76F51;
      font-weight: 700;
      font-size: 12.5px;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: 0 2px 6px rgba(231, 111, 81, 0.1);
    }
    .focus-pipeline-btn:hover {
      background: rgba(231, 111, 81, 0.08);
      transform: translateY(-1px);
    }
    .focus-pipeline-btn.active-focus {
      background: #E76F51;
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(231, 111, 81, 0.3);
    }

    .btn-active-filter {
      background: var(--bg-surface);
      border-color: var(--border-medium);
      color: var(--text-primary);
      font-weight: 700;
    }

    /* Focus Banner */
    .focus-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 16px;
      border-radius: 8px;
      background: rgba(231, 111, 81, 0.1);
      border: 1px solid rgba(231, 111, 81, 0.3);
      flex-shrink: 0;
      animation: fadeIn 200ms ease;
    }

    .focus-banner-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .focus-fire-icon {
      font-size: 18px;
    }

    .focus-banner-text {
      font-size: 12px;
      color: var(--text-primary);
    }

    .focus-clear-btn {
      background: var(--bg-card);
      border: 1px solid rgba(231, 111, 81, 0.35);
      color: #C84B2E;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      cursor: pointer;
      white-space: nowrap;
    }

    /* Metrics Strip */
    .pipeline-metrics-strip {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .summary-pill {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      box-shadow: var(--shadow-sm);
    }

    .pill-label { color: var(--text-muted); font-size: 11px; }
    .pill-val { font-weight: 700; color: var(--text-primary); }
    .text-coral { color: #E76F51; }
    .text-emerald { color: #2A9D8F; }
    .text-ai { color: #7B61FF; }

    /* Kanban Viewport and Columns */
    .kanban-scroll-viewport {
      flex: 1;
      min-height: 0;
      overflow-x: auto;
      overflow-y: hidden;
      border-radius: 12px;
      scroll-behavior: smooth;
    }

    .kanban-board {
      display: flex;
      gap: 14px;
      height: 100%;
      min-width: min-content;
      padding-bottom: 8px;
    }

    .kanban-column {
      width: 280px;
      flex-shrink: 0;
      background: var(--bg-surface, #EFEAE1);
      border: 1px solid var(--border-subtle, #E2DDD2);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 100%;
      transition: border-color var(--transition-fast), background var(--transition-fast);
    }

    .kanban-column.won-column {
      border-color: rgba(42, 157, 143, 0.35);
      background: rgba(42, 157, 143, 0.05);
    }

    .kanban-column.lost-column {
      border-color: rgba(107, 107, 102, 0.3);
      background: rgba(107, 107, 102, 0.04);
    }

    .kanban-column.drag-over-col {
      border-color: #E76F51;
      background: rgba(231, 111, 81, 0.06);
    }

    .column-header {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-surface);
      border-radius: 12px 12px 0 0;
      flex-shrink: 0;
    }

    .column-title-row {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .stage-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot-new { background: #7B61FF; }
    .dot-contacted { background: #3B82F6; }
    .dot-qualified { background: #06B6D4; }
    .dot-demo { background: #F59E0B; }
    .dot-proposal { background: #E76F51; }
    .dot-negotiation { background: #EC4899; }
    .dot-won { background: #2A9D8F; }
    .dot-lost { background: #6B6B66; }

    .column-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .column-count {
      font-size: 11px;
      font-weight: 700;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      padding: 1px 6px;
      border-radius: 10px;
      color: var(--text-secondary);
    }

    .column-total-val {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 600;
    }

    /* Cards Container */
    .cards-container {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow-y: auto;
      flex: 1;
    }

    .kanban-card {
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E2DDD2);
      border-radius: 10px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 7px;
      cursor: grab;
      transition: all var(--transition-fast);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      position: relative;
    }

    .kanban-card:active {
      cursor: grabbing;
    }

    .kanban-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--border-medium);
    }

    .kanban-card.hot-card {
      border-left: 3.5px solid #E76F51;
    }

    .kanban-card.stagnant-card {
      border-right: 3.5px solid #E9A23B;
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }

    .card-company-wrap {
      display: flex;
      flex-direction: column;
    }

    .card-lead-id {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      color: #D9481C;
      background: rgba(244, 96, 54, 0.08);
      border: 1px solid rgba(244, 96, 54, 0.25);
      padding: 1px 5px;
      border-radius: 4px;
      margin-bottom: 2px;
      width: fit-content;
    }

    .card-company {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.25;
    }

    .card-owner-sub {
      font-size: 10.5px;
      color: var(--text-muted);
    }

    .card-deal {
      font-size: 11.5px;
      font-weight: 700;
      color: var(--text-primary);
      background: var(--bg-surface);
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid var(--border-subtle);
      white-space: nowrap;
    }

    .card-contact {
      font-size: 11.5px;
      color: var(--text-secondary);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .card-metrics-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }

    .card-deal-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .card-ref-badge {
      font-size: 9.5px;
      font-weight: 700;
      color: #6D28D9;
      background: #F5F3FF;
      border: 1px solid #DDD6FE;
      padding: 0 4px;
      border-radius: 3px;
    }

    .card-bp-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
      letter-spacing: -0.01em;
      white-space: nowrap;
    }

    .card-bp-pill.bp-very-high {
      background: #FFF1ED;
      color: #C84B2E;
      border: 1px solid rgba(244, 96, 54, 0.4);
    }
    .card-bp-pill.bp-high {
      background: #FEF3C7;
      color: #B45309;
      border: 1px solid rgba(245, 158, 11, 0.35);
    }
    .card-bp-pill.bp-medium {
      background: #EEF2FF;
      color: #4338CA;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .card-bp-pill.bp-low {
      background: #F3F4F6;
      color: #6B7280;
      border: 1px solid #E5E7EB;
    }

    .card-prob-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
      background: var(--bg-surface);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }
    .card-prob-pill.prob-high { color: #1F7A6F; background: rgba(42, 157, 143, 0.1); }
    .card-prob-pill.prob-medium { color: #A36209; background: rgba(233, 162, 59, 0.1); }
    .card-prob-pill.prob-won { color: #228276; background: rgba(42, 157, 143, 0.15); }
    .card-prob-pill.prob-lost { color: #6B6B66; background: rgba(107, 107, 102, 0.15); }

    /* Stagnation Pills */
    .stagnation-warning-pill {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      width: fit-content;
    }
    .stagnation-warning-pill.warning {
      background: rgba(233, 162, 59, 0.14);
      color: #A36209;
      border: 1px solid rgba(233, 162, 59, 0.35);
    }
    .stagnation-warning-pill.critical {
      background: rgba(217, 85, 85, 0.14);
      color: #C83B3B;
      border: 1px solid rgba(217, 85, 85, 0.35);
    }

    .card-time-in-stage {
      font-size: 10.5px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Next Action Box on Card */
    .card-next-action-box {
      background: var(--bg-surface);
      border-left: 2px solid #E76F51;
      padding: 5px 8px;
      border-radius: 4px;
    }

    .action-box-title {
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #C84B2E;
      margin-bottom: 2px;
    }

    .action-box-text {
      font-size: 11px;
      color: var(--text-primary);
      line-height: 1.3;
      white-space: normal;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 6px;
      font-size: 10.5px;
    }

    .eng-chip {
      font-size: 10px;
      font-weight: 600;
      border-radius: 4px;
      padding: 1px 5px;
    }
    .eng-high { background: rgba(42, 157, 143, 0.1); color: #228276; }
    .eng-medium { background: rgba(233, 162, 59, 0.1); color: #A36209; }
    .eng-low { background: rgba(107, 107, 102, 0.1); color: #6B6B66; }

    .card-last-act {
      color: var(--text-muted);
      font-size: 10px;
    }

    /* Empty Drop Zone */
    .empty-drop-zone {
      border: 1.5px dashed var(--border-medium);
      border-radius: 8px;
      padding: 24px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: var(--text-muted);
      font-size: 11.5px;
      text-align: center;
      background: rgba(255, 255, 255, 0.2);
    }

    .drop-hint-icon {
      font-size: 18px;
      opacity: 0.6;
    }
  `]
})
export class PipelineComponent {
  public leadService = inject(LeadService);
  public authService = inject(AuthService);

  @ViewChild('kanbanViewport') kanbanViewport!: ElementRef<HTMLDivElement>;

  readonly allColumns: PipelineStage[] = [
    'New',
    'Contacted',
    'Qualified',
    'Demo',
    'Proposal',
    'Negotiation',
    'Won',
    'Lost'
  ];

  selectedStageFilter: string = 'all';
  private draggedLeadId: string | null = null;
  isDraggingOverCol: PipelineStage | null = null;

  ngOnInit(): void {
    if (this.leadService.leads().length === 0) {
      this.leadService.loadLeads();
    }
  }

  get visibleColumns(): PipelineStage[] {
    if (this.selectedStageFilter === 'all') {
      return this.allColumns;
    }
    return this.allColumns.filter(c => c === this.selectedStageFilter);
  }

  filterStage(stage: string): void {
    this.selectedStageFilter = stage;
  }

  scrollBoard(offset: number): void {
    if (this.kanbanViewport?.nativeElement) {
      this.kanbanViewport.nativeElement.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  getLeadsForStage(stage: PipelineStage): Lead[] {
    const leads = this.leadService.focusMode() 
      ? this.leadService.focusHighPriorityLeads()
      : this.leadService.leads();

    return leads.filter(l => l.stage === stage);
  }

  calculateStageValue(stage: PipelineStage): string {
    const leads = this.getLeadsForStage(stage);
    let total = 0;
    leads.forEach(l => {
      total += (l.expectedInvestment || parseCurrencyValue(l.dealSize));
    });
    return formatCurrency(total);
  }

  calculateTotalActiveARR(): string {
    let total = 0;
    this.leadService.activeLeads().forEach(l => {
      total += (l.expectedInvestment || parseCurrencyValue(l.dealSize));
    });
    return formatCurrency(total);
  }

  calculateWonARR(): string {
    let total = 0;
    this.leadService.wonLeads().forEach(l => {
      total += (l.expectedInvestment || parseCurrencyValue(l.dealSize));
    });
    return formatCurrency(total);
  }

  getStageDotClass(stage: PipelineStage): string {
    switch (stage) {
      case 'New': return 'dot-new';
      case 'Contacted': return 'dot-contacted';
      case 'Qualified': return 'dot-qualified';
      case 'Demo': return 'dot-demo';
      case 'Proposal': return 'dot-proposal';
      case 'Negotiation': return 'dot-negotiation';
      case 'Won': return 'dot-won';
      case 'Lost': return 'dot-lost';
    }
  }

  trackById(index: number, lead: Lead): string {
    return lead.id;
  }

  onDragStart(event: DragEvent, leadId: string): void {
    this.draggedLeadId = leadId;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', leadId);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent, col: PipelineStage): void {
    event.preventDefault();
    this.isDraggingOverCol = col;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragLeave(event: DragEvent, col: PipelineStage): void {
    if (this.isDraggingOverCol === col) {
      this.isDraggingOverCol = null;
    }
  }

  onDrop(event: DragEvent, targetStage: PipelineStage): void {
    event.preventDefault();
    this.isDraggingOverCol = null;
    const leadId = this.draggedLeadId || event.dataTransfer?.getData('text/plain');
    if (leadId) {
      this.leadService.updateLeadStage(leadId, targetStage);
      this.draggedLeadId = null;
    }
  }
}
