import React, { useState } from 'react';
import { useSupplier, Supplier } from '../../contexts/SupplierContext';
import Modal from '../common/Modal';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Calendar, 
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface SupplierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
}

export default function SupplierDetailModal({ isOpen, onClose, supplier }: SupplierDetailModalProps) {
  const { 
    purchaseOrders, 
    supplierPayments, 
    getSupplierStats 
  } = useSupplier();
  
  const [activeTab, setActiveTab] = useState('info');
  
  const stats = getSupplierStats(supplier.id);
  const supplierOrders = purchaseOrders.filter(order => order.supplierId === supplier.id);
  const supplierPaymentsData = supplierPayments.filter(payment => payment.supplierId === supplier.id);

  const tabs = [
    { id: 'info', label: 'Informations', icon: Building2 },
    { id: 'orders', label: 'Commandes', icon: FileText },
    { id: 'payments', label: 'Paiements', icon: CreditCard }
  ];

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Payé
          </span>
        );
      case 'received':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Reçu
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Envoyé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Brouillon
          </span>
        );
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const badges = {
      'virement': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Virement' },
      'cheque': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chèque' },
      'espece': { bg: 'bg-green-100', text: 'text-green-800', label: 'Espèces' },
      'carte': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Carte' }
    };
    
    const badge = badges[method as keyof typeof badges] || badges.virement;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Fournisseur: ${supplier.name}`} size="xl">
      <div className="space-y-6">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.ordersCount}</div>
            <div className="text-xs text-orange-700">Commandes</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalPurchases.toLocaleString()}</div>
            <div className="text-xs text-blue-700">MAD Achats</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalPayments.toLocaleString()}</div>
            <div className="text-xs text-green-700">MAD Payés</div>
          </div>
          <div className={`border rounded-lg p-4 text-center ${
            stats.balance > 0 ? 'bg-red-50 border-red-200' : 
            stats.balance < 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`text-2xl font-bold ${
              stats.balance > 0 ? 'text-red-600' : 
              stats.balance < 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {stats.balance.toLocaleString()}
            </div>
            <div className={`text-xs ${
              stats.balance > 0 ? 'text-red-700' : 
              stats.balance < 0 ? 'text-green-700' : 'text-gray-700'
            }`}>
              MAD {stats.balance > 0 ? 'À payer' : stats.balance < 0 ? 'Crédit' : 'Soldé'}
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Informations générales</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{supplier.name}</p>
                      <p className="text-sm text-gray-500">ICE: {supplier.ice}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{supplier.contactPerson}</p>
                      <p className="text-sm text-gray-500">Personne de contact</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{supplier.phone}</p>
                      <p className="text-sm text-gray-500">Téléphone</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{supplier.email}</p>
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{supplier.address}</p>
                      <p className="text-sm text-gray-500">Adresse</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Conditions commerciales</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{supplier.paymentTerms} jours</p>
                      <p className="text-sm text-gray-500">Délai de paiement</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      {supplier.status === 'active' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{supplier.status === 'active' ? 'Actif' : 'Inactif'}</p>
                      <p className="text-sm text-gray-500">Statut</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(supplier.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-500">Date d'ajout</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Historique des commandes</h4>
            {supplierOrders.length > 0 ? (
              <div className="space-y-3">
                {supplierOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{order.number}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {order.totalTTC.toLocaleString()} MAD
                      </p>
                      <div className="mt-1">
                        {getOrderStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune commande pour ce fournisseur</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Historique des paiements</h4>
            {supplierPaymentsData.length > 0 ? (
              <div className="space-y-3">
                {supplierPaymentsData.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-600">{payment.reference}</p>
                      {payment.description && (
                        <p className="text-xs text-gray-500">{payment.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {payment.amount.toLocaleString()} MAD
                      </p>
                      <div className="mt-1">
                        {getPaymentMethodBadge(payment.paymentMethod)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun paiement pour ce fournisseur</p>
              </div>
            )}
          </div>
        )}

        {/* Résumé financier */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-4">Résumé Financier</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{stats.totalPurchases.toLocaleString()}</div>
              <div className="text-xs text-blue-700">MAD Total Achats</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{stats.totalPayments.toLocaleString()}</div>
              <div className="text-xs text-green-700">MAD Total Payés</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${
                stats.balance > 0 ? 'text-red-600' : 
                stats.balance < 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {stats.balance.toLocaleString()}
              </div>
              <div className={`text-xs ${
                stats.balance > 0 ? 'text-red-700' : 
                stats.balance < 0 ? 'text-green-700' : 'text-gray-700'
              }`}>
                MAD {stats.balance > 0 ? 'À payer' : stats.balance < 0 ? 'Crédit' : 'Soldé'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}