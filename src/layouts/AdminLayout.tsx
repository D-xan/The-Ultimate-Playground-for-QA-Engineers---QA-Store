import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';

export default function AdminLayout() {
  const { logout } = useAuth();
  
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <aside className="w-64 flex-shrink-0 border-r bg-slate-900 text-white">
        <div className="flex h-16 items-center justify-center border-b border-slate-800">
          <span className="text-lg font-bold">Admin Portal</span>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/admin" className="block rounded bg-slate-800 px-4 py-2 text-sm">Dashboard</a>
          <a href="#" className="block rounded px-4 py-2 text-sm hover:bg-slate-800">Products</a>
          <a href="#" className="block rounded px-4 py-2 text-sm hover:bg-slate-800">Orders</a>
          <button onClick={logout} className="mt-8 block w-full rounded bg-red-600 px-4 py-2 text-sm text-left">Logout</button>
        </nav>
      </aside>
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <div className="font-semibold text-slate-800">Dashboard</div>
          <div>Admin</div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
