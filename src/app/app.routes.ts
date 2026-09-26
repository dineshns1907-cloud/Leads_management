import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LeadsComponent } from './features/leads/leads.component';
import { LeadDetailComponent } from './features/lead-detail/lead-detail.component';
import { PipelineComponent } from './features/pipeline/pipeline.component';
import { RecommendationsComponent } from './features/recommendations/recommendations.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { ActivityComponent } from './features/activity/activity.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ReferralsComponent } from './features/referrals/referrals.component';
import { AdminLoginComponent } from './features/admin/admin-login.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { authGuard, loginGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'leads', component: LeadsComponent, canActivate: [authGuard] },
  { path: 'leads/:id', component: LeadDetailComponent, canActivate: [authGuard] },
  { path: 'pipeline', component: PipelineComponent, canActivate: [authGuard] },
  { path: 'recommendations', component: RecommendationsComponent, canActivate: [authGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [authGuard] },
  { path: 'activity', component: ActivityComponent, canActivate: [authGuard] },
  { path: 'referrals', component: ReferralsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [roleGuard(['admin'])] },
  { path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
