import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
      <h1 className="text-9xl font-black text-slate-200">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-slate-800">Page Not Found</h2>
      <p className="mt-2 text-slate-500">The page you are looking for doesn't exist.</p>
      <Link to="/" className="mt-8">
        <Button>Go Back Home</Button>
      </Link>
    </div>
  );
}
