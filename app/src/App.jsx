import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Sparkles, Zap, TrendingUp, Users, MapPin, Clock, BarChart3 } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UserProfileCard from './components/UserProfileCard';
import AlertCard from './components/AlertCard';
import SegmentDistributionCard from './components/SegmentDistributionCard';
import UserMapCard from './components/UserMapCard';
import EngagementRadarCard from './components/EngagementRadarCard';
import RecommendationsCard from './components/RecommendationsCard';
import UserSelectionCard from './components/UserSelectionCard';
import SegmentStatsCard from './components/SegmentStatsCard';

// Utils - Frontend data generation (fallback)
import {
  generateUserData,
  performClustering,
  getRecommendations as getLocalRecommendations,
  getSegmentStats as getLocalSegmentStats,
  getCityDistribution as getLocalCityDistribution,
  getEngagementByHour as getLocalEngagementByHour,
  getWeeklyTrend as getLocalWeeklyTrend
} from './utils/dataGenerator';

import './index.css';

// API Base URL - Uses deployed backend, or falls back to localhost for development
const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://social-media-recommendation-system-1.onrender.com');

// Premium Loading Screen Component
const LoadingScreen = ({ progress, status }) => {
  const loadingSteps = [
    { icon: Users, text: 'Loading user dataset...' },
    { icon: Target, text: 'Running K-Means clustering...' },
    { icon: Zap, text: 'Building recommendation engine...' },
    { icon: TrendingUp, text: 'Calculating similarities...' },
  ];

  const currentStep = Math.min(Math.floor(progress / 25), 3);

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
    >
      {/* Animated background gradients */}
      <div className="loading-bg">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="loading-content"
      >
        {/* Logo */}
        <motion.div
          className="loading-logo"
          animate={{
            boxShadow: [
              '0 0 40px rgba(248, 113, 113, 0.3)',
              '0 0 60px rgba(139, 92, 246, 0.4)',
              '0 0 40px rgba(248, 113, 113, 0.3)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={40} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="loading-title"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="gradient-text">SocialAI</span> Recommender
        </motion.h1>

        <motion.p
          className="loading-subtitle"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Powered by K-Means Clustering & Collaborative Filtering
        </motion.p>

        {/* Data source indicator */}
        {status && (
          <motion.div
            className="data-source-badge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {status}
          </motion.div>
        )}

        {/* Progress bar */}
        <motion.div
          className="loading-progress-container"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="progress-glow"
              initial={{ left: '0%' }}
              animate={{ left: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="progress-text">
            <span>{Math.round(progress)}%</span>
          </div>
        </motion.div>

        {/* Loading steps */}
        <div className="loading-steps">
          {loadingSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <motion.div
                key={index}
                className={`loading-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="step-icon">
                  <Icon size={16} />
                </div>
                <span className="step-text">{step.text}</span>
                {isCompleted && (
                  <motion.span
                    className="step-check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <style>{`
        .loading-screen {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          z-index: 1000;
          overflow: hidden;
        }

        .loading-bg {
          position: absolute;
          inset: 0;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 6s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: rgba(248, 113, 113, 0.2);
          top: 10%;
          left: 20%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: rgba(139, 92, 246, 0.2);
          bottom: 20%;
          right: 20%;
          animation-delay: 2s;
        }

        .orb-3 {
          width: 250px;
          height: 250px;
          background: rgba(94, 234, 212, 0.15);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }

        .loading-content {
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .loading-logo {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #f87171 0%, #fb923c 50%, #8b5cf6 100%);
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 32px;
        }

        .loading-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 12px;
          letter-spacing: -0.03em;
        }

        .gradient-text {
          background: linear-gradient(135deg, #f87171, #fb923c, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .loading-subtitle {
          font-size: 1rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .data-source-badge {
          display: inline-block;
          padding: 6px 16px;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 20px;
          color: #c4b5fd;
          font-size: 0.85rem;
          margin-bottom: 30px;
        }

        .loading-progress-container {
          width: 300px;
          margin: 0 auto 40px;
        }

        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: visible;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f87171, #fb923c, #8b5cf6);
          border-radius: 3px;
          position: relative;
        }

        .progress-glow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          filter: blur(8px);
          opacity: 0.6;
        }

        .progress-text {
          text-align: right;
          margin-top: 8px;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .loading-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }

        .loading-step {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.875rem;
          color: var(--text-dim);
          transition: all 0.3s ease;
        }

        .loading-step.active {
          color: var(--text-primary);
        }

        .loading-step.completed {
          color: var(--emerald);
        }

        .step-icon {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-step.active .step-icon {
          background: linear-gradient(135deg, #f87171, #8b5cf6);
          color: white;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .loading-step.completed .step-icon {
          background: rgba(16, 185, 129, 0.2);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .step-text {
          min-width: 220px;
          text-align: left;
        }

        .step-check {
          color: var(--emerald);
          font-weight: 700;
        }
      `}</style>
    </motion.div>
  );
};

// Utility function to check API health
async function checkAPIHealth() {
  try {
    const response = await fetch(`${API_URL}/`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

// Fetch users from API
async function fetchUsersFromAPI(limit = 1000) {
  const response = await fetch(`${API_URL}/users?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch users');
  const users = await response.json();

  return users.map(user => ({
    userId: user.user_id,
    username: user.username,
    age: user.age,
    gender: user.gender,
    city: user.city ? user.city.charAt(0).toUpperCase() + user.city.slice(1) : 'Unknown',
    interests: user.interests ? user.interests.split(',').map(i => i.trim()) : [],
    followers: user.follower_count || 0,
    following: user.following_count || 0,
    posts: user.posts_count || 0,
    likes: user.likes_received || 0,
    comments: user.comments_received || Math.floor((user.likes_received || 0) * 0.15),
    shares: user.shares || Math.floor((user.likes_received || 0) * 0.05),
    engagementRate: user.engagement_rate?.toFixed(2) || '0',
    influenceScore: user.influence_score?.toFixed(3) || '0',
    segment: user.segment_name || 'Unknown',
    segmentColor: getSegmentColor(user.segment_name),
    segmentId: user.segment
  }));
}

// Get segment color
function getSegmentColor(segmentName) {
  const colors = {
    'Micro-Influencers': '#f87171',
    'Engaged Creators': '#8b5cf6',
    'Rising Stars': '#06b6d4',
    'Active Community': '#10b981',
    'Casual Browsers': '#f59e0b',
    'Highly Engaged': '#3b82f6',
    'Growing Accounts': '#10b981'
  };
  return colors[segmentName] || '#6b7280';
}

// Fetch recommendations from API
async function fetchRecommendationsFromAPI(userId, n = 10) {
  const response = await fetch(`${API_URL}/recommendations/${userId}?n=${n}`);
  if (!response.ok) throw new Error('Failed to fetch recommendations');
  const recs = await response.json();

  return recs.map(rec => ({
    userId: rec.user_id,
    username: rec.username,
    similarity: rec.similarity_score,
    segment: rec.segment,
    segmentColor: getSegmentColor(rec.segment),
    followers: rec.follower_count,
    interests: rec.interests ? rec.interests.split(',').map(i => i.trim()) : [],
    reason: rec.reason
  }));
}

// Fetch segment stats from API
async function fetchSegmentStatsFromAPI() {
  const response = await fetch(`${API_URL}/segments`);
  if (!response.ok) throw new Error('Failed to fetch segments');
  const segments = await response.json();

  const stats = {};
  const total = segments.reduce((s, x) => s + x.count, 0);
  segments.forEach(seg => {
    stats[seg.name] = {
      name: seg.name,
      color: seg.color,
      count: seg.count,
      percentage: ((seg.count / total) * 100).toFixed(1),
      avgEngagement: seg.avg_engagement.toFixed(2),
      avgFollowers: Math.round(seg.avg_followers),
      avgInfluence: seg.avg_influence.toFixed(3)
    };
  });
  return stats;
}

// Fetch cities from API
async function fetchCitiesFromAPI() {
  const response = await fetch(`${API_URL}/cities`);
  if (!response.ok) throw new Error('Failed to fetch cities');
  const cities = await response.json();

  const distribution = {};
  cities.forEach(city => {
    distribution[city.city] = city.count;
  });
  return distribution;
}

// Fetch hourly engagement from API
async function fetchHourlyEngagementFromAPI() {
  const response = await fetch(`${API_URL}/engagement/hourly`);
  if (!response.ok) throw new Error('Failed to fetch engagement');
  return await response.json();
}

// Fetch weekly trend from API
async function fetchWeeklyTrendFromAPI() {
  const response = await fetch(`${API_URL}/trends/weekly`);
  if (!response.ok) throw new Error('Failed to fetch trends');
  return await response.json();
}

function App() {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [segmentStats, setSegmentStats] = useState({});
  const [cityDistribution, setCityDistribution] = useState({});
  const [engagementByHour, setEngagementByHour] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [usingAPI, setUsingAPI] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    setLoadingProgress(0);

    try {
      // Check if Python API is available
      setLoadingProgress(5);
      const apiAvailable = await checkAPIHealth();

      let clusteredUsers, stats, cities, hourly, weekly;

      if (apiAvailable) {
        // Use Python ML backend
        setLoadingStatus('🚀 Connected to Python ML Backend');
        setUsingAPI(true);

        setLoadingProgress(20);
        clusteredUsers = await fetchUsersFromAPI(1000);

        setLoadingProgress(40);
        stats = await fetchSegmentStatsFromAPI();

        setLoadingProgress(60);
        cities = await fetchCitiesFromAPI();

        setLoadingProgress(80);
        hourly = await fetchHourlyEngagementFromAPI();
        weekly = await fetchWeeklyTrendFromAPI();

      } else {
        // Fallback to frontend-only mode
        setLoadingStatus('⚡ Using Local Data Generation');
        setUsingAPI(false);

        setLoadingProgress(20);
        const rawUsers = generateUserData(1000);

        setLoadingProgress(50);
        clusteredUsers = performClustering(rawUsers);

        setLoadingProgress(70);
        stats = getLocalSegmentStats(clusteredUsers);
        cities = getLocalCityDistribution(clusteredUsers);

        setLoadingProgress(90);
        hourly = getLocalEngagementByHour();
        weekly = getLocalWeeklyTrend();
      }

      setUsers(clusteredUsers);
      setSelectedUser(clusteredUsers[0]);
      setSegmentStats(stats);
      setCityDistribution(cities);
      setEngagementByHour(hourly);
      setWeeklyTrend(weekly);

      // Get initial recommendations
      setLoadingProgress(95);
      if (apiAvailable && clusteredUsers[0]) {
        try {
          const recs = await fetchRecommendationsFromAPI(clusteredUsers[0].userId, 10);
          setRecommendations(recs);
        } catch {
          setRecommendations(getLocalRecommendations(clusteredUsers[0], clusteredUsers));
        }
      } else {
        setRecommendations(getLocalRecommendations(clusteredUsers[0], clusteredUsers));
      }

      setLoadingProgress(100);

      setTimeout(() => {
        setLoading(false);
      }, 800);

    } catch (error) {
      console.error('Error loading data:', error);

      // Ultimate fallback - generate local data
      setLoadingStatus('⚡ Using Local Data (Fallback)');
      const rawUsers = generateUserData(500);
      const clusteredUsers = performClustering(rawUsers);

      setUsers(clusteredUsers);
      setSelectedUser(clusteredUsers[0]);
      setSegmentStats(getLocalSegmentStats(clusteredUsers));
      setCityDistribution(getLocalCityDistribution(clusteredUsers));
      setEngagementByHour(getLocalEngagementByHour());
      setWeeklyTrend(getLocalWeeklyTrend());
      setRecommendations(getLocalRecommendations(clusteredUsers[0], clusteredUsers));

      setLoadingProgress(100);
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);

    if (usingAPI) {
      try {
        const recs = await fetchRecommendationsFromAPI(user.userId, 10);
        setRecommendations(recs);
      } catch {
        setRecommendations(getLocalRecommendations(user, users));
      }
    } else {
      setRecommendations(getLocalRecommendations(user, users));
    }
  };

  const handleRefresh = () => {
    initializeData();
  };

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen progress={Math.min(loadingProgress, 100)} status={loadingStatus} />}
      </AnimatePresence>

      {!loading && (
        <motion.div
          className="app-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Sidebar />

          <main className="main-content">
            <Header
              totalUsers={users.length}
              onRefresh={handleRefresh}
              selectedUser={selectedUser}
              usingAPI={usingAPI}
            />

            <div className="dashboard-grid">
              {/* Row 1: Main Profile Card */}
              <motion.div
                className="col-span-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <UserProfileCard
                  user={selectedUser}
                  weeklyTrend={weeklyTrend}
                />
              </motion.div>

              <motion.div
                className="col-span-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="stack-cards">
                  <AlertCard selectedUser={selectedUser} />
                  <SegmentDistributionCard
                    segmentStats={segmentStats}
                    users={users}
                  />
                </div>
              </motion.div>

              {/* Row 2: User Selection + Map + Engagement Radar + AI Recommendations */}
              <motion.div
                className="col-span-3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <UserSelectionCard
                  users={users}
                  selectedUser={selectedUser}
                  onSelectUser={handleUserSelect}
                />
              </motion.div>

              <motion.div
                className="col-span-3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <UserMapCard
                  cityDistribution={cityDistribution}
                  users={users}
                />
              </motion.div>

              <motion.div
                className="col-span-3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <EngagementRadarCard
                  engagementByHour={engagementByHour}
                />
              </motion.div>

              <motion.div
                className="col-span-3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <RecommendationsCard
                  recommendations={recommendations}
                  selectedUser={selectedUser}
                />
              </motion.div>

              {/* Row 3: Segment Stats */}
              <motion.div
                className="col-span-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <SegmentStatsCard segmentStats={segmentStats} />
              </motion.div>
            </div>
          </main>
        </motion.div>
      )}

      <style>{`
        .stack-cards {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        /* Responsive adjustments */
        @media (max-width: 1400px) {
          .dashboard-grid {
            grid-template-columns: repeat(6, 1fr);
          }
          
          .col-span-8 { grid-column: span 6; }
          .col-span-4 { grid-column: span 6; }
          .col-span-3 { grid-column: span 3; }
          .col-span-12 { grid-column: span 6; }
        }

        @media (max-width: 1000px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .col-span-8,
          .col-span-4,
          .col-span-3,
          .col-span-12 {
            grid-column: span 1;
          }

          .stack-cards {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .main-content {
            padding: var(--spacing-md);
          }

          .stack-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export default App;
