"""
Data Generator Module
Generates synthetic social media user data for the recommendation system.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os


def generate_synthetic_data(n_users: int = 10000, random_seed: int = 42) -> pd.DataFrame:
    """
    Generate synthetic social media user data.
    
    Args:
        n_users: Number of users to generate
        random_seed: Random seed for reproducibility
    
    Returns:
        DataFrame with synthetic user data
    """
    np.random.seed(random_seed)
    
    # Demographics
    ages = np.random.randint(18, 65, n_users)
    genders = np.random.choice(['Male', 'Female', 'Non-binary'], n_users, p=[0.48, 0.48, 0.04])
    
    # Interest pool with categories
    interest_pool = [
        'technology', 'fashion', 'travel', 'food', 'fitness', 
        'gaming', 'music', 'art', 'sports', 'photography',
        'business', 'education', 'health', 'entertainment',
        'cooking', 'reading', 'movies', 'nature', 'cars', 'pets'
    ]
    
    # Generate interests (multi-label)
    interests = []
    for _ in range(n_users):
        n_interests = np.random.randint(2, 7)
        user_interests = ','.join(np.random.choice(interest_pool, n_interests, replace=False))
        interests.append(user_interests)
    
    # Engagement metrics with realistic distributions
    # Using exponential distribution for follower counts (most have few, some have many)
    follower_counts = np.random.exponential(1500, n_users).astype(int)
    follower_counts = np.clip(follower_counts, 10, 100000)  # Realistic bounds
    
    following_counts = np.random.exponential(800, n_users).astype(int)
    following_counts = np.clip(following_counts, 5, 5000)
    
    posts_counts = np.random.randint(10, 500, n_users)
    
    # Engagement correlated with follower count but with noise
    base_engagement = follower_counts * np.random.uniform(0.02, 0.12, n_users)
    likes_received = base_engagement.astype(int)
    comments_received = (likes_received * np.random.uniform(0.05, 0.15, n_users)).astype(int)
    shares = (likes_received * np.random.uniform(0.02, 0.08, n_users)).astype(int)
    
    # Location distribution
    cities = [
        'New York', 'Los Angeles', 'London', 'Mumbai', 'Tokyo', 
        'Paris', 'Berlin', 'Sydney', 'Toronto', 'Singapore',
        'Dubai', 'Hong Kong', 'Seoul', 'Barcelona', 'Amsterdam'
    ]
    cities_list = np.random.choice(cities, n_users)
    
    # Account age (days since creation)
    account_ages = np.random.randint(30, 2000, n_users)
    
    # Verified status (rare)
    verified = np.random.choice([True, False], n_users, p=[0.02, 0.98])
    
    # Create DataFrame
    df = pd.DataFrame({
        'user_id': [f'U{str(i).zfill(5)}' for i in range(n_users)],
        'username': [f'user_{i}' for i in range(n_users)],
        'age': ages,
        'gender': genders,
        'interests': interests,
        'city': cities_list,
        'follower_count': follower_counts,
        'following_count': following_counts,
        'posts_count': posts_counts,
        'likes_received': likes_received,
        'comments_received': comments_received,
        'shares': shares,
        'account_age_days': account_ages,
        'is_verified': verified
    })
    
    return df


def save_raw_data(df: pd.DataFrame, output_path: str) -> None:
    """Save generated data to CSV file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Saved {len(df)} users to {output_path}")


if __name__ == "__main__":
    # Generate and save data
    print("Generating synthetic social media user data...")
    df = generate_synthetic_data(n_users=10000)
    
    # Display sample
    print(f"\nGenerated {len(df)} users")
    print("\nSample data:")
    print(df.head())
    print("\nColumn statistics:")
    print(df.describe())
    
    # Save to raw data folder
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw', 'social_media_users.csv')
    save_raw_data(df, output_path)
