import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Upload, 
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/layout/Navigation';
import { verifyVC, APIError } from '../services/api';
import { Credential } from '../types';

interface VerificationResult {
  verified: boolean;
  credential: Credential | null;
  checks: {
    name: string;
    passed: boolean;
    message: string;
  }[];
}

const VerifyCredential: React.FC = () => {
  const { currentUser } = useAuth();
  const [uploadedText, setUploadedText] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUploadedText(text);
      setVerificationResult(null);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setError('Please upload a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUploadedText(text);
      setVerificationResult(null);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleVerify = async () => {
    if (!uploadedText) {
      setError('Please upload a credential file first');
      return;
    }
    
    setIsVerifying(true);
    setError(null);
    
    try {
      // Try to parse JSON
      const parsedCredential = JSON.parse(uploadedText);
      
      // Verify the credential using the API
      const result = await verifyVC(parsedCredential);
      
      setVerificationResult({
        verified: result.isValid,
        credential: parsedCredential,
        checks: [
          {
            name: 'Signature Verification',
            passed: result.isValid,
            message: result.isValid ? 'The digital signature is valid.' : 'The digital signature is invalid.'
          },
          {
            name: 'Issuer Verification',
            passed: result.isTrusted,
            message: result.isTrusted ? 'The issuer is valid and registered in the trust registry.' : 'The issuer is not registered in the trust registry.'
          }
        ]
      });
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format');
      } else {
        const errorMessage = err instanceof APIError 
          ? err.message 
          : 'Failed to verify credential';
        setError(errorMessage);
      }
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClear = () => {
    setUploadedText('');
    setVerificationResult(null);
    setError(null);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="md:ml-64 pt-6 md:pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-slate-900">Verify Credential</h1>
            
            {uploadedText && (
              <button
                onClick={handleClear}
                className="inline-flex items-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Credential File
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".json"
                          className="sr-only"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">JSON files only</p>
                  </div>
                </div>
              </div>
              
              {uploadedText && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Credential Content
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <textarea
                      value={uploadedText}
                      onChange={(e) => setUploadedText(e.target.value)}
                      rows={6}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Credential JSON content"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <motion.button
                  onClick={handleVerify}
                  disabled={!uploadedText || isVerifying}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    (!uploadedText || isVerifying) ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5 mr-2" />
                      Verify Credential
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
          
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white shadow rounded-lg p-6"
            >
              <div className="flex items-center mb-6">
                {verificationResult.verified ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500 mr-3" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500 mr-3" />
                )}
                <h2 className="text-xl font-semibold text-slate-900">
                  {verificationResult.verified ? 'Credential Verified' : 'Verification Failed'}
                </h2>
              </div>
              
              <div className="space-y-4">
                {verificationResult.checks.map((check, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      check.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center">
                      {check.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-3" />
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">{check.name}</h3>
                        <p className="text-sm text-slate-600">{check.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {verificationResult.credential && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-medium text-slate-900 mb-4">Credential Details</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <pre className="text-sm text-slate-600 overflow-x-auto">
                      {JSON.stringify(verificationResult.credential, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCredential;