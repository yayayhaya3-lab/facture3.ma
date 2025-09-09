import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { DataProvider } from './contexts/DataContext';
import { LicenseProvider } from './contexts/LicenseContext';
import { UserManagementProvider } from './contexts/UserManagementContext';
import { useSubscriptionStatus } from './hooks/useSubscriptionStatus';
import ExpirationNotification from './components/auth/ExpirationNotification';
import ExpiredAccountModal from './components/auth/ExpiredAccountModal';
import HomePage from './components/home/HomePage';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import InvoicesList from './components/invoices/InvoicesList';
import CreateInvoice from './components/invoices/CreateInvoice';
import QuotesList from './components/quotes/QuotesList';
import CreateQuote from './components/quotes/CreateQuote';
import ClientsList from './components/clients/ClientsList';
import ProductsList from './components/products/ProductsList';
import Settings from './components/settings/Settings';
import Reports from './components/reports/Reports';
import LicenseAlert from './components/license/LicenseAlert';
import UpgradePage from './components/license/UpgradePage';
import ExpiryAlert from './components/license/ExpiryAlert';
import ProUpgradeSuccess from './components/license/ProUpgradeSuccess';
import { useLicense } from './contexts/LicenseContext';
import AdminDashboard from './components/admin/AdminDashboard';
import StockManagement from './components/stock/StockManagement';
import HRManagement from './components/hr/HRManagement';
import SupplierManagement from './components/suppliers/SupplierManagement';
import SuppliersSection from './components/suppliers/SuppliersSection';
import AccountManagement from './components/account/AccountManagement';
import { SupplierProvider } from './contexts/SupplierContext';
import SubscriptionGuard from './components/license/SubscriptionGuard';

function AppContent() {
  const { 
    user, 
    isAuthenticated, 
    showExpiryAlert, 
    setShowExpiryAlert, 
    expiredDate,
    isSubscriptionExpired,
    isSubscriptionExpiringSoon,
    subscriptionDaysRemaining
  } = useAuth();
  const { showSuccessModal, setShowSuccessModal, upgradeExpiryDate } = useLicense();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUpgradePage, setShowUpgradePage] = useState(false);
  const [showExpirationNotification, setShowExpirationNotification] = useState(true);
  const [showExpiredAccountModal, setShowExpiredAccountModal] = useState(false);

  // Vérifier le statut de l'abonnement au chargement
  useEffect(() => {
    if (user && isAuthenticated) {
      // Si l'abonnement est expiré et que c'est un utilisateur géré, afficher le modal de blocage
      if (isSubscriptionExpired && !user.isAdmin) {
        setShowExpiredAccountModal(true);
      }
      
      // Si l'abonnement expire bientôt et que c'est un admin, afficher la notification
      if (isSubscriptionExpiringSoon && user.isAdmin) {
        setShowExpirationNotification(true);
      }
    }
  }, [user, isAuthenticated, isSubscriptionExpired, isSubscriptionExpiringSoon]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  // Si c'est l'admin de facture.ma, afficher le dashboard admin
  if (user?.email === 'admin@facture.ma') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </div>
    );
  }
  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Notification d'expiration proche */}
        {isSubscriptionExpiringSoon && user?.isAdmin && showExpirationNotification && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <ExpirationNotification
              daysRemaining={subscriptionDaysRemaining}
              onRenew={() => {
                setShowExpirationNotification(false);
                setShowUpgradePage(true);
              }}
              onDismiss={() => setShowExpirationNotification(false)}
            />
          </div>
        )}
        
        <LicenseAlert onUpgrade={() => setShowUpgradePage(true)} />
        <Sidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen} 
          onUpgrade={() => setShowUpgradePage(true)} 
        />
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} ${
          isSubscriptionExpiringSoon && user?.isAdmin && showExpirationNotification ? 'mt-20' : ''
        }`}>
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invoices" element={<InvoicesList />} />
              <Route path="/invoices/create" element={<CreateInvoice />} />
              <Route path="/quotes" element={<QuotesList />} />
              <Route path="/quotes/create" element={<CreateQuote />} />
              <Route path="/clients" element={<ClientsList />} />
              <Route path="/products" element={<ProductsList />} />
              <Route path="/suppliers" element={<SuppliersSection />} />
              <Route path="/stock-management" element={<StockManagement />} />
              <Route path="/supplier-management" element={<SupplierManagement />} />
              <Route path="/hr-management" element={<HRManagement />} />
              <Route path="/account-management" element={<AccountManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
        
        
        {showUpgradePage && (
          <UpgradePage onClose={() => setShowUpgradePage(false)} />
        )}
        
        {showExpiryAlert && expiredDate && (
          <ExpiryAlert
            isOpen={showExpiryAlert}
            onRenew={() => {
              setShowExpiryAlert(false);
              setShowUpgradePage(true);
            }}
            onLater={() => setShowExpiryAlert(false)}
            expiryDate={expiredDate}
          />
        )}
        
        {showSuccessModal && upgradeExpiryDate && (
          <ProUpgradeSuccess
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            expiryDate={upgradeExpiryDate}
          />
        )}
        
        {/* Modal de compte expiré */}
        {showExpiredAccountModal && user?.company?.expiryDate && (
          <ExpiredAccountModal
            isOpen={showExpiredAccountModal}
            onClose={() => setShowExpiredAccountModal(false)}
            isAdmin={user.isAdmin}
            expiryDate={user.company.expiryDate}
          />
        )}
      </div>
    </SubscriptionGuard>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <UserManagementProvider>
            <SupplierProvider>
              <DataProvider>
                <LicenseProvider>
                  <AppContent />
                </LicenseProvider>
              </DataProvider>
            </SupplierProvider>
          </UserManagementProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;