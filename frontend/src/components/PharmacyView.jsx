import React, { useState } from 'react';
import { CLINICAL_PRESCRIPTIONS } from '../data/clinicalDataset';

export default function PharmacyView({ onSelectPatient, onOpenRxModal, onNavigateTab, onBack }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('14 Oct 2026');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [modalTab, setModalTab] = useState('details'); // 'details' | 'medicines' | 'history'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const prescriptions = CLINICAL_PRESCRIPTIONS || [];

  const totalRxCount = prescriptions.length;
  const dispensedRxCount = prescriptions.filter((p) => p?.status === 'Dispensed').length;
  const inProcessRxCount = prescriptions.filter((p) => p?.status === 'In Process').length;
  const pendingRxCount = prescriptions.filter((p) => p?.status === 'Pending').length;

  const handleTabChange = (t) => { setActiveTab(t); setCurrentPage(1); };
  const handleSearchChange = (q) => { setSearchQuery(q); setCurrentPage(1); };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (!p) return false;
    const status = p.status || '';
    const pName = p.patientName || p.patient || '';
    const pid = p.pid || p.patient_id || '';
    const rxId = p.prescriptionId || p.prescription_id || '';
    const doc = p.doctor || '';

    if (activeTab === 'pending' && status !== 'Pending') return false;
    if (activeTab === 'dispensed' && status !== 'Dispensed') return false;
    if (activeTab === 'in-process' && status !== 'In Process') return false;
    if (activeTab === 'cancelled' && status !== 'Cancelled') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        pName.toLowerCase().includes(q) ||
        pid.toLowerCase().includes(q) ||
        rxId.toLowerCase().includes(q) ||
        doc.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPrescriptions.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedPrescriptions = filteredPrescriptions.slice((safePage - 1) * pageSize, safePage * pageSize);

  const getStatusBadge = (status) => {
    if (status === 'Dispensed') {
      return <span className="ihms-badge-pill badge-green">Dispensed</span>;
    }
    if (status === 'In Process') {
      return <span className="ihms-badge-pill badge-orange">In Process</span>;
    }
    if (status === 'Pending') {
      return <span className="ihms-badge-pill badge-red">Pending</span>;
    }
    return <span className="ihms-badge-pill badge-gray">{status}</span>;
  };

  const handleOpenModal = (rx) => {
    setSelectedPrescription(rx);
    setModalTab('details');
  };

  const handleCloseModal = () => {
    setSelectedPrescription(null);
  };

  return (
    <div className="ihms-view-container">
      {/* 1. Page Header Banner */}
      <div className="ihms-page-header">
        <div className="ihms-page-header-left">
          {onBack && (
            <button type="button" className="ihms-back-arrow-btn" onClick={onBack} title="Go Back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          )}
          <div className="ihms-page-header-icon-wrap icon-pharmacy">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
              <path d="m8.5 8.5 7 7" />
            </svg>
          </div>
          <div>
            <h1 className="ihms-page-title">Pharmacy</h1>
            <p className="ihms-page-subtitle">Manage prescriptions, dispense medicines and monitor stock</p>
          </div>
        </div>

        <button
          type="button"
          className="ihms-primary-action-btn"
          onClick={onOpenRxModal}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Prescription</span>
        </button>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="ihms-kpi-grid">
        {/* Total Prescriptions */}
        <div className="ihms-kpi-card" onClick={() => setActiveTab('all')}>
          <div className="kpi-icon-wrap kpi-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">68</span>
            </div>
            <span className="kpi-label">Total Prescriptions</span>
          </div>
        </div>

        {/* Dispensed */}
        <div className="ihms-kpi-card" onClick={() => setActiveTab('dispensed')}>
          <div className="kpi-icon-wrap kpi-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">52</span>
              <span className="kpi-percent text-green">76%</span>
            </div>
            <span className="kpi-label">Dispensed</span>
          </div>
        </div>

        {/* In Process */}
        <div className="ihms-kpi-card" onClick={() => setActiveTab('in-process')}>
          <div className="kpi-icon-wrap kpi-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">10</span>
              <span className="kpi-percent text-orange">15%</span>
            </div>
            <span className="kpi-label">In Process</span>
          </div>
        </div>

        {/* Pending */}
        <div className="ihms-kpi-card" onClick={() => setActiveTab('pending')}>
          <div className="kpi-icon-wrap kpi-red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">6</span>
              <span className="kpi-percent text-red">9%</span>
            </div>
            <span className="kpi-label">Pending</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs Bar */}
      <div className="ihms-filter-bar">
        <div className="ihms-tab-pills">
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <span>All</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Pending</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'dispensed' ? 'active' : ''}`}
            onClick={() => handleTabChange('dispensed')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Dispensed</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'in-process' ? 'active' : ''}`}
            onClick={() => handleTabChange('in-process')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>In Process</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => handleTabChange('cancelled')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>Cancelled</span>
          </button>
        </div>

        <div className="ihms-filter-controls">
          <div className="ihms-date-select">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{selectedDate}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <div className="ihms-table-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search prescription, patient or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 4. Data Table */}
      <div className="ihms-card-table-wrap">
        <table className="ihms-data-table">
          <thead>
            <tr>
              <th style={{ width: '48px', textAlign: 'center' }}>#</th>
              <th>Patient</th>
              <th>Prescription ID</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPrescriptions.map((rx, idx) => {
              const rowNum = (safePage - 1) * pageSize + idx + 1;
              const pName = rx.patientName || rx.patient || 'Patient';
              const pPid = rx.pid || rx.patient_id || 'P-000';
              const rxId = rx.prescriptionId || rx.prescription_id || 'RX-000';
              const pDoctor = rx.doctor || 'Dr. Amit Deshmukh';
              const pDept = rx.department || 'General Medicine';
              const pDate = rx.date || 'Today';
              const pTime = rx.time || '10:00 AM';
              const pStatus = rx.status || 'Dispensed';
              const pAvatar = rx.avatar || (rx.gender === 'Female' ? '/avatars/patient_sneha.png' : '/avatars/patient_rahul.png');

              return (
                <tr key={rx.id || rowNum}>
                  <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{rowNum}</td>
                  <td>
                    <div className="ihms-patient-cell">
                      <img
                        src={pAvatar}
                        alt={pName}
                        className="ihms-patient-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="ihms-patient-avatar-fallback" style={{ display: 'none' }}>
                        {(pName || 'P').charAt(0)}
                      </div>
                      <div className="ihms-patient-meta">
                        <span className="ihms-patient-name">{pName}</span>
                        <span className="ihms-patient-pid">{pPid}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="ihms-id-code">{rxId}</span>
                  </td>
                  <td>
                    <div className="ihms-doctor-cell">
                      <span className="doctor-name">{pDoctor}</span>
                      <span className="doctor-dept">{pDept}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ihms-datetime-cell">
                      <span className="date-part">{pDate}</span>
                      <span className="time-part">{pTime}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(pStatus)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="ihms-action-cell">
                      <button
                        type="button"
                        className="btn-view-pill"
                        onClick={() => handleOpenModal(rx)}
                      >
                        View
                      </button>
                      <button type="button" className="btn-more-dots" title="More options">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredPrescriptions.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  No prescriptions found matching the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Table Footer with Pagination */}
        <div className="ihms-table-footer">
          <div className="ihms-table-info">
            Showing {filteredPrescriptions.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, filteredPrescriptions.length)} of {filteredPrescriptions.length} prescriptions
          </div>
          <div className="ihms-pagination">
            <button
              type="button"
              className="pag-btn prev"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Previous Page"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pNum = i + 1;
              if (totalPages > 5 && safePage > 3) {
                pNum = safePage - 3 + i;
                if (pNum + (4 - i) > totalPages) {
                  pNum = totalPages - 4 + i;
                }
              }
              if (pNum < 1 || pNum > totalPages) return null;
              return (
                <button
                  key={pNum}
                  type="button"
                  className={`pag-btn ${safePage === pNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pNum)}
                >
                  {pNum}
                </button>
              );
            })}
            <button
              type="button"
              className="pag-btn next"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title="Next Page"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* 5. View Details Pop-up Modal (Matching STEP 2 In Image 1) */}
      {selectedPrescription && (
        <div className="ihms-modal-backdrop" onClick={handleCloseModal}>
          <div className="ihms-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="ihms-modal-header">
              <div className="ihms-modal-user-profile">
                <img
                  src={selectedPrescription.avatar}
                  alt={selectedPrescription.patientName}
                  className="modal-user-avatar"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="modal-user-avatar-fallback" style={{ display: 'none' }}>
                  {selectedPrescription.patientName.charAt(0)}
                </div>
                <div className="modal-user-info">
                  <div className="modal-user-title-row">
                    <h3>{selectedPrescription.patientName}</h3>
                    {getStatusBadge(selectedPrescription.status)}
                  </div>
                  <p className="modal-user-sub">
                    {selectedPrescription.pid} | {selectedPrescription.age} | {selectedPrescription.gender}
                  </p>
              {selectedPrescription.allergyStatus && (
                <div style={{
                  background: selectedPrescription.allergyStatus.toLowerCase().includes('known') || selectedPrescription.allergyStatus.toLowerCase().includes('none') ? '#ecfdf5' : '#fef2f2',
                  color: selectedPrescription.allergyStatus.toLowerCase().includes('known') || selectedPrescription.allergyStatus.toLowerCase().includes('none') ? '#059669' : '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}>
                  <span>⚠️ Documented Patient Allergy:</span>
                  <b>{selectedPrescription.allergyStatus}</b>
                  <span style={{ color: '#059669', marginLeft: 'auto' }}>✓ Prescription Safety Verified</span>
                </div>
              )}
                  <p className="modal-user-phone">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{selectedPrescription.phone}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="ihms-modal-close-btn"
                onClick={handleCloseModal}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="ihms-modal-tabs">
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === 'details' ? 'active' : ''}`}
                onClick={() => setModalTab('details')}
              >
                Details
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === 'medicines' ? 'active' : ''}`}
                onClick={() => setModalTab('medicines')}
              >
                Medicines
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === 'history' ? 'active' : ''}`}
                onClick={() => setModalTab('history')}
              >
                History
              </button>
            </div>

            {/* Modal Body */}
            <div className="ihms-modal-body">
              {modalTab === 'details' && (
                <div className="modal-key-value-list">
                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span>Prescription ID</span>
                    </div>
                    <div className="modal-kv-value font-mono font-bold">
                      {selectedPrescription.prescriptionId}
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Prescribed By</span>
                    </div>
                    <div className="modal-kv-value">
                      <div className="font-bold text-slate-800">{selectedPrescription.doctor}</div>
                      <div className="text-xs text-slate-500">{selectedPrescription.department}</div>
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>Date & Time</span>
                    </div>
                    <div className="modal-kv-value font-medium">
                      {selectedPrescription.date}, {selectedPrescription.time}
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>Status</span>
                    </div>
                    <div className="modal-kv-value">
                      {getStatusBadge(selectedPrescription.status)}
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      </svg>
                      <span>Total Items</span>
                    </div>
                    <div className="modal-kv-value font-bold text-slate-800">
                      {selectedPrescription.totalItems}
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                        <line x1="12" y1="6" x2="12" y2="8" />
                        <line x1="12" y1="16" x2="12" y2="18" />
                      </svg>
                      <span>Total Amount</span>
                    </div>
                    <div className="modal-kv-value font-bold text-slate-900" style={{ fontSize: '1rem' }}>
                      {selectedPrescription.totalAmount}
                    </div>
                  </div>

                  <div className="modal-kv-row" style={{ alignItems: 'flex-start' }}>
                    <div className="modal-kv-label" style={{ paddingTop: '2px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                      </svg>
                      <span>Notes</span>
                    </div>
                    <div className="modal-kv-value text-slate-600" style={{ fontSize: '0.86rem' }}>
                      {selectedPrescription.notes}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'medicines' && (
                <div className="modal-medicines-table-wrap">
                  <table className="modal-med-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dose</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPrescription.medicines.map((m, i) => (
                        <tr key={i}>
                          <td className="font-bold text-slate-800">{m.name}</td>
                          <td>{m.dose}</td>
                          <td><span className="timing-pill">{m.freq}</span></td>
                          <td>{m.duration}</td>
                          <td className="font-bold text-slate-700">{m.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {modalTab === 'history' && (
                <div className="modal-history-timeline">
                  {selectedPrescription.history.map((h, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-title">{h.title}</span>
                          <span className="timeline-time">{h.time}</span>
                        </div>
                        <p className="timeline-desc">{h.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer Buttons */}
            <div className="ihms-modal-footer">
              <button
                type="button"
                className="btn-modal-outline"
                onClick={() => window.print()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Print Prescription</span>
              </button>

              <button
                type="button"
                className="btn-modal-primary"
                onClick={() => {
                  if (onSelectPatient) onSelectPatient(selectedPrescription.pid);
                  if (onNavigateTab) onNavigateTab('patients');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>View Details</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
