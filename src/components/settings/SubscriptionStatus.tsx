import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import { Crown, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function SubscriptionStatus() {
  const { user } = useAuth();
  const subscriptionStatus = useSubscriptionStatus();

  if (!user?.company) return null;

  const { subscription, subscriptionDate, expiryDate } = user.company;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          subscriptionStatus.isExpired 
            ? 'bg-gradient-to-br from-red-500 to-red-600'
            : subscriptionStatus.isExpiringSoon
              ? 'bg-gradient-to-br from-orange-500 to-amber-500'
              : subscription === 'pro'
                ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                : 'bg-gradient-to-br from-gray-500 to-gray-600'
        }`}>
          {subscriptionStatus.isExpired ? (
            <AlertTriangle className="w-5 h-5 text-white" />
          ) : subscriptionStatus.isExpiringSoon ? (
            <Clock className="w-5 h-5 text-white" />
          ) : subscription === 'pro' ? (
            <Crown className="w-5 h-5 text-white" />
          ) : (
            <CheckCircle className="w-5 h-5 text-white" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Statut de l'Abonnement</h3>
      </div>

      <div className="space-y-4">
        {/* Statut actuel */}
        <div className={`p-4 rounded-lg border-2 ${
          subscriptionStatus.isExpired 
            ? 'bg-red-50 border-red-200'
            : subscriptionStatus.isExpiringSoon
              ? 'bg-orange-50 border-orange-200'
              : subscription === 'pro'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-semibold ${
                subscriptionStatus.isExpired ? 'text-red-900' :
                subscriptionStatus.isExpiringSoon ? 'text-orange-900' :
                subscription === 'pro' ? 'text-yellow-900' : 'text-gray-900'
              }`}>
                {subscriptionStatus.isExpired ? '🔴 Abonnement Expiré' :
                 subscriptionStatus.isExpiringSoon ? '🟠 Expiration Proche' :
                 subscription === 'pro' ? '🟡 Pro Actif' : '🔵 Version Gratuite'}
              </h4>
              <p className={`text-sm ${
                subscriptionStatus.isExpired ? 'text-red-700' :
                subscriptionStatus.isExpiringSoon ? 'text-orange-700' :
                subscription === 'pro' ? 'text-yellow-700' : 'text-gray-700'
              }`}>
                {subscriptionStatus.isExpired 
                  ? `Expiré depuis ${Math.abs(subscriptionStatus.daysRemaining)} jour${Math.abs(subscriptionStatus.daysRemaining) > 1 ? 's' : ''}`
                  : subscriptionStatus.isExpiringSoon 
                    ? `Expire dans ${subscriptionStatus.daysRemaining} jour${subscriptionStatus.daysRemaining > 1 ? 's' : ''}`
                    : subscription === 'pro' 
                      ? 'Toutes les fonctionnalités disponibles'
                      : 'Fonctionnalités limitées'
                }
              </p>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${
                subscriptionStatus.isExpired ? 'text-red-600' :
                subscriptionStatus.isExpiringSoon ? 'text-orange-600' :
                subscription === 'pro' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {subscription === 'pro' ? 'PRO' : 'FREE'}
              </div>
            </div>
          </div>
        </div>

        {/* Détails de l'abonnement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptionDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Date de souscription</span>
              </div>
              <p className="text-blue-800">
                {new Date(subscriptionDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}

          {expiryDate && subscription === 'pro' && (
            <div className={`border rounded-lg p-4 ${
              subscriptionStatus.isExpired 
                ? 'bg-red-50 border-red-200'
                : subscriptionStatus.isExpiringSoon
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className={`w-4 h-4 ${
                  subscriptionStatus.isExpired ? 'text-red-600' :
                  subscriptionStatus.isExpiringSoon ? 'text-orange-600' : 'text-green-600'
                }`} />
                <span className={`font-medium ${
                  subscriptionStatus.isExpired ? 'text-red-900' :
                  subscriptionStatus.isExpiringSoon ? 'text-orange-900' : 'text-green-900'
                }`}>
                  Date d'expiration
                </span>
              </div>
              <p className={`${
                subscriptionStatus.isExpired ? 'text-red-800' :
                subscriptionStatus.isExpiringSoon ? 'text-orange-800' : 'text-green-800'
              }`}>
                {new Date(expiryDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Actions selon le statut */}
        {(subscriptionStatus.isExpired || subscriptionStatus.isExpiringSoon) && user?.isAdmin && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => window.location.href = '/upgrade'}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                subscriptionStatus.isExpired
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white'
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <Crown className="w-5 h-5" />
                <span>
                  {subscriptionStatus.isExpired ? 'Renouveler maintenant' : 'Renouveler avant expiration'} - 299 MAD/mois
                </span>
              </span>
            </button>
          </div>
        )}

        {subscription === 'pro' && !subscriptionStatus.isExpired && !subscriptionStatus.isExpiringSoon && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              ✅ Votre abonnement Pro est actif. Vous bénéficiez de toutes les fonctionnalités avancées.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}