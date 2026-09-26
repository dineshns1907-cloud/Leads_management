import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminService, CreateSalespersonDto, AdminUserItem } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-dashboard-page animate-fade-in">
      
      <!-- Top Title Bar -->
      <div class="page-header">
        <div>
          <div class="header-badge-row">
            <span class="admin-chip">
              🛡️ Administrator Management Console
            </span>
          </div>
          <h1 class="page-title">Admin Dashboard & Team Management</h1>
          <p class="page-subtitle">
            System overview, organizational KPIs, salesperson provisioning, and account governance.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-outline btn-sm" (click)="refresh()">
            <span>🔄</span> Refresh
          </button>
          <button class="btn btn-primary" (click)="showCreateModal = true">
            <span>+</span> CREATE SALESPERSON
          </button>
        </div>
      </div>

      <!-- High-Level KPI Summary (Requirement: Total Salespeople, Active Salespeople, Total Leads, Active Opportunities, Won Deals, Total Pipeline Value) -->
      <div class="kpi-grid">
        
        <div class="kpi-card card-salespeople">
          <div class="kpi-top">
            <span class="kpi-label">TOTAL SALESPEOPLE</span>
            <span class="kpi-icon">👥</span>
          </div>
          <div class="kpi-val mono">{{ adminService.dashboard()?.total_salespeople ?? 0 }}</div>
          <div class="kpi-sub">
            <span class="text-success font-semibold">{{ adminService.dashboard()?.active_salespeople ?? 0 }} Active</span> accounts
          </div>
        </div>

        <div class="kpi-card card-active-reps">
          <div class="kpi-top">
            <span class="kpi-label">ACTIVE SALESPEOPLE</span>
            <span class="kpi-icon text-success">🟢</span>
          </div>
          <div class="kpi-val mono text-success">{{ adminService.dashboard()?.active_salespeople ?? 0 }}</div>
          <div class="kpi-sub">Currently assigned accounts</div>
        </div>

        <div class="kpi-card card-leads">
          <div class="kpi-top">
            <span class="kpi-label">TOTAL LEADS</span>
            <span class="kpi-icon text-coral">📈</span>
          </div>
          <div class="kpi-val mono">{{ adminService.dashboard()?.total_leads ?? 0 }}</div>
          <div class="kpi-sub">Synchronized in database</div>
        </div>

        <div class="kpi-card card-opps">
          <div class="kpi-top">
            <span class="kpi-label">ACTIVE OPPORTUNITIES</span>
            <span class="kpi-icon text-amber">⚡</span>
          </div>
          <div class="kpi-val mono text-amber">{{ adminService.dashboard()?.active_opportunities ?? 0 }}</div>
          <div class="kpi-sub">In active pipeline stages</div>
        </div>

        <div class="kpi-card card-won">
          <div class="kpi-top">
            <span class="kpi-label">WON DEALS</span>
            <span class="kpi-icon text-success">🏆</span>
          </div>
          <div class="kpi-val mono text-success">{{ adminService.dashboard()?.won_deals ?? 0 }}</div>
          <div class="kpi-sub">Finalized customer conversions</div>
        </div>

        <div class="kpi-card card-pipeline">
          <div class="kpi-top">
            <span class="kpi-label">TOTAL PIPELINE VALUE</span>
            <span class="kpi-icon text-coral">💰</span>
          </div>
          <div class="kpi-val mono text-coral font-bold">
            {{ adminService.dashboard()?.formatted_pipeline_value || '₹1.2 Cr' }}
          </div>
          <div class="kpi-sub">Cumulative active opportunity value</div>
        </div>

      </div>

      <!-- Sales Team Roster Table -->
      <div class="card team-table-card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Sales Team Roster</h3>
            <p class="card-subtitle">Manage account status, lead ownership, and sales access</p>
          </div>
          <button class="btn btn-primary btn-sm" (click)="showCreateModal = true">
            <span>+</span> Create Salesperson
          </button>
        </div>

        <div class="table-container">
          <table class="leadiq-table">
            <thead>
              <tr>
                <th>Salesperson Name</th>
                <th>Email / Username</th>
                <th>Role</th>
                <th>Department</th>
                <th>Assigned Leads</th>
                <th>Account Status</th>
                <th style="text-align: right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of adminService.users()" class="team-row">
                
                <!-- Name with Avatar -->
                <td>
                  <div class="user-name-col">
                    <span class="user-avatar mono">{{ getAvatar(user.name) }}</span>
                    <div>
                      <span class="user-fullname font-semibold">{{ user.name }}</span>
                      <div class="user-role-micro">{{ user.role.replace('_', ' ') }}</div>
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td>
                  <span class="mono user-email">{{ user.email }}</span>
                </td>

                <!-- Role Badge -->
                <td>
                  <span class="role-badge" [class.admin-role]="user.role === 'ADMIN'">
                    {{ user.role.replace('_', ' ') }}
                  </span>
                </td>

                <!-- Department -->
                <td>
                  <span class="dept-text">{{ user.department || 'Commercial & Mid-Market Accounts' }}</span>
                </td>

                <!-- Assigned Leads -->
                <td>
                  <span class="leads-pill mono font-bold">
                    {{ user.assigned_leads }} Leads
                  </span>
                </td>

                <!-- Status Pill -->
                <td>
                  <span class="status-chip" [class.active-chip]="user.is_active" [class.inactive-chip]="!user.is_active">
                    <span class="status-dot">●</span>
                    {{ user.status }}
                  </span>
                </td>

                <!-- Actions -->
                <td style="text-align: right">
                  <button 
                    *ngIf="user.role !== 'ADMIN'"
                    class="btn btn-outline btn-sm status-toggle-btn"
                    [class.btn-deactivate]="user.is_active"
                    [class.btn-activate]="!user.is_active"
                    (click)="toggleUser(user)"
                  >
                    {{ user.is_active ? 'Deactivate' : 'Activate' }}
                  </button>
                  <span *ngIf="user.role === 'ADMIN'" class="text-muted" style="font-size: 11px;">
                    Protected
                  </span>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CREATE SALESPERSON MODAL -->
      <div class="modal-backdrop" *ngIf="showCreateModal" (click)="showCreateModal = false">
        <div class="modal-content animate-fade-in" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Create Salesperson Account</h2>
              <p class="modal-subtitle">Provision credentials for a new sales representative</p>
            </div>
            <button class="close-btn" (click)="showCreateModal = false">×</button>
          </div>

          <form (ngSubmit)="onCreateSalesperson()" class="modal-form">
            <div class="form-grid">
              
              <div class="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  class="input" 
                  placeholder="e.g. Alex Salesperson" 
                  [(ngModel)]="newForm.name" 
                  name="name" 
                  required 
                />
              </div>

              <div class="form-group">
                <label>Email Address / Username *</label>
                <input 
                  type="email" 
                  class="input" 
                  placeholder="alex.sales@leadiq.io" 
                  [(ngModel)]="newForm.email" 
                  name="email" 
                  required 
                />
              </div>

              <div class="form-group">
                <label>Contact Phone</label>
                <input 
                  type="text" 
                  class="input" 
                  placeholder="+91 98765 43210" 
                  [(ngModel)]="newForm.phone" 
                  name="phone" 
                />
              </div>

              <div class="form-group">
                <label>Temporary Password *</label>
                <input 
                  type="password" 
                  class="input" 
                  placeholder="Minimum 6 characters" 
                  [(ngModel)]="newForm.password" 
                  name="password" 
                  required 
                />
              </div>

              <div class="form-group">
                <label>Role</label>
                <select class="select" [(ngModel)]="newForm.role" name="role">
                  <option value="SALES_REPRESENTATIVE">SALES REPRESENTATIVE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div class="form-group">
                <label>Department</label>
                <select class="select" [(ngModel)]="newForm.department" name="department">
                  <option value="Higher Education & Institutional Sales">Higher Education & Institutional Sales</option>
                  <option value="Commercial & Mid-Market Accounts">Commercial & Mid-Market Accounts</option>
                  <option value="Enterprise Software Solutions">Enterprise Software Solutions</option>
                  <option value="Strategic Partnerships">Strategic Partnerships</option>
                </select>
              </div>

            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" (click)="showCreateModal = false">Cancel</button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="!newForm.name || !newForm.email || !newForm.password || isCreating"
              >
                {{ isCreating ? 'Creating Account...' : 'Create Salesperson' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .admin-dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .admin-chip {
      font-size: 11px;
      font-weight: 700;
      color: #C84B2E;
      background: #FFF1ED;
      border: 1px solid rgba(244, 96, 54, 0.4);
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
      grid-template-columns: repeat(3, 1fr);
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

    .text-success { color: #10B981 !important; }
    .text-amber { color: #D97706 !important; }
    .text-coral { color: #C84B2E !important; }

    .team-table-card {
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
    }

    .table-container {
      overflow-x: auto;
    }

    .user-name-col {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #FAF8F5;
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: #C84B2E;
    }

    .user-fullname {
      font-size: 13.5px;
      color: var(--text-primary);
    }

    .user-role-micro {
      font-size: 10.5px;
      color: var(--text-muted);
    }

    .user-email {
      font-size: 12.5px;
      color: var(--text-secondary);
    }

    .role-badge {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      background: #F3F4F6;
      color: #4B5563;
    }
    .role-badge.admin-role {
      background: #FFF1ED;
      color: #C84B2E;
      border: 1px solid rgba(244, 96, 54, 0.3);
    }

    .dept-text {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .leads-pill {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 6px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
    }

    .status-chip {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .active-chip {
      background: #D1FAE5;
      color: #065F46;
    }

    .inactive-chip {
      background: #FEE2E2;
      color: #991B1B;
    }

    .status-dot {
      font-size: 8px;
    }

    .status-toggle-btn {
      font-size: 11px;
      padding: 4px 10px;
    }
    .btn-deactivate {
      color: #C84B2E;
      border-color: rgba(200, 75, 46, 0.4);
    }
    .btn-activate {
      color: #10B981;
      border-color: rgba(16, 185, 129, 0.4);
    }

    /* Modal styles */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(3px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-content {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      max-width: 600px;
      width: 100%;
      padding: 26px;
      box-shadow: var(--shadow-xl);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .modal-title {
      font-size: 19px;
      font-weight: 800;
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
      font-size: 24px;
      cursor: pointer;
      color: var(--text-muted);
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

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--border-subtle);
    }

    @media (max-width: 900px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  adminService = inject(AdminService);
  authService = inject(AuthService);
  private router = inject(Router);

  showCreateModal = false;
  isCreating = false;

  newForm: CreateSalespersonDto = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'SALES_REPRESENTATIVE',
    department: 'Higher Education & Institutional Sales',
    is_active: true
  };

  async ngOnInit(): Promise<void> {
    // Role guard: Ensure user has role == 'admin'
    if (!this.authService.isAdmin()) {
      alert('Access Denied (403 Unauthorized): Only System Administrators can access the Admin Dashboard.');
      this.router.navigate(['/dashboard']);
      return;
    }

    await this.refresh();
  }

  async refresh(): Promise<void> {
    await this.adminService.loadDashboard();
  }

  getAvatar(name: string): string {
    if (!name) return 'SP';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  async onCreateSalesperson(): Promise<void> {
    if (!this.newForm.name || !this.newForm.email || !this.newForm.password) return;

    this.isCreating = true;
    const ok = await this.adminService.createSalesperson(this.newForm);
    this.isCreating = false;

    if (ok) {
      this.showCreateModal = false;
      this.newForm = {
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'SALES_REPRESENTATIVE',
        department: 'Higher Education & Institutional Sales',
        is_active: true
      };
    }
  }

  async toggleUser(user: AdminUserItem): Promise<void> {
    await this.adminService.toggleStatus(user.id, user.is_active);
  }
}
