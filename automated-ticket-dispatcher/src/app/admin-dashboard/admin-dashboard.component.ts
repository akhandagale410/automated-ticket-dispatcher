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
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
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
  showViewModal = false;
  showEditModal = false;
  showAssignModal = false;
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
      this.authService.logout();
      return;
    }
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.ticketService.getTicketStats().subscribe({
      next: (stats) => { this.stats = stats; },
      error: () => {}
    });
    this.ticketService.getAdminTickets().subscribe({
      next: (response) => {
        this.tickets = response.tickets;
        this.filteredTickets = [...this.tickets];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
    this.ticketService.getAgentsWorkload().subscribe({
      next: (response) => { this.agents = response.agents; },
      error: () => {}
    });
    this.ticketService.getTicketAging().subscribe({
      next: (data) => { this.agingData = data; },
      error: () => {}
    });
  }

  // Panel visibility methods
  showTicketsPanel(): void { this.activePanel = 'tickets'; }
  showAgentWorkloadPanel(): void { this.activePanel = 'agents'; }
  showBulkUpdatePanel(): void { this.activePanel = 'bulk'; }
  showAnalyticsPanel(): void { this.activePanel = 'analytics'; }

  // Filter methods
  applyFilters(): void {
    const fromDate = this.filters.fromDateStr ? new Date(this.filters.fromDateStr) : undefined;
    const toDate = this.filters.toDateStr ? new Date(this.filters.toDateStr) : undefined;
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
      error: () => { this.isLoading = false; }
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
    if (this.isAllSelected()) this.deselectAllTickets();
    else this.selectAllTickets();
  }
  isAllSelected(): boolean {
    return this.filteredTickets.length > 0 && this.selectedTickets.length === this.filteredTickets.length;
  }
  selectAllTickets(): void {
    this.selectedTickets = this.filteredTickets.filter(ticket => ticket._id).map(ticket => ticket._id as string);
  }
  deselectAllTickets(): void { this.selectedTickets = []; }

  // Bulk update methods
  applyBulkUpdate(): void {
    if (this.selectedTickets.length === 0) return;
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
        alert(`Bulk update completed: ${response.message}`);
        this.isLoading = false;
        this.showTicketsPanel();
        this.loadDashboardData();
        this.bulkUpdate = { status: '', priority: '', notes: '' };
      },
      error: () => {
        alert('Error applying bulk updates. Please try again.');
        this.isLoading = false;
      }
    });
  }

  // Ticket action methods
  viewTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.showViewModal = true;
  }
  closeViewModal(): void {
    this.selectedTicket = null;
    this.showViewModal = false;
  }

  editTicket(ticket: Ticket): void {
    this.editingTicket = { ...ticket };
    this.showEditModal = true;
  }
  closeEditModal(): void {
    this.editingTicket = null;
    this.showEditModal = false;
  }

  assignTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.selectedAgentId = null;
    this.selectedAgentOverCapacity = false;
    if (this.agents.length === 0) {
      alert('No agents available in the system');
      return;
    }
    this.showAssignModal = true;
  }
  closeAssignModal(): void {
    this.selectedTicket = null;
    this.selectedAgentId = null;
    this.showAssignModal = false;
    this.selectedAgentOverCapacity = false;
    this.overrideCapacity = false;
  }

  confirmAssignTicket(): void {
    if (!this.selectedTicket || !this.selectedAgentId) return;
    this.isLoading = true;
    this.ticketService.adminAssignTicket(
      this.selectedTicket._id as string,
      this.selectedAgentId,
      this.overrideCapacity
    ).subscribe({
      next: (response) => {
        alert(`Ticket assigned to ${response.agent.name}`);
        this.isLoading = false;
        this.loadDashboardData();
        this.closeAssignModal();
      },
      error: (error) => {
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
    if (ticket.escalated) return;
    const reason = prompt('Please provide escalation reason:');
    if (!reason) return;
    this.isLoading = true;
    this.ticketService.escalateTicket(ticket._id as string, { escalation_reason: reason }).subscribe({
      next: () => {
        alert('Ticket escalated successfully');
        this.isLoading = false;
        this.loadDashboardData();
      },
      error: () => {
        alert('Error escalating ticket. Please try again.');
        this.isLoading = false;
      }
    });
  }

  saveTicketChanges(): void {
    if (!this.editingTicket || !this.editingTicket._id) return;
    this.isLoading = true;
    this.ticketService.adminUpdateTicket(this.editingTicket._id, this.editingTicket).subscribe({
      next: () => {
        alert('Ticket updated successfully');
        this.isLoading = false;
        this.loadDashboardData();
        this.closeEditModal();
      },
      error: () => {
        alert('Error updating ticket. Please try again.');
        this.isLoading = false;
      }
    });
  }

  // Agent related methods
  getAgentName(agent: any): string {
    if (!agent) return 'Unassigned';
    if (typeof agent === 'string') {
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
    const assignPromises = this.selectedTickets.map(ticketId =>
      this.ticketService.adminAssignTicket(ticketId, agent.id, true).toPromise()
    );
    Promise.all(assignPromises)
      .then(() => {
        alert(`${this.selectedTickets.length} tickets assigned to ${agent.name}`);
        this.selectedTickets = [];
        this.loadDashboardData();
      })
      .catch(() => {
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
    alert('Export functionality would be implemented here');
  }
  logout(): void {
    this.authService.logout();
  }
}