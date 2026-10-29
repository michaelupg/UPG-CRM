import React, { useState } from 'react';
import { useCrm, CrmView } from '../context/CrmContext';

interface TopbarProps {
  onToggleSidebar: () => void;
}

const VIEW_TITLES: Record<CrmView, string> = {
  dashboard: 'Dashboard',
  inbox: 'Enquiry inbox',
  clients: 'Clients & contacts',
  leads: 'Leads & pipeline',
  requirements: 'Requirements',
  properties: 'Properties',
  tasks: 'Tasks & follow-ups',
  communications: 'Communications',
  inspections: 'Inspections',
  transactions: 'Transactions & closings',
  performance: 'Staff performance',
  reports: 'Reports & analytics',
  settings: 'Settings',
};

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { currentView, openModal, globalSearch, setGlobalSearch, tasks, enquiries } = useCrm();
  const [showNotifications, setShowNotifications] = useState(false);

  const title = VIEW_TITLES[currentView] || 'Dashboard';

  // Overdue and immediate attention items
  const urgentTasks = tasks.filter((t) => t.status === 'open' && t.priority === 'High');
  const breachedEnquiries = enquiries.filter((e) => e.slaBreached);

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="icon-btn mobile-menu"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <div>
          <div className="crumb">
            UPG CRM <span style={{ padding: '0 5px' }}>/</span> <span>{title}</span>
          </div>
          <h1 className="page-title">{title}</h1>
        </div>
      </div>

      <div className="top-actions">
        {/* Global Search */}
        <label className="search">
          <span>⌕</span>
          <input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search clients, leads, refs..."
            aria-label="Search CRM"
          />
        </label>

        {/* AI Assistant Quick Trigger */}
        <button
          className="btn secondary small hidden sm:inline-flex"
          onClick={() => openModal('ai_assistant')}
          title="AI Requirement Extractor & Message Drafter"
        >
          <span style={{ fontSize: '13px' }}>✨</span> AI Copilot
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            className="icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            ♧<span className="dot"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#fffaf4] border border-[#e8d8c4] rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#f0e2d0] mb-2">
                <span className="font-bold text-xs uppercase text-[#837463]">
                  CRM Notifications
                </span>
                <span className="text-[10px] bg-[#fff0cf] px-2 py-0.5 rounded-full font-bold">
                  {urgentTasks.length + breachedEnquiries.length} alerts
                </span>
              </div>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {breachedEnquiries.map((e) => (
                  <div key={e.id} className="p-2 bg-[#ffeadf] rounded-lg text-xs">
                    <strong className="text-[#ad4827] block">SLA Breached</strong>
                    <p className="text-[11px] text-[#554a3e] m-0">
                      Enquiry from {e.clientName} exceeded response deadline.
                    </p>
                  </div>
                ))}
                {urgentTasks.map((t) => (
                  <div key={t.id} className="p-2 bg-[#fff5e8] rounded-lg text-xs border border-[#f0e2d0]">
                    <strong className="block text-[#000]">{t.title}</strong>
                    <p className="text-[11px] text-[#665d50] m-0">
                      Assigned to {t.owner} · Due {t.dueTime}
                    </p>
                  </div>
                ))}
                {urgentTasks.length === 0 && breachedEnquiries.length === 0 && (
                  <div className="text-center py-4 text-xs text-[#665d50]">
                    All follow-ups and SLAs on track!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <button className="btn" onClick={() => openModal('enquiry')}>
          ＋ New enquiry
        </button>
      </div>
    </header>
  );
};
