import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/utils/api';
import { ProductCard } from '@/components/customer/ProductCard';
import { getDynamicId, getTestId } from '@/utils/testUtils';
import { ArrowRight, Zap, ShieldCheck, Truck, Target, ShoppingBag } from 'lucide-react';
import { practiceChallenges, tools } from '@/data/challenges';
import { PARENT_URL } from '@/config/brand';
import { Button } from '@/components/ui/Button';

const features = [
  { icon: Truck, title: 'Free Fake Shipping', text: 'Orders process instantly with mock APIs.', tone: 'bg-primary/10 text-primary' },
  { icon: ShieldCheck, title: 'Zero Security', text: 'Use customer123 to access everything.', tone: 'bg-accent/10 text-accent' },
  { icon: Zap, title: 'Dynamic IDs', text: 'Enable challenge mode to test your locators.', tone: 'bg-warning/10 text-warning' },
];

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
        className="relative overflow-hidden pt-16 pb-20 sm:pt-24"
      >
        {/* Soft brand glow and a faint grid instead of a stock photo */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] max-w-full -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#64748b_1px,transparent_1px),linear-gradient(to_bottom,#64748b_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"></div>
        </div>
        <div className="container relative mx-auto px-4 text-center z-10">
          <a
            href={PARENT_URL}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-white py-1.5 pl-1.5 pr-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-primary/60"
            data-testid="home-brand-badge"
          >
            <img src={`${import.meta.env.BASE_URL}brand/randomly-logo-64.webp`} alt="" width={24} height={24} className="h-6 w-6 rounded-full" />
            QA Playground <span className="text-slate-400">by</span> <span className="font-semibold text-slate-900">Randomly.online</span>
          </a>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 text-slate-900 text-balance">
            The Ultimate Playground for <span className="text-primary">QA Engineers</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 mb-10 text-pretty">
            Practice Selenium, Playwright, and Cypress on a site that looks like a premium e-commerce store but behaves like a real-world testing challenge.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/practice"
              id="home-view-challenges"
              data-testid="home-view-challenges"
              className="group relative isolate inline-flex h-14 items-center gap-2 rounded-full bg-primary px-8 text-lg font-bold text-slate-900 shadow-[0_0_0_4px_rgba(234,179,8,0.25),0_10px_30px_-5px_rgba(234,179,8,0.6)] transition-all hover:-translate-y-0.5 hover:bg-yellow-400 hover:shadow-[0_0_0_6px_rgba(234,179,8,0.3),0_14px_36px_-6px_rgba(234,179,8,0.7)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50"
            >
              <span aria-hidden className="absolute -inset-1.5 -z-10 rounded-full bg-primary/50 blur-lg animate-pulse motion-reduce:animate-none"></span>
              <Target className="h-5 w-5" />
              View Challenges
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="h-14 rounded-full px-8 font-semibold"
              onClick={() => {
                document.getElementById(productsContainerId)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Shopping
            </Button>
          </div>
          <p className="mt-6 text-sm text-slate-500 text-balance">
            {practiceChallenges.length} hands-on challenges · {tools.length} testing tools · free, no sign-up
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto mb-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, text, tone }) => (
            <div key={title} className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-border transition-colors hover:border-primary/50">
              <div className={`p-3 rounded-xl ${tone}`}><Icon className="h-6 w-6" /></div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Featured Products</h2>
          <Link to="/products" className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-hover">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
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
