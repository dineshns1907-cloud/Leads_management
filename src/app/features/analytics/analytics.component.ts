import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadService } from '../../core/services/lead.service';
import { formatCurrency } from '../../core/mappers/api-adapter';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-page animate-fade-in">
      
      <!-- Top Title Bar -->
      <div class="page-header">
        <div>
          <div class="header-chip">
            <span class="chip-spark">📊</span>
            <span>REVENUE INTELLIGENCE & TELEMETRY</span>
          </div>
          <h1 class="page-title">Executive Revenue Analytics</h1>
          <p class="page-subtitle">
            Algorithmic lead velocity, predictive win conversion models, and cross-channel pipeline attribution.
          </p>
        </div>

        <div class="timeframe-picker">
          <button 
            *ngFor="let tf of timeframes" 
            class="timeframe-btn" 
            [class.active]="selectedTimeframe === tf"
            (click)="selectedTimeframe = tf"
          >
            {{ tf }}
          </button>
        </div>
      </div>

      <!-- Analytics Core KPI Row (5 columns) -->
      <div class="analytics-kpi-grid">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">TOTAL LEADS IN CRM</span>
            <span class="stat-icon">👥</span>
          </div>
          <div class="stat-value mono">{{ analytics.totalLeads }}</div>
          <div class="stat-footer text-emerald">
            <span>↑ 14%</span> vs prior 30-day period
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">ACTIVE OPPORTUNITIES</span>
            <span class="stat-icon">⚡</span>
          </div>
          <div class="stat-value mono text-coral">22</div>
          <div class="stat-footer text-secondary">
            <span>{{ formattedPipelineARR }}</span> active pipeline value
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">WIN CONVERSION RATE</span>
            <span class="stat-icon">🎯</span>
          </div>
          <div class="stat-value mono">{{ analytics.conversionRate }}%</div>
          <div class="stat-footer text-emerald">
            <span>↑ {{ analytics.conversionRateTrend }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">AVERAGE LEAD SCORE</span>
            <span class="stat-icon text-violet">⚡</span>
          </div>
          <div class="stat-value mono text-violet">{{ analytics.avgScore }} <small>/100</small></div>
          <div class="stat-footer text-emerald">
            <span>↑ {{ analytics.avgScoreTrend }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">AVG PIPELINE VELOCITY</span>
            <span class="stat-icon">⏱️</span>
          </div>
          <div class="stat-value mono">{{ analytics.avgDaysInPipeline }} <small>Days</small></div>
          <div class="stat-footer text-emerald">
            <span>↓ 4 days faster</span> vs industry avg
          </div>
        </div>
      </div>

      <!-- Charts Row 1: Conversion Trend & Leads by Stage -->
      <div class="charts-grid-2">
        
        <!-- Conversion Rate Trend Chart -->
        <div class="chart-card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Conversion Rate Trajectory vs Target</h3>
              <p class="card-subtitle">Monthly win rate trajectory compared to sales quota benchmark targets</p>
            </div>
            <div class="legend-row">
              <span class="legend-item"><span class="legend-dot dot-coral"></span> Actual Rate</span>
              <span class="legend-item"><span class="legend-dot dot-sand"></span> Benchmark Target</span>
            </div>
          </div>

          <div class="svg-chart-container">
            <svg viewBox="0 0 500 180" class="chart-svg" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(42,33,20,0.06)" stroke-dasharray="4" />
              <line x1="40" y1="80" x2="480" y2="80" stroke="rgba(42,33,20,0.06)" stroke-dasharray="4" />
              <line x1="40" y1="130" x2="480" y2="130" stroke="rgba(42,33,20,0.06)" stroke-dasharray="4" />
              <line x1="40" y1="160" x2="480" y2="160" stroke="rgba(42,33,20,0.12)" />

              <!-- Benchmark Line (Dashed) -->
              <polyline 
                fill="none" 
                stroke="#948B7D" 
                stroke-width="2" 
                stroke-dasharray="5 5"
                points="60,120 135,115 210,110 285,105 360,100 435,95" 
              />

              <!-- Actual Trend Area & Line (Warm Coral) -->
              <polygon 
                fill="url(#trendWarmGradient)" 
                points="60,128 135,108 210,95 285,82 360,69 435,58 435,160 60,160" 
                opacity="0.25"
              />
              <polyline 
                fill="none" 
                stroke="#E76F51" 
                stroke-width="3" 
                points="60,128 135,108 210,95 285,82 360,69 435,58" 
              />

              <!-- Data Points -->
              <circle cx="60" cy="128" r="4.5" fill="#E76F51" stroke="#FFFDF8" stroke-width="2" />
              <circle cx="135" cy="108" r="4.5" fill="#E76F51" stroke="#FFFDF8" stroke-width="2" />
              <circle cx="210" cy="95" r="4.5" fill="#E76F51" stroke="#FFFDF8" stroke-width="2" />
              <circle cx="285" cy="82" r="4.5" fill="#E76F51" stroke="#FFFDF8" stroke-width="2" />
              <circle cx="360" cy="69" r="4.5" fill="#E76F51" stroke="#FFFDF8" stroke-width="2" />
              <circle cx="435" cy="58" r="5.5" fill="#2A9D8F" stroke="#FFFDF8" stroke-width="2.5" />

              <defs>
                <linearGradient id="trendWarmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#E76F51" stop-opacity="0.8" />
                  <stop offset="100%" stop-color="#E76F51" stop-opacity="0.0" />
                </linearGradient>
              </defs>
            </svg>

            <!-- Month Labels -->
            <div class="x-axis-labels">
              <span *ngFor="let t of analytics.conversionTrend" class="axis-label mono">
                {{ t.month }} ({{ t.rate }}%)
              </span>
            </div>
          </div>
        </div>

        <!-- Leads by Stage Distribution -->
        <div class="chart-card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Full Pipeline Distribution (524 Leads)</h3>
              <p class="card-subtitle">Active opportunities and historical volume by pipeline stage</p>
            </div>
          </div>

          <div class="stage-bars-stack">
            <div *ngFor="let s of analytics.leadsByStage" class="stage-bar-item">
              <div class="stage-bar-meta">
                <span class="stage-bar-name">{{ s.stage }}</span>
                <span class="stage-bar-numbers mono">{{ s.count }} deals • {{ s.value }}</span>
              </div>
              <div class="stage-bar-track">
                <div 
                  class="stage-bar-progress" 
                  [class.won-bar]="s.stage === 'Won'"
                  [class.negotiation-bar]="s.stage === 'Negotiation'"
                  [class.proposal-bar]="s.stage === 'Proposal'"
                  [style.width.%]="(s.count / 120) * 100"
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Charts Row 2: Leads by Source & Score Distribution -->
      <div class="charts-grid-2">
        
        <!-- Leads by Source Breakdown -->
        <div class="chart-card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Acquisition Source Performance</h3>
              <p class="card-subtitle">Lead origination volume and contribution across marketing channels</p>
            </div>
          </div>

          <div class="source-breakdown-list">
            <div *ngFor="let src of analytics.leadsBySource" class="source-row">
              <div class="source-info">
                <span class="source-indicator" [style.background]="src.color"></span>
                <span class="source-name">{{ src.source }}</span>
              </div>
              <div class="source-bar-wrap">
                <div class="source-bar-track">
                  <div class="source-bar-fill" [style.width.%]="src.percentage" [style.background]="src.color"></div>
                </div>
              </div>
              <div class="source-stats mono">
                <span class="src-count">{{ src.count }}</span>
                <span class="src-pct">({{ src.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Score Distribution Histogram -->
        <div class="chart-card">
          <div class="card-header">
            <div>
              <h3 class="card-title">AI Score Tier Distribution</h3>
              <p class="card-subtitle">Breakdown of leads across algorithmic qualification & conversion bands</p>
            </div>
          </div>

          <div class="score-tiers-list">
            <div *ngFor="let tier of analytics.scoreDistribution" class="tier-row">
              <div class="tier-info">
                <span class="tier-name">{{ tier.range }}</span>
                <span class="tier-numbers mono">{{ tier.count }} leads ({{ tier.percentage }}%)</span>
              </div>
              <div class="tier-bar-track">
                <div 
                  class="tier-bar-fill" 
                  [style.width.%]="tier.percentage * 3.2"
                  [ngClass]="tier.range.includes('90') ? 'tier-hot' : (tier.range.includes('80') ? 'tier-warm' : (tier.range.includes('70') ? 'tier-active' : 'tier-nurture'))"
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .analytics-page {
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

    .timeframe-picker {
      display: flex;
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 6px;
      padding: 3px;
      gap: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }

    .timeframe-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary, #6B6358);
      font-size: 12px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .timeframe-btn:hover {
      color: var(--text-primary, #202124);
      background: var(--bg-surface, #F1ECE1);
    }
    .timeframe-btn.active {
      background: var(--accent-coral, #E76F51);
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(231, 111, 81, 0.22);
    }

    /* KPI Grid */
    .analytics-kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
    }

    .stat-card {
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 10px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      transition: transform 0.15s ease;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      border-color: var(--border-medium, #D5CCA8);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted, #948B7D);
    }

    .stat-icon {
      font-size: 14px;
    }
    .text-violet { color: var(--accent-violet, #7B61FF); }
    .text-emerald { color: var(--accent-emerald, #2A9D8F); }
    .text-coral { color: var(--accent-coral, #E76F51); }
    .text-secondary { color: var(--text-secondary, #6B6358); }

    .stat-value {
      font-size: 26px;
      font-weight: 800;
      color: var(--text-primary, #202124);
      line-height: 1.1;
    }
    .stat-value small {
      font-size: 13px;
      color: var(--text-muted, #948B7D);
      font-weight: 500;
    }

    .stat-footer {
      font-size: 11.5px;
      color: var(--text-secondary, #6B6358);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .stat-footer span {
      font-weight: 700;
    }

    /* Charts Layout */
    .charts-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .chart-card {
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 10px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      flex-wrap: wrap;
    }

    .card-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary, #202124);
      margin: 0 0 3px 0;
    }

    .card-subtitle {
      font-size: 12px;
      color: var(--text-muted, #948B7D);
      margin: 0;
    }

    .legend-row {
      display: flex;
      gap: 14px;
      align-items: center;
      font-size: 11.5px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary, #6B6358);
      font-weight: 500;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot-coral { background: var(--accent-coral, #E76F51); }
    .dot-sand { background: #948B7D; }

    /* SVG Chart */
    .svg-chart-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .chart-svg {
      width: 100%;
      height: 160px;
    }

    .x-axis-labels {
      display: flex;
      justify-content: space-between;
      padding: 0 10px;
    }

    .axis-label {
      font-size: 10.5px;
      color: var(--text-muted, #948B7D);
    }

    /* Stage Bars */
    .stage-bars-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .stage-bar-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .stage-bar-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
    }

    .stage-bar-name {
      font-weight: 600;
      color: var(--text-primary, #202124);
    }

    .stage-bar-numbers {
      color: var(--text-muted, #948B7D);
      font-size: 11.5px;
    }

    .stage-bar-track {
      height: 7px;
      background: var(--bg-surface, #F1ECE1);
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid var(--border-subtle, #E6DEC8);
    }

    .stage-bar-progress {
      height: 100%;
      background: linear-gradient(90deg, #E9A23B 0%, #E76F51 100%);
      border-radius: 4px;
    }
    .proposal-bar {
      background: linear-gradient(90deg, #7B61FF 0%, #E76F51 100%);
    }
    .negotiation-bar {
      background: linear-gradient(90deg, #E76F51 0%, #2A9D8F 100%);
    }
    .won-bar {
      background: var(--accent-emerald, #2A9D8F) !important;
    }

    /* Sources breakdown */
    .source-breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .source-row {
      display: grid;
      grid-template-columns: 140px 1fr 90px;
      align-items: center;
      gap: 14px;
    }

    .source-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .source-indicator {
      width: 9px;
      height: 9px;
      border-radius: 2px;
    }

    .source-name {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-primary, #202124);
    }

    .source-bar-track {
      height: 7px;
      background: var(--bg-surface, #F1ECE1);
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid var(--border-subtle, #E6DEC8);
    }

    .source-bar-fill {
      height: 100%;
      border-radius: 4px;
    }

    .source-stats {
      text-align: right;
      font-size: 11.5px;
    }
    .src-count { color: var(--text-primary, #202124); font-weight: 700; margin-right: 4px; }
    .src-pct { color: var(--text-muted, #948B7D); }

    /* Score tiers */
    .score-tiers-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .tier-row {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .tier-info {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
    }

    .tier-name {
      font-weight: 600;
      color: var(--text-primary, #202124);
    }

    .tier-numbers {
      font-size: 11.5px;
      color: var(--text-secondary, #6B6358);
      font-weight: 600;
    }

    .tier-bar-track {
      height: 7px;
      background: var(--bg-surface, #F1ECE1);
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid var(--border-subtle, #E6DEC8);
    }

    .tier-bar-fill {
      height: 100%;
      border-radius: 4px;
    }
    .tier-hot { background: var(--accent-coral, #E76F51); }
    .tier-warm { background: var(--accent-amber, #E9A23B); }
    .tier-active { background: var(--accent-emerald, #2A9D8F); }
    .tier-nurture { background: var(--accent-violet, #7B61FF); }

    @media (max-width: 1200px) {
      .analytics-kpi-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 900px) {
      .analytics-kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .charts-grid-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalyticsComponent {
  private leadService = inject(LeadService);
  
  get analytics() {
    return this.leadService.analytics();
  }

  get formattedPipelineARR(): string {
    return formatCurrency(this.leadService.pipelineValue());
  }

  readonly timeframes = ['Last 30 Days', 'This Quarter', 'Year to Date'];
  selectedTimeframe = 'Last 30 Days';

  ngOnInit(): void {
    this.leadService.loadAnalytics();
  }
}

