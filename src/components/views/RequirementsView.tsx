import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { matchPropertiesForRequirement } from '../../lib/matchingEngine';
import { Requirement, PropertyMatchResult } from '../../types';

export const RequirementsView: React.FC = () => {
  const { requirements, properties, openModal, setSelectedClient360, contacts, globalSearch } = useCrm();
  const [typeFilter, setTypeFilter] = useState('All property types');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedReqForMatch, setSelectedReqForMatch] = useState<{
    req: Requirement;
    matches: PropertyMatchResult[];
  } | null>(null);

  const filteredRequirements = requirements.filter((r) => {
    const q = (localSearch || globalSearch).toLowerCase();
    const matchesSearch =
      !q ||
      r.clientName.toLowerCase().includes(q) ||
      r.propertyType.toLowerCase().includes(q) ||
      r.preferredLocations.some((loc) => loc.toLowerCase().includes(q)) ||
      r.essentialFeatures.some((feat) => feat.toLowerCase().includes(q));

    const matchesType =
      typeFilter === 'All property types' ||
      r.propertyType.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  const handleOpenMatches = (req: Requirement) => {
    const matches = matchPropertiesForRequirement(req, properties);
    setSelectedReqForMatch({ req, matches });
  };

  const handleOpenClient = (clientName: string) => {
    const c = contacts.find((item) => item.name.toLowerCase() === clientName.toLowerCase());
    if (c) setSelectedClient360(c);
  };

  return (
    <section className="section-view active">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Client requirements</h3>
            <p>Structured demand records to improve property matching</p>
          </div>
          <button className="btn" onClick={() => openModal('requirement')}>
            ＋ Add requirement
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          <input
            className="table-search"
            placeholder="Search location, type, client..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>All property types</option>
            <option>Office</option>
            <option>Warehouse</option>
            <option>Apartment</option>
            <option>Retail</option>
          </select>
          <span className="text-xs text-[#665d50] ml-auto font-medium">
            {filteredRequirements.length} client demand records
          </span>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Requirement</th>
                <th>Location</th>
                <th>Budget</th>
                <th>Timing</th>
                <th>Must-have</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequirements.map((r) => (
                <tr key={r.id}>
                  <td>
                    <button
                      className="font-bold text-left text-black hover:underline"
                      onClick={() => handleOpenClient(r.clientName)}
                    >
                      {r.clientName}
                    </button>
                  </td>
                  <td>
                    {r.propertyType}
                    {r.minSizeSqm ? ` · ${r.minSizeSqm}–${r.maxSizeSqm || 500} sqm` : ''}
                  </td>
                  <td>{r.preferredLocations.join(', ')}</td>
                  <td className="font-bold">{r.budgetDisplay}</td>
                  <td>{r.timing}</td>
                  <td>
                    <span className="text-[11px] text-[#443b30]">
                      {r.essentialFeatures.slice(0, 2).join(', ')}
                      {r.essentialFeatures.length > 2 ? '...' : ''}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status ${
                        r.status === 'Urgent'
                          ? 'hot'
                          : r.status === 'Matching'
                          ? 'inspection'
                          : 'qualified'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn secondary small"
                      onClick={() => handleOpenMatches(r)}
                    >
                      🎯 Match
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Match Results Modal */}
      {selectedReqForMatch && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '640px' }}>
            <div className="modal-head">
              <div>
                <h3 className="m-0">
                  Matches for {selectedReqForMatch.req.clientName}
                </h3>
                <p className="text-xs text-[#665d50] m-0 mt-0.5">
                  Demand: {selectedReqForMatch.req.propertyType} in{' '}
                  {selectedReqForMatch.req.preferredLocations.join(', ')} ({selectedReqForMatch.req.budgetDisplay})
                </p>
              </div>
              <button className="close" onClick={() => setSelectedReqForMatch(null)}>
                ×
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              {selectedReqForMatch.matches.length === 0 ? (
                <div className="p-8 text-center text-[#665d50] bg-[#fff6ea] rounded-xl">
                  No properties currently satisfy the hard constraints for this requirement.
                </div>
              ) : (
                selectedReqForMatch.matches.map(({ property, score, matchReasons, missingDataNotes }) => (
                  <div
                    key={property.id}
                    className="p-3.5 bg-white border border-[#e8d8c4] rounded-xl space-y-2 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-sm text-black">{property.reference}</strong>
                        <div className="text-xs text-[#443b30]">
                          {property.title} · {property.location} ({property.sizeSqm} sqm)
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-[#fff0cf] text-xs font-black rounded-full border border-[#dba80f]">
                          {score}% Match
                        </span>
                        <div className="text-xs font-bold text-black mt-1">
                          {property.priceDisplay}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] space-y-0.5 pt-1 border-t border-[#f0e2d0]">
                      {matchReasons.map((m, i) => (
                        <div key={i} className="text-[#217a52] font-medium">✓ {m}</div>
                      ))}
                      {missingDataNotes.map((n, i) => (
                        <div key={i} className="text-[#b64235] font-medium">! {n}</div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        className="btn secondary small"
                        onClick={() => {
                          openModal('activity', {
                            client: selectedReqForMatch.req.clientName,
                            notes: `Shared listing ${property.reference} (${property.title})`,
                          });
                          setSelectedReqForMatch(null);
                        }}
                      >
                        Share via WhatsApp
                      </button>
                      <button
                        className="btn small"
                        onClick={() => {
                          openModal('task', {
                            client: selectedReqForMatch.req.clientName,
                            title: `Confirm inspection for ${property.reference}`,
                          });
                          setSelectedReqForMatch(null);
                        }}
                      >
                        Book inspection
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="modal-foot">
              <button
                className="btn secondary"
                onClick={() => setSelectedReqForMatch(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
