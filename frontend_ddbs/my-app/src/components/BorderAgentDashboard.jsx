// src/components/BorderAgentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const STAGES = [
  { key: 'queued',                label: 'Queued' },
  { key: 'documents_submitted',   label: 'Documents Submitted' },
  { key: 'under_inspection',      label: 'Under Inspection' },
  { key: 'customs_cleared',       label: 'Customs Cleared' },
  { key: 'released_for_crossing', label: 'Released for Crossing' },
];

const DELAY_CAUSES = [
  'Customs Hold',
  'Document Issue',
  'Vehicle Inspection',
  'Strike / Protest',
  'System Outage',
  'Other',
];

const MOCK = [
  {
    id: 'BRD001',
    containerCode: 'MSKU-7821934',
    clientName: 'AfriTrade Ltd',
    sealNumber: 'SL-44210',
    completedStages: ['queued', 'documents_submitted'],
  },
  {
    id: 'BRD002',
    containerCode: 'GESU-4456712',
    clientName: 'Maluti Exports',
    sealNumber: 'SL-44216',
    completedStages: [],
  },
  {
    id: 'BRD003',
    containerCode: 'APHU-6678120',
    clientName: 'Highlands Mining',
    sealNumber: 'SL-44217',
    completedStages: ['queued', 'documents_submitted', 'under_inspection', 'customs_cleared'],
  },
];

const getNextStage = (completedStages) =>
  STAGES.find(s => !completedStages.includes(s.key)) || null;

const s = {
  page: {
    padding: '28px 36px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f3f4f6',
    minHeight: '100vh',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '800px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '4px',
  },
  containerCode: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
  },
  cardMeta: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '18px',
  },
  actionBtns: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  btnOutlined: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 13px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    background: 'white',
    color: '#374151',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '4px',
    marginBottom: '18px',
  },
  stageItem: (done) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: done ? '#16a34a' : '#9ca3af',
    fontWeight: done ? '500' : '400',
  }),
  stageIcon: (done) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: `1.5px solid ${done ? '#16a34a' : '#d1d5db'}`,
    fontSize: '9px',
    flexShrink: 0,
    color: done ? '#16a34a' : '#9ca3af',
  }),
  divider: {
    color: '#d1d5db',
    fontSize: '13px',
    margin: '0 2px',
    userSelect: 'none',
  },
  advanceBtn: {
    padding: '9px 22px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  // Modals shared
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '28px',
    width: '460px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    position: 'relative',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '22px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    boxSizing: 'border-box',
    marginBottom: '16px',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #2563eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    background: 'white',
    marginBottom: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    boxSizing: 'border-box',
    marginBottom: '16px',
    resize: 'vertical',
    minHeight: '90px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  noteText: {
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '20px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  btnBlue: {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  // Toast
  toast: {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#111827',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    zIndex: 2000,
  },
};

const BorderAgentDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [consignments, setConsignments] = useState([]);
  const [handoverTarget, setHandoverTarget] = useState(null);
  const [delayTarget, setDelayTarget]     = useState(null);

  useEffect(() => {
    const action = searchParams.get('action');
    if (!action) return;
    const saved = JSON.parse(localStorage.getItem('borderConsignments') || '[]');
    const first = saved[0] || null;
    if (action === 'upload-docs' && first) setUploadTarget(first);
    if (action === 'handover'    && first) setHandoverTarget(first);
    if (action === 'log-delay'   && first) setDelayTarget(first);
    setSearchParams({});
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const [toast, setToast]                 = useState('');

  const [handoverForm, setHandoverForm] = useState({ outgoingDriver: '', incomingDriver: '', newTruckPlate: '' });
  const [delayForm, setDelayForm]       = useState({ cause: 'Customs Hold', notes: '' });
  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploadFiles, setUploadFiles]   = useState({ billOfLading: null, customsDoc: null, packingList: null });

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    const saved = JSON.parse(localStorage.getItem('borderConsignments') || 'null');
    if (!saved) {
      localStorage.setItem('borderConsignments', JSON.stringify(MOCK));
      setConsignments(MOCK);
    } else {
      setConsignments(saved);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const save = (updated) => {
    localStorage.setItem('borderConsignments', JSON.stringify(updated));
    setConsignments(updated);
  };

  const advanceStage = (consignment) => {
    const next = getNextStage(consignment.completedStages);
    if (!next) return;
    save(consignments.map(c =>
      c.id === consignment.id
        ? { ...c, completedStages: [...c.completedStages, next.key] }
        : c
    ));
    queueForSync('border_stage_advance', { id: consignment.id, stage: next.key });
  };

  const confirmHandover = () => {
    if (!handoverForm.outgoingDriver || !handoverForm.incomingDriver || !handoverForm.newTruckPlate) {
      return alert('Please fill in all handover fields.');
    }
    const handovers = JSON.parse(localStorage.getItem('handovers') || '[]');
    handovers.push({
      id: `HO${Date.now()}`,
      consignmentId: handoverTarget.id,
      containerCode: handoverTarget.containerCode,
      ...handoverForm,
      recordedAt: new Date().toISOString(),
    });
    localStorage.setItem('handovers', JSON.stringify(handovers));
    queueForSync('handover_recorded', { id: handoverTarget.id, ...handoverForm });
    setHandoverTarget(null);
    setHandoverForm({ outgoingDriver: '', incomingDriver: '', newTruckPlate: '' });
    showToast('Handover recorded');
  };

  const handleUploadDocs = () => {
    const selected = Object.values(uploadFiles).filter(Boolean);
    if (selected.length === 0) return alert('Please select at least one document.');

    const readFile = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ name: file.name, size: file.size, type: file.type, data: e.target.result });
        reader.readAsDataURL(file);
      });

    Promise.all(
      Object.entries(uploadFiles)
        .filter(([, f]) => f !== null)
        .map(([key, file]) => readFile(file).then(result => ({ key, ...result })))
    ).then((results) => {
      const docs = JSON.parse(localStorage.getItem('borderDocuments') || '[]');
      docs.push({
        id: `BDOC${Date.now()}`,
        consignmentId: uploadTarget.id,
        containerCode: uploadTarget.containerCode,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Border Agent',
        files: results.map(({ key, name, size, type, data }) => ({ key, name, size, type, data })),
      });
      localStorage.setItem('borderDocuments', JSON.stringify(docs));
      queueForSync('docs_uploaded', { id: uploadTarget.id, files: results.map(r => r.name) });
      setUploadTarget(null);
      setUploadFiles({ billOfLading: null, customsDoc: null, packingList: null });
      showToast('Document uploaded');
    });
  };

  const submitDelay = () => {
    const delays = JSON.parse(localStorage.getItem('delays') || '[]');
    delays.push({
      id: `DLY${Date.now()}`,
      consignmentId: delayTarget.id,
      containerCode: delayTarget.containerCode,
      ...delayForm,
      recordedAt: new Date().toISOString(),
    });
    localStorage.setItem('delays', JSON.stringify(delays));
    queueForSync('delay_logged', { id: delayTarget.id, ...delayForm });
    setDelayTarget(null);
    setDelayForm({ cause: 'Customs Hold', notes: '' });
    showToast('Delay logged');
  };

  const queueForSync = (operation, data) => {
    const syncLog = JSON.parse(localStorage.getItem('sync_log') || '[]');
    syncLog.push({ id: `sync_${Date.now()}`, operation, data, local_time: new Date().toISOString(), sync_status: 'pending', role: 'border_agent' });
    localStorage.setItem('sync_log', JSON.stringify(syncLog));
  };

  return (
    <div style={s.page}>
      <div style={s.list}>
        {consignments.map(c => {
          const next = getNextStage(c.completedStages);
          return (
            <div key={c.id} style={s.card}>
              {/* Header */}
              <div style={s.cardTop}>
                <div>
                  <span style={s.containerCode}>{c.containerCode}</span>
                </div>
                <div style={s.actionBtns}>
                  <button style={s.btnOutlined} onClick={() => setHandoverTarget(c)}>
                    👤 Handover
                  </button>
                  <button style={s.btnOutlined} onClick={() => setUploadTarget(c)}>
                    📄 Upload Docs
                  </button>
                  <button style={s.btnOutlined} onClick={() => setDelayTarget(c)}>
                    Log Delay
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div style={s.cardMeta}>
                {c.clientName} · Seal {c.sealNumber}
              </div>

              {/* Progress */}
              <div style={s.progressRow}>
                {STAGES.map((stage, i) => {
                  const done = c.completedStages.includes(stage.key);
                  return (
                    <React.Fragment key={stage.key}>
                      <span style={s.stageItem(done)}>
                        <span style={s.stageIcon(done)}>{done ? '✓' : '⏱'}</span>
                        {stage.label}
                      </span>
                      {i < STAGES.length - 1 && <span style={s.divider}>—</span>}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Advance */}
              {next && (
                <button style={s.advanceBtn} onClick={() => advanceStage(c)}>
                  Advance: {next.label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Docs Modal */}
      {uploadTarget && (
        <div style={s.overlay} onClick={() => setUploadTarget(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Upload Documents</h3>
              <button style={s.closeBtn} onClick={() => setUploadTarget(null)}>✕</button>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0' }}>
              {uploadTarget.containerCode} · {uploadTarget.clientName}
            </p>

            {[
              { key: 'billOfLading',  label: 'Bill of Lading' },
              { key: 'customsDoc',    label: 'Customs Clearance Document' },
              { key: 'packingList',   label: 'Packing List' },
            ].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: '16px' }}>
                <label style={s.label}>{label}</label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  border: `1.5px dashed ${uploadFiles[key] ? '#2563eb' : '#d1d5db'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: uploadFiles[key] ? '#2563eb' : '#9ca3af',
                  background: uploadFiles[key] ? '#eff6ff' : '#fafafa',
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: '16px' }}>📎</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {uploadFiles[key] ? uploadFiles[key].name : 'Click to choose file…'}
                  </span>
                  {uploadFiles[key] && (
                    <span style={{ fontSize: '11px', color: '#6b7280', flexShrink: 0 }}>
                      {(uploadFiles[key].size / 1024).toFixed(1)} KB
                    </span>
                  )}
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={e => setUploadFiles({ ...uploadFiles, [key]: e.target.files[0] || null })}
                  />
                </label>
              </div>
            ))}

            <div style={{ ...s.modalFooter, gap: '10px', marginTop: '8px' }}>
              <button style={{ ...s.btnBlue, background: 'white', color: '#374151', border: '1.5px solid #e5e7eb' }}
                onClick={() => { setUploadTarget(null); setUploadFiles({ billOfLading: null, customsDoc: null, packingList: null }); }}>
                Cancel
              </button>
              <button style={s.btnBlue} onClick={handleUploadDocs}>Upload</button>
            </div>
          </div>
        </div>
      )}

      {/* Handover Modal */}
      {handoverTarget && (
        <div style={s.overlay} onClick={() => setHandoverTarget(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Trucking Party Handover</h3>
              <button style={s.closeBtn} onClick={() => setHandoverTarget(null)}>✕</button>
            </div>
            <label style={s.label}>Outgoing driver</label>
            <input
              style={s.input}
              value={handoverForm.outgoingDriver}
              onChange={e => setHandoverForm({ ...handoverForm, outgoingDriver: e.target.value })}
              autoFocus
            />
            <label style={s.label}>Incoming driver</label>
            <input
              style={s.input}
              value={handoverForm.incomingDriver}
              onChange={e => setHandoverForm({ ...handoverForm, incomingDriver: e.target.value })}
            />
            <label style={s.label}>New truck plate</label>
            <input
              style={s.input}
              value={handoverForm.newTruckPlate}
              onChange={e => setHandoverForm({ ...handoverForm, newTruckPlate: e.target.value })}
            />
            <p style={s.noteText}>Both signatures will be recorded immutably.</p>
            <div style={s.modalFooter}>
              <button style={s.btnBlue} onClick={confirmHandover}>Confirm Handover</button>
            </div>
          </div>
        </div>
      )}

      {/* Log Delay Modal */}
      {delayTarget && (
        <div style={s.overlay} onClick={() => setDelayTarget(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Log Delay</h3>
              <button style={s.closeBtn} onClick={() => setDelayTarget(null)}>✕</button>
            </div>
            <label style={s.label}>Cause</label>
            <select
              style={s.select}
              value={delayForm.cause}
              onChange={e => setDelayForm({ ...delayForm, cause: e.target.value })}
            >
              {DELAY_CAUSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <label style={s.label}>Notes</label>
            <textarea
              style={s.textarea}
              value={delayForm.notes}
              onChange={e => setDelayForm({ ...delayForm, notes: e.target.value })}
            />
            <div style={s.modalFooter}>
              <button style={s.btnBlue} onClick={submitDelay}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={s.toast}>
          <span style={{ color: '#2563eb', fontSize: '16px' }}>✔</span>
          {toast}
        </div>
      )}
    </div>
  );
};

export default BorderAgentDashboard;
