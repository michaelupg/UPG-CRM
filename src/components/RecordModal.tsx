import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';

export const RecordModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    modalInitialData,
    addEnquiry,
    addContact,
    addTask,
    logActivity,
    addRequirement,
    addProperty,
    slaConfig,
    setSlaConfig,
    scoringConfig,
    setScoringConfig,
    toast,
  } = useCrm();

  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (activeModal && modalInitialData) {
      setFormData(modalInitialData);
    } else {
      setFormData({});
    }
  }, [activeModal, modalInitialData]);

  if (!activeModal || activeModal === 'ai_assistant') return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeModal === 'enquiry') {
      if (!formData.client?.trim()) {
        toast('Please enter a client name.');
        return;
      }
      addEnquiry({
        clientName: formData.client,
        clientPhone: formData.phone || '+234 803 000 0000',
        clientEmail: formData.email || '',
        channel: formData.channel || 'WhatsApp',
        transactionType: formData.type || 'Commercial leasing',
        propertyType: formData.propertyType || 'Office',
        preferredLocation: formData.location || 'Lekki Phase 1',
        budget: formData.budget || '₦25m–₦35m per year',
        originalMessage: formData.request || 'Client requested property information.',
        owner: formData.owner || 'Amaka Eze',
        responseSlaMinutes: 15,
        status: 'New',
        nextAction: formData.nextAction || 'Send property shortlist',
        followUpDate: formData.due || new Date().toISOString().split('T')[0],
      });
    } else if (activeModal === 'client') {
      if (!formData.name?.trim()) {
        toast('Please enter the client name.');
        return;
      }
      addContact({
        name: formData.name,
        phone: formData.phone || '+234 800 000 0000',
        email: formData.email || '',
        type: formData.type || 'Individual',
        company: formData.company || '',
        relationshipOwner: formData.owner || 'Amaka Eze',
        status: 'Active',
      });
    } else if (activeModal === 'task') {
      if (!formData.title?.trim()) {
        toast('Please enter a task title.');
        return;
      }
      addTask({
        title: formData.title,
        clientName: formData.client || '',
        taskType: formData.type || 'Follow-up',
        owner: formData.owner || 'Amaka Eze',
        dueDate: formData.due || new Date().toISOString().split('T')[0],
        dueTime: '12:00 PM',
        priority: formData.priority || 'High',
        notes: formData.notes || '',
      });
    } else if (activeModal === 'activity') {
      logActivity({
        clientName: formData.client || 'Client',
        activityType: formData.type || 'Inbound call',
        outcome: formData.outcome || 'Connected',
        durationMinutes: Number(formData.duration) || 5,
        owner: formData.owner || 'Amaka Eze',
        notes: formData.notes || 'Activity recorded with client.',
        nextAction: formData.nextAction || '',
        followUpDate: formData.due || '',
      });
    } else if (activeModal === 'requirement') {
      if (!formData.client?.trim()) {
        toast('Please enter the client name.');
        return;
      }
      const budgetMax = Number(formData.budget?.replace(/[^0-9]/g, '')) || 30000000;
      addRequirement({
        contactId: `c-${Date.now()}`,
        clientName: formData.client,
        transactionType: formData.type || 'Commercial leasing',
        propertyType: formData.propertyType || 'Office',
        preferredLocations: formData.location ? [formData.location] : ['Lekki Phase 1'],
        excludedLocations: [],
        budgetMin: Math.round(budgetMax * 0.7),
        budgetMax: budgetMax,
        budgetDisplay: formData.budget || '₦25m–₦35m / year',
        currency: 'NGN',
        rentPeriod: 'per annum',
        essentialFeatures: ['24/7 Power', 'Backup Generator', 'Dedicated Parking'],
        dealBreakers: formData.notes || '',
        timing: formData.timing || 'Within 30 days',
        decisionAuthority: 'Sole decision maker',
        fundingReadiness: 'Proof of funds ready',
        status: 'Active',
      });
    } else if (activeModal === 'property') {
      if (!formData.ref?.trim()) {
        toast('Please enter property reference.');
        return;
      }
      const priceAmount = Number(formData.price?.replace(/[^0-9]/g, '')) || 30000000;
      addProperty({
        reference: formData.ref,
        title: formData.title || 'Executive Commercial Property',
        propertyType: formData.type || 'Office',
        location: formData.location || 'Lekki Phase 1',
        area: 'Commercial District',
        city: 'Lagos',
        priceAmount: priceAmount,
        priceDisplay: formData.price || '₦30m / year',
        currency: 'NGN',
        paymentFrequency: 'per annum',
        sizeSqm: 380,
        specifications: formData.specs || 'Open plan, VRV air conditioning, high speed internet.',
        amenities: ['24/7 Power', 'Dedicated Parking', 'Security'],
        availability: (formData.availability as any) || 'Available',
        source: 'Exclusive Mandate',
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'],
      });
    } else if (activeModal === 'sla') {
      setSlaConfig({
        highIntentMinutes: Number(formData.high) || 5,
        standardMinutes: Number(formData.standard) || 15,
        businessStart: formData.start || '09:00',
        businessEnd: formData.end || '17:00',
      });
      toast('SLA targets updated.');
    } else if (activeModal === 'scoring') {
      setScoringConfig({
        budgetWeight: Number(formData.budget) || 25,
        urgencyWeight: Number(formData.urgency) || 20,
        clarityWeight: Number(formData.clarity) || 15,
        authorityWeight: Number(formData.authority) || 15,
        engagementWeight: Number(formData.engagement) || 15,
        marketFitWeight: Number(formData.market) || 10,
      });
      toast('Scoring model updated.');
    }

    closeModal();
  };

  const getModalConfig = () => {
    switch (activeModal) {
      case 'enquiry':
        return {
          title: 'Capture new enquiry',
          button: 'Save enquiry',
        };
      case 'client':
        return {
          title: 'Add client',
          button: 'Save client',
        };
      case 'task':
        return {
          title: 'Create follow-up task',
          button: 'Save task',
        };
      case 'activity':
        return {
          title: 'Log client activity',
          button: 'Save activity',
        };
      case 'requirement':
        return {
          title: 'Add client requirement',
          button: 'Save requirement',
        };
      case 'property':
        return {
          title: 'Add property',
          button: 'Save property',
        };
      case 'sla':
        return {
          title: 'Response SLA settings',
          button: 'Save settings',
        };
      case 'scoring':
        return {
          title: 'Lead scoring model',
          button: 'Save scoring model',
        };
      default:
        return {
          title: 'Record form',
          button: 'Save',
        };
    }
  };

  const config = getModalConfig();

  return (
    <div
      className="modal-backdrop"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
          closeModal();
        }
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <h3>{config.title}</h3>
          <button className="close" onClick={closeModal} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* ENQUIRY MODAL */}
            {activeModal === 'enquiry' && (
              <>
                <div className="field">
                  <label>Client name</label>
                  <input
                    name="client"
                    placeholder="e.g. David Okafor"
                    value={formData.client || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field">
                  <label>Phone number</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+234…"
                    value={formData.phone || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Email address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="client@example.com"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Channel</label>
                  <select
                    name="channel"
                    value={formData.channel || 'WhatsApp'}
                    onChange={handleChange}
                  >
                    <option>WhatsApp</option>
                    <option>Phone call</option>
                    <option>Email</option>
                    <option>SMS</option>
                    <option>Website</option>
                    <option>Instagram / Facebook</option>
                    <option>Referral</option>
                    <option>Walk-in</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Transaction type</label>
                  <select
                    name="type"
                    value={formData.type || 'Commercial leasing'}
                    onChange={handleChange}
                  >
                    <option>Commercial leasing</option>
                    <option>Residential letting</option>
                    <option>Property sale</option>
                    <option>Land acquisition</option>
                    <option>Property management</option>
                    <option>Investment advisory</option>
                  </select>
                </div>
                <div className="field">
                  <label>Property type</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType || 'Office'}
                    onChange={handleChange}
                  >
                    <option>Office</option>
                    <option>Retail shop</option>
                    <option>Restaurant</option>
                    <option>Warehouse</option>
                    <option>Industrial</option>
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Land</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Preferred location</label>
                  <input
                    name="location"
                    placeholder="e.g. Lekki Phase 1"
                    value={formData.location || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Budget</label>
                  <input
                    name="budget"
                    placeholder="e.g. ₦25m–₦35m per year"
                    value={formData.budget || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field full">
                  <label>Client request</label>
                  <textarea
                    name="request"
                    placeholder="Capture the client’s exact request, must-haves and questions."
                    value={formData.request || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Assigned agent</label>
                  <select
                    name="owner"
                    value={formData.owner || 'Amaka Eze'}
                    onChange={handleChange}
                  >
                    <option>Amaka Eze</option>
                    <option>Chidi Okoro</option>
                    <option>Femi Adebayo</option>
                    <option>Kunle James</option>
                    <option>Unassigned</option>
                  </select>
                </div>
                <div className="field">
                  <label>Next action</label>
                  <input
                    name="nextAction"
                    placeholder="e.g. Send matching properties"
                    value={formData.nextAction || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Follow-up date</label>
                  <input
                    name="due"
                    type="date"
                    value={formData.due || ''}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* CLIENT MODAL */}
            {activeModal === 'client' && (
              <>
                <div className="field">
                  <label>Full name</label>
                  <input
                    name="name"
                    placeholder="Full name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field">
                  <label>Phone number</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+234…"
                    value={formData.phone || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Email address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="client@example.com"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Client type</label>
                  <select
                    name="type"
                    value={formData.type || 'Individual'}
                    onChange={handleChange}
                  >
                    <option>Individual</option>
                    <option>Corporate client</option>
                    <option>Tenant</option>
                    <option>Buyer</option>
                    <option>Landlord</option>
                    <option>Investor</option>
                    <option>Vendor</option>
                  </select>
                </div>
                <div className="field">
                  <label>Company</label>
                  <input
                    name="company"
                    placeholder="Company name"
                    value={formData.company || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Relationship owner</label>
                  <select
                    name="owner"
                    value={formData.owner || 'Amaka Eze'}
                    onChange={handleChange}
                  >
                    <option>Amaka Eze</option>
                    <option>Chidi Okoro</option>
                    <option>Femi Adebayo</option>
                    <option>Kunle James</option>
                    <option>Unassigned</option>
                  </select>
                </div>
              </>
            )}

            {/* TASK MODAL */}
            {activeModal === 'task' && (
              <>
                <div className="field">
                  <label>Task title</label>
                  <input
                    name="title"
                    placeholder="e.g. Call client about offer"
                    value={formData.title || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field">
                  <label>Related client</label>
                  <input
                    name="client"
                    placeholder="Client name"
                    value={formData.client || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Task type</label>
                  <select
                    name="type"
                    value={formData.type || 'Call'}
                    onChange={handleChange}
                  >
                    <option>Call</option>
                    <option>WhatsApp</option>
                    <option>Email</option>
                    <option>SMS</option>
                    <option>Inspection</option>
                    <option>Meeting</option>
                    <option>Send property shortlist</option>
                    <option>Prepare offer</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Assigned agent</label>
                  <select
                    name="owner"
                    value={formData.owner || 'Amaka Eze'}
                    onChange={handleChange}
                  >
                    <option>Amaka Eze</option>
                    <option>Chidi Okoro</option>
                    <option>Femi Adebayo</option>
                    <option>Kunle James</option>
                  </select>
                </div>
                <div className="field">
                  <label>Due date</label>
                  <input
                    name="due"
                    type="date"
                    value={formData.due || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={formData.priority || 'High'}
                    onChange={handleChange}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div className="field full">
                  <label>Task notes</label>
                  <textarea
                    name="notes"
                    placeholder="What needs to happen?"
                    value={formData.notes || ''}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* ACTIVITY MODAL */}
            {activeModal === 'activity' && (
              <>
                <div className="field">
                  <label>Client name</label>
                  <input
                    name="client"
                    placeholder="Client name"
                    value={formData.client || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field">
                  <label>Activity type</label>
                  <select
                    name="type"
                    value={formData.type || 'Inbound call'}
                    onChange={handleChange}
                  >
                    <option>Inbound call</option>
                    <option>Outbound call</option>
                    <option>WhatsApp message</option>
                    <option>Email sent</option>
                    <option>Email received</option>
                    <option>SMS</option>
                    <option>Inspection</option>
                    <option>Meeting</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Outcome</label>
                  <select
                    name="outcome"
                    value={formData.outcome || 'Connected'}
                    onChange={handleChange}
                  >
                    <option>Connected</option>
                    <option>No answer</option>
                    <option>Message sent</option>
                    <option>Replied</option>
                    <option>Inspection completed</option>
                    <option>Rescheduled</option>
                    <option>Client not interested</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Duration (minutes)</label>
                  <input
                    name="duration"
                    type="number"
                    placeholder="e.g. 4"
                    value={formData.duration || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Assigned agent</label>
                  <select
                    name="owner"
                    value={formData.owner || 'Amaka Eze'}
                    onChange={handleChange}
                  >
                    <option>Amaka Eze</option>
                    <option>Chidi Okoro</option>
                    <option>Femi Adebayo</option>
                    <option>Kunle James</option>
                  </select>
                </div>
                <div className="field">
                  <label>Next action</label>
                  <input
                    name="nextAction"
                    placeholder="What should happen next?"
                    value={formData.nextAction || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field full">
                  <label>Activity notes</label>
                  <textarea
                    name="notes"
                    placeholder="Conversation summary, objections and commitments."
                    value={formData.notes || ''}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* REQUIREMENT MODAL */}
            {activeModal === 'requirement' && (
              <>
                <div className="field">
                  <label>Client name</label>
                  <input
                    name="client"
                    placeholder="Client name"
                    value={formData.client || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field">
                  <label>Transaction type</label>
                  <select
                    name="type"
                    value={formData.type || 'Commercial leasing'}
                    onChange={handleChange}
                  >
                    <option>Commercial leasing</option>
                    <option>Residential letting</option>
                    <option>Property sale</option>
                    <option>Land acquisition</option>
                    <option>Property management</option>
                    <option>Investment</option>
                  </select>
                </div>
                <div className="field">
                  <label>Property type</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType || 'Office'}
                    onChange={handleChange}
                  >
                    <option>Office</option>
                    <option>Retail</option>
                    <option>Restaurant</option>
                    <option>Warehouse</option>
                    <option>Industrial</option>
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Land</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Preferred location</label>
                  <input
                    name="location"
                    placeholder="Location and acceptable alternatives"
                    value={formData.location || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Budget range</label>
                  <input
                    name="budget"
                    placeholder="Include currency and rent period"
                    value={formData.budget || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Size / specifications</label>
                  <input
                    name="specs"
                    placeholder="e.g. 300–500 sqm"
                    value={formData.specs || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Timing</label>
                  <select
                    name="timing"
                    value={formData.timing || 'Immediate'}
                    onChange={handleChange}
                  >
                    <option>Immediate</option>
                    <option>Within 30 days</option>
                    <option>Within 60 days</option>
                    <option>Within 90 days</option>
                    <option>Future / flexible</option>
                  </select>
                </div>
                <div className="field full">
                  <label>Must-haves and deal-breakers</label>
                  <textarea
                    name="notes"
                    placeholder="Essential features, excluded areas and other conditions."
                    value={formData.notes || ''}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* PROPERTY MODAL */}
            {activeModal === 'property' && (
              <>
                <div className="field">
                  <label>Property reference</label>
                  <input
                    name="ref"
                    placeholder="e.g. UPG-OF-0105"
                    value={formData.ref || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field">
                  <label>Property title</label>
                  <input
                    name="title"
                    placeholder="e.g. Serviced office, 420 sqm"
                    value={formData.title || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Property type</label>
                  <select
                    name="type"
                    value={formData.type || 'Office'}
                    onChange={handleChange}
                  >
                    <option>Office</option>
                    <option>Retail</option>
                    <option>Restaurant</option>
                    <option>Warehouse</option>
                    <option>Industrial</option>
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Land</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Location</label>
                  <input
                    name="location"
                    placeholder="Area, street or estate"
                    value={formData.location || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Asking price / rent</label>
                  <input
                    name="price"
                    placeholder="Amount and payment period"
                    value={formData.price || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Availability</label>
                  <select
                    name="availability"
                    value={formData.availability || 'Available'}
                    onChange={handleChange}
                  >
                    <option>Available</option>
                    <option>Under offer</option>
                    <option>Let / sold</option>
                    <option>On hold</option>
                    <option>Verification required</option>
                  </select>
                </div>
                <div className="field full">
                  <label>Key specifications</label>
                  <textarea
                    name="specs"
                    placeholder="Size, facilities, restrictions and availability notes."
                    value={formData.specs || ''}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* SLA MODAL */}
            {activeModal === 'sla' && (
              <>
                <div className="field">
                  <label>High-intent response target (minutes)</label>
                  <input
                    name="high"
                    type="number"
                    defaultValue={slaConfig.highIntentMinutes}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Standard response target (minutes)</label>
                  <input
                    name="standard"
                    type="number"
                    defaultValue={slaConfig.standardMinutes}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Business start time</label>
                  <input
                    name="start"
                    defaultValue={slaConfig.businessStart}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Business end time</label>
                  <input
                    name="end"
                    defaultValue={slaConfig.businessEnd}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* SCORING MODAL */}
            {activeModal === 'scoring' && (
              <>
                <div className="field">
                  <label>Budget fit weight (%)</label>
                  <input
                    name="budget"
                    type="number"
                    defaultValue={scoringConfig.budgetWeight}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Urgency weight (%)</label>
                  <input
                    name="urgency"
                    type="number"
                    defaultValue={scoringConfig.urgencyWeight}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Requirement clarity weight (%)</label>
                  <input
                    name="clarity"
                    type="number"
                    defaultValue={scoringConfig.clarityWeight}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Decision authority weight (%)</label>
                  <input
                    name="authority"
                    type="number"
                    defaultValue={scoringConfig.authorityWeight}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Engagement weight (%)</label>
                  <input
                    name="engagement"
                    type="number"
                    defaultValue={scoringConfig.engagementWeight}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Market fit weight (%)</label>
                  <input
                    name="market"
                    type="number"
                    defaultValue={scoringConfig.marketFitWeight}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-foot">
            <button type="button" className="btn secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn">
              {config.button}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
