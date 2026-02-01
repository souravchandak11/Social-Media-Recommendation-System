"""
Recommendation Module
Hybrid recommendation system combining content-based and collaborative filtering.
"""

import pandas as pd
import numpy as np
import os
import joblib


def create_similarity_matrix(X: np.ndarray) -> np.ndarray:
    """
    Calculate user-user similarity using cosine similarity with numpy.
    
    Args:
        X: Feature matrix (n_users x n_features)
    
    Returns:
        Similarity matrix (n_users x n_users)
    """
    print("Calculating cosine similarity matrix with numpy...")
    
    # Normalize the rows
    norm = np.linalg.norm(X, axis=1, keepdims=True)
    # Avoid division by zero
    norm[norm == 0] = 1
    X_normalized = X / norm
    
    # Matrix multiplication to get cosine similarity: (A / |A|) . (B / |B|).T
    similarity_matrix = np.dot(X_normalized, X_normalized.T)
    
    print(f"Similarity matrix shape: {similarity_matrix.shape}")
    
    return similarity_matrix


def calculate_interest_similarity(interests1: str, interests2: str) -> float:
    """
    Calculate Jaccard similarity between two interest strings.
    
    Args:
        interests1: Comma-separated interests for user 1
        interests2: Comma-separated interests for user 2
    
    Returns:
        Jaccard similarity score (0-1)
    """
    set1 = set(interests1.split(',')) if interests1 else set()
    set2 = set(interests2.split(',')) if interests2 else set()
    
    # Remove empty strings
    set1 = {s.strip() for s in set1 if s.strip()}
    set2 = {s.strip() for s in set2 if s.strip()}
    
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    
    return intersection / union if union > 0 else 0


def create_interest_similarity_matrix(df: pd.DataFrame, sample_size: int = None) -> np.ndarray:
    """
    Create interest-based similarity matrix using Jaccard similarity.
    
    Note: For large datasets, this is computationally expensive.
    Consider sampling or using approximate methods.
    
    Args:
        df: DataFrame with 'interests' column
        sample_size: Optional sample size for faster computation
    
    Returns:
        Interest similarity matrix
    """
    if sample_size and len(df) > sample_size:
        print(f"Sampling {sample_size} users for interest similarity...")
        indices = np.random.choice(len(df), sample_size, replace=False)
    else:
        indices = np.arange(len(df))
    
    n_users = len(df)
    interest_sim = np.zeros((n_users, n_users))
    
    print(f"Calculating interest similarity matrix for {n_users} users...")
    
    interests_list = df['interests'].tolist()
    
    # Vectorized approach for efficiency
    for i in range(n_users):
        if i % 1000 == 0:
            print(f"  Processing user {i}/{n_users}...")
        
        for j in range(i+1, n_users):
            sim = calculate_interest_similarity(interests_list[i], interests_list[j])
            interest_sim[i, j] = sim
            interest_sim[j, i] = sim  # Symmetric
    
    print("Interest similarity matrix complete!")
    return interest_sim


def get_recommendations(user_id: str, df: pd.DataFrame, 
                       user_similarity: np.ndarray, 
                       interest_similarity: np.ndarray = None,
                       n_recommendations: int = 10, 
                       alpha: float = 0.6) -> pd.DataFrame:
    """
    Generate account recommendations using hybrid approach.
    
    Args:
        user_id: Target user ID
        df: User dataframe
        user_similarity: Feature-based similarity matrix
        interest_similarity: Interest-based similarity matrix (optional)
        n_recommendations: Number of recommendations to return
        alpha: Weight for feature similarity (1-alpha for interest similarity)
    
    Returns:
        DataFrame with recommended accounts
    """
    # Get user index
    user_mask = df['user_id'] == user_id
    if not user_mask.any():
        raise ValueError(f"User {user_id} not found")
    
    user_idx = df[user_mask].index[0]
    user_data = df.iloc[user_idx]
    
    # Calculate combined similarity
    if interest_similarity is not None:
        combined_sim = (alpha * user_similarity[user_idx] + 
                       (1 - alpha) * interest_similarity[user_idx])
    else:
        combined_sim = user_similarity[user_idx]
    
    # Get top similar users (exclude self)
    similar_indices = np.argsort(combined_sim)[::-1]
    similar_indices = [idx for idx in similar_indices if idx != user_idx][:n_recommendations]
    
    # Create recommendations dataframe
    recommendations = []
    
    for idx in similar_indices:
        rec_user = df.iloc[idx]
        
        recommendations.append({
            'user_id': rec_user['user_id'],
            'username': rec_user['username'],
            'similarity_score': round(combined_sim[idx], 4),
            'segment': rec_user.get('segment_name', f"Segment {rec_user.get('segment', 'Unknown')}"),
            'follower_count': int(rec_user['follower_count']),
            'interests': rec_user['interests'],
            'engagement_rate': round(rec_user['engagement_rate'], 2),
            'city': rec_user['city'],
            'reason': generate_recommendation_reason(user_data, rec_user)
        })
    
    return pd.DataFrame(recommendations)


