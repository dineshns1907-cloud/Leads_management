import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LeadService } from '../../services/lead.service';
import { AuthService } from '../../services/auth.service';
import { SearchService, SearchResultItem } from '../../services/search.service';

interface NotificationAlert {
  id: string;
  title: string;
  time: string;
  type: 'hot' | 'ai' | 'warning';
  read: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="header">
      <div class="header-left">
        <h1 class="page-title">{{ getTitle() }}</h1>
        <span class="live-status-chip">
          <span class="live-dot"></span>
          AI Model v4.2 Active
        </span>
      </div>

      <div class="header-right">
        <!-- Search bar with warm white background and subtle border -->
        <div class="search-container">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search leads, companies or contacts... (Cmd+K)"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            (keydown.enter)="onSearchSubmit()"
            (focus)="onSearchFocus()"
          />
          <span class="search-shortcut">⌘K</span>

          <!-- Quick Search Results Dropdown -->
          <div class="search-dropdown-panel" *ngIf="showSearchDropdown && searchService.searchResults().length > 0">
            <div class="search-dropdown-header">
              <span>Matching Leads ({{ searchService.searchResults().length }})</span>
            </div>
            <div 
              *ngFor="let item of searchService.searchResults()" 
              class="search-result-row"
              (click)="selectSearchResult(item)"
            >
              <div class="search-result-main">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span *ngIf="item.public_lead_id" class="search-lead-id mono">{{ item.public_lead_id }}</span>
                  <span class="search-result-title">{{ item.title }}</span>
                </div>
                <span class="search-result-sub">{{ item.subtitle }}</span>
              </div>
              <span class="search-result-badge">{{ item.stage || 'Lead' }}</span>
            </div>
          </div>
        </div>

        <!-- Notification Bell & Dropdown -->
        <div class="notification-wrap">
          <button 
            class="icon-btn" 
            (click)="toggleNotifications()" 
            [class.active]="showNotifications"
            aria-label="View notifications"
          >
            <span class="bell-icon">🔔</span>
            <span class="notif-badge">3</span>
          </button>

          <!-- Dropdown Panel -->
          <div class="notif-dropdown" *ngIf="showNotifications">
            <div class="notif-header">
              <span class="notif-title">AI Sales Intelligence Alerts</span>
              <button class="mark-read-btn" (click)="markAllRead()">Mark read</button>
            </div>

            <div class="notif-list">
              <div 
                *ngFor="let alert of alerts" 
                class="notif-item" 
                [class.unread]="!alert.read"
              >
                <div class="notif-item-icon" [ngClass]="alert.type">
                  <span *ngIf="alert.type === 'hot'">🔥</span>
                  <span *ngIf="alert.type === 'ai'">⚡</span>
                  <span *ngIf="alert.type === 'warning'">⚠️</span>
                </div>
                <div class="notif-content">
                  <div class="notif-item-title">{{ alert.title }}</div>
                  <div class="notif-item-time mono">{{ alert.time }}</div>
                </div>
              </div>
            </div>

            <div class="notif-footer" (click)="goToRecommendations()">
              View all prioritized recommendations →
            </div>
          </div>
        </div>

        <!-- Quick-add Lead Button in Terracotta / Coral -->
        <button class="btn btn-primary btn-sm" (click)="openAddLeadModal()">
          <span>+</span> Add Lead
        </button>

        <!-- User Profile Pill & Dropdown -->
        <div class="user-menu-wrap">
          <button 
            class="header-user-pill" 
            (click)="toggleUserMenu()"
            [attr.aria-label]="'User menu for ' + (authService.currentUser()?.name || 'User')"
          >
            <div class="header-avatar" [class.mgr]="authService.isManager()">
              {{ authService.currentUser()?.avatarText || 'AR' }}
            </div>
            <span class="user-pill-name">{{ authService.currentUser()?.name?.split(' ')?.[0] || 'User' }}</span>
            <span class="dropdown-chevron">▾</span>
          </button>

          <!-- User Menu Dropdown -->
          <div class="user-dropdown-panel" *ngIf="showUserMenu">
            <div class="user-dropdown-header">
              <div class="user-dropdown-avatar" [class.mgr]="authService.isManager()">
                {{ authService.currentUser()?.avatarText || 'AR' }}
              </div>
              <div class="user-dropdown-meta">
                <div class="user-dropdown-name">{{ authService.currentUser()?.name }}</div>
                <div class="user-dropdown-role">{{ authService.currentUser()?.title }}</div>
                <div class="user-dropdown-email">{{ authService.currentUser()?.email }}</div>
              </div>
            </div>

            <div class="user-dropdown-section">
              <div class="dropdown-label">ROLE SIMULATION</div>
              <button 
                class="dropdown-action-btn" 
                (click)="switchRole('salesperson')"
                [class.active-role]="authService.isSalesperson()"
              >
                <span>💼 Sales Representative</span>
                <span class="checkmark" *ngIf="authService.isSalesperson()">✓</span>
              </button>
              <button 
                class="dropdown-action-btn" 
                (click)="switchRole('manager')"
                [class.active-role]="authService.isManager()"
              >
                <span>👑 Sales Manager</span>
                <span class="checkmark" *ngIf="authService.isManager()">✓</span>
              </button>
            </div>

