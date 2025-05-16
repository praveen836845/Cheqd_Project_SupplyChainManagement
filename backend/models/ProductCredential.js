import mongoose from 'mongoose';

const productCredentialSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true,
    unique: true
  },
  issuerDID: {
    type: String,
    required: true
  },
  recipientDID: {
    type: String,
    required: true
  },
  resourceId: {
    type: String,
    required: true
  },
  vcData: {
    type: Object,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const ProductCredential = mongoose.model('ProductCredential', productCredentialSchema); 