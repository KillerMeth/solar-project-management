import React, { useState, useEffect } from 'react';
import Header from './Header';
import axios from 'axios';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        axios.get('/api/projects/stats/overview'),
        axios.get('/api/projects')
      ]);
      
      setStats(statsRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Project Number', 'Name', 'Location', 'System Type', 'Size (kW)', 'Clearance Status', 'Installation Status', 'Connection Status'];
    
    const csvData = projects.map(project => [
      project.projectNumber,
      project.name,
      project.location,
      project.systemType,
      project.size,
      project.clearance.status,
      project.installation.status,
      project.connection.status
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'solar-projects-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!stats) {
    return (
      <div>
        <Header />
        <div className="container">Loading reports...</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Reports</h1>
          <button onClick={exportToCSV} className="btn btn-success">
            Export to CSV
          </button>
        </div>

        <div className="grid grid-3">
          <div className="card">
            <h3>Total Projects</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2c5aa0' }}>
              {stats.totalProjects}
            </p>
          </div>

          <div className="card">
            <h3>System Type Distribution</h3>
            {stats.projectsBySystemType?.map(item => (
              <div key={item._id} style={{ marginBottom: '0.5rem' }}>
                <strong>{item._id}:</strong> {item.count} projects
              </div>
            ))}
          </div>

          <div className="card">
            <h3>Project Status Overview</h3>
            <div>
              <strong>Clearance:</strong>
              {stats.clearanceStats?.map(item => (
                <div key={item._id} style={{ marginLeft: '1rem' }}>
                  {item._id}: {item.count}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Detailed Project Report</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Project Number</th>
                <th>Name</th>
                <th>System Type</th>
                <th>Size (kW)</th>
                <th>Clearance</th>
                <th>Installation</th>
                <th>Connection</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project._id}>
                  <td>{project.projectNumber}</td>
                  <td>{project.name}</td>
                  <td>{project.systemType}</td>
                  <td>{project.size} kW</td>
                  <td>{project.clearance.status}</td>
                  <td>{project.installation.status}</td>
                  <td>{project.connection.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;