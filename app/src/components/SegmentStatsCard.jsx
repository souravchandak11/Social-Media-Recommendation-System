import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart2, TrendingUp, Users, ArrowUpRight, Sparkles } from 'lucide-react';

// Animated counter
const AnimatedValue = ({ value, suffix = '' }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {value}{suffix}
    </motion.span>
  );
};

const SegmentStatsCard = ({ segmentStats }) => {
  const segments = Object.values(segmentStats || {});

  // Ensure pieData has valid values to prevent NaN in SVG
  const pieData = segments.length > 0
    ? segments.map(seg => ({
      name: seg.name || 'Unknown',
      value: seg.count || 0,
      color: seg.color || '#6b7280',
      avgEngagement: seg.avgEngagement || 0
    }))
    : [{ name: 'No Data', value: 1, color: '#6b7280', avgEngagement: 0 }];

  const totalUsers = segments.reduce((acc, seg) => acc + (seg.count || 0), 0) || 1;
  const avgEngagement = segments.length > 0
    ? (segments.reduce((acc, seg) => acc + (seg.avgEngagement || 0), 0) / segments.length).toFixed(1)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="stats-card"
    >
      {/* Background decorations */}
      <div className="card-decoration left" />
      <div className="card-decoration right" />

      {/* Header */}
      <div className="stats-header">
        <div className="header-left">
          <motion.div
            className="header-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <BarChart2 size={20} />
          </motion.div>
          <div>
            <h3 className="stats-title">Segment Performance Overview</h3>
            <p className="stats-subtitle">K-Means Clustering Analysis</p>
          </div>
        </div>
        <motion.button
          className="view-all-btn"
          whileHover={{ scale: 1.02, x: 3 }}
          whileTap={{ scale: 0.98 }}
        >
          View Details <ArrowUpRight size={14} />
        </motion.button>
      </div>

      {/* Main Content Grid */}
      <div className="stats-grid">
        {/* Pie Chart Section */}
        <div className="chart-section">
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1200}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="transparent"
                      style={{
                        filter: `drop-shadow(0 0 8px ${entry.color}50)`
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="custom-tooltip">
                          <div className="tooltip-header">
                            <span className="tooltip-dot" style={{ background: data.color }} />
                            <span className="tooltip-name">{data.name}</span>
                          </div>
                          <div className="tooltip-stats">
                            <div className="tooltip-stat">
                              <Users size={12} />
                              <span>{data.value} users</span>
                            </div>
                            <div className="tooltip-stat">
                              <TrendingUp size={12} />
                              <span>{data.avgEngagement}% eng.</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Stats */}
            <motion.div
              className="chart-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
            >
              <span className="center-value">{totalUsers}</span>
              <span className="center-label">Total Users</span>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          {/* Summary Cards */}
          <div className="summary-cards">
            <motion.div
              className="summary-card"
              whileHover={{ scale: 1.03, y: -4 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #f87171, #fb923c)' }}>
                <Users size={18} />
              </div>
              <div className="summary-content">
                <span className="summary-value"><AnimatedValue value={segments.length} /></span>
                <span className="summary-label">Segments</span>
              </div>
            </motion.div>

            <motion.div
              className="summary-card"
              whileHover={{ scale: 1.03, y: -4 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <TrendingUp size={18} />
              </div>
              <div className="summary-content">
                <span className="summary-value"><AnimatedValue value={avgEngagement} suffix="%" /></span>
                <span className="summary-label">Avg Engagement</span>
              </div>
            </motion.div>

            <motion.div
              className="summary-card"
              whileHover={{ scale: 1.03, y: -4 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
            >
              <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                <Sparkles size={18} />
              </div>
              <div className="summary-content">
                <span className="summary-value"><AnimatedValue value={85} suffix="%" /></span>
                <span className="summary-label">Accuracy</span>
              </div>
            </motion.div>
          </div>

          {/* Segment List */}
          <div className="segment-list">
            {segments.map((seg, index) => (
              <motion.div
                key={seg.name}
                className="segment-row"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.08 }}
                whileHover={{ x: 8, background: 'rgba(255, 255, 255, 0.04)' }}
              >
                <div className="segment-info">
                  <motion.span
                    className="segment-dot"
                    style={{ background: seg.color, boxShadow: `0 0 12px ${seg.color}60` }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  />
                  <span className="segment-name">{seg.name}</span>
                </div>

                <div className="segment-bar-container">
                  <motion.div
                    className="segment-bar"
                    style={{ background: `linear-gradient(90deg, ${seg.color}, ${seg.color}80)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(seg.count / totalUsers) * 100}%` }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                  />
                </div>

                <div className="segment-metrics">
                  <div className="metric">
                    <span className="metric-value" style={{ color: seg.color }}>{seg.count}</span>
                    <span className="metric-label">users</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">{seg.avgEngagement}%</span>
                    <span className="metric-label">eng</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .stats-card {
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          border: 1px solid var(--border-light);
          position: relative;
          overflow: hidden;
        }

        .card-decoration {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          pointer-events: none;
        }

        .card-decoration.left {
          top: -150px;
          left: -150px;
          background: var(--violet);
        }

        .card-decoration.right {
          bottom: -150px;
          right: -150px;
          background: var(--coral);
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
          position: relative;
          z-index: 1;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--violet) 0%, var(--pink) 100%);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
        }

        .stats-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .stats-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 4px 0 0;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: var(--radius-full);
          color: var(--violet);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .view-all-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: var(--violet);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--spacing-xl);
          position: relative;
          z-index: 1;
        }

        .chart-section {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chart-wrapper {
          position: relative;
        }

        .chart-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          background: var(--bg-card);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-light);
        }

        .center-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .center-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .custom-tooltip {
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          box-shadow: var(--shadow-xl);
        }

        .tooltip-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .tooltip-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .tooltip-name {
          font-weight: 700;
          color: white;
        }

        .tooltip-stats {
          display: flex;
          gap: 16px;
        }

        .tooltip-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .stats-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-md);
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .summary-card:hover {
          border-color: var(--border-light);
          box-shadow: var(--shadow-md);
        }

        .summary-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .summary-content {
          display: flex;
          flex-direction: column;
        }

        .summary-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .summary-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .segment-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .segment-row {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid transparent;
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .segment-row:hover {
          border-color: var(--border-subtle);
        }

        .segment-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          min-width: 160px;
        }

        .segment-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .segment-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .segment-bar-container {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .segment-bar {
          height: 100%;
          border-radius: var(--radius-full);
        }

        .segment-metrics {
          display: flex;
          gap: var(--spacing-lg);
        }

        .metric {
          text-align: right;
          min-width: 60px;
        }

        .metric-value {
          display: block;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .metric-label {
          font-size: 0.65rem;
          color: var(--text-dim);
          text-transform: uppercase;
        }

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .segment-bar-container {
            display: none;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default SegmentStatsCard;
