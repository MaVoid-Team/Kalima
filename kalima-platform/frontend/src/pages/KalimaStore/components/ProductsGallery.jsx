import React from "react";

const ProductsGallery = ({ images = [] }) => {
  return (
    <div className="products-gallery">
      {images && images.length ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((src, i) => (
            <img key={i} src={src} alt={`product-${i}`} className="w-full h-auto" />
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted">No images</div>
      )}
    </div>
  );
};

export default ProductsGallery;
