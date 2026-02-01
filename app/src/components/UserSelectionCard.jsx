import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Users, Filter, Sparkles, Star, TrendingUp } from 'lucide-react';

const UserSelectionCard = ({ users, selectedUser, onSelectUser, segments }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSegment, setFilterSegment] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const uniqueSegments = [...new Set(users.map(u => u.segment))];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment = filterSegment === 'All' || user.segment === filterSegment;
    return matchesSearch && matchesSegment;
  }).slice(0, 50);

  const getSegmentIcon = (segment) => {
    if (segment.includes('Influencer')) return '⭐';
    if (segment.includes('Engaged')) return '🔥';
    if (segment.includes('Growing')) return '📈';
    if (segment.includes('Active')) return '💬';
    return '👤';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="selection-card"
    >
      {/* Decorative elements */}
      <div className="card-decoration" />

      {/* Header */}
      <div className="selection-header">
        <div className="selection-title">
          <motion.div
            className="title-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <Users size={18} />
          </motion.div>
          <span>Select User</span>
        </div>
        <motion.div
          className="user-count"
          whileHover={{ scale: 1.05 }}
        >
          <Sparkles size={12} />
          {users.length.toLocaleString()}
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        className="search-box"
        whileFocus={{ scale: 1.02 }}
      >
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <motion.span
            className="search-count"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {filteredUsers.length}
          </motion.span>
        )}
      </motion.div>

      {/* Filter */}
      <div className="filter-dropdown">
        <motion.button
          className="filter-trigger"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          whileHover={{ background: 'rgba(255, 255, 255, 0.06)' }}
        >
          <Filter size={14} />
          <span>{filterSegment}</span>
          <motion.div
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="dropdown-menu"
            >
              <button
                className={`dropdown-item ${filterSegment === 'All' ? 'active' : ''}`}
                onClick={() => { setFilterSegment('All'); setIsDropdownOpen(false); }}
              >
                <span className="item-emoji">🌐</span>
                All Segments
                <span className="item-count">{users.length}</span>
              </button>
              {uniqueSegments.map(seg => (
                <button
                  key={seg}
                  className={`dropdown-item ${filterSegment === seg ? 'active' : ''}`}
                  onClick={() => { setFilterSegment(seg); setIsDropdownOpen(false); }}
                >
                  <span className="item-emoji">{getSegmentIcon(seg)}</span>
                  {seg}
                  <span className="item-count">{users.filter(u => u.segment === seg).length}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User List */}
      <div className="user-list">
        <AnimatePresence mode="popLayout">
          {filteredUsers.map((user, index) => (
            <motion.button
              key={user.userId}
              className={`user-item ${selectedUser?.userId === user.userId ? 'selected' : ''}`}
              onClick={() => onSelectUser(user)}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.02 }}
              whileHover={{ x: 6, background: 'rgba(139, 92, 246, 0.08)' }}
            >
              <div className="user-avatar" style={{
                background: `linear-gradient(135deg, ${user.segmentColor} 0%, ${user.segmentColor}88 100%)`
              }}>
                {user.username.charAt(5)?.toUpperCase() || 'U'}
                {parseFloat(user.engagementRate) > 8 && (
                  <div className="avatar-badge">
                    <Star size={8} />
                  </div>
                )}
              </div>
              <div className="user-info">
                <div className="user-name-row">
                  <span className="user-name">{user.username}</span>
                  {parseFloat(user.engagementRate) > 6 && (
                    <TrendingUp size={12} className="trending-icon" />
                  )}
                </div>
                <div className="user-meta">
                  <span className="meta-followers">{user.followers.toLocaleString()}</span>
                  <span className="meta-dot">•</span>
                  <span className="meta-city">{user.city}</span>
                </div>
              </div>
              <div
                className="segment-indicator"
                style={{ background: user.segmentColor }}
              />
            </motion.button>
          ))}
        </AnimatePresence>

        {filteredUsers.length === 0 && (
          <motion.div
            className="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="no-results-emoji">🔍</span>
            <span>No users found</span>
          </motion.div>
        )}
      </div>

      <style>{`
        .selection-card {
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          max-height: 600px;
          position: relative;
          overflow: hidden;
        }

        .card-decoration {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .selection-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .selection-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .title-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--violet) 0%, var(--pink) 100%);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-count {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--violet);
          background: rgba(139, 92, 246, 0.1);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .search-box {
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
          width: 100%;
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

        .search-count {
          position: absolute;
          right: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--violet);
          background: rgba(139, 92, 246, 0.15);
          padding: 4px 8px;
          border-radius: var(--radius-full);
        }

        .filter-dropdown {
          position: relative;
          z-index: 10;
        }

        .filter-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-trigger span {
          flex: 1;
          text-align: left;
        }

        .filter-trigger:hover {
          border-color: var(--border-medium);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: var(--bg-card-elevated);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 6px;
          box-shadow: var(--shadow-xl);
          z-index: 100;
          max-height: 250px;
          overflow-y: auto;
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.875rem;
          text-align: left;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-item.active {
          background: rgba(139, 92, 246, 0.15);
          color: var(--violet);
        }

        .item-emoji {
          font-size: 1rem;
        }

        .item-count {
          margin-left: auto;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-dim);
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .user-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-right: 4px;
        }

        .user-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid transparent;
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
          position: relative;
        }

        .user-item:hover {
          border-color: rgba(255, 255, 255, 0.06);
        }

        .user-item.selected {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
          flex-shrink: 0;
          position: relative;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .avatar-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 2px solid var(--bg-card);
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .trending-icon {
          color: var(--emerald);
        }

        .user-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .meta-followers {
          font-weight: 600;
        }

        .meta-dot {
          color: var(--text-dim);
        }

        .segment-indicator {
          width: 4px;
          height: 24px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-xl);
          color: var(--text-muted);
        }

        .no-results-emoji {
          font-size: 2rem;
        }
      `}</style>
    </motion.div>
  );
};

export default UserSelectionCard;
