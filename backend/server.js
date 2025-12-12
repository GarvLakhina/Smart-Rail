const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock Menu Data
const menuItems = [
  { id: 1, name: 'Veg Thali', price: 150, category: 'Meals', image: '/food-images/veg_thali.png' },
  { id: 2, name: 'Chicken Biryani', price: 220, category: 'Meals', image: '/food-images/chicken_biryani.png' },
  { id: 3, name: 'Paneer Butter Masala', price: 180, category: 'Curries', image: '/food-images/paneer_butter_masala.png' },
  { id: 4, name: 'Roti', price: 15, category: 'Breads', image: '/food-images/roti.png' },
  { id: 5, name: 'Masala Dosa', price: 80, category: 'Breakfast', image: '/food-images/masala_dosa.png' },
  { id: 6, name: 'Idli Vada', price: 60, category: 'Breakfast', image: '/food-images/idli_vada.png' },
  { id: 7, name: 'Coffee', price: 20, category: 'Beverages', image: '/food-images/coffee.png' },
  { id: 8, name: 'Tea', price: 15, category: 'Beverages', image: '/food-images/tea.png' },
  { id: 9, name: 'Mineral Water', price: 20, category: 'Beverages', image: '/food-images/mineral_water.png' },
  { id: 10, name: 'Samosa', price: 20, category: 'Snacks', image: '/food-images/samosa.png' },
];

// Mock Orders
let orders = [];

// Get Menu
app.get('/api/food/menu', (req, res) => {
  res.json({ success: true, menu: menuItems });
});

// Place Order
app.post('/api/food/order', (req, res) => {
  try {
    const { ticketNumber, items } = req.body;

    if (!ticketNumber || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid order data' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderedItems = [];
    
    for (const item of items) {
      const menuItem = menuItems.find(m => m.id === item.id);
      if (menuItem) {
        totalAmount += menuItem.price * item.quantity;
        orderedItems.push({ ...menuItem, quantity: item.quantity });
      }
    }

    // Calculate estimated delivery time
    // Logic: Base 15 mins + 2 mins per coach distance (randomized for mock)
    const baseTime = 15;
    const randomVariance = Math.floor(Math.random() * 15); // 0-14 mins
    const estimatedTime = baseTime + randomVariance;

    const newOrder = {
      id: Date.now().toString(),
      ticketNumber,
      items: orderedItems,
      totalAmount,
      status: 'Preparing',
      estimatedTime: `${estimatedTime} mins`,
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);

    res.json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ success: false, error: 'Failed to place order' });
  }
});

// Get Orders by Ticket Number
app.get('/api/food/orders/:ticketNumber', (req, res) => {
  const { ticketNumber } = req.params;
  const userOrders = orders.filter(o => o.ticketNumber === ticketNumber);
  res.json({ success: true, orders: userOrders });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
