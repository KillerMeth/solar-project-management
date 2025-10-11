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
        } else if (statusFilter === 'completed') {
          return project.connection.status === 'connection_complete';
        } else if (statusFilter === 'in_progress') {
          return project.connection.status !== 'connection_complete';
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

  const getStatusBadge = (status, stageType, project) => {
    const statusMap = {
      'pending_to_apply_clearance_application': 'Pending',
      'clearance_applied': 'Applied',
      'clearance_approved': 'Approved',
      'clearance_rejected': 'Rejected',
      'capacity_reduced': 'Reduced',
      'clearance_received': 'Received',
      'site_visit_completed': 'Site Visit',
      '60_percent_payment_received': '60% Paid',
      'ongoing_installation': 'Ongoing',
      'installation_completed': 'Completed',
      'document_submission': 'Docs Sent',
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
      'Site Visit': 'badge-in-progress',
      '60% Paid': 'badge-in-progress',
      'Ongoing': 'badge-in-progress',
      'Completed': 'badge-completed',
      'Docs Sent': 'badge-pending',
      'Estimate Paid': 'badge-in-progress',
      'Complete': 'badge-completed',
      'Procedure': 'badge-in-progress'
    }[statusMap[status]] || 'badge-pending';

    // Check if stage is locked due to dependencies
    let isLocked = false;
    let lockReason = '';

    if (stageType === 'installation') {
      if (project.clearance.status !== 'clearance_approved') {
        isLocked = true;
        lockReason = 'Waiting for clearance';
      }
    } else if (stageType === 'connection') {
      if (project.installation.status !== 'installation_completed') {
        isLocked = true;
        lockReason = 'Waiting for installation';
      }
    }

    return (
      <div>
        <span 
          className={`badge ${badgeClass}`}
          style={{
            opacity: isLocked ? 0.5 : 1,
            border: isLocked ? '1px dashed #6c757d' : 'none'
          }}
          title={isLocked ? lockReason : ''}
        >
          {statusMap[status]}
          {isLocked && ' 🔒'}
        </span>
        {isLocked && (
          <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '2px' }}>
            {lockReason}
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getProjectStatus = (project) => {
    if (project.connection.status === 'connection_complete') {
      return { status: 'completed', label: 'Completed', color: '#10b981', icon: '✅' };
    } else if (project.installation.status === 'installation_completed') {
      return { status: 'connection', label: 'Connection', color: '#3b82f6', icon: '🔌' };
    } else if (project.clearance.status === 'clearance_approved') {
      return { status: 'installation', label: 'Installation', color: '#f59e0b', icon: '🔧' };
    } else {
      return { status: 'clearance', label: 'Clearance', color: '#64748b', icon: '📋' };
    }
  };

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    completed: projects.filter(p => p.connection.status === 'connection_complete').length,
    inProgress: projects.filter(p => p.connection.status !== 'connection_complete').length,
    clearance: projects.filter(p => getProjectStatus(p).status === 'clearance').length,
    installation: projects.filter(p => getProjectStatus(p).status === 'installation').length,
    connection: projects.filter(p => getProjectStatus(p).status === 'connection').length,
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container">
          <div className="loading">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container">
        {/* Page Header */}
        <div className="card mb-3">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Projects</h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Manage and track all solar installation projects
              </p>
            </div>
            {user?.role === 'team_leader' && (
              <Link to="/projects/new" className="btn btn-primary">
                <span>+</span> New Project
              </Link>
            )}
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{projectStats.total}</div>
            <div className="stat-label">Total Projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--success)' }}>{projectStats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--warning)' }}>{projectStats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--primary)' }}>
              {projectStats.clearance + projectStats.installation + projectStats.connection}
            </div>
            <div className="stat-label">Active Stages</div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="card mb-3">
          <div className="grid grid-2">
            <div className="form-group">
              <label>Sort by</label>
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
              <label>Filter by Status</label>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="clearance">Clearance Stage</option>
                <option value="installation">Installation Stage</option>
                <option value="connection">Connection Stage</option>
              </select>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            marginTop: '1rem'
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sort order:</span>
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

        {/* Projects Table */}
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('projectNumber')}>
                    Project ID {getSortIcon('projectNumber')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Project Name {getSortIcon('name')}
                  </th>
                  <th>Location</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('systemType')}>
                    Type {getSortIcon('systemType')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('size')}>
                    Size {getSortIcon('size')}
                  </th>
                  <th>Stage</th>
                  <th>Clearance</th>
                  <th>Installation</th>
                  <th>Connection</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(project => {
                  const projectStatus = getProjectStatus(project);
                  return (
                    <tr key={project._id} style={{ 
                      background: projectStatus.status === 'completed' ? '#f0fdf4' : 'var(--surface)'
                    }}>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--primary)' }}>
                          {project.projectNumber}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formatDate(project.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500' }}>
                          {project.name}
                        </div>
                        {projectStatus.status === 'completed' && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--success)' }}>
                            ✅ Completed
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {project.location}
                      </td>
                      <td>
                        <span className="badge" style={{ 
                          background: '#f1f5f9', 
                          color: 'var(--text-secondary)',
                          fontSize: '0.7rem'
                        }}>
                          {project.systemType.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {project.size} kW
                      </td>
                      <td>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          fontSize: '0.875rem'
                        }}>
                          <span>{projectStatus.icon}</span>
                          <span style={{ 
                            color: projectStatus.color,
                            fontWeight: '600'
                          }}>
                            {projectStatus.label}
                          </span>
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(project.clearance.status, 'clearance', project)}
                      </td>
                      <td>
                        {getStatusBadge(project.installation.status, 'installation', project)}
                      </td>
                      <td>
                        {getStatusBadge(project.connection.status, 'connection', project)}
                      </td>
                      <td>
                        <Link 
                          to={`/projects/edit/${project._id}`} 
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.5rem 0.75rem' }}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredProjects.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              color: 'var(--text-muted)',
              background: '#f8fafc',
              borderRadius: 'var(--radius)',
              margin: '1rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ marginBottom: '0.5rem' }}>No projects found</h3>
              <p>No projects match your current filters.</p>
              {statusFilter !== 'all' && (
                <button 
                  className="btn btn-outline-primary mt-2"
                  onClick={() => setStatusFilter('all')}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;