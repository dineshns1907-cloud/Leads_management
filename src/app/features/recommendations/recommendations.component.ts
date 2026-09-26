import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LeadService } from '../../core/services/lead.service';
import { ScoreBadgeComponent } from '../../shared/components/score-badge/score-badge.component';
import { Recommendation } from '../../models';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterModule, ScoreBadgeComponent],
  template: `
    <div class="recommendations-page animate-fade-in">
      
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="ai-chip">
            <span class="chip-spark">⚡</span>
            <span>BEHAVIORAL ACTION DISCOVERY</span>
          </div>
          <h1 class="page-title">Today's Recommended Actions</h1>
          <p class="page-subtitle">
            Prioritized interventions calculated from real-time customer behavior, document telemetry, and deal stagnation algorithms.
          </p>
        </div>

        <div class="header-metrics">
          <div class="header-metric-box">
            <span class="metric-label">PENDING ACTIONS</span>
            <span class="metric-val mono text-coral">{{ uncompletedCount }}</span>
          </div>
          <div class="header-metric-box">
            <span class="metric-label">AVG WIN CHANCE</span>
            <span class="metric-val mono text-emerald">{{ avgProbability }}%</span>
          </div>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="filter-bar">
        <button 
          *ngFor="let cat of categories" 
          class="filter-pill"
          [class.active]="selectedCategory === cat"
          (click)="selectedCategory = cat"
        >
          {{ cat }}
          <span class="pill-count mono" *ngIf="cat === 'All'">({{ leadService.recommendations().length }})</span>
          <span class="pill-count mono" *ngIf="cat !== 'All'">({{ getCategoryCount(cat) }})</span>
        </button>
      </div>

      <!-- Recommendations Cards Grid -->
      <div class="recommendations-grid">
        <div 
          *ngFor="let rec of filteredRecommendations" 
          class="rec-card"
          [class.completed]="rec.completed"
          [class.rec-urgent]="rec.urgency === 'immediate'"
        >
          <!-- Top Row: Urgency & Score & Probability -->
          <div class="rec-card-top">
            <div class="badges-group">
              <div class="urgency-badge" [ngClass]="'urgency-' + rec.urgency">
                <span *ngIf="rec.urgency === 'immediate'">⚡ IMMEDIATE FOCUS</span>
                <span *ngIf="rec.urgency === 'today'">● DUE TODAY</span>
                <span *ngIf="rec.urgency === 'this_week'">○ THIS WEEK</span>
              </div>
              <span class="category-tag">{{ rec.category }}</span>
            </div>

            <div class="score-probability-group">
              <div class="prob-pill mono">
                <span class="prob-dot"></span>
                {{ rec.probabilityPercentage }}% win chance
              </div>
              <app-score-badge 
                [score]="rec.aiScore" 
                [priority]="rec.aiScore >= 80 ? 'hot' : 'warm'"
                size="sm"
              ></app-score-badge>
              <span 
                *ngIf="getLeadBusinessPriority(rec.leadId) as bp"
                class="rec-bp-pill mono"
                [ngClass]="'bp-' + bp.tier.toLowerCase().replace(' ', '-')"
                [title]="'Business Priority: ' + bp.score + '/100 (' + bp.tier + ')'"
              >
                <span *ngIf="bp.tier === 'VERY HIGH'">🔥</span>
                P: {{ bp.score }}
              </span>
            </div>
          </div>

          <!-- Company & Contact Info -->
          <div class="rec-lead-info">
            <h3 class="rec-company">
              <a [routerLink]="['/leads', rec.leadId]">{{ rec.company }}</a>
            </h3>
            <div class="rec-contact">
              <span class="contact-name">{{ rec.contact }}</span>
              <span class="contact-divider">•</span>
              <span class="contact-role">{{ rec.contactRole }}</span>
            </div>
          </div>

          <!-- Action Box -->
          <div class="rec-action-box">
            <div class="action-header">
              <span class="action-badge">RECOMMENDED NEXT ACTION</span>
            </div>
            <div class="action-text">{{ rec.action }}</div>
          </div>

          <!-- Reason & Behavioral Trigger -->
          <div class="rec-reason-box">
            <div class="reason-label">BEHAVIORAL RATIONALE & SIGNALS:</div>
            <p class="reason-text">{{ rec.reason }}</p>
          </div>

          <!-- Card Footer Actions -->
          <div class="rec-card-footer">
            <div class="last-touch mono">
              <span>🕒 Last touch:</span> {{ rec.lastTouch }}
            </div>

            <div class="footer-buttons">
              <button 
                class="btn-focus-action"
                (click)="focusLead(rec.leadId)"
                title="Open lead intelligence dossier in focus mode"
              >
                🎯 Focus Now
              </button>

              <button 
                class="btn-complete-action"
                *ngIf="!rec.completed"
                (click)="completeRec(rec.id)"
              >
                ✓ Complete
              </button>

              <span *ngIf="rec.completed" class="completed-tag">
                ✓ Action Executed
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .recommendations-page {
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
      padding-bottom: 6px;
    }

    .ai-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--accent-violet, #7B61FF);
      background: rgba(123, 97, 255, 0.08);
      border: 1px solid rgba(123, 97, 255, 0.22);
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
      max-width: 650px;
      line-height: 1.5;
    }

    .header-metrics {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .header-metric-box {
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 8px;
      padding: 10px 16px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .metric-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--text-muted, #948B7D);
    }

    .metric-val {
      font-size: 22px;
      font-weight: 800;
      line-height: 1.1;
      margin-top: 2px;
    }

    .text-coral { color: var(--accent-coral, #E76F51); }
    .text-emerald { color: var(--accent-emerald, #2A9D8F); }

    /* Filter Bar */
    .filter-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-pill {
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 6px;
      padding: 7px 14px;
      color: var(--text-secondary, #6B6358);
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .filter-pill:hover {
      background: var(--bg-surface, #F1ECE1);
      color: var(--text-primary, #202124);
      border-color: var(--border-medium, #D5CCA8);
    }

    .filter-pill.active {
      background: var(--accent-coral, #E76F51);
      border-color: var(--accent-coral, #E76F51);
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(231, 111, 81, 0.25);
    }

    .filter-pill.active .pill-count {
      color: rgba(255, 255, 255, 0.85);
    }

    .pill-count {
      font-size: 11px;
      color: var(--text-muted, #948B7D);
    }

    /* Recommendations Grid */
    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 18px;
    }

    .rec-card {
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 10px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: all 0.2s ease;
      position: relative;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .rec-card:hover {
      border-color: var(--border-medium, #D5CCA8);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(42, 35, 25, 0.06);
    }

    .rec-card.rec-urgent {
      border-top: 3.5px solid var(--accent-coral, #E76F51);
    }

    .rec-card.completed {
      opacity: 0.65;
      border-color: rgba(42, 157, 143, 0.35);
      background: #F4EFE6;
    }

    .rec-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .badges-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .urgency-badge {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .urgency-immediate {
      background: rgba(231, 111, 81, 0.12);
      color: #C04E31;
      border: 1px solid rgba(231, 111, 81, 0.25);
    }
    .urgency-today {
      background: rgba(233, 162, 59, 0.14);
      color: #9E650D;
      border: 1px solid rgba(233, 162, 59, 0.28);
    }
    .urgency-this_week {
      background: rgba(42, 157, 143, 0.12);
      color: #1F7369;
      border: 1px solid rgba(42, 157, 143, 0.25);
    }

    .category-tag {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted, #948B7D);
      background: var(--bg-surface, #F1ECE1);
      padding: 2px 7px;
      border-radius: 4px;
    }

    .score-probability-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .prob-pill {
      font-size: 11px;
      font-weight: 700;
      color: var(--accent-emerald, #2A9D8F);
      background: rgba(42, 157, 143, 0.10);
      border: 1px solid rgba(42, 157, 143, 0.22);
      padding: 3px 8px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
    }

    .prob-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent-emerald, #2A9D8F);
    }

    .rec-lead-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .rec-company a {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary, #202124);
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .rec-company a:hover {
      color: var(--accent-coral, #E76F51);
    }

    .rec-contact {
      font-size: 12.5px;
      color: var(--text-secondary, #6B6358);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-name {
      font-weight: 600;
      color: var(--text-primary, #202124);
    }
    .contact-divider {
      color: var(--text-muted, #948B7D);
    }
    .contact-role {
      color: var(--text-muted, #948B7D);
    }

    .rec-action-box {
      background: #FAF6ED;
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-left: 3.5px solid var(--accent-coral, #E76F51);
      border-radius: 6px;
      padding: 10px 13px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .action-header {
      display: flex;
      align-items: center;
    }

    .action-badge {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--accent-coral, #E76F51);
    }

    .action-text {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-primary, #202124);
      line-height: 1.4;
    }

    .rec-reason-box {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .reason-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--text-muted, #948B7D);
    }

    .reason-text {
      font-size: 12.5px;
      color: var(--text-secondary, #6B6358);
      line-height: 1.45;
      margin: 0;
    }

    .rec-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border-subtle, #E6DEC8);
      padding-top: 13px;
      margin-top: auto;
      gap: 8px;
    }

    .last-touch {
      font-size: 11px;
      color: var(--text-muted, #948B7D);
    }

    .footer-buttons {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .btn-focus-action {
      background: var(--accent-coral, #E76F51);
      color: #ffffff;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s ease;
      box-shadow: 0 1px 3px rgba(231, 111, 81, 0.2);
    }
    .btn-focus-action:hover {
      background: #D95D3F;
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(231, 111, 81, 0.3);
    }

    .btn-complete-action {
      background: transparent;
      border: 1px solid var(--border-medium, #D5CCA8);
      color: var(--text-secondary, #6B6358);
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-complete-action:hover {
      background: var(--bg-surface, #F1ECE1);
      color: var(--text-primary, #202124);
      border-color: var(--accent-emerald, #2A9D8F);
    }

    .completed-tag {
      font-size: 11.5px;
      font-weight: 700;
      color: var(--accent-emerald, #2A9D8F);
      background: rgba(42, 157, 143, 0.12);
      padding: 4px 9px;
      border-radius: 5px;
      border: 1px solid rgba(42, 157, 143, 0.25);
    }

    .rec-bp-pill {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 5px;
      white-space: nowrap;
    }
    .rec-bp-pill.bp-very-high {
      background: #FFF1ED;
      color: #C84B2E;
      border: 1px solid rgba(244, 96, 54, 0.4);
    }
    .rec-bp-pill.bp-high {
      background: #FEF3C7;
      color: #B45309;
      border: 1px solid rgba(245, 158, 11, 0.35);
    }
    .rec-bp-pill.bp-medium {
      background: #EEF2FF;
      color: #4338CA;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .rec-bp-pill.bp-low {
      background: #F3F4F6;
      color: #6B7280;
      border: 1px solid #E5E7EB;
    }
  `]
})
export class RecommendationsComponent {
  leadService = inject(LeadService);
  private router = inject(Router);

