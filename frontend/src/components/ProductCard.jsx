import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/product.css';

const ProductCard = ({ product }) => {
  const handleImageError = (event) => {
    event.currentTarget.src = '/images/product-fallback.svg';
  };

  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} className="product-image" onError={handleImageError} />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">${product.price}</p>
        <Link to={`/product/${product._id}`} className="btn">View Details</Link>
      </div>
    </div>
  );
};

export default ProductCard;
