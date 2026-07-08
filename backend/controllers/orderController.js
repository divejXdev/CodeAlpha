const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,

      paymentMethod: 'Cash on Delivery',

      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,

      isPaid: false,
      isDelivered: false,
    });

    const createdOrder = await order.save();

    const message = `
      <h2>Order Confirmation</h2>
      <p>Hello ${req.user.name},</p>

      <p>Your order has been placed successfully.</p>

      <p><strong>Order ID:</strong> ${createdOrder._id}</p>

      <p><strong>Total Amount:</strong> $${createdOrder.totalPrice.toFixed(2)}</p>

      <p><strong>Payment Method:</strong> Cash on Delivery</p>

      <p>
        Shipping Address:
        ${shippingAddress.address},
        ${shippingAddress.city},
        ${shippingAddress.country}
      </p>

      <p>Thank you for shopping with ShopNest ❤️</p>
    `;

    await sendEmail({
      email: req.user.email,
      subject: 'ShopNest - Order Confirmation',
      message,
    });

    res.status(201).json(createdOrder);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    });

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email');

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    order.isDelivered = req.body.status === 'Delivered';

    if (order.isDelivered) {
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();

    res.json(updatedOrder);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrders,
  updateOrderStatus,
};