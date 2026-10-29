import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';

export const ClientsView: React.FC = () => {
  const { contacts, openModal, globalSearch, setSelectedClient360 } = useCrm();
  const [typeFilter, setTypeFilter] = useState('All client types');
  const [localSearch, setLocalSearch] = useState('');

  const filteredContacts = contacts.filter((c) => {
    const q = (localSearch || globalSearch).toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q));

    const matchesType =
      typeFilter === 'All client types' ||
      c.type.toLowerCase().includes(typeFilter.toLowerCase());

    return matchesSearch && matchesType;
  });

  const avatarColors = ['#f2d58b', '#d8e8cb', '#d9d7fa', '#f2d5d9', '#e0f2fe', '#fef08a'];

  return (
    <section className="section-view active">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Clients & contacts</h3>
            <p>A single relationship record across multiple requirements and transactions</p>
          </div>
          <button className="btn" onClick={() => openModal('client')}>
            ＋ Add client
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          <input
            className="table-search"
            placeholder="Search name, phone, company..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>All client types</option>
            <option>Individual</option>
            <option>Corporate</option>
            <option>Corporate tenant</option>
            <option>Business owner</option>
            <option>Retail operator</option>
            <option>Landlord</option>
            <option>Investor</option>
          </select>
          <span className="text-xs text-[#665d50] ml-auto font-medium">
            {filteredContacts.length} relationship records
          </span>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Type</th>
                <th>Active requirements</th>
                <th>Last interaction</th>
                <th>Relationship owner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((c, idx) => {
                const initials = c.name
                  .split(/\s+/)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                const color = avatarColors[idx % avatarColors.length];

                return (
                  <tr
                    key={c.id}
                    className="cursor-pointer hover:bg-[#fff5e8]"
                    onClick={() => setSelectedClient360(c)}
                    title="Click to view Client 360 profile"
                  >
                    <td>
                      <div className="person">
                        <div className="avatar" style={{ background: color }}>
                          {initials}
                        </div>
                        <div>
                          <strong>{c.name}</strong>
                          <small>
                            {c.company ? `${c.company} · ` : ''}
                            {c.email || c.phone}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>{c.type}</td>
                    <td>
                      <span className="font-bold text-xs bg-[#fff0cf] px-2 py-0.5 rounded-full border border-[#e8d8c4]">
                        {c.activeRequirementsCount}
                      </span>
                    </td>
                    <td>{c.lastInteraction}</td>
                    <td>{c.relationshipOwner.split(' ')[0]}</td>
                    <td>
                      <span className="status qualified">
                        {c.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#665d50]">
                    No client records match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
