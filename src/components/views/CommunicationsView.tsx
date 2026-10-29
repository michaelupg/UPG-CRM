import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';

export const CommunicationsView: React.FC = () => {
  const { activities, omnichannelAdapters, openModal, globalSearch, setSelectedClient360, contacts } = useCrm();
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'adapters'>('timeline');
  const [channelFilter, setChannelFilter] = useState('All channels');
  const [localSearch, setLocalSearch] = useState('');

  const filteredActivities = activities.filter((act) => {
    const q = (localSearch || globalSearch).toLowerCase();
    const matchesSearch =
      !q ||
      act.clientName.toLowerCase().includes(q) ||
      act.notes.toLowerCase().includes(q) ||
      act.owner.toLowerCase().includes(q);

    const matchesChannel =
      channelFilter === 'All channels' ||
      (act.channel && act.channel.toLowerCase().includes(channelFilter.toLowerCase())) ||
      act.activityType.toLowerCase().includes(channelFilter.toLowerCase());

    return matchesSearch && matchesChannel;
  });

  const getChannelIcon = (type: string, channel?: string) => {
    const text = (channel || type).toLowerCase();
    if (text.includes('whatsapp')) return '◉';
    if (text.includes('email') || text.includes('shortlist')) return '✉';
    if (text.includes('call') || text.includes('phone')) return '☏';
    if (text.includes('inspection') || text.includes('viewing')) return '⌂';
    return '◎';
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
            <h3>Communications & Omnichannel Hub</h3>
            <p>Unified view of recorded client interactions and channel integration status</p>
          </div>
          <div className="flex gap-2">
            <button
              className="btn secondary small hidden sm:inline-flex"
              onClick={() => openModal('ai_assistant')}
            >
              ✨ AI Draft Assistant
            </button>
            <button className="btn" onClick={() => openModal('activity')}>
              ＋ Log activity
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-[#f0e2d0] bg-[#fffaf4] px-4 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeSubTab === 'timeline'
                ? 'border-[#dba80f] text-black bg-[#fff0d5]'
                : 'border-transparent text-[#665d50] hover:text-black'
            }`}
          >
            💬 Client Communications Stream ({filteredActivities.length})
          </button>
          <button
            onClick={() => setActiveSubTab('adapters')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeSubTab === 'adapters'
                ? 'border-[#dba80f] text-black bg-[#fff0d5]'
                : 'border-transparent text-[#665d50] hover:text-black'
            }`}
          >
            🔌 Omnichannel Adapters & Webhooks ({omnichannelAdapters.length})
          </button>
        </div>

        {/* Stream View */}
        {activeSubTab === 'timeline' && (
          <div>
            <div className="filters">
              <input
                className="table-search"
                placeholder="Search client or message..."
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
                <option>Inspection</option>
              </select>
              <span className="text-xs text-[#665d50] ml-auto font-medium">
                Showing {filteredActivities.length} logs
              </span>
            </div>

            <div>
              {filteredActivities.map((act) => (
                <div key={act.id} className="comm-row hover:bg-[#fff5e8] transition-colors">
                  <div className="comm-icon">
                    {getChannelIcon(act.activityType, act.channel)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        className="font-bold text-xs text-black hover:underline text-left"
                        onClick={() => handleOpenClient(act.clientName)}
                      >
                        {act.clientName}
                      </button>
                      <span className="text-[11px] text-[#665d50]">
                        · {act.channel || act.activityType} · Logged by {act.owner.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-xs text-[#443b30] mt-1 mb-0">{act.notes}</p>
                    {act.nextAction && (
                      <span className="inline-block mt-1 text-[11px] text-[#8b6200] font-semibold">
                        Next: {act.nextAction}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <small className="text-[#665d50] font-medium block">{act.timestamp}</small>
                    {act.outcome && (
                      <span className="status qualified text-[9px] mt-1">{act.outcome}</span>
                    )}
                  </div>
                </div>
              ))}
              {filteredActivities.length === 0 && (
                <div className="p-8 text-center text-[#665d50]">
                  No communication records match the search filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Adapters & Webhook Status View */}
        {activeSubTab === 'adapters' && (
          <div className="p-5 space-y-4">
            <p className="text-xs text-[#665d50] m-0">
              Integrations are clearly separated between active live webhooks and services awaiting provider API keys.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {omnichannelAdapters.map((adapter) => {
                let badgeClass = 'qualified';
                let label = 'Live Webhook';
                if (adapter.status === 'configured') {
                  badgeClass = 'inspection';
                  label = 'Configured';
                } else if (adapter.status === 'needs_credentials') {
                  badgeClass = 'hot';
                  label = 'Awaiting Credentials';
                }

                return (
                  <div
                    key={adapter.id}
                    className="p-4 bg-white border border-[#e8d8c4] rounded-xl space-y-2 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-sm font-bold text-black block">{adapter.name}</strong>
                        <span className="text-xs text-[#665d50]">{adapter.provider}</span>
                      </div>
                      <span className={`status ${badgeClass} text-[10px]`}>{label}</span>
                    </div>

                    <p className="text-xs text-[#443b30] m-0">{adapter.notes}</p>

                    <div className="pt-2 border-t border-[#f0e2d0] text-[11px] space-y-1">
                      <div>
                        <strong className="text-[#665d50]">Endpoint: </strong>
                        <code className="bg-[#fff6ea] px-1.5 py-0.5 rounded text-[10px] break-all">
                          {adapter.webhookUrl}
                        </code>
                      </div>
                      <div>
                        <strong className="text-[#665d50]">Environment Keys: </strong>
                        <span className="text-[#333]">
                          {adapter.credentialsRequired.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
