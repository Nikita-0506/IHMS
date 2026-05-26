from pathlib import Path
from datetime import datetime

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parents[2]
DATASET_PATH = BASE_DIR / 'ml_models' / 'datasets' / 'voice_dataset.csv'
MODEL_PATH = BASE_DIR / 'ml_models' / 'trained_models' / 'voice_analysis_model.joblib'



def train_voice_model(dataset_path=None, model_path=None):
    source = Path(dataset_path) if dataset_path else DATASET_PATH
    target = Path(model_path) if model_path else MODEL_PATH

    if not source.exists():
        raise FileNotFoundError(f'Voice dataset not found: {source}')

    df = pd.read_csv(source)
    if df.empty:
        raise ValueError('Voice dataset is empty.')

    if 'mental_health_label' not in df.columns:
        raise ValueError('Voice dataset must include mental_health_label column.')

    target_col = 'mental_health_label'
    feature_cols = [col for col in df.columns if col != target_col]
    if not feature_cols:
        raise ValueError('No feature columns found for voice training.')

    train_df = df[feature_cols].copy()
    labels = df[target_col].astype(str)

    X_train, X_test, y_train, y_test = train_test_split(
        train_df,
        labels,
        test_size=0.2,
        random_state=42,
        stratify=labels,
    )

    model = RandomForestClassifier(n_estimators=300, random_state=42)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    accuracy = float(accuracy_score(y_test, predictions))

    artifact = {
        'model': model,
        'feature_columns': feature_cols,
        'target_column': target_col,
        'trained_at': datetime.utcnow().isoformat(),
        'metrics': {
            'accuracy': round(accuracy, 4),
            'rows': int(len(df)),
            'classes': sorted(labels.unique().tolist()),
        },
    }

    target.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, target)

    return {
        'model_name': 'voice_analysis',
        'dataset': str(source),
        'model_path': str(target),
        'rows': int(len(df)),
        'features': int(len(feature_cols)),
        'accuracy': round(accuracy, 4),
    }
