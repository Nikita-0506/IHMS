import React, { useState, useRef, useEffect } from 'react';
import { getAvatarFor, saveAvatarFor, subscribeAvatarUpdates } from '../services/avatarStore';
import { CLINICAL_DOCTORS, ALL_MONITORING_RECORDS, CLINICAL_REFERRALS } from '../data/clinicalDataset';

export default function DoctorManagement({ onSelectPatient, onAddDoctorModal, onBack }) {
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDoctorModal, setSelectedDoctorModal] = useState(null);
  const [modalTab, setModalTab] = useState('today');
  const [modalPage, setModalPage] = useState(1);
  const [modalSearch, setModalSearch] = useState('');
  const [docPhotoTick, setDocPhotoTick] = useState(0);
  const [targetDoctorId, setTargetDoctorId] = useState(null);
  const docPhotoInputRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeAvatarUpdates(() => {
      setDocPhotoTick((t) => t + 1);
    });
    return unsub;
  }, []);

  const handleDoctorPhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && targetDoctorId) {
      const reader = new FileReader();
      reader.onload = () => {
        saveAvatarFor('doc_' + targetDoctorId, reader.result);
        setDocPhotoTick((t) => t + 1);
        if (selectedDoctorModal && selectedDoctorModal.id === targetDoctorId) {
          setSelectedDoctorModal({ ...selectedDoctorModal, avatar: reader.result });
        }
        alert('Doctor profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUploadForDoctor = (docId) => {
    setTargetDoctorId(docId);
    if (docPhotoInputRef.current) {
      docPhotoInputRef.current.click();
    }
  };

  const doctorsList = CLINICAL_DOCTORS;

  const coordinationReferrals = CLINICAL_REFERRALS;

  const departmentGroups = [
    { name: 'General Medicine', head: 'Dr. Amit Deshmukh', icon: '🩺', beds: '28 / 32 Occupied', color: '#2563eb' },
    { name: 'Cardiology', head: 'Dr. Sneha Kulkarni', icon: '❤️', beds: '14 / 16 CCU Beds', color: '#dc2626' },
    { name: 'Pediatrics', head: 'Dr. Rajesh Iyer', icon: '👶', beds: '18 / 20 Beds', color: '#059669' },
    { name: 'Orthopedics', head: 'Dr. Rohan Mehta', icon: '🦴', beds: '12 / 16 Beds', color: '#d97706' },
    { name: 'Emergency & Trauma', head: 'Dr. Vikram Patil', icon: '🚑', beds: '6 / 8 Bays Active', color: '#7c3aed' },
    { name: 'Gynecology & Obstetrics', head: 'Dr. Neha Joshi', icon: '🌸', beds: '20 / 24 Beds', color: '#db2777' },
    { name: 'Intensive Care Unit', head: 'Dr. Anjali Deshmukh', icon: '⚡', beds: '12 / 12 ICU Beds (Full)', color: '#dc2626' },
    { name: 'Pulmonology', head: 'Dr. Sanjay Verma', icon: '🫁', beds: '16 / 18 Beds', color: '#0284c7' },
    { name: 'Nephrology & Urology', head: 'Dr. Suresh Rao', icon: '💧', beds: '10 / 14 Beds', color: '#0d9488' },
    { name: 'Neurology', head: 'Dr. Manoj Kulkarni', icon: '🧠', beds: '8 / 10 Beds', color: '#6366f1' },
    { name: 'Oncology', head: 'Dr. Sunita Nair', icon: '🎗️', beds: '14 / 16 Beds', color: '#9333ea' },
    { name: 'General Surgery', head: 'Dr. Deepak Pawar', icon: '🔪', beds: '15 / 18 Beds', color: '#ea580c' },
  ];

  const getDoctorQueuePatients = (doc, isTodayOnly = false) => {
    if (!doc) return [];
    const matched = ALL_MONITORING_RECORDS.filter(
      (p) =>
        p.doctor_name === doc.name ||
        p.doctor_dept === doc.dept ||
        p.doctor_id === doc.doctor_id
    );
    const pool = matched.length > 0 ? matched : ALL_MONITORING_RECORDS;
    const count = isTodayOnly ? (doc.todayPatients || 20) : (doc.totalPatients || 60);
    return pool.slice(0, count).map((p, idx) => ({
      id: idx + 1,
      name: p.full_name,
      pid: p.patient_id,
      condition: `${p.care_unit} (${p.room_no}) · HR:${Math.round(p.heart_rate_bpm)} BP:${Math.round(p.systolic_bp_mmhg)}/${Math.round(p.diastolic_bp_mmhg)} · ${p.deterioration_risk} Risk`,
      avatar: p.gender === 'Female' ? '/avatars/patient_sneha.png' : '/avatars/patient_rahul.png',
      time: p.monitoring_frequency || 'Every 4 hours',
      status: p.record_status || 'Active',
    }));
  };

  const filteredDoctors = doctorsList.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      doc.dept.toLowerCase().includes(searchDoctor.toLowerCase());
    const matchesDept = selectedDept === 'all' || doc.dept.toLowerCase().includes(selectedDept.toLowerCase());
    const matchesAvail =
      selectedAvailability === 'all' ||
      (selectedAvailability === 'available' && doc.availability.includes('Available')) ||
      (selectedAvailability === 'busy' && doc.availability.includes('Busy'));
    return matchesSearch && matchesDept && matchesAvail;
  });

  return (
    <div className="ihms-scroll-viewport">
      {/* Top Header */}
      <div className="patient-overview-header" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onBack && (
            <button
              type="button"
              className="page-header-back-btn"
              onClick={onBack}
              title="Go Back"
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.borderColor = '#93c5fd';
                e.currentTarget.style.color = '#2563eb';
                e.currentTarget.style.transform = 'translateX(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#1e293b';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          )}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Doctor Management</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Manage doctors, availability and service coordination
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn-table-action"
          style={{
            background: '#2563eb',
            color: '#ffffff',
            borderColor: '#2563eb',
            padding: '0.55rem 1.1rem',
            fontSize: '0.84rem',
            fontWeight: 700,
            borderRadius: '8px',
          }}
          onClick={onAddDoctorModal}
        >
          + Add Doctor
        </button>
      </div>

      {/* Subtabs Strip */}
      <div className="doctor-subtabs-row">
        <button
          type="button"
          className={`doc-subtab-btn ${activeSubTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('all')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          All Doctors
        </button>

        <button
          type="button"
          className={`doc-subtab-btn ${activeSubTab === 'department' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('department')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          By Department
        </button>

        <button
          type="button"
          className={`doc-subtab-btn ${activeSubTab === 'availability' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('availability')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Availability
        </button>

        <button
          type="button"
          className={`doc-subtab-btn ${activeSubTab === 'coordination' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('coordination')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Service Coordination
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="doctors-filter-bar">
        {/* Search */}
        <div className="header-search-bar" style={{ width: 340, background: '#ffffff' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search doctor by name or specialization..."
            value={searchDoctor}
            onChange={(e) => setSearchDoctor(e.target.value)}
          />
        </div>

        {/* Dropdowns & Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            <option value="all">All Departments</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Emergency & Trauma">Emergency & Trauma</option>
            <option value="Gynecology">Gynecology & Obstetrics</option>
            <option value="Intensive Care">Intensive Care Unit</option>
            <option value="Pulmonology">Pulmonology</option>
            <option value="Nephrology">Nephrology & Urology</option>
            <option value="Neurology">Neurology</option>
            <option value="Oncology">Oncology</option>
            <option value="Surgery">General Surgery</option>
          </select>

          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            <option value="all">● All Availability</option>
            <option value="available">● Available</option>
            <option value="busy">● Busy / In Surgery</option>
          </select>

          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#2563eb' : 'transparent',
                color: viewMode === 'grid' ? '#ffffff' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.6rem',
                cursor: 'pointer',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? '#2563eb' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.6rem',
                cursor: 'pointer',
              }}
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
          </div>
        </div>
      </div>

      {/* Hidden file input for doctor photo upload */}
      <input
        type="file"
        ref={docPhotoInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleDoctorPhotoUpload}
      />

      {/* SECTION 1: All Doctors View (Grid or List based on viewMode) */}
      {activeSubTab === 'all' && (
        <>
          {viewMode === 'grid' ? (
            <div className="doctors-grid">
              {filteredDoctors.map((doc) => {
                const docAvatar = getAvatarFor('doc_' + doc.id, doc.avatar);
                return (
                  <div key={doc.id} className="doctor-card">
                    <div className="doctor-card-info">
                      <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
                        <img
                          src={docAvatar}
                          alt={doc.name}
                          className="doctor-avatar-circle"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/doctor_amit.jpg';
                          }}
                        />
                        <button
                          type="button"
                          title="Change Doctor Photo"
                          onClick={() => triggerUploadForDoctor(doc.id)}
                          style={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            background: '#2563eb',
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            border: '1.5px solid #ffffff',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          }}
                        >
                          📷
                        </button>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {doc.dept} · {doc.degree}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '3px' }}>
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: doc.availability.includes('Available') ? '#10b981' : '#f59e0b',
                            }}
                          ></span>
                          <span style={{ fontSize: '0.7rem', color: doc.availability.includes('Available') ? '#059669' : '#d97706', fontWeight: 600 }}>
                            {doc.availability}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => setSelectedDoctorModal({ ...doc, avatar: docAvatar })}
                      >
                        View Profile →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ihms-table-container" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table className="ihms-clinical-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Qualification</th>
                    <th>Clinic / Room</th>
                    <th>Timing</th>
                    <th>Availability</th>
                    <th>Patients</th>
                    <th>Rating</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doc) => {
                    const docAvatar = getAvatarFor('doc_' + doc.id, doc.avatar);
                    return (
                      <tr key={doc.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{ position: 'relative' }}>
                              <img
                                src={docAvatar}
                                alt={doc.name}
                                style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #93c5fd' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/doctor_amit.jpg';
                                }}
                              />
                              <span
                                onClick={() => triggerUploadForDoctor(doc.id)}
                                style={{
                                  position: 'absolute',
                                  bottom: -2,
                                  right: -2,
                                  background: '#2563eb',
                                  color: '#fff',
                                  borderRadius: '50%',
                                  width: '14px',
                                  height: '14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '8px',
                                  cursor: 'pointer',
                                }}
                              >
                                📷
                              </span>
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>{doc.name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>DOC-00{doc.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.82rem' }}>{doc.dept}</td>
                        <td style={{ color: '#475569', fontSize: '0.82rem' }}>{doc.degree}</td>
                        <td style={{ color: '#475569', fontSize: '0.78rem' }}>{doc.room}</td>
                        <td style={{ color: '#64748b', fontSize: '0.76rem' }}>{doc.timing}</td>
                        <td>
                          <span
                            style={{
                              background: doc.availability.includes('Available') ? '#ecfdf5' : '#fef3c7',
                              color: doc.availability.includes('Available') ? '#059669' : '#b45309',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                            }}
                          >
                            ● {doc.availability}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>{doc.todayPatients} today</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>{doc.totalPatients} total</span>
                        </td>
                        <td style={{ color: '#b45309', fontWeight: 700, fontSize: '0.82rem' }}>★ {doc.rating}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => setSelectedDoctorModal({ ...doc, avatar: docAvatar })}
                          >
                            View Profile →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* SECTION 2: By Department View */}
      {activeSubTab === 'department' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {departmentGroups.map((dept) => {
            const deptDocs = doctorsList.filter((d) => d.dept.toLowerCase().includes(dept.name.toLowerCase().split(' ')[0]));
            return (
              <div
                key={dept.name}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{dept.icon}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{dept.name}</h3>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>HOD: <b>{dept.head}</b></span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
                      🛏️ {dept.beds}
                    </span>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                      {deptDocs.length} Active Specialist{deptDocs.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="doctors-grid">
                  {deptDocs.map((doc) => {
                    const docAvatar = getAvatarFor('doc_' + doc.id, doc.avatar);
                    return (
                      <div key={doc.id} className="doctor-card">
                        <div className="doctor-card-info">
                          <img
                            src={docAvatar}
                            alt={doc.name}
                            className="doctor-avatar-circle"
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/doctor_amit.jpg';
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{doc.name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{doc.degree}</div>
                            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>● {doc.availability}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => setSelectedDoctorModal({ ...doc, avatar: docAvatar })}
                        >
                          View Profile →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 3: Live Doctor Availability View */}
      {activeSubTab === 'availability' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Roster Status Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>Available In OPD</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857', marginTop: '4px' }}>5 Doctors</div>
              <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px' }}>Ready for immediate consult</div>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>In Surgery / OT</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>1 Doctor</div>
              <div style={{ fontSize: '0.72rem', color: '#d97706', marginTop: '2px' }}>Next slot from 04:30 PM</div>
            </div>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>Emergency On-Call</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8', marginTop: '4px' }}>2 Specialists</div>
              <div style={{ fontSize: '0.72rem', color: '#2563eb', marginTop: '2px' }}>24/7 Resuscitation Bay</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Average Wait Time</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>12 Mins</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Optimal hospital flow</div>
            </div>
          </div>

          {/* Availability Table */}
          <div className="ihms-table-container" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <table className="ihms-clinical-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Room / Location</th>
                  <th>Today's Shift Hours</th>
                  <th>Current Queue</th>
                  <th>Live Roster Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {doctorsList.map((doc) => {
                  const docAvatar = getAvatarFor('doc_' + doc.id, doc.avatar);
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <img
                            src={docAvatar}
                            alt={doc.name}
                            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/doctor_amit.jpg';
                            }}
                          />
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>{doc.name}</span>
                        </div>
                      </td>
                      <td style={{ color: '#2563eb', fontWeight: 700 }}>{doc.dept}</td>
                      <td style={{ color: '#475569', fontSize: '0.8rem' }}>{doc.room}</td>
                      <td style={{ color: '#475569', fontSize: '0.8rem' }}>{doc.timing}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{doc.todayPatients} Waiting</td>
                      <td>
                        <span
                          style={{
                            background: doc.availability.includes('Available') ? '#ecfdf5' : '#fef3c7',
                            color: doc.availability.includes('Available') ? '#059669' : '#b45309',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '0.74rem',
                          }}
                        >
                          ● {doc.availability}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => setSelectedDoctorModal({ ...doc, avatar: docAvatar })}
                        >
                          View Schedule & Profile →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: Service Coordination & Cross-Referrals View */}
      {activeSubTab === 'coordination' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '1rem', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>Active Cross-Referrals</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1d4ed8', marginTop: '4px' }}>4 Requests</div>
              <div style={{ fontSize: '0.72rem', color: '#2563eb' }}>Inter-departmental consultations</div>
            </div>
            <div style={{ background: '#fef2f2', borderRadius: '10px', padding: '1rem', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>Emergency Escalations</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>1 Critical</div>
              <div style={{ fontSize: '0.72rem', color: '#b91c1c' }}>Immediate OT transfer</div>
            </div>
            <div style={{ background: '#ecfdf5', borderRadius: '10px', padding: '1rem', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>Dispatched & Completed</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>28 Completed</div>
              <div style={{ fontSize: '0.72rem', color: '#047857' }}>Coordinated today</div>
            </div>
          </div>

          {/* Coordination Referrals Table */}
          <div className="ihms-table-container" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <table className="ihms-clinical-table">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Patient</th>
                  <th>From Doctor & Dept</th>
                  <th>To Specialist & Dept</th>
                  <th>Priority</th>
                  <th>Clinical Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {coordinationReferrals.map((ref) => (
                  <tr key={ref.id}>
                    <td style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.78rem' }}>{ref.id}</td>
                    <td>
                      <div
                        style={{ fontWeight: 800, color: '#0f172a', cursor: 'pointer' }}
                        onClick={() => onSelectPatient && onSelectPatient(ref.pid)}
                      >
                        {ref.patient}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{ref.pid}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>{ref.fromDoc}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{ref.fromDept}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>{ref.toDoc}</div>
                      <div style={{ fontSize: '0.72rem', color: '#2563eb' }}>{ref.toDept}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: ref.priority === 'CRITICAL' ? '#fef2f2' : (ref.priority === 'Urgent' ? '#fffbeb' : '#eff6ff'),
                          color: ref.priority === 'CRITICAL' ? '#dc2626' : (ref.priority === 'Urgent' ? '#d97706' : '#2563eb'),
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                        }}
                      >
                        {ref.priority}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#334155', maxWidth: '240px' }}>{ref.reason}</td>
                    <td>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#059669' }}>
                        ● {ref.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-table-action"
                        style={{ background: '#2563eb', color: '#ffffff', borderColor: '#2563eb', fontWeight: 700 }}
                        onClick={() => alert(`Service coordination action acknowledged for referral ${ref.id} (${ref.patient})!`)}
                      >
                        Accept & Consult →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STEP 2: Doctor Profile Modal Popup (Matching Image 3) */}
      {selectedDoctorModal && (
        <div className="modal-backdrop-overlay" onClick={() => setSelectedDoctorModal(null)}>
          <div className="modal-window-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-window-header">
              <h3>Doctor Profile</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedDoctorModal(null)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-window-body">
              {/* Doctor Info Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={getAvatarFor('doc_' + selectedDoctorModal.id, selectedDoctorModal.avatar)}
                      alt={selectedDoctorModal.name}
                      style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '3px solid #bfdbfe' }}
                    />
                    <button
                      type="button"
                      title="Change Doctor Photo"
                      onClick={() => triggerUploadForDoctor(selectedDoctorModal.id)}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        background: '#2563eb',
                        color: '#ffffff',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '2px solid #ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </button>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {selectedDoctorModal.name}
                      </h4>
                      <span
                        style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        ● {selectedDoctorModal.availability}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      {selectedDoctorModal.dept} | {selectedDoctorModal.degree}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                      🕒 {selectedDoctorModal.timing}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      📍 {selectedDoctorModal.room}
                    </div>
                  </div>
                </div>

              </div>

              {/* Stats Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  margin: '1.25rem 0',
                }}
              >
                <div
                  style={{
                    background: modalTab === 'today' ? '#dbeafe' : '#eff6ff',
                    border: modalTab === 'today' ? '2px solid #2563eb' : '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: modalTab === 'today' ? '0 2px 8px rgba(37, 99, 235, 0.2)' : 'none',
                  }}
                  onClick={() => {
                    setModalTab('today');
                    setModalPage(1);
                  }}
                  title="Click to view Today's Patients"
                >
                  <span style={{ fontSize: '1.4rem' }}>👥</span>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8' }}>
                      {selectedDoctorModal.todayPatients}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 700 }}>
                      Today's Patients
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: modalTab === 'total' ? '#dbeafe' : '#f8fafc',
                    border: modalTab === 'total' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: modalTab === 'total' ? '0 2px 8px rgba(37, 99, 235, 0.2)' : 'none',
                  }}
                  onClick={() => {
                    setModalTab('total');
                    setModalPage(1);
                  }}
                  title="Click to view Total Patients"
                >
                  <span style={{ fontSize: '1.4rem' }}>📅</span>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedDoctorModal.totalPatients}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: modalTab === 'total' ? '#1e40af' : '#64748b', fontWeight: 700 }}>
                      Total Patients
                    </div>
                  </div>
                </div>

                <div style={{ background: '#fffbeb', borderRadius: '10px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '1.4rem', color: '#d97706' }}>★</span>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b45309' }}>
                      {selectedDoctorModal.rating}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                      Doctor Rating
                    </div>
                  </div>
                </div>
              </div>

              {/* Inner Tabs: Today's Patients (12) | Total Patients (48) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    style={{
                      padding: '0.5rem 0.25rem',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: modalTab === 'today' ? '2px solid #2563eb' : '2px solid transparent',
                      color: modalTab === 'today' ? '#2563eb' : '#64748b',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setModalTab('today');
                      setModalPage(1);
                    }}
                  >
                    📅 Today's Patients ({selectedDoctorModal.todayPatients})
                  </button>

                  <button
                    type="button"
                    style={{
                      padding: '0.5rem 0.25rem',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: modalTab === 'total' ? '2px solid #2563eb' : '2px solid transparent',
                      color: modalTab === 'total' ? '#2563eb' : '#64748b',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setModalTab('total');
                      setModalPage(1);
                    }}
                  >
                    👥 Total Patients ({selectedDoctorModal.totalPatients})
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder={`Search ${modalTab === 'today' ? "today's" : "all 48"} patients...`}
                    value={modalSearch}
                    onChange={(e) => {
                      setModalSearch(e.target.value);
                      setModalPage(1);
                    }}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.76rem',
                      width: '210px',
                    }}
                  />
                </div>
              </div>

              {/* Patient Table */}
              {(() => {
                const todayList = getDoctorQueuePatients(selectedDoctorModal, true);
                const totalList = getDoctorQueuePatients(selectedDoctorModal, false);
                const currentModalList = (modalTab === 'today' ? todayList : totalList).filter(
                  (p) =>
                    p.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
                    p.pid.toLowerCase().includes(modalSearch.toLowerCase()) ||
                    p.condition.toLowerCase().includes(modalSearch.toLowerCase())
                );
                const pageSize = 5;
                const totalPages = Math.max(1, Math.ceil(currentModalList.length / pageSize));
                const displayedPatients = currentModalList.slice((modalPage - 1) * pageSize, modalPage * pageSize);

                return (
                  <>
                    <div className="ihms-table-container">
                      <table className="ihms-clinical-table">
                        <thead>
                          <tr>
                            <th style={{ width: 36 }}>#</th>
                            <th>Patient</th>
                            <th>Patient ID</th>
                            <th>Disease / Condition</th>
                            <th>Time / Visit</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedPatients.map((p) => (
                            <tr key={p.id}>
                              <td style={{ color: '#94a3b8', fontWeight: 600 }}>{p.id}</td>
                              <td style={{ fontWeight: 700, color: '#0f172a' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                  <img
                                    src={p.avatar}
                                    alt={p.name}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: '1.5px solid #bfdbfe',
                                      flexShrink: 0,
                                      background: '#eff6ff',
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                  <span>{p.name}</span>
                                </div>
                              </td>
                              <td style={{ color: '#64748b', fontWeight: 600 }}>{p.pid}</td>
                              <td style={{ color: '#334155' }}>{p.condition}</td>
                              <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{p.time}</td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  className="btn-table-action"
                                  onClick={() => {
                                    setSelectedDoctorModal(null);
                                    onSelectPatient(p.pid);
                                  }}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                          {displayedPatients.length === 0 && (
                            <tr>
                              <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                                No patients found matching "{modalSearch}"
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        Showing {currentModalList.length === 0 ? 0 : (modalPage - 1) * pageSize + 1} - {Math.min(modalPage * pageSize, currentModalList.length)} of {currentModalList.length} patients
                      </span>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                          type="button"
                          className="btn-table-action"
                          style={{ padding: '0.2rem 0.5rem' }}
                          disabled={modalPage === 1}
                          onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                        >
                          ‹
                        </button>
                        {Array.from({ length: Math.min(totalPages, 10) }).map((_, idx) => {
                          const pageNum = idx + 1;
                          const isActive = modalPage === pageNum;
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              className="btn-table-action"
                              style={{
                                background: isActive ? '#2563eb' : '#ffffff',
                                color: isActive ? '#ffffff' : '#334155',
                                borderColor: isActive ? '#2563eb' : '#cbd5e1',
                                padding: '0.2rem 0.6rem',
                                fontWeight: isActive ? 700 : 500,
                              }}
                              onClick={() => setModalPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          className="btn-table-action"
                          style={{ padding: '0.2rem 0.5rem' }}
                          disabled={modalPage === totalPages}
                          onClick={() => setModalPage((p) => Math.min(totalPages, p + 1))}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
