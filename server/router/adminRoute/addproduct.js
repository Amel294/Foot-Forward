const express = require('express');
const router = express.Router();
const productController = require('../../controller/productController');
const multer = require('multer');
const storage = multer.memoryStorage(); // use memory storage to process image with sharp
const upload = multer({ storage: storage });


router.post('/addProduct', productController.uploadImages, productController.addProductWithVariants);
module.exports = router;
