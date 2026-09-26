import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadService } from '../../../core/services/lead.service';
import { ReferralService } from '../../../core/services/referral.service';
import { PipelineStage } from '../../../models';

@Component({
  selector: 'app-add-lead-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Add New Sales Lead</h2>
            <p class="modal-subtitle">Enroll prospect into LeadIQ behavioral tracking & scoring</p>
          </div>
          <button class="close-btn" (click)="close()" aria-label="Close modal">×</button>
        </div>

        <form (ngSubmit)="submit()" class="modal-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Company Name *</label>
              <input 
                type="text" 
                class="input" 
                placeholder="e.g. Apex Dynamics Ltd" 
                [(ngModel)]="company" 
                name="company" 
                required 
              />
            </div>

            <div class="form-group">
              <label>Industry</label>
              <select class="select" [(ngModel)]="industry" name="industry">
                <option value="Enterprise Software">Enterprise Software</option>
                <option value="FinTech / Security">FinTech / Security</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="Manufacturing & Logistics">Manufacturing & Logistics</option>
                <option value="Data & AI Infrastructure">Data & AI Infrastructure</option>
                <option value="CleanTech & Energy">CleanTech & Energy</option>
                <option value="E-commerce & Retail">E-commerce & Retail</option>
              </select>
            </div>

            <div class="form-group">
              <label>Contact Full Name *</label>
              <input 
                type="text" 
                class="input" 
                placeholder="e.g. Sarah Jenkins" 
                [(ngModel)]="contactName" 
                name="contactName" 
                required 
              />
            </div>

            <div class="form-group">
              <label>Role / Title</label>
              <input 
                type="text" 
                class="input" 
                placeholder="e.g. VP of Operations" 
                [(ngModel)]="contactRole" 
                name="contactRole" 
              />
            </div>

            <div class="form-group">
              <label>Contact Email *</label>
              <input 
                type="email" 
                class="input" 
                placeholder="s.jenkins@company.com" 
                [(ngModel)]="contactEmail" 
                name="contactEmail" 
                required 
              />
            </div>

            <div class="form-group">
              <label>Contact Phone</label>
              <input 
                type="text" 
                class="input" 
                placeholder="+1 (555) 019-2834" 
                [(ngModel)]="contactPhone" 
                name="contactPhone" 
              />
            </div>

            <div class="form-group">
              <label>Lead Source</label>
              <select class="select" [(ngModel)]="source" name="source">
                <option value="Website">Website</option>
                <option value="Email">Email</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <!-- Dynamic Referred By (Only visible when Lead Source == Referral) -->
            <div class="form-group referral-group animate-fade-in" *ngIf="source === 'Referral'">
              <label>Referred By *</label>
              <select class="select referral-select" [(ngModel)]="referredById" name="referredById" required>
                <option value="" disabled>Select Existing Customer</option>
                <option *ngFor="let cust of customerOptions" [value]="cust.id">
                  {{ cust.company_name }} ({{ cust.contact_name }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Pipeline Stage</label>
              <select class="select" [(ngModel)]="stage" name="stage">
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Demo">Demo</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
              </select>
            </div>

            <div class="form-group">
              <label>Expected Investment / Deal Value</label>
              <div class="investment-input-wrap">
                <span class="currency-prefix">₹</span>
                <input 
                  type="text" 
                  class="input investment-input" 
                  placeholder="30,00,000 (e.g. ₹5,00,000 or ₹30L)" 
                  [(ngModel)]="expectedInvestmentInput" 
                  name="expectedInvestmentInput" 
                />
              </div>
            </div>

            <div class="form-group">
              <label>Initial AI Score (Estimate 1-100)</label>
              <input 
                type="number" 
                class="input" 
                min="20" 
                max="95" 
                [(ngModel)]="aiScore" 
                name="aiScore" 
              />
            </div>
          </div>

          <div class="ai-preview-box">
            <div class="ai-box-icon">⚡</div>
            <div class="ai-box-text">
              <strong>LeadIQ Predictive Engine</strong> begins telemetry tracking immediately upon creation.
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" (click)="close()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="!company || !contactName || !contactEmail">
              Add Lead to Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: var(--bg-overlay);
      backdrop-filter: blur(2px);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 150ms ease-out;
    }

    .modal-content {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      max-width: 620px;
      width: 100%;
      box-shadow: var(--shadow-lg);
      padding: 24px;
      position: relative;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 14px;
    }

    .modal-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .modal-subtitle {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      padding: 4px;
    }
    .close-btn:hover {
      color: var(--text-primary);
    }

    .form-grid {
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
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--text-secondary);
    }

    .investment-input-wrap {
      display: flex;
      align-items: center;
      position: relative;
    }

    .currency-prefix {
      position: absolute;
      left: 12px;
      font-weight: 700;
      color: var(--color-coral, #F46036);
      font-size: 14px;
      pointer-events: none;
    }

    .investment-input {
      padding-left: 28px !important;
      font-weight: 600;
    }

    .referral-group {
      background: #F5F3FF;
      border: 1px dashed #A78BFA;
      border-radius: 8px;
      padding: 10px;
    }

    .referral-group label {
      color: #6D28D9 !important;
    }

    .ai-preview-box {
      margin-top: 18px;
      padding: 12px 14px;
      border-radius: 8px;
      background: var(--bg-ai-tint);
      border: 1px solid var(--bg-ai-tint-border);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: #5B40E8;
    }

    .ai-box-icon {
      font-size: 16px;
      color: #7B61FF;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 22px;
      padding-top: 16px;
      border-top: 1px solid var(--border-subtle);
    }

    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AddLeadModalComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();

  private leadService = inject(LeadService);
  private referralService = inject(ReferralService);

  company = '';
  contactName = '';
  contactRole = 'Decision Maker';
  contactEmail = '';
  contactPhone = '';
  industry = 'Enterprise Software';
  source: any = 'Website';
  referredById = '';
  stage: PipelineStage = 'New';
  dealSize = '₹30L';
  expectedInvestmentInput = '₹30,00,000';
  aiScore = 75;

  customerOptions: any[] = [];

  async ngOnInit(): Promise<void> {
    this.customerOptions = await this.referralService.loadCustomerOptions();
  }

  close(): void {
    this.closed.emit();
  }

  parseInvestment(input: string): number {
    if (!input) return 500000;
    const lower = input.toLowerCase().trim();
    if (lower.includes('cr') || lower.includes('crore')) {
      const num = parseFloat(lower.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? 10000000 : Math.round(num * 10000000);
    }
    if (lower.includes('l') || lower.includes('lakh')) {
      const num = parseFloat(lower.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? 500000 : Math.round(num * 100000);
    }
    const cleanNum = parseFloat(lower.replace(/[^0-9.]/g, ''));
    return isNaN(cleanNum) ? 500000 : Math.round(cleanNum);
  }

  async submit(): Promise<void> {
    if (!this.company || !this.contactName || !this.contactEmail) return;
    if (this.source === 'Referral' && !this.referredById) {
      alert('Please select an existing customer in the "Referred By" field.');
      return;
    }

    const numericInvestment = this.parseInvestment(this.expectedInvestmentInput);
    const formattedDeal = numericInvestment >= 10000000
      ? `₹${(numericInvestment / 10000000).toFixed(1)} Cr`
      : (numericInvestment >= 100000 ? `₹${Math.round(numericInvestment / 100000)}L` : `₹${numericInvestment.toLocaleString('en-IN')}`);

    await this.leadService.addLead({
      company: this.company,
      contactName: this.contactName,
      contactRole: this.contactRole,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      industry: this.industry,
      source: this.source,
      stage: this.stage,
      dealSize: formattedDeal,
      expectedInvestment: numericInvestment,
      referredById: this.source === 'Referral' ? this.referredById : undefined,
      aiScore: Number(this.aiScore)
    });

    this.close();
  }
}
