import React from 'react';
import { BsCart3 } from 'react-icons/bs';

interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  price?: number;
  image?: string;
  purchaseUrl: string;
  status?: string;
  is_digital?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const handleCardClick = () => {
    window.open(product.purchaseUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="product-card bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer flex flex-col h-full">
      {/* Product Image with status badge */}
      <div className="relative h-48 overflow-hidden bg-gray-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* Digital product badge */}
        {product.is_digital && (
          <span className="absolute top-4 left-4 z-20 px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm flex items-center gap-1">
            Digital
          </span>
        )}

        {/* Status badge */}
        {product.status && (
          <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full ${
            product.status === 'NEW'
              ? 'bg-green-100 text-green-800'
              : product.status === 'SALE'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {product.status}
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 relative z-10">
        {/* Category */}
        <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">
          {product.category}
        </div>

        {/* Product Name */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-xs mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price and Actions */}
        <div className="flex flex-col mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {product.price ? (
                <>
                  <span className="text-lg font-bold text-gray-900">
                    ${parseFloat(product.price.toString()).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">AUD</span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">$0</span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="px-2 py-1 text-gray-600 hover:text-gray-900 text-xs font-medium transition-colors"
            >
              View Details
            </button>
          </div>

          {/* Purchase Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="w-full px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
          >
            <BsCart3 className="w-3 h-3" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;