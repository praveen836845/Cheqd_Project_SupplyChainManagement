import { 
  getProductsByIssuerDID, 
  getProductsByRecipientDID 
} from '../services/productService.js';
import { verifyVC } from '../services/cheqdService.js';

export const getProductsForUser = async (req, res) => {
  try {
    const { userDID, role } = req.user; // Assuming user info is attached by auth middleware
    let products = [];

    if (role === 'manufacturer') {
      // For manufacturers, show products they issued
      products = await getProductsByIssuerDID(userDID);
    } else {
      // For other roles (distributor, logistics, retailer), show products where they are recipients
      products = await getProductsByRecipientDID(userDID);
    }

    // Format the response
    const formattedProducts = products.map(product => ({
      id: product._id,
      productId: product.productId,
      productName: product.productName,
      batchNumber: product.batchNumber,
      handlingDate: product.handlingDate,
      status: product.status,
      certificates: product.certificates,
      recipientDID: product.recipientDID,
      resourceId: product.resourceId,
      jwt: product.vcData.proof?.jwt || null // Extract JWT for verification
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyProduct = async (req, res) => {
  try {
    const { jwt } = req.body;
    
    if (!jwt) {
      return res.status(400).json({ error: 'JWT is required' });
    }

    // Verify the VC using cheqd service
    const verificationResult = await verifyVC(jwt);

    res.json({
      verified: verificationResult.verified,
      issuer: verificationResult.issuer
    });
  } catch (error) {
    console.error('Verify product error:', error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const
  getProductTimeline =  async (req, res) => {
    try {
      const { productId } = req.params;
      
      // Get product data
      const product = await Product.findOne({ productId });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Get timeline data
      const timeline = await Activity.find({ productId })
        .sort({ date: -1 })
        .select('action date counterpartyOrg');

      res.json({
        product: {
          productId: product.productId,
          productName: product.productName,
          issuer: product.issuer,
          issuerRole: product.issuerRole,
          date: product.date,
          certificateCount: product.certificateCount,
          status: product.status
        },
        timeline
      });
    } catch (error) {
      console.error('Error fetching product timeline:', error);
      res.status(500).json({ message: 'Failed to fetch product timeline' });
    }
  }
