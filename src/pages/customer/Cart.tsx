import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/store/useCart';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { getTestId } from '@/utils/testUtils';
import { taxRate } from '@/utils/bugHunt';
import { asset } from '@/utils/asset';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal } = useCart();
  const navigate = useNavigate();
  const total = getTotal();
  const tax = total * taxRate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Your Cart is Empty</h2>
        <p className="text-slate-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="sr-only">Items in your cart</h2>
          {items.map((item) => (
            <div 
              key={item.id} 
              data-testid={getTestId(`cart-item-${item.productId}`)}
              className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border border-border rounded-2xl shadow-sm"
            >
              <img src={asset(item.image)} alt={item.name} className="w-24 h-24 object-cover rounded-xl bg-slate-100" />
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-slate-900">{item.name}</h3>
                <p className="text-sm text-slate-500 mb-2">
                  {item.color && <span>Color: {item.color} </span>}
                  {item.size && <span>Size: {item.size}</span>}
                </p>
                <div className="font-bold text-primary" data-testid={getTestId('cart-unit-price')}>${item.price.toFixed(2)}</div>
              </div>
              
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <div className="flex items-center border border-border rounded-lg">
                  <button 
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    data-testid={getTestId('cart-qty-decrease')}
                    className="p-2 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium" data-testid={getTestId('cart-qty')}>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    data-testid={getTestId('cart-qty-increase')}
                    className="p-2 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <button 
                  onClick={() => removeItem(item.id)}
                  data-testid={getTestId('cart-remove')}
                  className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span data-testid={getTestId('cart-subtotal')}>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span data-testid={getTestId('cart-tax')}>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-3 mt-3 flex justify-between font-bold text-lg text-slate-900">
                <span>Total</span>
                <span data-testid={getTestId('cart-total')}>${(total * (1 + taxRate())).toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full text-lg h-12 rounded-xl"
              onClick={handleCheckout}
              data-testid={getTestId('checkout-button')}
            >
              Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
