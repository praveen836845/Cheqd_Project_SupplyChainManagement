export type UserRole = 'manufacturer' | 'distributor' | 'logistics' | 'retailer' | 'consumer' | 'auditor';

export interface User {
  id: string;
  did: string;
  role: UserRole;
  name: string;
  organization?: string;
}

export interface Credential {
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id: string;
    productId: string;
    productName: string;
    batchNumber?: string;
    description?: string;
    handlingDate: string;
    [key: string]: any;
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

export interface ProductHistory {
  productId: string;
  productName: string;
  manufacturerDID: string;
  manufacturerName: string;
  journey: {
    role: UserRole;
    organization: string;
    did: string;
    date: string;
    credentialId: string;
    additionalInfo?: Record<string, any>;
  }[];
  certificates: {
    type: string;
    issuanceDate: string;
    issuer: string;
    valid: boolean;
  }[];
}

export interface DashboardMetrics {
  totalVCsIssued: number;
  incomingVCs: number;
  verifiedProducts: number;
  recentActivity: {
    date: string;
    action: string;
    productId: string;
    counterpartyOrg: string;
  }[];
}

export interface Activity {
  action: string;
  date: string;
  counterpartyOrg: string;
}