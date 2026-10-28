import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewDashboard from './components/OverviewDashboard';
import PatientOverview from './components/PatientOverview';
import AIDocumentAnalysis from './components/AIDocumentAnalysis';
import DoctorManagement from './components/DoctorManagement';
import AppointmentsView from './components/AppointmentsView';
import LaboratoryView from './components/LaboratoryView';
import PharmacyView from './components/PharmacyView';
import ReferralsView from './components/ReferralsView';
import DocumentsView from './components/DocumentsView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import LoginPage from './components/LoginPage';
import PdfViewerModal from './components/PdfViewerModal';
import DoctorModuleInfoModal from './components/DoctorModuleInfoModal';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ihms_auth');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.user || null;
      }
    } catch (e) {
      console.warn('Could not parse saved auth:', e);
    }
    // Default logged in user: Dr. Amit Deshmukh
    return {
      name: 'Dr. Amit Deshmukh',
      role: 'doctor',
      department: 'General Medicine',
      email: 'dr.amit@ihms.hospital',
      username: 'dr_amit',
      avatar: '/doctor_amit.jpg',
    };
  });

  // Navigation & Patient Selection State
  const [activeNav, setActiveNav] = useState('dashboard');
  const [navHistory, setNavHistory] = useState(['dashboard']);
  const [selectedPatientId, setSelectedPatientId] = useState('P-10245');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('ihms_sidebar_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ihms_sidebar_open', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleNavigate = (tab) => {
    if (tab === activeNav) return;
    setNavHistory((prev) => [...prev, tab]);
    setActiveNav(tab);
  };

  const handleGoBack = () => {
    if (navHistory.length > 1) {
      const nextHistory = [...navHistory];
      nextHistory.pop(); // Remove current page
      const prevTab = nextHistory[nextHistory.length - 1];
      setNavHistory(nextHistory);
      setActiveNav(prevTab);
    } else if (activeNav !== 'dashboard') {
      setNavHistory(['dashboard']);
      setActiveNav('dashboard');
    }
  };

  const canGoBack = navHistory.length > 1 || activeNav !== 'dashboard';

  // Modals State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isDoctorInfoModalOpen, setIsDoctorInfoModalOpen] = useState(false);
  const [activeQuickModal, setActiveQuickModal] = useState(null); // 'new-patient' | 'book-appointment' | 'upload-document' | 'service-request'
  const [globalSuccessToast, setGlobalSuccessToast] = useState(null);

  const defaultPatientQueue = [
    {
      id: 1,
      name: 'Rahul Patil',
      pid: 'P-10245',
      age: 32,
      gender: 'Male',
      initials: 'RP',
      avatar: '/avatars/patient_rahul.png',
      color: '#dbeafe',
      textColor: '#1d4ed8',
      reason: 'Fever',
      priority: 'High',
      priorityClass: 'priority-high',
      time: '10:25 AM',
      status: 'Waiting',
      statusDot: '#ef4444',
    },
    {
      id: 2,
      name: 'Sneha Jadhav',
      pid: 'P-10246',
      age: 28,
      gender: 'Female',
      initials: 'SJ',
      avatar: '/avatars/patient_sneha.png',
      color: '#fef3c7',
      textColor: '#b45309',
      reason: 'Follow-up',
      priority: 'Medium',
      priorityClass: 'priority-medium',
      time: '11:00 AM',
      status: 'In Progress',
      statusDot: '#f59e0b',
    },
    {
      id: 3,
      name: 'Mahesh Kumar',
      pid: 'P-10247',
      age: 45,
      gender: 'Male',
      initials: 'MK',
      avatar: '/avatars/patient_mahesh.png',
      color: '#f3e8ff',
      textColor: '#7e22ce',
      reason: 'Diabetes Check',
      priority: 'Normal',
      priorityClass: 'priority-normal',
      time: '11:30 AM',
      status: 'Seen',
      statusDot: '#10b981',
    },
    {
      id: 4,
      name: 'Priya More',
      pid: 'P-10248',
      age: 6,
      gender: 'Female',
      initials: 'PM',
      avatar: '/avatars/patient_priya.png',
      color: '#ecfdf5',
      textColor: '#047857',
      reason: 'Child Fever',
      priority: 'Normal',
      priorityClass: 'priority-normal',
      time: '12:00 PM',
      status: 'Seen',
      statusDot: '#10b981',
    },
    {
      id: 5,
      name: 'Ajay Thore',
      pid: 'P-10249',
      age: 50,
      gender: 'Male',
      initials: 'AT',
      avatar: '/avatars/patient_ajay.png',
      color: '#fee2e2',
      textColor: '#b91c1c',
      reason: 'Chest Pain',
      priority: 'High',
      priorityClass: 'priority-high',
      time: '12:30 PM',
      status: 'In Progress',
      statusDot: '#f59e0b',
    },
  ];

  const [patientQueue, setPatientQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('ihms_patient_queue');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read cached patient queue:', e);
    }
    return defaultPatientQueue;
  });

  // Sync live monitored patients from PostgreSQL into global dashboard queue
  useEffect(() => {
    let isMounted = true;
    fetch('/api/patients/monitoring/?page=1&page_size=25')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.results?.length > 0) {
          const liveQueue = data.results.map((p) => {
            const isHigh = p.deterioration_risk === 'High' || p.predicted_monitoring_level === 'Continuous';
            const isMed = p.deterioration_risk === 'Moderate' || p.predicted_monitoring_level === 'Enhanced';
            const initials = ((p.first_name?.[0] || 'P') + (p.last_name?.[0] || 'T')).toUpperCase();
            return {
              id: p.patient_id,
              name: p.full_name || `${p.first_name} ${p.last_name}`,
              pid: p.patient_id,
              age: p.age || 45,
              gender: p.gender || 'Unknown',
              initials,
              avatar: p.gender === 'Female' ? '/avatars/patient_sneha.png' : '/avatars/patient_rahul.png',
              color: isHigh ? '#fee2e2' : isMed ? '#fef3c7' : '#dbeafe',
              textColor: isHigh ? '#b91c1c' : isMed ? '#b45309' : '#1d4ed8',
              reason: `${p.care_unit} · ${p.predicted_monitoring_level || p.monitoring_level}`,
              priority: isHigh ? 'High' : isMed ? 'Medium' : 'Normal',
              priorityClass: isHigh ? 'priority-high' : isMed ? 'priority-medium' : 'priority-normal',
              time: 'Live Monitored',
              status: isHigh ? 'Urgent Alert' : 'Active',
              statusDot: isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981',
            };
          });
          setPatientQueue(liveQueue);
        }
      })
      .catch((err) => console.warn('Live monitoring queue fetch fallback:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Quick Action form inputs
  const [quickForm, setQuickForm] = useState({
    patientName: '',
    age: '',
    gender: 'Male',
    department: 'General Medicine',
    reason: '',
    doctor: 'Dr. Amit Deshmukh',
    priority: 'Normal',
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setNavHistory(['dashboard']);
    setActiveNav('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('ihms_auth');
    setCurrentUser(null);
  };

  const handleSwitchUser = (userRoleObj) => {
    const updated = {
      name: userRoleObj.label || userRoleObj.name,
      role: userRoleObj.role || 'doctor',
      department: userRoleObj.role || 'General Medicine',
      username: userRoleObj.username,
      email: `${userRoleObj.username}@ihms.hospital`,
      avatar: userRoleObj.avatar || null,
    };
    setCurrentUser(updated);
  };

  const handleSelectPatient = (pid) => {
    setSelectedPatientId(pid);
    handleNavigate('patients');
  };

  // If user explicitly logged out, render LoginPage
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const handleQuickModalSubmit = (e) => {
    e.preventDefault();

    if (activeQuickModal === 'new-patient') {
      const pName = quickForm.patientName.trim() || 'New Patient';
      const newPid = `P-${Math.floor(10000 + Math.random() * 90000)}`;
      const initials = pName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'NP';

      const newPatientObj = {
        id: Date.now(),
        name: pName,
        pid: newPid,
        age: parseInt(quickForm.age, 10) || 30,
        gender: quickForm.gender || 'Male',
        initials,
        avatar: '/avatars/patient_rahul.png',
        color: '#dcfce7',
        textColor: '#15803d',
        reason: quickForm.reason || 'General Consultation',
        priority: quickForm.priority || 'Normal',
        priorityClass: quickForm.priority === 'High' ? 'priority-high' : 'priority-normal',
        time: 'Just now',
        status: 'Waiting',
        statusDot: '#10b981',
      };

      const updatedQueue = [newPatientObj, ...patientQueue];
      setPatientQueue(updatedQueue);
      try {
        localStorage.setItem('ihms_patient_queue', JSON.stringify(updatedQueue));
      } catch (err) {
        console.warn(err);
      }

      // Save custom profile for PatientOverview
      try {
        const existing = JSON.parse(localStorage.getItem('ihms_custom_patient_profiles') || '{}');
        existing[newPid] = {
          name: pName,
          pid: newPid,
          age: parseInt(quickForm.age, 10) || 30,
          gender: quickForm.gender || 'Male',
          symbol: quickForm.gender === 'Female' ? '♀' : '♂',
          phone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
          bloodGroup: 'B+',
          initials,
          avatar: '/avatars/patient_rahul.png',
          severity: quickForm.priority === 'High' ? 'High Concern' : 'Normal',
          condition: quickForm.reason || 'Newly registered patient',
          vitals: {
            temp: { val: '37.0 °C', status: 'Normal', color: '#059669', bg: '#ecfdf5', iconColor: '#10b981' },
            hr: { val: '78 bpm', status: 'Normal', color: '#059669', bg: '#ecfdf5', iconColor: '#10b981' },
            spo2: { val: '99%', status: 'Normal', color: '#0284c7', bg: '#eff6ff', iconColor: '#0284c7' },
            bp: { val: '120/80', status: 'Normal', color: '#7c3aed', bg: '#f5f3ff', iconColor: '#7c3aed' },
          },
          summary: `Patient ${pName} registered on ${new Date().toLocaleDateString('en-GB')}. Chief complaint: ${quickForm.reason || 'Routine checkup'}.`,
        };
        localStorage.setItem('ihms_custom_patient_profiles', JSON.stringify(existing));
      } catch (err) {
        console.warn(err);
      }

      // Try background sync with Django backend
      try {
        fetch('/api/patients/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: newPid,
            age: parseInt(quickForm.age, 10) || 30,
            gender: quickForm.gender === 'Female' ? 'F' : 'M',
            current_condition: quickForm.reason || 'General Consultation',
            user: {
              first_name: pName.split(' ')[0] || pName,
              last_name: pName.split(' ').slice(1).join(' ') || 'Patient',
              username: `patient_${newPid.toLowerCase().replace('-', '_')}`,
            },
          }),
        }).catch(() => {});
      } catch (err) {
        console.warn('Backend sync warning:', err);
      }

      setSelectedPatientId(newPid);
      setGlobalSuccessToast(`Patient "${pName}" (${newPid}) registered successfully!`);
      setTimeout(() => setGlobalSuccessToast(null), 3500);
    } else if (activeQuickModal === 'book-appointment') {
      setGlobalSuccessToast(`Appointment for "${quickForm.patientName || 'Patient'}" booked successfully!`);
      setTimeout(() => setGlobalSuccessToast(null), 3500);
    } else if (activeQuickModal === 'service-request') {
      setGlobalSuccessToast(`Service request created successfully!`);
      setTimeout(() => setGlobalSuccessToast(null), 3500);
    } else {
      setGlobalSuccessToast(`Record added successfully!`);
      setTimeout(() => setGlobalSuccessToast(null), 3500);
    }

    setActiveQuickModal(null);
    setQuickForm({
      patientName: '',
      age: '',
      gender: 'Male',
      department: 'General Medicine',
      reason: '',
      doctor: 'Dr. Amit Deshmukh',
      priority: 'Normal',
    });
  };

  return (
    <div className="ihms-app-layout">
      {/* 1. Left Navigation Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={handleNavigate}
        onOpenQuickModal={() => setActiveQuickModal('new-patient')}
        onOpenDoctorInfo={() => setIsDoctorInfoModalOpen(true)}
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
      />

      {/* 2. Main Content Canvas */}
      <div className="ihms-main-canvas">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          onLogout={handleLogout}
          onSelectPatient={handleSelectPatient}
          onNavigateTab={handleNavigate}
          onGoBack={handleGoBack}
          canGoBack={canGoBack}
          activeNav={activeNav}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Dynamic Viewport (Vertical scrolling enabled via .ihms-scroll-viewport) */}
        {activeNav === 'dashboard' && (
          <OverviewDashboard
            currentUser={currentUser}
            patientQueue={patientQueue}
            onSelectPatient={handleSelectPatient}
            onNavigateTab={handleNavigate}
            onOpenNewPatientModal={() => setActiveQuickModal('new-patient')}
            onOpenBookAppointmentModal={() => setActiveQuickModal('book-appointment')}
            onOpenServiceRequestModal={() => setActiveQuickModal('service-request')}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        )}

        {activeNav === 'patients' && (
          <PatientOverview
            selectedPatientId={selectedPatientId}
            onOpenNewVisitModal={() => setActiveQuickModal('book-appointment')}
            onViewDocModal={() => setIsPdfModalOpen(true)}
            onBack={handleGoBack}
          />
        )}

        {activeNav === 'ai-analysis' && (
          <AIDocumentAnalysis
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onSelectPatient={handleSelectPatient}
            onBack={handleGoBack}
          />
        )}

        {activeNav === 'doctors' && (
          <DoctorManagement
            onSelectPatient={handleSelectPatient}
            onAddDoctorModal={() => setActiveQuickModal('new-doctor')}
            onBack={handleGoBack}
          />
        )}

        {activeNav === 'appointments' && (
          <ErrorBoundary title="Appointments">
            <AppointmentsView
              onSelectPatient={handleSelectPatient}
              onOpenBookAppointmentModal={() => setActiveQuickModal('book-appointment')}
              onNavigateTab={handleNavigate}
              onBack={handleGoBack}
            />
          </ErrorBoundary>
        )}

        {activeNav === 'laboratory' && (
          <ErrorBoundary title="Laboratory">
            <LaboratoryView
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
              onSelectPatient={handleSelectPatient}
              onOpenLabModal={() => setActiveQuickModal('new-lab')}
              onNavigateTab={handleNavigate}
              onBack={handleGoBack}
            />
          </ErrorBoundary>
        )}

        {activeNav === 'pharmacy' && (
          <ErrorBoundary title="Pharmacy">
            <PharmacyView
              onSelectPatient={handleSelectPatient}
              onOpenRxModal={() => setActiveQuickModal('new-rx')}
              onNavigateTab={handleNavigate}
              onBack={handleGoBack}
            />
          </ErrorBoundary>
        )}

        {activeNav === 'referrals' && (
          <ErrorBoundary title="Referrals">
            <ReferralsView
              onSelectPatient={handleSelectPatient}
              onOpenReferralModal={() => setActiveQuickModal('new-referral')}
              onNavigateTab={handleNavigate}
              onBack={handleGoBack}
            />
          </ErrorBoundary>
        )}

        {activeNav === 'documents' && (
          <ErrorBoundary title="Documents">
            <DocumentsView
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
              onSelectPatient={handleSelectPatient}
              onNavigateTab={handleNavigate}
              onBack={handleGoBack}
            />
          </ErrorBoundary>
        )}

        {activeNav === 'reports' && (
          <ReportsView
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onNavigateTab={handleNavigate}
            onBack={handleGoBack}
          />
        )}

        {activeNav === 'settings' && (
          <SettingsView currentUser={currentUser} onLogout={handleLogout} onBack={handleGoBack} />
        )}
      </div>

      {/* 3. Global City Care Labs PDF Modal (Exact Image 5 Replica) */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      {/* 3b. Doctor Module & Platform Information Modal */}
      <DoctorModuleInfoModal
        isOpen={isDoctorInfoModalOpen}
        onClose={() => setIsDoctorInfoModalOpen(false)}
      />

      {/* 4. Quick Action Modal Dialogs */}
      {activeQuickModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998,
            padding: '1rem',
          }}
          onClick={() => setActiveQuickModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '540px',
              maxWidth: '94vw',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {activeQuickModal === 'new-patient' && 'Register New Patient'}
                {activeQuickModal === 'book-appointment' && 'Book Clinical Appointment'}
                {activeQuickModal === 'service-request' && 'Create Department Service Request'}
                {activeQuickModal === 'new-doctor' && 'Add Medical Staff / Doctor'}
                {activeQuickModal === 'new-lab' && 'Order New Diagnostic / Lab Test'}
                {activeQuickModal === 'new-rx' && 'New Prescription Dispense Order'}
                {activeQuickModal === 'new-referral' && 'Create Inter-Department Referral'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveQuickModal(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleQuickModalSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={quickForm.patientName}
                  onChange={(e) => setQuickForm({ ...quickForm, patientName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="35"
                    value={quickForm.age}
                    onChange={(e) => setQuickForm({ ...quickForm, age: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Department
                  </label>
                  <select
                    value={quickForm.department}
                    onChange={(e) => setQuickForm({ ...quickForm, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                    }}
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Trauma / ER">Trauma / Emergency</option>
                    <option value="Laboratory">Laboratory</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Clinical Reason / Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe chief complaint or service request..."
                  value={quickForm.reason}
                  onChange={(e) => setQuickForm({ ...quickForm, reason: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveQuickModal(null)}
                  style={{
                    padding: '0.6rem 1.1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.4rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  Save & Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Global Success Notification Toast */}
      {globalSuccessToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            background: '#ecfdf5',
            border: '1.5px solid #10b981',
            color: '#065f46',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            fontSize: '0.88rem',
            fontWeight: 700,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'slideInRight 0.25s ease-out',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>✓</span>
          <span>{globalSuccessToast}</span>
        </div>
      )}
    </div>
  );
}
