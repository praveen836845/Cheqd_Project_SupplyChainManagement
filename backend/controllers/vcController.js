import { issueVC, verifyVC, checkTrustRegistry } from '../services/cheqdService.js';
import { ProductCredential } from '../models/ProductCredential.js';
import Product from '../models/Product.js';
import axios from 'axios';

const issueVCHandler = async (req, res) => {
  try {
    const { issuerDid, subjectDid, credentialData } = req.body;
    
    // Check if this is an update to an existing product
    const isEdit = credentialData.isEdit || false;
    const originalId = credentialData.originalId;
    const productId = credentialData.productId;
    
    // Issue VC
    const vc = await issueVC(issuerDid, subjectDid, credentialData);

    if (isEdit) {
      // This is an update to an existing product
      let existingProduct;
      
      // Find the existing product either by ID or productId
      if (originalId) {
        existingProduct = await Product.findById(originalId);
      } else if (productId) {
        existingProduct = await Product.findOne({ productId: productId });
      }
      
      if (!existingProduct) {
        return res.status(404).json({ error: 'Existing product not found' });
      }
      
      // Create a new entry in the vcData array or initialize it if it doesn't exist
      if (!existingProduct.vcDataArray) {
        existingProduct.vcDataArray = [];
      }
      
      // Add the new VC to the array
      existingProduct.vcDataArray.push({
        issuerDID: issuerDid,
        recipientDID: credentialData.recipientDID,
        vcData: vc,
        timestamp: new Date()
      });
      
      // Update the main recipientDID field
      existingProduct.recipientDID = credentialData.recipientDID;
      
      // Save the updated product
      await existingProduct.save();
      
      // No need to create a new ProductCredential entry for existing products
      return res.json({ vc, product: existingProduct });
    } else {
      // This is a new product
      // Check if a ProductCredential with this productId already exists
      let productCredential = await ProductCredential.findOne({ 
        productId: productId 
      });

      if (productCredential) {
        // Update existing ProductCredential
        productCredential.vcData = vc;
        productCredential.recipientDID = credentialData.recipientDID;
        await productCredential.save();
      } else {
        // Only create a new ProductCredential if one doesn't exist
        productCredential = new ProductCredential({
          productName: credentialData.productName,
          productId: credentialData.productId,
          issuerDID: issuerDid,
          recipientDID: credentialData.recipientDID,
          resourceId: vc.resourceId || 'unknown',
          vcData: vc
        });
        await productCredential.save();
      }

      res.json({ vc });
    }
  } catch (error) {
    console.error('VC issuance error:', error);
    res.status(500).json({ error: error.message });
  }
};

const verifyVCHandler = async (req, res) => {
  try {
    const { subjectDid } = req.body;
    
    // Find the ProductCredential
    const productCredential = await ProductCredential.findOne({ 
      recipientDID: subjectDid 
    });

    if (!productCredential || !productCredential.vcData) {
      return res.status(404).json({ error: 'VC not found' });
    }

    const vc = productCredential.vcData;
    const isValid = await verifyVC(vc);
    const isTrusted = await checkTrustRegistry(vc.issuer.id);
    
    res.json({ isValid, isTrusted });
  } catch (error) {
    console.error('VC verification error:', error);
    res.status(500).json({ error: error.message });
  }
};


const verifiableCrendentail = async (req, res) => {
    
  const { jwt, Id, productId } = req.body;
  const queryParams = req.query;
  
  console.log('Verification request received:', { jwt: jwt?.substring(0, 20) + '...', Id, productId });

  if (!jwt || typeof jwt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid JWT in request body' });
  }

  // Allow either Id or productId to be used
  const identifier = Id || productId;
  
  if (!identifier) {
      return res.status(400).json({ error: 'Missing product identifier in request body' });
  }

  try {
    // First, find the product by ID - try both MongoDB _id and productId field
    let product;
    
    if (Id && Id.length === 24) {
      // If it looks like a MongoDB ObjectId, try to find by _id
      product = await Product.findById(Id);
    }
    
    // If not found by _id, try by productId
    if (!product && productId) {
      product = await Product.findOne({ productId: productId });
    }
    
    if (!product) {
      return res.status(404).json({ error: `Product with identifier ${identifier} not found` });
    }
    
    console.log('Product found:', { id: product._id, productId: product.productId, status: product.status });
    
    // Verify the credential
    const url = 'https://studio-api.cheqd.net/credential/verify';
    const headers = {
        'x-api-key': 'caas_f4ee44434579df121008b1b786b384253fe948ef21ab00f1d724b353cd02612a0ce2396f13184072dcdeb0c7202b5a6d87c273ca019eba1aed14d41ebf54ad93',
        'Content-Type': 'application/json'
    };

    const payload = {
        credential: jwt,
        policies: {} // You can extend this if needed
    };

    const response = await axios.post(url, payload, {
        headers,
        params: {
            verifyStatus: queryParams.verifyStatus || false,
            fetchRemoteContexts: queryParams.fetchRemoteContexts || false,
            allowDeactivatedDid: queryParams.allowDeactivatedDid || false
        }
    });
    
    // If verification is successful, update the product status to active
    if (response.data && response.data.verified) {
      // Update product status to active
      product.status = 'active';
      await product.save();
      
      return res.json({ 
        verified: true, 
        data: response.data,
        product: {
          id: product._id,
          productId: product.productId,
          status: product.status,
          message: 'Product status updated to active'
        }
      });
    } else {
      return res.json({ 
        verified: false, 
        data: response.data,
        message: 'Verification failed'
      });
    }
    
  } catch (error) {
      const status = error.response?.status || 500;
      let message = error.response?.data?.error || error.response?.data?.message || error.message;
      
      if (status === 500 && message.includes('Unsupported status purpose')) {
          message = 'Verification failed: VC lacks a valid credentialStatus for status verification';
      } else if (status === 400) {
          message = `Invalid credential or policies: ${message}`;
      } else if (status === 401) {
          message = 'Unauthorized: Invalid or missing API key';
      }
      
      return res.status(status).json({ 
          verified: false, 
          error: `Failed to verify VC: ${message}` 
      });
  }
}

export { issueVCHandler, verifyVCHandler , verifiableCrendentail};