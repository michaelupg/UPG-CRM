import React, { useState } from 'react';
import { useCrm, CrmView } from '../context/CrmContext';
import { UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentView, setCurrentView, currentUser, setUserRole, enquiries, tasks } = useCrm();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const pendingEnquiriesCount = enquiries.filter(
    (e) => e.status === 'New' || e.status === 'Needs action'
  ).length;

  const openTasksCount = tasks.filter((t) => t.status === 'open').length;

  const handleNav = (view: CrmView) => {
    setCurrentView(view);
    onClose();
  };

  const roles: { label: string; role: UserRole }[] = [
    { label: 'Administrator', role: 'administrator' },
    { label: 'Management', role: 'management' },
    { label: 'Sales Manager', role: 'sales_manager' },
    { label: 'Real Estate Agent', role: 'agent' },
    { label: 'Marketing Lead', role: 'marketing' },
    { label: 'Transaction Officer', role: 'transaction_officer' },
    { label: 'Auditor & Compliance', role: 'auditor' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-mark">UPG</div>
        <div>
          <div className="brand-name">UPG CRM</div>
          <div className="brand-sub">Real Estate Intelligence</div>
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="workspace">
        <div className="workspace-icon">U</div>
        <div>
          <strong>UPG Property Group</strong>
          <small>Sales & client operations</small>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#665d50' }}>⌄</span>
      </div>

      {/* Primary Workspace Nav */}
      <div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav">
          <button
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => handleNav('dashboard')}
          >
            <span className="ico">▦</span>Dashboard
          </button>
          <button
            className={currentView === 'inbox' ? 'active' : ''}
            onClick={() => handleNav('inbox')}
          >
            <span className="ico">▣</span>Enquiry inbox{' '}
            {pendingEnquiriesCount > 0 && (
              <span className="count">{pendingEnquiriesCount}</span>
            )}
          </button>
          <button
            className={currentView === 'clients' ? 'active' : ''}
            onClick={() => handleNav('clients')}
          >
            <span className="ico">♙</span>Clients & contacts
          </button>
          <button
            className={currentView === 'leads' ? 'active' : ''}
            onClick={() => handleNav('leads')}
          >
            <span className="ico">◎</span>Leads & pipeline
          </button>
          <button
            className={currentView === 'requirements' ? 'active' : ''}
            onClick={() => handleNav('requirements')}
          >
            <span className="ico">☷</span>Requirements
          </button>
          <button
            className={currentView === 'properties' ? 'active' : ''}
            onClick={() => handleNav('properties')}
          >
            <span className="ico">⌂</span>Properties
          </button>
          <button
            className={currentView === 'tasks' ? 'active' : ''}
            onClick={() => handleNav('tasks')}
          >
            <span className="ico">✓</span>Tasks & follow-ups{' '}
            {openTasksCount > 0 && (
              <span className="count">{openTasksCount}</span>
            )}
          </button>
          <button
            className={currentView === 'communications' ? 'active' : ''}
            onClick={() => handleNav('communications')}
          >
            <span className="ico">▤</span>Communications
          </button>
          <button
            className={currentView === 'inspections' ? 'active' : ''}
            onClick={() => handleNav('inspections')}
          >
            <span className="ico">⌖</span>Inspections
          </button>
          <button
            className={currentView === 'transactions' ? 'active' : ''}
            onClick={() => handleNav('transactions')}
          >
            <span className="ico">💳</span>Transactions & closings
          </button>
        </nav>
      </div>

      {/* Management Section */}
      <div>
        <div className="nav-label">MANAGEMENT</div>
        <nav className="nav">
          <button
            className={currentView === 'performance' ? 'active' : ''}
            onClick={() => handleNav('performance')}
          >
            <span className="ico">▥</span>Staff performance
          </button>
          <button
            className={currentView === 'reports' ? 'active' : ''}
            onClick={() => handleNav('reports')}
          >
            <span className="ico">◷</span>Reports & analytics
          </button>
          <button
            className={currentView === 'settings' ? 'active' : ''}
            onClick={() => handleNav('settings')}
          >
            <span className="ico">⚙</span>Settings
          </button>
        </nav>
      </div>

      {/* Active User Lockup & Role Switcher */}
      <div className="side-bottom relative">
        <div
          className="user cursor-pointer hover:bg-[#fff0d5] rounded-xl p-2 transition-colors"
          onClick={() => setRoleMenuOpen(!roleMenuOpen)}
          title="Click to switch simulated RBAC user role"
        >
          <div className="avatar">{currentUser.avatarInitials}</div>
          <div className="min-w-0">
            <strong className="block truncate">{currentUser.name}</strong>
            <small className="capitalize text-[10px] text-[#665d50] font-semibold">
              {currentUser.role.replace('_', ' ')}
            </small>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#665d50' }}>
            •••
          </span>
        </div>

        {/* Role Switcher Popover */}
        {roleMenuOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-white border border-[#e8d8c4] rounded-xl shadow-xl p-2 z-50">
            <div className="text-[10px] uppercase font-bold text-[#857765] px-2 py-1 mb-1">
              Switch RBAC Role
            </div>
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => {
                  setUserRole(r.role);
                  setRoleMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                  currentUser.role === r.role
                    ? 'bg-[#dba80f] font-bold text-black'
                    : 'text-[#342d24] hover:bg-[#fff0d5]'
                }`}
              >
                <span>{r.label}</span>
                {currentUser.role === r.role && <span>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
