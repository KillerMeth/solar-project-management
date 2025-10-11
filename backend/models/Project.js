const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  systemType: {
    type: String,
    enum: ['on_grid', 'off_grid', 'hybrid'],
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  inverter: {
    type: String,
    required: true
  },
  pvPanel: {
    type: String,
    required: true
  },
  battery: {
    type: String
  },
  assignedTechnicalOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  clearance: {
    status: {
      type: String,
      enum: [
        'pending_to_apply_clearance_application',
        'clearance_applied',
        'clearance_approved',
        'clearance_rejected',
        'capacity_reduced'
      ],
      default: 'pending_to_apply_clearance_application'
    },
    appliedDate: {
      type: Date
    },
    receivedDate: {
      type: Date
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  installation: {
    status: {
      type: String,
      enum: [
        'clearance_received',
        'site_visit_completed',
        '60_percent_payment_received',
        'ongoing_installation',
        'installation_completed'
      ],
      default: 'clearance_received'
    },
    completedDate: {
      type: Date
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  connection: {
    status: {
      type: String,
      enum: [
        'document_submission',
        'estimate_paid',
        'connection_complete',
        'procedure'
      ],
      default: 'document_submission'
    },
    completedDate: {
      type: Date
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Middleware to automatically set dates when status changes
projectSchema.pre('save', function(next) {
  const project = this;
  
  // Set clearance applied date
  if (project.isModified('clearance.status') && project.clearance.status === 'clearance_applied') {
    project.clearance.appliedDate = new Date();
  }
  
  // Set clearance received date
  if (project.isModified('clearance.status') && project.clearance.status === 'clearance_approved') {
    project.clearance.receivedDate = new Date();
  }
  
  // Set installation completed date
  if (project.isModified('installation.status') && project.installation.status === 'installation_completed') {
    project.installation.completedDate = new Date();
  }
  
  // Set connection completed date
  if (project.isModified('connection.status') && project.connection.status === 'connection_complete') {
    project.connection.completedDate = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Project', projectSchema);