import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, ShieldAlert } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="flex flex-col items-center">
        <motion.div
          className="flex space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            animate={{
              rotate: [0, 10, 0, -10, 0],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "loop",
            }}
          >
            <Shield className="h-16 w-16 text-blue-400" />
          </motion.div>
          
          <motion.div
            animate={{
              rotate: [0, -10, 0, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "loop",
              delay: 0.5,
            }}
          >
            <CheckCircle2 className="h-16 w-16 text-emerald-400" />
          </motion.div>
          
          <motion.div
            animate={{
              rotate: [0, 10, 0, -10, 0],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "loop",
              delay: 1,
            }}
          >
            <ShieldAlert className="h-16 w-16 text-amber-400" />
          </motion.div>
        </motion.div>
        
        <motion.div
          className="mt-8 text-white text-2xl font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Loading secure environment...
        </motion.div>
        
        <motion.div
          className="mt-4 flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-blue-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "loop",
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;