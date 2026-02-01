"""
Data Preprocessing Module
Handles data cleaning, validation, and preparation for feature engineering.
"""

import pandas as pd
import numpy as np
import os


def load_raw_data(filepath: str) -> pd.DataFrame:
    """Load raw data from CSV file."""
    df = pd.read_csv(filepath)
    print(f"Loaded {len(df)} records from {filepath}")
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean and preprocess raw data.
    
    Steps:
    1. Remove duplicates
    2. Handle missing values
    3. Remove outliers
    4. Remove inactive accounts
    5. Standardize text fields
    
    Args:
        df: Raw DataFrame
    
    Returns:
        Cleaned DataFrame
    """
    initial_count = len(df)
    print(f"Starting with {initial_count} users")
    
    # Step 1: Remove duplicates
    df = df.drop_duplicates(subset=['user_id'])
    print(f"After removing duplicates: {len(df)} users")
    
    # Step 2: Handle missing values
    df['interests'] = df['interests'].fillna('')
    df['age'] = df['age'].fillna(df['age'].median())
    df['city'] = df['city'].fillna('Unknown')
    df['gender'] = df['gender'].fillna('Unknown')
    
    # Fill numeric columns with median
    numeric_cols = ['follower_count', 'following_count', 'posts_count', 
                    'likes_received', 'comments_received', 'shares']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())
    
    # Step 3: Remove extreme outliers (99th percentile for follower count)
    follower_threshold = df['follower_count'].quantile(0.99)
    df = df[df['follower_count'] <= follower_threshold]
    print(f"After removing outliers: {len(df)} users")
    
    # Step 4: Remove inactive accounts (less than 5 posts)
    df = df[df['posts_count'] >= 5]
    print(f"After removing inactive accounts: {len(df)} users")
    
    # Step 5: Standardize text fields
    df['interests'] = df['interests'].str.lower().str.strip()
    df['city'] = df['city'].str.lower().str.strip()
    df['gender'] = df['gender'].str.strip()
    
    # Reset index
    df = df.reset_index(drop=True)
    
    print(f"\nCleaning complete: {len(df)} users retained ({len(df)/initial_count*100:.1f}%)")
    return df


def validate_data(df: pd.DataFrame) -> bool:
    """
    Validate data quality after cleaning.
    
    Returns:
        True if validation passes, False otherwise
    """
    issues = []
    
    # Check for nulls in critical columns
    critical_cols = ['user_id', 'interests', 'age', 'follower_count']
    for col in critical_cols:
        null_count = df[col].isnull().sum()
        if null_count > 0:
            issues.append(f"Column '{col}' has {null_count} null values")
    
    # Check for negative values
    numeric_cols = ['age', 'follower_count', 'following_count', 'posts_count']
    for col in numeric_cols:
        if col in df.columns:
            neg_count = (df[col] < 0).sum()
            if neg_count > 0:
                issues.append(f"Column '{col}' has {neg_count} negative values")
    
    # Check age range
    if df['age'].min() < 13 or df['age'].max() > 120:
        issues.append(f"Age range suspicious: {df['age'].min()} - {df['age'].max()}")
    
    if issues:
        print("Validation issues found:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    
    print("Data validation passed!")
    return True


def save_processed_data(df: pd.DataFrame, output_path: str) -> None:
    """Save processed data to CSV file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Saved processed data to {output_path}")


if __name__ == "__main__":
    # Load raw data
    raw_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw', 'social_media_users.csv')
    df = load_raw_data(raw_path)
    
    # Clean data
    df_clean = clean_data(df)
    
    # Validate
    validate_data(df_clean)
    
    # Save processed data
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed', 'cleaned_users.csv')
    save_processed_data(df_clean, output_path)
