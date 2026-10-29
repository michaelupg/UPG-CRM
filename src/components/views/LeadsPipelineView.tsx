import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { OpportunityStage, Opportunity } from '../../types';

export const LeadsPipelineView: React.FC = () => {
  const {
    opportunities,
    openModal,
    updateOpportunityStage,
    setSelectedClient360,
    contacts,
    globalSearch,
  } = useCrm();

  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('All transaction types');
  const [localSearch, setLocalSearch] = useState('');
  const [transitionPrompt, setTransitionPrompt] = useState<{
    oppId: string;
    targetStage: OpportunityStage;
  } | null>(null);
  const [lostReasonInput, setLostReasonInput] = useState('');

  const stages: OpportunityStage[] = [
    'New enquiry',
    'Qualified',
    'Inspection',
    'Negotiation',
    'Closing',
  ];

  const filteredOpportunities = opportunities.filter((opp) => {
    const q = (localSearch || globalSearch).toLowerCase();
    const matchesSearch =
      !q ||
      opp.clientName.toLowerCase().includes(q) ||
      opp.requirementSummary.toLowerCase().includes(q) ||
      opp.owner.toLowerCase().includes(q);

    const matchesType =
      transactionTypeFilter === 'All transaction types' ||
      opp.transactionType?.toLowerCase().includes(transactionTypeFilter.toLowerCase());

    return matchesSearch && matchesType;
  });

  const handleStageChange = (opp: Opportunity, targetStage: OpportunityStage) => {
    if (targetStage === 'Lost') {
      setTransitionPrompt({ oppId: opp.id, targetStage });
      setLostReasonInput('');
      return;
    }
    updateOpportunityStage(opp.id, targetStage);
  };

  const confirmLostTransition = () => {
    if (!transitionPrompt) return;
    updateOpportunityStage(transitionPrompt.oppId, 'Lost', lostReasonInput || 'Budget/Timing mismatch');
    setTransitionPrompt(null);
  };

  const handleCardClick = (clientName: string) => {
    const c = contacts.find((item) => item.name.toLowerCase() === clientName.toLowerCase());
    if (c) setSelectedClient360(c);
  };

  return (
    <section className="section-view active">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Leads & opportunities</h3>
            <p>Track each potential transaction from enquiry through closing</p>
          </div>
          <button className="btn" onClick={() => openModal('enquiry')}>
            ＋ New lead
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          <input
            className="table-search"
            placeholder="Search lead or requirement..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <select
            value={transactionTypeFilter}
            onChange={(e) => setTransactionTypeFilter(e.target.value)}
          >
            <option>All transaction types</option>
            <option>Commercial leasing</option>
            <option>Residential letting</option>
            <option>Property sale</option>
          </select>
          <button
            className="btn secondary small"
            onClick={() => setViewMode(viewMode === 'board' ? 'table' : 'board')}
          >
            {viewMode === 'board' ? 'Switch to table' : 'Switch to board'}
          </button>
          <span className="text-xs text-[#665d50] ml-auto font-medium">
            {filteredOpportunities.length} opportunities in pipeline
          </span>
        </div>

        {/* Board View */}
        {viewMode === 'board' && (
          <div className="kanban">
            {stages.map((stage) => {
              const stageDeals = filteredOpportunities.filter((o) => o.stage === stage);
              return (
                <div key={stage} className="kanban-col">
                  <div className="kanban-head">
                    <span>{stage}</span>
                    <span>{stageDeals.length}</span>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {stageDeals.map((opp) => (
                      <div
                        key={opp.id}
                        className="kanban-card group relative"
                        onClick={() => handleCardClick(opp.clientName)}
                      >
                        <div className="flex justify-between items-start">
                          <strong>{opp.clientName}</strong>
                          <span className={`status ${opp.priority === 'High' ? 'hot' : 'inspection'} text-[9px]`}>
                            {opp.priority}
                          </span>
                        </div>
                        <p>{opp.requirementSummary}</p>
                        <div className="money">{opp.potentialValueDisplay}</div>
                        <p className="text-[10px] text-[#665d50]">
                          Owner: {opp.owner.split(' ')[0]} · Score: {opp.leadScore}/100
                        </p>

                        {/* Stage Progression Action Bar */}
                        <div
                          className="pt-2 mt-2 border-t border-[#f0e2d0] flex items-center justify-between text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={opp.stage}
                            onChange={(e) => handleStageChange(opp, e.target.value as OpportunityStage)}
                            className="bg-white border border-[#e8d8c4] rounded px-1.5 py-0.5 text-[10px] font-bold"
                          >
                            <option value="New enquiry">New enquiry</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Inspection">Inspection</option>
                            <option value="Negotiation">Negotiation</option>
                            <option value="Closing">Closing</option>
                            <option value="Won">Won Deal 🏆</option>
                            <option value="Lost">Mark Lost</option>
                          </select>

                          <button
                            className="text-[#57420b] font-bold text-[10px] hover:underline"
                            onClick={() => handleCardClick(opp.clientName)}
                          >
                            Dossier ↗
                          </button>
                        </div>
                      </div>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 text-[11px] text-[#887865] italic">
                        No deals at this stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Requirement</th>
                  <th>Budget</th>
                  <th>Stage</th>
                  <th>Owner</th>
                  <th>Next action</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOpportunities.map((opp) => (
                  <tr key={opp.id}>
                    <td>
                      <button
                        className="font-bold text-left text-black hover:underline"
                        onClick={() => handleCardClick(opp.clientName)}
                      >
                        {opp.clientName}
                      </button>
                    </td>
                    <td>{opp.requirementSummary}</td>
                    <td className="font-bold">{opp.potentialValueDisplay}</td>
                    <td>
                      <span className="status inspection">{opp.stage}</span>
                    </td>
                    <td>{opp.owner.split(' ')[0]}</td>
                    <td>
                      <strong>{opp.nextAction}</strong>
                      <small className="block text-[#a34128] mt-0.5">{opp.nextActionDue}</small>
                    </td>
                    <td>
                      <button
                        className="btn secondary small"
                        onClick={() => handleCardClick(opp.clientName)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stage Transition Validation Modal for 'Lost' */}
      {transitionPrompt && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '440px' }}>
            <div className="modal-head">
              <h3>Specify Reason for Lost Deal</h3>
              <button className="close" onClick={() => setTransitionPrompt(null)}>
                ×
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <p className="text-[#665d50] m-0">
                To keep conversion analytics accurate, select or write the primary objection or reason:
              </p>
              <select
                className="w-full p-2 border border-[#e8d8c4] rounded-lg bg-white"
                value={lostReasonInput}
                onChange={(e) => setLostReasonInput(e.target.value)}
              >
                <option value="">Select a reason...</option>
                <option value="Price/Budget exceeded">Price / Rent budget exceeded</option>
                <option value="Location unsuitable">Location / Access road unsuitable</option>
                <option value="Client delayed project">Client postponed expansion project</option>
                <option value="Signed with competitor">Signed competitor property</option>
                <option value="Failed power/facility requirements">Failed 24/7 power / facility requirements</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn secondary small" onClick={() => setTransitionPrompt(null)}>
                  Cancel
                </button>
                <button
                  className="btn small"
                  disabled={!lostReasonInput}
                  onClick={confirmLostTransition}
                >
                  Confirm Lost
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
