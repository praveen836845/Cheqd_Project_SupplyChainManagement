import axios from 'axios';
import { cheqdStudioApiUrl, cheqdApiKey } from '../config.js';
import { v4 as uuidv4 } from 'uuid';
import * as ed from '@noble/ed25519';
import bs58 from 'bs58';
import FormData from 'form-data';

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

  // Construct the payload as per cheqd API requirements
  const payload = {
    issuerDid: issuerDid,
    subjectDid: subjectDid,
    attributes: credentialData,
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

  console.log('Issuing VC to cheqd API:', {
    url,
    payload,
    headers: { ...headers, 'x-api-key': 'REDACTED' }
  });

  try {
    const response = await axios.post(url, payload, { headers });
    console.log('VC issuance response:', response.data);

    // Return just the VC
    return {
      vc: response.data
    };
  } catch (error) {
    console.error('VC issuance error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw new Error(`Failed to issue VC: ${error.response?.data?.message || error.message}`);
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