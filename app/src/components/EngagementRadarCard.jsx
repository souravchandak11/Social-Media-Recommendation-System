import { motion } from 'framer-motion';
import { Clock, ArrowUpRight, Activity, Sparkles } from 'lucide-react';

const EngagementRadarCard = ({ engagementByHour }) => {
  const data = engagementByHour || Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    value: Math.random() * 80 + 20
  }));

  const maxValue = Math.max(...data.map(d => d.value));
  const peakHour = data.find(d => d.value === maxValue)?.hour || 0;

  // Create radar points
  const centerX = 100;
  const centerY = 100;
  const maxRadius = 70;

  const getPoint = (hour, value) => {
    const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
    const radius = (value / maxValue) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const pathData = data.map((d, i) => {
    const point = getPoint(d.hour, d.value);
    return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }).join(' ') + ' Z';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="radar-card"
    >
      {/* Background */}
      <div className="radar-bg-pattern" />

      {/* Header */}
      <div className="radar-header">
        <div className="header-content">
          <motion.div
            className="header-icon"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Clock size={18} />
          </motion.div>
          <div>
            <h3>ENGAGEMENT TIMING</h3>
            <span className="header-subtitle">24-hour activity pattern</span>
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

      {/* Radar Chart */}
      <div className="radar-container">
        <svg viewBox="0 0 200 200" className="radar-svg">
          <defs>
            <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0.05" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background circles */}
          {[0.25, 0.5, 0.75, 1].map((scale, i) => (
            <motion.circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={maxRadius * scale}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
              strokeDasharray="4,4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            />
          ))}

          {/* Hour labels */}
          {[0, 6, 12, 18].map(hour => {
            const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
            const labelRadius = maxRadius + 18;
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            const label = hour === 0 ? '12AM' : hour === 6 ? '6AM' : hour === 12 ? '12PM' : '6PM';

            return (
              <motion.text
                key={hour}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255, 255, 255, 0.5)"
                fontSize="8"
                fontWeight="600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {label}
              </motion.text>
            );
          })}

          {/* Data path */}
          <motion.path
            d={pathData}
            fill="url(#radarGradient)"
            stroke="#f87171"
            strokeWidth="2"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.5, ease: 'easeInOut' }}
          />

          {/* Data points */}
          {data.filter((_, i) => i % 3 === 0).map((d, index) => {
            const point = getPoint(d.hour, d.value);
            return (
              <motion.circle
                key={d.hour}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#f87171"
                stroke="white"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 + index * 0.05, type: 'spring' }}
                style={{ filter: 'drop-shadow(0 0 6px rgba(248, 113, 113, 0.6))' }}
              />
            );
          })}

          {/* Peak indicator */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: 'spring' }}
          >
            {(() => {
              const peakPoint = getPoint(peakHour, maxValue);
              return (
                <>
                  <circle
                    cx={peakPoint.x}
                    cy={peakPoint.y}
                    r="8"
                    fill="#fb923c"
                    stroke="white"
                    strokeWidth="2"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(251, 146, 60, 0.8))' }}
                  />
                  <motion.circle
                    cx={peakPoint.x}
                    cy={peakPoint.y}
                    r="14"
                    fill="none"
                    stroke="#fb923c"
                    strokeWidth="2"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </>
              );
            })()}
          </motion.g>
        </svg>
      </div>

      {/* Stats */}
      <div className="radar-stats">
        <motion.div
          className="stat-item"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Activity size={16} className="stat-icon coral" />
          <div className="stat-content">
            <span className="stat-value">{peakHour > 12 ? peakHour - 12 : peakHour}:00 {peakHour >= 12 ? 'PM' : 'AM'}</span>
            <span className="stat-label">Peak Hour</span>
          </div>
        </motion.div>

        <motion.div
          className="stat-item"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <Sparkles size={16} className="stat-icon violet" />
          <div className="stat-content">
            <span className="stat-value">{maxValue.toFixed(0)}%</span>
            <span className="stat-label">Max Activity</span>
          </div>
        </motion.div>
      </div>

      <style>{`
        .radar-card {
          background: linear-gradient(145deg, rgba(248, 113, 113, 0.08) 0%, var(--bg-glass) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(248, 113, 113, 0.15);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          position: relative;
          overflow: hidden;
        }

        .radar-bg-pattern {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(248, 113, 113, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .radar-header {
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
          background: linear-gradient(135deg, #f87171 0%, #fb923c 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 30px rgba(248, 113, 113, 0.4);
        }

        .radar-header h3 {
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
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--coral);
          cursor: pointer;
        }

        .radar-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: var(--spacing-md) 0;
          position: relative;
          z-index: 1;
        }

        .radar-svg {
          width: 220px;
          height: 220px;
        }

        .radar-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
          position: relative;
          z-index: 1;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
        }

        .stat-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .stat-icon {
          flex-shrink: 0;
        }

        .stat-icon.coral {
          color: var(--coral);
        }

        .stat-icon.violet {
          color: var(--violet);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
    </motion.div>
  );
};

export default EngagementRadarCard;
