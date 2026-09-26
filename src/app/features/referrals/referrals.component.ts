import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReferralService } from '../../core/services/referral.service';
import { Referral } from '../../models';

@Component({
  selector: 'app-referrals',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="referrals-page animate-fade-in">
      
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="header-badge-row">
            <span class="program-chip">
              🤝 Advocacy & Client Referral Program
            </span>
          </div>
          <h1 class="page-title">Referral & Reward Management</h1>
          <p class="page-subtitle">
            Track customer introductions through the pipeline and administer reward grants upon successful deal conversion.
          </p>
        </div>

        <div class="header-actions">
          <a routerLink="/leads" class="btn btn-outline btn-sm">
            <span>👥</span> View All Leads
          </a>
          <button class="btn btn-primary btn-sm" (click)="refresh()">
            <span>🔄</span> Refresh Data
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards (Requirement: Successful Referrals, Pending Referrals, Rewards Granted) -->
      <div class="kpi-grid">
        <div class="kpi-card card-total">
          <div class="kpi-top">
            <span class="kpi-label">TOTAL REFERRALS</span>
            <span class="kpi-icon">📋</span>
          </div>
          <div class="kpi-val mono">{{ referralService.summary()?.totalReferrals ?? 0 }}</div>
          <div class="kpi-sub">Accounts referred by clients</div>
        </div>

        <div class="kpi-card card-pending">
          <div class="kpi-top">
            <span class="kpi-label">PENDING REFERRALS</span>
            <span class="kpi-icon text-amber">⏳</span>
          </div>
          <div class="kpi-val mono text-amber">{{ referralService.summary()?.pendingReferrals ?? 0 }}</div>
          <div class="kpi-sub">Active in sales pipeline</div>
        </div>

        <div class="kpi-card card-successful">
          <div class="kpi-top">
            <span class="kpi-label">SUCCESSFUL CONVERSIONS</span>
            <span class="kpi-icon text-success">🏆</span>
          </div>
          <div class="kpi-val mono text-success">{{ referralService.summary()?.successfulReferrals ?? 0 }}</div>
          <div class="kpi-sub">Converted to Closed Won</div>
        </div>

        <div class="kpi-card card-rewards">
          <div class="kpi-top">
            <span class="kpi-label">REWARDS GRANTED</span>
            <span class="kpi-icon text-purple">🎁</span>
          </div>
          <div class="kpi-val mono text-purple">{{ referralService.summary()?.formattedRewardsGranted || '₹0' }}</div>
          <div class="kpi-sub">{{ referralService.summary()?.rewardsGrantedCount ?? 0 }} incentive payouts executed</div>
        </div>
      </div>

      <!-- Lifecycle Workflow Explainer Strip -->
      <div class="card workflow-explainer-card">
        <div class="explainer-title">
          <span>⚡</span> AUTOMATED REWARD LIFECYCLE
        </div>
        <div class="stepper-horizontal">
          <div class="step-col">
            <div class="step-badge">1</div>
            <div class="step-body">
              <strong>Existing Customer Refers</strong>
              <span>Select customer in "Referred By"</span>
            </div>
          </div>
          <span class="step-arrow">➔</span>
          <div class="step-col">
            <div class="step-badge">2</div>
            <div class="step-body">
              <strong>Status = PENDING</strong>
              <span>Lead moves through sales stages</span>
            </div>
          </div>
          <span class="step-arrow">➔</span>
          <div class="step-col">
            <div class="step-badge">3</div>
            <div class="step-body">
              <strong>Deal Becomes WON</strong>
              <span>Automatically becomes REWARD ELIGIBLE</span>
            </div>
          </div>
          <span class="step-arrow">➔</span>
          <div class="step-col">
            <div class="step-badge">4</div>
            <div class="step-body">
              <strong>Reward Granted</strong>
              <span>Discount or credit issued to advocate</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Section with Filter Tabs -->
      <div class="card table-card">
        <div class="card-header">
          <div>
            <h3 class="card-title">All Customer Referrals</h3>
            <p class="card-subtitle">Detailed record of referring customer, referred account, deal volume, and reward status</p>
          </div>

          <!-- Filter Tabs -->
          <div class="filter-tabs">
            <button 
              class="filter-tab-btn" 
              [class.active]="filterTab === 'all'" 
              (click)="filterTab = 'all'"
            >
              All ({{ allReferrals.length }})
            </button>
            <button 
              class="filter-tab-btn" 
              [class.active]="filterTab === 'pending'" 
              (click)="filterTab = 'pending'"
            >
              Pending ({{ pendingCount }})
            </button>
            <button 
              class="filter-tab-btn" 
              [class.active]="filterTab === 'eligible'" 
              (click)="filterTab = 'eligible'"
            >
              Reward Eligible ({{ eligibleCount }})
            </button>
            <button 
              class="filter-tab-btn" 
              [class.active]="filterTab === 'granted'" 
              (click)="filterTab = 'granted'"
            >
              Granted ({{ grantedCount }})
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="leadiq-table">
            <thead>
              <tr>
                <th>Referral Intro</th>
                <th>Referring Customer</th>
                <th>Referred Account</th>
                <th>Referral Date</th>
                <th>Deal Value</th>
                <th>Referral Status</th>
                <th>Reward Value</th>
                <th>Reward Status</th>
                <th style="text-align: right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ref of filteredReferrals" class="referral-row">
                
                <!-- Referral Intro Pair -->
                <td>
                  <div class="ref-intro-col">
                    <span class="ref-acc-source">{{ ref.referrerCustomerName }}</span>
                    <span class="ref-arrow-sub">➔ referred ➔</span>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span *ngIf="ref.referredPublicLeadId" class="ref-lead-id mono">{{ ref.referredPublicLeadId }}</span>
                      <span class="ref-acc-target">{{ ref.referredLeadName }}</span>
                    </div>
                  </div>
                </td>

                <!-- Referrer -->
                <td>
                  <div class="cust-info">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span *ngIf="ref.referrerPublicLeadId" class="ref-lead-id mono">{{ ref.referrerPublicLeadId }}</span>
                      <span class="cust-name font-semibold">{{ ref.referrerCustomerName }}</span>
                    </div>
                    <span class="cust-tag">Existing Client</span>
                  </div>
                </td>

                <!-- Referred Lead -->
                <td>
                  <a [routerLink]="['/leads', ref.referredLeadId]" class="target-link">
                    <span *ngIf="ref.referredPublicLeadId" class="ref-lead-id mono" style="margin-right: 5px;">{{ ref.referredPublicLeadId }}</span>
                    {{ ref.referredLeadName }} →
                  </a>
                </td>

                <!-- Referral Date -->
                <td>
                  <span class="mono date-val">{{ ref.referralDate }}</span>
                </td>

                <!-- Deal Value -->
                <td>
                  <span class="mono deal-val font-bold text-coral">{{ ref.dealValueFormatted || '₹20L' }}</span>
                </td>

                <!-- Referral Status -->
                <td>
                  <span 
                    class="status-pill" 
                    [ngClass]="'status-' + (ref.status || 'PENDING').toLowerCase().replace(' ', '-')"
                  >
                    {{ (ref.status || 'PENDING').replace('_', ' ') }}
                  </span>
                </td>

                <!-- Reward -->
                <td>
                  <span class="reward-pill font-semibold text-purple">
                    {{ ref.rewardType === 'PERCENTAGE_DISCOUNT' ? (ref.rewardValue + '% Discount') : (ref.rewardValue ? '₹' + ref.rewardValue : '10% Discount') }}
                  </span>
                </td>

                <!-- Reward Status -->
                <td>
                  <span 
                    class="reward-status-pill"
                    [ngClass]="'rew-status-' + (ref.rewardStatus || 'PENDING').toLowerCase()"
                  >
                    {{ ref.rewardStatus || 'PENDING' }}
                  </span>
                </td>

                <!-- Action Button -->
                <td style="text-align: right">
                  <button 
                    *ngIf="ref.status === 'REWARD_ELIGIBLE' || (ref.rewardStatus === 'ELIGIBLE' && ref.status !== 'REWARD_GRANTED')"
                    class="btn btn-primary btn-sm grant-btn"
                    (click)="onGrantReward(ref.id)"
                  >
                    Grant Reward
                  </button>

                  <span *ngIf="ref.status === 'REWARD_GRANTED'" class="granted-check">
                    ✓ Granted
                  </span>

                  <span *ngIf="ref.status === 'PENDING'" class="text-muted" style="font-size: 11px;">
                    Pending Won
                  </span>
                </td>

              </tr>

              <tr *ngIf="filteredReferrals.length === 0">
                <td colspan="9" class="empty-state-cell">
                  <div class="empty-box">
                    <span class="empty-icon">🤝</span>
                    <div class="empty-text">No referrals match the selected filter.</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .referrals-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .program-chip {
      font-size: 11px;
      font-weight: 700;
      color: #6D28D9;
      background: #F5F3FF;
      border: 1px solid #DDD6FE;
      padding: 3px 10px;
      border-radius: 6px;
    }

    .page-title {
      font-size: 26px;
      font-weight: 800;
      color: var(--text-primary);
      margin: 4px 0 2px 0;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 18px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .kpi-label {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .kpi-val {
      font-size: 28px;
      font-weight: 800;
      line-height: 1.2;
      color: var(--text-primary);
    }

    .kpi-sub {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .text-purple { color: #7C3AED !important; }
    .text-amber { color: #D97706 !important; }
    .text-success { color: #10B981 !important; }
    .text-coral { color: #C84B2E !important; }

    .workflow-explainer-card {
      background: #FAF8F5;
      border: 1px solid var(--border-subtle);
      padding: 16px 20px;
      border-radius: 10px;
    }

    .explainer-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .stepper-horizontal {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .step-col {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .step-badge {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #7C3AED;
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step-body {
      display: flex;
      flex-direction: column;
      font-size: 12px;
    }

    .step-body strong {
      color: var(--text-primary);
    }

    .step-body span {
      color: var(--text-muted);
      font-size: 11px;
    }

    .step-arrow {
      color: var(--text-muted);
      font-size: 14px;
    }

    .table-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
    }

    .card-header {
      padding: 18px 20px;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .filter-tabs {
      display: flex;
      gap: 6px;
    }

    .filter-tab-btn {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .filter-tab-btn.active {
      background: #7C3AED;
      color: #FFFFFF;
      border-color: #6D28D9;
    }

    .table-container {
      overflow-x: auto;
    }

    .ref-intro-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ref-acc-source {
      font-size: 13px;
      font-weight: 700;
      color: #7C3AED;
    }

    .ref-arrow-sub {
      font-size: 10px;
      color: var(--text-muted);
    }

    .ref-lead-id {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      color: #D9481C;
      background: rgba(244, 96, 54, 0.08);
      border: 1px solid rgba(244, 96, 54, 0.25);
      padding: 1px 5px;
      border-radius: 4px;
      letter-spacing: 0.3px;
      flex-shrink: 0;
    }

    .ref-acc-target {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .target-link {
      font-weight: 700;
      color: #E76F51;
      text-decoration: none;
    }
    .target-link:hover {
      text-decoration: underline;
    }

    .status-pill {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .status-pending {
      background: #FEF3C7;
      color: #B45309;
    }

    .status-reward_eligible,
    .status-reward-eligible {
      background: #D1FAE5;
      color: #065F46;
      border: 1px solid #10B981;
    }

    .status-reward_granted,
    .status-reward-granted {
      background: #EDE9FE;
      color: #5B21B6;
    }

    .reward-status-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--bg-surface);
      color: var(--text-muted);
    }

    .rew-status-eligible {
      color: #065F46;
      background: #D1FAE5;
    }

    .rew-status-granted {
      color: #5B21B6;
      background: #EDE9FE;
    }

    .grant-btn {
      background: #10B981 !important;
      border-color: #059669 !important;
      color: #FFFFFF !important;
      font-weight: 700;
    }
    .grant-btn:hover {
      background: #059669 !important;
    }

    .granted-check {
      font-size: 11px;
      font-weight: 700;
      color: #7C3AED;
      background: #F5F3FF;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .empty-state-cell {
      text-align: center;
      padding: 40px;
    }

    .empty-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 28px;
    }

    @media (max-width: 900px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ReferralsComponent implements OnInit {
  referralService = inject(ReferralService);

  filterTab: 'all' | 'pending' | 'eligible' | 'granted' = 'all';

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    await this.referralService.loadReferrals();
    await this.referralService.loadSummary();
  }

  get allReferrals(): Referral[] {
    return this.referralService.referrals();
  }

  get filteredReferrals(): Referral[] {
    const list = this.allReferrals;
    if (this.filterTab === 'pending') {
      return list.filter(r => r.status === 'PENDING');
    }
    if (this.filterTab === 'eligible') {
      return list.filter(r => r.status === 'REWARD_ELIGIBLE');
    }
    if (this.filterTab === 'granted') {
      return list.filter(r => r.status === 'REWARD_GRANTED');
    }
    return list;
  }

  get pendingCount(): number {
    return this.allReferrals.filter(r => r.status === 'PENDING').length;
  }

  get eligibleCount(): number {
    return this.allReferrals.filter(r => r.status === 'REWARD_ELIGIBLE').length;
  }

  get grantedCount(): number {
    return this.allReferrals.filter(r => r.status === 'REWARD_GRANTED').length;
  }

  async onGrantReward(id: string): Promise<void> {
    await this.referralService.grantReward(id);
  }
}
