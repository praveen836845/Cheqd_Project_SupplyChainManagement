import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  Calendar, 
  Filter, 
  Package, 
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  Clock,
  Shield,
  FileX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/layout/Navigation';
import VCStatus from '../components/shared/VCStatus';
import CredentialModal from '../components/ui/CredentialModal';
import { mockCredentials } from '../data/mockData';
import { Credential } from '../types';

const RevocationPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>([]);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [isRevocationModalOpen, setIsRevocationModalOpen] = useState(false);
  const [revocationReason, setRevocationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked'>('all');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Filter options for credential type
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Get all available credential types from mockCredentials
  const allCredentialTypes = Array.from(
    new Set(
      Object.values(mockCredentials)
        .flat()
        .flatMap(cred => cred.type.filter(t => t !== 'VerifiableCredential'))
    )
  );
  
  // Load credentials for current user
  useEffect(() => {
    if (currentUser) {
      // For this demo, get all credentials regardless of role
      const allCreds = Object.values(mockCredentials).flat();
      setCredentials(allCreds);
      setFilteredCredentials(allCreds);
    }
  }, [currentUser]);
  
  // Filter credentials based on search term, status, and types
  useEffect(() => {
    if (!credentials.length) return;
    
    let filtered = [...credentials];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(cred => 
        cred.credentialSubject.productName.toLowerCase().includes(search) ||
        cred.credentialSubject.productId.toLowerCase().includes(search) ||
        cred.id.toLowerCase().includes(search)
      );
    }
    
    // Apply status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(cred => !cred.status?.revoked);
    } else if (filterStatus === 'revoked') {
      filtered = filtered.filter(cred => cred.status?.revoked);
    }
    
    // Apply type filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(cred => 
        cred.type.some(type => selectedTypes.includes(type))
      );
    }
    
    setFilteredCredentials(filtered);
  }, [credentials, searchTerm, filterStatus, selectedTypes]);
  
  if (!currentUser) return null;
  
  const handleViewCredential = (credential: Credential) => {
    setSelectedCredential(credential);
    setIsCredentialModalOpen(true);
  };
  
  const handleOpenRevocationModal = (credential: Credential) => {
    setSelectedCredential(credential);
    setIsRevocationModalOpen(true);
  };
  
  const handleCloseRevocationModal = () => {
    setIsRevocationModalOpen(false);
    setRevocationReason('');
    setSelectedCredential(null);
  };
  
  const handleRevoke = async () => {
    if (!selectedCredential || !revocationReason.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call to revoke credential
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update the credential with revocation status
    const updatedCredentials = credentials.map(cred => {
      if (cred.id === selectedCredential.id) {
        return {
          ...cred,
          status: {
            revoked: true,
            revocationDate: new Date().toISOString(),
            revocationReason: revocationReason
          }
        };
      }
      return cred;
    });
    
    setCredentials(updatedCredentials);
    setIsSubmitting(false);
    setIsRevocationModalOpen(false);
    setIsSuccess(true);
    
    // Hide success message after a few seconds
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };
  
  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Group revoked credentials by date
  const groupByDate = (creds: Credential[]) => {
    const revoked = creds.filter(cred => cred.status?.revoked);
    const grouped: Record<string, Credential[]> = {};
    
    revoked.forEach(cred => {
      if (cred.status?.revocationDate) {
        const date = new Date(cred.status.revocationDate).toLocaleDateString();
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(cred);
      }
    });
    
    return grouped;
  };
  
  const revokedByDate = groupByDate(credentials);
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="md:ml-64 pt-6 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Revocation Management</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage and view revoked verifiable credentials
              </p>
            </div>
          </div>
          
          {/* Success message */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-emerald-800">
                    Credential successfully revoked
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    The credential has been marked as revoked and is no longer valid.
                  </p>
                </div>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="ml-auto text-emerald-500 hover:text-emerald-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Credentials Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">Credential Management</h2>
                    
                    <div className="mt-3 sm:mt-0 flex space-x-2">
                      <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          filterStatus === 'all'
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterStatus('active')}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          filterStatus === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => setFilterStatus('revoked')}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          filterStatus === 'revoked'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Revoked
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 block w-full rounded-md border border-slate-300 shadow-sm py-2 px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search by product or ID..."
                      />
                    </div>
                    
                    <button
                      onClick={() => setExpandedFilters(!expandedFilters)}
                      className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition-colors"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {expandedFilters ? (
                        <ChevronUp className="h-4 w-4 ml-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-2" />
                      )}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {expandedFilters && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-2">
                            Filter by credential type:
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {allCredentialTypes.map(type => (
                              <button
                                key={type}
                                onClick={() => handleTypeToggle(type)}
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  selectedTypes.includes(type)
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredCredentials.length > 0 ? (
                    <ul className="divide-y divide-slate-200">
                      {filteredCredentials.map((credential) => {
                        const status = credential.status?.revoked ? 'revoked' : 
                                     (credential.expirationDate && new Date(credential.expirationDate) < new Date()) 
                                     ? 'expired' : 'valid';
                        
                        return (
                          <motion.li
                            key={credential.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <Package className="h-6 w-6 text-slate-400" />
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-slate-900">
                                    {credential.credentialSubject.productName}
                                  </h3>
                                  <div className="mt-1 flex items-center">
                                    <span className="text-xs text-slate-500">
                                      ID: {credential.credentialSubject.productId}
                                    </span>
                                    <span className="mx-2 text-slate-300">•</span>
                                    <span className="text-xs text-slate-500">
                                      VC: {credential.id}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex flex-wrap items-center gap-2">
                                    {credential.type
                                      .filter(t => t !== 'VerifiableCredential')
                                      .map((type, idx) => (
                                        <span 
                                          key={idx}
                                          className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full"
                                        >
                                          {type}
                                        </span>
                                      ))
                                    }
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-2 sm:mt-0 flex flex-col sm:items-end">
                                <VCStatus status={status} />
                                
                                <div className="mt-2 flex space-x-2">
                                  <button
                                    onClick={() => handleViewCredential(credential)}
                                    className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 rounded"
                                  >
                                    View
                                  </button>
                                  
                                  {status === 'valid' && (
                                    <button
                                      onClick={() => handleOpenRevocationModal(credential)}
                                      className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 rounded"
                                    >
                                      Revoke
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                        <FileX className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-900">No credentials found</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {searchTerm 
                          ? `No results found for "${searchTerm}". Try a different search term.` 
                          : 'No credentials match the current filters. Try changing your filters.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Revocation History Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                  <History className="h-5 w-5 mr-2 text-slate-400" />
                  Revocation History
                </h2>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto">
                {Object.keys(revokedByDate).length > 0 ? (
                  <div className="p-4">
                    {Object.entries(revokedByDate).map(([date, creds]) => (
                      <div key={date} className="mb-6">
                        <div className="flex items-center mb-3">
                          <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                          <h3 className="text-sm font-medium text-slate-700">{date}</h3>
                        </div>
                        
                        <div className="space-y-3">
                          {creds.map(cred => (
                            <motion.div
                              key={cred.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-3 bg-red-50 border border-red-100 rounded-lg"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-sm font-medium text-slate-800">
                                    {cred.credentialSubject.productName}
                                  </h4>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    ID: {cred.credentialSubject.productId}
                                  </p>
                                </div>
                                <VCStatus status="revoked" size="sm" />
                              </div>
                              
                              {cred.status?.revocationReason && (
                                <div className="mt-2 p-2 bg-white rounded border border-red-100">
                                  <div className="flex">
                                    <AlertOctagon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="ml-2">
                                      <p className="text-xs font-medium text-red-700">Reason:</p>
                                      <p className="text-xs text-red-600">
                                        {cred.status.revocationReason}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-2 flex justify-between items-center">
                                <span className="text-xs text-slate-500">
                                  {cred.status?.revocationDate && (
                                    <>
                                      <Clock className="h-3 w-3 inline mr-1" />
                                      {new Date(cred.status.revocationDate).toLocaleTimeString()}
                                    </>
                                  )}
                                </span>
                                
                                <button
                                  onClick={() => handleViewCredential(cred)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  View Details
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                      <Shield className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">No revoked credentials</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      The revocation history will show all credentials that have been revoked.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Credential Modal */}
      <CredentialModal
        credential={selectedCredential}
        isOpen={isCredentialModalOpen}
        onClose={() => setIsCredentialModalOpen(false)}
      />
      
      {/* Revocation Modal */}
      <AnimatePresence>
        {isRevocationModalOpen && selectedCredential && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="min-h-screen px-4 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleCloseRevocationModal}
              ></motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md relative z-10"
              >
                <div className="px-6 py-4 bg-red-50 border-b border-red-100 rounded-t-xl">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-red-900">Revoke Credential</h3>
                      <p className="text-sm text-red-700">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseRevocationModal}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-1">Product Information</h4>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-800">
                        {selectedCredential.credentialSubject.productName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        ID: {selectedCredential.credentialSubject.productId}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        VC ID: {selectedCredential.id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="revocationReason" className="block text-sm font-medium text-slate-700 mb-1">
                      Revocation Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="revocationReason"
                      value={revocationReason}
                      onChange={(e) => setRevocationReason(e.target.value)}
                      rows={3}
                      className="block w-full rounded-md border border-slate-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="Please provide a detailed reason for revoking this credential..."
                      required
                    ></textarea>
                    {!revocationReason.trim() && (
                      <p className="mt-1 text-xs text-red-600">
                        A revocation reason is required
                      </p>
                    )}
                  </div>
                  
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg mb-6">
                    <div className="flex">
                      <AlertOctagon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-amber-800">Warning</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Revoking this credential will invalidate it across the entire supply chain. 
                          All parties that rely on this credential will be affected.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleCloseRevocationModal}
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleRevoke}
                      disabled={!revocationReason.trim() || isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <Clock className="h-4 w-4" />
                          </motion.div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Revoke Credential
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RevocationPanel;