import React, { useState } from 'react';
import { CLINICAL_DOCUMENTS } from '../data/clinicalDataset';

export default function DocumentsView({ onOpenPdfModal, onSelectPatient, onNavigateTab, onBack }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [modalTab, setModalTab] = useState('preview'); // 'preview' | 'details' | 'history'
  const [zoomLevel, setZoomLevel] = useState(100);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const documents = Array.isArray(CLINICAL_DOCUMENTS) ? CLINICAL_DOCUMENTS : [];

  const quickFilterCounts = {
    all: documents.length,
    reports: documents.filter((d) => (d.category || d.type || '').toLowerCase() === 'report').length,
    images: documents.filter((d) => (d.category || d.type || '').toLowerCase() === 'image').length,
    prescriptions: documents.filter((d) => (d.category || d.type || '').toLowerCase() === 'prescription').length,
    other: documents.filter((d) => {
      const cat = (d.category || d.type || '').toLowerCase();
      return cat !== 'report' && cat !== 'image' && cat !== 'prescription';
    }).length,
  };

  const filteredDocs = documents.filter((d) => {
    const cat = (d.category || d.type || '').toLowerCase();
    if (activeTab === 'reports' && cat !== 'report') return false;
    if (activeTab === 'images' && cat !== 'image') return false;
    if (activeTab === 'prescriptions' && cat !== 'prescription') return false;
    if (activeTab === 'other' && (cat === 'report' || cat === 'image' || cat === 'prescription')) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (d.name || d.file_name || '').toLowerCase();
      const patientName = (d.patientName || d.patient_name || d.patient || '').toLowerCase();
      const pid = (d.pid || d.patient_id || '').toLowerCase();
      const category = (d.category || d.type || '').toLowerCase();
      return (
        name.includes(q) ||
        patientName.includes(q) ||
        pid.includes(q) ||
        category.includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedDocs = filteredDocs.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getCategoryBadge = (category) => {
    if (category === 'Report') return <span className="ihms-badge-pill badge-blue">Report</span>;
    if (category === 'Image') return <span className="ihms-badge-pill badge-green">Image</span>;
    if (category === 'Prescription') return <span className="ihms-badge-pill badge-pink">Prescription</span>;
    return <span className="ihms-badge-pill badge-purple">{category || 'Other'}</span>;
  };

  const getFileIcon = (fileType, color = '#2563eb') => {
    if (fileType === 'pdf') {
      return (
        <div className="doc-type-icon-box" style={{ background: `${color}18`, color: color }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
      );
    }
    return (
      <div className="doc-type-icon-box" style={{ background: `${color}18`, color: color }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  };

  const handleOpenModal = (doc) => {
    setSelectedDoc(doc);
    setModalTab('preview');
    setZoomLevel(100);
  };

  const handleCloseModal = () => {
    setSelectedDoc(null);
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
          <div className="ihms-page-header-icon-wrap icon-documents">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <h1 className="ihms-page-title">Documents</h1>
            <p className="ihms-page-subtitle">Store, manage and access patient documents securely</p>
          </div>
        </div>

        <button
          type="button"
          className="ihms-primary-action-btn"
          onClick={onOpenPdfModal}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Upload Document</span>
        </button>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="ihms-kpi-grid">
        {/* Total Documents */}
        <div className="ihms-kpi-card" onClick={() => handleTabChange('all')}>
          <div className="kpi-icon-wrap kpi-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">{quickFilterCounts.all}</span>
            </div>
            <span className="kpi-label">Total Documents</span>
          </div>
        </div>

        {/* Reports */}
        <div className="ihms-kpi-card" onClick={() => handleTabChange('reports')}>
          <div className="kpi-icon-wrap kpi-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">{quickFilterCounts.reports}</span>
            </div>
            <span className="kpi-label">Reports</span>
          </div>
        </div>

        {/* Images */}
        <div className="ihms-kpi-card" onClick={() => handleTabChange('images')}>
          <div className="kpi-icon-wrap kpi-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">{quickFilterCounts.images}</span>
            </div>
            <span className="kpi-label">Images</span>
          </div>
        </div>

        {/* Prescriptions */}
        <div className="ihms-kpi-card" onClick={() => handleTabChange('prescriptions')}>
          <div className="kpi-icon-wrap kpi-red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
              <path d="m8.5 8.5 7 7" />
            </svg>
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className="kpi-number">{quickFilterCounts.prescriptions}</span>
            </div>
            <span className="kpi-label">Prescriptions</span>
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            </svg>
            <span>All Documents</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => handleTabChange('reports')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            <span>Reports</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => handleTabChange('images')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span>Images</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'prescriptions' ? 'active' : ''}`}
            onClick={() => handleTabChange('prescriptions')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Prescriptions</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'other' ? 'active' : ''}`}
            onClick={() => handleTabChange('other')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Other</span>
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
            </svg>
            <span>{selectedDept}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <div className="ihms-table-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Main 2-Column Content Layout (Table + Right Widgets) */}
      <div className="ihms-documents-grid-layout">
        {/* Left Side: Table */}
        <div className="ihms-card-table-wrap">
          <table className="ihms-data-table">
            <thead>
              <tr>
                <th style={{ width: '38px', textAlign: 'center' }}>
                  <input type="checkbox" className="ihms-table-checkbox" />
                </th>
                <th style={{ width: '38px', textAlign: 'center' }}>#</th>
                <th>Document</th>
                <th>Patient</th>
                <th>Category</th>
                <th>Date & Time</th>
                <th>Size</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDocs.map((doc, idx) => {
                const itemIndex = (safePage - 1) * pageSize + idx + 1;
                const docName = doc.name || doc.file_name || 'Document';
                const patientName = doc.patientName || doc.patient_name || doc.patient || 'Unknown Patient';
                const pid = doc.pid || doc.patient_id || 'PID-000';
                const category = doc.category || doc.type || 'Other';
                const color = doc.color || '#2563eb';

                return (
                  <tr key={doc.id || `doc-${itemIndex}`}>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" className="ihms-table-checkbox" />
                    </td>
                    <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{itemIndex}</td>
                    <td>
                      <div className="ihms-doc-name-cell">
                        {getFileIcon(doc.fileType, color)}
                        <span className="doc-name-text" onClick={() => handleOpenModal(doc)} title={docName}>
                          {docName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="ihms-patient-cell">
                        <img
                          src={doc.avatar}
                          alt={patientName}
                          className="ihms-patient-avatar"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="ihms-patient-avatar-fallback" style={{ display: 'none' }}>
                          {patientName.charAt(0)}
                        </div>
                        <div className="ihms-patient-meta">
                          <span className="ihms-patient-name">{patientName}</span>
                          <span className="ihms-patient-pid">{pid}</span>
                        </div>
                      </div>
                    </td>
                    <td>{getCategoryBadge(category)}</td>
                    <td>
                      <div className="ihms-datetime-cell">
                        <span className="date-part">{doc.date || '2026-10-14'}</span>
                        <span className="time-part">{doc.time || '10:00 AM'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="doc-size-text">{doc.size || '1.2 MB'}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="ihms-action-cell">
                        <button
                          type="button"
                          className="btn-view-pill"
                          onClick={() => handleOpenModal(doc)}
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
              {paginatedDocs.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    No documents found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Table Footer with Pagination */}
          <div className="ihms-table-footer">
            <div className="ihms-table-info">
              Showing {filteredDocs.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, filteredDocs.length)} of {filteredDocs.length} documents
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

        {/* Right Side: Storage & Quick Filters Sidebar Widgets */}
        <div className="ihms-doc-side-widgets">
          {/* Widget 1: Storage Usage */}
          <div className="ihms-side-widget-card">
            <div className="side-widget-header">
              <div className="widget-header-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                <span>Storage Usage</span>
              </div>
              <span className="storage-percent-badge">24%</span>
            </div>
            <div className="storage-sub-row">
              <span className="storage-details">2.4 GB of 10 GB used</span>
            </div>
            <div className="storage-bar-track">
              <div className="storage-bar-fill" style={{ width: '24%' }} />
            </div>
          </div>

          {/* Widget 2: Quick Filters */}
          <div className="ihms-side-widget-card">
            <div className="side-widget-header" style={{ marginBottom: '0.8rem' }}>
              <div className="widget-header-title">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <span>Quick Filters</span>
              </div>
            </div>
            <div className="quick-filter-list">
              <div
                className={`quick-filter-item ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => handleTabChange('all')}
              >
                <div className="qf-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  </svg>
                  <span>All Documents</span>
                </div>
                <span className="qf-count">{quickFilterCounts.all}</span>
              </div>

              <div
                className={`quick-filter-item ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => handleTabChange('reports')}
              >
                <div className="qf-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                  <span>Reports</span>
                </div>
                <span className="qf-count">{quickFilterCounts.reports}</span>
              </div>

              <div
                className={`quick-filter-item ${activeTab === 'images' ? 'active' : ''}`}
                onClick={() => handleTabChange('images')}
              >
                <div className="qf-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <span>Images</span>
                </div>
                <span className="qf-count">{quickFilterCounts.images}</span>
              </div>

              <div
                className={`quick-filter-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
                onClick={() => handleTabChange('prescriptions')}
              >
                <div className="qf-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Prescriptions</span>
                </div>
                <span className="qf-count">{quickFilterCounts.prescriptions}</span>
              </div>

              <div
                className={`quick-filter-item ${activeTab === 'other' ? 'active' : ''}`}
                onClick={() => handleTabChange('other')}
              >
                <div className="qf-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Other</span>
                </div>
                <span className="qf-count">{quickFilterCounts.other}</span>
              </div>
            </div>
          </div>

          {/* Widget 3: Recent Uploads */}
          <div className="ihms-side-widget-card">
            <div className="side-widget-header" style={{ marginBottom: '0.85rem' }}>
              <div className="widget-header-title">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Recent Uploads</span>
              </div>
              <span className="widget-header-link" onClick={() => handleTabChange('all')}>View All</span>
            </div>

            <div className="recent-upload-list">
              {documents.slice(0, 3).map((d, i) => (
                <div key={d.id || i} className="recent-upload-item" onClick={() => handleOpenModal(d)}>
                  <div className="doc-type-icon-box" style={{ background: `${d.color || '#2563eb'}18`, color: d.color || '#2563eb', width: '32px', height: '32px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    </svg>
                  </div>
                  <div className="recent-upload-meta">
                    <span className="ru-title">{d.name || d.file_name}</span>
                    <span className="ru-sub">{d.patientName || d.patient} · {d.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. View Details Pop-up Modal (Matching STEP 2 in Image 3) */}
      {selectedDoc && (
        <div className="ihms-modal-backdrop" onClick={handleCloseModal}>
          <div className="ihms-modal-card doc-preview-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="ihms-modal-header" style={{ padding: '1.25rem 1.5rem 1rem 1.5rem' }}>
              <div className="modal-doc-header-left">
                <div className="modal-doc-icon-badge" style={{ background: `${selectedDoc.color || '#2563eb'}18`, color: selectedDoc.color || '#2563eb' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <h3 className="modal-doc-title">{selectedDoc.name || selectedDoc.file_name}</h3>
                  <p className="modal-doc-subtitle">
                    {selectedDoc.patientName || selectedDoc.patient} | {selectedDoc.pid || selectedDoc.patient_id}
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
            <div className="ihms-modal-tabs" style={{ padding: '0 1.5rem' }}>
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === 'preview' ? 'active' : ''}`}
                onClick={() => setModalTab('preview')}
              >
                Preview
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === 'details' ? 'active' : ''}`}
                onClick={() => setModalTab('details')}
              >
                Details
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
            <div className="ihms-modal-body" style={{ padding: '1.25rem 1.5rem 1rem 1.5rem' }}>
              {modalTab === 'preview' && (
                <div className="doc-preview-wrapper">
                  {/* Top Viewer Toolbar */}
                  <div className="doc-preview-toolbar">
                    <div className="doc-tb-left">
                      <button type="button" className="doc-tb-btn" title="Menu">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="3" y1="12" x2="21" y2="12" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <div className="doc-tb-center">
                      <button
                        type="button"
                        className="doc-tb-btn"
                        onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                        title="Zoom Out"
                      >
                        −
                      </button>
                      <span className="doc-zoom-text">{zoomLevel}%</span>
                      <button
                        type="button"
                        className="doc-tb-btn"
                        onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                        title="Zoom In"
                      >
                        +
                      </button>
                    </div>

                    <div className="doc-tb-right">
                      <button type="button" className="doc-tb-btn" title="Fullscreen">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                      </button>
                      <button type="button" className="doc-tb-btn" title="Download">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                      <button type="button" className="doc-tb-btn" onClick={() => window.print()} title="Print">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 6 2 18 2 18 9" />
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                          <rect x="6" y="14" width="12" height="8" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Rendered Document Sheet (Exact Image 3 Step 2) */}
                  <div className="doc-rendered-sheet" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}>
                    {/* Sheet Header */}
                    <div className="sheet-header">
                      <div className="sheet-brand">
                        <div className="brand-cross-mini">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563eb">
                            <path d="M19 10.5h-5.5V5a1.5 1.5 0 0 0-3 0v5.5H5a1.5 1.5 0 0 0 0 3h5.5V19a1.5 1.5 0 0 0 3 0v-5.5H19a1.5 1.5 0 0 0 0-3z" />
                          </svg>
                        </div>
                        <div>
                          <div className="sheet-brand-name">IHMS</div>
                          <div className="sheet-brand-sub">Intelligent Hospital Management System</div>
                        </div>
                      </div>
                      <div className="sheet-doc-type-title">PRESCRIPTION</div>
                    </div>

                    {/* Patient Meta 2-Column Table */}
                    <div className="sheet-meta-grid">
                      <div className="sheet-meta-row">
                        <span className="sm-label">Patient Name</span>
                        <span className="sm-sep">:</span>
                        <span className="sm-val font-bold">{selectedDoc.patientName || selectedDoc.patient || 'Patient'}</span>
                      </div>
                      <div className="sheet-meta-row">
                        <span className="sm-label">Patient ID</span>
                        <span className="sm-sep">:</span>
                        <span className="sm-val font-mono">{selectedDoc.pid || selectedDoc.patient_id || 'PID-000'}</span>
                      </div>
                      <div className="sheet-meta-row">
                        <span className="sm-label">Age / Gender</span>
                        <span className="sm-sep">:</span>
                        <span className="sm-val">{selectedDoc.age || '45'} / {selectedDoc.gender || 'M'}</span>
                      </div>
                      <div className="sheet-meta-row">
                        <span className="sm-label">Date</span>
                        <span className="sm-sep">:</span>
                        <span className="sm-val">{selectedDoc.date || '2026-10-14'}</span>
                      </div>
                      <div className="sheet-meta-row">
                        <span className="sm-label">Doctor</span>
                        <span className="sm-sep">:</span>
                        <span className="sm-val font-bold">Dr. Amit Deshmukh</span>
                      </div>
                      <div className="sheet-meta-row">
                        <span className="sm-label">Department</span>
                        <span className="sm-sep">:</span>
                        <span className="sm-val">General Medicine</span>
                      </div>
                    </div>

                    {/* Sheet Prescription Table */}
                    <table className="sheet-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dose</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="font-bold">Paracetamol</td>
                          <td>500 mg</td>
                          <td>1-0-1</td>
                          <td>5 Days</td>
                        </tr>
                        <tr>
                          <td className="font-bold">Azithromycin</td>
                          <td>500 mg</td>
                          <td>1-0-0</td>
                          <td>3 Days</td>
                        </tr>
                        <tr>
                          <td className="font-bold">Montelukast</td>
                          <td>10 mg</td>
                          <td>0-0-1</td>
                          <td>5 Days</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Sheet Notes */}
                    <div className="sheet-notes-section">
                      <div className="sheet-notes-title">Notes:</div>
                      <ul className="sheet-notes-list">
                        <li>• Take medicine after food.</li>
                        <li>• Follow up after 5 days.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Metadata Bar below Preview */}
                  <div className="doc-preview-meta-bar">
                    <div className="dp-meta-item">
                      <div className="dp-meta-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                        </svg>
                      </div>
                      <div className="dp-meta-content">
                        <span className="dp-label">Date & Time</span>
                        <span className="dp-val">{selectedDoc.date}, {selectedDoc.time}</span>
                      </div>
                    </div>

                    <div className="dp-meta-item">
                      <div className="dp-meta-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        </svg>
                      </div>
                      <div className="dp-meta-content">
                        <span className="dp-label">Size</span>
                        <span className="dp-val">{selectedDoc.size}</span>
                      </div>
                    </div>

                    <div className="dp-meta-item">
                      <div className="dp-meta-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </div>
                      <div className="dp-meta-content">
                        <span className="dp-label">Category</span>
                        <div>{getCategoryBadge(selectedDoc.category)}</div>
                      </div>
                    </div>

                    <div className="dp-meta-item" style={{ flex: 1.5 }}>
                      <div className="dp-meta-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                        </svg>
                      </div>
                      <div className="dp-meta-content">
                        <span className="dp-label">Report</span>
                        <span className="dp-val text-slate-700">{selectedDoc.notes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'details' && (
                <div className="modal-key-value-list">
                  <div className="modal-kv-row">
                    <span className="modal-kv-label">File Name</span>
                    <span className="modal-kv-value font-mono font-bold">{selectedDoc.name || selectedDoc.file_name}</span>
                  </div>
                  <div className="modal-kv-row">
                    <span className="modal-kv-label">Patient Associated</span>
                    <span className="modal-kv-value font-bold">{selectedDoc.patientName || selectedDoc.patient} ({selectedDoc.pid || selectedDoc.patient_id})</span>
                  </div>
                  <div className="modal-kv-row">
                    <span className="modal-kv-label">Uploaded By</span>
                    <span className="modal-kv-value">{selectedDoc.uploadedBy || 'Medical Records Dept'}</span>
                  </div>
                  <div className="modal-kv-row">
                    <span className="modal-kv-label">Description</span>
                    <span className="modal-kv-value">{selectedDoc.description || selectedDoc.notes || 'Clinical patient record document'}</span>
                  </div>
                </div>
              )}

              {modalTab === 'history' && (
                <div className="modal-history-timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-title">Uploaded to Patient Chart</span>
                        <span className="timeline-time">{selectedDoc.time}</span>
                      </div>
                      <p className="timeline-desc">Uploaded by {selectedDoc.uploadedBy}</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-title">OCR & Medical Classification</span>
                        <span className="timeline-time">+2 min</span>
                      </div>
                      <p className="timeline-desc">Verified as {selectedDoc.category} by system</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Buttons */}
            <div className="ihms-modal-footer" style={{ padding: '0.85rem 1.5rem 1.25rem 1.5rem' }}>
              <button
                type="button"
                className="btn-modal-outline"
                onClick={() => alert(`Downloading ${selectedDoc.name}...`)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download</span>
              </button>

              <button
                type="button"
                className="btn-modal-primary"
                onClick={() => {
                  if (onOpenPdfModal) onOpenPdfModal();
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>View Full Screen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
