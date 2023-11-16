const express = require("express");
const router = express.Router();
const Product = require("../../model/productDB")

router.get('/products', async (req, res) => {
    const products = await Product.find().populate('variants.color variants.size subcategory brand');

    res.render('products', { products, activeRoute: 'products' });
});




router.get('/addProducts', (req, res) => {
    res.render('addProducts', { activeRoute: '' });
});

router.get('/addVarients', (req, res) => {
    res.render('addVarients', { activeRoute: '' });
});



//model
router.get('/products/variants/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId).populate('variants.color variants.size');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ product });
    } catch (error) {
        console.error('Error fetching product variants:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




// API endpoint for updating stock
router.post('/api/updateStock', async (req, res) => {
    try {
        const { variantId, newStock } = req.body;

        // Find the product variant by its ID and update the stock
        const updatedVariant = await Product.findOneAndUpdate(
            { 'variants._id': variantId },
            { $set: { 'variants.$.stock': newStock } },
            { new: true }
        );

        if (!updatedVariant) {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }

        res.json({ success: true, message: 'Stock updated successfully' });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


module.exports = router;
