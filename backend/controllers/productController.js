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
