import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';

export const AiAssistantModal: React.FC = () => {
  const { activeModal, closeModal, modalInitialData, addRequirement, toast } = useCrm();
  const [activeTab, setActiveTab] = useState<'extract' | 'draft'>('extract');

  // Extraction State
  const [inquiryText, setInquiryText] = useState(
    'Hello UPG, our engineering firm is looking for a 400 sqm office space in Lekki Phase 1 with 24/7 dedicated generator power and at least 20 parking bays. Budget is around ₦30m/year. Need to move in within 30 days.'
  );
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Draft State
  const [clientName, setClientName] = useState('David Okafor');
  const [channel, setChannel] = useState('WhatsApp');
  const [propertyRef, setPropertyRef] = useState('UPG-OF-0104');
  const [contextNotes, setContextNotes] = useState('Client requested 24/7 power guarantee and parking details for Lekki Phase 1 office');
  const [drafting, setDrafting] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState('');

  useEffect(() => {
    if (activeModal === 'ai_assistant' && modalInitialData) {
      if (modalInitialData.message) {
        setInquiryText(modalInitialData.message);
        setActiveTab('extract');
      }
      if (modalInitialData.clientName) {
        setClientName(modalInitialData.clientName);
        setActiveTab('draft');
      }
    }
  }, [activeModal, modalInitialData]);

  if (activeModal !== 'ai_assistant') return null;

  const handleExtract = async () => {
    setExtracting(true);
    try {
      const res = await fetch('/api/ai/extract-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inquiryText }),
      });
      const data = await res.json();
      setExtractedData(data.result);
      toast('Requirement parameters successfully extracted.');
    } catch {
      toast('Failed to contact AI extraction endpoint.');
    } finally {
      setExtracting(false);
    }
  };

  const handleDraft = async () => {
    setDrafting(true);
    try {
      const res = await fetch('/api/ai/draft-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          channel,
          propertyRef,
          contextNotes,
        }),
      });
      const data = await res.json();
      setGeneratedDraft(data.draft);
      toast('Response draft generated.');
    } catch {
      toast('Failed to contact AI drafting endpoint.');
    } finally {
      setDrafting(false);
    }
  };

  const handleSaveExtractedRequirement = () => {
    if (!extractedData) return;
    addRequirement({
      contactId: `c-${Date.now()}`,
      clientName: clientName || 'Prospect',
      transactionType: extractedData.transactionType || 'Commercial leasing',
      propertyType: extractedData.propertyType || 'Office',
      preferredLocations: extractedData.preferredLocation ? [extractedData.preferredLocation] : ['Lekki Phase 1'],
      excludedLocations: [],
      budgetMin: extractedData.budgetMin || 20000000,
      budgetMax: extractedData.budgetMax || 35000000,
      budgetDisplay: extractedData.budgetDisplay || '₦25m–₦35m / year',
      currency: 'NGN',
      rentPeriod: 'per annum',
      minSizeSqm: extractedData.minSizeSqm || 350,
      essentialFeatures: extractedData.essentialFeatures || ['24/7 Power', 'Backup Generator'],
      dealBreakers: extractedData.dealBreakers || '',
      timing: extractedData.timing || 'Within 30 days',
      decisionAuthority: 'Sole decision maker',
      fundingReadiness: 'Proof of funds ready',
      status: 'Urgent',
    });
    closeModal();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDraft);
    toast('Copied to clipboard.');
  };

  return (
    <div
      className="modal-backdrop"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
          closeModal();
        }
      }}
    >
      <div className="modal" style={{ maxWidth: '640px' }}>
        <div className="modal-head" style={{ background: '#fff6ea' }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '18px' }}>✨</span>
            <h3 className="m-0">UPG AI Assistant (Gemini 2.5 Flash)</h3>
          </div>
          <button className="close" onClick={closeModal} aria-label="Close">
            ×
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#e8d8c4] bg-[#fffaf4] px-4 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('extract')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'extract'
                ? 'border-[#dba80f] text-black bg-[#fff0d5]'
                : 'border-transparent text-[#665d50] hover:text-black'
            }`}
          >
            🔍 Extract Requirements from Inquiry
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'draft'
                ? 'border-[#dba80f] text-black bg-[#fff0d5]'
                : 'border-transparent text-[#665d50] hover:text-black'
            }`}
          >
            ✍️ Draft Tailored Agent Response
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* TAB 1: REQUIREMENT EXTRACTION */}
          {activeTab === 'extract' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">
                  Inbound Client Message / Voice-Note Transcript
                </label>
                <textarea
                  className="w-full p-3 border border-[#e8d8c4] rounded-lg bg-white text-xs min-h-[90px]"
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder="Paste WhatsApp chat or inquiry transcript..."
                />
              </div>

              <button
                className="btn w-full"
                onClick={handleExtract}
                disabled={extracting}
              >
                {extracting ? 'Analyzing Message with Gemini...' : '⚡ Extract Structured Demand Parameters'}
              </button>

              {extractedData && (
                <div className="p-4 bg-[#fff6ea] rounded-xl border border-[#e8d8c4] space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#e8d8c4]">
                    <span className="font-extrabold text-black">Extracted Parameters</span>
                    <span className="status qualified text-[10px]">Ready to save</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[#665d50] block">Property Type:</span>
                      <strong>{extractedData.propertyType}</strong>
                    </div>
                    <div>
                      <span className="text-[#665d50] block">Transaction:</span>
                      <strong>{extractedData.transactionType}</strong>
                    </div>
                    <div>
                      <span className="text-[#665d50] block">Location:</span>
                      <strong>{extractedData.preferredLocation}</strong>
                    </div>
                    <div>
                      <span className="text-[#665d50] block">Budget:</span>
                      <strong className="text-[#217a52]">{extractedData.budgetDisplay}</strong>
                    </div>
                    <div>
                      <span className="text-[#665d50] block">Min Size:</span>
                      <strong>{extractedData.minSizeSqm ? `${extractedData.minSizeSqm} sqm` : 'Open'}</strong>
                    </div>
                    <div>
                      <span className="text-[#665d50] block">Timing:</span>
                      <strong>{extractedData.timing}</strong>
                    </div>
                  </div>

                  {extractedData.essentialFeatures && (
                    <div className="pt-2 border-t border-[#e8d8c4]">
                      <span className="text-[#665d50] block">Essential Must-Haves:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {extractedData.essentialFeatures.map((f: string, i: number) => (
                          <span
                            key={i}
                            className="bg-white border border-[#e8d8c4] px-2 py-0.5 rounded text-[10px] font-semibold"
                          >
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      className="btn small"
                      onClick={handleSaveExtractedRequirement}
                    >
                      Save as Active Client Requirement
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SMART AGENT DRAFT */}
          {activeTab === 'draft' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Client Name</label>
                  <input
                    className="w-full p-2 border border-[#e8d8c4] rounded-lg bg-white"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Channel Format</label>
                  <select
                    className="w-full p-2 border border-[#e8d8c4] rounded-lg bg-white"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                  >
                    <option>WhatsApp</option>
                    <option>Email</option>
                    <option>SMS</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Property Reference</label>
                  <input
                    className="w-full p-2 border border-[#e8d8c4] rounded-lg bg-white"
                    value={propertyRef}
                    onChange={(e) => setPropertyRef(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Context / Discussion</label>
                  <input
                    className="w-full p-2 border border-[#e8d8c4] rounded-lg bg-white"
                    value={contextNotes}
                    onChange={(e) => setContextNotes(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="btn w-full"
                onClick={handleDraft}
                disabled={drafting}
              >
                {drafting ? 'Composing Draft with Gemini...' : '⚡ Generate Professional Nigerian Agent Draft'}
              </button>

              {generatedDraft && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold">Suggested Message</label>
                    <button
                      className="btn secondary small"
                      onClick={copyToClipboard}
                    >
                      📋 Copy Text
                    </button>
                  </div>
                  <textarea
                    className="w-full p-3 border border-[#e8d8c4] rounded-lg bg-white text-xs min-h-[140px] leading-relaxed"
                    value={generatedDraft}
                    onChange={(e) => setGeneratedDraft(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn secondary" onClick={closeModal}>
            Close Assistant
          </button>
        </div>
      </div>
    </div>
  );
};
