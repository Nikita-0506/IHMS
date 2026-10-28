import React, { useState } from 'react';
import { CLINICAL_APPOINTMENTS } from '../data/clinicalDataset';

export default function AppointmentsView({ onSelectPatient, onOpenBookAppointmentModal, onNavigateTab, onBack }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [modalTab, setModalTab] = useState('appointment'); // 'appointment' | 'history' | 'documents'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const appointments = CLINICAL_APPOINTMENTS || [];

  const todayCount = appointments.filter((a) => a?.type === 'today' || a?.date?.includes('14 Oct') || a?.date?.includes('26 Oct')).length;
  const completedCount = appointments.filter((a) => a?.status === 'Completed').length;
  const upcomingCount = appointments.filter((a) => a?.status === 'Upcoming' || a?.status === 'Scheduled').length;
  const cancelledCount = appointments.filter((a) => a?.status === 'Cancelled').length;

  const handleTabChange = (t) => { setActiveTab(t); setCurrentPage(1); };
  const handleDeptChange = (d) => { setSelectedDept(d); setCurrentPage(1); };
  const handleDocChange = (doc) => { setSelectedDoctor(doc); setCurrentPage(1); };
  const handleStatusChange = (s) => { setSelectedStatus(s); setCurrentPage(1); };
  const handleSearchChange = (q) => { setSearchQuery(q); setCurrentPage(1); };

  const filteredAppointments = appointments.filter((a) => {
    if (!a) return false;
    const status = a.status || '';
    const type = a.type || '';
    const dept = a.department || '';
    const doc = a.doctor || '';
    const pName = a.patientName || a.patient || '';
    const pid = a.pid || a.patient_id || '';
    const reason = a.reason || '';

    if (activeTab === 'today' && type !== 'today') return false;
    if (activeTab === 'upcoming' && status !== 'Upcoming' && status !== 'Scheduled') return false;
    if (activeTab === 'completed' && status !== 'Completed') return false;
    if (activeTab === 'cancelled' && status !== 'Cancelled') return false;
    if (selectedDept !== 'All Departments' && dept !== selectedDept) return false;
    if (selectedDoctor !== 'All Doctors' && doc !== selectedDoctor) return false;
    if (selectedStatus !== 'All Status' && status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        pName.toLowerCase().includes(q) ||
        pid.toLowerCase().includes(q) ||
        doc.toLowerCase().includes(q) ||
        reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedAppointments = filteredAppointments.slice((safePage - 1) * pageSize, safePage * pageSize);

  const getStatusBadge = (status) => {
    if (status === 'Completed') {
      return <span className="ihms-badge-pill badge-green">Completed</span>;
    }
    if (status === 'Upcoming') {
      return <span className="ihms-badge-pill badge-blue">Upcoming</span>;
    }
    if (status === 'Scheduled') {
      return <span className="ihms-badge-pill badge-orange">Scheduled</span>;
    }
    if (status === 'Cancelled') {
      return <span className="ihms-badge-pill badge-red">Cancelled</span>;
    }
    return <span className="ihms-badge-pill badge-gray">{status}</span>;
  };

  const handleOpenModal = (appt) => {
    setSelectedAppt(appt);
    setModalTab('appointment');
  };

  const handleCloseModal = () => {
    setSelectedAppt(null);
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
          <div className="ihms-page-header-icon-wrap icon-appointments">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <h1 className="ihms-page-title">Appointments</h1>
            <p className="ihms-page-subtitle">Manage patient appointments, scheduling and consultations</p>
          </div>
        </div>

        <button
          type="button"
          className="ihms-primary-action-btn"
          onClick={onOpenBookAppointmentModal}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Book Appointment</span>
        </button>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="ihms-kpi-grid">
        {/* Today's Appointments */}
        <div className="ihms-kpi-card" onClick={() => setActiveTab('all')}>
          <div className="kpi-icon-wrap kpi-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">{todayCount}</span>
            </div>
            <span className="kpi-label">Today's Appointments</span>
          </div>
        </div>

        {/* Completed */}
        <div className="ihms-kpi-card" onClick={() => setActiveTab('completed')}>
          <div className="kpi-icon-wrap kpi-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">{completedCount}</span>
              <span className="kpi-percent text-green">{Math.round((completedCount / (appointments.length || 1)) * 100)}%</span>
            </div>
            <span className="kpi-label">Completed</span>
          </div>
        </div>

        {/* Upcoming */}
        <div className="ihms-kpi-card" onClick={() => setActiveTab('upcoming')}>
          <div className="kpi-icon-wrap kpi-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">{upcomingCount}</span>
              <span className="kpi-percent text-orange">{Math.round((upcomingCount / (appointments.length || 1)) * 100)}%</span>
            </div>
            <span className="kpi-label">Upcoming</span>
          </div>
        </div>

        {/* Cancelled */}
        <div className="ihms-kpi-card" onClick={() => setActiveTab('cancelled')}>
          <div className="kpi-icon-wrap kpi-red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">{cancelledCount}</span>
              <span className="kpi-percent text-red">{Math.round((cancelledCount / (appointments.length || 1)) * 100)}%</span>
            </div>
            <span className="kpi-label">Cancelled</span>
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            </svg>
            <span>All Appointments</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => handleTabChange('today')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span>Today</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => handleTabChange('upcoming')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Upcoming</span>
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

          <div className="ihms-dropdown-select" style={{ position: 'relative' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <select
              value={selectedDept}
              onChange={(e) => handleDeptChange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                color: 'inherit',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All Departments">All Departments</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Emergency & Trauma">Emergency & Trauma</option>
              <option value="Gynecology & Obstetrics">Gynecology & Obstetrics</option>
              <option value="Intensive Care Unit">Intensive Care Unit</option>
            </select>
          </div>

          <div className="ihms-dropdown-select" style={{ position: 'relative' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <select
              value={selectedDoctor}
              onChange={(e) => handleDocChange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                color: 'inherit',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All Doctors">All Doctors</option>
              <option value="Dr. Amit Deshmukh">Dr. Amit Deshmukh</option>
              <option value="Dr. Sneha Kulkarni">Dr. Sneha Kulkarni</option>
              <option value="Dr. Rajesh Iyer">Dr. Rajesh Iyer</option>
              <option value="Dr. Rohan Mehta">Dr. Rohan Mehta</option>
              <option value="Dr. Vikram Patil">Dr. Vikram Patil</option>
              <option value="Dr. Neha Joshi">Dr. Neha Joshi</option>
            </select>
          </div>

          <div className="ihms-dropdown-select" style={{ position: 'relative' }}>
            <span className="status-dot dot-green" />
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                color: 'inherit',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All Status">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* View mode toggle: List / Grid */}
          <div className="ihms-view-mode-toggle">
            <button
              type="button"
              className={`vm-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              className={`vm-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
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
              <th>Patient ID</th>
              <th>Appointment Date & Time</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Reason</th>
              <th>Status</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAppointments.map((a, idx) => {
              const rowNum = (safePage - 1) * pageSize + idx + 1;
              const pName = a.patientName || a.patient || 'Patient';
              const pPid = a.pid || a.patient_id || 'P-000';
              const pDoctor = a.doctor || 'Dr. Amit Deshmukh';
              const pAvatar = a.avatar || (a.gender === 'Female' ? '/avatars/patient_sneha.png' : '/avatars/patient_rahul.png');
              const pDocAvatar = a.doctorAvatar || '/avatars/doc_amit.png';
              const pReason = a.reason || 'General Consultation';
              const pDept = a.department || 'General Medicine';
              const pDate = a.date || 'Today';
              const pTime = a.time || '09:30 AM';
              const pStatus = a.status || 'Upcoming';

              return (
                <tr key={a.id || rowNum}>
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
                      <span className="ihms-patient-name">{pName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="ihms-patient-pid font-mono">{pPid}</span>
                  </td>
                  <td>
                    <div className="ihms-datetime-cell">
                      <span className="date-part">{pDate}</span>
                      <span className="time-part">{pTime}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ihms-doctor-cell" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                      <img
                        src={pDocAvatar}
                        alt={pDoctor}
                        className="ihms-patient-avatar"
                        style={{ width: '28px', height: '28px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <span className="doctor-name">{pDoctor}</span>
                    </div>
                  </td>
                  <td>
                    <span className="dept-tag">{pDept}</span>
                  </td>
                  <td>
                    <span className="reason-text font-medium">{pReason}</span>
                  </td>
                  <td>{getStatusBadge(pStatus)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="ihms-action-cell">
                      <button
                        type="button"
                        className="btn-view-pill"
                        onClick={() => handleOpenModal(a)}
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
            {filteredAppointments.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  No appointments found matching your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Table Footer with Pagination */}
        <div className="ihms-table-footer">
          <div className="ihms-table-info">
            Showing {filteredAppointments.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, filteredAppointments.length)} of {filteredAppointments.length} appointments
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

      {/* 5. View Details Pop-up Modal (Matching STEP 2 in Image 4) */}
      {selectedAppt && (
        <div className="ihms-modal-backdrop" onClick={handleCloseModal}>
          <div className="ihms-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="ihms-modal-header">
              <div className="ihms-modal-user-profile">
                <img
                  src={selectedAppt.avatar}
                  alt={selectedAppt.patientName}
                  className="modal-user-avatar"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="modal-user-avatar-fallback" style={{ display: 'none' }}>
                  {selectedAppt.patientName.charAt(0)}
                </div>
                <div className="modal-user-info">
                  <div className="modal-user-title-row">
                    <h3>{selectedAppt.patientName}</h3>
                    {getStatusBadge(selectedAppt.status)}
                  </div>
                  <p className="modal-user-sub">
                    {selectedAppt.pid} | {selectedAppt.age} | {selectedAppt.gender}
                  </p>
                  <p className="modal-user-phone">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{selectedAppt.phone}</span>
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
                className={`modal-tab-btn ${modalTab === 'appointment' ? 'active' : ''}`}
                onClick={() => setModalTab('appointment')}
              >
                Appointment
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === 'history' ? 'active' : ''}`}
                onClick={() => setModalTab('history')}
              >
                History
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === 'documents' ? 'active' : ''}`}
                onClick={() => setModalTab('documents')}
              >
                Documents
              </button>
            </div>

            {/* Modal Body */}
            <div className="ihms-modal-body">
              {modalTab === 'appointment' && (
                <div className="modal-key-value-list">
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
                      {selectedAppt.date}, {selectedAppt.timeSlot}
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Doctor</span>
                    </div>
                    <div className="modal-kv-value">
                      <div className="font-bold text-slate-800">{selectedAppt.doctor}</div>
                      <div className="text-xs text-slate-500">{selectedAppt.department}</div>
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                      <span>Department</span>
                    </div>
                    <div className="modal-kv-value font-medium text-slate-800">
                      {selectedAppt.department}
                    </div>
                  </div>

                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      </svg>
                      <span>Reason</span>
                    </div>
                    <div className="modal-kv-value font-bold text-slate-900">
                      {selectedAppt.reason}
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
                      {getStatusBadge(selectedAppt.status)}
                    </div>
                  </div>

                  <div className="modal-kv-row" style={{ alignItems: 'flex-start' }}>
                    <div className="modal-kv-label" style={{ paddingTop: '2px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                      </svg>
                      <span>Notes</span>
                    </div>
                    <div className="modal-kv-value text-slate-700" style={{ fontSize: '0.86rem' }}>
                      {selectedAppt.notes}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'history' && (
                <div className="modal-history-timeline">
                  {selectedAppt.history && selectedAppt.history.length > 0 ? (
                    selectedAppt.history.map((h, i) => (
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
                    ))
                  ) : (
                    <div className="empty-state-text">No clinical history recorded for this appointment.</div>
                  )}
                </div>
              )}

              {modalTab === 'documents' && (
                <div className="modal-docs-list">
                  {selectedAppt.documents && selectedAppt.documents.length > 0 ? (
                    selectedAppt.documents.map((doc, i) => (
                      <div key={i} className="modal-doc-attachment-item">
                        <div className="doc-icon-mini">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          </svg>
                        </div>
                        <div className="doc-meta-mini">
                          <span className="name">{doc.name}</span>
                          <span className="size">{doc.size}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-download-mini"
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab('documents');
                            handleCloseModal();
                          }}
                        >
                          View
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state-text">No documents attached to this appointment.</div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Buttons */}
            <div className="ihms-modal-footer">
              <button
                type="button"
                className="btn-modal-outline"
                onClick={() => {
                  alert(`Rescheduling appointment for ${selectedAppt.patientName}...`);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                </svg>
                <span>Reschedule</span>
              </button>

              <button
                type="button"
                className="btn-modal-primary"
                onClick={() => {
                  if (onNavigateTab) onNavigateTab('pharmacy');
                  handleCloseModal();
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>View Prescription</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
