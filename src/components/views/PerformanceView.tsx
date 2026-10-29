import React from 'react';
import { useCrm } from '../../context/CrmContext';

export const PerformanceView: React.FC = () => {
  const { staffPerformance, toast } = useCrm();

  const handleExportCsv = () => {
    const headers = [
      'Agent Name',
      'Meaningful Conversations',
      'Dial Attempts',
      'Completed Inspections',
      'Follow-up Compliance %',
      'Deals Won',
      'Total Commission Generated',
      'Avg Response Time (Mins)',
    ];

    const rows = staffPerformance.map((s) => [
      `"${s.agentName}"`,
      s.conversations,
      s.dialAttempts,
      s.inspections,
      `"${s.compliancePercent}%"`,
      s.dealsWon,
      `"${s.totalCommission}"`,
      s.responseTimeMinutes,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `upg-agent-performance-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast('Performance scorecard CSV exported.');
  };

  const totalConversations = staffPerformance.reduce((a, b) => a + b.conversations, 0);
  const totalInspections = staffPerformance.reduce((a, b) => a + b.inspections, 0);
  const totalDeals = staffPerformance.reduce((a, b) => a + b.dealsWon, 0);
  const avgCompliance = Math.round(
    staffPerformance.reduce((a, b) => a + b.compliancePercent, 0) / staffPerformance.length
  );

  return (
    <section className="section-view active">
      {/* Team Metrics Strip */}
      <div className="metrics">
        <article className="metric">
          <div className="metric-top">
            <span>Meaningful conversations</span>
            <span className="metric-icon">☏</span>
          </div>
          <div className="metric-value">{totalConversations}</div>
          <div className="metric-foot">Team total · Verified calls & meetings</div>
        </article>

        <article className="metric">
          <div className="metric-top">
            <span>Inspections completed</span>
            <span className="metric-icon">⌂</span>
          </div>
          <div className="metric-value">{totalInspections}</div>
          <div className="metric-foot">Target: 40 viewings</div>
        </article>

        <article className="metric">
          <div className="metric-top">
            <span>Follow-ups on time</span>
            <span className="metric-icon">✓</span>
          </div>
          <div className="metric-value">{avgCompliance}%</div>
          <div className="metric-foot">
            <span className="down">● {100 - avgCompliance}% overdue</span>
          </div>
        </article>

        <article className="metric">
          <div className="metric-top">
            <span>Closed transactions</span>
            <span className="metric-icon">💳</span>
          </div>
          <div className="metric-value">{totalDeals}</div>
          <div className="metric-foot">Team total · This month</div>
        </article>
      </div>

      {/* Scorecard Table */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Agent activity scorecard</h3>
            <p>Distinguishing actual meaningful conversations and completed inspections from raw sent messages</p>
          </div>
          <button className="btn secondary small" onClick={handleExportCsv}>
            Export CSV
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Conversations</th>
                <th>Dial attempts</th>
                <th>Completed inspections</th>
                <th>Follow-up compliance</th>
                <th>Deals won</th>
                <th>Commission generated</th>
              </tr>
            </thead>
            <tbody>
              {staffPerformance.map((s, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="person">
                      <div className="avatar">
                        {s.agentName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <strong>{s.agentName}</strong>
                        <small>Avg response: {s.responseTimeMinutes}m</small>
                      </div>
                    </div>
                  </td>
                  <td className="font-bold">{s.conversations}</td>
                  <td>{s.dialAttempts}</td>
                  <td className="font-bold text-[#217a52]">{s.inspections}</td>
                  <td>
                    <span
                      className={`status ${
                        s.compliancePercent >= 90
                          ? 'qualified'
                          : s.compliancePercent >= 80
                          ? 'inspection'
                          : 'hot'
                      }`}
                    >
                      {s.compliancePercent}%
                    </span>
                  </td>
                  <td className="font-bold">{s.dealsWon}</td>
                  <td className="font-extrabold text-[#217a52]">{s.totalCommission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
