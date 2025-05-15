import { Credential, ProductHistory, DashboardMetrics, UserRole } from '../types';

// Mock credentials data
export const mockCredentials: Record<string, Credential[]> = {
  manufacturer: [
    {
      id: "vc-1",
      type: ["VerifiableCredential", "ManufacturerCredential"],
      issuer: "did:cheqd:testnet:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
      issuanceDate: "2025-03-15T10:00:00Z",
      expirationDate: "2026-03-15T10:00:00Z",
      credentialSubject: {
        id: "did:cheqd:testnet:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
        productId: "PROD-8827349",
        productName: "Premium Smartphone XYZ20",
        batchNumber: "BA-2025-03-15-1",
        description: "High-end smartphone with advanced security features",
        handlingDate: "2025-03-15T10:00:00Z",
        specifications: {
          manufacturer: "TechFabs Inc.",
          manufactureLocation: "San Francisco",
          certifications: ["ISO9001", "SecureBuild"]
        }
      },
      proof: {
        type: "Ed25519Signature2020",
        created: "2025-03-15T10:05:00Z",
        verificationMethod: "did:cheqd:testnet:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "zJrTt15fL15LeQK5Y7LL3o4hAdck9dPQ9tkPp9o2B6YYJhua2qKdxQRGUZ7nJHAqi9h5LCAwF8An6iqLfBfDEFTgN"
      }
    },
    {
      id: "vc-2",
      type: ["VerifiableCredential", "ManufacturerCredential", "OrganicCertification"],
      issuer: "did:cheqd:testnet:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
      issuanceDate: "2025-04-01T09:30:00Z",
      expirationDate: "2026-04-01T09:30:00Z",
      credentialSubject: {
        id: "did:cheqd:testnet:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
        productId: "PROD-7726651",
        productName: "Organic Almond Milk",
        batchNumber: "BA-2025-04-01-3",
        description: "100% organic almond milk from sustainable sources",
        handlingDate: "2025-04-01T09:30:00Z",
        certifications: ["OrganicUSDA", "SustainableHarvest"]
      },
      proof: {
        type: "Ed25519Signature2020",
        created: "2025-04-01T09:35:00Z",
        verificationMethod: "did:cheqd:testnet:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "zS9KAiYNTmrkPT5naQWmpELnjZp4K8JBWLTfDrmhaqrV4ym2R18MTVqUMNVee2a7xBQjcvBzMhK6He8gM7npWZcfm"
      }
    }
  ],
  distributor: [
    {
      id: "vc-3",
      type: ["VerifiableCredential", "DistributorCredential"],
      issuer: "did:cheqd:testnet:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
      issuanceDate: "2025-03-17T14:20:00Z",
      credentialSubject: {
        id: "did:cheqd:testnet:z6MkwJSaEMnE4u7CtjPmTaRyxj2EwYNcBczt2xP8HPoCYZSx",
        productId: "PROD-8827349",
        productName: "Premium Smartphone XYZ20",
        handlingDate: "2025-03-17T14:20:00Z",
        distributionDetails: {
          receivedFrom: "TechFabs Inc.",
          receivedDate: "2025-03-16T11:30:00Z",
          destinationHub: "Central Distribution Center"
        }
      },
      proof: {
        type: "Ed25519Signature2020",
        created: "2025-03-17T14:25:00Z",
        verificationMethod: "did:cheqd:testnet:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "zFVqCVGmp9YnQZCzCqsR7dXmekwvET6QYJ7XuJxkH8MuVR8o4aw2xsNSDGLnJgghQfBMZQY9C7xvcFXKiGuLmZkuZ"
      }
    },
    {
      id: "vc-4",
      type: ["VerifiableCredential", "DistributorCredential", "ColdChainVerified"],
      issuer: "did:cheqd:testnet:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
      issuanceDate: "2025-04-03T10:15:00Z",
      credentialSubject: {
        id: "did:cheqd:testnet:z6MkwJSaEMnE4u7CtjPmTaRyxj2EwYNcBczt2xP8HPoCYZSx",
        productId: "PROD-7726651",
        productName: "Organic Almond Milk",
        handlingDate: "2025-04-03T10:15:00Z",
        temperatureLog: {
          min: "1.2C",
          max: "3.5C",
          averageTemp: "2.3C",
          readingFrequency: "Hourly"
        }
      },
      status: {
        revoked: true,
        revocationDate: "2025-04-05T16:30:00Z",
        revocationReason: "Temperature control failure during transport"
      },
      proof: {
        type: "Ed25519Signature2020",
        created: "2025-04-03T10:20:00Z",
        verificationMethod: "did:cheqd:testnet:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "zATehVuJCsQgJQnUrrj5zzMGJ4eV9YQ9qJGN9g6rPYEHLmKXv1PkZvZVqKWWjrcKdPm6M8LNxS1ZYt9Tu94J8F2hA"
      }
    }
  ],
  logistics: [
    {
      id: "vc-5",
      type: ["VerifiableCredential", "LogisticsCredential"],
      issuer: "did:cheqd:testnet:z6MkwJSaEMnE4u7CtjPmTaRyxj2EwYNcBczt2xP8HPoCYZSx",
      issuanceDate: "2025-03-18T09:45:00Z",
      credentialSubject: {
        id: "did:cheqd:testnet:z6MknGc3ocHs3zdPiJbnaaqDi5r1W1wFxS9SJLJtVwbUhmGh",
        productId: "PROD-8827349",
        productName: "Premium Smartphone XYZ20",
        handlingDate: "2025-03-18T09:45:00Z",
        shippingDetails: {
          trackingId: "SHP-39284756",
          departureLocation: "Central Distribution Center",
          destinationLocation: "CGR Retail Store #127",
          estimatedDelivery: "2025-03-19T14:00:00Z",
          transportMode: "Road"
        }
      },
      proof: {
        type: "Ed25519Signature2020",
        created: "2025-03-18T09:50:00Z",
        verificationMethod: "did:cheqd:testnet:z6MkwJSaEMnE4u7CtjPmTaRyxj2EwYNcBczt2xP8HPoCYZSx#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "z9VfAdpxrJxdgrdMbuNmqn6Su9kLinxVJXBtvUhyUiujLGTKbYTTQNBKECqVcaFnqyuwRQZ7x6QMALtdWJTznwxnK"
      }
    }
  ],
  retailer: [
    {
      id: "vc-6",
      type: ["VerifiableCredential", "RetailerCredential"],
      issuer: "did:cheqd:testnet:z6MknGc3ocHs3zdPiJbnaaqDi5r1W1wFxS9SJLJtVwbUhmGh",
      issuanceDate: "2025-03-19T15:10:00Z",
      credentialSubject: {
        id: "did:cheqd:testnet:z6MktcwkUDQGNJtjn9pxULxCNg6xRx1vKs7vEqehvMVzQUbm",
        productId: "PROD-8827349",
        productName: "Premium Smartphone XYZ20",
        handlingDate: "2025-03-19T15:10:00Z",
        retailDetails: {
          storeId: "STORE-127",
          storeLocation: "San Diego",
          receivedCondition: "Excellent",
          retailPrice: "$999.99"
        }
      },
      proof: {
        type: "Ed25519Signature2020",
        created: "2025-03-19T15:15:00Z",
        verificationMethod: "did:cheqd:testnet:z6MknGc3ocHs3zdPiJbnaaqDi5r1W1wFxS9SJLJtVwbUhmGh#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "zL9JJXaDgFdQF6LXpqqeAPQuyukDKSCsQMQB2CuHuZpgme2M9wRwgPrJHMmQyJ5aqKRKvKq3xQZ4JihXMkJ77H41g"
      }
    }
  ],
  consumer: [],
  auditor: []
};

