import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { Button } from '@/components/ui/Button';
import { asset } from '@/utils/asset';

export interface ProductCardProps {
  product: any; // We'll type this properly later or assume db.json schema
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product details
    addItem({
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images ? product.images[0] : product.image,
      quantity: 1,
    });
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group flex flex-col rounded-2xl border border-border bg-white p-3 transition-all hover:shadow-xl hover:shadow-primary/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 mb-4">
        <img 
          src={asset(product.images ? product.images[0] : product.image)} 
          alt={product.name} 
          loading="lazy"
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="rounded bg-danger px-2 py-1 text-[10px] font-bold text-white">
              -{product.discount}%
            </span>
          )}
          {product.stock < 10 && (
            <span className="rounded bg-warning px-2 py-1 text-[10px] font-bold text-white">
              Low Stock
            </span>
          )}
        </div>

        {/* Hover Actions */}
        <div className={`absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <button 
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-md hover:bg-primary hover:text-white transition-colors"
            onClick={(e) => { e.preventDefault(); /* Wishlist logic */ }}
          >
            <Heart className="h-4 w-4" />
          </button>
          <button 
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-md hover:bg-primary hover:text-white transition-colors"
            onClick={(e) => { e.preventDefault(); /* Quick View logic */ }}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="mb-1 text-xs text-muted">{product.brand}</div>
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="mb-3 flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-slate-700">{product.rating}</span>
          <span className="text-xs text-muted">({product.reviewsCount})</span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900">${product.salePrice.toFixed(2)}</span>
            {product.discount > 0 && (
              <span className="text-xs text-muted line-through">${product.price.toFixed(2)}</span>
            )}
          </div>
          <Button 
            size="icon" 
            className="h-10 w-10 rounded-full" 
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
};
