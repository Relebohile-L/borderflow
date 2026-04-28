// src/components/PortAgentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const STAGES = [
  { key: 'port_gate_in',            label: 'Port Gate-In' },
  { key: 'submitted_to_authority',  label: 'Submitted to Port Authority' },
  { key: 'allocated_to_stack',      label: 'Allocated to Stack' },
  { key: 'loaded_onto_vessel',      label: 'Loaded onto Vessel' },
  { key: 'vessel_departed',         label: 'Vessel Departed' },
];

const calcDwell = (arrivedAt) => {
  const hours = Math.floor((Date.now() - new Date(arrivedAt)) / (1000 * 60 * 60));
  return `${hours}h`;
};

const getNextStage = (completedStages) =>
  STAGES.find(s => !completedStages.includes(s.key)) || null;

const MOCK = [
  {
    id: 'PORT001',
    containerCode: 'MSKU-7821934',
    clientName: 'AfriTrade Ltd',
    sealNumber: 'SL-44210',
    vessel: null,
    arrivedAt: new Date(Date.now()).toISOString(),
    completedStages: ['port_gate_in', 'submitted_to_authority', 'allocated_to_stack'],
  },
  {
    id: 'PORT002',
    containerCode: 'TGHU-5532108',
    clientName: 'MountainCraft Co',
    sealNumber: 'SL-44211',
    vessel: null,
    arrivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedStages: [],
  },
  {
    id: 'PORT003',
    containerCode: 'CMAU-9912455',
    clientName: 'Highlands Mining',
    sealNumber: 'SL-44212',
    vessel: 'MV Atlantic Star AS-224E',
    arrivedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    completedStages: [],
  },
];

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
  dwell: {
    fontSize: '13px',
    color: '#9ca3af',
    fontWeight: '400',
    marginLeft: '8px',
  },
  cardMeta: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '18px',
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    background: 'white',
    color: '#374151',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    flexShrink: 0,
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
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '28px',
    width: '420px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: '#111827',
  },
  modalSub: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 20px 0',
  },
  fileLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  fileInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  modalBtns: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '8px',
  },
  btnSave: {
    padding: '9px 20px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnCancel: {
    padding: '9px 20px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    background: 'white',
    color: '#374151',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

const PortAgentDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [consignments, setConsignments] = useState([]);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [documents, setDocuments] = useState({ billOfLading: '', customsDoc: '', packingList: '' });

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'upload-docs') {
      const saved = JSON.parse(localStorage.getItem('portConsignments') || '[]');
      if (saved.length) setUploadTarget(saved[0]);
      setSearchParams({});
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    const saved = JSON.parse(localStorage.getItem('portConsignments') || 'null');
    if (!saved) {
      localStorage.setItem('portConsignments', JSON.stringify(MOCK));
      setConsignments(MOCK);
    } else {
      setConsignments(saved);
    }
  };

  const advanceStage = (consignment) => {
    const next = getNextStage(consignment.completedStages);
    if (!next) return;
    const updated = consignments.map(c =>
      c.id === consignment.id
        ? { ...c, completedStages: [...c.completedStages, next.key] }
        : c
    );
    localStorage.setItem('portConsignments', JSON.stringify(updated));
    setConsignments(updated);
    queueForSync('port_stage_advance', { id: consignment.id, stage: next.key });
  };

  const saveDocuments = () => {
    const docs = JSON.parse(localStorage.getItem('documents') || '[]');
    docs.push({
      id: `DOC${Date.now()}`,
      portConsignmentId: uploadTarget.id,
      containerCode: uploadTarget.containerCode,
      ...documents,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Port Agent',
    });
    localStorage.setItem('documents', JSON.stringify(docs));
    queueForSync('documents_uploaded', { id: uploadTarget.id, documents });
    setUploadTarget(null);
    setDocuments({ billOfLading: '', customsDoc: '', packingList: '' });
    alert('Documents uploaded successfully');
  };

  const queueForSync = (operation, data) => {
    const syncLog = JSON.parse(localStorage.getItem('sync_log') || '[]');
    syncLog.push({
      id: `sync_${Date.now()}`,
      operation,
      data,
      local_time: new Date().toISOString(),
      sync_status: 'pending',
      role: 'port_agent',
    });
    localStorage.setItem('sync_log', JSON.stringify(syncLog));
  };

  return (
    <div style={s.page}>
      <div style={s.list}>
        {consignments.map(c => {
          const next = getNextStage(c.completedStages);
          return (
            <div key={c.id} style={s.card}>
              {/* Header row */}
              <div style={s.cardTop}>
                <div>
                  <span style={s.containerCode}>{c.containerCode}</span>
                  <span style={s.dwell}> · Dwell {calcDwell(c.arrivedAt)}</span>
                </div>
                <button style={s.uploadBtn} onClick={() => setUploadTarget(c)}>
                  📄 Upload Doc
                </button>
              </div>

              {/* Meta row */}
              <div style={s.cardMeta}>
                {c.clientName} · Seal {c.sealNumber}
                {c.vessel && <> · 🚢 {c.vessel}</>}
              </div>

              {/* Progress stages */}
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

              {/* Advance button */}
              {next && (
                <button style={s.advanceBtn} onClick={() => advanceStage(c)}>
                  Advance: {next.label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Doc Modal */}
      {uploadTarget && (
        <div style={s.overlay} onClick={() => setUploadTarget(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>Upload Document</h3>
            <p style={s.modalSub}>{uploadTarget.containerCode} · {uploadTarget.clientName}</p>
            <label style={s.fileLabel}>Bill of Lading</label>
            <input type="file" style={s.fileInput}
              onChange={e => setDocuments({ ...documents, billOfLading: e.target.files[0]?.name || '' })} />
            <label style={s.fileLabel}>Customs Clearance Document</label>
            <input type="file" style={s.fileInput}
              onChange={e => setDocuments({ ...documents, customsDoc: e.target.files[0]?.name || '' })} />
            <label style={s.fileLabel}>Packing List</label>
            <input type="file" style={s.fileInput}
              onChange={e => setDocuments({ ...documents, packingList: e.target.files[0]?.name || '' })} />
            <div style={s.modalBtns}>
              <button style={s.btnCancel} onClick={() => setUploadTarget(null)}>Cancel</button>
              <button style={s.btnSave} onClick={saveDocuments}>Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortAgentDashboard;
