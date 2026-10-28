# IHMS Patient Clinical Monitoring & Triage ML Report

## 1. Executive Summary

This report documents the end-to-end implementation of the **Patient Clinical Monitoring & Triage Machine Learning System** integrated with **PostgreSQL** for the Intelligent Hospital Management System (IHMS).

- **Dataset Size:** 2,500 complete inpatient records across all hospital units.
- **Database Engine:** PostgreSQL 18 (`IHMS_Project` on Docker port 5433 / internal 5432).
- **Primary Model:** Patient Deterioration & Triage Classifier (`Monitoring_Level`).
- **Primary Model Accuracy:** **95.80%** (Macro F1: **0.8840**, Triage Match on DB: **99.16%**).
- **Secondary Model:** Care Unit / Ward Placement Recommendation Classifier (`Care_Unit`).
- **Production Status:** Database tables migrated, 2,500 records loaded, predictions computed and synced to PostgreSQL, and REST APIs verified.

---

## 2. PostgreSQL Database Architecture

### Configuration
- **Host:** `127.0.0.1` / `db` (Docker Compose network)
- **Port:** `5433` (Host) / `5432` (Container)
- **Database Name:** `IHMS_Project`
- **User:** `Root`
- **Active Engine:** `django.db.backends.postgresql`

### Data Model: `PatientClinicalMonitoring` (`patients_patientclinicalmonitoring`)
Contains all 30 physiological, demographic, and operational fields from the dataset:
- **Demographics:** `patient_id`, `first_name`, `last_name`, `date_of_birth`, `age`, `gender`, `phone`, `email`, `city`, `patient_category`, `allergy_status`, `record_status`
- **Location:** `care_location_type`, `room_no`, `bed_no`, `care_unit`
- **Vital Signs:** `heart_rate_bpm`, `systolic_bp_mmhg`, `diastolic_bp_mmhg`, `respiratory_rate_bpm`, `spo2_percent`, `temperature_c`, `blood_glucose_mg_dl`, `gcs_score`, `pain_score`, `ecg_rhythm`, `urine_output_ml_hr`, `monitoring_frequency`, `monitoring_last_updated`
- **AI Prediction Columns:**
  - `predicted_monitoring_level`: `Routine` | `Enhanced` | `Continuous`
  - `prediction_confidence`: 0.0 to 1.0 (probability of winning class)
  - `predicted_care_unit`: Recommended ward/unit
  - `risk_score`: 0 to 100 clinical deterioration score
  - `deterioration_risk`: `Low` | `Moderate` | `High`

---

## 3. Machine Learning Architecture & Feature Engineering

### Engineered Clinical Biomarkers (29 Features)
1. **Core Vitals:** Heart rate, Systolic BP, Diastolic BP, Respiratory rate, SpO2, Temperature, Blood glucose, GCS score, Pain score, Urine output, Age.
2. **Derived Hemodynamic & Physiological Flags:**
   - **Mean Arterial Pressure (MAP):** $DBP + \frac{SBP - DBP}{3}$
   - **Pulse Pressure:** $SBP - DBP$
   - **Shock Index:** $\frac{Heart Rate}{Systolic BP}$
   - **Hypoxia Risk Flag:** $SpO_2 < 95.0\%$
   - **Tachycardia Flag:** $HR > 100\text{ bpm}$
   - **Bradycardia Flag:** $HR < 60\text{ bpm}$
   - **GCS Neurological Impairment Flag:** $GCS < 15$
   - **Hypotension Shock Flag:** $SBP < 90\text{ mmHg}$
   - **Hypertension Flag:** $SBP \ge 140\text{ mmHg}$
   - **Fever Flag:** $Temp > 38.0^\circ\text{C}$
   - **Hypothermia Flag:** $Temp < 36.0^\circ\text{C}$
   - **Oliguria Flag:** $Urine < 30.0\text{ mL/hr}$
   - **Hyperglycemia Flag:** $Glucose > 180\text{ mg/dL}$
   - **Severe Pain Flag:** $Pain \ge 7/10$
3. **Categorical Encodings:** Gender, Patient Category, Allergy Status, ECG Rhythm.

---

## 4. Model Training & Evaluation Metrics

### Algorithm Comparison (80/20 Stratified Split)

| Algorithm | Overall Accuracy | Balanced Accuracy | Macro Precision | Macro Recall | Macro F1 |
|---|---|---|---|---|---|
| **RandomForestClassifier** (Selected) | **95.80%** | **87.77%** | **89.29%** | **87.77%** | **0.8840** |
| HistGradientBoostingClassifier | 95.00% | 85.49% | 88.34% | 85.49% | 0.8660 |
| ExtraTreesClassifier | 93.80% | 81.45% | 82.91% | 81.45% | 0.8216 |
| LogisticRegression | 93.00% | 84.80% | 83.10% | 84.80% | 0.8369 |

### Top 10 Clinical Feature Importances

1. **GCS Score (`gcs_score`):** **15.94%** (Alertness & mental status is the #1 acute driver)
2. **Respiratory Rate (`respiratory_rate_bpm`):** **8.41%** (Tachypnea is early sign of deterioration)
3. **Heart Rate (`heart_rate_bpm`):** **6.30%**
4. **Blood Glucose (`blood_glucose_mg_dl`):** **6.08%**
5. **Body Temperature (`temperature_c`):** **5.60%**
6. **Blood Oxygen (`spo2_percent`):** **5.40%**
7. **Pain Score (`pain_score`):** **4.37%**
8. **Systolic BP (`systolic_bp_mmhg`):** **3.95%**
9. **Hyperglycemia Indicator (`hyperglycemia_flag`):** **3.17%**
10. **ECG ST-T Changes (`ecg_rhythm_ST-T Changes`):** **3.09%**

---

## 5. PostgreSQL Ingestion & In-Database Risk Breakdown

All 2,500 patient records were loaded into PostgreSQL and evaluated via vectorized batch inference:
- **Total Inpatient Records in PostgreSQL:** 2,500
- **Overall Triage Concordance:** **99.16% (2,479 / 2,500)**
- **PostgreSQL Deterioration Risk Breakdown:**
  - **High Risk (ICU Escalation / Continuous Monitoring):** 345 patients
  - **Moderate Risk (Emergency Bay / Enhanced Triage):** 215 patients
  - **Low Risk (Stable Inpatient / Routine Monitoring):** 1,940 patients

---

## 6. API & Integration Usage

### 1. Model Registry
```python
from ml_models.model_registry import get_predictor

predictor = get_predictor('patient_triage')
result = predictor({
    'heart_rate_bpm': 125,
    'systolic_bp_mmhg': 88,
    'diastolic_bp_mmhg': 55,
    'spo2_percent': 90.0,
    'temperature_c': 39.1,
    'gcs_score': 9,
    'pain_score': 8,
    'urine_output_ml_hr': 18.0
})
# Returns predicted_monitoring_level, risk_score, deterioration_risk, clinical_alerts
```

### 2. REST API Endpoints
- **List / Filter Patient Monitoring Records in PostgreSQL:**
  `GET /api/patients/monitoring/?deterioration_risk=High`
- **Run Real-Time Triage & Sync to PostgreSQL:**
  `POST /api/patients/monitoring/triage-predict/`
  Body: `{"patient_id": "PAT-000018"}`
