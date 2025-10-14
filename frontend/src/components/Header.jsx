import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // Add useNavigate hook

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const handleLogout = () => {
    logout();
    setIsSidePanelOpen(false);
  };

  // Fix for navigation - use navigate function instead of Link
  const handleNavigation = (path) => {
    navigate(path);
    setIsSidePanelOpen(false);
  };

  const isActiveLink = (path) => {
  // Special case for dashboard since it can be both '/' and '/dashboard'
  if (path === '/dashboard') {
    return location.pathname === '/' || location.pathname === '/dashboard' ? 'active' : '';
  }
  return location.pathname === path ? 'active' : '';
};

  return (
    <>
      {/* Main Header */}
      <header className="header">
        <div className="header-content">
          {/* Menu Icon for Mobile */}
          <button 
            className="menu-icon"
            onClick={toggleSidePanel}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Logo/Brand */}
          <div className="brand">
            <Link to="/dashboard">Solar Project Management</Link>
          </div>

          {/* Desktop Navigation - Hide on mobile */}
          <nav className="desktop-nav">
            <Link to="/dashboard" className={isActiveLink('/dashboard')}>
              Dashboard
            </Link>
            <Link to="/projects" className={isActiveLink('/projects')}>
              Projects
            </Link>
            {user?.role === 'team_leader' && (
              <Link to="/users" className={isActiveLink('/users')}>
                Users
              </Link>
            )}
            <Link to="/reports" className={isActiveLink('/reports')}>
              Reports
            </Link>
          </nav>

          {/* User Info */}
          <div className="user-info">
            <span>Welcome, {user?.name}</span>
            <span className="user-role">({user?.role})</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Side Panel Overlay */}
      {isSidePanelOpen && (
        <div 
          className="side-panel-overlay"
          onClick={toggleSidePanel}
        ></div>
      )}

      {/* Side Panel */}
      <div className={`side-panel ${isSidePanelOpen ? 'open' : ''}`}>
        {/* Panel Header */}
        <div className="side-panel-header">
          <h3>Navigation</h3>
          <button 
            className="close-btn"
            onClick={toggleSidePanel}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {/* Navigation Links - FIXED: Using buttons with navigate function */}
        <nav className="side-panel-nav">
          <button 
            onClick={() => handleNavigation('/dashboard')}
            className={`side-panel-link ${isActiveLink('/dashboard')}`}
          >
            📊 Dashboard
          </button>
          
          <button 
            onClick={() => handleNavigation('/projects')}
            className={`side-panel-link ${isActiveLink('/projects')}`}
          >
            📋 Projects
          </button>
          
          {user?.role === 'team_leader' && (
            <button 
              onClick={() => handleNavigation('/users')}
              className={`side-panel-link ${isActiveLink('/users')}`}
            >
              👥 Users
            </button>
          )}
          
          <button 
            onClick={() => handleNavigation('/reports')}
            className={`side-panel-link ${isActiveLink('/reports')}`}
          >
            📈 Reports
          </button>

          {/* User Info in Side Panel */}
          <div className="side-panel-user-info">
            <div className="user-details">
              <strong>{user?.name}</strong>
              <span className="user-role">({user?.role})</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn-logout-side"
            >
              🚪 Logout
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;