  readonly categories = ['All', 'Contact', 'Follow-up', 'Demo', 'Proposal', 'Nurture'];
  selectedCategory = 'All';

  ngOnInit(): void {
    this.leadService.loadRecommendations();
  }

  getLeadBusinessPriority(leadId: string): { score: number, tier: string } | null {
    const lead = this.leadService.getLeadById(leadId);
    if (lead && lead.businessPriorityScore !== undefined) {
      return { score: lead.businessPriorityScore, tier: lead.businessPriorityTier || 'MEDIUM' };
    }
    return null;
  }

  get filteredRecommendations(): Recommendation[] {
    const list = this.leadService.recommendations();
    if (this.selectedCategory === 'All') return list;
    return list.filter(r => r.category === this.selectedCategory);
  }

  get uncompletedCount(): number {
    return this.leadService.recommendations().filter(r => !r.completed).length;
  }

  get avgProbability(): number {
    const list = this.leadService.recommendations();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, r) => acc + (r.probabilityPercentage || 75), 0);
    return Math.round(sum / list.length);
  }

  getCategoryCount(cat: string): number {
    return this.leadService.recommendations().filter(r => r.category === cat).length;
  }

  focusLead(leadId: string): void {
    this.router.navigate(['/leads', leadId]);
  }

  completeRec(id: string): void {
    this.leadService.completeRecommendation(id);
  }
}

