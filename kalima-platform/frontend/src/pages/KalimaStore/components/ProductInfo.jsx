import React from "react";

const ProductInfo = ({ product, type, isRTL }) => {
  if (!product) return null;
  return (
    <div className="product-info">
      <h2 className="text-lg font-semibold">{product.title || product.name}</h2>
      <p className="text-sm text-muted">{product.description || product.summary}</p>
    </div>
  );
};

export default ProductInfo;
