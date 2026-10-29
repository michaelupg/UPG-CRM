import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';

export const TasksView: React.FC = () => {
  const {
    tasks,
    toggleTask,
    openModal,
    setSelectedClient360,
    contacts,
    opportunities,
    globalSearch,
  } = useCrm();

  const [filterMode, setFilterMode] = useState<'all' | 'open' | 'completed' | 'high'>('all');
  const [localSearch, setLocalSearch] = useState('');

  const filteredTasks = tasks.filter((t) => {
    const q = (localSearch || globalSearch).toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.clientName && t.clientName.toLowerCase().includes(q)) ||
      t.owner.toLowerCase().includes(q);

    if (filterMode === 'open') return matchesSearch && t.status === 'open';
    if (filterMode === 'completed') return matchesSearch && t.status === 'completed';
    if (filterMode === 'high') return matchesSearch && t.priority === 'High';
    return matchesSearch;
  });

  // Check opportunities without next action
  const oppsWithoutNextAction = opportunities.filter((o) => !o.nextAction || o.nextAction.trim() === '');

  const handleOpenClient = (clientName?: string) => {
    if (!clientName) return;
    const c = contacts.find((item) => item.name.toLowerCase() === clientName.toLowerCase());
    if (c) setSelectedClient360(c);
  };

  return (
    <section className="section-view active">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Tasks & follow-ups</h3>
            <p>Every open opportunity should have a clear next action</p>
          </div>
          <button className="btn" onClick={() => openModal('task')}>
            ＋ Create task
          </button>
        </div>

        {/* Opportunity Next Action Integrity Guard */}
        {oppsWithoutNextAction.length > 0 && (
          <div className="p-3 bg-[#ffeadf] border-b border-[#e8d8c4] flex items-center justify-between text-xs text-[#ad4827]">
            <span>
              ⚠️ <strong>Integrity Warning:</strong> {oppsWithoutNextAction.length} active opportunity is missing a scheduled next action.
            </span>
            <button
              className="btn small"
              onClick={() => openModal('task', { client: oppsWithoutNextAction[0].clientName })}
            >
              Add next action
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="filters">
          <input
            className="table-search"
            placeholder="Search tasks or client..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
          >
            <option value="all">All tasks</option>
            <option value="open">Open actions only</option>
            <option value="completed">Completed actions</option>
            <option value="high">High priority only</option>
          </select>
          <span className="text-xs text-[#665d50] ml-auto font-medium">
            Showing {filteredTasks.length} tasks
          </span>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '48px' }}>Done</th>
                <th>Task</th>
                <th>Related client</th>
                <th>Owner</th>
                <th>Due</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((t) => (
                <tr
                  key={t.id}
                  style={{ opacity: t.status === 'completed' ? 0.5 : 1 }}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="task-check"
                      checked={t.status === 'completed'}
                      onChange={() => toggleTask(t.id)}
                    />
                  </td>
                  <td>
                    <strong
                      style={{
                        textDecoration: t.status === 'completed' ? 'line-through' : 'none',
                      }}
                    >
                      {t.title}
                    </strong>
                    <small style={{ display: 'block', color: '#665d50', marginTop: '2px' }}>
                      {t.taskType}
                    </small>
                  </td>
                  <td>
                    {t.clientName ? (
                      <button
                        className="text-black font-semibold hover:underline text-left"
                        onClick={() => handleOpenClient(t.clientName)}
                      >
                        {t.clientName}
                      </button>
                    ) : (
                      <span className="text-[#888]">Internal task</span>
                    )}
                  </td>
                  <td>{t.owner.split(' ')[0]}</td>
                  <td>
                    <span className="font-semibold text-xs text-[#8b6200]">
                      {t.dueDate} · {t.dueTime}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status ${
                        t.priority === 'High'
                          ? 'hot'
                          : t.priority === 'Medium'
                          ? 'inspection'
                          : 'qualified'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#665d50]">
                    No follow-up tasks match this filter.
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
