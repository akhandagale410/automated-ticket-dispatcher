import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { TicketService } from '../services/ticket.service';
import { Ticket, TicketStats } from '../models/ticket.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="container mt-4">
        <div class="row">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h1>Customer Ticket Dashboard</h1>
              <button class="btn btn-danger" (click)="logout()">
                Logout
              </button>
            </div>
            <p class="lead">Manage your support tickets efficiently.</p>
          </div>
        </div>
        
        <!-- Statistics Cards -->
        <div class="row mt-4" *ngIf="stats">
          <div class="col-md-3">
            <div class="card text-white bg-primary">
              <div class="card-body">
                <h5 class="card-title">Total Tickets</h5>
                <h2>{{ stats.totalTickets }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-success">
              <div class="card-body">
                <h5 class="card-title">Resolved</h5>
                <h2>{{ stats.statusCounts['resolved'] || 0 }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-warning">
              <div class="card-body">
                <h5 class="card-title">In Progress</h5>
                <h2>{{ stats.statusCounts['in_progress'] || 0 }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-danger">
              <div class="card-body">
                <h5 class="card-title">Escalated</h5>
                <h2>{{ stats.escalatedTickets }}</h2>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="d-flex gap-3 mb-4">
              <button class="btn btn-primary" (click)="showCreateTicket = true">
                <i class="fas fa-plus"></i> Create New Ticket
              </button>
              <button class="btn btn-info" (click)="loadTickets()">
                <i class="fas fa-refresh"></i> Refresh
              </button>
              <button class="btn btn-secondary" (click)="openAgingChartModal()">
                <i class="fas fa-chart-line"></i> View Aging Chart
              </button>
            </div>
          </div>
        </div>

        <!-- Create Ticket Form -->
        <div class="row mt-4" *ngIf="showCreateTicket">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5>Create New Ticket</h5>
              </div>
              <div class="card-body">
                <form (ngSubmit)="createTicket()">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label for="subject" class="form-label">Subject *</label>
                        <input type="text" class="form-control" id="subject" 
                               [(ngModel)]="newTicket.subject" name="subject" required>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label for="category" class="form-label">Category</label>
                        <input type="text" class="form-control" id="category" 
                               [(ngModel)]="newTicket.category" name="category">
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="description" class="form-label">Description *</label>
                    <textarea class="form-control" id="description" rows="4" 
                              [(ngModel)]="newTicket.description" name="description" required></textarea>
                  </div>
                  <div class="row">
                    <div class="col-md-3">
                      <div class="mb-3">
                        <label for="priority" class="form-label">Priority</label>
                        <select class="form-control" id="priority" 
                                [(ngModel)]="newTicket.priority" name="priority">
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="mb-3">
                        <label for="type" class="form-label">Type</label>
                        <select class="form-control" id="type" 
                                [(ngModel)]="newTicket.type" name="type">
                          <option value="incident">Incident</option>
                          <option value="request">Request</option>
                          <option value="problem">Problem</option>
                          <option value="change">Change</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="mb-3">
                        <label for="severity" class="form-label">Severity</label>
                        <select class="form-control" id="severity" 
                                [(ngModel)]="newTicket.severity" name="severity">
                          <option value="minor">Minor</option>
                          <option value="major">Major</option>
                          <option value="critical">Critical</option>
                          <option value="blocker">Blocker</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="mb-3">
                        <label for="complexity" class="form-label">Complexity</label>
                        <select class="form-control" id="complexity" 
                                [(ngModel)]="newTicket.complexity" name="complexity">
                          <option value="simple">Simple</option>
                          <option value="moderate">Moderate</option>
                          <option value="complex">Complex</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary" [disabled]="isLoading">
                      {{ isLoading ? 'Creating...' : 'Create Ticket' }}
                    </button>
                    <button type="button" class="btn btn-secondary" (click)="cancelCreate()">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Tickets List -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5>My Tickets</h5>
              </div>
              <div class="card-body">
                <div *ngIf="isLoading" class="text-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                
                <div *ngIf="!isLoading && tickets.length === 0" class="text-center text-muted">
                  No tickets found. Create your first ticket!
                </div>

                <div *ngIf="!isLoading && tickets.length > 0" class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let ticket of tickets">
                        <td>{{ ticket._id?.substring(0, 8) }}</td>
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
                              View
                            </button>
                            <button class="btn btn-outline-warning" 
                                    (click)="editTicket(ticket)"
                                    [disabled]="ticket.status === 'closed'">
                              Edit
                            </button>
                            <button class="btn btn-outline-danger" 
                                    (click)="escalateTicket(ticket)"
                                    [disabled]="ticket.escalated || ticket.status === 'closed' || ticket.status === 'resolved'">
                              Escalate
                            </button>
                            <button class="btn btn-outline-danger" 
                                    (click)="deleteTicket(ticket)">
                              Delete
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

        <!-- Aging Chart Modal -->
        <div class="modal fade show" [style.display]="showAgingChartModal ? 'block' : 'none'" tabindex="-1" *ngIf="showAgingChartModal && agingData">
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-chart-line"></i> Ticket Aging Distribution Chart
                </h5>
                <button type="button" class="btn-close" (click)="closeAgingChartModal()"></button>
              </div>
              <div class="modal-body">
                <div class="row mb-3">
                  <div class="col-12">
                    <div class="alert alert-info">
                      <strong>Chart Information:</strong> This pie chart shows the distribution of tickets by age ranges. Hover over sections for detailed information.
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

        <!-- Messages -->
        <div *ngIf="message" class="alert" [class]="messageType === 'success' ? 'alert-success' : 'alert-danger'">
          {{ message }}
        </div>

        <!-- View Ticket Modal -->
        <div class="modal fade show" [style.display]="showViewModal ? 'block' : 'none'" tabindex="-1" *ngIf="selectedTicket && showViewModal">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Ticket Details</h5>
                <button type="button" class="btn-close" (click)="closeViewModal()"></button>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-md-6">
                    <strong>Ticket ID:</strong> {{ selectedTicket._id?.substring(0, 8) }}
                  </div>
                  <div class="col-md-6">
                    <strong>Created:</strong> {{ selectedTicket.created_at | date:'medium' }}
                  </div>
                </div>
                <hr>
                <div class="row">
                  <div class="col-12">
                    <strong>Subject:</strong>
                    <p>{{ selectedTicket.subject }}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-12">
                    <strong>Description:</strong>
                    <p>{{ selectedTicket.description }}</p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-3">
                    <strong>Status:</strong>
                    <span class="badge" [class]="getStatusBadgeClass(selectedTicket.status)">
                      {{ selectedTicket.status | titlecase }}
                    </span>
                  </div>
                  <div class="col-md-3">
                    <strong>Priority:</strong>
                    <span class="badge" [class]="getPriorityBadgeClass(selectedTicket.priority)">
                      {{ selectedTicket.priority | titlecase }}
                    </span>
                  </div>
                  <div class="col-md-3">
                    <strong>Type:</strong>
                    <span class="badge bg-info">{{ selectedTicket.type | titlecase }}</span>
                  </div>
                  <div class="col-md-3">
                    <strong>Severity:</strong>
                    <span class="badge bg-warning">{{ selectedTicket.severity | titlecase }}</span>
                  </div>
                </div>
                <hr>
                <div class="row">
                  <div class="col-md-6">
                    <strong>Category:</strong> {{ selectedTicket.category || 'N/A' }}
                  </div>
                  <div class="col-md-6">
                    <strong>Complexity:</strong> {{ selectedTicket.complexity | titlecase }}
                  </div>
                </div>
                <div class="row" *ngIf="selectedTicket.escalated">
                  <div class="col-12">
                    <div class="alert alert-warning">
                      <strong>🚨 Escalated Ticket</strong>
                      <p>Reason: {{ selectedTicket.escalation_reason }}</p>
                    </div>
                  </div>
                </div>
                <div class="row" *ngIf="selectedTicket.tags && selectedTicket.tags.length > 0">
                  <div class="col-12">
                    <strong>Tags:</strong>
                    <span class="badge bg-secondary me-1" *ngFor="let tag of selectedTicket.tags">{{ tag }}</span>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeViewModal()">Close</button>
                <button type="button" class="btn btn-warning" 
                        (click)="editTicketFromView(selectedTicket)" 
                        [disabled]="selectedTicket.status === 'closed'">
                  Edit Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-backdrop fade show" *ngIf="showViewModal" (click)="closeViewModal()"></div>

        <!-- Edit Ticket Modal -->
        <div class="modal fade show" [style.display]="showEditModal ? 'block' : 'none'" tabindex="-1" *ngIf="editingTicket && showEditModal">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Edit Ticket</h5>
                <button type="button" class="btn-close" (click)="closeEditModal()"></button>
              </div>
              <div class="modal-body">
                <form (ngSubmit)="updateTicket()">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label for="editSubject" class="form-label">Subject *</label>
                        <input type="text" class="form-control" id="editSubject" 
                               [(ngModel)]="editingTicket.subject" name="editSubject" required>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label for="editCategory" class="form-label">Category</label>
                        <input type="text" class="form-control" id="editCategory" 
                               [(ngModel)]="editingTicket.category" name="editCategory">
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="editDescription" class="form-label">Description *</label>
                    <textarea class="form-control" id="editDescription" rows="4" 
                              [(ngModel)]="editingTicket.description" name="editDescription" required></textarea>
                  </div>
                  <div class="row">
                    <div class="col-md-3">
                      <div class="mb-3">
                        <label for="editPriority" class="form-label">Priority</label>
                        <select class="form-control" id="editPriority" 
                                [(ngModel)]="editingTicket.priority" name="editPriority">
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="mb-3">
                        <label for="editType" class="form-label">Type</label>
                        <select class="form-control" id="editType" 
                                [(ngModel)]="editingTicket.type" name="editType">
                          <option value="incident">Incident</option>
                          <option value="request">Request</option>
                          <option value="problem">Problem</option>
                          <option value="change">Change</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="mb-3">
                        <label for="editSeverity" class="form-label">Severity</label>
                        <select class="form-control" id="editSeverity" 
                                [(ngModel)]="editingTicket.severity" name="editSeverity">
                          <option value="minor">Minor</option>
                          <option value="major">Major</option>
                          <option value="critical">Critical</option>
                          <option value="blocker">Blocker</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="mb-3">
                        <label for="editComplexity" class="form-label">Complexity</label>
                        <select class="form-control" id="editComplexity" 
                                [(ngModel)]="editingTicket.complexity" name="editComplexity">
                          <option value="simple">Simple</option>
                          <option value="moderate">Moderate</option>
                          <option value="complex">Complex</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label for="editDomain" class="form-label">Domain</label>
                        <input type="text" class="form-control" id="editDomain" 
                               [(ngModel)]="editingTicket.domain" name="editDomain">
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label for="editProduct" class="form-label">Product</label>
                        <input type="text" class="form-control" id="editProduct" 
                               [(ngModel)]="editingTicket.product" name="editProduct">
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeEditModal()">Cancel</button>
                <button type="button" class="btn btn-primary" (click)="updateTicket()" [disabled]="isLoading">
                  {{ isLoading ? 'Updating...' : 'Update Ticket' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-backdrop fade show" *ngIf="showEditModal" (click)="closeEditModal()"></div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  tickets: Ticket[] = [];
  stats: TicketStats | null = null;
  agingData: any = null;
  isLoading = false;
  showCreateTicket = false;
  showAgingChart = false;
  showAgingChartModal = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  // Modal properties
  selectedTicket: Ticket | null = null;
  editingTicket: any = null;
  showViewModal = false;
  showEditModal = false;

  // Chart instance
  private agingChart: any = null;

  newTicket: any = {
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
    type: 'incident',
    severity: 'minor',
    complexity: 'moderate'
  };

  constructor(
    private authService: AuthService,
    private ticketService: TicketService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user should be redirected to agent dashboard
    const user = this.authService.getCurrentUser();
    if (user && (user.role === 'agent' || user.role === 'admin')) {
      this.router.navigate(['/agent-dashboard']);
      return;
    }
    
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loadTickets();
    this.loadStats();
    this.loadAgingData();
  }

  loadTickets() {
    this.isLoading = true;
    this.ticketService.getAllTickets().subscribe({
      next: (response) => {
        this.tickets = response.tickets;
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage('Error loading tickets: ' + error.error?.message, 'error');
        this.isLoading = false;
      }
    });
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

  createTicket() {
    if (!this.newTicket.subject || !this.newTicket.description) {
      this.showMessage('Subject and description are required', 'error');
      return;
    }

    this.isLoading = true;
    this.ticketService.createTicket(this.newTicket).subscribe({
      next: (response) => {
        this.showMessage('Ticket created successfully', 'success');
        this.loadDashboardData();
        this.cancelCreate();
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage('Error creating ticket: ' + error.error?.message, 'error');
        this.isLoading = false;
      }
    });
  }

  cancelCreate() {
    this.showCreateTicket = false;
    this.newTicket = {
      subject: '',
      description: '',
      category: '',
      priority: 'medium',
      type: 'incident',
      severity: 'minor',
      complexity: 'moderate'
    };
  }

  viewTicket(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.showViewModal = true;
    // Prevent body scroll when modal is open
    document.body.classList.add('modal-open');
  }

  editTicket(ticket: Ticket) {
    this.editingTicket = { ...ticket }; // Create a copy for editing
    this.showEditModal = true;
    // Prevent body scroll when modal is open
    document.body.classList.add('modal-open');
  }

  editTicketFromView(ticket: Ticket) {
    this.closeViewModal();
    setTimeout(() => {
      this.editTicket(ticket);
    }, 300); // Wait for view modal to close
  }

  closeViewModal() {
    this.selectedTicket = null;
    this.showViewModal = false;
    // Restore body scroll
    document.body.classList.remove('modal-open');
  }

  closeEditModal() {
    this.editingTicket = null;
    this.showEditModal = false;
    // Restore body scroll
    document.body.classList.remove('modal-open');
  }

  updateTicket() {
    if (!this.editingTicket || !this.editingTicket._id) {
      this.showMessage('No ticket selected for editing', 'error');
      return;
    }

    if (!this.editingTicket.subject || !this.editingTicket.description) {
      this.showMessage('Subject and description are required', 'error');
      return;
    }

    this.isLoading = true;
    const updateData = {
      subject: this.editingTicket.subject,
      description: this.editingTicket.description,
      category: this.editingTicket.category,
      priority: this.editingTicket.priority,
      type: this.editingTicket.type,
      severity: this.editingTicket.severity,
      complexity: this.editingTicket.complexity,
      domain: this.editingTicket.domain,
      product: this.editingTicket.product
    };

    this.ticketService.updateTicket(this.editingTicket._id, updateData).subscribe({
      next: (response) => {
        this.showMessage('Ticket updated successfully', 'success');
        this.loadDashboardData();
        this.closeEditModal();
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage('Error updating ticket: ' + error.error?.message, 'error');
        this.isLoading = false;
      }
    });
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

  deleteTicket(ticket: Ticket) {
    if (confirm(`Are you sure you want to delete ticket: ${ticket.subject}?`) && ticket._id) {
      this.ticketService.deleteTicket(ticket._id).subscribe({
        next: (response) => {
          this.showMessage('Ticket deleted successfully', 'success');
          this.loadDashboardData();
        },
        error: (error) => {
          this.showMessage('Error deleting ticket: ' + error.error?.message, 'error');
        }
      });
    }
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
    
    // Delay chart creation to ensure modal is rendered
    setTimeout(() => {
      this.createAgingChart();
    }, 300);
  }

  closeAgingChartModal() {
    this.showAgingChartModal = false;
    document.body.classList.remove('modal-open');
    
    // Destroy existing chart
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

    // Destroy existing chart if it exists
    if (this.agingChart) {
      this.agingChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context from canvas');
      return;
    }

    // Check if Chart is available globally
    if (typeof (window as any).Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      this.showMessage('Chart.js library is not available', 'error');
      return;
    }

    const Chart = (window as any).Chart;

    // Prepare data for the chart
    const agingRanges = this.getAgingRanges();
    const labels = agingRanges.map(range => range.label);
    const data: number[] = agingRanges.map(range => range.count as number);
    
    // Color scheme for the chart
    const backgroundColors = [
      '#28a745', // Green for 0-7 days
      '#ffc107', // Yellow for 8-30 days  
      '#fd7e14', // Orange for 31-90 days
      '#dc3545'  // Red for 90+ days
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
            text: 'Ticket Distribution by Age Ranges',
            font: {
              size: 18,
              weight: 'bold'
            },
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
              font: {
                size: 14
              },
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
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffffff',
            borderWidth: 1,
            cornerRadius: 6,
            displayColors: true,
            padding: 12
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1500,
          easing: 'easeInOutQuart'
        },
        interaction: {
          intersect: false,
          mode: 'nearest'
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
