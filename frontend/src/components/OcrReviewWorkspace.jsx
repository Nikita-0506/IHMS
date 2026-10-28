import React, { useState } from 'react';

export default function OcrReviewWorkspace() {
  const [docs, setDocs] = useState([
    {
      id: 1,
      name: 'CBC_Report_RahulPatil_10245.pdf',
      type: 'Laboratory Panel',
      source: 'LifeLine Diagnostics',
      date: '11-Oct-2026',
      confidence: 0.968,
      status: 'verified',
      abnormalCount: 1,
      parameters: [
        { name: 'White Blood Cells (WBC)', val: '12,400 /mcL', ref: '4,000 - 11,000', status: 'Elevated', abnormal: true },
        { name: 'Hemoglobin', val: '14.2 g/dL', ref: '13.0 - 17.0', status: 'Normal', abnormal: false },
        { name: 'Platelet Count', val: '185,000 /mcL', ref: '150,000 - 450,000', status: 'Normal', abnormal: false },
        { name: 'Serum Creatinine', val: '1.1 mg/dL', ref: '0.7 - 1.3', status: 'Normal baseline', abnormal: false },
      ],
    },
    {
      id: 2,
      name: 'Referral_Note_PriyaDeshmukh_10246.pdf',
      type: 'Referral Note',
      source: 'Ruby Hall Clinic, Pune',
      date: '11-Oct-2026',
      confidence: 0.884,
      status: 'pending',
      abnormalCount: 0,
      parameters: [
        { name: 'Referring Physician', val: 'Dr. K. S. Kulkarni', ref: 'Verified MD', status: 'Normal', abnormal: false },
        { name: 'Initial Troponin I', val: '0.04 ng/mL', ref: '0.00 - 0.04', status: 'Borderline', abnormal: true },
        { name: 'ECG Impression', val: 'Non-specific ST changes', ref: 'Normal Sinus', status: 'Attention', abnormal: true },
      ],
    },
    {
      id: 3,
      name: 'Discharge_Summary_VikramSingh_10248.pdf',
      type: 'Emergency Intake Report',
      source: 'Highway Trauma Center',
      date: '11-Oct-2026',
      confidence: 0.942,
      status: 'verified',
      abnormalCount: 2,
      parameters: [
        { name: 'FAST Ultrasound', val: 'Free fluid in Morrison pouch', ref: 'Negative', status: 'Critical Flag', abnormal: true },
        { name: 'Arterial Blood Gas pH', val: '7.28', ref: '7.35 - 7.45', status: 'Acidemia', abnormal: true },
      ],
    },
  ]);

  const [selectedDoc, setSelectedDoc] = useState(docs[0]);
  const [notification, setNotification] = useState(null);

  const handleVerify = (docId) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: 'verified', confidence: 0.98 } : d))
    );
    if (selectedDoc.id === docId) {
      setSelectedDoc((prev) => ({ ...prev, status: 'verified', confidence: 0.98 }));
    }
    setNotification('Document verified by Clinician and integrated into Verified EMR!');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSimulateUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc = {
        id: Date.now(),
        name: file.name,
        type: 'External Medical Document',
        source: 'Uploaded Scanned PDF',
        date: 'Today',
        confidence: 0.915,
        status: 'pending',
        abnormalCount: 1,
        parameters: [
          { name: 'Fasting Blood Sugar', val: '142 mg/dL', ref: '70 - 100', status: 'Elevated', abnormal: true },
          { name: 'Serum Sodium', val: '138 mEq/L', ref: '135 - 145', status: 'Normal', abnormal: false },
          { name: 'Serum Potassium', val: '4.2 mEq/L', ref: '3.5 - 5.1', status: 'Normal', abnormal: false },
        ],
      };
      setDocs((prev) => [newDoc, ...prev]);
      setSelectedDoc(newDoc);
      setNotification(`Uploaded & parsed ${file.name} successfully with 91.5% OCR confidence!`);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            Document OCR Ingestion & Human-in-the-Loop Review
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Accepts external PDFs, prescriptions, and lab panels. Extracts clinical parameters, validates against reference ranges, and flags abnormalities for doctor verification.
          </p>
        </div>

        <label
          htmlFor="ocr-file-upload"
          className="btn-clinical btn-primary"
          style={{ cursor: 'pointer' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Document (PDF / Image)
          <input
            id="ocr-file-upload"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
            onChange={handleSimulateUpload}
          />
        </label>
      </div>

      {notification && (
        <div
          style={{
            background: '#e0f2fe',
            border: '1px solid #bae6fd',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#0369a1',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          ✓ {notification}
        </div>
      )}

      {/* Ingested Documents Table */}
      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
        Ingested Documents Queue
      </h4>
      <div className="data-table-container">
        <table className="clinical-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Type</th>
              <th>Originating Facility</th>
              <th>Date</th>
              <th>OCR Confidence</th>
              <th>Verification State</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr
                key={doc.id}
                style={{
                  background: selectedDoc.id === doc.id ? '#f0f9ff' : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedDoc(doc)}
              >
                <td>
                  <b>{doc.name}</b>
                </td>
                <td>{doc.type}</td>
                <td>{doc.source}</td>
                <td>{doc.date}</td>
                <td>
                  <span style={{ fontWeight: 800, color: '#0284c7' }}>
                    {(doc.confidence * 100).toFixed(1)}%
                  </span>
                </td>
                <td>
                  {doc.status === 'verified' ? (
                    <span className="badge-stable">✓ Verified by Doctor</span>
                  ) : (
                    <span className="badge-urgent">⏳ Pending Review</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-clinical btn-outline"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVerify(doc.id);
                    }}
                  >
                    {doc.status === 'verified' ? 'Re-Verify' : 'Verify & Approve'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Document Parameters Detail */}
      {selectedDoc && (
        <div
          style={{
            marginTop: '1.5rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
              Extracted Parameters: <span style={{ color: '#0284c7' }}>{selectedDoc.name}</span>
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Facility: <b>{selectedDoc.source}</b></span>
              <button
                type="button"
                className="btn-clinical btn-indigo"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                onClick={() => handleVerify(selectedDoc.id)}
              >
                Approve Extracted Data
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
            {selectedDoc.parameters.map((param, pIdx) => (
              <div
                key={pIdx}
                style={{
                  background: '#ffffff',
                  border: `1px solid ${param.abnormal ? '#fecaca' : '#e2e8f0'}`,
                  borderRadius: 8,
                  padding: '0.85rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{param.name}</div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: param.abnormal ? '#b91c1c' : '#0369a1',
                    margin: '0.2rem 0',
                  }}
                >
                  {param.val}
                </div>
                <div style={{ fontSize: '0.74rem', color: param.abnormal ? '#dc2626' : '#64748b' }}>
                  Reference: {param.ref} · {param.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
