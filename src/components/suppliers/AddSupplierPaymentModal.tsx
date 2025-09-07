import React, { useState } from 'react';
import { useSupplier } from '../../contexts/SupplierContext';
import Modal from '../common/Modal';

interface AddSupplierPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSupplierPaymentModal({ isOpen, onClose }: AddSupplierPaymentModalProps) {
  const { suppliers, addSupplierPayment, getSupplierById, getSupplierStats } = useSupplier();
  const [formData, setFormData] = useState({
    supplierId: '',
    amount: 0,
    paymentMethod: 'virement' as const,
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierId || formData.amount <= 0) {
      alert('Veuillez sélectionner un fournisseur et saisir un montant');
      return;
    }

    const supplier = getSupplierById(formData.supplierId);
    if (!supplier) {
      alert('Fournisseur non trouvé');
      return;
    }
    
    addSupplierPayment({
      supplierId: formData.supplierId,
      supplier,
      amount: formData.amount,
      paymentMethod: formData.paymentMethod,
      paymentDate: formData.paymentDate,
      reference: formData.reference,
      description: formData.description
    });
    
    setFormData({
      supplierId: '',
      amount: 0,
      paymentMethod: 'virement',
      paymentDate: new Date().toISOString().split('T')[0],
      reference: '',
      description: ''
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  const selectedSupplierStats = formData.supplierId ? getSupplierStats(formData.supplierId) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau Paiement Fournisseur" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fournisseur *
          </label>
          <select
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Sélectionner un fournisseur</option>
            {suppliers.map(supplier => {
              const stats = getSupplierStats(supplier.id);
              return (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} - Balance: {stats.balance.toLocaleString()} MAD
                </option>
              );
            })}
          </select>
        </div>

        {selectedSupplierStats && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Informations Fournisseur</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p>Total achats: {selectedSupplierStats.totalPurchases.toLocaleString()} MAD</p>
                <p>Total paiements: {selectedSupplierStats.totalPayments.toLocaleString()} MAD</p>
              </div>
              <div>
                <p className={`font-bold ${
                  selectedSupplierStats.balance > 0 ? 'text-red-600' : 
                  selectedSupplierStats.balance < 0 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  Balance: {selectedSupplierStats.balance.toLocaleString()} MAD
                </p>
                <p>{selectedSupplierStats.ordersCount} commande{selectedSupplierStats.ordersCount > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant (MAD) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de paiement
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="virement">Virement bancaire</option>
              <option value="cheque">Chèque</option>
              <option value="espece">Espèces</option>
              <option value="carte">Carte bancaire</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de paiement
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Référence
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Numéro de référence"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnel)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Description du paiement..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200"
          >
            Enregistrer Paiement
          </button>
        </div>
      </form>
    </Modal>
  );
}