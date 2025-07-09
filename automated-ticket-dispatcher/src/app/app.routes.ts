import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AgentDashboardComponent } from './agent-dashboard/agent-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { authGuard, adminGuard, agentGuard, loginGuard } from './auth/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [loginGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'agent-dashboard', 
    component: AgentDashboardComponent,
    canActivate: [agentGuard]
  },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent,
    canActivate: [adminGuard]
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];