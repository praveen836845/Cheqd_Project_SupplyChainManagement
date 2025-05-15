import { createDID } from "../services/cheqdService.js";
import axios from 'axios';
import { cheqdStudioApiUrl, cheqdApiKey } from '../config.js';
import { Company } from '../models/Company.js';

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

    // Store in MongoDB
    const company = new Company({
      did,
      ...companyDetails,
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

export { createDIDHandler };