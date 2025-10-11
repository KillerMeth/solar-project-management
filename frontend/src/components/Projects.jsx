import React, { useState, useEffect } from 'react';
import Header from './Header';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending_to_apply_clearance_application': 'Pending',
      'clearance_applied': 'Applied',
      'clearance_approved': 'Approved',
      'clearance_rejected': 'Rejected',
      'capacity_reduced': 'Reduced',
      'clearance_received': 'Received',
      'site_visit_completed': 'Site Visit Done',
      '60_percent_payment_received': '60% Paid',
      'ongoing_installation': 'Ongoing',
      'installation_completed': 'Completed',
      'document_submission': 'Docs Submitted',
      'estimate_paid': 'Estimate Paid',
      'connection_complete': 'Complete',
      'procedure': 'Procedure'
    };

    const badgeClass = {
      'Pending': 'badge-pending',
      'Applied': 'badge-in-progress',
      'Approved': 'badge-completed',
      'Rejected': 'badge-rejected',
      'Reduced': 'badge-in-progress',
      'Received': 'badge-pending',
      'Site Visit Done': 'badge-in-progress',
      '60% Paid': 'badge-in-progress',
      'Ongoing': 'badge-in-progress',
      'Completed': 'badge-completed',
      'Docs Submitted': 'badge-pending',
      'Estimate Paid': 'badge-in-progress',
      'Complete': 'badge-completed',
      'Procedure': 'badge-in-progress'
    }[statusMap[status]] || 'badge-pending';

    return <span className={`badge ${badgeClass}`}>{statusMap[status]}</span>;
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Projects</h1>
          {user?.role === 'team_leader' && (
            <Link to="/projects/new" className="btn btn-primary">Create New Project</Link>
          )}
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Project Number</th>
                <th>Name</th>
                <th>Location</th>
                <th>System Type</th>
                <th>Size (kW)</th>
                <th>Clearance</th>
                <th>Installation</th>
                <th>Connection</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project._id}>
                  <td>{project.projectNumber}</td>
                  <td>{project.name}</td>
                  <td>{project.location}</td>
                  <td>{project.systemType}</td>
                  <td>{project.size} kW</td>
                  <td>{getStatusBadge(project.clearance.status)}</td>
                  <td>{getStatusBadge(project.installation.status)}</td>
                  <td>{getStatusBadge(project.connection.status)}</td>
                  <td>
                    <Link 
                      to={`/projects/edit/${project._id}`} 
                      className="btn btn-primary btn-sm"
                    >
                      View/Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Projects;