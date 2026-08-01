import React, { useEffect, useState, useRef } from 'react';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { api } from '@/utils/api';
import { ProductCard } from '@/components/customer/ProductCard';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

export default function LazyLoadingChallenge() {
  const [products, setProducts] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const all = await api.products.getAll();
        setProducts(all);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const currentProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          // Simulate network delay
          setTimeout(() => {
            setVisibleCount(prev => prev + 4);
            setLoadingMore(false);
          }, 1500);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore]);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Store Lazy Loading</h1>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Scroll down to trigger lazy loading of new items",
    "description": "Execute a script to scroll the page or a specific container down to the bottom to trigger the loading of more items.",
    "positive": [
      "New items are appended to the list.",
      "A loading spinner appears temporarily."
    ],
    "negative": [
      "Scrolling doesn't trigger the load.",
      "The list reaches the end prematurely."
    ]
  },
  {
    "title": "Verify that the number of items increases after scrolling",
    "description": "Count the items before scrolling, perform the scroll, wait, and verify the new count is higher.",
    "positive": [
      "The total item count increases by the expected batch size.",
      "The new items are distinct from the old ones."
    ],
    "negative": [
      "The item count remains the same.",
      "Duplicate items are loaded."
    ]
  },
  {
    "title": "Wait for new items to fully load",
    "description": "Wait until the loading indicator disappears and the newly added items (e.g., images) are fully rendered.",
    "positive": [
      "The loading indicator vanishes.",
      "Images inside the new items trigger their onload events."
    ],
    "negative": [
      "The loading indicator persists indefinitely.",
      "Images fail to load or show broken icons."
    ]
  }
]} /></div>
        <p className="text-slate-500">Practice interacting with dynamic infinite scroll and waiting for network calls to finish.</p>
        
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-64 rounded-xl bg-slate-200"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4" id="lazy-product-grid">
          {currentProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      {!loading && hasMore && (
        <div ref={observerTarget} className="flex justify-center mt-12 py-8" id="lazy-loading-indicator">
          {loadingMore && (
            <div className="flex items-center text-slate-500">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
              <span>Loading more products...</span>
            </div>
          )}
        </div>
      )}
      
      {!loading && !hasMore && products.length > 0 && (
        <div className="text-center mt-12 text-slate-500 font-medium bg-slate-50 py-4 rounded-xl border border-slate-200" id="lazy-end-message">
          You've reached the end of the catalog!
        </div>
      )}
    </div>
  );
}
