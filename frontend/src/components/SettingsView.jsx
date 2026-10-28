import React, { useState, useRef, useEffect } from 'react';
import { getAvatarFor, saveAvatarFor, subscribeAvatarUpdates } from '../services/avatarStore';
import { CLINICAL_SETTINGS } from '../data/clinicalDataset';

export default function SettingsView({ currentUser, onLogout, onBack }) {
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef(null);

  // Doctor Profile State
  const [profile, setProfile] = useState({
    fullName: currentUser?.name || 'Dr. Amit Deshmukh',
    designation: 'Senior Consultant & Physician',
    email: currentUser?.email || 'amit.deshmukh@hospital.com',
    phone: '+91 98765 43210',
    emergencyPhone: '+91 98765 43299',
    department: currentUser?.department || 'General Medicine',
    licenseNumber: 'MH-123456',
    specialization: 'General & Internal Medicine',
    qualifications: 'MBBS, MD (Medicine), FICP',
    experience: '12+ Years',
    room: 'OPD Room 204, Wing B',
    timings: '09:00 AM - 02:00 PM (Mon - Sat)',
    council: 'Maharashtra Medical Council (MMC)',
    bio: 'Senior consultant specializing in complex internal medicine diagnoses, chronic lifestyle disorder management, and preventative health care. Head of Inpatient Ward B.',
  });

  const [avatarUrl, setAvatarUrl] = useState(() =>
    getAvatarFor(currentUser?.username, currentUser?.avatar || '/doctor_amit.jpg')
  );

  useEffect(() => {
    setAvatarUrl(getAvatarFor(currentUser?.username, currentUser?.avatar || '/doctor_amit.jpg'));
  }, [currentUser]);

  useEffect(() => {
    const unsub = subscribeAvatarUpdates((key, dataUrl) => {
      if (key === currentUser?.username) {
        setAvatarUrl(dataUrl);
      }
    });
    return unsub;
  }, [currentUser]);

  // Security State
  const [security, setSecurity] = useState({
    username: currentUser?.username || 'dr.amit',
    passwordMasked: '••••••••••••••••',
    twoFactor: true,
    loginNotifications: true,
    biometricAuth: true,
    requirePrescriptionPin: false,
    sessionTimeout: '30 Minutes',
  });

  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: 'Windows 11 PC (Chrome 128)',
      location: 'Pune, Maharashtra',
      ip: '192.168.1.45',
      time: 'Active Now',
      isCurrent: true,
      icon: '💻',
    },
    {
      id: 2,
      device: 'Apple iPhone 15 Pro (IHMS App)',
      location: 'Pune, Maharashtra',
      ip: '49.36.12.89',
      time: '35 mins ago',
      isCurrent: false,
      icon: '📱',
    },
    {
      id: 3,
      device: 'Hospital OPD Terminal (Room 204 PC)',
      location: 'Main OPD Block',
      ip: '10.10.4.12',
      time: 'Yesterday, 05:45 PM',
      isCurrent: false,
      icon: '🖥️',
    },
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    systemAlerts: true,
    appointmentReminders: true,
    criticalVitals: true,
    statEmergency: true,
    labResultsReady: true,
    pharmacyWarnings: true,
    whatsappAlerts: true,
    dndEnabled: false,
    dndStart: '22:00',
    dndEnd: '06:30',
    soundChime: 'Medical Bell',
    soundVolume: 80,
  });

  // Appearance State
  const [themeMode, setThemeMode] = useState('light');
  const [accentColor, setAccentColor] = useState('#0066ff');
  const [language, setLanguage] = useState('English');
  const [fontSize, setFontSize] = useState('medium');
  const [density, setDensity] = useState('comfortable');
  const [highContrast, setHighContrast] = useState(false);
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('12-hour');

  // System Preferences State
  const [systemPrefs, setSystemPrefs] = useState({
    autoLogout: '30 Minutes',
    soundNotifications: true,
    defaultPage: 'Dashboard',
    noteAutoSaveInterval: '30 Seconds',
    defaultDosageUnit: 'mg',
    defaultQueueSort: 'Critical First',
    aiDiagnosticsEnabled: true,
    drugInteractionWarning: true,
    autoOcrReports: true,
    offlineCache: true,
  });

  // Department Settings State
  const [department, setDepartment] = useState({
    name: 'General Medicine & Therapeutics',
    code: 'DEPT-MED-01',
    hod: 'Dr. Amit Deshmukh (MD, FICP)',
    location: 'Building A, 2nd Floor, Wing B',
    extension: 'Ext 2104 / Direct: +91 20 6789 2104',
    email: 'general.medicine@ihms.hospital',
    emergencyHotline: 'Ext 999 (Code Blue/Yellow)',
    totalBeds: 45,
    occupiedBeds: 38,
    availableBeds: 7,
    hduBeds: 6,
    surgeCapacity: 10,
    activeOpdRooms: 8,
    maxDailyTokens: 50,
    consultationDuration: '15 Minutes',
    tokenDisplayEnabled: true,
    seniorDoctors: 6,
    residentDoctors: 8,
    nursingStaff: 16,
    supportStaff: 6,
    fastTrackEmergency: true,
    referralSlaStat: '30 Minutes',
    referralSlaRoutine: '2 Hours',
    mandatorySeniorDischarge: true,
  });

  // UI States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'change-username' | 'change-password' | 'edit-dept'
  const [newUsername, setNewUsername] = useState(security.username);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [saveToast, setSaveToast] = useState(null);

  // System Configuration Registry State (15 Settings from CSV)
  const [settingsData, setSettingsData] = useState(CLINICAL_SETTINGS);
  const [configSearch, setConfigSearch] = useState('');
  const [configCategory, setConfigCategory] = useState('All');

  const filteredSettings = settingsData.filter((s) => {
    const matchSearch =
      !configSearch.trim() ||
      s.setting_id.toLowerCase().includes(configSearch.toLowerCase()) ||
      s.setting_name.toLowerCase().includes(configSearch.toLowerCase()) ||
      s.setting_value.toLowerCase().includes(configSearch.toLowerCase());
    const matchCat = configCategory === 'All' || s.category === configCategory;
    return matchSearch && matchCat;
  });

  const handleExportSettingsCsv = () => {
    const headers = ['Setting_ID', 'Setting_Name', 'Setting_Value', 'Category', 'Status', 'Updated_At'];
    const rows = settingsData.map((s) => [
      s.setting_id,
      `"${s.setting_name}"`,
      `"${s.setting_value}"`,
      s.category,
      s.status,
      s.updated_at,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'system_settings_config.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Settings CSV downloaded successfully!');
  };

  const handleToggleSetting = (id) => {
    setSettingsData((prev) =>
      prev.map((s) => {
        if (s.setting_id === id) {
          const isEnabled = s.status === 'Enabled';
          const newStatus = isEnabled ? 'Disabled' : 'Enabled';
          const newVal = s.setting_value === 'Enabled' ? 'Disabled' : s.setting_value === 'Disabled' ? 'Enabled' : s.setting_value;
          return { ...s, status: newStatus, setting_value: newVal };
        }
        return s;
      })
    );
    showToast(`Setting ${id} status toggled!`);
  };

  const showToast = (msg) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3200);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        saveAvatarFor(currentUser?.username, dataUrl);
        setAvatarUrl(dataUrl);
        if (currentUser) {
          currentUser.avatar = dataUrl;
        }
        showToast('Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    setIsEditingProfile(false);
    showToast('Profile information successfully saved!');
  };

  const handleTerminateOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    showToast('Logged out of all other active sessions successfully!');
  };

  return (
    <div className="ihms-view-container">
      {/* Toast Notification */}
      {saveToast && (
        <div className="ihms-toast-notice">
          <span>✓</span> {saveToast}
        </div>
      )}

      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleAvatarFileChange}
      />

      {/* Page Header */}
      <div className="ihms-page-header">
        <div className="ihms-page-header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onBack && (
            <button
              type="button"
              className="ihms-back-arrow-btn"
              onClick={onBack}
              title="Go Back"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          )}

          <div className="ihms-header-icon-box settings-theme">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div>
            <h2 className="ihms-view-title" style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
              Settings & Configuration
            </h2>
            <p className="ihms-view-desc" style={{ margin: '0.15rem 0 0 0', color: '#64748b', fontSize: '0.84rem' }}>
              Manage your personal account, security credentials, preferences and department controls
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="settings-pill pill-green">
            <span className="active-pulse-dot"></span> System Online · IHMS v2.4
          </span>
        </div>
      </div>

      {/* Top Settings Navigation Tabs (Matching exact buttons in user screenshot) */}
      <div className="settings-nav-strip">
        <button
          type="button"
          className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="snav-icon">👤</span> Profile
        </button>
        <button
          type="button"
          className={`settings-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <span className="snav-icon">🔒</span> Security
        </button>
        <button
          type="button"
          className={`settings-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <span className="snav-icon">🔔</span> Notifications
        </button>
        <button
          type="button"
          className={`settings-nav-btn ${activeTab === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          <span className="snav-icon">🎨</span> Appearance
        </button>
        <button
          type="button"
          className={`settings-nav-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <span className="snav-icon">⚙️</span> System Preferences
        </button>
        <button
          type="button"
          className={`settings-nav-btn ${activeTab === 'department' ? 'active' : ''}`}
          onClick={() => setActiveTab('department')}
        >
          <span className="snav-icon">🏢</span> Department Settings
        </button>
        <button
          type="button"
          className={`settings-nav-btn ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          <span className="snav-icon">📋</span> System Configuration (15 CSV)
        </button>
      </div>

      {/* =========================================================================
          TAB 1: 👤 PROFILE PAGE
          ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="settings-tab-page">
          {/* Doctor Header Banner Card */}
          <div className="settings-banner-card">
            <div className="settings-banner-left">
              <div className="settings-banner-avatar-wrap">
                <img
                  src={avatarUrl}
                  alt={profile.fullName}
                  className="settings-banner-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/doctor_amit.jpg';
                  }}
                />
                <button
                  type="button"
                  className="settings-banner-camera"
                  title="Upload New Photo"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
              </div>

              <div className="settings-banner-meta">
                <h3>{profile.fullName}</h3>
                <p>{profile.designation} · {profile.department}</p>
                <div className="settings-tag-row">
                  <span className="settings-pill pill-blue">Lic: {profile.licenseNumber}</span>
                  <span className="settings-pill pill-green">✓ Active Consultant</span>
                  <span className="settings-pill pill-purple">{profile.experience} Experience</span>
                  <span className="settings-pill pill-amber">📍 {profile.room}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                type="button"
                className="settings-edit-pill-btn"
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.84rem' }}
                onClick={() => setIsEditingProfile(!isEditingProfile)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                {isEditingProfile ? 'Cancel Editing' : 'Edit Profile Details'}
              </button>
            </div>
          </div>

          {/* Profile Form Details */}
          <form onSubmit={handleSaveProfile} className="settings-grid-2col">
            {/* Left Card: Personal & Contact Information */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon user-soft-bg">👤</span>
                  <div>
                    <h3 className="sc-title">Personal & Contact Information</h3>
                    <p className="sc-subtitle">Communication channels and contact records</p>
                  </div>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label className="settings-form-label">Full Name</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="settings-form-input"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      required
                    />
                  ) : (
                    <div className="p-field-value">{profile.fullName}</div>
                  )}
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Official Email</label>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      className="settings-form-input"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      required
                    />
                  ) : (
                    <div className="p-field-value">{profile.email}</div>
                  )}
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Mobile Phone</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="settings-form-input"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  ) : (
                    <div className="p-field-value">{profile.phone}</div>
                  )}
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Emergency Line</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="settings-form-input"
                      value={profile.emergencyPhone}
                      onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                    />
                  ) : (
                    <div className="p-field-value">{profile.emergencyPhone}</div>
                  )}
                </div>

                <div className="settings-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="settings-form-label">Consultation Room / Location</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="settings-form-input"
                      value={profile.room}
                      onChange={(e) => setProfile({ ...profile, room: e.target.value })}
                    />
                  ) : (
                    <div className="p-field-value">{profile.room}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Card: Clinical & Medical Credentials */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon purple-soft-bg">🩺</span>
                  <div>
                    <h3 className="sc-title">Medical & Hospital Credentials</h3>
                    <p className="sc-subtitle">Council registration and clinical specializations</p>
                  </div>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label className="settings-form-label">Department</label>
                  {isEditingProfile ? (
                    <select
                      className="settings-form-input"
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Emergency & Trauma">Emergency & Trauma</option>
                      <option value="Neurology">Neurology</option>
                    </select>
                  ) : (
                    <div className="p-field-value">{profile.department}</div>
                  )}
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Specialization</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="settings-form-input"
                      value={profile.specialization}
                      onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                    />
                  ) : (
                    <div className="p-field-value">{profile.specialization}</div>
                  )}
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Medical License No</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="settings-form-input"
                      value={profile.licenseNumber}
                      onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                    />
                  ) : (
                    <div className="p-field-value">{profile.licenseNumber}</div>
                  )}
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Medical Council</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="settings-form-input"
                      value={profile.council}
                      onChange={(e) => setProfile({ ...profile, council: e.target.value })}
                    />
                  ) : (
                    <div className="p-field-value">{profile.council}</div>
                  )}
                </div>

                <div className="settings-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="settings-form-label">Qualifications</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="settings-form-input"
                      value={profile.qualifications}
                      onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })}
                    />
                  ) : (
                    <div className="p-field-value">{profile.qualifications}</div>
                  )}
                </div>

                <div className="settings-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="settings-form-label">OPD Consultation Hours</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="settings-form-input"
                      value={profile.timings}
                      onChange={(e) => setProfile({ ...profile, timings: e.target.value })}
                    />
                  ) : (
                    <div className="p-field-value">{profile.timings}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Card: Bio & Clinical Focus */}
            <div className="settings-card" style={{ gridColumn: '1 / -1' }}>
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon green-soft-bg">📝</span>
                  <div>
                    <h3 className="sc-title">Professional Bio & Practice Summary</h3>
                    <p className="sc-subtitle">Summary visible on internal hospital directory and referral notes</p>
                  </div>
                </div>
              </div>

              {isEditingProfile ? (
                <textarea
                  className="settings-form-input"
                  style={{ width: '100%', minHeight: 90, fontFamily: 'inherit', resize: 'vertical' }}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              ) : (
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {profile.bio}
                </p>
              )}

              {isEditingProfile && (
                <div className="settings-save-bar">
                  <button
                    type="button"
                    className="modal-btn-outline"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="ihms-btn-primary" style={{ padding: '0.5rem 1.4rem' }}>
                    Save Profile Changes
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 2: 🔒 SECURITY PAGE
          ========================================================================= */}
      {activeTab === 'security' && (
        <div className="settings-tab-page">
          <div className="settings-grid-2col">
            {/* Account Credentials Card */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon purple-soft-bg">🔐</span>
                  <div>
                    <h3 className="sc-title">Account Credentials</h3>
                    <p className="sc-subtitle">Manage your login username, password and security tokens</p>
                  </div>
                </div>
              </div>

              <div className="security-card-body">
                {/* Username */}
                <div className="security-item-row">
                  <div className="sec-label">
                    <div>Login Handle</div>
                    <small style={{ color: '#94a3b8' }}>Used for system authentication</small>
                  </div>
                  <div className="sec-value-block">
                    <span className="sec-text-bold">{security.username}</span>
                    <button
                      type="button"
                      className="sec-change-btn"
                      onClick={() => setActiveModal('change-username')}
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="security-item-row">
                  <div className="sec-label">
                    <div>Master Password</div>
                    <small style={{ color: '#94a3b8' }}>Last changed: 18 days ago</small>
                  </div>
                  <div className="sec-value-block">
                    <span className="sec-text-dots">{security.passwordMasked}</span>
                    <button
                      type="button"
                      className="sec-change-btn"
                      onClick={() => setActiveModal('change-password')}
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Password Strength Score */}
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    <span>Password Strength</span>
                    <span style={{ color: '#16a34a' }}>Strong (94%)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: '94%', height: '100%', background: '#16a34a' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Authentication Protections */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon user-soft-bg">🛡️</span>
                  <div>
                    <h3 className="sc-title">Authentication & Access Control</h3>
                    <p className="sc-subtitle">Extra security layers protecting clinical health data</p>
                  </div>
                </div>
              </div>

              <div className="security-card-body">
                {/* 2FA */}
                <div className="security-toggle-row">
                  <div className="sec-toggle-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div className="sec-toggle-info">
                    <div className="sec-toggle-title">Two-Factor Authentication (2FA)</div>
                    <div className="sec-toggle-sub">Require OTP via SMS or Authenticator App on every login</div>
                  </div>
                  <label className="ihms-switch">
                    <input
                      type="checkbox"
                      checked={security.twoFactor}
                      onChange={(e) => {
                        setSecurity({ ...security, twoFactor: e.target.checked });
                        showToast(`Two-Factor Authentication ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                      }}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {/* Login Notifications */}
                <div className="security-toggle-row">
                  <div className="sec-toggle-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>
                  <div className="sec-toggle-info">
                    <div className="sec-toggle-title">New Device Login Alerts</div>
                    <div className="sec-toggle-sub">Instant alert when your account is accessed from a new IP or browser</div>
                  </div>
                  <label className="ihms-switch">
                    <input
                      type="checkbox"
                      checked={security.loginNotifications}
                      onChange={(e) => {
                        setSecurity({ ...security, loginNotifications: e.target.checked });
                        showToast(`Login notifications ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                      }}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {/* Biometric Auth */}
                <div className="security-toggle-row">
                  <div className="sec-toggle-icon">
                    <span style={{ fontSize: '1rem' }}>👆</span>
                  </div>
                  <div className="sec-toggle-info">
                    <div className="sec-toggle-title">Biometric Terminal Authentication</div>
                    <div className="sec-toggle-sub">Allow fingerprint or facial scan on supported hospital terminals</div>
                  </div>
                  <label className="ihms-switch">
                    <input
                      type="checkbox"
                      checked={security.biometricAuth}
                      onChange={(e) => {
                        setSecurity({ ...security, biometricAuth: e.target.checked });
                        showToast(`Biometric authentication ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                      }}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Active Sessions List */}
            <div className="settings-card" style={{ gridColumn: '1 / -1' }}>
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon amber-soft-bg">💻</span>
                  <div>
                    <h3 className="sc-title">Active Devices & Sessions</h3>
                    <p className="sc-subtitle">Logged in terminals and clinical tablets connected to your profile</p>
                  </div>
                </div>

                {sessions.length > 1 && (
                  <button
                    type="button"
                    className="modal-btn-outline"
                    style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2', fontSize: '0.78rem' }}
                    onClick={handleTerminateOtherSessions}
                  >
                    Terminate Other Sessions
                  </button>
                )}
              </div>

              <div>
                {sessions.map((s) => (
                  <div key={s.id} className="device-session-item">
                    <div className="device-left">
                      <div className="device-icon-box">{s.icon}</div>
                      <div>
                        <div className="device-name">{s.device}</div>
                        <div className="device-meta">
                          {s.location} · IP: {s.ip} · {s.time}
                        </div>
                      </div>
                    </div>

                    <div>
                      {s.isCurrent ? (
                        <span className="device-badge-active">
                          <span className="active-pulse-dot"></span> This Device
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="sec-change-btn"
                          style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fff' }}
                          onClick={() => {
                            setSessions((prev) => prev.filter((item) => item.id !== s.id));
                            showToast(`Logged out session from ${s.device}`);
                          }}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: 🔔 NOTIFICATIONS PAGE
          ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="settings-tab-page">
          <div className="settings-grid-2col">
            {/* Delivery Channels Card */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon amber-soft-bg">🔔</span>
                  <div>
                    <h3 className="sc-title">Notification Channels</h3>
                    <p className="sc-subtitle">Choose how and where you want to receive updates</p>
                  </div>
                </div>
              </div>

              <div className="notifications-card-body">
                <div className="notif-toggle-row">
                  <div className="notif-item-left">
                    <span className="notif-row-icon">✉️</span>
                    <div>
                      <div className="notif-row-label">Email Notifications</div>
                      <small style={{ color: '#64748b' }}>Daily briefings, critical escalation digests</small>
                    </div>
                  </div>
                  <label className="ihms-switch">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="notif-toggle-row">
                  <div className="notif-item-left">
                    <span className="notif-row-icon">💬</span>
                    <div>
                      <div className="notif-row-label">SMS Alerts</div>
                      <small style={{ color: '#64748b' }}>Emergency recall alerts and urgent OT requests</small>
                    </div>
                  </div>
                  <label className="ihms-switch">
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="notif-toggle-row">
                  <div className="notif-item-left">
                    <span className="notif-row-icon">🖥️</span>
                    <div>
                      <div className="notif-row-label">Desktop & Audio Alerts</div>
                      <small style={{ color: '#64748b' }}>Chime sound for urgent new referrals in clinic</small>
                    </div>
                  </div>
                  <label className="ihms-switch">
                    <input
                      type="checkbox"
                      checked={notifications.systemAlerts}
                      onChange={(e) => setNotifications({ ...notifications, systemAlerts: e.target.checked })}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="notif-toggle-row">
                  <div className="notif-item-left">
                    <span className="notif-row-icon">📱</span>
                    <div>
                      <div className="notif-row-label">WhatsApp Clinical Alerts</div>
                      <small style={{ color: '#64748b' }}>Patient appointment confirmations & duty shifts</small>
                    </div>
                  </div>
                  <label className="ihms-switch">
                    <input
                      type="checkbox"
                      checked={notifications.whatsappAlerts}
                      onChange={(e) => setNotifications({ ...notifications, whatsappAlerts: e.target.checked })}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Clinical Alert Preferences */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon coral-soft-bg">🚨</span>
                  <div>
                    <h3 className="sc-title">Clinical Event Triggers</h3>
                    <p className="sc-subtitle">Configure medical threshold alerts for assigned patients</p>
                  </div>
                </div>
              </div>

              <div className="notifications-card-body">
                <div className="notif-toggle-row">
                  <div className="notif-item-left">
                    <span className="notif-row-icon">❤️</span>
                    <div>
                      <div className="notif-row-label">Critical Vitals Warning</div>
                      <small style={{ color: '#64748b' }}>Trigger if SpO2 &lt; 90% or HR &gt; 120 bpm</small>
                    </div>
                  </div>
                  <label className="ihms-switch">
                    <input
                      type="checkbox"
                      checked={notifications.criticalVitals}
                      onChange={(e) => setNotifications({ ...notifications, criticalVitals: e.target.checked })}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="notif-toggle-row">
                  <div className="notif-item-left">
                    <span className="notif-row-icon">⚡</span>
                    <div>
                      <div className="notif-row-label">STAT Emergency Calls</div>
                      <small style={{ color: '#64748b' }}>Emergency code alerts from Casualty and CCU</small>
                    </div>
                  </div>
                  <label className="ihms-switch">
                    <input
                      type="checkbox"
                      checked={notifications.statEmergency}
                      onChange={(e) => setNotifications({ ...notifications, statEmergency: e.target.checked })}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="notif-toggle-row">
                  <div className="notif-item-left">
                    <span className="notif-row-icon">🧪</span>
                    <div>
                      <div className="notif-row-label">Lab Reports Verified</div>
                      <small style={{ color: '#64748b' }}>Immediate alert when pathology results are ready</small>
                    </div>
                  </div>
                  <label className="ihms-switch">
                    <input
                      type="checkbox"
                      checked={notifications.labResultsReady}
                      onChange={(e) => setNotifications({ ...notifications, labResultsReady: e.target.checked })}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="notif-toggle-row">
                  <div className="notif-item-left">
                    <span className="notif-row-icon">💊</span>
                    <div>
                      <div className="notif-row-label">Drug Interaction Warnings</div>
                      <small style={{ color: '#64748b' }}>Alert when pharmacist flags medication conflict</small>
                    </div>
                  </div>
                  <label className="ihms-switch">
                    <input
                      type="checkbox"
                      checked={notifications.pharmacyWarnings}
                      onChange={(e) => setNotifications({ ...notifications, pharmacyWarnings: e.target.checked })}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Quiet Hours & Sound Testing */}
            <div className="settings-card" style={{ gridColumn: '1 / -1' }}>
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon green-soft-bg">🌙</span>
                  <div>
                    <h3 className="sc-title">Quiet Hours & Sound Tone Configuration</h3>
                    <p className="sc-subtitle">Control alert volume, sound preview and off-duty quiet hours</p>
                  </div>
                </div>
              </div>

              <div className="settings-form-grid" style={{ alignItems: 'center' }}>
                <div className="settings-form-group">
                  <label className="settings-form-label">Alert Sound Tone</label>
                  <select
                    className="settings-form-input"
                    value={notifications.soundChime}
                    onChange={(e) => setNotifications({ ...notifications, soundChime: e.target.value })}
                  >
                    <option value="Medical Bell">Medical Bell (Default)</option>
                    <option value="Hospital Pulse">Hospital Pulse</option>
                    <option value="Soft Chime">Soft Chime</option>
                    <option value="Gentle Ping">Gentle Ping</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Preview Sound</label>
                  <button
                    type="button"
                    className="modal-btn-outline"
                    style={{ padding: '0.52rem 1rem' }}
                    onClick={() => showToast(`Playing chime preview: ${notifications.soundChime} 🔔`)}
                  >
                    🔊 Play Audio Preview
                  </button>
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Quiet Hours (DND)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <input
                      type="time"
                      className="settings-form-input"
                      value={notifications.dndStart}
                      onChange={(e) => setNotifications({ ...notifications, dndStart: e.target.value })}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      className="settings-form-input"
                      value={notifications.dndEnd}
                      onChange={(e) => setNotifications({ ...notifications, dndEnd: e.target.value })}
                    />
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">DND Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: 38 }}>
                    <label className="ihms-switch">
                      <input
                        type="checkbox"
                        checked={notifications.dndEnabled}
                        onChange={(e) => setNotifications({ ...notifications, dndEnabled: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: notifications.dndEnabled ? '#16a34a' : '#64748b' }}>
                      {notifications.dndEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="settings-save-bar">
                <button
                  type="button"
                  className="ihms-btn-primary"
                  onClick={() => showToast('Notification preferences successfully saved!')}
                >
                  Save Notification Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: 🎨 APPEARANCE PAGE
          ========================================================================= */}
      {activeTab === 'appearance' && (
        <div className="settings-tab-page">
          <div className="settings-grid-2col">
            {/* Theme Mode Selector Card */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon coral-soft-bg">🎨</span>
                  <div>
                    <h3 className="sc-title">Interface Theme</h3>
                    <p className="sc-subtitle">Select your preferred viewing mode</p>
                  </div>
                </div>
              </div>

              <div className="appearance-card-body">
                <div className="theme-mode-options">
                  {/* Light Mode */}
                  <div
                    className={`theme-box-option ${themeMode === 'light' ? 'active' : ''}`}
                    onClick={() => {
                      setThemeMode('light');
                      showToast('Switched to Light Theme ☀️');
                    }}
                  >
                    {themeMode === 'light' && <div className="theme-check-dot">✓</div>}
                    <div className="theme-icon sun">☀️</div>
                    <div className="theme-name">Light Theme</div>
                    <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Crisp medical clinical</small>
                  </div>

                  {/* Dark Mode */}
                  <div
                    className={`theme-box-option ${themeMode === 'dark' ? 'active' : ''}`}
                    onClick={() => {
                      setThemeMode('dark');
                      showToast('Switched to Dark Theme 🌙 (Night Shift)');
                    }}
                  >
                    {themeMode === 'dark' && <div className="theme-check-dot">✓</div>}
                    <div className="theme-icon moon">🌙</div>
                    <div className="theme-name">Dark Theme</div>
                    <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Low-glare night rounds</small>
                  </div>

                  {/* System Mode */}
                  <div
                    className={`theme-box-option ${themeMode === 'system' ? 'active' : ''}`}
                    onClick={() => {
                      setThemeMode('system');
                      showToast('Theme set to System Default 🖥️');
                    }}
                  >
                    {themeMode === 'system' && <div className="theme-check-dot">✓</div>}
                    <div className="theme-icon monitor">🖥️</div>
                    <div className="theme-name">Auto / System</div>
                    <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Sync with OS theme</small>
                  </div>
                </div>

                {/* Primary Accent Color Picker */}
                <div style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <label className="settings-form-label">Brand & Accent Color</label>
                  <div className="color-swatch-row">
                    {[
                      { hex: '#0066ff', name: 'Hospital Blue' },
                      { hex: '#0d9488', name: 'Clinical Teal' },
                      { hex: '#10b981', name: 'Emerald Care' },
                      { hex: '#4f46e5', name: 'Royal Indigo' },
                      { hex: '#7c3aed', name: 'Amethyst Purple' },
                      { hex: '#e11d48', name: 'Crimson Emergency' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        className={`color-swatch-btn ${accentColor === c.hex ? 'selected' : ''}`}
                        style={{ background: c.hex }}
                        title={c.name}
                        onClick={() => {
                          setAccentColor(c.hex);
                          showToast(`Accent color updated: ${c.name}`);
                        }}
                      >
                        {accentColor === c.hex ? '✓' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Typography & Density Card */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon purple-soft-bg">📐</span>
                  <div>
                    <h3 className="sc-title">Display Sizing & Density</h3>
                    <p className="sc-subtitle">Adjust font scaling and component layout density</p>
                  </div>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label className="settings-form-label">Font Scaling</label>
                  <select
                    className="settings-form-input"
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(e.target.value);
                      showToast(`Font scaling set to ${e.target.value}`);
                    }}
                  >
                    <option value="small">Compact (13px)</option>
                    <option value="medium">Standard (15px - Recommended)</option>
                    <option value="large">Enlarged (17px - High Readability)</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Layout Density</label>
                  <select
                    className="settings-form-input"
                    value={density}
                    onChange={(e) => {
                      setDensity(e.target.value);
                      showToast(`Layout density set to ${e.target.value}`);
                    }}
                  >
                    <option value="comfortable">Comfortable Spacing</option>
                    <option value="compact">Compact / Data Dense</option>
                  </select>
                </div>

                <div className="settings-form-group" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', borderTop: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>High Contrast Mode</div>
                      <small style={{ color: '#64748b' }}>Enhanced borders and contrast for low-vision environments</small>
                    </div>
                    <label className="ihms-switch">
                      <input
                        type="checkbox"
                        checked={highContrast}
                        onChange={(e) => {
                          setHighContrast(e.target.checked);
                          showToast(`High contrast mode ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                        }}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Language & Regional Localization */}
            <div className="settings-card" style={{ gridColumn: '1 / -1' }}>
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon user-soft-bg">🌐</span>
                  <div>
                    <h3 className="sc-title">Language & Regional Preferences</h3>
                    <p className="sc-subtitle">Configure language, time zone, date and numerical formats</p>
                  </div>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label className="settings-form-label">System Language</label>
                  <select
                    className="settings-form-input"
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      showToast(`Language set to ${e.target.value}`);
                    }}
                  >
                    <option value="English">English (Default)</option>
                    <option value="Marathi">मराठी (Marathi)</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Date Display Format</label>
                  <select
                    className="settings-form-input"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (14/10/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (10/14/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-10-14)</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Time Format</label>
                  <select
                    className="settings-form-input"
                    value={timeFormat}
                    onChange={(e) => setTimeFormat(e.target.value)}
                  >
                    <option value="12-hour">12-Hour (09:30 AM)</option>
                    <option value="24-hour">24-Hour Railway Time (09:30)</option>
                  </select>
                </div>
              </div>

              <div className="settings-save-bar">
                <button
                  type="button"
                  className="ihms-btn-primary"
                  onClick={() => showToast('Appearance & localization settings saved!')}
                >
                  Apply & Save Appearance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: ⚙️ SYSTEM PREFERENCES PAGE
          ========================================================================= */}
      {activeTab === 'preferences' && (
        <div className="settings-tab-page">
          <div className="settings-grid-2col">
            {/* General System Behavior */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon green-soft-bg">⚙️</span>
                  <div>
                    <h3 className="sc-title">Session & System Behavior</h3>
                    <p className="sc-subtitle">Configure workstation activity rules and default landing</p>
                  </div>
                </div>
              </div>

              <div className="system-prefs-body">
                {/* Auto Logout */}
                <div className="spref-item-row">
                  <div className="spref-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="spref-text-block">
                    <div className="spref-title">Auto Logout Timeout</div>
                    <div className="spref-sub">Automatically sign out session upon inactivity</div>
                  </div>
                  <div className="spref-select-wrapper">
                    <select
                      value={systemPrefs.autoLogout}
                      onChange={(e) => setSystemPrefs({ ...systemPrefs, autoLogout: e.target.value })}
                      className="spref-native-select"
                    >
                      <option value="15 Minutes">15 Minutes</option>
                      <option value="30 Minutes">30 Minutes (Recommended)</option>
                      <option value="1 Hour">1 Hour</option>
                      <option value="Never">Never (While in OPD)</option>
                    </select>
                    <span className="spref-chev">⌵</span>
                  </div>
                </div>

                {/* Default Landing Page */}
                <div className="spref-item-row">
                  <div className="spref-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </div>
                  <div className="spref-text-block">
                    <div className="spref-title">Default Landing Page</div>
                    <div className="spref-sub">Screen shown immediately upon login</div>
                  </div>
                  <div className="spref-select-wrapper">
                    <span className="spref-page-icon">🏠</span>
                    <select
                      value={systemPrefs.defaultPage}
                      onChange={(e) => setSystemPrefs({ ...systemPrefs, defaultPage: e.target.value })}
                      className="spref-native-select"
                    >
                      <option value="Dashboard">Dashboard</option>
                      <option value="Patients">Patients Directory</option>
                      <option value="Appointments">Appointments Schedule</option>
                      <option value="AI Analysis">AI Document Analysis</option>
                      <option value="Laboratory">Laboratory & Tests</option>
                      <option value="Pharmacy">Pharmacy & Drugs</option>
                      <option value="Reports">Reports & Analytics</option>
                    </select>
                    <span className="spref-chev">⌵</span>
                  </div>
                </div>

                {/* Sound Alerts */}
                <div className="spref-item-row no-border">
                  <div className="spref-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  </div>
                  <div className="spref-text-block">
                    <div className="spref-title">Sound Chime Notifications</div>
                    <div className="spref-sub">Play audio chime for STAT alerts and new consultations</div>
                  </div>
                  <label className="ihms-switch">
                    <input
                      type="checkbox"
                      checked={systemPrefs.soundNotifications}
                      onChange={(e) => setSystemPrefs({ ...systemPrefs, soundNotifications: e.target.checked })}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Clinical Workflow Preferences */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon purple-soft-bg">🩺</span>
                  <div>
                    <h3 className="sc-title">Clinical Workflow & Documentation</h3>
                    <p className="sc-subtitle">Optimize clinical consultation notes and ordering tools</p>
                  </div>
                </div>
              </div>

              <div className="system-prefs-body">
                {/* Auto-save Consultation Notes */}
                <div className="spref-item-row">
                  <div className="spref-icon">
                    <span>💾</span>
                  </div>
                  <div className="spref-text-block">
                    <div className="spref-title">Auto-Save Clinical Notes</div>
                    <div className="spref-sub">Background save drafts during patient consultations</div>
                  </div>
                  <div className="spref-select-wrapper">
                    <select
                      value={systemPrefs.noteAutoSaveInterval}
                      onChange={(e) => setSystemPrefs({ ...systemPrefs, noteAutoSaveInterval: e.target.value })}
                      className="spref-native-select"
                    >
                      <option value="15 Seconds">Every 15s</option>
                      <option value="30 Seconds">Every 30s</option>
                      <option value="60 Seconds">Every 60s</option>
                    </select>
                    <span className="spref-chev">⌵</span>
                  </div>
                </div>

                {/* Default Medication Unit */}
                <div className="spref-item-row">
                  <div className="spref-icon">
                    <span>💊</span>
                  </div>
                  <div className="spref-text-block">
                    <div className="spref-title">Default Medication Dosage</div>
                    <div className="spref-sub">Preselected unit in prescription builder</div>
                  </div>
                  <div className="spref-select-wrapper">
                    <select
                      value={systemPrefs.defaultDosageUnit}
                      onChange={(e) => setSystemPrefs({ ...systemPrefs, defaultDosageUnit: e.target.value })}
                      className="spref-native-select"
                    >
                      <option value="mg">Milligrams (mg)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="mcg">Micrograms (mcg)</option>
                      <option value="tabs">Tablets (tabs)</option>
                    </select>
                    <span className="spref-chev">⌵</span>
                  </div>
                </div>

                {/* Queue Sorting */}
                <div className="spref-item-row no-border">
                  <div className="spref-icon">
                    <span>👥</span>
                  </div>
                  <div className="spref-text-block">
                    <div className="spref-title">Patient Queue Order</div>
                    <div className="spref-sub">Initial triage sorting order on OPD screen</div>
                  </div>
                  <div className="spref-select-wrapper">
                    <select
                      value={systemPrefs.defaultQueueSort}
                      onChange={(e) => setSystemPrefs({ ...systemPrefs, defaultQueueSort: e.target.value })}
                      className="spref-native-select"
                    >
                      <option value="Critical First">Critical / Triage First</option>
                      <option value="Token Order">Token Number Order</option>
                    </select>
                    <span className="spref-chev">⌵</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Diagnostics & Data Storage Card */}
            <div className="settings-card" style={{ gridColumn: '1 / -1' }}>
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon user-soft-bg">🤖</span>
                  <div>
                    <h3 className="sc-title">AI Diagnostics & Local Cache</h3>
                    <p className="sc-subtitle">AI co-pilot assistant settings and local workstation offline caching</p>
                  </div>
                </div>
              </div>

              <div className="settings-grid-3col">
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>AI Clinical Diagnosis</span>
                    <label className="ihms-switch">
                      <input
                        type="checkbox"
                        checked={systemPrefs.aiDiagnosticsEnabled}
                        onChange={(e) => setSystemPrefs({ ...systemPrefs, aiDiagnosticsEnabled: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                    Suggest differential diagnoses and ICD-11 codes based on lab results and vitals.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Drug Conflict Warning</span>
                    <label className="ihms-switch">
                      <input
                        type="checkbox"
                        checked={systemPrefs.drugInteractionWarning}
                        onChange={(e) => setSystemPrefs({ ...systemPrefs, drugInteractionWarning: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                    Real-time cross check of drug-to-drug contraindications during prescription writing.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Local Workstation Cache</span>
                    <button
                      type="button"
                      className="sec-change-btn"
                      style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      onClick={() => showToast('Local temporary cache cleared successfully (14.8 MB freed)')}
                    >
                      Clear 14.8 MB
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                    Cached patient histories and offline templates for fast instantaneous rendering.
                  </p>
                </div>
              </div>

              <div className="settings-save-bar">
                <button
                  type="button"
                  className="ihms-btn-primary"
                  onClick={() => showToast('System preferences saved successfully!')}
                >
                  Save System Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: 🏢 DEPARTMENT SETTINGS PAGE
          ========================================================================= */}
      {activeTab === 'department' && (
        <div className="settings-tab-page">
          {/* Department Overview Banner */}
          <div className="settings-banner-card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#bbf7d0' }}>
            <div className="settings-banner-left">
              <div style={{ width: 68, height: 68, borderRadius: 12, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                🏢
              </div>
              <div className="settings-banner-meta">
                <h3>{department.name}</h3>
                <p>Code: <strong>{department.code}</strong> · Head of Department: <strong>{department.hod}</strong></p>
                <div className="settings-tag-row">
                  <span className="settings-pill pill-green">📍 {department.location}</span>
                  <span className="settings-pill pill-blue">📞 {department.extension}</span>
                  <span className="settings-pill pill-amber">🚨 {department.emergencyHotline}</span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                className="settings-edit-pill-btn"
                style={{ padding: '0.55rem 1.15rem' }}
                onClick={() => setActiveModal('edit-dept')}
              >
                ✏️ Edit Department Details
              </button>
            </div>
          </div>

          {/* Department KPI Metric Cards */}
          <div className="dept-kpi-grid">
            <div className="dept-kpi-box">
              <div className="dept-kpi-val" style={{ color: '#0066ff' }}>{department.totalBeds}</div>
              <div className="dept-kpi-lbl">Total Allocated Beds</div>
            </div>
            <div className="dept-kpi-box">
              <div className="dept-kpi-val" style={{ color: '#e11d48' }}>{department.occupiedBeds}</div>
              <div className="dept-kpi-lbl">Occupied (84%)</div>
            </div>
            <div className="dept-kpi-box">
              <div className="dept-kpi-val" style={{ color: '#16a34a' }}>{department.availableBeds}</div>
              <div className="dept-kpi-lbl">Available Beds</div>
            </div>
            <div className="dept-kpi-box">
              <div className="dept-kpi-val" style={{ color: '#7c3aed' }}>{department.hduBeds}</div>
              <div className="dept-kpi-lbl">HDU / Semi-ICU</div>
            </div>
            <div className="dept-kpi-box">
              <div className="dept-kpi-val" style={{ color: '#0284c7' }}>{department.activeOpdRooms}</div>
              <div className="dept-kpi-lbl">Active OPD Rooms</div>
            </div>
            <div className="dept-kpi-box">
              <div className="dept-kpi-val" style={{ color: '#475569' }}>{department.seniorDoctors + department.residentDoctors}</div>
              <div className="dept-kpi-lbl">On-Duty Doctors</div>
            </div>
          </div>

          <div className="settings-grid-2col">
            {/* Bed & Ward Capacity Management */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon coral-soft-bg">🛏️</span>
                  <div>
                    <h3 className="sc-title">Ward Capacity & Bed Utilization</h3>
                    <p className="sc-subtitle">Inpatient bed allocation and emergency surge capacity</p>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  <span>Ward Bed Utilization</span>
                  <span>{department.occupiedBeds} of {department.totalBeds} Beds (84%)</span>
                </div>

                <div className="dept-bar-track">
                  <div className="dept-bar-fill" style={{ width: '84%' }}></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
                  <div className="p-field-value" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Regular Ward Beds</span>
                    <strong>39 Beds</strong>
                  </div>
                  <div className="p-field-value" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>HDU / Monitored</span>
                    <strong>{department.hduBeds} Beds</strong>
                  </div>
                  <div className="p-field-value" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Emergency Surge Cots</span>
                    <strong>+{department.surgeCapacity} Extra</strong>
                  </div>
                  <div className="p-field-value" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Avg Stay Duration</span>
                    <strong>3.4 Days</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* OPD Consultation & Token Rules */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon user-soft-bg">🎫</span>
                  <div>
                    <h3 className="sc-title">OPD Tokens & Consultation Slots</h3>
                    <p className="sc-subtitle">Manage daily patient intake limits and waiting hall queue screen</p>
                  </div>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label className="settings-form-label">Active OPD Rooms</label>
                  <input
                    type="number"
                    className="settings-form-input"
                    value={department.activeOpdRooms}
                    onChange={(e) => setDepartment({ ...department, activeOpdRooms: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Max Daily Tokens / Doctor</label>
                  <input
                    type="number"
                    className="settings-form-input"
                    value={department.maxDailyTokens}
                    onChange={(e) => setDepartment({ ...department, maxDailyTokens: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Avg Slot Duration</label>
                  <select
                    className="settings-form-input"
                    value={department.consultationDuration}
                    onChange={(e) => setDepartment({ ...department, consultationDuration: e.target.value })}
                  >
                    <option value="10 Minutes">10 Minutes</option>
                    <option value="15 Minutes">15 Minutes (Standard)</option>
                    <option value="20 Minutes">20 Minutes</option>
                    <option value="30 Minutes">30 Minutes</option>
                  </select>
                </div>

                <div className="settings-form-group">
                  <label className="settings-form-label">Queue Display Sync</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', height: 38 }}>
                    <label className="ihms-switch">
                      <input
                        type="checkbox"
                        checked={department.tokenDisplayEnabled}
                        onChange={(e) => setDepartment({ ...department, tokenDisplayEnabled: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: department.tokenDisplayEnabled ? '#16a34a' : '#64748b' }}>
                      {department.tokenDisplayEnabled ? 'Hall Monitor Live' : 'Screen Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Roster & Protocols */}
            <div className="settings-card" style={{ gridColumn: '1 / -1' }}>
              <div className="settings-card-header">
                <div className="sc-header-left">
                  <span className="sc-header-icon green-soft-bg">📋</span>
                  <div>
                    <h3 className="sc-title">Staffing Roster & Clinical Protocols</h3>
                    <p className="sc-subtitle">Shift schedule, doctor-to-nurse ratio and statutory discharge policies</p>
                  </div>
                </div>
              </div>

              <div className="settings-grid-3col">
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                    👨‍⚕️ Clinical Roster
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div>• Senior Consultants: <strong>{department.seniorDoctors} Doctors</strong></div>
                    <div>• Resident Medical Officers: <strong>{department.residentDoctors} RMOs</strong></div>
                    <div>• Registered Nurses: <strong>{department.nursingStaff} Nurses</strong></div>
                    <div>• Orderlies & Ward Staff: <strong>{department.supportStaff} Staff</strong></div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                    ⏰ Shift Timings
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div>• Morning OPD & Rounds: <strong>08:00 - 16:00</strong></div>
                    <div>• Evening Ward Shift: <strong>16:00 - 00:00</strong></div>
                    <div>• Night Emergency Duty: <strong>00:00 - 08:00</strong></div>
                    <div>• Handover Period: <strong>30 mins overlap</strong></div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                    ⚖️ Department Protocols
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div>• STAT Referral SLA: <strong>{department.referralSlaStat}</strong></div>
                    <div>• Routine Referral SLA: <strong>{department.referralSlaRoutine}</strong></div>
                    <div>• Senior Signoff for Discharge: <strong>Mandatory</strong></div>
                    <div>• Code Yellow / Red: <strong>Direct CCU Access</strong></div>
                  </div>
                </div>
              </div>

              <div className="settings-save-bar">
                <button
                  type="button"
                  className="ihms-btn-primary"
                  onClick={() => showToast('Department settings successfully updated and saved!')}
                >
                  Save Department Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: 📋 SYSTEM CONFIGURATION REGISTRY (15 CSV SETTINGS)
          ========================================================================= */}
      {activeTab === 'config' && (
        <div className="settings-tab-page">
          {/* Header Card */}
          <div className="settings-banner-card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderColor: '#bfdbfe' }}>
            <div className="settings-banner-left">
              <div style={{ width: 68, height: 68, borderRadius: 12, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                📋
              </div>
              <div className="settings-banner-meta">
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                  System Master Configuration Registry
                </h3>
                <p style={{ margin: '0.25rem 0', color: '#475569', fontSize: '0.85rem' }}>
                  Directly synced from CSV configuration · Real-time operational security & safety policies
                </p>
                <div className="settings-tag-row">
                  <span className="settings-pill pill-blue">📊 15 Active Parameters</span>
                  <span className="settings-pill pill-green">🔒 HIPAA & ISO 27001 Compliant</span>
                  <span className="settings-pill pill-purple">⚡ Real-time Audit Enabled</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className="clinical-export-csv-btn"
                onClick={handleExportSettingsCsv}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export Settings CSV</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="dept-kpi-grid">
            <div className="dept-kpi-box">
              <div className="dept-kpi-val" style={{ color: '#0066ff' }}>15</div>
              <div className="dept-kpi-lbl">Total Configuration Keys</div>
            </div>
            <div className="dept-kpi-box">
              <div className="dept-kpi-val" style={{ color: '#16a34a' }}>14</div>
              <div className="dept-kpi-lbl">Enabled / Active</div>
            </div>
            <div className="dept-kpi-box">
              <div className="dept-kpi-val" style={{ color: '#d97706' }}>1</div>
              <div className="dept-kpi-lbl">Disabled (SMS Alerts)</div>
            </div>
            <div className="dept-kpi-box">
              <div className="dept-kpi-val" style={{ color: '#7c3aed' }}>7</div>
              <div className="dept-kpi-lbl">Functional Categories</div>
            </div>
            <div className="dept-kpi-box">
              <div className="dept-kpi-val" style={{ color: '#0284c7' }}>10 GB</div>
              <div className="dept-kpi-lbl">Storage Limit</div>
            </div>
            <div className="dept-kpi-box">
              <div className="dept-kpi-val" style={{ color: '#dc2626' }}>30 min</div>
              <div className="dept-kpi-lbl">Auto Logout Timeout</div>
            </div>
          </div>

          {/* Table Card */}
          <div className="settings-card" style={{ gridColumn: '1 / -1', marginTop: '1rem', overflow: 'hidden' }}>
            <div className="settings-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div className="sc-header-left">
                <span className="sc-header-icon user-soft-bg">⚙️</span>
                <div>
                  <h3 className="sc-title">Configuration Parameters Table</h3>
                  <p className="sc-subtitle">All 15 parameters loaded from setting dataset</p>
                </div>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search setting ID or name..."
                  value={configSearch}
                  onChange={(e) => setConfigSearch(e.target.value)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    minWidth: 220,
                  }}
                />
                <select
                  value={configCategory}
                  onChange={(e) => setConfigCategory(e.target.value)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    background: '#fff',
                  }}
                >
                  <option value="All">All Categories (7)</option>
                  <option value="Security">Security (4)</option>
                  <option value="Notifications">Notifications (4)</option>
                  <option value="System Preferences">System Preferences (1)</option>
                  <option value="Appearance">Appearance (2)</option>
                  <option value="AI Analysis">AI Analysis (2)</option>
                  <option value="Clinical Safety">Clinical Safety (1)</option>
                  <option value="Storage">Storage (1)</option>
                </select>
                {(configSearch || configCategory !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfigSearch('');
                      setConfigCategory('All');
                    }}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '0.85rem 1rem' }}>SETTING ID</th>
                    <th style={{ padding: '0.85rem 1rem' }}>SETTING NAME</th>
                    <th style={{ padding: '0.85rem 1rem' }}>CATEGORY</th>
                    <th style={{ padding: '0.85rem 1rem' }}>CURRENT VALUE</th>
                    <th style={{ padding: '0.85rem 1rem' }}>STATUS</th>
                    <th style={{ padding: '0.85rem 1rem' }}>LAST UPDATED</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSettings.map((s, idx) => {
                    const isEven = idx % 2 === 0;
                    const catColors = {
                      'Security': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                      'Notifications': { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
                      'System Preferences': { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
                      'Appearance': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
                      'AI Analysis': { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' },
                      'Clinical Safety': { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
                      'Storage': { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc' },
                    };
                    const badge = catColors[s.category] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };

                    return (
                      <tr
                        key={s.setting_id}
                        style={{
                          background: isEven ? '#ffffff' : '#fcfcfd',
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontWeight: 800, color: '#0066ff' }}>
                          {s.setting_id}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                          {s.setting_name}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              borderRadius: '12px',
                              padding: '0.2rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-block',
                            }}
                          >
                            {s.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            background: '#f1f5f9',
                            borderRadius: '6px',
                            fontFamily: s.setting_value.length > 10 ? 'inherit' : 'monospace',
                          }}>
                            {s.setting_value}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              background: s.status === 'Enabled' ? '#dcfce7' : '#fee2e2',
                              color: s.status === 'Enabled' ? '#15803d' : '#b91c1c',
                              borderRadius: '12px',
                              padding: '0.2rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.status === 'Enabled' ? '#16a34a' : '#dc2626' }}></span>
                            {s.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>
                          {s.updated_at}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleSetting(s.setting_id)}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '0.3rem 0.65rem',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              color: '#334155',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            Toggle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
              <span>Showing <strong>{filteredSettings.length}</strong> of <strong>{settingsData.length}</strong> parameters</span>
              <span>Last synchronized from CSV: <strong>16-10-2026 10:00</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: Change Username, Change Password, Edit Department
          ========================================================================= */}

      {/* Pop-Up Modal: Change Username */}
      {activeModal === 'change-username' && (
        <div className="ihms-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="ihms-modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-profile" style={{ padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>✕</button>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>Change Account Username</div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                New Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="p-field-input"
                style={{ width: '100%' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                This handle is used to log in and sign internal clinical orders.
              </p>
            </div>
            <div className="modal-footer-actions">
              <button type="button" className="modal-btn-outline" onClick={() => setActiveModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn-solid"
                onClick={() => {
                  setSecurity({ ...security, username: newUsername });
                  setActiveModal(null);
                  showToast('Username successfully updated!');
                }}
              >
                Save Username
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-Up Modal: Change Password */}
      {activeModal === 'change-password' && (
        <div className="ihms-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="ihms-modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-profile" style={{ padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>✕</button>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>Update Security Password</div>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="p-field-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                  className="p-field-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="p-field-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div className="modal-footer-actions">
              <button type="button" className="modal-btn-outline" onClick={() => setActiveModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn-solid"
                onClick={() => {
                  if (!passwordForm.next) {
                    alert('Please enter a new password.');
                    return;
                  }
                  if (passwordForm.next !== passwordForm.confirm) {
                    alert('Passwords do not match.');
                    return;
                  }
                  setActiveModal(null);
                  showToast('Security password updated successfully!');
                }}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-Up Modal: Edit Department Details */}
      {activeModal === 'edit-dept' && (
        <div className="ihms-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="ihms-modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-profile" style={{ padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>✕</button>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>Edit Department Information</div>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  Department Name
                </label>
                <input
                  type="text"
                  value={department.name}
                  onChange={(e) => setDepartment({ ...department, name: e.target.value })}
                  className="p-field-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    Department Code
                  </label>
                  <input
                    type="text"
                    value={department.code}
                    onChange={(e) => setDepartment({ ...department, code: e.target.value })}
                    className="p-field-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    Internal Ext / Phone
                  </label>
                  <input
                    type="text"
                    value={department.extension}
                    onChange={(e) => setDepartment({ ...department, extension: e.target.value })}
                    className="p-field-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  Head of Department (HOD)
                </label>
                <input
                  type="text"
                  value={department.hod}
                  onChange={(e) => setDepartment({ ...department, hod: e.target.value })}
                  className="p-field-input"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  Floor / Wing Location
                </label>
                <input
                  type="text"
                  value={department.location}
                  onChange={(e) => setDepartment({ ...department, location: e.target.value })}
                  className="p-field-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div className="modal-footer-actions">
              <button type="button" className="modal-btn-outline" onClick={() => setActiveModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn-solid"
                onClick={() => {
                  setActiveModal(null);
                  showToast('Department details updated!');
                }}
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
