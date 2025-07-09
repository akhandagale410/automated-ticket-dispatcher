import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Ticket, 
  TicketStats, 
  TicketAgingData, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  EscalateTicketRequest,
  AgentWorkload,
  AdminTicketUpdateRequest
} from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:3000/api/tickets';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Get all tickets for the authenticated customer
  getAllTickets(): Observable<{ tickets: Ticket[] }> {
    return this.http.get<{ tickets: Ticket[] }>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  // Get tickets assigned to the current agent
  getMyAgentTickets(): Observable<{ tickets: Ticket[] }> {
    return this.http.get<{ tickets: Ticket[] }>(`${this.apiUrl}/agent/my-tickets`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get unassigned tickets for agents to pick up
  getUnassignedTickets(): Observable<{ tickets: Ticket[] }> {
    return this.http.get<{ tickets: Ticket[] }>(`${this.apiUrl}/agent/unassigned`, {
      headers: this.getAuthHeaders()
    });
  }

  // Assign ticket to agent (or self if no agentId provided)
  assignTicket(id: string, agentId?: string): Observable<{ message: string; ticket: Ticket }> {
    const body = agentId ? { agentId } : {};
    return this.http.post<{ message: string; ticket: Ticket }>(`${this.apiUrl}/${id}/assign`, body, {
      headers: this.getAuthHeaders()
    });
  }

  // Get a specific ticket by ID
  getTicket(id: string): Observable<{ ticket: Ticket }> {
    return this.http.get<{ ticket: Ticket }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Create a new ticket
  createTicket(ticketData: CreateTicketRequest): Observable<{ message: string; ticket: Ticket }> {
    return this.http.post<{ message: string; ticket: Ticket }>(this.apiUrl, ticketData, {
      headers: this.getAuthHeaders()
    });
  }

  // Update a ticket
  updateTicket(id: string, ticketData: UpdateTicketRequest): Observable<{ message: string; ticket: Ticket }> {
    return this.http.put<{ message: string; ticket: Ticket }>(`${this.apiUrl}/${id}`, ticketData, {
      headers: this.getAuthHeaders()
    });
  }

  // Delete a ticket
  deleteTicket(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Escalate a ticket
  escalateTicket(id: string, escalationData: EscalateTicketRequest): Observable<{ message: string; ticket: Ticket }> {
    return this.http.post<{ message: string; ticket: Ticket }>(`${this.apiUrl}/${id}/escalate`, escalationData, {
      headers: this.getAuthHeaders()
    });
  }

  // Add comment to a ticket
  addComment(id: string, comment: string): Observable<{ message: string; ticket: Ticket }> {
    return this.http.post<{ message: string; ticket: Ticket }>(`${this.apiUrl}/${id}/comment`, { comment }, {
      headers: this.getAuthHeaders()
    });
  }

  // Get ticket statistics for dashboard
  getTicketStats(): Observable<TicketStats> {
    return this.http.get<TicketStats>(`${this.apiUrl}/stats/dashboard`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get ticket aging data for graph
  getTicketAging(): Observable<TicketAgingData> {
    return this.http.get<TicketAgingData>(`${this.apiUrl}/stats/aging`, {
      headers: this.getAuthHeaders()
    });
  }

  // Admin-specific methods
  
  // Get all tickets with advanced filtering for admin
  getAdminTickets(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    escalated?: boolean;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
  }): Observable<{ tickets: Ticket[] }> {
    let queryParams = new HttpParams();
    
    if (filters) {
      if (filters.status) queryParams = queryParams.set('status', filters.status);
      if (filters.priority) queryParams = queryParams.set('priority', filters.priority);
      if (filters.assignedTo) queryParams = queryParams.set('assignedTo', filters.assignedTo);
      if (filters.escalated !== undefined) queryParams = queryParams.set('escalated', filters.escalated.toString());
      if (filters.fromDate) queryParams = queryParams.set('fromDate', filters.fromDate.toISOString());
      if (filters.toDate) queryParams = queryParams.set('toDate', filters.toDate.toISOString());
      if (filters.search) queryParams = queryParams.set('search', filters.search);
    }
    
    return this.http.get<{ tickets: Ticket[] }>(`${this.apiUrl}/admin/tickets`, {
      headers: this.getAuthHeaders(),
      params: queryParams
    });
  }
  
  // Get agent workload info for admin
  getAgentsWorkload(): Observable<{ agents: AgentWorkload[] }> {
    return this.http.get<{ agents: AgentWorkload[] }>(`${this.apiUrl}/admin/agents-workload`, {
      headers: this.getAuthHeaders()
    });
  }
  
  // Admin manually assign ticket to specific agent
  adminAssignTicket(ticketId: string, agentId: string, overrideCapacity = false): Observable<{ message: string; ticket: Ticket; agent: any }> {
    return this.http.post<{ message: string; ticket: Ticket; agent: any }>(
      `${this.apiUrl}/admin/assign/${ticketId}/${agentId}`,
      { overrideCapacity },
      { headers: this.getAuthHeaders() }
    );
  }
  
  // Advanced ticket update with admin privileges
  adminUpdateTicket(id: string, ticketData: AdminTicketUpdateRequest): Observable<{ message: string; ticket: Ticket; changesApplied: string[] }> {
    return this.http.put<{ message: string; ticket: Ticket; changesApplied: string[] }>(
      `${this.apiUrl}/admin/ticket/${id}`,
      ticketData,
      { headers: this.getAuthHeaders() }
    );
  }
  
  // Bulk update tickets (admin only)
  adminBulkUpdateTickets(ticketIds: string[], updates: { status?: string; priority?: string; notes?: string }): Observable<{ message: string; results: any[] }> {
    return this.http.post<{ message: string; results: any[] }>(
      `${this.apiUrl}/admin/bulk-update`,
      {
        ticketIds,
        ...updates
      },
      { headers: this.getAuthHeaders() }
    );
  }

  // Fetch agent details by ID
  getAgentById(agentId: string): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/agents/${agentId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
