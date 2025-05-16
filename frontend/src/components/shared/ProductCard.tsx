import React from 'react';
import { motion } from 'framer-motion';
import {
  FileSignature,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  FileText,
  Fingerprint,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import axios from 'axios';

interface ProductCardProps {
  productId: string;
  productName: string;
  issuer: string;
  issuerRole: string;
  date: string;
  certificateCount: number;
  status: 'active' | 'inactive' | 'valid' | 'invalid';
  resourceId?: string;
  description?: string;
  jwt?: string;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  productId,
  productName,
  issuer,
  issuerRole,
  date,
  certificateCount,
  status,
  resourceId,
  description,
  jwt,
  onClick
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        return dateString || 'No date';
      }
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(dateObj);
    } catch (e) {
      return dateString || 'No date';
    }
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    valid: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    invalid: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    active: <CheckCircle2 className="h-4 w-4" />,
    valid: <CheckCircle2 className="h-4 w-4" />,
    inactive: <XCircle className="h-4 w-4" />,
    invalid: <XCircle className="h-4 w-4" />
  };

  const handleVerifyVC = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card onClick from firing

    if (!jwt) {
      console.error('No JWT provided for verification');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/verify-vc', {
        jwt: jwt
      });

      if (response.data.verified) {
        alert('Verification successful: This credential is valid');
      } else {
        alert('Verification failed: This credential is invalid');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Error during verification. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-slate-900">{productName}</h3>
            <p className="mt-1 text-sm text-slate-500">ID: {productId}</p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {statusIcons[status]} {status}
          </span>
        </div>

        {description && (
          <div className="mt-3 flex items-start text-sm text-slate-600">
            <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 mt-0.5" />
            <p className="line-clamp-2">{description}</p>
          </div>
        )}

        {resourceId && (
          <div className="mt-2 flex items-center text-sm text-slate-500">
            <Fingerprint className="flex-shrink-0 mr-1.5 h-4 w-4" />
            <span className="truncate" title={resourceId}>
              Resource: {resourceId.substring(0, 8)}...{resourceId.slice(-4)}
            </span>
          </div>
        )}

        <div className="mt-2 flex items-center text-sm text-slate-500">
          <FileSignature className="flex-shrink-0 mr-1.5 h-4 w-4" />
          <span className="truncate">BatchNumber: {issuer}</span>
        </div>

        <div className="mt-2 flex items-center text-sm text-slate-500">
          <ShieldCheck className="flex-shrink-0 mr-1.5 h-4 w-4" />
          <span>{certificateCount} certificate(s)</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-slate-500">
            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
            <span>{formatDate(date)}</span>
          </div>

          <div className="flex items-center space-x-2">
            {jwt && (
              <button
                onClick={handleVerifyVC}
                className="px-3 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Verify credential"
              >
                Verify
              </button>
            )}
            <ArrowUpRight className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
