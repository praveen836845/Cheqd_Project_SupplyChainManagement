import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Upload, 
  ScanLine, 
  ClipboardCheck,
  Check,
  X,
  Loader2,
  FileSearch,
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/layout/Navigation';
import { Credential } from '../types';
import axios from 'axios';

const VerifyCredentialNew: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'scan'>('upload');
  const [uploadedText, setUploadedText] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    credential: Credential | null;
    checks: { name: string; passed: boolean; message: string }[];
  } | null>(null);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  
  // Check for verification data in sessionStorage when component mounts
  useEffect(() => {
    const verificationData = sessionStorage.getItem('verificationData');
    if (verificationData) {
      setUploadedText(verificationData);
      // Automatically trigger verification if data is found
      handleVerify();
      // Clear the sessionStorage after using it
      sessionStorage.removeItem('verificationData');
    }
  }, []);
  
  if (!currentUser) return null;
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedText(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };
  
  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUploadedText(e.target.value);
  };
  
  const handleVerify = async () => {
    if (!uploadedText) return;
    
    setIsVerifying(true);
    
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Try to parse JSON
      const parsedCredential = JSON.parse(uploadedText);
      
      // For demo purposes, we'll simulate a verification response
      // In a real app, you would call your API to verify the credential
      const isValid = true; // Simulate successful verification
      const isRevoked = false;
      const isExpired = false;
      
      setVerificationResult({
        verified: isValid && !isRevoked && !isExpired,
        credential: parsedCredential,
        checks: [
          {
            name: 'Signature Verification',
            passed: isValid,
            message: 'The digital signature is valid.'
          },
          {
            name: 'Issuer Verification',
            passed: true,
            message: 'The issuer is valid and registered in the trust registry.'
          },
          {
            name: 'Expiration Check',
            passed: !isExpired,
            message: !isExpired 
              ? 'Credential is within its validity period.' 
              : 'Credential has expired.'
          },
          {
            name: 'Revocation Check',
            passed: !isRevoked,
            message: !isRevoked
              ? 'Credential has not been revoked.'
              : 'Credential has been revoked.'
          }
        ]
      });
    } catch (error) {
      setVerificationResult({
        verified: false,
        credential: null,
        checks: [
          {
            name: 'Format Validation',
            passed: false,
            message: 'Invalid credential format. The provided data is not a valid Verifiable Credential.'
          }
        ]
      });
    }
    
    setIsVerifying(false);
  };
  
  const handleViewDetails = () => {
    if (verificationResult?.credential) {
      setShowCredentialModal(true);
    }
  };
  
  const handleReset = () => {
    setUploadedText('');
    setVerificationResult(null);
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="md:ml-64 pt-6 md:pt-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-8">Verify Credential</h1>
          
          {verificationResult ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
            >
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    verificationResult.verified 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {verificationResult.verified ? (
                    <ShieldCheck className="h-8 w-8" />
                  ) : (
                    <X className="h-8 w-8" />
                  )}
                </motion.div>
                
                <h2 className="mt-4 text-xl font-bold text-slate-800">
                  {verificationResult.verified 
                    ? 'Credential Successfully Verified' 
                    : 'Verification Failed'
                  }
                </h2>
                
                {verificationResult.credential && (
                  <p className="mt-1 text-sm text-slate-500">
                    {verificationResult.credential.productName || verificationResult.credential.credentialSubject?.productName || 'Product'}
                  </p>
                )}
              </div>
              
              <div className="space-y-3 mb-6">
                {verificationResult.checks.map((check, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg flex items-start ${
                      check.passed ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'
                    }`}
                  >
                    <div className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                      check.passed ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                      {check.passed ? (
                        <Check className="h-3 w-3 text-white" />
                      ) : (
                        <X className="h-3 w-3 text-white" />
                      )}
                    </div>
                    
                    <div className="ml-3 min-w-0">
                      <h3 className={`text-sm font-medium ${
                        check.passed ? 'text-emerald-800' : 'text-red-800'
                      }`}>
                        {check.name}
                      </h3>
                      <p className={`text-xs ${
                        check.passed ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {check.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                >
                  Verify Another
                </button>
                
                {verificationResult.credential && (
                  <button
                    onClick={handleViewDetails}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    View Full Credential
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'upload'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('scan')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'scan'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center">
                    <ScanLine className="h-4 w-4 mr-2" />
                    Scan QR Code
                  </div>
                </button>
              </div>
              
              <div className="mt-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'upload' ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Upload Credential JSON
                          </label>
                          <div className="relative">
                            <label
                              htmlFor="file-upload"
                              className="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center border-2 border-dashed border-slate-300 py-8"
                            >
                              <FileSearch className="h-8 w-8 text-slate-400 mr-3" />
                              <span>Click to upload a JSON file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept=".json"
                                onChange={handleFileUpload}
                              />
                            </label>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            Upload a Verifiable Credential JSON file
                          </p>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-200"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-2 bg-white text-sm text-slate-500">or paste JSON</span>
                          </div>
                        </div>
                        
                        <div>
                          <textarea
                            rows={8}
                            value={uploadedText}
                            onChange={handleTextInput}
                            placeholder='Paste credential JSON here...'
                            className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                          ></textarea>
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            onClick={handleVerify}
                            disabled={!uploadedText || isVerifying}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isVerifying ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Verify Credential
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="scan"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center"
                    >
                      <div className="bg-slate-100 p-8 rounded-lg border border-slate-200 w-full max-w-md mx-auto mb-6">
                        <div className="aspect-square bg-white rounded flex items-center justify-center">
                          <QrCode className="h-32 w-32 text-slate-300" />
                        </div>
                      </div>
                      
                      <p className="text-slate-500 text-sm mb-6">
                        Position the QR code within the frame to scan
                      </p>
                      
                      <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                      >
                        <ScanLine className="h-4 w-4 mr-2" />
                        Start Camera
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          
          {/* Credential Modal would go here in a real implementation */}
          {showCredentialModal && verificationResult?.credential && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-slate-900">Credential Details</h3>
                    <button 
                      onClick={() => setShowCredentialModal(false)}
                      className="text-slate-400 hover:text-slate-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="bg-slate-50 rounded p-4 overflow-auto">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                      {JSON.stringify(verificationResult.credential, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowCredentialModal(false)}
                      className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCredentialNew;
