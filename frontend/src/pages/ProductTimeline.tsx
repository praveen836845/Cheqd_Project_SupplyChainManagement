import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Users,
  Loader2,
  ChevronRight
} from 'lucide-react';
import Navigation from '../components/layout/Navigation';
import { useAuth } from '../context/AuthContext';
import { getProductTimeline } from '../services/api';
import { ProductHistory, Activity } from '../types';

const ProductTimeline: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState<ProductHistory | null>(null);
  const [timeline, setTimeline] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await getProductTimeline(productId);
        setProduct(data.product);
        setTimeline(data.timeline);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product data');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="md:ml-64 pt-6 md:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading product data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="md:ml-64 pt-6 md:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 text-lg mb-4">{error}</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="md:ml-64 pt-6 md:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 text-lg mb-4">Product not found</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="md:ml-64 pt-6 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${
                  product.status === 'valid' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {product.status === 'valid' ? (
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">{product.productName}</h1>
                  <p className="text-sm text-slate-500 mt-1">ID: {product.productId}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Issued on</div>
                <div className="text-sm font-medium text-slate-900">{formatDate(product.date)}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm text-slate-500">Issuer</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{product.issuer}</div>
                <div className="mt-1 text-xs text-slate-500 capitalize">{product.issuerRole}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm text-slate-500">Certificates</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {product.certificateCount} Certificate{product.certificateCount !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm text-slate-500">Status</div>
                <div className={`mt-1 text-sm font-medium ${
                  product.status === 'valid' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-medium text-slate-900">Product Timeline</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {timeline.length > 0 ? (
                timeline.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-slate-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                          <span className="text-sm text-slate-500">{formatDate(activity.date)}</span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-slate-500">
                          <Users className="h-4 w-4 mr-1" />
                          {activity.counterpartyOrg}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Clock className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-500">No timeline data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTimeline;