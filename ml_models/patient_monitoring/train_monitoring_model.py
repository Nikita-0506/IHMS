import os
import sys
import json
from pathlib import Path
from datetime import datetime
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier,
    HistGradientBoostingClassifier
)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

# Add project root to path
BASE_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BASE_DIR))

from ml_models.patient_monitoring.feature_engineering import (
    prepare_features,
    NUMERIC_COLUMNS,
    CATEGORICAL_COLUMNS
)

DATASET_CSV = BASE_DIR / 'ml_models' / 'datasets' / 'patient_clinical_monitoring.csv'
TRAINED_MODELS_DIR = BASE_DIR / 'ml_models' / 'trained_models'
REPORTS_DIR = BASE_DIR / 'ml_models' / 'reports'

def load_dataset_from_postgres_or_csv():
    """
    Attempts to read data from PostgreSQL database IHMS_Project;
    falls back to CSV if database is offline.
    """
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_ai.settings')
        import django
        django.setup()
        from patients.models import PatientClinicalMonitoring
        qs = PatientClinicalMonitoring.objects.all().values()
        df = pd.DataFrame(list(qs))
        if len(df) >= 100:
            print(f"[DATA SOURCE] Loaded {len(df)} records from PostgreSQL (IHMS_Project.patients_patientclinicalmonitoring)")
            return df, 'PostgreSQL (IHMS_Project)'
    except Exception as e:
        print(f"[DATA SOURCE NOTICE] Could not load from PostgreSQL ({e}), falling back to CSV.")

    if not DATASET_CSV.exists():
        raise FileNotFoundError(f"Dataset not found at {DATASET_CSV}")

    df = pd.read_csv(DATASET_CSV)
    print(f"[DATA SOURCE] Loaded {len(df)} records from CSV ({DATASET_CSV.name})")
    return df, f'CSV ({DATASET_CSV.name})'

def build_preprocessor():
    numeric_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    categorical_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    return ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, NUMERIC_COLUMNS),
            ('cat', categorical_transformer, CATEGORICAL_COLUMNS)
        ],
        remainder='drop'
    )

def train_classifier(X_train, X_test, y_train, y_test, target_name):
    print(f"\n--- Training Candidate Classifiers for: {target_name} ---")
    preprocessor = build_preprocessor()

    candidates = {
        'RandomForest': RandomForestClassifier(
            n_estimators=300,
            random_state=42,
            class_weight='balanced_subsample',
            n_jobs=-1
        ),
        'ExtraTrees': ExtraTreesClassifier(
            n_estimators=300,
            random_state=42,
            class_weight='balanced',
            n_jobs=-1
        ),
        'HistGradientBoosting': HistGradientBoostingClassifier(
            random_state=42,
            max_iter=200,
            class_weight='balanced'
        ),
        'LogisticRegression': LogisticRegression(
            max_iter=1000,
            class_weight='balanced',
            random_state=42
        )
    }

    best_model_name = None
    best_pipeline = None
    best_f1 = -1.0
    all_metrics = {}

    for name, clf in candidates.items():
        pipeline = Pipeline([
            ('preprocess', preprocessor),
            ('classifier', clf)
        ])
        
        # Fit model
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        acc = float(accuracy_score(y_test, y_pred))
        bal_acc = float(balanced_accuracy_score(y_test, y_pred))
        macro_prec = float(precision_score(y_test, y_pred, average='macro', zero_division=0))
        macro_rec = float(recall_score(y_test, y_pred, average='macro', zero_division=0))
        macro_f1 = float(f1_score(y_test, y_pred, average='macro', zero_division=0))

        all_metrics[name] = {
            'accuracy': round(acc, 4),
            'balanced_accuracy': round(bal_acc, 4),
            'macro_precision': round(macro_prec, 4),
            'macro_recall': round(macro_rec, 4),
            'macro_f1': round(macro_f1, 4),
        }
        print(f"  {name:22} | Acc: {acc:.4f} | BalAcc: {bal_acc:.4f} | Macro F1: {macro_f1:.4f}")

        if macro_f1 > best_f1:
            best_f1 = macro_f1
            best_model_name = name
            best_pipeline = pipeline

    print(f"  --> Best Classifier: {best_model_name} (Macro F1 = {best_f1:.4f})")
    
    # Detailed evaluation on test set
    y_best_pred = best_pipeline.predict(X_test)
    labels = sorted(list(set(y_train) | set(y_test)))
    cm = confusion_matrix(y_test, y_best_pred, labels=labels).tolist()
    clf_report = classification_report(y_test, y_best_pred, labels=labels, output_dict=True, zero_division=0)

    # Feature importances if available
    clf_step = best_pipeline.named_steps['classifier']
    feature_importance_dict = {}
    if hasattr(clf_step, 'feature_importances_'):
        try:
            cat_encoder = best_pipeline.named_steps['preprocess'].named_transformers_['cat'].named_steps['encoder']
            cat_features = cat_encoder.get_feature_names_out(CATEGORICAL_COLUMNS).tolist()
            all_feat_names = NUMERIC_COLUMNS + cat_features
            importances = clf_step.feature_importances_
            if len(importances) == len(all_feat_names):
                feat_imp = sorted(zip(all_feat_names, [round(float(v), 5) for v in importances]), key=lambda x: x[1], reverse=True)
                feature_importance_dict = dict(feat_imp[:20])
        except Exception:
            pass

    return {
        'best_model_name': best_model_name,
        'best_pipeline': best_pipeline,
        'metrics_comparison': all_metrics,
        'test_metrics': all_metrics[best_model_name],
        'classes': labels,
        'confusion_matrix': cm,
        'classification_report': clf_report,
        'top_feature_importances': feature_importance_dict
    }

