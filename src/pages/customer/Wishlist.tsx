import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { ProductCard } from '@/components/customer/ProductCard';
import { Heart } from 'lucide-react';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const all = await api.products.getAll();
        // Just mock some random products as wishlist for demo
        setWishlist([all[10], all[42], all[67]].filter(Boolean));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
        <Heart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-slate-900">My Wishlist</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-border bg-white p-3">
              <div className="aspect-square rounded-xl bg-slate-200 mb-4"></div>
              <div className="h-4 w-1/4 rounded bg-slate-200 mb-2"></div>
              <div className="h-5 w-3/4 rounded bg-slate-200 mb-3"></div>
            </div>
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <Heart className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <p className="text-xl">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <h2 className="sr-only">Saved products</h2>
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
