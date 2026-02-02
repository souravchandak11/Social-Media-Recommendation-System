"""
FastAPI Backend for Social Media Recommendation System
Serves ML data to React frontend and provides REST API endpoints.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
import os
import sys

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from recommendation import get_recommendations, create_similarity_matrix

app = FastAPI(
    title="Social Media Recommender API",
    description="ML-powered recommendation engine API",
    version="1.0.0",
    root_path="/api" if os.environ.get("VERCEL") else ""
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global data storage
DATA = {
    "df": None,
    "similarity_matrix": None,
    "segment_stats": None,
    "city_distribution": None
}


def load_data():
    """Load processed data on startup. Auto-generates if missing."""
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_dir = os.path.join(base_dir, 'data', 'processed')
    
    # Load user data
    df_path = os.path.join(data_dir, 'users_segmented.csv')
    sim_path = os.path.join(data_dir, 'similarity_matrix.npy')
    
    # Auto-generate data if missing
    if not os.path.exists(df_path) or not os.path.exists(sim_path):
        print("⚠ Data files not found. Running pipeline to generate...")
        sys.path.insert(0, base_dir)
        from run_pipeline import run_pipeline
        run_pipeline()
        print("✓ Pipeline completed successfully")
    
    # Load user data
    DATA["df"] = pd.read_csv(df_path)
    
    # Load similarity matrix
    if os.path.exists(sim_path):
        DATA["similarity_matrix"] = np.load(sim_path)
    
    # Calculate segment stats
    df = DATA["df"]
    segment_stats = df.groupby('segment_name').agg({
        'user_id': 'count',
        'follower_count': 'mean',
        'engagement_rate': 'mean',
        'influence_score': 'mean'
    }).round(2).to_dict('index')
    DATA["segment_stats"] = segment_stats
    
    # Calculate city distribution
    city_counts = df['city'].value_counts().to_dict()
    DATA["city_distribution"] = city_counts
    
    print(f"✓ Loaded {len(df)} users")


@app.on_event("startup")
async def startup_event():
    load_data()


# Pydantic models
class User(BaseModel):
    user_id: str
    username: str
    age: int
    gender: str
    interests: str
    city: str
    follower_count: int
    following_count: int
    posts_count: int
    engagement_rate: float
    influence_score: float
    segment: Optional[int] = None
    segment_name: Optional[str] = None


class Recommendation(BaseModel):
    user_id: str
    username: str
    similarity_score: float
    segment: str
    follower_count: int
    interests: str
    reason: str


class SegmentStats(BaseModel):
    name: str
    count: int
    avg_followers: float
    avg_engagement: float
    avg_influence: float
    color: str


# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Social Media Recommender API",
        "total_users": len(DATA["df"]) if DATA["df"] is not None else 0,
        "endpoints": ["/users", "/users/{user_id}", "/recommendations/{user_id}", "/segments", "/cities"]
    }


@app.get("/users", response_model=List[dict])
async def get_users(limit: int = 100, offset: int = 0, segment: Optional[str] = None):
    """Get list of users with optional filtering."""
    df = DATA["df"]
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    if segment:
        df = df[df['segment_name'] == segment]
    
    users = df.iloc[offset:offset+limit].to_dict('records')
    return users


@app.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get single user by ID."""
    df = DATA["df"]
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    user = df[df['user_id'] == user_id]
    if len(user) == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.iloc[0].to_dict()


@app.get("/recommendations/{user_id}")
async def get_user_recommendations(user_id: str, n: int = 10):
    """Get recommendations for a specific user."""
    df = DATA["df"]
    sim_matrix = DATA["similarity_matrix"]
    
    if df is None or sim_matrix is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    try:
        recs = get_recommendations(user_id, df, sim_matrix, n_recommendations=n)
        return recs.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/segments")
