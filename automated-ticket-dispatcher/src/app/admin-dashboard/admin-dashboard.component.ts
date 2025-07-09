import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { TicketService } from '../services/ticket.service';
import { Ticket, TicketStats } from '../models/ticket.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="container mt-4">
        <div class="row">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1><i class="fas fa-shield-alt text-danger"></i> Admin Dashboard</h1>
                <p class="lead text-muted">System Administration & Oversight</p>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary" (click)="loadDashboardData()">
                  <i class="fas fa-refresh"></i> Refresh
                </button>
                <button class="btn btn-danger" (click)="logout()">
                  <i class="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Admin Statistics Overview -->
        <div class="row mt-4" *ngIf="stats">
          <div class="col-md-2">
            <div class="card text-white bg-primary">
              <div class="card-body text-center">
                <i class="fas fa-ticket-alt fa-2x mb-2"></i>
                <h5 class="card-title">Total Tickets</h5>
                <h2>{{ stats.totalTickets }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="card text-white bg-success">
              <div class="card-body text-center">
                <i class="fas fa-check-circle fa-2x mb-2"></i>
                <h5 class="card-title">Resolved</h5>
                <h2>{{ stats.statusCounts['resolved'] || 0 }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="card text-white bg-warning">
              <div class="card-body text-center">
                <i class="fas fa-clock fa-2x mb-2"></i>
                <h5 class="card-title">In Progress</h5>
                <h2>{{ stats.statusCounts['in_progress'] || 0 }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="card text-white bg-danger">
              <div class="card-body text-center">
                <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                <h5 class="card-title">Escalated</h5>
                <h2>{{ stats.escalatedTickets }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="card text-white bg-info">
              <div class="card-body text-center">
                <i class="fas fa-users fa-2x mb-2"></i>
                <h5 class="card-title">Total Users</h5>
                <h2>{{ userStats.totalUsers || 0 }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="card text-white bg-dark">
              <div class="card-body text-center">
                <i class="fas fa-user-tie fa-2x mb-2"></i>
                <h5 class="card-title">Agents</h5>
                <h2>{{ userStats.agentCount || 0 }}</h2>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Actions -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-tools"></i> Administrative Actions</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3">
                    <button class="btn btn-outline-primary btn-lg w-100 mb-3" (click)="openAgingChartModal()">
                      <i class="fas fa-chart-pie fa-2x d-block mb-2"></i>
                      View System Analytics
                    </button>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-success btn-lg w-100 mb-3" (click)="showAllTickets = !showAllTickets">
                      <i class="fas fa-list fa-2x d-block mb-2"></i>
                      {{ showAllTickets ? 'Hide' : 'View' }} All Tickets
                    </button>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-warning btn-lg w-100 mb-3" (click)="showUserManagement = !showUserManagement">
                      <i class="fas fa-users-cog fa-2x d-block mb-2"></i>
                      User Management
                    </button>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-info btn-lg w-100 mb-3" (click)="generateReport()">
                      <i class="fas fa-file-download fa-2x d-block mb-2"></i>
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- All Tickets Management -->
        <div class="row mt-4" *ngIf="showAllTickets">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-ticket-alt"></i> All System Tickets</h5>
              </div>
              <div class="card-body">
                <div *ngIf="isLoading" class="text-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                
                <div *ngIf="!isLoading && allTickets.length === 0" class="text-center text-muted">
                  No tickets found in the system.
                </div>

                <div *ngIf="!isLoading && allTickets.length > 0" class="table-responsive">
                  <table class="table table-striped table-hover">
                    <thead class="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let ticket of allTickets">
                        <td><code>{{ ticket._id?.substring(0, 8) }}</code></td>
                        <td>{{ ticket.customer_id?.first_name }} {{ ticket.customer_id?.last_name }}</td>
                        <td>{{ ticket.subject }}</td>
                        <td>
                          <span class="badge" [class]="getStatusBadgeClass(ticket.status)">
                            {{ ticket.status | titlecase }}
                          </span>
                        </td>
                        <td>
                          <span class="badge" [class]="getPriorityBadgeClass(ticket.priority)">
                            {{ ticket.priority | titlecase }}
                          </span>
                        </td>
                        <td>{{ ticket.created_at | date:'short' }}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" (click)="viewTicket(ticket)">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning" (click)="editTicket(ticket)">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger" (click)="deleteTicket(ticket)">
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Management -->
        <div class="row mt-4" *ngIf="showUserManagement">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-users-cog"></i> User Management</h5>
              </div>
              <div class="card-body">
                <div class="alert alert-info">
                  <i class="fas fa-info-circle"></i>
                  <strong>User Management:</strong> This section would allow you to manage users, assign roles, and monitor user activity.
                  <br><small>Feature coming soon - Add user creation, role assignment, and user activity monitoring.</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div *ngIf="message" class="alert mt-3" [class]="messageType === 'success' ? 'alert-success' : 'alert-danger'">
          <i class="fas" [class]="messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'"></i>
          {{ message }}
        </div>

        <!-- Aging Chart Modal (reusing from customer dashboard) -->
        <div class="modal fade show" [style.display]="showAgingChartModal ? 'block' : 'none'" tabindex="-1" *ngIf="showAgingChartModal && agingData">
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-chart-pie"></i> System-wide Ticket Aging Analytics
                </h5>
                <button type="button" class="btn-close" (click)="closeAgingChartModal()"></button>
              </div>
              <div class="modal-body">
                <div class="row mb-3">
                  <div class="col-12">
                    <div class="alert alert-info">
                      <strong>System Analytics:</strong> This pie chart shows the distribution of all tickets in the system by age ranges.
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-12 d-flex justify-content-center">
                    <div style="position: relative; height: 500px; width: 100%; max-width: 800px;">
                      <canvas id="agingChart"></canvas>
                    </div>
                  </div>
                </div>
                <div class="row mt-4">
                  <div class="col-md-3" *ngFor="let range of getAgingRanges()">
                    <div class="card text-center">
                      <div class="card-body">
                        <h6 class="card-title">{{ range.label }}</h6>
                        <h4 class="text-primary">{{ range.count }}</h4>
                        <small class="text-muted">tickets</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeAgingChartModal()">Close</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-backdrop fade show" *ngIf="showAgingChartModal" (click)="closeAgingChartModal()"></div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: TicketStats | null = null;
  agingData: any = null;
  allTickets: Ticket[] = [];
  userStats: any = { totalUsers: 0, agentCount: 0, customerCount: 0 };
  isLoading = false;
  showAllTickets = false;
  showUserManagement = false;
  showAgingChartModal = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  // Chart instance
  private agingChart: any = null;

  constructor(
    private authService: AuthService,
    private ticketService: TicketService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loadStats();
    this.loadAgingData();
    this.loadAllTickets();
    this.loadUserStats();
  }

  loadStats() {
    this.ticketService.getTicketStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  loadAgingData() {
    this.ticketService.getTicketAging().subscribe({
      next: (data) => {
        this.agingData = data;
      },
      error: (error) => {
        console.error('Error loading aging data:', error);
      }
    });
  }

  loadAllTickets() {
    this.isLoading = true;
    this.ticketService.getAllTickets().subscribe({
      next: (response) => {
        this.allTickets = response.tickets;
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage('Error loading tickets: ' + error.error?.message, 'error');
        this.isLoading = false;
      }
    });
  }

  loadUserStats() {
    // This would need a new backend endpoint to get user statistics
    // For now, we'll use mock data
    this.userStats = {
      totalUsers: 25,
      agentCount: 5,
      customerCount: 20
    };
  }

  viewTicket(ticket: Ticket) {
    // Implement view ticket functionality
    this.showMessage('Viewing ticket: ' + ticket.subject, 'success');
  }

  editTicket(ticket: Ticket) {
    // Implement edit ticket functionality
    this.showMessage('Editing ticket: ' + ticket.subject, 'success');
  }

  deleteTicket(ticket: Ticket) {
    if (confirm(`Are you sure you want to delete ticket: ${ticket.subject}?`) && ticket._id) {
      this.ticketService.deleteTicket(ticket._id).subscribe({
        next: (response) => {
          this.showMessage('Ticket deleted successfully', 'success');
          this.loadAllTickets();
        },
        error: (error) => {
          this.showMessage('Error deleting ticket: ' + error.error?.message, 'error');
        }
      });
    }
  }

  generateReport() {
    this.showMessage('Report generation feature coming soon!', 'success');
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'new': 'bg-primary',
      'assigned': 'bg-info',
      'in_progress': 'bg-warning',
      'waiting_customer': 'bg-secondary',
      'resolved': 'bg-success',
      'closed': 'bg-dark'
    };
    return classes[status] || 'bg-secondary';
  }

  getPriorityBadgeClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'low': 'bg-success',
      'medium': 'bg-warning',
      'high': 'bg-danger',
      'critical': 'bg-dark'
    };
    return classes[priority] || 'bg-secondary';
  }

  getAgingRanges() {
    if (!this.agingData) return [];
    
    return Object.entries(this.agingData.ageRanges).map(([label, count]) => ({
      label,
      count
    }));
  }

  openAgingChartModal() {
    if (!this.agingData) {
      this.showMessage('No aging data available', 'error');
      return;
    }
    
    this.showAgingChartModal = true;
    document.body.classList.add('modal-open');
    
    setTimeout(() => {
      this.createAgingChart();
    }, 300);
  }

  closeAgingChartModal() {
    this.showAgingChartModal = false;
    document.body.classList.remove('modal-open');
    
    if (this.agingChart) {
      this.agingChart.destroy();
      this.agingChart = null;
    }
  }

  createAgingChart() {
    const canvas = document.getElementById('agingChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Chart canvas not found');
      return;
    }

    if (this.agingChart) {
      this.agingChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context from canvas');
      return;
    }

    if (typeof (window as any).Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      this.showMessage('Chart.js library is not available', 'error');
      return;
    }

    const Chart = (window as any).Chart;

    const agingRanges = this.getAgingRanges();
    const labels = agingRanges.map(range => range.label);
    const data: number[] = agingRanges.map(range => range.count as number);
    
    const backgroundColors = [
      '#28a745', '#ffc107', '#fd7e14', '#dc3545'
    ];

    this.agingChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tickets by Age',
          data: data,
          backgroundColor: backgroundColors.slice(0, data.length),
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 4,
          hoverBorderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'System-wide Ticket Age Distribution',
            font: { size: 18, weight: 'bold' },
            padding: 20,
            color: '#333'
          },
          legend: {
            display: true,
            position: 'right',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: { size: 14 },
              generateLabels: function(chart: any) {
                const original = Chart.defaults.plugins.legend.labels.generateLabels;
                const labels = original.call(this, chart);
                const totalTickets = data.reduce((a: number, b: number) => a + b, 0);
                
                labels.forEach((label: any, index: number) => {
                  const count = data[index];
                  const percentage = totalTickets > 0 ? ((count / totalTickets) * 100).toFixed(1) : '0';
                  label.text = `${label.text}: ${count} (${percentage}%)`;
                });
                
                return labels;
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const count = context.parsed;
                const totalTickets = data.reduce((a: number, b: number) => a + b, 0);
                const percentage = totalTickets > 0 ? ((count / totalTickets) * 100).toFixed(1) : '0';
                const label = context.label || '';
                return `${label}: ${count} tickets (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1500,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  showMessage(message: string, type: 'success' | 'error') {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  logout() {
    this.authService.logout();
  }
}
