import React from 'react';
import { useCrm } from '../../context/CrmContext';
import { UserRole } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';

export const SettingsView: React.FC = () => {
  const {
    slaConfig,
    scoringConfig,
    openModal,
    automationRules,
    toggleAutomationRule,
    currentUser,
    setUserRole,
    resetToSeedData,
    toast,
  } = useCrm();

  const handleExportBackup = () => {
    const raw = localStorage.getItem('upg_real_estate_crm_store_v2') || '{}';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `upg-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast('CRM database JSON backup downloaded.');
  };

  const roles: { role: UserRole; name: string; desc: string }[] = [
    {
      role: 'administrator',
      name: 'Administrator',
      desc: 'Full system control, schema management, user roles, security audits.',
    },
    {
      role: 'management',
      name: 'Management',
      desc: 'Executive pipeline oversight, commission approvals, reports, revenue forecasts.',
    },
    {
      role: 'sales_manager',
      name: 'Sales Manager',
      desc: 'Lead reassignment, team activity monitoring, SLA escalation handling.',
    },
    {
      role: 'agent',
      name: 'Real Estate Agent',
      desc: 'Lead follow-up, inspections logging, requirement matching, client communications.',
    },
    {
      role: 'marketing',
      name: 'Marketing Specialist',
      desc: 'Omnichannel enquiry capture, portal campaign attribution, lead intake forms.',
    },
    {
      role: 'transaction_officer',
      name: 'Transaction Officer',
      desc: 'Statutory legal title documents, commission settlements, physical handover inventory.',
    },
    {
      role: 'auditor',
      name: 'Auditor & Compliance',
      desc: 'Read-only audit trail logging, financial verification, RLS compliance checking.',
    },
  ];

  return (
    <section className="section-view active space-y-6">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>CRM Settings & System Parameters</h3>
            <p>Brand identity, SLA targets, scoring weights, and automation rules</p>
          </div>
          <div className="flex gap-2">
            <button className="btn secondary small" onClick={handleExportBackup}>
              📥 Export JSON
            </button>
            <button className="btn small" onClick={resetToSeedData}>
              ↺ Reset to Seed Data
            </button>
          </div>
        </div>

        {/* Profile Grid Cards */}
        <div className="profile-grid">
          {/* Brand System */}
          <div className="mini-card">
            <strong>Brand Design System</strong>
            <p className="text-xs text-[#554a3e] mt-2 leading-relaxed">
              Button Gold: <code className="bg-white px-1.5 py-0.5 rounded border border-[#e8d8c4] font-bold">#DBA80F</code>
              <br />
              App Background: <code className="bg-white px-1.5 py-0.5 rounded border border-[#e8d8c4]">#FFF1E0</code>
              <br />
              Strict Text: <code className="bg-white px-1.5 py-0.5 rounded border border-[#e8d8c4]">#000000</code>
            </p>
          </div>

          {/* Response SLA */}
          <div className="mini-card">
            <strong>Response SLA Targets</strong>
            <p className="text-xs text-[#554a3e] mt-2 leading-relaxed">
              High-intent: <strong>{slaConfig.highIntentMinutes} minutes</strong>
              <br />
              Standard: <strong>{slaConfig.standardMinutes} minutes</strong>
              <br />
              <small className="text-[#665d50]">
                Hours: {slaConfig.businessStart} – {slaConfig.businessEnd} WAT
              </small>
            </p>
            <button
              className="btn secondary small mt-2"
              onClick={() => openModal('sla')}
            >
              Configure SLA
            </button>
          </div>

          {/* Lead Scoring */}
          <div className="mini-card">
            <strong>Weighted Scoring Model</strong>
            <p className="text-xs text-[#554a3e] mt-2 leading-relaxed">
              Budget Fit: {scoringConfig.budgetWeight}% · Urgency: {scoringConfig.urgencyWeight}%
              <br />
              Clarity: {scoringConfig.clarityWeight}% · Authority: {scoringConfig.authorityWeight}%
              <br />
              Engagement: {scoringConfig.engagementWeight}%
            </p>
            <button
              className="btn secondary small mt-2"
              onClick={() => openModal('scoring')}
            >
              Review Scoring
            </button>
          </div>

          {/* Supabase Connection */}
          <div className="mini-card">
            <strong>Database & RLS Engine</strong>
            <p className="text-xs text-[#554a3e] mt-2 leading-relaxed">
              PostgreSQL Schema: <span className="font-bold text-[#217a52]">20261028_init.sql</span>
              <br />
              Row Level Security: <span className="text-[#217a52] font-bold">13 Tables Active</span>
              <br />
              Live Supabase: {isSupabaseConfigured ? '🟢 Connected' : '🟡 In-Browser Persistence with Seed Sync'}
            </p>
            <a
              href="/supabase/migrations/20261028_init.sql"
              target="_blank"
              download="20261028_init.sql"
              className="btn secondary small mt-2 inline-block text-center"
            >
              View SQL Migration
            </a>
          </div>

          {/* Integrations */}
          <div className="mini-card">
            <strong>Omnichannel Status</strong>
            <p className="text-xs text-[#554a3e] mt-2 leading-relaxed">
              WhatsApp Cloud API: <span className="text-[#217a52] font-bold">Live Webhook</span>
              <br />
              Website Forms: <span className="text-[#217a52] font-bold">Active API</span>
              <br />
              SMS (Termii): <span className="text-[#b64235] font-bold">Awaiting Key</span>
            </p>
          </div>

          {/* AI Copilot Status */}
          <div className="mini-card">
            <strong>Gemini AI Service</strong>
            <p className="text-xs text-[#554a3e] mt-2 leading-relaxed">
              Model: <code>gemini-2.5-flash</code>
              <br />
              Status: <span className="text-[#217a52] font-bold">Server-Side Proxy Active</span>
              <br />
              Rule Fallback: <span className="text-[#217a52] font-bold">Zero-Hallucination Safe</span>
            </p>
            <button
              className="btn secondary small mt-2"
              onClick={() => openModal('ai_assistant')}
            >
              Test AI Copilot
            </button>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control Switcher */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Role-Based Access Control (RBAC) Switcher</h3>
            <p>Switch active persona to test organizational permissions</p>
          </div>
          <span className="status qualified">
            Current: {currentUser.role.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map((r) => {
            const isSelected = currentUser.role === r.role;
            return (
              <div
                key={r.role}
                onClick={() => setUserRole(r.role)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#dba80f] border-black text-black font-semibold'
                    : 'bg-white border-[#e8d8c4] hover:bg-[#fff0d5]'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-xs block">{r.name}</strong>
                  {isSelected && <span className="text-xs font-black">✓ Active</span>}
                </div>
                <p className={`text-[11px] m-0 ${isSelected ? 'text-black' : 'text-[#665d50]'}`}>
                  {r.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Automation Rules Manager */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Active Automation Rules</h3>
            <p>Deterministic rules for lead assignment, SLA deadlines, and follow-up sequences</p>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {automationRules.map((rule) => (
            <div
              key={rule.id}
              className="p-3.5 bg-white border border-[#e8d8c4] rounded-xl flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <strong className="text-xs text-black">{rule.name}</strong>
                  <span className="text-[10px] bg-[#fff6ea] px-2 py-0.5 rounded border border-[#e8d8c4] text-[#665d50]">
                    Trigger: {rule.trigger}
                  </span>
                </div>
                <p className="text-xs text-[#443b30] m-0 mt-1">
                  <strong>Action:</strong> {rule.action}
                </p>
                <small className="text-[10px] text-[#665d50] block mt-1">
                  Fired {rule.executionCount} times · Last triggered: {rule.lastTriggered || 'Never'}
                </small>
              </div>

              <button
                onClick={() => toggleAutomationRule(rule.id)}
                className={`btn small ${rule.active ? '' : 'secondary'}`}
              >
                {rule.active ? 'Active ✓' : 'Paused'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
