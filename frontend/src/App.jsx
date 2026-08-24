import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import AISmartCare from './components/AISmartCare.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import FarmerDashboard from './pages/FarmerDashboard.jsx';
import MyProduct from './pages/MyProduct.jsx';
import CustomerCare from './pages/CustomerCare.jsx';
import RepairRequest from './pages/RepairRequest.jsx';
import TrackService from './pages/TrackService.jsx';
import WarrantyChecker from './pages/WarrantyChecker.jsx';
import UpgradeDevice from './pages/UpgradeDevice.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import TechnicianPortal from './pages/TechnicianPortal.jsx';
import LoginPage from './pages/LoginPage.jsx';

function MainApp() {
  const { user, role } = useApp();
  const [activeTab, setActiveTab] = useState('home');
  const [trackedTicketId, setTrackedTicketId] = useState('');

  // Render correct view based on navigation and authentication roles
  const renderView = () => {
    const secureTabs = ['my-farm', 'my-product', 'customer-care', 'request-repair', 'upgrade', 'admin-dashboard', 'tech-jobs'];
    if (!user && secureTabs.includes(activeTab)) {
      return <LoginPage redirectTab={activeTab} setActiveTab={setActiveTab} />;
    }

    switch (activeTab) {
      case 'login':
        return <LoginPage redirectTab="my-farm" initialIsLogin={true} setActiveTab={setActiveTab} />;
      case 'register':
        return <LoginPage redirectTab="my-farm" initialIsLogin={false} setActiveTab={setActiveTab} />;
      case 'home':
        return <LandingPage setActiveTab={setActiveTab} />;
      case 'my-farm':
        return role === 'FARMER' ? <FarmerDashboard setActiveTab={setActiveTab} /> : <LandingPage setActiveTab={setActiveTab} />;
      case 'my-product':
        return role === 'FARMER' ? <MyProduct /> : <LandingPage setActiveTab={setActiveTab} />;
      case 'customer-care':
        return role === 'FARMER' ? <CustomerCare setActiveTab={setActiveTab} setTrackedTicketId={setTrackedTicketId} /> : <LandingPage setActiveTab={setActiveTab} />;
      case 'request-repair':
        return role === 'FARMER' ? <RepairRequest setActiveTab={setActiveTab} setTrackedTicketId={setTrackedTicketId} /> : <LandingPage setActiveTab={setActiveTab} />;
      case 'track-service':
        return <TrackService initialTicketId={trackedTicketId} />;
      case 'warranty':
        return role === 'FARMER' ? <WarrantyChecker setActiveTab={setActiveTab} /> : <LandingPage setActiveTab={setActiveTab} />;
      case 'upgrade':
        return role === 'FARMER' ? <UpgradeDevice /> : <LandingPage setActiveTab={setActiveTab} />;
      case 'admin-dashboard':
        return role === 'ADMIN' ? <AdminDashboard /> : <LandingPage setActiveTab={setActiveTab} />;
      case 'tech-jobs':
        return role === 'TECHNICIAN' ? <TechnicianPortal /> : <LandingPage setActiveTab={setActiveTab} />;
      default:
        return <LandingPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${role === 'ADMIN' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-1 w-full relative">
        {renderView()}
      </main>

      {/* Floating AI Diagnostic Chat Drawer */}
      {role === 'FARMER' && (
        <AISmartCare setActiveTab={setActiveTab} setTrackedTicketId={setTrackedTicketId} />
      )}

      {/* Footer copyright */}
      <footer className={`py-6 border-t text-center text-[10px] font-bold ${
        role === 'ADMIN' ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-gray-100 text-gray-400'
      }`}>
        <p>© 2026 SMART IRRIGATION Ecosystem. All rights reserved. "Smart farming. Smarter decisions."</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
