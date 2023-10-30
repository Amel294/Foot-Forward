const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); // Import nodemailer here
const dotenv = require("dotenv");
const path = require('path'); // Import the 'path' module
const userDB = require("../model/userDB")
const controller = require("../controller/userController")
const Product = require('../model/productDB');
const Brand = require('../model/productAttribute/brandDB');
const Color = require('../model/productAttribute/colorDB');
const Size = require('../model/productAttribute/sizeDB');
const Category = require('../model/productAttribute/categoryDB');
const { findOne } = require('../model/counterDB');





//signup
router.get('/', controller.signUp);
router.get('/signup', controller.signUp);
router.get('/signin', controller.signIn);
router.get('/emailOtp',controller.otpPage)

//product
// router.get('/product', (req, res) => {
//     // Placeholder data
//     const productData = {
//         productName: 'Brand New T-Shirt',
//         productPrice: '$19.99',
//         originalPrice: '$29.99',
//         discount: '35%',
//         images: [
//             'https://via.placeholder.com/400x400?text=Product+Image+1',
//             'https://via.placeholder.com/400x400?text=Product+Image+2',
//             'https://via.placeholder.com/400x400?text=Product+Image+3',
//             'https://via.placeholder.com/400x400?text=Product+Image+4',
//         ],
//         colors: [
//             { name: 'Red', imageUrl: 'red_placeholder_image_url' },
//             { name: 'Blue', imageUrl: 'blue_placeholder_image_url' },
//             { name: 'Green', imageUrl: 'green_placeholder_image_url' },
//         ],
//         sizes: ['1', '7', '8', '9'],
//         description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
//         // Add more placeholder data as needed
//     };

//     res.render('user/productSingle', { productData });
// });


// router.get('/product/:productId', async (req, res) => {
//      const productId = req.params.productId;

//     try {
//         // Create a Mongoose query to find the product by ID
//         await const productQuery = Product.findOne({ productId: productId });
//         const color = color.findOne({ color: productId.variants.color });
//         // console.log(color)
//         // // Populate the referenced fields on the query
//         // productQuery.populate(productId.variants.color).populate(productId.variants.size).populate(productId.subcategory).populate(productId.brand);

//         // // Execute the query to fetch the product with the populated fields
//         // const populatedProduct = await productQuery.exec();

//         if (!populatedProduct) {
//             return res.status(404).json({ message: 'Product not found' });
//         }
//         console.log(populatedProduct)
//         // Now, 'populatedProduct' will contain the populated values
//         // You can send 'populatedProduct' in the response
//         res.json(populatedProduct);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });
router.get('/products',async  (req,res)=>{
    try {
        // Fetch the list of brands from the database
        const brands = await Brand.find();
    
        // Fetch the list of colors from the database
        const colors = await Color.find();
        const subcategories = await Category.find().distinct('Subcategory');
        const products = await Product.find().populate('brand').populate('subcategory').exec();

        // Render your EJS template and pass the brands and colors data
        res.render('user/productview', { brands, colors,subcategories,products  });
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
      }
})

router.get('/product/:productId', async (req, res) => {
    const productId = req.params.productId;

    try {
        // Find the product by productId
        const product = await Product.findOne({ productId: productId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Initialize an array to store variants
        const variants = [];

        // Iterate through each variant
        for (const variant of product.variants) {
            // Get the color ID for the current variant
            const colorId = variant.color;

            // Find the color by its ID
            const color = await Color.findById(colorId); // Assuming you have a "Color" model

            // Get the size ID for the current variant
            const sizeId = variant.size;

            // Find the size by its ID
            const size = await Size.findById(sizeId); // Assuming you have a "Size" model

            // Push the variant object with color, size, and stock to the variants array
            variants.push({
                color: color,
                size: size,
                stock: variant.stock,
            });
        }
        console.log("varinets")
        console.log(variants)

        // Find the brand by its ID
        const brand = await Brand.findById(product.brand); // Assuming you have a "Brand" model

        // Find the category by its ID
        const category = await Category.findById(product.subcategory); // Assuming you have a "Category" model

        // Construct the response object with the populated data
        const productData = {
            name: product.name,
            brand: brand, // Use the populated 'brand' object
            category: category, // Use the populated 'category' object
            subcategory: product.subcategory, // You can also keep the subcategory ID if needed
            price: product.price,
            description: product.description,
            trending: product.trending,
            productId: product.productId,
            isEnabled: product.isEnabled,
            images: product.images,
            variants: variants,
        };

        console.log(productData);
        // Send the response with the populated product
        res.render('user/productSingle', { productData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});







router.get('/myOrders', controller.myOrders);





//api

router.post('/signup',controller.signup_POST );
router.post('/resendOtp', controller.resend);
router.post('/verifyOtp', controller.verifyOTP);



router.post('/postUser', controller.postUser);
router.post('/authenticate', controller.authenticatePassword);
  

module.exports = router;
