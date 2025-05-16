import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCircle2, Loader2, Building2, MapPin, Calendar, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { API_URL } from '../config';

interface CompanyDetails {
  companyName: string;
  location: string;
  establishmentDate: string;
  registrationNumber: string;
  industry: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
}

const initialCompanyDetails: CompanyDetails = {
  companyName: '',
  location: '',
  establishmentDate: '',
  registrationNumber: '',
  industry: '',
  website: '',
  contactEmail: '',
  contactPhone: ''
};

const DIDAuth: React.FC = () => {
  const { connectDID, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [did, setDid] = useState('');
  const [connectingState, setConnectingState] = useState<'idle' | 'connecting' | 'success'>('idle');
  const [showDIDInput, setShowDIDInput] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(initialCompanyDetails);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // If user is already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Memoize the form change handler
  const handleCompanyDetailsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyDetails(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Memoize the create DID handler
  const handleCreateDID = useCallback(async () => {
    try {
      // Validate required fields
      if (!companyDetails.companyName || !companyDetails.location || !selectedRole) {
        alert('Please fill in all required fields and select a role');
        return;
      }
   
      console.log("CompanyDetails" , companyDetails);
      console.log("Selected Role", selectedRole);
       
      setConnectingState('connecting');

      // Format the data according to the schema
      const schemaData = {
        name: "TechsteckSolution",
        version: "1.0",
        attrNames: [
          "name",
          "location",
          "establishmentDate",
          "registrationNumber",
          "industry",
          "website",
          "contactEmail",
          "contactPhone"
        ]
      };

      // Create the resource data object
      const resourceData = {
        name: companyDetails.companyName,
        location: companyDetails.location,
        establishmentDate: companyDetails.establishmentDate,
        registrationNumber: companyDetails.registrationNumber,
        industry: companyDetails.industry,
        website: companyDetails.website,
        contactEmail: companyDetails.contactEmail,
        contactPhone: companyDetails.contactPhone,
        role: selectedRole
      };
 
      console.log("resource_>>>>>>>>>>>>>>>>>>>>>>>>>>>", resourceData);
      // Convert the resource data to base64
      const encodedData = btoa(JSON.stringify(resourceData));

      // Create DID with company details
      const response = await fetch(`${API_URL}/did/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schemaData,
          encodedData,
          companyDetails: resourceData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create DID');
      }

      const data = await response.json();
      console.log('DID created:', data);

      // Store in localStorage
      const authInfo = {
        did: data.did,
        companyDetails: resourceData,
        schemaData,
        encodedData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('authInfo', JSON.stringify(authInfo));

      setConnectingState('success');
      
      // Redirect after successful creation
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error creating DID:', error);
      setConnectingState('idle');
      alert('Failed to create DID. Please try again.');
    }
  }, [companyDetails, navigate, selectedRole]);

  // Handle selecting a role in the create form
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  // Memoize the form component
  const CreateDIDForm = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden"
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up and closing the modal
    >
      <div className="px-6 py-4 bg-slate-800 text-white">
        <h3 className="text-lg font-semibold">Create New DID</h3>
        <p className="text-sm text-slate-300">Enter your company details</p>
      </div>

      <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">Select Your Role *</label>
          <div className="relative">
            <select
              value={selectedRole || ''}
              onChange={(e) => handleRoleSelect(e.target.value as UserRole)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 cursor-pointer"
            >
              <option value="" disabled>Select a role...</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="distributor">Distributor</option>
              <option value="logistics">Logistics</option>
              <option value="retailer">Retailer</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          
          {/* Display selected role info */}
          {selectedRole && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600 mr-3">
                {selectedRole === 'manufacturer' && <Building2 size={20} />}
                {selectedRole === 'distributor' && <Briefcase size={20} />}
                {selectedRole === 'logistics' && <MapPin size={20} />}
                {selectedRole === 'retailer' && <ShieldCheck size={20} />}
              </div>
              <div>
                <p className="font-medium text-blue-700">
                  {selectedRole === 'manufacturer' && 'Manufacturer'}
                  {selectedRole === 'distributor' && 'Distributor'}
                  {selectedRole === 'logistics' && 'Logistics'}
                  {selectedRole === 'retailer' && 'Retailer'}
                </p>
                <p className="text-xs text-blue-600">
                  {selectedRole === 'manufacturer' && 'Creates and issues the initial credentials for products'}
                  {selectedRole === 'distributor' && 'Facilitates the movement of products from manufacturers'}
                  {selectedRole === 'logistics' && 'Manages transportation and storage of products'}
                  {selectedRole === 'retailer' && 'Sells products directly to consumers'}
                </p>
              </div>
            </div>
          )}
          
          {!selectedRole && (
            <p className="text-sm text-red-500 mt-2">Please select a role to continue</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={companyDetails.companyName}
              onChange={handleCompanyDetailsChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={companyDetails.location}
              onChange={handleCompanyDetailsChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter company location"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Establishment Date
            </label>
            <input
              type="date"
              name="establishmentDate"
              value={companyDetails.establishmentDate}
              onChange={handleCompanyDetailsChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Registration Number
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={companyDetails.registrationNumber}
              onChange={handleCompanyDetailsChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter registration number"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Industry
            </label>
            <input
              type="text"
              name="industry"
              value={companyDetails.industry}
              onChange={handleCompanyDetailsChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter industry"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={companyDetails.website}
              onChange={handleCompanyDetailsChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter website URL"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              value={companyDetails.contactEmail}
              onChange={handleCompanyDetailsChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact email"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Contact Phone
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={companyDetails.contactPhone}
              onChange={handleCompanyDetailsChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact phone"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setShowCreateForm(false);
              setCompanyDetails(initialCompanyDetails);
              setSelectedRole(null);
            }}
            className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateDID}
            disabled={!companyDetails.companyName || !companyDetails.location || !selectedRole || connectingState === 'connecting'}
            className={`flex-1 py-2 px-4 rounded-lg text-white ${
              companyDetails.companyName && companyDetails.location && selectedRole && connectingState !== 'connecting'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-slate-400 cursor-not-allowed'
            }`}
          >
            {connectingState === 'connecting' ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Creating DID...
              </div>
            ) : (
              'Create DID'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  ), [companyDetails, connectingState, handleCompanyDetailsChange, handleCreateDID, selectedRole]);

  const verifyDID = async (didToVerify: string) => {
    try {
      console.log("Checking that Verify", didToVerify);
      const response = await fetch(`${API_URL}/verify-did`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ did: didToVerify })
      });

      console.log("response", response);
      if (!response.ok) {
        throw new Error('Invalid DID');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.log("Error getting while calling this API", error);
      throw new Error(error.message || 'Failed to verify DID');
    }
  };

  const handleConnectDID = async () => {
    if (!selectedRole || !did) return;
    
    setConnectingState('connecting');
    setVerificationError(null);
    
    try {
      // Verify DID
      const verificationResult = await verifyDID(did);
      console.log("Checked that VerificationResult",verificationResult);
      // Store authentication info in localStorage
      const authInfo = {
        did,
        role: selectedRole,
        timestamp: new Date().toISOString(),
        verificationData: verificationResult
      };
      localStorage.setItem('authInfo', JSON.stringify(authInfo));
      
      // Connect DID
      await connectDID(did, selectedRole);
      setConnectingState('success');
      
      // Redirect after successful connection
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error connecting DID:', error);
      setVerificationError('Failed to verify DID. Please check if the DID is valid.');
      setConnectingState('idle');
    }
  };

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    setShowDIDInput(true);
  };

  const roleOptions: { role: UserRole; label: string; description: string }[] = [
    {
      role: 'manufacturer',
      label: 'Manufacturer',
      description: 'Creates and issues the initial credentials for products'
    },
    {
      role: 'distributor',
      label: 'Distributor',
      description: 'Facilitates the movement of products from manufacturers'
    },
    {
      role: 'logistics',
      label: 'Logistics',
      description: 'Manages transportation and storage of products'
    },
    {
      role: 'retailer',
      label: 'Retailer',
      description: 'Sells products directly to consumers'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="flex justify-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "loop" 
            }}
          >
            <ShieldCheck className="h-16 w-16 text-blue-400" />
          </motion.div>
        </div>
        <h1 className="mt-6 text-4xl font-extrabold text-white">TrustChain VC</h1>
        <p className="mt-3 text-lg text-slate-300">Secure Supply Chain Verification</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-6">Connect with your DID</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserCircle2 className="h-5 w-5" />
                Connect DID Wallet
              </button>
              
              <p className="text-center text-sm text-slate-300">
                First time? <button 
                  onClick={() => setShowCreateForm(true)} 
                  className="text-blue-400 hover:text-blue-300"
                >
                  Create a new DID
                </button>
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-sm text-slate-400 text-center">
                By connecting, you agree to the terms of use and privacy policy.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Role selection and DID input modal */}
      {isModalOpen && !showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-800 text-white">
              <h3 className="text-lg font-semibold">Select Your Role</h3>
              <p className="text-sm text-slate-300">Choose your role in the supply chain</p>
            </div>

            {connectingState === 'idle' ? (
              <div className="p-6">
                {!showDIDInput ? (
                  <div className="space-y-3 mb-6">
                    {roleOptions.map(option => (
                      <button
                        key={option.role}
                        onClick={() => handleRoleSelection(option.role)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                          selectedRole === option.role
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            selectedRole === option.role ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <UserCircle2 className="h-6 w-6" />
                          </div>
                          <div className="ml-3 text-left">
                            <div className="font-medium text-slate-800">{option.label}</div>
                            <div className="text-xs text-slate-500">{option.description}</div>
                          </div>
                        </div>
                        {selectedRole === option.role && (
                          <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="did" className="block text-sm font-medium text-slate-700 mb-1">
                        Enter your DID
                      </label>
                      <input
                        type="text"
                        id="did"
                        value={did}
                        onChange={(e) => setDid(e.target.value)}
                        placeholder="did:cheqd:testnet:..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {verificationError && (
                        <p className="mt-2 text-sm text-red-600">{verificationError}</p>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      Selected Role: <span className="font-medium text-slate-700">{selectedRole}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      if (showDIDInput) {
                        setShowDIDInput(false);
                      } else {
                        setIsModalOpen(false);
                      }
                    }}
                    className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    {showDIDInput ? 'Back' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleConnectDID}
                    disabled={!selectedRole || (showDIDInput && !did)}
                    className={`flex-1 py-2 px-4 rounded-lg text-white ${
                      (selectedRole && (!showDIDInput || did)) 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {showDIDInput ? 'Connect' : 'Next'}
                  </button>
                </div>
              </div>
            ) : connectingState === 'connecting' ? (
              <div className="p-8 flex flex-col items-center">
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Connecting DID</h3>
                <p className="text-sm text-slate-500 text-center mt-2">
                  Please wait while we connect your DID to the application...
                </p>
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center">
                <div className="flex justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="bg-green-100 p-2 rounded-full"
                  >
                    <ShieldCheck className="h-8 w-8 text-green-600" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-medium text-slate-900">Connection Successful!</h3>
                <p className="text-sm text-slate-500 text-center mt-2">
                  Your DID has been connected successfully. Redirecting you to your dashboard...
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Create DID Form Modal - Fixed Positioning */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
        >
          {CreateDIDForm}
        </div>
      )}
    </div>
  );
};

export default DIDAuth;