import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileSignature, 
  ShieldCheck, 
  Activity,
  ArrowUpRight,
  Package,
  BarChart3,
  Loader2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/layout/Navigation';
import { getDashboardMetrics } from '../services/api';
import { DashboardMetrics, UserRole, ProductHistory } from '../types';
import ProductCard from '../components/shared/ProductCard';
import axios from 'axios';

// Mock data for fallback
const mockMetrics: Record<string, DashboardMetrics> = {
  manufacturer: {
    totalVCsIssued: 25,
    incomingVCs: 0,
    verifiedProducts: 15,
    recentActivity: [
      {
        date: new Date().toISOString(),
        action: 'Issued new product certificate',
        productId: 'PRD-001',
        counterpartyOrg: 'Quality Control'
      }
    ]
  },
  distributor: {
    totalVCsIssued: 12,
    incomingVCs: 8,
    verifiedProducts: 20,
    recentActivity: [
      {
        date: new Date().toISOString(),
        action: 'Received product shipment',
        productId: 'PRD-002',
        counterpartyOrg: 'Manufacturer Co.'
      }
    ]
  },
  logistics: {
    totalVCsIssued: 18,
    incomingVCs: 15,
    verifiedProducts: 30,
    recentActivity: [
      {
        date: new Date().toISOString(),
        action: 'Updated shipment status',
        productId: 'PRD-003',
        counterpartyOrg: 'Distributor Inc.'
      }
    ]
  },
  retailer: {
    totalVCsIssued: 10,
    incomingVCs: 20,
    verifiedProducts: 25,
    recentActivity: [
      {
        date: new Date().toISOString(),
        action: 'Received inventory',
        productId: 'PRD-004',
        counterpartyOrg: 'Logistics Co.'
      }
    ]
  },
  consumer: {
    totalVCsIssued: 0,
    incomingVCs: 5,
    verifiedProducts: 5,
    recentActivity: [
      {
        date: new Date().toISOString(),
        action: 'Verified product authenticity',
        productId: 'PRD-005',
        counterpartyOrg: 'Retail Store'
      }
    ]
  },
  auditor: {
    totalVCsIssued: 0,
    incomingVCs: 0,
    verifiedProducts: 50,
    recentActivity: [
      {
        date: new Date().toISOString(),
        action: 'Conducted audit',
        productId: 'PRD-006',
        counterpartyOrg: 'Manufacturer Co.'
      }
    ]
  }
};

// Mock product data
const mockProducts: ProductHistory[] = [
  {
    productId: 'PRD-001',
    productName: 'Organic Cotton T-Shirt',
    manufacturerDID: 'did:example:123',
    manufacturerName: 'EcoFabrics Inc.',
    issuer: 'EcoFabrics Inc.',
    issuerRole: 'manufacturer',
    date: new Date().toISOString(),
    certificateCount: 3,
    status: 'valid',
    journey: [],
    certificates: []
  },
  {
    productId: 'PRD-002',
    productName: 'Recycled Plastic Bottle',
    manufacturerDID: 'did:example:456',
    manufacturerName: 'GreenPlast Co.',
    issuer: 'GreenPlast Co.',
    issuerRole: 'manufacturer',
    date: new Date().toISOString(),
    certificateCount: 2,
    status: 'valid',
    journey: [],
    certificates: []
  }
];

