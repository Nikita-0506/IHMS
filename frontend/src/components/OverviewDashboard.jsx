import React from 'react';
import { ALL_MONITORING_RECORDS } from '../data/clinicalDataset';
import { getAvatarFor } from '../services/avatarStore';

export default function OverviewDashboard({
  currentUser,
  patientQueue: propPatientQueue,
  onSelectPatient,
  onNavigateTab,
  onOpenNewPatientModal,
  onOpenBookAppointmentModal,
  onOpenServiceRequestModal,
}) {
  const getGreetingData = () => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    let subtext = 'Your overview for today';
    let iconType = 'morning';

    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
      subtext = 'Your overview for today';
      iconType = 'morning';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
      subtext = 'Your overview for this afternoon';
      iconType = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      greeting = 'Good evening';
      subtext = 'Your overview for this evening';
      iconType = 'evening';
    } else {
      greeting = 'Good night';
      subtext = 'Your overview for tonight';
      iconType = 'night';
    }

    const doctorName = currentUser?.name || 'Dr. Amit';
    return { greeting, subtext, iconType, doctorName };
  };

  const { greeting, subtext, iconType, doctorName } = getGreetingData();

  const defaultPatientQueue = ALL_MONITORING_RECORDS.slice(0, 10).map((p, idx) => ({
    id: idx + 1,
    name: p.full_name,
    pid: p.patient_id,
    age: p.age,
    gender: p.gender,
    initials: ((p.first_name?.[0] || 'P') + (p.last_name?.[0] || 'T')).toUpperCase(),
    avatar: p.gender === 'Female' ? '/avatars/patient_sneha.png' : '/avatars/patient_rahul.png',
    color: p.deterioration_risk === 'High' ? '#fee2e2' : (p.deterioration_risk === 'Moderate' ? '#fef3c7' : '#dbeafe'),
    textColor: p.deterioration_risk === 'High' ? '#dc2626' : (p.deterioration_risk === 'Moderate' ? '#b45309' : '#1d4ed8'),
    reason: `${p.care_unit} (${p.room_no}) · HR:${Math.round(p.heart_rate_bpm)} BP:${Math.round(p.systolic_bp_mmhg)}/${Math.round(p.diastolic_bp_mmhg)}`,
    priority: p.deterioration_risk === 'High' ? 'High' : (p.deterioration_risk === 'Moderate' ? 'Medium' : 'Normal'),
    priorityClass: p.deterioration_risk === 'High' ? 'priority-high' : (p.deterioration_risk === 'Moderate' ? 'priority-medium' : 'priority-normal'),
    time: p.monitoring_frequency || '10:25 AM',
    status: p.record_status || 'Waiting',
    statusDot: p.deterioration_risk === 'High' ? '#ef4444' : (p.deterioration_risk === 'Moderate' ? '#f59e0b' : '#10b981'),
  }));

  const patientQueue = propPatientQueue && propPatientQueue.length > 0 ? propPatientQueue : defaultPatientQueue;

  return (
    <div className="ihms-scroll-viewport">
      {/* 1. Hero Greeting Banner (Dynamic based on time of day) */}
      <section className="hero-overview-banner">
        <div className="hero-left-content">
          <div
            className="hero-sun-icon"
            style={
              iconType === 'night'
                ? { background: '#ede9fe', color: '#7c3aed' }
                : iconType === 'evening'
                ? { background: '#ffedd5', color: '#ea580c' }
                : {}
            }
          >
            {iconType === 'night' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : iconType === 'evening' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 18a5 5 0 0 0-10 0" />
                <line x1="12" y1="2" x2="12" y2="9" />
                <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
                <line x1="1" y1="18" x2="3" y2="18" />
                <line x1="21" y1="18" x2="23" y2="18" />
                <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
                <line x1="23" y1="22" x2="1" y2="22" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </div>
          <div className="hero-text">
            <h2>{greeting}, {doctorName}</h2>
            <p>{subtext}</p>
          </div>
        </div>

        {/* Hospital Background Visual (Text removed per user request) */}
        <div
          className="hero-hospital-bg"
          style={{ backgroundImage: `url('/hospital_banner.jpg')` }}
        />
      </section>

      {/* 2. Four KPI Stat Cards */}
      <section className="kpi-cards-grid">
        <div className="kpi-overview-card" onClick={() => onNavigateTab('patients')}>
          <div className="kpi-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="kpi-stat-body">
            <div className="kpi-num">12</div>
            <div className="kpi-label">Today's Patients</div>
          </div>
          <div className="kpi-arrow-chevron">›</div>
        </div>

        <div className="kpi-overview-card" onClick={() => onNavigateTab('ai-analysis')}>
          <div className="kpi-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="kpi-stat-body">
            <div className="kpi-num">4</div>
            <div className="kpi-label">Waiting for Review</div>
          </div>
          <div className="kpi-arrow-chevron">›</div>
        </div>

        <div className="kpi-overview-card" onClick={() => onNavigateTab('laboratory')}>
          <div className="kpi-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 2v7.31a2 2 0 0 1-.58 1.42L3 17.15A2 2 0 0 0 4.41 20.6h15.18A2 2 0 0 0 21 17.15l-6.42-6.42A2 2 0 0 1 14 9.31V2" />
              <line x1="8.5" y1="2" x2="15.5" y2="2" />
            </svg>
          </div>
          <div className="kpi-stat-body">
            <div className="kpi-num">3</div>
            <div className="kpi-label">Pending Lab Results</div>
          </div>
          <div className="kpi-arrow-chevron">›</div>
        </div>

        <div className="kpi-overview-card" onClick={() => onNavigateTab('appointments')}>
          <div className="kpi-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="kpi-stat-body">
            <div className="kpi-num">5</div>
            <div className="kpi-label">Upcoming Appointments</div>
          </div>
          <div className="kpi-arrow-chevron">›</div>
        </div>
      </section>

      {/* 3. Main 2-Column Section */}
      <div className="dashboard-columns-grid">
        {/* Left Primary Column */}
        <div>
          {/* Today's Patient Queue Table Card */}
          <div className="white-box-card">
            <div className="box-card-header">
              <div className="box-card-header-left">
                <div style={{ color: '#2563eb' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h3>Today's Patient Queue</h3>
                  <p>Scheduled and walk-in patients</p>
                </div>
              </div>
              <span className="link-view-all" onClick={() => onNavigateTab('patients')}>
                View All →
              </span>
            </div>

            <div className="ihms-table-container">
              <table className="ihms-clinical-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th>Patient</th>
                    <th>Visit Reason</th>
                    <th>Priority</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patientQueue.map((item) => {
                    const queueAvatar = getAvatarFor(item.pid, item.avatar);
                    return (
                      <tr key={item.id}>
                        <td style={{ color: '#94a3b8', fontWeight: 600 }}>{item.id}</td>
                        <td>
                          <div className="patient-cell-flex">
                            {queueAvatar ? (
                              <img
                                src={queueAvatar}
                                alt={item.name}
                                className="patient-avatar-thumb"
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div
                                className="patient-initial-badge"
                                style={{ background: item.color, color: item.textColor }}
                              >
                                {item.initials}
                              </div>
                            )}
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              {item.pid} · {item.age} yrs | {item.gender}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155' }}>{item.reason}</td>
                      <td>
                        <span className={`priority-chip ${item.priorityClass}`}>{item.priority}</span>
                      </td>
                      <td style={{ color: '#64748b', fontWeight: 600 }}>{item.time}</td>
                      <td>
                        <div className="status-dot-text">
                          <span className="dot-indicator" style={{ background: item.statusDot }}></span>
                          <span>{item.status}</span>
                        </div>
                      </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => onSelectPatient(item.pid)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Pending Service Requests & My Schedule */}
        <div>
          {/* Pending Service Requests */}
          <div className="white-box-card">
            <div className="box-card-header">
              <div className="box-card-header-left">
                <div style={{ color: '#2563eb' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div>
                  <h3>Pending Service Requests</h3>
                  <p>Laboratory, pharmacy and referrals</p>
                </div>
              </div>
              <span className="link-view-all" onClick={() => onNavigateTab('laboratory')}>
                View All →
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="service-request-item">
                <div className="service-req-left">
                  <div className="service-req-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 2v7.31a2 2 0 0 1-.58 1.42L3 17.15A2 2 0 0 0 4.41 20.6h15.18A2 2 0 0 0 21 17.15l-6.42-6.42A2 2 0 0 1 14 9.31V2" />
                    </svg>
                  </div>
                  <div className="service-req-text">
                    <div className="title">Laboratory</div>
                    <div className="subtitle">Blood tests, Biochemistry, CBC, etc.</div>
                  </div>
                </div>
                <div className="service-req-right">
                  <div className="pending-count-chip">
                    5 <span>pending</span>
                  </div>
                  <button
                    type="button"
                    className="btn-table-action"
                    onClick={() => onNavigateTab('laboratory')}
                  >
                    View
                  </button>
                </div>
              </div>

              <div className="service-request-item">
                <div className="service-req-left">
                  <div className="service-req-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z" />
                    </svg>
                  </div>
                  <div className="service-req-text">
                    <div className="title">Pharmacy</div>
                    <div className="subtitle">Prescriptions, Dispensing, Medicines</div>
                  </div>
                </div>
                <div className="service-req-right">
                  <div className="pending-count-chip" style={{ background: '#ffedd5', color: '#ea580c' }}>
                    3 <span>pending</span>
                  </div>
                  <button
                    type="button"
                    className="btn-table-action"
                    onClick={() => onNavigateTab('pharmacy')}
                  >
                    View
                  </button>
                </div>
              </div>

              <div className="service-request-item" style={{ borderBottom: 'none' }}>
                <div className="service-req-left">
                  <div className="service-req-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 14 20 9 15 4" />
                      <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                    </svg>
                  </div>
                  <div className="service-req-text">
                    <div className="title">Referrals</div>
                    <div className="subtitle">Department / External Hospital</div>
                  </div>
                </div>
                <div className="service-req-right">
                  <div className="pending-count-chip" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                    2 <span>pending</span>
                  </div>
                  <button
                    type="button"
                    className="btn-table-action"
                    onClick={() => onNavigateTab('referrals')}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* My Schedule Timeline */}
          <div className="white-box-card">
            <div className="box-card-header">
              <div className="box-card-header-left">
                <div style={{ color: '#2563eb' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                  </svg>
                </div>
                <div>
                  <h3>My Schedule</h3>
                </div>
              </div>
              <span className="link-view-all" onClick={() => onNavigateTab('appointments')}>
                View Calendar →
              </span>
            </div>

            <div className="schedule-timeline-list">
              <div
                className="schedule-timeline-item"
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigateTab('appointments')}
                title="Click to view OPD Consultation Schedule"
              >
                <span className="schedule-time">09:00 AM</span>
                <span className="schedule-node-dot"></span>
                <div className="schedule-info">OPD Consultation</div>
              </div>

              <div
                className="schedule-timeline-item"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectPatient('P-10245')}
                title="Click to open Rahul Patil overview"
              >
                <span className="schedule-time">10:30 AM</span>
                <span className="schedule-node-dot"></span>
                <div className="schedule-info">
                  Rahul Patil <span>P-10245</span>
                </div>
              </div>

              <div
                className="schedule-timeline-item active"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectPatient('P-10248')}
                title="Click to open Vikram Singh overview"
              >
                <span className="schedule-time" style={{ color: '#2563eb' }}>12:00 PM</span>
                <span className="schedule-node-dot"></span>
                <div className="schedule-info">
                  Vikram Singh <span>P-10248</span>
                </div>
              </div>

              <div
                className="schedule-timeline-item"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectPatient('P-10246')}
                title="Click to open Sneha Jadhav overview"
              >
                <span className="schedule-time">02:00 PM</span>
                <span className="schedule-node-dot"></span>
                <div className="schedule-info">
                  Sneha Jadhav <span>P-10246</span>
                </div>
              </div>

              <div
                className="schedule-timeline-item"
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigateTab('appointments')}
                title="Click to view all Follow-up Patients"
              >
                <span className="schedule-time">04:00 PM</span>
                <span className="schedule-node-dot"></span>
                <div className="schedule-info">Follow-up Patients</div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Department Portals (Image 1 replica placed directly below My Schedule) */}
          <div className="white-box-card" style={{ marginTop: '1.25rem' }}>
            {/* 3 Functional Sub-Cards (Stacked in Right Column) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div
                className="subcard-item"
                onClick={() => onNavigateTab('appointments')}
                title="View Appointments"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.9rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div className="subcard-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ color: '#2563eb' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                    </svg>
                  </div>
                  <div>
                    <div className="s-title" style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>My Appointments</div>
                    <div className="s-desc" style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Today's and upcoming</div>
                  </div>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '1.15rem' }}>›</span>
              </div>

              <div
                className="subcard-item"
                onClick={() => onNavigateTab('laboratory')}
                title="View Lab Reports"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.9rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div className="subcard-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ color: '#0284c7' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 2v7.31a2 2 0 0 1-.58 1.42L3 17.15A2 2 0 0 0 4.41 20.6h15.18A2 2 0 0 0 21 17.15l-6.42-6.42A2 2 0 0 1 14 9.31V2" />
                    </svg>
                  </div>
                  <div>
                    <div className="s-title" style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Lab Reports</div>
                    <div className="s-desc" style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>View pending and completed</div>
                  </div>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '1.15rem' }}>›</span>
              </div>

              <div
                className="subcard-item"
                onClick={() => onNavigateTab('ai-analysis')}
                title="Open AI Document Analysis"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.9rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div className="subcard-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ color: '#7c3aed' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <div className="s-title" style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>AI Document Analysis</div>
                    <div className="s-desc" style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Upload and extract info</div>
                  </div>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '1.15rem' }}>›</span>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div style={{ marginTop: '1.1rem', paddingTop: '0.9rem', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#d97706', marginBottom: '0.65rem' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>Quick Actions</span>
              </div>

              <div
                className="quick-actions-bar"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.55rem',
                  marginTop: '0.35rem',
                }}
              >
                <button
                  type="button"
                  className="quick-action-pill-btn qa-blue"
                  onClick={onOpenNewPatientModal}
                  style={{ padding: '0.6rem 0.5rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  New Patient
                </button>

                <button
                  type="button"
                  className="quick-action-pill-btn qa-teal"
                  onClick={onOpenBookAppointmentModal}
                  style={{ padding: '0.6rem 0.5rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Book Appt
                </button>

                <button
                  type="button"
                  className="quick-action-pill-btn qa-purple"
                  onClick={() => onNavigateTab('ai-analysis')}
                  style={{ padding: '0.6rem 0.5rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Upload Doc
                </button>

                <button
                  type="button"
                  className="quick-action-pill-btn qa-orange"
                  onClick={onOpenServiceRequestModal}
                  style={{ padding: '0.6rem 0.5rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M10 2v7.31a2 2 0 0 1-.58 1.42L3 17.15A2 2 0 0 0 4.41 20.6h15.18A2 2 0 0 0 21 17.15l-6.42-6.42A2 2 0 0 1 14 9.31V2" />
                  </svg>
                  Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
