import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/store/useCart';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2 } from 'lucide-react';
import { getTestId } from '@/utils/testUtils';

const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().regex(/^[0-9A-Za-z\s\-]{3,10}$/, 'Invalid postal code format. Use 3-10 alphanumeric characters.'),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

export default function Checkout() {
  const [step, setStep] = useState(1);
  const { getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const total = getTotal();

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema)
  });

  const onSubmitShipping = (_data: ShippingFormValues) => {
    setStep(2);
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    setStep(4);
  };

  if (step === 4) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <CheckCircle2 className="mx-auto h-24 w-24 text-success mb-6" />
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Order Confirmed!</h1>
        <p className="text-lg text-slate-500 mb-8">Your mock order has been placed successfully.</p>
        <Button onClick={() => navigate('/')} size="lg">Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>
      
      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2"></div>
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm border-4 border-white ${step >= s ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}
          >
            {s}
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        {step === 1 && (
          <form onSubmit={handleSubmit(onSubmitShipping)}>
            <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Input placeholder="First Name" {...register('firstName')} error={errors.firstName?.message} data-testid={getTestId('checkout-firstName')} />
              <Input placeholder="Last Name" {...register('lastName')} error={errors.lastName?.message} data-testid={getTestId('checkout-lastName')} />
              <Input placeholder="Email Address" type="email" {...register('email')} error={errors.email?.message} className="sm:col-span-2" />
              <Input placeholder="Address" {...register('address')} error={errors.address?.message} className="sm:col-span-2" />
              <Input placeholder="City" {...register('city')} error={errors.city?.message} />
              <Input placeholder="Postal Code" {...register('postalCode')} error={errors.postalCode?.message} />
            </div>
            <Button type="submit" className="w-full">Continue to Payment</Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
            <h2 className="text-xl font-bold mb-6">Payment Method (Fake)</h2>
            <div className="space-y-4 mb-6">
              <label className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-slate-50">
                <input type="radio" name="payment" defaultChecked className="h-4 w-4 text-primary" />
                <span className="font-medium text-slate-900">Credit Card</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-slate-50">
                <input type="radio" name="payment" className="h-4 w-4 text-primary" />
                <span className="font-medium text-slate-900">PayPal</span>
              </label>
            </div>
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button type="submit" className="flex-1">Review Order</Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleComplete}>
            <h2 className="text-xl font-bold mb-6">Review Your Order</h2>
            <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-100">
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 pb-4 border-b border-border">
                <span className="text-slate-600">Tax</span>
                <span className="font-medium">${(total * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">${(total * 1.08).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button type="submit" className="flex-1" data-testid={getTestId('place-order-btn')}>Place Order</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
