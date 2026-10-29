import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';

export const InboxView: React.FC = () => {
  const { enquiries, openModal, globalSearch, setSelectedClient360, contacts } = useCrm();
  const [channelFilter, setChannelFilter] = useState('All channels');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [localSearch, setLocalSearch] = useState('');

  const filteredEnquiries = enquiries.filter((enq) => {
    const q = (localSearch || globalSearch).toLowerCase();
    const matchesSearch =
      !q ||
      enq.clientName.toLowerCase().includes(q) ||
      enq.clientPhone.toLowerCase().includes(q) ||
      enq.originalMessage.toLowerCase().includes(q) ||
      (enq.preferredLocation && enq.preferredLocation.toLowerCase().includes(q));

    const matchesChannel =
      channelFilter === 'All channels' ||
      enq.channel.toLowerCase().includes(channelFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'All statuses' ||
      enq.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesChannel && matchesStatus;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WhatsApp':
        return '◉ WhatsApp';
      case 'Website':
        return '▣ Website';
      case 'Phone call':
      case 'Phone':
        return '☏ Phone';
      case 'Email':
        return '✉ Email';
      default:
        return '◎ ' + channel;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Needs action':
        return 'hot';
      case 'Assigned':
        return 'qualified';
      case 'In progress':
        return 'negotiation';
      case 'New':
        return 'new';
      default:
        return 'inspection';
    }
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
            <h3>Enquiry inbox</h3>
            <p>Incoming enquiries across your connected channels</p>
          </div>
          <div className="flex gap-2">
            <button
              className="btn secondary small hidden sm:inline-flex"
              onClick={() => openModal('ai_assistant')}
            >
              ✨ AI Message Parser
            </button>
            <button className="btn" onClick={() => openModal('enquiry')}>
              ＋ Capture enquiry
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <input
            className="table-search"
            placeholder="Search enquiries, location, phone..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
          >
            <option>All channels</option>
            <option>WhatsApp</option>
            <option>Phone</option>
            <option>Email</option>
            <option>Website</option>
            <option>SMS</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All statuses</option>
            <option>Needs action</option>
            <option>Assigned</option>
            <option>In progress</option>
            <option>New</option>
          </select>
          <span className="text-xs text-[#665d50] ml-auto font-medium">
            Showing {filteredEnquiries.length} enquiries
          </span>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Channel</th>
                <th>Enquiry</th>
                <th>Received</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.map((enq) => (
                <tr key={enq.id}>
                  <td>
                    <button
                      className="text-left font-bold text-black hover:underline block"
                      onClick={() => handleOpenClient(enq.clientName)}
                    >
                      {enq.clientName}
                    </button>
                    <small style={{ display: 'block', color: '#665d50', marginTop: '4px' }}>
                      {enq.clientPhone}
                    </small>
                  </td>
                  <td>{getChannelIcon(enq.channel)}</td>
                  <td style={{ maxWidth: '280px' }}>
                    <div className="font-semibold text-xs text-[#222]">
                      {enq.transactionType || 'Requirement'} · {enq.preferredLocation || 'Lagos'}
                    </div>
                    <p className="text-[11px] text-[#665d50] truncate m-0 mt-0.5" title={enq.originalMessage}>
                      {enq.originalMessage}
                    </p>
                  </td>
                  <td>
                    <span>{enq.receivedTimeAgo}</span>
                    {enq.slaBreached && (
                      <span className="block text-[10px] text-[#ad4827] font-bold">
                        SLA Overdue
                      </span>
                    )}
                  </td>
                  <td>{enq.owner.split(' ')[0]}</td>
                  <td>
                    <span className={`status ${getStatusClass(enq.status)}`}>
                      {enq.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        className="btn small"
                        onClick={() => openModal('activity', { client: enq.clientName, owner: enq.owner })}
                      >
                        Log response
                      </button>
                      <button
                        className="btn secondary small"
                        onClick={() => openModal('ai_assistant', { message: enq.originalMessage, clientName: enq.clientName })}
                        title="AI response generator"
                      >
                        ✨
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEnquiries.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#665d50]">
                    No enquiries match the current filter criteria.
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
