import React, { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileSignature, 
  Package, 
  Calendar, 
  User, 
  CheckCircle2,
  Tag,
  Send,
  Plus,
  Minus,
  Loader2,
  ArrowLeft,
  Hash,
  FileText,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/layout/Navigation';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { issueVC, createSubjectDID, getPotentialRecipients, APIError } from '../services/api';

type CertificateType = 'Organic' | 'ColdChain' | 'Sustainable' | 'QualityTested' | 'Recyclable';

interface FormData {
  productId: string;
  productName: string;
  batchNumber: string;
  description: string;
  recipientDID: string;
  handlingDate: string;
}

interface FormErrors {
  [key: string]: string;
}

const IssueCredential: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  
  const [formData, setFormData] = useState<FormData>({
    productId: '',
    productName: '',
    batchNumber: '',
    description: '',
    recipientDID: '',
    handlingDate: new Date().toISOString().split('T')[0],
  });
  
  const [selectedCertificates, setSelectedCertificates] = useState<CertificateType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const [potentialRecipients, setPotentialRecipients] = useState<Array<{ did: string; name: string }>>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  
  const certificateOptions: { type: CertificateType; label: string; description: string }[] = [
    { 
      type: 'Organic', 
      label: 'Organic', 
      description: 'Product meets organic certification standards'
    },
    { 
      type: 'ColdChain', 
      label: 'Cold Chain Verified', 
      description: 'Temperature controlled throughout transport'
    },
    { 
      type: 'Sustainable', 
      label: 'Sustainably Sourced', 
      description: 'Materials from sustainable and ethical sources'
    },
    { 
      type: 'QualityTested', 
      label: 'Quality Tested', 
      description: 'Passed rigorous quality assurance tests'
    },
    { 
      type: 'Recyclable', 
      label: 'Recyclable Packaging', 
      description: 'Packaging is fully recyclable'
    }
  ];
  
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.productId.trim()) {
      errors.productId = 'Product ID is required';
    }
    
    if (!formData.productName.trim()) {
      errors.productName = 'Product name is required';
    }
    
    if (!formData.batchNumber.trim()) {
      errors.batchNumber = 'Batch number is required';
    }
    
    if (!formData.recipientDID.trim()) {
      errors.recipientDID = 'Recipient DID is required';
    } else if (!formData.recipientDID.startsWith('did:')) {
      errors.recipientDID = 'Invalid DID format';
    }
    
    if (!formData.handlingDate) {
      errors.handlingDate = 'Handling date is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const toggleCertificate = (type: CertificateType) => {
    setSelectedCertificates(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Create credential data
      const credentialData = {
        productId: formData.productId,
        productName: formData.productName,
        batchNumber: formData.batchNumber,
        description: formData.description,
        handlingDate: formData.handlingDate,
        certificates: selectedCertificates,
      };

      // First create subject DID
      const subjectDIDResult = await createSubjectDID(credentialData, currentUser.did);

      // Then issue VC using the subject DID
      await issueVC('did:cheqd:testnet:1d49bccf-8c96-4e9f-ad0c-ab2a98785165', subjectDIDResult.subjectDID, credentialData);
      
      setIsSubmitting(false);
      setIsSuccess(true);
      setShowConfetti(true);
      
      // Hide confetti after a few seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      // Redirect after success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to issue credential';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    const fetchPotentialRecipients = async () => {
      if (!currentUser?.role) return;
      
      let recipientRole: string | null = null;
      
      // Determine which role to fetch based on current user's role
      switch (currentUser.role) {
        case 'manufacturer':
          recipientRole = 'distributor';
          break;
        case 'distributor':
          recipientRole = 'logistics';
          break;
        case 'logistics':
          recipientRole = 'retailer';
          break;
        default:
          // If the user has another role (like Admin), don't fetch recipients
          return;
      }
      
      setIsLoadingRecipients(true);
      try {
        const recipients = await getPotentialRecipients(recipientRole);
        setPotentialRecipients(recipients);
      } catch (error) {
        console.error('Failed to fetch potential recipients:', error);
      } finally {
        setIsLoadingRecipients(false);
      }
    };
  
    fetchPotentialRecipients();
  }, [currentUser?.role]);
  
  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      {showConfetti && <ReactConfetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <div className="md:ml-64 pt-6 md:pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h1 className="text-2xl font-semibold text-slate-900">Issue New Credential</h1>
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
          
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, 0] }}
                transition={{ duration: 0.5, type: "spring" }}
                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </motion.div>
              
              <h2 className="text-xl font-bold text-slate-800 mb-2">Credential Issued Successfully!</h2>
              <p className="text-slate-600 text-center mb-6">
                The verifiable credential has been signed with your DID and issued to the recipient.
              </p>
              
              <motion.div
                className="p-4 bg-slate-50 rounded-lg border border-slate-200 w-full mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Product:</span>
                  <span className="text-sm text-slate-900">{formData.productName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Product ID:</span>
                  <span className="text-sm text-slate-900">{formData.productId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Recipient:</span>
                  <span className="text-sm text-slate-900">{formData.recipientDID.substring(0, 10)}...</span>
                </div>
              </motion.div>
              
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                >
                  Back to Dashboard
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      productId: '',
                      productName: '',
                      batchNumber: '',
                      description: '',
                      recipientDID: '',
                      handlingDate: new Date().toISOString().split('T')[0],
                    });
                    setSelectedCertificates([]);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  Issue Another
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="productId" className="block text-sm font-medium text-slate-700">
                      Product ID
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="productId"
                        id="productId"
                        required
                        value={formData.productId}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          formErrors.productId ? 'border-red-300' : 'border-slate-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter product ID"
                      />
                    </div>
                    {formErrors.productId && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.productId}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="productName" className="block text-sm font-medium text-slate-700">
                      Product Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Package className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="productName"
                        id="productName"
                        required
                        value={formData.productName}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          formErrors.productName ? 'border-red-300' : 'border-slate-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter product name"
                      />
                    </div>
                    {formErrors.productName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.productName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="batchNumber" className="block text-sm font-medium text-slate-700">
                      Batch Number
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="batchNumber"
                        id="batchNumber"
                        value={formData.batchNumber}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          formErrors.batchNumber ? 'border-red-300' : 'border-slate-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter batch number"
                      />
                    </div>
                    {formErrors.batchNumber && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.batchNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="handlingDate" className="block text-sm font-medium text-slate-700">
                      Handling Date
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="date"
                        name="handlingDate"
                        id="handlingDate"
                        required
                        value={formData.handlingDate}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          formErrors.handlingDate ? 'border-red-300' : 'border-slate-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                    {formErrors.handlingDate && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.handlingDate}</p>
                    )}
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="recipientDID" className="block text-sm font-medium text-slate-700">
                      Recipient
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <select
                        name="recipientDID"
                        id="recipientDID"
                        required
                        value={formData.recipientDID}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          formErrors.recipientDID ? 'border-red-300' : 'border-slate-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        disabled={isLoadingRecipients}
                      >
                        <option value="">Select a recipient</option>
                        {potentialRecipients.map((recipient) => (
                          <option key={recipient.did} value={recipient.did}>
                            {recipient.name} ({recipient.did.substring(0, 10)}...)
                          </option>
                        ))}
                      </select>
                    </div>
                    {formErrors.recipientDID && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.recipientDID}</p>
                    )}
                    {isLoadingRecipients && (
                      <p className="mt-1 text-sm text-slate-500">Loading recipients...</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <textarea
                      name="description"
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product description"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Certificates
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {certificateOptions.map((option) => (
                      <motion.button
                        key={option.type}
                        type="button"
                        onClick={() => toggleCertificate(option.type)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-lg border ${
                          selectedCertificates.includes(option.type)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center ${
                            selectedCertificates.includes(option.type)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-slate-300'
                          }`}>
                            {selectedCertificates.includes(option.type) && (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${
                              selectedCertificates.includes(option.type)
                                ? 'text-blue-900'
                                : 'text-slate-900'
                            }`}>
                              {option.label}
                            </p>
                            <p className={`text-xs ${
                              selectedCertificates.includes(option.type)
                                ? 'text-blue-700'
                                : 'text-slate-500'
                            }`}>
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Issuing...
                    </>
                  ) : (
                    <>
                      <FileSignature className="h-5 w-5 mr-2" />
                      Issue Credential
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCredential;