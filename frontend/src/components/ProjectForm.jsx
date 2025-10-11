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
    clearance: { 
      status: 'pending_to_apply_clearance_application',
      appliedDate: null,
      receivedDate: null,
      updatedAt: new Date()
    },
    installation: { 
      status: 'clearance_received',
      completedDate: null,
      updatedAt: new Date()
    },
    connection: { 
      status: 'document_submission',
      completedDate: null,
      updatedAt: new Date()
    }
  });

  const [technicalOfficers, setTechnicalOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  // Stage dependency checks
  const canEditInstallation = ['team_leader', 'technical_officer'].includes(user?.role) && 
    (formData.clearance.status === 'clearance_approved' || 
     formData.installation.status !== 'clearance_received');

  const canEditConnection = ['team_leader', 'assistant', 'technical_officer'].includes(user?.role) && 
    formData.installation.status === 'installation_completed';

  const isProjectCompleted = formData.connection.status === 'connection_complete';

  useEffect(() => {
    if (isEdit) {
      fetchProject();
    }
    fetchTechnicalOfficers();
  }, [id]);

  const fetchProject = async () => {
    try {
      console.log('Fetching project with ID:', id);
      const response = await axios.get(`/api/projects/${id}`);
      console.log('Fetched project data:', response.data);
      
      // Transform the data to match form state
      const projectData = {
        projectNumber: response.data.projectNumber || '',
        name: response.data.name || '',
        location: response.data.location || '',
        systemType: response.data.systemType || 'on_grid',
        size: response.data.size?.toString() || '',
        inverter: response.data.inverter || '',
        pvPanel: response.data.pvPanel || '',
        battery: response.data.battery || '',
        assignedTechnicalOfficer: response.data.assignedTechnicalOfficer?._id || response.data.assignedTechnicalOfficer || '',
        clearance: response.data.clearance || { 
          status: 'pending_to_apply_clearance_application',
          appliedDate: null,
          receivedDate: null,
          updatedAt: new Date()
        },
        installation: response.data.installation || { 
          status: 'clearance_received',
          completedDate: null,
          updatedAt: new Date()
        },
        connection: response.data.connection || { 
          status: 'document_submission',
          completedDate: null,
          updatedAt: new Date()
        }
      };
      
      console.log('Transformed project data for form:', projectData);
      setFormData(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      alert('Error loading project: ' + (error.response?.data?.message || error.message));
    } finally {
      setFetchLoading(false);
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
    console.log(`Changing ${step} to ${status}`);
    
    // Check dependencies before allowing changes
    if (step === 'installation' && !canEditInstallation) {
      alert('Cannot start installation until clearance is approved!');
      return;
    }
    
    if (step === 'connection' && !canEditConnection) {
      alert('Cannot start connection until installation is completed!');
      return;
    }
    
    const updateData = {
      status,
      updatedBy: user?.id,
      updatedAt: new Date()
    };

    // Set specific dates based on status changes
    if (step === 'clearance') {
      if (status === 'clearance_applied') {
        updateData.appliedDate = new Date();
      } else if (status === 'clearance_approved') {
        updateData.receivedDate = new Date();
      }
    } else if (step === 'installation' && status === 'installation_completed') {
      updateData.completedDate = new Date();
    } else if (step === 'connection' && status === 'connection_complete') {
      updateData.completedDate = new Date();
    }

    setFormData(prev => ({
      ...prev,
      [step]: {
        ...prev[step],
        ...updateData
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the data properly
      const projectData = {
        projectNumber: formData.projectNumber,
        name: formData.name,
        location: formData.location,
        systemType: formData.systemType,
        size: parseFloat(formData.size) || 0,
        inverter: formData.inverter,
        pvPanel: formData.pvPanel,
        battery: formData.battery || '',
        assignedTechnicalOfficer: formData.assignedTechnicalOfficer || null,
        clearance: formData.clearance,
        installation: formData.installation,
        connection: formData.connection
      };

      console.log('Submitting project data:', projectData);

      let response;
      if (isEdit) {
        response = await axios.put(`/api/projects/${id}`, projectData);
      } else {
        response = await axios.post('/api/projects', projectData);
      }

      console.log('Project saved successfully:', response.data);
      alert('Project saved successfully!');
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error saving project';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const quickUpdateStep = async (step, status) => {
    try {
      // Check dependencies before allowing changes
      if (step === 'installation' && !canEditInstallation) {
        alert('Cannot start installation until clearance is approved!');
        return;
      }
      
      if (step === 'connection' && !canEditConnection) {
        alert('Cannot start connection until installation is completed!');
        return;
      }

      const updateData = {
        [step]: {
          status,
          updatedBy: user?.id,
          updatedAt: new Date()
        }
      };

      // Set specific dates based on status changes
      if (step === 'clearance') {
        if (status === 'clearance_applied') {
          updateData[step].appliedDate = new Date();
        } else if (status === 'clearance_approved') {
          updateData[step].receivedDate = new Date();
        }
      } else if (step === 'installation' && status === 'installation_completed') {
        updateData[step].completedDate = new Date();
      } else if (step === 'connection' && status === 'connection_complete') {
        updateData[step].completedDate = new Date();
      }

      console.log('Quick updating step:', updateData);
      
      const response = await axios.put(`/api/projects/${id}`, updateData);
      setFormData(prev => ({
        ...prev,
        [step]: response.data[step]
      }));
      alert(`${step.charAt(0).toUpperCase() + step.slice(1)} updated to ${getStepLabel(step, status)}`);
    } catch (error) {
      console.error('Error updating step:', error);
      alert('Error updating step: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStepLabel = (stepType, value) => {
    const steps = {
      clearance: [
        { value: 'pending_to_apply_clearance_application', label: 'Pending to Apply' },
        { value: 'clearance_applied', label: 'Applied' },
        { value: 'clearance_approved', label: 'Approved' },
        { value: 'clearance_rejected', label: 'Rejected' },
        { value: 'capacity_reduced', label: 'Capacity Reduced' }
      ],
      installation: [
        { value: 'clearance_received', label: 'Clearance Received' },
        { value: 'site_visit_completed', label: 'Site Visit Completed' },
        { value: '60_percent_payment_received', label: '60% Payment Received' },
        { value: 'ongoing_installation', label: 'Ongoing Installation' },
        { value: 'installation_completed', label: 'Installation Completed' }
      ],
      connection: [
        { value: 'document_submission', label: 'Document Submission' },
        { value: 'estimate_paid', label: 'Estimate Paid' },
        { value: 'connection_complete', label: 'Connection Complete' },
        { value: 'procedure', label: 'Procedure' }
      ]
    };

    const step = steps[stepType]?.find(s => s.value === value);
    return step?.label || value;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canEditClearance = ['team_leader', 'assistant'].includes(user?.role);

  // Quick status update buttons for each process
  const renderQuickUpdateButtons = (stepType, steps, canEdit, dependencyMessage = '') => {
    if (!isEdit) return null;

    return (
      <div className="quick-update-buttons" style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Quick Update:</h4>
        {!canEdit && dependencyMessage && (
          <div style={{ 
            background: '#fff3cd', 
            color: '#856404', 
            padding: '0.5rem', 
            borderRadius: '4px', 
            marginBottom: '0.5rem',
            border: '1px solid #ffeaa7'
          }}>
            ⚠️ {dependencyMessage}
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {steps.map(step => (
            <button
              key={step.value}
              type="button"
              className={`btn btn-sm ${formData[stepType].status === step.value ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => quickUpdateStep(stepType, step.value)}
              disabled={formData[stepType].status === step.value || !canEdit}
              title={!canEdit ? dependencyMessage : ''}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Show loading while fetching project data
  if (fetchLoading) {
    return (
      <div>
        <Header />
        <div className="container">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Loading Project...</h2>
            <p>Please wait while we load the project data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>
            {isEdit ? `Edit Project: ${formData.name || 'Loading...'}` : 'Create New Project'}
            {isProjectCompleted && (
              <span className="badge badge-completed" style={{ marginLeft: '1rem' }}>
                ✅ PROJECT COMPLETED
              </span>
            )}
          </h1>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/projects')}
          >
            Back to Projects
          </button>
        </div>

        {/* Tab Navigation */}
        {isEdit && (
          <div className="tabs" style={{ marginBottom: '2rem', borderBottom: '2px solid #dee2e6' }}>
            <button
              className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
              style={{ 
                padding: '0.75rem 1.5rem', 
                border: 'none', 
                background: 'none',
                borderBottom: activeTab === 'basic' ? '2px solid #2c5aa0' : '2px solid transparent',
                color: activeTab === 'basic' ? '#2c5aa0' : '#666',
                fontWeight: activeTab === 'basic' ? '600' : '400'
              }}
            >
              Basic Info
            </button>
            <button
              className={`tab-button ${activeTab === 'stages' ? 'active' : ''}`}
              onClick={() => setActiveTab('stages')}
              style={{ 
                padding: '0.75rem 1.5rem', 
                border: 'none', 
                background: 'none',
                borderBottom: activeTab === 'stages' ? '2px solid #2c5aa0' : '2px solid transparent',
                color: activeTab === 'stages' ? '#2c5aa0' : '#666',
                fontWeight: activeTab === 'stages' ? '600' : '400'
              }}
            >
              Project Stages
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information Tab */}
          {(activeTab === 'basic' || !isEdit) && (
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
                    placeholder="Enter project number"
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
                    placeholder="Enter project name"
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
                    placeholder="Enter project location"
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
                    min="0"
                    placeholder="Enter system size"
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
                    placeholder="Enter inverter details"
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
                    placeholder="Enter PV panel details"
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
                    placeholder="Optional for on-grid systems"
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
          )}

          {/* Project Stages Tab */}
          {(activeTab === 'stages' || !isEdit) && (
            <>
              {/* Clearance Steps */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2>Clearance Process</h2>
                  <span className={`badge ${formData.clearance.status.includes('completed') || formData.clearance.status.includes('approved') ? 'badge-completed' : formData.clearance.status.includes('rejected') ? 'badge-rejected' : 'badge-in-progress'}`}>
                    Current: {getStepLabel('clearance', formData.clearance.status)}
                  </span>
                </div>
                
                {/* Date Information */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div>
                    <strong>Applied Date:</strong>
                    <br />
                    <span style={{ color: formData.clearance.appliedDate ? '#28a745' : '#6c757d' }}>
                      {formatDate(formData.clearance.appliedDate)}
                    </span>
                  </div>
                  <div>
                    <strong>Received Date:</strong>
                    <br />
                    <span style={{ color: formData.clearance.receivedDate ? '#28a745' : '#6c757d' }}>
                      {formatDate(formData.clearance.receivedDate)}
                    </span>
                  </div>
                  <div>
                    <strong>Last Updated:</strong>
                    <br />
                    <span style={{ color: '#6c757d' }}>
                      {formatDate(formData.clearance.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="progress-steps">
                  {[
                    { value: 'pending_to_apply_clearance_application', label: 'Pending to Apply' },
                    { value: 'clearance_applied', label: 'Applied' },
                    { value: 'clearance_approved', label: 'Approved' },
                    { value: 'clearance_rejected', label: 'Rejected' },
                    { value: 'capacity_reduced', label: 'Capacity Reduced' }
                  ].map(step => (
                    <div
                      key={step.value}
                      className={`step ${formData.clearance.status === step.value ? 'active' : ''} ${
                        canEditClearance ? 'clickable' : ''
                      }`}
                      onClick={() => canEditClearance && handleStepChange('clearance', step.value)}
                      style={{ 
                        cursor: canEditClearance ? 'pointer' : 'not-allowed',
                        background: formData.clearance.status === step.value ? '#2c5aa0' : '#f8f9fa',
                        color: formData.clearance.status === step.value ? 'white' : '#333',
                        border: formData.clearance.status === step.value ? '2px solid #2c5aa0' : '2px solid #dee2e6',
                        opacity: canEditClearance ? 1 : 0.6
                      }}
                    >
                      {step.label}
                    </div>
                  ))}
                </div>
                {renderQuickUpdateButtons('clearance', [
                  { value: 'pending_to_apply_clearance_application', label: 'Pending' },
                  { value: 'clearance_applied', label: 'Applied' },
                  { value: 'clearance_approved', label: 'Approved' },
                  { value: 'clearance_rejected', label: 'Rejected' },
                  { value: 'capacity_reduced', label: 'Reduced' }
                ], canEditClearance)}
              </div>

              {/* Installation Steps */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2>Installation Process</h2>
                  <span className={`badge ${formData.installation.status.includes('completed') ? 'badge-completed' : 'badge-in-progress'}`}>
                    Current: {getStepLabel('installation', formData.installation.status)}
                  </span>
                </div>
                
                {/* Dependency Warning */}
                {!canEditInstallation && formData.clearance.status !== 'clearance_approved' && (
                  <div style={{ 
                    background: '#fff3cd', 
                    color: '#856404', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    marginBottom: '1rem',
                    border: '1px solid #ffeaa7',
                    textAlign: 'center'
                  }}>
                    ⚠️ <strong>Installation Locked:</strong> Clearance must be approved before starting installation
                  </div>
                )}
                
                {/* Date Information */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div>
                    <strong>Completed Date:</strong>
                    <br />
                    <span style={{ color: formData.installation.completedDate ? '#28a745' : '#6c757d' }}>
                      {formatDate(formData.installation.completedDate)}
                    </span>
                  </div>
                  <div>
                    <strong>Last Updated:</strong>
                    <br />
                    <span style={{ color: '#6c757d' }}>
                      {formatDate(formData.installation.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="progress-steps">
                  {[
                    { value: 'clearance_received', label: 'Clearance Received' },
                    { value: 'site_visit_completed', label: 'Site Visit Completed' },
                    { value: '60_percent_payment_received', label: '60% Payment Received' },
                    { value: 'ongoing_installation', label: 'Ongoing Installation' },
                    { value: 'installation_completed', label: 'Installation Completed' }
                  ].map(step => (
                    <div
                      key={step.value}
                      className={`step ${formData.installation.status === step.value ? 'active' : ''} ${
                        canEditInstallation ? 'clickable' : ''
                      }`}
                      onClick={() => canEditInstallation && handleStepChange('installation', step.value)}
                      style={{ 
                        cursor: canEditInstallation ? 'pointer' : 'not-allowed',
                        background: formData.installation.status === step.value ? '#2c5aa0' : '#f8f9fa',
                        color: formData.installation.status === step.value ? 'white' : '#333',
                        border: formData.installation.status === step.value ? '2px solid #2c5aa0' : '2px solid #dee2e6',
                        opacity: canEditInstallation ? 1 : 0.6
                      }}
                    >
                      {step.label}
                    </div>
                  ))}
                </div>
                {renderQuickUpdateButtons(
                  'installation', 
                  [
                    { value: 'clearance_received', label: 'Clearance Received' },
                    { value: 'site_visit_completed', label: 'Site Visit Done' },
                    { value: '60_percent_payment_received', label: '60% Paid' },
                    { value: 'ongoing_installation', label: 'Ongoing' },
                    { value: 'installation_completed', label: 'Completed' }
                  ], 
                  canEditInstallation,
                  'Clearance must be approved to update installation'
                )}
              </div>

              {/* Connection Steps */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2>Connection Process</h2>
                  <span className={`badge ${formData.connection.status.includes('complete') ? 'badge-completed' : 'badge-in-progress'}`}>
                    Current: {getStepLabel('connection', formData.connection.status)}
                  </span>
                </div>
                
                {/* Dependency Warning */}
                {!canEditConnection && formData.installation.status !== 'installation_completed' && (
                  <div style={{ 
                    background: '#fff3cd', 
                    color: '#856404', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    marginBottom: '1rem',
                    border: '1px solid #ffeaa7',
                    textAlign: 'center'
                  }}>
                    ⚠️ <strong>Connection Locked:</strong> Installation must be completed before starting connection
                  </div>
                )}
                
                {/* Project Completion Banner */}
                {isProjectCompleted && (
                  <div style={{ 
                    background: '#d4edda', 
                    color: '#155724', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    marginBottom: '1rem',
                    border: '1px solid #c3e6cb',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    🎉 PROJECT COMPLETED! All stages are finished.
                  </div>
                )}
                
                {/* Date Information */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div>
                    <strong>Completed Date:</strong>
                    <br />
                    <span style={{ color: formData.connection.completedDate ? '#28a745' : '#6c757d' }}>
                      {formatDate(formData.connection.completedDate)}
                    </span>
                  </div>
                  <div>
                    <strong>Last Updated:</strong>
                    <br />
                    <span style={{ color: '#6c757d' }}>
                      {formatDate(formData.connection.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="progress-steps">
                  {[
                    { value: 'document_submission', label: 'Document Submission' },
                    { value: 'estimate_paid', label: 'Estimate Paid' },
                    { value: 'connection_complete', label: 'Connection Complete' },
                    { value: 'procedure', label: 'Procedure' }
                  ].map(step => (
                    <div
                      key={step.value}
                      className={`step ${formData.connection.status === step.value ? 'active' : ''} ${
                        canEditConnection ? 'clickable' : ''
                      }`}
                      onClick={() => canEditConnection && handleStepChange('connection', step.value)}
                      style={{ 
                        cursor: canEditConnection ? 'pointer' : 'not-allowed',
                        background: formData.connection.status === step.value ? '#2c5aa0' : '#f8f9fa',
                        color: formData.connection.status === step.value ? 'white' : '#333',
                        border: formData.connection.status === step.value ? '2px solid #2c5aa0' : '2px solid #dee2e6',
                        opacity: canEditConnection ? 1 : 0.6
                      }}
                    >
                      {step.label}
                    </div>
                  ))}
                </div>
                {renderQuickUpdateButtons(
                  'connection', 
                  [
                    { value: 'document_submission', label: 'Docs Submitted' },
                    { value: 'estimate_paid', label: 'Estimate Paid' },
                    { value: 'connection_complete', label: 'Complete' },
                    { value: 'procedure', label: 'Procedure' }
                  ], 
                  canEditConnection,
                  'Installation must be completed to update connection'
                )}
              </div>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginRight: '1rem', padding: '0.75rem 2rem' }}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => navigate('/projects')}
              style={{ padding: '0.75rem 2rem' }}
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