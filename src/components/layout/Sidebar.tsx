import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLicense } from '../../contexts/LicenseContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  BarChart3, 
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  TrendingUp,
  UserCheck,
  Truck,
  Shield
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onUpgrade: () => void;
}

export default function Sidebar({ open, setOpen, onUpgrade }: SidebarProps) {
  const { t } = useLanguage();
  const { licenseType } = useLicense();
  const { user } = useAuth();
  const subscriptionStatus = useSubscriptionStatus();

  // Vérifier si l'abonnement Pro est actif et non expiré
  const isProActive = user?.company.subscription === 'pro' && 
    user?.company.expiryDate && 
    !subscriptionStatus.isExpired;
  
  // Vérifier si l'activation est en cours
  const isActivationPending = localStorage.getItem('proActivationPending') === 'true';

  // Fonction pour vérifier les permissions
  const hasPermission = (permission: string) => {
    if (user?.isAdmin) return true; // Admin a accès à tout
    if (!user?.permissions) return false;
    return user.permissions[permission as keyof typeof user.permissions] || false;
  };
  const handleProFeatureClick = (e: React.MouseEvent, path: string) => {
    if (!isProActive) {
      e.preventDefault();
      onUpgrade();
    }
  };


  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard', permission: 'dashboard' },
    { icon: FileText, label: t('invoices'), path: '/invoices', permission: 'invoices' },
    { icon: FileCheck, label: 'Devis', path: '/quotes', permission: 'quotes' },
    { icon: Users, label: t('clients'), path: '/clients', permission: 'clients' },
    { icon: Package, label: t('products'), path: '/products', permission: 'products' },
    { icon: Truck, label: t('Fournisseurs'), path: '/suppliers', permission: 'suppliers' },
    
     { 
      icon: Truck, 
      label: 'Gestion Fournisseurs', 
      path: '/supplier-management',
      isPro: true,
      permission: 'supplierManagement'
    }, 

    
    { 
      icon: TrendingUp, 
      label: 'Gestion de Stock', 
      path: '/stock-management',
      isPro: true,
      permission: 'stockManagement'
    },
      { 
      icon: BarChart3, 
      label: 'Gestion financière', 
      path: '/reports',
      isPro: true,
      permission: 'reports'
    },
    { 
      icon: UserCheck, 
      label: 'Gestion Humaine', 
      path: '/hr-management',
      isPro: true,
      permission: 'hrManagement'
    },
    
    // Gestion de compte (seulement pour les admins Pro)
   {
      icon: Shield,
      label: 'Gestion de Compte',
      path: '/account-management',
      isPro: true,
      permission: 'settings'
    },
    
    { icon: Settings, label: t('settings'), path: '/settings', permission: 'settings' },
  ];

  // Filtrer les éléments de menu selon les permissions
  const visibleMenuItems = menuItems.filter(item => hasPermission(item.permission || ''));
  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-48'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {open && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">Facture.ma</h1>
                <p className="text-xs text-gray-500">ERP Morocco (V.1.25.3)</p>
          </div>
            )}
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {open ? (
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        <nav className="mt-6 px-3">
          <ul className="space-y-2">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isProFeature = item.isPro;
              const canAccess = !isProFeature || isProActive;
              
              return (
                <li key={item.path}>
                  {canAccess ? (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {open && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.label}</span>
                          {item.isPro && (
                            <span className="text-xs bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-bold">
                              PRO
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  ) : (
                    <button
                      onClick={(e) => handleProFeatureClick(e, item.path)}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-gray-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {open && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium ">{item.label}</span>
                          <span className="text-xs bg-red-800 text-red-900 px-1.5 py-0.5 rounded-full font-bold">
                            🔒
                          </span>
                        </div>
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* License Version */}
        <div className="absolute bottom-6 left-3 right-3">
          {/* Indicateur de rôle */}
          {user && (
            <div className={`mb-3 p-2 rounded-lg text-center text-xs ${
              user.email === 'admin@facture.ma'
                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                : user.isAdmin 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
            }`}>
              {user.email === 'admin@facture.ma' ? '🔧 Admin Plateforme' :
               user.isAdmin ? '👑 Administrateur' : '👤 Utilisateur'}
            </div>
          )}
          
          {/* Affichage du statut d'abonnement */}
          {subscriptionStatus.isExpired && user?.isAdmin ? (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-3 text-white text-center">
              <div className="text-xs font-medium mb-1">⚠️ Expiré</div>
              <div className="text-xs opacity-90">
                Expiré le: {subscriptionStatus.expiryDate ? 
                  new Date(subscriptionStatus.expiryDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short'
                  }) : 'récemment'}
              </div>
              <button
                onClick={onUpgrade}
                className="mt-2 w-full bg-white/20 hover:bg-white/30 rounded text-xs py-1 transition-colors"
              >
                Renouveler
              </button>
            </div>
          ) : subscriptionStatus.isExpiringSoon && user?.isAdmin ? (
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-3 text-white text-center">
              <div className="text-xs font-medium mb-1">⏰ Expire bientôt</div>
              <div className="text-xs opacity-90">
                {subscriptionStatus.daysRemaining} jour{subscriptionStatus.daysRemaining > 1 ? 's' : ''} restant{subscriptionStatus.daysRemaining > 1 ? 's' : ''}
              </div>
              <button
                onClick={onUpgrade}
                className="mt-2 w-full bg-white/20 hover:bg-white/30 rounded text-xs py-1 transition-colors"
              >
                Renouveler
              </button>
            </div>
          ) : isProActive ? (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-3 text-white text-center">
              <div className="text-xs font-medium mb-1">👑 Pro</div>
              {user?.company.expiryDate && (
                <div className="text-xs opacity-90">
                  Expire le: {new Date(user.company.expiryDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
              )}
            </div>
          ) : isActivationPending ? (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-3 text-white text-center">
              <div className="text-xs font-medium mb-1">⏳ Activation en cours</div>
              <div className="text-xs opacity-90">Traitement sous 2h</div>
            </div>
          ) : user?.isAdmin ? (
            <button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 rounded-lg p-3 text-white text-center transition-all duration-200 hover:shadow-lg"
            >
              <div className="text-xs font-medium">🆓 Free - Acheter version Pro</div>
            </button>
          ) : (
            <div className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg p-3 text-white text-center">
              <div className="text-xs font-medium">👤 Compte Utilisateur</div>
            </div>
          )}
          
        </div>
        
      </div>
      
    </>
  );
}