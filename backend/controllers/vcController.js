import { issueVC, verifyVC, checkTrustRegistry } from '../services/cheqdService.js';
import { ProductCredential } from '../models/ProductCredential.js';

const issueVCHandler = async (req, res) => {
  try {
    const { issuerDid, subjectDid, credentialData } = req.body;
    
    // Issue VC
    const vc = await issueVC(issuerDid, subjectDid, credentialData);

    // Find and update the ProductCredential with VC data
    const productCredential = await ProductCredential.findOne({ 
      recipientDID: subjectDid 
    });

    if (!productCredential) {
      return res.status(404).json({ error: 'Product credential not found' });
    }

    // Update with VC data
    productCredential.vcData = vc;
    await productCredential.save();

    res.json({ vc });
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

export { issueVCHandler, verifyVCHandler };