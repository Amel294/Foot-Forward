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

// Apply globally
router.use(checkSession);



function checkSession(req, res, next) {
  // Check if session and user exists
  if (req.session && req.session.user) {
    // User is authenticated
    res.locals.isAuthenticated = true;
  } else {
    // User is not authenticated
    res.locals.isAuthenticated = false;
  }
  next();
}

function signedin(req, res, next) {
  if (req.session && req.session.user) {
    // Reload the current page (client-side) using JavaScript
    res.redirect('/products')
  }
  next(); // Continue to the next middleware or route handler
}


//signup
router.get('/', controller.signUp);
router.get('/signup',signedin, controller.signUp);
router.get('/signin',signedin, controller.signIn);
router.get('/emailOtp',controller.otpPage)


router.get('/products',async  (req,res)=>{
    try {
        // Fetch the list of brands from the database
        const brands = await Brand.find();
    
        // Fetch the list of colors from the database
        const colors = await Color.find();
        const subcategories = await Category.find().distinct('Subcategory');
        const products = await Product.find().populate('brand').populate('subcategory').exec();
        const priceRange = await Product.aggregate([
            {
              $group: {
                _id: null,
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" }
              }
            }
          ]);
      
          const minPrice = priceRange[0].minPrice;
          const maxPrice = priceRange[0].maxPrice;
        // Render your EJS template and pass the brands and colors data
          // Log the brand of each product
          products.forEach((product) => {
            console.log(product.brand);
        });
        res.render('user/productview', { brands, colors,subcategories,products,minPrice, maxPrice  });
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
router.post('/logout',controller.logout)

module.exports = router;
