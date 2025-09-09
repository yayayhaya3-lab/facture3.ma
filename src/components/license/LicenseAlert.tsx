import React from 'react';
import { useLicense } from '../../contexts/LicenseContext';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import { AlertTriangle, Crown, X } from 'lucide-react';

interface LicenseAlertProps {
  onUpgrade: () => void;
}

export default function LicenseAlert({ onUpgrade }: LicenseAlertProps) {
  const { isLimitReached, limitMessage, licenseType } = useLicense();
  const subscriptionStatus = useSubscriptionStatus();
  const [isVisible, setIsVisible] = React.useState(true);

  // Ne pas afficher si Pro actif, ou si abonnement expiré (autre notification prioritaire)
  if (!isLimitReached || (licenseType === 'pro' && !subscriptionStatus.isExpired) || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-semibold text-lg">
              {subscriptionStatus.isExpired ? 'Abonnement Pro Expiré' : 'Version Gratuite - Limite Atteinte'}
            </p>
            <p className="text-sm opacity-90">
              {subscriptionStatus.isExpired 
                ? 'Votre abonnement Pro a expiré. Renouvelez-le pour retrouver toutes les fonctionnalités.'
                : limitMessage
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onUpgrade}
            className="inline-flex items-center space-x-2 bg-white text-orange-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg"
          >
            <Crown className="w-4 h-4" />
            <span>{subscriptionStatus.isExpired ? 'Renouveler' : 'Acheter'} la version Pro</span>
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Masquer temporairement"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}