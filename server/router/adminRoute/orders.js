const express = require("express");
const router = express.Router();
const Order = require("../../model/order")


router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('items.product'); // Populate both 'user' and 'items.product' fields

    res.render('orders', { activeRoute: 'orders', orders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Route to mark an order as delivered
router.post('/orders/mark-delivered/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order by ID and update its status to 'Delivered'
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { orderStatus: 'Delivered' } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error marking order as delivered:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to remove an order
router.delete('/orders/remove/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find and delete the order by ID using findByIdAndDelete
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order removed successfully' });
  } catch (error) {
    console.error('Error removing order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
module.exports = router;

