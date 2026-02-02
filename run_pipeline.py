"""
Pipeline Runner
Complete end-to-end pipeline for the Social Media Recommendation System.
"""

import os
import sys
import time

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from data_generator import generate_synthetic_data, save_raw_data
from data_preprocessing import load_raw_data, clean_data, validate_data, save_processed_data
from feature_engineering import (
    extract_interest_features, create_demographic_features,
    create_engagement_features, create_feature_matrix, save_features
)
from segmentation import (
    find_optimal_clusters, perform_clustering, profile_segments,
    assign_segment_names, visualize_segments
)
from recommendation import create_similarity_matrix


def run_pipeline():
    """Execute the complete ML pipeline."""
    
    print("="*70)
    print("SOCIAL MEDIA ACCOUNT RECOMMENDATION SYSTEM")
    print("Complete Pipeline Execution")
    print("="*70)
    
    start_time = time.time()
    base_dir = os.path.dirname(__file__)
    
    # Check if running on Render (memory-limited)
    is_cloud = os.environ.get('RENDER') or os.environ.get('PORT')
    n_users = 1000 if is_cloud else 10000  # Smaller dataset for cloud
    
    # =========================================================================
    # Step 1: Data Generation
    # =========================================================================
    print("\n" + "="*70)
    print("STEP 1: DATA GENERATION")
    print("="*70)
    
    df = generate_synthetic_data(n_users=n_users)
    raw_path = os.path.join(base_dir, 'data', 'raw', 'social_media_users.csv')
    save_raw_data(df, raw_path)
    
    print(f"✓ Generated {len(df)} synthetic users")
    
    # =========================================================================
    # Step 2: Data Preprocessing
    # =========================================================================
    print("\n" + "="*70)
    print("STEP 2: DATA PREPROCESSING")
    print("="*70)
    
    df = load_raw_data(raw_path)
    df_clean = clean_data(df)
    
    if not validate_data(df_clean):
        print("⚠ Data validation failed, but continuing...")
    
    processed_path = os.path.join(base_dir, 'data', 'processed', 'cleaned_users.csv')
    save_processed_data(df_clean, processed_path)
    
    print(f"✓ Cleaned dataset: {len(df_clean)} users")
    
    # =========================================================================
    # Step 3: Feature Engineering
    # =========================================================================
    print("\n" + "="*70)
    print("STEP 3: FEATURE ENGINEERING")
    print("="*70)
    
    # Extract features
    interest_features, tfidf_model = extract_interest_features(df_clean)
    df_clean, gender_encoder, city_encoder = create_demographic_features(df_clean)
    df_clean = create_engagement_features(df_clean)
    X_scaled, scaler, feature_names = create_feature_matrix(df_clean, interest_features)
    
    # Save features and models
    processed_dir = os.path.join(base_dir, 'data', 'processed')
    model_dir = os.path.join(base_dir, 'data', 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    save_features(X_scaled, scaler, feature_names, processed_dir)
    
    import joblib
    joblib.dump(tfidf_model, os.path.join(model_dir, 'tfidf_model.pkl'))
    joblib.dump(gender_encoder, os.path.join(model_dir, 'gender_encoder.pkl'))
    joblib.dump(city_encoder, os.path.join(model_dir, 'city_encoder.pkl'))
    
    # Save intermediate dataframe
    df_clean.to_csv(os.path.join(processed_dir, 'users_with_features.csv'), index=False)
    
    print(f"✓ Created {len(feature_names)} features")
    print(f"✓ Feature matrix shape: {X_scaled.shape}")
    
    # =========================================================================
    # Step 4: User Segmentation
    # =========================================================================
    print("\n" + "="*70)
    print("STEP 4: USER SEGMENTATION (K-MEANS)")
    print("="*70)
    
    viz_dir = os.path.join(base_dir, 'results', 'visualizations')
    
    # Find optimal clusters
    optimal_k = find_optimal_clusters(X_scaled, max_k=8, output_dir=viz_dir)
    
    # Perform clustering
    labels, kmeans_model = perform_clustering(X_scaled, optimal_k)
    df_clean['segment'] = labels
    
    # Profile and name segments
    profile_df = profile_segments(df_clean)
    df_clean, segment_names = assign_segment_names(df_clean)
    
    # Create visualizations
    visualize_segments(df_clean, output_dir=viz_dir)
    
    # Save clustering model
    joblib.dump(kmeans_model, os.path.join(model_dir, 'kmeans_model.pkl'))
    
    # Save segmented data
    df_clean.to_csv(os.path.join(processed_dir, 'users_segmented.csv'), index=False)
    
    # Save profiles
    results_dir = os.path.join(base_dir, 'results')
    os.makedirs(results_dir, exist_ok=True)
    profile_df.to_csv(os.path.join(results_dir, 'segment_profiles.csv'), index=False)
    
    print(f"✓ Created {optimal_k} user segments")
    
    # =========================================================================
    # Step 5: Recommendation Engine
    # =========================================================================
    print("\n" + "="*70)
    print("STEP 5: RECOMMENDATION ENGINE")
    print("="*70)
    
    # Create similarity matrix
    user_similarity = create_similarity_matrix(X_scaled)
    
    # Save similarity matrix
    import numpy as np
    np.save(os.path.join(processed_dir, 'similarity_matrix.npy'), user_similarity)
    
    print(f"✓ Created similarity matrix: {user_similarity.shape}")
    
    # Test recommendations
    from recommendation import get_recommendations
    
    sample_user_id = df_clean['user_id'].iloc[0]
    sample_recs = get_recommendations(sample_user_id, df_clean, user_similarity, n_recommendations=5)
    
    print(f"\n📋 Sample recommendations for {sample_user_id}:")
    for idx, row in sample_recs.iterrows():
        print(f"   {idx+1}. {row['username']} (Score: {row['similarity_score']:.3f})")
    
    # =========================================================================
    # Summary
    # =========================================================================
    elapsed = time.time() - start_time
    
    print("\n" + "="*70)
    print("PIPELINE COMPLETE")
    print("="*70)
    print(f"\n⏱  Total execution time: {elapsed:.1f} seconds")
    print(f"\n📊 Summary:")
    print(f"   • Users processed: {len(df_clean):,}")
    print(f"   • Features created: {len(feature_names)}")
    print(f"   • User segments: {optimal_k}")
    print(f"   • Similarity matrix: {user_similarity.shape}")
    
    print(f"\n📁 Output files:")
    print(f"   • data/processed/users_segmented.csv")
    print(f"   • data/processed/similarity_matrix.npy")
    print(f"   • data/models/kmeans_model.pkl")
    print(f"   • results/segment_profiles.csv")
    print(f"   • results/visualizations/optimal_clusters.png")
    print(f"   • results/visualizations/segment_analysis.png")
    
    print(f"\n🚀 To launch the dashboard:")
    print(f"   streamlit run app/streamlit_app.py")
    print()
    
    return df_clean, X_scaled, user_similarity


if __name__ == "__main__":
    run_pipeline()
