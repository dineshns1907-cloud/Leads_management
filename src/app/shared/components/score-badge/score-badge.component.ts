import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadPriority } from '../../../models';

@Component({
  selector: 'app-score-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="score-badge-wrap" [ngClass]="['size-' + size, 'priority-' + priority]">
      <div class="score-pill">
        <span class="score-dot"></span>
        <span class="score-value mono">{{ score }}</span>
        <span class="score-max" *ngIf="showMax">/100</span>
      </div>
      
      <div class="score-change mono" *ngIf="change !== undefined && change !== 0" [ngClass]="change > 0 ? 'pos' : 'neg'">
        <span>{{ change > 0 ? '↑' : '↓' }}</span>
        <span>{{ change > 0 ? '+' : '' }}{{ change }}</span>
      </div>

      <div class="priority-icon" *ngIf="showPriorityIcon">
        <span *ngIf="priority === 'hot'" class="fire-icon" title="High Priority: Hot Lead">🔥</span>
        <span *ngIf="priority === 'warm'" class="dot warm-dot" title="Medium Priority: Warm Lead">●</span>
        <span *ngIf="priority === 'nurture'" class="dot nurture-dot" title="Nurture Priority">●</span>
        <span *ngIf="priority === 'cold'" class="dot cold-dot" title="Low Priority: Cold Lead">○</span>
      </div>
    </div>
  `,
  styles: [`
    .score-badge-wrap {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .score-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 700;
      line-height: 1;
      border: 1px solid transparent;
      transition: all var(--transition-fast);
    }

    .score-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .score-value {
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .score-max {
      font-size: 10px;
      opacity: 0.65;
      font-weight: 500;
    }

    /* Editorial Priority Color Schemes: Coral, Amber, Violet, Muted Charcoal */
    .priority-hot .score-pill {
      background: rgba(231, 111, 81, 0.1);
      color: #C84B2E;
      border-color: rgba(231, 111, 81, 0.3);
    }
    .priority-hot .score-dot { background: #E76F51; }

    .priority-warm .score-pill {
      background: rgba(233, 162, 59, 0.1);
      color: #B57417;
      border-color: rgba(233, 162, 59, 0.3);
    }
    .priority-warm .score-dot { background: #E9A23B; }

    .priority-nurture .score-pill {
      background: rgba(123, 97, 255, 0.08);
      color: #5B40E8;
      border-color: rgba(123, 97, 255, 0.25);
    }
    .priority-nurture .score-dot { background: #7B61FF; }

    .priority-cold .score-pill {
      background: rgba(107, 107, 102, 0.08);
      color: #555550;
      border-color: rgba(107, 107, 102, 0.22);
    }
    .priority-cold .score-dot { background: #8C8C85; }

    /* Sizes */
    .size-sm .score-pill {
      padding: 2px 6px;
      font-size: 11px;
    }
    .size-sm .score-dot { width: 5px; height: 5px; }

    .size-md .score-pill {
      padding: 3px 8px;
      font-size: 13px;
    }

    .size-lg .score-pill {
      padding: 6px 14px;
      font-size: 20px;
      border-radius: 8px;
    }
    .size-lg .score-dot { width: 8px; height: 8px; }

    .score-change {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 4px;
      line-height: 1;
    }
    .score-change.pos {
      color: #228276;
      background: rgba(42, 157, 143, 0.1);
    }
    .score-change.neg {
      color: #D95555;
      background: rgba(217, 85, 85, 0.1);
    }

    .priority-icon {
      font-size: 12px;
      display: inline-flex;
      align-items: center;
    }
    .fire-icon { font-size: 13px; }
    .dot { font-size: 10px; }
    .warm-dot { color: #E9A23B; }
    .nurture-dot { color: #7B61FF; }
    .cold-dot { color: #8C8C85; }
  `]
})
export class ScoreBadgeComponent {
  @Input() score: number = 70;
  @Input() priority: LeadPriority = 'warm';
  @Input() change?: number;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showMax: boolean = false;
  @Input() showPriorityIcon: boolean = true;
}
