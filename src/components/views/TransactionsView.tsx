import React from 'react';
import { useCrm } from '../../context/CrmContext';

export const TransactionsView: React.FC = () => {
  const { transactions, openModal, setSelectedClient360, contacts } = useCrm();

  // Metrics calculation
  const totalCommissionEarned = transactions.reduce((acc, tx) => acc + tx.totalCommission, 0);
  const totalCashReceived = transactions.reduce((acc, tx) => acc + tx.cashReceived, 0);
  const totalAgreedValue = transactions.reduce((acc, tx) => acc + tx.agreedAmount, 0);

  const handleOpenClient = (clientName: string) => {
    const c = contacts.find((item) => item.name.toLowerCase() === clientName.toLowerCase());
    if (c) setSelectedClient360(c);
  };

  return (
    <section className="section-view active">
      {/* Financial Metrics Strip */}
      <div className="metrics">
        <article className="metric">
          <div className="metric-top">
            <span>Total Gross Transaction Value</span>
            <span className="metric-icon">💳</span>
          </div>
          <div className="metric-value">₦{(totalAgreedValue / 1000000).toFixed(1)}m</div>
          <div className="metric-foot">
            <span className="up">Closed lease & sales volume</span>
          </div>
        </article>

        <article className="metric">
          <div className="metric-top">
            <span>Earned Agency Commission</span>
            <span className="metric-icon">↗</span>
          </div>
          <div className="metric-value">₦{(totalCommissionEarned / 1000000).toFixed(2)}m</div>
          <div className="metric-foot">
            <span className="up">10% standard fee rate</span>
          </div>
        </article>

        <article className="metric">
          <div className="metric-top">
            <span>Cash Commission Received</span>
            <span className="metric-icon">✓</span>
          </div>
          <div className="metric-value">₦{(totalCashReceived / 1000000).toFixed(2)}m</div>
          <div className="metric-foot">
            <span className="up">100% collection compliance</span>
          </div>
        </article>

        <article className="metric">
          <div className="metric-top">
            <span>Pending Receivables</span>
            <span className="metric-icon">◷</span>
          </div>
          <div className="metric-value">₦0.00</div>
          <div className="metric-foot">
            <span>No overdue settlement</span>
          </div>
        </article>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Transactions & Handover Ledger</h3>
            <p>Executed leases, statutory title documents, commission settlements, and physical property handover</p>
          </div>
          <button
            className="btn"
            onClick={() =>
              openModal('activity', {
                notes: 'Generated closing transaction settlement invoice',
                type: 'Proposal sent',
              })
            }
          >
            ＋ Record transaction
          </button>
        </div>

        {/* Transactions Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client / Entity</th>
                <th>Property</th>
                <th>Agreed Value</th>
                <th>Commission</th>
                <th>Cash Collected</th>
                <th>Statutory Documents</th>
                <th>Handover Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <button
                      className="font-bold text-left text-black hover:underline"
                      onClick={() => handleOpenClient(tx.clientName)}
                    >
                      {tx.clientName}
                    </button>
                    <small style={{ display: 'block', color: '#665d50', marginTop: '2px' }}>
                      {tx.transactionType}
                    </small>
                  </td>
                  <td>
                    <strong>{tx.propertyRef}</strong>
                    <small style={{ display: 'block', color: '#665d50' }}>
                      {tx.propertyTitle}
                    </small>
                  </td>
                  <td className="font-bold text-black">{tx.agreedAmountDisplay}</td>
                  <td>
                    <span className="font-extrabold text-[#217a52]">
                      {tx.totalCommissionDisplay}
                    </span>
                    <small style={{ display: 'block', color: '#665d50' }}>
                      ({tx.commissionRatePercent}%)
                    </small>
                  </td>
                  <td>
                    <span className="status qualified text-[10px]">
                      {tx.cashReceivedDisplay}
                    </span>
                  </td>
                  <td>
                    <div className="space-y-1">
                      {tx.legalDocuments.map((doc, idx) => (
                        <div key={idx} className="text-[11px] flex items-center gap-1">
                          <span className="text-[#217a52]">✓</span>
                          <span>{doc.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>{tx.handoverDate || 'Pending'}</td>
                  <td>
                    <span className="status qualified">
                      {tx.closingStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[#665d50]">
                    No closed transactions recorded yet.
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
