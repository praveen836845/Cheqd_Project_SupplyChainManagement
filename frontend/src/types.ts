export type UserRole = 'manufacturer' | 'distributor' | 'logistics' | 'retailer' | 'consumer' | 'auditor';

export interface User {
  id: string;
  did: string;
  role: UserRole;
  name: string;
  organization?: string;
}

export interface ProductHistory {
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

export interface Credential {
  id: string;
  type: string;
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  status: 'valid' | 'invalid' | 'expired' | 'revoked';
  subject: {
    id: string;
    type: string;
    [key: string]: any;
  };
  proof: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws: string;
  };
} 