            <div class="user-dropdown-footer">
              <button class="logout-btn" (click)="onSignOut()">
                <span>🚪 Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: var(--header-height);
      background: var(--bg-canvas);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .page-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .live-status-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 9px;
      border-radius: 6px;
      background: var(--color-emerald-bg);
      border: 1px solid var(--color-emerald-border);
      color: #228276;
      font-size: 11px;
      font-weight: 600;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2A9D8F;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-container {
      position: relative;
      width: 300px;
    }

    .search-icon {
      position: absolute;
      left: 11px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: #7B61FF;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 7px 56px 7px 32px;
      color: var(--text-primary);
      font-size: 13px;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
    }
    .search-input:focus {
      outline: none;
      border-color: var(--color-coral);
      box-shadow: 0 0 0 3px rgba(231, 111, 81, 0.12);
      width: 320px;
    }
    .search-input::placeholder {
      color: var(--text-muted);
    }

    .search-shortcut {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 10px;
      font-family: var(--font-mono);
      background: var(--bg-surface);
      padding: 2px 5px;
      border-radius: 4px;
      color: var(--text-secondary);
      pointer-events: none;
      border: 1px solid var(--border-subtle);
    }

    .search-dropdown-panel {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      width: 380px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      z-index: 100;
      overflow: hidden;
      max-height: 360px;
      overflow-y: auto;
    }

    .search-dropdown-header {
      padding: 8px 14px;
      background: var(--bg-surface);
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .search-result-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      cursor: pointer;
      transition: background 0.15s ease;
      border-bottom: 1px solid rgba(0, 0, 0, 0.03);
    }

    .search-result-row:hover {
      background: var(--bg-hover);
    }

    .search-result-main {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .search-lead-id {
      font-size: 10.5px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
      background: rgba(244, 96, 54, 0.1);
      color: #D9481C;
      border: 1px solid rgba(244, 96, 54, 0.25);
      flex-shrink: 0;
    }

    .search-result-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .search-result-sub {
      font-size: 11px;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .search-result-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 12px;
      background: rgba(79, 70, 229, 0.08);
      color: #4F46E5;
      flex-shrink: 0;
    }

    .notification-wrap {
      position: relative;
    }

    .icon-btn {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
    }
    .icon-btn:hover, .icon-btn.active {
      background: var(--bg-card-hover);
      color: var(--text-primary);
      border-color: var(--border-medium);
    }

    .bell-icon {
      font-size: 14px;
    }

    .notif-badge {
      position: absolute;
      top: -3px;
      right: -3px;
      background: #E76F51;
      color: #FFFFFF;
      font-size: 9px;
      font-weight: 700;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--bg-canvas);
    }

