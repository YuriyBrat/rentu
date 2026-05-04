import mongoose from 'mongoose';

const NavodkaActivitySchema = new mongoose.Schema(
   {
      text: {
         type: String,
         required: true,
         trim: true
      },
      noteType: {
         type: String,
         enum: ['positive', 'negative', 'info', 'important'],
         default: 'info'
      },
      activityType: {
         type: String,
         enum: ['note', 'call', 'message', 'meeting'],
         default: 'note'
      },
      contactDate: {
         type: Date,
         default: null
      },
      nextContactAt: {
         type: Date,
         default: null
      },
      createdBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Employee',
         default: null
      }
   },
   { timestamps: true, _id: true }
);

const NavodkaNoteSchema = new mongoose.Schema(
   {
      text: {
         type: String,
         required: true,
         trim: true
      },
      type: {
         type: String,
         enum: ['positive', 'negative', 'info', 'important'],
         default: 'info'
      },
      activityType: {
         type: String,
         enum: ['note', 'call', 'message', 'meeting'],
         default: 'note'
      },
      contactDate: {
         type: Date,
         default: null
      },
      nextContactAt: {
         type: Date,
         default: null
      },
      createdBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Employee',
         default: null
      }
   },
   { timestamps: true, _id: true }
);

const NavodkaSchema = new mongoose.Schema(
   {
      title: {
         type: String,
         required: true,
         trim: true
      },

      ownerName: {
         type: String,
         required: true,
         trim: true
      },

      phone: {
         type: String,
         required: true,
         trim: true
      },

      source: {
         type: String,
         trim: true,
         default: ''
      },

      status: {
         type: String,
         enum: ['active', 'contact', 'waiting', 'converted', 'lost'],
         default: 'active'
      },

      readiness: {
         type: String,
         enum: ['soon', 'q1', 'q2', 'later', 'unknown'],
         default: 'unknown'
      },

      propertyType: {
         type: String,
         trim: true,
         default: ''
      },

      locationText: {
         type: String,
         trim: true,
         default: ''
      },

      priceExpectation: {
         type: String,
         trim: true,
         default: ''
      },

      description: {
         type: String,
         trim: true,
         default: ''
      },

      lastContactAt: {
         type: Date,
         default: null
      },

      nextContactAt: {
         type: Date,
         default: null
      },

      notes: {
         type: [NavodkaNoteSchema],
         default: []
      },

      assignedTo: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Employee',
         default: null
      },
      createdBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Employee',
         default: null
      },
   },
   { timestamps: true }
);

export default mongoose.models.Navodka || mongoose.model('Navodka', NavodkaSchema);