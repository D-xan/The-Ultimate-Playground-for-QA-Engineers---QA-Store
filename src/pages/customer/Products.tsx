import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/utils/api';
import { ProductCard } from '@/components/customer/ProductCard';
import { isBugActive } from '@/utils/bugHunt';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  const categoryId = searchParams.get('category');
  const rawSearch = searchParams.get('search') ?? undefined;
  const searchQuery = rawSearch?.toLowerCase();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let all = await api.products.getAll();
        
        if (categoryId) {
          all = all.filter((p: any) => p.categoryId === categoryId);
        }
        
        if (searchQuery && rawSearch) {
          // Bug Hunt `search-case`: matching is case-sensitive when the bug is active.
          all = isBugActive('search-case')
            ? all.filter((p: any) => p.name.includes(rawSearch))
            : all.filter((p: any) => p.name.toLowerCase().includes(searchQuery));
        }
        
        setProducts(all);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [categoryId, searchQuery, rawSearch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {searchQuery ? `Search Results for "${searchParams.get('search')}"` : categoryId ? 'Category Products' : 'All Products'}
        <span className="text-lg font-normal text-slate-500 ml-4">({products.length} found)</span>
      </h1>
      
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
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <p className="text-xl">No products found in this category.</p>
        </div>
      ) : (
        <>
        {/* Cards use h3 titles; this keeps the heading outline h1 > h2 > h3. */}
        <h2 className="sr-only">Results</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        </>
      )}
    </div>
  );
}
