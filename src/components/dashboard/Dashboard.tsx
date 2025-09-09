import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import StatsCards from './StatsCards';
import RecentInvoices from './RecentInvoices';
import TopProducts from './TopProducts';

export default function Dashboard() {
  const { user, checkSubscriptionExpiry } = useAuth();
  const { t } = useLanguage();
  const { invoices, clients, products } = useData();
  const subscriptionStatus = useSubscriptionStatus();

  // Vérifier l'expiration à l'ouverture du dashboard
  React.useEffect(() => {
    if (user) {
      checkSubscriptionExpiry();
    }
  }, [user, checkSubscriptionExpiry]);

  const hasAnyData = invoices.length > 0 || clients.length > 0 || products.length > 0;

  // Message de bienvenue personnalisé
  const getWelcomeMessage = () => {
    if (user?.email === 'admin@facture.ma') {
      return `Bienvenue Administrateur Facture.ma ! Vous gérez la plateforme.`;
    }
    if (user?.isAdmin) {
      return `Bienvenue ${user.name} ! Vous êtes connecté en tant qu'administrateur.`;
    } else {
      const permissionCount = user?.permissions ? Object.values(user.permissions).filter(Boolean).length : 0;
      return `Bienvenue ${user?.name} ! Vous avez accès à ${permissionCount} section${permissionCount > 1 ? 's' : ''} de l'entreprise ${user?.company?.name}.`;
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* Message de bienvenue personnalisé */}
      <div className={`rounded-xl border p-4 ${
        user?.isAdmin 
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200' 
          : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
      }`}>
        <p className={`text-sm font-medium ${
          user?.isAdmin ? 'text-indigo-800' : 'text-blue-800'
        }`}>
          {getWelcomeMessage()}
        </p>
      </div>
  
  {/* Alerte d'abonnement expiré pour les admins */}
  {subscriptionStatus.isExpired && user?.isAdmin && (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xl">⚠️</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-900">Abonnement Pro Expiré</h3>
          <p className="text-red-800">
            Votre abonnement Pro a expiré le {subscriptionStatus.expiryDate ? 
              new Date(subscriptionStatus.expiryDate).toLocaleDateString('fr-FR') : 'récemment'}.
          </p>
        </div>
      </div>
      <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-red-900 mb-2">🚫 Restrictions Actives</h4>
        <ul className="text-sm text-red-800 space-y-1">
          <li>• Vous êtes maintenant en version gratuite avec des limitations</li>
          <li>• Les comptes utilisateurs que vous avez créés sont temporairement bloqués</li>
          <li>• Fonctionnalités Pro désactivées (Gestion Stock, RH, Rapports avancés)</li>
          <li>• Limites: 10 factures, 10 clients, 20 produits, 10 devis</li>
        </ul>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={() => window.location.href = '/upgrade'}
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
        >
          Renouveler maintenant - 299 MAD/mois
        </button>
        <button
          onClick={() => {/* Masquer temporairement */}}
          className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
        >
          Plus tard
        </button>
      </div>
    </div>
  )}
  
      <StatsCards />

      {!hasAnyData && (
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bienvenue sur Facture.ma !</h3>
            <p className="text-gray-600 mb-4">
              Commencez par ajouter vos premiers clients et produits pour voir vos données apparaître ici.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                Ajouter un client
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Ajouter un produit
              </button>
            </div>
          </div>
        </div>
      )}

      <TopProducts />

      <RecentInvoices />
    </div>
  );
}