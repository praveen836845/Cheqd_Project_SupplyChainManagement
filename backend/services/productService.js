import Product from '../models/Product.js';

// Mock data for testing
const mockProducts = [
  {
    _id: '1',
    productId: 'PRD-001',
    productName: 'Organic Cotton T-Shirt',
    batchNumber: 'BATCH-001',
    handlingDate: new Date(),
    status: 'active',
    certificates: ['Organic', 'Sustainable'],
    recipientDID: 'did:example:123',
    resourceId: 'res-001',
    vcData: {
      proof: {
        jwt: 'mock.jwt.token'
      }
    }
  },
  {
    _id: '2',
    productId: 'PRD-002',
    productName: 'Recycled Denim Jeans',
    batchNumber: 'BATCH-002',
    handlingDate: new Date(),
    status: 'active',
    certificates: ['Recyclable', 'Sustainable'],
    recipientDID: 'did:example:123',
    resourceId: 'res-002',
    vcData: {
      proof: {
        jwt: 'mock.jwt.token'
      }
    }
  }
];

export const createProduct = async (productData) => {
  try {
    // Validate required fields
    const requiredFields = [
      'productId',
      'productName',
      'batchNumber',
      'handlingDate',
      'subjectDID',
      'issuerDID',
      'recipientDID',
      'resourceId',
      'vcData'
    ];
    const missingFields = requiredFields.filter(field => !productData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Create and save the product
    const product = new Product(productData);
    const savedProduct = await product.save();
    console.log('Successfully saved product:', savedProduct._id);
    return savedProduct;
  } catch (error) {
    console.error('Error creating product:', {
      error: error.message,
      code: error.code,
      productData: {
        ...productData,
        vcData: '[REDACTED]' // Don't log sensitive data
      }
    });

    // Handle duplicate key error
    if (error.code === 11000) {
      throw new Error(`Product with ID ${productData.productId} already exists`);
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      throw new Error(`Validation error: ${validationErrors.join(', ')}`);
    }

    throw new Error(`Failed to create product: ${error.message}`);
  }
};


export const getProductByResourceId = async (resourceId) => {
  try {
    const product = await Product.findOne({ resourceId });
    if (!product) {
      throw new Error(`No product found with resourceId: ${resourceId}`);
    }
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
};

export const getProductBySubjectDID = async (subjectDID) => {
  try {
    const product = await Product.findOne({ subjectDID });
    if (!product) {
      throw new Error(`No product found with subjectDID: ${subjectDID}`);
    }
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
};
export const getProductsByIssuerDID = async (issuerDID) => {
  try {
    if (!issuerDID) {
      throw new Error('Issuer DID is required');
    }

    // Query the database for products with matching issuerDID
    const products = await Product.find({ issuerDID })
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JavaScript objects for better performance

    if (!products || products.length === 0) {
      return {
        success: true,
        message: 'No products found for this issuer',
        data: []
      };
    }

    return  products;
  

  } catch (error) {
    console.error('Error fetching products by issuerDID:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

export const getProductsByRecipientDID = async (recipientDID) => {
  try {
    if (!recipientDID) {
      throw new Error('Recipient DID is required');
    }

    // Query the database for products with matching recipientDID
    const products = await Product.find({ recipientDID })
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JavaScript objects for better performance

    if (!products || products.length === 0) {
      return {
        success: true,
        message: 'No products found for this recipient',
        data: []
      };
    }

    return products;

  } catch (error) {
    console.error('Error fetching products by recipientDID:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

export const updateProduct = async (productId, updateData) => {
  try {
    const product = await Product.findOneAndUpdate(
      { productId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error(`Failed to update product: ${error.message}`);
  }
};