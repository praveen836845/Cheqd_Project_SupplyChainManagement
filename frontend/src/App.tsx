import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ProvideAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DIDAuth from './pages/DIDAuth';
import Dashboard from './pages/Dashboard';
import IssueCredential from './pages/IssueCredential';
import VerifyCredential from './pages/VerifyCredential';
import ProductTimeline from './pages/ProductTimeline';
import ConsumerVerify from './pages/ConsumerVerify';
import RevocationPanel from './pages/RevocationPanel';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />
      <ProvideAuth>
        <Router>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<DIDAuth />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/issue" element={
                <ProtectedRoute>
                  <IssueCredential />
                </ProtectedRoute>
              } />
              <Route path="/verify" element={
                <ProtectedRoute>
                  <VerifyCredential />
                </ProtectedRoute>
              } />
              <Route path="/timeline/:productId" element={
                <ProtectedRoute>
                  <ProductTimeline />
                </ProtectedRoute>
              } />
              <Route path="/consumer/verify" element={<ConsumerVerify />} />
              <Route path="/revocation" element={
                <ProtectedRoute>
                  <RevocationPanel />
                </ProtectedRoute>
              } />
            </Routes>
          </AnimatePresence>
        </Router>
      </ProvideAuth>
    </>
  );
}

export default App;