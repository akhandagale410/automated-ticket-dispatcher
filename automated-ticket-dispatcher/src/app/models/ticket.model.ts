export interface Ticket {
  _id?: string;
  subject: string;
  description: string;
  category?: string;
  domain?: string;
  product?: string;
  operation_type?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'simple' | 'moderate' | 'complex';
  severity: 'minor' | 'major' | 'critical' | 'blocker';
  type: 'incident' | 'request' | 'problem' | 'change';
  region?: string;
  country?: string;
  account?: string;
  skill_required?: string[];
  tags?: string[];
  security_restriction?: boolean;
  status: 'new' | 'assigned' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  customer?: Customer;
  assigned_to?: Agent;
  created_at?: Date;
  updated_at?: Date;
  sla_deadline?: Date;
  escalated?: boolean;
  escalation_reason?: string;
  feedback_rating?: number;
  internal_notes?: InternalNote[];
  feedback_date?: Date;
  attachments?: string[];
  history?: TicketHistory[];
}

export interface Customer {
  _id?: string;
  user?: string;
  organization?: string;
  created_at?: Date;
}

export interface Agent {
  _id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface InternalNote {
  body: string;
  addedBy: string;
  createdAt: Date;
}

export interface TicketHistory {
  status: string;
  changedAt: Date;
  changedBy: string;
}

export interface TicketStats {
  totalTickets: number;
  escalatedTickets: number;
  statusCounts: { [key: string]: number };
  priorityCounts: { [key: string]: number };
}

export interface TicketAgingData {
  ageRanges: { [key: string]: number };
  detailedData: Array<{
    id: string;
    age: number;
    status: string;
    priority: string;
  }>;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category?: string;
  domain?: string;
  product?: string;
  operation_type?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  complexity?: 'simple' | 'moderate' | 'complex';
  severity?: 'minor' | 'major' | 'critical' | 'blocker';
  type?: 'incident' | 'request' | 'problem' | 'change';
  region?: string;
  country?: string;
  account?: string;
  skill_required?: string[];
  tags?: string[];
  security_restriction?: boolean;
}

export interface UpdateTicketRequest extends Partial<CreateTicketRequest> {
  status?: 'new' | 'assigned' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
}

export interface EscalateTicketRequest {
  escalation_reason: string;
}

export interface AgentWorkload {
  id: string;
  name: string;
  email: string;
  skills: string[];
  domains: string[];
  experience: number;
  capacity: number;
  activeTickets: number;
  totalTickets: number;
  availableCapacity: number;
}

export interface AdminTicketUpdateRequest extends UpdateTicketRequest {
  escalated?: boolean;
  escalation_reason?: string;
  additionalNote?: string;
}