    .notif-dropdown {
      position: absolute;
      top: 42px;
      right: 0;
      width: 340px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      box-shadow: var(--shadow-lg);
      z-index: 100;
      animation: fadeIn 150ms ease-out;
      overflow: hidden;
    }

    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-surface);
    }

    .notif-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .mark-read-btn {
      background: transparent;
      border: none;
      color: #E76F51;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }

    .notif-list {
      max-height: 280px;
      overflow-y: auto;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: background var(--transition-fast);
    }
    .notif-item:hover {
      background: var(--bg-card-hover);
    }
    .notif-item.unread {
      background: rgba(231, 111, 81, 0.04);
    }

    .notif-item-icon {
      font-size: 14px;
      margin-top: 1px;
    }

    .notif-item-title {
      font-size: 12px;
      color: var(--text-primary);
      line-height: 1.35;
      font-weight: 500;
    }

    .notif-item-time {
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 3px;
    }

    .notif-footer {
      padding: 10px 16px;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: #E76F51;
      cursor: pointer;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-subtle);
    }
    .notif-footer:hover {
      text-decoration: underline;
    }

    /* User Menu Dropdown */
    .user-menu-wrap {
      position: relative;
    }

    .header-user-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 3px 8px 3px 4px;
      border-radius: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .header-user-pill:hover {
      border-color: var(--border-medium);
      background: var(--bg-card-hover);
    }

    .header-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #DDD8CE;
      color: var(--text-primary);
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-subtle);
    }
    .header-avatar.mgr {
      background: #EFE4D6;
      color: #C84B2E;
      border-color: rgba(231, 111, 81, 0.35);
    }

    .user-pill-name {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .dropdown-chevron {
      font-size: 10px;
      color: var(--text-secondary);
    }

    .user-dropdown-panel {
      position: absolute;
      top: 42px;
      right: 0;
      width: 260px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      z-index: 100;
      animation: fadeIn 150ms ease-out;
      overflow: hidden;
    }

    .user-dropdown-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
    }

    .user-dropdown-avatar {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      background: #DDD8CE;
      color: var(--text-primary);
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }
    .user-dropdown-avatar.mgr {
      background: #EFE4D6;
      color: #C84B2E;
      border-color: rgba(231, 111, 81, 0.4);
    }

    .user-dropdown-meta {
      overflow: hidden;
    }

    .user-dropdown-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .user-dropdown-role {
      font-size: 11px;
      color: #E76F51;
      font-weight: 600;
    }

    .user-dropdown-email {
      font-size: 10px;
      color: var(--text-muted);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .user-dropdown-section {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .dropdown-label {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 6px;
      padding-left: 4px;
    }

    .dropdown-action-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 7px 8px;
      border-radius: 6px;
      background: transparent;
      border: 1px solid transparent;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: left;
    }
    .dropdown-action-btn:hover {
      background: var(--bg-surface);
      border-color: var(--border-subtle);
    }
    .dropdown-action-btn.active-role {
      background: rgba(231, 111, 81, 0.08);
      font-weight: 600;
      color: #C84B2E;
    }

    .checkmark {
      color: #2A9D8F;
      font-weight: 800;
    }

    .user-dropdown-footer {
      padding: 8px 12px;
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 6px;
      background: transparent;
      border: 1px solid rgba(231, 111, 81, 0.3);
      color: #C84B2E;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .logout-btn:hover {
      background: rgba(231, 111, 81, 0.12);
    }

    @media (max-width: 900px) {
      .search-container {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  @Output() addLeadRequested = new EventEmitter<void>();

  private router = inject(Router);
  private leadService = inject(LeadService);
  public authService = inject(AuthService);
  public searchService = inject(SearchService);

  searchQuery = '';
  showSearchDropdown = false;
  showNotifications = false;
  showUserMenu = false;
  currentRouteUrl = '';

  alerts: NotificationAlert[] = [
    {
      id: 'a1',
      title: 'ABC Technologies: CFO reviewed proposal pricing schedule (4 views in 24h)',
      time: '12m ago',
      type: 'hot',
      read: false
    },
    {
      id: 'a2',
      title: '5 enterprise leads requested formal quotations this week',
      time: '1h ago',
      type: 'ai',
      read: false
    },
    {
      id: 'a3',
      title: 'Global Industries: Follow-up email overdue by 72 hours',
      time: '2h ago',
      type: 'warning',
      read: false
    }
  ];

  constructor() {
    this.currentRouteUrl = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRouteUrl = event.urlAfterRedirects || event.url;
    });
  }

  getTitle(): string {
    const url = this.currentRouteUrl;
    if (url === '/' || url === '/dashboard') {
      return this.authService.isManager() ? 'Executive Dashboard' : 'Sales Representative Dashboard';
    } else if (url.startsWith('/leads/')) {
      return 'Lead Intelligence';
    } else if (url.startsWith('/leads')) {
      return this.authService.isManager() ? 'All Leads' : 'My Active Leads';
    } else if (url.startsWith('/pipeline')) {
      return 'Opportunity Pipeline';
    } else if (url.startsWith('/recommendations')) {
      return 'AI Recommendations';
    } else if (url.startsWith('/analytics')) {
      return 'Revenue Intelligence Analytics';
    } else if (url.startsWith('/activity')) {
      return 'Activity Center';
    } else if (url.startsWith('/settings')) {
      return 'Platform Settings';
    }
    return 'LeadIQ';
  }

  onSearchFocus(): void {
    if (this.searchQuery.trim().length >= 2) {
      this.showSearchDropdown = true;
    }
  }

  onSearchChange(query: string): void {
    this.leadService.globalSearchQuery.set(query);
    if (query.trim().length >= 2) {
      this.searchService.performSearch(query);
      this.showSearchDropdown = true;
    } else {
      this.showSearchDropdown = false;
      this.searchService.clearSearch();
    }
  }

  selectSearchResult(item: SearchResultItem): void {
    this.showSearchDropdown = false;
    this.searchQuery = '';
    this.searchService.clearSearch();
    this.router.navigateByUrl(item.url);
  }

  onSearchSubmit(): void {
    this.showSearchDropdown = false;
    if (this.searchQuery.trim()) {
      this.router.navigate(['/leads'], { queryParams: { q: this.searchQuery } });
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.showUserMenu = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) this.showNotifications = false;
  }

  switchRole(role: 'salesperson' | 'manager'): void {
    this.authService.switchRole(role);
    this.showUserMenu = false;
  }

  onSignOut(): void {
    this.showUserMenu = false;
    this.authService.logout();
  }

  markAllRead(): void {
    this.alerts = this.alerts.map(a => ({ ...a, read: true }));
  }

  goToRecommendations(): void {
    this.showNotifications = false;
    this.router.navigate(['/recommendations']);
  }

  openAddLeadModal(): void {
    this.addLeadRequested.emit();
  }
}
