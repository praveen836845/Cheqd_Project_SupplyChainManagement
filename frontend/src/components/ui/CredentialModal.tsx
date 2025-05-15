import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink } from 'lucide-react';
import { Credential } from '../../types';
import VCStatus from '../shared/VCStatus';

interface CredentialModalProps {
  credential: Credential | null;
  isOpen: boolean;
  onClose: () => void;
}

const CredentialModal: React.FC<CredentialModalProps> = ({
  credential,
  isOpen,
  onClose
}) => {
  if (!credential) return null;

  const determineStatus = (cred: Credential): 'valid' | 'invalid' | 'expired' | 'revoked' => {
    if (cred.status?.revoked) return 'revoked';
    if (cred.expirationDate && new Date(cred.expirationDate) < new Date()) return 'expired';
    return 'valid';
  };

  const statusValue = determineStatus(credential);

  const handleDownload = () => {
    const jsonString = JSON.stringify(credential, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credential-${credential.id.substring(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 30, stiffness: 500 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden"
              variants={modalVariants}
            >
              <div className="p-6 bg-gradient-to-r from-slate-700 to-slate-900 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Verifiable Credential</h3>
                    <p className="text-slate-300 text-sm mt-1">{credential.id.substring(0, 12)}...</p>
                  </div>
                  <VCStatus status={statusValue} size="md" />
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Credential Type</h4>
                    <div className="mt-1">
                      {credential.type.map((type, index) => (
                        <span 
                          key={index}
                          className="inline-block mr-2 mb-2 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Issuance Date</h4>
                      <p className="mt-1 text-slate-900">
                        {new Date(credential.issuanceDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {credential.expirationDate && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-500">Expiration Date</h4>
                        <p className="mt-1 text-slate-900">
                          {new Date(credential.expirationDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Issuer</h4>
                    <p className="mt-1 text-slate-900 break-all">
                      {credential.issuer}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Product Information</h4>
                    <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium text-slate-900">
                        {credential.credentialSubject.productName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        ID: {credential.credentialSubject.productId}
                      </p>
                      {credential.credentialSubject.batchNumber && (
                        <p className="text-xs text-slate-500 mt-1">
                          Batch: {credential.credentialSubject.batchNumber}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        Handling Date: {new Date(credential.credentialSubject.handlingDate).toLocaleDateString()}
                      </p>
                      {credential.credentialSubject.description && (
                        <p className="text-xs text-slate-600 mt-2 border-t border-slate-200 pt-2">
                          {credential.credentialSubject.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {credential.status?.revoked && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="text-sm font-medium text-red-700">Revocation Information</h4>
                      <p className="text-xs text-red-600 mt-1">
                        Revoked on: {credential.status.revocationDate ? new Date(credential.status.revocationDate).toLocaleDateString() : 'Unknown'}
                      </p>
                      {credential.status.revocationReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {credential.status.revocationReason}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Cryptographic Proof</h4>
                    <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 overflow-x-auto">
                      <p>Type: {credential.proof.type}</p>
                      <p className="mt-1">Created: {credential.proof.created}</p>
                      <p className="mt-1">Method: {credential.proof.verificationMethod.substring(0, 30)}...</p>
                      <p className="mt-1">Purpose: {credential.proof.proofPurpose}</p>
                      <p className="mt-1 break-all">Value: {credential.proof.proofValue.substring(0, 40)}...</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between">
                <button
                  onClick={handleDownload}
                  className="flex items-center px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 rounded-lg"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Download JSON
                </button>
                <button
                  className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 rounded-lg"
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  Verify on Registry
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CredentialModal;