import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/utils/api';
import { useCart } from '@/store/useCart';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Star, Heart, ArrowLeft, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await api.products.getById(id || '');
        if (data) {
          setProduct(data);
          if (data.attributes?.color?.length > 0) setSelectedColor(data.attributes.color[0]);
          if (data.attributes?.size?.length > 0) setSelectedSize(data.attributes.size[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.salePrice,
        image: product.images[0],
        quantity: 1,
        color: selectedColor,
        size: selectedSize,
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8 text-center text-slate-500">Loading product...</div>;
  }

  if (!product) {
    return <div className="container mx-auto p-8 text-center text-slate-500">Product not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl bg-slate-100 overflow-hidden border border-border">
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images.slice(1, 4).map((img: string, i: number) => (
              <div key={i} className="aspect-square rounded-xl bg-slate-100 overflow-hidden border border-border cursor-pointer hover:ring-2 ring-primary">
                <img src={img} alt="Thumbnail" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">{product.brandId}</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-900">{product.rating}</span>
            </div>
            <span className="text-sm text-slate-500">{product.reviewsCount} reviews</span>
            <span className="text-slate-300">|</span>
            <span className={product.stock > 0 ? "text-success font-medium" : "text-danger font-medium"}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="mb-6 flex items-end gap-3">
            <span className="text-4xl font-black text-slate-900">${product.salePrice.toFixed(2)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-xl text-slate-400 line-through mb-1">${product.price.toFixed(2)}</span>
                <span className="rounded bg-danger/10 px-2 py-1 text-xs font-bold text-danger mb-2">Save {product.discount}%</span>
              </>
            )}
          </div>

          <p className="text-slate-600 mb-8 leading-relaxed">{product.description}</p>

          {/* Variants */}
          {product.attributes?.color && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Color: <span className="text-slate-500 font-normal">{selectedColor}</span></h3>
              <div className="flex flex-wrap gap-3">
                {product.attributes.color.map((c: string) => (
                  <button 
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedColor === c ? 'border-primary bg-primary/5 text-primary' : 'border-border text-slate-600 hover:border-slate-300'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.attributes?.size && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Size: <span className="text-slate-500 font-normal">{selectedSize}</span></h3>
              <div className="flex flex-wrap gap-3">
                {product.attributes.size.map((s: string) => (
                  <button 
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`h-10 w-14 rounded-lg border text-sm font-bold transition-all ${selectedSize === s ? 'border-primary bg-primary text-white' : 'border-border text-slate-600 hover:border-slate-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-auto">
            <Button 
              size="lg" 
              className="flex-1 rounded-xl text-lg h-14" 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button size="icon" variant="outline" className="h-14 w-14 rounded-xl shrink-0">
              <Heart className="h-6 w-6 text-slate-500" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Truck className="h-5 w-5 text-slate-400" /> Free Shipping
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <ShieldCheck className="h-5 w-5 text-slate-400" /> 30-Day Returns
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
