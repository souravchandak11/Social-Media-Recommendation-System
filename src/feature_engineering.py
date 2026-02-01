"""
Feature Engineering Module
Extracts and transforms features for the recommendation system.
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder, StandardScaler
import os
import joblib


def extract_interest_features(df: pd.DataFrame, max_features: int = 30) -> tuple:
    """
    Extract TF-IDF features from user interests.
    
    Args:
        df: DataFrame with 'interests' column
        max_features: Maximum number of TF-IDF features
    
    Returns:
        Tuple of (interest_features DataFrame, fitted TfidfVectorizer)
    """
    tfidf = TfidfVectorizer(
        max_features=max_features, 
        stop_words='english',
        token_pattern=r'[a-zA-Z]+'
    )
    
    interest_matrix = tfidf.fit_transform(df['interests'])
    
    # Convert to DataFrame
    feature_names = [f'interest_{word}' for word in tfidf.get_feature_names_out()]
    interest_df = pd.DataFrame(
        interest_matrix.toarray(),
        columns=feature_names,
        index=df.index
    )
    
    print(f"Extracted {len(feature_names)} interest features")
    print(f"Top features: {', '.join(feature_names[:10])}")
    
    return interest_df, tfidf


def create_demographic_features(df: pd.DataFrame) -> tuple:
    """
    Encode demographic variables.
    
    Args:
        df: DataFrame with demographic columns
    
    Returns:
        Tuple of (modified DataFrame, gender_encoder, city_encoder)
    """
    df = df.copy()
    
    # Age groups (0-4 scale)
    df['age_group'] = pd.cut(
        df['age'], 
        bins=[0, 18, 25, 35, 50, 100],
        labels=[0, 1, 2, 3, 4]
    ).astype(int)
    
    # Gender encoding
    le_gender = LabelEncoder()
    df['gender_encoded'] = le_gender.fit_transform(df['gender'])
    
    # City encoding
    le_city = LabelEncoder()
    df['city_encoded'] = le_city.fit_transform(df['city'])
    
    print(f"Created demographic features:")
    print(f"  - Age groups: {df['age_group'].nunique()} unique")
    print(f"  - Gender categories: {df['gender_encoded'].nunique()} unique")
    print(f"  - City categories: {df['city_encoded'].nunique()} unique")
    
    return df, le_gender, le_city


def create_engagement_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate engagement metrics and scores.
    
    Args:
        df: DataFrame with engagement columns
    
    Returns:
        DataFrame with new engagement features
    """
    df = df.copy()
    
    # Engagement rate (weighted interactions per post)
    df['engagement_rate'] = (
        (df['likes_received'] + 
         df['comments_received'] * 2 + 
         df['shares'] * 3) / 
        df['posts_count'].replace(0, 1)
    )
    
    # Normalize engagement (0-1 scale)
    df['engagement_normalized'] = (
        (df['engagement_rate'] - df['engagement_rate'].min()) / 
        (df['engagement_rate'].max() - df['engagement_rate'].min() + 1e-10)
    )
    
    # Follower-to-following ratio
    df['follower_ratio'] = df['follower_count'] / (df['following_count'] + 1)
    
    # Normalize follower ratio
    df['follower_ratio_normalized'] = np.clip(
        df['follower_ratio'] / df['follower_ratio'].quantile(0.95), 
        0, 1
    )
    
    # Activity score (posts per 100 days of account age)
    if 'account_age_days' in df.columns:
        df['activity_score'] = df['posts_count'] / (df['account_age_days'] / 100 + 1)
    else:
        df['activity_score'] = df['posts_count'] / 100
    
    # Normalize activity score
    df['activity_normalized'] = np.clip(
        df['activity_score'] / df['activity_score'].quantile(0.95),
        0, 1
    )
    
    # Influence score (composite metric)
    df['influence_score'] = (
        0.35 * df['engagement_normalized'] +
        0.35 * (df['follower_count'] / (df['follower_count'].max() + 1)) +
        0.20 * df['follower_ratio_normalized'] +
        0.10 * df['activity_normalized']
    )
    
    print(f"Created engagement features:")
    print(f"  - Engagement rate: mean={df['engagement_rate'].mean():.2f}")
    print(f"  - Follower ratio: mean={df['follower_ratio'].mean():.2f}")
    print(f"  - Influence score: mean={df['influence_score'].mean():.3f}")
    
    return df


def create_feature_matrix(df: pd.DataFrame, interest_features: pd.DataFrame) -> tuple:
    """
    Combine all features into final standardized matrix.
    
    Args:
        df: DataFrame with all features
        interest_features: DataFrame with TF-IDF interest features
    
    Returns:
        Tuple of (scaled feature matrix, scaler, feature names list)
    """
    # Select numerical features
    feature_cols = [
        'age', 'gender_encoded', 'city_encoded',
        'engagement_normalized', 'follower_ratio_normalized', 
        'activity_normalized', 'influence_score'
    ]
    
    # Get available columns
    available_cols = [c for c in feature_cols if c in df.columns]
    
    # Combine with interest features
    X_numeric = df[available_cols].copy()
    X_combined = pd.concat([X_numeric.reset_index(drop=True), 
                           interest_features.reset_index(drop=True)], axis=1)
    
    # Standardize (CRITICAL for K-Means)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_combined)
    
    feature_names = X_combined.columns.tolist()
    
    print(f"\nFinal feature matrix:")
    print(f"  - Shape: {X_scaled.shape}")
    print(f"  - Numeric features: {len(available_cols)}")
    print(f"  - Interest features: {len(interest_features.columns)}")
    
    return X_scaled, scaler, feature_names


def save_features(X_scaled: np.ndarray, scaler: StandardScaler, 
                  feature_names: list, output_dir: str) -> None:
    """Save feature matrix and artifacts."""
    os.makedirs(output_dir, exist_ok=True)
    
    np.save(os.path.join(output_dir, 'feature_matrix.npy'), X_scaled)
    joblib.dump(scaler, os.path.join(output_dir, 'scaler.pkl'))
    
    with open(os.path.join(output_dir, 'feature_names.txt'), 'w') as f:
        f.write('\n'.join(feature_names))
    
    print(f"Saved features to {output_dir}")


if __name__ == "__main__":
    # Load processed data
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed', 'cleaned_users.csv')
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} users")
    
    # Extract features
    interest_features, tfidf_model = extract_interest_features(df)
    df, gender_encoder, city_encoder = create_demographic_features(df)
    df = create_engagement_features(df)
    X_scaled, scaler, feature_names = create_feature_matrix(df, interest_features)
    
    # Save
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed')
    save_features(X_scaled, scaler, feature_names, output_dir)
    
    # Save updated dataframe
    df.to_csv(os.path.join(output_dir, 'users_with_features.csv'), index=False)
    
    # Save encoders
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'models')
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(tfidf_model, os.path.join(model_dir, 'tfidf_model.pkl'))
    joblib.dump(gender_encoder, os.path.join(model_dir, 'gender_encoder.pkl'))
    joblib.dump(city_encoder, os.path.join(model_dir, 'city_encoder.pkl'))
