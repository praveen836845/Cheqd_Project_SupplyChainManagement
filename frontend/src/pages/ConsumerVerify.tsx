import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  QrCode, 
  ScanLine, 
  ArrowLeft, 
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  Calendar,
  Factory,
  Warehouse,
  Truck,
  Store,
  Package,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { mockProductHistories } from '../data/mockData';
import { UserRole } from '../types';

const ConsumerVerify: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [productData, setProductData] = useState(mockProductHistories[0]);
  
  // Simulate scanning a QR code
  const handleStartScan = () => {
    setIsScanning(true);
    
    // Simulate a scan after 2 seconds
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(mockProductHistories[0].productId);
      setProductData(mockProductHistories[0]);
    }, 2000);
  };
  
  const handleReset = () => {
    setScanResult(null);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getRoleIcon = (role: UserRole, className = 'h-5 w-5') => {
    switch (role) {
      case 'manufacturer':
        return <Factory className={className} />;
      case 'distributor':
        return <Warehouse className={className} />;
      case 'logistics':
        return <Truck className={className} />;
      case 'retailer':
        return <Store className={className} />;
      default:
        return <Package className={className} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link to="/" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="ml-4 flex items-center">
            <ShieldCheck className="h-6 w-6 text-blue-400 mr-2" />
            <h1 className="text-xl font-bold text-white">Product Verification</h1>
          </div>
        </div>
        
        {!scanResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <QrCode className="h-12 w-12 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Scan Product QR Code</h2>
              <p className="mt-2 text-sm text-slate-300">
                Scan the QR code on the product to verify its authenticity and trace its journey
              </p>
            </div>
            
            {isScanning ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex flex-col items-center">
                <div className="relative w-48 h-48 mb-4">
                  <div className="absolute inset-0 border-2 border-blue-400 rounded-lg"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-scan-line"></div>
                </div>
                <p className="text-blue-300 text-sm animate-pulse">Scanning...</p>
              </div>
            ) : (
              <button
                onClick={handleStartScan}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center transition-colors"
              >
                <ScanLine className="h-5 w-5 mr-2" />
                Start Scanning
              </button>
            )}
            
            <div className="mt-6 border-t border-slate-700/50 pt-6">
              <p className="text-center text-sm text-slate-400">
                Don't have a product to scan? <button className="text-blue-400">Try a demo</button>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Product Info Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex justify-between items-start">
                <div>
                  <div className="inline-block px-2 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-medium rounded-full mb-2">
                    Verified Product
                  </div>
                  <h2 className="text-xl font-bold text-white">{productData.productName}</h2>
                  <p className="text-sm text-slate-300 mt-1">ID: {productData.productId}</p>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <QRCode
                    value={productData.productId}
                    size={64}
                  />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>Manufacturer:</span>
                  <span className="font-medium text-white">{productData.manufacturerName}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Manufactured on:</span>
                  <span className="font-medium text-white">
                    {formatDate(productData.journey[0].date)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Certificates */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-medium text-white mb-3">Product Certificates</h3>
              
              <div className="space-y-3">
                {productData.certificates.map((cert, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg flex items-start ${
                      cert.valid ? 'bg-emerald-900/20' : 'bg-red-900/20'
                    }`}
                  >
                    <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                      cert.valid ? 'bg-emerald-500/30 text-emerald-400' : 'bg-red-500/30 text-red-400'
                    }`}>
                      {cert.valid ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className="ml-3 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-white">{cert.type}</h4>
                        <span className="text-xs text-slate-400">
                          {formatDate(cert.issuanceDate)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Issued by: {cert.issuer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Product Journey */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-medium text-white mb-4">Supply Chain Journey</h3>
              
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-3.5 top-2 h-full w-0.5 bg-slate-700/50"></div>
                
                <div className="space-y-6">
                  {productData.journey.map((step, index) => (
                    <div key={index} className="relative flex items-start">
                      <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center z-10 ${
                        index === 0 ? 'bg-blue-500/70 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {getRoleIcon(step.role, 'h-4 w-4')}
                      </div>
                      
                      <div className="ml-4 min-w-0">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-white">
                            {step.role.charAt(0).toUpperCase() + step.role.slice(1)}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {formatDate(step.date)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 mt-0.5">
                          {step.organization}
                        </p>
                        
                        {step.additionalInfo && Object.keys(step.additionalInfo).length > 0 && (
                          <div className="mt-1 text-xs text-slate-400">
                            {Object.entries(step.additionalInfo)
                              .filter(([key]) => key !== 'location' && key !== 'trackingId')
                              .map(([key, value]) => (
                                <div key={key} className="flex items-center mt-0.5">
                                  <span className="text-slate-500">
                                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                                  </span>
                                  <span className="ml-1">
                                    {Array.isArray(value) ? value.join(', ') : value.toString()}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center justify-center transition-colors"
              >
                <ScanLine className="h-5 w-5 mr-2" />
                Scan Another
              </button>
              
              <button
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center transition-colors"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Share Report
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ConsumerVerify;