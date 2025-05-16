import axios from 'axios';
import { cheqdStudioApiUrl, cheqdApiKey } from '../config.js';
import { v4 as uuidv4 } from 'uuid';
import * as ed from '@noble/ed25519';
import bs58 from 'bs58';
import Product from '../models/Product.js';
import FormData from 'form-data';
import { createProduct } from './productService.js';

// Load Pinata credentials from environment
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;

// Utility to convert hex to base64url
const hexToBase64url = (hex) => {
  const buffer = Buffer.from(hex, 'hex');
  return buffer.toString('base64').replace('+', '-').replace('/', '_').replace(/=+$/, '');
};

// Utility to encode bytes with Multibase (base58-btc with 'z' prefix)
const toMultibaseBase58Btc = (bytes) => {
  // Ensure bytes is a Buffer
  const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  console.log('Bytes to encode (hex):', buffer.toString('hex'));
  const base58Encoded = bs58.encode(buffer);
  console.log('Base58-btc encoded:', base58Encoded);
  return `z${base58Encoded}`; // Multibase prefix 'z' for base58-btc
};

// Utility to prepend multicodec prefix and encode as Multibase base58-btc
const encodeDidKey = (publicKey, multicodecValue) => {
  console.log('Encoding did:key with public key (hex):', publicKey.toString('hex'));
  console.log('Multicodec value:', multicodecValue.toString(16));

  // Validate public key length
  const expectedLength = multicodecValue === 0xed ? 32 : -1; // Ed25519 public key length
  if (publicKey.length !== expectedLength) {
    throw new Error(`Invalid public key length: expected ${expectedLength} bytes, got ${publicKey.length}`);
  }

  // Prepend multicodec value (0xed for Ed25519)
  // Multicodec values are varint-encoded; 0xed is a single byte
  const multicodecPrefix = Buffer.from([multicodecValue]);
  const combined = Buffer.concat([multicodecPrefix, publicKey]);
  console.log('Combined bytes (hex):', combined.toString('hex'));

  // Encode as Multibase base58-btc
  return `did:key:${toMultibaseBase58Btc(combined)}`;
};

const createKey = async () => {
  const url = `${cheqdStudioApiUrl}/key/create`;
  const payload = { type: 'Ed25519' };
  const headers = {
    'x-api-key': cheqdApiKey,
    'Content-Type': 'application/json'
  };

  console.log('Creating key:', { url, payload, headers: { ...headers, 'x-api-key': 'REDACTED' } });

  try {
    const response = await axios.post(url, payload, { headers });
    console.log('Key creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Key creation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw new Error(`Failed to create key: ${error.response?.data?.message || error.message}`);
  }
};

// Function to create a did:key DID for the subject  
const createKeyDID = async (identifier) => {
  try {
    console.log('Starting did:key creation for identifier:', identifier);
    // Generate a new Ed25519 key pair
    const privateKey = ed.utils.randomPrivateKey();
    const publicKey = await ed.getPublicKeyAsync(privateKey);
    console.log('Generated Ed25519 public key (hex):', publicKey.toString('hex'));

    // Encode the public key as a did:key DID (multicodec 0xed for Ed25519)
    const did = encodeDidKey(publicKey, 0xed);

    console.log('Created did:key:', did);
    return { did, identifier };
  } catch (error) {
    console.error('did:key creation error:', {
      message: error.message
    });
    throw new Error(`Failed to create did:key: ${error.message}`);
  }
};

const createSubjectDID = async (subjectIdentifier) => {
  try {
      // Create only the subject DID
      const subjectResult = await createKeyDID(subjectIdentifier);
      return subjectResult;
  } catch (error) {
      console.error('DID creation error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
      });
      throw new Error(`Failed to create DID: ${error.response?.data?.message || error.message}`);
  }
};

