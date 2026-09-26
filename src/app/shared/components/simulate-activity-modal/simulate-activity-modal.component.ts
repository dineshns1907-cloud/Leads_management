import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lead } from '../../../models';
import { LeadService, ActivitySimulationType } from '../../../core/services/lead.service';

interface SimulationOption {
  type: ActivitySimulationType;
  title: string;
  description: string;
  pointsDelta: number;
  icon: string;
  category: 'positive' | 'negative';
}

@Component({
  selector: 'app-simulate-activity-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        
        <div class="modal-header">
          <div class="header-left">
            <span class="ai-spark-icon">⚡</span>
            <div>
              <h2 class="modal-title">Simulate Customer Activity</h2>
              <p class="modal-subtitle">
                Interactive behavioral re-scoring for <strong>{{ lead.company }}</strong>
              </p>
            </div>
          </div>
          <button class="close-btn" (click)="close()" aria-label="Close modal">×</button>
        </div>

        <div class="lead-current-state">
          <div class="state-item">
            <span class="state-label">CURRENT AI SCORE</span>
            <span class="state-value mono current-score">{{ lead.aiScore }} <small>/100</small></span>
          </div>
          <div class="state-item">
            <span class="state-label">CONVERSION PROBABILITY</span>
            <span class="state-value">{{ lead.conversionProbability }} ({{ lead.conversionPercentage }}%)</span>
          </div>
          <div class="state-item">
            <span class="state-label">PIPELINE STAGE</span>
            <span class="state-value">{{ lead.stage }}</span>
          </div>
        </div>

        <p class="section-hint">
          Select a customer action to simulate real-time AI behavioral signals and update the predictive score:
        </p>

        <div class="options-grid">
          <div 
            *ngFor="let opt of simulationOptions"
            class="simulation-option-card"
            [ngClass]="opt.category === 'positive' ? 'opt-pos' : 'opt-neg'"
            (click)="triggerSimulation(opt.type)"
          >
            <div class="option-header">
              <span class="option-icon">{{ opt.icon }}</span>
              <div class="option-delta mono" [ngClass]="opt.pointsDelta > 0 ? 'delta-pos' : 'delta-neg'">
                {{ opt.pointsDelta > 0 ? '+' : '' }}{{ opt.pointsDelta }} pts
              </div>
            </div>
            
            <div class="option-title">{{ opt.title }}</div>
            <div class="option-desc">{{ opt.description }}</div>
            
            <div class="option-footer">
              <span class="projected-score mono">
                Projected: {{ calculateProjected(opt.pointsDelta) }} / 100
              </span>
              <span class="trigger-link">Simulate →</span>
            </div>
          </div>
        </div>

        <div class="modal-footer-notice">
          <span class="notice-badge">REAL-TIME BEHAVIORAL SCORING</span>
          <span>Behavioral model recalculates score attribution, appends activity to timeline, and adjusts conversion probability.</span>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: var(--bg-overlay, rgba(32, 33, 36, 0.45));
      backdrop-filter: blur(2px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 150ms ease-out;
    }

    .modal-content {
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E2DDD2);
      border-radius: 14px;
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px;
      box-shadow: var(--shadow-lg, 0 16px 36px rgba(0,0,0,0.1));
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 14px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ai-spark-icon {
      font-size: 20px;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(231, 111, 81, 0.12);
      color: #E76F51;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-title {
      font-family: var(--font-heading);
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .modal-subtitle {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 22px;
      color: var(--text-muted);
      cursor: pointer;
      line-height: 1;
      padding: 2px 6px;
      border-radius: 4px;
      transition: color var(--transition-fast);
    }
    .close-btn:hover {
      color: var(--text-primary);
    }

    .lead-current-state {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      background: var(--bg-surface, #EFEAE1);
      padding: 12px 16px;
      border-radius: 10px;
      border: 1px solid var(--border-subtle);
    }

    .state-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .state-label {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .state-value {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .current-score {
      color: #E76F51;
      font-size: 16px;
    }
    .current-score small {
      font-size: 11px;
      color: var(--text-muted);
    }

    .section-hint {
      font-size: 12.5px;
      color: var(--text-secondary);
      margin: 0;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      max-height: 380px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .simulation-option-card {
      padding: 12px 14px;
      border-radius: 10px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all var(--transition-fast);
    }

    .simulation-option-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .opt-pos:hover {
      border-color: #2A9D8F;
      background: rgba(42, 157, 143, 0.04);
    }

    .opt-neg:hover {
      border-color: #E76F51;
      background: rgba(231, 111, 81, 0.04);
    }

    .option-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .option-icon {
      font-size: 16px;
    }

    .option-delta {
      font-size: 11px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
    }

    .delta-pos {
      background: rgba(42, 157, 143, 0.12);
      color: #1F7A6F;
    }

    .delta-neg {
      background: rgba(231, 111, 81, 0.12);
      color: #C84B2E;
    }

    .option-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .option-desc {
      font-size: 11.5px;
      color: var(--text-secondary);
      line-height: 1.35;
      flex: 1;
    }

    .option-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
      padding-top: 6px;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      font-size: 11px;
    }

    .projected-score {
      color: var(--text-muted);
      font-weight: 600;
    }

    .trigger-link {
      color: #E76F51;
      font-weight: 700;
    }

    .modal-footer-notice {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 11px;
      color: var(--text-muted);
      border-top: 1px solid var(--border-subtle);
      padding-top: 12px;
    }

    .notice-badge {
      font-size: 10px;
      font-weight: 700;
      color: #5B40E8;
      background: rgba(123, 97, 255, 0.1);
      border: 1px solid rgba(123, 97, 255, 0.25);
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    @media (max-width: 600px) {
      .options-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SimulateActivityModalComponent {
  @Input({ required: true }) lead!: Lead;
  @Output() closed = new EventEmitter<void>();
  @Output() simulated = new EventEmitter<void>();

  private leadService = inject(LeadService);

  readonly simulationOptions: SimulationOption[] = [
    {
      type: 'email_reply',
      title: 'Customer replied to email',
      description: 'Prospect responded with positive questions and next availability.',
      pointsDelta: 8,
      icon: '✉️',
      category: 'positive'
    },
    {
      type: 'demo_attended',
      title: 'Customer attended demo',
      description: 'Prospect and executive stakeholders completed live product walkthrough.',
      pointsDelta: 15,
      icon: '💻',
      category: 'positive'
    },
    {
      type: 'quotation_requested',
      title: 'Customer requested quotation',
      description: 'Formal commercial pricing and seat quotation requested by leadership.',
      pointsDelta: 18,
      icon: '📄',
      category: 'positive'
    },
    {
      type: 'proposal_opened',
      title: 'Customer opened proposal',
      description: 'Commercial proposal reviewed by decision-maker in procurement portal.',
      pointsDelta: 10,
      icon: '👁️',
      category: 'positive'
    },
    {
      type: 'meeting_booked',
      title: 'Customer booked meeting',
      description: 'Prospect reserved high-intent calendar slot for commercial alignment.',
      pointsDelta: 12,
      icon: '📅',
      category: 'positive'
    },
    {
      type: 'pricing_visited',
      title: 'Customer visited pricing page',
      description: 'High-intent digital visit on enterprise tier calculator and SLA terms.',
      pointsDelta: 6,
      icon: '🏷️',
      category: 'positive'
    },
    {
      type: 'discount_requested',
      title: 'Customer requested discount',
      description: 'Active negotiation on volume multi-year annual commitment terms.',
      pointsDelta: 5,
      icon: '🤝',
      category: 'positive'
    },
    {
      type: 'followup_ignored',
      title: 'Customer ignored follow-up',
      description: 'Follow-up outreach remained unread after 5 business days.',
      pointsDelta: -8,
      icon: '📪',
      category: 'negative'
    },
    {
      type: 'inactivity',
      title: 'Customer became inactive',
      description: 'No response to consecutive cadence touches; decay penalty applied.',
      pointsDelta: -12,
      icon: '⏸️',
      category: 'negative'
    }
  ];

  calculateProjected(delta: number): number {
    return Math.min(99, Math.max(15, this.lead.aiScore + delta));
  }

  triggerSimulation(type: ActivitySimulationType): void {
    this.leadService.simulateActivity(this.lead.id, type);
    this.simulated.emit();
    this.close();
  }

  close(): void {
    this.closed.emit();
  }
}
