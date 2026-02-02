import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Heart, Zap, ChevronDown, Sparkles, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';

// Animated counter component
const AnimatedCounter = ({ value, duration = 1.5, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(value * easeOut));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
};

const UserProfileCard = ({ user, weeklyTrend }) => {
  if (!user) return null;

  const chartData = weeklyTrend || [
    { day: 'Mon', value: 78, engagement: 78 },
    { day: 'Tue', value: 82, engagement: 82 },
    { day: 'Wed', value: 91, engagement: 91 },
    { day: 'Thu', value: 88, engagement: 88 },
    { day: 'Fri', value: 85, engagement: 85 },
    { day: 'Sat', value: 93, engagement: 93 },
    { day: 'Sun', value: 70, engagement: 70 },
  ];

  const maxValue = Math.max(...chartData.map(d => d.engagement || d.value));
  const maxIndex = chartData.findIndex(d => (d.engagement || d.value) === maxValue);

  const stats = [
    { icon: Users, label: 'Followers', value: user.followers || 0, color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.3)' },
    { icon: Heart, label: 'Engagement', value: parseFloat(user.engagementRate) || 0, suffix: '%', color: '#f87171', glow: 'rgba(248, 113, 113, 0.3)' },
    { icon: Zap, label: 'Influence', value: (parseFloat(user.influenceScore) || 0) * 100, suffix: '', color: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' },
    { icon: TrendingUp, label: 'Posts', value: user.posts || 0, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="profile-card"
    >
      {/* Animated background gradient */}
      <div className="card-bg-animation" />

      {/* Header */}
      <div className="profile-header">
        <motion.div
          className="profile-title"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="profile-icon">
            <Sparkles size={22} />
          </div>
          <div className="title-text">
            <span className="title-name">{user.username}</span>
            <span className="title-badge">{user.segment}</span>
          </div>
        </motion.div>

        <div className="profile-actions">
          <motion.button
            className="action-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            this week <ChevronDown size={14} />
          </motion.button>
          <motion.button
            className="action-btn primary"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUpRight size={16} />
          </motion.button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="profile-content">
        {/* Chart Section */}
        <div className="chart-section">
          <motion.div
            className="chart-highlight"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
          >
            <span className="highlight-value">
              <AnimatedCounter value={user.followers} prefix="" />
            </span>
            <span className="highlight-label">followers</span>
          </motion.div>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barCategoryGap="15%">
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 500 }}
              />
              <Bar
                dataKey={weeklyTrend ? "engagement" : "value"}
                radius={[6, 6, 0, 0]}
                animationDuration={1500}
                animationBegin={300}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === maxIndex ? '#ffffff' : 'rgba(255,255,255,0.5)'}
                    style={{
                      filter: index === maxIndex ? 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' : 'none'
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <motion.div
            className="main-stat"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-header">
              <span className="stat-label">TOTAL REACH</span>
              <div className="stat-change positive">
                <TrendingUp size={12} />
                +7.5%
              </div>
            </div>
            <div className="stat-value-large">
              <AnimatedCounter value={(user.followers || 0) + (user.likes || 0)} />
            </div>
            <div className="stat-bar">
              <motion.div
                className="stat-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          <motion.div
            className="secondary-stat"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-header">
              <span className="stat-label">ENGAGEMENT RATE</span>
              <div className="stat-change positive">
                <TrendingUp size={12} />
                +{user.engagementRate}%
              </div>
            </div>
            <div className="stat-value-medium">
              <AnimatedCounter value={parseFloat(user.engagementRate)} suffix="%" duration={1} />
            </div>
            <div className="engagement-details">
              <div className="detail-item">
                <Heart size={12} />
                <span>{(user.likes || 0).toLocaleString()} likes</span>
              </div>
              <div className="detail-item">
                <span>💬</span>
                <span>{(user.comments || 0).toLocaleString()} comments</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="mini-stats-bar">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="mini-stat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -4, boxShadow: `0 8px 30px ${stat.glow}` }}
            >
              <div className="mini-stat-icon" style={{ color: stat.color }}>
                <Icon size={16} />
              </div>
              <div className="mini-stat-content">
                <span className="mini-stat-value">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix || ''}
                    duration={1 + index * 0.2}
                  />
                </span>
                <span className="mini-stat-label">{stat.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interests Tags */}
      <div className="interests-section">
        <span className="interests-label">Interests</span>
        <div className="interests-tags">
          {user.interests.map((interest, index) => (
            <motion.span
              key={interest}
              className="interest-tag"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              {interest}
            </motion.span>
          ))}
        </div>
      </div>

      <style>{`
        .profile-card {
          background: linear-gradient(145deg, 
            rgba(248, 113, 113, 0.15) 0%, 
            rgba(251, 146, 60, 0.1) 30%,
            rgba(22, 22, 24, 0.95) 100%
          );
          border: 1px solid rgba(248, 113, 113, 0.2);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          position: relative;
          overflow: hidden;
        }

        .card-bg-animation {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg,
            transparent,
            rgba(248, 113, 113, 0.1),
            transparent,
            rgba(251, 146, 60, 0.1),
            transparent
          );
          animation: rotate 20s linear infinite;
          pointer-events: none;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
          position: relative;
          z-index: 2;
        }

        .profile-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .profile-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f87171 0%, #fb923c 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 30px rgba(248, 113, 113, 0.4);
        }

        .title-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .title-name {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .title-badge {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--coral);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .profile-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #f87171 0%, #fb923c 100%);
          border: none;
          color: white;
          padding: 10px;
          box-shadow: 0 4px 20px rgba(248, 113, 113, 0.3);
        }

        .profile-content {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: var(--spacing-xl);
          margin-bottom: var(--spacing-lg);
          position: relative;
          z-index: 2;
        }

        .chart-section {
          position: relative;
        }

        .chart-highlight {
          position: absolute;
          top: 0;
          left: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          padding: 10px 16px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
        }

        .highlight-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
        }

        .highlight-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stats-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .main-stat, .secondary-stat {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-sm);
        }

        .stat-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 1px;
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: var(--radius-full);
        }

        .stat-change.positive {
          color: #10b981;
          background: rgba(16, 185, 129, 0.15);
        }

        .stat-value-large {
          font-size: 2.25rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
        }

        .stat-value-medium {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: var(--spacing-sm);
        }

        .stat-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
          margin-top: var(--spacing-sm);
          overflow: hidden;
        }

        .stat-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #f87171, #fb923c);
          border-radius: var(--radius-full);
          box-shadow: 0 0 10px rgba(248, 113, 113, 0.5);
        }

        .engagement-details {
          display: flex;
          gap: var(--spacing-md);
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .detail-item svg {
          color: var(--coral);
        }

        .mini-stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          position: relative;
          z-index: 2;
        }

        .mini-stat {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          transition: all var(--transition-normal);
          cursor: pointer;
        }

        .mini-stat:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .mini-stat-icon {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mini-stat-content {
          display: flex;
          flex-direction: column;
        }

        .mini-stat-value {
          font-size: 1rem;
          font-weight: 700;
          color: white;
        }

        .mini-stat-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .interests-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          position: relative;
          z-index: 2;
        }

        .interests-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .interests-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .interest-tag {
          padding: 6px 14px;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--violet-light);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .interest-tag:hover {
          background: rgba(139, 92, 246, 0.25);
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.2);
        }

        @media (max-width: 900px) {
          .profile-content {
            grid-template-columns: 1fr;
          }

          .mini-stats-bar {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default UserProfileCard;
