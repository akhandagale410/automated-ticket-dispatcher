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
                <p class="lead text-muted">Ticket Management & Resolution Hub</p>
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
        
        <!-- Agent Statistics -->
        <div class="row mt-4" *ngIf="stats">
          <div class="col-md-3">
            <div class="card text-white bg-info">
              <div class="card-body text-center">
                <i class="fas fa-inbox fa-2x mb-2"></i>
                <h5 class="card-title">My Tickets</h5>
                <h2>{{ myTickets.length }}</h2>
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
                <h5 class="card-title">Escalated</h5>
                <h2>{{ getEscalatedTickets().length }}</h2>
              </div>
            </div>
          </div>
        </div>

        <!-- Agent Actions -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-tasks"></i> Quick Actions</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3">
                    <button class="btn btn-outline-primary btn-lg w-100 mb-3" (click)="showMyTickets = !showMyTickets">
                      <i class="fas fa-user-check fa-2x d-block mb-2"></i>
                      {{ showMyTickets ? 'Hide' : 'View' }} My Tickets
                    </button>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-secondary btn-lg w-100 mb-3" (click)="showAvailableTickets = !showAvailableTickets">
                      <i class="fas fa-inbox fa-2x d-block mb-2"></i>
                      {{ showAvailableTickets ? 'Hide' : 'View' }} Available
                    </button>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-warning btn-lg w-100 mb-3" (click)="showEscalatedTickets = !showEscalatedTickets">
                      <i class="fas fa-exclamation-triangle fa-2x d-block mb-2"></i>
                      {{ showEscalatedTickets ? 'Hide' : 'View' }} Escalated
                    </button>
                  </div>
                  <div class="col-md-3">
                    <button class="btn btn-outline-info btn-lg w-100 mb-3" (click)="openAgingChartModal()">
                      <i class="fas fa-chart-pie fa-2x d-block mb-2"></i>
                      Aging Analytics
                    </button>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <button class="btn btn-outline-success btn-lg w-100 mb-3" (click)="showReports = !showReports">
                      <i class="fas fa-chart-bar fa-2x d-block mb-2"></i>
                      {{ showReports ? 'Hide' : 'View' }} Reports
                    </button>
                  </div>
                  <div class="col-md-6">
                    <button class="btn btn-outline-primary btn-lg w-100 mb-3" (click)="exportCSV()">
                      <i class="fas fa-file-csv fa-2x d-block mb-2"></i>
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- My Tickets -->
        <div class="row mt-4" *ngIf="showMyTickets">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-user-check"></i> My Tickets</h5>
              </div>
              <div class="card-body">
                <div *ngIf="isLoading" class="text-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                
                <div *ngIf="!isLoading && myTickets.length === 0" class="text-center text-muted">
                  <i class="fas fa-clipboard-list fa-3x mb-3 text-info"></i>
                  <h5>No tickets assigned!</h5>
                  <p>You don't have any tickets assigned to you yet.</p>
                </div>

                <div *ngIf="!isLoading && myTickets.length > 0" class="table-responsive">
                  <table class="table table-striped table-hover">
                    <thead class="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let ticket of myTickets" 
                          [class]="getRowClass(ticket)">
                        <td><code>{{ ticket._id?.substring(0, 8) }}</code></td>
                        <td>{{ ticket.subject }}</td>
                        <td>
                          <select class="form-select form-select-sm" 
                                  [value]="ticket.status" 
                                  (change)="updateTicketStatus(ticket, $event)">
                            <option value="new">New</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="waiting_customer">Waiting Customer</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td>
                          <select class="form-select form-select-sm" 
                                  [value]="ticket.priority" 
                                  (change)="updateTicketPriority(ticket, $event)">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </td>
                        <td>{{ ticket.created_at | date:'short' }}</td>
                        <td>{{ ticket.updated_at | date:'short' }}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" (click)="viewTicket(ticket)">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning" (click)="editTicket(ticket)">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-info" (click)="addComment(ticket)">
                              <i class="fas fa-comment"></i>
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

        <!-- Available Tickets -->
        <div class="row mt-4" *ngIf="showAvailableTickets">
          <div class="col-12">
            <div class="card border-info">
              <div class="card-header bg-info text-white">
                <h5><i class="fas fa-inbox"></i> Available Tickets</h5>
              </div>
              <div class="card-body">
                <div *ngIf="availableTickets.length === 0" class="text-center text-muted">
                  <i class="fas fa-check-circle fa-3x mb-3 text-success"></i>
                  <h5>No available tickets!</h5>
                  <p>All tickets are currently assigned.</p>
                </div>

                <div *ngIf="availableTickets.length > 0" class="table-responsive">
                  <table class="table table-striped table-hover">
                    <thead class="table-info">
                      <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Priority</th>
                        <th>Type</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let ticket of availableTickets">
                        <td><code>{{ ticket._id?.substring(0, 8) }}</code></td>
                        <td>{{ ticket.subject }}</td>
                        <td>
                          <span class="badge" [class]="getPriorityBadgeClass(ticket.priority)">
                            {{ ticket.priority | titlecase }}
                          </span>
                        </td>
                        <td>{{ ticket.type | titlecase }}</td>
                        <td>{{ ticket.created_at | date:'short' }}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" (click)="viewTicket(ticket)">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-success" (click)="assignToMe(ticket)">
                              <i class="fas fa-user-plus"></i> Assign to Me
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

        <!-- Escalated Tickets -->
        <div class="row mt-4" *ngIf="showEscalatedTickets">
          <div class="col-12">
            <div class="card border-danger">
              <div class="card-header bg-danger text-white">
                <h5><i class="fas fa-exclamation-triangle"></i> Escalated Tickets</h5>
              </div>
              <div class="card-body">
                <div *ngIf="getEscalatedTickets().length === 0" class="text-center text-muted">
                  <i class="fas fa-check-circle fa-3x mb-3 text-success"></i>
                  <h5>No escalated tickets!</h5>
                  <p>All tickets are being handled normally.</p>
                </div>

                <div *ngIf="getEscalatedTickets().length > 0" class="table-responsive">
                  <table class="table table-striped table-hover">
                    <thead class="table-danger">
                      <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Priority</th>
                        <th>Escalation Reason</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let ticket of getEscalatedTickets()">
                        <td><code>{{ ticket._id?.substring(0, 8) }}</code></td>
                        <td>{{ ticket.subject }}</td>
                        <td>
                          <span class="badge" [class]="getPriorityBadgeClass(ticket.priority)">
                            {{ ticket.priority | titlecase }}
                          </span>
                        </td>
                        <td>{{ ticket.escalation_reason }}</td>
                        <td>{{ ticket.created_at | date:'short' }}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" (click)="viewTicket(ticket)">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning" (click)="editTicket(ticket)">
                              <i class="fas fa-edit"></i>
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

        <!-- Reports Section -->
        <div class="row mt-4" *ngIf="showReports">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-chart-bar"></i> Ticket Reports</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <h6>Open vs Closed Tickets</h6>
                    <div class="row">
                      <div class="col-6">
                        <div class="card text-white bg-info">
                          <div class="card-body text-center">
                            <h4>{{ getOpenTickets().length }}</h4>
                            <small>Open Tickets</small>
                          </div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="card text-white bg-success">
                          <div class="card-body text-center">
                            <h4>{{ getClosedTickets().length }}</h4>
                            <small>Closed Tickets</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <h6>Priority Distribution</h6>
                    <div class="row">
                      <div class="col-3" *ngFor="let priority of getPriorityStats()">
                        <div class="card text-center">
                          <div class="card-body">
                            <h6>{{ priority.name }}</h6>
                            <h4 [class]="getPriorityTextClass(priority.name)">{{ priority.count }}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row mt-3">
                  <div class="col-12">
                    <button class="btn btn-primary me-2" (click)="exportReport()">
                      <i class="fas fa-file-export"></i> Export Full Report
                    </button>
                    <button class="btn btn-outline-primary" (click)="exportCSV()">
                      <i class="fas fa-file-csv"></i> Export CSV
                    </button>
                  </div>
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
                      <strong>Ticket Analytics:</strong> This pie chart shows the aging distribution of your tickets.
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

        <!-- View Ticket Modal -->
        <div class="modal fade show" [style.display]="showViewModal ? 'block' : 'none'" tabindex="-1" *ngIf="showViewModal && selectedTicket">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-ticket-alt"></i> Ticket Details
                </h5>
                <button type="button" class="btn-close" (click)="closeViewModal()"></button>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-md-6">
                    <strong>ID:</strong> <code>{{ selectedTicket._id }}</code>
                  </div>
                  <div class="col-md-6">
                    <strong>Status:</strong>
                    <span class="badge" [class]="getStatusBadgeClass(selectedTicket.status)">
                      {{ selectedTicket.status | titlecase }}
                    </span>
                  </div>
                </div>
                <hr>
                <div class="row">
                  <div class="col-12">
                    <strong>Subject:</strong>
                    <h5>{{ selectedTicket.subject }}</h5>
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
                  <div class="col-md-3">
                    <strong>Complexity:</strong>
                    <span class="badge bg-secondary">{{ selectedTicket.complexity | titlecase }}</span>
                  </div>
                </div>
                <hr>
                <div class="row">
                  <div class="col-md-6">
                    <strong>Created:</strong> {{ selectedTicket.created_at | date:'medium' }}
                  </div>
                  <div class="col-md-6">
                    <strong>Updated:</strong> {{ selectedTicket.updated_at | date:'medium' }}
                  </div>
                </div>
                <div *ngIf="selectedTicket.escalated" class="alert alert-danger mt-3">
                  <strong><i class="fas fa-exclamation-triangle"></i> Escalated:</strong>
                  {{ selectedTicket.escalation_reason }}
                </div>

                <!-- Comments Section -->
                <hr>
                <div class="row">
                  <div class="col-12">
                    <h6><i class="fas fa-comments"></i> Comments & Notes</h6>
                    <div *ngIf="selectedTicket.internal_notes && selectedTicket.internal_notes.length > 0" 
                         class="comments-section" style="max-height: 300px; overflow-y: auto;">
                      <div *ngFor="let note of selectedTicket.internal_notes" class="card mb-2">
                        <div class="card-body p-2">
                          <small class="text-muted">
                            <strong>{{ note.addedBy }}</strong> • {{ note.createdAt | date:'short' }}
                          </small>
                          <p class="mt-1 mb-0">{{ note.body }}</p>
                        </div>
                      </div>
                    </div>
                    <div *ngIf="!selectedTicket.internal_notes || selectedTicket.internal_notes.length === 0" 
                         class="text-muted text-center p-3">
                      <i class="fas fa-comment-slash fa-2x mb-2"></i>
                      <p>No comments yet</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-info" (click)="addComment(selectedTicket)">
                  <i class="fas fa-comment"></i> Add Comment
                </button>
                <button type="button" class="btn btn-secondary" (click)="closeViewModal()">Close</button>
                <button type="button" class="btn btn-primary" (click)="editTicket(selectedTicket)">
                  <i class="fas fa-edit"></i> Edit
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-backdrop fade show" *ngIf="showViewModal" (click)="closeViewModal()"></div>

        <!-- Edit Ticket Modal -->
        <div class="modal fade show" [style.display]="showEditModal ? 'block' : 'none'" tabindex="-1" *ngIf="showEditModal && editingTicket">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-edit"></i> Edit Ticket
                </h5>
                <button type="button" class="btn-close" (click)="closeEditModal()"></button>
              </div>
              <div class="modal-body">
                <form>
                  <div class="row">
                    <div class="col-md-6">
                      <label for="subject" class="form-label">Subject</label>
                      <input type="text" class="form-control" id="subject" 
                             [(ngModel)]="editingTicket.subject" name="subject">
                    </div>
                    <div class="col-md-6">
                      <label for="status" class="form-label">Status</label>
                      <select class="form-select" id="status" 
                              [(ngModel)]="editingTicket.status" name="status">
                        <option value="new">New</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_customer">Waiting Customer</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <div class="row mt-3">
                    <div class="col-12">
                      <label for="description" class="form-label">Description</label>
                      <textarea class="form-control" id="description" rows="4"
                                [(ngModel)]="editingTicket.description" name="description"></textarea>
                    </div>
                  </div>
                  <div class="row mt-3">
                    <div class="col-md-4">
                      <label for="priority" class="form-label">Priority</label>
                      <select class="form-select" id="priority" 
                              [(ngModel)]="editingTicket.priority" name="priority">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div class="col-md-4">
                      <label for="type" class="form-label">Type</label>
                      <select class="form-select" id="type" 
                              [(ngModel)]="editingTicket.type" name="type">
                        <option value="incident">Incident</option>
                        <option value="request">Request</option>
                        <option value="problem">Problem</option>
                        <option value="change">Change</option>
                      </select>
                    </div>
                    <div class="col-md-4">
                      <label for="severity" class="form-label">Severity</label>
                      <select class="form-select" id="severity" 
                              [(ngModel)]="editingTicket.severity" name="severity">
                        <option value="minor">Minor</option>
                        <option value="major">Major</option>
                        <option value="critical">Critical</option>
                        <option value="blocker">Blocker</option>
                      </select>
                    </div>
                  </div>
                  <div class="row mt-3">
                    <div class="col-12">
                      <label for="comment" class="form-label">Add Comment</label>
                      <textarea class="form-control" id="comment" rows="3"
                                [(ngModel)]="newComment" name="comment"
                                placeholder="Add a comment about this update..."></textarea>
                    </div>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeEditModal()">Cancel</button>
                <button type="button" class="btn btn-primary" (click)="saveTicket()">
                  <i class="fas fa-save"></i> Save Changes
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
export class AgentDashboardComponent implements OnInit {
  stats: TicketStats | null = null;
  agingData: any = null;
  myTickets: Ticket[] = [];
  availableTickets: Ticket[] = [];
  resolvedToday = 0;
  isLoading = false;
  showMyTickets = true;
  showAvailableTickets = false;
  showEscalatedTickets = false;
  showReports = false;
  showAgingChartModal = false;
  showViewModal = false;
  showEditModal = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  
  selectedTicket: Ticket | null = null;
  editingTicket: Ticket | null = null;
  newComment = '';

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
    this.loadMyTickets();
    this.loadAvailableTickets();
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

