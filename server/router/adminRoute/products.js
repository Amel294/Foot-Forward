const express = require("express");
const router = express.Router();
const Product = require("../../model/productDB")
router.get('/products', async (req, res) => {
    const products = await Product.find().populate('variants.color variants.size subcategory');

    res.render('products', { products, activeRoute: 'products' });
});




router.get('/addProducts', (req, res) => {
    res.render('addProducts', { activeRoute: '' });
});

router.get('/addVarients', (req, res) => {
    res.render('addVarients', { activeRoute: '' });
});

module.exports = router;
