import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './core/layout/sidebar/sidebar.component';
import { HeaderComponent } from './core/layout/header/header.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AddLeadModalComponent } from './shared/components/add-lead-modal/add-lead-modal.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    SidebarComponent, 
    HeaderComponent, 
    ToastComponent, 
    AddLeadModalComponent
  ],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  authService = inject(AuthService);
  sidebarCollapsed = signal<boolean>(false);
  showAddLeadModal = signal<boolean>(false);

  toggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }

  openAddLeadModal(): void {
    this.showAddLeadModal.set(true);
  }

  closeAddLeadModal(): void {
    this.showAddLeadModal.set(false);
  }
}
