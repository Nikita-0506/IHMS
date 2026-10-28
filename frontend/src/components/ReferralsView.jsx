import React, { useState } from 'react';
import { CLINICAL_REFERRALS } from '../data/clinicalDataset';

export default function ReferralsView({ onSelectPatient, onOpenReferralModal, onNavigateTab, onBack }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [modalTab, setModalTab] = useState('details'); // 'details' | 'notes' | 'history'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const referrals = CLINICAL_REFERRALS || [];

  const handleTabChange = (t) => { setActiveTab(t); setCurrentPage(1); };
  const handleDeptChange = (d) => { setSelectedDept(d); setCurrentPage(1); };
  const handleStatusChange = (s) => { setSelectedStatus(s); setCurrentPage(1); };
  const handleSearchChange = (q) => { setSearchQuery(q); setCurrentPage(1); };

  const filteredReferrals = referrals.filter((r) => {
    if (!r) return false;
    const status = r.status || '';
    const type = r.type || '';
    const toDept = r.toDept || r.to_dept || '';
    const fromDept = r.fromDept || r.from_dept || '';
    const pName = r.patientName || r.patient_name || r.patient || '';
    const pid = r.pid || r.patient_id || '';
    const refId = r.referralId || r.referral_id || '';

    if (activeTab === 'outgoing' && type !== 'outgoing') return false;
    if (activeTab === 'incoming' && type !== 'incoming') return false;
    if (activeTab === 'pending' && status !== 'Pending') return false;
    if (activeTab === 'completed' && status !== 'Completed') return false;
    if (activeTab === 'cancelled' && status !== 'Cancelled') return false;
    if (selectedDept !== 'All Departments' && toDept !== selectedDept && fromDept !== selectedDept) return false;
    if (selectedStatus !== 'All Status' && status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        pName.toLowerCase().includes(q) ||
        pid.toLowerCase().includes(q) ||
        refId.toLowerCase().includes(q) ||
        fromDept.toLowerCase().includes(q) ||
        toDept.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredReferrals.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedReferrals = filteredReferrals.slice((safePage - 1) * pageSize, safePage * pageSize);

  const totalCount = referrals.length;
  const completedCount = referrals.filter(r => (r.status || '').toLowerCase() === 'completed').length;
  const inProgressCount = referrals.filter(r => (r.status || '').toLowerCase() === 'in progress').length;
  const pendingCount = referrals.filter(r => (r.status || '').toLowerCase() === 'pending').length;

  const getStatusBadge = (status) => {
    if (status === 'Completed') {
      return <span className="ihms-badge-pill badge-green">Completed</span>;
    }
    if (status === 'In Progress') {
      return <span className="ihms-badge-pill badge-orange">In Progress</span>;
    }
    if (status === 'Pending') {
      return <span className="ihms-badge-pill badge-red">Pending</span>;
    }
    return <span className="ihms-badge-pill badge-gray">{status}</span>;
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'High' || priority === 'Urgent') {
      return <span className="ihms-badge-pill badge-red">{priority}</span>;
    }
    return <span className="ihms-badge-pill badge-blue">Normal</span>;
  };

  const handleOpenModal = (ref) => {
    setSelectedReferral(ref);
    setModalTab('details');
  };

  const handleCloseModal = () => {
    setSelectedReferral(null);
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
          <div className="ihms-page-header-icon-wrap icon-referrals">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 14 20 9 15 4" />
              <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
            </svg>
          </div>
          <div>
            <h1 className="ihms-page-title">Referrals</h1>
            <p className="ihms-page-subtitle">Manage incoming and outgoing referrals between departments and external providers</p>
          </div>
        </div>

        <button
          type="button"
          className="ihms-primary-action-btn"
          onClick={onOpenReferralModal}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Referral</span>
        </button>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="ihms-kpi-grid">
        {/* Total Referrals */}
        <div className="ihms-kpi-card" onClick={() => handleTabChange('all')}>
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
              <span className="kpi-number">{totalCount}</span>
            </div>
            <span className="kpi-label">Total Referrals</span>
          </div>
        </div>

        {/* Completed */}
        <div className="ihms-kpi-card" onClick={() => handleTabChange('completed')}>
          <div className="kpi-icon-wrap kpi-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">{completedCount}</span>
              <span className="kpi-percent text-green">
                {totalCount ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <span className="kpi-label">Completed</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="ihms-kpi-card" onClick={() => handleTabChange('in-progress')}>
          <div className="kpi-icon-wrap kpi-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">{inProgressCount}</span>
              <span className="kpi-percent text-orange">
                {totalCount ? Math.round((inProgressCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <span className="kpi-label">In Progress</span>
          </div>
        </div>

        {/* Pending */}
        <div className="ihms-kpi-card" onClick={() => handleTabChange('pending')}>
          <div className="kpi-icon-wrap kpi-red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">{pendingCount}</span>
              <span className="kpi-percent text-red">
                {totalCount ? Math.round((pendingCount / totalCount) * 100) : 0}%
              </span>
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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 14 20 9 15 4" />
              <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
            </svg>
            <span>All Referrals</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'outgoing' ? 'active' : ''}`}
            onClick={() => handleTabChange('outgoing')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
            <span>Outgoing</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'incoming' ? 'active' : ''}`}
            onClick={() => handleTabChange('incoming')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="17" y1="7" x2="7" y2="17" />
              <polyline points="17 17 7 17 7 7" />
            </svg>
            <span>Incoming</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
            </svg>
            <span>Pending</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => handleTabChange('completed')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Completed</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => handleTabChange('cancelled')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
            <span>Cancelled</span>
          </button>
        </div>

        <div className="ihms-filter-controls">
          <div className="ihms-date-select">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
            </svg>
            <span>14 Oct 2026</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <div className="ihms-dropdown-select">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{selectedDept}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <div className="ihms-dropdown-select">
            <span className="status-dot dot-green" />
            <span>{selectedStatus}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <button type="button" className="ihms-icon-action-btn" title="More Filters">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
        </div>
      </div>

      {/* 4. Data Table */}
      <div className="ihms-card-table-wrap">
        <table className="ihms-data-table">
          <thead>
            <tr>
              <th style={{ width: '48px', textAlign: 'center' }}>#</th>
              <th>Patient</th>
              <th>Referral ID</th>
              <th>From Department</th>
              <th>To Department / Provider</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReferrals.map((r, idx) => {
              const rowNum = (safePage - 1) * pageSize + idx + 1;
              const pName = r.patientName || r.patient_name || r.patient || 'Patient';
              const pPid = r.pid || r.patient_id || 'P-000';
              const refId = r.referralId || r.referral_id || 'REF-000';
              const fromDept = r.fromDept || r.from_dept || 'General Medicine';
              const toDept = r.toDept || r.to_dept || 'Specialist Care';
              const pDate = r.date || 'Today';
              const pTime = r.time || '10:00 AM';
              const pStatus = r.status || 'Pending';
              const pAvatar = r.avatar || (r.gender === 'Female' ? '/avatars/patient_sneha.png' : '/avatars/patient_rahul.png');

              return (
                <tr key={r.id || rowNum}>
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
                    <span className="ihms-id-code">{refId}</span>
                  </td>
                  <td>
                    <span className="dept-tag">{fromDept}</span>
                  </td>
                  <td>
                    <span className="dept-highlight">{toDept}</span>
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
                        onClick={() => handleOpenModal(r)}
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
            {filteredReferrals.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  No referrals found matching the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Table Footer with Pagination */}
        <div className="ihms-table-footer">
          <div className="ihms-table-info">
            Showing {filteredReferrals.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, filteredReferrals.length)} of {filteredReferrals.length} referrals
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

      {/* 5. View Details Pop-up Modal (Matching STEP 2 in Image 2) */}
      {selectedReferral && (
        <div className="ihms-modal-backdrop" onClick={handleCloseModal}>
          <div className="ihms-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="ihms-modal-header">
              <div className="ihms-modal-user-profile">
                <img
                  src={selectedReferral.avatar}
                  alt={selectedReferral.patientName || selectedReferral.patient}
                  className="modal-user-avatar"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="modal-user-avatar-fallback" style={{ display: 'none' }}>
                  {(selectedReferral.patientName || selectedReferral.patient || 'P').charAt(0)}
                </div>
                <div className="modal-user-info">
                  <div className="modal-user-title-row">
                    <h3>{selectedReferral.patientName}</h3>
                    {getStatusBadge(selectedReferral.status)}
                  </div>
                  <p className="modal-user-sub">
                    {selectedReferral.pid} | {selectedReferral.age} | {selectedReferral.gender}
                  </p>
                  <p className="modal-user-phone">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{selectedReferral.phone}</span>
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
                className={`modal-tab-btn ${modalTab === 'notes' ? 'active' : ''}`}
                onClick={() => setModalTab('notes')}
              >
                Notes
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
                      <span>Referral ID</span>
                    </div>
                    <div className="modal-kv-value font-mono font-bold">
                      {selectedReferral.referralId}
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                      <span>From Department</span>
                    </div>
                    <div className="modal-kv-value font-bold text-slate-800">
                      {selectedReferral.fromDept}
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 14 20 9 15 4" />
                        <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                      </svg>
                      <span>To Department</span>
                    </div>
                    <div className="modal-kv-value font-bold text-blue-600">
                      {selectedReferral.toDept}
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Referred By</span>
                    </div>
                    <div className="modal-kv-value font-bold text-slate-800">
                      {selectedReferral.referredBy}
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                      </svg>
                      <span>Date & Time</span>
                    </div>
                    <div className="modal-kv-value font-medium">
                      {selectedReferral.date}, {selectedReferral.time}
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
                      {getStatusBadge(selectedReferral.status)}
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span>Priority</span>
                    </div>
                    <div className="modal-kv-value">
                      {getPriorityBadge(selectedReferral.priority)}
                    </div>
                  </div>

                  <div className="modal-kv-row" style={{ alignItems: 'flex-start' }}>
                    <div className="modal-kv-label" style={{ paddingTop: '2px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>Reason</span>
                    </div>
                    <div className="modal-kv-value text-slate-700 font-medium" style={{ fontSize: '0.86rem' }}>
                      {selectedReferral.reason}
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                      <span>Attachments</span>
                    </div>
                    <div className="modal-kv-value">
                      <button
                        type="button"
                        className="btn-attachment-pill"
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab('documents');
                          handleCloseModal();
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>View Files ({selectedReferral.attachmentsCount})</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'notes' && (
                <div className="modal-notes-box">
                  <div className="notes-author-badge">
                    <span>Clinical Consultation Note</span>
                    <span className="author-time">{selectedReferral.time}</span>
                  </div>
                  <p className="notes-text">{selectedReferral.notes}</p>
                  <div className="notes-doctor-sign">
                    <div className="doc-avatar-mini" />
                    <div>
                      <div className="font-bold text-slate-800">{selectedReferral.referredBy}</div>
                      <div className="text-xs text-slate-500">{selectedReferral.fromDept}</div>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'history' && (
                <div className="modal-history-timeline">
                  {(selectedReferral.history || []).map((h, i) => (
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
                <span>Print Referral</span>
              </button>

              <button
                type="button"
                className="btn-modal-primary"
                onClick={() => {
                  if (onSelectPatient) onSelectPatient(selectedReferral.pid);
                  if (onNavigateTab) onNavigateTab('patients');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 14 20 9 15 4" />
                  <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                </svg>
                <span>View Full Details</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
