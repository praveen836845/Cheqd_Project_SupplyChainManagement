import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  productId: string;
  productName: string;
  issuer: string;
  issuerRole: string;
  date: string;
  certificateCount: number;
  status: 'valid' | 'invalid';
}

const ProductCard: React.FC<ProductCardProps> = ({
  productId,
  productName,
  issuer,
  issuerRole,
  date,
  certificateCount,
  status
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
    >
      <Link to={`/timeline/${productId}`} className="block p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              status === 'valid' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {status === 'valid' ? (
                <ShieldCheck className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-slate-900">{productName}</h3>
              <p className="text-sm text-slate-500 mt-1">ID: {productId}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-slate-600">
            <Package className="h-4 w-4 mr-2" />
            <span>{certificateCount} Certificate{certificateCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Issued by {issuer}</span>
            <span className="text-slate-500">{formatDate(date)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;