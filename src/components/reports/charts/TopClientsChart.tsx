import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Crown, AlertTriangle, CheckCircle } from 'lucide-react';

interface ClientData {
  name: string;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  invoicesCount: number;
}

interface TopClientsChartProps {
  data: ClientData[];
}

export default function TopClientsChart({ data }: TopClientsChartProps) {
  const [viewMode, setViewMode] = useState<'total' | 'paid' | 'unpaid'>('total');
  
  const getChartData = () => {
    return data.map(client => ({
      name: client.name.length > 15 ? client.name.substring(0, 15) + '...' : client.name,
      fullName: client.name,
      total: client.totalAmount,
      paid: client.paidAmount,
      unpaid: client.unpaidAmount,
      invoices: client.invoicesCount,
      paymentRate: client.totalAmount > 0 ? (client.paidAmount / client.totalAmount) * 100 : 0
    }));
  };

  const chartData = getChartData();
  const totalRevenue = data.reduce((sum, client) => sum + client.totalAmount, 0);
  const totalPaid = data.reduce((sum, client) => sum + client.paidAmount, 0);
  const totalUnpaid = data.reduce((sum, client) => sum + client.unpaidAmount, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.fullName}</p>
          <p className="text-sm text-gray-600">Total: {data.total.toLocaleString()} MAD</p>
          <p className="text-sm text-green-600">Payé: {data.paid.toLocaleString()} MAD</p>
          <p className="text-sm text-red-600">Non payé: {data.unpaid.toLocaleString()} MAD</p>
          <p className="text-sm text-gray-600">Factures: {data.invoices}</p>
          <p className="text-sm text-blue-600">Taux paiement: {data.paymentRate.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = () => {
    switch (viewMode) {
      case 'paid':
        return '#10B981';
      case 'unpaid':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  const getDataKey = () => {
    switch (viewMode) {
      case 'paid':
        return 'paid';
      case 'unpaid':
        return 'unpaid';
      default:
        return 'total';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Top 10 Clients</h3>
          <p className="text-sm text-gray-600">Classement par chiffre d'affaires</p>
        </div>
        
        {/* Toggle view mode */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('total')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'total' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Total
          </button>
          <button
            onClick={() => setViewMode('paid')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'paid' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Payé
          </button>
          <button
            onClick={() => setViewMode('unpaid')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'unpaid' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Non payé
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-blue-600">{totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-blue-700">MAD Total</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-lg font-bold text-green-600">{totalPaid.toLocaleString()}</div>
          <div className="text-xs text-green-700">MAD Payé</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-lg font-bold text-red-600">{totalUnpaid.toLocaleString()}</div>
          <div className="text-xs text-red-700">MAD Non payé</div>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              type="number"
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              type="category"
              dataKey="name"
              stroke="#6B7280"
              fontSize={11}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={getDataKey()}
              fill={getBarColor()}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Analyse des clients */}
      <div className="mt-6 space-y-3">
        <h4 className="font-medium text-gray-900">Analyse des Clients</h4>
        {data.slice(0, 3).map((client, index) => {
          const paymentRate = client.totalAmount > 0 ? (client.paidAmount / client.totalAmount) * 100 : 0;
          const isGoodPayer = paymentRate >= 80;
          
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                }`}>
                  {index === 0 ? <Crown className="w-4 h-4" /> : `#${index + 1}`}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-xs text-gray-500">
                    {client.invoicesCount} factures • {paymentRate.toFixed(1)}% payé
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {client.totalAmount.toLocaleString()} MAD
                  </p>
                  <p className="text-xs text-gray-500">
                    {client.unpaidAmount > 0 ? `${client.unpaidAmount.toLocaleString()} MAD en attente` : 'Tout payé'}
                  </p>
                </div>
                {isGoodPayer ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune donnée client disponible</p>
        </div>
      )}
    </div>
  );
}