// Mock product history
export const mockProductHistories: ProductHistory[] = [
  {
    productId: "PROD-8827349",
    productName: "Premium Smartphone XYZ20",
    manufacturerDID: "did:cheqd:testnet:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    manufacturerName: "TechFabs Inc.",
    journey: [
      {
        role: "manufacturer",
        organization: "TechFabs Inc.",
        did: "did:cheqd:testnet:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        date: "2025-03-15T10:00:00Z",
        credentialId: "vc-1",
        additionalInfo: {
          location: "San Francisco",
          certifications: ["ISO9001", "SecureBuild"]
        }
      },
      {
        role: "distributor",
        organization: "GDN LLC",
        did: "did:cheqd:testnet:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
        date: "2025-03-17T14:20:00Z",
        credentialId: "vc-3",
        additionalInfo: {
          hub: "Central Distribution Center"
        }
      },
      {
        role: "logistics",
        organization: "FastTrack Corp.",
        did: "did:cheqd:testnet:z6MkwJSaEMnE4u7CtjPmTaRyxj2EwYNcBczt2xP8HPoCYZSx",
        date: "2025-03-18T09:45:00Z",
        credentialId: "vc-5",
        additionalInfo: {
          trackingId: "SHP-39284756",
          transportMode: "Road"
        }
      },
      {
        role: "retailer",
        organization: "CGR Stores",
        did: "did:cheqd:testnet:z6MknGc3ocHs3zdPiJbnaaqDi5r1W1wFxS9SJLJtVwbUhmGh",
        date: "2025-03-19T15:10:00Z",
        credentialId: "vc-6",
        additionalInfo: {
          storeLocation: "San Diego"
        }
      }
    ],
    certificates: [
      {
        type: "Manufacturer Certification",
        issuanceDate: "2025-03-15T10:00:00Z",
        issuer: "TechFabs Inc.",
        valid: true
      },
      {
        type: "Security Certificate",
        issuanceDate: "2025-03-15T10:00:00Z",
        issuer: "SecureBuild Authority",
        valid: true
      }
    ]
  },
  {
    productId: "PROD-7726651",
    productName: "Organic Almond Milk",
    manufacturerDID: "did:cheqd:testnet:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    manufacturerName: "TechFabs Inc.",
    journey: [
      {
        role: "manufacturer",
        organization: "TechFabs Inc.",
        did: "did:cheqd:testnet:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        date: "2025-04-01T09:30:00Z",
        credentialId: "vc-2",
        additionalInfo: {
          certifications: ["OrganicUSDA", "SustainableHarvest"]
        }
      },
      {
        role: "distributor",
        organization: "GDN LLC",
        did: "did:cheqd:testnet:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
        date: "2025-04-03T10:15:00Z",
        credentialId: "vc-4",
        additionalInfo: {
          temperatureControlled: true,
          averageTemp: "2.3C"
        }
      }
    ],
    certificates: [
      {
        type: "Organic Certification",
        issuanceDate: "2025-04-01T09:30:00Z",
        issuer: "USDA Organic",
        valid: true
      },
      {
        type: "Cold Chain Certificate",
        issuanceDate: "2025-04-03T10:15:00Z",
        issuer: "GDN LLC",
        valid: false
      }
    ]
  }
];

