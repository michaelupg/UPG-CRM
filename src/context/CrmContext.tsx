import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Contact,
  Enquiry,
  Requirement,
  Property,
  Opportunity,
  OpportunityStage,
  Activity,
  Task,
  Inspection,
  Transaction,
  StaffPerformanceRecord,
  AutomationRule,
  OmnichannelAdapter,
  User,
  UserRole,
} from '../types';
import {
  SEED_USERS,
  SEED_CONTACTS,
  SEED_PROPERTIES,
  SEED_REQUIREMENTS,
  SEED_ENQUIRIES,
  SEED_OPPORTUNITIES,
  SEED_TASKS,
  SEED_ACTIVITIES,
  SEED_INSPECTIONS,
  SEED_TRANSACTIONS,
  SEED_STAFF_PERFORMANCE,
  SEED_AUTOMATION_RULES,
  SEED_OMNICHANNEL_ADAPTERS,
} from '../data/seedData';

export type CrmView =
  | 'dashboard'
  | 'inbox'
  | 'clients'
  | 'leads'
  | 'requirements'
  | 'properties'
  | 'tasks'
  | 'communications'
  | 'inspections'
  | 'transactions'
  | 'performance'
  | 'reports'
  | 'settings';

interface ToastState {
  id: number;
  message: string;
}

interface SlaConfig {
  highIntentMinutes: number;
  standardMinutes: number;
  businessStart: string;
  businessEnd: string;
}

interface ScoringConfig {
  budgetWeight: number;
  urgencyWeight: number;
  clarityWeight: number;
  authorityWeight: number;
  engagementWeight: number;
  marketFitWeight: number;
}

interface CrmContextType {
  currentView: CrmView;
  setCurrentView: (view: CrmView) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  setUserRole: (role: UserRole) => void;
  users: User[];
  
  // Collections
  contacts: Contact[];
  enquiries: Enquiry[];
  requirements: Requirement[];
  properties: Property[];
  opportunities: Opportunity[];
  tasks: Task[];
  activities: Activity[];
  inspections: Inspection[];
  transactions: Transaction[];
  staffPerformance: StaffPerformanceRecord[];
  automationRules: AutomationRule[];
  omnichannelAdapters: OmnichannelAdapter[];

  // Settings
  slaConfig: SlaConfig;
  setSlaConfig: React.Dispatch<React.SetStateAction<SlaConfig>>;
  scoringConfig: ScoringConfig;
  setScoringConfig: React.Dispatch<React.SetStateAction<ScoringConfig>>;

  // Actions
  addEnquiry: (enquiry: Omit<Enquiry, 'id' | 'receivedAt' | 'receivedTimeAgo'>) => void;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'lastInteraction' | 'activeRequirementsCount'>) => void;
  addRequirement: (requirement: Omit<Requirement, 'id' | 'createdAt'>) => void;
  addProperty: (property: Omit<Property, 'id'>) => void;
  addOpportunity: (opp: Omit<Opportunity, 'id' | 'createdAt'>) => void;
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  toggleTask: (taskId: string) => void;
  logActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  addInspection: (inspection: Omit<Inspection, 'id'>) => void;
  updateInspectionStatus: (id: string, status: Inspection['status'], feedback?: string, objections?: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateOpportunityStage: (id: string, nextStage: OpportunityStage, reasonOrValue?: string) => boolean;
  toggleAutomationRule: (id: string) => void;

  // Modals & Drawers
  activeModal: string | null;
  openModal: (type: string, initialData?: any) => void;
  closeModal: () => void;
  modalInitialData: any;
  
  selectedClient360: Contact | null;
  setSelectedClient360: (contact: Contact | null) => void;

  // Search & Global state
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  
  // Toast
  toast: (msg: string) => void;
  toastState: ToastState | null;

  // Reset to seed
  resetToSeedData: () => void;
}

