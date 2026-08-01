import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { Package, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getTestId } from '@/utils/testUtils';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const all = await api.orders.getAll();
        setOrders(all.slice(0, 10)); // Take 10 for demo
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
        <Package className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl border border-border"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-border border-dashed">
          <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-slate-600">No orders yet</h2>
          <p className="text-slate-400 mt-2 mb-6">You haven't placed any orders. Start exploring our store!</p>
          <Button>Start Shopping</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-border rounded-xl shadow-sm overflow-hidden" data-testid={getTestId('order-item')}>
              <div className="bg-slate-50 border-b border-border p-4 sm:px-6 flex flex-wrap gap-4 justify-between items-center text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Order Number</p>
                  <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Date Placed</p>
                  <p className="font-semibold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Total Amount</p>
                  <p className="font-semibold text-slate-900">${order.totalAmount.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full font-medium ${
                    order.status === 'Delivered' ? 'bg-success/10 text-success' : 
                    order.status === 'Processing' ? 'bg-warning/10 text-warning' : 
                    'bg-primary/10 text-primary'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="p-4 sm:px-6">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{item.name}</span>
                      <span className="text-slate-500 text-sm">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-slate-700">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 p-4 border-t border-border flex justify-end">
                <Button variant="outline" size="sm" className="gap-2">
                  View Details <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
