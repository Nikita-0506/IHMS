import React, { useEffect } from 'react';

export default function DoctorModuleInfoModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '24px',
          width: '1080px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(226, 232, 240, 0.9)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header matching Image 2 */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 70%, #f0f9ff 100%)',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle decorative curved background accent on the right */}
          <div
            style={{
              position: 'absolute',
              right: '60px',
              top: '-40px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(186, 230, 253, 0.35) 0%, rgba(224, 242, 254, 0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '16px',
                background: '#ffffff',
                border: '1.5px solid #dbeafe',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src="/images/ihms_logo_icon.png"
                alt="Doctor Module Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Doctor Module Guide & Platform Overview
                </h2>
                <span
                  style={{
                    background: '#e0f2fe',
                    color: '#0284c7',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    border: '1px solid #bae6fd',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Clinical System
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
                Intelligent Hospital Management System (IHMS) • Aligned with national e-Hospital standards
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              position: 'relative',
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#64748b';
            }}
            title="Close (Esc)"
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '1.75rem 2rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
            fontSize: '0.92rem',
            color: '#334155',
            lineHeight: 1.6,
          }}
        >
          {/* ======================================================== */}
          {/* HERO: MODULE OVERVIEW BANNER (EXACT REPLICA OF IMAGE 2) */}
          {/* ======================================================== */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              padding: '1.75rem 2rem',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
              display: 'grid',
              gridTemplateColumns: 'minmax(330px, 1.25fr) minmax(220px, 0.9fr) minmax(170px, 0.65fr)',
              gap: '1.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left Content */}
            <div>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#0284c7',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.35rem',
                }}
              >
                MODULE OVERVIEW
              </div>
              <h2
                style={{
                  margin: '0 0 0.85rem',
                  fontSize: '2rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                <span style={{ color: '#0284c7' }}>Doctor Module</span>{' '}
                <span style={{ color: '#0f172a' }}>Overview</span>
              </h2>
              <p
                style={{
                  margin: 0,
                  color: '#475569',
                  fontSize: '0.92rem',
                  lineHeight: 1.65,
                }}
              >
                The Doctor Module in the Intelligent Hospital Management System (IHMS) is designed to help doctors manage patient care, review medical information, document clinical assessments, check laboratory results, review AI-generated summaries, and coordinate referrals and treatment workflows.
              </p>

              {/* Informational Box */}
              <div
                style={{
                  marginTop: '1.25rem',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}
                >
                  i
                </div>
                <div
                  style={{
                    fontStyle: 'italic',
                    color: '#0284c7',
                    fontSize: '0.86rem',
                    lineHeight: 1.45,
                  }}
                >
                  This type of clinical workflow is standard across major healthcare systems, including India's government{' '}
                  <strong style={{ fontStyle: 'italic', color: '#0369a1' }}>e-Hospital</strong> platform.
                </div>
              </div>
            </div>

            {/* Center 3D Doctor Illustration */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem',
              }}
            >
              <img
                src="/images/doctor_3d_overview.png"
                alt="Doctor working on patient records 3D illustration"
                style={{
                  maxHeight: '230px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 12px 24px rgba(2, 132, 199, 0.12))',
                }}
              />
            </div>

            {/* Right Side 4 Feature Chips */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.7rem',
              }}
            >
              {/* Chip 1: Patient Care */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: '14px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: '#ffe4e6',
                    color: '#e11d48',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    <path d="M12 9v6" />
                    <path d="M9 12h6" />
                  </svg>
                </div>
                <div>
                  <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.86rem' }}>Patient Care</div>
                  <div style={{ color: '#64748b', fontSize: '0.74rem' }}>Better Decisions</div>
                </div>
              </div>

              {/* Chip 2: Lab Results */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: '14px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2v7.31a2 2 0 0 1-.58 1.42L3 17.15A2 2 0 0 0 4.41 20.6h15.18A2 2 0 0 0 21 17.15l-6.42-6.42A2 2 0 0 1 14 9.31V2" />
                    <line x1="8.5" y1="2" x2="15.5" y2="2" />
                  </svg>
                </div>
                <div>
                  <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.86rem' }}>Lab Results</div>
                  <div style={{ color: '#64748b', fontSize: '0.74rem' }}>Quick Review</div>
                </div>
              </div>

              {/* Chip 3: Medical History */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: '14px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: '#f3e8ff',
                    color: '#9333ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.86rem' }}>Medical History</div>
                  <div style={{ color: '#64748b', fontSize: '0.74rem' }}>Complete Records</div>
                </div>
              </div>

              {/* Chip 4: AI Summaries */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: '14px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: '#ccfbf1',
                    color: '#0d9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 4.5 C7 4.5 5 6.8 5 9.5 C5 10.5 5.5 11.5 6 12 C5 12.6 4.5 14 4.5 15.5 C4.5 18 6.5 20 9.5 20" />
                    <path d="M14.5 4.5 C17 4.5 19 6.8 19 9.5 C19 10.5 18.5 11.5 18 12 C19 12.6 19.5 14 19.5 15.5 C19.5 18 17.5 20 14.5 20" />
                    <line x1="12" y1="4" x2="12" y2="20.5" />
                  </svg>
                </div>
                <div>
                  <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.86rem' }}>AI Summaries</div>
                  <div style={{ color: '#64748b', fontSize: '0.74rem' }}>Smart Insights</div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 1: WHO CAN USE (EXACT REPLICA OF IMAGE 2)        */}
          {/* ======================================================== */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              padding: '1.75rem 2rem',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            {/* Heading Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                1
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.01em',
                }}
              >
                Who can use the Doctor Module?
              </h3>
            </div>

            {/* 4 Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              {/* Card 1: Registered Doctors */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.15rem 1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                }}
              >
                <img
                  src="/images/icon_reg_doctor.png"
                  alt="Registered Doctors"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    objectFit: 'contain',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                />
                <div>
                  <h4 style={{ margin: '0 0 0.35rem', color: '#0f172a', fontWeight: 800, fontSize: '0.92rem' }}>
                    Registered Doctors
                  </h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', lineHeight: 1.45 }}>
                    Doctors working in the hospital with verified accounts.
                  </p>
                </div>
              </div>

              {/* Card 2: Specialist Doctors */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #dcfce7',
                  borderRadius: '16px',
                  padding: '1.15rem 1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                }}
              >
                <img
                  src="/images/icon_spec_doctor.png"
                  alt="Specialist Doctors"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    objectFit: 'contain',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                />
                <div>
                  <h4 style={{ margin: '0 0 0.35rem', color: '#0f172a', fontWeight: 800, fontSize: '0.92rem' }}>
                    Specialist Doctors
                  </h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', lineHeight: 1.45 }}>
                    Doctors assigned to relevant departments (e.g. Cardiology, Neurology, Pediatrics, Orthopedics).
                  </p>
                </div>
              </div>

              {/* Card 3: Authorized Doctors */}
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: '16px',
                  padding: '1.15rem 1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                }}
              >
                <img
                  src="/images/icon_auth_doctor.png"
                  alt="Authorized Doctors"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    objectFit: 'contain',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                />
                <div>
                  <h4 style={{ margin: '0 0 0.35rem', color: '#0f172a', fontWeight: 800, fontSize: '0.92rem' }}>
                    Authorized Doctors
                  </h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', lineHeight: 1.45 }}>
                    Doctors reviewing referred or transferred patients.
                  </p>
                </div>
              </div>

              {/* Card 4: Remote Clinicians */}
              <div
                style={{
                  background: '#faf5ff',
                  border: '1px solid #f3e8ff',
                  borderRadius: '16px',
                  padding: '1.15rem 1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                }}
              >
                <img
                  src="/images/icon_remote_doctor.png"
                  alt="Remote Clinicians"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    objectFit: 'contain',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                />
                <div>
                  <h4 style={{ margin: '0 0 0.35rem', color: '#0f172a', fontWeight: 800, fontSize: '0.92rem' }}>
                    Remote Clinicians
                  </h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', lineHeight: 1.45 }}>
                    Authorized remote clinicians permitted to review patient records where institutional policy allows it.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Security & Access Control Banner */}
            <div
              style={{
                background: '#f0f9ff',
                border: '1.5px solid #bae6fd',
                borderRadius: '14px',
                padding: '0.9rem 1.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem',
              }}
            >
              <img
                src="/images/icon_security_shield.png"
                alt="Security Shield"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  flexShrink: 0,
                }}
              />
              <div>
                <h4
                  style={{
                    margin: '0 0 0.2rem',
                    color: '#0284c7',
                    fontWeight: 800,
                    fontSize: '0.94rem',
                  }}
                >
                  Account Security & Access Control
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: '#475569',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                  }}
                >
                  Each doctor must sign in using an individual verified account. Access is strictly restricted to the patients and functions they are authorized to handle.
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: MAIN FEATURES                                */}
          {/* ======================================================== */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              padding: '1.75rem 2rem',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                2
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Main Features of the Doctor Module
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1rem' }}>
              {/* Feature A */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>📋</span>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
                    A. Assigned Patients & Medical History
                  </h4>
                </div>
                <ul style={{ margin: '0 0 0.75rem 1.2rem', padding: 0, fontSize: '0.86rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <li>View real-time assigned patient queues and active encounters.</li>
                  <li>Search for patients using authorized Patient IDs (PID), ABHA ID, or name.</li>
                  <li>Review previous visits, verified clinical records, and documentation.</li>
                  <li>View allergies, existing conditions, current medications, and past reports.</li>
                  <li>Track new, existing, referred, and transferred patient records.</li>
                </ul>
                <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700, background: '#e0f2fe', padding: '5px 10px', borderRadius: '8px' }}>
                  🎯 Purpose: Equips the clinician with immediate, relevant patient context prior to consultation.
                </div>
              </div>

              {/* Feature B */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>✍️</span>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
                    B. Clinical Assessment & Notes
                  </h4>
                </div>
                <ul style={{ margin: '0 0 0.75rem 1.2rem', padding: 0, fontSize: '0.86rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <li>Record patient symptoms, history of present illness, and chief complaints.</li>
                  <li>Review automated vitals (BP, Heart Rate, SpO2, Temperature) & exam findings.</li>
                  <li>Document structured clinical observations, diagnosis, and differential.</li>
                  <li>Record prescribed medications, dosage instructions, and care plan.</li>
                  <li>Save, update, and lock clinical notes per authorized governance rules.</li>
                </ul>
                <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700, background: '#e0f2fe', padding: '5px 10px', borderRadius: '8px' }}>
                  🎯 Purpose: Maintains structured, legally admissible documentation of clinical consultations.
                </div>
              </div>

              {/* Feature C */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🧪</span>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
                    C. Laboratory Results Review
                  </h4>
                </div>
                <ul style={{ margin: '0 0 0.75rem 1.2rem', padding: 0, fontSize: '0.86rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <li>View laboratory tests ordered for patients across hospital departments.</li>
                  <li>Check test stages: Pending, Sample Collected, Processing, or Verified.</li>
                  <li>Review verified pathology, hematology, and diagnostic reports.</li>
                  <li>Document clinical interpretations, notes, and urgent action points.</li>
                  <li>Order additional investigations with instant electronic requisition.</li>
                </ul>
                <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700, background: '#e0f2fe', padding: '5px 10px', borderRadius: '8px' }}>
                  🎯 Purpose: Enables rapid diagnostic evaluation while respecting laboratory verification workflows.
                </div>
              </div>

              {/* Feature D */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🤖</span>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
                    D. AI-Generated Patient Summaries
                  </h4>
                </div>
                <ul style={{ margin: '0 0 0.75rem 1.2rem', padding: 0, fontSize: '0.86rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <li>Automated synthesis of multi-year patient history, discharge notes, and OCR docs.</li>
                  <li>Side-by-side comparison between AI summary and raw source documentation.</li>
                  <li>Doctor verification controls: Edit, approve, or reject AI outputs.</li>
                  <li>Traceable audit trail documenting who reviewed and verified each summary.</li>
                </ul>
                <div style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 700, background: '#fee2e2', padding: '5px 10px', borderRadius: '8px' }}>
                  ⚠️ Clinical Safety Note: AI output is strictly assistive. All clinical diagnoses and orders require independent human doctor validation.
                </div>
              </div>

              {/* Feature E */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.15rem', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🔄</span>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
                    E. Referrals and Treatment Coordination
                  </h4>
                </div>
                <ul style={{ margin: '0 0 0.75rem 1.2rem', padding: 0, fontSize: '0.86rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <li>Review inbound referral summaries, referring institution notes, and urgent indicators.</li>
                  <li>Select appropriate destination specialty (e.g. Cardiology, Orthopedics, Oncology).</li>
                  <li>Attach clinical summaries, lab reports, and medication histories automatically.</li>
                  <li>Track status in real time: Submitted, Accepted, Consult Scheduled, Completed.</li>
                </ul>
                <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700, background: '#e0f2fe', padding: '5px 10px', borderRadius: '8px' }}>
                  🎯 Purpose: Eliminates lost records during transfers and supports unified continuity of patient care.
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: STEP-BY-STEP WORKFLOW                        */}
          {/* ======================================================== */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              padding: '1.75rem 2rem',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                3
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                How does a doctor use the module? — Step-by-step workflow
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { step: '01', title: 'Login & Verification', desc: 'The doctor securely signs in using their individual authorized hospital account credentials.' },
                { step: '02', title: 'Open Assigned Patients', desc: 'The doctor accesses their live queue and selects a patient from the authorized roster.' },
                { step: '03', title: 'Review Patient History', desc: 'Previous hospital visits, chronic conditions, current prescriptions, allergies, and lab results are reviewed.' },
                { step: '04', title: 'Assess the Patient', desc: 'The doctor examines the patient, verifies automated vitals, and records detailed clinical observations.' },
                { step: '05', title: 'Review Investigations & AI Summary', desc: 'Available laboratory findings and AI-generated syntheses are cross-checked against source records.' },
                { step: '06', title: 'Make Clinical Decisions', desc: 'The doctor independently decides the appropriate diagnosis, treatment protocol, prescriptions, and follow-ups.' },
                { step: '07', title: 'Save & Coordinate Care', desc: 'The clinical encounter is saved to the electronic medical record (EMR) and any required specialist referrals are initiated.' },
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: '#0284c7',
                      background: '#e0f2fe',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {item.step}
                  </span>
                  <div>
                    <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{item.title}:</strong>{' '}
                    <span style={{ color: '#475569', fontSize: '0.88rem' }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 4: DASHBOARD DISPLAY TABLE                       */}
          {/* ======================================================== */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              padding: '1.75rem 2rem',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                4
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                What should the Doctor Dashboard display?
              </h3>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#1e293b' }}>
                    <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', fontWeight: 800 }}>Dashboard Section</th>
                    <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', fontWeight: 800 }}>Information Displayed</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { section: "Today's Appointments", info: 'Scheduled consultations, token numbers, and real-time appointment status.' },
                    { section: 'Assigned Patients', info: 'Full queue of active patients assigned to the logged-in doctor across wards/OPD.' },
                    { section: 'Pending Clinical Reviews', info: 'Incomplete notes, triage evaluations, or records requiring final physician sign-off.' },
                    { section: 'Pending Lab Results', info: 'Outstanding investigations, critical panic values, and verified test releases.' },
                    { section: 'AI Summary Review', info: 'Automated document extraction and clinical summaries awaiting physician review.' },
                    { section: 'Referral Requests', info: 'Incoming inter-departmental transfers and outgoing specialist consultation statuses.' },
                    { section: 'Recent Patient Activity', info: 'Timeline of recent vitals check-ins, medication administrations, and uploads.' },
                    { section: 'Follow-up Schedule', info: 'Upcoming patient review visits, discharge follow-ups, and repeat consultations.' },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '11px 16px', fontWeight: 700, color: '#0f172a' }}>{row.section}</td>
                      <td style={{ padding: '11px 16px', color: '#475569' }}>{row.info}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ margin: '0.85rem 0 0', fontSize: '0.84rem', color: '#64748b', fontStyle: 'italic' }}>
              Note: The dashboard filters and displays only information permitted for the authenticated clinician. Urgent clinical alerts adhere to validated hospital protocols.
            </p>
          </div>

          {/* ======================================================== */}
          {/* SECTION 5: PERMISSIONS TABLE                             */}
          {/* ======================================================== */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              padding: '1.75rem 2rem',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                5
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                What permissions should a doctor have?
              </h3>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#1e293b' }}>
                    <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', fontWeight: 800 }}>Clinical Action</th>
                    <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', fontWeight: 800 }}>Recommended Access</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { action: 'View assigned patient records', access: 'Allowed', badge: 'green' },
                    { action: 'Create clinical assessment & orders', access: 'Allowed for authorized encounters', badge: 'green' },
                    { action: 'Edit own draft clinical notes', access: 'Allowed', badge: 'green' },
                    { action: 'Review laboratory reports', access: 'Allowed for authorized patients', badge: 'green' },
                    { action: 'Verify AI-generated summaries', access: 'Allowed', badge: 'green' },
                    { action: 'Create or review referrals', access: 'According to clinical role and workflow', badge: 'blue' },
                    { action: "Modify another doctor's finalized notes", access: 'Restricted & strictly audited', badge: 'amber' },
                    { action: 'Manage user accounts & system config', access: 'Not allowed by default', badge: 'red' },
                    { action: 'Access all patients without clinical reason', access: 'Restricted / Audit-flagged', badge: 'red' },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: '#334155' }}>{row.action}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '8px',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            background:
                              row.badge === 'green'
                                ? '#dcfce7'
                                : row.badge === 'blue'
                                ? '#e0f2fe'
                                : row.badge === 'amber'
                                ? '#fef3c7'
                                : '#fee2e2',
                            color:
                              row.badge === 'green'
                                ? '#15803d'
                                : row.badge === 'blue'
                                ? '#0369a1'
                                : row.badge === 'amber'
                                ? '#b45309'
                                : '#b91c1c',
                          }}
                        >
                          {row.access}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ margin: '0.85rem 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              🛡️ <strong>Compliance standard:</strong> Finalized medical records require formal addendum amendments instead of direct modification. All data access is logged in compliance with HIPAA/DISHA audit standards.
            </p>
          </div>

          {/* ======================================================== */}
          {/* SECTION 6: INTERCONNECTIONS                              */}
          {/* ======================================================== */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              padding: '1.75rem 2rem',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                6
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                How does the Doctor Module connect to other IHMS modules?
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
              {[
                { module: 'Patients', icon: '👤', desc: 'Access medical history, prior visits, allergies, and demographics.' },
                { module: 'Appointments', icon: '📅', desc: 'Syncs daily schedules, token queues, and consultation statuses.' },
                { module: 'Laboratory', icon: '🧪', desc: 'Dispatches lab orders and receives verified diagnostic results.' },
                { module: 'AI Analysis', icon: '🧠', desc: 'Receives clinical summaries and symptom classifications for review.' },
                { module: 'Referrals', icon: '🔄', desc: 'Coordinates cross-departmental and inter-hospital care handoffs.' },
                { module: 'Documents', icon: '📂', desc: 'Central repository for scanned reports, discharge notes, and imaging.' },
              ].map((item) => (
                <div
                  key={item.module}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                    <strong style={{ color: '#0284c7', fontSize: '0.92rem' }}>{item.module}</strong>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{item.desc}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', padding: '0.85rem 1.15rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', fontSize: '0.86rem', color: '#166534' }}>
              💡 <strong>Clinical Example:</strong> A doctor opens an assigned patient record, reviews history in <em>Patients</em>, checks lab bloodwork in <em>Laboratory</em>, verifies the synthesized assessment in <em>AI Analysis</em>, signs notes, and dispatches an authorized transfer via <em>Referrals</em>.
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 7: EXPECTED OUTCOMES                             */}
          {/* ======================================================== */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '20px',
              padding: '1.75rem 2rem',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                7
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Expected Clinical Outcomes
              </h3>
            </div>

            <p style={{ margin: '0 0 0.85rem', fontSize: '0.9rem', color: '#475569' }}>
              The Doctor Module helps hospital administration and medical teams achieve:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {[
                'Centralized, authorized access to comprehensive patient records and history.',
                'Significant reduction in repetitive manual paperwork and charting fatigue.',
                'Instant electronic access to verified pathology and imaging reports.',
                'Reliable physician-in-the-loop review of AI-generated clinical summaries.',
                'Seamless multidisciplinary collaboration between doctors, labs, and specialists.',
                'Rock-solid legal and institutional accountability via tamper-evident audit logs.',
              ].map((text, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    padding: '0.75rem 0.95rem',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    fontSize: '0.86rem',
                    color: '#1e293b',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ color: '#10b981', fontWeight: 800, fontSize: '1rem' }}>✓</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 2rem',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.6rem 1.6rem',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#0369a1')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0284c7')}
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
