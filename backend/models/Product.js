import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  productName: {
    type: String,
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  handlingDate: {
    type: Date,
    required: true
  },
  certificates: [{
    type: String,
    enum: ['Organic', 'ColdChain', 'Sustainable', 'QualityTested', 'Recyclable']
  }],
  subjectDID: {
    type: String,
    required: true,
    index: true
  },
  issuerDID: {
    type: String,
    required: true,
    index: true
  },
  recipientDID: {
    type: String,
    required: true,
    index: true
  },
  resourceId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'completed'],
    default: 'pending'
  },
  vcData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
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

// Indexes for better query performance
productSchema.index({ productId: 1 });
productSchema.index({ subjectDID: 1 });
productSchema.index({ issuerDID: 1 });
productSchema.index({ recipientDID: 1 });
productSchema.index({ resourceId: 1 });

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;