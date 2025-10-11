import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    projectNumber: '',
    name: '',
    location: '',
    systemType: 'on_grid',
    size: '',
    inverter: '',
    pvPanel: '',
    battery: '',
    assignedTechnicalOfficer: '',
    clearance: { status: 'pending_to_apply_clearance_application' },
    installation: { status: 'clearance_received' },
    connection: { status: 'document_submission' }
  });

  const [technicalOfficers, setTechnicalOfficers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchProject();
    }
    fetchTechnicalOfficers();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchTechnicalOfficers = async () => {
    try {
      const response = await axios.get('/api/users/technical-officers');
      setTechnicalOfficers(response.data);
    } catch (error) {
      console.error('Error fetching technical officers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepChange = (step, status) => {
    setFormData(prev => ({
      ...prev,
      [step]: {
        ...prev[step],
        status
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await axios.put(`/api/projects/${id}`, formData);
      } else {
        await axios.post('/api/projects', formData);
      }
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project');
    } finally {
      setLoading(false);
    }
  };

  const clearanceSteps = [
    { value: 'pending_to_apply_clearance_application', label: 'Pending to Apply' },
    { value: 'clearance_applied', label: 'Applied' },
    { value: 'clearance_approved', label: 'Approved' },
    { value: 'clearance_rejected', label: 'Rejected' },
    { value: 'capacity_reduced', label: 'Capacity Reduced' }
  ];

  const installationSteps = [
    { value: 'clearance_received', label: 'Clearance Received' },
    { value: 'site_visit_completed', label: 'Site Visit Completed' },
    { value: '60_percent_payment_received', label: '60% Payment Received' },
    { value: 'ongoing_installation', label: 'Ongoing Installation' },
    { value: 'installation_completed', label: 'Installation Completed' }
  ];

  const connectionSteps = [
    { value: 'document_submission', label: 'Document Submission' },
    { value: 'estimate_paid', label: 'Estimate Paid' },
    { value: 'connection_complete', label: 'Connection Complete' },
    { value: 'procedure', label: 'Procedure' }
  ];

  const canEditClearance = ['team_leader', 'assistant'].includes(user?.role);
  const canEditInstallation = ['team_leader', 'technical_officer'].includes(user?.role);
  const canEditConnection = ['team_leader', 'assistant', 'technical_officer'].includes(user?.role);

  return (
    <div>
      <Header />
      <div className="container">
        <h1>{isEdit ? 'Edit Project' : 'Create New Project'}</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="card">
            <h2>Basic Information</h2>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Project Number *</label>
                <input
                  type="text"
                  name="projectNumber"
                  className="form-control"
                  value={formData.projectNumber}
                  onChange={handleChange}
                  required
                  disabled={isEdit}
                />
              </div>

              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>System Type *</label>
                <select
                  name="systemType"
                  className="form-control"
                  value={formData.systemType}
                  onChange={handleChange}
                  required
                >
                  <option value="on_grid">On-grid System</option>
                  <option value="off_grid">Off-grid System</option>
                  <option value="hybrid">Hybrid System</option>
                </select>
              </div>

              <div className="form-group">
                <label>Size (kW) *</label>
                <input
                  type="number"
                  name="size"
                  className="form-control"
                  value={formData.size}
                  onChange={handleChange}
                  required
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Inverter *</label>
                <input
                  type="text"
                  name="inverter"
                  className="form-control"
                  value={formData.inverter}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>PV Panel *</label>
                <input
                  type="text"
                  name="pvPanel"
                  className="form-control"
                  value={formData.pvPanel}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Battery</label>
                <input
                  type="text"
                  name="battery"
                  className="form-control"
                  value={formData.battery}
                  onChange={handleChange}
                />
              </div>

              {user?.role === 'team_leader' && (
                <div className="form-group">
                  <label>Assign Technical Officer</label>
                  <select
                    name="assignedTechnicalOfficer"
                    className="form-control"
                    value={formData.assignedTechnicalOfficer}
                    onChange={handleChange}
                  >
                    <option value="">Select Technical Officer</option>
                    {technicalOfficers.map(to => (
                      <option key={to._id} value={to._id}>
                        {to.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Clearance Steps */}
          <div className="card">
            <h2>Clearance Process</h2>
            <div className="progress-steps">
              {clearanceSteps.map(step => (
                <div
                  key={step.value}
                  className={`step ${
                    formData.clearance.status === step.value ? 'active' : ''
                  }`}
                  onClick={() => canEditClearance && handleStepChange('clearance', step.value)}
                  style={{ cursor: canEditClearance ? 'pointer' : 'default' }}
                >
                  {step.label}
                </div>
              ))}
            </div>
          </div>

          {/* Installation Steps */}
          <div className="card">
            <h2>Installation Process</h2>
            <div className="progress-steps">
              {installationSteps.map(step => (
                <div
                  key={step.value}
                  className={`step ${
                    formData.installation.status === step.value ? 'active' : ''
                  }`}
                  onClick={() => canEditInstallation && handleStepChange('installation', step.value)}
                  style={{ cursor: canEditInstallation ? 'pointer' : 'default' }}
                >
                  {step.label}
                </div>
              ))}
            </div>
          </div>

          {/* Connection Steps */}
          <div className="card">
            <h2>Connection Process</h2>
            <div className="progress-steps">
              {connectionSteps.map(step => (
                <div
                  key={step.value}
                  className={`step ${
                    formData.connection.status === step.value ? 'active' : ''
                  }`}
                  onClick={() => canEditConnection && handleStepChange('connection', step.value)}
                  style={{ cursor: canEditConnection ? 'pointer' : 'default' }}
                >
                  {step.label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginRight: '1rem' }}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => navigate('/projects')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;