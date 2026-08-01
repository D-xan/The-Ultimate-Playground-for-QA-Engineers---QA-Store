import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/utils/api';

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const all = await api.categories.getAll();
        setCategories(all.slice(0, 12)); // Take first 12 for demo
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-2xl border border-border"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              onClick={() => navigate(`/products?category=${cat.id}`)}
              className="group relative flex h-48 flex-col items-center justify-center overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-border cursor-pointer transition-all hover:border-primary hover:shadow-lg"
            >
              {cat.image && (
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="absolute inset-0 h-full w-full object-cover opacity-30 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-40"
                />
              )}
              <div className="relative z-10 p-6 text-center">
                <h2 className="text-2xl font-bold text-slate-900 group-hover:text-primary drop-shadow-md">{cat.name}</h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