const Dashboard: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'invalid'>('all');
  const [products, setProducts] = useState<ProductHistory[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  
  const fetchMetrics = async (showLoading = true) => {
    if (!currentUser?.role) return;
    
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await getDashboardMetrics(currentUser.role as UserRole);
      setMetrics(data);
      setIsOffline(false);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      // Use mock data on error
      setMetrics(mockMetrics[currentUser.role]);
      setIsOffline(true);
      setError('Dashboard metrics data is currently unavailable. Using offline data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProducts = async (showLoading = true) => {
    if (!currentUser?.role || !currentUser?.did) return;
     console.log("CurrentUser----------------------------------->",currentUser);
    if (showLoading) setProductsLoading(true);
    setProductsError(null);
    
    try {
      const response = await axios.post ('http://localhost:5000/api/productlist', {
        data: {
          role: currentUser.role,
          userDID: 'did:cheqd:testnet:b379d4dc-c6d6-490d-8fca-52b92a574438'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        // If response data is not in expected format
        setProducts([]);
        setProductsError('Product data is not in the expected format');
      }
      
    } catch (err) {
      console.error('Error fetching products:', err);
      // Use mock data on error
      setProducts(mockProducts);
      setProductsError('Product data is currently unavailable. Using offline data.');
    } finally {
      setProductsLoading(false);
    }
  };
  
  useEffect(() => {
    if (currentUser?.role) {
      fetchMetrics();
      fetchProducts();
    }
  }, [currentUser?.role, currentUser?.did]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetrics(false);
    fetchProducts(false);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/timeline/${productId}`);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg mb-4">Please log in to view the dashboard</p>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => fetchMetrics()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const issuableRoles = ['manufacturer', 'distributor', 'logistics', 'retailer'];
  const canIssueCredentials = currentUser && issuableRoles.includes(currentUser.role);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="md:ml-64 pt-6 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome back, {currentUser.name}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`inline-flex items-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  refreshing ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {canIssueCredentials && (
                <Link
                  to="/issue"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FileSignature className="h-4 w-4 mr-2" />
                  Issue New Credential
                </Link>
              )}
            </div>
          </div>
          
          <AnimatePresence>
            {isOffline && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  <p className="text-yellow-700">
                    {error}
                    <button
                      onClick={handleRefresh}
                      className="ml-2 text-yellow-700 underline hover:text-yellow-800"
                    >
                      Try again
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {metrics && (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div
                  custom={0}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                        <FileSignature className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-slate-500 truncate">
                            Total VCs Issued
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-slate-900">
                              {metrics.totalVCsIssued}
                            </div>
                            <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                              <TrendingUp className="h-4 w-4" />
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  custom={1}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                        <ShieldCheck className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-slate-500 truncate">
                            Verified Products
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-slate-900">
                              {metrics.verifiedProducts}
                            </div>
                            <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                              <TrendingUp className="h-4 w-4" />
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  custom={2}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-slate-500 truncate">
                            Incoming VCs
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-slate-900">
                              {metrics.incomingVCs}
                            </div>
                            <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                              <TrendingUp className="h-4 w-4" />
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  custom={3}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                        <BarChart3 className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-slate-500 truncate">
                            Recent Activity
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-slate-900">
                              {metrics.recentActivity.length}
                            </div>
                            <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                              <TrendingUp className="h-4 w-4" />
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Recent Activity</h2>
                  <div className="flex items-center text-sm text-slate-500">
                    <Clock className="h-4 w-4 mr-1" />
                    Last 24 hours
                  </div>
                </div>
                <div className="bg-white shadow rounded-lg divide-y divide-slate-200">
                  {metrics.recentActivity.length > 0 ? (
                    metrics.recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        custom={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <Package className="h-5 w-5 text-slate-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-slate-900">
                                {activity.action}
                              </p>
                              <div className="flex items-center mt-1">
                                <Users className="h-4 w-4 text-slate-400 mr-1" />
                                <p className="text-sm text-slate-500">
                                  {activity.counterpartyOrg}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-slate-500">
                              {formatDate(activity.date)}
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-slate-400 ml-2" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Package className="mx-auto h-12 w-12 text-slate-400" />
                      <p className="mt-2 text-sm text-slate-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Products Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Products</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 block w-full rounded-md border border-slate-300 shadow-sm py-2 px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search products..."
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          filterStatus === 'all'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterStatus('valid')}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          filterStatus === 'valid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Valid
                      </button>
                      <button
                        onClick={() => setFilterStatus('invalid')}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          filterStatus === 'invalid'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Invalid
                      </button>
                    </div>
                  </div>
                </div>

                {/* Products loading state */}
                {productsLoading ? (
                  <div className="flex justify-center items-center bg-white rounded-lg shadow p-8">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                    <p className="ml-3 text-slate-500">Loading products...</p>
                  </div>
                ) : (
                  <>
                    {/* Products error state */}
                    {productsError && (
                      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                          <p className="text-yellow-700">
                            {productsError}
                            <button
                              onClick={() => fetchProducts()}
                              className="ml-2 text-yellow-700 underline hover:text-yellow-800"
                            >
                              Try again
                            </button>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Products grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                          <ProductCard
                            key={product.productId}
                            productId={product.productId}
                            productName={product.productName}
                            issuer={product.issuer}
                            issuerRole={product.issuerRole}
                            date={product.date}
                            certificateCount={product.certificateCount}
                            status={product.status}
                            onClick={() => handleProductClick(product.productId)}
                          />
                        ))
                      ) : (
                        <div className="col-span-full p-8 text-center bg-white rounded-lg shadow">
                          <Package className="mx-auto h-12 w-12 text-slate-400" />
                          <p className="mt-2 text-sm text-slate-500">No products found</p>
                          {searchTerm || filterStatus !== 'all' ? (
                            <p className="mt-1 text-xs text-slate-400">
                              Try adjusting your search or filter criteria
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-slate-400">
                              No products available for your account
                            </p>
                          )}
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setFilterStatus('all');
                              fetchProducts();
                            }}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Refresh Products
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;