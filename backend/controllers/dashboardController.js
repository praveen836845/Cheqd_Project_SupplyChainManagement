import { getMetricsByRole } from '../services/dashboardService.js';

const getDashboardMetricsHandler = async (req, res) => {
  try {
    const { role } = req.query;
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    
    const metrics = await getMetricsByRole(role);
    res.json(metrics);
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: error.message });
  }
};

export { getDashboardMetricsHandler }; 