// Mock dashboard metrics based on user role
export const mockDashboardMetrics: Record<UserRole, DashboardMetrics> = {
  manufacturer: {
    totalVCsIssued: 24,
    incomingVCs: 0,
    verifiedProducts: 24,
    recentActivity: [
      {
        date: "2025-04-01T09:30:00Z",
        action: "Issued VC for Organic Almond Milk",
        productId: "PROD-7726651",
        counterpartyOrg: "GDN LLC"
      },
      {
        date: "2025-03-15T10:00:00Z",
        action: "Issued VC for Premium Smartphone XYZ20",
        productId: "PROD-8827349",
        counterpartyOrg: "GDN LLC"
      }
    ]
  },
  distributor: {
    totalVCsIssued: 18,
    incomingVCs: 26,
    verifiedProducts: 42,
    recentActivity: [
      {
        date: "2025-04-03T10:15:00Z",
        action: "Issued VC for Organic Almond Milk",
        productId: "PROD-7726651",
        counterpartyOrg: "FastTrack Corp."
      },
      {
        date: "2025-04-01T12:45:00Z",
        action: "Received VC for Organic Almond Milk",
        productId: "PROD-7726651",
        counterpartyOrg: "TechFabs Inc."
      }
    ]
  },
  logistics: {
    totalVCsIssued: 32,
    incomingVCs: 38,
    verifiedProducts: 38,
    recentActivity: [
      {
        date: "2025-03-18T09:45:00Z",
        action: "Issued VC for Premium Smartphone XYZ20",
        productId: "PROD-8827349",
        counterpartyOrg: "CGR Stores"
      },
      {
        date: "2025-03-17T15:30:00Z",
        action: "Received VC for Premium Smartphone XYZ20",
        productId: "PROD-8827349",
        counterpartyOrg: "GDN LLC"
      }
    ]
  },
  retailer: {
    totalVCsIssued: 15,
    incomingVCs: 42,
    verifiedProducts: 42,
    recentActivity: [
      {
        date: "2025-03-19T15:10:00Z",
        action: "Issued VC for Premium Smartphone XYZ20",
        productId: "PROD-8827349",
        counterpartyOrg: "Consumer"
      },
      {
        date: "2025-03-18T16:20:00Z",
        action: "Received VC for Premium Smartphone XYZ20",
        productId: "PROD-8827349",
        counterpartyOrg: "FastTrack Corp."
      }
    ]
  },
  consumer: {
    totalVCsIssued: 0,
    incomingVCs: 8,
    verifiedProducts: 8,
    recentActivity: [
      {
        date: "2025-03-19T18:30:00Z",
        action: "Received VC for Premium Smartphone XYZ20",
        productId: "PROD-8827349",
        counterpartyOrg: "CGR Stores"
      }
    ]
  },
  auditor: {
    totalVCsIssued: 0,
    incomingVCs: 0,
    verifiedProducts: 115,
    recentActivity: [
      {
        date: "2025-04-05T16:30:00Z",
        action: "Detected Revoked VC for Organic Almond Milk",
        productId: "PROD-7726651",
        counterpartyOrg: "GDN LLC"
      },
      {
        date: "2025-03-20T11:15:00Z",
        action: "Verified Full Chain for Premium Smartphone XYZ20",
        productId: "PROD-8827349",
        counterpartyOrg: "Multiple"
      }
    ]
  }
};