const STORAGE_KEY = 'upg_real_estate_crm_store_v2';

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<CrmView>('dashboard');
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]);

  const [contacts, setContacts] = useState<Contact[]>(SEED_CONTACTS);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(SEED_ENQUIRIES);
  const [requirements, setRequirements] = useState<Requirement[]>(SEED_REQUIREMENTS);
  const [properties, setProperties] = useState<Property[]>(SEED_PROPERTIES);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(SEED_OPPORTUNITIES);
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [activities, setActivities] = useState<Activity[]>(SEED_ACTIVITIES);
  const [inspections, setInspections] = useState<Inspection[]>(SEED_INSPECTIONS);
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformanceRecord[]>(SEED_STAFF_PERFORMANCE);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(SEED_AUTOMATION_RULES);
  const [omnichannelAdapters, setOmnichannelAdapters] = useState<OmnichannelAdapter[]>(SEED_OMNICHANNEL_ADAPTERS);

  const [slaConfig, setSlaConfig] = useState<SlaConfig>({
    highIntentMinutes: 5,
    standardMinutes: 15,
    businessStart: '09:00',
    businessEnd: '17:00',
  });

  const [scoringConfig, setScoringConfig] = useState<ScoringConfig>({
    budgetWeight: 25,
    urgencyWeight: 20,
    clarityWeight: 15,
    authorityWeight: 15,
    engagementWeight: 15,
    marketFitWeight: 10,
  });

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const [selectedClient360, setSelectedClient360] = useState<Contact | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [toastState, setToastState] = useState<ToastState | null>(null);

  // Initialize from LocalStorage or seed data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.contacts) setContacts(parsed.contacts);
        if (parsed.enquiries) setEnquiries(parsed.enquiries);
        if (parsed.requirements) setRequirements(parsed.requirements);
        if (parsed.properties) setProperties(parsed.properties);
        if (parsed.opportunities) setOpportunities(parsed.opportunities);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.activities) setActivities(parsed.activities);
        if (parsed.inspections) setInspections(parsed.inspections);
        if (parsed.transactions) setTransactions(parsed.transactions);
      }
    } catch {
      // LocalStorage access issue, proceed with in-memory seed
    }
  }, []);

  // Save to LocalStorage on updates
  useEffect(() => {
    try {
      const stateToSave = {
        contacts,
        enquiries,
        requirements,
        properties,
        opportunities,
        tasks,
        activities,
        inspections,
        transactions,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // Ignore storage write failure
    }
  }, [contacts, enquiries, requirements, properties, opportunities, tasks, activities, inspections, transactions]);

  const toast = (message: string) => {
    const id = Date.now();
    setToastState({ id, message });
    setTimeout(() => {
      setToastState((curr) => (curr?.id === id ? null : curr));
    }, 3200);
  };

  const openModal = (type: string, initialData?: any) => {
    setActiveModal(type);
    setModalInitialData(initialData || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalInitialData(null);
  };

  const setUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
    }));
    toast(`Switched view to role: ${role.replace('_', ' ').toUpperCase()}`);
  };

  const resetToSeedData = () => {
    setContacts(SEED_CONTACTS);
    setEnquiries(SEED_ENQUIRIES);
    setRequirements(SEED_REQUIREMENTS);
    setProperties(SEED_PROPERTIES);
    setOpportunities(SEED_OPPORTUNITIES);
    setTasks(SEED_TASKS);
    setActivities(SEED_ACTIVITIES);
    setInspections(SEED_INSPECTIONS);
    setTransactions(SEED_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEY);
    toast('CRM reset to authoritative seed dataset.');
  };

  const addEnquiry = (enquiryData: Omit<Enquiry, 'id' | 'receivedAt' | 'receivedTimeAgo'>) => {
    const newId = `enq-${Date.now()}`;
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: newId,
      receivedAt: new Date().toISOString(),
      receivedTimeAgo: 'Just now',
    };

    setEnquiries((prev) => [newEnquiry, ...prev]);

    // Check if contact already exists or create new contact
    let contact = contacts.find(
      (c) => c.name.toLowerCase() === enquiryData.clientName.toLowerCase() ||
             (enquiryData.clientPhone && c.phone.includes(enquiryData.clientPhone.slice(-7)))
    );

    if (!contact) {
      const newContactId = `c-${Date.now()}`;
      const newContact: Contact = {
        id: newContactId,
        name: enquiryData.clientName,
        phone: enquiryData.clientPhone || '+234 800 000 0000',
        email: enquiryData.clientEmail || '',
        type: 'Individual',
        relationshipOwner: enquiryData.owner || 'Amaka Eze',
        status: 'Active',
        activeRequirementsCount: 1,
        lastInteraction: 'Just now',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setContacts((prev) => [newContact, ...prev]);
      contact = newContact;
    }

    // Auto-create opportunity
    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      contactId: contact.id,
      clientName: contact.name,
      title: `${enquiryData.propertyType || 'Property'} Enquiry · ${enquiryData.preferredLocation || 'Lagos'}`,
      requirementSummary: `${enquiryData.propertyType || 'Property'} · ${enquiryData.preferredLocation || 'Lagos'}`,
      stage: 'New enquiry',
      owner: enquiryData.owner || 'Amaka Eze',
      expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      potentialValue: 20000000,
      potentialValueDisplay: enquiryData.budget || '₦20,000,000',
      expectedCommission: 2000000,
      expectedCommissionDisplay: '₦2.0m',
      probability: 40,
      leadScore: 75,
      nextAction: enquiryData.nextAction || 'Send matching shortlist',
      nextActionDue: 'Due now',
      priority: 'High',
      createdAt: new Date().toISOString().split('T')[0],
      transactionType: enquiryData.transactionType || 'Commercial leasing',
    };
    setOpportunities((prev) => [newOpp, ...prev]);

    // Auto-create next action task
    if (enquiryData.nextAction) {
      const newTask: Task = {
        id: `t-${Date.now()}`,
        title: enquiryData.nextAction,
        clientName: contact.name,
        contactId: contact.id,
        opportunityId: newOpp.id,
        taskType: enquiryData.channel === 'WhatsApp' ? 'WhatsApp' : 'Call',
        owner: enquiryData.owner || 'Amaka Eze',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: 'Now',
        priority: 'High',
        status: 'open',
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    // Trigger automation log
    setAutomationRules((prev) =>
      prev.map((r) =>
        r.id === 'auto-1'
          ? { ...r, executionCount: r.executionCount + 1, lastTriggered: 'Just now' }
          : r
      )
    );

    toast(`New enquiry captured for ${enquiryData.clientName}`);
  };

  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'lastInteraction' | 'activeRequirementsCount'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `c-${Date.now()}`,
      activeRequirementsCount: 0,
      lastInteraction: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setContacts((prev) => [newContact, ...prev]);
    toast(`Client contact ${newContact.name} saved.`);
  };

  const addRequirement = (reqData: Omit<Requirement, 'id' | 'createdAt'>) => {
    const newReq: Requirement = {
      ...reqData,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setRequirements((prev) => [newReq, ...prev]);

    // Update client requirements count
    setContacts((prev) =>
      prev.map((c) =>
        c.id === reqData.contactId || c.name === reqData.clientName
          ? { ...c, activeRequirementsCount: c.activeRequirementsCount + 1, lastInteraction: 'Just now' }
          : c
      )
    );

    toast(`Requirement saved for ${reqData.clientName}. Ready for property matching.`);
  };

  const addProperty = (propertyData: Omit<Property, 'id'>) => {
    const newProperty: Property = {
      ...propertyData,
      id: `p-${Date.now()}`,
    };
    setProperties((prev) => [newProperty, ...prev]);
    toast(`Property ${newProperty.reference} added to inventory.`);
  };

  const addOpportunity = (oppData: Omit<Opportunity, 'id' | 'createdAt'>) => {
    const newOpp: Opportunity = {
      ...oppData,
      id: `opp-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOpportunities((prev) => [newOpp, ...prev]);
    toast(`Opportunity created for ${oppData.clientName}.`);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: `t-${Date.now()}`,
      status: 'open',
    };
    setTasks((prev) => [newTask, ...prev]);
    toast(`Task "${newTask.title}" scheduled.`);
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'open' ? 'completed' : 'open';
          if (nextStatus === 'completed') {
            toast('Task marked complete.');
          } else {
            toast('Task reopened.');
          }
          return {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
            completedBy: currentUser.name,
          };
        }
        return t;
      })
    );
  };

  const logActivity = (actData: Omit<Activity, 'id' | 'timestamp'>) => {
    const newAct: Activity = {
      ...actData,
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
    };
    setActivities((prev) => [newAct, ...prev]);

    // Update contact last interaction
    setContacts((prev) =>
      prev.map((c) =>
        c.name === actData.clientName ? { ...c, lastInteraction: 'Just now' } : c
      )
    );

    // If next action provided, create task
    if (actData.nextAction) {
      const newTask: Task = {
        id: `t-${Date.now()}`,
        title: actData.nextAction,
        clientName: actData.clientName,
        taskType: 'Follow-up',
        owner: actData.owner,
        dueDate: actData.followUpDate || new Date().toISOString().split('T')[0],
        dueTime: '12:00 PM',
        priority: 'High',
        status: 'open',
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    // Update staff conversation metric
    if (actData.activityType.includes('call') || actData.activityType.includes('Meeting') || actData.activityType.includes('Inspection')) {
      setStaffPerformance((prev) =>
        prev.map((s) =>
          s.agentName === actData.owner
            ? { ...s, conversations: s.conversations + 1, dialAttempts: s.dialAttempts + 1 }
            : s
        )
      );
    }

    toast('Activity logged successfully.');
  };

  const addInspection = (inspData: Omit<Inspection, 'id'>) => {
    const newInsp: Inspection = {
      ...inspData,
      id: `insp-${Date.now()}`,
    };
    setInspections((prev) => [newInsp, ...prev]);

    // Also schedule follow-up task
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title: `Conduct inspection at ${inspData.propertyRef}`,
      clientName: inspData.clientName,
      contactId: inspData.contactId,
      taskType: 'Inspection',
      owner: inspData.agentName,
      dueDate: inspData.scheduledDate,
      dueTime: inspData.scheduledTime,
      priority: 'High',
      status: 'open',
    };
    setTasks((prev) => [newTask, ...prev]);

    toast(`Inspection scheduled for ${inspData.propertyRef} on ${inspData.scheduledDate}.`);
  };

  const updateInspectionStatus = (
    id: string,
    status: Inspection['status'],
    feedback?: string,
    objections?: string
  ) => {
    setInspections((prev) =>
      prev.map((insp) => {
        if (insp.id === id) {
          if (status === 'Completed') {
            // Update staff scorecard
            setStaffPerformance((staff) =>
              staff.map((s) =>
                s.agentName === insp.agentName
                  ? { ...s, inspections: s.inspections + 1 }
                  : s
              )
            );
          }
          return {
            ...insp,
            status,
            feedbackNotes: feedback || insp.feedbackNotes,
            clientObjections: objections || insp.clientObjections,
          };
        }
        return insp;
      })
    );
    toast(`Inspection marked as ${status}.`);
  };

  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTransactions((prev) => [newTx, ...prev]);
    toast(`Transaction record generated for ${txData.propertyRef}.`);
  };

  const updateOpportunityStage = (
    oppId: string,
    nextStage: OpportunityStage,
    reasonOrValue?: string
  ): boolean => {
    // Stage validation rules
    if (nextStage === 'Lost' && !reasonOrValue) {
      toast('A lost reason must be provided when marking an opportunity as Lost.');
      return false;
    }

    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === oppId) {
          let updated = { ...opp, stage: nextStage };
          if (nextStage === 'Lost') {
            updated.lostReason = reasonOrValue || 'Unspecified';
          }
          if (nextStage === 'Won') {
            // If moved to won, auto-create transaction record
            const totalVal = opp.potentialValue;
            const comm = opp.expectedCommission || totalVal * 0.1;
            const newTx: Transaction = {
              id: `tx-${Date.now()}`,
              opportunityId: opp.id,
              contactId: opp.contactId,
              clientName: opp.clientName,
              propertyId: opp.propertyId || 'p-1',
              propertyRef: opp.propertyRef || 'UPG-REF',
              propertyTitle: opp.title,
              transactionType: opp.transactionType || 'Commercial leasing',
              agreedAmount: totalVal,
              agreedAmountDisplay: `₦${(totalVal / 1000000).toFixed(1)}m`,
              commissionRatePercent: 10,
              totalCommission: comm,
              totalCommissionDisplay: `₦${(comm / 1000000).toFixed(1)}m`,
              cashReceived: comm,
              cashReceivedDisplay: `₦${(comm / 1000000).toFixed(1)}m`,
              balancePending: 0,
              closingStatus: 'Completed',
              legalDocuments: [
                { name: 'Executed Agreement', status: 'Signed' },
                { name: 'Statutory Documentation', status: 'Approved' },
              ],
              handoverDate: new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString().split('T')[0],
            };
            setTransactions((txs) => [newTx, ...txs]);

            // Update agent scorecard
            setStaffPerformance((staff) =>
              staff.map((s) =>
                s.agentName === opp.owner
                  ? { ...s, dealsWon: s.dealsWon + 1 }
                  : s
              )
            );
          }
          return updated;
        }
        return opp;
      })
    );

    toast(`Opportunity moved to ${nextStage}`);
    return true;
  };

  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r))
    );
    toast('Automation rule toggled.');
  };

  return (
    <CrmContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentUser,
        setCurrentUser,
        setUserRole,
        users,
        contacts,
        enquiries,
        requirements,
        properties,
        opportunities,
        tasks,
        activities,
        inspections,
        transactions,
        staffPerformance,
        automationRules,
        omnichannelAdapters,
        slaConfig,
        setSlaConfig,
        scoringConfig,
        setScoringConfig,
        addEnquiry,
        addContact,
        addRequirement,
        addProperty,
        addOpportunity,
        addTask,
        toggleTask,
        logActivity,
        addInspection,
        updateInspectionStatus,
        addTransaction,
        updateOpportunityStage,
        toggleAutomationRule,
        activeModal,
        openModal,
        closeModal,
        modalInitialData,
        selectedClient360,
        setSelectedClient360,
        globalSearch,
        setGlobalSearch,
        toast,
        toastState,
        resetToSeedData,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
