import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DIDCardProps {
    did?: string;
}
const DIDCard: React.FC<DIDCardProps> = ({did}) => {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!currentUser || !did) return null;

  const truncatedDID = `${did.substring(0, 16)}...${did.substring(did.length - 4)}`;

  const handleCopyDID = () => {
    navigator.clipboard.writeText(did);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roleColors = {
    manufacturer: 'bg-blue-700',
    distributor: 'bg-purple-700',
    logistics: 'bg-amber-700',
    retailer: 'bg-emerald-700',
    consumer: 'bg-gray-700',
    auditor: 'bg-red-700',
  };

  return (
    <motion.div 
      className="bg-slate-800 rounded-xl p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${roleColors[currentUser.role]} inline-block mb-2`}>
            {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
          </div>
          <h3 className="text-sm font-medium text-white mb-1">{currentUser.name}</h3>
          {currentUser.organization && (
            <p className="text-xs text-slate-400 mb-2">{currentUser.organization}</p>
          )}
        </div>
      </div>

      <div 
        className="mt-2 p-2 bg-slate-900 rounded-lg text-xs text-slate-300 font-mono flex items-center justify-between cursor-pointer group"
        onClick={handleCopyDID}
      >
        <span>{truncatedDID}</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="text-slate-400 group-hover:text-white"
        >
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </motion.button>
      </div>
      
      {copied && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-xs text-emerald-500 mt-1 text-center"
        >
          DID copied to clipboard
        </motion.div>
      )}
    </motion.div>
  );
};

export default DIDCard;