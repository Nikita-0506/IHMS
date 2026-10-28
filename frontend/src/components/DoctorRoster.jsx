import React, { useState } from 'react';
import { recommendDoctorAssignment } from '../services/api';

export default function DoctorRoster({ doctors = [] }) {
  const doctorList = Array.isArray(doctors)
    ? doctors
    : (doctors?.roster || doctors?.results || []);

  const [selectedPatientId, setSelectedPatientId] = useState('P-10245');
  const [recommendation, setRecommendation] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [assignAlert, setAssignAlert] = useState(null);

  const handleGetRecommendation = async (pid) => {
    setLoadingRec(true);
    setSelectedPatientId(pid);
    try {
      const res = await recommendDoctorAssignment(pid);
      setRecommendation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRec(false);
    }
  };

  const handleAssignDoctor = (doctorName, patientId) => {
    setAssignAlert(`Successfully assigned ${doctorName} to patient ${patientId}. Notification sent to OPD desk.`);
    setTimeout(() => setAssignAlert(null), 4000);
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            Doctor Availability, OPD Roster & Smart Assignment
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Manages doctor profiles, shifts, OPD hours, and workload. Recommends assignments preserving continuity of care, specialty needs, and ER bypass policies.
          </p>
        </div>
        <span className="badge-stable" style={{ fontSize: '0.8rem' }}>
          {doctorList.length} Doctors on Roster
        </span>
      </div>

      {assignAlert && (
        <div
          style={{
            background: '#e0f2fe',
            border: '1px solid #bae6fd',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#0369a1',
            fontSize: '0.86rem',
            fontWeight: 600,
          }}
        >
          ✓ {assignAlert}
        </div>
      )}

      {/* Smart Doctor Assignment Box */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              Smart Assignment Recommender (Clinical AI Assist)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Select a patient case to test algorithmic doctor matching:
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn-clinical ${selectedPatientId === 'P-10245' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem' }}
              onClick={() => handleGetRecommendation('P-10245')}
            >
              Rahul Patil (Existing · Fever)
            </button>
            <button
              type="button"
              className={`btn-clinical ${selectedPatientId === 'P-10246' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem' }}
              onClick={() => handleGetRecommendation('P-10246')}
            >
              Priya Deshmukh (Referred · Cardio)
            </button>
            <button
              type="button"
              className={`btn-clinical ${selectedPatientId === 'P-10248' ? 'btn-critical' : 'btn-outline'}`}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem' }}
              onClick={() => handleGetRecommendation('P-10248')}
            >
              Vikram Singh (Trauma · ER)
            </button>
          </div>
        </div>

        {loadingRec && <div style={{ fontSize: '0.84rem', color: '#0284c7' }}>Computing clinical recommendation...</div>}

        {recommendation && !loadingRec && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #bae6fd',
              borderRadius: 8,
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge-stable" style={{ fontSize: '0.72rem' }}>
                  {recommendation.assignment_mode?.toUpperCase() || 'RECOMMENDED'}
                </span>
                <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                  {recommendation.recommended_doctor?.name || 'Dr. Amit Sharma'}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  ({recommendation.department})
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#334155', marginTop: '0.35rem' }}>
                <b>Rationale:</b> {recommendation.reason}
              </p>
            </div>

            <button
              type="button"
              className="btn-clinical btn-indigo"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
              onClick={() =>
                handleAssignDoctor(
                  recommendation.recommended_doctor?.name || 'Dr. Amit Sharma',
                  selectedPatientId
                )
              }
            >
              Confirm Assignment
            </button>
          </div>
        )}
      </div>

      {/* Doctor Roster Table */}
      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
        Current On-Duty Roster & OPD Timings
      </h4>
      <div className="data-table-container">
        <table className="clinical-table">
          <thead>
            <tr>
              <th>Doctor ID & Name</th>
              <th>Department / Specialization</th>
              <th>Shift & OPD Timing</th>
              <th>Room</th>
              <th>Workload (Active / Max)</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {doctorList.map((doc, idx) => {
              const maxPatients = doc.max_daily_patients || 25;
              const currentCount = doc.current_queue_count || 0;
              const percentage = Math.min(100, Math.round((currentCount / maxPatients) * 100));
              const isEr = doc.department ? doc.department.includes('Emergency') : false;

              return (
                <tr key={doc.id || idx}>
                  <td>
                    <b>{doc.doctor_id || `DOC-${100 + idx}`} · {doc.name}</b>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{doc.qualification || 'MBBS, MD'}</div>
                  </td>
                  <td>
                    <span style={{ color: '#0284c7', fontWeight: 600 }}>{doc.department || 'General Medicine'}</span>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{doc.specialization || 'Clinical Specialist'}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{doc.shift || 'Morning'}</span>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{doc.opd_timing || '09:00 AM - 02:00 PM'}</div>
                  </td>
                  <td>
                    <span style={{ background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem' }}>
                      {doc.room_number || 'OPD-101'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>
                        {currentCount} / {maxPatients}
                      </span>
                      <div
                        style={{
                          width: 50,
                          height: 5,
                          background: '#e2e8f0',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: '#0284c7',
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    {isEr ? (
                      <span className="badge-critical">On Duty (ER)</span>
                    ) : (
                      <span className="badge-stable">{doc.availability || 'Available'}</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-clinical btn-outline"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => handleAssignDoctor(doc.name, 'Rahul Patil (P-10245)')}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
