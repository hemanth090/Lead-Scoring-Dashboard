import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib
import os
import sys

def train_model(data_path='../data/leads_data.csv'):
    """Train a gradient boosting model to predict lead intent."""
    
    print("Loading data...")
    try:
        df = pd.read_csv(data_path)
    except FileNotFoundError:
        print(f"Error: Data file not found at {data_path}")
        print("Please run generate_data.py first to create the dataset.")
        sys.exit(1)
    
    print(f"Loaded {len(df)} records from {data_path}")
    
    # Define features and target
    X = df.drop(['high_intent', 'phone_number', 'email', 'comments'], axis=1)
    y = df['high_intent']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    
    # Define categorical and numerical features
    categorical_features = ['age_group', 'family_background', 'property_type', 'location']
    numerical_features = ['credit_score', 'income', 'budget', 'previous_inquiries', 
                         'time_on_market', 'response_time_minutes']
    
    # Create preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
    
    # Create pipeline with preprocessor and model
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', GradientBoostingClassifier(n_estimators=100, random_state=42))
    ])
    
    # Train model
    print("Training model...")
    pipeline.fit(X_train, y_train)
    
    # Evaluate model
    print("Evaluating model...")
    y_pred = pipeline.predict(X_test)
    y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
    
    # Print metrics
    print("\nModel Performance:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall: {recall_score(y_test, y_pred):.4f}")
    print(f"F1 Score: {f1_score(y_test, y_pred):.4f}")
    print(f"ROC AUC: {roc_auc_score(y_test, y_pred_proba):.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Feature importance
    feature_names = (
        numerical_features + 
        pipeline.named_steps['preprocessor'].transformers_[1][1].get_feature_names_out(categorical_features).tolist()
    )
    
    importances = pipeline.named_steps['classifier'].feature_importances_
    indices = np.argsort(importances)[::-1]
    
    print("\nFeature Importance:")
    for i in range(min(10, len(feature_names))):
        print(f"{i+1}. {feature_names[indices[i]]}: {importances[indices[i]]:.4f}")
    
    # Save model and feature columns
    print("\nSaving model...")
    os.makedirs('../model', exist_ok=True)
    joblib.dump(pipeline, '../model/lead_scoring_model.pkl')
    
    # Save feature columns for inference
    feature_columns = {
        'categorical_features': categorical_features,
        'numerical_features': numerical_features
    }
    joblib.dump(feature_columns, '../model/feature_columns.pkl')
    
    print("Model and feature columns saved to '../model/' directory")
    
    return pipeline, feature_columns

if __name__ == "__main__":
    train_model()