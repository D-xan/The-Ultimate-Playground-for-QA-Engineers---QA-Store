import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/utils/api';
import { ProductCard } from '@/components/customer/ProductCard';
import { getDynamicId, getTestId } from '@/utils/testUtils';
import { ArrowRight, Zap, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Challenge mode hooks
  const heroId = getDynamicId('hero-banner');
  const productsContainerId = getDynamicId('featured-products');

  useEffect(() => {
    const loadData = async () => {
      try {
        const featured = await api.products.getFeatured();
        setProducts(featured);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        id={heroId}
        data-testid={getTestId('hero-section')}
        className="relative overflow-hidden pt-16 pb-32"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5"></div>
        <div className="container relative mx-auto px-4 text-center z-10">
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 text-slate-900">
            The Ultimate Playground for <span className="text-primary">QA Engineers</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 mb-10">
            Practice Selenium, Playwright, and Cypress on a site that looks like a premium e-commerce store but behaves like a real-world testing challenge.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="rounded-full px-8 font-semibold"
              onClick={() => {
                document.getElementById(productsContainerId)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Start Shopping
            </Button>
            <Link to="/practice">
              <Button size="lg" variant="outline" className="rounded-full px-8 font-semibold">
                View Challenges
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-border">
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Truck className="h-6 w-6" /></div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Free Fake Shipping</h3>
              <p className="text-sm text-slate-500">Orders process instantly with mock APIs.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-border">
            <div className="p-3 bg-accent/10 rounded-xl text-accent"><ShieldCheck className="h-6 w-6" /></div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Zero Security</h3>
              <p className="text-sm text-slate-500">Use customer123 to access everything.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-border">
            <div className="p-3 bg-warning/10 rounded-xl text-warning"><Zap className="h-6 w-6" /></div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Dynamic IDs</h3>
              <p className="text-sm text-slate-500">Enable challenge mode to test your locators.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Featured Products</h2>
          <Button variant="ghost" className="text-primary hover:text-primary-hover">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
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
          <div 
            id={productsContainerId}
            data-testid={getTestId('product-grid')}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
