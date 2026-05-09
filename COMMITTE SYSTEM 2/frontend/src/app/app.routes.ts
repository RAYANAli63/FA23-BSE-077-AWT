import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { MemberLoginComponent } from './pages/member-login/member-login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { MemberDashboardComponent } from './pages/member-dashboard/member-dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'member/login', component: MemberLoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'member/dashboard', component: MemberDashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
