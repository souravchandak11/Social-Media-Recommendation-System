import pandas as pd
import json
import os

# Load the segmented data
df = pd.read_csv('data/processed/users_segmented.csv')

print(f"Loaded {len(df)} users from Kaggle dataset")
print(f"Columns: {df.columns.tolist()}")

# Sample first 1000 users for the dashboard
sample_df = df.head(1000).copy()

# Define segment colors
segment_colors = {
    'Micro-Influencers': '#8b5cf6',
    'Highly Engaged': '#3b82f6', 
    'Engaged Creators': '#3b82f6',
    'Growing Accounts': '#10b981',
    'Active Community': '#f59e0b',
    'Casual Users': '#6b7280',
    'Content Creators': '#ec4899',
    'Newbies': '#6b7280'
}

# Process the data
users = []
for idx, row in sample_df.iterrows():
    # Parse interests (might be a string representation of list)
    interests = row.get('interests', '[]')
    if isinstance(interests, str):
        try:
            interests = eval(interests) if interests.startswith('[') else interests.split(',')
        except:
            interests = ['general']
    
    segment_name = str(row.get('segment_name', 'Casual Users'))
    
    user = {
        'userId': str(row.get('user_id', f'U{idx:04d}')),
        'username': str(row.get('username', f'user_{idx}')),
        'age': int(row.get('age', 25)),
        'gender': str(row.get('gender', 'Unknown')),
        'city': str(row.get('city', 'Unknown')),
        'interests': interests if isinstance(interests, list) else [interests],
        'followers': int(row.get('follower_count', 0)),
        'following': int(row.get('following_count', 0)),
        'posts': int(row.get('post_count', 0)) if 'post_count' in row else int(row.get('activity_score', 0) * 10),
        'likes': int(row.get('follower_count', 0) * 0.1),
        'comments': int(row.get('follower_count', 0) * 0.02),
        'shares': int(row.get('follower_count', 0) * 0.005),
        'engagementRate': str(round(float(row.get('engagement', row.get('activity_score', 5))), 2)),
        'influenceScore': str(round(float(row.get('influence_score', 0.5)), 3)),
        'segment': segment_name,
        'segmentColor': segment_colors.get(segment_name, '#6b7280'),
        'segmentId': list(segment_colors.keys()).index(segment_name) if segment_name in segment_colors else 4,
        'isVerified': bool(row.get('is_verified', False))
    }
    users.append(user)

# Save to JSON
output_path = 'app/public/kaggle_users.json'
os.makedirs('app/public', exist_ok=True)

with open(output_path, 'w') as f:
    json.dump(users, f)

print(f"\nExported {len(users)} users to {output_path}")
print(f"Sample user: {json.dumps(users[0], indent=2)}")

# Get segment distribution
segments = {}
for user in users:
    seg = user['segment']
    segments[seg] = segments.get(seg, 0) + 1

print(f"\nSegment distribution:")
for seg, count in sorted(segments.items(), key=lambda x: -x[1]):
    print(f"  {seg}: {count} users")
