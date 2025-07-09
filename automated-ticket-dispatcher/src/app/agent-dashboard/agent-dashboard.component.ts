import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { TicketService } from '../services/ticket.service';
import { Ticket, TicketStats } from '../models/ticket.model';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="container mt-4">
        <div class="row">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1><i class="fas fa-user-tie text-primary"></i> Agent Dashboard</h1>
                <p class="lead text-muted">Ticket Assignment & Resolution</p>
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
        
        <!-- Agent Statistics -->
        <div class="row mt-4" *ngIf="stats">
          <div class="col-md-3">
            <div class="card text-white bg-info">
              <div class="card-body text-center">
                <i class="fas fa-inbox fa-2x mb-2"></i>
                <h5 class="card-title">Assigned to Me</h5>
                <h2>{{ assignedTickets.length }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-warning">
              <div class="card-body text-center">
                <i class="fas fa-clock fa-2x mb-2"></i>
                <h5 class="card-title">In Progress</h5>
                <h2>{{ getTicketsByStatus('in_progress').length }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-success">
              <div class="card-body text-center">
                <i class="fas fa-check-circle fa-2x mb-2"></i>
                <h5 class="card-title">Resolved Today</h5>
                <h2>{{ resolvedToday }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-danger">
              <div class="card-body text-center">
                <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                <h5 class="card-title">High Priority</h5>
                <h2>{{ getHighPriorityTickets().length }}</h2>
              </div>
            </div>
          </div>
        </div>

        <!-- Agent Actions -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-tasks"></i> Agent Actions</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4">
                    <button class="btn btn-outline-primary btn-lg w-100 mb-3" (click)="showUnassignedTickets = !showUnassignedTickets">
                      <i class="fas fa-plus-circle fa-2x d-block mb-2"></i>
                      {{ showUnassignedTickets ? 'Hide' : 'View' }} Unassigned Tickets
                    </button>
                  </div>
                  <div class="col-md-4">
                    <button class="btn btn-outline-success btn-lg w-100 mb-3" (click)="showMyTickets = !showMyTickets">
                      <i class="fas fa-user-check fa-2x d-block mb-2"></i>
                      {{ showMyTickets ? 'Hide' : 'View' }} My Tickets
                    </button>
                  </div>
                  <div class="col-md-4">
                    <button class="btn btn-outline-info btn-lg w-100 mb-3" (click)="openAgingChartModal()">
                      <i class="fas fa-chart-pie fa-2x d-block mb-2"></i>
                      View Ticket Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Unassigned Tickets -->
        <div class="row mt-4" *ngIf="showUnassignedTickets">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-inbox"></i> Unassigned Tickets Available for Assignment</h5>
              </div>
              <div class="card-body">
                <div *ngIf="isLoading" class="text-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                
                <div *ngIf="!isLoading && unassignedTickets.length === 0" class="text-center text-muted">
                  <i class="fas fa-check-circle fa-3x mb-3 text-success"></i>
                  <h5>No unassigned tickets!</h5>
                  <p>All tickets have been assigned to agents.</p>
                </div>

                <div *ngIf="!isLoading && unassignedTickets.length > 0" class="table-responsive">
                  <table class="table table-striped table-hover">
                    <thead class="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Subject</th>
                        <th>Priority</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let ticket of unassignedTickets">
                        <td><code>{{ ticket._id?.substring(0, 8) }}</code></td>
                        <td>{{ ticket.customer_id?.first_name }} {{ ticket.customer_id?.last_name }}</td>
                        <td>{{ ticket.subject }}</td>
                        <td>
                          <span class="badge" [class]="getPriorityBadgeClass(ticket.priority)">
                            {{ ticket.priority | titlecase }}
                          </span>
                        </td>
                        <td>{{ ticket.created_at | date:'short' }}</td>
                        <td>
                          <button class="btn btn-primary btn-sm" (click)="assignTicketToMe(ticket)">
                            <i class="fas fa-hand-paper"></i> Assign to Me
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- My Assigned Tickets -->
        <div class="row mt-4" *ngIf="showMyTickets">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-user-check"></i> My Assigned Tickets</h5>
              </div>
              <div class="card-body">
                <div *ngIf="isLoading" class="text-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                
                <div *ngIf="!isLoading && assignedTickets.length === 0" class="text-center text-muted">
                  <i class="fas fa-clipboard-list fa-3x mb-3 text-info"></i>
                  <h5>No tickets assigned!</h5>
                  <p>You don't have any tickets assigned to you yet.</p>
                </div>

                <div *ngIf="!isLoading && assignedTickets.length > 0" class="table-responsive">
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
                      <tr *ngFor="let ticket of assignedTickets" [class]="ticket.priority === 'critical' || ticket.priority === 'high' ? 'table-warning' : ''">
                        <td><code>{{ ticket._id?.substring(0, 8) }}</code></td>
                        <td>{{ ticket.customer_id?.first_name }} {{ ticket.customer_id?.last_name }}</td>
                        <td>{{ ticket.subject }}</td>
                        <td>
                          <select class="form-select form-select-sm" 
                                  [(ngModel)]="ticket.status" 
                                  (change)="updateTicketStatus(ticket)">
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="waiting_customer">Waiting Customer</option>
                            <option value="resolved">Resolved</option>
                          </select>
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
                            <button class="btn btn-outline-danger" 
                                    (click)="escalateTicket(ticket)"
                                    [disabled]="ticket.escalated">
                              <i class="fas fa-exclamation-triangle"></i>
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

        <!-- Messages -->
        <div *ngIf="message" class="alert mt-3" [class]="messageType === 'success' ? 'alert-success' : 'alert-danger'">
          <i class="fas" [class]="messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'"></i>
          {{ message }}
        </div>

        <!-- Aging Chart Modal -->
        <div class="modal fade show" [style.display]="showAgingChartModal ? 'block' : 'none'" tabindex="-1" *ngIf="showAgingChartModal && agingData">
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-chart-pie"></i> Ticket Aging Analytics
                </h5>
                <button type="button" class="btn-close" (click)="closeAgingChartModal()"></button>
              </div>
              <div class="modal-body">
                <div class="row mb-3">
                  <div class="col-12">
                    <div class="alert alert-info">
                      <strong>Ticket Analytics:</strong> This pie chart shows the aging distribution of tickets you can work on.
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
export class AgentDashboardComponent implements OnInit {
  stats: TicketStats | null = null;
  agingData: any = null;
  assignedTickets: Ticket[] = [];
  unassignedTickets: Ticket[] = [];
  resolvedToday = 0;
  isLoading = false;
  showMyTickets = true;
  showUnassignedTickets = false;
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
    this.loadAssignedTickets();
    this.loadUnassignedTickets();
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

  loadAssignedTickets() {
    // For now, we'll simulate assigned tickets
    // In a real implementation, this would filter by assigned agent ID
    this.ticketService.getAllTickets().subscribe({
      next: (response) => {
        // Mock: assign some tickets to this agent
        this.assignedTickets = response.tickets.slice(0, Math.ceil(response.tickets.length / 2));
        this.calculateResolvedToday();
      },
      error: (error) => {
        this.showMessage('Error loading assigned tickets: ' + error.error?.message, 'error');
      }
    });
  }

  loadUnassignedTickets() {
    // Mock: Show remaining tickets as unassigned
    this.ticketService.getAllTickets().subscribe({
      next: (response) => {
        this.unassignedTickets = response.tickets
          .filter(ticket => ticket.status === 'new')
          .slice(0, 3); // Show only first 3 for demo
      },
      error: (error) => {
        console.error('Error loading unassigned tickets:', error);
      }
    });
  }

  calculateResolvedToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.resolvedToday = this.assignedTickets.filter(ticket => {
      if (ticket.status === 'resolved' && ticket.updated_at) {
        const ticketDate = new Date(ticket.updated_at);
        ticketDate.setHours(0, 0, 0, 0);
        return ticketDate.getTime() === today.getTime();
      }
      return false;
    }).length;
  }

  getTicketsByStatus(status: string): Ticket[] {
    return this.assignedTickets.filter(ticket => ticket.status === status);
  }

  getHighPriorityTickets(): Ticket[] {
    return this.assignedTickets.filter(ticket => 
      ticket.priority === 'high' || ticket.priority === 'critical'
    );
  }

  assignTicketToMe(ticket: Ticket) {
    if (ticket._id) {
      // Update ticket status to assigned
      this.ticketService.updateTicket(ticket._id, { status: 'assigned' }).subscribe({
        next: (response) => {
          this.showMessage('Ticket assigned to you successfully!', 'success');
          this.loadDashboardData(); // Refresh data
        },
        error: (error) => {
          this.showMessage('Error assigning ticket: ' + error.error?.message, 'error');
        }
      });
    }
  }

  updateTicketStatus(ticket: Ticket) {
    if (ticket._id) {
      this.ticketService.updateTicket(ticket._id, { status: ticket.status }).subscribe({
        next: (response) => {
          this.showMessage('Ticket status updated successfully!', 'success');
          this.calculateResolvedToday();
        },
        error: (error) => {
          this.showMessage('Error updating ticket status: ' + error.error?.message, 'error');
        }
      });
    }
  }

  viewTicket(ticket: Ticket) {
    this.showMessage('Viewing ticket: ' + ticket.subject, 'success');
  }

  editTicket(ticket: Ticket) {
    this.showMessage('Editing ticket: ' + ticket.subject, 'success');
  }

  escalateTicket(ticket: Ticket) {
    const reason = prompt('Please provide escalation reason:');
    if (reason && ticket._id) {
      this.ticketService.escalateTicket(ticket._id, { escalation_reason: reason }).subscribe({
        next: (response) => {
          this.showMessage('Ticket escalated successfully', 'success');
          this.loadDashboardData();
        },
        error: (error) => {
          this.showMessage('Error escalating ticket: ' + error.error?.message, 'error');
        }
      });
    }
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
    if (!canvas) return;

    if (this.agingChart) {
      this.agingChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx || typeof (window as any).Chart === 'undefined') return;

    const Chart = (window as any).Chart;
    const agingRanges = this.getAgingRanges();
    const labels = agingRanges.map(range => range.label);
    const data: number[] = agingRanges.map(range => range.count as number);
    const backgroundColors = ['#28a745', '#ffc107', '#fd7e14', '#dc3545'];

    this.agingChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tickets by Age',
          data: data,
          backgroundColor: backgroundColors.slice(0, data.length),
          borderColor: '#ffffff',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Ticket Age Distribution',
            font: { size: 18, weight: 'bold' },
            padding: 20
          },
          legend: {
            display: true,
            position: 'right'
          }
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
