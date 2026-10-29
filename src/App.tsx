import React, { useState } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/views/DashboardView';
import { InboxView } from './components/views/InboxView';
import { ClientsView } from './components/views/ClientsView';
import { LeadsPipelineView } from './components/views/LeadsPipelineView';
import { RequirementsView } from './components/views/RequirementsView';
import { PropertiesView } from './components/views/PropertiesView';
import { TasksView } from './components/views/TasksView';
import { CommunicationsView } from './components/views/CommunicationsView';
import { InspectionsView } from './components/views/InspectionsView';
import { TransactionsView } from './components/views/TransactionsView';
import { PerformanceView } from './components/views/PerformanceView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { RecordModal } from './components/RecordModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { Client360Drawer } from './components/Client360Drawer';

const MainApp: React.FC = () => {
  const { currentView, toastState } = useCrm();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main View Area */}
      <main className="main">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dynamic CRM View Routing */}
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'inbox' && <InboxView />}
        {currentView === 'clients' && <ClientsView />}
        {currentView === 'leads' && <LeadsPipelineView />}
        {currentView === 'requirements' && <RequirementsView />}
        {currentView === 'properties' && <PropertiesView />}
        {currentView === 'tasks' && <TasksView />}
        {currentView === 'communications' && <CommunicationsView />}
        {currentView === 'inspections' && <InspectionsView />}
        {currentView === 'transactions' && <TransactionsView />}
        {currentView === 'performance' && <PerformanceView />}
        {currentView === 'reports' && <ReportsView />}
        {currentView === 'settings' && <SettingsView />}

        {/* Footer */}
        <footer
          style={{
            marginTop: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
            color: '#766957',
            fontSize: '11px',
            paddingTop: '16px',
            borderTop: '1px solid #e8d8c4',
          }}
        >
          <span>UPG CRM · Real Estate Relationship Management · Lagos, Nigeria</span>
          <span>Enterprise Multi-User Relational Architecture</span>
        </footer>
      </main>

      {/* Modals & Drawers */}
      <RecordModal />
      <AiAssistantModal />
      <Client360Drawer />

      {/* Toast Notification */}
      {toastState && (
        <div className="toast show" role="status">
          <span>✓</span>
          <span>{toastState.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <CrmProvider>
      <MainApp />
    </CrmProvider>
  );
}
