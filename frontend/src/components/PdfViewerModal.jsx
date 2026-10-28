import React, { useState } from 'react';

export default function PdfViewerModal({ isOpen, onClose, docData }) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const doc = docData || {
    name: 'Lab Report - CBC.pdf',
    date: '14 Oct 2026, 10:35 AM',
    size: '238 KB',
    patientName: 'Rahul Patil',
    patientId: 'P-10245',
    ageGender: '32 Years / Male',
    reportDate: '14 Oct 2026',
    refDoctor: 'Dr. Amit Deshmukh',
    sampleType: 'Whole Blood',
  };

  const handleZoomIn = () => {
    if (zoomLevel < 150) setZoomLevel((prev) => prev + 15);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 70) setZoomLevel((prev) => prev - 15);
  };

  const handleDownload = () => {
    // Generate text/pdf simulation download
    const element = document.createElement('a');
    const file = new Blob([
      `CITY CARE LABS\n123, Health Street | Pune - 411001\nPhone: 020 4567 8900\n\nPatient: ${doc.patientName} (${doc.patientId})\nRef: ${doc.refDoctor}\n\nComplete Blood Count (CBC):\n- WBC: 5.6 10^3/uL (Normal 4.0 - 11.0)\n- RBC: 4.8 10^6/uL (Normal 4.5 - 5.5)\n- Hemoglobin: 13.2 g/dL (Normal 12.0 - 16.0)\n- Platelets: 250 10^3/uL (Normal 150 - 450)\n\nComments: All values are within normal range.\nSigned: Dr. Saurabh Patwardhan, MBBS, MD (Pathology)`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = doc.name.replace('.pdf', '') + '.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: isFullscreen ? '98vw' : '900px',
          maxWidth: '96vw',
          height: isFullscreen ? '96vh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.78rem',
                border: '1px solid #fca5a5',
              }}
            >
              PDF
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                {doc.name}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {doc.date} | {doc.size}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: '#f1f5f9',
              color: '#475569',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#f1f5f9')}
          >
            ✕
          </button>
        </div>

        {/* PDF Viewer Dark Control Toolbar */}
        <div
          style={{
            background: '#1e293b',
            color: '#f8fafc',
            padding: '0.45rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            fontSize: '0.82rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                background: '#334155',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              {currentPage}
            </span>
            <span style={{ color: '#94a3b8' }}>/ 1</span>
          </div>

          <div style={{ width: '1px', height: '18px', background: '#475569' }} />

          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={handleZoomOut}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0 0.35rem',
              }}
              title="Zoom Out"
            >
              —
            </button>

            <select
              value={`${zoomLevel}%`}
              onChange={(e) => setZoomLevel(parseInt(e.target.value, 10))}
              style={{
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '4px',
                padding: '0.2rem 0.5rem',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              <option value="75%">75%</option>
              <option value="100%">100%</option>
              <option value="125%">125%</option>
              <option value="150%">150%</option>
            </select>

            <button
              type="button"
              onClick={handleZoomIn}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: '0 0.35rem',
              }}
              title="Zoom In"
            >
              +
            </button>
          </div>

          <div style={{ width: '1px', height: '18px', background: '#475569' }} />

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              onClick={handleDownload}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
              }}
              title="Download Report"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Toggle Fullscreen"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Paper Document Body Container with Scroll */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            background: '#e2e8f0',
            padding: '2rem 1.5rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* Printable White Sheet */}
          <div
            style={{
              background: '#ffffff',
              width: `${Math.round(680 * (zoomLevel / 100))}px`,
              minHeight: '780px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
              padding: '2.5rem 2.75rem',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Inter, system-ui, sans-serif',
              transformOrigin: 'top center',
              transition: 'width 0.2s ease',
            }}
          >
            {/* Lab Header Letterhead */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                paddingBottom: '1.25rem',
                borderBottom: '2px solid #0284c7',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    background: '#eff6ff',
                    border: '1.5px solid #0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0284c7',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 2v7.31L4.62 18.5A2 2 0 0 0 6.36 21h11.28a2 2 0 0 0 1.74-2.5L14 9.31V2" />
                    <line x1="8.5" y1="2" x2="15.5" y2="2" />
                    <line x1="14" y1="9.3" x2="10" y2="9.3" />
                  </svg>
                </div>
                <h2
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    color: '#0c4a6e',
                    margin: 0,
                  }}
                >
                  CITY CARE LABS
                </h2>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>
                123, Health Street | Pune - 411001
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Phone: 020 4567 8900
              </div>
            </div>

            {/* Patient Info 2-Column Box */}
            <div
              style={{
                marginTop: '1.25rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.85rem 1.25rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem 1.5rem',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Patient Name</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>: {doc.patientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Report Date</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>: {doc.reportDate}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Patient ID</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>: {doc.patientId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Ref. Doctor</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>: {doc.refDoctor}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Age / Gender</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>: {doc.ageGender}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Sample Type</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>: {doc.sampleType}</span>
              </div>
            </div>

            {/* Report Section Title */}
            <div style={{ marginTop: '1.5rem', marginBottom: '0.75rem', textAlign: 'left' }}>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  borderBottom: '2px solid #3b82f6',
                  display: 'inline-block',
                  paddingBottom: '0.2rem',
                }}
              >
                Complete Blood Count (CBC)
              </h3>
            </div>

            {/* Lab Test Results Table */}
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.82rem',
                  marginTop: '0.25rem',
                }}
              >
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1' }}>
                    <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#334155' }}>
                      Test
                    </th>
                    <th style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#334155' }}>
                      Result
                    </th>
                    <th style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#334155' }}>
                      Unit
                    </th>
                    <th style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#334155' }}>
                      Reference Range
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>WBC</td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                      5.6
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', color: '#64748b' }}>
                      10³/μL
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', color: '#475569' }}>
                      4.0 – 11.0
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>RBC</td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                      4.8
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', color: '#64748b' }}>
                      10⁶/μL
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', color: '#475569' }}>
                      4.5 – 5.5
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>Hemoglobin</td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                      13.2
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', color: '#64748b' }}>
                      g/dL
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', color: '#475569' }}>
                      12.0 – 16.0
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1.5px solid #cbd5e1' }}>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>Platelets</td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                      250
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', color: '#64748b' }}>
                      10³/μL
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', color: '#475569' }}>
                      150 – 450
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Comments */}
            <div style={{ marginTop: '1.5rem', fontSize: '0.82rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                Comments:
              </div>
              <div style={{ color: '#475569' }}>
                All values are within normal range.
              </div>
            </div>

            {/* Signature Block (bottom right) */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              {/* Cursive handwritten signature art */}
              <div
                style={{
                  fontFamily: 'Caveat, "Brush Script MT", cursive, sans-serif',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#1e3a8a',
                  lineHeight: 1,
                  marginBottom: '0.25rem',
                  letterSpacing: '0.05em',
                  transform: 'rotate(-4deg)',
                }}
              >
                Dr. Patwardhan
              </div>
              <div style={{ width: '170px', height: '1.5px', background: '#94a3b8', marginBottom: '0.35rem' }} />
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                Dr. Saurabh Patwardhar
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                MBBS, MD (Pathology)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
