import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

type StatusType = 'valid' | 'invalid' | 'expired' | 'revoked';

interface VCStatusProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const VCStatus: React.FC<VCStatusProps> = ({ 
  status, 
  size = 'md', 
  showLabel = true,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'valid':
        return {
          icon: <CheckCircle2 className={iconSize} />,
          label: 'Valid',
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20'
        };
      case 'invalid':
        return {
          icon: <XCircle className={iconSize} />,
          label: 'Invalid',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20'
        };
      case 'expired':
        return {
          icon: <Clock className={iconSize} />,
          label: 'Expired',
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20'
        };
      case 'revoked':
        return {
          icon: <XCircle className={iconSize} />,
          label: 'Revoked',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20'
        };
      default:
        return {
          icon: <XCircle className={iconSize} />,
          label: 'Unknown',
          color: 'text-slate-500',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/20'
        };
    }
  };

  const getSize = () => {
    switch(size) {
      case 'sm':
        return {
          padding: 'px-2 py-1',
          fontSize: 'text-xs',
          iconSize: 'h-3 w-3'
        };
      case 'lg':
        return {
          padding: 'px-4 py-2',
          fontSize: 'text-sm',
          iconSize: 'h-5 w-5'
        };
      default:
        return {
          padding: 'px-3 py-1.5',
          fontSize: 'text-xs',
          iconSize: 'h-4 w-4'
        };
    }
  };

  const { padding, fontSize, iconSize } = getSize();
  const { icon, label, color, bgColor, borderColor } = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center ${padding} ${fontSize} font-medium rounded-full ${color} ${bgColor} border ${borderColor} ${className}`}
    >
      {icon}
      {showLabel && <span className="ml-1.5">{label}</span>}
    </motion.div>
  );
};

export default VCStatus;