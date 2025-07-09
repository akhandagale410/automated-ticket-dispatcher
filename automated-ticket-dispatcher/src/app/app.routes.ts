import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AgentDashboardComponent } from './agent-dashboard/agent-dashboard.component';

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent
  },
  { 
    path: 'login', 
    component: LoginComponent
  },
  { 
    path: 'register', 
    component: RegisterComponent
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent
  },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent
  },
  { 
    path: 'agent-dashboard', 
    component: AgentDashboardComponent
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];