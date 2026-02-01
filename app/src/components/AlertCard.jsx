import { motion } from 'framer-motion';
import { AlertCircle, ArrowUpRight, Bell, TrendingUp, Zap } from 'lucide-react';

const AlertCard = ({ selectedUser }) => {
  const getAlertData = () => {
    if (!selectedUser) return { title: 'Loading...', message: '', type: 'info' };

    const engagement = parseFloat(selectedUser.engagementRate);

    if (engagement > 8) {
      return {
        title: 'HIGH PERFORMER',
        message: `${selectedUser.username} has exceptional engagement at ${engagement}%. Consider featuring their content.`,
        type: 'success',
        icon: Zap,
        color: '#10b981',
        bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)'
      };
    } else if (engagement > 5) {
      return {
        title: 'GROWING INFLUENCE',
        message: `${selectedUser.username} shows strong growth patterns. Engagement trending upward.`,
        type: 'info',
        icon: TrendingUp,
        color: '#3b82f6',
        bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)'
      };
    } else {
      return {
        title: 'OPTIMIZATION NEEDED',
        message: `Boost ${selectedUser.username}'s visibility with strategic content at ${engagement}% engagement.`,
        type: 'warning',
        icon: Bell,
        color: '#f59e0b',
        bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)'
      };
    }
  };

  const alert = getAlertData();
  const Icon = alert.icon || AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="alert-card"
      style={{ background: alert.bgGradient }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Glow effect */}
      <div
        className="alert-glow"
        style={{ background: `radial-gradient(circle, ${alert.color}30 0%, transparent 70%)` }}
      />

      <motion.div
        className="alert-icon"
        style={{
          background: `linear-gradient(135deg, ${alert.color}, ${alert.color}cc)`,
          boxShadow: `0 8px 30px ${alert.color}40`
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon size={22} />
      </motion.div>

      <div className="alert-content">
        <h4 className="alert-title" style={{ color: alert.color }}>{alert.title}</h4>
        <p className="alert-message">{alert.message}</p>
        <div className="alert-timer">
          <span className="timer-dot" style={{ background: alert.color }} />
          Next update in <span className="timer-value" style={{ color: alert.color }}>2:59:12</span>
        </div>
      </div>

      <motion.button
        className="alert-action"
        whileHover={{ scale: 1.1, rotate: 45 }}
        whileTap={{ scale: 0.9 }}
        style={{ borderColor: `${alert.color}30` }}
      >
        <ArrowUpRight size={16} />
      </motion.button>

      <style>{`
        .alert-card {
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          position: relative;
          overflow: hidden;
          transition: all var(--transition-normal);
        }

        .alert-glow {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          pointer-events: none;
        }

        .alert-icon {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        .alert-content {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .alert-title {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .alert-message {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .alert-timer {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.7rem;
          color: var(--text-dim);
        }

        .timer-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .timer-value {
          font-weight: 700;
        }

        .alert-action {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
          flex-shrink: 0;
          transition: all var(--transition-fast);
          position: relative;
          z-index: 1;
        }

        .alert-action:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
      `}</style>
    </motion.div>
  );
};

export default AlertCard;
