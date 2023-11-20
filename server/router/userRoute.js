const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); // Import nodemailer here
const mongoose = require('mongoose'); // Corrected 'Mongoose' to 'mongoose'
const { Schema, ObjectId } = mongoose;

const dotenv = require("dotenv");
const path = require('path'); // Import the 'path' module
const userDB = require("../model/userDB")
const controller = require("../controller/userController")
const Product = require('../model/productDB');
const Brand = require('../model/productAttribute/brandDB');
const Color = require('../model/productAttribute/colorDB');
const Size = require('../model/productAttribute/sizeDB');
const Category = require('../model/productAttribute/categoryDB');
const Cart = require("../model/cart")
const wishlist = require("../model/wishlist")
const { findOne } = require('../model/counterDB');
const Address = require("../model/address")
const Order = require('../model/order'); // Adjust the path to your Order model
const userMiddleware = require('../middleware/userSideMiddleware')
const cartController = require("../controller/cartController")
const productController = require("../controller/productController")
const orderController = require("../controller/orderController")
const addressController = require("../controller/addressController")
const wishlistController = require("../controller/wishlistController")
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

//home
router.get('/', controller.home);

//signup

router.get('/signup', signedin, controller.signUp);
router.get('/signin', signedin, controller.signIn);
router.get('/emailOtp', controller.otpPage)


router.get('/products', productController.getAllProducts)

router.get('/product/:productId', productController.productById);



router.get('/products/filter', async (req, res) => {
  try {
    const { brand, color, category } = req.query;

    let filters = {};
    if (brand) {
      filters.brand = { $in: brand.split(',') };
    }
    if (color) {
      filters['variants.color'] = { $in: color.split(',') };
    }
    if (category) {
      filters.subcategory = { $in: category.split(',') };
    }

    // Fetch all necessary data
    const brands = await Brand.find({ isDeleted: false });
    const colors = await Color.find({ isDeleted: false });
    const subcategories = await Category.find({ isDeleted: false }).distinct('Subcategory');
    let products = await Product.find(filters).populate('brand').populate('subcategory').exec();
    let userWishlist ;
    if(req.session.user){
      const userId = req.session.user.id;
       userWishlist = await wishlist.findOne({ user: new mongoose.Types.ObjectId(userId) });
  
      // Add isInWishlist field to each product
      products = products.map(product => {
        product = product.toObject(); // Convert Mongoose document to plain JavaScript object
        product.isInWishlist = userWishlist && userWishlist.products.includes(product._id.toString());
        return product;
      });
      console.log(products)
    }
    
    // Retrieve user's wishlist
   
    // Pass all the necessary data to the EJS template
    res.render('user/includeUser/content_productView_singleProduct', {
      products,
      brands,
      colors,
      subcategories,
      Wishlist: userWishlist,
      req
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});












router.get('/myOrders', userMiddleware.isUserLogged, controller.myOrders);





//api

router.post('/signup', controller.signup_POST);
router.post('/resendOtp', controller.resend);
router.post('/verifyOtp', controller.verifyOTP);



router.post('/postUser', controller.postUser);
router.post('/authenticate', controller.authenticatePassword);
router.post('/logout', controller.logout)


router.get('/cart/total', cartController.cartTotal);
router.get('/cart', cartController.getCartPage)
router.get('/small-cart', cartController.smallcart)
router.get('/cart/items-count', cartController.itemsInCart);
router.post('/add-to-cart', cartController.addToCart);
router.delete('/cart/remove/:itemId', cartController.removeFromCart);
router.put('/cart/update-quantity/:itemId', cartController.updateQuantity);








router.get('/userDashboard', controller.userDashboard);

router.post('/wishlist/add/:productId', wishlistController.addToWishlist);


router.delete('/wishlist/remove/:productId', wishlistController.removeFromWishlist);




router.get('/checkout', addressController.checkout)

router.post('/place-order', cartController.placeOrder);

router.get('/orderSuccess', orderController.orderSuccess)

module.exports = router;
