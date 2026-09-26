import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeadService } from '../../core/services/lead.service';
import { Activity } from '../../models';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="activity-page animate-fade-in">
      
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="header-chip">
            <span class="chip-spark">⚡</span>
            <span>ENGAGEMENT AUDIT STREAM</span>
          </div>
          <h1 class="page-title">Activity & Interaction Center</h1>
          <p class="page-subtitle">
            Chronological audit trail of customer touches, sales rep engagements, quotation requests, and AI scoring events.
          </p>
        </div>

        <div class="activity-stats">
          <div class="stat-pill">
            <span class="stat-num mono text-coral">{{ leadService.activities().length }}</span>
            <span class="stat-txt">Recorded Events</span>
          </div>
        </div>
      </div>

      <!-- Controls: Filters & Search -->
      <div class="controls-row">
        <!-- Filter Pills -->
        <div class="filter-pills-row">
          <button 
            *ngFor="let filter of activityFilters"
            class="filter-btn"
            [class.active]="selectedFilter === filter.type"
            (click)="selectedFilter = filter.type"
          >
            <span class="filter-icon">{{ filter.icon }}</span>
            {{ filter.label }}
            <span class="filter-count mono">({{ getFilterCount(filter.type) }})</span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search company, rep, title..." 
            class="search-input"
          />
          <button *ngIf="searchQuery" (click)="searchQuery = ''" class="clear-search-btn">✕</button>
        </div>
      </div>

      <!-- Main Activity Feed Timeline -->
      <div class="card timeline-card">
        <div class="activity-stream">
          <div 
            *ngFor="let act of filteredActivities"
            class="activity-row"
          >
            <!-- Left Icon & Type -->
            <div class="act-icon-wrap" [ngClass]="'type-' + act.type">
              <span *ngIf="act.type === 'email'">✉️</span>
              <span *ngIf="act.type === 'demo'">💻</span>
              <span *ngIf="act.type === 'proposal'">📄</span>
              <span *ngIf="act.type === 'quotation'">🏷️</span>
              <span *ngIf="act.type === 'call'">📞</span>
              <span *ngIf="act.type === 'meeting'">🤝</span>
              <span *ngIf="act.type === 'stage_change'">🚀</span>
              <span *ngIf="act.type === 'note'">📝</span>
            </div>

            <!-- Content -->
            <div class="act-body">
              <div class="act-header-line">
                <div class="act-lead-link">
                  <span *ngIf="act.leadPublicId" class="act-lead-id-pill mono font-semibold">{{ act.leadPublicId }}</span>
                  <a [routerLink]="['/leads', act.leadId]" class="lead-company-name">
                    {{ act.leadCompany }}
                  </a>
                  <span class="act-type-tag">{{ act.type }}</span>
                </div>

                <div class="act-meta-line mono">
                  <span class="act-time">{{ act.timestamp }}</span>
                  <span class="act-divider">•</span>
                  <span class="act-rep">Rep: {{ act.salesRep }}</span>
                </div>
              </div>

              <div class="act-title">{{ act.title }}</div>
              <p class="act-desc">{{ act.description }}</p>

              <div class="act-footer-bar">
                <span *ngIf="act.impactScore" class="impact-chip mono" [ngClass]="act.impactScore > 0 ? 'impact-pos' : 'impact-neg'">
                  ⚡ AI Score Delta: {{ act.impactScore > 0 ? '+' : '' }}{{ act.impactScore }} pts
                </span>
                <span *ngIf="!act.impactScore" class="impact-neutral mono">
                  ● Telemetry logged
                </span>

                <a [routerLink]="['/leads', act.leadId]" class="intel-link">
                  View Lead Intelligence →
                </a>
              </div>
            </div>
          </div>

          <div *ngIf="filteredActivities.length === 0" class="no-activity-state">
            <span class="no-act-icon">📭</span>
            <h4>No activities found</h4>
            <p>No activity records match your current filter or search criteria.</p>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .activity-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
      padding-bottom: 6px;
    }

    .header-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--accent-coral, #E76F51);
      background: rgba(231, 111, 81, 0.08);
      border: 1px solid rgba(231, 111, 81, 0.22);
      padding: 3px 10px;
      border-radius: 999px;
      margin-bottom: 8px;
    }

    .chip-spark {
      font-size: 12px;
    }

    .page-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      font-weight: 700;
      color: var(--text-primary, #202124);
      letter-spacing: -0.02em;
      margin: 0 0 6px 0;
    }

    .page-subtitle {
      font-size: 13.5px;
      color: var(--text-secondary, #6B6358);
      margin: 0;
      max-width: 680px;
      line-height: 1.5;
    }

    .activity-stats {
      display: flex;
      gap: 10px;
    }

    .stat-pill {
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 8px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }
    .stat-num { font-size: 20px; font-weight: 800; }
    .text-coral { color: var(--accent-coral, #E76F51); }
    .stat-txt { font-size: 12px; color: var(--text-muted, #948B7D); font-weight: 600; }

    /* Controls Row */
    .controls-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .filter-pills-row {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
    }

    .filter-btn {
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 6px;
      padding: 6px 12px;
      color: var(--text-secondary, #6B6358);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .filter-btn:hover {
      background: var(--bg-surface, #F1ECE1);
      color: var(--text-primary, #202124);
      border-color: var(--border-medium, #D5CCA8);
    }
    .filter-btn.active {
      background: var(--accent-coral, #E76F51);
      border-color: var(--accent-coral, #E76F51);
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(231, 111, 81, 0.22);
    }
    .filter-btn.active .filter-count {
      color: rgba(255, 255, 255, 0.85);
    }

    .filter-icon {
      font-size: 12px;
    }

    .filter-count {
      font-size: 11px;
      color: var(--text-muted, #948B7D);
    }

    .search-wrap {
      position: relative;
      display: flex;
      align-items: center;
      min-width: 250px;
    }

    .search-icon {
      position: absolute;
      left: 10px;
      font-size: 12px;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 6px;
      padding: 7px 28px 7px 30px;
      font-size: 12.5px;
      color: var(--text-primary, #202124);
      outline: none;
      transition: border-color 0.15s ease;
    }
    .search-input:focus {
      border-color: var(--accent-coral, #E76F51);
      box-shadow: 0 0 0 3px rgba(231, 111, 81, 0.12);
    }

    .clear-search-btn {
      position: absolute;
      right: 8px;
      background: none;
      border: none;
      font-size: 12px;
      color: var(--text-muted, #948B7D);
      cursor: pointer;
    }

    .timeline-card {
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .activity-stream {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .activity-row {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--border-subtle, #E6DEC8);
    }
    .activity-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .act-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-surface, #F1ECE1);
      border: 1px solid var(--border-subtle, #E6DEC8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .type-email { border-color: rgba(123, 97, 255, 0.35); background: rgba(123, 97, 255, 0.08); }
    .type-demo { border-color: rgba(42, 157, 143, 0.35); background: rgba(42, 157, 143, 0.08); }
    .type-quotation { border-color: rgba(231, 111, 81, 0.35); background: rgba(231, 111, 81, 0.08); }
    .type-stage_change { border-color: rgba(42, 157, 143, 0.35); background: rgba(42, 157, 143, 0.08); }
    .type-call { border-color: rgba(233, 162, 59, 0.35); background: rgba(233, 162, 59, 0.08); }
    .type-meeting { border-color: rgba(123, 97, 255, 0.35); background: rgba(123, 97, 255, 0.08); }
    .type-proposal { border-color: rgba(231, 111, 81, 0.35); background: rgba(231, 111, 81, 0.08); }
    .type-note { border-color: var(--border-medium, #D5CCA8); }

    .act-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .act-header-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .act-lead-link {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .act-lead-id-pill {
      font-size: 10.5px;
      font-weight: 700;
      color: #D9481C;
      background: rgba(244, 96, 54, 0.08);
      border: 1px solid rgba(244, 96, 54, 0.25);
      padding: 1px 6px;
      border-radius: 4px;
      letter-spacing: 0.3px;
      flex-shrink: 0;
    }

    .lead-company-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary, #202124);
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .lead-company-name:hover {
      color: var(--accent-coral, #E76F51);
    }

    .act-type-tag {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      background: var(--bg-surface, #F1ECE1);
      padding: 2px 7px;
      border-radius: 4px;
      color: var(--text-muted, #948B7D);
    }

    .act-meta-line {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11.5px;
    }
    .act-time { color: var(--text-muted, #948B7D); }
    .act-divider { color: var(--border-medium, #D5CCA8); }
    .act-rep { color: var(--text-secondary, #6B6358); font-weight: 500; }

    .act-title {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-primary, #202124);
    }

    .act-desc {
      font-size: 12.5px;
      color: var(--text-secondary, #6B6358);
      line-height: 1.45;
      margin: 2px 0 0 0;
    }

    .act-footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
      flex-wrap: wrap;
      gap: 8px;
    }

    .impact-chip {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .impact-pos {
      background: rgba(42, 157, 143, 0.12);
      color: #1F7369;
      border: 1px solid rgba(42, 157, 143, 0.25);
    }
    .impact-neg {
      background: rgba(231, 111, 81, 0.12);
      color: #C04E31;
      border: 1px solid rgba(231, 111, 81, 0.25);
    }
    .impact-neutral {
      font-size: 11px;
      color: var(--text-muted, #948B7D);
    }

    .intel-link {
      font-size: 11.5px;
      color: var(--accent-coral, #E76F51);
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.15s ease;
    }
    .intel-link:hover {
      text-decoration: underline;
    }

    .no-activity-state {
      padding: 48px;
      text-align: center;
      color: var(--text-muted, #948B7D);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .no-act-icon { font-size: 32px; }
    .no-activity-state h4 { margin: 0; color: var(--text-primary, #202124); font-size: 16px; }
    .no-activity-state p { margin: 0; font-size: 13px; }
  `]
})
export class ActivityComponent {
  leadService = inject(LeadService);

  readonly activityFilters = [
    { label: 'All Activities', type: 'all', icon: '⚡' },
    { label: 'Emails', type: 'email', icon: '✉️' },
    { label: 'Calls', type: 'call', icon: '📞' },
    { label: 'Demos', type: 'demo', icon: '💻' },
    { label: 'Proposals', type: 'proposal', icon: '📄' },
    { label: 'Quotations', type: 'quotation', icon: '🏷️' },
    { label: 'Meetings', type: 'meeting', icon: '🤝' },
    { label: 'Stage Moves', type: 'stage_change', icon: '🚀' }
  ];

  selectedFilter = 'all';
  searchQuery = '';

  ngOnInit(): void {
    this.leadService.loadActivities();
  }

  get filteredActivities(): Activity[] {
    let list = this.leadService.activities();
    if (this.selectedFilter !== 'all') {
      list = list.filter(a => a.type === this.selectedFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(a => 
        a.leadCompany.toLowerCase().includes(q) ||
        (a.leadPublicId && a.leadPublicId.toLowerCase().includes(q)) ||
        a.salesRep.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getFilterCount(type: string): number {
    const list = this.leadService.activities();
    if (type === 'all') return list.length;
    return list.filter(a => a.type === type).length;
  }
}
