import { createDID , createSubjectDID} from "../services/cheqdService.js";
import axios from 'axios';
import { cheqdStudioApiUrl, cheqdApiKey } from '../config.js';
import { Company } from '../models/Company.js';
import { ProductCredential } from '../models/ProductCredential.js';

const createDIDHandler = async (req, res) => {
  try {
    const { companyDetails } = req.body;
    
    if (!companyDetails) {
      return res.status(400).json({ error: 'Company details are required' });
    }

    // Create DID
    const result = await createDID(companyDetails.name, companyDetails.name);
    const did = result.issuer.did;

    // Create resource JSON
    const resourceJson = companyDetails

    // Convert to base64
    const jsonString = JSON.stringify(resourceJson);
    const base64Encoded = Buffer.from(jsonString).toString('base64');

    // Create resource on cheqd
    const resourceResponse = await axios.post(
      `${cheqdStudioApiUrl}/resource/create/${did}`,
      {
        data: base64Encoded,
        encoding: 'base64',
        name: `${companyDetails.name}_Resource`,
        type: 'TextDocument'
      },
      {
        headers: {
          'x-api-key': cheqdApiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log("companyDetails*****************************", companyDetails);
    // Store in MongoDB
    const company = new Company({
      did,
      ...companyDetails,
      role: companyDetails.role, // Explicitly store the role field
      resourceId: resourceResponse.data.resource.resourceId
    });
    await company.save();

    res.json({
      did,
      resourceId: resourceResponse.data.resourceId,
      companyDetails
    });
  } catch (error) {
    console.error('DID creation error:', error);
    res.status(500).json({ 
      error: error.response?.data?.message || error.message || 'Failed to create DID'
    });
  }
};

const createSubjectDIDHandler = async(req, res) => {
  try {
    const { productDetails } = req.body;
    const issuerDID = 'did:cheqd:testnet:b379d4dc-c6d6-490d-8fca-52b92a574438';
    console.log("-----------------------------------SubjectDID--------------------------------", productDetails);

    if (!productDetails || !issuerDID) {
      return res.status(400).json({ error: 'Product details and issuer DID are required' });
    }

    // Check if this is an edit operation
    const isEdit = productDetails.isEdit || false;
    
    console.log("**********************IssuerId", issuerDID);
    // Create DID for the product
    const result = await createSubjectDID(productDetails.productName);
    const subjectDID = result.did;

    // Create resource JSON
    const resourceJson = {
      ...productDetails,
      issuerDID,
      subjectDID,
      timestamp: new Date().toISOString()
    };

    // Convert to base64
    const jsonString = JSON.stringify(resourceJson);
    const base64Encoded = Buffer.from(jsonString).toString('base64');

    // Create resource on cheqd
    const resourceResponse = await axios.post(
      `${cheqdStudioApiUrl}/resource/create/${issuerDID}`,
      {
        data: base64Encoded,
        encoding: 'base64',
        name: `${productDetails.productName}_Resource`,
        type: 'TextDocument'
      },
      {
        headers: {
          'x-api-key': cheqdApiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // Only create a new ProductCredential if this is not an edit operation
    if (!isEdit) {
      // Check if a ProductCredential with this productId already exists
      let existingCredential = await ProductCredential.findOne({ productId: productDetails.productId });
      
      if (!existingCredential) {
        // Only create a new entry if one doesn't exist
        const productCredential = new ProductCredential({
          productName: productDetails.productName,
          productId: productDetails.productId,
          issuerDID,
          recipientDID: productDetails.recipientDID,
          resourceId: resourceResponse.data.resource.resourceId
        });
        await productCredential.save();
      }
    }

    res.json({
      subjectDID,
      resourceId: resourceResponse.data.resource.resourceId,
      productDetails
    });
  } catch (error) {
    console.error('Subject DID creation error:', error);
    res.status(500).json({ 
      error: error.response?.data?.message || error.message || 'Failed to create Subject DID'
    });
  }
};

export const verifyDIDHandler = async (req, res) => {
  try {
    const { did } = req.body;
    console.log("did", did);
    if (!did) {
      return res.status(400).json({ error: 'DID is required' });
    }

    const response = await axios.get(`${cheqdStudioApiUrl}/did/search/${did}`, {
      headers: {
        'x-api-key': cheqdApiKey,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('DID verification error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to verify DID'
    });
  }
};

const getPotentialRecipients = async (req, res) => {
  try {
    const { role } = req.query;
    console.log("Role Appear in the backend :", role);
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    

    // Find companies with the target role
    const recipients = await Company.find({ role: role }).select('did name');
    
    res.json(recipients);
  } catch (error) {
    console.error('Error fetching potential recipients:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch potential recipients'
    });
  }
};

export { createDIDHandler, createSubjectDIDHandler, getPotentialRecipients };