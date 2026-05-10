export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'In Progress' | 'Converted' | 'Lost';

export interface Activity {
  id: string;
  leadId: string;
  note: string;
  action: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  source: string;
  status: LeadStatus;
  priority: number;
  createdAt: string;
  updatedAt: string;
  activities: Activity[];
  heatScore: number;
}
