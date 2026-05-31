import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['bookmarked', 'applied', 'interviewing', 'offered', 'rejected'],
    default: 'bookmarked'
  },
  url: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  appliedDate: {
    type: Date,
    default: null
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  },
  salary: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Job = mongoose.model('Job', JobSchema);
export default Job;
