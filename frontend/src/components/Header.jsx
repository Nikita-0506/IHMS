import React, { useState, useRef, useEffect } from 'react';
import { getAvatarFor, saveAvatarFor, subscribeAvatarUpdates } from '../services/avatarStore';
import { ALL_MONITORING_RECORDS } from '../data/clinicalDataset';

export default function Header({
  currentUser,
  onSwitchUser,
  onLogout,
  onSelectPatient,
  onNavigateTab,
  onGoBack,
  canGoBack,
  activeNav,
  isSidebarOpen,
  onToggleSidebar,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [userAvatar, setUserAvatar] = useState(() =>
    getAvatarFor(currentUser?.username, currentUser?.avatar || '/doctor_amit.jpg')
  );

  const fileInputRef = useRef(null);

  useEffect(() => {
    setUserAvatar(getAvatarFor(currentUser?.username, currentUser?.avatar || '/doctor_amit.jpg'));
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = subscribeAvatarUpdates((key, dataUrl) => {
      if (key === currentUser?.username) {
        setUserAvatar(dataUrl);
      }
    });
    return unsubscribe;
  }, [currentUser]);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        saveAvatarFor(currentUser?.username, dataUrl);
        setUserAvatar(dataUrl);
        if (currentUser) {
          currentUser.avatar = dataUrl;
        }
        alert('Profile image updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'Critical ER Intake',
      desc: 'Vikram Singh (P-10248) admitted with polytrauma.',
      time: '10m ago',
      unread: true,
      action: () => onSelectPatient && onSelectPatient('P-10248'),
    },
    {
      id: 2,
      title: 'OCR Lab Report Verified',
      desc: 'CBC Panel for Rahul Patil ready for review.',
      time: '25m ago',
      unread: true,
      action: () => onNavigateTab && onNavigateTab('ai-analysis'),
    },
    {
      id: 3,
      title: 'Referral Consult Request',
      desc: 'Dr. Sneha Kulkarni reviewed Priya Deshmukh CCU.',
      time: '1h ago',
      unread: false,
      action: () => onNavigateTab && onNavigateTab('referrals'),
    },
  ];

  const quickRoles = [
    { label: 'Dr. Amit Deshmukh', role: 'General Medicine', username: 'dr_amit', avatar: '/avatars/doc_amit.png' },
    { label: 'Dr. Sneha Kulkarni', role: 'Cardiology (CCU)', username: 'dr_kulkarni', avatar: '/avatars/doc_sneha.png' },
    { label: 'Dr. Vikram Deshmukh', role: 'Emergency & Trauma', username: 'dr_deshmukh', avatar: '/avatars/doc_vikram.png' },
    { label: 'Dr. Saurabh Patwardhan', role: 'Laboratory Head', username: 'lab_staff', avatar: '/avatars/doc_saurabh.png' },
    { label: 'Pooja Jadhav', role: 'Pharmacist', username: 'pharmacist_user', avatar: '/avatars/patient_sneha.png' },
    { label: 'Anjali Gaikwad', role: 'Receptionist / Admin', username: 'receptionist_user', avatar: '/avatars/patient_priya.png' },
    { label: 'System Admin', role: 'Hospital Administration', username: 'admin', avatar: '/avatars/patient_mahesh.png' },
    { label: 'Rahul Patil', role: 'Patient (Self-Service)', username: 'rahul_patil', avatar: '/avatars/patient_rahul.png' },
  ];

  const searchablePatients = [
    { pid: 'P-10245', name: 'Rahul Patil', condition: 'Fever with dehydration concern', age: 32 },
    ...ALL_MONITORING_RECORDS.slice(0, 150).map((p) => ({
      pid: p.patient_id,
      name: p.full_name,
      condition: `${p.care_unit} (${p.room_no}) · Risk: ${p.deterioration_risk}`,
      age: p.age,
    })),
  ];

  const [liveSearchResults, setLiveSearchResults] = useState([]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setLiveSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/patients/monitoring/?search=${encodeURIComponent(q)}&page_size=8`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.results) {
            setLiveSearchResults(
              data.results.map((p) => ({
                pid: p.patient_id,
                name: p.full_name || `${p.first_name} ${p.last_name}`,
                condition: `${p.care_unit} · ${p.predicted_monitoring_level || p.monitoring_level} · Risk: ${p.deterioration_risk}`,
                age: p.age,
              }))
            );
          }
        })
        .catch(() => {});
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const localFiltered = searchQuery.trim()
    ? searchablePatients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.pid.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Merge live results with local demo patients without duplicates
  const seenPids = new Set();
  const filteredPatients = [...liveSearchResults, ...localFiltered].filter((p) => {
    if (seenPids.has(p.pid)) return false;
    seenPids.add(p.pid);
    return true;
  });

  const handleSelectSearchPatient = (pid) => {
    if (onSelectPatient) onSelectPatient(pid);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <header className="ihms-top-header">
      {/* Hidden Profile Image Upload Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleAvatarFileChange}
      />

      {/* 1. Left Controls: Global Search Bar (Matching Image 2) */}
      <div className="header-left-zone" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '680px' }}>
        {!isSidebarOpen && (
          <button
            type="button"
            className="header-sidebar-open-btn"
            onClick={onToggleSidebar}
            title="Show Sidebar (साइडबार उघडा)"
            aria-label="Show Sidebar"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="13 6 19 12 13 18" />
              <polyline points="5 6 11 12 5 18" />
            </svg>
            <span>Sidebar</span>
          </button>
        )}

        {canGoBack && !['dashboard', 'patients', 'ai-analysis', 'doctors', 'appointments', 'laboratory', 'pharmacy', 'referrals', 'documents', 'reports', 'settings'].includes(activeNav) && (
          <button
            type="button"
            className="header-back-btn"
            onClick={onGoBack}
            title="Go Back (मागे जा)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              height: '42px',
              padding: '0 0.95rem',
              borderRadius: '10px',
              border: '1.5px solid #dbeafe',
              background: '#eff6ff',
              color: '#0066ff',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back</span>
          </button>
        )}

        <div className="header-search-bar" style={{ position: 'relative', flex: 1, margin: 0 }}>
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search patient by name, ID or phone number..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => setShowSearchResults(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && filteredPatients.length > 0) {
              handleSelectSearchPatient(filteredPatients[0].pid);
            }
          }}
        />
        <span className="kbd-badge">Ctrl + K</span>

        {/* Search Results Dropdown */}
        {showSearchResults && filteredPatients.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '44px',
              left: 0,
              right: 0,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              zIndex: 100,
              padding: '0.5rem',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, padding: '0.3rem 0.5rem', textTransform: 'uppercase' }}>
              Matching Patients
            </div>
            {filteredPatients.map((p) => (
              <div
                key={p.pid}
                onClick={() => handleSelectSearchPatient(p.pid)}
                style={{
                  padding: '0.5rem 0.65rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#eff6ff')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.condition}</div>
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  {p.pid}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* 2. Right Controls */}
      <div className="header-right-actions">
        {/* Notification Bell Icon */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="icon-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="bell-badge-dot"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '42px',
                width: '320px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '0.85rem',
                zIndex: 50,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>Hospital Alerts</span>
                <span
                  style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => setShowNotifications(false)}
                >
                  Close
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.action) n.action();
                      setShowNotifications(false);
                    }}
                    style={{
                      background: n.unread ? '#eff6ff' : '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: n.unread ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = n.unread ? '#bfdbfe' : '#f1f5f9')}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{n.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>{n.desc}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px' }}>{n.time} · Click to open</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Doctor User Profile */}
        <div style={{ position: 'relative' }}>
          <div className="header-user-badge" onClick={() => setShowDropdown(!showDropdown)} style={{ cursor: 'pointer' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={userAvatar}
                alt={currentUser?.name || 'User'}
                className="user-avatar-img"
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/doctor_amit.jpg';
                }}
              />
              <span
                title="Change Photo"
                onClick={(e) => {
                  e.stopPropagation();
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  background: '#2563eb',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  border: '1px solid #fff',
                  cursor: 'pointer',
                }}
              >
                📷
              </span>
            </div>
            <div className="user-text-meta">
              <span className="u-name">{currentUser?.name || 'Dr. Amit Deshmukh'}</span>
              <span className="u-dept">{currentUser?.department || 'General Medicine'}</span>
            </div>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginLeft: '2px' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* User Quick Switcher Dropdown */}
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '300px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                padding: '1rem',
                zIndex: 50,
              }}
            >
              <div style={{ paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={userAvatar}
                    alt="avatar"
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      {currentUser?.name || 'Dr. Amit Deshmukh'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600 }}>
                      Role: {currentUser?.role || 'doctor'}
                    </div>
                  </div>
                </div>

                {/* Change Photo Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  style={{
                    width: '100%',
                    marginTop: '0.65rem',
                    padding: '0.45rem',
                    borderRadius: '6px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>📷</span>
                  <span>Change Profile Image (Upload Photo)</span>
                </button>
              </div>

              <div style={{ marginTop: '0.75rem', marginBottom: '0.45rem', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Switch User / Role
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '200px', overflowY: 'auto' }}>
                {quickRoles.map((r, i) => {
                  const roleAvatar = getAvatarFor(r.username, r.avatar);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        onSwitchUser({ ...r, avatar: roleAvatar });
                        setShowDropdown(false);
                      }}
                      style={{
                        background: currentUser?.username === r.username ? '#eff6ff' : '#f8fafc',
                        border: currentUser?.username === r.username ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                        borderRadius: '8px',
                        padding: '0.4rem 0.6rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                      }}
                    >
                      <img
                        src={roleAvatar}
                        alt={r.label}
                        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{r.label}</span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{r.role}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
                style={{
                  width: '100%',
                  marginTop: '0.85rem',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log Out of Workstation
              </button>
            </div>
          )}
        </div>

        {/* 3. Date Indicator */}
        <div
          className="header-date-badge"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigateTab && onNavigateTab('appointments')}
          title="Click to view Schedule & Appointments"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Tuesday, 14 Oct 2026</span>
        </div>
      </div>
    </header>
  );
}
