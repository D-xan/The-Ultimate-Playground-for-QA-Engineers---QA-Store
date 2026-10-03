import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { ProductCard } from '@/components/customer/ProductCard';
import { Tag } from 'lucide-react';
import { isBugActive } from '@/utils/bugHunt';

export default function Deals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const all = await api.products.getAll();
        // Filter products with a discount and take top 12.
        // Bug Hunt `deals-sort-order`: sorts ascending, so the smallest discounts come first.
        const dir = isBugActive('deals-sort-order') ? -1 : 1;
        const discounted = all.filter((p: any) => p.discount > 0)
                              .sort((a: any, b: any) => dir * (b.discount - a.discount))
                              .slice(0, 12);
        setDeals(discounted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadDeals();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8 border-b border-border pb-4">
        <Tag className="h-10 w-10 text-danger" />
        <h1 className="text-3xl font-extrabold text-slate-900">Weekly Deals</h1>
        <span className="rounded-full bg-danger/10 px-3 py-1 text-sm font-semibold text-danger">Up to 80% OFF</span>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-border bg-white p-3">
              <div className="aspect-square rounded-xl bg-slate-200 mb-4"></div>
              <div className="h-4 w-1/4 rounded bg-slate-200 mb-2"></div>
              <div className="h-5 w-3/4 rounded bg-slate-200 mb-3"></div>
              <div className="h-4 w-1/2 rounded bg-slate-200 mb-4"></div>
              <div className="h-8 w-full rounded bg-slate-200 mt-auto"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {deals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