async def get_segments():
    """Get segment statistics."""
    stats = DATA["segment_stats"]
    if stats is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    # Add colors
    colors = {
        "Micro-Influencers": "#f87171",
        "Engaged Creators": "#8b5cf6",
        "Rising Stars": "#06b6d4",
        "Active Community": "#10b981",
        "Casual Browsers": "#f59e0b"
    }
    
    result = []
    for name, data in stats.items():
        result.append({
            "name": name,
            "count": int(data['user_id']),
            "avg_followers": float(data['follower_count']),
            "avg_engagement": float(data['engagement_rate']),
            "avg_influence": float(data['influence_score']),
            "color": colors.get(name, "#6b7280")
        })
    
    return result


@app.get("/cities")
async def get_city_distribution():
    """Get city distribution for map visualization."""
    cities = DATA["city_distribution"]
    if cities is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    # Add coordinates for map
    city_coords = {
        "new york": {"lat": 40.7128, "lng": -74.0060},
        "los angeles": {"lat": 34.0522, "lng": -118.2437},
        "london": {"lat": 51.5074, "lng": -0.1278},
        "mumbai": {"lat": 19.0760, "lng": 72.8777},
        "tokyo": {"lat": 35.6762, "lng": 139.6503},
        "paris": {"lat": 48.8566, "lng": 2.3522},
        "berlin": {"lat": 52.5200, "lng": 13.4050},
        "sydney": {"lat": -33.8688, "lng": 151.2093},
        "toronto": {"lat": 43.6532, "lng": -79.3832},
        "singapore": {"lat": 1.3521, "lng": 103.8198},
        "dubai": {"lat": 25.2048, "lng": 55.2708},
        "hong kong": {"lat": 22.3193, "lng": 114.1694},
        "seoul": {"lat": 37.5665, "lng": 126.9780},
        "barcelona": {"lat": 41.3851, "lng": 2.1734},
        "amsterdam": {"lat": 52.3676, "lng": 4.9041}
    }
    
    result = []
    for city, count in cities.items():
        coords = city_coords.get(city.lower(), {"lat": 0, "lng": 0})
        result.append({
            "city": city.title(),
            "count": count,
            "lat": coords["lat"],
            "lng": coords["lng"]
        })
    
    return result


@app.get("/engagement/hourly")
async def get_hourly_engagement():
    """Get simulated hourly engagement data."""
    # Generate realistic hourly engagement pattern
    hours = list(range(24))
    engagement = [
        20, 15, 10, 8, 6, 8, 15, 35,  # 0-7 AM
        55, 70, 75, 80, 85, 82, 78, 72,  # 8-3 PM
        68, 75, 88, 95, 100, 85, 65, 40  # 4-11 PM
    ]
    
    return [{"hour": h, "engagement": e} for h, e in zip(hours, engagement)]


@app.get("/trends/weekly")
async def get_weekly_trends():
    """Get weekly trend data."""
    df = DATA["df"]
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    # Generate weekly trend based on actual data
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    base_engagement = df['engagement_rate'].mean()
    
    # Weekly pattern: higher on weekends
    multipliers = [0.85, 0.9, 0.95, 1.0, 1.1, 1.25, 1.2]
    
    return [
        {
            "day": day,
            "engagement": round(base_engagement * mult, 2),
            "followers": int(df['follower_count'].mean() * (0.9 + i * 0.02))
        }
        for i, (day, mult) in enumerate(zip(days, multipliers))
    ]


@app.get("/stats/summary")
async def get_summary_stats():
    """Get overall summary statistics."""
    df = DATA["df"]
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    return {
        "total_users": len(df),
        "total_segments": df['segment_name'].nunique() if 'segment_name' in df.columns else 0,
        "avg_followers": round(df['follower_count'].mean(), 0),
        "avg_engagement": round(df['engagement_rate'].mean(), 2),
        "total_interests": len(set(','.join(df['interests']).split(','))),
        "top_city": df['city'].mode().iloc[0] if len(df) > 0 else "Unknown"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
