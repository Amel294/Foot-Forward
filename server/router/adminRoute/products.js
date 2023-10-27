const express = require("express");
const router = express.Router();

router.get('/products', (req, res) => {
    // Sample products data
    const products = [
        // ... Your products data ...
    ];
    res.render('products', { products, activeRoute: 'products' });
});

router.get('/addProducts', (req, res) => {
    res.render('addProducts', { activeRoute: '' });
});

router.get('/addVarients', (req, res) => {
    res.render('addVarients', { activeRoute: '' });
});

module.exports = router;
