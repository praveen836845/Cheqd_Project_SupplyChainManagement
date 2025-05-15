// Mock data for demonstration
const mockMetrics = {
  manufacturer: {
    totalVCsIssued: 156,
    verifiedProducts: 142,
    incomingVCs: 0,
    recentActivity: [
      {
        action: 'Issued Organic Certificate',
        counterpartyOrg: 'Organic Farms Co.',
        date: new Date().toISOString()
      },
      {
        action: 'Verified Product Quality',
        counterpartyOrg: 'Quality Labs Inc.',
        date: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  },
  distributor: {
    totalVCsIssued: 89,
    verifiedProducts: 75,
    incomingVCs: 12,
    recentActivity: [
      {
        action: 'Received Product Batch',
        counterpartyOrg: 'Manufacturer XYZ',
        date: new Date().toISOString()
      },
      {
        action: 'Issued Transport Certificate',
        counterpartyOrg: 'Logistics Partner',
        date: new Date(Date.now() - 7200000).toISOString()
      }
    ]
  },
  logistics: {
    totalVCsIssued: 45,
    verifiedProducts: 38,
    incomingVCs: 7,
    recentActivity: [
      {
        action: 'Temperature Check Passed',
        counterpartyOrg: 'Cold Chain Monitor',
        date: new Date().toISOString()
      },
      {
        action: 'Route Optimization Complete',
        counterpartyOrg: 'GPS System',
        date: new Date(Date.now() - 10800000).toISOString()
      }
    ]
  },
  retailer: {
    totalVCsIssued: 23,
    verifiedProducts: 20,
    incomingVCs: 3,
    recentActivity: [
      {
        action: 'Product Received',
        counterpartyOrg: 'Distributor ABC',
        date: new Date().toISOString()
      },
      {
        action: 'Quality Inspection Passed',
        counterpartyOrg: 'Store Manager',
        date: new Date(Date.now() - 14400000).toISOString()
      }
    ]
  }
};

const getMetricsByRole = async (role) => {
  // In a real application, this would fetch data from a database
  // For now, we'll return mock data based on the role
  const metrics = mockMetrics[role] || {
    totalVCsIssued: 0,
    verifiedProducts: 0,
    incomingVCs: 0,
    recentActivity: []
  };
  
  return metrics;
};

export { getMetricsByRole }; 