const createDID = async (issuerIdentifier, subjectIdentifier) => {
  try {
    // Helper function to create a single did:cheqd DID (for issuer)
    const createSingleDID = async (identifier, type) => {
      console.log(`Starting ${type} DID creation for identifier:`, identifier);
      const keyResponse = await createKey();
      const publicKeyHex = keyResponse.publicKeyHex;
      console.log(`${type} public key hex:`, publicKeyHex);

      const uuid = uuidv4();
      const did = `did:cheqd:testnet:${uuid}`;

      const publicKeyJwk = {
        crv: 'Ed25519',
        kty: 'OKP',
        x: hexToBase64url(publicKeyHex)
      };

      const didDocument = {
        id: did,
        controller: [did],
        verificationMethod: [
          {
            id: `${did}#key-1`,
            type: 'JsonWebKey2020',
            controller: did,
            publicKeyJwk: publicKeyJwk
          }
        ],
        authentication: [`${did}#key-1`]
      };

      const url = `${cheqdStudioApiUrl}/did/create`;
      const payload = {
        didDocument: didDocument,
        network: 'testnet',
        identifierFormatType: 'uuid',
        options: {
          key: publicKeyHex,
          verificationMethodType: 'JsonWebKey2020'
        }
      };
      const headers = {
        'x-api-key': cheqdApiKey,
        'Content-Type': 'application/json'
      };

      console.log(`Creating ${type} DID:`, {
        url,
        payload: JSON.stringify(payload, null, 2),
        headers: { ...headers, 'x-api-key': 'REDACTED' }
      });

      const response = await axios.post(url, payload, { headers });
      console.log(`${type} DID creation response:`, response.data);
      return { ...response.data, identifier };
    };

    // Create Issuer DID (did:cheqd)
    const issuerResult = await createSingleDID(issuerIdentifier, 'Issuer');
    // Create Subject DID (did:key)
    // const subjectResult = await createKeyDID(subjectIdentifier);

    return {
      issuer: issuerResult,
      // subject: subjectResult ?? ""
    };
  } catch (error) {
    console.error('DID creation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw new Error(`Failed to create DIDs: ${error.response?.data?.message || error.message}`);
  }
};

// Function to upload VC to Pinata and get CID
const uploadToPinata = async (vc) => {
  if (!pinataApiKey || !pinataApiSecret) {
    throw new Error('Pinata API credentials are missing in environment variables');
  }

  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const headers = {
    'pinata_api_key': pinataApiKey,
    'pinata_secret_api_key': pinataApiSecret
  };

  try {
    // Convert the VC JSON to a string and then to a Blob
    const vcString = JSON.stringify(vc);
    const blob = new Blob([vcString], { type: 'application/json' });
    // Create a File object from the Blob
    const file = new File([blob], `vc-${Date.now()}.json`, { type: 'application/json' });

    // Create FormData and append the file
    const data = new FormData();
    data.append('file', file);

    console.log('Uploading VC to Pinata:', {
      url,
      headers: { ...headers, 'pinata_api_key': 'REDACTED', 'pinata_secret_api_key': 'REDACTED' }
    });

    const response = await axios.post(url, data, {
      headers: {
        ...headers,
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`
      }
    });

    console.log('Pinata upload response:', response.data);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Pinata upload error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw new Error(`Failed to upload VC to Pinata: ${error.response?.data?.message || error.message}`);
  }
};

const issueVC = async (issuerDid, subjectDid, credentialData) => {
  console.log('Starting VC issuance:', { issuerDid, subjectDid, credentialData });

  // Generate a unique resourceId
  const resourceId = uuidv4();

  // Construct the payload as per cheqd API requirements
  const payload = {
    issuerDid: issuerDid,
    subjectDid: subjectDid,
    attributes: {
      ...credentialData,
      resourceId // Include resourceId in the VC attributes
    },
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://schema.org"],
    type: ["VerifiableCredential", "SupplyChainCredential"],
    format: "jwt"
  };

  console.log('VC issuance payload:', payload);

  const url = `${cheqdStudioApiUrl}/credential/issue`;
  const headers = {
    'x-api-key': cheqdApiKey,
    'Content-Type': 'application/json'
  };

  try {
    // Issue the VC
    const response = await axios.post(url, payload, { headers });
    console.log('VC issuance response:', response.data);

    // Check if this is an edit operation
    const isEdit = credentialData.isEdit || false;
    let savedProduct;

    if (isEdit) {
      // This is an update to an existing product
      console.log('Updating existing product with ID:', credentialData.productId);
      
      // Find the existing product
      const existingProduct = await Product.findOne({ productId: credentialData.productId });
      
      if (!existingProduct) {
        throw new Error(`Product with ID ${credentialData.productId} not found for update`);
      }
      
      // Create a new entry in the vcDataArray or initialize it if it doesn't exist
      if (!existingProduct.vcDataArray) {
        existingProduct.vcDataArray = [];
      }
      
      // Add the new VC to the array
      existingProduct.vcDataArray.push({
        issuerDID: issuerDid,
        recipientDID: credentialData.recipientDID,
        vcData: response.data,
        timestamp: new Date()
      });
      
      // Update the main fields
      existingProduct.recipientDID = credentialData.recipientDID;
      existingProduct.vcData = response.data; // Update the latest VC data
      
      // Save the updated product
      savedProduct = await existingProduct.save();
      console.log('Product updated in database:', savedProduct._id);
    } else {
      // This is a new product
      // Prepare product data for database storage
      const productData = {
        productId: credentialData.productId,
        productName: credentialData.productName,
        batchNumber: credentialData.batchNumber,
        description: credentialData.description || '',
        handlingDate: new Date(credentialData.handlingDate),
        certificates: credentialData.certificates || [],
        subjectDID: subjectDid,
        issuerDID: issuerDid,
        recipientDID: credentialData.recipientDID,
        resourceId: resourceId,
        status: 'active',
        vcData: response.data, // Store the complete VC data
        vcDataArray: [{
          issuerDID: issuerDid,
          recipientDID: credentialData.recipientDID,
          vcData: response.data,
          timestamp: new Date()
        }]
      };

      console.log('Preparing to save new product data:', productData);

      // Check if a product with this ID already exists
      const existingProduct = await Product.findOne({ productId: credentialData.productId });
      
      if (existingProduct) {
        throw new Error(`Product with ID ${credentialData.productId} already exists. Use edit mode to update.`);
      }
      
      // Save to database
      const product = new Product(productData);
      savedProduct = await product.save();
      console.log('New product saved to database:', savedProduct._id);
    }

    // Return both the VC and saved product
    return {
      vc: response.data,
      product: savedProduct
    };
  } catch (error) {
    console.error('Error in issueVC:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Throw a more detailed error
    if (error.response?.data) {
      throw new Error(`Failed to issue VC: ${JSON.stringify(error.response.data)}`);
    } else {
      throw new Error(`Failed to issue VC: ${error.message}`);
    }
  }
};

const verifyVC = async (vc) => {
  const url = `${cheqdStudioApiUrl}/credential/verify`;
  const headers = {
    'x-api-key': cheqdApiKey,
    'Content-Type': 'application/json'
  };

  console.log('Verifying VC:', { url, payload: vc, headers: { ...headers, 'x-api-key': 'REDACTED' } });

  try {
    const response = await axios.post(url, vc, { headers });
    console.log('VC verification response:', response.data);
    return response.data.isValid;
  } catch (error) {
    console.error('VC verification error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw new Error(`Failed to verify VC: ${error.response?.data?.message || error.message}`);
  }
};

const checkTrustRegistry = async (issuerDid) => {
  const url = `${cheqdStudioApiUrl}/trust-registry/issuers`;
  const headers = {
    'x-api-key': cheqdApiKey,
    'Content-Type': 'application/json'
  };

  console.log('Checking trust registry:', { url, headers: { ...headers, 'x-api-key': 'REDACTED' } });

  try {
    const response = await axios.get(url, { headers });
    console.log('Trust registry response:', response.data);
    return response.data.includes(issuerDid);
  } catch (error) {
    console.error('Trust registry error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return false;
  }
};

export { createDID, issueVC, verifyVC, checkTrustRegistry, createKey , createSubjectDID };