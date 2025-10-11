import React, { useState, useEffect } from 'react';
import Header from './Header';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        axios.get('/api/projects/stats/overview'),
        axios.get('/api/projects?limit=5')
      ]);
      
      setStats(statsRes.data);
      setRecentProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending_to_apply_clearance_application': 'Pending',
      'clearance_applied': 'In Progress',
      'clearance_approved': 'Completed',
      'clearance_rejected': 'Rejected',
      'capacity_reduced': 'In Progress',
      'clearance_received': 'Pending',
      'site_visit_completed': 'In Progress',
      '60_percent_payment_received': 'In Progress',
      'ongoing_installation': 'In Progress',
      'installation_completed': 'Completed',
      'document_submission': 'Pending',
      'estimate_paid': 'In Progress',
      'connection_complete': 'Completed',
      'procedure': 'In Progress'
    };

    const badgeClass = {
      'Pending': 'badge-pending',
      'In Progress': 'badge-in-progress',
      'Completed': 'badge-completed',
      'Rejected': 'badge-rejected'
    }[statusMap[status]] || 'badge-pending';

    return <span className={`badge ${badgeClass}`}>{statusMap[status]}</span>;
  };

  return (
    <div>
      <Header />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Dashboard</h1>
          {user?.role === 'team_leader' && (
            <Link to="/projects/new" className="btn btn-primary">Create New Project</Link>
          )}
        </div>

        {stats && (
          <div className="grid grid-3">
            <div className="card">
              <h3>Total Projects</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2c5aa0' }}>
                {stats.totalProjects}
              </p>
            </div>
            
            <div className="card">
              <h3>System Types</h3>
              {stats.projectsBySystemType?.map(item => (
                <div key={item._id} style={{ marginBottom: '0.5rem' }}>
                  {item._id}: {item.count}
                </div>
              ))}
            </div>
            
            <div className="card">
              <h3>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/projects" className="btn btn-primary">View All Projects</Link>
                <Link to="/reports" className="btn btn-success">Generate Reports</Link>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h2>Recent Projects</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Project Number</th>
                <th>Name</th>
                <th>System Type</th>
                <th>Clearance</th>
                <th>Installation</th>
                <th>Connection</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map(project => (
                <tr key={project._id}>
                  <td>
                    <Link to={`/projects/edit/${project._id}`}>
                      {project.projectNumber}
                    </Link>
                  </td>
                  <td>{project.name}</td>
                  <td>{project.systemType}</td>
                  <td>{getStatusBadge(project.clearance.status)}</td>
                  <td>{getStatusBadge(project.installation.status)}</td>
                  <td>{getStatusBadge(project.connection.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// We need to import useAuth here
import { useAuth } from '../contexts/AuthContext';

export default Dashboard;