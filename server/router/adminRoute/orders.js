const express = require("express");
const router = express.Router();

// Sample orders data
const orders = [
    // ... Your orders data ...
];

router.get('/orders', (req, res) => {
    res.render('orders', { activeRoute: 'orders', orders: orders });
});

module.exports = router;
