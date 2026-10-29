import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { matchPropertiesForRequirement } from '../lib/matchingEngine';

export const Client360Drawer: React.FC = () => {
  const {
    selectedClient360,
    setSelectedClient360,
    requirements,
    properties,
    opportunities,
    activities,
    tasks,
    transactions,
    openModal,
    toggleTask,
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'deals' | 'timeline' | 'tasks'>('overview');

  if (!selectedClient360) return null;

  const clientName = selectedClient360.name;

  // Correlated records
  const clientReqs = requirements.filter(
    (r) => r.contactId === selectedClient360.id || r.clientName.toLowerCase() === clientName.toLowerCase()
  );

  const clientOpps = opportunities.filter(
    (o) => o.contactId === selectedClient360.id || o.clientName.toLowerCase() === clientName.toLowerCase()
  );

  const clientActivities = activities.filter(
    (a) => a.contactId === selectedClient360.id || a.clientName.toLowerCase() === clientName.toLowerCase()
  );

  const clientTasks = tasks.filter(
    (t) => t.contactId === selectedClient360.id || t.clientName.toLowerCase() === clientName.toLowerCase()
  );

  const clientTxs = transactions.filter(
    (tx) => tx.contactId === selectedClient360.id || tx.clientName.toLowerCase() === clientName.toLowerCase()
  );

  // Property matches for first requirement
  const primaryReq = clientReqs[0];
  const matchedProperties = primaryReq ? matchPropertiesForRequirement(primaryReq, properties) : [];

  return (
    <div
      className="modal-backdrop"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
          setSelectedClient360(null);
        }
      }}
    >
      <div
        className="modal"
        style={{ width: 'min(860px, 96%)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-head" style={{ background: '#fff6ea', borderBottom: '1px solid #e8d8c4' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full grid place-items-center font-black text-lg"
              style={{ background: '#dba80f', color: '#000' }}
            >
              {clientName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 style={{ fontSize: '19px', margin: 0 }}>{clientName}</h3>
                <span className="status qualified">{selectedClient360.type}</span>
              </div>
              <p style={{ margin: '3px 0 0', color: '#665d50', fontSize: '12px' }}>
                {selectedClient360.phone} · {selectedClient360.email || 'Email not on file'} · Owner: {selectedClient360.relationshipOwner}
              </p>
            </div>
          </div>
          <button
            className="close"
            onClick={() => setSelectedClient360(null)}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e8d8c4] bg-[#fffaf4] px-4 gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#dba80f] text-black bg-[#fff0d5]'
                : 'border-transparent text-[#665d50] hover:text-black'
            }`}
          >
            📋 Overview & Demand ({clientReqs.length})
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'matches'
                ? 'border-[#dba80f] text-black bg-[#fff0d5]'
                : 'border-transparent text-[#665d50] hover:text-black'
            }`}
          >
            🎯 Matched Inventory ({matchedProperties.length})
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'deals'
                ? 'border-[#dba80f] text-black bg-[#fff0d5]'
                : 'border-transparent text-[#665d50] hover:text-black'
            }`}
          >
            💼 Pipeline & Deals ({clientOpps.length + clientTxs.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-[#dba80f] text-black bg-[#fff0d5]'
                : 'border-transparent text-[#665d50] hover:text-black'
            }`}
          >
            💬 Communications ({clientActivities.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-[#dba80f] text-black bg-[#fff0d5]'
                : 'border-transparent text-[#665d50] hover:text-black'
            }`}
          >
            ✓ Tasks & Next Actions ({clientTasks.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#fffaf4]">
          {/* TAB 1: OVERVIEW & REQUIREMENTS */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm m-0 text-black">Active Real Estate Requirements</h4>
                <button
                  className="btn small"
                  onClick={() => openModal('requirement', { client: clientName })}
                >
                  ＋ Add requirement
                </button>
              </div>

              {clientReqs.length === 0 ? (
                <div className="p-6 text-center text-[#665d50] bg-[#fff6ea] rounded-xl border border-[#e8d8c4]">
                  No structured requirements recorded for this client yet.
                </div>
              ) : (
                clientReqs.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-[#fff6ea] rounded-xl border border-[#e8d8c4] space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="status hot text-[10px] uppercase font-bold">{req.status}</span>
                        <h4 className="text-sm font-black text-black mt-1">
                          {req.transactionType} · {req.propertyType}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-black block">{req.budgetDisplay}</span>
                        <small className="text-[11px] text-[#665d50]">Timing: {req.timing}</small>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-2 border-t border-[#e8d8c4]">
                      <div>
                        <span className="text-[#665d50] block font-semibold">Preferred Locations</span>
                        <strong className="text-black">{req.preferredLocations.join(', ') || 'Lagos'}</strong>
                      </div>
                      <div>
                        <span className="text-[#665d50] block font-semibold">Excluded Areas</span>
                        <strong className="text-[#b64235]">{req.excludedLocations.join(', ') || 'None'}</strong>
                      </div>
                      <div>
                        <span className="text-[#665d50] block font-semibold">Space Required</span>
                        <strong className="text-black">
                          {req.minSizeSqm ? `${req.minSizeSqm}–${req.maxSizeSqm || 500} sqm` : 'Open'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#665d50] block font-semibold">Decision Authority</span>
                        <strong className="text-black">{req.decisionAuthority}</strong>
                      </div>
                      <div>
                        <span className="text-[#665d50] block font-semibold">Funding Readiness</span>
                        <strong className="text-[#217a52]">{req.fundingReadiness}</strong>
                      </div>
                      <div>
                        <span className="text-[#665d50] block font-semibold">Essential Features</span>
                        <strong className="text-black">{req.essentialFeatures.join(', ')}</strong>
                      </div>
                    </div>

                    {req.dealBreakers && (
                      <div className="p-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-xs text-[#991b1b]">
                        <strong>Deal Breaker:</strong> {req.dealBreakers}
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Client Notes / Dossier */}
              <div className="p-4 bg-white border border-[#e8d8c4] rounded-xl">
                <h5 className="font-bold text-xs uppercase text-[#837463] mb-2">Relationship Dossier</h5>
                <p className="text-xs text-[#443b30] leading-relaxed m-0">
                  {selectedClient360.notes || 'Client is actively exploring prime commercial and residential options across Lagos. Follow up regularly with verified properties and power specifications.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: MATCHED INVENTORY */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm m-0 text-black">
                    Algorithmic Inventory Matching
                  </h4>
                  <p className="text-xs text-[#665d50] m-0">
                    Applying hard constraints (type, budget tolerance, size) + weighted scoring.
                  </p>
                </div>
              </div>

              {matchedProperties.length === 0 ? (
                <div className="p-8 text-center text-[#665d50] bg-[#fff6ea] rounded-xl border border-[#e8d8c4]">
                  No inventory currently matches the client's strict requirements. Try expanding location preferences or adjusting budget tolerance.
                </div>
              ) : (
                matchedProperties.map(({ property, score, matchReasons, missingDataNotes }) => (
                  <div
                    key={property.id}
                    className="p-4 bg-white border border-[#e8d8c4] rounded-xl space-y-3 shadow-sm hover:border-[#dba80f] transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-black font-extrabold">{property.reference}</strong>
                          <span className="text-xs text-[#665d50]">· {property.title}</span>
                        </div>
                        <p className="text-xs text-[#443b30] m-0 mt-1">
                          📍 {property.location}, {property.area} · {property.sizeSqm} sqm
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2.5 py-1 bg-[#fff0cf] text-black font-extrabold text-xs rounded-full border border-[#dba80f]">
                          {score}% Match
                        </span>
                        <div className="text-xs font-black text-black mt-1">{property.priceDisplay}</div>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="space-y-1">
                      {matchReasons.map((reason, i) => (
                        <div key={i} className="text-[11px] text-[#217a52] flex items-center gap-1.5 font-medium">
                          <span>✓</span> {reason}
                        </div>
                      ))}
                      {missingDataNotes.map((note, i) => (
                        <div key={i} className="text-[11px] text-[#b64235] flex items-center gap-1.5 font-medium">
                          <span>!</span> {note}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#f0e2d0]">
                      <span className="status qualified text-[10px]">{property.availability}</span>
                      <div className="flex gap-2">
                        <button
                          className="btn secondary small"
                          onClick={() =>
                            openModal('activity', {
                              client: clientName,
                              notes: `Shared property ${property.reference} (${property.title}) with client via WhatsApp`,
                            })
                          }
                        >
                          Share property
                        </button>
                        <button
                          className="btn small"
                          onClick={() =>
                            openModal('task', {
                              client: clientName,
                              title: `Schedule inspection for ${property.reference}`,
                            })
                          }
                        >
                          Book inspection
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PIPELINE & DEALS */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm m-0 text-black">Active Deals & Transactions</h4>
              {clientOpps.map((opp) => (
                <div key={opp.id} className="p-4 bg-[#fff6ea] rounded-xl border border-[#e8d8c4] space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong className="text-sm font-bold text-black">{opp.title}</strong>
                      <p className="text-xs text-[#665d50] m-0">Stage: {opp.stage} · Owner: {opp.owner}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-black">{opp.potentialValueDisplay}</span>
                      <small className="block text-[11px] text-[#217a52] font-bold">
                        Comm: {opp.expectedCommissionDisplay} ({opp.probability}% win prob)
                      </small>
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg text-xs flex justify-between items-center">
                    <span><strong>Next Action:</strong> {opp.nextAction}</span>
                    <span className="font-bold text-[#b64235]">{opp.nextActionDue}</span>
                  </div>
                </div>
              ))}

              {clientTxs.map((tx) => (
                <div key={tx.id} className="p-4 bg-[#e5f4e8] rounded-xl border border-[#a7f3d0] space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="status qualified text-[10px]">Closed Transaction</span>
                      <h5 className="font-bold text-sm text-black m-0 mt-1">{tx.propertyTitle}</h5>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-black">{tx.agreedAmountDisplay}</span>
                      <small className="block text-[11px] text-[#217a52] font-extrabold">
                        Commission Earned: {tx.totalCommissionDisplay}
                      </small>
                    </div>
                  </div>
                  <div className="text-xs text-[#065f46]">
                    Handover completed: {tx.handoverDate} · Status: {tx.closingStatus}
                  </div>
                </div>
              ))}

              {clientOpps.length === 0 && clientTxs.length === 0 && (
                <div className="p-6 text-center text-[#665d50] bg-[#fff6ea] rounded-xl border border-[#e8d8c4]">
                  No active pipeline opportunities for this contact.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMMUNICATIONS TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-sm m-0 text-black">Communications Timeline</h4>
                <button
                  className="btn small"
                  onClick={() => openModal('activity', { client: clientName })}
                >
                  ＋ Log interaction
                </button>
              </div>

              {clientActivities.length === 0 ? (
                <div className="p-6 text-center text-[#665d50] bg-[#fff6ea] rounded-xl border border-[#e8d8c4]">
                  No past communications logged yet.
                </div>
              ) : (
                clientActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 bg-white border border-[#e8d8c4] rounded-xl flex gap-3 items-start"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#fff0cf] grid place-items-center text-sm shrink-0">
                      {act.activityType.includes('call') ? '☏' : act.activityType.includes('Email') ? '✉' : '◉'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <strong className="text-xs text-black">
                          {act.activityType} · {act.owner}
                        </strong>
                        <span className="text-[10px] text-[#665d50]">{act.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#443b30] m-0 mt-1">{act.notes}</p>
                      {act.outcome && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#fff6ea] text-[#665d50] text-[10px] font-semibold rounded">
                          Outcome: {act.outcome}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: TASKS & NEXT ACTIONS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-sm m-0 text-black">Assigned Tasks & Follow-ups</h4>
                <button
                  className="btn small"
                  onClick={() => openModal('task', { client: clientName })}
                >
                  ＋ Add task
                </button>
              </div>

              {clientTasks.length === 0 ? (
                <div className="p-6 text-center text-[#665d50] bg-[#fff6ea] rounded-xl border border-[#e8d8c4]">
                  No follow-up tasks currently assigned for this client.
                </div>
              ) : (
                clientTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-white border border-[#e8d8c4] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="task-check"
                        checked={t.status === 'completed'}
                        onChange={() => toggleTask(t.id)}
                      />
                      <div>
                        <strong
                          className="text-xs block text-black"
                          style={{ textDecoration: t.status === 'completed' ? 'line-through' : 'none' }}
                        >
                          {t.title}
                        </strong>
                        <small className="text-[11px] text-[#665d50]">
                          Assigned to {t.owner} · Due {t.dueDate} ({t.dueTime})
                        </small>
                      </div>
                    </div>
                    <span className={`status ${t.priority === 'High' ? 'hot' : 'inspection'}`}>
                      {t.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-foot">
          <button
            className="btn secondary"
            onClick={() => setSelectedClient360(null)}
          >
            Close Dossier
          </button>
          <button
            className="btn"
            onClick={() => {
              openModal('activity', { client: clientName });
            }}
          >
            Log Activity
          </button>
        </div>
      </div>
    </div>
  );
};
