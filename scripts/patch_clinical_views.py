import os

def replace_between(content, start_marker, end_marker, replacement):
    idx_start = content.find(start_marker)
    if idx_start == -1:
        print(f"Start marker not found: {start_marker[:30]}...")
        return content, False
    idx_end = content.find(end_marker, idx_start)
    if idx_end == -1:
        print(f"End marker not found: {end_marker[:30]}...")
        return content, False
    new_content = content[:idx_start] + replacement + content[idx_end:]
    return new_content, True


def patch_appointments():
    path = os.path.join('frontend', 'src', 'components', 'AppointmentsView.jsx')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'CLINICAL_APPOINTMENTS' not in content:
        content = content.replace(
            "import React, { useState } from 'react';",
            "import React, { useState } from 'react';\nimport { CLINICAL_APPOINTMENTS } from '../data/clinicalDataset';"
        )

    start_marker = "  const appointments = ["
    end_marker = "  const filteredAppointments = appointments.filter("
    replacement = """  const appointments = CLINICAL_APPOINTMENTS;

  const todayCount = appointments.filter((a) => a.type === 'today' || a.date?.includes('14 Oct')).length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;
  const upcomingCount = appointments.filter((a) => a.status === 'Upcoming' || a.status === 'Scheduled').length;
  const cancelledCount = appointments.filter((a) => a.status === 'Cancelled').length;

"""
    content, ok = replace_between(content, start_marker, end_marker, replacement)
    if ok:
        print("Patched appointments in AppointmentsView.jsx")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def patch_laboratory():
    path = os.path.join('frontend', 'src', 'components', 'LaboratoryView.jsx')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'CLINICAL_LAB_ORDERS' not in content:
        content = content.replace(
            "import React, { useState } from 'react';",
            "import React, { useState } from 'react';\nimport { CLINICAL_LAB_ORDERS } from '../data/clinicalDataset';"
        )

    start_marker = "  const labOrders = ["
    end_marker = "  const filteredOrders = labOrders.filter("
    replacement = """  const labOrders = CLINICAL_LAB_ORDERS;

  const totalLabCount = labOrders.length;
  const completedLabCount = labOrders.filter((o) => o.status === 'Completed').length;
  const inProgressLabCount = labOrders.filter((o) => o.status === 'In Progress').length;
  const pendingLabCount = labOrders.filter((o) => o.status === 'Pending').length;

"""
    content, ok = replace_between(content, start_marker, end_marker, replacement)
    if ok:
        print("Patched labOrders in LaboratoryView.jsx")

    # Update static KPI card numbers
    content = content.replace('<span className="kpi-number">32</span>', '<span className="kpi-number">{totalLabCount}</span>')
    content = content.replace('<span className="kpi-number">18</span>\n              <span className="kpi-percent text-green">56%</span>', '<span className="kpi-number">{completedLabCount}</span>\n              <span className="kpi-percent text-green">{Math.round((completedLabCount / (totalLabCount || 1)) * 100)}%</span>')
    content = content.replace('<span className="kpi-number">8</span>\n              <span className="kpi-percent text-orange">25%</span>', '<span className="kpi-number">{inProgressLabCount}</span>\n              <span className="kpi-percent text-orange">{Math.round((inProgressLabCount / (totalLabCount || 1)) * 100)}%</span>')
    content = content.replace('<span className="kpi-number">6</span>\n              <span className="kpi-percent text-red">19%</span>', '<span className="kpi-number">{pendingLabCount}</span>\n              <span className="kpi-percent text-red">{Math.round((pendingLabCount / (totalLabCount || 1)) * 100)}%</span>')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def patch_pharmacy():
    path = os.path.join('frontend', 'src', 'components', 'PharmacyView.jsx')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'CLINICAL_PRESCRIPTIONS' not in content:
        content = content.replace(
            "import React, { useState } from 'react';",
            "import React, { useState } from 'react';\nimport { CLINICAL_PRESCRIPTIONS } from '../data/clinicalDataset';"
        )

    start_marker = "  const prescriptions = ["
    end_marker = "  const filteredPrescriptions = prescriptions.filter("
    replacement = """  const prescriptions = CLINICAL_PRESCRIPTIONS;

  const totalRxCount = prescriptions.length;
  const dispensedRxCount = prescriptions.filter((p) => p.status === 'Dispensed').length;
  const inProcessRxCount = prescriptions.filter((p) => p.status === 'In Process').length;
  const pendingRxCount = prescriptions.filter((p) => p.status === 'Pending').length;

"""
    content, ok = replace_between(content, start_marker, end_marker, replacement)
    if ok:
        print("Patched prescriptions in PharmacyView.jsx")

    # Dynamic count in footer
    content = content.replace('of 68 prescriptions', 'of {prescriptions.length} prescriptions')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def patch_referrals():
    path = os.path.join('frontend', 'src', 'components', 'ReferralsView.jsx')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'CLINICAL_REFERRALS' not in content:
        content = content.replace(
            "import React, { useState } from 'react';",
            "import React, { useState } from 'react';\nimport { CLINICAL_REFERRALS } from '../data/clinicalDataset';"
        )

    start_marker = "  const referrals = ["
    end_marker = "  const filteredReferrals = referrals.filter("
    replacement = """  const referrals = CLINICAL_REFERRALS;

"""
    content, ok = replace_between(content, start_marker, end_marker, replacement)
    if ok:
        print("Patched referrals in ReferralsView.jsx")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def patch_documents():
    path = os.path.join('frontend', 'src', 'components', 'DocumentsView.jsx')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'CLINICAL_DOCUMENTS' not in content:
        content = content.replace(
            "import React, { useState } from 'react';",
            "import React, { useState } from 'react';\nimport { CLINICAL_DOCUMENTS } from '../data/clinicalDataset';"
        )

    start_marker = "  const documents = ["
    end_marker = "  const quickFilterCounts = {"
    replacement = """  const documents = CLINICAL_DOCUMENTS;

"""
    content, ok = replace_between(content, start_marker, end_marker, replacement)
    if ok:
        print("Patched documents in DocumentsView.jsx")

    # Update quickFilterCounts
    start_q = "  const quickFilterCounts = {"
    end_q = "  const filteredDocs = documents.filter("
    replacement_q = """  const quickFilterCounts = {
    all: documents.length,
    reports: documents.filter((d) => d.category === 'Report').length,
    images: documents.filter((d) => d.category === 'Image').length,
    prescriptions: documents.filter((d) => d.category === 'Prescription').length,
    other: documents.filter((d) => d.category === 'Other').length,
  };

"""
    content, ok_q = replace_between(content, start_q, end_q, replacement_q)
    if ok_q:
        print("Patched quickFilterCounts in DocumentsView.jsx")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def patch_reports():
    path = os.path.join('frontend', 'src', 'components', 'ReportsView.jsx')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'ALL_MONITORING_RECORDS' not in content:
        content = content.replace(
            "import React, { useState, useEffect } from 'react';",
            "import React, { useState, useEffect } from 'react';\nimport { ALL_MONITORING_RECORDS, CLINICAL_REPORTS_ANALYTICS } from '../data/clinicalDataset';"
        )

    # 1. Replace fallbackPatients
    start_fb = "  const fallbackPatients = ["
    end_fb = "  const [patientsData, setPatientsData] = useState(fallbackPatients);"
    replacement_fb = """  const fallbackPatients = ALL_MONITORING_RECORDS;

"""
    content, ok_fb = replace_between(content, start_fb, end_fb, replacement_fb)
    if ok_fb:
        print("Patched fallbackPatients in ReportsView.jsx")

    # 2. Replace reportsList
    start_rl = "  // Tab 1 Reports List\n  const reportsList = ["
    end_rl = "  // Filtering for Tab 1"
    replacement_rl = """  // Tab 1 Reports List
  const reportsList = CLINICAL_REPORTS_ANALYTICS;

"""
    content, ok_rl = replace_between(content, start_rl, end_rl, replacement_rl)
    if ok_rl:
        print("Patched reportsList in ReportsView.jsx")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def patch_overview_dashboard():
    path = os.path.join('frontend', 'src', 'components', 'OverviewDashboard.jsx')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'ALL_MONITORING_RECORDS' not in content:
        content = content.replace(
            "import React from 'react';",
            "import React from 'react';\nimport { ALL_MONITORING_RECORDS } from '../data/clinicalDataset';"
        )

    start_q = "  const defaultPatientQueue = ["
    end_q = "  const patientQueue = propPatientQueue"
    replacement_q = """  const defaultPatientQueue = ALL_MONITORING_RECORDS.slice(0, 10).map((p, idx) => ({
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

"""
    content, ok_q = replace_between(content, start_q, end_q, replacement_q)
    if ok_q:
        print("Patched defaultPatientQueue in OverviewDashboard.jsx")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


if __name__ == '__main__':
    patch_appointments()
    patch_laboratory()
    patch_pharmacy()
    patch_referrals()
    patch_documents()
    patch_reports()
    patch_overview_dashboard()
    print("Component views patched!")
