import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinkClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-brand">
          Solar Projects
        </div>
        <div className="nav-links">
          <Link to="/" className={getNavLinkClass('/')}>Dashboard</Link>
          <Link to="/projects" className={getNavLinkClass('/projects')}>Projects</Link>
          <Link to="/reports" className={getNavLinkClass('/reports')}>Reports</Link>
          {user?.role === 'team_leader' && (
            <Link to="/users" className={getNavLinkClass('/users')}>Users</Link>
          )}
          <span>Welcome, {user?.name} ({user?.role})</span>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </nav>
    </header>
  );
};

export default Header;