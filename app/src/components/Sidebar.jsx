import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  TrendingUp,
  Target,
  Bell,
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: Users, label: 'Users' },
  { icon: Target, label: 'Segments' },
  { icon: TrendingUp, label: 'Analytics' },
  { icon: BarChart3, label: 'Reports' },
  { icon: Bell, label: 'Alerts' },
];

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Overview');
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="sidebar"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div className="sidebar-glow" />

      {/* Logo */}
      <div className="sidebar-logo">
        <motion.div
          className="logo-icon"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles size={22} />
        </motion.div>
        <motion.span
          className="logo-text"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
        >
          SocialAI
        </motion.span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;

          return (
            <motion.button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.95 }}
              title={item.label}
            >
              <div className="item-icon">
                <Icon size={20} />
              </div>
              <motion.span
                className="item-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  width: isHovered ? 'auto' : 0
                }}
              >
                {item.label}
              </motion.span>
              {isActive && (
                <motion.div
                  className="active-indicator"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-footer">
        <motion.button
          className="sidebar-item"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.95 }}
          title="Settings"
        >
          <div className="item-icon">
            <Settings size={20} />
          </div>
          <motion.span
            className="item-label"
            initial={{ opacity: 0, width: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              width: isHovered ? 'auto' : 0
            }}
          >
            Settings
          </motion.span>
        </motion.button>

        <motion.button
          className="sidebar-item help"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.95 }}
          title="Help"
        >
          <div className="item-icon">
            <HelpCircle size={20} />
          </div>
          <motion.span
            className="item-label"
            initial={{ opacity: 0, width: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              width: isHovered ? 'auto' : 0
            }}
          >
            Help
          </motion.span>
        </motion.button>

        {/* User Avatar */}
        <motion.div
          className="user-avatar"
          whileHover={{ scale: 1.05 }}
        >
          <div className="avatar-ring">
            <div className="avatar-inner">
              <Layers size={18} />
            </div>
          </div>
          <motion.div
            className="avatar-status"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.div>
      </div>

      <style>{`
        .sidebar {
          width: 72px;
          min-height: 100vh;
          background: rgba(17, 17, 19, 0.8);
          backdrop-filter: blur(20px);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--spacing-lg) var(--spacing-sm);
          position: sticky;
          top: 0;
          transition: width var(--transition-normal);
          overflow: hidden;
          z-index: 100;
        }

        .sidebar:hover {
          width: 200px;
        }

        .sidebar-glow {
          position: absolute;
          top: 60px;
          left: 0;
          width: 4px;
          height: 60px;
          background: linear-gradient(180deg, #f87171, #fb923c);
          border-radius: 0 4px 4px 0;
          filter: blur(8px);
          opacity: 0.6;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-2xl);
          width: 100%;
          padding: 0 var(--spacing-sm);
        }

        .logo-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #f87171 0%, #fb923c 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 8px 30px rgba(248, 113, 113, 0.4);
        }

        .logo-text {
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--text-primary);
          white-space: nowrap;
          letter-spacing: -0.02em;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          width: 100%;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: 12px;
          border-radius: var(--radius-md);
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .sidebar-item.active {
          background: rgba(248, 113, 113, 0.1);
          color: var(--coral);
        }

        .item-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .item-label {
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: linear-gradient(180deg, #f87171, #fb923c);
          border-radius: 0 3px 3px 0;
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          width: 100%;
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--border-subtle);
          margin-top: auto;
        }

        .sidebar-item.help {
          color: var(--violet);
        }

        .user-avatar {
          display: flex;
          justify-content: center;
          margin-top: var(--spacing-md);
          position: relative;
        }

        .avatar-ring {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          padding: 2px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
        }

        .avatar-inner {
          width: 100%;
          height: 100%;
          background: var(--bg-secondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .avatar-status {
          position: absolute;
          bottom: 2px;
          right: calc(50% - 26px);
          width: 10px;
          height: 10px;
          background: #10b981;
          border: 2px solid var(--bg-secondary);
          border-radius: 50%;
        }
      `}</style>
    </motion.aside>
  );
};

export default Sidebar;
