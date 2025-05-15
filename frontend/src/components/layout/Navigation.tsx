import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileSignature, 
  ShieldCheck, 
  LineChart,
  History,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DIDCard from '../shared/DIDCard';

const Navigation: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['manufacturer', 'distributor', 'logistics', 'retailer', 'auditor', 'consumer'],
    },
    {
      to: '/issue',
      label: 'Issue Credential',
      icon: <FileSignature className="w-5 h-5" />,
      roles: ['manufacturer', 'distributor', 'logistics', 'retailer'],
    },
    {
      to: '/verify',
      label: 'Verify Credential',
      icon: <ShieldCheck className="w-5 h-5" />,
      roles: ['manufacturer', 'distributor', 'logistics', 'retailer', 'auditor', 'consumer'],
    },
    {
      to: '/timeline/latest',
      label: 'Product Timeline',
      icon: <LineChart className="w-5 h-5" />,
      roles: ['manufacturer', 'distributor', 'logistics', 'retailer', 'auditor', 'consumer'],
    },
    {
      to: '/revocation',
      label: 'Revocation History',
      icon: <History className="w-5 h-5" />,
      roles: ['manufacturer', 'distributor', 'logistics', 'retailer', 'auditor'],
    },
  ];

  const filteredNavItems = navigationItems.filter(
    item => currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-col h-screen w-64 bg-slate-900 text-white p-4 fixed left-0 top-0">
        <div className="flex items-center justify-center mb-8 mt-4">
          <ShieldCheck className="w-8 h-8 text-blue-400 mr-2" />
          <h1 className="text-xl font-bold">TrustChain VC</h1>
        </div>
        
        <div className="mb-6">
          <DIDCard />
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => 
                    `flex items-center py-2 px-4 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center py-2 px-4 mt-auto text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-3">Logout</span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
          <div className="flex items-center">
            <ShieldCheck className="w-6 h-6 text-blue-400 mr-2" />
            <h1 className="text-lg font-bold">TrustChain VC</h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-slate-700 z-50"
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-slate-400">
                        {currentUser?.role.toUpperCase()}
                      </div>
                      <div className="px-4 py-2 text-sm font-medium border-b border-slate-700">
                        {currentUser?.name}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      >
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-800"
            >
              <nav className="px-4 pt-2 pb-3 space-y-1">
                {filteredNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center py-2 px-3 rounded-md ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`
                    }
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Navigation;