  loadMyTickets() {
    this.isLoading = true;
    // Use the new method to get tickets assigned to the current agent
    this.ticketService.getMyAgentTickets().subscribe({
      next: (response) => {
        this.myTickets = response.tickets;
        this.calculateResolvedToday();
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage('Error loading tickets: ' + error.error?.message, 'error');
        this.isLoading = false;
      }
    });
  }

  loadAvailableTickets() {
    this.ticketService.getUnassignedTickets().subscribe({
      next: (response) => {
        this.availableTickets = response.tickets;
      },
      error: (error) => {
        console.error('Error loading available tickets:', error);
        this.showMessage('Error loading available tickets: ' + error.error?.message, 'error');
      }
    });
  }

  calculateResolvedToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.resolvedToday = this.myTickets.filter(ticket => {
      if (ticket.status === 'resolved' && ticket.updated_at) {
        const ticketDate = new Date(ticket.updated_at);
        ticketDate.setHours(0, 0, 0, 0);
        return ticketDate.getTime() === today.getTime();
      }
      return false;
    }).length;
  }

  getTicketsByStatus(status: string): Ticket[] {
    return this.myTickets.filter(ticket => ticket.status === status);
  }

  getEscalatedTickets(): Ticket[] {
    return this.myTickets.filter(ticket => ticket.escalated);
  }

  getOpenTickets(): Ticket[] {
    return this.myTickets.filter(ticket => 
      ['new', 'assigned', 'in_progress', 'waiting_customer'].includes(ticket.status)
    );
  }

  getClosedTickets(): Ticket[] {
    return this.myTickets.filter(ticket => 
      ['resolved', 'closed'].includes(ticket.status)
    );
  }

  getPriorityStats() {
    const priorities = ['low', 'medium', 'high', 'critical'];
    return priorities.map(priority => ({
      name: priority,
      count: this.myTickets.filter(ticket => ticket.priority === priority).length
    }));
  }

  updateTicketStatus(ticket: Ticket, event: any) {
    const newStatus = event.target.value;
    if (ticket._id) {
      this.ticketService.updateTicket(ticket._id, { status: newStatus }).subscribe({
        next: (response) => {
          ticket.status = newStatus;
          this.showMessage('Ticket status updated successfully!', 'success');
          this.calculateResolvedToday();
        },
        error: (error) => {
          this.showMessage('Error updating ticket status: ' + error.error?.message, 'error');
        }
      });
    }
  }

  updateTicketPriority(ticket: Ticket, event: any) {
    const newPriority = event.target.value;
    if (ticket._id) {
      this.ticketService.updateTicket(ticket._id, { priority: newPriority }).subscribe({
        next: (response) => {
          ticket.priority = newPriority;
          this.showMessage('Ticket priority updated successfully!', 'success');
        },
        error: (error) => {
          this.showMessage('Error updating ticket priority: ' + error.error?.message, 'error');
        }
      });
    }
  }

  viewTicket(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.showViewModal = true;
    document.body.classList.add('modal-open');
  }

  editTicket(ticket: Ticket) {
    this.editingTicket = { ...ticket };
    this.newComment = '';
    this.showEditModal = true;
    this.showViewModal = false;
    document.body.classList.add('modal-open');
  }

  addComment(ticket: Ticket) {
    const comment = prompt('Add a comment to this ticket:');
    if (comment && ticket._id) {
      this.ticketService.addComment(ticket._id, comment).subscribe({
        next: (response) => {
          // Update the ticket with the response
          const index = this.myTickets.findIndex(t => t._id === ticket._id);
          if (index !== -1) {
            this.myTickets[index] = response.ticket;
          }
          this.showMessage('Comment added successfully!', 'success');
        },
        error: (error) => {
          this.showMessage('Error adding comment: ' + error.error?.message, 'error');
        }
      });
    }
  }

  escalateTicket(ticket: Ticket) {
    const reason = prompt('Please provide escalation reason:');
    if (reason && ticket._id) {
      this.ticketService.escalateTicket(ticket._id, { escalation_reason: reason }).subscribe({
        next: (response) => {
          ticket.escalated = true;
          ticket.escalation_reason = reason;
          this.showMessage('Ticket escalated successfully', 'success');
        },
        error: (error) => {
          this.showMessage('Error escalating ticket: ' + error.error?.message, 'error');
        }
      });
    }
  }

  assignToMe(ticket: Ticket) {
    if (ticket._id) {
      this.ticketService.assignTicket(ticket._id).subscribe({
        next: (response) => {
          // Remove from available tickets and add to my tickets
          this.availableTickets = this.availableTickets.filter(t => t._id !== ticket._id);
          this.myTickets.push(response.ticket);
          this.showMessage('Ticket assigned to you successfully!', 'success');
        },
        error: (error) => {
          this.showMessage('Error assigning ticket: ' + error.error?.message, 'error');
        }
      });
    }
  }

  saveTicket() {
    if (this.editingTicket && this.editingTicket._id) {
      const updateData: any = {
        subject: this.editingTicket.subject,
        description: this.editingTicket.description,
        status: this.editingTicket.status,
        priority: this.editingTicket.priority,
        type: this.editingTicket.type,
        severity: this.editingTicket.severity
      };

      // Add comment if provided
      if (this.newComment.trim()) {
        updateData.description = this.editingTicket.description + '\n\n[Agent Update]: ' + this.newComment;
      }

      this.ticketService.updateTicket(this.editingTicket._id, updateData).subscribe({
        next: (response) => {
          // Update the ticket in the list
          const index = this.myTickets.findIndex(t => t._id === this.editingTicket!._id);
          if (index !== -1) {
            this.myTickets[index] = { ...this.editingTicket!, ...updateData };
          }
          this.showMessage('Ticket updated successfully!', 'success');
          this.closeEditModal();
          this.calculateResolvedToday();
        },
        error: (error) => {
          this.showMessage('Error updating ticket: ' + error.error?.message, 'error');
        }
      });
    }
  }

  exportReport() {
    const reportData = {
      agentName: this.authService.getCurrentUser()?.first_name + ' ' + this.authService.getCurrentUser()?.last_name,
      generatedAt: new Date().toISOString(),
      totalTickets: this.myTickets.length,
      openTickets: this.getOpenTickets().length,
      closedTickets: this.getClosedTickets().length,
      escalatedTickets: this.getEscalatedTickets().length,
      resolvedToday: this.resolvedToday,
      priorityStats: this.getPriorityStats(),
      tickets: this.myTickets
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `agent-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    this.showMessage('Report exported successfully!', 'success');
  }

  exportCSV() {
    const csvData = this.myTickets.map(ticket => ({
      ID: ticket._id || '',
      Subject: ticket.subject || '',
      Status: ticket.status || '',
      Priority: ticket.priority || '',
      Type: ticket.type || '',
      Severity: ticket.severity || '',
      Created: ticket.created_at?.toString() || '',
      Updated: ticket.updated_at?.toString() || '',
      Escalated: ticket.escalated ? 'Yes' : 'No'
    }));

    if (csvData.length === 0) {
      this.showMessage('No data to export', 'error');
      return;
    }

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(field => `"${(row as any)[field] || ''}"`).join(','))
    ].join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `agent-tickets-${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    this.showMessage('CSV exported successfully!', 'success');
  }

  getRowClass(ticket: Ticket): string {
    if (ticket.escalated) return 'table-danger';
    if (ticket.priority === 'critical') return 'table-danger';
    if (ticket.priority === 'high') return 'table-warning';
    return '';
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

  getPriorityTextClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'low': 'text-success',
      'medium': 'text-warning',
      'high': 'text-danger',
      'critical': 'text-dark'
    };
    return classes[priority] || 'text-secondary';
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

  closeViewModal() {
    this.showViewModal = false;
    this.selectedTicket = null;
    document.body.classList.remove('modal-open');
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingTicket = null;
    this.newComment = '';
    document.body.classList.remove('modal-open');
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
