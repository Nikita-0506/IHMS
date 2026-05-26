from pathlib import Path
from datetime import datetime
import re

import joblib
import pandas as pd
from pandas.api.types import is_numeric_dtype
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import ExtraTreesClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


BASE_DIR = Path(__file__).resolve().parents[2]
DATASET_PATH = BASE_DIR / 'ml_models' / 'mental_health' / 'stress_dataset.csv'
MODEL_PATH = BASE_DIR / 'ml_models' / 'trained_models' / 'mental_health_model.joblib'


def _looks_numeric(series):
	if is_numeric_dtype(series):
		return True

	converted = pd.to_numeric(series, errors='coerce')
	valid_ratio = converted.notna().mean()
	return valid_ratio >= 0.95


def _is_noise_feature(column_name):
	lowered = column_name.lower()
	patterns = [r'^patient_id$', r'^patient_name$', r'date', r'^created_', r'_id$']
	return any(re.search(pattern, lowered) for pattern in patterns)


def train_mental_health_model(dataset_path=None, model_path=None):
	source = Path(dataset_path) if dataset_path else DATASET_PATH
	target = Path(model_path) if model_path else MODEL_PATH

	if not source.exists():
		raise FileNotFoundError(f'Mental health dataset not found: {source}')

	df = pd.read_csv(source)
	if df.empty:
		raise ValueError('Mental health dataset is empty.')

	if 'stress_label' in df.columns:
		target_col = 'stress_label'
	elif 'mental_health_label' in df.columns:
		target_col = 'mental_health_label'
	else:
		raise ValueError('Mental health dataset must include stress_label or mental_health_label.')

	drop_cols = {
		target_col,
		'prediction_result',
		'voice_analysis_result',
		'ai_recommendation',
		'prediction_id',
	}
	feature_cols = [
		col for col in df.columns
		if col not in drop_cols and not _is_noise_feature(col)
	]
	if not feature_cols:
		raise ValueError('No usable feature columns found for mental health training.')

	train_df = df[feature_cols].copy()
	labels = df[target_col].astype(str)

	numeric_cols = [col for col in feature_cols if _looks_numeric(train_df[col])]
	categorical_cols = [col for col in feature_cols if col not in numeric_cols]

	for col in numeric_cols:
		train_df[col] = pd.to_numeric(train_df[col], errors='coerce')

	preprocessor = ColumnTransformer(
		transformers=[
			(
				'num',
				Pipeline([
					('imputer', SimpleImputer(strategy='median')),
				]),
				numeric_cols,
			),
			(
				'cat',
				Pipeline([
					('imputer', SimpleImputer(strategy='most_frequent')),
					('encoder', OneHotEncoder(handle_unknown='ignore')),
				]),
				categorical_cols,
			),
		],
		remainder='drop',
	)

	X_train, X_test, y_train, y_test = train_test_split(
		train_df,
		labels,
		test_size=0.2,
		random_state=42,
		stratify=labels,
	)

	candidates = {
		'random_forest': RandomForestClassifier(
			n_estimators=450,
			random_state=42,
			class_weight='balanced_subsample',
			n_jobs=-1,
		),
		'extra_trees': ExtraTreesClassifier(
			n_estimators=450,
			random_state=42,
			class_weight='balanced',
			n_jobs=-1,
		),
	}

	best_name = None
	best_pipeline = None
	best_accuracy = -1.0
	best_f1 = -1.0

	for name, classifier in candidates.items():
		pipeline = Pipeline([
			('preprocess', preprocessor),
			('classifier', classifier),
		])
		pipeline.fit(X_train, y_train)
		predictions = pipeline.predict(X_test)
		score = float(accuracy_score(y_test, predictions))

		if score > best_accuracy:
			best_accuracy = score
			best_f1 = float(f1_score(y_test, predictions, average='macro'))
			best_name = name
			best_pipeline = pipeline

	artifact = {
		'model': best_pipeline,
		'selected_model': best_name,
		'feature_columns': feature_cols,
		'target_column': target_col,
		'trained_at': datetime.utcnow().isoformat(),
		'metrics': {
			'accuracy': round(best_accuracy, 4),
			'macro_f1': round(best_f1, 4),
			'rows': int(len(df)),
			'classes': sorted(labels.unique().tolist()),
		},
	}

	target.parent.mkdir(parents=True, exist_ok=True)
	joblib.dump(artifact, target)

	return {
		'model_name': 'mental_health',
		'selected_model': best_name,
		'dataset': str(source),
		'model_path': str(target),
		'rows': int(len(df)),
		'features': int(len(feature_cols)),
		'accuracy': round(best_accuracy, 4),
		'macro_f1': round(best_f1, 4),
	}

