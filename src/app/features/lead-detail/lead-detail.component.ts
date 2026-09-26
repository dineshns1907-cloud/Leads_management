import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { LeadService } from '../../core/services/lead.service';
import { ReferralService } from '../../core/services/referral.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { SimulateActivityModalComponent } from '../../shared/components/simulate-activity-modal/simulate-activity-modal.component';
import { Lead, PipelineStage, Activity } from '../../models';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SimulateActivityModalComponent],
  template: `
    <div class="lead-detail-page animate-fade-in" *ngIf="lead">
      
      <!-- Back Navigation & Breadcrumbs -->
      <div class="detail-nav-row">
        <a routerLink="/leads" class="back-link">
          ← Back to All Leads
        </a>
        <div class="detail-top-actions">
          <span 
            class="pipeline-pill" 
            [class.won-pill]="lead.stage === 'Won'"
            [class.lost-pill]="lead.stage === 'Lost'"
          >
            Stage: <strong>{{ lead.stage }}</strong>
          </span>

          <button 
            class="btn btn-outline btn-sm focus-lead-btn"
            (click)="focusNow()"
          >
            <span>🎯</span> Focus Now
          </button>

          <button class="btn btn-primary" (click)="showSimulateModal = true">
            <span>⚡</span> Simulate Activity
          </button>
        </div>
      </div>

      <!-- Simulation Alert Banner (When activity was simulated) -->
      <div class="simulation-alert-banner" *ngIf="lead.recentSimulationNote">
        <div class="banner-icon">⚡</div>
        <div class="banner-body">
          <div class="banner-title">Score updated because of simulated customer activity</div>
          <div class="banner-text">{{ lead.recentSimulationNote }}</div>
        </div>
        <button class="banner-dismiss" (click)="lead.recentSimulationNote = undefined">✕</button>
      </div>

      <!-- Lead Hero Identity Header -->
      <div class="lead-hero-header">
        <div class="lead-header-info">
          <div class="company-row">
            <span *ngIf="lead.publicLeadId" class="hero-lead-id-badge mono">{{ lead.publicLeadId }}</span>
            <h1 class="lead-company-name">{{ lead.company }}</h1>
            
            <!-- Priority Badge -->
            <span class="priority-chip" [ngClass]="'chip-' + lead.priority">
              <span *ngIf="lead.priority === 'hot'">🔥 High Priority (Hot)</span>
              <span *ngIf="lead.priority === 'warm'">● Medium Priority (Warm)</span>
              <span *ngIf="lead.priority === 'nurture'">● Nurture Priority</span>
              <span *ngIf="lead.priority === 'cold'">○ Low Priority (Cold)</span>
            </span>

            <!-- Deal ARR Badge -->
            <span class="deal-badge mono">{{ lead.expectedInvestmentFormatted || lead.dealSize }}</span>

            <!-- Business Priority Score (Feature 1) -->
            <span *ngIf="lead.businessPriorityScore !== undefined" class="bp-hero-badge mono">
              Business Priority: {{ lead.businessPriorityScore }}
            </span>

            <!-- Stagnation Indicator (Requirement 11) -->
            <span 
              *ngIf="lead.stagnationStatus === 'warning' && lead.stage !== 'Won' && lead.stage !== 'Lost'"
              class="stagnation-chip warning"
            >
              ⚠️ Stage Stagnation ({{ lead.stageAgeDays }}d in stage)
            </span>

            <span 
              *ngIf="lead.stagnationStatus === 'critical' && lead.stage !== 'Won' && lead.stage !== 'Lost'"
              class="stagnation-chip critical"
            >
              🚨 Critical Stagnation ({{ lead.stageAgeDays }}d in stage)
            </span>
          </div>

          <!-- Customer Profile & Lead Source Grid (Requirement 15) -->
          <div class="contact-details-grid">
            <div class="contact-meta-item" *ngIf="lead.publicLeadId">
              <span class="meta-label">LEAD ID</span>
              <span class="meta-val mono font-bold text-coral">{{ lead.publicLeadId }}</span>
            </div>
            <div class="contact-meta-item">
              <span class="meta-label">PRIMARY CONTACT</span>
              <span class="meta-val font-semibold">{{ lead.contactName }} • <em>{{ lead.contactRole }}</em></span>
            </div>
            <div class="contact-meta-item">
              <span class="meta-label">EMAIL ADDRESS</span>
              <span class="meta-val"><a href="mailto:{{ lead.contactEmail }}">{{ lead.contactEmail }}</a></span>
            </div>
            <div class="contact-meta-item">
              <span class="meta-label">PHONE</span>
              <span class="meta-val mono">{{ lead.contactPhone }}</span>
            </div>
            <div class="contact-meta-item">
              <span class="meta-label">INDUSTRY</span>
              <span class="meta-val">{{ lead.industry }}</span>
            </div>
            <div class="contact-meta-item">
              <span class="meta-label">LEAD SOURCE</span>
              <span class="meta-val source-highlight">{{ lead.source }}</span>
            </div>
            <div class="contact-meta-item">
              <span class="meta-label">COMPANY SIZE</span>
              <span class="meta-val">{{ lead.companySize || '250-500 employees' }}</span>
            </div>
            <div class="contact-meta-item">
              <span class="meta-label">LOCATION</span>
              <span class="meta-val">{{ lead.location || 'San Francisco, CA' }}</span>
            </div>
            <div class="contact-meta-item">
              <span class="meta-label">LEAD OWNER</span>
              <span class="meta-val rep-name-pill">{{ lead.leadOwner || 'Alex Rivera' }}</span>
            </div>
            <div class="contact-meta-item">
              <span class="meta-label">CREATED DATE</span>
              <span class="meta-val mono">{{ lead.createdDate || 'Sep 12, 2026' }}</span>
            </div>
            <div class="contact-meta-item">
              <span class="meta-label">ESTIMATED ANNUAL VALUE</span>
              <span class="meta-val mono font-bold text-coral">{{ lead.expectedInvestmentFormatted || lead.estimatedAnnualValue || lead.dealSize }}</span>
            </div>
            <div class="contact-meta-item full-width-meta">
              <span class="meta-label">PREVIOUS INTERACTIONS & BACKGROUND</span>
              <span class="meta-val">{{ lead.previousInteractions || 'Engaged through inbound product evaluation and webinar.' }}</span>
            </div>
          </div>
        </div>

        <!-- Stage Selector Pill (Includes Won and Lost) -->
        <div class="stage-stepper-panel">
          <span class="stage-panel-label">UPDATE PIPELINE STAGE</span>
          <select 
            class="select stage-select" 
            [ngModel]="lead.stage" 
            (ngModelChange)="onStageChange($event)"
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Demo">Demo</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won (Closed Deal)</option>
            <option value="Lost">Lost (Archived)</option>
          </select>

          <div class="stage-sub-note">
            <span class="mono">{{ lead.stageAgeDays }} days</span> elapsed in {{ lead.stage }}
          </div>
        </div>
      </div>

      <!-- Main Layout: 2 Columns -->
      <div class="detail-grid">
        
        <!-- Left Column: AI Score Hero, Explainable AI Signals, AI Recommendation -->
        <div class="intelligence-column">
          
          <!-- AI SCORE HERO VISUALIZATION (Circular Progress Ring) -->
          <div class="card ai-score-card">
            <div class="score-card-header">
              <div class="ai-brand-badge">
                <span>⚡</span> AI CONVERSION SIGNAL
              </div>
              <span class="model-meta">Behavioral Weighting Model v4.2 • Mock AI</span>
            </div>

            <div class="score-visual-row">
              <!-- Circular Score Indicator -->
              <div class="score-ring-wrap" [ngClass]="'ring-' + lead.priority">
                <svg class="progress-ring" viewBox="0 0 120 120">
                  <circle 
                    class="progress-ring-bg" 
                    stroke-width="8" 
                    fill="transparent" 
                    r="48" 
                    cx="60" 
                    cy="60" 
                  />
                  <circle 
                    class="progress-ring-circle" 
                    stroke-width="8" 
                    stroke-linecap="round"
                    fill="transparent" 
                    r="48" 
                    cx="60" 
                    cy="60" 
                    [style.strokeDashoffset]="calculateStrokeOffset(lead.aiScore)"
                  />
                </svg>
                <div class="score-center-text">
                  <span class="score-main mono">{{ lead.aiScore }}</span>
                  <span class="score-denominator">/ 100</span>
                </div>
              </div>

              <div class="score-summary-col">
                <!-- Won / Lost / Active Probability Display (Requirement 5 & 6) -->
                <div *ngIf="lead.stage === 'Won'" class="signal-tag signal-won">
                  CONVERSION: WON (CLOSED DEAL)
                </div>

                <div *ngIf="lead.stage === 'Lost'" class="signal-tag signal-lost">
                  CONVERSION: LOST (ARCHIVED)
                </div>

                <div *ngIf="lead.stage !== 'Won' && lead.stage !== 'Lost'" class="signal-tag" [ngClass]="'signal-' + lead.conversionProbability.toLowerCase()">
                  {{ lead.conversionProbability.toUpperCase() }} · {{ lead.conversionPercentage }}% CONVERSION PROBABILITY
                </div>

                <div class="score-delta-line mono">
                  <span *ngIf="lead.scoreChange >= 0" class="delta-arrow delta-up">↑ {{ lead.scoreChange }} pts dynamic momentum</span>
                  <span *ngIf="lead.scoreChange < 0" class="delta-arrow delta-down">↓ {{ Math.abs(lead.scoreChange) }} pts score decay</span>
                  <span class="score-percentile">AI Scored</span>
                </div>

                <p class="score-summary-text">
                  {{ lead.scoreBreakdown.explanation }}
                </p>

                <div class="simulation-trigger-bar" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                  <button class="btn btn-secondary btn-sm" (click)="showSimulateModal = true">
                    <span>⚡</span> Simulate Activity
                  </button>
                  <button class="btn btn-outline btn-sm" (click)="onRecalculateScore()" [disabled]="isRecalculating">
                    <span>🔄</span> {{ isRecalculating ? 'Recalculating...' : 'Recalculate AI Score' }}
                  </button>
                  <span class="sim-hint">Trigger buying signals or decay</span>
                </div>
              </div>
          </div>

          <!-- FEATURE 1: REVENUE-AWARE AI BUSINESS PRIORITY & DEAL VALUE -->
          <div class="card business-priority-card">
            <div class="card-header">
              <div class="bp-header-title-wrap">
                <h3 class="card-title">
                  <span>💎</span> AI BUSINESS PRIORITY
                </h3>
                <span class="bp-algo-tag">Business Priority Algorithm • AI-assisted scoring</span>
              </div>
              <span 
                class="bp-badge-pill" 
                [ngClass]="'bp-pill-' + (lead.businessPriorityTier || 'LOW').toLowerCase().replace(' ', '-')"
              >
                <span *ngIf="lead.businessPriorityTier === 'VERY HIGH'">🔥</span>
                {{ lead.businessPriorityTier || 'MEDIUM' }} PRIORITY
              </span>
            </div>

            <div class="bp-score-hero-row">
              <div class="bp-big-score-wrap">
                <span class="bp-big-num mono">{{ lead.businessPriorityScore ?? 75 }}</span>
                <span class="bp-denom-label">/ 100</span>
              </div>
              <div class="bp-breakdown-metrics">
                <div class="bp-metric-col">
                  <span class="bp-metric-label">EXPECTED INVESTMENT</span>
                  <span class="bp-metric-val mono font-bold text-coral">{{ lead.expectedInvestmentFormatted || lead.dealSize }}</span>
                </div>
                <div class="bp-metric-col">
                  <span class="bp-metric-label">AI ENGAGEMENT</span>
                  <span class="bp-metric-val font-semibold">{{ lead.aiScore }}% ({{ lead.engagementLevel }})</span>
                </div>
                <div class="bp-metric-col">
                  <span class="bp-metric-label">CONVERSION PROBABILITY</span>
                  <span class="bp-metric-val font-semibold">{{ lead.conversionPercentage }}% ({{ lead.conversionProbability }})</span>
                </div>
              </div>
            </div>

            <!-- Why this lead is prioritized (AI Explanation) -->
            <div class="bp-reasons-section">
              <h4 class="bp-reasons-title">Why this lead is prioritized:</h4>
              <ul class="bp-factors-list">
                <li *ngFor="let factor of (lead.businessPriorityFactors && lead.businessPriorityFactors.length ? lead.businessPriorityFactors : defaultPriorityFactors)">
                  <span class="check-icon">✓</span>
                  <span>{{ factor }}</span>
                </li>
              </ul>
            </div>

            <div class="bp-action-box">
              <span class="action-bolt">⚡</span>
              <div class="action-body">
                <strong>Recommended Action:</strong>
                <span *ngIf="(lead.businessPriorityScore || 0) >= 80"> Focus on this lead first. High potential commercial value combined with strong buyer readiness.</span>
                <span *ngIf="(lead.businessPriorityScore || 0) < 80"> Maintain structured pipeline engagement cadence. Track deal qualification milestones.</span>
              </div>
            </div>
          </div>

          <!-- FEATURE 2: REFERRAL INFORMATION (When Lead Source == Referral) -->
          <div class="card referral-info-card" *ngIf="lead.source === 'Referral' || lead.referralInfo">
            <div class="card-header">
              <div>
                <h3 class="card-title">
                  <span>🤝</span> REFERRAL INFORMATION
                </h3>
                <p class="card-subtitle">Customer advocacy & reward tracking lifecycle</p>
              </div>
              <span 
                class="referral-status-badge"
                [ngClass]="'ref-status-' + (lead.referralInfo?.status || (lead.stage === 'Won' ? 'reward_eligible' : 'pending')).toLowerCase()"
              >
                {{ (lead.referralInfo?.status || (lead.stage === 'Won' ? 'REWARD ELIGIBLE' : 'PENDING')).replace('_', ' ') }}
              </span>
            </div>

            <div class="referral-meta-grid">
              <div class="ref-meta-item">
                <span class="ref-label">REFERRER</span>
                <span class="ref-value font-semibold text-purple">
                  {{ lead.referralInfo?.referrerCustomerName || 'Apex Engineering College' }}
                </span>
              </div>
              <div class="ref-meta-item">
                <span class="ref-label">REFERRED LEAD ID</span>
                <span class="ref-value mono font-bold text-coral">
                  {{ lead.referralInfo?.referredPublicLeadId || lead.publicLeadId || 'LEAD-000001' }}
                </span>
              </div>
              <div class="ref-meta-item">
                <span class="ref-label">NEW CUSTOMER (PROSPECT)</span>
                <span class="ref-value font-semibold">
                  {{ lead.referralInfo?.referredLeadName || lead.company }}
                </span>
              </div>
              <div class="ref-meta-item">
                <span class="ref-label">REFERRAL DATE</span>
                <span class="ref-value mono">{{ lead.referralInfo?.referralDate || lead.createdDate || 'Today' }}</span>
              </div>
              <div class="ref-meta-item">
                <span class="ref-label">POTENTIAL REWARD</span>
                <span class="ref-value font-bold text-success">
                  {{ lead.referralInfo?.rewardType === 'PERCENTAGE_DISCOUNT' ? (lead.referralInfo?.rewardValue + '% Discount') : (lead.referralInfo?.rewardValue ? '₹' + lead.referralInfo?.rewardValue : '10% Discount') }}
                </span>
              </div>
            </div>

            <!-- Referral Lifecycle Progression -->
            <div class="referral-workflow-stepper">
              <div class="stepper-step step-done">
                <span class="step-num">1</span>
                <span class="step-title">Customer Refers</span>
              </div>
              <div class="stepper-line line-done"></div>
              <div class="stepper-step step-done">
                <span class="step-num">2</span>
                <span class="step-title">Lead Created</span>
              </div>
              <div class="stepper-line" [class.line-done]="lead.stage === 'Won' || lead.referralInfo?.status === 'REWARD_ELIGIBLE' || lead.referralInfo?.status === 'REWARD_GRANTED'"></div>
              <div class="stepper-step" [class.step-done]="lead.stage === 'Won' || lead.referralInfo?.status === 'REWARD_ELIGIBLE' || lead.referralInfo?.status === 'REWARD_GRANTED'">
                <span class="step-num">3</span>
                <span class="step-title">Deal Won</span>
              </div>
              <div class="stepper-line" [class.line-done]="lead.referralInfo?.status === 'REWARD_GRANTED'"></div>
              <div class="stepper-step" [class.step-done]="lead.referralInfo?.status === 'REWARD_GRANTED'">
                <span class="step-num">4</span>
                <span class="step-title">Reward Granted</span>
              </div>
            </div>

            <!-- Reward action if Eligible -->
            <div class="ref-reward-action-bar" *ngIf="(lead.stage === 'Won' || lead.referralInfo?.status === 'REWARD_ELIGIBLE') && lead.referralInfo?.status !== 'REWARD_GRANTED'">
              <div class="reward-eligible-note">
                <span>🎉</span> <strong>Deal is WON!</strong> This referral is eligible for reward granting.
              </div>
              <button 
                class="btn btn-primary btn-sm"
                *ngIf="lead.referralInfo?.id"
                (click)="grantReferralReward(lead.referralInfo.id)"
              >
                Grant Reward
              </button>
            </div>
            <div class="ref-reward-granted-banner" *ngIf="lead.referralInfo?.status === 'REWARD_GRANTED'">
              <span>✓</span> Reward has been successfully granted to referring customer!
            </div>
          </div>

          <!-- WHY THIS SCORE? — Explainable AI Signals Breakdown (Requirement 7) -->
          <div class="card explainable-ai-card">
            <div class="card-header">
              <div>
                <h3 class="card-title">
                  <span>🧠</span> WHY THIS SCORE?
                </h3>
                <p class="card-subtitle">
                  AI score contributor breakdown and behavioral signal attribution
                </p>
              </div>
              <span class="mock-badge">AI ATTRIBUTION</span>
            </div>

            <!-- Score Contributors Breakdown Table -->
            <div class="score-contributors-container">
              
              <!-- Positive Signals Section (Emerald) -->
              <div class="signals-group">
                <div class="signals-group-header">
                  <span class="group-title text-success">POSITIVE SCORE CONTRIBUTORS</span>
                  <span class="group-score mono">+{{ sumPoints(lead.scoreBreakdown.positiveSignals) }} pts</span>
                </div>

                <div class="signal-bars-list">
                  <div *ngFor="let item of lead.scoreBreakdown.positiveSignals" class="signal-bar-row">
                    <div class="signal-info">
                      <span class="signal-check">✓</span>
                      <span class="signal-name">{{ item.signal }}</span>
                    </div>
                    <div class="signal-bar-track">
                      <div class="signal-bar-fill fill-pos" [style.width.%]="Math.min(100, (item.points / 20) * 100)"></div>
                    </div>
                    <span class="signal-points mono text-success">+{{ item.points }}</span>
                  </div>
                </div>
              </div>

              <!-- Negative Signals Section (Coral / Danger) -->
              <div class="signals-group" *ngIf="lead.scoreBreakdown.negativeSignals.length > 0">
                <div class="signals-group-header">
                  <span class="group-title text-danger">RISK & INACTIVITY CONTRIBUTORS</span>
                  <span class="group-score mono">{{ sumPoints(lead.scoreBreakdown.negativeSignals) }} pts</span>
                </div>

                <div class="signal-bars-list">
                  <div *ngFor="let item of lead.scoreBreakdown.negativeSignals" class="signal-bar-row">
                    <div class="signal-info">
                      <span class="signal-warn">⚠</span>
                      <span class="signal-name">{{ item.signal }}</span>
                    </div>
                    <div class="signal-bar-track">
                      <div class="signal-bar-fill fill-neg" [style.width.%]="Math.min(100, (Math.abs(item.points) / 20) * 100)"></div>
                    </div>
                    <span class="signal-points mono text-danger">{{ item.points }}</span>
                  </div>
                </div>
              </div>

            </div>

            <div class="explainable-footer">
              <small>
                Calculated dynamically across real-time telemetry: quotation requests, demo interaction, email responsiveness, proposal views, and time spent in current stage.
              </small>
            </div>
          </div>

          <!-- AI RECOMMENDED NEXT ACTION (Requirement 8) -->
          <div class="card recommendation-card" [class.completed]="lead.actionCompleted">
            <div class="rec-header">
              <div class="rec-badge">
                <span>🎯</span> RECOMMENDED NEXT ACTION
              </div>
              <span *ngIf="lead.actionCompleted" class="rec-completed-badge">✓ COMPLETED</span>
            </div>

            <div class="rec-action-title">
              {{ lead.recommendedAction }}
            </div>

            <p class="rec-action-desc">
              {{ lead.actionReason }}
            </p>

            <!-- WHY THIS ACTION? Breakdown -->
            <div class="rec-why-box">
              <div class="why-label">WHY THIS ACTION?</div>
              <ul class="why-list">
                <li>
                  <span class="why-bullet">●</span> 
                  <strong>Recent Activity:</strong> {{ lead.lastActivity }} ({{ lead.lastActivityDate }})
                </li>
                <li>
                  <span class="why-bullet">●</span> 
                  <strong>Engagement Level:</strong> {{ lead.engagementLevel }} responsiveness across sales touches
                </li>
                <li>
                  <span class="why-bullet">●</span> 
                  <strong>Pipeline Stage:</strong> Currently progressing in {{ lead.stage }} stage
                </li>
                <li>
                  <span class="why-bullet">●</span> 
                  <strong>Time in Stage:</strong> {{ lead.stageAgeDays }} days elapsed (status: {{ lead.stagnationStatus }})
                </li>
                <li>
                  <span class="why-bullet">●</span> 
                  <strong>Customer Behavior:</strong> {{ lead.actionReason }}
                </li>
              </ul>
            </div>

            <div class="rec-actions">
              <!-- Focus Now Button (Requirement 8) -->
              <button 
                class="btn btn-focus-now" 
                (click)="focusNow()"
              >
                <span>🎯</span> Focus Now
              </button>

              <button 
                class="btn btn-primary" 
                *ngIf="!lead.actionCompleted"
                (click)="completeAction()"
              >
                ✓ Mark as Completed
              </button>

              <button 
                class="btn btn-secondary" 
                *ngIf="lead.actionCompleted"
                (click)="lead.actionCompleted = false"
              >
                Reopen Action
              </button>

              <a [href]="'mailto:' + lead.contactEmail" class="btn btn-outline">
                ✉ Email Contact
              </a>
            </div>
          </div>

        </div>

        <!-- Right Column: Customer Journey Timeline & Sales Rep Notes -->
        <div class="context-column">
          
          <!-- Activity Timeline (Requirement 13) -->
          <div class="card activity-timeline-card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Activity Timeline</h3>
                <p class="card-subtitle">Calls, emails, meetings, demos, quotations, proposals, notes & stage changes (newest first)</p>
              </div>
              <button class="btn btn-outline btn-sm" (click)="showSimulateModal = true">
                + Simulate Activity
              </button>
            </div>

            <div class="journey-timeline">
              <div *ngFor="let act of sortedActivities" class="journey-node">
                <!-- Activity icon color coding -->
                <div class="journey-icon-wrap" [ngClass]="'icon-' + act.type">
                  <span *ngIf="act.type === 'email'">✉️</span>
                  <span *ngIf="act.type === 'demo'">💻</span>
                  <span *ngIf="act.type === 'proposal'">📄</span>
                  <span *ngIf="act.type === 'quotation'">🏷️</span>
                  <span *ngIf="act.type === 'call'">📞</span>
                  <span *ngIf="act.type === 'meeting'">🤝</span>
                  <span *ngIf="act.type === 'stage_change'">🚀</span>
                  <span *ngIf="act.type === 'note'">📝</span>
                </div>

                <div class="journey-content">
                  <div class="journey-header">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span *ngIf="act.leadPublicId || lead.publicLeadId" class="activity-lead-id-pill mono font-semibold">
                        {{ act.leadPublicId || lead.publicLeadId }}
                      </span>
                      <span class="journey-title">{{ act.title }}</span>
                    </div>
                    <span class="journey-time mono">{{ act.timestamp }}</span>
                  </div>
                  <p class="journey-desc">{{ act.description }}</p>
                  
                  <div class="journey-footer">
                    <span class="journey-rep">Salesperson: {{ act.salesRep }}</span>
                    <span *ngIf="act.stage" class="journey-stage-tag">{{ act.stage }}</span>
                    <span *ngIf="act.impactScore" class="journey-impact mono" [ngClass]="act.impactScore > 0 ? 'text-success' : 'text-danger'">
                      {{ act.impactScore > 0 ? '+' : '' }}{{ act.impactScore }} pts
                    </span>
                  </div>
                </div>
              </div>

              <div *ngIf="sortedActivities.length === 0" class="no-activity-box">
                <p>No recorded activity touchpoints yet. Use "Simulate Activity" to test events.</p>
              </div>
            </div>
          </div>

          <!-- Sales Representative Notes & AI Signal Extraction (Requirement 14) -->
          <div class="card notes-card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Sales Representative Notes</h3>
                <p class="card-subtitle">Record qualitative context; AI NLP engine extracts behavioral signals automatically</p>
              </div>
            </div>

            <!-- Notes List -->
            <div class="notes-list">
              <div *ngFor="let note of lead.notes" class="note-item">
                <div class="note-top">
                  <div class="note-author-row">
                    <span class="note-author-label">Created by:</span>
                    <span class="note-author font-bold">{{ note.author }}</span>
                    <span class="note-date mono">{{ note.date }}</span>
                  </div>
                </div>
                
                <p class="note-content">"{{ note.content }}"</p>
                
                <div class="extracted-signals-box">
                  <span class="extracted-label">AI Extracted Signals:</span>
                  <div class="signal-chips">
                    <span *ngFor="let sig of note.aiSignals" class="ai-signal-chip" [ngClass]="getSignalChipClass(sig)">
                      <span>⚡</span> {{ sig }}
                    </span>
                  </div>
                </div>
              </div>

              <div *ngIf="lead.notes.length === 0" class="no-notes-box">
                <p>No sales notes recorded yet. Add your first note below to trigger AI signal extraction.</p>
              </div>
            </div>

            <!-- Add Note Form -->
            <div class="add-note-form">
              <label class="form-label">LOG A NEW SALES NOTE</label>
              
              <!-- Quick Signal Snippets -->
              <div class="quick-snippets-row">
                <span class="snippet-label">Quick Signals:</span>
                <button type="button" class="snippet-chip" (click)="insertSnippet('Product interest: customer is very interested in enterprise security features.')">
                  + Product interest
                </button>
                <button type="button" class="snippet-chip" (click)="insertSnippet('Pricing concern: customer mentioned the custom pricing tier needs finance review.')">
                  + Pricing concern
                </button>
                <button type="button" class="snippet-chip" (click)="insertSnippet('Decision pending: awaiting CFO and legal approval before final sign-off.')">
                  + Decision pending
                </button>
                <button type="button" class="snippet-chip" (click)="insertSnippet('Competitor mentioned: customer is comparing our AI telemetry against Gong and Salesforce.')">
                  + Competitor mentioned
                </button>
              </div>

              <textarea 
                class="textarea note-textarea" 
                rows="3" 
                placeholder="Type customer notes... (e.g. Customer is interested in the enterprise package but needs approval from finance)"
                [(ngModel)]="newNoteContent"
              ></textarea>
              
              <div class="add-note-actions">
                <span class="ai-parsing-hint">NLP Parser extracts signals like Product Interest, Pricing Concern, Decision Pending.</span>
                <button 
                  class="btn btn-ai btn-sm" 
                  [disabled]="!newNoteContent.trim()"
                  (click)="submitNote()"
                >
                  Save Note & Extract Signals
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- Simulation Modal -->
      <app-simulate-activity-modal 
        *ngIf="showSimulateModal" 
        [lead]="lead"
        (closed)="showSimulateModal = false"
        (simulated)="refreshLead()"
      ></app-simulate-activity-modal>

    </div>

    <div class="card not-found-card animate-fade-in" *ngIf="!lead">
      <h2>Lead Not Found</h2>
      <p>The requested lead could not be located in the current database partition.</p>
      <a routerLink="/leads" class="btn btn-primary">Return to Leads</a>
    </div>
  `,
  styles: [`
    .lead-detail-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      min-width: 0;
    }

    .detail-nav-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .back-link {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    .back-link:hover {
      color: #E76F51;
    }

    .detail-top-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .pipeline-pill {
      font-size: 12px;
      padding: 5px 12px;
      border-radius: 6px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
    }
    .pipeline-pill.won-pill {
      background: rgba(42, 157, 143, 0.12);
      border-color: rgba(42, 157, 143, 0.35);
      color: #228276;
    }
    .pipeline-pill.lost-pill {
      background: rgba(107, 107, 102, 0.12);
      border-color: rgba(107, 107, 102, 0.3);
      color: #555550;
    }

    .btn-focus-now {
      background: #E76F51;
      color: #FFFFFF;
      font-weight: 700;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(231, 111, 81, 0.25);
      transition: all var(--transition-fast);
    }
    .btn-focus-now:hover {
      background: #D95D3F;
      transform: translateY(-1px);
    }

    .focus-lead-btn {
      color: #E76F51;
      border-color: rgba(231, 111, 81, 0.35);
      font-weight: 700;
    }
    .focus-lead-btn:hover {
      background: rgba(231, 111, 81, 0.08);
    }

    /* Simulation Alert Banner */
    .simulation-alert-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(231, 111, 81, 0.1);
      border: 1px solid rgba(231, 111, 81, 0.35);
      border-radius: 10px;
      padding: 12px 16px;
      animation: fadeIn 200ms ease;
    }

    .banner-icon {
      font-size: 20px;
      color: #E76F51;
      flex-shrink: 0;
    }

    .banner-body {
      flex: 1;
    }

    .banner-title {
      font-size: 13px;
      font-weight: 700;
      color: #C84B2E;
    }

    .banner-text {
      font-size: 12px;
      color: var(--text-primary);
      margin-top: 2px;
    }

    .banner-dismiss {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 14px;
    }

    /* Lead Hero Identity Header */
    .lead-hero-header {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      flex-wrap: wrap;
      box-shadow: var(--shadow-sm);
    }

    .lead-header-info {
      flex: 1;
      min-width: 300px;
    }

    .company-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .hero-lead-id-badge {
      font-size: 13px;
      font-weight: 800;
      color: #D9481C;
      background: rgba(244, 96, 54, 0.1);
      border: 1px solid rgba(244, 96, 54, 0.3);
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .bp-hero-badge {
      font-size: 12px;
      font-weight: 700;
      color: #1E3A8A;
      background: #EFF6FF;
      border: 1px solid rgba(59, 130, 246, 0.35);
      padding: 3px 9px;
      border-radius: 6px;
    }

    .activity-lead-id-pill {
      font-size: 10.5px;
      font-weight: 700;
      color: #D9481C;
      background: rgba(244, 96, 54, 0.08);
      border: 1px solid rgba(244, 96, 54, 0.25);
      padding: 1px 6px;
      border-radius: 4px;
      letter-spacing: 0.3px;
    }

    .lead-company-name {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      line-height: 1.1;
    }

    .priority-chip {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 6px;
    }
    .chip-hot { background: rgba(231, 111, 81, 0.12); color: #C84B2E; border: 1px solid rgba(231, 111, 81, 0.3); }
    .chip-warm { background: rgba(233, 162, 59, 0.12); color: #A36209; border: 1px solid rgba(233, 162, 59, 0.3); }
    .chip-nurture { background: rgba(123, 97, 255, 0.1); color: #5D43E0; border: 1px solid rgba(123, 97, 255, 0.25); }
    .chip-cold { background: rgba(107, 107, 102, 0.1); color: #555550; border: 1px solid rgba(107, 107, 102, 0.25); }

    .deal-badge {
      font-size: 13px;
      font-weight: 800;
      color: var(--text-primary);
      background: var(--bg-surface);
      padding: 3px 9px;
      border-radius: 6px;
      border: 1px solid var(--border-subtle);
    }

    .stagnation-chip {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .stagnation-chip.warning {
      background: rgba(233, 162, 59, 0.14);
      color: #A36209;
      border: 1px solid rgba(233, 162, 59, 0.35);
    }
    .stagnation-chip.critical {
      background: rgba(217, 85, 85, 0.14);
      color: #C83B3B;
      border: 1px solid rgba(217, 85, 85, 0.35);
    }

    /* Customer Details Grid */
    .contact-details-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px 18px;
      background: var(--bg-surface);
      padding: 14px 18px;
      border-radius: 10px;
      border: 1px solid var(--border-subtle);
    }

    .contact-meta-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .full-width-meta {
      grid-column: 1 / -1;
      border-top: 1px dashed var(--border-subtle);
      padding-top: 8px;
      margin-top: 2px;
    }

    .meta-label {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .meta-val {
      font-size: 12.5px;
      color: var(--text-primary);
    }
    .meta-val a {
      color: #E76F51;
      text-decoration: none;
    }
    .meta-val a:hover {
      text-decoration: underline;
    }

    .source-highlight {
      font-weight: 700;
      color: #7B61FF;
    }

    .rep-name-pill {
      font-weight: 600;
      color: #2A9D8F;
    }

    .stage-stepper-panel {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 220px;
      flex-shrink: 0;
    }

    .stage-panel-label {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .stage-select {
      width: 100%;
      font-size: 13px;
      font-weight: 700;
      padding: 7px 10px;
      border-radius: 6px;
      background: var(--bg-card);
      border: 1px solid var(--border-medium);
      color: var(--text-primary);
    }

    .stage-sub-note {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* 2 Column Layout */
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      align-items: start;
    }

    .intelligence-column, .context-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
    }

    /* AI Score Card */
    .ai-score-card {
      padding: 20px;
    }

    .score-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .ai-brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #E76F51;
    }

    .model-meta {
      font-size: 11px;
      color: var(--text-muted);
    }

    .score-visual-row {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .score-ring-wrap {
      position: relative;
      width: 110px;
      height: 110px;
      flex-shrink: 0;
    }

    .progress-ring {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .progress-ring-bg {
      stroke: var(--bg-surface);
    }

    .progress-ring-circle {
      stroke: #E76F51;
      stroke-dasharray: 301.6;
      transition: stroke-dashoffset 0.6s ease;
    }

    .ring-hot .progress-ring-circle { stroke: #E76F51; }
    .ring-warm .progress-ring-circle { stroke: #E9A23B; }
    .ring-nurture .progress-ring-circle { stroke: #7B61FF; }
    .ring-cold .progress-ring-circle { stroke: #8C8C85; }

    .score-center-text {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .score-main {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary);
    }

    .score-denominator {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .score-summary-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .signal-tag {
      font-size: 12px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      width: fit-content;
      letter-spacing: 0.04em;
    }
    .signal-high { background: rgba(42, 157, 143, 0.12); color: #1F7A6F; }
    .signal-medium { background: rgba(233, 162, 59, 0.12); color: #A36209; }
    .signal-nurture { background: rgba(123, 97, 255, 0.1); color: #5D43E0; }
    .signal-low { background: rgba(107, 107, 102, 0.1); color: #555550; }
    .signal-won { background: #2A9D8F; color: #FFFFFF; }
    .signal-lost { background: #6B6B66; color: #FFFFFF; }

    .score-delta-line {
      font-size: 11.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .delta-arrow.delta-up { color: #228276; font-weight: 700; }
    .delta-arrow.delta-down { color: #C84B2E; font-weight: 700; }

    .score-percentile {
      color: var(--text-muted);
      font-size: 11px;
    }

    .score-summary-text {
      font-size: 12.5px;
      color: var(--text-secondary);
      line-height: 1.4;
      margin: 0;
    }

    .simulation-trigger-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 4px;
    }

    .sim-hint {
      font-size: 11px;
      color: var(--text-muted);
    }

    /* WHY THIS SCORE Card */
    .explainable-ai-card {
      padding: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
    }

    .card-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: -0.01em;
    }

    .card-subtitle {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .mock-badge {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #7B61FF;
      background: rgba(123, 97, 255, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .score-contributors-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .signals-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .signals-group-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 4px;
    }

    .signal-bars-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .signal-bar-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
    }

    .signal-info {
      width: 220px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .signal-check { color: #2A9D8F; font-weight: 800; }
    .signal-warn { color: #E76F51; font-weight: 800; }

    .signal-name {
      color: var(--text-primary);
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .signal-bar-track {
      flex: 1;
      height: 6px;
      background: var(--bg-surface);
      border-radius: 3px;
      overflow: hidden;
    }

    .signal-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.4s ease;
    }
    .fill-pos { background: #2A9D8F; }
    .fill-neg { background: #E76F51; }

    .signal-points {
      width: 45px;
      text-align: right;
      font-size: 11.5px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .explainable-footer {
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px solid var(--border-subtle);
      color: var(--text-muted);
      font-size: 11px;
    }

    /* Recommendation Card */
    .recommendation-card {
      padding: 20px;
      border-left: 4px solid #E76F51;
    }
    .recommendation-card.completed {
      border-left-color: #2A9D8F;
      opacity: 0.85;
    }

    .rec-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .rec-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #E76F51;
    }

    .rec-completed-badge {
      font-size: 10px;
      font-weight: 800;
      color: #228276;
      background: rgba(42, 157, 143, 0.15);
      padding: 2px 7px;
      border-radius: 4px;
    }

    .rec-action-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.25;
    }

    .rec-action-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.45;
      margin: 6px 0 12px 0;
    }

    .rec-why-box {
      background: var(--bg-surface);
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 16px;
      border: 1px solid var(--border-subtle);
    }

    .why-label {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .why-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .why-bullet {
      color: #E76F51;
      font-size: 9px;
      margin-right: 4px;
    }

    .rec-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    /* Activity Timeline */
    .activity-timeline-card {
      padding: 20px;
    }

    .journey-timeline {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 400px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .journey-node {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      position: relative;
    }

    .journey-icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }
    .icon-email { background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.25); }
    .icon-demo { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.25); }
    .icon-proposal { background: rgba(231, 111, 81, 0.1); border-color: rgba(231, 111, 81, 0.25); }
    .icon-quotation { background: rgba(123, 97, 255, 0.1); border-color: rgba(123, 97, 255, 0.25); }
    .icon-stage_change { background: rgba(42, 157, 143, 0.1); border-color: rgba(42, 157, 143, 0.25); }
    .icon-call { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.25); }
    .icon-note { background: rgba(233, 162, 59, 0.1); border-color: rgba(233, 162, 59, 0.25); }

    .journey-content {
      flex: 1;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .journey-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .journey-title {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .journey-time {
      font-size: 10.5px;
      color: var(--text-muted);
    }

    .journey-desc {
      font-size: 11.5px;
      color: var(--text-secondary);
      line-height: 1.35;
      margin: 0;
    }

    .journey-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
      font-size: 10.5px;
      color: var(--text-muted);
    }

    .journey-stage-tag {
      font-size: 10px;
      font-weight: 700;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--text-secondary);
    }

    .no-activity-box {
      padding: 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: 12px;
    }

    /* Sales Rep Notes Card */
    .notes-card {
      padding: 20px;
    }

    .notes-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 320px;
      overflow-y: auto;
      margin-bottom: 14px;
    }

    .note-item {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .note-author-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
    }

    .note-author-label {
      color: var(--text-muted);
      font-size: 10.5px;
    }

    .note-author {
      color: var(--text-primary);
    }

    .note-date {
      color: var(--text-muted);
      font-size: 10.5px;
      margin-left: auto;
    }

    .note-content {
      font-size: 12.5px;
      color: var(--text-primary);
      font-style: italic;
      line-height: 1.4;
      margin: 0;
    }

    .extracted-signals-box {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 4px;
      padding-top: 6px;
      border-top: 1px dashed var(--border-subtle);
    }

    .extracted-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
    }

    .signal-chips {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .ai-signal-chip {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(123, 97, 255, 0.1);
      color: #5D43E0;
      border: 1px solid rgba(123, 97, 255, 0.25);
    }

    .ai-signal-chip.sig-interest {
      background: rgba(42, 157, 143, 0.1);
      color: #228276;
      border-color: rgba(42, 157, 143, 0.25);
    }

    .ai-signal-chip.sig-concern {
      background: rgba(233, 162, 59, 0.12);
      color: #A36209;
      border-color: rgba(233, 162, 59, 0.3);
    }

    .ai-signal-chip.sig-pending {
      background: rgba(231, 111, 81, 0.1);
      color: #C84B2E;
      border-color: rgba(231, 111, 81, 0.25);
    }

    .ai-signal-chip.sig-competitor {
      background: rgba(107, 107, 102, 0.1);
      color: #555550;
      border-color: rgba(107, 107, 102, 0.25);
    }

    .no-notes-box {
      padding: 16px;
      text-align: center;
      color: var(--text-muted);
      font-size: 12px;
      background: var(--bg-surface);
      border-radius: 8px;
    }

    /* Add Note Form */
    .add-note-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      border-top: 1px solid var(--border-subtle);
      padding-top: 12px;
    }

    .quick-snippets-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .snippet-label {
      font-size: 10px;
      color: var(--text-muted);
      font-weight: 700;
    }

    .snippet-chip {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      font-size: 10.5px;
      padding: 2px 7px;
      border-radius: 4px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .snippet-chip:hover {
      background: rgba(231, 111, 81, 0.1);
      color: #C84B2E;
      border-color: rgba(231, 111, 81, 0.3);
    }

    .note-textarea {
      width: 100%;
      font-size: 13px;
      padding: 8px 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      resize: vertical;
    }

    .add-note-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .ai-parsing-hint {
      font-size: 10.5px;
      color: var(--text-muted);
      flex: 1;
    }

    .not-found-card {
      text-align: center;
      padding: 60px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    /* Business Priority Card Styles (Feature 1) */
    .business-priority-card {
      border: 1.5px solid rgba(244, 96, 54, 0.25);
      background: linear-gradient(180deg, #FFFFFF 0%, #FFFDFB 100%);
      box-shadow: 0 4px 16px rgba(244, 96, 54, 0.06);
    }

    .bp-header-title-wrap {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bp-algo-tag {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .bp-badge-pill {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 4px 10px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .bp-pill-very-high {
      background: #FFF1ED;
      color: #C84B2E;
      border: 1px solid #F46036;
      box-shadow: 0 2px 6px rgba(244, 96, 54, 0.2);
    }
    .bp-pill-high {
      background: #FEF3C7;
      color: #B45309;
      border: 1px solid #F59E0B;
    }
    .bp-pill-medium {
      background: #EEF2FF;
      color: #4338CA;
      border: 1px solid #6366F1;
    }
    .bp-pill-low {
      background: #F3F4F6;
      color: #6B7280;
      border: 1px solid #D1D5DB;
    }

    .bp-score-hero-row {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 16px 0;
      border-bottom: 1px solid var(--border-subtle);
      flex-wrap: wrap;
    }

    .bp-big-score-wrap {
      display: flex;
      align-items: baseline;
      gap: 4px;
      background: #FAF8F5;
      border: 1.5px solid var(--border-subtle);
      border-radius: 12px;
      padding: 12px 18px;
    }

    .bp-big-num {
      font-size: 40px;
      font-weight: 800;
      line-height: 1;
      color: #C84B2E;
    }

    .bp-denom-label {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .bp-breakdown-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      flex: 1;
      min-width: 280px;
    }

    .bp-metric-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 10px 12px;
    }

    .bp-metric-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .bp-metric-val {
      font-size: 14px;
      color: var(--text-primary);
    }

    .bp-reasons-section {
      padding: 14px 0;
      border-bottom: 1px solid var(--border-subtle);
    }

    .bp-reasons-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 8px;
      letter-spacing: 0.02em;
    }

    .bp-factors-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bp-factors-list li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-primary);
    }

    .check-icon {
      color: #10B981;
      font-weight: 800;
    }

    .bp-action-box {
      margin-top: 14px;
      padding: 12px 14px;
      background: rgba(244, 96, 54, 0.08);
      border: 1px solid rgba(244, 96, 54, 0.25);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #C84B2E;
    }

    .action-bolt {
      font-size: 18px;
    }

    /* Referral Info Card Styles (Feature 2) */
    .referral-info-card {
      border: 1.5px solid rgba(124, 58, 237, 0.25);
      background: linear-gradient(180deg, #FFFFFF 0%, #FDFBFF 100%);
    }

    .referral-status-badge {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
    }

    .ref-status-pending {
      background: #FEF3C7;
      color: #B45309;
      border: 1px solid #F59E0B;
    }

    .ref-status-reward_eligible,
    .ref-status-reward-eligible {
      background: #D1FAE5;
      color: #065F46;
      border: 1px solid #10B981;
    }

    .ref-status-reward_granted,
    .ref-status-reward-granted {
      background: #EDE9FE;
      color: #5B21B6;
      border: 1px solid #8B5CF6;
    }

    .referral-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid var(--border-subtle);
    }

    .ref-meta-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .ref-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.04em;
    }

    .ref-value {
      font-size: 13px;
      color: var(--text-primary);
    }

    .text-purple {
      color: #7C3AED;
    }

    .referral-workflow-stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 8px;
    }

    .stepper-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      opacity: 0.5;
    }

    .stepper-step.step-done {
      opacity: 1;
    }

    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 2px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
    }

    .step-done .step-num {
      background: #7C3AED;
      color: #FFFFFF;
      border-color: #6D28D9;
    }

    .step-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .stepper-line {
      flex: 1;
      height: 2px;
      background: var(--border-subtle);
      margin: 0 8px;
      margin-bottom: 16px;
    }

    .stepper-line.line-done {
      background: #7C3AED;
    }

    .ref-reward-action-bar {
      margin-top: 12px;
      padding: 12px 14px;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .reward-eligible-note {
      font-size: 13px;
      color: #065F46;
    }

    .ref-reward-granted-banner {
      margin-top: 12px;
      padding: 10px 14px;
      background: #F5F3FF;
      border: 1px solid #DDD6FE;
      border-radius: 8px;
      color: #5B21B6;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 1024px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }
      .contact-details-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .contact-details-grid {
        grid-template-columns: 1fr;
      }
      .score-visual-row {
        flex-direction: column;
        align-items: flex-start;
      }
      .bp-breakdown-metrics {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LeadDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private leadService = inject(LeadService);
  private referralService = inject(ReferralService);
  private toastService = inject(ToastService);
  public authService = inject(AuthService);

  lead?: Lead;
  showSimulateModal = false;
  newNoteContent = '';
  isRecalculating = false;
  Math = Math;

  defaultPriorityFactors: string[] = [
    'Strong engagement momentum across customer touches',
    'Favorable win conversion probability based on account profile',
    'Significant expected investment scale',
    'Active pipeline stage progression'
  ];

  async grantReferralReward(refId: string): Promise<void> {
    const ok = await this.referralService.grantReward(refId);
    if (ok) {
      await this.refreshLead();
    }
  }

  get sortedActivities(): Activity[] {
    if (!this.lead || !this.lead.activities) return [];
    return [...this.lead.activities]; // Already sorted newest first
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (id) {
        this.lead = this.leadService.getLeadById(id);
        const detailed = await this.leadService.fetchLeadDetail(id);
        if (detailed) {
          this.lead = detailed;
        }
      }
    });
  }

  async refreshLead(): Promise<void> {
    if (this.lead) {
      const detailed = await this.leadService.fetchLeadDetail(this.lead.id);
      if (detailed) {
        this.lead = detailed;
      }
    }
  }

  async onRecalculateScore(): Promise<void> {
    if (!this.lead) return;
    this.isRecalculating = true;
    try {
      await this.leadService.recalculateScore(this.lead.id);
      await this.refreshLead();
    } finally {
      this.isRecalculating = false;
    }
  }

  calculateStrokeOffset(score: number): number {
    const circumference = 2 * Math.PI * 48; // ~301.6
    return circumference - (score / 100) * circumference;
  }

  sumPoints(signals: Array<{ signal: string, points: number }>): number {
    return signals.reduce((sum, s) => sum + s.points, 0);
  }

  onStageChange(newStage: PipelineStage): void {
    if (this.lead) {
      this.leadService.updateLeadStage(this.lead.id, newStage);
      this.refreshLead();
    }
  }

  completeAction(): void {
    if (this.lead) {
      this.lead.actionCompleted = true;
      this.toastService.show(
        'Action Completed',
        `Recommended action marked completed for ${this.lead.company}.`,
        'success'
      );
    }
  }

  focusNow(): void {
    if (this.lead) {
      this.leadService.setFocusMode(true);
      this.toastService.show(
        '🎯 Lead Focused',
        `${this.lead.company} prioritized in your active execution queue.`,
        'ai'
      );
    }
  }

  insertSnippet(text: string): void {
    if (this.newNoteContent) {
      this.newNoteContent += ' ' + text;
    } else {
      this.newNoteContent = text;
    }
  }

  getSignalChipClass(sig: string): string {
    const s = sig.toLowerCase();
    if (s.includes('interest')) return 'sig-interest';
    if (s.includes('concern') || s.includes('budget') || s.includes('pricing')) return 'sig-concern';
    if (s.includes('pending') || s.includes('approval') || s.includes('decision')) return 'sig-pending';
    if (s.includes('competitor')) return 'sig-competitor';
    return '';
  }

  submitNote(): void {
    if (!this.lead || !this.newNoteContent.trim()) return;

    const text = this.newNoteContent.toLowerCase();
    const signals: string[] = [];

    if (text.includes('budget') || text.includes('pricing') || text.includes('price') || text.includes('cost') || text.includes('expensive')) {
      signals.push('Pricing concern');
    }
    if (text.includes('enterprise') || text.includes('feature') || text.includes('interested') || text.includes('interest') || text.includes('security')) {
      signals.push('Product interest');
    }
    if (text.includes('decision') || text.includes('board') || text.includes('cfo') || text.includes('approval') || text.includes('pending')) {
      signals.push('Decision pending');
    }
    if (text.includes('competitor') || text.includes('salesforce') || text.includes('hubspot') || text.includes('gong')) {
      signals.push('Competitor mentioned');
    }
    if (signals.length === 0) {
      signals.push('Rep Note Logged');
    }

    this.leadService.addNote(this.lead.id, this.newNoteContent, signals);
    this.newNoteContent = '';
    this.refreshLead();
  }
}
