import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { API } from "../config";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(API.PRODUCTS);
        const data = await res.json();

        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      <div className="hero-banner">
        <h1>Welcome to ShopNest</h1>
        <p>Discover the best products at unbeatable prices.</p>
      </div>

      <h2>Featured Products</h2>

      {loading ? (
        <div>Loading...</div>
      ) : products.length === 0 ? (
        <div>
          <h3>No Products Found</h3>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;