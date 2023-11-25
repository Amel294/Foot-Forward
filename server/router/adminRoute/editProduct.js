const express = require('express');
const router = express.Router();
const productController = require('../../controller/productController');
const multer = require('multer');
const storage = multer.memoryStorage(); // use memory storage to process image with sharp
const upload = multer({ storage: storage });
const productDB = require('../../model/productDB')
router.get('/editProduct/:productId', productController.getProductData);



router.put('/update-product', async (req, res) => {
    try {
      if (!req.body) {
        throw new Error('Request body is empty');
      }
      const productId = req.body.productId;
      console.log("Received productId:", productId);

      const deletedImages = Array.isArray(req.body.deletedImages) ? req.body.deletedImages : [req.body.deletedImages].filter(Boolean);
      const product = await productDB.findOne({ productId: productId });



      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      // Update product details
      product.name = req.body.name || product.name;
      product.price = req.body.price || product.price;
      product.category = req.body.category || product.category;
      product.subcategory = req.body.subcategory || product.subcategory;
      product.description = req.body.description || product.description;
      product.brand = req.body.newBrand || product.brand;
      // ... handle other fields as needed ...
  
      // Handle image deletion
      if (deletedImages.length) {
        product.images = product.images.filter(image => !deletedImages.includes(image._id.toString()));
      }
      await product.save();
      console.log("product saved")
      res.status(200).send({message: "success"});

    } catch (error) {
      console.error('Error in PUT /update-product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
module.exports = router;
