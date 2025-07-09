import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { TicketService } from '../services/ticket.service';
import { Ticket, AgentWorkload } from '../models/ticket.model';

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
                <h1><i class="fas fa-user-shield text-primary"></i> Admin Dashboard</h1>
                <p class="lead text-muted">System Administration & Ticket Management</p>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary" (click)="loadDashboardData()">
                  <i class="fas fa-refresh"></i> Refresh
                </button>
                <button class="btn btn-outline-success" (click)="exportReport()">
                  <i class="fas fa-file-export"></i> Export Report
                </button>
                <button class="btn btn-danger" (click)="logout()">
                  <i class="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Admin Statistics -->
        <div class="row mt-4" *ngIf="stats">
          <div class="col-md-3">
            <div class="card text-white bg-primary">
              <div class="card-body text-center">
                <i class="fas fa-ticket-alt fa-2x mb-2"></i>
                <h5 class="card-title">Total Tickets</h5>
                <h2>{{ stats.totalTickets }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-warning">
              <div class="card-body text-center">
                <i class="fas fa-clock fa-2x mb-2"></i>
                <h5 class="card-title">Open Tickets</h5>
                <h2>{{ getOpenTicketsCount() }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-success">
              <div class="card-body text-center">
                <i class="fas fa-check-circle fa-2x mb-2"></i>
                <h5 class="card-title">Resolved</h5>
                <h2>{{ getResolvedTicketsCount() }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-danger">
              <div class="card-body text-center">
                <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                <h5 class="card-title">Escalated</h5>
                <h2>{{ stats.escalatedTickets }}</h2>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Actions -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-cogs"></i> Admin Actions</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3">
                    <button class="btn btn-outline-primary btn-lg w-100 mb-3" (click)="showTicketsPanel()">
                      <i class="fas fa-ticket-alt fa-2x d-block mb-2"></i>
                      Manage Tickets
                    </button>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-warning btn-lg w-100 mb-3" (click)="showAgentWorkloadPanel()">
                      <i class="fas fa-user-cog fa-2x d-block mb-2"></i>
                      Agent Workload
                    </button>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-danger btn-lg w-100 mb-3" (click)="showBulkUpdatePanel()">
                      <i class="fas fa-tasks fa-2x d-block mb-2"></i>
                      Bulk Updates
                    </button>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-info btn-lg w-100 mb-3" (click)="showAnalyticsPanel()">
                      <i class="fas fa-chart-pie fa-2x d-block mb-2"></i>
                      Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Ticket Filtering -->
        <div class="row mt-4" *ngIf="activePanel === 'tickets'">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-filter"></i> Advanced Ticket Filtering</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3 mb-3">
                    <label for="statusFilter" class="form-label">Status</label>
                    <select id="statusFilter" class="form-select" [(ngModel)]="filters.status" (change)="applyFilters()">
                      <option value="">All Statuses</option>
                      <option value="new">New</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_customer">Waiting on Customer</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div class="col-md-3 mb-3">
                    <label for="priorityFilter" class="form-label">Priority</label>
                    <select id="priorityFilter" class="form-select" [(ngModel)]="filters.priority" (change)="applyFilters()">
                      <option value="">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div class="col-md-3 mb-3">
                    <label for="assignmentFilter" class="form-label">Assignment</label>
                    <select id="assignmentFilter" class="form-select" [(ngModel)]="filters.assignedTo" (change)="applyFilters()">
                      <option value="">All Tickets</option>
                      <option value="unassigned">Unassigned Only</option>
                      <!-- Agent options will be populated dynamically -->
                      <option *ngFor="let agent of agents" [value]="agent.id">{{ agent.name }}</option>
                    </select>
                  </div>
                  <div class="col-md-3 mb-3">
                    <label for="escalatedFilter" class="form-label">Escalation Status</label>
                    <select id="escalatedFilter" class="form-select" [(ngModel)]="filters.escalated" (change)="applyFilters()">
                      <option [ngValue]="undefined">All Tickets</option>
                      <option [ngValue]="true">Escalated Only</option>
                      <option [ngValue]="false">Non-Escalated Only</option>
                    </select>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-3 mb-3">
                    <label for="fromDateFilter" class="form-label">From Date</label>
                    <input type="date" id="fromDateFilter" class="form-control" [(ngModel)]="filters.fromDateStr" (change)="applyFilters()">
                  </div>
                  <div class="col-md-3 mb-3">
                    <label for="toDateFilter" class="form-label">To Date</label>
                    <input type="date" id="toDateFilter" class="form-control" [(ngModel)]="filters.toDateStr" (change)="applyFilters()">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="searchFilter" class="form-label">Search</label>
                    <div class="input-group">
                      <input type="text" id="searchFilter" class="form-control" placeholder="Search tickets..." [(ngModel)]="filters.search">
                      <button class="btn btn-primary" type="button" (click)="applyFilters()">
                        <i class="fas fa-search"></i> Search
                      </button>
                      <button class="btn btn-secondary" type="button" (click)="resetFilters()">
                        <i class="fas fa-undo"></i> Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tickets Table -->
        <div class="row mt-4" *ngIf="activePanel === 'tickets'">
          <div class="col-12">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5><i class="fas fa-ticket-alt"></i> All Tickets</h5>
                <div>
                  <span class="badge bg-primary rounded-pill">{{ filteredTickets.length }} tickets</span>
                  <button class="btn btn-sm btn-outline-primary ms-2" (click)="selectAllTickets()">
                    <i class="fas fa-check-square"></i> Select All
                  </button>
                  <button class="btn btn-sm btn-outline-secondary ms-2" (click)="deselectAllTickets()">
                    <i class="fas fa-square"></i> Deselect All
                  </button>
                  <button class="btn btn-sm btn-warning ms-2" [disabled]="selectedTickets.length === 0" (click)="showBulkUpdatePanel()">
                    <i class="fas fa-edit"></i> Bulk Edit ({{ selectedTickets.length }})
                  </button>
                </div>
              </div>
              <div class="card-body">
                <div *ngIf="isLoading" class="text-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                
                <div *ngIf="!isLoading && filteredTickets.length === 0" class="text-center text-muted">
                  <i class="fas fa-search fa-3x mb-3 text-info"></i>
                  <h5>No tickets found!</h5>
                  <p>Try adjusting your filters to see more results.</p>
                </div>

                <div *ngIf="!isLoading && filteredTickets.length > 0" class="table-responsive">
                  <table class="table table-striped table-hover">
                    <thead class="table-dark">
                      <tr>
                        <th><input type="checkbox" [checked]="isAllSelected()" (change)="toggleAllSelection()"></th>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Assigned To</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let ticket of filteredTickets" 
                          [class]="getRowClass(ticket)">
                        <td><input type="checkbox" [checked]="isTicketSelected(ticket._id)" (change)="toggleTicketSelection(ticket._id)"></td>
                        <td><code>{{ ticket._id?.substring(0, 8) }}</code></td>
                        <td>{{ ticket.subject }}</td>
                        <td>
                          <span class="badge" [ngClass]="getStatusBadgeClass(ticket.status)">
                            {{ ticket.status | titlecase }}
                          </span>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="getPriorityBadgeClass(ticket.priority)">
                            {{ ticket.priority | titlecase }}
                          </span>
                        </td>
                        <td>
                          <span *ngIf="ticket.assigned_to">
                            {{ getAgentName(ticket.assigned_to) }}
                          </span>
                          <span *ngIf="!ticket.assigned_to" class="text-muted">
                            Unassigned
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
                            <button class="btn btn-outline-info" (click)="assignTicket(ticket)">
                              <i class="fas fa-user-plus"></i>
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

        <!-- Agent Workload Panel -->
        <div class="row mt-4" *ngIf="activePanel === 'agents'">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-user-cog"></i> Agent Workload</h5>
              </div>
              <div class="card-body">
                <div *ngIf="isLoading" class="text-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                
                <div *ngIf="!isLoading && agents.length === 0" class="text-center text-muted">
                  <i class="fas fa-user-slash fa-3x mb-3 text-warning"></i>
                  <h5>No agents found!</h5>
                  <p>There are no agents registered in the system.</p>
                </div>

                <div *ngIf="!isLoading && agents.length > 0" class="table-responsive">
                  <table class="table table-striped table-hover">
                    <thead class="table-dark">
                      <tr>
                        <th>Agent</th>
                        <th>Email</th>
                        <th>Skills</th>
                        <th>Experience</th>
                        <th>Capacity</th>
                        <th>Active Tickets</th>
                        <th>Available</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let agent of agents">
                        <td>{{ agent.name }}</td>
                        <td>{{ agent.email }}</td>
                        <td>
                          <span *ngFor="let skill of agent.skills" class="badge bg-info me-1">
                            {{ skill }}
                          </span>
                          <span *ngIf="agent.skills.length === 0" class="text-muted">
                            No skills listed
                          </span>
                        </td>
                        <td>{{ agent.experience }} years</td>
                        <td>{{ agent.activeTickets }}/{{ agent.capacity }}</td>
                        <td>
                          <div class="progress">
                            <div class="progress-bar" 
                                 [ngClass]="getLoadClass(agent)"
                                 [style.width.%]="getLoadPercentage(agent)">
                              {{ agent.activeTickets }}/{{ agent.capacity }}
                            </div>
                          </div>
                        </td>
                        <td>{{ agent.availableCapacity }}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" (click)="viewAgentTickets(agent)">
                              <i class="fas fa-ticket-alt"></i> Tickets
                            </button>
                            <button class="btn btn-outline-warning" (click)="assignToAgent(agent)">
                              <i class="fas fa-tasks"></i> Assign
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

        <!-- Bulk Update Panel -->
        <div class="row mt-4" *ngIf="activePanel === 'bulk'">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-tasks"></i> Bulk Update Tickets</h5>
              </div>
              <div class="card-body">
                <div *ngIf="selectedTickets.length === 0" class="text-center text-muted">
                  <i class="fas fa-check-square fa-3x mb-3 text-info"></i>
                  <h5>No tickets selected!</h5>
                  <p>Please select tickets from the tickets list first.</p>
                  <button class="btn btn-primary" (click)="showTicketsPanel()">
                    <i class="fas fa-ticket-alt"></i> Go to Tickets
                  </button>
                </div>

                <div *ngIf="selectedTickets.length > 0">
                  <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> You have selected {{ selectedTickets.length }} tickets for bulk update.
                  </div>

                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <label for="bulkStatus" class="form-label">Update Status</label>
                      <select id="bulkStatus" class="form-select" [(ngModel)]="bulkUpdate.status">
                        <option value="">No Change</option>
                        <option value="new">New</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_customer">Waiting on Customer</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="bulkPriority" class="form-label">Update Priority</label>
                      <select id="bulkPriority" class="form-select" [(ngModel)]="bulkUpdate.priority">
                        <option value="">No Change</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="bulkNotes" class="form-label">Admin Notes</label>
                      <input type="text" id="bulkNotes" class="form-control" placeholder="Add notes about this update" [(ngModel)]="bulkUpdate.notes">
                    </div>
                  </div>

                  <div class="d-flex justify-content-end">
                    <button class="btn btn-secondary me-2" (click)="showTicketsPanel()">
                      <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="btn btn-warning" (click)="applyBulkUpdate()">
                      <i class="fas fa-save"></i> Apply Updates
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Panel -->
        <div class="row mt-4" *ngIf="activePanel === 'analytics'">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-chart-pie"></i> Ticket Analytics</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="card h-100">
                      <div class="card-header">
                        <h6>Tickets by Status</h6>
                      </div>
                      <div class="card-body">
                        <div class="chart-container" style="position: relative; height:300px;">
                          <!-- Chart will be rendered here -->
                          <canvas id="statusChart"></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="card h-100">
                      <div class="card-header">
                        <h6>Tickets by Priority</h6>
                      </div>
                      <div class="card-body">
                        <div class="chart-container" style="position: relative; height:300px;">
                          <!-- Chart will be rendered here -->
                          <canvas id="priorityChart"></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="row mt-4">
                  <div class="col-md-12">
                    <div class="card">
                      <div class="card-header">
                        <h6>Ticket Aging Analysis</h6>
                      </div>
                      <div class="card-body">
                        <div class="chart-container" style="position: relative; height:300px;">
                          <!-- Chart will be rendered here -->
                          <canvas id="agingChart"></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket View Modal -->
    <div class="modal fade" id="ticketViewModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" *ngIf="selectedTicket">
          <div class="modal-header">
            <h5 class="modal-title">
              Ticket #{{ selectedTicket._id?.substring(0, 8) }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Ticket details will be shown here -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" (click)="editTicket(selectedTicket)">Edit</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Edit Modal -->
    <div class="modal fade" id="ticketEditModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" *ngIf="editingTicket">
          <div class="modal-header">
            <h5 class="modal-title">
              Edit Ticket #{{ editingTicket._id?.substring(0, 8) }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Ticket edit form will be shown here -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveTicketChanges()">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent Assignment Modal -->
    <div class="modal fade" id="assignAgentModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content" *ngIf="selectedTicket">
          <div class="modal-header">
            <h5 class="modal-title">
              Assign Ticket #{{ selectedTicket._id?.substring(0, 8) }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="agentSelect" class="form-label">Select Agent</label>
              <select id="agentSelect" class="form-select" [(ngModel)]="selectedAgentId">
                <option [ngValue]="null" disabled>Select an agent...</option>
                <option *ngFor="let agent of agents" [ngValue]="agent.id">
                  {{ agent.name }} ({{ agent.activeTickets }}/{{ agent.capacity }})
                </option>
              </select>
            </div>
            
            <div class="form-check mb-3" *ngIf="selectedAgentOverCapacity">
              <input class="form-check-input" type="checkbox" id="overrideCapacity" [(ngModel)]="overrideCapacity">
              <label class="form-check-label" for="overrideCapacity">
                Override agent capacity (Agent is already at full capacity)
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" [disabled]="!selectedAgentId" (click)="confirmAssignTicket()">
              Assign Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
    
    .chart-container {
      position: relative;
      margin: auto;
    }
    
    .badge {
      font-size: 0.8em;
      padding: 0.4em 0.7em;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  // Data properties
  stats: any = null;
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  agents: AgentWorkload[] = [];
  selectedTickets: string[] = [];
  agingData: any = null;
  
  // UI state
  isLoading = false;
  activePanel = 'tickets'; // 'tickets', 'agents', 'bulk', 'analytics'
  selectedTicket: Ticket | null = null;
  editingTicket: Ticket | null = null;
  selectedAgentId: string | null = null;
  overrideCapacity = false;
  selectedAgentOverCapacity = false;
  
  // Filter state
  filters = {
    status: '',
    priority: '',
    assignedTo: '',
    escalated: undefined as boolean | undefined,
    fromDateStr: '',
    toDateStr: '',
    search: ''
  };
  
  // Bulk update state
  bulkUpdate = {
    status: '',
    priority: '',
    notes: ''
  };
  
  constructor(
    private authService: AuthService,
    private ticketService: TicketService
  ) {}
  
  ngOnInit(): void {
    // Check if user is admin
    const userRole = this.authService.getUserRole();
    if (userRole !== 'admin') {
      console.error('Unauthorized access to admin dashboard');
      this.authService.logout();
      return;
    }
    
    // Load initial data
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load ticket stats
    this.ticketService.getTicketStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        console.log('Loaded ticket stats:', stats);
      },
      error: (error) => {
        console.error('Error loading ticket stats:', error);
      }
    });
    
    // Load tickets with admin filtering
    this.ticketService.getAdminTickets().subscribe({
      next: (response) => {
        this.tickets = response.tickets;
        this.filteredTickets = [...this.tickets];
        console.log('Loaded tickets:', this.tickets.length);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.isLoading = false;
      }
    });
    
    // Load agent workload data
    this.ticketService.getAgentsWorkload().subscribe({
      next: (response) => {
        this.agents = response.agents;
        console.log('Loaded agents:', this.agents.length);
      },
      error: (error) => {
        console.error('Error loading agents:', error);
      }
    });
    
    // Load aging data for charts
    this.ticketService.getTicketAging().subscribe({
      next: (data) => {
        this.agingData = data;
        console.log('Loaded aging data:', data);
        // We would initialize charts here if using Chart.js
      },
      error: (error) => {
        console.error('Error loading aging data:', error);
      }
    });
  }
  
  // Panel visibility methods
  showTicketsPanel(): void {
    this.activePanel = 'tickets';
  }
  
  showAgentWorkloadPanel(): void {
    this.activePanel = 'agents';
  }
  
  showBulkUpdatePanel(): void {
    this.activePanel = 'bulk';
  }
  
  showAnalyticsPanel(): void {
    this.activePanel = 'analytics';
    // We would initialize/update charts here if using Chart.js
  }
  
  // Filter methods
  applyFilters(): void {
    // Convert date strings to Date objects if present
    const fromDate = this.filters.fromDateStr ? new Date(this.filters.fromDateStr) : undefined;
    const toDate = this.filters.toDateStr ? new Date(this.filters.toDateStr) : undefined;
    
    // Apply filters on the backend
    this.isLoading = true;
    this.ticketService.getAdminTickets({
      status: this.filters.status,
      priority: this.filters.priority,
      assignedTo: this.filters.assignedTo,
      escalated: this.filters.escalated,
      fromDate: fromDate,
      toDate: toDate,
      search: this.filters.search
    }).subscribe({
      next: (response) => {
        this.filteredTickets = response.tickets;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error applying filters:', error);
        this.isLoading = false;
      }
    });
  }
  
  resetFilters(): void {
    this.filters = {
      status: '',
      priority: '',
      assignedTo: '',
      escalated: undefined,
      fromDateStr: '',
      toDateStr: '',
      search: ''
    };
    this.applyFilters();
  }
  
  // Ticket selection methods
  toggleTicketSelection(ticketId?: string): void {
    if (!ticketId) return;
    
    const index = this.selectedTickets.indexOf(ticketId);
    if (index === -1) {
      this.selectedTickets.push(ticketId);
    } else {
      this.selectedTickets.splice(index, 1);
    }
  }
  
  isTicketSelected(ticketId?: string): boolean {
    return ticketId ? this.selectedTickets.includes(ticketId) : false;
  }
  
  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.deselectAllTickets();
    } else {
      this.selectAllTickets();
    }
  }
  
  isAllSelected(): boolean {
    return this.filteredTickets.length > 0 && 
           this.selectedTickets.length === this.filteredTickets.length;
  }
  
  selectAllTickets(): void {
    this.selectedTickets = this.filteredTickets
      .filter(ticket => ticket._id)
      .map(ticket => ticket._id as string);
  }
  
  deselectAllTickets(): void {
    this.selectedTickets = [];
  }
  
  // Bulk update methods
  applyBulkUpdate(): void {
    if (this.selectedTickets.length === 0) {
      return;
    }
    
    // Ensure at least one update field is set
    if (!this.bulkUpdate.status && !this.bulkUpdate.priority) {
      alert('Please select status or priority to update');
      return;
    }
    
    this.isLoading = true;
    this.ticketService.adminBulkUpdateTickets(
      this.selectedTickets,
      {
        status: this.bulkUpdate.status || undefined,
        priority: this.bulkUpdate.priority || undefined,
        notes: this.bulkUpdate.notes || undefined
      }
    ).subscribe({
      next: (response) => {
        console.log('Bulk update applied:', response);
        alert(`Bulk update completed: ${response.message}`);
        this.isLoading = false;
        this.showTicketsPanel();
        this.loadDashboardData(); // Refresh data
        this.bulkUpdate = { status: '', priority: '', notes: '' };
      },
      error: (error) => {
        console.error('Error applying bulk update:', error);
        alert('Error applying bulk updates. Please try again.');
        this.isLoading = false;
      }
    });
  }
  
  // Ticket action methods
  viewTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
    // Here you would open the ticket view modal
    // For a real implementation, you would use Angular Material or Bootstrap JS
    alert(`View ticket: ${ticket.subject}`);
  }
  
  editTicket(ticket: Ticket): void {
    this.editingTicket = { ...ticket };
    // Here you would open the ticket edit modal
    alert(`Edit ticket: ${ticket.subject}`);
  }
  
  assignTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.selectedAgentId = null;
    
    // Check if we have available agents
    if (this.agents.length === 0) {
      alert('No agents available in the system');
      return;
    }
    
    // Here you would open the assign agent modal
    alert(`Assign ticket: ${ticket.subject}`);
  }
  
  confirmAssignTicket(): void {
    if (!this.selectedTicket || !this.selectedAgentId) {
      return;
    }
    
    this.isLoading = true;
    this.ticketService.adminAssignTicket(
      this.selectedTicket._id as string,
      this.selectedAgentId,
      this.overrideCapacity
    ).subscribe({
      next: (response) => {
        console.log('Ticket assigned:', response);
        alert(`Ticket assigned to ${response.agent.name}`);
        this.isLoading = false;
        this.loadDashboardData(); // Refresh data
        // Close modal
      },
      error: (error) => {
        console.error('Error assigning ticket:', error);
        if (error.status === 400 && error.error?.canOverride) {
          this.selectedAgentOverCapacity = true;
          alert('Agent has reached maximum capacity. You can override if needed.');
        } else {
          alert('Error assigning ticket. Please try again.');
        }
        this.isLoading = false;
      }
    });
  }
  
  escalateTicket(ticket: Ticket): void {
    if (ticket.escalated) {
      return;
    }
    
    const reason = prompt('Please provide escalation reason:');
    if (!reason) {
      return;
    }
    
    this.isLoading = true;
    this.ticketService.escalateTicket(ticket._id as string, { escalation_reason: reason }).subscribe({
      next: (response) => {
        console.log('Ticket escalated:', response);
        alert('Ticket escalated successfully');
        this.isLoading = false;
        this.loadDashboardData(); // Refresh data
      },
      error: (error) => {
        console.error('Error escalating ticket:', error);
        alert('Error escalating ticket. Please try again.');
        this.isLoading = false;
      }
    });
  }
  
  saveTicketChanges(): void {
    if (!this.editingTicket || !this.editingTicket._id) {
      return;
    }
    
    this.isLoading = true;
    this.ticketService.adminUpdateTicket(this.editingTicket._id, this.editingTicket).subscribe({
      next: (response) => {
        console.log('Ticket updated:', response);
        alert('Ticket updated successfully');
        this.isLoading = false;
        this.loadDashboardData(); // Refresh data
        // Close modal
      },
      error: (error) => {
        console.error('Error updating ticket:', error);
        alert('Error updating ticket. Please try again.');
        this.isLoading = false;
      }
    });
  }
  
  // Agent related methods
  getAgentName(agent: any): string {
    if (!agent) return 'Unassigned';
    
    if (typeof agent === 'string') {
      // Find agent by ID
      const foundAgent = this.agents.find(a => a.id === agent);
      return foundAgent ? foundAgent.name : 'Unknown Agent';
    }
    
    return agent.first_name && agent.last_name ? 
      `${agent.first_name} ${agent.last_name}` : 
      (agent.email || 'Unknown Agent');
  }
  
  getLoadPercentage(agent: AgentWorkload): number {
    return (agent.activeTickets / agent.capacity) * 100;
  }
  
  getLoadClass(agent: AgentWorkload): string {
    const percentage = this.getLoadPercentage(agent);
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  }
  
  viewAgentTickets(agent: AgentWorkload): void {
    // Filter tickets by this agent
    this.filters.assignedTo = agent.id;
    this.applyFilters();
    this.showTicketsPanel();
  }
  
  assignToAgent(agent: AgentWorkload): void {
    if (this.selectedTickets.length === 0) {
      alert('Please select tickets to assign first');
      this.showTicketsPanel();
      return;
    }
    
    if (this.selectedTickets.length > agent.availableCapacity && !confirm(`This will exceed the agent's capacity. Continue?`)) {
      return;
    }
    
    this.isLoading = true;
    
    // Create a queue of tickets to assign
    const assignPromises = this.selectedTickets.map(ticketId => 
      this.ticketService.adminAssignTicket(ticketId, agent.id, true).toPromise()
    );
    
    Promise.all(assignPromises)
      .then(results => {
        console.log('Tickets assigned:', results);
        alert(`${this.selectedTickets.length} tickets assigned to ${agent.name}`);
        this.selectedTickets = [];
        this.loadDashboardData(); // Refresh data
      })
      .catch(error => {
        console.error('Error assigning tickets:', error);
        alert('Error assigning tickets. Some assignments may have failed.');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
  
  // Utility methods
  getOpenTicketsCount(): number {
    if (!this.stats || !this.stats.statusCounts) return 0;
    
    let count = 0;
    const openStatuses = ['new', 'assigned', 'in_progress', 'waiting_customer'];
    
    for (const status of openStatuses) {
      count += this.stats.statusCounts[status] || 0;
    }
    
    return count;
  }
  
  getResolvedTicketsCount(): number {
    if (!this.stats || !this.stats.statusCounts) return 0;
    return (this.stats.statusCounts['resolved'] || 0) + (this.stats.statusCounts['closed'] || 0);
  }
  
  getRowClass(ticket: Ticket): string {
    if (ticket.escalated) return 'table-danger';
    if (ticket.status === 'resolved') return 'table-success';
    if (ticket.status === 'closed') return 'table-secondary';
    if (ticket.priority === 'critical') return 'table-warning';
    return '';
  }
  
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'new': return 'bg-info';
      case 'assigned': return 'bg-primary';
      case 'in_progress': return 'bg-warning';
      case 'waiting_customer': return 'bg-secondary';
      case 'resolved': return 'bg-success';
      case 'closed': return 'bg-dark';
      default: return 'bg-light text-dark';
    }
  }
  
  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'low': return 'bg-success';
      case 'medium': return 'bg-info';
      case 'high': return 'bg-warning';
      case 'critical': return 'bg-danger';
      default: return 'bg-light text-dark';
    }
  }
  
  exportReport(): void {
    // For CSV export, we would implement logic to export tickets to CSV
    alert('Export functionality would be implemented here');
  }
  
  logout(): void {
    this.authService.logout();
  }
}
