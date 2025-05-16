export type UserRole = 'manufacturer' | 'distributor' | 'logistics' | 'retailer' | 'consumer' | 'auditor';

export interface User {
  id: string;
  did: string;
  role: UserRole;
  name: string;
  organization?: string;
}

export interface ProductHistory {
  _id?: string;
  productId: string;
  productName: string;
  issuer: string;
  issuerRole: UserRole;
  date: string;
  certificateCount: number;
  status: 'valid' | 'invalid';
  description?: string;
  jwt?: string;
  resourceId?: string;
}

export interface Activity {
  action: string;
  counterpartyOrg: string;
  date: string;
}

export interface DashboardMetrics {
  totalVCsIssued: number;
  verifiedProducts: number;
  incomingVCs: number;
  recentActivity: Activity[];
  products: ProductHistory[];
}

export interface SignerInfo {
  id: string;
  type: string;
  controller: string;
  publicKeyJwk: {
    crv: string;
    kty: string;
    x: string;
  };
}

export interface Credential {
  id: string;
  type: string[];
  issuanceDate: string;
  expirationDate?: string;
  issuer: string;
  newIssuer?: string;
  signerInfo?: SignerInfo;
  credentialSubject: {
    productId: string;
    productName: string;
    batchNumber?: string;
    handlingDate: string;
    description?: string;
  };
  status?: {
    revoked: boolean;
    revocationDate?: string;
    revocationReason?: string;
  };
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
  };
} 