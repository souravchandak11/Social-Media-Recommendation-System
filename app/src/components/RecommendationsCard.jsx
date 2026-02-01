import { motion } from 'framer-motion';
import { ArrowUpRight, Send, Search, Sparkles, MessageCircle, Zap, Star } from 'lucide-react';

const RecommendationsCard = ({ recommendations, selectedUser }) => {
  const topRecs = recommendations?.slice(0, 10) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="ai-card"
    >
      {/* Animated background */}
      <div className="ai-bg-pattern" />

      {/* Header */}
      <div className="ai-header">
        <div className="ai-title-section">
          <motion.div
            className="ai-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Sparkles size={20} />
          </motion.div>
          <div>
            <h3 className="ai-title">AI Recommendations</h3>
            <span className="ai-subtitle">Powered by K-Means + CF</span>
          </div>
        </div>
        <motion.button
          className="expand-btn"
          whileHover={{ scale: 1.1, rotate: 45 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUpRight size={16} />
        </motion.button>
      </div>

      {/* AI Message */}
      <motion.div
        className="ai-message-container"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="ai-avatar">
          <div className="avatar-pulse" />
          <Zap size={18} />
        </div>
        <div className="ai-message">
          <div className="message-header">
            <span className="message-greeting">Hey {selectedUser?.username || 'there'}!</span>
            <span className="message-time">Just now</span>
          </div>
          <div className="message-content">
            Found <span className="highlight">{recommendations?.length || 0}</span> similar users.
            Top match: <span className="highlight">{topRecs[0]?.username || 'N/A'}</span> with{' '}
            <span className="highlight">{((topRecs[0]?.similarity || 0) * 100).toFixed(0)}%</span> compatibility!
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <motion.button
          className="action-chip"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <Search size={14} />
          Similar Users
        </motion.button>
        <motion.button
          className="action-chip primary"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <Star size={14} />
          Top Matches
        </motion.button>
        <motion.button
          className="action-chip"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <MessageCircle size={14} />
          Insights
        </motion.button>
      </div>

      {/* Recommendations List */}
      <div className="recs-list">
        {topRecs.map((rec, index) => (
          <motion.div
            key={rec.userId}
            className="rec-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            whileHover={{ x: 8, background: 'rgba(139, 92, 246, 0.1)' }}
          >
            <div className="rec-rank" style={{
              background: index === 0 ? 'linear-gradient(135deg, #f59e0b, #f97316)' :
                index === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' :
                  index === 2 ? 'linear-gradient(135deg, #d97706, #b45309)' :
                    'var(--bg-hover)'
            }}>
              {index + 1}
            </div>

            <div className="rec-avatar">
              {rec.username.charAt(5)?.toUpperCase() || 'U'}
            </div>

            <div className="rec-info">
              <div className="rec-name">{rec.username}</div>
              <div className="rec-reason">{rec.reason}</div>
            </div>

            <div className="rec-match">
              <motion.div
                className="match-ring"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 100 - (rec.similarity * 100) }}
                transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
              >
                <svg viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(139, 92, 246, 0.2)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeDasharray={`${rec.similarity * 100}, 100`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="match-value">{((rec.similarity || 0) * 100).toFixed(0)}%</span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="ai-input-container">
        <motion.button
          className="add-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Sparkles size={16} />
        </motion.button>
        <input
          type="text"
          placeholder="Ask AI for recommendations..."
          className="ai-input"
        />
        <motion.button
          className="send-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Send size={16} />
        </motion.button>
      </div>

      <style>{`
        .ai-card {
          background: linear-gradient(145deg, rgba(139, 92, 246, 0.08) 0%, var(--bg-glass) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          position: relative;
          overflow: hidden;
        }

        .ai-bg-pattern {
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .ai-title-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .ai-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
        }

        .ai-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .ai-subtitle {
          font-size: 0.7rem;
          color: var(--text-dim);
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
          transition: all var(--transition-fast);
        }

        .expand-btn:hover {
          background: rgba(139, 92, 246, 0.2);
        }

        .ai-message-container {
          display: flex;
          gap: var(--spacing-md);
          position: relative;
          z-index: 1;
        }

        .ai-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          position: relative;
        }

        .avatar-pulse {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          opacity: 0.3;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0; }
        }

        .ai-message {
          flex: 1;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .message-greeting {
          font-weight: 700;
          color: var(--text-primary);
        }

        .message-time {
          font-size: 0.7rem;
          color: var(--text-dim);
        }

        .message-content {
          font-size: 0.875rem;
          line-height: 1.5;
          color: var(--text-muted);
        }

        .highlight {
          color: var(--violet);
          font-weight: 700;
        }

        .quick-actions {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        .action-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-chip:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .action-chip.primary {
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
          border: none;
          color: white;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
        }

        .recs-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 280px;
          overflow-y: auto;
          position: relative;
          z-index: 1;
        }

        .rec-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .rec-rank {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
        }

        .rec-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--violet) 0%, var(--pink) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .rec-info {
          flex: 1;
          min-width: 0;
        }

        .rec-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .rec-reason {
          font-size: 0.7rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rec-match {
          flex-shrink: 0;
        }

        .match-ring {
          position: relative;
          width: 42px;
          height: 42px;
        }

        .match-ring svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .match-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--violet);
        }

        .ai-input-container {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-full);
          position: relative;
          z-index: 1;
        }

        .add-btn {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        .ai-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.875rem;
          outline: none;
          padding: 0 var(--spacing-sm);
        }

        .ai-input::placeholder {
          color: var(--text-dim);
        }

        .send-btn {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .send-btn:hover {
          background: var(--violet);
          color: white;
          border-color: var(--violet);
        }
      `}</style>
    </motion.div>
  );
};

export default RecommendationsCard;
