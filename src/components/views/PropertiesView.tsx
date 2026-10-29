import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Property } from '../../types';

export const PropertiesView: React.FC = () => {
  const { properties, requirements, openModal, setSelectedClient360, contacts, globalSearch } = useCrm();
  const [typeFilter, setTypeFilter] = useState('All property types');
  const [availFilter, setAvailFilter] = useState('All availability');
  const [localSearch, setLocalSearch] = useState('');
  const [activePropertyMatch, setActivePropertyMatch] = useState<Property | null>(null);

  const filteredProperties = properties.filter((p) => {
    const q = (localSearch || globalSearch).toLowerCase();
    const matchesSearch =
      !q ||
      p.reference.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.area.toLowerCase().includes(q) ||
      p.specifications.toLowerCase().includes(q);

    const matchesType =
      typeFilter === 'All property types' ||
      p.propertyType.toLowerCase() === typeFilter.toLowerCase();

    const matchesAvail =
      availFilter === 'All availability' ||
      p.availability.toLowerCase() === availFilter.toLowerCase();

    return matchesSearch && matchesType && matchesAvail;
  });

  // Calculate matching requirements count for each property
  const getMatchingRequirementsForProperty = (p: Property) => {
    return requirements.filter((r) => {
      const typeMatch = r.propertyType.toLowerCase().includes(p.propertyType.toLowerCase()) ||
                        p.propertyType.toLowerCase().includes(r.propertyType.toLowerCase());
      const budgetMatch = !r.budgetMax || p.priceAmount <= r.budgetMax * 1.15;
      const locationMatch = !r.preferredLocations.length ||
                            r.preferredLocations.some((loc) => (p.location + ' ' + p.area).toLowerCase().includes(loc.toLowerCase()));
      return typeMatch && budgetMatch && locationMatch;
    });
  };

  return (
    <section className="section-view active">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Property inventory</h3>
            <p>Match available properties against qualified client requirements</p>
          </div>
          <button className="btn" onClick={() => openModal('property')}>
            ＋ Add property
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          <input
            className="table-search"
            placeholder="Search property, location, ref..."
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
          <select
            value={availFilter}
            onChange={(e) => setAvailFilter(e.target.value)}
          >
            <option>All availability</option>
            <option>Available</option>
            <option>Under offer</option>
          </select>
          <span className="text-xs text-[#665d50] ml-auto font-medium">
            {filteredProperties.length} active listings
          </span>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Location</th>
                <th>Type</th>
                <th>Asking rent</th>
                <th>Availability</th>
                <th>Potential matches</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((p) => {
                const matchingReqs = getMatchingRequirementsForProperty(p);
                return (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.reference}</strong>
                      <small style={{ display: 'block', color: '#665d50', marginTop: '4px' }}>
                        {p.title} · {p.sizeSqm} sqm
                      </small>
                    </td>
                    <td>{p.location}</td>
                    <td>{p.propertyType}</td>
                    <td className="font-bold">{p.priceDisplay}</td>
                    <td>
                      <span
                        className={`status ${
                          p.availability === 'Available'
                            ? 'qualified'
                            : p.availability === 'Under offer'
                            ? 'inspection'
                            : 'closed'
                        }`}
                      >
                        {p.availability}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-xs bg-[#fff0cf] px-2 py-0.5 rounded-full border border-[#e8d8c4]">
                        {matchingReqs.length} requirements
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn small"
                        onClick={() => setActivePropertyMatch(p)}
                      >
                        Match
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Candidate Demand Matches Modal */}
      {activePropertyMatch && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '640px' }}>
            <div className="modal-head">
              <div>
                <h3 className="m-0">Client Demand for {activePropertyMatch.reference}</h3>
                <p className="text-xs text-[#665d50] m-0 mt-0.5">
                  {activePropertyMatch.title} ({activePropertyMatch.priceDisplay})
                </p>
              </div>
              <button className="close" onClick={() => setActivePropertyMatch(null)}>
                ×
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              {getMatchingRequirementsForProperty(activePropertyMatch).length === 0 ? (
                <div className="p-8 text-center text-[#665d50] bg-[#fff6ea] rounded-xl">
                  No active client requirements currently match this property.
                </div>
              ) : (
                getMatchingRequirementsForProperty(activePropertyMatch).map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 bg-white border border-[#e8d8c4] rounded-xl flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div>
                      <strong className="text-xs text-black block">{req.clientName}</strong>
                      <span className="text-[11px] text-[#665d50]">
                        Budget: {req.budgetDisplay} · Timing: {req.timing}
                      </span>
                      <p className="text-[11px] text-[#443b30] m-0 mt-0.5">
                        Must-haves: {req.essentialFeatures.join(', ')}
                      </p>
                    </div>

                    <button
                      className="btn small"
                      onClick={() => {
                        const c = contacts.find((item) => item.name.toLowerCase() === req.clientName.toLowerCase());
                        if (c) setSelectedClient360(c);
                        setActivePropertyMatch(null);
                      }}
                    >
                      View Client 360
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="modal-foot">
              <button
                className="btn secondary"
                onClick={() => setActivePropertyMatch(null)}
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