def generate_recommendation_reason(user: pd.Series, recommended_user: pd.Series) -> str:
    """
    Generate human-readable explanation for recommendation.
    
    Args:
        user: Source user data
        recommended_user: Recommended user data
    
    Returns:
        Explanation string
    """
    reasons = []
    
    # Check interest overlap
    user_interests = set(user['interests'].split(',')) if user['interests'] else set()
    rec_interests = set(recommended_user['interests'].split(',')) if recommended_user['interests'] else set()
    common_interests = user_interests & rec_interests
    common_interests = {i.strip() for i in common_interests if i.strip()}
    
    if len(common_interests) >= 3:
        top_common = list(common_interests)[:3]
        reasons.append(f"Shares interests: {', '.join(top_common)}")
    elif len(common_interests) >= 1:
        reasons.append(f"Common interest: {list(common_interests)[0]}")
    
    # Check segment
    user_segment = user.get('segment_name', user.get('segment', ''))
    rec_segment = recommended_user.get('segment_name', recommended_user.get('segment', ''))
    if user_segment and user_segment == rec_segment:
        reasons.append(f"Same segment: {user_segment}")
    
    # Check location
    if user['city'] == recommended_user['city']:
        reasons.append(f"Same city: {user['city']}")
    
    # Check age similarity
    if 'age' in user.index and 'age' in recommended_user.index:
        age_diff = abs(user['age'] - recommended_user['age'])
        if age_diff <= 5:
            reasons.append("Similar age group")
    
    # Check engagement level
    if 'engagement_rate' in user.index and 'engagement_rate' in recommended_user.index:
        if abs(user['engagement_rate'] - recommended_user['engagement_rate']) < user['engagement_rate'] * 0.3:
            reasons.append("Similar engagement level")
    
    if reasons:
        return " | ".join(reasons[:2])  # Return top 2 reasons
    else:
        return "Similar overall profile"


def get_segment_based_recommendations(user_id: str, df: pd.DataFrame, 
                                      n_recommendations: int = 5) -> pd.DataFrame:
    """
    Recommend top users from the same segment.
    
    Args:
        user_id: Target user ID
        df: User dataframe
        n_recommendations: Number of recommendations
    
    Returns:
        DataFrame with segment-based recommendations
    """
    user_mask = df['user_id'] == user_id
    if not user_mask.any():
        raise ValueError(f"User {user_id} not found")
    
    user_segment = df.loc[user_mask, 'segment'].values[0]
    
    # Get users from same segment, excluding target user
    segment_users = df[(df['segment'] == user_segment) & (df['user_id'] != user_id)]
    
    # Sort by influence score
    top_users = segment_users.nlargest(n_recommendations, 'influence_score')
    
    return top_users[['user_id', 'username', 'segment_name', 
                      'follower_count', 'influence_score', 'interests', 'city']]


def get_diverse_recommendations(user_id: str, df: pd.DataFrame,
                               user_similarity: np.ndarray,
                               n_recommendations: int = 10) -> pd.DataFrame:
    """
    Get diverse recommendations from different segments.
    
    Args:
        user_id: Target user ID
        df: User dataframe
        user_similarity: Feature-based similarity matrix
        n_recommendations: Number of recommendations
    
    Returns:
        DataFrame with diverse recommendations
    """
    user_mask = df['user_id'] == user_id
    user_idx = df[user_mask].index[0]
    user_segment = df.loc[user_mask, 'segment'].values[0]
    
    recommendations = []
    segments = df['segment'].unique()
    recs_per_segment = max(1, n_recommendations // len(segments))
    
    for segment in segments:
        segment_mask = (df['segment'] == segment) & (df['user_id'] != user_id)
        segment_indices = df[segment_mask].index.tolist()
        
        if not segment_indices:
            continue
        
        # Get similarities for this segment
        segment_sims = [(idx, user_similarity[user_idx, idx]) for idx in segment_indices]
        segment_sims.sort(key=lambda x: x[1], reverse=True)
        
        # Take top from this segment
        for idx, sim in segment_sims[:recs_per_segment]:
            rec_user = df.iloc[idx]
            recommendations.append({
                'user_id': rec_user['user_id'],
                'username': rec_user['username'],
                'similarity_score': round(sim, 4),
                'segment': rec_user.get('segment_name', f"Segment {segment}"),
                'follower_count': int(rec_user['follower_count']),
                'interests': rec_user['interests']
            })
    
    # Sort by similarity and limit
    rec_df = pd.DataFrame(recommendations)
    rec_df = rec_df.sort_values('similarity_score', ascending=False).head(n_recommendations)
    
    return rec_df


if __name__ == "__main__":
    # Load data
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed')
    df = pd.read_csv(os.path.join(data_dir, 'users_segmented.csv'))
    X = np.load(os.path.join(data_dir, 'feature_matrix.npy'))
    
    print(f"Loaded {len(df)} users")
    
    # Create similarity matrix
    user_similarity = create_similarity_matrix(X)
    
    # Save similarity matrix
    np.save(os.path.join(data_dir, 'similarity_matrix.npy'), user_similarity)
    
    # Test recommendations for a sample user
    sample_user_id = df['user_id'].iloc[0]
    sample_user = df[df['user_id'] == sample_user_id].iloc[0]
    
    print(f"\n{'='*60}")
    print(f"SAMPLE RECOMMENDATIONS")
    print(f"{'='*60}")
    print(f"\nTarget User: {sample_user_id}")
    print(f"  Interests: {sample_user['interests']}")
    print(f"  Segment: {sample_user['segment_name']}")
    print(f"  Followers: {sample_user['follower_count']:,}")
    
    # Get recommendations
    recommendations = get_recommendations(
        sample_user_id, df, user_similarity,
        n_recommendations=10
    )
    
    print(f"\nTop 10 Recommendations:")
    print("-" * 60)
    for idx, row in recommendations.iterrows():
        print(f"{idx+1}. {row['username']}")
        print(f"   Score: {row['similarity_score']:.4f} | Segment: {row['segment']}")
        print(f"   Reason: {row['reason']}")
        print()
    
    print("Recommendation engine ready!")
