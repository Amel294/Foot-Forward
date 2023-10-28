const express = require('express');
const router = express.Router();
const productAttributeController = require('../controller/productAttributeController');
const productController = require('../controller/productController');
const multer = require('multer');
// BRANDS
router.post('/brands', productAttributeController.addBrand);
router.put('/brands/:id', productAttributeController.editBrand);
router.delete('/brands/:id', productAttributeController.deleteBrand);
router.get('/brands', productAttributeController.getAllBrands);
router.get('/brands/:id', productAttributeController.getBrandById);


// COLORS
router.post('/colors', productAttributeController.addColor);
router.delete('/colors/:id', productAttributeController.deleteColor);
router.get('/colors', productAttributeController.getAllColors);
router.get('/colors/:id', productAttributeController.getColorById);
router.put('/colors/:id', productAttributeController.updateColor);


// SIZES
router.post('/sizes', productAttributeController.addSize);
router.delete('/sizes/:id', productAttributeController.deleteSize);
router.get('/sizes', productAttributeController.getAllSizes);
router.get('/sizes/:id', productAttributeController.getSizeById);
router.put('/sizes/:id', productAttributeController.updateSize);


// CATEGORIES

router.post('/category', productAttributeController.addSubCategory);
router.get('/category/:mainCategory',productAttributeController.getSubCategory);
router.delete('/category/:mainCategory/:subcategoryName', productAttributeController.deleteSubcategory);

//add product


const storage = multer.memoryStorage(); // use memory storage to process image with sharp
const upload = multer({ storage: storage });


router.get('/productIDLastAdded',productController.getLastProductIDAdded)


router.post('/test', (req, res) => {
    res.send('Test Route Works');
});



module.exports = router;
