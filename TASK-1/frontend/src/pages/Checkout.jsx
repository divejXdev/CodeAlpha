import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';
import { API } from '../config';

const Checkout = () => {
  const { user } = useContext(AuthContext);

  const cartItems = useSelector((state) => state.cart.cartItems);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const getOrderItems = () =>
    cartItems.map((item) => ({
      product: item.productId,
      name: item.name,
      image: item.imageUrl,
      price: item.price,
      quantity: item.qty,
    }));

  const placeOrder = async () => {
    const orderPayload = {
      orderItems: getOrderItems(),

      shippingAddress: {
        address: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country,
      },

      paymentMethod: 'Cash on Delivery',

      itemsPrice: totalPrice,

      taxPrice: 0,

      shippingPrice: 0,

      totalPrice,
    };

    const res = await fetch(API.ORDERS, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${user.token}`,
  },
  body: JSON.stringify(orderPayload),
});

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Order Failed');
      return;
    }

    dispatch(clearCart());

    alert('Order Placed Successfully!');

    navigate('/ordersuccess');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    try {
      await placeOrder();

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="checkout-container">

      <h2>Checkout</h2>

      <div className="checkout-content">

        <form
          onSubmit={handleSubmit}
          className="shipping-form"
        >

          <h3>Shipping Address</h3>

          <input
            type="text"
            placeholder="Full Name"
            required
            value={address.fullName}
            onChange={(e) =>
              setAddress({
                ...address,
                fullName: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Street"
            required
            value={address.street}
            onChange={(e) =>
              setAddress({
                ...address,
                street: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="City"
            required
            value={address.city}
            onChange={(e) =>
              setAddress({
                ...address,
                city: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Postal Code"
            required
            value={address.postalCode}
            onChange={(e) =>
              setAddress({
                ...address,
                postalCode: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Country"
            required
            value={address.country}
            onChange={(e) =>
              setAddress({
                ...address,
                country: e.target.value,
              })
            }
          />

          <div className="checkout-summary">

            <h4>Total : ${totalPrice.toFixed(2)}</h4>

            <p>
              Payment Method :
              <strong> Cash on Delivery</strong>
            </p>

            <button
              type="submit"
              className="btn"
            >
              Place Order
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default Checkout;