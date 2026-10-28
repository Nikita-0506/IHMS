import React from 'react';

export default function Sidebar({
  activeNav,
  setActiveNav,
  onOpenQuickModal,
  onOpenDoctorInfo,
  isOpen = true,
  onToggle,
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4.5" />
          <path d="M4.5 20.5c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5" />
        </svg>
      ),
    },
    {
      id: 'ai-analysis',
      label: 'AI Analysis',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 4.5 C7 4.5 5 6.8 5 9.5 C5 10.5 5.5 11.5 6 12 C5 12.6 4.5 14 4.5 15.5 C4.5 18 6.5 20 9.5 20" />
          <path d="M14.5 4.5 C17 4.5 19 6.8 19 9.5 C19 10.5 18.5 11.5 18 12 C19 12.6 19.5 14 19.5 15.5 C19.5 18 17.5 20 14.5 20" />
          <line x1="12" y1="4" x2="12" y2="20.5" />
          <path d="M9.5 8.5 H7" />
          <path d="M14.5 8.5 H17" />
          <path d="M9.5 12 H6" />
          <path d="M14.5 12 H18" />
          <path d="M9.5 16 H7.5" />
          <path d="M14.5 16 H16.5" />
        </svg>
      ),
    },
    {
      id: 'doctors',
      label: 'Doctors',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 3.5v4a4.5 4.5 0 0 0 9 0v-4" />
          <path d="M9 12v3.5a4.5 4.5 0 0 0 4.5 4.5h1.5a4.5 4.5 0 0 0 4.5-4.5V13" />
          <circle cx="19.5" cy="11.5" r="2.5" />
          <circle cx="4.5" cy="3.5" r="1" fill="currentColor" />
          <circle cx="13.5" cy="3.5" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="17" rx="3" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: 'laboratory',
      label: 'Laboratory',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.31a2 2 0 0 1-.58 1.42L3 17.15A2 2 0 0 0 4.41 20.6h15.18A2 2 0 0 0 21 17.15l-6.42-6.42A2 2 0 0 1 14 9.31V2" />
          <line x1="8.5" y1="2" x2="15.5" y2="2" />
        </svg>
      ),
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
        </svg>
      ),
    },
    {
      id: 'referrals',
      label: 'Referrals',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19v-4a6 6 0 0 1 6-6h9" />
          <polyline points="15 5 20 9 15 13" />
        </svg>
      ),
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3.5" />
          <line x1="8" y1="17" x2="8" y2="13" />
          <line x1="12" y1="17" x2="12" y2="8" />
          <line x1="16" y1="17" x2="16" y2="11" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className={`ihms-sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div>
        {/* Brand Header with Hide Button */}
        <div className="sidebar-brand-wrapper">
          <div
            className="sidebar-brand"
            onClick={() => setActiveNav('dashboard')}
            title="IHMS - Intelligent Hospital Management System"
          >
            <div
              className="brand-cross-logo"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenDoctorInfo) {
                  onOpenDoctorInfo();
                }
              }}
              title="Doctor Module & Platform Overview (प्लॅटफॉर्म माहिती)"
            >
              <img
                src="/ihms_logo_icon.png"
                alt="Doctor Module & Platform Information"
                className="ihms-brand-logo-img"
              />
            </div>
            <div className="brand-info">
              <h1>IHMS</h1>
              <p>
                Intelligent Hospital<br />
                Management System
              </p>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-hide-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggle) onToggle();
            }}
            title="Hide Sidebar (साइडबार लपवा)"
            aria-label="Hide Sidebar"
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
              <polyline points="11 18 5 12 11 6" />
              <polyline points="19 18 13 12 19 6" />
            </svg>
          </button>
        </div>

        {/* Navigation List matching Image 1 */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item-btn ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Mascot matching active page */}
      <div
        className="sidebar-mascot-seamless"
        onClick={() => setActiveNav(activeNav)}
        title={
          activeNav === 'documents'
            ? 'Your Health Records, Always Accessible'
            : activeNav === 'pharmacy'
            ? 'Care Today, for a Healthier Tomorrow'
            : activeNav === 'referrals'
            ? 'Better Collaboration, Better Care'
            : activeNav === 'laboratory'
            ? 'Precision in Testing, Care in Every Detail'
            : activeNav === 'settings'
            ? 'Simpler Settings, Smoother Care'
            : activeNav === 'reports'
            ? 'Insights Today, Better Care Tomorrow'
            : 'Better Care, Brighter Tomorrow'
        }
      >
        {activeNav === 'documents' ? (
          <img
            src="/mascot_documents.png"
            alt="Your Health Records Always Accessible"
            className="mascot-img mascot-documents-img"
          />
        ) : activeNav === 'pharmacy' ? (
          <img
            src="/mascot_pharmacy.png"
            alt="Care Today for a Healthier Tomorrow"
            className="mascot-img mascot-pharmacy-img"
          />
        ) : activeNav === 'referrals' ? (
          <img
            src="/mascot_referrals.png"
            alt="Better Collaboration Better Care"
            className="mascot-img mascot-referrals-img"
          />
        ) : activeNav === 'laboratory' ? (
          <img
            src="/mascot_laboratory.png"
            alt="Precision in Testing Care in Every Detail"
            className="mascot-img mascot-laboratory-img"
          />
        ) : activeNav === 'settings' ? (
          <img
            src="/mascot_settings.png"
            alt="Simpler Settings Smoother Care"
            className="mascot-img mascot-settings-img"
          />
        ) : activeNav === 'reports' ? (
          <img
            src="/mascot_reports.png"
            alt="Insights Today Better Care Tomorrow"
            className="mascot-img mascot-reports-img"
          />
        ) : (
          <img
            src="/mascot_stethoscope.jpg"
            alt="Better Care Brighter Tomorrow"
            className="mascot-img"
          />
        )}
      </div>
    </aside>
  );
}
