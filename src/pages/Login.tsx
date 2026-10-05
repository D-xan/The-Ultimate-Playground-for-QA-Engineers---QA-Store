import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/store/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = (data: LoginFormValues) => {
    setError('');
    const { email, password } = data;

    // Hardcoded credentials as per requirements
    if (email === 'customer@example.com' && password === 'customer123') {
      login({ email, name: 'Customer User' }, 'customer');
      navigate('/');
    } else if (email === 'admin@example.com' && password === 'admin123') {
      login({ email, name: 'Admin User' }, 'admin');
      navigate('/admin');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <main className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to your account</p>
        </div>

        <div data-testid="demo-accounts" className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-semibold">Demo accounts (test data only)</p>
          <p className="mt-1">Customer: <code>customer@example.com</code> / <code>customer123</code></p>
          <p>Admin: <code>admin@example.com</code> / <code>admin123</code></p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />
          </div>

          {error && <p className="text-sm font-medium text-danger text-center">{error}</p>}

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-6 rounded-lg bg-slate-100 p-4 text-xs text-slate-600">
          <p className="font-semibold mb-1">Demo Credentials:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Customer: customer@example.com / customer123</li>
            <li>Admin: admin@example.com / admin123</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
