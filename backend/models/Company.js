import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  did: {
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
  establishmentDate: {
    type: Date
  },
  registrationNumber: {
    type: String
  },
  industry: {
    type: String
  },
  website: {
    type: String
  },
  contactEmail: {
    type: String
  },
  contactPhone: {
    type: String
  },
  resourceId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: false // Set to true if role is mandatory
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
companySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Company = mongoose.model('Company', companySchema); 