const express = require("express");
const router = express.Router();
const Product = require("../../model/productDB")

router.get('/products', async (req, res) => {
    let status = ["active","disabled"]
    if(!req.params.status){
        status = ["active"]
    }else{
        if(req.params.status){
            
        }
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Adjust the limit as needed
  
    try {
      const products = await Product.paginate({}, { page, limit, populate: 'variants.color variants.size subcategory brand' });
  
      res.render('products', { products: products.docs, activeRoute: 'products', totalPages: products.totalPages, currentPage: page });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
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
            { $inc: { 'variants.$.stock': newStock } },
            { new: true }
        );
        
        if (!updatedVariant) {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }

        // Send the updated stock value in the response
        const updatedStock = updatedVariant.variants.find(variant => variant._id.equals(variantId)).stock;
        res.json({ success: true, message: 'Stock updated successfully', newStock: updatedStock });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


module.exports = router;
