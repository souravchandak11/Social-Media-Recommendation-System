"""
Segmentation Module
K-Means clustering for user segmentation with optimal cluster selection.
"""

import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for servers
import matplotlib.pyplot as plt
import seaborn as sns
import os
import joblib


def find_optimal_clusters(X: np.ndarray, max_k: int = 10, output_dir: str = None) -> int:
    """
    Find optimal number of clusters using Elbow Method and Silhouette Score.
    
    Args:
        X: Feature matrix
        max_k: Maximum number of clusters to try
        output_dir: Directory to save visualization
    
    Returns:
        Optimal number of clusters
    """
    inertias = []
    silhouette_scores = []
    K_range = range(2, max_k + 1)
    
    print("Finding optimal clusters...")
    for k in K_range:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10, max_iter=300)
        labels = kmeans.fit_predict(X)
        
        inertias.append(kmeans.inertia_)
        sil_score = silhouette_score(X, labels)
        silhouette_scores.append(sil_score)
        print(f"  k={k}: Silhouette Score = {sil_score:.4f}")
    
    # Create visualization
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    
    # Elbow plot
    ax1.plot(K_range, inertias, 'bo-', linewidth=2, markersize=8)
    ax1.set_xlabel('Number of Clusters (k)', fontsize=12)
    ax1.set_ylabel('Inertia (Within-cluster sum of squares)', fontsize=12)
    ax1.set_title('Elbow Method for Optimal k', fontsize=14, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    
    # Silhouette plot
    ax2.plot(K_range, silhouette_scores, 'ro-', linewidth=2, markersize=8)
    ax2.set_xlabel('Number of Clusters (k)', fontsize=12)
    ax2.set_ylabel('Silhouette Score', fontsize=12)
    ax2.set_title('Silhouette Analysis for Optimal k', fontsize=14, fontweight='bold')
    ax2.grid(True, alpha=0.3)
    
    # Mark optimal k
    optimal_k = K_range[np.argmax(silhouette_scores)]
    ax2.axvline(x=optimal_k, color='green', linestyle='--', linewidth=2, 
                label=f'Optimal k={optimal_k}')
    ax2.legend()
    
    plt.tight_layout()
    
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        plt.savefig(os.path.join(output_dir, 'optimal_clusters.png'), dpi=300, bbox_inches='tight')
        print(f"Saved visualization to {output_dir}/optimal_clusters.png")
    
    plt.close()
    
    print(f"\n{'='*50}")
    print(f"OPTIMAL CLUSTERS: {optimal_k}")
    print(f"Best Silhouette Score: {max(silhouette_scores):.4f}")
    print(f"{'='*50}")
    
    return optimal_k


def perform_clustering(X: np.ndarray, n_clusters: int) -> tuple:
    """
    Apply K-Means clustering.
    
    Args:
        X: Feature matrix
        n_clusters: Number of clusters
    
    Returns:
        Tuple of (cluster labels, fitted KMeans model)
    """
    kmeans = KMeans(
        n_clusters=n_clusters, 
        random_state=42, 
        n_init=20,
        max_iter=500
    )
    labels = kmeans.fit_predict(X)
    
    # Print distribution
    print(f"\nSegment Distribution:")
    unique, counts = np.unique(labels, return_counts=True)
    for seg, count in zip(unique, counts):
        print(f"  Segment {seg}: {count:,} users ({count/len(labels)*100:.1f}%)")
    
    return labels, kmeans


def profile_segments(df: pd.DataFrame) -> pd.DataFrame:
    """
    Analyze characteristics of each segment.
    
    Args:
        df: DataFrame with 'segment' column
    
    Returns:
        DataFrame with segment profiles
    """
    segment_profiles = []
    
    for seg in sorted(df['segment'].unique()):
        seg_data = df[df['segment'] == seg]
        
        # Get top interests
        all_interests = ','.join(seg_data['interests']).split(',')
        interest_counts = pd.Series(all_interests).value_counts()
        top_interests = interest_counts.head(5).index.tolist()
        
        # Get top cities
        top_cities = seg_data['city'].value_counts().head(3).index.tolist()
        
        profile = {
            'Segment': seg,
            'Size': len(seg_data),
            'Percentage': f"{len(seg_data)/len(df)*100:.1f}%",
            'Avg_Age': round(seg_data['age'].mean(), 1),
            'Avg_Followers': int(seg_data['follower_count'].mean()),
            'Avg_Engagement_Rate': round(seg_data['engagement_rate'].mean(), 2),
            'Avg_Influence_Score': round(seg_data['influence_score'].mean(), 3),
            'Top_Interests': ', '.join(top_interests[:3]),
            'Top_Cities': ', '.join(top_cities)
        }
        segment_profiles.append(profile)
    
    profile_df = pd.DataFrame(segment_profiles)
    
    print("\n" + "="*80)
    print("SEGMENT PROFILES")
    print("="*80)
    print(profile_df.to_string(index=False))
    
    return profile_df


def assign_segment_names(df: pd.DataFrame) -> tuple:
    """
    Assign meaningful names to segments based on their characteristics.
    
    Args:
        df: DataFrame with 'segment' column
    
    Returns:
        Tuple of (updated DataFrame, segment names dictionary)
    """
    df = df.copy()
    segment_stats = []
    
    for seg in df['segment'].unique():
        seg_data = df[df['segment'] == seg]
        segment_stats.append({
            'segment': seg,
            'avg_followers': seg_data['follower_count'].mean(),
            'avg_engagement': seg_data['engagement_rate'].mean(),
            'avg_influence': seg_data['influence_score'].mean(),
            'avg_activity': seg_data['activity_normalized'].mean() if 'activity_normalized' in df.columns else 0
        })
    
    stats_df = pd.DataFrame(segment_stats)
    
    # Sort by influence score to assign names
    stats_df = stats_df.sort_values('avg_influence', ascending=False).reset_index(drop=True)
    
    # Name templates based on ranking
    name_templates = [
        "Micro-Influencers",
        "Engaged Creators",
        "Rising Stars",
        "Active Community",
        "Casual Browsers",
        "New Users",
        "Passive Viewers"
    ]
    
    segment_names = {}
    for i, row in enumerate(stats_df.itertuples()):
        if i < len(name_templates):
            segment_names[row.segment] = name_templates[i]
        else:
            segment_names[row.segment] = f"Segment {row.segment}"
    
    df['segment_name'] = df['segment'].map(segment_names)
    
    print("\nSegment Names:")
    for seg, name in sorted(segment_names.items()):
        seg_data = df[df['segment'] == seg]
        print(f"  Segment {seg}: {name} ({len(seg_data):,} users)")
    
    return df, segment_names


def visualize_segments(df: pd.DataFrame, output_dir: str = None) -> None:
    """Create segment visualizations."""
    fig, axes = plt.subplots(2, 2, figsize=(14, 12))
    
    # Color palette
    colors = sns.color_palette('husl', n_colors=df['segment'].nunique())
    
    # 1. Segment distribution pie chart
    segment_counts = df['segment_name'].value_counts()
    axes[0, 0].pie(segment_counts.values, labels=segment_counts.index, 
                   autopct='%1.1f%%', colors=colors, startangle=90)
    axes[0, 0].set_title('User Distribution by Segment', fontsize=14, fontweight='bold')
    
    # 2. Engagement by segment
    segment_engagement = df.groupby('segment_name')['engagement_rate'].mean().sort_values(ascending=True)
    bars = axes[0, 1].barh(segment_engagement.index, segment_engagement.values, color=colors)
    axes[0, 1].set_xlabel('Average Engagement Rate', fontsize=12)
    axes[0, 1].set_title('Engagement Rate by Segment', fontsize=14, fontweight='bold')
    axes[0, 1].grid(True, alpha=0.3, axis='x')
    
    # 3. Followers by segment (box plot)
    df.boxplot(column='follower_count', by='segment_name', ax=axes[1, 0], rot=45)
    axes[1, 0].set_xlabel('Segment', fontsize=12)
    axes[1, 0].set_ylabel('Follower Count', fontsize=12)
    axes[1, 0].set_title('Follower Distribution by Segment', fontsize=14, fontweight='bold')
    plt.suptitle('')  # Remove automatic title
    
    # 4. Age distribution by segment
    for seg_name in df['segment_name'].unique():
        seg_data = df[df['segment_name'] == seg_name]
        axes[1, 1].hist(seg_data['age'], bins=20, alpha=0.5, label=seg_name)
    axes[1, 1].set_xlabel('Age', fontsize=12)
    axes[1, 1].set_ylabel('Count', fontsize=12)
    axes[1, 1].set_title('Age Distribution by Segment', fontsize=14, fontweight='bold')
    axes[1, 1].legend(loc='upper right', fontsize=8)
    
    plt.tight_layout()
    
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        plt.savefig(os.path.join(output_dir, 'segment_analysis.png'), dpi=300, bbox_inches='tight')
        print(f"Saved segment visualization to {output_dir}/segment_analysis.png")
    
    plt.close()


if __name__ == "__main__":
    # Load data and features
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed')
    df = pd.read_csv(os.path.join(data_dir, 'users_with_features.csv'))
    X = np.load(os.path.join(data_dir, 'feature_matrix.npy'))
    
    print(f"Loaded {len(df)} users with {X.shape[1]} features")
    
    # Output directory for visualizations
    viz_dir = os.path.join(os.path.dirname(__file__), '..', 'results', 'visualizations')
    
    # Find optimal clusters
    optimal_k = find_optimal_clusters(X, max_k=10, output_dir=viz_dir)
    
    # Perform clustering
    labels, kmeans_model = perform_clustering(X, optimal_k)
    df['segment'] = labels
    
    # Profile segments
    profile_df = profile_segments(df)
    
    # Assign names
    df, segment_names = assign_segment_names(df)
    
    # Create visualizations
    visualize_segments(df, output_dir=viz_dir)
    
    # Save results
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'models')
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(kmeans_model, os.path.join(model_dir, 'kmeans_model.pkl'))
    
    # Save updated dataframe
    df.to_csv(os.path.join(data_dir, 'users_segmented.csv'), index=False)
    profile_df.to_csv(os.path.join(os.path.dirname(__file__), '..', 'results', 'segment_profiles.csv'), index=False)
    
    print("\nSegmentation complete!")
