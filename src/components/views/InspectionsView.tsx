import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Inspection } from '../../types';

export const InspectionsView: React.FC = () => {
  const { inspections, updateInspectionStatus, openModal, setSelectedClient360, contacts } = useCrm();
  const [statusFilter, setStatusFilter] = useState<'All' | 'Scheduled' | 'Completed'>('All');
  const [recordingFeedbackFor, setRecordingFeedbackFor] = useState<Inspection | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [objectionsInput, setObjectionsInput] = useState('');

  const filteredInspections = inspections.filter((insp) => {
    if (statusFilter === 'All') return true;
    return insp.status === statusFilter;
  });

  const handleOpenFeedback = (insp: Inspection) => {
    setRecordingFeedbackFor(insp);
    setFeedbackInput(insp.feedbackNotes || '');
    setObjectionsInput(insp.clientObjections || '');
  };

  const handleSaveFeedback = () => {
    if (!recordingFeedbackFor) return;
    updateInspectionStatus(
      recordingFeedbackFor.id,
      'Completed',
      feedbackInput,
      objectionsInput
    );
    setRecordingFeedbackFor(null);
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
            <h3>Property Inspections & Physical Viewings</h3>
            <p>Track schedule confirmations, attendee logs, inspection feedback, and client objections</p>
          </div>
          <button
            className="btn"
            onClick={() =>
              openModal('task', {
                title: 'Schedule property physical inspection',
                type: 'Inspection',
              })
            }
          >
            ＋ Schedule inspection
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All">All inspections</option>
            <option value="Scheduled">Scheduled / Upcoming</option>
            <option value="Completed">Completed viewings</option>
          </select>
          <span className="text-xs text-[#665d50] ml-auto font-medium">
            Showing {filteredInspections.length} inspection events
          </span>
        </div>

        {/* Inspections Grid */}
        <div className="p-5 space-y-4">
          {filteredInspections.map((insp) => {
            const isCompleted = insp.status === 'Completed';

            return (
              <div
                key={insp.id}
                className="p-4 bg-white border border-[#e8d8c4] rounded-xl space-y-3 shadow-sm hover:border-[#dba80f] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`status ${isCompleted ? 'qualified' : 'inspection'} text-[10px]`}>
                        {insp.status}
                      </span>
                      <strong className="text-sm font-bold text-black">{insp.propertyRef}</strong>
                      <span className="text-xs text-[#665d50]">· {insp.propertyTitle}</span>
                    </div>

                    <div className="text-xs text-[#443b30] mt-1.5 flex flex-wrap gap-4">
                      <span>
                        👤 <strong>Client:</strong>{' '}
                        <button
                          className="text-black font-semibold hover:underline"
                          onClick={() => handleOpenClient(insp.clientName)}
                        >
                          {insp.clientName}
                        </button>
                      </span>
                      <span>
                        📅 <strong>Date:</strong> {insp.scheduledDate} ({insp.scheduledTime})
                      </span>
                      <span>
                        👔 <strong>Lead Agent:</strong> {insp.agentName}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isCompleted ? (
                      <button
                        className="btn small"
                        onClick={() => handleOpenFeedback(insp)}
                      >
                        Record viewing feedback
                      </button>
                    ) : (
                      <button
                        className="btn secondary small"
                        onClick={() => handleOpenFeedback(insp)}
                      >
                        Edit notes
                      </button>
                    )}
                  </div>
                </div>

                {/* Attendees list */}
                <div className="text-xs text-[#665d50] pt-2 border-t border-[#f0e2d0]">
                  <strong>Confirmed Attendees: </strong>
                  {insp.attendees.join(' · ')}
                </div>

                {/* Completed Viewing Notes & Objections */}
                {(insp.feedbackNotes || insp.clientObjections) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    {insp.feedbackNotes && (
                      <div className="p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg text-[#166534]">
                        <strong className="block mb-1">Viewing Notes & Impressions:</strong>
                        <p className="m-0 leading-relaxed">{insp.feedbackNotes}</p>
                      </div>
                    )}
                    {insp.clientObjections && (
                      <div className="p-3 bg-[#fff1f2] border border-[#fecdd3] rounded-lg text-[#9f1239]">
                        <strong className="block mb-1">Client Objections / Concerns:</strong>
                        <p className="m-0 leading-relaxed">{insp.clientObjections}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredInspections.length === 0 && (
            <div className="p-8 text-center text-[#665d50] bg-[#fff6ea] rounded-xl border border-[#e8d8c4]">
              No inspections recorded under this filter.
            </div>
          )}
        </div>
      </div>

      {/* Record Feedback & Objections Modal */}
      {recordingFeedbackFor && (
        <div className="modal-backdrop" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: '580px' }}>
            <div className="modal-head">
              <div>
                <h3 className="m-0">Inspection Feedback & Objections</h3>
                <p className="text-xs text-[#665d50] m-0 mt-0.5">
                  {recordingFeedbackFor.clientName} · {recordingFeedbackFor.propertyRef}
                </p>
              </div>
              <button className="close" onClick={() => setRecordingFeedbackFor(null)}>
                ×
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Inspection Impressions & Client Reaction</label>
                <textarea
                  className="w-full p-2.5 border border-[#e8d8c4] rounded-lg bg-white min-h-[70px]"
                  placeholder="How did the physical viewing go? Did the client like the layout, natural lighting, and finishes?"
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Client Objections & Deal-breakers Raised</label>
                <textarea
                  className="w-full p-2.5 border border-[#e8d8c4] rounded-lg bg-white min-h-[70px]"
                  placeholder="e.g. Access road condition during rainy season, diesel generator cap, parking allocation..."
                  value={objectionsInput}
                  onChange={(e) => setObjectionsInput(e.target.value)}
                />
              </div>

              <div className="p-3 bg-[#fff0cf] rounded-lg text-[#443b30] text-[11px]">
                ℹ️ Completing this step updates the agent's scorecard and qualifies this viewing as an authentic completed inspection.
              </div>
            </div>

            <div className="modal-foot">
              <button
                className="btn secondary"
                onClick={() => setRecordingFeedbackFor(null)}
              >
                Cancel
              </button>
              <button className="btn" onClick={handleSaveFeedback}>
                Save & Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
