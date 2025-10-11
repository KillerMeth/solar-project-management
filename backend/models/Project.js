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

module.exports = mongoose.model('Project', projectSchema);