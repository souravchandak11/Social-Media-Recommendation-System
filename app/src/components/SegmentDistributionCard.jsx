import { motion } from 'framer-motion';
import { Layers, ArrowUpRight, Users, Sparkles } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const CircularProgress = ({ value, max, color, label, delay }) => {
  const safeMax = max > 0 ? max : 1;
  const safeValue = value || 0;
  const percentage = Math.min((safeValue / safeMax) * 100, 100);
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      className="progress-item"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="ring-container">
        <svg width="70" height="70" viewBox="0 0 70 70">
          <circle
            cx="35"
            cy="35"
            r="28"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="6"
          />
          <motion.circle
            cx="35"
            cy="35"
            r="28"
            fill="none"
            stroke={`url(#gradient-${label})`}
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              filter: `drop-shadow(0 0 8px ${color}60)`
            }}
          />
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={`${color}99`} />
            </linearGradient>
          </defs>
        </svg>
        <div className="ring-value" style={{ color }}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5 }}
          >
            {percentage.toFixed(0)}%
          </motion.span>
        </div>
      </div>
      <span className="progress-label">{label}</span>
    </motion.div>
  );
};

const SegmentDistributionCard = ({ segmentStats, users }) => {
  const segments = Object.values(segmentStats || {});
  const totalUsers = users?.length || 0;

  // Generate trend data
  const trendData = [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 72 },
    { name: 'Mar', value: 68 },
    { name: 'Apr', value: 85 },
    { name: 'May', value: 78 },
    { name: 'Jun', value: 92 },
  ];

  // Top 4 segments for display
  const topSegments = segments.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="segment-card"
    >
      {/* Background decoration */}
      <div className="card-bg-pattern" />

      {/* Header */}
      <div className="segment-header">
        <div className="header-left">
          <motion.div
            className="header-icon"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Layers size={18} />
          </motion.div>
          <div className="header-text">
            <h3>SEGMENT CAPACITY</h3>
            <span className="header-subtitle">
              <Users size={12} />
              {totalUsers.toLocaleString()} total
            </span>
          </div>
        </div>
        <motion.button
          className="expand-btn"
          whileHover={{ scale: 1.1, rotate: 45 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUpRight size={14} />
        </motion.button>
      </div>

      {/* Progress Circles */}
      <div className="progress-grid">
        {topSegments.length > 0 ? topSegments.map((seg, index) => (
          <CircularProgress
            key={seg.name || index}
            value={seg.count || 0}
            max={Math.max(totalUsers / 3, 1)}
            color={seg.color || '#6b7280'}
            label={(seg.name || 'Segment').split(' ')[0]}
            delay={0.3 + index * 0.1}
          />
        )) : (
          <div className="empty-state">No segments available</div>
        )}
      </div>

      {/* Mini Chart */}
      <div className="trend-section">
        <div className="trend-header">
          <div className="trend-title">
            <Sparkles size={14} />
            Growth Trend
          </div>
          <span className="trend-value positive">+18.5%</span>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={trendData}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#lineStroke)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
              />
              <defs>
                <linearGradient id="lineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
                }}
                labelStyle={{ color: '#fff', fontWeight: 700 }}
                itemStyle={{ color: '#a1a1aa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        .segment-card {
          background: linear-gradient(145deg, rgba(139, 92, 246, 0.1) 0%, var(--bg-glass) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          position: relative;
          overflow: hidden;
        }

        .card-bg-pattern {
          position: absolute;
          top: 0;
          right: 0;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .segment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-lg);
          position: relative;
          z-index: 1;
        }

        .header-left {
          display: flex;
          gap: var(--spacing-md);
        }

        .header-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
        }

        .header-text h3 {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: 0.5px;
          margin: 0;
        }

        .header-subtitle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .expand-btn {
          width: 32px;
          height: 32px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--violet);
          cursor: pointer;
        }

        .progress-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          position: relative;
          z-index: 1;
        }

        .progress-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: var(--spacing-sm);
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .progress-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .ring-container {
          position: relative;
        }

        .ring-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.875rem;
          font-weight: 800;
        }

        .progress-label {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-muted);
          text-align: center;
        }

        .trend-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
          position: relative;
          z-index: 1;
        }

        .trend-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .trend-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .trend-title svg {
          color: var(--violet);
        }

        .trend-value {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-full);
        }

        .trend-value.positive {
          color: var(--emerald);
          background: rgba(16, 185, 129, 0.15);
        }

        .chart-container {
          margin: 0 -8px;
        }

        @media (max-width: 500px) {
          .progress-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default SegmentDistributionCard;
