import React from 'react';
import { useCrm } from '../../context/CrmContext';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    setCurrentView,
    openModal,
    setSelectedClient360,
    contacts,
    opportunities,
    tasks,
    activities,
    toggleTask,
    enquiries,
  } = useCrm();

  const openTasks = tasks.filter((t) => t.status === 'open');
  const needsAttentionCount = enquiries.filter((e) => e.status === 'Needs action' || e.slaBreached).length + openTasks.filter((t) => t.priority === 'High').length;

  const totalWonCommission = '₦18.6m';

  // Pipeline distribution counts
  const stageCounts: Record<string, number> = {
    'New enquiry': opportunities.filter((o) => o.stage === 'New enquiry').length + 39,
    'Qualified': opportunities.filter((o) => o.stage === 'Qualified').length + 31,
    'Inspection': opportunities.filter((o) => o.stage === 'Inspection').length + 23,
    'Negotiation': opportunities.filter((o) => o.stage === 'Negotiation').length + 15,
    'Closing': opportunities.filter((o) => o.stage === 'Closing').length + 9,
  };

  const handleClientClick = (clientName: string) => {
    const contact = contacts.find((c) => c.name.toLowerCase() === clientName.toLowerCase()) || {
      id: `c-${Date.now()}`,
      name: clientName,
      phone: '+234 803 000 0000',
      email: `${clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      type: 'Individual',
      relationshipOwner: 'Amaka Eze',
      status: 'Active',
      activeRequirementsCount: 1,
      lastInteraction: '12 min ago',
      createdAt: '2026-10-20',
    };
    setSelectedClient360(contact);
  };

  return (
    <section className="section-view active">
      {/* Welcome Banner */}
      <div className="welcome">
        <div>
          <h2>Good afternoon, {currentUser.name.split(' ')[0]} 👋</h2>
          <p>Here’s what’s happening across your real estate pipeline today.</p>
        </div>
        <div className="date-chip">◷ &nbsp; Wednesday, 28 October 2026</div>
      </div>

      {/* KPI Metrics */}
      <div className="metrics">
        <article className="metric">
          <div className="metric-top">
            <span>New enquiries</span>
            <span className="metric-icon">▣</span>
          </div>
          <div className="metric-value">{44 + enquiries.length}</div>
          <div className="metric-foot">
            <span className="up">↑ 12.5%</span> vs. previous period
          </div>
        </article>

        <article className="metric">
          <div className="metric-top">
            <span>Needs attention</span>
            <span className="metric-icon">◷</span>
          </div>
          <div className="metric-value">{Math.max(needsAttentionCount, 8)}</div>
          <div className="metric-foot">
            <span className="down">● 3 overdue</span> require action
          </div>
        </article>

        <article className="metric">
          <div className="metric-top">
            <span>Active opportunities</span>
            <span className="metric-icon">◎</span>
          </div>
          <div className="metric-value">{120 + opportunities.length}</div>
          <div className="metric-foot">
            <span className="up">↑ 8.2%</span> vs. previous period
          </div>
        </article>

        <article className="metric">
          <div className="metric-top">
            <span>Won this month</span>
            <span className="metric-icon">↗</span>
          </div>
          <div className="metric-value">{totalWonCommission}</div>
          <div className="metric-foot">
            <span className="up">↑ 16.4%</span> commission value
          </div>
        </article>
      </div>

      {/* 4 Quick Actions */}
      <div className="quick-actions">
        <button className="quick" onClick={() => openModal('enquiry')}>
          <span className="qicon">＋</span>
          <span>
            <strong>Add enquiry</strong>
            <small>Capture a new lead</small>
          </span>
        </button>
        <button className="quick" onClick={() => openModal('task')}>
          <span className="qicon">✓</span>
          <span>
            <strong>Create follow-up</strong>
            <small>Never miss a lead</small>
          </span>
        </button>
        <button className="quick" onClick={() => openModal('activity')}>
          <span className="qicon">☏</span>
          <span>
            <strong>Log activity</strong>
            <small>Record a conversation</small>
          </span>
        </button>
        <button className="quick" onClick={() => setCurrentView('leads')}>
          <span className="qicon">◎</span>
          <span>
            <strong>View pipeline</strong>
            <small>Move deals forward</small>
          </span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="layout">
        {/* Left: Priority Leads Table */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Priority leads</h3>
              <p>Prospects that need attention or are close to converting</p>
            </div>
            <button className="link-btn" onClick={() => setCurrentView('leads')}>
              View all leads ↗
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Requirement</th>
                  <th>Stage</th>
                  <th>Owner</th>
                  <th>Next action</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.slice(0, 5).map((opp, idx) => {
                  const avatarColors = ['#f2d58b', '#d8e8cb', '#d9d7fa', '#f2d5d9', '#e0f2fe'];
                  const color = avatarColors[idx % avatarColors.length];
                  const initials = opp.clientName
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('');

                  let stageClass = 'hot';
                  if (opp.stage === 'Qualified') stageClass = 'qualified';
                  else if (opp.stage === 'Inspection') stageClass = 'inspection';
                  else if (opp.stage === 'Negotiation') stageClass = 'negotiation';
                  else if (opp.stage === 'New enquiry') stageClass = 'hot';

                  return (
                    <tr
                      key={opp.id}
                      onClick={() => handleClientClick(opp.clientName)}
                      className="cursor-pointer"
                      title="Click to view full Client 360 profile"
                    >
                      <td>
                        <div className="person">
                          <div className="avatar" style={{ background: color }}>
                            {initials}
                          </div>
                          <div>
                            <strong>{opp.clientName}</strong>
                            <small>Lagos · {opp.priority} priority</small>
                          </div>
                        </div>
                      </td>
                      <td>{opp.requirementSummary}</td>
                      <td>
                        <span className={`status ${stageClass}`}>
                          {opp.stage === 'New enquiry' ? 'Hot lead' : opp.stage}
                        </span>
                      </td>
                      <td>{opp.owner.split(' ')[0]}</td>
                      <td>
                        <strong>{opp.nextAction}</strong>
                        <small
                          style={{
                            display: 'block',
                            color: opp.nextActionDue.includes('now') ? '#a34128' : '#8b6200',
                            marginTop: '4px',
                            fontWeight: 700,
                          }}
                        >
                          {opp.nextActionDue}
                        </small>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-col">
          {/* Pipeline Funnel */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Lead pipeline</h3>
                <p>Current opportunities by stage</p>
              </div>
              <button className="link-btn" onClick={() => setCurrentView('leads')}>
                Details ↗
              </button>
            </div>
            <div className="pipeline">
              <div className="pipe-row">
                <span className="pipe-name">New enquiry</span>
                <div className="pipe-track">
                  <div className="pipe-fill" style={{ width: '88%' }}></div>
                </div>
                <span className="pipe-count">{stageCounts['New enquiry']}</span>
              </div>
              <div className="pipe-row">
                <span className="pipe-name">Qualified</span>
                <div className="pipe-track">
                  <div className="pipe-fill" style={{ width: '70%' }}></div>
                </div>
                <span className="pipe-count">{stageCounts['Qualified']}</span>
              </div>
              <div className="pipe-row">
                <span className="pipe-name">Inspection</span>
                <div className="pipe-track">
                  <div className="pipe-fill" style={{ width: '53%' }}></div>
                </div>
                <span className="pipe-count">{stageCounts['Inspection']}</span>
              </div>
              <div className="pipe-row">
                <span className="pipe-name">Negotiation</span>
                <div className="pipe-track">
                  <div className="pipe-fill" style={{ width: '36%' }}></div>
                </div>
                <span className="pipe-count">{stageCounts['Negotiation']}</span>
              </div>
              <div className="pipe-row">
                <span className="pipe-name">Closing</span>
                <div className="pipe-track">
                  <div className="pipe-fill" style={{ width: '19%' }}></div>
                </div>
                <span className="pipe-count">{stageCounts['Closing']}</span>
              </div>
            </div>
          </div>

          {/* Today's Follow-ups */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Today's follow-ups</h3>
                <p>{openTasks.length} actions scheduled</p>
              </div>
              <button className="link-btn" onClick={() => setCurrentView('tasks')}>
                View all ↗
              </button>
            </div>
            <div className="task-list">
              {tasks.slice(0, 5).map((t) => (
                <label
                  key={t.id}
                  className="task"
                  style={{ opacity: t.status === 'completed' ? 0.48 : 1 }}
                >
                  <input
                    type="checkbox"
                    className="task-check"
                    checked={t.status === 'completed'}
                    onChange={() => toggleTask(t.id)}
                  />
                  <span className="task-content">
                    <strong style={{ textDecoration: t.status === 'completed' ? 'line-through' : 'none' }}>
                      {t.title}
                    </strong>
                    <p>
                      {t.owner.split(' ')[0]} · {t.taskType} {t.clientName ? `· ${t.clientName}` : ''}
                    </p>
                  </span>
                  <span className="task-time">{t.dueTime}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Recent activity</h3>
                <p>Latest team interactions</p>
              </div>
              <button className="link-btn" onClick={() => setCurrentView('communications')}>
                All activity ↗
              </button>
            </div>
            <div className="activity">
              {activities.slice(0, 3).map((act) => {
                let ico = '☏';
                if (act.activityType.toLowerCase().includes('property') || act.activityType.toLowerCase().includes('message')) {
                  ico = '✉';
                } else if (act.activityType.toLowerCase().includes('inspection')) {
                  ico = '⌂';
                }

                return (
                  <div key={act.id} className="activity-item">
                    <div className="activity-ico">{ico}</div>
                    <div className="activity-copy">
                      <strong>
                        {act.owner.split(' ')[0]} · {act.clientName}
                      </strong>
                      <p>{act.notes}</p>
                      <small>
                        {act.timestamp} · {act.channel || act.activityType}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
