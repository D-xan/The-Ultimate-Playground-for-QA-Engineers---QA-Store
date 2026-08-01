import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import { useCart } from '@/store/useCart';
import { useTheme } from '@/store/useTheme';
import { ShoppingCart, Heart, User, LogOut, Settings, Search, Menu, Package, Activity, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const CustomerNavbar = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        
        {/* Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-slate-600">
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">QA Store</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Home</Link>
          <Link to="/products" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Products</Link>
          <Link to="/categories" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Categories</Link>
          <Link to="/deals" className="text-sm font-medium text-danger hover:text-danger/80 transition-colors">Deals</Link>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search products, brands, categories..." 
            className="h-10 w-full rounded-full border border-border bg-slate-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                navigate(`/products?search=${encodeURIComponent(e.currentTarget.value.trim())}`);
              }
            }}
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link to="/wishlist" className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
            <Heart className="h-5 w-5" />
          </Link>
          
          <Link to="/cart" className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors overflow-hidden border border-primary/20"
              >
                {user.avatar ? <img src={user.avatar} alt="Avatar" /> : <User className="h-5 w-5" />}
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-border bg-white py-2 shadow-lg animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-border mb-2">
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <User className="h-4 w-4 text-slate-400" /> My Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <Package className="h-4 w-4 text-slate-400" /> Orders
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <Settings className="h-4 w-4 text-slate-400" /> Settings
                    </Link>
                    
                    <div className="my-2 border-t border-border"></div>
                    
                    <button 
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }} 
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-danger/5"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" className="hidden sm:flex rounded-full">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