def train_all_models():
    TRAINED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("IHMS PATIENT CLINICAL MONITORING & TRIAGE ML TRAINING PIPELINE")
    print("=" * 70)

    raw_df, source_name = load_dataset_from_postgres_or_csv()
    
    # Standardize column names for target extraction
    norm_cols = {c: c.lower().replace('-', '_').replace(' ', '_') for c in raw_df.columns}
    raw_df = raw_df.rename(columns=norm_cols)

    if 'monitoring_level' not in raw_df.columns:
        raise ValueError("Missing 'monitoring_level' in dataset columns.")
    if 'care_unit' not in raw_df.columns:
        raise ValueError("Missing 'care_unit' in dataset columns.")

    # 1. Feature Engineering
    X = prepare_features(raw_df)
    y_triage = raw_df['monitoring_level'].astype(str).str.strip()
    y_care_unit = raw_df['care_unit'].astype(str).str.strip()

    print(f"Engineered Feature Matrix Shape: {X.shape}")
    print(f"Features: {list(X.columns)}")

    # 2. Train Primary Triage Model (Monitoring Level: Routine / Enhanced / Continuous)
    X_train_t, X_test_t, y_train_t, y_test_t = train_test_split(
        X, y_triage, test_size=0.2, random_state=42, stratify=y_triage
    )
    triage_results = train_classifier(X_train_t, X_test_t, y_train_t, y_test_t, "Monitoring_Level (Triage / Deterioration Risk)")

    triage_artifact = {
        'model': triage_results['best_pipeline'],
        'model_name': 'patient_triage_model',
        'algorithm': triage_results['best_model_name'],
        'target': 'monitoring_level',
        'classes': triage_results['classes'],
        'metrics': triage_results['test_metrics'],
        'feature_columns': list(X.columns),
        'top_feature_importances': triage_results['top_feature_importances'],
        'data_source': source_name,
        'trained_at': datetime.utcnow().isoformat(),
        'total_samples': len(raw_df)
    }
    triage_model_path = TRAINED_MODELS_DIR / 'patient_triage_model.joblib'
    joblib.dump(triage_artifact, triage_model_path)
    print(f"[SAVED] Patient Triage Model saved to {triage_model_path}")

    # 3. Train Secondary Model (Care Unit Recommendation)
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(
        X, y_care_unit, test_size=0.2, random_state=42, stratify=y_care_unit
    )
    care_unit_results = train_classifier(X_train_c, X_test_c, y_train_c, y_test_c, "Care_Unit (Ward / Placement Recommendation)")

    care_unit_artifact = {
        'model': care_unit_results['best_pipeline'],
        'model_name': 'care_unit_model',
        'algorithm': care_unit_results['best_model_name'],
        'target': 'care_unit',
        'classes': care_unit_results['classes'],
        'metrics': care_unit_results['test_metrics'],
        'feature_columns': list(X.columns),
        'top_feature_importances': care_unit_results['top_feature_importances'],
        'data_source': source_name,
        'trained_at': datetime.utcnow().isoformat(),
        'total_samples': len(raw_df)
    }
    care_unit_model_path = TRAINED_MODELS_DIR / 'care_unit_model.joblib'
    joblib.dump(care_unit_artifact, care_unit_model_path)
    print(f"[SAVED] Care Unit Recommendation Model saved to {care_unit_model_path}")

    # 4. Generate JSON Summary Report
    combined_report = {
        'training_timestamp': datetime.utcnow().isoformat(),
        'dataset_source': source_name,
        'total_records': len(raw_df),
        'features_count': X.shape[1],
        'triage_monitoring_model': {
            'algorithm': triage_results['best_model_name'],
            'metrics': triage_results['test_metrics'],
            'classes': triage_results['classes'],
            'top_features': triage_results['top_feature_importances'],
            'models_evaluated': triage_results['metrics_comparison']
        },
        'care_unit_model': {
            'algorithm': care_unit_results['best_model_name'],
            'metrics': care_unit_results['test_metrics'],
            'classes': care_unit_results['classes'],
            'top_features': care_unit_results['top_feature_importances'],
            'models_evaluated': care_unit_results['metrics_comparison']
        }
    }
    report_json_path = REPORTS_DIR / 'clinical_monitoring_training_report.json'
    with open(report_json_path, 'w', encoding='utf-8') as f:
        json.dump(combined_report, f, indent=2)
    print(f"[REPORT] Saved training report to {report_json_path}")

    print("\n" + "=" * 70)
    print("TRAINING COMPLETED SUCCESSFULLY!")
    print(f"  Triage Model Accuracy: {triage_results['test_metrics']['accuracy'] * 100:.2f}% | Macro F1: {triage_results['test_metrics']['macro_f1']:.4f}")
    print(f"  Care Unit Model Accuracy: {care_unit_results['test_metrics']['accuracy'] * 100:.2f}% | Macro F1: {care_unit_results['test_metrics']['macro_f1']:.4f}")
    print("=" * 70)

    return combined_report

if __name__ == '__main__':
    train_all_models()
