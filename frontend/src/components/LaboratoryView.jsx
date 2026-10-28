import React, { useState } from 'react';
import { CLINICAL_LAB_ORDERS } from '../data/clinicalDataset';

export default function LaboratoryView({ onOpenPdfModal, onSelectPatient, onOpenLabModal }) {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState('14 Oct 2026');
  const [selectedTestType, setSelectedTestType] = useState('All Test Types');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalTab, setModalTab] = useState('details');

  const labOrders = CLINICAL_LAB_ORDERS || [];
  const pageSize = 20;

  const totalLabCount = labOrders.length;
  const completedLabCount = labOrders.filter((o) => o?.status === 'Completed').length;
  const inProgressLabCount = labOrders.filter((o) => o?.status === 'In Progress').length;
  const pendingLabCount = labOrders.filter((o) => o?.status === 'Pending').length;

  const handleTabChange = (tab) => { setActiveTab(tab); setCurrentPage(1); };
  const handleTestTypeChange = (t) => { setSelectedTestType(t); setCurrentPage(1); };
  const handleStatusChange = (s) => { setSelectedStatus(s); setCurrentPage(1); };

  const filteredOrders = labOrders.filter((order) => {
    if (!order) return false;
    const status = order.status || '';
    const testName = order.testName || order.test || '';
    if (activeTab === 'pending' && status !== 'Pending') return false;
    if (activeTab === 'in-progress' && status !== 'In Progress') return false;
    if (activeTab === 'completed' && status !== 'Completed') return false;
    if (activeTab === 'cancelled' && status !== 'Cancelled') return false;
    if (selectedStatus !== 'All Status' && status !== selectedStatus) return false;
    if (selectedTestType !== 'All Test Types' && !testName.toLowerCase().includes(selectedTestType.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

  const getStatusBadge = (status) => {
    if (status === 'Completed') {
      return <span className="ihms-badge-pill badge-green">Completed</span>;
    }
    if (status === 'In Progress') {
      return <span className="ihms-badge-pill badge-orange">In Progress</span>;
    }
    if (status === 'Pending') {
      return <span className="ihms-badge-pill badge-red">Pending</span>;
    }
    if (status === 'Cancelled') {
      return <span className="ihms-badge-pill badge-red">Cancelled</span>;
    }
    return <span className="ihms-badge-pill badge-blue">{status}</span>;
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setModalTab('details');
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="ihms-view-container">
      {/* 1. Page Header (Matching Image 2 Exactly) */}
      <div className="ihms-page-header">
        <div className="ihms-page-header-left">
          <div className="ihms-page-header-icon-wrap icon-laboratory">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2v7.31a2 2 0 0 1-.58 1.42L3 17.15A2 2 0 0 0 4.41 20.6h15.18A2 2 0 0 0 21 17.15l-6.42-6.42A2 2 0 0 1 14 9.31V2" />
              <line x1="8.5" y1="2" x2="15.5" y2="2" />
              <line x1="14" y1="9" x2="10" y2="9" />
            </svg>
          </div>
          <div>
            <h1 className="ihms-page-title">Laboratory & Diagnostics</h1>
            <p className="ihms-page-subtitle">Manage lab test orders, sample collection and reports</p>
          </div>
        </div>

        <button
          type="button"
          className="ihms-primary-action-btn"
          onClick={() => (onOpenLabModal ? onOpenLabModal() : alert('New Lab Order dialog'))}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Lab Order</span>
        </button>
      </div>

      {/* 2. Four Metric KPI Cards (Matching Image 2: 32, 18 56%, 8 25%, 6 19%) */}
      <div className="ihms-kpi-grid">
        {/* Total Lab Orders */}
        <div className="ihms-kpi-card" onClick={() => setActiveTab('all')}>
          <div className="kpi-icon-wrap kpi-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="kpi-body" style={{ flex: 1 }}>
            <div className="kpi-value-row">
              <span className="kpi-number">{totalLabCount}</span>
            </div>
            <span className="kpi-label">Total Lab Orders</span>
          </div>
        </div>

        {/* Completed */}
        <div className="ihms-kpi-card" onClick={() => setActiveTab('completed')}>
          <div className="kpi-icon-wrap kpi-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="kpi-body" style={{ flex: 1 }}>
            <div className="kpi-value-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="kpi-number">{completedLabCount}</span>
              <span className="kpi-percent text-green">56%</span>
            </div>
            <span className="kpi-label">Completed</span>
            <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ width: '56%', height: '100%', background: '#10b981', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="ihms-kpi-card" onClick={() => setActiveTab('in-progress')}>
          <div className="kpi-icon-wrap kpi-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="kpi-body" style={{ flex: 1 }}>
            <div className="kpi-value-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="kpi-number">{inProgressLabCount}</span>
              <span className="kpi-percent text-orange">25%</span>
            </div>
            <span className="kpi-label">In Progress</span>
            <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ width: '25%', height: '100%', background: '#f59e0b', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="ihms-kpi-card" onClick={() => setActiveTab('pending')}>
          <div className="kpi-icon-wrap kpi-red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="kpi-body" style={{ flex: 1 }}>
            <div className="kpi-value-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="kpi-number">{pendingLabCount}</span>
              <span className="kpi-percent text-red">19%</span>
            </div>
            <span className="kpi-label">Pending</span>
            <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ width: '19%', height: '100%', background: '#ef4444', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar (Matching Image 2 Perfectly) */}
      <div className="ihms-filter-bar">
        {/* Status Tabs */}
        <div className="ihms-tab-pills">
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            <span>All Orders</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            <span>Pending</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'in-progress' ? 'active' : ''}`}
            onClick={() => handleTabChange('in-progress')}
          >
            <span>In Progress</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => handleTabChange('completed')}
          >
            <span>Completed</span>
          </button>
          <button
            type="button"
            className={`ihms-tab-pill ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => handleTabChange('cancelled')}
          >
            <span>Cancelled</span>
          </button>
        </div>

        {/* Filter Controls (Horizontal group) */}
        <div className="ihms-filter-controls">
          {/* Date Picker */}
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

          {/* Test Types Dropdown */}
          <div className="ihms-dropdown-select">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 2v7.31a2 2 0 0 1-.58 1.42L3 17.15A2 2 0 0 0 4.41 20.6h15.18A2 2 0 0 0 21 17.15l-6.42-6.42A2 2 0 0 1 14 9.31V2" />
            </svg>
            <span>{selectedTestType}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Status Dropdown */}
          <div className="ihms-dropdown-select">
            <span className="status-dot dot-green" />
            <span>{selectedStatus}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Filter Icon Button */}
          <button type="button" className="ihms-icon-action-btn" title="Filter Options">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
        </div>
      </div>

      {/* 4. Main Laboratory Orders Table (Matching Step 1 in Image 2) */}
      <div className="ihms-card-table-wrap">
        <table className="ihms-data-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              <th>Patient</th>
              <th>Patient ID</th>
              <th>Test Name</th>
              <th>Order Date</th>
              <th>Sample Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'center', width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order, idx) => {
              const rowNum = (safePage - 1) * pageSize + idx + 1;
              const pName = order.patientName || order.patient || 'Patient';
              const pPid = order.pid || order.patient_id || 'P-000';
              const pTest = order.testName || order.test || 'Diagnostic Test';
              const pAvatar = order.avatar || (order.gender === 'Female' ? '/avatars/patient_sneha.png' : '/avatars/patient_rahul.png');
              const pOrderDate = order.orderDate || order.order_date || 'Today';
              const pOrderTime = order.orderTime || '09:00 AM';
              const pSampleDate = order.sampleDate || order.orderDate || 'Today';
              const pSampleTime = order.sampleTime || '09:30 AM';
              const pStatus = order.status || 'Completed';

              return (
                <tr key={order.id || rowNum}>
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
                    <span className="reason-text font-medium" style={{ color: '#0f172a', fontWeight: 600 }}>
                      {pTest}
                    </span>
                  </td>
                  <td>
                    <div className="ihms-datetime-cell">
                      <span className="date-part">{pOrderDate}</span>
                      <span className="time-part">{pOrderTime}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ihms-datetime-cell">
                      <span className="date-part">{pSampleDate}</span>
                      <span className="time-part">{pSampleTime}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(pStatus)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="ihms-action-cell">
                      <button
                        type="button"
                        className="btn-view-pill"
                        onClick={() => handleOpenModal(order)}
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
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  No laboratory orders found matching the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Table Footer with Pagination */}
        <div className="ihms-table-footer">
          <div className="ihms-table-info">
            Showing {filteredOrders.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, filteredOrders.length)} of {filteredOrders.length} lab orders
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

      {/* 5. View Details Pop-up Modal (Matching STEP 2 in Image 2) */}
      {selectedOrder && (
        <div className="ihms-modal-backdrop" onClick={handleCloseModal}>
          <div className="ihms-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="ihms-modal-header">
              <div className="ihms-modal-user-profile">
                <img
                  src={selectedOrder.avatar}
                  alt={selectedOrder.patientName}
                  className="modal-user-avatar"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="modal-user-avatar-fallback" style={{ display: 'none' }}>
                  {selectedOrder.patientName.charAt(0)}
                </div>
                <div className="modal-user-info">
                  <div className="modal-user-title-row">
                    <h3>{selectedOrder.patientName}</h3>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <p className="modal-user-sub">
                    {selectedOrder.pid} | {selectedOrder.age} | {selectedOrder.gender}
                  </p>
                  <p className="modal-user-phone">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{selectedOrder.phone}</span>
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

            {/* Modal Tabs: Details, Reports, History */}
            <div className="ihms-modal-tabs">
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === 'details' ? 'active' : ''}`}
                onClick={() => setModalTab('details')}
              >
                Details
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === 'reports' ? 'active' : ''}`}
                onClick={() => setModalTab('reports')}
              >
                Reports
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
            <div className="ihms-modal-body">
              {modalTab === 'details' && (
                <div className="modal-key-value-list">
                  {/* Test Name */}
                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span>Test Name</span>
                    </div>
                    <div className="modal-kv-value font-medium text-slate-900" style={{ fontWeight: 700 }}>
                      {selectedOrder.testName}
                    </div>
                  </div>

                  {/* Order Date */}
                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>Order Date</span>
                    </div>
                    <div className="modal-kv-value font-medium">
                      {selectedOrder.orderDate}, {selectedOrder.orderTime}
                    </div>
                  </div>

                  {/* Sample Date */}
                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 2v7.31a2 2 0 0 1-.58 1.42L3 17.15A2 2 0 0 0 4.41 20.6h15.18A2 2 0 0 0 21 17.15l-6.42-6.42A2 2 0 0 1 14 9.31V2" />
                      </svg>
                      <span>Sample Date</span>
                    </div>
                    <div className="modal-kv-value font-medium">
                      {selectedOrder.sampleDate}, {selectedOrder.sampleTime}
                    </div>
                  </div>

                  {/* Ordered By */}
                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Ordered By</span>
                    </div>
                    <div className="modal-kv-value font-medium text-slate-800">
                      <div>{selectedOrder.orderedBy}</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 500 }}>{selectedOrder.department}</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span>Status</span>
                    </div>
                    <div className="modal-kv-value">
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="modal-kv-row">
                    <div className="modal-kv-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span>Priority</span>
                    </div>
                    <div className="modal-kv-value">
                      <span className="ihms-badge-pill badge-blue">{selectedOrder.priority}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="modal-kv-row" style={{ alignItems: 'flex-start' }}>
                    <div className="modal-kv-label" style={{ paddingTop: '2px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                      </svg>
                      <span>Notes</span>
                    </div>
                    <div className="modal-kv-value text-slate-700" style={{ fontSize: '0.86rem' }}>
                      {selectedOrder.notes}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'reports' && (
                <div className="modal-docs-list">
                  {selectedOrder.reportRows && selectedOrder.reportRows.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                        Diagnostic Test Parameters
                      </div>
                      {selectedOrder.reportRows.map((r, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '0.55rem 0.85rem',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>{r.param}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Normal: {r.normal}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0066ff' }}>{r.value}</div>
                            <span className="ihms-badge-pill badge-green" style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem' }}>
                              {r.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-text">
                      Specimen is currently in queue for analyzer processing. Results will appear once completed.
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'history' && (
                <div className="modal-history-timeline">
                  {selectedOrder.history && selectedOrder.history.map((h, i) => (
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
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer Buttons (Matching Image 2: Reschedule & View Report) */}
            <div className="ihms-modal-footer">
              <button
                type="button"
                className="btn-modal-outline"
                onClick={() => {
                  alert(`Rescheduling lab order for ${selectedOrder.patientName}...`);
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
                  if (onOpenPdfModal) onOpenPdfModal();
                  else alert(`Opening official diagnostic report for ${selectedOrder.patientName}`);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>View Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
