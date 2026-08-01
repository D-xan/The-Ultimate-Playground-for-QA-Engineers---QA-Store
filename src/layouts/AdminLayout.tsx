import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import { Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 relative">
      {/* Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      <aside className={`w-64 flex-shrink-0 border-r bg-slate-900 text-white flex-col ${isMobileMenuOpen ? 'flex absolute inset-y-0 left-0 z-40' : 'hidden'} md:relative md:flex`}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <span className="text-lg font-bold">Admin Portal</span>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/admin" className="block rounded bg-slate-800 px-4 py-2 text-sm">Dashboard</a>
          <a href="#" className="block rounded px-4 py-2 text-sm hover:bg-slate-800">Products</a>
          <a href="#" className="block rounded px-4 py-2 text-sm hover:bg-slate-800">Orders</a>
          <button onClick={logout} className="mt-8 block w-full rounded bg-red-600 px-4 py-2 text-sm text-left">Logout</button>
        </nav>
      </aside>
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-600" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <div className="font-semibold text-slate-800 hidden sm:block">Dashboard</div>
          </div>
          <div className="text-sm font-medium">Admin</div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
