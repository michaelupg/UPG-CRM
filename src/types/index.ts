export type UserRole =
  | 'administrator'
  | 'management'
  | 'sales_manager'
  | 'agent'
  | 'marketing'
  | 'transaction_officer'
  | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  active: boolean;
  phone?: string;
}

export type ClientType =
  | 'Individual'
  | 'Corporate client'
  | 'Corporate tenant'
  | 'Tenant'
  | 'Buyer'
  | 'Landlord'
  | 'Investor'
  | 'Business owner'
  | 'Retail operator'
  | 'Vendor';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: ClientType;
  company?: string;
  relationshipOwner: string;
  status: 'Active' | 'Prospect' | 'Inactive' | 'VIP';
  activeRequirementsCount: number;
  lastInteraction: string;
  notes?: string;
  createdAt: string;
}

export type EnquiryChannel =
  | 'WhatsApp'
  | 'Phone call'
  | 'Phone'
  | 'Email'
  | 'SMS'
  | 'Website'
  | 'Instagram / Facebook'
  | 'Referral'
  | 'Walk-in'
  | 'Other';

export type EnquiryStatus =
  | 'New'
  | 'Needs action'
  | 'Qualified'
  | 'Assigned'
  | 'In progress'
  | 'Closed';

export interface Enquiry {
  id: string;
  contactId?: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  channel: EnquiryChannel;
  externalReference?: string;
  receivedAt: string;
  receivedTimeAgo: string;
  originalMessage: string;
  propertyReference?: string;
  transactionType: string;
  propertyType: string;
  preferredLocation: string;
  budget: string;
  status: EnquiryStatus;
  owner: string;
  responseSlaMinutes: number;
  slaDeadline?: string;
  slaBreached?: boolean;
  duplicateMatchId?: string;
  nextAction?: string;
  followUpDate?: string;
}

export interface Requirement {
  id: string;
  contactId: string;
  clientName: string;
  transactionType: string;
  propertyType: string;
  preferredLocations: string[];
  excludedLocations: string[];
  budgetMin: number;
  budgetMax: number;
  budgetDisplay: string;
  currency: 'NGN' | 'USD';
  rentPeriod: string;
  minSizeSqm?: number;
  maxSizeSqm?: number;
  bedrooms?: number;
  businessUse?: string;
  essentialFeatures: string[];
  dealBreakers?: string;
  timing: string;
  decisionAuthority: string;
  fundingReadiness: string;
  objections?: string;
  status: 'Urgent' | 'Active' | 'Matching' | 'Fulfilled' | 'Archived';
  createdAt: string;
}

export interface Property {
  id: string;
  reference: string;
  title: string;
  propertyType: string;
  location: string;
  area: string;
  city: string;
  priceAmount: number;
  priceDisplay: string;
  currency: 'NGN' | 'USD';
  paymentFrequency: string;
  sizeSqm: number;
  bedrooms?: number;
  bathrooms?: number;
  specifications: string;
  amenities: string[];
  availability: 'Available' | 'Under offer' | 'Let / sold' | 'On hold' | 'Verification required';
  source: string;
  images: string[];
  featured?: boolean;
}

export type OpportunityStage =
  | 'New enquiry'
  | 'Qualified'
  | 'Inspection'
  | 'Negotiation'
  | 'Closing'
  | 'Won'
  | 'Lost';

export interface Opportunity {
  id: string;
  contactId: string;
  clientName: string;
  title: string;
  requirementSummary: string;
  propertyId?: string;
  propertyRef?: string;
  stage: OpportunityStage;
  owner: string;
  expectedCloseDate: string;
  potentialValue: number;
  potentialValueDisplay: string;
  expectedCommission: number;
  expectedCommissionDisplay: string;
  probability: number;
  leadScore: number;
  lostReason?: string;
  nextAction: string;
  nextActionDue: string;
  priority: 'High' | 'Medium' | 'Low';
  createdAt: string;
  transactionType: string;
}

export interface Activity {
  id: string;
  contactId?: string;
  clientName: string;
  activityType: string;
  outcome: string;
  durationMinutes?: number;
  owner: string;
  notes: string;
  nextAction?: string;
  followUpDate?: string;
  timestamp: string;
  channel?: string;
}

export interface Task {
  id: string;
  title: string;
  contactId?: string;
  clientName: string;
  opportunityId?: string;
  taskType: string;
  owner: string;
  dueDate: string;
  dueTime: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'open' | 'completed';
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface Inspection {
  id: string;
  contactId: string;
  clientName: string;
  propertyId: string;
  propertyRef: string;
  propertyTitle: string;
  scheduledDate: string;
  scheduledTime: string;
  attendees: string[];
  confirmed: boolean;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  agentName: string;
  feedbackNotes?: string;
  clientObjections?: string;
  nextSteps?: string;
}

export interface Transaction {
  id: string;
  opportunityId: string;
  contactId: string;
  clientName: string;
  propertyId: string;
  propertyRef: string;
  propertyTitle: string;
  transactionType: string;
  agreedAmount: number;
  agreedAmountDisplay: string;
  commissionRatePercent: number;
  totalCommission: number;
  totalCommissionDisplay: string;
  cashReceived: number;
  cashReceivedDisplay: string;
  balancePending: number;
  closingStatus: 'Draft agreement' | 'Awaiting payment' | 'Payment verified' | 'Handover scheduled' | 'Completed';
  legalDocuments: { name: string; status: 'Draft' | 'Sent' | 'Signed' | 'Approved' }[];
  handoverDate?: string;
  createdAt: string;
}

export interface StaffPerformanceRecord {
  agentName: string;
  conversations: number;
  inspections: number;
  compliancePercent: number;
  dealsWon: number;
  totalCommission: string;
  responseTimeMinutes: number;
  dialAttempts: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  active: boolean;
  executionCount: number;
  lastTriggered?: string;
}

export interface OmnichannelAdapter {
  id: string;
  name: string;
  channel: string;
  status: 'connected' | 'configured' | 'needs_credentials';
  provider: string;
  webhookUrl: string;
  credentialsRequired: string[];
  lastPing?: string;
  notes: string;
}

export interface PropertyMatchResult {
  property: Property;
  score: number;
  hardConstraintsMet: boolean;
  matchReasons: string[];
  missingDataNotes: string[];
}
