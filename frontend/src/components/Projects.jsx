import React, { useState, useEffect } from 'react';
import Header from './Header';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, sortField, sortOrder, statusFilter]);

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

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => {
        if (statusFilter === 'clearance') {
          return project.clearance.status === 'clearance_approved';
        } else if (statusFilter === 'installation') {
          return project.installation.status === 'installation_completed';
        } else if (statusFilter === 'connection') {
          return project.connection.status === 'connection_complete';
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'systemType':
          aValue = a.systemType;
          bValue = b.systemType;
          break;
        case 'clearance':
          aValue = a.clearance.status;
          bValue = b.clearance.status;
          break;
        case 'installation':
          aValue = a.installation.status;
          bValue = b.installation.status;
          break;
        case 'connection':
          aValue = a.connection.status;
          bValue = b.connection.status;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProjects(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
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

        {/* Sorting and Filtering Controls */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Sort by:</label>
              <select
                className="form-control"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Project Name</option>
                <option value="size">System Size</option>
                <option value="systemType">System Type</option>
                <option value="clearance">Clearance Status</option>
                <option value="installation">Installation Status</option>
                <option value="connection">Connection Status</option>
              </select>
            </div>

            <div className="form-group">
              <label>Filter by Status:</label>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                <option value="clearance">Clearance Approved</option>
                <option value="installation">Installation Completed</option>
                <option value="connection">Connection Complete</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>Order: </span>
            <button
              className={`btn btn-sm ${sortOrder === 'asc' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSortOrder('asc')}
            >
              Ascending ↑
            </button>
            <button
              className={`btn btn-sm ${sortOrder === 'desc' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSortOrder('desc')}
            >
              Descending ↓
            </button>
          </div>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('projectNumber')}>
                  Project Number {getSortIcon('projectNumber')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                  Name {getSortIcon('name')}
                </th>
                <th>Location</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('systemType')}>
                  System Type {getSortIcon('systemType')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('size')}>
                  Size (kW) {getSortIcon('size')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('clearance')}>
                  Clearance {getSortIcon('clearance')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('installation')}>
                  Installation {getSortIcon('installation')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('connection')}>
                  Connection {getSortIcon('connection')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr key={project._id}>
                  <td>
                    <strong>{project.projectNumber}</strong>
                    <br />
                    <small style={{ color: '#666' }}>
                      Created: {formatDate(project.createdAt)}
                    </small>
                  </td>
                  <td>{project.name}</td>
                  <td>{project.location}</td>
                  <td>
                    <span className="badge" style={{ background: '#e9ecef', color: '#495057' }}>
                      {project.systemType.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{project.size} kW</td>
                  <td>
                    {getStatusBadge(project.clearance.status)}
                    <br />
                    <small style={{ color: '#666' }}>
                      {project.clearance.updatedAt && formatDate(project.clearance.updatedAt)}
                    </small>
                  </td>
                  <td>
                    {getStatusBadge(project.installation.status)}
                    <br />
                    <small style={{ color: '#666' }}>
                      {project.installation.updatedAt && formatDate(project.installation.updatedAt)}
                    </small>
                  </td>
                  <td>
                    {getStatusBadge(project.connection.status)}
                    <br />
                    <small style={{ color: '#666' }}>
                      {project.connection.updatedAt && formatDate(project.connection.updatedAt)}
                    </small>
                  </td>
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
          
          {filteredProjects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No projects found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;