import { motion } from 'framer-motion';
import { MapPin, ArrowUpRight, Globe, Zap } from 'lucide-react';

const UserMapCard = ({ cityDistribution, users }) => {
  const cities = Object.entries(cityDistribution || {}).slice(0, 6);
  const totalUsers = users?.length || 0;
  const maxCount = Math.max(...cities.map(([_, count]) => count), 1);

  // City coordinates for visual representation
  const cityPositions = {
    'New York': { x: 25, y: 35 },
    'Los Angeles': { x: 12, y: 38 },
    'Chicago': { x: 22, y: 32 },
    'Mumbai': { x: 65, y: 42 },
    'London': { x: 48, y: 28 },
    'Tokyo': { x: 85, y: 36 },
    'Sydney': { x: 88, y: 75 },
    'Dubai': { x: 58, y: 40 },
    'Singapore': { x: 78, y: 52 },
    'Toronto': { x: 24, y: 30 },
    'Berlin': { x: 52, y: 28 },
    'Paris': { x: 48, y: 30 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="map-card"
    >
      {/* Background pattern */}
      <div className="map-bg-pattern" />

      {/* Header */}
      <div className="map-header">
        <div className="header-content">
          <motion.div
            className="header-icon"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Globe size={18} />
          </motion.div>
          <div>
            <h3>USER DISTRIBUTION</h3>
            <span className="header-subtitle">{cities.length} active regions</span>
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

      {/* Map Visualization */}
      <div className="map-container">
        <div className="world-map">
          {/* Grid lines for visual effect */}
          <div className="grid-lines" />

          {/* City markers */}
          {cities.map(([city, count], index) => {
            const pos = cityPositions[city] || { x: 50, y: 50 };
            const size = Math.max((count / maxCount) * 16 + 8, 10);

            return (
              <motion.div
                key={city}
                className="city-marker"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.3 }}
              >
                <motion.div
                  className="marker-pulse"
                  style={{ width: size * 3, height: size * 3 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                />
                <motion.div
                  className="marker-dot"
                  style={{ width: size, height: size }}
                />
                <div className="marker-tooltip">
                  <span className="tooltip-city">{city}</span>
                  <span className="tooltip-count">{count} users</span>
                </div>
              </motion.div>
            );
          })}

          {/* Connection lines */}
          <svg className="connection-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5eead4" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#5eead4" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#5eead4" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {cities.slice(0, 3).map(([city], index) => {
              const pos1 = cityPositions[city] || { x: 50, y: 50 };
              const pos2 = cityPositions[cities[(index + 1) % cities.length]?.[0]] || { x: 50, y: 50 };
              return (
                <motion.path
                  key={`line-${index}`}
                  d={`M ${pos1.x} ${pos1.y} Q ${(pos1.x + pos2.x) / 2} ${Math.min(pos1.y, pos2.y) - 10} ${pos2.x} ${pos2.y}`}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 1 + index * 0.2, duration: 1 }}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* City List */}
      <div className="city-list">
        {cities.slice(0, 4).map(([city, count], index) => (
          <motion.div
            key={city}
            className="city-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.05 }}
            whileHover={{ x: 4 }}
          >
            <div className="city-info">
              <MapPin size={12} className="city-icon" />
              <span className="city-name">{city}</span>
            </div>
            <div className="city-stats">
              <div className="city-bar">
                <motion.div
                  className="city-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCount) * 100}%` }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                />
              </div>
              <span className="city-count">{count}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Stats */}
      <motion.div
        className="map-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="footer-stat">
          <Zap size={14} />
          <span><strong>{((cities.reduce((a, [_, c]) => a + c, 0) / totalUsers) * 100).toFixed(0)}%</strong> coverage</span>
        </div>
        <div className="growth-indicator positive">
          +12.5% growth
        </div>
      </motion.div>

      <style>{`
        .map-card {
          background: linear-gradient(145deg, rgba(94, 234, 212, 0.08) 0%, var(--bg-glass) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(94, 234, 212, 0.15);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          position: relative;
          overflow: hidden;
        }

        .map-bg-pattern {
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(94, 234, 212, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
          z-index: 1;
        }

        .header-content {
          display: flex;
          gap: var(--spacing-md);
        }

        .header-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0f172a;
          box-shadow: 0 8px 30px rgba(94, 234, 212, 0.4);
        }

        .map-header h3 {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: 0.5px;
          margin: 0;
        }

        .header-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .expand-btn {
          width: 32px;
          height: 32px;
          background: rgba(94, 234, 212, 0.1);
          border: 1px solid rgba(94, 234, 212, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--teal);
          cursor: pointer;
        }

        .map-container {
          position: relative;
          height: 160px;
          border-radius: var(--radius-lg);
          background: rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .world-map {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, 
            rgba(94, 234, 212, 0.03) 0%, 
            rgba(94, 234, 212, 0.01) 100%
          );
        }

        .grid-lines {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(94, 234, 212, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(94, 234, 212, 0.05) 1px, transparent 1px);
          background-size: 25px 25px;
        }

        .connection-lines {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .city-marker {
          position: absolute;
          transform: translate(-50%, -50%);
          z-index: 10;
          cursor: pointer;
        }

        .marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(94, 234, 212, 0.3);
          border-radius: 50%;
        }

        .marker-dot {
          position: relative;
          background: linear-gradient(135deg, #5eead4, #2dd4bf);
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 15px rgba(94, 234, 212, 0.6);
        }

        .marker-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(94, 234, 212, 0.3);
          border-radius: var(--radius-sm);
          padding: 6px 10px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--transition-fast);
        }

        .city-marker:hover .marker-tooltip {
          opacity: 1;
        }

        .tooltip-city {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
        }

        .tooltip-count {
          font-size: 0.65rem;
          color: var(--teal);
        }

        .city-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
          z-index: 1;
        }

        .city-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .city-item:hover {
          background: rgba(94, 234, 212, 0.05);
        }

        .city-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .city-icon {
          color: var(--teal);
        }

        .city-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .city-stats {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .city-bar {
          width: 60px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .city-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #5eead4, #2dd4bf);
          border-radius: var(--radius-full);
        }

        .city-count {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--teal);
          min-width: 30px;
          text-align: right;
        }

        .map-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--spacing-sm);
          border-top: 1px solid var(--border-subtle);
          position: relative;
          z-index: 1;
        }

        .footer-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .footer-stat svg {
          color: var(--teal);
        }

        .footer-stat strong {
          color: var(--teal);
        }

        .growth-indicator {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-full);
        }

        .growth-indicator.positive {
          color: var(--emerald);
          background: rgba(16, 185, 129, 0.15);
        }
      `}</style>
    </motion.div>
  );
};

export default UserMapCard;
