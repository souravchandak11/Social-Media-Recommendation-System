"""
Social Media Account Recommender - Enhanced Streamlit Dashboard
Interactive dashboard with premium features from React app.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import os
import sys

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from recommendation import get_recommendations, get_segment_based_recommendations, get_diverse_recommendations


# Page configuration
st.set_page_config(
    page_title="Social Media Account Recommender",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Enhanced Custom CSS with Dark Theme
st.markdown("""
<style>
    /* Dark theme base */
    .stApp {
        background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
    }
    
    .main-header {
        font-size: 2.8rem;
        font-weight: 800;
        background: linear-gradient(135deg, #f87171 0%, #fb923c 50%, #8b5cf6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-bottom: 0.5rem;
        letter-spacing: -0.02em;
    }
    
    .sub-header {
        text-align: center;
        color: #8b8b9e;
        margin-bottom: 2rem;
        font-size: 1.1rem;
    }
    
    .metric-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 1.25rem;
        border-radius: 16px;
        backdrop-filter: blur(10px);
    }
    
    .segment-badge {
        display: inline-block;
        padding: 0.35rem 1rem;
        border-radius: 25px;
        font-size: 0.9rem;
        font-weight: 600;
        background: linear-gradient(135deg, #f87171 0%, #8b5cf6 100%);
        color: white;
    }
    
    .interest-tag {
        background: rgba(139, 92, 246, 0.15);
        border: 1px solid rgba(139, 92, 246, 0.3);
        padding: 4px 12px;
        border-radius: 20px;
        margin: 3px;
        display: inline-block;
        font-size: 0.85rem;
        color: #c4b5fd;
    }
    
    .card-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #e2e8f0;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        background: linear-gradient(135deg, #f87171, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    .stat-label {
        font-size: 0.85rem;
        color: #8b8b9e;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
</style>
""", unsafe_allow_html=True)


# City coordinates for map
CITY_COORDS = {
    "new york": {"lat": 40.7128, "lon": -74.0060},
    "los angeles": {"lat": 34.0522, "lon": -118.2437},
    "london": {"lat": 51.5074, "lon": -0.1278},
    "mumbai": {"lat": 19.0760, "lon": 72.8777},
    "tokyo": {"lat": 35.6762, "lon": 139.6503},
    "paris": {"lat": 48.8566, "lon": 2.3522},
    "berlin": {"lat": 52.5200, "lon": 13.4050},
    "sydney": {"lat": -33.8688, "lon": 151.2093},
    "toronto": {"lat": 43.6532, "lon": -79.3832},
    "singapore": {"lat": 1.3521, "lon": 103.8198},
    "dubai": {"lat": 25.2048, "lon": 55.2708},
    "hong kong": {"lat": 22.3193, "lon": 114.1694},
    "seoul": {"lat": 37.5665, "lon": 126.9780},
    "barcelona": {"lat": 41.3851, "lon": 2.1734},
    "amsterdam": {"lat": 52.3676, "lon": 4.9041}
}


@st.cache_data
def load_data():
    """Load processed data and similarity matrix. Auto-generates if missing."""
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_dir = os.path.join(base_dir, 'data', 'processed')
    
    df_path = os.path.join(data_dir, 'users_segmented.csv')
    if not os.path.exists(df_path):
        # Trigger pipeline if data is missing
        with st.spinner("🚀 Initializing recommendation system (first-time setup)..."):
            sys.path.append(base_dir)
            from run_pipeline import run_pipeline
            run_pipeline()
            st.rerun()
    
    df = pd.read_csv(df_path)
    
    sim_path = os.path.join(data_dir, 'similarity_matrix.npy')
    if os.path.exists(sim_path):
        user_similarity = np.load(sim_path)
    else:
        user_similarity = None
    
    return df, user_similarity


def format_number(num):
    """Format large numbers with K/M suffixes."""
    if num >= 1_000_000:
        return f"{num/1_000_000:.1f}M"
    elif num >= 1_000:
        return f"{num/1_000:.1f}K"
    else:
        return str(int(num))


def get_segment_color(segment_name):
    """Get color for segment badge."""
    colors = {
        'Micro-Influencers': '#f87171',
        'Engaged Creators': '#8b5cf6',
        'Rising Stars': '#06b6d4',
        'Active Community': '#10b981',
        'Casual Browsers': '#f59e0b',
        'New Users': '#ec4899',
        'Passive Viewers': '#6b7280'
    }
    return colors.get(segment_name, '#8b5cf6')


def create_city_map(df):
    """Create interactive map showing user distribution by city."""
    city_counts = df['city'].value_counts().reset_index()
    city_counts.columns = ['city', 'count']
    
    # Add coordinates
    city_counts['lat'] = city_counts['city'].apply(
        lambda x: CITY_COORDS.get(x.lower(), {}).get('lat', 0)
    )
    city_counts['lon'] = city_counts['city'].apply(
        lambda x: CITY_COORDS.get(x.lower(), {}).get('lon', 0)
    )
    city_counts = city_counts[city_counts['lat'] != 0]
    
    fig = go.Figure()
    
    fig.add_trace(go.Scattergeo(
        lat=city_counts['lat'],
        lon=city_counts['lon'],
        mode='markers',
        marker=dict(
            size=city_counts['count'] / city_counts['count'].max() * 40 + 8,
            color=city_counts['count'],
            colorscale='Viridis',
            opacity=0.8,
            line=dict(width=1, color='white')
        ),
        text=city_counts.apply(
            lambda r: f"<b>{r['city'].title()}</b><br>Users: {r['count']:,}", axis=1
        ),
        hoverinfo='text'
    ))
    
    fig.update_layout(
        geo=dict(
            showland=True,
            landcolor='rgb(30, 30, 50)',
            showocean=True,
            oceancolor='rgb(15, 15, 30)',
            showcountries=True,
            countrycolor='rgb(60, 60, 80)',
            showcoastlines=True,
            coastlinecolor='rgb(60, 60, 80)',
            projection_type='natural earth',
            bgcolor='rgba(0,0,0,0)'
        ),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        margin=dict(l=0, r=0, t=30, b=0),
        height=350,
        title=dict(text='🌍 Global User Distribution', font=dict(color='#e2e8f0', size=16))
    )
    
    return fig


def create_engagement_radar(df):
    """Create radar chart showing engagement by hour."""
    # Simulated hourly engagement pattern
    hours = list(range(24))
    engagement = [
        20, 15, 10, 8, 6, 8, 15, 35,  # 0-7 AM
        55, 70, 75, 80, 85, 82, 78, 72,  # 8-3 PM
        68, 75, 88, 95, 100, 85, 65, 40  # 4-11 PM
    ]
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatterpolar(
        r=engagement + [engagement[0]],  # Close the loop
        theta=[f'{h}:00' for h in hours] + ['0:00'],
        fill='toself',
        fillcolor='rgba(139, 92, 246, 0.3)',
        line=dict(color='#8b5cf6', width=2),
        name='Engagement'
    ))
    
    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 110],
                tickfont=dict(color='#8b8b9e'),
                gridcolor='rgba(255,255,255,0.1)'
            ),
            angularaxis=dict(
                tickfont=dict(color='#8b8b9e'),
                gridcolor='rgba(255,255,255,0.1)'
            ),
            bgcolor='rgba(0,0,0,0)'
        ),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        showlegend=False,
        margin=dict(l=60, r=60, t=40, b=40),
        height=350,
        title=dict(text='⏰ Engagement by Hour', font=dict(color='#e2e8f0', size=16))
    )
    
    return fig


def create_weekly_trend(df):
    """Create weekly engagement trend chart."""
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    base = df['engagement_rate'].mean() if 'engagement_rate' in df.columns else 5
    multipliers = [0.85, 0.9, 0.95, 1.0, 1.1, 1.25, 1.2]
    engagement = [base * m for m in multipliers]
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=days,
        y=engagement,
        mode='lines+markers',
        fill='tozeroy',
        fillcolor='rgba(248, 113, 113, 0.2)',
        line=dict(color='#f87171', width=3),
        marker=dict(size=8, color='#f87171')
    ))
    
    fig.update_layout(
        xaxis=dict(
            tickfont=dict(color='#8b8b9e'),
            gridcolor='rgba(255,255,255,0.05)'
        ),
        yaxis=dict(
            tickfont=dict(color='#8b8b9e'),
            gridcolor='rgba(255,255,255,0.05)',
            title='Engagement Rate'
        ),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        margin=dict(l=50, r=20, t=40, b=40),
        height=250,
        title=dict(text='📈 Weekly Trend', font=dict(color='#e2e8f0', size=16))
    )
    
    return fig


def create_segment_donut(df):
    """Create donut chart for segment distribution."""
    if 'segment_name' not in df.columns:
        return None
    
    segment_counts = df['segment_name'].value_counts()
    colors = [get_segment_color(s) for s in segment_counts.index]
    
    fig = go.Figure(data=[go.Pie(
        labels=segment_counts.index,
        values=segment_counts.values,
        hole=0.6,
        marker=dict(colors=colors),
        textinfo='percent',
        textfont=dict(color='white', size=12),
        hovertemplate='<b>%{label}</b><br>Users: %{value:,}<br>%{percent}<extra></extra>'
    )])
    
    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        showlegend=True,
        legend=dict(
            font=dict(color='#8b8b9e'),
            bgcolor='rgba(0,0,0,0)'
        ),
        margin=dict(l=20, r=20, t=40, b=20),
        height=300,
        title=dict(text='📊 Segment Distribution', font=dict(color='#e2e8f0', size=16))
    )
    
    return fig


def main():
    # Load data
    df, user_similarity = load_data()
    
    # Premium Header
    st.markdown('<h1 class="main-header">🎯 SocialAI Recommender</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Powered by K-Means Clustering & Hybrid Collaborative Filtering</p>', unsafe_allow_html=True)
    
    # Top Stats Row
    stats_col1, stats_col2, stats_col3, stats_col4 = st.columns(4)
    
    with stats_col1:
        st.markdown(f"""
            <div class="metric-card">
                <div class="stat-value">{format_number(len(df))}</div>
                <div class="stat-label">Total Users</div>
            </div>
        """, unsafe_allow_html=True)
    
    with stats_col2:
        n_segments = df['segment_name'].nunique() if 'segment_name' in df.columns else 0
        st.markdown(f"""
            <div class="metric-card">
                <div class="stat-value">{n_segments}</div>
                <div class="stat-label">Segments</div>
            </div>
        """, unsafe_allow_html=True)
    
    with stats_col3:
        avg_eng = df['engagement_rate'].mean() if 'engagement_rate' in df.columns else 0
        st.markdown(f"""
            <div class="metric-card">
                <div class="stat-value">{avg_eng:.1f}</div>
                <div class="stat-label">Avg Engagement</div>
            </div>
        """, unsafe_allow_html=True)
    
    with stats_col4:
        total_interests = len(set(','.join(df['interests']).split(',')))
        st.markdown(f"""
            <div class="metric-card">
                <div class="stat-value">{total_interests}</div>
                <div class="stat-label">Interest Categories</div>
            </div>
        """, unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Sidebar
    st.sidebar.markdown("## 🔍 User Selection")
    
    search_term = st.sidebar.text_input("Search username", "")
    
    if search_term:
        filtered_users = df[df['username'].str.contains(search_term, case=False)]
        username_options = filtered_users['username'].tolist() if len(filtered_users) > 0 else df['username'].tolist()
    else:
        username_options = df['username'].tolist()
    
    selected_user = st.sidebar.selectbox("Select User", username_options, index=0)
    user_data = df[df['username'] == selected_user].iloc[0]
    user_id = user_data['user_id']
    
    st.sidebar.markdown("---")
    st.sidebar.markdown("## ⚙️ Settings")
    n_recommendations = st.sidebar.slider("Recommendations", 5, 20, 10)
    rec_type = st.sidebar.radio("Type", ["Hybrid (Best)", "Same Segment", "Diverse"])
    
    # Main Grid Layout
    col1, col2, col3 = st.columns([1.5, 1, 1.5])
    
    # User Profile Card
    with col1:
        st.markdown('<div class="card-title">👤 User Profile</div>', unsafe_allow_html=True)
        
        st.markdown(f"### {user_data['username']}")
        
        segment_name = user_data.get('segment_name', 'Unknown')
        segment_color = get_segment_color(segment_name)
        st.markdown(f'<span class="segment-badge" style="background: {segment_color};">{segment_name}</span>', 
                    unsafe_allow_html=True)
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Followers", format_number(user_data['follower_count']))
        m2.metric("Following", format_number(user_data['following_count']))
        m3.metric("Posts", format_number(user_data['posts_count']))
        if 'engagement_rate' in user_data:
            m4.metric("Engagement", f"{user_data['engagement_rate']:.1f}")
        
        st.markdown("**Interests:**")
        interests = user_data['interests'].split(',')
        interest_html = ''.join([f'<span class="interest-tag">{i.strip()}</span>' for i in interests if i.strip()])
        st.markdown(interest_html, unsafe_allow_html=True)
        
        st.markdown(f"**📍 Location:** {user_data['city'].title()} • **Age:** {user_data['age']}")
        
        # Weekly Trend
        st.plotly_chart(create_weekly_trend(df), use_container_width=True)
    
    # Middle Column - Segment Distribution + Map
    with col2:
        fig_donut = create_segment_donut(df)
        if fig_donut:
            st.plotly_chart(fig_donut, use_container_width=True)
        
        st.plotly_chart(create_engagement_radar(df), use_container_width=True)
    
    # Recommendations Column
    with col3:
        st.markdown('<div class="card-title">🤖 AI Recommendations</div>', unsafe_allow_html=True)
        
        if user_similarity is not None:
            try:
                if rec_type == "Hybrid (Best)":
                    recommendations = get_recommendations(user_id, df, user_similarity, n_recommendations=n_recommendations)
                elif rec_type == "Same Segment":
                    recommendations = get_segment_based_recommendations(user_id, df, n_recommendations=n_recommendations)
                else:
                    recommendations = get_diverse_recommendations(user_id, df, user_similarity, n_recommendations=n_recommendations)
                
                for idx, row in recommendations.head(n_recommendations).iterrows():
                    with st.expander(f"**{idx+1}. {row['username']}** ({row.get('segment', 'Unknown')})", expanded=idx<3):
                        if 'similarity_score' in row:
                            st.progress(min(float(row['similarity_score']), 1.0))
                            st.caption(f"Match: {row['similarity_score']:.1%}")
                        if 'reason' in row:
                            st.write(f"💡 {row['reason']}")
                        st.write(f"👥 {format_number(row['follower_count'])} followers")
                        
            except Exception as e:
                st.error(f"Error: {e}")
        else:
            st.warning("Run pipeline first: python run_pipeline.py")
    
    # Full-width Map
    st.markdown("---")
    st.plotly_chart(create_city_map(df), use_container_width=True)
    
    # Bottom Analytics
    st.markdown("---")
    st.markdown('<div class="card-title">📊 Detailed Analytics</div>', unsafe_allow_html=True)
    
    tab1, tab2, tab3 = st.tabs(["Engagement Analysis", "Demographics", "Interest Cloud"])
    
    with tab1:
        if 'segment_name' in df.columns and 'engagement_rate' in df.columns:
            segment_stats = df.groupby('segment_name').agg({
                'engagement_rate': 'mean',
                'follower_count': 'mean',
                'influence_score': 'mean'
            }).round(2)
            
            fig = px.bar(
                segment_stats,
                y=segment_stats.index,
                x='engagement_rate',
                orientation='h',
                color='engagement_rate',
                color_continuous_scale='Viridis'
            )
            fig.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color='#8b8b9e'),
                xaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
                yaxis=dict(gridcolor='rgba(255,255,255,0.05)')
            )
            st.plotly_chart(fig, use_container_width=True)
    
    with tab2:
        fig = px.histogram(
            df, x='age',
            color='segment_name' if 'segment_name' in df.columns else None,
            nbins=20, barmode='overlay', opacity=0.7
        )
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#8b8b9e')
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with tab3:
        all_interests = []
        for interests_str in df['interests']:
            if interests_str:
                all_interests.extend([i.strip() for i in interests_str.split(',') if i.strip()])
        
        interest_counts = pd.Series(all_interests).value_counts().head(15)
        
        fig = px.treemap(
            names=interest_counts.index,
            parents=[''] * len(interest_counts),
            values=interest_counts.values,
            color=interest_counts.values,
            color_continuous_scale='Viridis'
        )
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            margin=dict(l=10, r=10, t=10, b=10)
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # Footer
    st.markdown("---")
    st.markdown("""
        <div style="text-align: center; color: #6b7280; padding: 1rem;">
            <p>Built with Python, Scikit-learn & Streamlit • Social Media Recommendation System</p>
        </div>
    """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()
