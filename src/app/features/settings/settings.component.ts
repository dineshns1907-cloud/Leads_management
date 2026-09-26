import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page animate-fade-in">
      
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="header-chip">
            <span class="chip-spark">⚙️</span>
            <span>PREFERENCES & ENGINE CALIBRATION</span>
          </div>
          <h1 class="page-title">Platform Settings</h1>
          <p class="page-subtitle">
            Configure LeadIQ scoring algorithm weights, notification triggers, and active user profile preferences.
          </p>
        </div>

        <button class="btn btn-primary" (click)="saveSettings()">
          Save Preferences
        </button>
      </div>

      <!-- Settings Layout -->
      <div class="settings-grid">
        
        <!-- Left Nav Tabs -->
        <div class="settings-nav-card">
          <button 
            *ngFor="let tab of tabs" 
            class="tab-link"
            [class.active]="activeTab === tab.id"
            (click)="activeTab = tab.id"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-text">{{ tab.label }}</span>
          </button>
        </div>

        <!-- Right Content Panes -->
        <div class="settings-content-pane">
          
          <!-- TAB 1: SCORING PREFERENCES (AI WEIGHTS) -->
          <div class="card pane-card" *ngIf="activeTab === 'scoring'">
            <div class="pane-header">
              <div class="pane-badge">⚡ ALGORITHMIC WEIGHTS</div>
              <h2 class="pane-title">AI Lead Scoring Preferences</h2>
              <p class="pane-subtitle">
                Calibrate behavioral point allocations used by the LeadIQ predictive conversion and momentum model.
              </p>
            </div>

            <div class="weights-form">
              <div class="weight-control-row">
                <div class="weight-info">
                  <span class="weight-title">Pricing Quotation Requested</span>
                  <span class="weight-desc">Triggered when prospect requests formal PDF quote or enterprise pricing schedule</span>
                </div>
                <div class="weight-input-box">
                  <input type="number" class="input mono weight-input" [(ngModel)]="weights.quotation" min="5" max="30" />
                  <span class="pts-label">pts</span>
                </div>
              </div>

              <div class="weight-control-row">
                <div class="weight-info">
                  <span class="weight-title">Product Demo Completed</span>
                  <span class="weight-desc">Live technical demonstration attended by prospect and decision evaluators</span>
                </div>
                <div class="weight-input-box">
                  <input type="number" class="input mono weight-input" [(ngModel)]="weights.demo" min="5" max="30" />
                  <span class="pts-label">pts</span>
                </div>
              </div>

              <div class="weight-control-row">
                <div class="weight-info">
                  <span class="weight-title">Email Outreach Response</span>
                  <span class="weight-desc">Prospect replies to cadence communication within 24 hours</span>
                </div>
                <div class="weight-input-box">
                  <input type="number" class="input mono weight-input" [(ngModel)]="weights.email" min="2" max="20" />
                  <span class="pts-label">pts</span>
                </div>
              </div>

              <div class="weight-control-row">
                <div class="weight-info">
                  <span class="weight-title">Commercial Proposal Opened</span>
                  <span class="weight-desc">Interactive contract document accessed in prospect portal for >5 minutes</span>
                </div>
                <div class="weight-input-box">
                  <input type="number" class="input mono weight-input" [(ngModel)]="weights.proposal" min="2" max="20" />
                  <span class="pts-label">pts</span>
                </div>
              </div>

              <div class="weight-control-row">
                <div class="weight-info">
                  <span class="weight-title text-danger">Inactivity Decay Penalty</span>
                  <span class="weight-desc">Points deducted after 7 consecutive days of zero touchpoint engagement</span>
                </div>
                <div class="weight-input-box">
                  <input type="number" class="input mono weight-input text-danger" [(ngModel)]="weights.inactivity" min="-30" max="-2" />
                  <span class="pts-label">pts</span>
                </div>
              </div>
            </div>

            <!-- FEATURE 1: AI BUSINESS PRIORITY FORMULA WEIGHTS -->
            <div class="bp-weights-divider">
              <div class="bp-divider-title">
                <span>💎</span> AI BUSINESS PRIORITY COMPOSITION (FEATURE 1)
              </div>
              <p class="bp-divider-sub">Configures how commercial deal size, buyer engagement, and win probability are blended into the Business Priority Score.</p>
            </div>

            <div class="weights-form">
              <div class="weight-control-row">
                <div class="weight-info">
                  <span class="weight-title">Interest / Engagement Weight</span>
                  <span class="weight-desc">Contribution of real-time behavioral interaction momentum and AI lead score</span>
                </div>
                <div class="weight-input-box">
                  <input type="number" class="input mono weight-input" [(ngModel)]="bpWeights.interest" min="10" max="80" />
                  <span class="pts-label">%</span>
                </div>
              </div>

              <div class="weight-control-row">
                <div class="weight-info">
                  <span class="weight-title">Conversion Probability Weight</span>
                  <span class="weight-desc">Contribution of predicted deal win probability derived from stage and telemetry</span>
                </div>
                <div class="weight-input-box">
                  <input type="number" class="input mono weight-input" [(ngModel)]="bpWeights.conversion" min="10" max="80" />
                  <span class="pts-label">%</span>
                </div>
              </div>

              <div class="weight-control-row">
                <div class="weight-info">
                  <span class="weight-title text-coral">Expected Investment / Deal Value Weight</span>
                  <span class="weight-desc">Commercial impact weighting: scales ₹5L deals vs ₹30L+ enterprise commitments</span>
                </div>
                <div class="weight-input-box">
                  <input type="number" class="input mono weight-input text-coral font-bold" [(ngModel)]="bpWeights.investment" min="10" max="80" />
                  <span class="pts-label">%</span>
                </div>
              </div>
            </div>

            <div class="bp-formula-box">
              <span class="formula-icon">📐</span>
              <div class="formula-text">
                <strong>Current Composition:</strong> {{ bpWeights.interest }}% Interest + {{ bpWeights.conversion }}% Conversion + {{ bpWeights.investment }}% Expected Investment = <strong>{{ bpWeights.interest + bpWeights.conversion + bpWeights.investment }}%</strong>
              </div>
            </div>

            <div class="pane-footer">
              <span class="ai-hint">Weights take effect immediately on next real-time scoring recalculation.</span>
              <button class="btn btn-primary btn-sm" (click)="saveSettings()">Apply Weights</button>
            </div>
          </div>

          <!-- TAB 2: PROFILE -->
          <div class="card pane-card" *ngIf="activeTab === 'profile'">
            <div class="pane-header">
              <div class="pane-badge">👤 ACCOUNT CREDENTIALS</div>
              <h2 class="pane-title">User Profile & Role</h2>
              <p class="pane-subtitle">Manage your personal sales identity and assigned permissions</p>
            </div>

            <div class="profile-form-grid">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" class="input" [(ngModel)]="profile.name" />
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" class="input" [(ngModel)]="profile.email" />
              </div>
              <div class="form-group">
                <label>Role</label>
                <input type="text" class="input" [(ngModel)]="profile.role" />
              </div>
              <div class="form-group">
                <label>Assigned Territory</label>
                <input type="text" class="input" [(ngModel)]="profile.territory" />
              </div>
            </div>

            <div class="pane-footer">
              <button class="btn btn-primary btn-sm" (click)="saveSettings()">Update Profile</button>
            </div>
          </div>

          <!-- TAB 3: NOTIFICATIONS -->
          <div class="card pane-card" *ngIf="activeTab === 'notifications'">
            <div class="pane-header">
              <div class="pane-badge">🔔 REAL-TIME DISPATCH</div>
              <h2 class="pane-title">AI Notification Triggers</h2>
              <p class="pane-subtitle">Choose when LeadIQ delivers instant priority notifications</p>
            </div>

            <div class="toggle-list">
              <div class="toggle-row">
                <div>
                  <div class="toggle-title">Hot Lead Instant Alert</div>
                  <div class="toggle-desc">Notify immediately when a lead score crosses 80 points</div>
                </div>
                <input type="checkbox" [(ngModel)]="notifications.hotLeadAlert" class="checkbox-toggle" />
              </div>

              <div class="toggle-row">
                <div>
                  <div class="toggle-title">Stagnation & Decay Warnings</div>
                  <div class="toggle-desc">Alert when an active high-probability lead exceeds 7 days without contact</div>
                </div>
                <input type="checkbox" [(ngModel)]="notifications.overdueFollowup" class="checkbox-toggle" />
              </div>

              <div class="toggle-row">
                <div>
                  <div class="toggle-title">Pricing & Quotation Downloads</div>
                  <div class="toggle-desc">Alert immediately when a prospect downloads proposal pricing PDFs</div>
                </div>
                <input type="checkbox" [(ngModel)]="notifications.quotationDownloaded" class="checkbox-toggle" />
              </div>
            </div>

            <div class="pane-footer">
              <button class="btn btn-primary btn-sm" (click)="saveSettings()">Save Notification Rules</button>
            </div>
          </div>

          <!-- TAB 4: APPEARANCE -->
          <div class="card pane-card" *ngIf="activeTab === 'appearance'">
            <div class="pane-header">
              <div class="pane-badge">🎨 VISUAL DESIGN SYSTEM</div>
              <h2 class="pane-title">Appearance & Display Density</h2>
              <p class="pane-subtitle">Current visual theme and interface rendering preferences</p>
            </div>

            <div class="toggle-list">
              <div class="toggle-row">
                <div>
                  <div class="toggle-title">Visual Identity</div>
                  <div class="toggle-desc">LeadIQ Editorial Warm (Warm Ivory, Soft Sand, Coral, Emerald, Violet)</div>
                </div>
                <span class="theme-active-tag">Active Theme</span>
              </div>

              <div class="toggle-row">
                <div>
                  <div class="toggle-title">Compact Table Density</div>
                  <div class="toggle-desc">Display more leads per row on large widescreen monitors</div>
                </div>
                <input type="checkbox" [(ngModel)]="appearance.compactTables" class="checkbox-toggle" />
              </div>

              <div class="toggle-row">
                <div>
                  <div class="toggle-title">Score Adjustment Micro-animations</div>
                  <div class="toggle-desc">Display subtle indicator animations on real-time score changes</div>
                </div>
                <input type="checkbox" [(ngModel)]="appearance.animations" class="checkbox-toggle" />
              </div>
            </div>

            <div class="pane-footer">
              <button class="btn btn-primary btn-sm" (click)="saveSettings()">Save Display Preferences</button>
            </div>
          </div>

          <!-- TAB 5: ACCOUNT -->
          <div class="card pane-card" *ngIf="activeTab === 'account'">
            <div class="pane-header">
              <div class="pane-badge">🏢 WORKSPACE DETAILS</div>
              <h2 class="pane-title">Organization & Architecture</h2>
              <p class="pane-subtitle">LeadIQ Enterprise Frontend Environment</p>
            </div>

            <div class="account-info-box">
              <div class="acc-row">
                <span class="acc-lbl">Organization:</span>
                <span class="acc-val">Apex Revenue Technologies Inc.</span>
              </div>
              <div class="acc-row">
                <span class="acc-lbl">Subscription Tier:</span>
                <span class="acc-val text-coral">Enterprise AI Sales Intel (Unlimited)</span>
              </div>
              <div class="acc-row">
                <span class="acc-lbl">Active CRM Volume:</span>
                <span class="acc-val mono">524 Total Leads • 22 Active Pipeline</span>
              </div>
              <div class="acc-row">
                <span class="acc-lbl">Backend Readiness:</span>
                <span class="acc-val mono text-emerald">FastAPI Mock Adapter (Ready for PostgreSQL/MySQL Sync)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    .settings-page {
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

    .settings-grid {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 20px;
      align-items: start;
    }

    .settings-nav-card {
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 10px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .tab-link {
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      padding: 10px 14px;
      color: var(--text-secondary, #6B6358);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
      transition: all 0.15s ease;
    }
    .tab-link:hover {
      background: var(--bg-surface, #F1ECE1);
      color: var(--text-primary, #202124);
    }
    .tab-link.active {
      background: var(--accent-coral, #E76F51);
      border-color: var(--accent-coral, #E76F51);
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(231, 111, 81, 0.22);
    }

    .tab-icon {
      font-size: 15px;
    }

    .pane-card {
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 10px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .pane-badge {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--accent-violet, #7B61FF);
      margin-bottom: 4px;
    }

    .pane-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary, #202124);
      margin: 0 0 4px 0;
    }

    .pane-subtitle {
      font-size: 13px;
      color: var(--text-muted, #948B7D);
      margin: 0;
    }

    /* Weights Form */
    .weights-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .weight-control-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      background: var(--bg-surface, #F1ECE1);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 6px;
      gap: 16px;
    }

    .weight-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .weight-title {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-primary, #202124);
    }

    .weight-desc {
      font-size: 11.5px;
      color: var(--text-secondary, #6B6358);
      line-height: 1.4;
    }

    .weight-input-box {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .weight-input {
      width: 70px;
      text-align: right;
      font-weight: 700;
      padding: 6px 10px;
      background: var(--bg-card, #FFFDF8);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 6px;
      font-size: 13px;
    }

    .pts-label {
      font-size: 12px;
      color: var(--text-muted, #948B7D);
      font-weight: 600;
    }

    .pane-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--border-subtle, #E6DEC8);
      gap: 12px;
      flex-wrap: wrap;
    }

    .ai-hint {
      font-size: 11.5px;
      color: var(--text-muted, #948B7D);
    }

    /* Profile form */
    .profile-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary, #6B6358);
    }

    /* Toggles */
    .toggle-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      background: var(--bg-surface, #F1ECE1);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 6px;
      gap: 16px;
    }

    .toggle-title {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-primary, #202124);
    }

    .toggle-desc {
      font-size: 11.5px;
      color: var(--text-secondary, #6B6358);
    }

    .checkbox-toggle {
      width: 18px;
      height: 18px;
      accent-color: var(--accent-coral, #E76F51);
      cursor: pointer;
    }

    .theme-active-tag {
      font-size: 11px;
      font-weight: 700;
      color: var(--accent-emerald, #2A9D8F);
      background: rgba(42, 157, 143, 0.12);
      border: 1px solid rgba(42, 157, 143, 0.25);
      padding: 3px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }

    /* Account */
    .account-info-box {
      background: var(--bg-surface, #F1ECE1);
      border: 1px solid var(--border-subtle, #E6DEC8);
      border-radius: 8px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .acc-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      gap: 12px;
    }
    .acc-lbl { color: var(--text-muted, #948B7D); font-weight: 500; }
    .acc-val { font-weight: 600; color: var(--text-primary, #202124); }

    .text-coral { color: var(--accent-coral, #E76F51); }
    .text-emerald { color: var(--accent-emerald, #2A9D8F); }
    .text-danger { color: #C04E31 !important; }

    /* Business Priority Weights Styling */
    .bp-weights-divider {
      margin: 24px 0 14px 0;
      padding-top: 18px;
      border-top: 1.5px dashed var(--border-subtle);
    }

    .bp-divider-title {
      font-size: 13px;
      font-weight: 800;
      color: #C84B2E;
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.03em;
    }

    .bp-divider-sub {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 3px;
      margin-bottom: 8px;
    }

    .bp-formula-box {
      margin-top: 14px;
      padding: 12px 14px;
      background: #FFF8F5;
      border: 1px solid rgba(244, 96, 54, 0.25);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12.5px;
      color: #C84B2E;
    }

    .formula-icon {
      font-size: 16px;
    }

    @media (max-width: 800px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
      .profile-form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  public settingsService = inject(SettingsService);

  readonly tabs = [
    { id: 'scoring', label: 'AI Scoring Weights', icon: '⚡' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'account', label: 'Account', icon: '🏢' }
  ];

  activeTab = 'scoring';

  weights = {
    quotation: 18,
    demo: 15,
    email: 12,
    proposal: 10,
    inactivity: -12
  };

  bpWeights = {
    interest: 40,
    conversion: 30,
    investment: 30
  };

  profile = {
    name: this.authService.currentUser()?.name || 'Alex Rivera',
    email: this.authService.currentUser()?.email || 'salesperson@leadiq.com',
    role: this.authService.currentUser()?.role === 'manager' ? 'Sales Manager' : 'Sales Representative',
    territory: this.authService.currentUser()?.role === 'manager' ? 'Global Enterprise Operations' : 'North America Enterprise & Mid-Market'
  };

  notifications = {
    hotLeadAlert: true,
    overdueFollowup: true,
    quotationDownloaded: true
  };

  appearance = {
    compactTables: false,
    animations: true
  };

  async ngOnInit(): Promise<void> {
    const loaded = await this.settingsService.loadSettings();
    if (loaded) {
      this.weights = {
        quotation: loaded.pricing_quotation_requested,
        demo: loaded.product_demo_completed,
        email: loaded.email_response,
        proposal: loaded.commercial_proposal_opened,
        inactivity: loaded.inactivity_decay
      };
      if (loaded.interest_weight !== undefined) {
        this.bpWeights = {
          interest: Math.round((loaded.interest_weight || 0.4) * 100),
          conversion: Math.round((loaded.conversion_weight || 0.3) * 100),
          investment: Math.round((loaded.investment_weight || 0.3) * 100)
        };
      }
    }
  }

  async saveSettings(): Promise<void> {
    const success = await this.settingsService.saveSettings({
      pricing_quotation_requested: this.weights.quotation,
      product_demo_completed: this.weights.demo,
      email_response: this.weights.email,
      commercial_proposal_opened: this.weights.proposal,
      executive_meeting_booked: 8,
      pricing_page_visited: 6,
      inactivity_decay: this.weights.inactivity,
      followup_unopened_decay: -8,
      interest_weight: this.bpWeights.interest / 100,
      conversion_weight: this.bpWeights.conversion / 100,
      investment_weight: this.bpWeights.investment / 100
    });

    if (success) {
      this.toastService.show(
        'Preferences Saved',
        'Settings and AI scoring weights updated successfully in database.',
        'success'
      );
    } else {
      this.toastService.show(
        'Save Failed',
        'Could not persist settings to server. Please try again.',
        'warning'
      );
    }
  }
}

