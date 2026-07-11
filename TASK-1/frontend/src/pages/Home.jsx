import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API_URL =
          process.env.REACT_APP_API_URL || "http://localhost:5000";

        console.log("API URL:", API_URL);

        const url = `${API_URL}/api/products`;

        console.log("Fetching:", url);

        const res = await fetch(url);

        console.log("Response Status:", res.status);

        const text = await res.text();

        console.log("Response Body:", text);

        const data = JSON.parse(text);

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