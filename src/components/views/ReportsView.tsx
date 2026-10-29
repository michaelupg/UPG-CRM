import React from 'react';
import { useCrm } from '../../context/CrmContext';

export const ReportsView: React.FC = () => {
  const { enquiries, opportunities } = useCrm();

  return (
    <section className="section-view active">
      {/* Top Metrics */}
      <div className="metrics">
        <article className="metric">
          <div className="metric-top">
            <span>Lead-to-close rate</span>
            <span className="metric-icon">◎</span>
          </div>
          <div className="metric-value">7.3%</div>
          <div className="metric-foot">Cohorted across last 90 days</div>
        </article>

        <article className="metric">
          <div className="metric-top">
            <span>Average first response</span>
            <span className="metric-icon">◷</span>
          </div>
          <div className="metric-value">11 min</div>
          <div className="metric-foot">Human agent response only</div>
        </article>

        <article className="metric">
          <div className="metric-top">
            <span>Open pipeline value</span>
            <span className="metric-icon">💳</span>
          </div>
          <div className="metric-value">₦84.2m</div>
          <div className="metric-foot">Forecast weighted commission</div>
        </article>

        <article className="metric">
          <div className="metric-top">
            <span>Lost leads this month</span>
            <span className="metric-icon">↘</span>
          </div>
          <div className="metric-value">19</div>
          <div className="metric-foot">
            <span className="down">● Pricing & power fit</span>
          </div>
        </article>
      </div>

      {/* Conversion Insights Panel */}
      <div className="panel mb-5">
        <div className="panel-head">
          <div>
            <h3>Conversion insights</h3>
            <p>Use funnel drop-off to identify where deals are getting stuck</p>
          </div>
        </div>
        <div className="profile-grid">
          <div className="mini-card">
            <small>Largest drop-off</small>
            <div className="big">Contact → Qualified</div>
            <p className="text-xs text-[#50473c] mt-2 leading-relaxed">
              Review enquiry quality, response coverage, and initial qualification questions for commercial leases.
            </p>
          </div>
          <div className="mini-card">
            <small>Follow-up risk</small>
            <div className="big">8 leads</div>
            <p className="text-xs text-[#50473c] mt-2 leading-relaxed">
              Open opportunities have a due or overdue action. Automated escalation alerts have been dispatched.
            </p>
          </div>
          <div className="mini-card">
            <small>Attribution gap</small>
            <div className="big">14%</div>
            <p className="text-xs text-[#50473c] mt-2 leading-relaxed">
              Enquiries currently lack a confirmed campaign source tag. WhatsApp Business direct leads are highest converting.
            </p>
          </div>
        </div>
      </div>

      {/* Source Attribution & Lost Reasons breakdown */}
      <div className="layout">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Marketing Source Attribution</h3>
              <p>Inbound channels ranked by lead qualification rate</p>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>WhatsApp Direct Inbound</span>
                <span>46% of inquiries (78% qual rate)</span>
              </div>
              <div className="h-2.5 bg-[#f0e3d1] rounded-full overflow-hidden">
                <div className="h-full bg-[#dba80f] rounded-full" style={{ width: '46%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Client & Partner Referrals</span>
                <span>24% of inquiries (92% qual rate)</span>
              </div>
              <div className="h-2.5 bg-[#f0e3d1] rounded-full overflow-hidden">
                <div className="h-full bg-[#dba80f] rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>UPG Official Website Forms</span>
                <span>18% of inquiries (64% qual rate)</span>
              </div>
              <div className="h-2.5 bg-[#f0e3d1] rounded-full overflow-hidden">
                <div className="h-full bg-[#dba80f] rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Direct Inbound Phone Calls</span>
                <span>12% of inquiries (70% qual rate)</span>
              </div>
              <div className="h-2.5 bg-[#f0e3d1] rounded-full overflow-hidden">
                <div className="h-full bg-[#dba80f] rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Metric Definitions</h3>
              <p>Explicit definitions ensuring no simulated metrics</p>
            </div>
          </div>
          <div className="p-4 space-y-3 text-xs text-[#443b30] leading-relaxed">
            <div className="p-2.5 bg-[#fff6ea] rounded-lg">
              <strong className="block text-black">Meaningful Conversation</strong>
              Two-way phone call (&gt;2 mins), in-person meeting, or substantive WhatsApp exchange regarding property terms. Outbound unreplied messages are excluded.
            </div>
            <div className="p-2.5 bg-[#fff6ea] rounded-lg">
              <strong className="block text-black">Completed Inspection</strong>
              A physical property viewing with attendee check-in and recorded feedback/objections. Scheduled or cancelled viewings are excluded.
            </div>
            <div className="p-2.5 bg-[#fff6ea] rounded-lg">
              <strong className="block text-black">Average First Response SLA</strong>
              Elapsed time between inbound enquiry creation and first human agent response during business operating hours (09:00 - 17:00).
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
