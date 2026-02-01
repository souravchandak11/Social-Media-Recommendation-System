import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, ChevronRight, Bell, Calendar, Sparkles } from 'lucide-react';

const Header = ({ totalUsers, onRefresh, selectedUser, usingAPI }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="header"
    >
      {/* Left Section */}
      <div className="header-left">
        <div className="breadcrumb">
          <motion.span
            className="breadcrumb-item"
            whileHover={{ color: '#fff' }}
          >
            Dashboard
          </motion.span>
          <ChevronRight size={14} className="breadcrumb-divider" />
          <span className="breadcrumb-item active">Overview</span>
        </div>

        <div className="page-title">
          <h1>
            <span className="title-gradient">Social Media</span> Recommender
          </h1>
          <div className="title-badge">
            <Sparkles size={12} />
            AI-Powered
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="header-right">
        {/* API Status Badge */}
        <motion.div
          className={`api-badge ${usingAPI ? 'api-connected' : 'api-local'}`}
          whileHover={{ scale: 1.05 }}
        >
          <div className="api-dot" />
          <span>{usingAPI ? 'Python API' : 'Local Mode'}</span>
        </motion.div>

        {/* Search */}
        <motion.div
          className="search-container"
          whileFocus={{ scale: 1.02 }}
        >
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search users, segments..."
            className="search-input"
          />
          <div className="search-shortcut">
            <span>⌘</span>K
          </div>
        </motion.div>

        {/* Stats Badge */}
        <motion.div
          className="stats-badge"
          whileHover={{ scale: 1.05 }}
        >
          <div className="badge-dot" />
          <span>{totalUsers?.toLocaleString() || '0'} users</span>
        </motion.div>

        {/* Date */}
        <motion.button
          className="date-btn"
          whileHover={{ background: 'rgba(255, 255, 255, 0.08)' }}
        >
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </motion.button>

        {/* Notifications */}
        <motion.button
          className="icon-btn notification"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bell size={18} />
          <span className="notification-dot" />
        </motion.button>

        {/* Refresh */}
        <motion.button
          className="refresh-btn"
          onClick={handleRefresh}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isRefreshing}
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
          >
            <RefreshCw size={16} />
          </motion.div>
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </motion.button>

        {/* User Avatar */}
        <motion.div
          className="user-section"
          whileHover={{ scale: 1.02 }}
        >
          <div className="avatar">
            <span>{selectedUser?.username?.charAt(5)?.toUpperCase() || 'U'}</span>
          </div>
          <div className="user-info">
            <span className="user-name">{selectedUser?.username || 'Guest'}</span>
            <span className="user-role">{selectedUser?.segment || 'User'}</span>
          </div>
        </motion.div>
      </div>

      <style>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
          padding-bottom: var(--spacing-lg);
          border-bottom: 1px solid var(--border-subtle);
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .breadcrumb-item {
          font-size: 0.8rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .breadcrumb-item.active {
          color: var(--text-primary);
          font-weight: 600;
        }

        .breadcrumb-divider {
          color: var(--text-dim);
        }

        .page-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .page-title h1 {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          margin: 0;
        }

        .title-gradient {
          background: linear-gradient(135deg, #f87171, #fb923c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2));
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--violet-light);
          letter-spacing: 0.5px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .search-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          color: var(--text-dim);
          pointer-events: none;
        }

        .search-input {
          width: 260px;
          padding: 12px 16px 12px 42px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          color: var(--text-primary);
          font-size: 0.875rem;
          outline: none;
          transition: all var(--transition-fast);
        }

        .search-input::placeholder {
          color: var(--text-dim);
        }

        .search-input:focus {
          border-color: var(--violet);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
          background: rgba(139, 92, 246, 0.03);
        }

        .search-shortcut {
          position: absolute;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          font-size: 0.7rem;
          color: var(--text-dim);
          font-weight: 600;
        }

        .search-shortcut span {
          font-size: 0.8rem;
        }

        .api-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }

        .api-badge.api-connected {
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          color: #c4b5fd;
        }

        .api-badge.api-local {
          background: rgba(251, 146, 60, 0.15);
          border: 1px solid rgba(251, 146, 60, 0.3);
          color: #fdba74;
        }

        .api-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .api-connected .api-dot {
          background: #8b5cf6;
        }

        .api-local .api-dot {
          background: #fb923c;
        }

        .stats-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--emerald);
          cursor: pointer;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: var(--emerald);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .date-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .icon-btn {
          width: 42px;
          height: 42px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--coral);
          border-radius: 50%;
          border: 2px solid var(--bg-primary);
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: linear-gradient(135deg, var(--coral) 0%, #fb923c 100%);
          border: none;
          border-radius: var(--radius-lg);
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(248, 113, 113, 0.3);
          transition: all var(--transition-fast);
        }

        .refresh-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .refresh-btn:hover:not(:disabled) {
          box-shadow: 0 8px 30px rgba(248, 113, 113, 0.4);
          transform: translateY(-2px);
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: 8px 12px 8px 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .user-section:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: var(--border-medium);
        }

        .avatar {
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
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .user-role {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        @media (max-width: 1200px) {
          .search-input {
            width: 180px;
          }
          
          .search-shortcut,
          .date-btn,
          .stats-badge {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-md);
          }

          .header-right {
            width: 100%;
            flex-wrap: wrap;
          }

          .search-container {
            flex: 1;
          }

          .search-input {
            width: 100%;
          }
        }
      `}</style>
    </motion.header>
  );
};

export default Header;
