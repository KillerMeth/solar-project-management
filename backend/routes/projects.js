const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('assignedTechnicalOfficer', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new project (Team leader only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'team_leader') {
      return res.status(403).json({ message: 'Only team leaders can create projects' });
    }

    const project = new Project({
      ...req.body,
      createdBy: req.user.id
    });

    const savedProject = await project.save();
    const populatedProject = await Project.findById(savedProject._id)
      .populate('assignedTechnicalOfficer', 'name email')
      .populate('createdBy', 'name');

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Role-based access control
    const userRole = req.user.role;
    
    if (userRole === 'assistant') {
      // Assistants can only update clearance and connection
      if (req.body.clearance) {
        project.clearance = {
          ...project.clearance.toObject(),
          ...req.body.clearance,
          updatedBy: req.user.id,
          updatedAt: new Date()
        };
      }
      if (req.body.connection) {
        project.connection = {
          ...project.connection.toObject(),
          ...req.body.connection,
          updatedBy: req.user.id,
          updatedAt: new Date()
        };
      }
    } else if (userRole === 'technical_officer') {
      // Technical officers can update installation and connection
      if (req.body.installation) {
        project.installation = {
          ...project.installation.toObject(),
          ...req.body.installation,
          updatedBy: req.user.id,
          updatedAt: new Date()
        };
      }
      if (req.body.connection) {
        project.connection = {
          ...project.connection.toObject(),
          ...req.body.connection,
          updatedBy: req.user.id,
          updatedAt: new Date()
        };
      }
    } else if (userRole === 'team_leader') {
      // Team leaders can update everything including assignment
      Object.keys(req.body).forEach(key => {
        if (key !== 'createdBy') {
          project[key] = req.body[key];
        }
      });
    }

    const updatedProject = await project.save();
    const populatedProject = await Project.findById(updatedProject._id)
      .populate('assignedTechnicalOfficer', 'name email')
      .populate('createdBy', 'name');

    res.json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get project statistics for reports
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const projectsBySystemType = await Project.aggregate([
      { $group: { _id: '$systemType', count: { $sum: 1 } } }
    ]);
    
    const clearanceStats = await Project.aggregate([
      { $group: { _id: '$clearance.status', count: { $sum: 1 } } }
    ]);
    
    const installationStats = await Project.aggregate([
      { $group: { _id: '$installation.status', count: { $sum: 1 } } }
    ]);
    
    const connectionStats = await Project.aggregate([
      { $group: { _id: '$connection.status', count: { $sum: 1 } } }
    ]);

    res.json({
      totalProjects,
      projectsBySystemType,
      clearanceStats,
      installationStats,
      connectionStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;