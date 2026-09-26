import { Component, EventEmitter, Input, Output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LeadService } from '../../services/lead.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Logo Section -->
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-mark">
            <span class="ai-spark">⚡</span>
            <span class="logo-dot"></span>
          </div>
          <div class="logo-text" *ngIf="!collapsed">
            <div class="logo-brand">LEAD<span class="brand-accent">IQ</span></div>
            <div class="logo-tag">AI SALES INTEL</div>
          </div>
        </div>

        <button 
          class="collapse-toggle" 
          (click)="toggleCollapse()" 
          [attr.aria-label]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          [title]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <span>{{ collapsed ? '→' : '←' }}</span>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav">
        <div class="nav-section-label" *ngIf="!collapsed">
          {{ authService.isAdmin() ? 'ADMINISTRATION' : (authService.isManager() ? 'EXECUTIVE SUITE' : 'SALES REP WORKSPACE') }}
        </div>
        
        <ul class="nav-list">
          <li *ngFor="let item of currentNavItems()">
            <a 
              [routerLink]="item.path" 
              routerLinkActive="active" 
              [routerLinkActiveOptions]="{ exact: item.path === '/' || item.path === '/dashboard' || item.path === '/admin/dashboard' }"
              class="nav-link"
              [title]="collapsed ? item.label : ''"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
              <span 
                *ngIf="item.badge && !collapsed" 
                class="nav-badge"
                [style.background]="item.badgeColor || 'rgba(231, 111, 81, 0.12)'"
              >
                {{ item.badge }}
              </span>
            </a>
          </li>
        </ul>

        <!-- Role Simulator Badge (Quick switch for evaluation) -->
        <div class="role-switch-box" *ngIf="!collapsed">
          <div class="role-badge-row">
            <span class="role-chip" [class.manager-chip]="authService.isManager() && !authService.isAdmin()" [class.admin-chip]="authService.isAdmin()">
              {{ authService.isAdmin() ? '🛡️ Admin' : (authService.isManager() ? '👑 Sales Manager' : '💼 Sales Representative') }}
            </span>
          </div>
          <button 
            type="button" 
            class="switch-role-btn" 
            (click)="toggleRole()"
            title="Switch frontend role simulation"
          >
            Switch to {{ authService.isAdmin() ? 'Sales Rep' : (authService.isManager() ? 'Admin' : 'Manager') }} View ⇄
          </button>
        </div>
      </nav>

      <!-- Bottom User Profile & Sign Out -->
      <div class="sidebar-footer">
        <div class="user-profile-card">
          <div class="avatar-wrap">
            <div class="avatar" [class.mgr-avatar]="authService.isManager()">
              {{ authService.currentUser()?.avatarText || 'AM' }}
            </div>
            <span class="status-indicator-dot" title="Online: Sync Active"></span>
          </div>

          <div class="user-info" *ngIf="!collapsed">
            <div class="user-name">{{ authService.currentUser()?.name || 'Alex Rivera' }}</div>
            <div class="user-role">{{ authService.currentUser()?.title || 'Sales Representative' }}</div>
          </div>

          <!-- Logout Button -->
          <button 
            type="button" 
            class="logout-icon-btn" 
            (click)="onLogout()" 
            [title]="'Sign Out ' + (authService.currentUser()?.name || '')"
            *ngIf="!collapsed"
          >
            <span class="logout-icon">🚪</span>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-normal);
      position: sticky;
      top: 0;
      z-index: 50;
      flex-shrink: 0;
    }

    .sidebar.collapsed {
      width: var(--sidebar-collapsed-width);
    }

    .sidebar-header {
      height: var(--header-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .logo-mark {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #E76F51;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      position: relative;
      box-shadow: 0 2px 6px rgba(231, 111, 81, 0.25);
      flex-shrink: 0;
    }

    .ai-spark {
      font-size: 15px;
      line-height: 1;
    }

    .logo-dot {
      position: absolute;
      top: 3px;
      right: 3px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2A9D8F;
      border: 1.5px solid #FFFDF8;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .logo-brand {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: var(--text-primary);
    }

    .brand-accent {
      color: #E76F51;
      margin-left: 1px;
    }

    .logo-tag {
      font-size: 9px;
      font-weight: 700;
      color: var(--text-secondary);
      letter-spacing: 0.14em;
      margin-top: 1px;
    }

    .collapse-toggle {
      background: transparent;
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      color: var(--text-secondary);
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      font-size: 13px;
    }
    .collapse-toggle:hover {
      color: var(--text-primary);
      border-color: var(--border-medium);
      background: rgba(32, 33, 36, 0.04);
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 10px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .nav-section-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      padding: 0 12px 8px 12px;
    }

    .nav-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 12px;
      border-radius: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
      position: relative;
    }

    .nav-link:hover {
      background: rgba(32, 33, 36, 0.04);
      color: var(--text-primary);
    }

    .nav-link.active {
      background: rgba(231, 111, 81, 0.1);
      color: var(--text-primary);
      font-weight: 600;
      border-color: rgba(231, 111, 81, 0.2);
    }

    .nav-link.active .nav-icon {
      color: #E76F51;
    }

    .nav-icon {
      font-size: 15px;
      width: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--text-secondary);
      transition: color var(--transition-fast);
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
    }

    .nav-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
      color: #C84B2E;
    }

    .role-switch-box {
      margin-top: auto;
      padding: 12px;
      background: rgba(32, 33, 36, 0.03);
      border: 1px dashed var(--border-subtle);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .role-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .role-chip {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(123, 97, 255, 0.1);
      color: #5D43E0;
    }

    .role-chip.manager-chip {
      background: rgba(231, 111, 81, 0.12);
      color: #C84B2E;
    }

    .role-chip.admin-chip {
      background: rgba(244, 96, 54, 0.18);
      color: #E76F51;
      font-weight: 800;
    }

    .switch-role-btn {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 5px 8px;
      font-size: 10.5px;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: center;
    }
    .switch-role-btn:hover {
      border-color: #E76F51;
      color: #E76F51;
    }

    .sidebar-footer {
      padding: 12px 14px;
      border-top: 1px solid var(--border-subtle);
      background: rgba(32, 33, 36, 0.02);
    }

    .user-profile-card {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .avatar-wrap {
      position: relative;
    }

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: #DDD8CE;
      border: 1px solid var(--border-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary);
      flex-shrink: 0;
    }

    .avatar.mgr-avatar {
      background: #EFE4D6;
      border-color: rgba(231, 111, 81, 0.4);
      color: #C84B2E;
    }

    .status-indicator-dot {
      position: absolute;
      bottom: -1px;
      right: -1px;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #2A9D8F;
      border: 2px solid var(--bg-surface);
    }

    .user-info {
      flex: 1;
      line-height: 1.25;
      overflow: hidden;
    }

    .user-name {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .user-role {
      font-size: 10.5px;
      color: var(--text-secondary);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .logout-icon-btn {
      background: none;
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }
    .logout-icon-btn:hover {
      background: rgba(231, 111, 81, 0.12);
      color: #C84B2E;
    }

    .logout-icon {
      font-size: 14px;
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  public authService = inject(AuthService);
  public leadService = inject(LeadService);

  readonly currentNavItems = computed(() => {
    const isAdm = this.authService.isAdmin();
    const isMgr = this.authService.isManager();
    const totalCount = String(this.leadService.totalLeadsCount());
    const activeCount = String(this.leadService.activeOpportunitiesCount());
    const recCount = String(this.leadService.recommendations().filter(r => !r.completed).length || '8');

    if (isAdm) {
      // Administrator sees:
      // Admin Dashboard, All Leads, Pipeline, Referrals & Rewards, Settings
      return [
        { label: 'Admin Dashboard', path: '/admin/dashboard', icon: '🛡️' },
        { label: 'All Leads', path: '/leads', icon: '👥', badge: totalCount },
        { label: 'Pipeline', path: '/pipeline', icon: '⚡' },
        { label: 'Referrals & Rewards', path: '/referrals', icon: '🎁' },
        { label: 'Settings', path: '/settings', icon: '⚙️' }
      ];
    } else if (isMgr) {
      // Manager sees:
      // Executive Dashboard, All Leads, Pipeline, AI Recommendations, Referrals & Rewards, Analytics, Activity, Settings
      return [
        { label: 'Executive Dashboard', path: '/dashboard', icon: '📊' },
        { label: 'All Leads', path: '/leads', icon: '👥', badge: totalCount },
        { label: 'Pipeline', path: '/pipeline', icon: '⚡' },
        { label: 'AI Recommendations', path: '/recommendations', icon: '🎯', badge: recCount, badgeColor: 'rgba(231, 111, 81, 0.14)' },
        { label: 'Referrals & Rewards', path: '/referrals', icon: '🎁' },
        { label: 'Analytics', path: '/analytics', icon: '📈' },
        { label: 'Activity', path: '/activity', icon: '⏱️' },
        { label: 'Settings', path: '/settings', icon: '⚙️' }
      ];
    } else {
      // Salesperson sees:
      // Dashboard, My Leads, Pipeline, AI Recommendations, Referrals & Rewards, Activity, Settings
      return [
        { label: 'Dashboard', path: '/dashboard', icon: '📊' },
        { label: 'My Leads', path: '/leads', icon: '👥', badge: activeCount },
        { label: 'Pipeline', path: '/pipeline', icon: '⚡' },
        { label: 'AI Recommendations', path: '/recommendations', icon: '🎯', badge: recCount, badgeColor: 'rgba(231, 111, 81, 0.14)' },
        { label: 'Referrals & Rewards', path: '/referrals', icon: '🎁' },
        { label: 'Activity', path: '/activity', icon: '⏱️' },
        { label: 'Settings', path: '/settings', icon: '⚙️' }
      ];
    }
  });

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  toggleRole(): void {
    if (this.authService.isAdmin()) {
      this.authService.switchRole('salesperson');
    } else if (this.authService.isManager()) {
      this.authService.switchRole('admin');
    } else {
      this.authService.switchRole('manager');
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
