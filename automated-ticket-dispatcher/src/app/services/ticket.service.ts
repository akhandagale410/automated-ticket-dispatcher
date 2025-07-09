import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Ticket, 
  TicketStats, 
  TicketAgingData, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  EscalateTicketRequest 
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
}
